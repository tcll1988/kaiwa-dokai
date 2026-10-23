#!/usr/bin/env python3
"""新しい課のひな形を作る（既存の課をコピーして番号を自動で付け替える）

  python3 tools/new_lesson.py kaiwa 14 15 --title "第15課 ○○○"
  python3 tools/new_lesson.py dokai 14 15 --title "第15課 ○○○" --dry

やること
  1. <site>/14k/ を <site>/15k/ にコピー（sound/*.mp3 と Excel は除く＝新しい課の音声を入れる）
  2. ファイル名・ページ内の「14k」「d1-14k」「../14.xlsx」などを 15 に付け替え
     （古い番号の残り＝これまでのリンク切れの主な原因、を機械的に防ぐ）
  3. assets/ui/lessons.js に課名を追加し、tools/gen_sets.py で問題セット情報を更新
  4. 最後に linkcheck を実行 → 「まだ無い音声ファイル」の一覧がそのまま作業リストになる

やらないこと（手作業）
  - 本文・単語・問題・答え（15k-a.js）の書き換え
  - sound/ に 15k-h-1.mp3 … を入れる
  - コース一覧（kaiwa/k1.html / dokai/d1.html）に「第15課」へのリンクを 1 行足す
"""
import os, re, sys, json, shutil, argparse, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('site', choices=['kaiwa', 'dokai'])
ap.add_argument('src', type=int, help='コピー元の課番号')
ap.add_argument('dst', type=int, help='新しい課番号')
ap.add_argument('--title', default='', help='課名（例: 第15課 我们去旅行吧）')
ap.add_argument('--dry', action='store_true')
a = ap.parse_args()

S, D = a.src, a.dst
src = os.path.join(ROOT, a.site, '%dk' % S)
dst = os.path.join(ROOT, a.site, '%dk' % D)
if not os.path.isdir(src):
    sys.exit('コピー元がありません: %s' % src)
if os.path.exists(dst):
    sys.exit('すでにあります: %s' % dst)

TOKEN = re.compile(r'(?<![0-9])%dk(?=[-./_"\'\s)]|$)' % S)
XLSX = re.compile(r'(?<![0-9])%d\.xlsx' % S)
TITLE = re.compile(r'第\s*%d\s*課' % S)


def renum(text):
    text = TOKEN.sub('%dk' % D, text)
    text = XLSX.sub('%d.xlsx' % D, text)
    text = TITLE.sub('第%d課' % D, text)
    return text


made = 0
for dp, dn, fn in os.walk(src):
    for f in fn:
        sp = os.path.join(dp, f)
        rel = os.path.relpath(sp, src)
        if f.endswith(('.mp3', '.xlsx')) or f.startswith('.'):
            continue
        dp2 = os.path.join(dst, renum(rel))
        made += 1
        if a.dry:
            print('create', os.path.relpath(dp2, ROOT))
            continue
        os.makedirs(os.path.dirname(dp2), exist_ok=True)
        if f.endswith(('.html', '.js', '.css', '.txt')):
            s = open(sp, encoding='utf-8', newline='').read()
            open(dp2, 'w', encoding='utf-8', newline='').write(renum(s))
        else:
            shutil.copy2(sp, dp2)
for dp, dn, fn in os.walk(src):
    if os.path.basename(dp) == 'sound' and not a.dry:
        os.makedirs(os.path.join(dst, renum(os.path.relpath(dp, src))), exist_ok=True)

lj = os.path.join(ROOT, a.site, 'assets', 'ui', 'lessons.js')
if not a.dry and os.path.exists(lj):
    s = open(lj, encoding='utf-8').read()
    data = json.loads(s[s.index('=') + 1:].strip().rstrip(';'))
    data['titles'][str(D)] = a.title or '第%d課' % D
    open(lj, 'w', encoding='utf-8').write('window.UI_LESSONS=' + json.dumps(data, ensure_ascii=False) + ';\n')

if not a.dry:
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'gen_sets.py')])

print('%d ファイルを作成しました（%s → %s）' % (made, os.path.relpath(src, ROOT), os.path.relpath(dst, ROOT)))
print('次の作業: 本文・単語・問題・%dk-a.js を書き換え、sound/ に音声を入れ、%s にリンクを追加'
      % (D, 'kaiwa/k1.html' if a.site == 'kaiwa' else 'dokai/d1.html'))
if not a.dry:
    print('--- linkcheck（MISSING の音声＝これから用意するファイル） ---')
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'linkcheck.py'), a.site])
