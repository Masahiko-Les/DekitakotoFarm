# できたこと農園

日々の小さな「できたこと」を種にしてマップに蒔き、毎日の水やりで振り返り、3回水をあげると花が咲くアプリ（Expo / iPhone）。
仕様は `CLAUDE.md`、見た目と動きの正解は `reference/prototype.html`。

## 起動

```bash
npm install
npx expo start   # Expo Go で QR を読み込む
```

## 構成

- `src/app/_layout.tsx` フォント読み込み・DB 初期化
- `src/app/index.tsx` 農園マップ（メイン画面）・スワイプ移動・A ボタン・ヒント
- `src/components/MapCanvas.tsx` Skia でのマップ描画・カメラ・キャラ
- `src/components/Modals.tsx` 種まき・種を見る・水やり・開花・思い出帳・設定など
- `src/components/Controls.tsx` スワイプで歩く処理と A ボタン
- `src/components/ui.tsx` ボタン・便箋・植物アイコンなど共通部品
- `src/lib/map.ts` マップ定義（試作の `buildMap()` の移植）
- `src/lib/pixel.ts` ドット絵（試作の描画コードの移植）と使い回す Picture
- `src/lib/db.ts` expo-sqlite（`PRAGMA user_version` でマイグレーション）
- `src/lib/store.ts` 農園の状態と操作、バックアップ JSON の検証
- `src/lib/backup.ts` バックアップの書き出し（共有シート）と読み込み
