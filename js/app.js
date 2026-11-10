/* Kisti — sample (Old Persian cuneiform, Lesson 1). Vanilla JS, hash routing, localStorage progress. */
(function () {
  'use strict';
  var K = window.KISTI, app = document.getElementById('app');
  var STORE = 'kisti-progress-v1';
  var SIG = {}; K.signs.forEach(function (s) { SIG[s.id] = s; });
  var DIV = '\u{103D0}';
  var FA_DIG = '۰۱۲۳۴۵۶۷۸۹';
  function fn(n) { return String(n).replace(/\d/g, function (d) { return FA_DIG[d]; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function $(sel) { return app.querySelector(sel); }
  var OPRUN = /([\u{103A0}-\u{103DF}]+)/gu;
  function render(h) { app.innerHTML = h.replace(/>([^<]*)</g, function (m, txt) { return '>' + txt.replace(OPRUN, '<span class="cu">$1</span>') + '<'; }); }

  /* ---------- progress ---------- */
  var P = load();
  function load() {
    try { var p = JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { p = {}; }
    p.done = p.done || {}; p.seen = p.seen || []; p.words = p.words || {}; p.lines = p.lines || {};
    return p;
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(P)); } catch (e) {} }
  function markDone(stage) { if (!P.done[stage]) { P.done[stage] = true; save(); } }
  if (navigator.storage && navigator.storage.persist) { try { navigator.storage.persist(); } catch (e) {} }

  /* ---------- audio: preloaded, instant (Web Audio + HTMLAudio fallback) ---------- */
  var Audio_ = (function () {
    var urls = [], raw = {}, buf = {}, els = {}, ctx = null, cur = null;
    K.signs.forEach(function (s) { urls.push(s.audio); });
    K.words.forEach(function (w) { urls.push(w.audio); });
    Object.keys(K.lex).forEach(function (k) { urls.push(K.lex[k].audio); });
    K.inscription.lines.forEach(function (l) { urls.push(l.audio); });
    urls = urls.filter(function (u, i) { return urls.indexOf(u) === i; });
    urls.forEach(function (u) {
      fetch(u).then(function (r) { return r.arrayBuffer(); }).then(function (ab) { raw[u] = ab; if (ctx) decode(u); }).catch(function () {});
      var a = new Audio(); a.preload = 'auto'; a.src = u; els[u] = a;
    });
    function decode(u) {
      if (buf[u] || !raw[u] || !ctx) return;
      var ab = raw[u].slice(0); ctx.decodeAudioData(ab, function (b) { buf[u] = b; }, function () {});
    }
    function unlock() {
      if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return; ctx = new C(); urls.forEach(decode); }
      if (ctx.state === 'suspended') ctx.resume();
    }
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, unlock, { capture: true, passive: true }); });
    function stop() { if (cur) { try { cur.stop ? cur.stop() : (cur.pause(), cur.currentTime = 0); } catch (e) {} cur = null; } }
    function play(u) {
      if (!u) return; unlock(); stop();
      if (ctx && buf[u]) { var s = ctx.createBufferSource(); s.buffer = buf[u]; s.connect(ctx.destination); s.start(0); cur = s; return; }
      var a = els[u] || new Audio(u); try { a.currentTime = 0; } catch (e) {} var pr = a.play(); if (pr && pr.catch) pr.catch(function () {}); cur = a;
    }
    return { play: play };
  })();

  function toast(msg) { var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  function bar(title, step) {
    return '<header class="bar"><button class="back" data-go="home" aria-label="بازگشت">→</button><h2>' + title + '</h2>' + (step ? '<span class="step">' + step + '</span>' : '') + '</header>';
  }
  function stageIndex(id) { for (var i = 0; i < K.stages.length; i++) if (K.stages[i].id === id) return i; return -1; }
  function nextBtn(id) {
    var i = stageIndex(id), n = K.stages[i + 1];
    return n ? '<button class="btn btn-gold btn-block" data-go="' + n.id + '">مرحلهٔ بعد: ' + n.name + ' ←</button>' : '<button class="btn btn-gold btn-block" data-go="home">بازگشت به خانه</button>';
  }

  /* ---------- home ---------- */
  function home() {
    var doneN = K.stages.filter(function (s) { return P.done[s.id]; }).length;
    var nextId = (K.stages.filter(function (s) { return !P.done[s.id]; })[0] || {}).id;
    var h = '<section class="hero"><img class="hero-img" src="images/persepolis-gate.webp" alt="دروازهٔ ملل در تخت جمشید" fetchpriority="high">' +
      '<div class="hero-top"><img class="mini-logo" src="icons/icon-192.png" alt="Kisti"><img class="flag" src="images/shir-o-khorshid.svg" alt="پرچم شیر و خورشید"></div>' +
      '<h1 dir="ltr">Kisti</h1><p class="tag">کیستی · خواندن خط‌های باستانی ایران</p>' +
      '<p class="lede">از الفبا تا خواندن کتیبه‌های واقعی؛ همه به زبان فارسی و ساده. با نشانه‌های میخی شروع می‌کنیم که داریوش بزرگ بر سنگ بیستون کند.</p>' +
      '<div class="hero-actions"><button class="btn btn-gold" data-go="' + (nextId || 'alphabet') + '">' + (doneN ? 'ادامهٔ درس ۱' : 'شروع درس ۱') + '</button><button class="btn btn-ghost" data-install>📲 نصب اپ</button></div>' +
      '<p class="credit">ساخته شده توسط <b dir="ltr" lang="en">Daniel Mozafari</b></p></section>';
    h += '<section class="sec"><div class="sec-h"><h2>سه خط باستانی</h2><span class="rule"></span></div><div class="scripts">' +
      K.scripts.map(function (s) {
        return '<button class="script' + (s.active ? '' : ' soon') + '" ' + (s.active ? 'data-go="alphabet"' : 'data-soon="1"') + '><img src="' + s.img + '" alt="" loading="lazy"><div class="body"><h3>' + s.name + '</h3><div class="latin en">' + s.latin + '</div><p>' + s.blurb + '</p>' +
          (s.sample ? '<div class="sample cu">' + s.sample + '</div>' : '') + '<span class="pill ' + (s.active ? 'pill-on">فعال · درس ۱' : 'pill-soon">به‌زودی') + '</span></div></button>';
      }).join('') + '</div></section>';
    h += '<section class="sec"><div class="sec-h"><h2>درس ۱ · خط میخی</h2><span class="rule"></span></div>' +
      '<div class="lesson-head"><h3>نخستین نشانه‌ها و نام داریوش</h3><p>چهار گام: الفبا ← واژه ← جمله ← کتیبه</p><div class="prog"><i style="width:' + (doneN * 25) + '%"></i></div><div class="prog-t">' + fn(doneN) + ' از ۴ گام تمام شده</div></div>' +
      '<div class="stages">' + K.stages.map(function (s) {
        var d = P.done[s.id], nx = s.id === nextId;
        return '<button class="stage' + (d ? ' done' : nx ? ' next' : '') + '" data-go="' + s.id + '"><span class="ic cu">' + s.icon + '</span><span class="t"><b>' + fn(s.n) + '. ' + s.name + '</b><span>' + s.desc + '</span></span><span class="st">' + (d ? '✓ تمام شد' : nx ? 'شروع' : 'باز') + '</span></button>';
      }).join('') + '</div></section>';
    h += '<section class="sec"><div class="name-card"><h3>نام تو به خط میخی ✨</h3><p>نامت را به فارسی بنویس تا ببینی دبیران داریوش چطور آن را می‌نوشتند (تقریبی و برای سرگرمی).</p>' +
      '<div class="name-row"><input id="nm" type="text" inputmode="text" autocomplete="off" placeholder="مثلاً دانیال" maxlength="20" value="' + esc(P.name || '') + '"></div><div class="name-out" id="nmo"></div></div></section>';
    h += '<section class="sec"><div class="sec-h"><h2>شکوه ایران باستان</h2><span class="rule"></span></div><div class="gallery">' +
      K.gallery.map(function (g) { return '<figure class="g-item" style="margin:0"><img src="' + g.img + '" alt="' + g.name + '" loading="lazy"><div><b>' + g.name + '</b><span>' + g.era + '</span></div></figure>'; }).join('') + '</div></section>';
    h += '<p class="foot">تلفظ‌ها بازسازی تقریبی پارسی باستان‌اند. · <button data-go="credits">منبع عکس‌ها</button></p>';
    render(h);
    var nm = $('#nm'); function upd() { P.name = nm.value; save(); $('#nmo').innerHTML = nameOut(nm.value); } nm.addEventListener('input', upd); upd();
  }

  /* ---------- name in cuneiform (approximate, playful) ---------- */
  var CMAP = { 'ب': '𐎲', 'پ': '𐎱', 'ت': '𐎫', 'ط': '𐎫', 'ث': '𐎰', 'ج': '𐎩', 'چ': '𐎨', 'ح': '𐏃', 'ه': '𐏃', 'خ': '𐎧', 'د': '𐎭', 'ذ': '𐏀', 'ر': '𐎼', 'ز': '𐏀', 'ژ': '𐏀', 'ض': '𐏀', 'ظ': '𐏀',
    'س': '𐎿', 'ص': '𐎿', 'ش': '𐏁', 'ف': '𐎳', 'ق': '𐎥', 'غ': '𐎥', 'ک': '𐎣', 'ك': '𐎣', 'گ': '𐎥', 'ل': '𐎾', 'م': '𐎶', 'ن': '𐎴' };
  function nameOut(s) {
    s = (s || '').trim().replace(/[ًٌٍَُِّْ]/g, '').replace(/ي/g, 'ی').replace(/أ|إ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی');
    if (!s) return '<small>نامت اینجا به خط میخی نوشته می‌شود</small>';
    var words = s.split(/\s+/).map(function (w) {
      var out = '', ch = Array.from(w);
      for (var i = 0; i < ch.length; i++) {
        var c = ch[i], prev = ch[i - 1], next = ch[i + 1], start = i === 0;
        var nextV = next === 'ا' || next === 'آ' || next === 'و' || next === 'ی';
        if (c === 'آ') out += '𐎠';
        else if (c === 'ا' || c === 'ع' || c === 'ء') out += start || c === 'ا' ? '𐎠' : '';
        else if (c === 'ی') out += (start || prev === 'ا' || prev === 'و') ? '𐎹' : (nextV ? '𐎡𐎹' : '𐎡');
        else if (c === 'و') out += (start || prev === 'ا') ? '𐎺' : (nextV ? '𐎢𐎺' : '𐎢');
        else if (CMAP[c]) out += CMAP[c];
      }
      return out;
    }).filter(Boolean);
    if (!words.length) return '<small>فقط حرف‌های فارسی را بنویس</small>';
    return '<div class="cu">' + words.join(DIV) + '</div><small>' + esc(s) + ' · به شیوهٔ کتیبه‌ها، از چپ به راست</small>';
  }

  /* ---------- 1. alphabet ---------- */
  var A = { sel: 'a', quiz: null };
  function alphabet() {
    var s = SIG[A.sel];
    if (P.seen.indexOf(s.id) < 0) { P.seen.push(s.id); save(); }
    var h = bar('گام ۱ · الفبای میخی', fn(P.seen.length) + ' از ' + fn(K.signs.length));
    h += '<div class="card intro"><h3>خط میخی پارسی باستان چیست؟</h3><p>خطی که در زمان داریوش بزرگ (حدود ۵۲۰ پیش از میلاد) برای نوشتن زبان پارسی باستان ساخته شد. حدود ۳۶ نشانهٔ آوایی، چند «اندیشه‌نگار» (مثل 𐏋 «شاه»)، چند عدد و یک جداکنندهٔ واژه 𐏐 دارد.</p>' +
      '<p><b>دو نکتهٔ مهم:</b> این خط <b>از چپ به راست</b> نوشته می‌شود. و بیشتر نشانه‌ها «هجا» هستند: هم‌خوان + «اَ»؛ یعنی 𐎭 خودش «دَ» است.</p></div>';
    h += '<div class="card detail"><div class="big cu">' + s.g + '</div><div class="row"><span class="lat">' + s.tr + '</span><span class="fa">' + s.fa + '</span></div>' +
      '<button class="play" data-play="' + s.audio + '">🔊 بشنو</button><p class="shape">شکل: ' + s.shape + '</p><p class="txt">' + s.text + '</p></div>';
    h += '<div class="sign-grid">' + K.signs.map(function (x) {
      return '<button class="sign' + (x.id === A.sel ? ' sel' : '') + (P.seen.indexOf(x.id) >= 0 ? ' seen' : '') + '" data-sign="' + x.id + '"><span class="cu">' + x.g + '</span><span class="lat">' + x.tr + '</span></button>';
    }).join('') + '</div>';
    h += '<div class="sec"><button class="btn btn-lapis btn-block" data-act="quiz">آزمونک: این کدام نشانه است؟</button>' + (P.done.alphabet ? '<div style="height:10px"></div>' + nextBtn('alphabet') : '') + '</div>';
    render(h);
  }
  function makeQuiz() {
    var order = shuffle(K.signs).concat(shuffle(K.signs).slice(0, 2));
    return { i: 0, score: 0, qs: order.map(function (s, n) {
      var others = shuffle(K.signs.filter(function (x) { return x.id !== s.id; })).slice(0, 3);
      return { s: s, type: n % 2 ? 'g' : 't', opts: shuffle(others.concat([s])), tried: false };
    }) };
  }
  function quiz() {
    var Q = A.quiz;
    if (Q.i >= Q.qs.length) {
      var pass = Q.score >= 7; if (pass) markDone('alphabet');
      render(bar('آزمونک الفبا') + '<div class="card celebrate"><div class="big">' + (pass ? '🏛️' : '📜') + '</div><h3>' + (pass ? 'آفرین! الفبای درس ۱ را یاد گرفتی' : 'خوب بود، یک بار دیگر تمرین کن') + '</h3><p>' + fn(Q.score) + ' از ' + fn(Q.qs.length) + ' پاسخ درست در نخستین تلاش</p></div><div class="sec">' +
        (pass ? nextBtn('alphabet') : '<button class="btn btn-gold btn-block" data-act="quiz">دوباره</button>') + '<div style="height:10px"></div><button class="btn btn-line btn-block" data-go="alphabet">مرور نشانه‌ها</button></div>');
      return;
    }
    var q = Q.qs[Q.i];
    var h = bar('آزمونک الفبا', fn(Q.i + 1) + ' از ' + fn(Q.qs.length));
    h += '<div class="card quiz"><div class="dots">' + Q.qs.map(function (_, n) { return '<i class="' + (n < Q.i ? 'on' : n === Q.i ? 'cur' : '') + '"></i>'; }).join('') + '</div>';
    if (q.type === 't') h += '<p class="q">این کدام نشانه است؟</p><div class="qg cu">' + q.s.g + '</div><div class="opts">' + q.opts.map(function (o) { return '<button class="opt" data-ans="' + o.id + '"><span class="lat">' + o.tr.split(' / ')[0] + '</span> · ' + o.fa.split(' / ').pop() + '</button>'; }).join('') + '</div>';
    else h += '<p class="q">نشانهٔ «' + q.s.fa + '» (<span class="lat">' + q.s.tr + '</span>) کدام است؟</p><div style="height:10px"></div><div class="opts">' + q.opts.map(function (o) { return '<button class="opt" data-ans="' + o.id + '"><span class="cu">' + o.g + '</span></button>'; }).join('') + '</div>';
    h += '</div>';
    render(h);
  }
  function answer(btn) {
    var Q = A.quiz, q = Q.qs[Q.i], id = btn.getAttribute('data-ans');
    if (id === q.s.id) {
      btn.classList.add('ok'); if (!q.tried) Q.score++; Audio_.play(q.s.audio);
      app.querySelectorAll('.opt').forEach(function (b) { b.disabled = true; });
      setTimeout(function () { Q.i++; quiz(); }, 750);
    } else { q.tried = true; btn.classList.add('bad'); btn.disabled = true; }
  }

  /* ---------- builder (shared by words & sentence) ---------- */
  var W = { i: 0 }, B = null;
  function newBuilder(answer, pool) { return { answer: answer, tiles: shuffle(pool.map(function (v, k) { return { v: v, k: k }; })), picked: [], wrong: 0, help: false, solved: false, viaHelp: false }; }
  function slotsHtml(kind) {
    var n = B.answer.length, out = [];
    for (var j = 0; j < n; j++) {
      var v = B.picked[j] != null ? B.tiles.filter(function (t) { return t.k === B.picked[j]; })[0].v : null;
      if (kind === 'sent' && j > 0) out.push('<span class="divider">' + DIV + '</span>');
      if (kind === 'word') out.push('<span class="slot cu' + (v ? '' : ' empty') + '">' + (v ? SIG[v].g : '·') + '</span>');
      else out.push('<span class="slot word' + (v ? '' : ' empty') + '">' + (v ? '<span class="cu">' + K.lex[v].g + '</span><small>' + K.lex[v].tr + '</small>' : '·') + '</span>');
    }
    return out.join('');
  }
  function tilesHtml(kind) {
    var nextNeed = B.help ? B.answer[B.picked.length] : null, hinted = false;
    return B.tiles.map(function (t) {
      var used = B.picked.indexOf(t.k) >= 0, hint = !used && !hinted && nextNeed === t.v; if (hint) hinted = true;
      var inner = kind === 'word' ? '<span class="cu">' + SIG[t.v].g + '</span>' : '<span class="cu">' + K.lex[t.v].g + '</span><small>' + K.lex[t.v].tr + '</small>';
      return '<button class="tile' + (kind === 'word' ? '' : ' word') + (used ? ' used' : '') + (hint ? ' hint' : '') + '" data-tile="' + t.k + '">' + inner + '</button>';
    }).join('');
  }
  function pickTile(k, kind, rerender) {
    if (B.solved) return;
    B.picked.push(k);
    var t = B.tiles.filter(function (x) { return x.k === k; })[0];
    if (kind === 'word') Audio_.play(SIG[t.v].audio); else Audio_.play(K.lex[t.v].audio);
    if (B.picked.length === B.answer.length) {
      var got = B.picked.map(function (p) { return B.tiles.filter(function (x) { return x.k === p; })[0].v; });
      if (got.join() === B.answer.join()) { B.solved = true; rerender('ok'); return; }
      B.wrong++; rerender('bad');
      setTimeout(function () { B.picked = []; rerender(); }, 700);
      return;
    }
    rerender();
  }

  /* ---------- 2. words ---------- */
  function wordsInit() {
    var w = K.words[W.i];
    var learned = K.signs.map(function (s) { return s.id; }).filter(function (id) { return w.signs.indexOf(id) < 0; });
    B = newBuilder(w.signs, w.signs.concat(shuffle(learned).slice(0, 2)));
  }
  function words(state) {
    if (!B || B.kind !== 'word') { wordsInit(); B.kind = 'word'; }
    var w = K.words[W.i];
    var h = bar('گام ۲ · واژه‌سازی', fn(W.i + 1) + ' از ' + fn(K.words.length));
    h += '<div class="card task"><div class="goal"><p class="hint">با نشانه‌هایی که یاد گرفتی بنویس:</p><div class="fa">' + w.fa + '</div><div class="lat">' + w.tr + '</div></div>' +
      '<div class="slots' + (state === 'ok' ? ' ok' : state === 'bad' ? ' bad' : '') + '" data-act="undo">' + slotsHtml('word') + '</div>' +
      '<p class="note">از چپ به راست بچین. برای پاک کردن آخرین نشانه، روی خانه‌ها بزن.</p>';
    if (B.solved) {
      h += '<div class="result"><b>✓ درست است!</b> <span class="cu" style="font-size:1.6rem">' + w.signs.map(function (id) { return SIG[id].g; }).join('') + '</span> = ' + w.say + '<p>' + w.note + '</p><p class="today">🌿 <b>در فارسی امروز:</b> ' + w.today + '</p>' +
        '<button class="play small" data-play="' + w.audio + '">🔊 بشنو</button></div>';
      if (B.viaHelp) h += '<div class="actions"><button class="btn btn-gold" data-act="wretry">حالا خودت، از اول</button></div>';
      else h += '<div class="actions"><button class="btn btn-gold" data-act="wnext">' + (W.i < K.words.length - 1 ? 'واژهٔ بعدی ←' : 'پایان واژه‌سازی ←') + '</button></div>';
    } else {
      h += '<div class="tiles">' + tilesHtml('word') + '</div>';
      if (B.wrong >= 2 && !B.help) h += '<div class="actions"><button class="btn btn-line" data-act="help">💡 کمک گرفتن</button></div>';
      if (B.help) h += '<div class="helpbox">پاسخ درست: <span class="cu">' + w.signs.map(function (id) { return SIG[id].g; }).join('') + '</span> <span class="lat">' + w.signs.map(function (id) { return SIG[id].tr.split(' ')[0]; }).join('-') + '</span><br>نشانهٔ بعدی با قاب طلایی مشخص شده است.</div>';
    }
    h += '</div>';
    render(h);
    if (state === 'ok') { Audio_.play(w.audio); if (!B.viaHelp) { P.words[w.id] = true; save(); } }
  }

  /* ---------- 3. sentence ---------- */
  function sentence(state) {
    var S = K.sentence;
    if (!B || B.kind !== 'sent') { B = newBuilder(S.words, S.words); B.kind = 'sent'; }
    var h = bar('گام ۳ · جمله‌سازی');
    h += '<div class="photo-card"><img src="images/darius-behistun.webp" alt="داریوش بزرگ در نگارهٔ بیستون" style="height:200px;object-position:center 20%"><p class="cap">داریوش بزرگ در نگارهٔ بیستون. این جمله سرآغاز کتیبهٔ اوست.</p></div>';
    h += '<div class="card task"><div class="goal"><p class="hint">این جمله را به خط میخی بساز:</p><div class="fa">' + S.fa + '</div></div>' +
      '<div class="slots' + (state === 'ok' ? ' ok' : state === 'bad' ? ' bad' : '') + '" data-act="undo">' + slotsHtml('sent') + '</div><p class="note">جداکنندهٔ 𐏐 خودش میان واژه‌ها می‌آید. از چپ به راست.</p>';
    if (B.solved) {
      h += '<div class="result"><b>✓ آفرین!</b> نخستین جملهٔ کتیبهٔ بیستون را ساختی:<p class="lat" style="font-size:1.1rem">adam Dārayavauš xšāyaθiya vazraka</p><button class="play small" data-play="audio/l-1.mp3">🔊 بشنو</button></div>';
      h += '<div class="actions">' + (B.viaHelp ? '<button class="btn btn-gold" data-act="sretry">حالا خودت، از اول</button>' : nextBtn('sentence')) + '</div>';
    } else {
      h += '<div class="tiles">' + tilesHtml('sent') + '</div>';
      if (B.wrong >= 2 && !B.help) h += '<div class="actions"><button class="btn btn-line" data-act="help">💡 کمک گرفتن</button></div>';
      if (B.help) h += '<div class="helpbox">ترتیب درست: <span class="lat">adam · Dārayavauš · xšāyaθiya · vazraka</span><br>واژهٔ بعدی با قاب طلایی مشخص شده است.</div>';
    }
    h += '</div><div class="card grammar"><h3>📜 دستور ساده</h3><ul>' + S.grammar.map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ul></div>';
    render(h);
    if (state === 'ok') { Audio_.play('audio/l-1.mp3'); if (!B.viaHelp) markDone('sentence'); }
  }

  /* ---------- 4. inscription ---------- */
  var I = { sel: null };
  function inscription() {
    var C = K.inscription, readN = Object.keys(P.lines).length;
    var h = bar('گام ۴ · کتیبه‌خوانی', fn(readN) + ' از ' + fn(C.lines.length));
    h += '<div class="photo-card"><img src="images/behistun.webp" alt="کتیبه و نگارهٔ بیستون"><p class="cap">کتیبه و نگارهٔ بیستون، کرمانشاه. میراث جهانی یونسکو.</p></div>';
    h += '<div class="card intro"><h3>' + C.title + '</h3><p class="lat" style="font-size:.85rem;font-style:normal;color:var(--mut)">' + C.ref + '</p><p>' + C.about + '</p><p>👆 روی هر واژهٔ میخی بزن تا معنی و صدایش را ببینی؛ دکمهٔ 🔊 کل سطر را می‌خواند.</p></div>';
    h += '<div class="lines">' + C.lines.map(function (l, n) {
      var cu = l.w.map(function (k, j) { return (j ? '<span class="divider">' + DIV + '</span>' : '') + '<button class="wbtn' + (I.sel === n + ':' + j ? ' on' : '') + '" data-w="' + n + ':' + j + '">' + K.lex[k].g + '</button>'; }).join('');
      var gl = '';
      if (I.sel && I.sel.split(':')[0] == n) { var L = K.lex[l.w[+I.sel.split(':')[1]]]; gl = '<div class="gloss"><span class="cu">' + L.g + '</span> · <span class="lat">' + L.tr + '</span> = <b>' + L.fa + '</b>' + (L.today ? '<br>🌿 ' + L.today : '') + '</div>'; }
      return '<div class="line' + (P.lines[n] ? ' read' : '') + '"><div class="num"><span>سطر ' + fn(n + 1) + (P.lines[n] ? ' · ✓ خوانده شد' : '') + '</span><button class="play small" data-line="' + n + '">🔊</button></div><div class="cuw">' + cu + '</div><div class="tr">' + l.w.map(function (k) { return K.lex[k].tr; }).join(' ') + '</div><div class="fa">' + l.fa + '</div>' + gl + '</div>';
    }).join('') + '</div>';
    h += '<div class="card intro"><h3>🔎 نکته‌های خواندن</h3><p>• پسوند <span class="lat">‎-ānām‎</span> = «ـانِ» (جمع، وابستگی): xšāyaθiyānām = «شاهان».</p><p>• پسوند <span class="lat">‎-ahyā‎</span> = کسرهٔ اضافه: Vištāspahyā puça = «پسرِ ویشتاسپ».</p><p>• در برخی کتیبه‌های دیگر، «شاه» را با یک اندیشه‌نگار می‌نویسند: <span class="cu" style="font-size:1.6rem">𐏋</span></p></div>';
    h += '<div class="sec">' + (P.done.inscription ? '<div class="card celebrate"><div class="big">🏛️</div><h3>درس ۱ تمام شد!</h3><p>تو نخستین بند کتیبهٔ بیستون را خواندی.</p></div><div style="height:10px"></div>' : '') + '<button class="btn btn-gold btn-block" data-act="ifinish">' + (P.done.inscription ? 'بازگشت به خانه' : 'خواندم ✓') + '</button></div>';
    render(h);
  }

  /* ---------- credits ---------- */
  function credits() {
    render(bar('منبع عکس‌ها') + '<div class="card credits"><p style="margin-bottom:10px">همهٔ عکس‌ها از Wikimedia Commons با پروانهٔ آزاد هستند. قلم میخی: Noto Sans Old Persian (SIL OFL). قلم فارسی: Vazirmatn (SIL OFL). صداها با صدای مصنوعی فارسی و به‌صورت بازسازی تقریبی ساخته شده‌اند.</p><ul id="cl"><li>…</li></ul></div>');
    fetch('data/credits.json').then(function (r) { return r.json(); }).then(function (cr) {
      document.getElementById('cl').innerHTML = cr.map(function (c) { return '<li><b>' + esc(c.title) + '</b> — ' + esc(c.author || 'Unknown') + ' · <a href="' + esc(c.licenseUrl || c.source) + '" target="_blank" rel="noopener">' + esc(c.license) + '</a> · <a href="' + esc(c.source) + '" target="_blank" rel="noopener">source</a></li>'; }).join('');
    }).catch(function () {});
  }

  /* ---------- routing & events ---------- */
  var routes = { home: home, alphabet: alphabet, quiz: quiz, words: function () { B = null; words(); }, sentence: function () { B = null; sentence(); }, inscription: inscription, credits: credits };
  function route() {
    var r = (location.hash || '#home').slice(1);
    if (r === 'quiz' && !A.quiz) A.quiz = makeQuiz();
    (routes[r] || home)(); window.scrollTo(0, 0);
  }
  function go(r) { if (location.hash === '#' + r) route(); else location.hash = r; }
  window.addEventListener('hashchange', route);
  app.addEventListener('click', function (e) {
    var t = e.target.closest('button, [data-act]'); if (!t) return;
    var r = t.getAttribute('data-go'), act = t.getAttribute('data-act');
    if (r) { if (r === 'words') W.i = firstUndoneWord(); go(r); return; }
    if (t.hasAttribute('data-soon')) { toast('این خط در نسخهٔ کامل می‌آید'); return; }
    if (t.hasAttribute('data-play')) { Audio_.play(t.getAttribute('data-play')); t.classList.remove('playing'); void t.offsetWidth; t.classList.add('playing'); return; }
    if (t.hasAttribute('data-sign')) { A.sel = t.getAttribute('data-sign'); Audio_.play(SIG[A.sel].audio); var y = window.scrollY; alphabet(); window.scrollTo(0, Math.min(y, document.querySelector('.detail').offsetTop - 70)); return; }
    if (t.hasAttribute('data-ans')) { answer(t); return; }
    var view = location.hash.slice(1);
    if (t.hasAttribute('data-tile')) { var k = +t.getAttribute('data-tile'); pickTile(k, view === 'words' ? 'word' : 'sent', view === 'words' ? words : sentence); return; }
    if (t.hasAttribute('data-w')) { var p = t.getAttribute('data-w'), n = +p.split(':')[0]; I.sel = I.sel === p ? null : p; Audio_.play(K.lex[K.inscription.lines[n].w[+p.split(':')[1]]].audio); var y2 = window.scrollY; inscription(); window.scrollTo(0, y2); return; }
    if (t.hasAttribute('data-line')) { var ln = +t.getAttribute('data-line'); Audio_.play(K.inscription.lines[ln].audio); if (!P.lines[ln]) { P.lines[ln] = true; save(); var y3 = window.scrollY; inscription(); window.scrollTo(0, y3); } return; }
    switch (act) {
      case 'quiz': A.quiz = makeQuiz(); go('quiz'); break;
      case 'undo': if (B && !B.solved && B.picked.length) { B.picked.pop(); (view === 'words' ? words : sentence)(); } break;
      case 'help': B.help = true; B.viaHelp = true; B.picked = []; (view === 'words' ? words : sentence)(); break;
      case 'wretry': wordsInit(); B.kind = 'word'; words(); toast('حالا بدون کمک، از اول'); break;
      case 'wnext':
        if (W.i < K.words.length - 1) { W.i++; B = null; words(); window.scrollTo(0, 0); }
        else { markDone('words'); render(bar('گام ۲ · واژه‌سازی') + '<div class="card celebrate"><div class="big">🏺</div><h3>چهار واژهٔ نخست را نوشتی!</h3><p class="lat">adam · Pārsa · pasā · imam</p></div><div class="sec">' + nextBtn('words') + '</div>'); }
        break;
      case 'sretry': B = newBuilder(K.sentence.words, K.sentence.words); B.kind = 'sent'; sentence(); toast('حالا بدون کمک، از اول'); break;
      case 'ifinish': if (P.done.inscription) go('home'); else { markDone('inscription'); var y4 = window.scrollY; inscription(); window.scrollTo(0, y4 + 200); } break;
    }
  });
  function firstUndoneWord() { for (var i = 0; i < K.words.length; i++) if (!P.words[K.words[i].id]) return i; return 0; }
  W.i = firstUndoneWord();
  route();

  /* splash: 3 seconds */
  var sp = document.getElementById('splash');
  setTimeout(function () { sp.classList.add('out'); sp.setAttribute('aria-hidden', 'true'); setTimeout(function () { sp.remove(); }, 700); }, 3000);
})();
