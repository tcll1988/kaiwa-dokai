#!/usr/bin/env python3
"""共通ファイルを会話 → 読解 にコピーする（kaiwa 側が正本）。

  python3 tools/sync_assets.py          # コピー
  python3 tools/sync_assets.py --check  # 違いがあれば終了コード 1（CI 用）

対象: assets/js/*.js, assets/ui/ui.css, assets/ui/ui.js
（assets/ui/lessons.js は課名一覧なのでサイトごとに別）
"""
import os, sys, shutil, filecmp, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, DST = os.path.join(ROOT, 'kaiwa'), os.path.join(ROOT, 'dokai')
FILES = [os.path.relpath(p, SRC) for p in sorted(glob.glob(os.path.join(SRC, 'assets', 'js', '*.js')))]
FILES += ['assets/ui/ui.css', 'assets/ui/ui.js']
check = '--check' in sys.argv
bad = 0
for rel in FILES:
    a, b = os.path.join(SRC, rel), os.path.join(DST, rel)
    same = os.path.exists(b) and filecmp.cmp(a, b, shallow=False)
    if same:
        continue
    bad += 1
    if check:
        print('DIFF', rel)
    else:
        os.makedirs(os.path.dirname(b), exist_ok=True)
        shutil.copy2(a, b)
        print('copied', rel)
if check:
    print('OK: 共通ファイルは同一' if not bad else 'NG: %d 個が kaiwa と dokai で違います（python3 tools/sync_assets.py を実行）' % bad)
    sys.exit(1 if bad else 0)
