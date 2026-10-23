/*!
 * player.js — 共通音声プレーヤー（本文・単語・聞き取り問題）
 * 中国語宿題サイト（会話・読解）共通。kaiwa/assets/js と dokai/assets/js は同じファイル。
 * 編集したら `python3 tools/sync_assets.py` で両サイトにコピーしてください。
 *
 * 各ページの HTML はそのまま（onclick="fileStart(this.id)" など）で動きます。
 *   fileStart(id)        … 1文だけ再生。id="9k-h-3_ch" → sound/9k-h-3.mp3
 *   playAllRadioList()   … ページ内の文を上から順に全部再生（行数は自動で数える）
 *   myrefresh()          … 停止
 *   setViewItem(lang)    … 表示切替 chinese / japanese / pinyin / everything
 *   doFilePlay(file)     … 聞き取り問題の「再生」ボタン。sound/<file> を再生
 *
 * 旧コードの不具合（再生のたびに ended イベントが増えて文が飛ぶ、
 * 1〜8行目決め打ちでエラー、単語ページで文ごとに new Audio() して iOS で止まる）を直した版です。
 *  - <audio> はページに 1 つだけ。ended / error は 1 回だけ登録
 *  - 再生のたびに token を進め、古い全文朗読の続き（遅れて届いた ended）は無視
 *  - 再生ボタンの状態: 読み込み中 .kd-wait / 再生中 .kd-on + aria-pressed、
 *    全文朗読ボタンは再生中「停止」表示になり、もう一度押すと止まる
 *  - 音声が読み込めないときは「音声を読み込めませんでした」と表示して次の文へ
 */
(function (w, d) {
  'use strict';

  var SOUND_DIR = 'sound/';
  var PREF_KEY = 'kd-view-mode';          // 表示切替をページ間で覚える
  var MODES = { chinese: [1, 0, 0], japanese: [1, 1, 0], pinyin: [1, 0, 1], everything: [1, 1, 1] };

  var audio = null;
  var queue = [];      // 全文朗読の順番（id の接頭辞）
  var pos = -1;        // queue の現在位置。-1 = 全文朗読していない
  var current = null;  // ハイライト中の id 接頭辞
  var token = 0;       // 再生のたびに +1。古い再生の ended を無視するため
  var srcToken = 0;    // いま audio に入っている音声の token
  var activeBtn = null, allBtn = null, allLabel = null;
  var STOP_LABEL = '停止';
  var loading = false;

  function getAudio() {
    if (audio) return audio;
    audio = d.getElementById('audiolocal');
    if (!audio) {
      audio = d.createElement('audio');
      audio.id = 'audiolocal';
      (d.body || d.documentElement).appendChild(audio);
    }
    audio.preload = 'none';
    // イベントは 1 回だけ登録する（旧コードはここが毎回増えていた）
    audio.addEventListener('ended', function () { if (srcToken === token) next(); });
    audio.addEventListener('error', function () {
      if (!audio.getAttribute('src') || srcToken !== token) return;
      if (w.console) console.warn('[player] 音声を読み込めません:', audio.getAttribute('src'));
      toast('音声を読み込めませんでした');
      next();
    });
    audio.addEventListener('playing', function () { loading = false; btnState('on'); });
    audio.addEventListener('waiting', function () { btnState('wait'); });
    // 音声の切り替え中に出る pause は無視。端末側（ロック画面など）で止めたときだけボタンを戻す
    audio.addEventListener('pause', function () { if (!loading && !audio.ended && pos < 0) btnState(null); });
    return audio;
  }

  /* ---- 画面下の短いお知らせ ---- */
  var toastEl = null, toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = d.createElement('div');
      toastEl.className = 'kd-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      (d.body || d.documentElement).appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('kd-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('kd-show'); }, 3000);
  }

  /* ---- ボタンの状態表示 ---- */
  function eventButton() {
    var e = w.event, t = e && e.target;
    return t && t.closest ? t.closest('input[type=button],button') : null;
  }
  function btnState(st) {
    var b = activeBtn;
    if (!b) return;
    b.classList.toggle('kd-wait', st === 'wait');
    b.classList.toggle('kd-on', st === 'on' || st === 'wait');
    b.setAttribute('aria-pressed', st ? 'true' : 'false');
    if (b === allBtn) {
      if (st) b.value = STOP_LABEL; else if (allLabel) b.value = allLabel;
    }
    if (!st) activeBtn = null;
  }
  function setActive(b, isAll) {
    if (activeBtn && activeBtn !== b) btnState(null);
    activeBtn = b || null;
    if (isAll && b) { allBtn = b; if (allLabel === null || b.value !== STOP_LABEL) allLabel = b.value; }
    if (activeBtn) btnState('wait');
  }

  function mark(prefix, on) {
    if (!prefix) return;
    ['_ch', '_py', '_jp'].forEach(function (suf) {
      var el = d.getElementById(prefix + suf);
      if (!el) return;
      if (on) { el.classList.add('kd-playing'); el.setAttribute('aria-current', 'true'); }
      else { el.classList.remove('kd-playing'); el.removeAttribute('aria-current'); }
    });
  }

  function load(prefix, file) {
    var a = getAudio();
    mark(current, false);
    current = prefix;
    mark(current, true);
    token += 1; srcToken = token; loading = true;
    a.src = SOUND_DIR + file;
    var my = token, p = a.play();
    if (p && p.catch) p.catch(function (e) {
      // 次の音声に切り替えた時の AbortError は正常
      if (!e || e.name === 'AbortError') return;
      if (w.console) console.warn('[player]', e.name, file);
      if (e.name === 'NotAllowedError' && my === token) { loading = false; finish(); }   // 自動再生ブロック等
    });
    if (current && pos >= 0) {
      var el = d.getElementById(current + '_ch');
      if (el && el.scrollIntoView) {
        try { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (_) { }
      }
    }
  }

  // ended / error 時に呼ばれる。全文朗読中なら次の文へ、そうでなければ停止
  function next() {
    if (pos >= 0 && pos + 1 < queue.length) {
      pos += 1;
      load(queue[pos], queue[pos] + '.mp3');
    } else {
      finish();
    }
  }

  function finish() {
    mark(current, false);
    current = null; pos = -1; queue = [];
    btnState(null);
  }

  /** ページ内の再生可能な文を上から順に集める（id 末尾 _ch、重複なし） */
  function collect() {
    var list = [], seen = {};
    var nodes = d.querySelectorAll('[onclick*="fileStart"][id$="_ch"]');
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].id.split('_')[0];
      if (!seen[k]) { seen[k] = 1; list.push(k); }
    }
    return list;
  }

  w.fileStart = function (id) {
    var prefix = String(id).split('_')[0];
    queue = []; pos = -1;
    setActive(null);
    load(prefix, prefix + '.mp3');
  };

  /* 全文朗読。順番を変えたいときはボタンに data-playlist="9k-h-1 9k-h-3 …" を付ける */
  w.playAllRadioList = function () {
    var b = eventButton();
    // 再生中にもう一度押したら停止（ボタンは「停止」表示になっている）
    if (b && pos >= 0 && b === allBtn) { w.myrefresh(); return; }
    var btn = d.querySelector('[data-playlist]');
    queue = btn ? btn.getAttribute('data-playlist').split(/[\s,]+/).filter(Boolean) : collect();
    if (!queue.length) return;
    pos = 0;
    setActive(b, true);
    load(queue[0], queue[0] + '.mp3');
  };

  w.myrefresh = function () {
    token += 1;   // 再生中の ended が届いても続きを再生しない
    if (audio) { audio.pause(); try { audio.currentTime = 0; } catch (_) { } }
    finish();
  };

  w.doFilePlay = function (file) {
    if (!file) return;
    queue = []; pos = -1;
    setActive(eventButton());
    load(null, file);
  };
  // 旧 wordRadioFile.js 互換
  w.setRadioFile = w.doFilePlay;

  w.setViewItem = function (lang) {
    var m = MODES[lang];
    if (!m) return;
    // 本文は <tr id="td_ch_1">、単語は <td id="td_ch"> … どちらも id が td_ で始まる
    var cells = d.querySelectorAll('[id^="td_ch"],[id^="td_jp"],[id^="td_py"]');
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i], k = c.id.slice(3, 5);
      var show = k === 'ch' ? m[0] : k === 'jp' ? m[1] : m[2];
      c.style.display = show ? '' : 'none';
    }
    try { w.localStorage.setItem(PREF_KEY, lang); } catch (_) { }
    // 表示が変わったことを ui.js に知らせる（横はみ出しの再チェック）
    try { d.dispatchEvent(new CustomEvent('kd:viewchange', { detail: lang })); } catch (_) { }
  };

  // 前回選んだ表示モードを復元
  function restore() {
    var sel = d.getElementById('language_1');
    if (!sel) return;
    var v = null;
    try { v = w.localStorage.getItem(PREF_KEY); } catch (_) { }
    if (v && MODES[v] && v !== sel.value) { sel.value = v; w.setViewItem(v); }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', restore); else restore();

  // テスト・デバッグ用
  w.KDPlayer = { collect: collect, toast: toast, state: function () { return { queue: queue.slice(), pos: pos, current: current, token: token }; } };
})(window, document);
