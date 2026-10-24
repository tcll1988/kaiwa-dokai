#!/usr/bin/env python3
"""「前へ」「次へ」「戻る」の整合性チェック

  python3 tools/navcheck.py [kaiwa|dokai] [--strict]

  - A の「次へ」が B なのに、B の「前へ」が A を指していない
  - 第N課のページが別の課（例 12k-…）のページを指している
"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
SITES = args or ['kaiwa', 'dokai']
NAV = re.compile(r'<a\s[^>]*href="([^"]+)"[^>]*>\s*(?:<[^>]+>\s*)*(前へ|次へ|戻る)')
nav = {}
for site in SITES:
    for dp, dn, fn in os.walk(os.path.join(ROOT, site)):
        for f in fn:
            if f.endswith('.html'):
                p = os.path.normpath(os.path.join(dp, f))
                s = re.sub(r'<!--.*?-->', '', open(p, encoding='utf-8', errors='replace').read(), flags=re.S)
                d = {}
                for m in NAV.finditer(s):
                    d.setdefault(m.group(2), []).append(m.group(1))
                nav[p] = d
issues = set()
for p, d in nav.items():
    rp = os.path.relpath(p, ROOT)
    for nxt in d.get('次へ', []):
        q = os.path.normpath(os.path.join(os.path.dirname(p), nxt))
        if q in nav and '前へ' in nav[q]:
            back = [os.path.normpath(os.path.join(os.path.dirname(q), b)) for b in nav[q]['前へ']]
            if p not in back:
                issues.add('%s 次へ→%s だが、相手の 前へ→%s' % (rp, nxt, nav[q]['前へ']))
    m = re.match(r'(\d+k)-', os.path.basename(p))
    if m:
        for k, v in d.items():
            for t in v:
                mm = re.match(r'(\d+k)[-.]', os.path.basename(t))
                if mm and mm.group(1) != m.group(1):
                    issues.add('%s %s→%s（別の課を指している）' % (rp, k, t))
print('pages %d, nav issues %d' % (len(nav), len(issues)))
for i in sorted(issues):
    print('NAV', i, sep='\t')
if '--strict' in sys.argv and issues:
    sys.exit(1)
