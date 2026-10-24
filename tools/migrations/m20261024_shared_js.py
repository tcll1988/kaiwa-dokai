#!/usr/bin/env python3
"""2026-10-24 一回限りの移行スクリプト（記録として残しています。再実行は不要）

各ページに複製されていた再生・採点スクリプトを共通ファイル
  <site>/assets/js/player.js（音声） / quiz.js（採点）
への <script src> に置き換え、あわせて確実に直せるリンク誤りを直す。

  python3 tools/migrations/m20261024_shared_js.py          # 実行
  python3 tools/migrations/m20261024_shared_js.py --dry    # 件数だけ表示

ページの表示テキスト・音声ファイル・ファイル名/URL は変えない。
"""
import os, re, sys, json, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DRY = '--dry' in sys.argv
VER = '20261024'
SITES = ['kaiwa', 'dokai']
NESTED = os.path.join(ROOT, 'dokai', 'dokai')   # 不完全な旧コピー（どこからもリンクされていない）
stats = collections.Counter()
log = []

SCRIPT_RE = re.compile(r'[ \t]*<script\b([^>]*)>(.*?)</script>[ \t]*\r?\n?', re.S | re.I)
UI_START = '<!-- ui-skin:start -->'


def rel_assets(site_dir, page):
    depth = os.path.relpath(os.path.dirname(page), site_dir).count(os.sep) + (0 if os.path.dirname(page) == site_dir else 1)
    return ('../' * depth if depth else './') + 'assets/js/'


def insert_before_body_end(s, block):
    """末尾の ui-skin ブロック（なければ </body>）の直前に入れる"""
    i = s.rfind(UI_START)
    if i < 0 or s.rfind('</body>') < i:
        i = s.rfind('</body>')
    if i < 0:
        return s + block
    return s[:i] + block + s[i:]


def migrate_page(site_dir, page):
    s0 = s = open(page, encoding='utf-8', newline='').read()
    rel = os.path.relpath(page, ROOT)
    need = []

    def drop_inline(m):
        attrs, body = m.group(1), m.group(2)
        if 'src=' in attrs:
            return m.group(0)
        funcs = set(re.findall(r'function\s+(\w+)', body))
        if not body.strip():
            stats['empty_script_removed'] += 1
            return ''
        if funcs & {'playAllRadioList', 'fileStart', 'setViewItem', 'doRadioFile'}:
            stats['player_inline_removed'] += 1
            need.append('player')
            return ''
        if funcs <= {'doRight', 'doFilePlay'} and 'doRight' in funcs:
            if 'doFilePlay' in funcs:
                fm = re.findall(r'setRadioFile\(\s*["\']([^"\']+)["\']\s*\)', body)
                assert len(fm) == 1, (rel, fm)
                drop_inline.audio = fm[0]
            stats['quiz_inline_removed'] += 1
            need.append('quiz')
            return ''
        raise SystemExit('想定外の inline script: %s %s' % (rel, funcs))
    drop_inline.audio = None

    # コメント内の script は対象外にするため、コメントを一時退避
    comments = []
    def stash(m):
        comments.append(m.group(0)); return '\x00C%d\x00' % (len(comments) - 1)
    s = re.sub(r'<!--.*?-->', stash, s, flags=re.S)
    s = SCRIPT_RE.sub(drop_inline, s)

    if drop_inline.audio:
        n = len(re.findall(r'onclick="doFilePlay\(\)"', s))
        assert n >= 1, rel
        s = s.replace('onclick="doFilePlay()"', 'onclick="doFilePlay(\'%s\')"' % drop_inline.audio)
        stats['doFilePlay_buttons'] += n
        need.append('player')

    # 旧 wordRadioFile.js（14+ 個の同一コピー）→ player.js に統合
    s, n = re.subn(r'[ \t]*<script[^>]*src="wordRadioFile\.js"[^>]*>\s*</script>[ \t]*\r?\n?', '', s)
    if n:
        stats['wordRadioFile_include_removed'] += n
        need.append('player')

    # 解答欄の select に付いていた存在しない関数呼び出し（setViewItem）を外す
    if 'quiz' in need:
        def fix_sel(m):
            tag = m.group(0)
            if 'id="language_1"' in tag:
                return tag
            stats['select_onchange_removed'] += 1
            return re.sub(r'\s+onchange="setViewItem\(this\.value\)"', '', tag)
        s = re.sub(r'<select\b[^>]*>', fix_sel, s)

    s = re.sub('\x00C(\\d+)\x00', lambda m: comments[int(m.group(1))], s)

    if need:
        base = rel_assets(site_dir, page)
        tags = []
        if 'player' in need:
            tags.append('<script src="%splayer.js?v=%s"></script>' % (base, VER))
        if 'quiz' in need:
            tags.append('<script src="%squiz.js?v=%s"></script>' % (base, VER))
        block = '<!-- kd-js:start -->\n' + '\n'.join(tags) + '\n<!-- kd-js:end -->\n'
        s = insert_before_body_end(s, block)
        stats['pages_with_shared_js'] += 1

    # UI スキンのキャッシュ更新
    s = s.replace('assets/ui/ui.css?v=20261023', 'assets/ui/ui.css?v=' + VER)
    s = s.replace('assets/ui/ui.js?v=20261023', 'assets/ui/ui.js?v=' + VER)

    if s != s0:
        stats['pages_changed'] += 1
        if not DRY:
            open(page, 'w', encoding='utf-8', newline='').write(s)


# ---- 個別修正（正しいリンク先がファイル名・前後ページから一意に決まるもののみ） ----
FIXES = [
    # (ファイル, 置換前, 置換後, 理由)
    ('kaiwa/13k/homework/kaiwa/13k-t1-3.html', 'id="12k-t-28_py"', 'id="13k-t-28_py"', '拼音行だけ12課の番号（同じ行の中国語は 13k-t-28）'),
    ('kaiwa/2k/homework/kaiwa/2k-t1-2.html', 'id="12k-t-14_jp"', 'id="2k-t-14_jp"', '日本語行だけ12課の番号（同じ行の中国語は 2k-t-14）'),
    ('kaiwa/7k/homework/kaiwa/7k-l5-2.html', 'href="67k-l5-1.html"', 'href="7k-l5-1.html"', '「前へ」の打ち間違い（7k-l5-1 の「次へ」が 7k-l5-2）'),
    ('dokai/7k/homework/dokai/7k-l-1.html', 'id="d1-6k-l-2_py"', 'id="d1-7k-l-2_py"', '拼音行だけ6課の番号（同じ行は d1-7k-l-2）'),
    ('dokai/2k/homework/dokai/2k-l4-5.html', 'href="12k-l4-4.html"', 'href="2k-l4-4.html"', '「前へ」の打ち間違い（2k-l4-4 の「次へ」が 2k-l4-5）'),
    ('dokai/11k/homework/dokai/11k-t1-4.html', 'href="11k-t1-2.html"', 'href="11k-t1-3.html"', '「前へ」が t1-3 を飛ばしていた（11k-t1-3 の「次へ」が t1-4）'),
    ('dokai/8k/homework/dokai/8k-t.html', "window.location.href('8k.html')", "window.location.href='../../8k.html'", '「戻る」：JS 誤り＋パス誤り'),
    ('dokai/8k/homework/dokai/8k-t2.html', "window.location.href('8k.html')", "window.location.href='../../8k.html'", '「戻る」：JS 誤り＋パス誤り'),
]
for n in range(1, 6):
    FIXES.append(('kaiwa/7k/homework/kaiwa/7k-l3-%d.html' % n, '<option value="E">呢</option>', '<option value="F">呢</option>',
                  '選択肢「呢」の value が「吧」と同じ E（答えデータは F）。呢を選ぶと正解できなかった'))
for n in range(8, 15):
    FIXES.append(('dokai/%dk/%dk.html' % (n, n), '<a href="8k-l.html">', '<a href="homework/dokai/%dk-l.html">' % n,
                  '「宿題」アイコンのリンク先誤り（下の「宿題」文字リンクと同じ先に）'))


def apply_fixes():
    for f, a, b, why in FIXES:
        p = os.path.join(ROOT, f)
        s = open(p, encoding='utf-8', newline='').read()
        c = s.count(a)
        assert c >= 1, ('not found', f, a)
        s = s.replace(a, b)
        stats['link_fixes'] += c
        log.append({'file': f, 'from': a, 'to': b, 'count': c, 'why': why})
        if not DRY:
            open(p, 'w', encoding='utf-8', newline='').write(s)
    # 読解：各課トップ・単語ページの「戻る」ボタン window.location.href('x') は関数呼び出しで動かない → 代入に
    for site in SITES:
        for dp, dn, fn in os.walk(os.path.join(ROOT, site)):
            if dp.startswith(NESTED):
                continue
            for f in fn:
                if not f.endswith('.html'):
                    continue
                p = os.path.join(dp, f)
                s = open(p, encoding='utf-8', newline='').read()
                parts = re.split(r'(<!--.*?-->)', s, flags=re.S)
                cnt = 0
                for i in range(0, len(parts), 2):
                    parts[i], n = re.subn(r"window\.location\.href\('([^']+)'\)", r"window.location.href='\1'", parts[i])
                    cnt += n
                if cnt:
                    stats['location_href_fixed'] += cnt
                    log.append({'file': os.path.relpath(p, ROOT), 'from': "window.location.href('…')", 'to': "window.location.href='…'", 'count': cnt, 'why': '「戻る」等のボタンが JS エラーで動かなかった'})
                    if not DRY:
                        open(p, 'w', encoding='utf-8', newline='').write(''.join(parts))
    # コース一覧：閉じていない <a>（第9課以降）を閉じる（表示テキストは同じ）
    for f in ['kaiwa/k1.html', 'dokai/d1.html']:
        p = os.path.join(ROOT, f)
        s = open(p, encoding='utf-8', newline='').read()
        s2, n = re.subn(r'(<a href="\d+k/\d+k\.html">[^<]*)(</font>)', r'\1</a>\2', s)
        if n:
            stats['index_unclosed_a_fixed'] += n
            log.append({'file': f, 'from': '<a …>第N課</font>', 'to': '<a …>第N課</a></font>', 'count': n, 'why': '閉じタグ漏れ'})
            if not DRY:
                open(p, 'w', encoding='utf-8', newline='').write(s2)


def strip_answer_js():
    """Nk-a.js：28 個すべて同じ関数部分（未使用含む）を削除し、答えデータだけ残す"""
    for site in SITES:
        for dp, dn, fn in os.walk(os.path.join(ROOT, site)):
            if dp.startswith(NESTED):
                continue
            for f in fn:
                if not re.match(r'^\d+k-a\.js$', f):
                    continue
                p = os.path.join(dp, f)
                s = open(p, encoding='utf-8', newline='').read()
                i = s.find('function doFindAnswer')
                if i < 0:
                    continue
                j = s.rfind('\n// num1', 0, i)
                head = s[:j if j > 0 else i].rstrip() + '\n'
                head = ('// 答えデータ（採点処理は ../../../assets/js/quiz.js）\n'
                        '// 形式: "小問番号#答え"。解答欄が複数ある問題は "B@原文" のように @ で区切る。\n') + head
                stats['answer_js_stripped'] += 1
                if not DRY:
                    open(p, 'w', encoding='utf-8', newline='').write(head)


def remove_junk():
    """どこからも参照されていないものだけ削除（参照チェックは tools/linkcheck.py で確認済み）"""
    import shutil
    if os.path.isdir(NESTED):
        stats['removed_nested_dokai_files'] = sum(len(fn) for _, _, fn in os.walk(NESTED))
        log.append({'removed': 'dokai/dokai/', 'why': '読解サイトの不完全な旧コピー。どのページからもリンクなし'})
        if not DRY:
            shutil.rmtree(NESTED)
    for site in SITES:
        for dp, dn, fn in os.walk(os.path.join(ROOT, site)):
            for f in fn:
                if f == 'wordRadioFile.js':
                    stats['removed_wordRadioFile_js'] += 1
                    log.append({'removed': os.path.relpath(os.path.join(dp, f), ROOT), 'why': '27 個とも同一内容。player.js に統合し参照ゼロ'})
                    if not DRY:
                        os.remove(os.path.join(dp, f))


def main():
    nested = NESTED
    for site in SITES:
        site_dir = os.path.join(ROOT, site)
        for dp, dn, fn in os.walk(site_dir):
            if dp.startswith(nested):
                continue
            for f in sorted(fn):
                if f.endswith('.html'):
                    migrate_page(site_dir, os.path.join(dp, f))
    apply_fixes()
    strip_answer_js()
    remove_junk()
    print(json.dumps(stats, ensure_ascii=False, indent=1))
    if not DRY:
        out = os.path.join(ROOT, 'tools', 'migrations', 'm20261024_fixes.json')
        json.dump(log, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
