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
 * 比べ方: NFKC（全角→半角）、空白（全角含む）を無視、英字の大小を無視。
 *   記述欄はさらに句読点を無視（LENIENT_TEXT）。
 *   数字式ピンイン（答えが ha3o / hao3 など）は、つづりと声調の数字の順番だけを比べる
 *   （ha3o = hao3 = hǎo）。こうした欄には「例：ba4」と薄く表示。
 *
 * 翻訳（「〜に訳しなさい」の問題で、答えが日本語の文、または中国語訳の文）は
 *   従来どおりの採点：答えと一致すれば「〇」、一致しなければすぐに正解（模範解答）を表示。
 *   「× もう一度」は出さない（従来も 1 回目から正解を表示していたため）。
 *   自己採点（自分で〇をつける）は無し＝〇になるのは答えと一致したときだけ。
 *   「模範解答を見る」ボタンは付ける（従来も何か入力して確認すれば正解が見えたのと同じ）。
 */
(function (w, d) {
  'use strict';

  // 何回間違えたら正解を表示するか。原版は 1（1 回目の不正解ですぐ正解を表示）。
  // 2 = 1 回目は「× もう一度」、2 回目で正解を表示（ヒント設計は先生から任されているため 2 を採用）。翻訳問題は対象外（常に 1 回目で表示）。
  var SHOW_ANSWER_AFTER = 2;
  var LENIENT_TEXT = true;     // 記述欄：空白・全角半角・句読点の違いを無視する（false で完全一致）

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
    if (v.normalize) v = v.normalize('NFKC');
    v = v.replace(/[\s\u3000\u00a0]+/g, '').toLowerCase();
    if (isText && LENIENT_TEXT) v = v.replace(/[.,!?;:'"。、，．！？；：「」『』“”‘’…・]/g, '');
    return v;
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
    return v.replace(/[0-9]/g, '') + '|' + v.replace(/[^1-5]/g, '');
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

  var STATE_CLASS = { ok: 'is-ok', retry: 'is-ng is-retry', answer: 'is-ng is-answer', empty: 'is-empty', model: 'is-model' };
  function show(qid, text, state) {
    var r = d.getElementById(qid + '_R');
    if (!r) return;
    r.setAttribute('data-state', state);
    r.setAttribute('role', 'status');
    r.setAttribute('aria-live', 'polite');
    r.classList.remove('is-ok', 'is-ng', 'is-retry', 'is-answer', 'is-empty');
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
      // 欄が 1 つだけなら枠色は付けない（結果欄で十分）。翻訳欄には × を付けない
      markField(els[i], els.length > 1 && !(f && !good) ? good : null);
    }
    if (ok) { show(qid, '〇', 'ok'); progSave(qid); return; }
    if (fixedOk) { showModel(qid, parts, els.length); return; }   // 違うのは翻訳欄だけ → 従来どおりすぐ正解を表示（〇にはしない）
    tries[qid] = (tries[qid] || 0) + 1;
    if (tries[qid] < SHOW_ANSWER_AFTER) show(qid, '×　もう一度', 'retry');
    else show(qid, parts.slice(0, els.length).join(', '), 'answer');
  };

  function showModel(qid, parts, n) { show(qid, parts.slice(0, n).join('\n'), 'model'); }   // 欄ごとに改行

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

  w.KDQuiz = { findAnswer: findAnswer, norm: norm, same: same, isFree: isFree, pyKey: pyKey, progress: progLoad };
})(window, document);
