import { useSyncExternalStore } from 'react';

import { DIRS, FLOWERS, MAX_CHARS, MAX_LINES, MAX_WATER, MH, MW, type Dir } from './constants';
import { DATE_RE, todayStr } from './date';
import * as db from './db';
import type { NewSeed, Player, Seed } from './db';
import { START, blocked, plantable } from './map';

export type { Player, Seed };

type FarmState = {
  seeds: Seed[];
  seenHelp: boolean;
  dayOffset: number; // 開発用（リリース版では常に 0 として扱う）
  today: string;
  player: Player; // キャラのいるマスと向き
  playerVersion: number; // 歩く以外の方法で位置が変わったら増える（瞬間移動の合図）
};

let state: FarmState;
const listeners = new Set<() => void>();
const emit = (next: Partial<FarmState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

const offsetOf = (n: number) => (__DEV__ ? n : 0);
const isDir = (d: unknown): d is Dir => typeof d === 'string' && d in DIRS;

function readPlayer(): Player {
  try {
    const p = JSON.parse(db.kvGet('player') ?? 'null');
    if (p && Number.isInteger(p.x) && Number.isInteger(p.y) && !blocked(p.x, p.y))
      return { x: p.x, y: p.y, dir: isDir(p.dir) ? p.dir : 'down' };
  } catch {}
  return { x: START.x, y: START.y, dir: 'down' };
}

export function initStore() {
  if (state) return;
  db.openDb();
  const dayOffset = Number(db.kvGet('dayOffset') ?? 0) || 0;
  state = {
    seeds: db.loadSeeds(),
    seenHelp: db.kvGet('seenHelp') === '1',
    dayOffset,
    today: todayStr(offsetOf(dayOffset)),
    player: readPlayer(),
    playerVersion: 0,
  };
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function useFarm() {
  return useSyncExternalStore(subscribe, () => state);
}
export const getFarm = () => state;

const reload = () => ({ seeds: db.loadSeeds() });

// ===== 判定 =====
export const canWater = (s: Seed, today: string) =>
  !s.bloomed && s.waters.length < MAX_WATER && !s.waters.includes(today);
export const seedAt = (seeds: Seed[], x: number, y: number) => seeds.find((s) => s.x === x && s.y === y);

// ===== 操作 =====
// 日付が変わっていたら更新（アプリに戻ってきたとき・定期的に呼ぶ）
export function refreshToday() {
  const t = todayStr(offsetOf(state.dayOffset));
  if (t !== state.today) emit({ today: t });
}

export function plantSeed(x: number, y: number, text: string): Seed | null {
  if (!plantable(x, y) || seedAt(state.seeds, x, y)) return null;
  const s: NewSeed = {
    x,
    y,
    text,
    flower: Math.floor(Math.random() * FLOWERS.length),
    planted: state.today,
    bloomed: null,
    waters: [],
  };
  const id = db.insertSeed(s);
  emit(reload());
  return { ...s, id };
}

export function waterSeed(id: number): Seed | null {
  const s = state.seeds.find((v) => v.id === id);
  if (!s || !canWater(s, state.today)) return null;
  db.addWater(id, state.today, MAX_WATER);
  emit(reload());
  return state.seeds.find((v) => v.id === id) ?? null;
}

export function pullSeed(id: number) {
  db.deleteSeed(id);
  emit(reload());
}

export function markHelpSeen() {
  if (state.seenHelp) return;
  db.kvSet('seenHelp', '1');
  emit({ seenHelp: true });
}

// 歩くたびに呼ばれる。保存はまとめて少し後に行う
let playerTimer: ReturnType<typeof setTimeout> | null = null;
export function movePlayer(p: Player) {
  emit({ player: p });
  if (!playerTimer) playerTimer = setTimeout(flushPlayer, 400);
}
export function flushPlayer() {
  if (playerTimer) clearTimeout(playerTimer);
  playerTimer = null;
  db.kvSet('player', JSON.stringify(state.player));
}

// 思い出帳から種の上へ移動
export function teleport(x: number, y: number) {
  emit({ player: { x, y, dir: 'down' }, playerVersion: state.playerVersion + 1 });
  flushPlayer();
}

export function setDayOffset(n: number) {
  if (!__DEV__) return;
  db.kvSet('dayOffset', String(n));
  emit({ dayOffset: n, today: todayStr(n) });
}

// 農園を入れ替えても残すもの（評価のお願いを一度出したかどうか）
function keptKv(): Record<string, string> {
  return db.kvGet('reviewAsked') === '1' ? { reviewAsked: '1' } : {};
}

export function deleteAll() {
  if (playerTimer) clearTimeout(playerTimer);
  playerTimer = null;
  const player: Player = { x: START.x, y: START.y, dir: 'down' };
  db.replaceAll([], { ...keptKv(), seenHelp: '1', player: JSON.stringify(player) });
  emit({
    seeds: [],
    seenHelp: true,
    dayOffset: 0,
    today: todayStr(0),
    player,
    playerVersion: state.playerVersion + 1,
  });
}

// ===== バックアップ =====
export const BACKUP_VERSION = 1;

export function exportJSON() {
  flushPlayer();
  return JSON.stringify(
    {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      seeds: state.seeds.map(({ x, y, text, flower, planted, bloomed, waters }) => ({
        x,
        y,
        text,
        flower,
        planted,
        bloomed,
        waters,
      })),
      player: state.player,
    },
    null,
    2,
  );
}

// 中身をすべて確かめてから NewSeed[] に直す。おかしければ例外を投げる
export function parseBackup(json: string): { seeds: NewSeed[]; player: Player } {
  const d = JSON.parse(json);
  const fail = (why: string): never => {
    throw new Error(why);
  };
  if (!d || typeof d !== 'object' || !Array.isArray(d.seeds)) fail('形式が違います');
  if (typeof d.version !== 'number' || d.version > BACKUP_VERSION) fail('対応していないバージョンです');
  const used = new Set<string>();
  const seeds: NewSeed[] = d.seeds.map((s: any): NewSeed => {
    if (!s || typeof s !== 'object') fail('種の形式が違います');
    const { x, y, text, flower, planted, bloomed, waters } = s;
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= MW || y >= MH) fail('位置が違います');
    if (!plantable(x, y)) fail('種を蒔けない場所です');
    if (used.has(`${x}_${y}`)) fail('同じ場所に2つの種があります');
    used.add(`${x}_${y}`);
    if (typeof text !== 'string' || !text.trim() || text.length > MAX_CHARS || text.split('\n').length > MAX_LINES)
      fail('文章が違います');
    if (!Number.isInteger(flower) || flower < 0 || flower >= FLOWERS.length) fail('花の種類が違います');
    if (typeof planted !== 'string' || !DATE_RE.test(planted)) fail('植えた日が違います');
    if (!Array.isArray(waters) || waters.length > 31) fail('水やりの記録が違います');
    const ws: string[] = [...new Set<string>(waters)].sort();
    if (ws.length !== waters.length || ws.some((w) => typeof w !== 'string' || !DATE_RE.test(w)))
      fail('水やりの記録が違います');
    if (bloomed !== null && bloomed !== undefined && (typeof bloomed !== 'string' || !DATE_RE.test(bloomed)))
      fail('咲いた日が違います');
    const bl: string | null = bloomed ?? null;
    if ((ws.length >= MAX_WATER) !== (bl !== null)) fail('咲いた記録が合いません');
    return { x, y, text, flower, planted, bloomed: bl, waters: ws };
  });
  const p = d.player;
  const player: Player =
    p && Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.y >= 0 && p.x < MW && p.y < MH && !blocked(p.x, p.y)
      ? { x: p.x, y: p.y, dir: isDir(p.dir) ? p.dir : 'down' }
      : { x: START.x, y: START.y, dir: 'down' };
  return { seeds, player };
}

export function restoreBackup(json: string) {
  const { seeds, player } = parseBackup(json);
  if (playerTimer) clearTimeout(playerTimer);
  playerTimer = null;
  const kv: Record<string, string> = { ...keptKv(), seenHelp: '1', player: JSON.stringify(player) };
  if (__DEV__ && state.dayOffset) kv.dayOffset = String(state.dayOffset);
  db.replaceAll(seeds, kv);
  emit({ ...reload(), seenHelp: true, player, playerVersion: state.playerVersion + 1 });
}
