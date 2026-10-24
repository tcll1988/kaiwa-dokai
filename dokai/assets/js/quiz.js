/*!
 * quiz.js — 共通採点スクリプト（練習問題）
 * 中国語宿題サイト（会話・読解）共通。編集後は `python3 tools/sync_assets.py`。
 *
 * ページ側の書き方（従来どおり）:
 *   <script src="9k-a.js"></script>                     … 答えのデータ（answerArray）
 *   <select id="1_3">…</select> または <input id="1_3">  … 解答欄 1 つ
 *   <select id="4_2_1">…<input id="4_2_2">               … 解答欄が複数（答えは "B@原文" のように @ 区切り）
 *   <label id="1_3_R"></label>                          … 結果表示
 *   <input type="button" value="確認" onclick="doRight(1,3)">
 *
 * 動き:
 *   正解 → 「〇」
 *   1 回目の不正解 → 「× もう一度」（答えはまだ見せない）
 *   2 回目以降の不正解 → 正解を表示（従来と同じ表示）
 *   未回答 → 「未回答です」（回数に数えない）
 *   解答欄が複数のときは、欄ごとに 〇/× の枠色（.is-ok / .is-ng）
 *   結果欄には .is-ok / .is-ng / .is-retry / .is-empty と aria-live を付ける（見た目は ui.css）
 *   正解した小問は localStorage に記録 → 宿題メニュー・問題ページに進み具合（ui.js）
 *
 * 比べ方: 原版は完全一致（==）で、句読点も区別していた。そこで句読点は区別したまま、
 *   NFKC（全角→半角）と空白（全角含む）の違いだけを無視する（LENIENT_TEXT）。
 *   数字式ピンイン（答えが ha3o / hao3 など）は、音節ごとに区切って
 *   「どの音節に何声が付いているか」を比べる（ha3o = hao3 = hǎo、大文字小文字は無視）。
 *   声調の数字の位置は音節の中ならどこでもよいが、別の音節に付けると × （di4di ≠ didi4）。
 *   こうした欄には「例：ba4」と薄く表示。
 *
 * 翻訳（「〜に訳しなさい」の問題で、答えが日本語の文、または中国語訳の文）は
 *   従来どおりの採点：答えと一致すれば「〇」、一致しなければ × にして、すぐに正解（模範解答）を表示。
 *   「× もう一度」は出さない（従来も 1 回目から正解を表示していたため）。
 *   自己採点（自分で〇をつける）は無し＝〇になるのは答えと一致したときだけ。
 *   「模範解答を見る」ボタンは付ける（従来も何か入力して確認すれば正解が見えたのと同じ）。
 */
(function (w, d) {
  'use strict';

  // 何回間違えたら正解を表示するか。原版は 1（1 回目の不正解ですぐ正解を表示）。
  // 2 = 1 回目は「× もう一度」、2 回目で正解を表示（ヒント設計は先生から任されているため 2 を採用）。翻訳問題は対象外（常に 1 回目で表示）。
  var SHOW_ANSWER_AFTER = 2;
  var LENIENT_TEXT = true;     // 記述欄：空白・全角半角の違いを無視する（句読点は区別。false で完全一致）

  var tries = {};

  function findAnswer(n1, n2) {
    var all = w.answerArray;
    if (!all || !all[n1 - 1]) return null;
    var list = all[n1 - 1];
    for (var i = 0; i < list.length; i++) {
      var p = String(list[i]).split('#');
      if (p.length >= 2 && p[0] == String(n2)) return p[1];
    }
    return null;
  }

  function norm(v, isText) {
    v = String(v == null ? '' : v);
    if (isText && !LENIENT_TEXT) return v;
    if (v.normalize) v = v.normalize('NFKC');
    return v.replace(/[\s\u3000\u00a0]+/g, '');
  }

  /* ---- 数字式ピンイン ---- */
  function isNumPinyin(a) {
    var t = String(a).normalize ? String(a).normalize('NFKC').toLowerCase().replace(/[\s']+/g, '') : String(a);
    return /^[a-zü:v0-5]+$/.test(t) && /[a-z]/.test(t) && /[1-5]/.test(t);
  }
  function pyKey(v) {
    v = String(v == null ? '' : v);
    if (v.normalize) {
      v = v.normalize('NFKC').toLowerCase().normalize('NFD')
        .replace(/\u0304/g, '1').replace(/\u0301/g, '2').replace(/\u030c/g, '3').replace(/\u0300/g, '4')
        .normalize('NFC');
    }
    v = v.replace(/[\s\u3000'’]+/g, '').replace(/ü|u:/g, 'v');
    var letters = '', tones = [];
    for (var i = 0; i < v.length; i++) {
      var c = v.charAt(i);
      if (/[0-9]/.test(c)) tones.push([letters.length - 1, c]); else letters += c;
    }
    var ends = pySplit(letters);
    if (!ends) return letters + '|' + v.replace(/[^1-5]/g, '');   // 音節に区切れないとき（普通は無い）
    var syl = [];
    for (var s = 0, st = 0; s < ends.length; s++) {
      var t = letters.slice(st, ends[s]);
      if (t === 'r' && syl.length) { syl[syl.length - 1].end = ends[s]; syl[syl.length - 1].text += 'r'; }   // 儿化（zhe4r = zher4）
      else syl.push({ text: t, end: ends[s], tone: '' });
      st = ends[s];
    }
    tones.forEach(function (tn) {
      for (var k = 0; k < syl.length; k++) if (tn[0] < syl[k].end) { syl[k].tone += tn[1]; return; }
      syl[syl.length - 1].tone += tn[1];
    });
    return syl.map(function (x) { return x.text + x.tone; }).join('.');
  }

  // ピンインの音節表（ü は v）。儿化の r も 1 つとして区切り、前の音節にくっつける
  var SYL = {};
  ('a ai an ang ao e ei en eng er o ou r ' +
   'ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu ' +
   'pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu ' +
   'ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu ' +
   'fa fan fang fei fen feng fo fou fu ' +
   'da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo ' +
   'ta tai tan tang tao te tei teng ti tian tiao tie ting tong tou tu tuan tui tun tuo ' +
   'na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nun nuo nv nve nue ' +
   'la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lv lve lue ' +
   'ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ' +
   'ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo ' +
   'ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo ' +
   'ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun ' +
   'qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun ' +
   'xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun ' +
   'zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo ' +
   'cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo ' +
   'sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo ' +
   'ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo ' +
   'za zai zan zang zao ze zei zen zeng zi zong zou zu zuan zui zun zuo ' +
   'ca cai can cang cao ce cei cen ceng ci cong cou cu cuan cui cun cuo ' +
   'sa sai san sang sao se sen seng si song sou su suan sui sun suo ' +
   'ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun ' +
   'wa wai wan wang wei wen weng wo wu').split(' ').forEach(function (x) { SYL[x] = 1; });
  // 文字列を音節に区切る（長い音節を優先、だめなら短く）。各音節の終わりの位置の配列、区切れなければ null
  function pySplit(str) {
    var memo = {};
    function go(i) {
      if (i === str.length) return [];
      if (memo.hasOwnProperty(i)) return memo[i];
      var res = null;
      for (var n = Math.min(6, str.length - i); n >= 1 && !res; n--) {
        if (SYL[str.substr(i, n)]) { var rest = go(i + n); if (rest) res = [i + n].concat(rest); }
      }
      memo[i] = res;
      return res;
    }
    return go(0);
  }

  /* ---- 翻訳問題（自由記述）の判定 ---- */
  var pageText = null;
  function isFree(el, part) {
    if (el.tagName === 'SELECT') return false;
    if (pageText === null) pageText = (d.body && d.body.textContent) || '';
    if (!/訳しなさい|訳してください/.test(pageText)) return false;
    if (/[\u3040-\u30ff]/.test(part)) return true;   // 日本語訳
    return /中国語に訳/.test(pageText) && /[\u4e00-\u9fff]/.test(part);
  }

  function same(el, val, part) {
    if (el.tagName !== 'SELECT' && isNumPinyin(part)) return pyKey(val) === pyKey(part);
    var isText = el.tagName !== 'SELECT';
    return norm(val, isText) === norm(part, isText);
  }

  function fields(qid) {
    var one = d.getElementById(qid);
    if (one) return [one];
    var list = [], k = 1, el;
    while ((el = d.getElementById(qid + '_' + k))) { list.push(el); k++; }
    return list;
  }

  function isEmpty(el) {
    var v = (el.value || '').replace(/[\s\u3000]+/g, '');
    return v === '' || (el.tagName === 'SELECT' && v === '0');
  }

  var STATE_CLASS = { ok: 'is-ok', retry: 'is-ng is-retry', answer: 'is-ng is-answer', empty: 'is-empty', model: 'is-model', wrongModel: 'is-ng is-model' };
  function show(qid, text, state) {
    var r = d.getElementById(qid + '_R');
    if (!r) return;
    r.setAttribute('data-state', state);
    r.setAttribute('role', 'status');
    r.setAttribute('aria-live', 'polite');
    r.classList.remove('is-ok', 'is-ng', 'is-retry', 'is-answer', 'is-empty', 'is-model');
    STATE_CLASS[state].split(' ').forEach(function (c) { r.classList.add(c); });
    // 同じ結果が続いても読み上げ・アニメーションされるよう、いったん空にしてから入れる
    r.textContent = '';
    r.textContent = text;
    r.style.color = state === 'ok' ? 'red' : 'black';   // CSS が読めない環境向けの従来色
  }

  function markField(el, ok) {
    el.classList.remove('is-ok', 'is-ng');
    if (ok !== null) el.classList.add(ok ? 'is-ok' : 'is-ng');
    if (ok === false) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  }

  /* ---- 進み具合（正解した小問を端末に記録） ---- */
  var PROG_KEY = 'kd-progress';
  function progLoad() { try { return JSON.parse(w.localStorage.getItem(PROG_KEY)) || {}; } catch (_) { return {}; } }
  function progSave(qid) {
    try {
      var all = progLoad(), key = decodeURIComponent(location.pathname);
      var list = all[key] || [];
      if (list.indexOf(qid) < 0) list.push(qid);
      all[key] = list;
      w.localStorage.setItem(PROG_KEY, JSON.stringify(all));
      try { d.dispatchEvent(new CustomEvent('kd:progress', { detail: { page: key, done: list.slice() } })); } catch (_) { }
    } catch (_) { }
  }

  w.doRight = function (n1, n2) {
    var qid = n1 + '_' + n2;
    var ans = findAnswer(n1, n2);
    var els = fields(qid);
    if (ans === null || !els.length) {
      show(qid, '（この問題の答えが登録されていません）', 'answer');
      if (w.console) console.warn('[quiz] 答えまたは解答欄が見つかりません:', qid);
      return;
    }
    var parts = els.length > 1 ? ans.split('@') : [ans];
    if (parts.length < els.length) {
      show(qid, '（答えのデータが不足しています）', 'answer');
      if (w.console) console.warn('[quiz] 答えの数が解答欄より少ない:', qid, ans);
      return;
    }
    for (var e = 0; e < els.length; e++) {
      if (isEmpty(els[e])) { els.forEach(function (x) { markField(x, null); }); show(qid, '未回答です', 'empty'); return; }
    }
    var ok = true, fixedOk = true, free = [];
    for (var i = 0; i < els.length; i++) {
      var good = same(els[i], els[i].value, parts[i]);
      var f = isFree(els[i], parts[i]);
      free.push(f);
      if (!good) { ok = false; if (!f) fixedOk = false; }
      // 欄が 1 つだけなら枠色は付けない（結果欄で十分）
      markField(els[i], els.length > 1 ? good : null);
    }
    if (ok) { show(qid, '〇', 'ok'); progSave(qid); return; }
    if (fixedOk) { showModel(qid, parts, els.length, true); return; }   // 違うのは翻訳欄だけ → 従来どおり × ですぐ正解を表示
    tries[qid] = (tries[qid] || 0) + 1;
    if (tries[qid] < SHOW_ANSWER_AFTER) show(qid, '×　もう一度', 'retry');
    else show(qid, parts.slice(0, els.length).join(', '), 'answer');
  };

  function showModel(qid, parts, n, wrong) { show(qid, parts.slice(0, n).join('\n'), wrong ? 'wrongModel' : 'model'); }   // 欄ごとに改行

  /* 翻訳問題に「模範解答を見る」ボタンを付ける */
  function addModelButtons() {
    var btns = d.querySelectorAll('[onclick^="doRight("]');
    for (var i = 0; i < btns.length; i++) {
      var m = btns[i].getAttribute('onclick').match(/doRight\((\d+)\s*,\s*(\d+)\)/);
      if (!m) continue;
      var qid = m[1] + '_' + m[2], ans = findAnswer(+m[1], +m[2]), els = fields(qid);
      if (ans === null || !els.length) continue;
      var parts = els.length > 1 ? ans.split('@') : [ans], any = false;
      for (var k = 0; k < els.length; k++) {
        if (isFree(els[k], parts[k] || '')) any = true;
        if (isNumPinyin(parts[k] || '') && els[k].tagName !== 'SELECT' && !els[k].placeholder) els[k].placeholder = '例：ba4';
      }
      if (!any || d.getElementById(qid + '_model')) continue;
      var b = d.createElement('input');
      b.type = 'button'; b.value = '模範解答を見る'; b.id = qid + '_model'; b.className = 'kd-model';
      b.onclick = (function (q, p, n) { return function () { showModel(q, p, n); }; })(qid, parts, els.length);
      btns[i].parentNode.insertBefore(b, btns[i].nextSibling);
    }
  }

  // 古いページの解答欄に onchange="setViewItem(...)" が残っていてもエラーにしない
  if (!w.setViewItem) w.setViewItem = function () { };

  // スマホで勝手に大文字・自動修正・候補が入らないように（ピンイン・中国語入力）
  function prepInputs() {
    var ins = d.querySelectorAll('input[type=text], input:not([type])');
    for (var i = 0; i < ins.length; i++) {
      var el = ins[i];
      el.setAttribute('autocapitalize', 'off');
      el.setAttribute('autocorrect', 'off');
      el.setAttribute('autocomplete', 'off');
      el.setAttribute('spellcheck', 'false');
    }
  }
  function init() { prepInputs(); addModelButtons(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();

  w.KDQuiz = { findAnswer: findAnswer, norm: norm, same: same, isFree: isFree, pyKey: pyKey, pySplit: pySplit, progress: progLoad };
})(window, document);
