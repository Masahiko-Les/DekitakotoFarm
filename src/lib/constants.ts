// ===== 設定（reference/prototype.html と同じ値） =====
export const MW = 20;
export const MH = 20;
export const T = 16;
export const MAX_WATER = 3; // 何回水やりで花が咲くか（試作は5回。3回に変更）
export const WATER_MS = 3000; // 水やり時の表示時間
export const MAX_LINES = 3;
export const MAX_CHARS = 80;
export const TILES_ACROSS = 7.5; // 画面の横幅に何マス入るか（小さいほどキャラが大きい）
export const HOLD_DELAY = 300; // 押しっぱなし：最初の待ち
export const HOLD_REPEAT = 140; // 押しっぱなし：その後の間隔

export type Flower = { name: string; petal: string; dark: string; center: string };
export const FLOWERS: Flower[] = [
  { name: 'ひまわり', petal: '#f4c430', dark: '#d9a514', center: '#7a4a12' },
  { name: 'チューリップ', petal: '#e2483d', dark: '#b8322a', center: '#f6d36b' },
  { name: 'コスモス', petal: '#f29cc0', dark: '#d67199', center: '#f4c430' },
  { name: 'あさがお', petal: '#4f7fe0', dark: '#3559b0', center: '#f6f0dc' },
  { name: 'すみれ', petal: '#9b6ad6', dark: '#7447ad', center: '#f6d36b' },
  { name: 'マリーゴールド', petal: '#f08a24', dark: '#c96812', center: '#a3420f' },
  { name: 'デイジー', petal: '#fbfbf2', dark: '#d8d8c8', center: '#f4c430' },
  { name: 'ネモフィラ', petal: '#8ec8f0', dark: '#5ea6d6', center: '#ffffff' },
];

export const C = {
  moss: '#4f6b3a',
  mossD: '#3b5229',
  mossL: '#6f8c55',
  paper: '#f6f0dc',
  paperD: '#e8dfc2',
  ink: '#3a3226',
  line: '#d9cba3',
  accent: '#c8743a',
  accentD: '#8a4c22',
  water: '#4a9fd8',
  warn: '#b5523b',
  warnD: '#7e3324',
  bg: '#2f6b34',
  iconBg: '#9cc27a',
};

export const FONT = {
  ui: 'DotGothic16_400Regular',
  text: 'KleeOne_400Regular',
};

export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: Record<Dir, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};
export const DIR_INDEX: Record<Dir, number> = { up: 0, down: 1, left: 2, right: 3 };
