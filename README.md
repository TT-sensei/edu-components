# edu-components

小学校向けWeb教材で繰り返し使うJavaScriptの動作・仕組みを、コピーまたは読み込みで再利用するためのVanilla JavaScriptコンポーネント集です。

## 方針

- HTML / CSS / Vanilla JavaScriptのみ
- npm・ビルド・サーバー・APIキー・外部DB不要
- GitHub Pagesでそのまま動作
- タッチ操作・マウス操作に対応
- コンポーネントを個別ファイルに分離

## 既存資産との役割分担

| 資産 | 役割 |
| --- | --- |
| [edu-assets](https://tt-sensei.github.io/edu-assets/) | バッジ、コレクションなどの画像素材 |
| [sounds-recipe-](https://tt-sensei.github.io/sounds-recipe-/) | 正解・達成などの教材用サウンド |
| [edu-effects](https://tt-sensei.github.io/edu-effects/) | CSS UI、アニメーション、画面演出 |
| edu-components | 画面切り替え、問題管理、正誤判定、得点、コンボ、保存などのJavaScript処理 |

## デモ

[GitHub Pagesでカタログを見る](https://tt-sensei.github.io/edu-components/)

`index.html` は説明だけでなく、現在のコンポーネントを実際に操作できるカタログです。最後に、60秒チャレンジの開始・回答・スコア・コンボ・時間切れ・ランク表示までを確認できる完成デモがあります。

## 導入方法

ファイルを教材にコピーして、ES Modulesとして読み込みます。

```html
<script type="module">
  import { ScreenManager, QuestionPool, AnswerChecker } from './index.js';
</script>
```

画面部品は、画面IDとDOM要素を登録して使います。

```js
const manager = new ScreenManager();
manager.register('HOME', document.querySelector('#home'));
manager.register('PLAY', document.querySelector('#play'));
manager.show('PLAY');
```

## コンポーネント一覧

- `ScreenManager`：画面の表示切り替え、現在画面、戻る処理
- `QuestionPool`：ランダム・順番出題、重複防止、category / level絞り込み、リセット
- `AnswerChecker`：文字列・数値・複数候補の正誤判定
- `ScoreManager`：得点、正解数、不正解数、問題数、正答率
- `ComboManager`：現在コンボ、最大コンボ、指定コンボ到達イベント
- `ChoiceQuestion`：2〜4択、シャッフル、二重回答防止
- `TrueFalseQuestion`：○×問題
- `InputQuestion`：文字入力、Enter回答
- `NumberInput`：数字入力、教材内テンキー
- `SortQuestion`：タップで項目を入れ替える並べ替え
- `MultiSelect`：必要な個数を選ぶ複数選択
- `RetryWrong`：間違えた問題の記録と復習用`QuestionPool`
- `CountdownTimer`：指定秒数からのカウントダウン、停止、再開、警告
- `CountUpTimer`：経過時間の計測
- `TimeAttack`：制限時間内の問題数、スコア、コンボ管理
- `Challenge60`：秒数を変更できる時間制チャレンジのラッパー
- `RankCalculator`：結果からS / A / B / Cなどを算出
- `NewRecordJudge`：今回の記録と過去最高記録を比較
- `StorageManager`：namespace単位の安全な保存・読み込み・削除
- `ProgressManager`：問題・単元・ステージなどの完了状況と進捗率
- `LevelManager`：数値レベルの現在値、範囲、変更
- `UnlockManager`：IDで表す項目の解放状態
- `AchievementManager`：教材側で判定した達成項目の記録
- `BadgeManager`：獲得済みバッジの記録

## StorageManager

教材ごとに必ずnamespaceを指定して使います。内部キーは`edu:<namespace>:<key>`になります。

```js
import { StorageManager } from './index.js';

const storage = new StorageManager('dictionary-master');
storage.save('bestScore', 120);
const best = storage.load('bestScore', 0);
```

number、string、boolean、array、object、nullをJSONとして保存できます。`load(key, defaultValue)`はデータがない場合や壊れている場合にデフォルト値を返します。`clear()`は現在のnamespaceのキーだけを削除し、ブラウザ全体の`localStorage.clear()`は使用しません。localStorageが使えない環境では簡易メモリフォールバックを使用します。

## ProgressManager

`ProgressManager`は、問題・単元・ステージなどのIDについて、完了状況と進捗率だけを管理します。保存したい教材では`StorageManager`を渡し、保存しない教材では渡さずにメモリ上だけで使えます。

```js
import { StorageManager, ProgressManager } from './index.js';

const progress = new ProgressManager({
  storage: new StorageManager('dictionary-master'),
  ids: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5']
});
progress.complete('lesson-1');
progress.isCompleted('lesson-1'); // true
progress.getPercent(); // 20
```

保存データは`{ version: 1, completed: ['lesson-1'] }`です。保存キーはStorageManager内の`progress`で、namespaceは教材ごとに分けます。`ProgressManager`はlocalStorageを直接操作せず、表示・CSS・レベル解放・バッジ判定も担当しません。

## LevelManager / UnlockManager

`LevelManager`は現在の数値レベルだけを管理します。最小値・最大値を設定でき、`up()`や`down()`で範囲を超えません。`UnlockManager`はレベル、ステージ、単元などのIDが利用可能かどうかだけを管理します。両者は自動連携せず、教材側で条件を確認して組み合わせます。

```js
import { StorageManager, LevelManager, UnlockManager } from './index.js';

const storage = new StorageManager('my-lesson');
const level = new LevelManager({ min: 1, max: 5, storage });
const unlock = new UnlockManager({ initialUnlocked: ['level-1'], storage });

level.up();
unlock.unlock('level-2');
```

保存キーはLevelManagerが`level`、UnlockManagerが`unlocks`です。保存形式はそれぞれ`{ version: 1, level: 2 }`、`{ version: 1, unlocked: ['level-1'] }`です。保存しない場合は`storage`を省略してメモリ上だけで利用できます。

## AchievementManager / BadgeManager

`AchievementManager`は「はじめてクリア」「5コンボ」など、教材側で条件を判定した達成項目を記録します。条件判定や画像表示は担当しません。`BadgeManager`は、教材側から渡されたバッジ定義と獲得済み状態だけを管理します。AchievementとBadgeは自動連携せず、教材側でイベントを受けて接続します。

```js
import { AchievementManager, BadgeManager } from './index.js';

const achievement = new AchievementManager({
  achievements: [{ id: 'first-clear', title: 'はじめてクリア' }]
});
const badge = new BadgeManager({
  badges: [{ id: 'clear-badge', name: 'クリア', image: 'https://example.com/badge.png' }]
});

achievement.achieve('first-clear');
badge.award('clear-badge');
```

保存キーはAchievementManagerが`achievements`、BadgeManagerが`badges`です。保存形式はそれぞれ`{ version: 1, achieved: [...] }`、`{ version: 1, awarded: [...] }`です。`image`、`category`、`rarity`は任意項目です。

## 共通の問題データ

問題は必要な項目だけを持つオブジェクトとして扱います。

```js
{
  type: 'choice',
  question: '日本の首都は？',
  choices: ['東京', '大阪', '京都', '札幌'],
  answer: '東京',
  category: '社会',
  level: 1,
  explanation: '日本の首都は東京です。'
}
```

`QuestionPool.next()`で問題を取り出し、その問題を形式別コンポーネントへ渡せます。各形式は`AnswerChecker`を利用し、判定時に`edu:correct`または`edu:wrong`を発火します。

## 簡単な使用例

```js
const score = new ScoreManager();
const combo = new ComboManager({ milestones: [3, 5] });
const checker = new AnswerChecker();

if (checker.check(input.value, ['東京', 'Tokyo'])) {
  score.correct(10);
  combo.correct();
} else {
  score.wrong();
  combo.wrong();
}
```

## イベント

コンポーネントは直接依存しません。`CustomEvent`で以下のイベントを利用できます。

`edu:correct` / `edu:wrong` / `edu:screenchange` / `edu:combo` / `edu:complete`

時間制チャレンジでは、`edu:timerstart` / `edu:timerwarning` / `edu:timeup` / `edu:newrecord` / `edu:rank`も利用できます。保存処理では`edu:storagesave` / `edu:storageremove` / `edu:storageclear` / `edu:storageerror`、進捗更新では`edu:progress`、レベル変更では`edu:levelchange`、解放状態の変更では`edu:unlock` / `edu:lock`、新しい達成・バッジ獲得では`edu:achievement` / `edu:badge`を利用できます。進捗率が初めて100%になったときは`edu:complete`も発火します。

```js
document.addEventListener('edu:correct', (event) => {
  // edu-effects、sounds-recipe、BadgeManagerなどと連携
  console.log(event.detail);
});
```

主なイベントdetailは、`edu:correct` / `edu:wrong` が `{ answer, correct, isCorrect, question, type }`、`edu:screenchange` が `{ from, to }`、`edu:combo` が `{ current, max }`です。`edu:progress`は `{ id, completed, completedCount, total, percent }`、`edu:levelchange`は `{ previous, current, min, max }`、`edu:unlock` / `edu:lock`は `{ id, unlocked, unlockedCount }`、`edu:achievement`は`{ id, achievement, achievedCount }`、`edu:badge`は`{ id, badge, awardedCount }`です。`edu:complete`は完了種別を`detail.type`、結果を`detail.result`、代表値を`detail.value`で通知します。

## 今後追加予定

今後は、必要性を確認しながらアクセシビリティ補助などを検討します。ProgressManagerは完了状況、LevelManagerは現在レベル、UnlockManagerは利用可能状態、AchievementManagerは達成状態、BadgeManagerは獲得状態、StorageManagerは保存処理だけを担当します。
