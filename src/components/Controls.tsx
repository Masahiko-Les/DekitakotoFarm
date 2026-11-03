import { useEffect, useMemo } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { C, FONT, HOLD_DELAY, HOLD_REPEAT, type Dir } from '@/lib/constants';

const DEAD = 14; // これ以上なぞったら歩き出す（px）
const LEASH = 40; // なぞり始めの点は、指からこれ以上離れないようについてくる（向きを変えやすくする）

// 画面をなぞった方向へ歩く。指を置いたままなら連続移動（最初 300ms 待って、その後 140ms ごと）
function createSwipeWalker(onMove: (d: Dir) => void) {
  let ax = 0,
    ay = 0,
    cur: Dir | null = null,
    timer: ReturnType<typeof setTimeout> | null = null;
  const stop = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    cur = null;
  };
  const walk = (d: Dir) => {
    if (timer) clearTimeout(timer);
    cur = d;
    onMove(d);
    const rep = () => {
      if (!cur) return;
      onMove(cur);
      timer = setTimeout(rep, HOLD_REPEAT);
    };
    timer = setTimeout(rep, HOLD_DELAY);
  };
  const pr = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => {
      stop();
      ax = e.nativeEvent.pageX;
      ay = e.nativeEvent.pageY;
    },
    onPanResponderMove: (e) => {
      const x = e.nativeEvent.pageX,
        y = e.nativeEvent.pageY;
      let dx = x - ax,
        dy = y - ay;
      const len = Math.hypot(dx, dy);
      if (len < DEAD) return;
      if (len > LEASH) {
        ax = x - (dx / len) * LEASH;
        ay = y - (dy / len) * LEASH;
        dx = x - ax;
        dy = y - ay;
      }
      const d: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      if (d !== cur) walk(d);
    },
    onPanResponderRelease: stop,
    onPanResponderTerminate: stop,
  });
  return { handlers: pr.panHandlers, stop };
}

export function useSwipeWalk(onMove: (d: Dir) => void) {
  // onMove が変わったら作り直し、古いほうの連続移動は止める
  const { handlers, stop } = useMemo(() => createSwipeWalker(onMove), [onMove]);
  useEffect(() => stop, [stop]);
  return handlers;
}

export function AButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPressIn={onPress} accessibilityLabel="A ボタン" hitSlop={6}>
      {({ pressed }) => (
        <View style={[s.aShadow, { marginTop: pressed ? 3 : 0, paddingBottom: pressed ? 2 : 5 }]}>
          <View style={s.a}>
            <Text style={s.aText}>A</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  aShadow: { borderRadius: 40, backgroundColor: C.accentD },
  a: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  aText: { color: '#fff', fontSize: 26, fontFamily: FONT.ui },
});
