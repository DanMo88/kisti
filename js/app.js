/* Kisti v3 — every screen fits one phone viewport (no vertical scrolling). Old Persian cuneiform: alphabet lesson 1 (learn · mashq · quiz · review) + words · sentence · inscription.
   Vanilla JS, hash routing, localStorage progress (kisti-progress-v1, migrated in place). */
(function () {
  'use strict';
  var K = window.KISTI, app = document.getElementById('app');
  var STORE = 'kisti-progress-v1';
  var SIG = {}; K.signs.forEach(function (s) { SIG[s.id] = s; });
  var L1 = K.lessons[0].signs;
  var DIV = '\u{103D0}';
  var FA_DIG = '۰۱۲۳۴۵۶۷۸۹', LET = ['الف', 'ب', 'ج', 'د'];
  function fn(n) { return String(n).replace(/\d/g, function (d) { return FA_DIG[d]; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function $(sel) { return app.querySelector(sel); }
  var OPRUN = /([\u{103A0}-\u{103DF}]+)/gu;
  function render(h) { app.innerHTML = h.replace(/>([^<]*)</g, function (m, txt) { return '>' + txt.replace(OPRUN, '<span class="cu">$1</span>') + '<'; }); fit(); }

  /* ---------- progress (v1 → v2 migration keeps everything) ---------- */
  var P = load();
  function load() {
    var p; try { p = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { p = {}; }
    p.done = p.done || {}; p.seen = p.seen || []; p.words = p.words || {}; p.lines = p.lines || {};
    p.L = p.L || {}; p.L[1] = p.L[1] || {}; p.nb = p.nb || {};
    if (!p.v) { if (p.done.alphabet) p.L[1].learn = true; p.v = 2; }
    return p;
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(P)); } catch (e) {} }
  function markDone(stage) { if (!P.done[stage]) { P.done[stage] = true; save(); } }
  function partDone(part) { if (!P.L[1][part]) { P.L[1][part] = true; save(); } }
  if (navigator.storage && navigator.storage.persist) { try { navigator.storage.persist(); } catch (e) {} }

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
  var RULE = '<div class="rule"><i></i><i></i><i></i><i></i></div>';
  function head(title, pill, sub, back) {
    return '<header class="page-h"><div class="row"><h1>' + title + '</h1>' + (pill ? '<span class="pill">' + pill + '</span>' : '') +
      (back ? '<button class="back" data-go="' + back + '" aria-label="بازگشت">→</button>' : '') + '</div>' + RULE + (sub ? '<p class="subt">' + sub + '</p>' : '') + '</header>';
  }
  /* one screen = header + flexible body + optional footer bar; never scrolls */
  function page(hd, body, foot, extra) { return hd + '<main class="body">' + body + '</main>' + (foot ? '<footer class="fbar">' + foot + '</footer>' : '') + (extra || ''); }
  function illu(src, alt, cls) { return '<div class="illu ' + (cls || 'grow') + '"><img src="' + src + '" alt="' + esc(alt) + '"></div>'; }
  /* optional illustrations disappear when the phone is too short to show them nicely */
  function fit() {
    app.querySelectorAll('.illu.opt').forEach(function (el) { el.style.display = ''; });
    app.querySelectorAll('.illu.opt').forEach(function (el) { if (el.getBoundingClientRect().height < 72) el.style.display = 'none'; });
  }
  window.addEventListener('resize', function () { clearTimeout(fit.t); fit.t = setTimeout(fit, 80); });
  function stars(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '★' : '☆'; return '<span class="stars">' + s + '</span>'; }
  function seal(on) {
    return '<svg class="seal" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20" fill="' + (on ? '#E3A72F' : '#EFE3C9') + '" stroke="' + (on ? '#B98317' : '#D9CBAE') + '" stroke-width="2" stroke-dasharray="3 2"/>' +
      '<circle cx="22" cy="22" r="14" fill="none" stroke="' + (on ? '#FFF2C9' : '#fff') + '" stroke-width="1.5"/><path d="M22 11l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2L22 27.5l-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1z" fill="' + (on ? '#fff' : '#E2D6BE') + '"/></svg>';
  }

  /* ---------- wedge geometry (unit square, y down) ---------- */
  function wedgePath(w) {
    if (w.t === 'w') {
      var h = w.w / 2;
      return { stroke: true, d: 'M' + (w.x + w.len) + ' ' + (w.y - h) + ' L' + w.x + ' ' + w.y + ' L' + (w.x + w.len) + ' ' + (w.y + h) };
    }
    var dx = w.t === 'v' ? 0 : 1, dy = w.t === 'v' ? 1 : 0, nx = dy, ny = dx, W = (w.w || 0.18) * 0.95, L = w.len;
    var Ax = w.x + nx * W / 2, Ay = w.y + ny * W / 2, Bx = w.x - nx * W / 2, By = w.y - ny * W / 2, Tx = w.x + dx * L, Ty = w.y + dy * L;
    var Cx = w.x + dx * W * 0.22, Cy = w.y + dy * W * 0.22;
    function f(n) { return Math.round(n * 1000) / 1000; }
    return { d: 'M' + f(Ax) + ' ' + f(Ay) + ' L' + f(Tx) + ' ' + f(Ty) + ' L' + f(Bx) + ' ' + f(By) + ' Q' + f(Cx) + ' ' + f(Cy) + ' ' + f(Ax) + ' ' + f(Ay) + ' Z' };
  }
  function wedgeSVG(w, color, op) {
    var p = wedgePath(w);
    return p.stroke ? '<path d="' + p.d + '" fill="none" stroke="' + color + '" stroke-width="0.06" stroke-linejoin="miter" stroke-miterlimit="10" opacity="' + (op || 1) + '"/>'
      : '<path d="' + p.d + '" fill="' + color + '" opacity="' + (op || 1) + '"/>';
  }
  function guideSVG(defs) {
    return defs.map(function (w, i) {
      var nxp, nyp, ax1, ay1, ax2, ay2;
      if (w.t === 'v') { nxp = w.x - 0.11; nyp = w.y + 0.02; ax1 = w.x - 0.11; ay1 = w.y + 0.09; ax2 = w.x - 0.11; ay2 = w.y + Math.min(w.len, 0.4); }
      else if (w.t === 'h') { nxp = w.x - 0.02; nyp = w.y - 0.12; ax1 = w.x + 0.06; ay1 = w.y - 0.12; ax2 = w.x + Math.min(w.len, 0.4); ay2 = w.y - 0.12; }
      else { nxp = w.x - 0.06; nyp = w.y; ax1 = ax2 = ay1 = ay2 = null; }
      var a = ax1 == null ? '' : '<line x1="' + ax1 + '" y1="' + ay1 + '" x2="' + ax2 + '" y2="' + ay2 + '" stroke="#3F9BD6" stroke-width="0.012" stroke-dasharray="0.025 0.015" marker-end="url(#arr)"/>';
      return a + '<circle cx="' + nxp + '" cy="' + nyp + '" r="0.045" fill="#E8734A"/><text x="' + nxp + '" y="' + (nyp + 0.018) + '" font-size="0.055" font-weight="700" fill="#fff" text-anchor="middle" font-family="Vazirmatn">' + fn(i + 1) + '</text>';
    }).join('');
  }
  function padSVG(id, defs, mode, user, cls) {
    var model = '';
    if (mode === 'guide') model = defs.map(function (w) { return wedgeSVG(w, '#C9A56A', 0.38); }).join('') + guideSVG(defs);
    else if (mode === 'faint') model = defs.map(function (w) { return wedgeSVG(w, '#C9A56A', 0.22); }).join('');
    return '<svg id="' + id + '" class="pad-svg ' + (cls || '') + '" viewBox="0 0 1 1" role="img" aria-label="صفحهٔ مشق">' +
      '<defs><marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#3F9BD6"/></marker></defs>' +
      '<g class="model">' + model + '</g><g class="user">' + (user || []).map(function (w) { return wedgeSVG(w, '#5E3A22'); }).join('') + '</g><g class="preview"></g></svg>';
  }
  function classify(S, E, defs) {
    var dx = E.x - S.x, dy = E.y - S.y, dist = Math.hypot(dx, dy);
    var dw = (defs || []).filter(function (w) { return w.t === 'w'; })[0] || { len: 0.32, w: 0.6 };
    if (dist < 0.05) return { t: 'w', x: S.x, y: S.y, len: dw.len, w: dw.w };
    if (Math.abs(dx) <= 0.45 * Math.abs(dy)) return { t: 'v', x: (S.x + E.x) / 2, y: Math.min(S.y, E.y), len: Math.abs(dy), w: 0.18 };
    if (Math.abs(dy) <= 0.45 * Math.abs(dx)) return { t: 'h', x: Math.min(S.x, E.x), y: (S.y + E.y) / 2, len: Math.abs(dx), w: 0.18 };
    var tip = S.x < E.x ? S : E;
    return { t: 'w', x: tip.x, y: tip.y, len: Math.abs(dx), w: Math.max(2 * Math.abs(dy), 0.3) };
  }
  var TNAME = { v: 'میخ ایستاده', h: 'میخ افقی', w: 'گوشه‌میخ' };
  function score(defs, user) {
    var used = {}, matched = 0, dsum = 0, wrongDir = [], missing = [];
    defs.forEach(function (d, i) {
      var best = -1, bd = 9;
      user.forEach(function (u, j) {
        if (used[j] || u.t !== d.t) return;
        var dist = Math.hypot(u.x - d.x, u.y - d.y), tol = d.t === 'w' ? 0.2 : 0.16;
        var r = d.t === 'w' ? 1 : u.len / d.len;
        if (dist < tol && r > 0.45 && r < 1.9 && dist < bd) { bd = dist; best = j; }
      });
      if (best >= 0) { used[best] = true; matched++; dsum += bd; }
      else {
        var near = user.some(function (u, j) { return !used[j] && u.t !== d.t && Math.hypot(u.x - d.x, u.y - d.y) < 0.18; });
        (near ? wrongDir : missing).push(i);
      }
    });
    var extra = user.length - matched, n = defs.length, mean = matched ? dsum / matched : 1;
    var st = matched === n && extra === 0 && mean < 0.085 ? 3 : matched === n && extra <= 1 ? 2 : matched >= Math.ceil(n / 2) ? 1 : 0;
    var msg = [];
    if (st === 3) msg.push('عالی! مثل دبیران داریوش نوشتی.');
    else if (st === 2) msg.push(extra ? 'همهٔ میخ‌ها درست است؛ فقط یک میخ اضافه داری.' : 'همهٔ میخ‌ها درست است؛ جای آن‌ها را کمی دقیق‌تر کن.');
    wrongDir.forEach(function (i) { msg.push('جهت میخ شمارهٔ ' + fn(i + 1) + ' درست نیست؛ باید ' + TNAME[defs[i].t] + ' باشد.'); });
    if (missing.length) msg.push(fn(missing.length) + ' میخ جا افتاده یا جایش دور است: ' + missing.map(function (i) { return TNAME[defs[i].t] + ' ' + fn(i + 1); }).join('، ') + '.');
    if (extra > 1) msg.push(fn(extra) + ' میخ اضافه کشیده‌ای.');
    return { stars: st, msg: msg, matched: matched, n: n };
  }
  /* attach drag-to-place-wedge input to an SVG pad */
  function bindPad(svg, defs, user, onChange) {
    var start = null, pid = null;
    function pt(e) { var r = svg.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) }; }
    svg.addEventListener('pointerdown', function (e) { e.preventDefault(); start = pt(e); pid = e.pointerId; try { svg.setPointerCapture(pid); } catch (x) {} });
    svg.addEventListener('pointermove', function (e) { if (!start || e.pointerId !== pid) return; var w = classify(start, pt(e), defs); svg.querySelector('.preview').innerHTML = wedgeSVG(w, '#E8734A', 0.7); });
    function end(e) {
      if (!start || e.pointerId !== pid) return; var w = classify(start, pt(e), defs); start = null;
      svg.querySelector('.preview').innerHTML = '';
      ['x', 'y', 'len', 'w'].forEach(function (k) { w[k] = Math.round(w[k] * 1000) / 1000; });
      user.push(w); svg.querySelector('.user').innerHTML = user.map(function (u) { return wedgeSVG(u, '#5E3A22'); }).join(''); onChange && onChange();
    }
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', function () { start = null; svg.querySelector('.preview').innerHTML = ''; });
  }
  function thumb(ws, defs) { return '<svg viewBox="0 0 1 1">' + (defs ? defs.map(function (w) { return wedgeSVG(w, '#C9A56A', 0.25); }).join('') : '') + ws.map(function (w) { return wedgeSVG(w, '#5E3A22'); }).join('') + '</svg>'; }
  /* ---------- home: five tabs instead of one long scrolling page ---------- */
  function l1Count() { return K.parts.filter(function (p) { return P.L[1][p.id]; }).length; }
  function nextPart() { var n = K.parts.filter(function (p) { return !P.L[1][p.id]; })[0]; return n ? n.id : null; }
  var TABS = [['home', '🏛️', 'خانه'], ['lessons', '📜', 'درس‌ها'], ['scripts', '𐎠', 'خط‌ها'], ['name', '✍️', 'نام من'], ['gallery', '🖼️', 'شکوه']];
  function tabbar(cur) { return '<nav class="tabbar">' + TABS.map(function (t) { return '<button class="' + (t[0] === cur ? 'on' : '') + '" data-go="' + t[0] + '"><span class="ic">' + t[1] + '</span><span>' + t[2] + '</span></button>'; }).join('') + '</nav>'; }
  function lrow(cls, go, num, title, desc, st, extra) {
    return '<button class="card lrow ' + cls + '" ' + go + '><span class="num">' + num + '</span><span class="t"><b>' + title + '</b>' + (desc ? '<span class="d">' + desc + '</span>' : '') + (extra || '') + '</span>' + (st ? '<span class="st">' + st + '</span>' : '') + '</button>';
  }
  function home() {
    var c = l1Count(), np = nextPart();
    var hd = '<header class="page-h"><div class="row"><img class="mini-logo" src="icons/icon-192.png" alt="Kisti"><h1 class="brand" dir="ltr" style="text-align:right">Kisti</h1><img class="flag" src="images/shir-o-khorshid.svg" alt="پرچم شیر و خورشید"></div>' + RULE +
      '<p class="subt">کیستی · خواندن خط‌های باستانی ایران</p></header>';
    var b = illu('images/persepolis.webp', 'تخت جمشید در روزگار هخامنشیان', 'grow tallok') +
      '<p class="lead">از الفبا تا خواندن کتیبه‌های واقعی؛ همه به فارسی و ساده. هر نشانه را می‌بینی، می‌شنوی و با انگشت <b>مشق</b> می‌کنی.</p>' +
      '<div class="btnrow"><button class="btn btn-coral" data-go="' + (np ? 'lesson1' : 'words') + '">' + (c ? (np ? 'ادامهٔ درس ۱' : 'ادامه: واژه‌سازی') : 'شروع درس ۱') + ' ←</button><button class="btn btn-line" data-install>📲 نصب اپ</button></div>' +
      '<p class="credit">ساخته شده توسط <b dir="ltr" lang="en">Daniel Mozafari</b> · <button class="link" data-go="credits">دربارهٔ تصویرها</button></p>';
    render(hd + '<main class="body">' + b + '</main>' + tabbar('home'));
  }
  function lessonsTab() {
    var c = l1Count(), l = K.lessons[0];
    var b = '<div class="lbl"><b>درس‌های الفبا</b><span class="pill">خط میخی</span></div>' +
      lrow('c1' + (c === 4 ? ' done' : ' next'), 'data-go="lesson1"', fn(1), 'درس ۱ · ' + l.title + ' <span class="glyphs">' + l.signs.map(function (id) { return SIG[id].g; }).join(' ') + '</span>', fn(c) + ' از ۴ بخش: یادگیری، مشق، آزمونک، مرور', c === 4 ? '✓ تمام شد' : c ? 'ادامه' : 'شروع', '<span class="bar"><i style="width:' + c * 25 + '%"></i></span>') +
      '<div class="lstrip">' + K.lessons.slice(1).map(function (x) { return '<button class="ltile" data-soon="1"><span class="num">' + fn(x.n) + '</span><small>🔒</small></button>'; }).join('') + '</div>' +
      '<div class="lbl"><b>از نشانه تا کتیبه</b></div>' +
      K.steps.map(function (s, i) { var d = P.done[s.id]; return lrow('c' + (i + 2) + (d ? ' done' : ''), 'data-go="' + s.id + '"', fn(i + 2), s.name, s.desc, d ? '✓ تمام شد' : 'باز'); }).join('');
    var nbN = Object.keys(P.nb).reduce(function (a, k) { return a + (P.nb[k].tries || []).length; }, 0);
    b += lrow('c5', 'data-go="notebook"', '✍', 'دفتر مشق من', nbN ? fn(nbN) + ' مشق با مُهر ستاره ذخیره شده' : 'هنوز مشقی ننوشته‌ای', 'باز کن') + illu('images/naqsh-rostam.webp', 'نقش رستم', 'grow opt');
    render(head('درس‌ها', null, null, null) + '<main class="body">' + b + '</main>' + tabbar('lessons'));
  }
  function scriptsTab() {
    var b = K.scripts.map(function (s) {
      return '<button class="card script' + (s.active ? '' : ' soon') + '" ' + (s.active ? 'data-go="lesson1"' : 'data-soon="1"') + '><img src="' + s.img + '" alt=""><span class="sbody"><span class="sh"><b>' + s.name + '</b><span class="pill' + (s.active ? '">فعال' : ' gray">به‌زودی') + '</span></span><span class="latin en">' + s.latin + '</span><span class="bl">' + s.blurb + '</span>' +
        (s.sample ? '<span class="sample cu">' + s.sample + '</span>' : '') + '</span></button>';
    }).join('');
    render(head('سه خط باستانی', null, 'میخی، پهلوی و دین‌دبیره', null) + '<main class="body">' + b + '</main>' + tabbar('scripts'));
  }
  function nameTab() {
    var b = '<div class="card name-card"><p class="muted">نامت را به فارسی بنویس تا ببینی دبیران داریوش چطور آن را می‌نوشتند (تقریبی و برای سرگرمی).</p>' +
      '<input id="nm" type="text" autocomplete="off" placeholder="مثلاً دانیال" maxlength="20" value="' + esc(P.name || '') + '"><div class="name-out" id="nmo"></div></div>' + illu('images/mascot.webp', 'دبیر کوچک', 'grow opt contain');
    render(head('نام تو به خط میخی', null, null, null) + '<main class="body">' + b + '</main>' + tabbar('name'));
    var nm = $('#nm'); function upd() { P.name = nm.value; save(); $('#nmo').innerHTML = nameOut(nm.value); } nm.addEventListener('input', upd); upd();
  }
  var G = { i: 0 };
  function galleryTab() {
    var g = K.gallery[G.i], n = K.gallery.length;
    var b = '<figure class="card gview" data-swipe="g"><div class="gimg"><img src="' + g.img + '" alt="' + esc(g.name) + '"></div><figcaption><b>' + g.name + '</b><span>' + g.era + '</span></figcaption></figure>' +
      '<div class="pager"><button class="btn btn-line" data-act="gprev" aria-label="قبلی">→</button><span class="pg">' + fn(G.i + 1) + ' از ' + fn(n) + '</span><button class="btn btn-coral" data-act="gnext" aria-label="بعدی">←</button></div>';
    render(head('شکوه ایران باستان', null, 'نقاشی‌هایی از شاهان و بناهای باستانی', null) + '<main class="body">' + b + '</main>' + tabbar('gallery'));
    var nx = new Image(); nx.src = K.gallery[(G.i + 1) % n].img;
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

  /* ---------- lesson 1 overview ---------- */
  function lesson1() {
    var c = l1Count(), np = nextPart();
    var b = illu('images/darius.webp', 'داریوش بزرگ در بیستون', 'grow opt') +
      '<div class="mascot-row"><img class="mascot" src="images/mascot.webp" alt="دبیر کوچک"><div class="bubble">' + (c === 4 ? '<b>درس ۱ تمام شد! 🏛️</b> حالا با همین نشانه‌ها واژه بساز.' : 'درود! من دبیر کوچک تخت جمشیدم. پنج نشانهٔ نخست را یاد می‌گیریم، مشق می‌کنیم و یک آزمونک داریم.') + '</div></div>' +
      K.parts.map(function (p, i) { var d = P.L[1][p.id], nx = p.id === np; return lrow('c' + (i + 1) + (d ? ' done' : nx ? ' next' : ''), 'data-go="' + p.id + '"', fn(i + 1), p.name, p.desc, d ? '✓ تمام شد' : nx ? 'شروع' : 'باز'); }).join('');
    var pn = np && K.parts.filter(function (p) { return p.id === np; })[0];
    var foot = c === 4 ? '<button class="btn btn-coral btn-block" data-go="words">واژه‌سازی ←</button>' : '<button class="btn btn-coral btn-block" data-go="' + np + '">' + (c ? 'ادامه' : 'شروع') + ': ' + pn.name + ' ←</button>';
    render(page(head('درس ۱', 'سطح ۱ · الفبا', 'نخستین نشانه‌ها: ' + L1.map(function (id) { return SIG[id].g; }).join(' '), 'lessons'), b, foot));
  }

  /* ---------- 1. learn (extra text lives in small tabs instead of below the fold) ---------- */
  var A = { sel: L1[0], tab: null };
  var ABOUT = 'خط میخی پارسی باستان <b>از چپ به راست</b> نوشته می‌شود. بیشتر نشانه‌ها «هجا» هستند: هم‌خوان + «اَ». هر نشانه از سه نوع میخ ساخته می‌شود: میخ ایستاده، میخ افقی و گوشه‌میخ.';
  function learn() {
    var s = SIG[A.sel];
    if (!A.tab) A.tab = P.seen.length ? 'hint' : 'about';
    if (P.seen.indexOf(s.id) < 0) { P.seen.push(s.id); save(); }
    if (L1.every(function (id) { return P.seen.indexOf(id) >= 0; })) partDone('learn');
    var tabs = [['hint', '💡 راز'], ['shape', 'شکل'], ['text', 'توضیح'], ['about', 'دربارهٔ خط']];
    var panel = A.tab === 'hint' ? '<b>راز به‌یادسپاری:</b> ' + s.hint : A.tab === 'shape' ? '<b>شکل:</b> ' + s.shape : A.tab === 'text' ? s.text : ABOUT;
    var b = '<div class="card signhero"><div class="big cu">' + s.g + '</div><div class="vals"><span class="lat">' + s.tr + '</span><span class="fa">' + s.fa + '</span></div><button class="play" data-play="' + s.audio + '">🔊 بشنو</button>' +
      '<div class="seg">' + tabs.map(function (t) { return '<button class="' + (t[0] === A.tab ? 'on' : '') + '" data-ltab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div class="hint">' + panel + '</div></div>';
    b += '<div class="signs5">' + L1.map(function (id) { var x = SIG[id]; return '<button class="sg' + (id === A.sel ? ' sel' : '') + (P.seen.indexOf(id) >= 0 ? ' seen' : '') + '" data-sign="' + id + '"><span class="cu">' + x.g + '</span><span class="lat">' + x.tr.split(' / ')[0] + '</span></button>'; }).join('') + '</div>';
    var i = L1.indexOf(A.sel);
    var foot = i < L1.length - 1 ? '<button class="btn btn-coral btn-block" data-sign="' + L1[i + 1] + '">نشانهٔ بعدی ←</button>' : '<button class="btn btn-coral btn-block" data-go="mashq">برو به مشق ✍</button>';
    render(page(head('درس ۱ <span class="dot">•</span> <span class="blue">یادگیری</span>', fn(L1.filter(function (id) { return P.seen.indexOf(id) >= 0; }).length) + ' از ۵', null, 'lesson1'), b, foot));
  }

  /* ---------- 2. mashq (5 tries per sign, wedge tool) ---------- */
  var M = { si: 0, ti: 0, user: [], res: null, showModel: false };
  function modeFor(ti) { return ti === 0 ? 'guide' : ti < 3 ? 'faint' : 'none'; }
  var MODE_TXT = { guide: 'با الگو و شمارهٔ ترتیب', faint: 'با الگوی کم‌رنگ', none: 'از حافظه، بدون الگو' };
  function padBox(id, defs, mode, user, tag) {
    return '<div class="padwrap"><div class="padbox">' + padSVG(id, defs, mode, user) + (tag || '') + '</div></div>';
  }
  function feedbackHtml(r, msgs) {
    return '<div class="feedback' + (r.stars >= 2 ? ' good' : '') + '"><div class="seals">' + [0, 1, 2].map(function (i) { return seal(i < r.stars); }).join('') + '</div><div class="fmsg">' + msgs.map(function (m) { return '<p>' + m + '</p>'; }).join('') + '</div></div>';
  }
  function mashq() {
    var id = L1[M.si], s = SIG[id], defs = K.strokes[id], mode = M.showModel && modeFor(M.ti) === 'none' ? 'faint' : modeFor(M.ti);
    var nb = P.nb[id] = P.nb[id] || { tries: [] };
    var b = '<div class="mq-top"><span class="cu">' + s.g + '</span><div class="t"><b><span class="lat">' + s.tr + '</span> · ' + s.fa + '</b><div class="muted">سَرمشق: ' + fn(defs.length) + ' میخ · تلاش ' + fn(M.ti + 1) + ' از ۵</div></div><button class="play small" data-play="' + s.audio + '">🔊</button></div>';
    b += '<div class="tries">' + [0, 1, 2, 3, 4].map(function (t) { var r = nb.tries[t]; return '<span class="' + (t === M.ti ? 'cur' : r && r.s > 0 ? 'ok' : '') + '">' + (r && t !== M.ti ? stars(r.s) : fn(t + 1)) + '</span>'; }).join('') + '</div>';
    b += padBox('pad', defs, mode, M.user, '<span class="pill ' + (mode === 'none' ? 'gold' : 'blue') + ' mode-tag">' + MODE_TXT[mode] + '</span>');
    if (!M.res) b += '<div class="legend"><span><b>میخ ایستاده:</b> به پایین بکش</span><span><b>افقی:</b> به راست بکش</span><span><b>گوشه‌میخ:</b> کج بکش یا یک ضربه</span></div>';
    var foot;
    if (!M.res) {
      foot = '<div class="tools"><button class="btn btn-line" data-act="undo-w"' + (M.user.length ? '' : ' disabled') + '>↶ برگرداندن</button><button class="btn btn-line" data-act="clear-w"' + (M.user.length ? '' : ' disabled') + '>پاک کردن</button><button class="btn btn-coral" data-act="check-w"' + (M.user.length ? '' : ' disabled') + '>بررسی ✓</button></div>';
    } else {
      var r = M.res;
      foot = feedbackHtml(r, r.msg) + '<div class="tools">' + (r.stars === 0 ? '<button class="btn btn-line" data-act="retry-w">دوباره</button>' + (modeFor(M.ti) === 'none' && !M.showModel ? '<button class="btn btn-line" data-act="model-w">💡 نمایش الگو</button>' : '') :
        '<button class="btn btn-line" data-act="retry-w">دوباره</button><button class="btn btn-coral" data-act="next-w">' + (M.ti < 4 ? 'تلاش بعدی ←' : M.si < 4 ? 'نشانهٔ بعدی ←' : 'پایان مشق ←') + '</button>') + '</div>';
    }
    render(page(head('درس ۱ <span class="dot">•</span> <span class="blue">مشق</span>', 'نشانهٔ ' + fn(M.si + 1) + ' از ۵', null, 'lesson1'), b, foot));
    if (!M.res) bindPad(document.getElementById('pad'), defs, M.user, function () { app.querySelectorAll('[data-act="undo-w"],[data-act="clear-w"],[data-act="check-w"]').forEach(function (x) { x.disabled = !M.user.length; }); });
  }
  function mashqCheck() {
    var id = L1[M.si], r = score(K.strokes[id], M.user);
    M.res = r;
    var nb = P.nb[id] = P.nb[id] || { tries: [] };
    nb.tries[M.ti] = { s: r.stars, w: M.user.slice(), t: Date.now(), m: modeFor(M.ti) };
    nb.best = Math.max(nb.best || 0, r.stars); save();
    mashq();
  }
  function mashqNext() {
    M.res = null; M.user = []; M.showModel = false;
    if (M.ti < 4) M.ti++;
    else if (M.si < 4) { M.si++; M.ti = 0; P.nb[L1[M.si]] = { tries: [], best: (P.nb[L1[M.si]] || {}).best || 0 }; save(); }
    else { partDone('mashq'); M.si = 0; M.ti = 0;
      render(page(head('درس ۱ <span class="dot">•</span> <span class="blue">مشق</span>', 'تمام شد', null, 'lesson1'), illu('images/mascot.webp', 'دبیر کوچک', 'grow opt contain') + '<div class="card celebrate"><div class="seals">' + seal(1) + seal(1) + seal(1) + '</div><h3>پنج نشانه، هر کدام پنج بار!</h3><p>مشق‌هایت در «دفتر مشق من» ذخیره شد.</p></div>',
        '<button class="btn btn-coral btn-block" data-go="quiz">آزمونک ←</button><button class="btn btn-line btn-block" data-go="notebook">دفتر مشق من</button>'));
      return; }
    mashq();
  }

  /* ---------- 3. quiz (book-style numbered cards) ---------- */
  var Q = null;
  function makeQuiz() {
    var a = shuffle(L1).slice(0, 4), b = shuffle(L1).slice(0, 4), w = shuffle(L1).slice(0, 2), qs = [];
    a.forEach(function (id) { qs.push({ type: 't', s: SIG[id], opts: shuffle([id].concat(shuffle(L1.filter(function (x) { return x !== id; })).slice(0, 3))) }); });
    b.forEach(function (id) { qs.push({ type: 'g', s: SIG[id], opts: shuffle([id].concat(shuffle(L1.filter(function (x) { return x !== id; })).slice(0, 3))) }); });
    qs = shuffle(qs); w.forEach(function (id, i) { qs.splice(3 + i * 4, 0, { type: 'w', s: SIG[id] }); });
    return { i: 0, score: 0, qs: qs, user: [], res: null };
  }
  function quiz() {
    if (!Q) Q = makeQuiz();
    var hd = head('درس ۱ <span class="dot">•</span> <span class="blue">آزمونک</span>', Q.i < Q.qs.length ? fn(Q.i + 1) + ' از ' + fn(Q.qs.length) : 'پایان', null, 'lesson1');
    if (Q.i >= Q.qs.length) {
      var pass = Q.score >= 7; if (pass) partDone('quiz');
      render(page(hd, illu('images/mascot.webp', 'دبیر کوچک', 'grow opt contain') + '<div class="card celebrate"><div class="seals">' + [0, 1, 2].map(function (i) { return seal(i < (Q.score >= 9 ? 3 : Q.score >= 7 ? 2 : 1)); }).join('') + '</div><h3>' + (pass ? 'آفرین! آزمونک را گذراندی' : 'خوب بود؛ یک بار دیگر') + '</h3><p>' + fn(Q.score) + ' از ' + fn(Q.qs.length) + ' درست در نخستین تلاش</p></div>',
        pass ? '<button class="btn btn-coral btn-block" data-go="review">مرور ←</button>' : '<button class="btn btn-coral btn-block" data-act="quiz-again">دوباره</button>'));
      return;
    }
    var q = Q.qs[Q.i], c = 'c' + ((Q.i % 6) + 1), foot = null;
    var b = '<div class="qprog">' + Q.qs.map(function (_, n) { return '<i class="' + (n < Q.i ? 'on' : n === Q.i ? 'cur' : '') + '"></i>'; }).join('') + '</div><div class="qcard qmain ' + c + '">';
    if (q.type === 't') b += '<div class="qhead"><span class="num">' + fn(Q.i + 1) + '</span>این نشانه چه صدایی دارد؟</div><div class="qglyph cu">' + q.s.g + '</div><div class="opts">' + q.opts.map(function (id, k) { var o = SIG[id]; return '<button class="opt" data-ans="' + id + '"><span class="L">' + LET[k] + '</span><span class="lat">' + o.tr.split(' / ')[0] + '</span> · ' + o.fa.split(' / ').pop() + '</button>'; }).join('') + '</div>';
    else if (q.type === 'g') b += '<div class="qhead"><span class="num">' + fn(Q.i + 1) + '</span><span>نشانهٔ «' + q.s.fa.split(' / ').pop() + '» (<span class="lat">' + q.s.tr.split(' / ')[0] + '</span>) کدام است؟</span><button class="play small" data-play="' + q.s.audio + '">🔊</button></div><div class="opts big">' + q.opts.map(function (id, k) { return '<button class="opt" data-ans="' + id + '"><span class="L">' + LET[k] + '</span><span class="cu">' + SIG[id].g + '</span></button>'; }).join('') + '</div>';
    else {
      b += '<div class="qhead"><span class="num">' + fn(Q.i + 1) + '</span><span>بدون الگو بنویس: «' + q.s.fa.split(' / ').pop() + '» (<span class="lat">' + q.s.tr.split(' / ')[0] + '</span>)</span><button class="play small" data-play="' + q.s.audio + '">🔊</button></div>' +
        padBox('qpad', K.strokes[q.s.id], Q.res ? 'faint' : 'none', Q.user);
      foot = !Q.res ? '<div class="tools"><button class="btn btn-line" data-act="qclear">پاک کردن</button><button class="btn btn-coral" data-act="qcheck">بررسی ✓</button></div>'
        : feedbackHtml(Q.res, [Q.res.stars >= 2 ? 'درست است!' : 'الگوی درست، کم‌رنگ نشان داده شد.']) + '<div class="tools"><button class="btn btn-coral" data-act="qnext">ادامه ←</button></div>';
    }
    b += '</div>';
    render(page(hd, b, foot));
    if (q.type === 'w' && !Q.res) bindPad(document.getElementById('qpad'), K.strokes[q.s.id], Q.user);
  }
  function answer(btn) {
    var q = Q.qs[Q.i], id = btn.getAttribute('data-ans');
    if (id === q.s.id) {
      btn.classList.add('ok'); if (!q.tried) Q.score++; Audio_.play(q.s.audio);
      app.querySelectorAll('.opt').forEach(function (b) { b.disabled = true; });
      setTimeout(function () { Q.i++; quiz(); }, 800);
    } else { q.tried = true; btn.classList.add('bad'); btn.disabled = true; }
  }

  /* ---------- 4. review ---------- */
  var R = { open: {} };
  function review() {
    var b = illu('images/persepolis.webp', 'تخت جمشید', 'grow opt') + '<div class="mascot-row"><img class="mascot" src="images/mascot.webp" alt=""><div class="bubble">از درس ۲ به بعد، اینجا نشانه‌های درس‌های پیشین را مرور می‌کنیم. فعلاً همین پنج نشانه را مرور کن: روی هر کارت بزن.</div></div>';
    b += '<div class="signs5">' + L1.map(function (id) { var x = SIG[id], o = R.open[id]; return '<button class="sg' + (o ? ' seen' : '') + '" data-rev="' + id + '"><span class="cu">' + x.g + '</span><span class="lat">' + (o ? x.tr.split(' / ')[0] : '؟') + '</span></button>'; }).join('') + '</div>';
    var all = L1.every(function (id) { return R.open[id]; });
    render(page(head('درس ۱ <span class="dot">•</span> <span class="blue">مرور</span>', 'سطح ۱ · الفبا', null, 'lesson1'), b,
      '<button class="btn btn-coral btn-block" data-act="rev-done"' + (all ? '' : ' disabled') + '>' + (P.L[1].review ? '✓ مرور شد · بازگشت به درس' : 'مرور شد ✓') + '</button>'));
  }

  /* ---------- notebook ---------- */
  function notebook() {
    var b = '<div class="nb">' + L1.map(function (id) {
      var s = SIG[id], nb = P.nb[id] || { tries: [] }, tr = (nb.tries || []).filter(Boolean);
      return '<div class="card nb-row"><span class="cu g">' + s.g + '</span><div class="t"><b><span class="lat">' + s.tr.split(' / ')[0] + '</span> · ' + s.fa.split(' / ').pop() + '</b><div class="muted">' + (tr.length ? fn(tr.length) + ' مشق · ' + stars(nb.best || 0) : 'هنوز مشق نشده') + '</div></div>' +
        '<div class="nb-thumbs">' + [0, 1, 2, 3, 4].map(function (k) { var t = tr[k]; return t ? thumb(t.w, t.m === 'none' ? null : K.strokes[id]) : '<svg viewBox="0 0 1 1" class="empty"></svg>'; }).join('') + '</div></div>';
    }).join('') + '</div>';
    render(page(head('دفتر مشق من', 'روی همین گوشی', null, 'lessons'), b, '<button class="btn btn-coral btn-block" data-go="mashq">مشق تازه ✍</button>'));
  }
  function nextBtn(id) {
    var i = -1; K.steps.forEach(function (s, k) { if (s.id === id) i = k; }); var n = K.steps[i + 1];
    return n ? '<button class="btn btn-coral btn-block" data-go="' + n.id + '">بعدی: ' + n.name + ' ←</button>' : '<button class="btn btn-coral btn-block" data-go="home">بازگشت به خانه</button>';
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
    var w = K.words[W.i], foot = null;
    var b = illu('images/cyrus-tomb.webp', 'آرامگاه کوروش', 'grow opt');
    b += '<div class="card task"><div class="goal"><p class="muted">' + (w.signs.some(function (id) { return SIG[id].lesson > 1; }) ? 'نشانه‌های تازه از درس ۲: ' + w.signs.filter(function (id) { return SIG[id].lesson > 1; }).map(function (id) { return SIG[id].g + ' ' + SIG[id].tr; }).join('، ') : 'فقط با نشانه‌های درس ۱') + '</p><div class="fa">' + w.fa + '</div><div class="lat">' + w.tr + '</div></div>' +
      '<div class="slots' + (state === 'ok' ? ' ok' : state === 'bad' ? ' bad' : '') + '" data-act="undo">' + slotsHtml('word') + '</div>';
    if (B.solved) {
      b += '<div class="result"><b>✓ درست است!</b> <span class="cu" style="font-size:1.4rem">' + w.signs.map(function (id) { return SIG[id].g; }).join('') + '</span> = ' + w.say + '<p>' + w.note + '</p><p class="today">🌿 <b>در فارسی امروز:</b> ' + w.today + '</p></div>';
      foot = '<div class="tools"><button class="btn btn-line" data-play="' + w.audio + '">🔊 بشنو</button>' + (B.viaHelp ? '<button class="btn btn-coral" data-act="wretry">حالا خودت، از اول</button>' : '<button class="btn btn-coral" data-act="wnext">' + (W.i < K.words.length - 1 ? 'واژهٔ بعدی ←' : 'پایان واژه‌سازی ←') + '</button>') + '</div>';
    } else {
      b += '<p class="note">از چپ به راست بچین. برای پاک کردن آخرین نشانه، روی خانه‌ها بزن.</p><div class="tiles">' + tilesHtml('word') + '</div>';
      if (B.help) b += '<div class="helpbox">پاسخ درست: <span class="cu">' + w.signs.map(function (id) { return SIG[id].g; }).join('') + '</span> <span class="lat">' + w.signs.map(function (id) { return SIG[id].tr.split(' ')[0]; }).join('-') + '</span> · نشانهٔ بعدی قاب طلایی دارد.</div>';
      if (B.wrong >= 2 && !B.help) foot = '<button class="btn btn-line btn-block" data-act="help">💡 کمک گرفتن</button>';
    }
    b += '</div>';
    render(page(head('واژه‌سازی', fn(W.i + 1) + ' از ' + fn(K.words.length), 'با نشانه‌هایی که یاد گرفتی بنویس', 'lessons'), b, foot));
    if (state === 'ok') { Audio_.play(w.audio); if (!B.viaHelp) { P.words[w.id] = true; save(); } }
  }

  /* ---------- 3. sentence (grammar opens in a sheet, not below the fold) ---------- */
  function sheet(html) {
    var s = document.getElementById('sheet');
    if (!s) { s = document.createElement('div'); s.id = 'sheet'; s.className = 'sheet'; document.body.appendChild(s);
      s.addEventListener('click', function (e) { if (e.target === s || e.target.closest('[data-x]')) sheet(null); }); }
    if (!html) { s.classList.remove('on'); s.innerHTML = ''; return; }
    s.innerHTML = '<div class="sheet-card card">' + html.replace(/>([^<]*)</g, function (m, txt) { return '>' + txt.replace(OPRUN, '<span class="cu">$1</span>') + '<'; }) + '<button class="btn btn-coral btn-block" data-x="1">بستن</button></div>';
    s.classList.add('on');
  }
  function sentence(state) {
    var S = K.sentence;
    if (!B || B.kind !== 'sent') { B = newBuilder(S.words, S.words); B.kind = 'sent'; }
    var b = illu('images/darius.webp', 'داریوش بزرگ در بیستون', 'grow opt');
    b += '<div class="card task"><div class="goal"><p class="muted">این جمله را به خط میخی بساز:</p><div class="fa">' + S.fa + '</div></div>' +
      '<div class="slots sent' + (state === 'ok' ? ' ok' : state === 'bad' ? ' bad' : '') + '" data-act="undo">' + slotsHtml('sent') + '</div>';
    var gram = '<button class="btn btn-line" data-act="gram">📜 دستور ساده</button>', foot;
    if (B.solved) {
      b += '<div class="result"><b>✓ آفرین!</b> نخستین جملهٔ کتیبهٔ بیستون را ساختی:<p class="lat" style="font-size:1.05rem">adam Dārayavauš xšāyaθiya vazraka</p></div>';
      foot = '<div class="tools">' + gram + '<button class="btn btn-line" data-play="audio/l-1.mp3">🔊</button></div>' + (B.viaHelp ? '<button class="btn btn-coral btn-block" data-act="sretry">حالا خودت، از اول</button>' : nextBtn('sentence'));
    } else {
      b += '<p class="note">جداکنندهٔ 𐏐 خودش میان واژه‌ها می‌آید. از چپ به راست.</p><div class="tiles">' + tilesHtml('sent') + '</div>';
      if (B.help) b += '<div class="helpbox">ترتیب درست: <span class="lat">adam · Dārayavauš · xšāyaθiya · vazraka</span> · واژهٔ بعدی قاب طلایی دارد.</div>';
      foot = '<div class="tools">' + gram + (B.wrong >= 2 && !B.help ? '<button class="btn btn-line" data-act="help">💡 کمک گرفتن</button>' : '') + '</div>';
    }
    b += '</div>';
    render(page(head('جمله‌سازی', 'نخستین جمله', 'سرآغاز کتیبهٔ داریوش', 'lessons'), b, foot));
    if (state === 'ok') { Audio_.play('audio/l-1.mp3'); if (!B.viaHelp) markDone('sentence'); }
  }
  function grammarSheet() { sheet('<h3>📜 دستور ساده</h3><ul>' + K.sentence.grammar.map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ul>'); }

  /* ---------- 4. inscription: intro · one page per line · tips ---------- */
  var I = { sel: null, pg: 0 };
  function inscription() {
    var C = K.inscription, readN = Object.keys(P.lines).length, N = C.lines.length, pg = I.pg, b, foot;
    var dots = '<span class="dots">' + [0].concat(C.lines.map(function (_, n) { return n + 1; }), [N + 1]).map(function (k) { return '<i class="' + (k === pg ? 'cur' : k > 0 && k <= N && P.lines[k - 1] ? 'on' : '') + '"></i>'; }).join('') + '</span>';
    var prev = '<button class="btn btn-line" data-act="ipg" data-n="' + (pg - 1) + '"' + (pg ? '' : ' disabled') + '>→ قبلی</button>';
    if (pg === 0) {
      b = illu('images/behistun.webp', 'کتیبه و نگارهٔ بیستون', 'grow opt') + '<div class="card intro"><p class="muted">' + C.ref + '</p><p>' + C.about + '</p><p class="muted">👆 روی هر واژهٔ میخی بزن تا معنی و صدایش را ببینی؛ دکمهٔ 🔊 کل سطر را می‌خواند.</p></div>';
      foot = '<div class="pager">' + prev + dots + '<button class="btn btn-coral" data-act="ipg" data-n="1">شروع ←</button></div>';
    } else if (pg <= N) {
      var n = pg - 1, l = C.lines[n];
      var cu = l.w.map(function (k, j) { return (j ? '<span class="divider">' + DIV + '</span>' : '') + '<button class="wbtn' + (I.sel === n + ':' + j ? ' on' : '') + '" data-w="' + n + ':' + j + '">' + K.lex[k].g + '</button>'; }).join('');
      var gl = '<div class="gloss empty">👆 روی یک واژهٔ میخی بزن</div>';
      if (I.sel && I.sel.split(':')[0] == n) { var L = K.lex[l.w[+I.sel.split(':')[1]]]; gl = '<div class="gloss"><span class="cu">' + L.g + '</span> · <span class="lat">' + L.tr + '</span> = <b>' + L.fa + '</b>' + (L.today ? '<br>🌿 ' + L.today : '') + '</div>'; }
      b = '<div class="qcard line c' + ((n % 6) + 1) + (P.lines[n] ? ' read' : '') + '" data-swipe="i"><div class="top"><span class="num">' + fn(n + 1) + '</span><span class="muted">' + (P.lines[n] ? '✓ خوانده شد' : 'سطر ' + fn(n + 1) + ' از ' + fn(N)) + '</span><button class="play small" data-line="' + n + '">🔊 بخوان</button></div><div class="cuw">' + cu + '</div><div class="tr">' + l.w.map(function (k) { return K.lex[k].tr; }).join(' ') + '</div><div class="fa">' + l.fa + '</div>' + gl + '</div>';
      foot = '<div class="pager">' + prev + dots + '<button class="btn btn-coral" data-act="ipg" data-n="' + (pg + 1) + '">بعدی ←</button></div>';
    } else {
      b = '<div class="card grammar"><h3>🔎 نکته‌های خواندن</h3><p>• پسوند <span class="lat">‎-ānām‎</span> = «ـانِ» (جمع، وابستگی): xšāyaθiyānām = «شاهان».</p><p>• پسوند <span class="lat">‎-ahyā‎</span> = کسرهٔ اضافه: Vištāspahyā puça = «پسرِ ویشتاسپ».</p><p>• در برخی کتیبه‌های دیگر، «شاه» را با یک اندیشه‌نگار می‌نویسند: <span class="cu" style="font-size:1.5rem">𐏋</span></p></div>' +
        (P.done.inscription ? '<div class="card celebrate"><div class="big">🏛️</div><h3>کتیبه‌خوانی تمام شد!</h3><p>تو نخستین بند کتیبهٔ بیستون را خواندی.</p></div>' : illu('images/behistun.webp', 'کتیبه و نگارهٔ بیستون', 'grow opt'));
      foot = '<div class="pager">' + prev + dots + '<button class="btn btn-coral" data-act="ifinish">' + (P.done.inscription ? 'خانه' : 'خواندم ✓') + '</button></div>';
    }
    render(page(head('کتیبه‌خوانی', fn(readN) + ' از ' + fn(N), C.title, 'lessons'), b, foot));
  }

  /* ---------- credits ---------- */
  function credits() {
    render(page(head('دربارهٔ تصویرها', null, null, 'home'), '<div class="card credits"><p><b>تصویرها:</b> همهٔ تصویرهای این اپ نقاشی‌های تازه‌اند (به سبک کتاب‌های <span class="en">Dutch in 90 Days</span>) که برای Kisti ساخته شده‌اند؛ عکس واقعی نیستند و جزئیات لباس و بناها بازسازی هنری است.</p>' +
      '<p><b>قلم‌ها (SIL Open Font License):</b></p><ul class="en"><li>Noto Sans Old Persian — The Noto Project Authors</li><li>Vazirmatn — Saber Rastikerdar</li><li>Fredoka — The Fredoka Project Authors</li><li>Alegreya — The Alegreya Project Authors</li></ul>' +
      '<p><b>صداها:</b> با صدای مصنوعی فارسی و به‌صورت بازسازی تقریبی تلفظ پارسی باستان ساخته شده‌اند.</p><p><b>متن‌ها:</b> املای پارسی باستان بر پایهٔ <span class="en">Kent (1953)</span> و <span class="en">Schmitt (2009)</span>. ترتیب میخ‌ها در «مشق» یک قرارداد آموزشی است.</p></div>', null));
  }
  /* ---------- routing & events ---------- */
  function startMashq() { if (!M.res && !M.user.length && M.ti === 0) { var id = L1[M.si]; P.nb[id] = { tries: [], best: (P.nb[id] || {}).best || 0 }; save(); } mashq(); }
  var routes = { home: home, lessons: lessonsTab, scripts: scriptsTab, name: nameTab, gallery: galleryTab, lesson1: lesson1, learn: learn, mashq: startMashq, quiz: quiz, review: function () { R.open = {}; review(); }, notebook: notebook,
    words: function () { B = null; words(); }, sentence: function () { B = null; sentence(); }, inscription: function () { I.sel = null; inscription(); }, credits: credits };
  function route() { sheet(null); var r = (location.hash || '#home').slice(1); (routes[r] || home)(); }
  function go(r) { if (location.hash === '#' + r) route(); else location.hash = r; }
  function firstUndoneWord() { for (var i = 0; i < K.words.length; i++) if (!P.words[K.words[i].id]) return i; return 0; }
  window.addEventListener('hashchange', route);
  /* horizontal swipe on paged cards (gallery, inscription lines) */
  var sw = null;
  app.addEventListener('touchstart', function (e) { var el = e.target.closest('[data-swipe]'); sw = el && e.touches.length === 1 ? { k: el.getAttribute('data-swipe'), x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
  app.addEventListener('touchend', function (e) {
    if (!sw) return; var t = e.changedTouches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y, k = sw.k; sw = null;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
    var fwd = dx > 0; /* RTL: finger moves right → next page */
    if (k === 'g') { G.i = (G.i + (fwd ? 1 : K.gallery.length - 1)) % K.gallery.length; galleryTab(); }
    else if (k === 'i') { var n = I.pg + (fwd ? 1 : -1); if (n >= 0 && n <= K.inscription.lines.length + 1) { I.pg = n; I.sel = null; inscription(); } }
  }, { passive: true });
  app.addEventListener('click', function (e) {
    var t = e.target.closest('button, [data-act]'); if (!t || t.disabled) return;
    var r = t.getAttribute('data-go'), act = t.getAttribute('data-act'), view = location.hash.slice(1);
    if (r) { if (r === 'words') W.i = firstUndoneWord(); if (r === 'quiz') Q = null; if (r === 'inscription') I.pg = 0; go(r); return; }
    if (t.hasAttribute('data-soon')) { toast('این بخش در نسخهٔ کامل می‌آید'); return; }
    if (t.hasAttribute('data-play')) { Audio_.play(t.getAttribute('data-play')); t.classList.remove('playing'); void t.offsetWidth; t.classList.add('playing'); return; }
    if (t.hasAttribute('data-ltab')) { A.tab = t.getAttribute('data-ltab'); learn(); return; }
    if (t.hasAttribute('data-sign')) { A.sel = t.getAttribute('data-sign'); A.tab = 'hint'; Audio_.play(SIG[A.sel].audio); learn(); return; }
    if (t.hasAttribute('data-rev')) { var rid = t.getAttribute('data-rev'); R.open[rid] = true; Audio_.play(SIG[rid].audio); review(); return; }
    if (t.hasAttribute('data-ans')) { answer(t); return; }
    if (t.hasAttribute('data-tile')) { pickTile(+t.getAttribute('data-tile'), view === 'words' ? 'word' : 'sent', view === 'words' ? words : sentence); return; }
    if (t.hasAttribute('data-w')) { var p = t.getAttribute('data-w'), n = +p.split(':')[0]; I.sel = I.sel === p ? null : p; Audio_.play(K.lex[K.inscription.lines[n].w[+p.split(':')[1]]].audio); inscription(); return; }
    if (t.hasAttribute('data-line')) { var ln = +t.getAttribute('data-line'); Audio_.play(K.inscription.lines[ln].audio); if (!P.lines[ln]) { P.lines[ln] = true; save(); inscription(); } return; }
    switch (act) {
      case 'undo-w': M.user.pop(); mashq(); break;
      case 'clear-w': M.user.length = 0; mashq(); break;
      case 'check-w': mashqCheck(); break;
      case 'retry-w': M.res = null; M.user = []; mashq(); break;
      case 'model-w': M.res = null; M.user = []; M.showModel = true; mashq(); break;
      case 'next-w': mashqNext(); break;
      case 'qclear': Q.user.length = 0; quiz(); break;
      case 'qcheck': { var q = Q.qs[Q.i]; Q.res = score(K.strokes[q.s.id], Q.user); if (Q.res.stars >= 2) Q.score++; quiz(); break; }
      case 'qnext': Q.i++; Q.user = []; Q.res = null; quiz(); break;
      case 'quiz-again': Q = makeQuiz(); quiz(); break;
      case 'rev-done': partDone('review'); go('lesson1'); break;
      case 'undo': if (B && !B.solved && B.picked.length) { B.picked.pop(); (view === 'words' ? words : sentence)(); } break;
      case 'help': B.help = true; B.viaHelp = true; B.picked = []; (view === 'words' ? words : sentence)(); break;
      case 'wretry': wordsInit(); B.kind = 'word'; words(); toast('حالا بدون کمک، از اول'); break;
      case 'wnext':
        if (W.i < K.words.length - 1) { W.i++; B = null; words(); }
        else { markDone('words'); render(page(head('واژه‌سازی', 'تمام شد', null, 'lessons'), illu('images/cyrus-tomb.webp', 'آرامگاه کوروش', 'grow opt') + '<div class="card celebrate"><div class="big">🏺</div><h3>چهار واژهٔ نخست را نوشتی!</h3><p class="lat">adam · Pārsa · pasā · imam</p></div>', nextBtn('words'))); }
        break;
      case 'sretry': B = newBuilder(K.sentence.words, K.sentence.words); B.kind = 'sent'; sentence(); toast('حالا بدون کمک، از اول'); break;
      case 'gram': grammarSheet(); break;
      case 'gprev': G.i = (G.i + K.gallery.length - 1) % K.gallery.length; galleryTab(); break;
      case 'gnext': G.i = (G.i + 1) % K.gallery.length; galleryTab(); break;
      case 'ipg': I.pg = +t.getAttribute('data-n'); I.sel = null; inscription(); break;
      case 'ifinish': if (P.done.inscription) go('home'); else { markDone('inscription'); inscription(); } break;
    }
  });
  W.i = firstUndoneWord();
  route();

  /* splash: 3 seconds */
  var sp = document.getElementById('splash');
  setTimeout(function () { sp.classList.add('out'); sp.setAttribute('aria-hidden', 'true'); setTimeout(function () { sp.remove(); }, 700); }, 3000);
  window.__kisti = { score: score, classify: classify, P: function () { return P; }, M: M, I: I, G: G, A: A, W: W, mashq: mashq, inscription: inscription, words: words, sentence: sentence, quiz: quiz, Q: function (q) { if (q !== undefined) Q = q; return Q; }, B: function () { return B; }, makeQuiz: makeQuiz, mashqNext: mashqNext };
})();
