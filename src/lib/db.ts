import * as SQLite from 'expo-sqlite';

import type { Dir } from './constants';

export type Seed = {
  id: number;
  x: number;
  y: number;
  text: string;
  flower: number; // 0..7
  planted: string; // YYYY-MM-DD
  bloomed: string | null; // 咲いた日。null なら育成中
  waters: string[]; // 水やりした日（古い順）
};
export type Player = { x: number; y: number; dir: Dir };
export type NewSeed = Omit<Seed, 'id'>;

let db: SQLite.SQLiteDatabase | null = null;

const MIGRATIONS: string[] = [
  // v1
  `CREATE TABLE seeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    x INTEGER NOT NULL, y INTEGER NOT NULL,
    text TEXT NOT NULL,
    flower INTEGER NOT NULL,
    planted TEXT NOT NULL,
    bloomed TEXT,
    UNIQUE(x, y)
  );
  CREATE TABLE waters (
    seed_id INTEGER NOT NULL REFERENCES seeds(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    PRIMARY KEY (seed_id, date)
  );
  CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT);`,
  // v2: 開花が5回→3回になった。3回以上水をあげて咲いていない種は、3回目の日に咲いたことにする
  `UPDATE seeds SET bloomed = (
     SELECT date FROM waters WHERE waters.seed_id = seeds.id ORDER BY date LIMIT 1 OFFSET 2
   )
   WHERE bloomed IS NULL AND (SELECT COUNT(*) FROM waters WHERE waters.seed_id = seeds.id) >= 3;`,
];

export function openDb() {
  if (db) return db;
  db = SQLite.openDatabaseSync('farm.db');
  db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const cur = db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;
  for (let v = cur; v < MIGRATIONS.length; v++) {
    const d = db;
    d.withTransactionSync(() => {
      d.execSync(MIGRATIONS[v]);
      d.execSync(`PRAGMA user_version = ${v + 1}`);
    });
  }
  return db;
}

function conn() {
  return db ?? openDb();
}

export function loadSeeds(): Seed[] {
  const d = conn();
  const rows = d.getAllSync<Omit<Seed, 'waters'>>(
    'SELECT id, x, y, text, flower, planted, bloomed FROM seeds ORDER BY id',
  );
  const ws = d.getAllSync<{ seed_id: number; date: string }>('SELECT seed_id, date FROM waters ORDER BY date');
  const map = new Map<number, string[]>();
  for (const w of ws) {
    const a = map.get(w.seed_id);
    if (a) a.push(w.date);
    else map.set(w.seed_id, [w.date]);
  }
  return rows.map((r) => ({ ...r, waters: map.get(r.id) ?? [] }));
}

export function kvGet(key: string): string | null {
  return conn().getFirstSync<{ value: string }>('SELECT value FROM kv WHERE key = ?', key)?.value ?? null;
}
export function kvSet(key: string, value: string) {
  conn().runSync('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, value);
}

export function insertSeed(s: NewSeed): number {
  const d = conn();
  let id = 0;
  d.withTransactionSync(() => {
    id = d.runSync(
      'INSERT INTO seeds (x, y, text, flower, planted, bloomed) VALUES (?, ?, ?, ?, ?, ?)',
      s.x,
      s.y,
      s.text,
      s.flower,
      s.planted,
      s.bloomed,
    ).lastInsertRowId;
    for (const w of s.waters) d.runSync('INSERT INTO waters (seed_id, date) VALUES (?, ?)', id, w);
  });
  return id;
}

// 水やりを記録し、回数が maxWater に届いたら咲いた日を入れる
export function addWater(id: number, date: string, maxWater: number) {
  const d = conn();
  d.withTransactionSync(() => {
    d.runSync('INSERT INTO waters (seed_id, date) VALUES (?, ?)', id, date);
    const n = d.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM waters WHERE seed_id = ?', id)?.n ?? 0;
    if (n >= maxWater) d.runSync('UPDATE seeds SET bloomed = ? WHERE id = ? AND bloomed IS NULL', date, id);
  });
}

// 咲く前の種だけ抜ける
export function deleteSeed(id: number) {
  conn().runSync('DELETE FROM seeds WHERE id = ? AND bloomed IS NULL', id);
}

// 農園を丸ごと入れ替える（全削除・復元で使う）
export function replaceAll(seeds: NewSeed[], kv: Record<string, string>) {
  const d = conn();
  d.withTransactionSync(() => {
    d.execSync('DELETE FROM waters; DELETE FROM seeds; DELETE FROM kv;');
    for (const s of seeds) {
      const id = d.runSync(
        'INSERT INTO seeds (x, y, text, flower, planted, bloomed) VALUES (?, ?, ?, ?, ?, ?)',
        s.x,
        s.y,
        s.text,
        s.flower,
        s.planted,
        s.bloomed,
      ).lastInsertRowId;
      for (const w of s.waters) d.runSync('INSERT INTO waters (seed_id, date) VALUES (?, ?)', id, w);
    }
    for (const [k, v] of Object.entries(kv)) d.runSync('INSERT INTO kv (key, value) VALUES (?, ?)', k, v);
  });
}
