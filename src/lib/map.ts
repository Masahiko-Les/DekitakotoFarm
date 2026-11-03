import { MH, MW } from './constants';

// ===== マップ定義（試作の buildMap() をそのまま移植） =====
export const GRASS = 0,
  ROAD = 1,
  FIELD = 2,
  TREE = 3,
  WATER = 4,
  HOUSE = 5,
  SIGN = 6;

const tiles = new Uint8Array(MW * MH);
export const tileAt = (x: number, y: number) =>
  x < 0 || y < 0 || x >= MW || y >= MH ? TREE : tiles[y * MW + x];
const setT = (x: number, y: number, t: number) => {
  if (x >= 0 && y >= 0 && x < MW && y < MH) tiles[y * MW + x] = t;
};
const fill = (x0: number, y0: number, x1: number, y1: number, t: number) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setT(x, y, t);
};
export const hash = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
};

export const HOUSE_R = { x: 3, y: 3, w: 5, h: 4 }; // 家（5×4マス）。ドアは下の段の真ん中
export const DOOR = { x: 5, y: 6 };
export const START = { x: 5, y: 7 };
export const SIGN_P = { x: 3, y: 8 };
export const FIELDS: [number, number, number, number][] = [
  [10, 3, 15, 6], // 北東の畑
  [6, 13, 10, 16], // 南の畑
  [15, 11, 16, 15], // 東の細長い畑
];

(function buildMap() {
  // 小道（くねくね・左右非対称）
  fill(5, 7, 6, 10, ROAD); // 家から南へ
  fill(5, 9, 13, 10, ROAD); // 東へ曲がる
  fill(12, 9, 13, 17, ROAD); // さらに南へ（農園の出口）
  fill(7, 7, 11, 7, ROAD); // 家の前から北東の畑への細道
  fill(5, 11, 5, 13, ROAD); // 池へ向かう細道
  fill(14, 12, 14, 12, ROAD); // 東の畑への細道
  // 畑
  for (const [a, b, c, d] of FIELDS) fill(a, b, c, d, FIELD);
  // 池
  const pond = (cx: number, cy: number, rx: number, ry: number) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx,
          dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) setT(x, y, WATER);
      }
  };
  pond(3.2, 15.4, 1.6, 1.5);
  pond(16.5, 8, 1, 0.6);
  // 家・看板
  fill(HOUSE_R.x, HOUSE_R.y, HOUSE_R.x + HOUSE_R.w - 1, HOUSE_R.y + HOUSE_R.h - 1, HOUSE);
  setT(SIGN_P.x, SIGN_P.y, SIGN);
  // 外周の林（でこぼこ）＋ 林のかたまり ＋ 点在する木
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++) {
      const h = hash(x, y) % 100;
      const edge = Math.min(x, y, MW - 1 - x, MH - 1 - y);
      if (edge < 2) {
        setT(x, y, TREE);
        continue;
      }
      if (tileAt(x, y) !== GRASS) continue;
      if (Math.abs(x - START.x) <= 2 && Math.abs(y - START.y) <= 1) continue;
      let nearRoad = false;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const t = tileAt(x + dx, y + dy);
          if (t === ROAD || t === HOUSE || t === FIELD || t === SIGN || t === WATER) nearRoad = true;
        }
      if (edge === 2 && h < 30 && !nearRoad) {
        setT(x, y, TREE);
        continue;
      }
      const grove = (x >= 14 && y >= 16) || (x <= 3 && y >= 10 && y <= 12);
      if (grove ? h < 60 && !nearRoad : !nearRoad && h < 4) setT(x, y, TREE);
    }
})();

export const blocked = (x: number, y: number) => {
  const t = tileAt(x, y);
  return t === TREE || t === WATER || t === HOUSE || t === SIGN;
};
export const plantable = (x: number, y: number) => {
  const t = tileAt(x, y);
  return t === GRASS || t === FIELD;
};
