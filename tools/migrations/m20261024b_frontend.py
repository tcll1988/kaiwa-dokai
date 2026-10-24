#!/usr/bin/env python3
"""2026-10-24 追加移行（フロントエンドレビュー反映）。m20261024_shared_js.py の後に実行。
  - <html> に lang="ja"
  - 宿題メニュー（*-l.html）の「問題」リンクから target="_blank" を外す（同じタブで開く）
  - 答えデータ Nk-a.js にキャッシュ対策の ?v= を付ける、lessons.js の ?v= を更新（sets 追加のため）
文字コード・改行コードはそのまま保つ（newline=''）。何度実行しても同じ結果。
"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VER = '20261024'
stats = {'lang': 0, 'blank': 0, 'ajs': 0, 'files': 0}
for site in ('kaiwa', 'dokai', '.'):
    base = os.path.join(ROOT, site)
    walker = os.walk(base) if site != '.' else [(base, [], [f for f in os.listdir(base) if f.endswith('.html')])]
    for dp, dn, fn in walker:
        for f in fn:
            if not f.endswith('.html'):
                continue
            p = os.path.join(dp, f)
            raw = open(p, 'rb').read()
            enc = 'utf-8-sig' if raw.startswith(b'\xef\xbb\xbf') else 'utf-8'
            with open(p, encoding=enc, newline='') as fh:
                s = fh.read()
            o = s
            s, n = re.subn(r'<html xmlns="http://www.w3.org/1999/xhtml">', '<html xmlns="http://www.w3.org/1999/xhtml" lang="ja">', s, count=1)
            stats['lang'] += n
            if f.endswith('-l.html'):
                s, n = re.subn(r'(<a href="\d+k-l\d*-1\.html") target="_blank">', r'\1>', s)
                stats['blank'] += n
            s, n = re.subn(r'(<script type="text/javascript" src="\d+k-a\.js)(")', r'\1?v=' + VER + r'\2', s)
            stats['ajs'] += n
            s, n = re.subn(r'lessons\.js\?v=20261023', 'lessons.js?v=' + VER, s)
            stats['lessons'] = stats.get('lessons', 0) + n
            if s != o:
                stats['files'] += 1
                with open(p, 'w', encoding=enc, newline='') as fh:
                    fh.write(s)
print(stats)
