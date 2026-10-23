#!/usr/bin/env python3
"""リンク・音声・共通JSの参照チェック（標準ライブラリのみ。数秒で終わります）

  python3 tools/linkcheck.py                 # kaiwa と dokai の両方
  python3 tools/linkcheck.py kaiwa           # 片方だけ
  python3 tools/linkcheck.py --strict        # 新しいエラーがあれば終了コード 1（CI 用）

調べる内容
  - href / src / window.location.href / window.open の行き先ファイルがあるか
  - 本文・単語の各行 id（例 9k-h-3_ch）に対応する sound/9k-h-3.mp3 があるか
  - 聞き取り問題の doFilePlay('xxx.mp3') の音声があるか
  - fileStart / doFilePlay を使うページが player.js を、doRight を使うページが quiz.js を読み込んでいるか
  - どこからも使われていない mp3（孤立音声）

tools/known_missing.txt に書いたもの（OneDrive のダウンロード失敗で手元に無いファイル等）は
「既知」として別枠で表示し、--strict でもエラーにしません。
"""
import os, re, sys, html, json
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
STRICT = '--strict' in sys.argv
SITES = args or ['kaiwa', 'dokai']

ATTR = re.compile(r'''\b(?:href|src)\s*=\s*["']([^"']+)["']''', re.I)
JSNAV = re.compile(r'''window\.(?:location\.href\s*=\s*|open\(\s*)['"]([^'"]+)['"]''')
PLAYID = re.compile(r'''<[a-z]+\b[^>]*\bid\s*=\s*["']([^"'_]+)_(?:ch|py|jp)["'][^>]*onclick\s*=\s*["']fileStart''', re.I)
PLAYID2 = re.compile(r'''<[a-z]+\b[^>]*onclick\s*=\s*["']fileStart[^>]*\bid\s*=\s*["']([^"'_]+)_(?:ch|py|jp)["']''', re.I)
FILEPLAY = re.compile(r'''doFilePlay\(\s*['"]([^'"]+)['"]\s*\)''')
PLAYLIST = re.compile(r'''data-playlist\s*=\s*["']([^"']+)["']''')


def load_known():
    p = os.path.join(ROOT, 'tools', 'known_missing.txt')
    if not os.path.exists(p):
        return set()
    return {l.strip() for l in open(p, encoding='utf-8') if l.strip() and not l.startswith('#')}


def main():
    known = load_known()
    existing = set()
    for site in SITES:
        for dp, dn, fn in os.walk(os.path.join(ROOT, site)):
            for f in fn:
                existing.add(os.path.normpath(os.path.join(dp, f)))
    errors, known_hits, audio_used = [], [], set()
    pages = refs = 0

    def chk(page, target, kind):
        nonlocal refs
        t = target.split('#')[0].split('?')[0]
        if not t or re.match(r'^(https?:|mailto:|javascript:|data:|tel:)', t):
            return
        p = os.path.normpath(os.path.join(os.path.dirname(page), unquote(html.unescape(t))))
        refs += 1
        if kind == 'audio':
            audio_used.add(p)
        if p not in existing:
            key = '%s\t%s' % (os.path.relpath(page, ROOT), target)
            (known_hits if key in known else errors).append((os.path.relpath(page, ROOT), target, kind))

    for site in SITES:
        for dp, dn, fn in os.walk(os.path.join(ROOT, site)):
            for f in sorted(fn):
                if not f.endswith(('.html', '.htm')):
                    continue
                page = os.path.join(dp, f)
                pages += 1
                s = open(page, encoding='utf-8', errors='replace').read()
                s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
                for m in ATTR.finditer(s):
                    chk(page, m.group(1), 'link')
                for m in JSNAV.finditer(s):
                    chk(page, m.group(1), 'link(js)')
                ids = set(PLAYID.findall(s)) | set(PLAYID2.findall(s))
                for i in ids:
                    chk(page, 'sound/' + i + '.mp3', 'audio')
                for m in FILEPLAY.finditer(s):
                    chk(page, 'sound/' + m.group(1), 'audio')
                for m in PLAYLIST.finditer(s):
                    for i in m.group(1).replace(',', ' ').split():
                        chk(page, 'sound/' + i + '.mp3', 'audio')
                rel = os.path.relpath(page, ROOT)
                if ('fileStart(' in s or 'doFilePlay(' in s) and 'assets/js/player.js' not in s:
                    errors.append((rel, 'assets/js/player.js', '共通JS未読込'))
                if 'doRight(' in s and 'assets/js/quiz.js' not in s:
                    errors.append((rel, 'assets/js/quiz.js', '共通JS未読込'))
                if re.search(r'<script(?![^>]*\bsrc=)[^>]*>\s*[^<\s]', s) and re.search(r'function\s+(fileStart|doRight|playAllRadioList)\b', s):
                    errors.append((rel, '(inline)', '旧コピーのスクリプトが残っています'))

    mp3 = {e for e in existing if e.endswith('.mp3')}
    orphan = sorted(os.path.relpath(x, ROOT) for x in mp3 - audio_used)
    orphan_known = [o for o in orphan if ('ORPHAN\t' + o) in known]
    orphan_new = [o for o in orphan if ('ORPHAN\t' + o) not in known]

    print(json.dumps({'sites': SITES, 'pages': pages, 'refs': refs, 'errors': len(errors),
                      'known_missing': len(known_hits), 'mp3': len(mp3), 'orphan_mp3': len(orphan),
                      'orphan_mp3_known': len(orphan_known)}, ensure_ascii=False))
    for e in errors:
        print('ERROR', *e, sep='\t')
    for o in orphan_new:
        print('ORPHAN', o, sep='\t')
    if '--verbose' in sys.argv:
        for e in known_hits:
            print('KNOWN', *e, sep='\t')
        for o in orphan_known:
            print('KNOWN-ORPHAN', o, sep='\t')
    if STRICT and (errors or orphan_new):
        sys.exit(1)


if __name__ == '__main__':
    main()
