#!/usr/bin/env python3
"""練習問題の「セット」情報を assets/ui/lessons.js の "sets" に書き込む（進み具合の表示用）

  python3 tools/gen_sets.py          # 書き込み
  python3 tools/gen_sets.py --check  # 最新かどうかだけ確認（違えば終了コード 1）

宿題メニューの「問題1」= 9k-l1-1.html〜9k-l1-5.html のような 1 セット。
  "sets": {"9k-l1": [5, 5]}  … [ページ数, 確認ボタン（小問）の数]
ui.js がこれを使って、宿題メニューに「✓ 3/5」、問題ページに「問題1（2/5）」を表示する。
問題ページを足したり消したりしたら、このスクリプトを実行してください（CI でもチェック）。
"""
import os, re, sys, json, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
check = '--check' in sys.argv
bad = 0
for site in ('kaiwa', 'dokai'):
    sets = collections.defaultdict(lambda: [0, 0])
    for dp, dn, fn in os.walk(os.path.join(ROOT, site)):
        for f in fn:
            m = re.match(r'(\d+k-l\d*)-(\d+)\.html$', f)
            if not m:
                continue
            s = re.sub(r'<!--.*?-->', '', open(os.path.join(dp, f), encoding='utf-8', errors='replace').read(), flags=re.S)
            n = len(re.findall(r'doRight\(\s*\d+\s*,\s*\d+\s*\)', s))
            if not n:
                continue
            sets[m.group(1)][0] += 1
            sets[m.group(1)][1] += n
    key = lambda k: (int(k.split('k')[0]), k)
    data = {k: sets[k] for k in sorted(sets, key=key)}
    p = os.path.join(ROOT, site, 'assets', 'ui', 'lessons.js')
    src = open(p, encoding='utf-8').read()
    m = re.match(r'\s*window\.UI_LESSONS\s*=\s*(\{.*\})\s*;?\s*$', src, re.S)
    obj = json.loads(m.group(1))
    if obj.get('sets') == data:
        print(site, 'sets: 最新', len(data))
        continue
    if check:
        print(site, 'sets が古い → python3 tools/gen_sets.py を実行してください'); bad = 1
        continue
    obj['sets'] = data
    open(p, 'w', encoding='utf-8').write('window.UI_LESSONS=' + json.dumps(obj, ensure_ascii=False) + ';\n')
    print(site, 'sets を書き込みました', len(data))
sys.exit(bad)
