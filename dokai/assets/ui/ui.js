/* 共通UIスキン用の補助スクリプト（見た目のみ）。
   元の fileStart / playAllRadioList / doRight などには一切触れない。
   ここが読み込めなくても、ページは元どおり動く。 */
(function () {
  'use strict';
  var d = document, b = d.body, path = location.pathname, file = decodeURIComponent(path.split('/').pop() || '');
  var SITE = (window.UI_LESSONS && window.UI_LESSONS.site) || '';
  d.documentElement.lang = d.documentElement.lang || 'ja';
  function $all(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function txt(el) { return (el.textContent || '').replace(/[\s\u3000\u00a0]+/g, ''); }
  function add(el, c) { if (el) el.classList.add(c); }

  /* 欠けた画像（ダウンロード漏れ等）は飾りなので隠す */
  function hideBroken(img){ img.addEventListener('error', function(){ img.style.display='none'; }); if (img.complete && !img.naturalWidth && img.getAttribute('src')) img.style.display='none'; }
  /* ---- ページ種別 ---- */
  var type = 'other';
  if (/^(k1|d1)\.html$/.test(file)) type = 'index';
  else if (/^\d+k\.html$/.test(file)) type = 'hub';
  else if (d.getElementById('language_1')) type = /-t\d*-\d+\.html$|-t\.html$/.test(file) ? 'vocab' : 'reader';
  else if (/-p\.html$/.test(file)) type = 'grammar-list';
  else if (/-\dp\.html$/.test(file)) type = 'grammar';
  else if (/-l\.html$/.test(file)) type = 'hwmenu';
  else if (/-l-o\.html$/.test(file)) type = 'done';
  else if ($all('input[value="確認"]').length) type = 'exercise';
  add(b, 'ui-' + type);
  if (type === 'vocab') add(b, 'ui-reader');

  /* ---- 中国語の行に lang=zh（端末の中国語フォントで表示） ---- */
  $all('lable[id$="_ch"], lable[id$="_py"]').forEach(function (el) { el.setAttribute('lang', /_py$/.test(el.id) ? 'zh-Latn' : 'zh-CN'); });
  $all('table[border="1"] td').forEach(function (td) { if (/[\u4e00-\u9fff]/.test(td.textContent) && !/[\u3040-\u30ff]/.test(td.textContent)) td.setAttribute('lang', 'zh-CN'); });

  /* ---- タップで再生できる行をキーボードでも操作可能に ---- */
  $all('lable[onclick]').forEach(function (el) {
    el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
  });

  /* ---- 本文の表をカード化 ---- */
  if (type === 'reader' || type === 'vocab') {
    var t = d.getElementById('title');
    var tables = $all('table').filter(function (x) { return x !== t && x.querySelector('lable[onclick]'); });
    tables.forEach(function (x) { add(x, 'ui-text'); });
  }

  /* ---- 戻る / 前へ / 次へ をボタン化 ---- */
  var NAV = { '戻る': 'back', '前へ': 'prev', '次へ': 'next', '補充単語': 'more' };
  var rows = [];
  $all('a').forEach(function (a) {
    var k = NAV[txt(a)];
    if (!k || a.closest('#title')) return;
    add(a, 'ui-btn'); add(a, 'ui-btn--' + k);
    var p = a.closest('td,p,h1,div');
    if (p && rows.indexOf(p) < 0) rows.push(p);
  });
  rows.forEach(function (p) {
    if (p.closest('.ui-text') && type !== 'grammar') { /* 本文表の中の「次へ」行 */ }
    add(p, 'ui-navrow');
    Array.prototype.slice.call(p.childNodes).forEach(function (n) {
      if (n.nodeType === 3 && !n.nodeValue.replace(/[\s\u3000\u00a0]/g, '')) p.removeChild(n);
    });
  });

  /* ---- 採点結果に色と言葉を添える（判定そのものは元のまま） ---- */
  function mark(l) {
    var v = (l.textContent || '').trim();
    l.classList.remove('ui-ok', 'ui-ng');
    if (!v) return;
    l.classList.add(v === '〇' ? 'ui-ok' : 'ui-ng');
  }
  $all('label[id$="_R"]').forEach(function (l) {
    new MutationObserver(function () { mark(l); }).observe(l, { childList: true, characterData: true, subtree: true });
  });

  /* ---- 横にはみ出す表はスクロール枠へ ---- */
  $all('table').forEach(function (x) {
    if (x.id === 'title' || x.closest('.ui-scroll')) return;
    if (x.scrollWidth > b.clientWidth + 4) {
      var w = d.createElement('div'); w.className = 'ui-scroll';
      x.parentNode.insertBefore(w, x); w.appendChild(x);
    }
  });

  /* ---- 課ハブ：既存リンクからカードを作る（URLは元のまま） ---- */
  if (type === 'hub') {
    var h1 = d.querySelector('h1');
    var title = h1 ? h1.textContent.replace(/[\s\u3000\u00a0]+/g, ' ').trim() : d.title;
    var m = title.match(/^(第\s*\S+?課)\s*(.*)$/);
    var items = [['本文', '-h-1.html', '会話・本文を聞く'], ['単語', '-t1-1.html', '新出単語'], ['文法', '-p.html', 'ポイント'], ['宿題', '-l.html', '練習問題・提出']];
    var cards = [];
    items.forEach(function (it) {
      var a = $all('a').filter(function (x) { return txt(x) === it[0]; })[0] ||
              $all('a').filter(function (x) { return (x.getAttribute('href') || '').indexOf(it[1]) > -1; })[0];
      if (!a) return;
      var img = $all('img').filter(function (i) { return /images\/[2-5]\.png/.test(i.getAttribute('src')); })[cards.length];
      cards.push({ href: a.getAttribute('href'), t: it[0], s: it[2], img: img ? img.getAttribute('src') : '' });
    });
    if (cards.length >= 3) {
      var legacy = $all('body > table, body > h1, body > div');
      var back = (d.querySelector('a[href$="k1.html"],a[href$="d1.html"]') || {}).getAttribute ? d.querySelector('a[href$="k1.html"],a[href$="d1.html"]').getAttribute('href') : (SITE === 'dokai' ? '../d1.html' : '../k1.html');
      var hero = d.createElement('header'); hero.className = 'ui-hero';
      hero.innerHTML = '<img alt="" src="' + (cards[0].img ? cards[0].img.replace(/[2-5]\.png$/, '6.png') : '') + '"><div><div class="ui-eyebrow"></div><h1 class="ui-h" lang="zh-CN"></h1></div>';
      hero.querySelector('.ui-eyebrow').textContent = (m ? m[1] : '') + (SITE === 'dokai' ? '　初級中国語 読解' : SITE === 'kaiwa' ? '　初級中国語 会話' : '');
      hero.querySelector('.ui-h').textContent = m ? m[2] : title;
      var grid = d.createElement('nav'); grid.className = 'ui-grid'; grid.setAttribute('aria-label', '学習メニュー');
      cards.forEach(function (c, i) {
        var a = d.createElement('a'); a.className = 'ui-card'; a.href = c.href;
        a.innerHTML = (c.img ? '<img alt="" src="' + c.img + '">' : '') + '<span class="ui-card-t"></span><span class="ui-card-s"></span>';
        a.querySelector('.ui-card-t').textContent = (i + 1) + '. ' + c.t;
        a.querySelector('.ui-card-s').textContent = c.s;
        grid.appendChild(a);
      });
      var links = d.createElement('div'); links.className = 'ui-links';
      links.innerHTML = '<a class="ui-btn ui-btn--back" href="' + back + '">課の一覧へ</a>';
      legacy.forEach(function (x) { add(x, 'ui-legacy-hidden'); });
      b.insertBefore(links, b.firstChild); b.insertBefore(grid, b.firstChild); b.insertBefore(hero, b.firstChild);
    }
  }

  $all('.ui-hero img, .ui-card img').forEach(hideBroken);
  /* ---- コース一覧：第1〜14課をカードに ---- */
  if (type === 'index') {
    var L = (window.UI_LESSONS && window.UI_LESSONS.titles) || {};
    var as = $all('a').filter(function (a) { return /^\d+k\/\d+k\.html$/.test(a.getAttribute('href') || ''); });
    var seen = {}, list = [];
    as.forEach(function (a) { var h = a.getAttribute('href'); if (!seen[h]) { seen[h] = 1; list.push(h); } });
    list.sort(function (x, y) { return parseInt(x, 10) - parseInt(y, 10); });
    if (list.length) {
      var hero2 = d.createElement('header'); hero2.className = 'ui-hero';
      var logo = d.querySelector('img[src$="13.png"]');
      hero2.innerHTML = (logo ? '<img alt="" src="' + logo.getAttribute('src') + '">' : '') + '<div><div class="ui-eyebrow">愛知淑徳大学</div><div class="ui-h"></div><div class="ui-sub">課を選んで、本文 → 単語 → 文法 → 宿題 の順に進めましょう。</div></div>';
      hero2.querySelector('.ui-h').textContent = d.title;
      var g = d.createElement('nav'); g.className = 'ui-grid ui-lessons'; g.setAttribute('aria-label', '課の一覧');
      list.forEach(function (h) {
        var n = parseInt(h, 10), t = L[n] || '';
        var a = d.createElement('a'); a.className = 'ui-card ui-lesson'; a.href = h;
        a.innerHTML = '<span class="ui-num">' + n + '</span><span class="ui-lt"><small>第' + n + '課</small><b lang="zh-CN"></b></span>';
        a.querySelector('b').textContent = t.replace(/^第\s*\S+?課\s*/, '');
        g.appendChild(a);
      });
      var links2 = d.createElement('div'); links2.className = 'ui-links';
      var how = d.querySelector('a[href$="-m.html"]');
      if (how) links2.innerHTML = '<a class="ui-btn" href="' + how.getAttribute('href') + '">使い方</a>';
      $all('body > *').forEach(function (x) { if (x.tagName !== 'SCRIPT') add(x, 'ui-legacy-hidden'); });
      $all('body > *').forEach(function (x) { if (x.nodeType === 3) x.remove(); });
      b.insertBefore(links2, b.firstChild); b.insertBefore(g, b.firstChild); b.insertBefore(hero2, b.firstChild);
      Array.prototype.slice.call(b.childNodes).forEach(function (n) { if (n.nodeType === 3) n.nodeValue = ''; });
    }
  }
  $all('.ui-hero img, .ui-card img').forEach(hideBroken);
})();
