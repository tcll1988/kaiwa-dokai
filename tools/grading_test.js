#!/usr/bin/env node
/* 採点ルールのテスト（quiz.js の比べ方）。ブラウザ不要：node tools/grading_test.js
 *   N3: 数字式ピンインは音節ごとに比べる
 *       - すべての答え（Nk-a.js の数字式ピンイン全部）がそのまま〇、声調数字を音節末尾に動かしても〇、大文字・声調記号でも〇
 *       - 声調数字を別の音節に動かすと ×（例：di4di の答えに didi4 は ×）。QA で指摘の 16 か所は必ず ×
 *   N4: 原版は完全一致（句読点も区別）→ 句読点の違いは ×、全角半角・空白の違いだけ〇
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.dirname(__dirname);
let fail = 0, pass = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('NG', msg); } };

for (const site of ['kaiwa', 'dokai']) {
  const src = fs.readFileSync(path.join(ROOT, site, 'assets/js/quiz.js'), 'utf8');
  const doc = { readyState: 'complete', body: { textContent: '' }, querySelectorAll: () => [], getElementById: () => null, addEventListener() {} };
  const win = { document: doc, console };
  vm.runInNewContext(src, { window: win, document: doc, location: { pathname: '/' }, console });
  const Q = win.KDQuiz;
  const input = { tagName: 'INPUT' }, select = { tagName: 'SELECT' };
  const same = (v, a, el = input) => Q.same(el, v, a);

  // --- Nk-a.js の数字式ピンインの答えを全部集める ---
  const answers = [];
  for (const s2 of ['kaiwa', 'dokai'])
    for (const k of fs.readdirSync(path.join(ROOT, s2)).filter(x => /^\d+k$/.test(x))) {
      const f = path.join(ROOT, s2, k, 'homework', s2, k + '-a.js');
      if (!fs.existsSync(f)) continue;
      const t = fs.readFileSync(f, 'utf8').replace(/^\s*\/\/.*$/mg, '');
      for (const m of t.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
        const x = m[1]; if (x.indexOf('#') < 0) continue;
        for (const part of x.split('#').slice(1).join('#').split('@')) {
          const p = part.normalize('NFKC').toLowerCase().replace(/[\s']+/g, '');
          if (/^[a-zü:v0-5]+$/.test(p) && /[a-z]/.test(p) && /[1-5]/.test(p)) answers.push({ f: path.relative(ROOT, f), a: part });
        }
      }
    }
  ok(answers.length >= 140, site + ': 数字式ピンインの答えが見つからない ' + answers.length);

  let moved = 0, wrongSyl = 0;
  for (const { f, a } of answers) {
    ok(!Q.pySplit || Q.pySplit(a.toLowerCase().replace(/[0-9]/g, '')) !== null, `${f} ${a} を音節に区切れない`);
    ok(same(a, a), `${f} 答えそのまま ${a} が〇にならない`);
    ok(same(a.toUpperCase(), a) && same(a.toLowerCase(), a), `${f} 大文字小文字 ${a}`);
    ok(same('　' + a.replace(/[a-z0-9]/gi, c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)) + ' ', a), `${f} 全角 ${a}`);
    // 声調数字を各音節の末尾へ（hao3 型）→ 〇
    const key = Q.pyKey(a);                 // 例 "di4.di"
    const sylEnd = key.split('.').join('');
    ok(same(sylEnd, a), `${f} 音節末尾型 ${sylEnd} が〇にならない（答え ${a}）`); moved++;
    // 声調記号（ǎ など）→ 〇
    const marks = { 1: '\u0304', 2: '\u0301', 3: '\u030c', 4: '\u0300' };
    const dia = a.replace(/([a-zü])([1-4])/gi, (m0, c, n) => (c + marks[n]).normalize('NFC')).replace(/5/g, '');
    if (!/5/.test(a)) ok(same(dia, a), `${f} 声調記号 ${dia} が〇にならない（答え ${a}）`);
    // 声調数字を別の音節へ → ×
    const syl = key.split('.').map(s => ({ t: s.replace(/[0-9]/g, ''), n: s.replace(/[^0-9]/g, '') }));
    if (syl.length > 1) {
      for (let i = 0; i < syl.length; i++) for (let j = 0; j < syl.length; j++) {
        if (i === j || !syl[i].n || syl[j].n) continue;
        const v = syl.map((s, k) => s.t + (k === i ? '' : k === j ? syl[i].n : s.n)).join('');
        ok(!same(v, a), `${f} 別の音節に声調 ${v} が〇になる（答え ${a}）`); wrongSyl++;
      }
      // 全部の数字を最後にまとめる（didi4 型）→ 最後の音節以外に声調があれば ×
      const allEnd = a.replace(/[0-9]/g, '') + a.replace(/[^0-9]/g, '');
      if (syl.slice(0, -1).some(s => s.n)) ok(!same(allEnd, a), `${f} 末尾まとめ ${allEnd} が〇になる（答え ${a}）`);
    }
  }
  // QA の 16 か所（dokai 1k/2k/3k/6k/7k 大問1）
  const qa16 = { di4di: 'didi4', xi3huan: 'xihuan3', xue2sheng: 'xuesheng2', nua3nhuo: 'nuanhuo3', pia4oliang: 'piaoliang4',
    ma1ma: 'mama1', wa3nshang: 'wanshang3', ge1ge: 'gege1', ba4ba: 'baba4', jie3jie: 'jiejie3', ba1ozi: 'baozi1',
    jia3ozi: 'jiaozi3', di4dao: 'didao4', na3inai: 'nainai3', ga4osu: 'gaosu4', ye2ye: 'yeye2' };
  for (const [a, bad] of Object.entries(qa16)) {
    ok(answers.some(x => x.a === a && /^dokai/.test(x.f)), `QA16: 答え ${a} が dokai に無い`);
    ok(!same(bad, a), `QA16: ${bad} が〇になる（答え ${a}）`);
    ok(same(a, a), `QA16: ${a} が〇にならない`);
  }
  // そのほか
  ok(same('hao3', 'ha3o') && same('hǎo', 'ha3o') && same('HA3O', 'ha3o'), 'hao3 = ha3o = hǎo');
  ok(!same('hao4', 'ha3o') && !same('hao', 'ha3o') && !same('ha3o3', 'ha3o'), 'hao4 / 声調なし は ×');
  ok(same('le3ngre4', 'le3ngre4') && same('leng3re4', 'le3ngre4') && !same('lengre34', 'le3ngre4') && !same('le4ngre3', 'le3ngre4'), 'le3ngre4');
  ok(same('zher4', 'zhe4r') && same('e4rlou2', 'e4rlo2u'), '儿化');
  ok(same('ri4ben3', 'Ri4be3n') && !same('riben43', 'Ri4be3n'), 'Ri4be3n');

  // --- N4: 句読点・全角半角・空白 ---
  const T = '我是爱知淑德大学的学生。';
  ok(same(T, T), 'text 完全一致');
  ok(same(' 我是 爱知淑德大学的学生。　', T), 'text 空白（全角含む）は無視');
  ok(!same('我是爱知淑德大学的学生', T), 'text 句点が無いと ×（原版どおり）');
  ok(!same('我是爱知淑德大学的学生.', T), 'text 句点が違うと ×');
  ok(same('老师，您贵姓?', '老师，您贵姓？') && same('老师,您贵姓？', '老师，您贵姓？'), 'text 全角/半角の？，は同じ');
  ok(!same('老师您贵姓？', '老师，您贵姓？'), 'text 読点が無いと ×');
  ok(same('用不了10分钟', '用不了 10 分钟') && same('用不了１０分钟', '用不了 10 分钟'), 'text 10k-l4-4 空白・全角数字');
  ok(same('私の苗字は山田で、山田愛子と言います。', '私の苗字は山田で、山田愛子と言います。'), 'ja 完全一致');
  ok(!same('私の苗字は山田で山田愛子と言います。', '私の苗字は山田で、山田愛子と言います。'), 'ja 読点違いは ×');
  ok(same('B', 'B', select) && !same('C', 'B', select), 'select');
}
console.log(`grading_test: ${pass} OK, ${fail} NG`);
process.exit(fail ? 1 : 0);
