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

### メモ（審査担当者向け・英語）

```
Thank you for reviewing Dekitakoto Farm.

- No account, no login, and no network access. All data (the short notes the user writes) is stored only on the device with SQLite. The app collects no data.
- How to use: swipe on the map to walk the character. Stand on grass or a field and tap the A button to plant a "seed" (a short note about something you did today). Stand on the seed and tap A, then "💧 水やりする" to water it.
- By design, each seed can be watered once per calendar day (device local date), and it blooms on the 3rd watering, i.e. after 3 different days. On the first day you can confirm planting, watering (a 3-second screen that shows the note), and the growth stages in the memory book (📖 思い出帳). The attached screenshots show the bloomed state.
- Settings (⚙) offers exporting a JSON backup via the share sheet and restoring it via the document picker. Both work locally only.
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
