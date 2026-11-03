# App Store Connect 入力内容（できたこと農園 1.0）

文字数はすべて App Store Connect の上限内に収めてあります（`docs/app-store/check.py` で確認）。

---

## App 情報

| 項目 | 内容 |
|---|---|
| 名前（30字） | できたこと農園 |
| サブタイトル（30字） | 小さな「できた」を植えて、じぶんの自信を育てていく。 |
| バンドルID | com.masahikofujita.dekitakotofarm |
| SKU | dekitakotofarm-ios-20261103 |
| Apple ID | 6830009467 |
| プライマリ言語 | 日本語 |
| カテゴリ（プライマリ） | ゲーム（カジュアル・シミュレーション） |
| カテゴリ（セカンダリ） | ライフスタイル |
| 価格 | 無料 |
| 著作権 | © 2026 Masahiko Fujita |

サブタイトルの別案（App Store Connect に入力済みのものを採用）：
- 小さなできたことを、花に育てるドット農園
- 歩いて蒔いて、水やりで花にする
- できたことを蒔いて、毎日水やり

---

## プロモーションテキスト（170字）

今日の小さな「できたこと」を種にして、ドット絵の農園に蒔こう。1日1回の水やりで読み返し、3回目で花が咲きます。データはすべてこのiPhoneの中だけ。アカウント登録もいりません。

---

## 概要（4000字）

今日できた、小さなこと。
「朝ちゃんと起きた」「洗い物をした」「人にやさしくできた」。
そんな「できたこと」を種にして、ドット絵の農園に蒔くアプリです。

■ 農園を歩いて、種を蒔く
画面をなぞると、麦わら帽子のキャラクターが農園を歩きます。
草地や畑の好きな場所に立って A ボタンを押すと、その場所に「できたこと」を種として蒔けます。
家のまわり、池のほとり、畑の真ん中。どこに蒔くかはあなた次第です。

■ 毎日の水やりで、読み返す
種には1日1回、水をあげられます。
水やりの間、そのとき書いた「できたこと」が3秒間、大きく表示されます。
芽からつぼみへと、水やりのたびに少しずつ育っていきます。
今日まだ水をあげていない種には、💧マークがつきます。

■ 3回目の水やりで、花が咲く
3回水をあげると花が咲き、農園に残ります。
ひまわり、チューリップ、コスモス、あさがお、すみれ、マリーゴールド、デイジー、ネモフィラ。
どの花が咲くかはお楽しみです。

■ 思い出帳
咲いた花は思い出帳にしまわれます。
いつ植えて、いつ水をあげて、いつ咲いたのか。
あとから見返すと、自分ができていたことがたくさん並んでいます。
育てている途中の種も一覧で見られ、タップするとその種のところへ移動できます。

■ このiPhoneの中だけで完結
・アカウント登録は不要です
・書いた内容はどこにも送信されません（通信を一切しません）
・広告はありません
・他の人に見られたり、比べられたりすることはありません
・バックアップをファイルに書き出して保存し、あとから戻せます

毎日少しずつ、自分の農園に花が増えていく。
そんな小さな楽しみを、日々のすきま時間にどうぞ。

---

## キーワード（100字・カンマ区切り、スペースなし）

日記,振り返り,ふりかえり,自己肯定感,ほめ日記,ドット絵,箱庭,花,水やり,育成,習慣,記録,ジャーナル,セルフケア,ポジティブ,ガーデニング,一行日記,ひとこと日記,癒し

※ アプリ名に含まれる「できたこと」「農園」は自動で検索対象になるので入れていません。

---

## URL

| 項目 | 内容 |
|---|---|
| サポートURL（必須） | https://masahiko-les.github.io/DekitakotoFarm/support/ |
| マーケティングURL（任意） | なし |
| プライバシーポリシーURL（必須） | https://masahiko-les.github.io/DekitakotoFarm/privacy/ |

---

## App のプライバシー

- 「データの収集」：**いいえ、このAppからデータを収集しません**
  - 通信・アカウント・解析ツール・広告を一切使っていないため。書いた文章は端末内の SQLite にだけ保存されます。

---

## 年齢制限指定

質問票はすべて「なし／いいえ」で回答 → **4+** の見込み。

- ユーザー生成コンテンツ：いいえ（入力した文章は本人の端末内にだけ保存され、他の人と共有・公開されない）
- Webアクセス・メッセージ機能・広告：なし
- 医療・治療に関する情報：なし

---

## 輸出コンプライアンス

`app.json` で `ITSAppUsesNonExemptEncryption = false` を設定済み（暗号化を使う通信をしない）。

---

## App Review に関する情報

| 項目 | 内容 |
|---|---|
| サインインが必要 | いいえ |
| 連絡先 | （氏名・電話番号・メールアドレス） |

### メモ（審査担当者向け・英語で入力）

```
Thank you for reviewing Dekitakoto Farm.

[Overview]
A small pixel-art farm where users plant short notes about things they did today ("dekitakoto") as seeds, and look back on them by watering the seeds once a day.

[Account / network]
- No sign-in is required. There is no account, no server, no ads, and no analytics.
- The app makes no network connections. All data stays on the device (SQLite).

[How to test]
1. On first launch, tap "はじめる" to close the welcome screen.
2. Swipe on the map to walk. Keep your finger down to keep walking.
3. Stand on grass or a field (not the path) and tap the orange A button. Type a short note and tap "種を植える" to plant a seed.
4. While standing on the seed, tap A, then "💧 水やりする". The note is shown for 3 seconds while the bar fills, then the seed grows into a sprout.
5. Tap "📖 思い出帳" (top right) to see bloomed flowers and growing seeds.

[About blooming]
By design, each seed can be watered only once per calendar day (device local date), and it blooms on the 3rd watering, i.e. on the 3rd different day. Within a single day you can confirm planting, watering and the sprout stage. The bloomed state and the memory book are shown in the screenshots.

[Other features]
- Settings (⚙): "バックアップを保存" exports a JSON file through the iOS share sheet, and "バックアップから戻す" restores it through the document picker. Both are local only.
- After 10 flowers have bloomed, the app calls the standard SKStoreReviewController once (no custom prompt).
```

日本語訳（確認用）：

```
できたこと農園をご審査いただきありがとうございます。

【概要】
その日にできた小さなこと（できたこと）を短い文章で種として植え、1日1回の水やりで読み返す、ドット絵の農園アプリです。

【アカウント・通信】
- サインインは不要です。アカウント、サーバー、広告、解析ツールはありません。
- 通信は一切行いません。データはすべて端末内（SQLite）に保存されます。

【確認手順】
1. 初回起動時、「はじめる」でようこそ画面を閉じます。
2. 画面をなぞると歩きます。指を置いたままで歩き続けます。
3. 道以外の草地か畑に立ち、オレンジの A ボタンを押します。短い文章を入力して「種を植える」で種を植えます。
4. 種の上に立って A →「💧 水やりする」。3秒間文章が表示され、種が芽に育ちます。
5. 右上の「📖 思い出帳」で、咲いた花と育てている種を見られます。

【開花について】
仕様として、水やりは1つの種につき1日1回（端末の日付）で、3回目（＝3日目）に花が咲きます。1日の中では、種まき・水やり・芽の段階まで確認できます。開花した状態と思い出帳はスクリーンショットでご確認ください。

【その他の機能】
- 設定（⚙）：「バックアップを保存」は共有シートでJSONファイルを書き出し、「バックアップから戻す」はファイル選択で復元します。どちらも端末内だけで完結します。
- 花が10個咲いたあと、iOS標準の評価ダイアログ（SKStoreReviewController）を一度だけ呼び出します（独自の確認画面はありません）。
```

---

## スクリーンショット

- 必須サイズ：6.9インチ（1320 × 2868）。iPhone 17 Pro Max シミュレーターで撮ると、このサイズになります。
- ガイドライン4.3（似たアプリの重複）に引っかからないよう、「マップを歩いて種を蒔き、水やりで育てる」遊び方を前に出す順番にしています。

| # | 画面 | 見出し案 |
|---|---|---|
| 1 | 花や種が並んだ農園マップ | 農園を歩いて、「できたこと」を蒔こう |
| 2 | 種を蒔く画面（便箋） | 立っている場所に、今日のできたことを植える |
| 3 | 水やり中（3秒の横棒） | 1日1回の水やりで、読み返す |
| 4 | 開花の画面 | 3回目の水やりで、花が咲く |
| 5 | 思い出帳（咲いた花） | 咲いた花は、思い出帳に |

---

## 申請前に残っていること

- [x] アプリアイコン・スプラッシュ画像（`assets/images/icon.png`）
- [x] サポートページとプライバシーポリシーを公開（GitHub Pages：`docs/support/`・`docs/privacy/`）
- [ ] 著作権表記の名義、審査用の連絡先
- [ ] スクリーンショット5枚（見本の農園データを作って撮影）
- [x] App Store Connect で新規 App を作成 → `eas.json` の `ascAppId` を記入
- [ ] `npx eas-cli@latest build --platform ios --profile production` → TestFlight で実機確認
- [ ] 実機（Expo Go）で、種まき→3日分の水やり→開花→思い出帳まで通して確認（CLAUDE.md の手順8）
