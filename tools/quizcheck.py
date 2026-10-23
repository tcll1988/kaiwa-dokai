#!/usr/bin/env python3
"""練習問題の答えデータ（Nk-a.js）と解答欄の対応チェック

  python3 tools/quizcheck.py [kaiwa|dokai] [--strict]

  doRight(大問,小問) ごとに：答えが Nk-a.js にあるか / 解答欄 id="大問_小問"（複数なら _1,_2…）
  があるか / 結果欄 id="大問_小問_R" があるか / 解答欄の数と答え（@区切り）の数が合うか
  さらに選択式の答えが選択肢に存在するか
"""
import os, re, sys, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
SITES = args or ['kaiwa', 'dokai']


def load_answers(js):
    s = open(js, encoding='utf-8', errors='replace').read()
    s = re.sub(r'(?m)^\s*//.*$', '', s)
    arrs = {m.group(1): re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(2))
            for m in re.finditer(r'var\s+(\w+)\s*=\s*\[([^\]]*)\]', s)}
    m = re.search(r'var\s+answerArray\s*=\s*\[([^\]]*)\]', s)
    return [arrs.get(n.strip()) for n in m.group(1).split(',') if n.strip()] if m else []


calls = 0; probs = []; shapes = collections.Counter()
for site in SITES:
    for dp, dn, fn in os.walk(os.path.join(ROOT, site)):
        for f in sorted(fn):
            if not f.endswith('.html'):
                continue
            p = os.path.join(dp, f); rel = os.path.relpath(p, ROOT)
            s = re.sub(r'<!--.*?-->', '', open(p, encoding='utf-8', errors='replace').read(), flags=re.S)
            cs = re.findall(r'doRight\(\s*(\d+)\s*,\s*(\d+)\s*\)', s)
            if not cs:
                continue
            m = re.search(r'src="([^"?]*-a\.js)(?:\?[^"]*)?"', s)
            if not m or not os.path.exists(os.path.join(dp, m.group(1))):
                probs.append((rel, '-', '答えファイル（Nk-a.js）が読み込まれていない/無い')); continue
            A = load_answers(os.path.join(dp, m.group(1)))
            ids = set(re.findall(r'\bid\s*=\s*"([^"]+)"', s))
            for a, b in cs:
                calls += 1
                q = '%s_%s' % (a, b)
                if q in ids:
                    fields = [q]
                else:
                    k = 1; fields = []
                    while '%s_%d' % (q, k) in ids:
                        fields.append('%s_%d' % (q, k)); k += 1
                lst = A[int(a) - 1] if int(a) - 1 < len(A) else None
                ans = None
                for x in (lst or []):
                    pp = x.split('#')
                    if len(pp) >= 2 and pp[0] == b:
                        ans = pp[1]; break
                if ans is None:
                    probs.append((rel, q, 'Nk-a.js に答えが無い')); continue
                if not fields:
                    probs.append((rel, q, '解答欄が無い')); continue
                if q + '_R' not in ids:
                    probs.append((rel, q, '結果欄 %s_R が無い' % q))
                parts = ans.split('@') if len(fields) > 1 else [ans]
                if len(parts) < len(fields):
                    probs.append((rel, q, '解答欄%d個に対して答えが%d個' % (len(fields), len(parts))))
                shapes[len(fields)] += 1
                for fid, part in zip(fields, parts):
                    sm = re.search(r'<select\b[^>]*\bid="%s"[^>]*>(.*?)</select>' % re.escape(fid), s, re.S)
                    if sm:
                        opts = [o.strip() for o in re.findall(r'value="([^"]*)"', sm.group(1))]
                        if part.strip() not in opts:
                            probs.append((rel, q, '答え「%s」が選択肢 %s に無い' % (part, opts)))
print('doRight %d 問（解答欄の数: %s）, 問題 %d 件' % (calls, dict(shapes), len(probs)))
for x in probs:
    print('QUIZ', *x, sep='\t')
if '--strict' in sys.argv and probs:
    sys.exit(1)
