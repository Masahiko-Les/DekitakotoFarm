import { ClipOp, Skia, type SkCanvas, type SkPaint, type SkPicture } from '@shopify/react-native-skia';

import { FLOWERS, MAX_WATER, MH, MW, T, type Dir } from './constants';
import { FIELD, HOUSE_R, ROAD, SIGN, TREE, WATER, GRASS, hash, tileAt } from './map';

// ===== ドット絵（試作の fillRect をそのまま Skia の drawRect に移したもの） =====
const paints = new Map<string, SkPaint>();
function paintOf(col: string) {
  let p = paints.get(col);
  if (!p) {
    p = Skia.Paint();
    p.setAntiAlias(false);
    p.setColor(Skia.Color(col));
    paints.set(col, p);
  }
  return p;
}
function r(c: SkCanvas, x: number, y: number, w: number, h: number, col: string) {
  c.drawRect(Skia.XYWHRect(x, y, w, h), paintOf(col));
}

function drawGrass(c: SkCanvas, X: number, Y: number, tx: number, ty: number) {
  r(c, X, Y, T, T, '#7fae5a');
  const h = hash(tx, ty);
  for (let i = 0; i < 4; i++) {
    const px = ((h >>> (i * 5)) % 14) + 1,
      py = ((h >>> (i * 5 + 3)) % 14) + 1;
    r(c, X + px, Y + py, 1, 2, i % 2 ? '#6c9a4a' : '#93c06c');
  }
  if (h % 23 === 0) {
    r(c, X + 5, Y + 6, 2, 2, '#f4f0e0');
    r(c, X + 6, Y + 7, 1, 1, '#f4c430');
  } // 小さな野の花
  if (h % 29 === 1) r(c, X + 10, Y + 9, 2, 2, '#e88aa8');
}
function drawRoad(c: SkCanvas, X: number, Y: number, tx: number, ty: number) {
  r(c, X, Y, T, T, '#d9c08c');
  const h = hash(tx + 101, ty + 57);
  for (let i = 0; i < 3; i++) {
    const px = ((h >>> (i * 6)) % 14) + 1,
      py = ((h >>> (i * 6 + 3)) % 14) + 1;
    r(c, X + px, Y + py, 2, 1, i ? '#c4a873' : '#ecd9ad');
  }
  const edge = '#b39463';
  if (tileAt(tx, ty - 1) !== ROAD) r(c, X, Y, T, 1, edge);
  if (tileAt(tx, ty + 1) !== ROAD) r(c, X, Y + T - 1, T, 1, edge);
  if (tileAt(tx - 1, ty) !== ROAD) r(c, X, Y, 1, T, edge);
  if (tileAt(tx + 1, ty) !== ROAD) r(c, X + T - 1, Y, 1, T, edge);
}
function drawField(c: SkCanvas, X: number, Y: number, tx: number, ty: number) {
  r(c, X, Y, T, T, '#9a6a44');
  for (let yy = 2; yy < T; yy += 4) {
    r(c, X, Y + yy, T, 1, '#7d5233');
    r(c, X, Y + yy + 1, T, 1, '#ad7c53');
  }
  if (tileAt(tx, ty - 1) !== FIELD) r(c, X, Y, T, 1, '#6b4426');
  if (tileAt(tx, ty + 1) !== FIELD) r(c, X, Y + T - 1, T, 1, '#6b4426');
  if (tileAt(tx - 1, ty) !== FIELD) r(c, X, Y, 1, T, '#6b4426');
  if (tileAt(tx + 1, ty) !== FIELD) r(c, X + T - 1, Y, 1, T, '#6b4426');
}
function drawTree(c: SkCanvas, X: number, Y: number, tx: number, ty: number) {
  drawGrass(c, X, Y, tx, ty);
  const v = hash(tx, ty) % 3;
  const g = ['#2f6b34', '#2b6230', '#357439'][v],
    hl = ['#3f8a43', '#3a8040', '#47924b'][v];
  r(c, X + 6, Y + 11, 4, 5, '#6b4423');
  r(c, X + 1, Y + 4, 14, 7, g);
  r(c, X + 3, Y + 1, 10, 3, g);
  r(c, X + 2, Y + 11, 12, 1, '#285a2c');
  r(c, X + 4, Y + 3, 4, 3, hl);
  r(c, X + 10, Y + 6, 2, 2, hl);
}
// phase = Math.floor(now/700) % 3（試作では毎フレーム描いていた水面のゆらぎ）
function drawWater(c: SkCanvas, X: number, Y: number, tx: number, ty: number, phase: number) {
  r(c, X, Y, T, T, '#5aa0c8');
  if ((tx * 3 + ty + phase) % 3 === 0) r(c, X + 3, Y + 5, 4, 1, '#a8d4ec');
  else if ((tx + ty) % 2 === 0) r(c, X + 8, Y + 10, 5, 1, '#a8d4ec');
  const e = '#c9b98a';
  if (tileAt(tx, ty - 1) !== WATER) r(c, X, Y, T, 2, e);
  if (tileAt(tx, ty + 1) !== WATER) r(c, X, Y + T - 2, T, 2, e);
  if (tileAt(tx - 1, ty) !== WATER) r(c, X, Y, 2, T, e);
  if (tileAt(tx + 1, ty) !== WATER) r(c, X + T - 2, Y, 2, T, e);
}
function drawSign(c: SkCanvas, X: number, Y: number, tx: number, ty: number) {
  drawGrass(c, X, Y, tx, ty);
  r(c, X + 7, Y + 8, 2, 7, '#6b4423');
  r(c, X + 2, Y + 2, 12, 7, '#a8763f');
  r(c, X + 2, Y + 8, 12, 1, '#7a5228');
  r(c, X + 4, Y + 4, 8, 1, '#5e3b22');
  r(c, X + 4, Y + 6, 6, 1, '#5e3b22');
}
function drawHouse(c: SkCanvas) {
  const X = HOUSE_R.x * T,
    Y = HOUSE_R.y * T,
    w = HOUSE_R.w * T,
    h = HOUSE_R.h * T; // 80×64
  // 地面
  for (let ty = HOUSE_R.y; ty < HOUSE_R.y + HOUSE_R.h; ty++)
    for (let tx = HOUSE_R.x; tx < HOUSE_R.x + HOUSE_R.w; tx++) drawGrass(c, tx * T, ty * T, tx, ty);
  // 煙突
  r(c, X + 58, Y + 2, 8, 14, '#7a6a5a');
  r(c, X + 57, Y + 1, 10, 3, '#5e5044');
  // 屋根
  r(c, X + 10, Y + 6, w - 20, 4, '#b04a3e');
  r(c, X + 5, Y + 10, w - 10, 6, '#b04a3e');
  r(c, X + 1, Y + 16, w - 2, 18, '#b04a3e');
  for (let yy = 12; yy < 34; yy += 5) r(c, X + 2, Y + yy, w - 4, 1, '#8c3730');
  r(c, X + 10, Y + 6, w - 20, 1, '#cc6355');
  r(c, X, Y + 33, w, 3, '#7a2c25');
  // 壁
  r(c, X + 5, Y + 36, w - 10, h - 37, '#efe2c0');
  r(c, X + 5, Y + 36, 2, h - 37, '#a8763f');
  r(c, X + w - 7, Y + 36, 2, h - 37, '#a8763f');
  r(c, X + 5, Y + h - 2, w - 10, 2, '#a8763f');
  // 窓
  for (const wx of [12, 54]) {
    r(c, X + wx, Y + 40, 14, 12, '#5e3b22');
    r(c, X + wx + 1, Y + 41, 12, 10, '#8cc4e4');
    r(c, X + wx + 6, Y + 41, 1, 10, '#5e3b22');
    r(c, X + wx + 1, Y + 46, 12, 1, '#5e3b22');
    r(c, X + wx + 2, Y + 42, 3, 2, '#d8eef8');
    r(c, X + wx - 1, Y + 52, 16, 2, '#7a5228');
    r(c, X + wx, Y + 54, 3, 2, '#e2483d');
    r(c, X + wx + 6, Y + 54, 3, 2, '#f4c430');
    r(c, X + wx + 11, Y + 54, 3, 2, '#f29cc0');
  }
  // ドア
  r(c, X + 33, Y + 42, 14, 22, '#5e3b22');
  r(c, X + 34, Y + 43, 12, 21, '#8a5a30');
  r(c, X + 34, Y + 52, 12, 1, '#6b4426');
  r(c, X + 43, Y + 53, 2, 2, '#f4c430');
  r(c, X + 31, Y + h - 1, 18, 1, '#9a8a6a');
}

function mound(c: SkCanvas, X: number, Y: number) {
  r(c, X + 3, Y + 11, 10, 3, '#7a4e2d');
  r(c, X + 4, Y + 10, 8, 1, '#8f5e38');
  r(c, X + 4, Y + 14, 8, 1, '#5e3b22');
}
// stage: 0..4 育成中, 5 = 開花
function drawPlant(c: SkCanvas, X: number, Y: number, stage: number, fl: number) {
  const f = FLOWERS[fl] || FLOWERS[0];
  mound(c, X, Y);
  if (stage === 0) {
    r(c, X + 6, Y + 10, 1, 1, '#efe2b0');
    r(c, X + 9, Y + 11, 1, 1, '#efe2b0');
    r(c, X + 7, Y + 12, 1, 1, '#efe2b0');
    return;
  }
  if (stage === 1) {
    r(c, X + 7, Y + 8, 2, 3, '#3d8b3d');
    r(c, X + 5, Y + 7, 2, 2, '#5cb85c');
    r(c, X + 9, Y + 7, 2, 2, '#5cb85c');
    return;
  }
  if (stage === 2) {
    r(c, X + 7, Y + 6, 2, 5, '#3d8b3d');
    r(c, X + 4, Y + 6, 3, 2, '#5cb85c');
    r(c, X + 9, Y + 6, 3, 2, '#5cb85c');
    r(c, X + 5, Y + 8, 2, 1, '#4aa34a');
    r(c, X + 9, Y + 8, 2, 1, '#4aa34a');
    return;
  }
  r(c, X + 7, Y + 4, 2, 7, '#3d8b3d');
  r(c, X + 3, Y + 8, 4, 2, '#5cb85c');
  r(c, X + 9, Y + 7, 4, 2, '#5cb85c');
  if (stage === 3) {
    r(c, X + 6, Y + 2, 4, 3, '#4aa34a');
    return;
  }
  if (stage === 4) {
    r(c, X + 6, Y + 3, 4, 2, '#4aa34a');
    r(c, X + 6, Y + 1, 4, 2, f.petal);
    r(c, X + 7, Y + 0, 2, 1, f.petal);
    return;
  }
  r(c, X + 5, Y + 0, 6, 1, f.petal);
  r(c, X + 4, Y + 1, 8, 4, f.petal);
  r(c, X + 5, Y + 5, 6, 1, f.petal);
  r(c, X + 3, Y + 2, 1, 2, f.petal);
  r(c, X + 12, Y + 2, 1, 2, f.petal);
  r(c, X + 4, Y + 4, 8, 1, f.dark);
  r(c, X + 7, Y + 2, 2, 2, f.center);
}
// 水やりの回数 → 絵の段階（0 種 / 1 小さな芽 / 2 芽 / 3 茎と葉 / 4 つぼみ / 5 開花）
const GROWTH = [0, 2, 4]; // 0回＝種、1回＝芽、2回＝つぼみ（3回で開花）
export function stageOf(s: { bloomed: string | null; waters: string[] }) {
  if (s.bloomed) return 5;
  return GROWTH[Math.min(s.waters.length, MAX_WATER - 1)];
}
function drawDrop(c: SkCanvas, X: number, Y: number) {
  r(c, X + 12, Y, 1, 1, '#4a9fd8');
  r(c, X + 11, Y + 1, 3, 2, '#4a9fd8');
  r(c, X + 11, Y + 3, 3, 1, '#2f7fb8');
  r(c, X + 12, Y + 1, 1, 1, '#bfe3f7');
}
// ph: -1 = 立ち止まり、0..3 = 歩きのコマ（0,2 = 足がそろう / 1,3 = 左右の足が前）
function drawPlayer(c: SkCanvas, X: number, Y: number, dir: Dir, ph: number) {
  const walking = ph >= 0;
  const step = walking && (ph === 1 || ph === 3);
  const bob = step ? -1 : 0; // 足を出したコマで体が少し上がる
  const skin = '#f2c9a0',
    shoe = '#4a3a2a',
    shoe2 = '#33281c',
    shirt = '#3f6fb5',
    shirt2 = '#5a8ad0',
    hair = '#6b4a2a';
  r(c, X + 3, Y + 15, 10, 1, 'rgba(0,0,0,0.22)');
  const side = dir === 'left' || dir === 'right';
  const sgn = dir === 'right' ? 1 : -1;
  // 足
  if (side) {
    if (!step) {
      r(c, X + 6, Y + 13, 2, 2, shoe2);
      r(c, X + 8, Y + 13, 2, 2, shoe);
    } else {
      const f = ph === 1 ? 1 : -1; // 前に出る足を入れ替える
      r(c, X + 7 - 2 * sgn * f, Y + 13, 2, 2, shoe2); // 奥の足
      r(c, X + 7 + 2 * sgn * f, Y + 13, 2, 2, shoe); // 手前の足
      r(c, X + 7, Y + 12, 2, 1, shoe);
    }
  } else {
    const lUp = ph === 3,
      rUp = ph === 1;
    r(c, X + 5, Y + 13 - (lUp ? 1 : 0), 2, 2, shoe);
    r(c, X + 9, Y + 13 - (rUp ? 1 : 0), 2, 2, shoe);
  }
  const y = Y + bob;
  // 体
  r(c, X + 4, y + 8, 8, 5, shirt);
  r(c, X + 4, y + 8, 8, 1, shirt2);
  // 腕
  if (side) {
    const sw = !step ? 0 : (ph === 1 ? 2 : -2) * sgn; // 前後に振る
    r(c, X + 7 + sw, y + 9, 2, 3, shirt2);
    r(c, X + 7 + sw + (sw > 0 ? 1 : sw < 0 ? -1 : 0), y + 12, 2, 1, skin);
  } else {
    const la = ph === 1 ? 1 : ph === 3 ? -1 : 0; // 左右の腕を交互に
    r(c, X + 3, y + 9 + la, 1, 3, skin);
    r(c, X + 12, y + 9 - la, 1, 3, skin);
  }
  // 顔・帽子
  r(c, X + 5, y + 4, 6, 4, skin);
  r(c, X + 4, y + 1, 8, 3, '#e2c15a');
  r(c, X + 2, y + 3, 12, 1, '#c9a43c');
  r(c, X + 4, y + 3, 8, 1, '#c0392b');
  if (dir === 'up') {
    r(c, X + 5, y + 4, 6, 3, hair);
    return;
  }
  if (dir === 'down') {
    r(c, X + 6, y + 5, 1, 1, '#2a2018');
    r(c, X + 9, y + 5, 1, 1, '#2a2018');
    r(c, X + 7, y + 7, 2, 1, '#e0a080');
  }
  if (dir === 'left') {
    r(c, X + 5, y + 5, 1, 1, '#2a2018');
    r(c, X + 9, y + 4, 2, 3, hair);
  }
  if (dir === 'right') {
    r(c, X + 10, y + 5, 1, 1, '#2a2018');
    r(c, X + 5, y + 4, 2, 3, hair);
  }
}
// キャラが種の上に立っているとき、頭の上に出す吹き出し（キャラの左上を原点とする）
function drawBubble(c: SkCanvas, stage: number, fl: number) {
  const by = -21;
  r(c, -1, by, 18, 18, '#3a3226');
  r(c, 0, by + 1, 16, 16, '#fffdf2');
  r(c, 7, by + 18, 3, 1, '#3a3226');
  r(c, 8, by + 19, 1, 1, '#3a3226');
  r(c, 7, by + 17, 3, 1, '#fffdf2');
  c.save();
  c.clipRect(Skia.XYWHRect(0, by + 1, 16, 16), ClipOp.Intersect, false);
  drawPlant(c, 0, by + 1, stage, fl);
  c.restore();
}

// ===== 使い回す Picture（一度だけ記録する） =====
function record(bounds: [number, number, number, number], draw: (c: SkCanvas) => void): SkPicture {
  const rec = Skia.PictureRecorder();
  const c = rec.beginRecording(Skia.XYWHRect(...bounds));
  draw(c);
  return rec.finishRecordingAsPicture();
}

export type Sprites = {
  terrain: SkPicture; // 静的な地形（池を除く）
  water: SkPicture[]; // 池のゆらぎ3コマ
  plants: SkPicture[]; // [stage * 8 + flower]
  bubbles: SkPicture[]; // [stage * 8 + flower]
  players: SkPicture[]; // [dirIndex * 5 + (ph + 1)]
  drop: SkPicture;
};

let sprites: Sprites | null = null;
export function getSprites(): Sprites {
  if (sprites) return sprites;
  const full: [number, number, number, number] = [0, 0, MW * T, MH * T];
  const terrain = record(full, (c) => {
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        const t = tileAt(x, y),
          X = x * T,
          Y = y * T;
        if (t === GRASS) drawGrass(c, X, Y, x, y);
        else if (t === ROAD) drawRoad(c, X, Y, x, y);
        else if (t === FIELD) drawField(c, X, Y, x, y);
        else if (t === TREE) drawTree(c, X, Y, x, y);
        else if (t === SIGN) drawSign(c, X, Y, x, y);
      }
    drawHouse(c);
  });
  const water = [0, 1, 2].map((ph) =>
    record(full, (c) => {
      for (let y = 0; y < MH; y++)
        for (let x = 0; x < MW; x++) if (tileAt(x, y) === WATER) drawWater(c, x * T, y * T, x, y, ph);
    }),
  );
  const plants: SkPicture[] = [];
  const bubbles: SkPicture[] = [];
  for (let st = 0; st <= 5; st++)
    for (let fl = 0; fl < FLOWERS.length; fl++) {
      plants.push(record([0, 0, T, T], (c) => drawPlant(c, 0, 0, st, fl)));
      bubbles.push(record([-2, -22, T + 4, 24], (c) => drawBubble(c, st, fl)));
    }
  const players: SkPicture[] = [];
  for (const d of ['up', 'down', 'left', 'right'] as Dir[])
    for (let ph = -1; ph < 4; ph++) players.push(record([0, -2, T, T + 2], (c) => drawPlayer(c, 0, 0, d, ph)));
  const drop = record([0, -2, T, 8], (c) => drawDrop(c, 0, 0));
  sprites = { terrain, water, plants, bubbles, players, drop };
  return sprites;
}
