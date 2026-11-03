import { Canvas, Fill, Group, Picture, Skia } from '@shopify/react-native-skia';
import { memo } from 'react';
import { PixelRatio, StyleSheet } from 'react-native';
import { useDerivedValue, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { C, MH, MW, T, TILES_ACROSS } from '@/lib/constants';
import { getSprites } from '@/lib/pixel';

// 画面側から UI スレッドに渡す、描画に必要な最小限の種の情報（y の小さい順）
export type SeedVis = { x: number; y: number; pic: number; drop: boolean };

export type Motion = {
  rx: SharedValue<number>; // 表示中の位置（補間される）
  ry: SharedValue<number>;
  tx: SharedValue<number>; // 本当の位置（マス）
  ty: SharedValue<number>;
  dir: SharedValue<number>; // DIR_INDEX
  walkStart: SharedValue<number>;
  walkUntil: SharedValue<number>;
  now: SharedValue<number>;
  seeds: SharedValue<SeedVis[]>;
};

export function useMotion(x: number, y: number, dir: number): Motion {
  return {
    rx: useSharedValue(x),
    ry: useSharedValue(y),
    tx: useSharedValue(x),
    ty: useSharedValue(y),
    dir: useSharedValue(dir),
    walkStart: useSharedValue(0),
    walkUntil: useSharedValue(0),
    now: useSharedValue(0),
    seeds: useSharedValue<SeedVis[]>([]),
  };
}

function MapCanvasImpl({ m, width, height }: { m: Motion; width: number; height: number }) {
  const sp = getSprites();
  const { terrain, water, plants, bubbles, players, drop } = sp;
  const pr = PixelRatio.get();
  // P = 1ドットあたりの実ピクセル数（整数倍にしてドットをにじませない）
  const P = Math.max(2, Math.round((width * pr) / (TILES_ACROSS * T)));
  const viewW = (width * pr) / P,
    viewH = (height * pr) / P;
  const { rx, ry, tx, ty, dir, walkStart, walkUntil, now, seeds } = m;

  useFrameCallback((f) => {
    now.set(f.timestamp);
  });

  // カメラ：キャラが画面のやや上寄り（縦42%）。マップの端では止める
  const transform = useDerivedValue(() => {
    const px = rx.get() * T + T / 2,
      py = ry.get() * T + T / 2;
    let camX = px - viewW / 2,
      camY = py - viewH * 0.42;
    camX = Math.max(0, Math.min(MW * T - viewW, camX));
    camY = Math.max(-viewH * 0.1, Math.min(MH * T - viewH * 0.8, camY));
    const ox = Math.round(camX * P),
      oy = Math.round(camY * P);
    return [{ translateX: -ox / pr }, { translateY: -oy / pr }, { scale: P / pr }];
  });

  // 毎フレーム描くのは池のゆらぎ・植物・💧・キャラ・吹き出しだけ
  const dynamic = useDerivedValue(() => {
    const t = now.get();
    const X = rx.get(),
      Y = ry.get();
    const gx = tx.get(),
      gy = ty.get();
    const moving = X !== gx || Y !== gy;
    const ph = t < walkUntil.get() || moving ? (1 + Math.floor((t - walkStart.get()) / 115)) % 4 : -1;
    const bob = Math.round(Math.sin(t / 300));
    const pX = Math.round(X * T * P) / P,
      pY = Math.round(Y * T * P) / P;
    const list = seeds.get();
    let under = -1;
    if (!moving) for (let i = 0; i < list.length; i++) if (list[i].x === gx && list[i].y === gy) under = i;

    const rec = Skia.PictureRecorder();
    const c = rec.beginRecording(Skia.XYWHRect(-T, -2 * T, (MW + 2) * T, (MH + 3) * T));
    c.drawPicture(water[Math.floor(t / 700) % 3]);
    // 植物とキャラは y 順に重ねる
    const playerY = Y + 0.01;
    let drawn = false;
    const drawPlayer = () => {
      c.save();
      c.translate(pX, pY);
      c.drawPicture(players[dir.get() * 5 + ph + 1]);
      c.restore();
    };
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      if (!drawn && s.y > playerY) {
        drawPlayer();
        drawn = true;
      }
      c.save();
      c.translate(s.x * T, s.y * T);
      c.drawPicture(plants[s.pic]);
      if (s.drop && i !== under) {
        c.translate(0, bob - 1);
        c.drawPicture(drop);
      }
      c.restore();
    }
    if (!drawn) drawPlayer();
    if (under >= 0) {
      c.save();
      c.translate(pX, pY + bob);
      c.drawPicture(bubbles[list[under].pic]);
      c.restore();
    }
    return rec.finishRecordingAsPicture();
  });

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Fill color={C.bg} />
      <Group transform={transform}>
        <Picture picture={terrain} />
        <Picture picture={dynamic} />
      </Group>
    </Canvas>
  );
}

export const MapCanvas = memo(MapCanvasImpl);
