import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { AppState, BackHandler, StyleSheet, View } from 'react-native';
import { Easing, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AButton, useSwipeWalk } from '@/components/Controls';
import { MapCanvas, useMotion } from '@/components/MapCanvas';
import { ModalHost, isLocked, type Modal } from '@/components/Modals';
import { B, HBtn, Txt } from '@/components/ui';
import { C, DIR_INDEX, DIRS, FLOWERS, MAX_WATER, type Dir } from '@/lib/constants';
import { DOOR, FIELD, HOUSE, ROAD, SIGN, blocked, plantable, tileAt } from '@/lib/map';
import { stageOf } from '@/lib/pixel';
import {
  canWater,
  flushPlayer,
  getFarm,
  markHelpSeen,
  movePlayer,
  refreshToday,
  seedAt,
  teleport,
  useFarm,
  type Player,
  type Seed,
} from '@/lib/store';

const MOVE_MS = 150; // 1マスの補間にかける時間

const facing = (p: Player) => [p.x + DIRS[p.dir][0], p.y + DIRS[p.dir][1]] as const;

function hintFor(p: Player, seeds: Seed[], today: string): ReactNode {
  const [fx, fy] = facing(p);
  const s = seedAt(seeds, p.x, p.y);
  const ft = tileAt(fx, fy);
  if (s) {
    if (s.bloomed) return <><B>A</B> で思い出を読む（{FLOWERS[s.flower].name}）</>;
    if (canWater(s, today)) return <><B>A</B> で種を見る・水やりする（{s.waters.length}/{MAX_WATER}）</>;
    return <><B>A</B> で種を見る（今日は水やり済み・{s.waters.length}/{MAX_WATER}）</>;
  }
  if (ft === SIGN) return <><B>A</B> で看板を読む</>;
  if (ft === HOUSE && fx === DOOR.x && fy === DOOR.y) return 'わが家だ。今日も一日おつかれさま。';
  const here = tileAt(p.x, p.y);
  if (here === ROAD) return '道には種を蒔けません。草地か畑へ行こう。';
  if (here === FIELD) return <><B>A</B> でこの畑に「できたこと」を蒔く</>;
  return <><B>A</B> でここに「できたこと」を蒔く</>;
}

export default function FarmScreen() {
  const farm = useFarm();
  const { player, seeds, today } = farm;
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const m = useMotion(player.x, player.y, DIR_INDEX[player.dir]);
  const [modal, setModal] = useState<Modal | null>(() => (farm.seenHelp ? null : { type: 'help', first: true }));

  // 初回のようこそを開いたら、もう出さない
  useEffect(() => {
    markHelpSeen();
  }, []);

  // 描画用の種リストを UI スレッドへ
  useEffect(() => {
    m.seeds.set(
      [...seeds]
        .sort((a, b) => a.y - b.y)
        .map((s) => ({ x: s.x, y: s.y, pic: stageOf(s) * 8 + s.flower, drop: canWater(s, today) })),
    );
  }, [seeds, today, m.seeds]);

  // 思い出帳からの移動・復元・全削除のときは、補間せずにその場へ
  useEffect(() => {
    const p = getFarm().player;
    m.rx.set(p.x);
    m.ry.set(p.y);
    m.tx.set(p.x);
    m.ty.set(p.y);
    m.dir.set(DIR_INDEX[p.dir]);
  }, [farm.playerVersion, m.rx, m.ry, m.tx, m.ty, m.dir]);

  // 日付の変わり目・バックグラウンドへの移動
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') refreshToday();
      else flushPlayer();
    });
    const timer = setInterval(refreshToday, 30000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);

  const close = () => setModal(null);
  const nav = {
    open: (md: Modal) => setModal(md),
    close,
    goTo: (s: Seed) => {
      teleport(s.x, s.y);
      close();
    },
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!modal) return false;
      if (!isLocked(modal)) setModal(null);
      return true;
    });
    return () => sub.remove();
  }, [modal]);

  const move = (d: Dir) => {
    if (modal) return;
    const p = getFarm().player;
    const nx = p.x + DIRS[d][0],
      ny = p.y + DIRS[d][1];
    m.dir.set(DIR_INDEX[d]);
    if (blocked(nx, ny)) {
      movePlayer({ ...p, dir: d });
      return;
    }
    const n = m.now.get();
    if (n > m.walkUntil.get()) m.walkStart.set(n);
    m.walkUntil.set(n + 230);
    m.tx.set(nx);
    m.ty.set(ny);
    const ease = { duration: MOVE_MS, easing: Easing.out(Easing.quad) };
    m.rx.set(withTiming(nx, ease));
    m.ry.set(withTiming(ny, ease));
    movePlayer({ x: nx, y: ny, dir: d });
  };

  const swipe = useSwipeWalk(move);

  const pressA = () => {
    if (modal) return;
    const { player: p, seeds: all } = getFarm();
    const s = seedAt(all, p.x, p.y);
    if (s) return setModal(s.bloomed ? { type: 'memory', id: s.id } : { type: 'seed', id: s.id });
    const [fx, fy] = facing(p);
    if (tileAt(fx, fy) === SIGN) return setModal({ type: 'help', sign: true });
    if (plantable(p.x, p.y)) setModal({ type: 'plant', x: p.x, y: p.y });
  };

  const bloomN = seeds.filter((s) => s.bloomed).length;
  const todayN = seeds.filter((s) => canWater(s, today)).length;

  return (
    <View style={s.root} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {size.w > 0 && <MapCanvas m={m} width={size.w} height={size.h} />}
      {/* マップをなぞった方向へ歩く */}
      <View style={StyleSheet.absoluteFill} {...swipe} />

      <LinearGradient
        colors={['rgba(35,50,26,0.82)', 'rgba(35,50,26,0)']}
        style={[s.top, { paddingTop: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <View style={s.header} pointerEvents="box-none">
          <Txt style={s.h1}>できたこと農園</Txt>
          <View style={s.hbtns}>
            <HBtn title="📖 思い出帳" onPress={() => !modal && setModal({ type: 'book', tab: 'bloom' })} />
            <HBtn title="⚙" onPress={() => !modal && setModal({ type: 'settings' })} />
          </View>
        </View>
        <View style={s.stats} pointerEvents="none">
          <Txt style={s.stat}>🌸 咲いた花 {bloomN}</Txt>
          <Txt style={s.stat}>🌱 育てている種 {seeds.length - bloomN}</Txt>
          <Txt style={s.stat}>💧 今日水やりできる種 {todayN}</Txt>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['rgba(35,50,26,0)', 'rgba(35,50,26,0.75)']}
        locations={[0, 0.45]}
        style={[s.bottom, { paddingBottom: insets.bottom + 10 }]}
        pointerEvents="box-none"
      >
        <View style={s.controls} pointerEvents="box-none">
          <View style={s.hint} pointerEvents="none">
            <Txt style={s.hintText}>{hintFor(player, seeds, today)}</Txt>
          </View>
          <AButton onPress={pressA} />
        </View>
      </LinearGradient>

      {modal && <ModalHost modal={modal} nav={nav} />}
      <StatusBar style="light" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  top: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: 10, paddingBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  h1: {
    fontSize: 18,
    letterSpacing: 1,
    color: C.paper,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  hbtns: { flexDirection: 'row', gap: 6 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, marginTop: 6 },
  stat: {
    color: C.paper,
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 28, paddingHorizontal: 10 },
  hint: {
    flex: 1,
    minHeight: 64,
    backgroundColor: 'rgba(246,240,220,0.95)',
    borderWidth: 2,
    borderColor: C.mossD,
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  hintText: { fontSize: 14, lineHeight: 21 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    paddingRight: 4,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
});
