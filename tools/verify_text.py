#!/usr/bin/env python3
"""表示テキストが変わっていないかを git の別バージョンと比べる（一括置換のあとの安全確認用）

  python3 tools/verify_text.py main          # main ブランチと今の作業ツリーを比較
  python3 tools/verify_text.py HEAD~1

各 HTML の「画面に出る文字」（本文テキスト・ボタンの value・<title>）を取り出し、
空白の違いを無視して比較します。スクリプト・スタイル・コメントは対象外。
"""
import os, re, sys, subprocess
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip += 1
        a = dict(attrs)
        if tag == 'input' and (a.get('type') or '').lower() in ('button', 'submit') and a.get('value'):
            self.out.append(a['value'])
        if tag == 'img' and a.get('alt'):
            self.out.append(a['alt'])
    def handle_endtag(self, tag):
        if tag in ('script', 'style') and self.skip:
            self.skip -= 1
    def handle_data(self, d):
        if not self.skip:
            self.out.append(d)


def text_of(b):
    s = b.decode('utf-8', 'replace').lstrip('\ufeff')
    p = Text(); p.feed(s); p.close()
    return re.sub(r'[\s\u3000\u00a0]+', ' ', ' '.join(p.out)).strip()


def main():
    ref = sys.argv[1] if len(sys.argv) > 1 else 'main'
    files = subprocess.run(['git', 'ls-tree', '-r', '--name-only', ref], cwd=ROOT, capture_output=True, text=True, check=True).stdout.split('\n')
    files = [f for f in files if f.endswith('.html')]
    same = diff = removed = 0
    for f in files:
        p = os.path.join(ROOT, f)
        if not os.path.exists(p):
            removed += 1
            continue
        old = subprocess.run(['git', 'show', '%s:%s' % (ref, f)], cwd=ROOT, capture_output=True, check=True).stdout
        a, b = text_of(old), text_of(open(p, 'rb').read())
        if a == b:
            same += 1
        else:
            diff += 1
            i = next((k for k in range(min(len(a), len(b))) if a[k] != b[k]), min(len(a), len(b)))
            print('DIFF', f, '| 旧:', a[max(0, i - 20):i + 40], '| 新:', b[max(0, i - 20):i + 40], sep='\t')
    print('HTML %d 件: 同一 %d, 相違 %d, 削除 %d' % (len(files), same, diff, removed))
    sys.exit(1 if diff else 0)


if __name__ == '__main__':
    main()
