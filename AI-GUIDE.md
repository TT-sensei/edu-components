# edu-components AI Guide

## 目的

この文書は、AIが小学校向けWeb教材を作るときに、次の4資産を必要に応じて組み合わせるための中心ガイドです。

| 資産 | 担当 | GitHub | Pages |
| --- | --- | --- | --- |
| `edu-components` | 教材の動作・ロジック・状態管理 | [Repository](https://github.com/TT-sensei/edu-components) | [Catalog](https://tt-sensei.github.io/edu-components/) |
| `edu-effects` | 見た目・UI・CSS演出 | [Repository](https://github.com/TT-sensei/edu-effects) | [Catalog](https://tt-sensei.github.io/edu-effects/) |
| `sounds-recipe-` | Web Audio APIの教材用サウンドレシピ | [Repository](https://github.com/TT-sensei/sounds-recipe-) | [Catalog](https://tt-sensei.github.io/sounds-recipe-/) |
| `edu-assets` | バッジ・エレメント・コレクション画像 | [Repository](https://github.com/TT-sensei/edu-assets) | [Catalog](https://tt-sensei.github.io/edu-assets/) |

基本分担は、ロジックは`edu-components`、CSSは`edu-effects`、音は`sounds-recipe-`、画像・報酬は`edu-assets`です。同じものを教材側で新しく作る前に既存資産を確認します。ただし、4つすべてを必ず使う必要はありません。

## 制作を始める前の手順

1. 学年、教科、学習目標、問題形式、1回の問題数、保存の要否を整理する。
2. `edu-components/index.js`と各実装ファイルを見て、必要な部品を選ぶ。
3. `edu-effects/AI-GUIDE.md`と公開カタログを見て、必要なCSSファイルと実在クラスを選ぶ。
4. 音が必要なら`sounds-recipe-/sounds.js`の実在IDを確認する。
5. 報酬画像が必要なら`edu-assets`の公開カタログで画像を開き、実在URLをコピーする。
6. 教材固有の問題データ、画面文言、達成条件、イベント接続は教材リポジトリ側に置く。

READMEだけで名前を判断せず、実装と公開カタログを確認してください。

## edu-componentsの選び方

| 目的 | 部品 |
| --- | --- |
| 画面切り替え | `ScreenManager` |
| ランダム・順番出題、絞り込み | `QuestionPool` |
| 文字列・数値・複数候補の判定 | `AnswerChecker` |
| 2〜4択 | `ChoiceQuestion` |
| ○× | `TrueFalseQuestion` |
| 文字入力 | `InputQuestion` |
| 数字入力・教材内テンキー | `NumberInput` |
| タップ式並べ替え | `SortQuestion` |
| 複数選択 | `MultiSelect` |
| 得点・正答率 | `ScoreManager` |
| 連続正解 | `ComboManager` |
| 間違い直し | `RetryWrong` |
| カウントダウン・計時 | `CountdownTimer` / `CountUpTimer` |
| 時間制チャレンジ | `TimeAttack` / `Challenge60` |
| 結果ランク・新記録 | `RankCalculator` / `NewRecordJudge` |
| namespace単位の保存 | `StorageManager` |
| 完了状況・進捗率 | `ProgressManager` |
| 数値レベル | `LevelManager` |
| ステージ・単元の解放 | `UnlockManager` |
| 達成項目 | `AchievementManager` |
| バッジ定義・獲得状態 | `BadgeManager` |

`ProgressManager`、`LevelManager`、`UnlockManager`、`AchievementManager`、`BadgeManager`は互いに自動連携しません。教材側で条件を決め、イベントを接続します。

## 基本読み込み

```js
import {
  EDU_EVENTS,
  ScreenManager,
  QuestionPool,
  ChoiceQuestion,
  ScoreManager
} from 'https://tt-sensei.github.io/edu-components/index.js';
```

教材にファイルをコピーして`./index.js`から読み込む方法でも構いません。どちらの場合も必要な部品だけimportします。

## イベントを連携の中心にする

イベント名は`js/core/events.js`の`EDU_EVENTS`が正本です。イベントを受けた教材側が、CSS演出、音、画像表示を接続します。Managerの内部へ音やCSSを直接埋め込みません。

| イベント | 発生内容 | 接続できる実在資産の例 |
| --- | --- | --- |
| `edu:correct` | 正解 | `.effect-correct-pop`（`edu-effects-library.css`）、音ID `correct` |
| `edu:wrong` | 不正解 | `.effect-wrong-shake`（`edu-effects-library.css`）、音ID `wrong`または`softFail` |
| `edu:screenchange` | 画面切り替え | `.edu-transition-page`（`edu-effects-interaction-kit.css`） |
| `edu:combo` | コンボ数更新 | `.effect-combo-number` / `.effect-combo-fire`、音ID `combo3` / `combo5` / `combo10` |
| `edu:complete` | コンボ到達・時間制終了・進捗100% | `.effect-achievement-glow`、音ID `practice` / `mission` / `allclear` |
| `edu:timerstart` | タイマー開始 | `.edu-timer`（`edu-learning.css`）、音ID `timerStart` |
| `edu:timerwarning` | 残り時間警告 | `.edu-timer-warning`、音ID `warning` |
| `edu:timeup` | 時間切れ | `.edu-timer-danger`、音ID `timeUpSoft` |
| `edu:newrecord` | 新記録 | `.edu-record`（`edu-ui-variants.css`）、音ID `record` |
| `edu:rank` | ランク算出 | `.edu-rank-card`、Sランクなら音ID `rankS` |
| `edu:progress` | 完了数・進捗率更新 | `.edu-progress` / `.edu-progress-value` |
| `edu:levelchange` | レベル変更 | `.effect-level-up`、上昇時の音ID `levelup` |
| `edu:unlock` | 項目解放 | `.effect-unlock`（`edu-effects-advanced.css`）、音ID `unlock` |
| `edu:lock` | 項目を再ロック | `.edu-lock` |
| `edu:achievement` | 新しい達成 | `.effect-achievement-glow`、音ID `mission` |
| `edu:badge` | 新しいバッジ獲得 | `event.detail.badge.image`、`.effect-badge-unlock`、音ID `badge` |

保存系には`edu:storagesave`、`edu:storageremove`、`edu:storageclear`、`edu:storageerror`もあります。通常は演出より、保存表示やエラー表示の更新に使います。

主なdetailは次のとおりです。

- `edu:correct` / `edu:wrong`：`{ answer, correct, isCorrect, question, type }`
- `edu:screenchange`：`{ from, to }`
- `edu:combo`：`{ current, max }`
- `edu:complete`：`{ type, value, result }`
- `edu:progress`：`{ id, completed, completedCount, total, percent }`
- `edu:levelchange`：`{ previous, current, min, max }`
- `edu:unlock` / `edu:lock`：`{ id, unlocked, unlockedCount }`
- `edu:achievement`：`{ id, achievement, achievedCount }`
- `edu:badge`：`{ id, badge, awardedCount }`

## CSS演出の接続例

`edu-effects-library.css`と任意ヘルパーを読み込みます。

```html
<link rel="stylesheet" href="https://tt-sensei.github.io/edu-effects/css/edu-effects-library.css">
<script src="https://tt-sensei.github.io/edu-effects/js/edu-effects.js"></script>
```

```js
document.addEventListener(EDU_EVENTS.CORRECT, () => {
  EduEffects.play(document.querySelector('#feedback'), 'effect-correct-pop');
});

document.addEventListener(EDU_EVENTS.WRONG, () => {
  EduEffects.play(document.querySelector('#question'), 'effect-wrong-shake');
});
```

`EduEffects.play()`は実在する補助関数です。CSSだけで足りる場合は読み込まず、教材側でクラスを付け外ししても構いません。

## サウンドレシピの接続例

`sounds-recipe-`は音声ファイル集ではありません。`sounds.js`がexportする`soundList`から実在IDを選び、レシピの`play()`を呼びます。`playSound()`という共通APIは公開されていません。

```js
import { soundList } from 'https://tt-sensei.github.io/sounds-recipe-/sounds.js';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

async function playRecipe(id, volume = 0.25) {
  if (audioContext.state === 'suspended') await audioContext.resume();
  const recipe = soundList.find((item) => item.id === id);
  if (!recipe) return false;
  recipe.play(audioContext, volume);
  return true;
}

document.addEventListener(EDU_EVENTS.CORRECT, () => playRecipe('correct'));
document.addEventListener(EDU_EVENTS.WRONG, () => playRecipe('softFail'));
```

AudioContextは最初のユーザー操作後に`resume()`します。音量とミュート設定を教材側で共通化し、同じ音が連打で重なりすぎないようにします。

## edu-assetsの接続例

実際の構造は次のとおりです。

- 共通・教科別：`assets/badges/common/`、`japanese/`、`math/`、`science/`、`social/`
- エレメント：`assets/elements/<属性>/level-1|level-2|level-3/badge.png`
- コレクション：`assets/collections/<シリーズ>/common|rare|super-rare|secret/<項目>/badge.png`

次は存在確認済みの例です。

```js
const badges = [{
  id: 'clear-badge',
  name: 'クリア',
  image: 'https://tt-sensei.github.io/edu-assets/assets/badges/common/clear/badge.png'
}];
```

別の画像へ置き換えるときは、文字列を組み立てて推測せず、[Badge Lab](https://tt-sensei.github.io/edu-assets/)の「URLをコピー」で実在URLを取得します。

```js
document.addEventListener(EDU_EVENTS.BADGE, (event) => {
  const image = event.detail.badge?.image;
  if (image) document.querySelector('#badge-image').src = image;
  EduEffects.play(document.querySelector('#badge-card'), 'effect-badge-unlock');
  playRecipe('badge');
});
```

## 連携レシピ

### 1. 普通のクイズ教材

| 資産 | 選ぶもの |
| --- | --- |
| `edu-components` | `ScreenManager`、`QuestionPool`、問題形式コンポーネント、`ScoreManager` |
| `edu-effects` | `.edu-question`、`.edu-answer-grid`、`.effect-correct-pop`、`.effect-wrong-shake` |
| `sounds-recipe-` | `correct`、`wrong`または`softFail` |
| `edu-assets` | 報酬画像が必要な場合だけ選ぶ |

問題形式コンポーネントは内部で`AnswerChecker`を使い、回答後に`edu:correct`または`edu:wrong`を1回発火します。教材側でそのイベントを受けて`ScoreManager`、表示、音を更新します。

### 2. 60秒チャレンジ

| 資産 | 選ぶもの |
| --- | --- |
| `edu-components` | `QuestionPool`、`Challenge60`、`ScoreManager`、`ComboManager` |
| `edu-effects` | `.edu-timer`、`.edu-timer-warning`、`.effect-combo-number`、`.edu-score`、`.edu-rank-card` |
| `sounds-recipe-` | `correct`、`combo3` / `combo5` / `combo10`、`warning`、`timeUpSoft`、結果に応じて`result`または`rankS` |
| `edu-assets` | 記録達成などに報酬を付ける場合だけ選ぶ |

`Challenge60`はデフォルト60秒の`TimeAttack`です。`edu:timerwarning`でタイマーの警告クラスと`warning`を接続し、`edu:timeup`後に結果を表示します。

### 3. バッジ付き教材

| 資産 | 選ぶもの |
| --- | --- |
| `edu-components` | `AchievementManager`、`BadgeManager`、`StorageManager` |
| `edu-assets` | Badge Labで確認した実在画像URL |
| `edu-effects` | `.effect-badge-unlock`、特別な獲得だけ`EduEffects.confetti()` |
| `sounds-recipe-` | `badge`、特別なバッジなら`rareBadge`、達成なら`mission` |

条件判定は教材側で行い、`AchievementManager`へ通知します。必要なら`edu:achievement`を受けて`BadgeManager.award()`を呼び、`edu:badge`で画像・演出・音をまとめて表示します。

### 4. レベル制教材

| 資産 | 選ぶもの |
| --- | --- |
| `edu-components` | `ProgressManager`、`LevelManager`、`UnlockManager`、`StorageManager` |
| `edu-effects` | `.edu-progress`、`.edu-level-card`、`.effect-level-up`、`.effect-unlock` |
| `sounds-recipe-` | `levelup`、`unlock` |
| `edu-assets` | レベル報酬が必要なら、確認済みのエレメントやバッジ画像 |

`edu:progress`で進捗表示を更新し、教材側の条件を満たしたら`level.up()`や`unlock.unlock(id)`を呼びます。レベルが上がった場合だけ`levelup`を鳴らし、`edu:unlock`で解放表示と`unlock`を接続します。

## 保存のルール

教材ごとに固有のnamespaceを指定します。

```js
import { StorageManager } from 'https://tt-sensei.github.io/edu-components/index.js';

const storage = new StorageManager('dictionary-master');
storage.save('bestScore', 120);
const best = storage.load('bestScore', 0);
```

内部キーは`edu:<namespace>:<key>`です。`localStorage.clear()`は使いません。進捗、レベル、解放、達成、バッジは必要に応じて同じ教材namespaceの`StorageManager`を渡します。

## 問題データのルール

教材固有の問題データは教材側に置きます。共通リポジトリへ特定単元の大量データを入れません。

```js
const questions = [{
  id: 'q1',
  type: 'choice',
  question: '日本の首都は？',
  choices: ['東京', '大阪', '京都', '札幌'],
  answer: '東京',
  category: '社会',
  level: 1,
  explanation: '日本の首都は東京です。'
}];
```

## AI向け重要ルール

- 同じ機能を教材側で再実装する前に4リポジトリを確認する。
- 存在しないJavaScript API、イベント名、CSSクラス、サウンドIDを推測しない。
- `sounds-recipe-`を音声ファイル集として扱わず、`sounds.js`の実在レシピを確認する。
- `edu-assets`の画像URLを推測せず、実際のファイル構造またはBadge Labで確認する。
- `edu-components`本体と`edu-effects`本体を教材ごとに改造しない。
- 4つすべてを機械的に読み込まず、教材に必要なファイルと部品だけを選ぶ。
- 教材固有の問題データ、文言、達成条件、画面接続は教材側に置く。
- ManagerへDOM、CSS演出、音、画像表示を混在させない。
- AchievementとBadge、ProgressとLevel、LevelとUnlockを同じ状態として扱わない。
- 4リポジトリを巨大な1リポジトリへ統合しない。
- 外部API、外部DB、APIキー、外部フォントを安易に追加しない。
- タブレットで押しやすい大きさを確保し、ドラッグや長押しだけを必須操作にしない。
- 正誤を色だけで伝えず、文字や記号を併用する。
- 強い演出は達成・解放など意味のある場面に限定し、`prefers-reduced-motion`へ配慮する。

## 最終確認

教材を完成扱いにする前に、次を再確認します。

- importしたコンポーネントが`edu-components/index.js`からexportされている。
- 使用イベントが`js/core/events.js`に定義されている。
- CSSファイルとクラスが`edu-effects/css/`に存在する。
- サウンドIDが`sounds-recipe-/sounds.js`に存在する。
- 画像URLが`edu-assets`の公開URLで実際に開く。
- Pagesの大文字小文字、ハイフン、末尾`/`が正しい。
- 未使用のCSS、音、画像、Managerを読み込んでいない。

