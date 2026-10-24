#!/usr/bin/env python3
"""ブラウザでの動作テスト（任意。Playwright が必要: pip install playwright && playwright install chromium）

  python3 tools/browser_test.py                # 全ページ（数分）
  python3 tools/browser_test.py --sample 40    # 各種類から抜き出して
  python3 tools/browser_test.py --chrome /usr/bin/google-chrome

各ページを実際に開いて
  - JavaScript のエラーが出ないか（読み込み時・操作時）
  - 本文/単語ページ: 「全文朗読」で文が上から順に 1 回ずつ再生され、終わったら止まるか、
    単文クリック後に勝手に次の文へ進まないか、表示切替でエラーが出ないか
    （音は出さず、play() を記録して ended を模擬）
  - 練習問題: すべての「確認」で、正しい答え → 〇、間違い → もう一度 → 2 回目で正解表示
  - 聞き取り「再生」: 指定の mp3 が再生されるか
  - スマホ幅（375px、単語ページは「全部」表示でも）で横にはみ出さないか
を確かめます。
"""
import os, re, sys, json, random, argparse, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--root', default=ROOT)
ap.add_argument('--sample', type=int, default=0)
ap.add_argument('--chrome', default=None)
ap.add_argument('--load-only', action='store_true', help='読み込み時のエラーだけ調べる（旧版との比較用）')
ap.add_argument('--out', default=None)
a = ap.parse_args()

pages = []
for site in ['kaiwa', 'dokai']:
    for dp, dn, fn in os.walk(os.path.join(a.root, site)):
        if os.sep + os.path.join('dokai', 'dokai') in dp:
            continue
        for f in sorted(fn):
            if f.endswith('.html'):
                pages.append(os.path.relpath(os.path.join(dp, f), a.root))
pages.sort()
if a.sample:
    random.seed(1)
    kinds = {}
    for p in pages:
        b = os.path.basename(p)
        k = re.sub(r'\d+', 'N', b)
        kinds.setdefault(k, []).append(p)
    pick = set()
    for k, v in kinds.items():
        pick.update(random.sample(v, min(len(v), max(1, a.sample * len(v) // len(pages) + 1))))
    pages = sorted(pick)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x):
        pass


srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=a.root))
srv.daemon_threads = True
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:%d/' % srv.server_address[1]

STUB = """
window.__plays = [];
HTMLMediaElement.prototype.play = function () { window.__plays.push(decodeURIComponent(this.getAttribute('src') || '').split('/').pop()); return Promise.resolve(); };
HTMLMediaElement.prototype.pause = function () {};
window.__ended = 0;
(function () { var oa = HTMLMediaElement.prototype.addEventListener; HTMLMediaElement.prototype.addEventListener = function (t, f, o) { if (t === 'ended') window.__ended++; return oa.call(this, t, f, o); }; })();
window.__audios = 0;
(function () { var OA = window.Audio; window.Audio = function (s) { window.__audios++; return new OA(s); }; })();
window.alert = function (m) { window.__alerts = (window.__alerts || []).concat([String(m)]); };
"""

READER_JS = """() => {
  const res = {};
  const ids = []; const seen = {};
  document.querySelectorAll('[onclick*="fileStart"][id$="_ch"]').forEach(e => { const k = e.id.split('_')[0]; if (!seen[k]) { seen[k] = 1; ids.push(k + '.mp3'); } });
  const au = document.getElementById('audiolocal');
  window.__plays = [];
  playAllRadioList(3);
  const hl = [];
  for (let i = 0; i < ids.length + 3; i++) {
    hl.push(document.querySelectorAll('.kd-playing').length);
    au.dispatchEvent(new Event('ended'));
  }
  res.expected = ids; res.played = window.__plays.slice(); res.hl = hl;
  res.after = document.querySelectorAll('.kd-playing').length;
  // 単文クリック → ended → 次へ進まない
  window.__plays = [];
  const el = document.getElementById(ids[Math.min(1, ids.length - 1)].replace('.mp3', '') + '_ch');
  if (el) { el.click(); au.dispatchEvent(new Event('ended')); au.dispatchEvent(new Event('ended')); }
  res.single = window.__plays.slice();
  // 全文朗読の途中で停止
  playAllRadioList(3); au.dispatchEvent(new Event('ended'));
  const b = Array.from(document.querySelectorAll('input[type=button]')).find(x => x.value === '終了');
  if (b) b.click(); else myrefresh();
  window.__plays = []; au.dispatchEvent(new Event('ended'));
  res.afterStop = window.__plays.length + document.querySelectorAll('.kd-playing').length;
  // 全文朗読ボタン：押すと「停止」表示、もう一度押すと止まって元の表示に
  const ab = Array.from(document.querySelectorAll('input[type=button]')).find(x => /playAllRadioList/.test(x.getAttribute('onclick') || ''));
  res.toggle = 'skip';
  if (ab) {
    const label = ab.value; window.__plays = [];
    ab.click(); const on = ab.value + '|' + ab.getAttribute('aria-pressed');
    ab.click(); const off = ab.value + '|' + ab.getAttribute('aria-pressed') + '|' + document.querySelectorAll('.kd-playing').length;
    au.dispatchEvent(new Event('ended'));
    res.toggle = (on === '停止|true' && off === label + '|false|0' && window.__plays.length === 1) ? 'ok' : ('NG ' + on + ' / ' + off + ' plays=' + window.__plays.length);
  }
  res.listeners = window.__ended; res.newAudio = window.__audios;
  // 表示切替
  const sel = document.getElementById('language_1');
  res.view = 'skip';
  if (sel) {
    sel.value = 'everything'; sel.dispatchEvent(new Event('change'));
    const hidden = Array.from(document.querySelectorAll('[id^="td_py"],[id^="td_jp"]')).filter(x => x.style.display === 'none').length;
    res.wideAll = document.documentElement.scrollWidth;
    sel.value = 'chinese'; sel.dispatchEvent(new Event('change'));
    const shown = Array.from(document.querySelectorAll('[id^="td_py"],[id^="td_jp"]')).filter(x => x.style.display !== 'none').length;
    res.view = (hidden === 0 && shown === 0) ? 'ok' : ('NG hidden=' + hidden + ' shown=' + shown);
    try { localStorage.clear(); } catch (e) {}
  }
  return res;
}"""

QUIZ_JS = """() => {
  const out = { n: 0, ok: 0, bad: [], flow: null, fileplay: null, freeN: 0, freeBad: [] };
  const btns = Array.from(document.querySelectorAll('[onclick^="doRight("]'));
  const fieldsOf = q => { const one = document.getElementById(q); if (one) return [one]; const l = []; let k = 1, e; while ((e = document.getElementById(q + '_' + k))) { l.push(e); k++; } return l; };
  btns.forEach((btn, idx) => {
    const m = btn.getAttribute('onclick').match(/doRight\\((\\d+)\\s*,\\s*(\\d+)\\)/); if (!m) return;
    const q = m[1] + '_' + m[2]; out.n++;
    const ans = KDQuiz.findAnswer(+m[1], +m[2]); const fs = fieldsOf(q);
    const parts = fs.length > 1 ? ans.split('@') : [ans];
    fs.forEach((f, i) => { f.value = parts[i]; });
    btn.click();
    const r = document.getElementById(q + '_R');
    if (r && r.textContent.trim() === '〇' && r.classList.contains('is-ok')) out.ok++; else out.bad.push(q + ' → ' + (r ? r.textContent : 'no _R') + ' / ans=' + ans);
    // 翻訳欄：間違えたら（他の欄は正しくても）〇にならず、× ＋模範解答をすぐ表示（原版どおり 1 回目から）
    const freeIdx = fs.map((f, i) => KDQuiz.isFree(f, parts[i])).map((b, i) => b ? i : -1).filter(i => i >= 0);
    if (freeIdx.length) {
      out.freeN++;
      freeIdx.forEach(i => { fs[i].value = 'まちがい'; });
      btn.click();
      const t = r.textContent, c = r.className;
      if (!(c.split(' ').indexOf('is-ng') >= 0 && c.split(' ').indexOf('is-model') >= 0 && t === parts.slice(0, fs.length).join('\\n') && !document.getElementById(q + '_self')))
        out.freeBad.push(q + ' → ' + t + ' / ' + c);
      fs.forEach((f, i) => { f.value = parts[i]; });
      btn.click();
      if (r.textContent.trim() !== '〇') out.freeBad.push(q + ' 正解なのに ' + r.textContent);
    }
    if (idx === 0) {
      // 間違い → もう一度 → 正解表示、未回答
      const f0 = fs[0];
      const wrong = f0.tagName === 'SELECT' ? (Array.from(f0.options).map(o => o.value).find(v => v !== '0' && v !== parts[0]) || 'ZZ') : 'まちがい';
      f0.value = wrong; btn.click(); const s1 = r.textContent.trim() + '|' + r.className;
      btn.click(); const s2 = r.textContent.trim() + '|' + r.className;
      f0.value = f0.tagName === 'SELECT' ? '0' : ''; btn.click(); const s3 = r.textContent.trim();
      out.flow = [s1, s2, s3];
      out.live = r.getAttribute('aria-live'); out.cls = r.className;
      out.free = KDQuiz.isFree(f0, parts[0]);
      out.selfBtn = !!document.getElementById(q + '_self');
      out.modelBtn = !!document.getElementById(q + '_model');
      if (f0.tagName !== 'SELECT' && /[a-z]/i.test(parts[0]) && /[1-5]/.test(parts[0]) && /^[a-z0-9 ]+$/i.test(parts[0])) {
        // 声調数字を各音節の末尾へ（ha3o → hao3）→ 〇
        f0.value = KDQuiz.pyKey(parts[0]).split('.').join(''); fs.slice(1).forEach((f, i) => { f.value = parts[i + 1]; });
        btn.click(); out.pinyinMoved = r.textContent.trim(); out.placeholder = f0.placeholder;
        // 数字を全部最後にまとめる（di4di → didi4）→ 最後の音節以外に声調があれば × （〇 にならない）
        const syl = KDQuiz.pyKey(parts[0]).split('.');
        if (syl.slice(0, -1).some(x => /[0-9]/.test(x))) {
          f0.value = parts[0].replace(/[0-9]/g, '') + parts[0].replace(/[^0-9]/g, ''); btn.click();
          out.pinyinOtherSyl = r.textContent.trim();
        }
      }
      // 大文字・全角でも正解（記述欄）
      if (f0.tagName !== 'SELECT' && fs.length === 1) { f0.value = parts[0].toUpperCase().replace(/[a-z0-9]/gi, c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)) + '　'; btn.click(); out.lenient = r.textContent.trim(); }
      if (fs.length > 1) { fs[0].value = wrong; btn.click(); out.perfield = fs.map(f => f.className.indexOf('is-ng') >= 0 ? 'ng' : f.className.indexOf('is-ok') >= 0 ? 'ok' : '-').join(','); }
    }
  });
  const pb = document.querySelector('[onclick^="doFilePlay("]');
  if (pb) { window.__plays = []; pb.click(); out.fileplay = [pb.getAttribute('onclick'), window.__plays.slice()]; }
  return out;
}"""

summary = {'pages': 0, 'js_errors': 0, 'pages_with_errors': [], 'reader_pages': 0, 'reader_ok': 0, 'reader_bad': [],
           'quiz_questions': 0, 'quiz_ok': 0, 'quiz_bad': [], 'quiz_flow_bad': [], 'free_bad': [], 'fileplay': 0, 'fileplay_bad': [],
           'mobile_overflow': [], 'requests_404': []}
with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path=a.chrome, args=['--no-sandbox', '--mute-audio', '--disable-dev-shm-usage'])
    ctx = br.new_context(viewport={'width': 375, 'height': 812}, device_scale_factor=1, is_mobile=True, has_touch=True)
    ctx.add_init_script(STUB)
    ctx.route(re.compile(r'.*\.(mp3|xlsx)(\?.*)?$'), lambda r: r.fulfill(status=200, body=b'', content_type='audio/mpeg'))
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e).split('\n')[0]))
    pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)  # 404 は requests_404 で別集計
    pg.on('response', lambda r: summary['requests_404'].append(r.url.replace(BASE, '')) if r.status == 404 and not r.url.endswith('favicon.ico') else None)
    for i, p in enumerate(pages):
        errs.clear()
        try:
            pg.goto(BASE + p, wait_until='load', timeout=20000)
        except Exception as e:
            errs.append('goto: ' + str(e)[:80])
        summary['pages'] += 1
        if not a.load_only:
            s = pg.content()
            try:
                if pg.evaluate("typeof playAllRadioList") == 'function' and pg.query_selector('#audiolocal'):
                    summary['reader_pages'] += 1
                    r = pg.evaluate(READER_JS)
                    good = (r['played'] == r['expected'] and len(r['single']) == 1 and r['afterStop'] == 0 and r['after'] == 0
                            and r['view'] in ('ok', 'skip') and r['toggle'] in ('ok', 'skip') and r['listeners'] <= 1 and r['newAudio'] == 0
                            and r.get('wideAll', 0) <= 376 and all(h >= 1 for h in r['hl'][:len(r['expected'])]))
                    if good:
                        summary['reader_ok'] += 1
                    else:
                        summary['reader_bad'].append({'page': p, **r})
                if pg.evaluate("typeof doRight") == 'function' and 'doRight(' in s:
                    q = pg.evaluate(QUIZ_JS)
                    summary['quiz_questions'] += q['n']; summary['quiz_ok'] += q['n'] - len(q['bad'])
                    summary['quiz_bad'] += [p + ': ' + b for b in q['bad']]
                    summary['free_questions'] = summary.get('free_questions', 0) + q['freeN']
                    summary['free_bad'] += [p + ': ' + b for b in q['freeBad']]
                    if q.get('lenient') not in (None, '〇'):
                        summary['quiz_flow_bad'].append({'page': p, 'lenient': q['lenient']})
                    if q.get('perfield') and not q.get('free') and not q['perfield'].startswith('ng'):
                        summary['quiz_flow_bad'].append({'page': p, 'perfield': q['perfield']})
                    if q.get('pinyinMoved') not in (None, '〇') or (q.get('pinyinMoved') and q.get('placeholder') != '例：ba4'):
                        summary['quiz_flow_bad'].append({'page': p, 'pinyin': q.get('pinyinMoved'), 'ph': q.get('placeholder')})
                    if q.get('pinyinOtherSyl') == '〇':
                        summary['quiz_flow_bad'].append({'page': p, 'pinyin_other_syllable_ok': True})
                    if q.get('pinyinOtherSyl') is not None:
                        summary['pinyin_other_syl_checked'] = summary.get('pinyin_other_syl_checked', 0) + 1
                    if q.get('pinyinMoved'):
                        summary['pinyin_checked'] = summary.get('pinyin_checked', 0) + 1
                    if q['flow'] and q.get('free'):
                        summary['free_checked'] = summary.get('free_checked', 0) + 1
                        if not (q['flow'][0].endswith('|is-ng is-model') and q['flow'][1].endswith('|is-ng is-model') and q['selfBtn'] is False and q['modelBtn']):
                            summary['quiz_flow_bad'].append({'page': p, 'free_flow': q['flow'], 'self': q['selfBtn'], 'model': q['modelBtn']})
                        q['flow'] = None
                    if q['flow'] and q.get('live') != 'polite':
                        summary['quiz_flow_bad'].append({'page': p, 'live': q.get('live')})
                    if q['flow'] and not (q['flow'][0].startswith('×') and q['flow'][0].endswith('is-ng is-retry') and not q['flow'][1].startswith('×') and q['flow'][1].endswith('is-ng is-answer') and q['flow'][2] == '未回答です'):
                        summary['quiz_flow_bad'].append({'page': p, 'flow': q['flow']})
                    if q['fileplay']:
                        summary['fileplay'] += 1
                        exp = re.search(r"doFilePlay\('([^']+)'\)", q['fileplay'][0])
                        if not exp or q['fileplay'][1] != [exp.group(1)]:
                            summary['fileplay_bad'].append({'page': p, 'fp': q['fileplay']})
            except Exception as e:
                errs.append('test: ' + str(e).split('\n')[0][:120])
        w = pg.evaluate("Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0)")
        if w > 375:
            summary['mobile_overflow'].append('%s (%dpx)' % (p, w))
        if errs:
            summary['js_errors'] += len(errs)
            summary['pages_with_errors'].append({'page': p, 'errors': sorted(set(errs))[:3]})
        if (i + 1) % 200 == 0:
            print('...%d/%d' % (i + 1, len(pages)), flush=True)
    br.close()
srv.shutdown()
summary['requests_404'] = sorted(set(summary['requests_404']))
short = {k: (len(v) if isinstance(v, list) else v) for k, v in summary.items()}
print(json.dumps(short, ensure_ascii=False))
if a.out:
    json.dump(summary, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for k in ('pages_with_errors', 'reader_bad', 'quiz_bad', 'quiz_flow_bad', 'free_bad', 'fileplay_bad', 'mobile_overflow', 'requests_404'):
    for x in summary[k][:8]:
        print(k.upper(), json.dumps(x, ensure_ascii=False)[:300])
bad = summary['js_errors'] + sum(len(summary[k]) for k in ('reader_bad', 'quiz_bad', 'quiz_flow_bad', 'free_bad', 'fileplay_bad', 'mobile_overflow', 'requests_404'))
if not a.load_only and summary['quiz_questions'] == 0:
    bad += 1; print('NG: 練習問題を 1 問もテストできませんでした')
print('OK: 問題なし' if not bad else 'NG: 問題 %d 件' % bad)
sys.exit(1 if bad else 0)
