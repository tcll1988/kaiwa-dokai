# 初級中国語 宿題サイト（会話・読解）

愛知淑徳大学 初級中国語の宿題用静的サイト。GitHub Pages（main 分支）直接公开：

- 入口：<https://tcll1988.github.io/kaiwa-dokai/>
- 会話：`kaiwa/k1.html`　読解：`dokai/d1.html`

不需要构建（build），也不依赖任何框架。改完 HTML／JS 推到 main，几分钟后网页自动更新。

---

## 1. 目录结构

```
index.html                 入口（会話 / 読解 二选一）
kaiwa/  dokai/             两个站点，结构完全相同
  k1.html / d1.html        课程一览（第1〜14課）
  Nk/Nk.html               课的入口（本文・単語・文法・宿題 4 张卡片）
  Nk/N.xlsx                宿題提出用 Excel
  Nk/homework/kaiwa|dokai/ 该课的所有页面
      Nk-h-1.html …        本文（会話・本文を聞く）
      Nk-t1-1.html / Nk-t.html  単語
      Nk-p.html, Nk-1p.html …   文法ポイント
      Nk-l.html            宿題メニュー（問題1〜6）
      Nk-l1-1.html …       練習問題（1 页 1 小问为主）
      Nk-l-o.html          完成页（宿題提出）
      Nk-a.js              答案数据
      sound/*.mp3          音频
      images/              插图
  assets/js/player.js      ★ 共通：音频播放（本文・単語・聴き取り）
  assets/js/quiz.js        ★ 共通：练习题判分
  assets/ui/ui.css, ui.js  ★ 共通：外观（手机适配、卡片、按钮）
  assets/ui/lessons.js     课名一览 + 问题集信息（每个站点各一份）
tools/                     检查・维护脚本（Python 3，无需额外安装）
docs/content_fixes_for_teacher.md  给老师的内容修改清单（内容问题，代码没改）
docs/archive/dokai_dokai_xlsx/     旧副本 dokai/dokai/ 的 6 个 xlsx（保存用，页面不引用）
.github/workflows/check.yml  每次 push 自动检查（不影响网页发布）
```

**xlsx（宿題提出用 Excel）**：正式目录里共 **28 个**（`kaiwa/Nk/homework/N.xlsx` 14 个 + `dokai/Nk/homework/N.xlsx` 14 个，第1〜14課），
页面上的链接只指向这 28 个。原来 main 里还有一个没被任何页面引用的旧副本目录 `dokai/dokai/`，其中 8〜13 課的 6 个 xlsx
**没有删掉，而是原样移到了** `docs/archive/dokai_dokai_xlsx/`（git 记录为 R100 改名，内容 100% 相同；
和正式版只差 OneDrive 自动写入的 GUID 元数据，详见该目录的 README）。老师确认不需要后可以删除该目录。

`kaiwa/assets/js`・`kaiwa/assets/ui/ui.css`・`ui.js` 是原本，`dokai` 下是副本。
**只改 kaiwa 那份，然后运行** `python3 tools/sync_assets.py` 复制到 dokai。

改了共通 JS/CSS 后，请把页面里的 `?v=20261024` 改成新的日期（防止学生手机读旧缓存）。

---

## 2. HTML 的写法约定

页面基本保持原来的 HTML，只有末尾加载共通脚本：

```html
<!-- kd-js:start -->
<script src="../../../assets/js/player.js?v=20261024"></script>   <!-- 本文・単語・聴き取り页 -->
<script src="../../../assets/js/quiz.js?v=20261024"></script>     <!-- 练习题页 -->
<!-- kd-js:end -->
<!-- ui-skin:start -->
<script src="../../../assets/ui/lessons.js?v=20261024"></script>
<script src="../../../assets/ui/ui.js?v=20261024"></script>
<!-- ui-skin:end -->
```

页面内**不要再写** `fileStart` / `doRight` 等函数（共通 JS 里已有，`tools/linkcheck.py` 会报错）。

### 2.1 本文・単語页（音频）

| 写法 | 作用 |
|---|---|
| `<lable id="9k-h-3_ch" onclick="fileStart(this.id)">` | 点一句播放 `sound/9k-h-3.mp3`（id 的 `_` 前面 = 文件名） |
| `_ch` / `_py` / `_jp` | 中文 / 拼音 / 日语 行。播放中三行一起高亮 |
| `<tr id="td_ch_3">`（本文）、`<td id="td_ch">`（単語） | 「表示選択」切换显示的单位 |
| `<select id="language_1" onchange="setViewItem(this.value)">` | 表示選択（chinese / japanese / pinyin / everything），会记住选择 |
| `<input type="button" value="全文朗読" onclick="playAllRadioList(3)">` | 从上到下按顺序全部播放（行数自动计算）；播放中按钮变「停止」 |
| `<input type="button" value="終了" onclick="myrefresh()">` | 停止 |

全文朗读的顺序 = 页面里 `id$="_ch"` 句子的出现顺序。想改顺序时在按钮上加
`data-playlist="9k-h-1 9k-h-3 9k-h-2"`。音频找不到时显示「音声を読み込めませんでした」并跳到下一句。

最小模板（本文）：

```html
<table id="title" align="center"><tr>
  <td><lable>表示選択</lable></td>
  <td><select id="language_1" onchange="setViewItem(this.value)">
    <option value="chinese" selected>中国語</option><option value="japanese">中国語+日本語</option>
    <option value="pinyin">中国語+ピンイン</option><option value="everything">全部</option></select></td>
  <td><input type="button" value="全文朗読" onclick="playAllRadioList(3)"/></td>
  <td><input type="button" value="終了" onclick="myrefresh()"/></td>
  <td><a href="../../9k.html">戻る</a></td>
</tr></table>
<table align="center">
  <tr id="td_ch_1"><td><lable id="9k-h-1_ch" onclick="fileStart(this.id)">A:山田，你在干什么呢？</lable></td></tr>
  <tr id="td_py_1" style="display:none"><td><lable id="9k-h-1_py" onclick="fileStart(this.id)">Shāntián, nǐ zài gàn shénme ne?</lable></td></tr>
  <tr id="td_jp_1" style="display:none"><td><lable id="9k-h-1_jp" onclick="fileStart(this.id)">（日本語訳）</lable></td></tr>
</table>
<audio id="audiolocal"></audio>
```

### 2.2 练习题页

```html
<script type="text/javascript" src="9k-a.js?v=20261024"></script>   <!-- 答案 -->
…
<select id="1_3"> <option value="0" selected>&nbsp;</option> <option value="A">A</option> … </select>
<label id="1_3_R"></label>
<input type="button" value="確認" onclick="doRight(1,3)">
```

- `doRight(大問, 小問)`：答题栏 `id="大問_小問"`，结果栏 `id="大問_小問_R"`。
- 一题多个空：`id="4_2_1"`, `id="4_2_2"` …，答案写成 `"2#B@原文"`（`@` 分隔）。每个空分别显示 〇/× 的框色。
- 听力题的「再生」按钮：`onclick="doFilePlay('3k-l5-5.mp3')"`（播放 `sound/3k-l5-5.mp3`）。

**答案数据 `Nk-a.js`**：

```js
var answerFirstArr  = ["1#A","2#D","3#C"];          // 大問題1："小問#答案"
var answerFourthArr = ["1#B@咱们一起去打网球，好不好？"]; // 多个空用 @ 分隔
var answerArray = [answerFirstArr, answerSecondArr, …]; // 第 n 个 = 大問題 n
```

**判分规则**（`assets/js/quiz.js` 开头可调整）：

| 设置 | 默认 | 含义 |
|---|---|---|
| `SHOW_ANSWER_AFTER` | `2` | 第 1 次答错显示「×　もう一度」，第 2 次才显示正确答案。改成 `1` = 原来的立即显示 |
| `LENIENT_TEXT` | `true` | 填空题忽略空格（含全角）、全角/半角、标点、英文大小写。`false` = 完全一致 |

- **数字式拼音**（答案如 `ha3o`、`le3ngre4`）：只比较字母和声调数字的顺序，`ha3o` = `hao3` = `hǎo` 都算对；这类输入框显示「例：ba4」。
- **翻译题**（题目里有「〜に訳しなさい」，答案是日语句子或中文译文）：说法不止一种，所以不判 ×。
  对不上时显示「模範解答」，学生自己对照后可按「〇をつける」；另有「模範解答を見る」按钮。
- 输入框自动关闭手机的首字母大写・自动更正・联想（autocapitalize/autocorrect/spellcheck/autocomplete=off）。

未作答时显示「未回答です」（不计入次数）。答对的小问记录在学生自己的手机/浏览器里（localStorage），
宿題メニュー显示「3/5」，问题页上方显示「問題1（2/5）」和进度条。不会上传到任何地方。

> 注意：这是静态网站，`Nk-a.js` 的答案任何人都能看到，无法真正隐藏。

---

## 3. 添加新的一课

```bash
python3 tools/new_lesson.py kaiwa 14k 15k --title "第15課 ○○○"
```

以第14課为模板复制出 `15k/`（不复制 mp3・xlsx），把文件名和内容里的 `14k`→`15k`、`第14課`→`第15課` 改好，
建立空的 `sound/` 文件夹，把课名加到 `lessons.js`，更新问题集信息，最后跑一次 linkcheck
（缺少的 mp3 = 接下来要放的音频）。之后：

1. 改写本文・単語・問題的文字和 `15k-a.js` 的答案
2. 把音频放进 `sound/`（文件名 = 句子 id 的 `_` 前面部分）
3. 在 `kaiwa/k1.html` 加上 `15k/15k.html` 的链接
4. 跑下面的检查，全部 0 错误再 push

增减了练习题页面时运行 `python3 tools/gen_sets.py`（更新进度显示用的题数）。

---

## 4. 检查工具

| 命令 | 检查内容 |
|---|---|
| `python3 tools/linkcheck.py --strict` | 链接・图片・音频是否存在，句子 id → mp3，页面是否加载共通 JS，有没有残留旧的内联代码，没被用到的 mp3 |
| `python3 tools/navcheck.py --strict` | 前へ／次へ 是否互相对应、有没有跳到别的课 |
| `python3 tools/quizcheck.py --strict` | 每个「確認」：答案存在、答题栏・结果栏存在、空的个数=答案个数、选择题答案在选项里 |
| `python3 tools/gen_sets.py --check` | 进度显示用的题数是否最新 |
| `python3 tools/sync_assets.py --check` | kaiwa 和 dokai 的共通文件是否一致 |
| `python3 tools/verify_text.py main` | 和 main 比较，所有页面「看得见的文字」有没有变化（改代码时确认没动到内容） |
| `python3 tools/browser_test.py` | （可选，需要 Playwright）用浏览器打开全部页面：JS 错误、全文朗读顺序、判分、375px 手机宽度 |

`tools/known_missing.txt`：已知缺失的文件（OneDrive 下载失败等）。列在这里的不算错误；补上文件后把那一行删掉。

push 后 GitHub 的「Actions」页会自动跑前 5 项检查（`.github/workflows/check.yml`）。
检查失败也**不会**阻止网页发布，只是提醒。

`tools/migrations/` 是 2026-10 大整理时用过的一次性脚本和修正记录（`m20261024_fixes.json`），平时不用。
