# edu-components

小学校向けWeb教材で繰り返し使う、動作・ロジック・状態管理のVanilla JavaScript部品集です。HTML / CSS / JavaScriptだけで動き、npm・ビルド・APIキー・外部DBは不要です。

## 役割

- 画面遷移：`ScreenManager`
- 問題出題・判定：`QuestionPool`、`AnswerChecker`、各Question系コンポーネント
- 得点・コンボ：`ScoreManager`、`ComboManager`
- 時間制教材：`CountdownTimer`、`CountUpTimer`、`TimeAttack`、`Challenge60`
- 結果・復習：`RankCalculator`、`NewRecordJudge`、`RetryWrong`
- 保存・進捗・報酬：`StorageManager`、`ProgressManager`、`LevelManager`、`UnlockManager`、`AchievementManager`、`BadgeManager`

詳しいAPI、イベント、4資産の組み合わせ方は [AI-GUIDE.md](AI-GUIDE.md) を参照してください。

## 基本的な使い方

必要な部品だけをES Modulesとして読み込みます。

```html
<script type="module">
  import {
    ScreenManager,
    QuestionPool,
    ChoiceQuestion,
    ScoreManager
  } from 'https://tt-sensei.github.io/edu-components/index.js';
</script>
```

各部品は疎結合で、`edu:correct`、`edu:wrong`、`edu:badge`、`edu:unlock`などの`CustomEvent`を教材側の接続点として利用できます。イベント名は [`js/core/events.js`](js/core/events.js) に定義されたものだけを使用してください。

## 教材制作共通基盤

| プロジェクト | 担当 | GitHub | Pages |
| --- | --- | --- | --- |
| edu-components | 動作・ロジック | [Repository](https://github.com/TT-sensei/edu-components) | [Catalog](https://tt-sensei.github.io/edu-components/) |
| edu-effects | UI・CSS・視覚演出 | [Repository](https://github.com/TT-sensei/edu-effects) | [Catalog](https://tt-sensei.github.io/edu-effects/) |
| sounds-recipe- | Web Audio APIの教材用サウンドレシピ | [Repository](https://github.com/TT-sensei/sounds-recipe-) | [Catalog](https://tt-sensei.github.io/sounds-recipe-/) |
| edu-assets | バッジ・エレメント・コレクション画像 | [Repository](https://github.com/TT-sensei/edu-assets) | [Catalog](https://tt-sensei.github.io/edu-assets/) |

4つすべてを必ず使う必要はありません。教材に必要な資産だけを選び、教材固有の問題データは教材側に置きます。

## 方針

- `edu-components`本体を教材ごとに改造しない
- 同じ処理を再実装する前に既存部品を確認する
- 保存には教材固有のnamespaceを持つ`StorageManager`を使う
- 問題データ、DOM、見た目、音、画像をManagerへ混在させない
- タッチとマウスに対応し、長押しやドラッグだけを必須にしない

