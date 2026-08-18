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
| 保存ありの学習進捗 | `ProgressManager` + `StorageManager` |
| 保存不要の学習進捗 | `ProgressManager` |
| 現在レベル管理 | `LevelManager` |
| ステージ・単元の解放 | `UnlockManager` |
| 保存ありのレベル・解放状態 | 各Manager + `StorageManager` |
| 達成条件管理 | `AchievementManager` |
| バッジ獲得管理 | `BadgeManager` |
| 保存ありの達成・バッジ状態 | 各Manager + `StorageManager` |

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
- `ProgressManager`：IDごとの完了状況、完了数、進捗率を管理。保存はStorageManagerへ委譲する
- `LevelManager`：数値レベルの現在値、最小値、最大値、上下変更を管理。保存はStorageManagerへ委譲する
- `UnlockManager`：IDごとの解放状態と初期解放状態を管理。保存はStorageManagerへ委譲する
- `AchievementManager`：教材側で判定した達成項目の状態を管理。保存はStorageManagerへ委譲する
- `BadgeManager`：教材側から渡されたバッジ定義と獲得状態を管理。条件判定は行わない

## StorageManagerの使い方

教材ごとに固有のnamespaceを必ず指定します。

```js
import { StorageManager } from './index.js';

const storage = new StorageManager('dictionary-master');
storage.save('bestScore', 120);
const best = storage.load('bestScore', 0);
```

内部キーは`edu:<namespace>:<key>`です。`clear()`は現在のnamespaceだけを削除します。数値、文字列、boolean、配列、object、nullを保存でき、localStorageが利用できない場合は簡易メモリフォールバックに切り替わります。

## ProgressManagerの使い方

保存ありなら教材固有のnamespaceを持つ`StorageManager`を渡します。保存なしなら`storage`を省略します。

```js
import { StorageManager, ProgressManager } from './index.js';

const progress = new ProgressManager({
  storage: new StorageManager('my-lesson'),
  ids: ['lesson-1', 'lesson-2', 'lesson-3']
});
progress.complete('lesson-1');
console.log(progress.getCompletedCount(), progress.getPercent());
```

保存キーは`progress`、データ形式は`{ version: 1, completed: [...] }`です。`edu:progress`のdetailは`{ id, completed, completedCount, total, percent }`です。初めて100%に到達したときは`edu:complete`も発火します。

## LevelManager / UnlockManagerの使い方

```js
import { StorageManager, LevelManager, UnlockManager } from './index.js';

const storage = new StorageManager('my-lesson');
const level = new LevelManager({ min: 1, max: 5, storage });
const unlock = new UnlockManager({ initialUnlocked: ['level-1'], storage });

level.up();
unlock.unlock('level-2');
```

LevelManagerの保存キーは`level`、UnlockManagerの保存キーは`unlocks`です。保存不要なら`storage`を省略します。ProgressManager、LevelManager、UnlockManagerは互いに自動連携しません。教材側で「完了したらレベルを上げる」「条件を満たしたら解放する」という流れを明示的に組み合わせます。

## AchievementManager / BadgeManagerの使い方

```js
import { AchievementManager, BadgeManager, StorageManager } from './index.js';

const storage = new StorageManager('my-lesson');
const achievement = new AchievementManager({
  achievements: [{ id: 'first-clear', title: 'はじめてクリア' }], storage
});
const badge = new BadgeManager({
  badges: [{ id: 'clear-badge', name: 'クリア', image: 'https://example.com/badge.png' }], storage
});
```

AchievementManagerの保存キーは`achievements`、BadgeManagerの保存キーは`badges`です。条件判定は教材側で行い、`achievement.achieve('first-clear')`を呼びます。AchievementとBadgeをつなぐ場合は、`edu:achievement`を教材側で受けて`badge.award('clear-badge')`を呼びます。

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
- `edu:levelchange`：`{ previous, current, min, max }`
- `edu:unlock` / `edu:lock`：`{ id, unlocked, unlockedCount }`
- `edu:achievement`：`{ id, achievement, achievedCount }`
- `edu:badge`：`{ id, badge, awardedCount }`

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
- `ProgressManager`内でlocalStorageを直接操作しない。保存担当は`StorageManager`にする
- 保存ありの学習進捗は`ProgressManager` + `StorageManager`、保存不要なら`ProgressManager`だけを使う
- 進捗表示のCSSやDOMを`ProgressManager`内部に入れない
- `ProgressManager`にLevelManager、UnlockManager、BadgeManager、AchievementManager、XPManagerの役割を持たせない
- `ProgressManager`、`LevelManager`、`UnlockManager`へ同じ状態管理を重複実装しない
- LevelManagerとUnlockManagerを内部で強制連携させず、教材側で条件を確認して組み合わせる
- AchievementとBadgeを同じものとして扱わない
- BadgeManagerで達成条件を判定しない
- AchievementManagerへ画像表示処理を入れない
- BadgeManagerへCSS演出を入れない
- `edu-assets`のURLを推測せず、存在を確認したURLだけ教材側のbadge定義へ渡す
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

XPManager、RewardManager、ガチャ、ランダム報酬、レア抽選、CSS演出の本格連携、`sounds-recipe-`の本格連携、`edu-assets`の固定一覧化は、この共通基盤の現在の責務に含めません。ProgressManagerは完了状況、LevelManagerは現在レベル、UnlockManagerは解放状態、AchievementManagerは達成状態、BadgeManagerは獲得状態だけを管理します。
