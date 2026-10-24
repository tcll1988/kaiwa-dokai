# m20261024c — QA 报告（main fd70462）对应的代码/接线修正

只改 id、路径、HTML 标签，不改任何中文/拼音/日文文字。

| 文件 | 修改 | 理由 |
|---|---|---|
| dokai/2k/homework/dokai/2k-t1-3.html | 日文 lable id `d1-2k-t-10_jp`…`15_jp` → `d1-2k-t-19_jp`…`24_jp` | 与同列中文/拼音 id 对齐，点日文播放同一词 |
| dokai/6k/homework/dokai/6k-h-1.html | 第4句日文 id `d1-6k-h-5_jp`（重复）→ `d1-6k-h-4_jp` | 与第4句中文/拼音对齐 |
| kaiwa/k1.html、dokai/d1.html | `images/13.png`、`images/14.png` → `1k/homework/<site>/images/13.png`、`14.png` | 首页图片 404；28 个课内 images/ 目录里的 13/14.png md5 完全相同 |
| kaiwa/8k/homework/kaiwa/8k-t1-2.html | `</font>/lable>` → `</font></lable>` | 标签缺 `<`，「/lable>」显示在页面上 |
| dokai/12k/homework/dokai/12k-3p.html | ` /font>` → ` </font>` | 同上，「/font>」显示在页面上 |
| tools/known_missing.txt | 删除 13.png/14.png 四行 | 已修好 |

检查脚本：/workspace 下 idalign（同一页 _ch/_py/_jp id 顺序比对）复检 0 处不一致。
