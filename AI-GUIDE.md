# edu-components AI Guide

## 目的

`edu-components`は、小学校向けWeb教材で繰り返し使う画面遷移、問題出題、正誤判定、得点、コンボ、タイマー、チャレンジ処理を、HTML / CSS / Vanilla JavaScriptだけで再利用するための部品集です。

- React / Vueなどのフレームワーク不要
- npm・ビルド・サーバー・APIキー不要
- GitHub Pagesで直接読み込み可能
- タッチとマウスに対応し、長押しを前提にしない
- 問題データと処理を分離する
- 必要な部品だけを読み込む

## 使うとき

教材側で同じ処理をゼロから書かず、`index.js`から必要な部品をimportしてください。

| 目的 | 推奨構成 |
| --- | --- |
| 通常教材 | `ScreenManager` + `QuestionPool` + 問題形式コンポーネント |
| 4択問題 | `QuestionPool` + `ChoiceQuestion` + 内蔵の`AnswerChecker` |
| ○×問題 | `TrueFalseQuestion` |
| 文字入力 | `InputQuestion` |
| 数字入力 | `NumberInput` |
| 並べ替え | `SortQuestion` |
| 複数選択 | `MultiSelect` |
| 間違い直し | `RetryWrong` + `QuestionPool` |
| 60秒チャレンジ | `QuestionPool` + `Challenge60` + `ScoreManager` + `ComboManager` |
| 秒数を変更したチャレンジ | `TimeAttack`（`duration: 30`や`90`など） |
| 結果ランク | `RankCalculator` |
| 新記録判定 | `NewRecordJudge` |
| 教材データの保存 | `StorageManager` |

## コンポーネント一覧

- `ScreenManager`：画面の表示切り替え、現在画面、戻る処理
- `QuestionPool`：ランダム / 順番出題、抽出、絞り込み、重複防止、リセット
- `AnswerChecker`：文字列、数値、複数候補、カスタム比較の正誤判定
- `ScoreManager`：得点、正解数、不正解数、総問題数、正答率
- `ComboManager`：現在コンボ、最大コンボ、コンボ到達通知
- `QuestionComponent`：問題形式の共通基盤。回答後ロックと`AnswerChecker`利用
- `ChoiceQuestion`：2〜4択
- `TrueFalseQuestion`：○×
- `InputQuestion`：文字入力とEnter回答
- `NumberInput`：数字入力と教材内テンキー
- `SortQuestion`：タップで項目を入れ替える並べ替え
- `MultiSelect`：必要個数を選択する問題
- `RetryWrong`：`edu:wrong`の問題を記録して復習用`QuestionPool`を作成
- `CountdownTimer`：カウントダウン、pause / resume / reset、警告、時間切れ
- `CountUpTimer`：経過時間の計測
- `TimeAttack`：タイマー、問題数、スコア、コンボを接続
- `Challenge60`：デフォルト60秒の`TimeAttack`ラッパー。秒数変更可能
- `RankCalculator`：教材側の基準でランク算出
- `NewRecordJudge`：現在値と過去最高値を比較。保存は行わない
- `StorageManager`：namespace単位で値を保存・読み込み・削除。進捗や判定は行わない

## StorageManagerの使い方

教材ごとに固有のnamespaceを必ず指定します。

```js
import { StorageManager } from './index.js';

const storage = new StorageManager('dictionary-master');
storage.save('bestScore', 120);
const best = storage.load('bestScore', 0);
```

内部キーは`edu:<namespace>:<key>`です。`clear()`は現在のnamespaceだけを削除します。数値、文字列、boolean、配列、object、nullを保存でき、localStorageが利用できない場合は簡易メモリフォールバックに切り替わります。

## 問題データ

必要な項目だけを持つオブジェクトを使います。`id`、`type`、`category`、`level`、`explanation`は必要な教材だけ追加してください。

```js
const questions = [
  {
    id: 'q1', type: 'choice', question: '日本の首都は？',
    choices: ['東京', '大阪', '京都', '札幌'], answer: '東京',
    category: '社会', level: 1, explanation: '日本の首都は東京です。'
  }
];
```

## 最小導入例

```html
<script type="module">
  import { QuestionPool, ChoiceQuestion } from './index.js';

  const pool = new QuestionPool(questions);
  const data = pool.next({ category: '社会', level: 1 });
  const question = new ChoiceQuestion(data, { eventTarget: document });
  question.choose('東京');
</script>
```

問題形式コンポーネントは、回答を受け取ると内部の`AnswerChecker`を使い、回答後にロックし、`edu:correct`または`edu:wrong`を1回だけ発火します。

## イベント

イベント名はすべて`edu:`で始まります。

- `edu:correct` / `edu:wrong`：`{ answer, correct, isCorrect, question, type }`
- `edu:screenchange`：`{ from, to }`
- `edu:combo`：`{ current, max }`
- `edu:complete`：`{ type, value, result }`
- `edu:timerstart`：`{ mode, value, remaining または elapsed, duration }`
- `edu:timerwarning`：`{ mode, value, remaining, threshold }`
- `edu:timeup`：`{ mode, value, remaining, duration }`
- `edu:newrecord`：`{ current, best, isNewRecord }`
- `edu:rank`：`{ rank, accuracy, result }`
- `edu:storagesave`：`{ namespace, key, storageKey, value }`
- `edu:storageremove`：`{ namespace, key, storageKey }`
- `edu:storageclear`：`{ namespace, keys }`
- `edu:storageerror`：`{ operation, namespace, key, message, fallback }`

```js
document.addEventListener('edu:correct', (event) => {
  // edu-effectsやsounds-recipeを教材側で接続する
  console.log(event.detail.question);
});
```

教材ごとに`eventTarget`を分けると、同じページに複数の教材部品を置いてもイベントが混ざりません。

## AIが守ること

- 既存コンポーネントと同じ処理を教材側で再実装しない
- 必要なコンポーネントだけ読み込む
- `edu-components`本体を教材ごとに勝手に改造しない
- CSS演出をコンポーネント内部に大量に書かない
- 音源をコンポーネントへ直接埋め込まない
- 問題データと処理を分離する
- 各コンポーネントで`localStorage`を勝手に使わない
- 教材側でlocalStorage操作を乱立させず、保存には`StorageManager`を優先する
- namespaceを教材ごとに分ける
- `localStorage.clear()`を使用しない
- 一時的なDOM状態などを何でも保存しない
- タッチ操作で押せる十分な大きさを確保し、ドラッグだけを必須にしない
- `QuestionPool`の元データ配列を直接並べ替えたり変更したりしない

## 役割分担

- `edu-components`：JavaScriptの動作と状態管理
- `edu-effects`：CSS UIと演出
- `sounds-recipe-`：教材用サウンド
- `edu-assets`：バッジ、コレクションなどの画像素材

## GitHub Pages

カタログ：[https://tt-sensei.github.io/edu-components/](https://tt-sensei.github.io/edu-components/)

## 今回扱わないもの

ProgressManager、LevelManager、UnlockManager、BadgeManager、AchievementManager、`edu-assets`連携、`sounds-recipe-`連携、`edu-effects`連携は、この共通基盤の現在の責務に含めません。必要になった段階で別コンポーネントとして設計します。
