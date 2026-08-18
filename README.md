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
| edu-components | 画面切り替え、問題管理、正誤判定、得点、コンボなどのJavaScript処理 |

## デモ

[GitHub Pagesでカタログを見る](https://tt-sensei.github.io/edu-components/)

`index.html` は説明だけでなく、5つのコンポーネントを実際に操作できるデモです。イベントログでは、コンポーネント間の疎結合な連携も確認できます。

## 導入方法

ファイルを教材にコピーして、ES Modulesとして読み込みます。

```html
<script type="module">
  import { QuestionPool, AnswerChecker } from './index.js';
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

```js
document.addEventListener('edu:correct', (event) => {
  // edu-effects、sounds-recipe、将来のBadgeManagerなどと連携
  console.log(event.detail);
});
```

## 今後追加予定

タイマー、StorageManager、BadgeManager、進捗管理、出題履歴の保存、アクセシビリティ補助などを予定しています。まずは今回の5部品を共通基盤として安定させます。
