/* Kisti v4 — three ancient Iranian scripts (Old Persian cuneiform · Inscriptional Pahlavi · Avestan).
   Each script: alphabet lessons (learn · mashq · quiz · review) → word building → sentence building → reading real texts.
   Every screen fits one phone viewport (no vertical scrolling). Vanilla JS, hash routing, localStorage (kisti-progress-v1, migrated in place). */
(function () {
  'use strict';
  var K = window.KISTI, SS = window.KISTI_S, ORDER = ['op', 'pa', 'av'], app = document.getElementById('app');
  var STORE = 'kisti-progress-v1';
  ORDER.forEach(function (sid) { var s = SS[sid]; s.SIG = {}; s.signs.forEach(function (g) { s.SIG[g.id] = g; }); s.TX = {}; s.texts.forEach(function (t) { s.TX[t.id] = t; }); });
  var FA_DIG = '۰۱۲۳۴۵۶۷۸۹', LET = ['الف', 'ب', 'ج', 'د'];
  function fn(n) { return String(n).replace(/\d/g, function (d) { return FA_DIG[d]; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function cyc(a, k) { var o = []; for (var i = 0; i < k; i++) o.push(a[i % a.length]); return o; }
  function $(sel) { return app.querySelector(sel); }
  var RUNS = /([\u{103A0}-\u{103DF}]+)|([\u{10B60}-\u{10B7F}]+(?: [\u{10B60}-\u{10B7F}]+)*)|([\u{10B00}-\u{10B3F}\u2E31]+)/gu;
  function wrap(txt) { return txt.replace(RUNS, function (m, a, b) { return '<span class="' + (a ? 'cu' : b ? 'pa' : 'av') + '">' + m + '</span>'; }); }
  function wrapHtml(h) { return h.replace(/>([^<]*)</g, function (m, txt) { return '>' + wrap(txt) + '<'; }); }
  function render(h) { app.innerHTML = wrapHtml(h); fit(); }

  /* ---------- progress: one key, migrated in place (v1/v2 → v3 per-script) ---------- */
  function blank() { return { L: {}, seen: [], nb: {}, words: {}, sents: {}, lines: {}, done: {} }; }
  var P = load();
  function load() {
    var p; try { p = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { p = {}; }
    if (!p.S) {
      var o = blank(), d = p.done || {};
      if (p.L && p.L[1]) o.L[1] = p.L[1];
      if (d.alphabet) { o.L[1] = o.L[1] || {}; o.L[1].learn = true; }
      o.seen = p.seen || []; o.nb = p.nb || {}; o.words = p.words || {};
      if (p.lines && Object.keys(p.lines).length) { o.lines.db1 = {}; Object.keys(p.lines).forEach(function (k) { o.lines.db1[k] = true; }); }
      if (d.sentence) o.sents[0] = true;
      if (d.inscription) o.done.db1 = true;
      p = { v: 3, name: p.name || '', S: { op: o }, last: 'op' };
    }
    ORDER.forEach(function (sid) { var b = blank(), x = p.S[sid] || {}; Object.keys(b).forEach(function (k) { if (x[k] == null) x[k] = b[k]; }); p.S[sid] = x; });
    return p;
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(P)); } catch (e) {} }
  if (navigator.storage && navigator.storage.persist) { try { navigator.storage.persist(); } catch (e) {} }
  function PS(sid) { return P.S[sid]; }
  function partsOf(sid, n) { return SS[sid].lessons[n - 1].mashq ? ['learn', 'mashq', 'quiz', 'review'] : ['learn', 'quiz', 'review']; }
  function lp(sid, n) { var L = PS(sid).L; return L[n] = L[n] || {}; }
  function partDone(sid, n, part) { var l = lp(sid, n); if (!l[part]) { l[part] = true; save(); } }
  function lessonCount(sid, n) { var l = PS(sid).L[n] || {}; return partsOf(sid, n).filter(function (p) { return l[p]; }).length; }
  function lessonDone(sid, n) { return lessonCount(sid, n) === partsOf(sid, n).length; }
  function lessonOpen(sid, n) { var l = PS(sid).L[n]; return n === 1 || lessonDone(sid, n - 1) || !!(l && Object.keys(l).length); }
  function allLessons(sid) { return SS[sid].lessons.every(function (l) { return lessonDone(sid, l.n); }); }
  function wordsDone(sid) { return SS[sid].words.every(function (w) { return PS(sid).words[w.id]; }); }
  function sentsDone(sid) { return SS[sid].sentences.every(function (s, i) { return PS(sid).sents[i]; }); }
  function wordsOpen(sid) { return allLessons(sid) || Object.keys(PS(sid).words).length > 0; }
  function sentOpen(sid) { return wordsDone(sid) || Object.keys(PS(sid).sents).length > 0; }
  function readOpen(sid) { var p = PS(sid); return sentsDone(sid) || Object.keys(p.lines).length > 0 || Object.keys(p.done).length > 0; }
  function textsDone(sid) { return SS[sid].texts.filter(function (t) { return PS(sid).done[t.id]; }).length; }
  function nextLesson(sid) { var l = SS[sid].lessons.filter(function (l) { return !lessonDone(sid, l.n); })[0]; return l ? l.n : 0; }
  function scriptPct(sid) {
    var S = SS[sid], tot = 0, got = 0;
    S.lessons.forEach(function (l) { tot += partsOf(sid, l.n).length; got += lessonCount(sid, l.n); });
    tot += S.words.length + S.sentences.length + S.texts.length;
    got += S.words.filter(function (w) { return PS(sid).words[w.id]; }).length + S.sentences.filter(function (s, i) { return PS(sid).sents[i]; }).length + textsDone(sid);
    return Math.round(100 * got / tot);
  }

  /* ---------- audio: decoded lazily per screen ---------- */
  var Audio_ = (function () {
    var raw = {}, buf = {}, els = {}, ctx = null, cur = null, asked = {};
    function decode(u) { if (buf[u] || !raw[u] || !ctx) return; var ab = raw[u].slice(0); ctx.decodeAudioData(ab, function (b) { buf[u] = b; }, function () {}); }
    function preload(list) {
      (list || []).forEach(function (u) {
        if (!u || asked[u]) return; asked[u] = 1;
        fetch(u).then(function (r) { return r.ok ? r.arrayBuffer() : null; }).then(function (ab) { if (ab) { raw[u] = ab; if (ctx) decode(u); } }).catch(function () {});
      });
    }
    function unlock() {
      if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return; ctx = new C(); Object.keys(raw).forEach(decode); }
      if (ctx.state === 'suspended') ctx.resume();
    }
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, unlock, { capture: true, passive: true }); });
    function stop() { if (cur) { try { cur.stop ? cur.stop() : (cur.pause(), cur.currentTime = 0); } catch (e) {} cur = null; } }
    function play(u) {
      if (!u) return; unlock(); stop();
      if (ctx && buf[u]) { var s = ctx.createBufferSource(); s.buffer = buf[u]; s.connect(ctx.destination); s.start(0); cur = s; return; }
      var a = els[u] || (els[u] = new Audio(u)); try { a.currentTime = 0; } catch (e) {} var pr = a.play(); if (pr && pr.catch) pr.catch(function () {}); cur = a; preload([u]);
    }
    return { play: play, preload: preload };
  })();

  function toast(msg) { var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  var RULE = '<div class="rule"><i></i><i></i><i></i><i></i></div>';
  function head(title, pill, sub, back) {
    return '<header class="page-h"><div class="row"><h1' + (String(title).replace(/<[^>]*>/g, '').length > 15 ? ' class="long"' : '') + '>' + title + '</h1>' + (pill ? '<span class="pill">' + pill + '</span>' : '') +
      (back ? '<button class="back" data-go="' + back + '" aria-label="بازگشت">→</button>' : '') + '</div>' + RULE + (sub ? '<p class="subt">' + sub + '</p>' : '') + '</header>';
  }
  function page(hd, body, foot, extra) { return hd + '<main class="body">' + body + '</main>' + (foot ? '<footer class="fbar">' + foot + '</footer>' : '') + (extra || ''); }
  function illu(src, alt, cls) { return '<div class="illu ' + (cls || 'grow') + '"><img src="' + src + '" alt="' + esc(alt) + '"></div>'; }
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
  function first(s) { return String(s).split(' / ')[0]; }
  function last(s) { return String(s).split(' / ').pop(); }

  /* ---------- wedge geometry (Old Persian; unit square, y down) ---------- */
  function r3(n) { return Math.round(n * 1000) / 1000; }
  function wedgePath(w) {
    if (w.t === 'w') { var h = w.w / 2; return { stroke: true, d: 'M' + r3(w.x + w.len) + ' ' + r3(w.y - h) + ' L' + r3(w.x) + ' ' + r3(w.y) + ' L' + r3(w.x + w.len) + ' ' + r3(w.y + h) }; }
    var dx = w.t === 'v' ? 0 : 1, dy = w.t === 'v' ? 1 : 0, nx = dy, ny = dx, W = (w.w || 0.18) * 0.95, L = w.len;
    var Ax = w.x + nx * W / 2, Ay = w.y + ny * W / 2, Bx = w.x - nx * W / 2, By = w.y - ny * W / 2, Tx = w.x + dx * L, Ty = w.y + dy * L, Cx = w.x + dx * W * 0.22, Cy = w.y + dy * W * 0.22;
    return { d: 'M' + r3(Ax) + ' ' + r3(Ay) + ' L' + r3(Tx) + ' ' + r3(Ty) + ' L' + r3(Bx) + ' ' + r3(By) + ' Q' + r3(Cx) + ' ' + r3(Cy) + ' ' + r3(Ax) + ' ' + r3(Ay) + ' Z' };
  }
  function wedgeSVG(w, color, op) {
    var p = wedgePath(w);
    return p.stroke ? '<path d="' + p.d + '" fill="none" stroke="' + color + '" stroke-width="0.06" stroke-linejoin="miter" stroke-miterlimit="10" opacity="' + (op || 1) + '"/>' : '<path d="' + p.d + '" fill="' + color + '" opacity="' + (op || 1) + '"/>';
  }
  function numDot(x, y, i) { return '<circle cx="' + r3(x) + '" cy="' + r3(y) + '" r="0.045" fill="#E8734A"/><text x="' + r3(x) + '" y="' + r3(y + 0.018) + '" font-size="0.055" font-weight="700" fill="#fff" text-anchor="middle" font-family="Vazirmatn">' + fn(i + 1) + '</text>'; }
  function guideSVG(defs) {
    return defs.map(function (w, i) {
      var nxp, nyp, ax1, ay1, ax2, ay2;
      if (w.t === 'v') { nxp = w.x - 0.11; nyp = w.y + 0.02; ax1 = w.x - 0.11; ay1 = w.y + 0.09; ax2 = w.x - 0.11; ay2 = w.y + Math.min(w.len, 0.4); }
      else if (w.t === 'h') { nxp = w.x - 0.02; nyp = w.y - 0.12; ax1 = w.x + 0.06; ay1 = w.y - 0.12; ax2 = w.x + Math.min(w.len, 0.4); ay2 = w.y - 0.12; }
      else { nxp = w.x - 0.06; nyp = w.y; ax1 = null; }
      nxp = Math.max(0.05, nxp); nyp = Math.max(0.05, nyp);
      var a = ax1 == null ? '' : '<line x1="' + r3(ax1) + '" y1="' + r3(ay1) + '" x2="' + r3(ax2) + '" y2="' + r3(ay2) + '" stroke="#3F9BD6" stroke-width="0.012" stroke-dasharray="0.025 0.015" marker-end="url(#arr)"/>';
      return a + numDot(nxp, nyp, i);
    }).join('');
  }
  var ARR = '<defs><marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#3F9BD6"/></marker></defs>';
  function padSVG(id, defs, mode, user) {
    var model = '';
    if (mode === 'guide') model = defs.map(function (w) { return wedgeSVG(w, '#C9A56A', 0.38); }).join('') + guideSVG(defs);
    else if (mode === 'faint') model = defs.map(function (w) { return wedgeSVG(w, '#C9A56A', 0.22); }).join('');
    return '<svg id="' + id + '" class="pad-svg" viewBox="0 0 1 1" role="img" aria-label="صفحهٔ مشق">' + ARR +
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
        var dist = Math.hypot(u.x - d.x, u.y - d.y), tol = d.t === 'w' ? 0.2 : 0.16, r = d.t === 'w' ? 1 : u.len / d.len;
        if (dist < tol && r > 0.45 && r < 1.9 && dist < bd) { bd = dist; best = j; }
      });
      if (best >= 0) { used[best] = true; matched++; dsum += bd; }
      else { var nr = user.some(function (u, j) { return !used[j] && u.t !== d.t && Math.hypot(u.x - d.x, u.y - d.y) < 0.18; }); (nr ? wrongDir : missing).push(i); }
    });
    var extra = user.length - matched, n = defs.length, mean = matched ? dsum / matched : 1;
    var st = matched === n && extra === 0 && mean < 0.085 ? 3 : matched === n && extra <= 1 ? 2 : matched >= Math.ceil(n / 2) ? 1 : 0;
    var msg = [];
    if (st === 3) msg.push('عالی! مثل دبیران داریوش نوشتی.');
    else if (st === 2) msg.push(extra ? 'همهٔ میخ‌ها درست است؛ فقط یک میخ اضافه داری.' : 'همهٔ میخ‌ها درست است؛ جای آن‌ها را کمی دقیق‌تر کن.');
    wrongDir.forEach(function (i) { msg.push('جهت میخ شمارهٔ ' + fn(i + 1) + ' درست نیست؛ باید ' + TNAME[defs[i].t] + ' باشد.'); });
    if (missing.length) msg.push(fn(missing.length) + ' میخ جا افتاده یا جایش دور است: ' + missing.map(function (i) { return TNAME[defs[i].t] + ' ' + fn(i + 1); }).join('، ') + '.');
    if (extra > 1) msg.push(fn(extra) + ' میخ اضافه کشیده‌ای.');
    return { stars: st, msg: msg.slice(0, 2) };
  }
  function bindPad(svg, defs, user, onChange) {
    var start = null, pid = null;
    function pt(e) { var r = svg.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) }; }
    svg.addEventListener('pointerdown', function (e) { e.preventDefault(); start = pt(e); pid = e.pointerId; try { svg.setPointerCapture(pid); } catch (x) {} });
    svg.addEventListener('pointermove', function (e) { if (!start || e.pointerId !== pid) return; svg.querySelector('.preview').innerHTML = wedgeSVG(classify(start, pt(e), defs), '#E8734A', 0.7); });
    function end(e) {
      if (!start || e.pointerId !== pid) return; var w = classify(start, pt(e), defs); start = null; svg.querySelector('.preview').innerHTML = '';
      ['x', 'y', 'len', 'w'].forEach(function (k) { w[k] = r3(w[k]); });
      user.push(w); svg.querySelector('.user').innerHTML = user.map(function (u) { return wedgeSVG(u, '#5E3A22'); }).join(''); if (onChange) onChange();
    }
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', function () { start = null; svg.querySelector('.preview').innerHTML = ''; });
  }
  function thumbW(ws, defs) { return '<svg viewBox="0 0 1 1">' + (defs ? defs.map(function (w) { return wedgeSVG(w, '#C9A56A', 0.25); }).join('') : '') + ws.map(function (w) { return wedgeSVG(w, '#5E3A22'); }).join('') + '</svg>'; }

  /* ---------- pen geometry (Pahlavi & Avestan; stroke paths derived from the font outlines) ---------- */
  function polyD(s) { return 'M' + s.map(function (p) { return r3(p[0]) + ' ' + r3(p[1]); }).join(' L'); }
  function penPath(s, color, w, op, extra) { return '<path d="' + polyD(s) + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + (op || 1) + '"' + (extra || '') + '/>'; }
  function penModel(m, mode) {
    if (mode === 'none') return '';
    var out = m.s.map(function (s) { return penPath(s, '#C9A56A', m.w, mode === 'guide' ? 0.42 : 0.24); }).join('');
    if (mode === 'guide') out += m.s.map(function (s, i) { return (s.length > 1 ? penPath(s, '#3F9BD6', 0.012, 1, ' stroke-dasharray="0.025 0.015" marker-end="url(#arr)"') : '') + numDot(s[0][0], s[0][1], i); }).join('');
    return out;
  }
  var INK = 0.05;
  function penSVG(id, m, mode, user) {
    return '<svg id="' + id + '" class="pad-svg" viewBox="0 0 1 1" role="img" aria-label="صفحهٔ مشق">' + ARR + '<g class="model">' + penModel(m, mode) + '</g><g class="user">' +
      (user || []).map(function (s) { return penPath(s, '#5E3A22', INK); }).join('') + '</g><g class="preview"></g></svg>';
  }
  function samp(s, step) {
    var o = [s[0]];
    for (var i = 1; i < s.length; i++) {
      var a = s[i - 1], b = s[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / step));
      for (var j = 1; j <= k; j++) o.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
    }
    return o;
  }
  function near(p, pts, tol) { var t2 = tol * tol; for (var i = 0; i < pts.length; i++) { var dx = pts[i][0] - p[0], dy = pts[i][1] - p[1]; if (dx * dx + dy * dy < t2) return true; } return false; }
  function penScore(m, user, who) {
    var tol = Math.max(0.075, m.w * 0.7), us = [];
    user.forEach(function (s) { us = us.concat(samp(s, 0.012)); });
    var per = m.s.map(function (s) { var sm = samp(s, 0.012), c = 0; if (us.length) sm.forEach(function (p) { if (near(p, us, tol)) c++; }); return { n: sm.length, c: c }; });
    var tn = per.reduce(function (a, x) { return a + x.n; }, 0), tc = per.reduce(function (a, x) { return a + x.c; }, 0), cov = tn ? tc / tn : 0;
    var ms = []; m.s.forEach(function (s) { ms = ms.concat(samp(s, 0.012)); });
    var pin = us.filter(function (p) { return near(p, ms, tol + 0.02); }).length, prec = us.length ? pin / us.length : 0;
    var st = cov >= 0.85 && prec >= 0.8 ? 3 : cov >= 0.7 && prec >= 0.65 ? 2 : cov >= 0.45 ? 1 : 0, msg = [];
    if (st === 3) msg.push('عالی! مثل ' + (who || 'دبیران') + ' نوشتی.');
    else if (st === 2) msg.push('خوب است! شکل درست است؛ کمی دقیق‌تر روی سرمشق بمان.');
    var weak = []; per.forEach(function (x, i) { if (x.n && x.c / x.n < 0.6) weak.push(i); });
    if (st < 3 && weak.length) msg.push(m.s.length > 1 ? 'خط ' + weak.map(function (i) { return 'شمارهٔ ' + fn(i + 1); }).join(' و ') + ' را کامل‌تر بکش.' : 'خط را از آغاز تا پایان کامل بکش.');
    if (st < 3 && prec < 0.65) msg.push('بخشی از خط‌هایت بیرون از جای حرف است.');
    if (!msg.length) msg.push('دوباره تلاش کن؛ آرام‌تر و روی سرمشق.');
    return { stars: st, msg: msg.slice(0, 2), cov: Math.round(cov * 100) / 100, prec: Math.round(prec * 100) / 100 };
  }
  function bindPen(svg, user, onChange) {
    var cur = null, pid = null, el = null;
    function pt(e) { var r = svg.getBoundingClientRect(); return [r3(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))), r3(Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)))]; }
    svg.addEventListener('pointerdown', function (e) { e.preventDefault(); cur = [pt(e)]; pid = e.pointerId; try { svg.setPointerCapture(pid); } catch (x) {} svg.querySelector('.preview').innerHTML = penPath(cur.concat([cur[0]]), '#E8734A', INK, 0.9); el = svg.querySelector('.preview path'); });
    svg.addEventListener('pointermove', function (e) {
      if (!cur || e.pointerId !== pid) return;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!evs.length) evs = [e];
      evs.forEach(function (ev) { var p = pt(ev), q = cur[cur.length - 1]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.006) cur.push(p); });
      if (el) el.setAttribute('d', polyD(cur));
    });
    function end(e) {
      if (!cur || e.pointerId !== pid) return; var s = cur; cur = null; svg.querySelector('.preview').innerHTML = '';
      if (s.length === 1) s.push([r3(s[0][0] + 0.004), s[0][1]]);
      user.push(s); svg.querySelector('.user').innerHTML = user.map(function (u) { return penPath(u, '#5E3A22', INK); }).join(''); if (onChange) onChange();
    }
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', function () { cur = null; svg.querySelector('.preview').innerHTML = ''; });
  }
  function thumbP(strokes, m) { return '<svg viewBox="0 0 1 1">' + (m ? m.s.map(function (s) { return penPath(s, '#C9A56A', m.w, 0.25); }).join('') : '') + strokes.map(function (s) { return penPath(s, '#5E3A22', 0.06); }).join('') + '</svg>'; }
  function isPen(sid) { return sid !== 'op'; }
  function pad(sid, id, m, mode, user) { return isPen(sid) ? penSVG(id, m, mode, user) : padSVG(id, m, mode, user); }
  function bindAny(sid, svg, m, user, cb) { if (isPen(sid)) bindPen(svg, user, cb); else bindPad(svg, m, user, cb); }
  function scoreAny(sid, m, user) { return isPen(sid) ? penScore(m, user, K.who[sid]) : score(m, user); }
  function nStrokes(sid, m) { return isPen(sid) ? fn(m.s.length) + ' خط' : fn(m.length) + ' میخ'; }
  function thumb(sid, t, m) { return isPen(sid) ? thumbP(t.w, t.m === 'none' ? null : m) : thumbW(t.w, t.m === 'none' ? null : m); }

  /* ---------- tabs ---------- */
  var TABS = [['home', '🏛️', 'خانه'], ['scripts', '𐎠', 'خط‌ها'], ['notebook', '✍', 'دفتر'], ['name', '🔤', 'نام من'], ['gallery', '🖼️', 'شکوه']];
  function tabbar(cur) { return '<nav class="tabbar">' + TABS.map(function (t) { return '<button class="' + (t[0] === cur ? 'on' : '') + '" data-go="' + t[0] + '"><span class="ic">' + t[1] + '</span><span>' + t[2] + '</span></button>'; }).join('') + '</nav>'; }
  function lrow(cls, go, num, title, desc, st, extra) {
    return '<button class="card lrow ' + cls + '" ' + go + '><span class="num">' + num + '</span><span class="t"><b>' + title + '</b>' + (desc ? '<span class="d">' + desc + '</span>' : '') + (extra || '') + '</span>' + (st ? '<span class="st">' + st + '</span>' : '') + '</button>';
  }
  function home() {
    var sid = P.last || 'op', S = SS[sid], started = ORDER.some(function (x) { return scriptPct(x) > 0; });
    var hd = '<header class="page-h"><div class="row"><img class="mini-logo" src="icons/icon-192.png" alt="Kisti"><h1 class="brand" dir="ltr" style="text-align:right">Kisti</h1><img class="flag" src="images/shir-o-khorshid.svg" alt="پرچم شیر و خورشید"></div>' + RULE +
      '<p class="subt">کیستی · خواندن خط‌های باستانی ایران</p></header>';
    var b = illu('images/persepolis.webp', 'تخت جمشید در روزگار هخامنشیان', 'grow tallok') +
      '<p class="lead">سه خط کهن ایران: <b>میخی</b> هخامنشیان، <b>پهلوی</b> ساسانیان و <b>دین‌دبیره</b>ی اوستا. از الفبا تا خواندن کتیبه‌های واقعی؛ هر نشانه را می‌بینی، می‌شنوی و <b>مشق</b> می‌کنی.</p>' +
      '<div class="chips">' + ORDER.map(function (x) { return '<button class="chip' + (x === sid ? ' on' : '') + '" data-go="s/' + x + '"><span class="g ' + SS[x].cls + '">' + K.sample[x] + '</span><small>' + SS[x].short + ' · ٪' + fn(scriptPct(x)) + '</small></button>'; }).join('') + '</div>' +
      '<div class="btnrow"><button class="btn btn-coral" data-go="s/' + sid + '">' + (started ? 'ادامه: ' + S.short : 'شروع: خط میخی') + ' ←</button><button class="btn btn-line" data-install>📲 نصب اپ</button></div>' +
      '<p class="credit">ساخته شده توسط <b dir="ltr" lang="en">Daniel Mozafari</b> · <button class="link" data-go="credits">منابع و تصویرها</button></p>';
    render(hd + '<main class="body">' + b + '</main>' + tabbar('home'));
  }
  function scriptsTab() {
    var b = ORDER.map(function (sid) {
      var S = SS[sid], nl = S.lessons.filter(function (l) { return lessonDone(sid, l.n); }).length, pct = scriptPct(sid);
      return '<button class="card script" data-go="s/' + sid + '"><img src="' + S.img + '" alt=""><span class="sbody"><span class="sh"><b>' + S.name + '</b><span class="pill' + (pct ? '">٪' + fn(pct) : ' gray">شروع') + '</span></span><span class="latin en">' + S.latin + '</span>' +
        '<span class="bl">' + fn(S.lessons.length) + ' درس · ' + fn(S.signs.length) + ' ' + S.unit + ' · ' + fn(S.texts.length) + ' متن · ' + fn(nl) + ' درس تمام شد</span><span class="sample ' + S.cls + '">' + K.sample[sid] + '</span><span class="bar"><i style="width:' + pct + '%"></i></span></span></button>';
    }).join('');
    render(head('سه خط باستانی', null, 'هر خط راهِ خودش را دارد', null) + '<main class="body">' + b + '</main>' + tabbar('scripts'));
  }

  /* ---------- a script's path: lesson grid, then words → sentences → reading ---------- */
  var CUR = { sid: 'op', n: 1 };
  function scriptPath(sid) {
    var S = SS[sid], nx = nextLesson(sid); P.last = sid; save();
    var grid = '<div class="lgrid">' + S.lessons.map(function (l) {
      var c = lessonCount(sid, l.n), tot = partsOf(sid, l.n).length, open = lessonOpen(sid, l.n), done = c === tot;
      return '<button class="ltile c' + (((l.n - 1) % 6) + 1) + (done ? ' done' : open ? ' open' : ' locked') + (l.n === nx ? ' next' : '') + '" data-go="l/' + sid + '/' + l.n + '"' + (open ? '' : ' data-locked="' + (l.n - 1) + '"') + '>' +
        '<span class="num">' + fn(l.n) + '</span><span class="lg ' + S.cls + '">' + S.SIG[l.signs[0]].g + '</span><small>' + (done ? '✓' : open ? fn(c) + '/' + fn(tot) : '🔒') + '</small></button>';
    }).join('') + '</div>';
    var w = S.words.filter(function (x) { return PS(sid).words[x.id]; }).length, se = S.sentences.filter(function (x, i) { return PS(sid).sents[i]; }).length, td = textsDone(sid);
    var nl = S.texts.reduce(function (a, t) { return a + t.lines.length; }, 0);
    var st = [
      ['words/' + sid, 'واژه‌سازی', fn(S.words.length) + ' واژه از ' + K.src[sid], wordsOpen(sid), w, S.words.length, 'پس از همهٔ درس‌ها'],
      ['sent/' + sid, 'جمله‌سازی', fn(S.sentences.length) + ' جملهٔ واقعی', sentOpen(sid), se, S.sentences.length, 'پس از واژه‌سازی'],
      ['read/' + sid, K.readName[sid], fn(S.texts.length) + ' متن · ' + fn(nl) + ' سطر', readOpen(sid), td, S.texts.length, 'پس از جمله‌سازی']];
    var rows = st.map(function (x, i) { var done = x[4] === x[5]; return lrow('c' + (i + 2) + (done ? ' done' : '') + (x[3] ? '' : ' locked'), 'data-go="' + x[0] + '"' + (x[3] ? '' : ' data-lockmsg="' + x[6] + '"'), x[3] ? fn(i + 1) : '🔒', x[1], x[2], done ? '✓ تمام شد' : x[3] ? fn(x[4]) + ' از ' + fn(x[5]) : 'قفل'); }).join('');
    var go;
    if (nx) go = '<button class="btn btn-coral btn-block" data-go="l/' + sid + '/' + nx + '">' + (lessonCount(sid, nx) ? 'ادامهٔ' : 'شروع') + ' درس ' + fn(nx) + ' ←</button>';
    else if (!wordsDone(sid)) go = '<button class="btn btn-coral btn-block" data-go="words/' + sid + '">واژه‌سازی ←</button>';
    else if (!sentsDone(sid)) go = '<button class="btn btn-coral btn-block" data-go="sent/' + sid + '">جمله‌سازی ←</button>';
    else go = '<button class="btn btn-coral btn-block" data-go="read/' + sid + '">' + K.readName[sid] + ' ←</button>';
    render(page(head(S.name, null, S.latin + ' · ' + (S.dir === 'ltr' ? 'از چپ به راست' : 'از راست به چپ'), 'scripts'),
      illu(S.img, S.name, 'grow opt') + '<div class="lbl"><b>الفبا · ' + fn(S.lessons.length) + ' درس</b><button class="link small" data-act="about" data-sid="' + sid + '">دربارهٔ این خط</button></div>' + grid + '<div class="lbl"><b>از ' + S.unit + ' تا متن</b></div>' + rows, go));
  }

  /* ---------- lesson overview ---------- */
  var PARTS = { learn: ['یادگیری', 'هر نشانه را ببین، بشنو و رازش را بخوان'], mashq: ['مشق', 'هر نشانه پنج بار؛ الگو کم‌کم محو می‌شود'], quiz: ['آزمونک', '۱۰ پرسش؛ با ۷ درست می‌گذری'], review: ['مرور', 'پنج نشانه از درس‌های پیش'] };
  function lessonView() {
    var sid = CUR.sid, n = CUR.n, S = SS[sid], l = S.lessons[n - 1], parts = partsOf(sid, n), L = lp(sid, n), c = lessonCount(sid, n);
    var np = parts.filter(function (p) { return !L[p]; })[0];
    var bub = c === parts.length ? '<b>درس ' + fn(n) + ' تمام شد!</b> ' + (n < S.lessons.length ? 'درس ' + fn(n + 1) + ' باز شد.' : 'حالا با همین نشانه‌ها واژه بساز.') :
      (l.signs[0].indexOf('hz') === 0 ? 'هزوارش واژه‌ای است که به <b>آرامی</b> نوشته و به <b>پارسی</b> خوانده می‌شد؛ مثل اینکه «&» بنویسیم و «و» بخوانیم.' : fn(l.signs.length) + ' ' + S.unit + ' تازه یاد می‌گیریم' + (l.mashq ? '، مشق می‌کنیم' : '') + ' و یک آزمونک داریم.');
    var b = illu(n % 2 ? S.img : (K.alt[sid] || S.img), S.name, 'grow opt') + '<div class="mascot-row"><img class="mascot" src="images/mascot.webp" alt="' + S.mascot + '"><div class="bubble">' + bub + '</div></div>' +
      parts.map(function (p, i) { var d = L[p], x = p === np; return lrow('c' + (i + 1) + (d ? ' done' : x ? ' next' : ''), 'data-go="' + p + '/' + sid + '/' + n + '"', fn(i + 1), PARTS[p][0], p === 'mashq' ? fn(l.signs.filter(function (id) { return S.SIG[id].m; }).length) + ' ' + S.unit + ' × ۵ تلاش' : PARTS[p][1], d ? '✓ تمام شد' : x ? 'شروع' : 'باز'); }).join('');
    var foot = c === parts.length ? (n < S.lessons.length ? '<button class="btn btn-coral btn-block" data-go="l/' + sid + '/' + (n + 1) + '">درس ' + fn(n + 1) + ' ←</button>' : '<button class="btn btn-coral btn-block" data-go="words/' + sid + '">واژه‌سازی ←</button>')
      : '<button class="btn btn-coral btn-block" data-go="' + np + '/' + sid + '/' + n + '">' + (c ? 'ادامه' : 'شروع') + ': ' + PARTS[np][0] + ' ←</button>';
    render(page(head('درس ' + fn(n), S.short, l.title + (S.SIG[l.signs[0]].kind === 'hz' ? '' : ' · ' + l.signs.slice(0, 6).map(function (id) { return S.SIG[id].g; }).join(' ')), 's/' + sid), b, foot));
  }
  function lhead(part, pill) { return head('درس ' + fn(CUR.n) + ' <span class="dot">•</span> <span class="blue">' + PARTS[part][0] + '</span>', pill, null, 'l/' + CUR.sid + '/' + CUR.n); }
  function gridCls(n) { return 'signs5 n' + Math.min(n, 9); }

  /* ---------- 1. learn ---------- */
  var A = { sel: null, tab: null, key: '' };
  function learn() {
    var sid = CUR.sid, S = SS[sid], l = S.lessons[CUR.n - 1], ids = l.signs, ps = PS(sid);
    if (A.key !== sid + CUR.n) { A.key = sid + CUR.n; A.sel = ids.filter(function (id) { return ps.seen.indexOf(id) < 0; })[0] || ids[0]; A.tab = null; }
    var s = S.SIG[A.sel];
    if (!A.tab) A.tab = ps.seen.length ? 'hint' : 'about';
    if (ps.seen.indexOf(s.id) < 0) { ps.seen.push(s.id); save(); }
    if (ids.every(function (id) { return ps.seen.indexOf(id) >= 0; })) partDone(sid, CUR.n, 'learn');
    var hz = s.kind === 'hz';
    var tabs = hz ? [['hint', '📜 هزوارش'], ['about', 'دربارهٔ خط']] : [['hint', '💡 راز'], ['text', 'توضیح'], ['about', 'دربارهٔ خط']];
    if (!tabs.some(function (t) { return t[0] === A.tab; })) A.tab = 'hint';
    var panel = A.tab === 'hint' ? (hz ? s.text : '<b>راز به‌یادسپاری:</b> ' + s.hint) : A.tab === 'text' ? s.text : S.about;
    var vals = hz ? '<span class="lat">' + s.tr + '</span><span class="arrow">←</span><span class="lat green">' + s.read + '</span><span class="fa">' + s.fa + '</span>' : '<span class="lat">' + s.tr + '</span><span class="fa">' + s.fa + '</span>';
    var b = '<div class="card signhero"><div class="big ' + S.cls + (hz ? ' hz' : '') + '">' + s.g + '</div><div class="vals">' + vals + '</div><button class="play" data-play="' + s.audio + '">🔊 بشنو</button>' +
      '<div class="seg">' + tabs.map(function (t) { return '<button class="' + (t[0] === A.tab ? 'on' : '') + '" data-ltab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div class="hint">' + panel + '</div></div>';
    b += '<div class="' + gridCls(ids.length) + '">' + ids.map(function (id) { var x = S.SIG[id]; return '<button class="sg' + (id === A.sel ? ' sel' : '') + (ps.seen.indexOf(id) >= 0 ? ' seen' : '') + (x.kind === 'hz' ? ' hz' : '') + '" data-sign="' + id + '"><span class="' + S.cls + '">' + x.g + '</span><span class="lat">' + (x.kind === 'hz' ? x.read : first(x.tr)) + '</span></button>'; }).join('') + '</div>';
    var i = ids.indexOf(A.sel), nextPart = l.mashq ? 'mashq' : 'quiz';
    var foot = i < ids.length - 1 ? '<button class="btn btn-coral btn-block" data-sign="' + ids[i + 1] + '">' + S.unit + 'ِ بعدی ←</button>' : '<button class="btn btn-coral btn-block" data-go="' + nextPart + '/' + sid + '/' + CUR.n + '">برو به ' + PARTS[nextPart][0] + ' ←</button>';
    render(page(lhead('learn', fn(ids.filter(function (id) { return ps.seen.indexOf(id) >= 0; }).length) + ' از ' + fn(ids.length)), b, foot));
    Audio_.preload(ids.map(function (id) { return S.SIG[id].audio; }));
  }

  /* ---------- 2. mashq: five tries per sign with a fading model ---------- */
  var M = { key: '', list: [], si: 0, ti: 0, user: [], res: null, showModel: false };
  function modeFor(ti) { return ti === 0 ? 'guide' : ti < 3 ? 'faint' : 'none'; }
  var MODE_TXT = { guide: 'با الگو و شمارهٔ ترتیب', faint: 'با الگوی کم‌رنگ', none: 'از حافظه، بدون الگو' };
  function padBox(inner, tag) { return '<div class="padwrap"><div class="padbox">' + inner + (tag || '') + '</div></div>'; }
  function feedbackHtml(r, msgs) {
    return '<div class="feedback' + (r.stars >= 2 ? ' good' : '') + '"><div class="seals">' + [0, 1, 2].map(function (i) { return seal(i < r.stars); }).join('') + '</div><div class="fmsg">' + msgs.map(function (m) { return '<p>' + m + '</p>'; }).join('') + '</div></div>';
  }
  function mashqInit() {
    var sid = CUR.sid, S = SS[sid];
    if (M.key !== sid + CUR.n) M = { key: sid + CUR.n, list: S.lessons[CUR.n - 1].signs.filter(function (id) { return S.SIG[id].m; }), si: 0, ti: 0, user: [], res: null, showModel: false };
    if (!M.res && !M.user.length && M.ti === 0) { var id = M.list[M.si], nb = PS(sid).nb; nb[id] = { tries: [], best: (nb[id] || {}).best || 0 }; save(); }
  }
  function mashq() {
    var sid = CUR.sid, S = SS[sid], id = M.list[M.si], s = S.SIG[id], m = s.m, mode = M.showModel && modeFor(M.ti) === 'none' ? 'faint' : modeFor(M.ti);
    var nb = PS(sid).nb[id] = PS(sid).nb[id] || { tries: [] }, pen = isPen(sid);
    var b = '<div class="mq-top"><span class="' + S.cls + '">' + s.g + '</span><div class="t"><b><span class="lat">' + first(s.tr) + '</span> · ' + last(s.fa) + '</b><div class="muted">سَرمشق: ' + nStrokes(sid, m) + ' · تلاش ' + fn(M.ti + 1) + ' از ۵</div></div><button class="play small" data-play="' + s.audio + '">🔊</button></div>';
    b += '<div class="tries">' + [0, 1, 2, 3, 4].map(function (t) { var r = nb.tries[t]; return '<span class="' + (t === M.ti ? 'cur' : r && r.s > 0 ? 'ok' : '') + '">' + (r && t !== M.ti ? stars(r.s) : fn(t + 1)) + '</span>'; }).join('') + '</div>';
    b += padBox(pad(sid, 'pad', m, mode, M.user), '<span class="pill ' + (mode === 'none' ? 'gold' : 'blue') + ' mode-tag">' + MODE_TXT[mode] + '</span>');
    if (!M.res) b += pen ? '<div class="legend"><span><b>با انگشت</b> روی خط‌ها بکش</span><span>از <b>نقطهٔ شماره‌دار</b> شروع کن</span><span>هر خط = یک کشش</span></div>'
      : '<div class="legend"><span><b>میخ ایستاده:</b> به پایین بکش</span><span><b>افقی:</b> به راست بکش</span><span><b>گوشه‌میخ:</b> کج بکش یا یک ضربه</span></div>';
    var foot, dis = M.user.length ? '' : ' disabled';
    if (!M.res) foot = '<div class="tools"><button class="btn btn-line" data-act="undo-w"' + dis + '>↶ برگرداندن</button><button class="btn btn-line" data-act="clear-w"' + dis + '>پاک کردن</button><button class="btn btn-coral" data-act="check-w"' + dis + '>بررسی ✓</button></div>';
    else {
      var r = M.res;
      foot = feedbackHtml(r, r.msg) + '<div class="tools">' + (r.stars === 0 ? '<button class="btn btn-line" data-act="retry-w">دوباره</button>' + (modeFor(M.ti) === 'none' && !M.showModel ? '<button class="btn btn-line" data-act="model-w">💡 نمایش الگو</button>' : '') :
        '<button class="btn btn-line" data-act="retry-w">دوباره</button><button class="btn btn-coral" data-act="next-w">' + (M.ti < 4 ? 'تلاش بعدی ←' : M.si < M.list.length - 1 ? S.unit + 'ِ بعدی ←' : 'پایان مشق ←') + '</button>') + '</div>';
    }
    render(page(lhead('mashq', S.unit + ' ' + fn(M.si + 1) + ' از ' + fn(M.list.length)), b, foot));
    if (!M.res) bindAny(sid, document.getElementById('pad'), m, M.user, function () { app.querySelectorAll('[data-act="undo-w"],[data-act="clear-w"],[data-act="check-w"]').forEach(function (x) { x.disabled = !M.user.length; }); });
  }
  function mashqCheck() {
    var sid = CUR.sid, id = M.list[M.si], r = scoreAny(sid, SS[sid].SIG[id].m, M.user);
    M.res = r;
    var nb = PS(sid).nb[id] = PS(sid).nb[id] || { tries: [] };
    nb.tries[M.ti] = { s: r.stars, w: M.user.slice(), t: Date.now(), m: modeFor(M.ti) };
    nb.best = Math.max(nb.best || 0, r.stars); save();
    mashq();
  }
  function mashqNext() {
    var sid = CUR.sid, S = SS[sid];
    M.res = null; M.user = []; M.showModel = false;
    if (M.ti < 4) M.ti++;
    else if (M.si < M.list.length - 1) { M.si++; M.ti = 0; var nb = PS(sid).nb, id = M.list[M.si]; nb[id] = { tries: [], best: (nb[id] || {}).best || 0 }; save(); }
    else {
      partDone(sid, CUR.n, 'mashq'); M.si = 0; M.ti = 0;
      render(page(lhead('mashq', 'تمام شد'), illu('images/mascot.webp', S.mascot, 'grow opt contain') + '<div class="card celebrate"><div class="seals">' + seal(1) + seal(1) + seal(1) + '</div><h3>' + fn(M.list.length) + ' ' + S.unit + '، هر کدام پنج بار!</h3><p>مشق‌هایت در «دفتر مشق» ذخیره شد.</p></div>',
        '<button class="btn btn-coral btn-block" data-go="quiz/' + sid + '/' + CUR.n + '">آزمونک ←</button><button class="btn btn-line btn-block" data-go="notebook">دفتر مشق</button>'));
      return;
    }
    mashq();
  }

  /* ---------- 3. quiz: 4 shape→sound, 4 sound→shape, 2 write from memory (5+5 when nothing can be written) ---------- */
  var Q = null;
  function optLabel(o) { return o.kind === 'hz' ? '<span class="lat">' + o.read + '</span> · ' + o.fa : '<span class="lat">' + first(o.tr) + '</span> · ' + last(o.fa); }
  function makeQuiz(sid, n) {
    var S = SS[sid], pool = S.lessons[n - 1].signs, wm = pool.filter(function (id) { return S.SIG[id].m; }), nw = wm.length ? 2 : 0, nt = (10 - nw) / 2, qs = [];
    var others = S.signs.filter(function (s) { return pool.indexOf(s.id) < 0 && s.kind === S.SIG[pool[0]].kind; }).map(function (s) { return s.id; });
    function opts(id) { var d = shuffle(pool.filter(function (x) { return x !== id; })); if (d.length < 3) d = d.concat(shuffle(others)); return shuffle([id].concat(d.slice(0, 3))); }
    cyc(shuffle(pool), nt).forEach(function (id) { qs.push({ type: 't', s: S.SIG[id], opts: opts(id) }); });
    cyc(shuffle(pool), nt).forEach(function (id) { qs.push({ type: 'g', s: S.SIG[id], opts: opts(id) }); });
    qs = shuffle(qs); cyc(shuffle(wm), nw).forEach(function (id, i) { qs.splice(3 + i * 4, 0, { type: 'w', s: S.SIG[id] }); });
    return { key: sid + n, i: 0, score: 0, qs: qs, user: [], res: null };
  }
  function quiz() {
    var sid = CUR.sid, S = SS[sid];
    if (!Q || Q.key !== sid + CUR.n) Q = makeQuiz(sid, CUR.n);
    var hd = lhead('quiz', Q.i < Q.qs.length ? fn(Q.i + 1) + ' از ' + fn(Q.qs.length) : 'پایان');
    if (Q.i >= Q.qs.length) {
      var pass = Q.score >= 7; if (pass) partDone(sid, CUR.n, 'quiz');
      render(page(hd, illu('images/mascot.webp', S.mascot, 'grow opt contain') + '<div class="card celebrate"><div class="seals">' + [0, 1, 2].map(function (i) { return seal(i < (Q.score >= 9 ? 3 : Q.score >= 7 ? 2 : 1)); }).join('') + '</div><h3>' + (pass ? 'آفرین! آزمونک را گذراندی' : 'خوب بود؛ یک بار دیگر') + '</h3><p>' + fn(Q.score) + ' از ' + fn(Q.qs.length) + ' درست در نخستین تلاش' + (pass ? '' : ' · برای گذر ۷ لازم است') + '</p></div>',
        pass ? '<button class="btn btn-coral btn-block" data-go="review/' + sid + '/' + CUR.n + '">مرور ←</button>' : '<button class="btn btn-coral btn-block" data-act="quiz-again">دوباره</button><button class="btn btn-line btn-block" data-go="learn/' + sid + '/' + CUR.n + '">یک بار دیگر یادگیری</button>'));
      return;
    }
    var q = Q.qs[Q.i], c = 'c' + ((Q.i % 6) + 1), foot = null, hz = q.s.kind === 'hz';
    var b = '<div class="qprog">' + Q.qs.map(function (_, k) { return '<i class="' + (k < Q.i ? 'on' : k === Q.i ? 'cur' : '') + '"></i>'; }).join('') + '</div><div class="qcard qmain ' + c + '">';
    if (q.type === 't') b += '<div class="qhead"><span class="num">' + fn(Q.i + 1) + '</span>' + (hz ? 'این هزوارش چه خوانده می‌شود؟' : 'این ' + S.unit + ' چه صدایی دارد؟') + '</div><div class="qglyph ' + S.cls + (hz ? ' hz' : '') + '">' + q.s.g + '</div><div class="opts">' + q.opts.map(function (id, k) { return '<button class="opt" data-ans="' + id + '"><span class="L">' + LET[k] + '</span><span>' + optLabel(S.SIG[id]) + '</span></button>'; }).join('') + '</div>';
    else if (q.type === 'g') b += '<div class="qhead"><span class="num">' + fn(Q.i + 1) + '</span><span>' + (hz ? 'هزوارشِ «' + q.s.fa + '» (<span class="lat">' + q.s.read + '</span>) کدام است؟' : S.unit + 'ِ «' + last(q.s.fa) + '» (<span class="lat">' + first(q.s.tr) + '</span>) کدام است؟') + '</span><button class="play small" data-play="' + q.s.audio + '">🔊</button></div><div class="opts big' + (hz ? ' hz' : '') + '">' + q.opts.map(function (id, k) { return '<button class="opt" data-ans="' + id + '"><span class="L">' + LET[k] + '</span><span class="' + S.cls + '">' + S.SIG[id].g + '</span></button>'; }).join('') + '</div>';
    else {
      b += '<div class="qhead"><span class="num">' + fn(Q.i + 1) + '</span><span>بدون الگو بنویس: «' + last(q.s.fa) + '» (<span class="lat">' + first(q.s.tr) + '</span>)</span><button class="play small" data-play="' + q.s.audio + '">🔊</button></div>' + padBox(pad(sid, 'qpad', q.s.m, Q.res ? 'faint' : 'none', Q.user));
      foot = !Q.res ? '<div class="tools"><button class="btn btn-line" data-act="qclear">پاک کردن</button><button class="btn btn-coral" data-act="qcheck">بررسی ✓</button></div>'
        : feedbackHtml(Q.res, [Q.res.stars >= 2 ? 'درست است!' : 'الگوی درست، کم‌رنگ نشان داده شد.']) + '<div class="tools"><button class="btn btn-coral" data-act="qnext">ادامه ←</button></div>';
    }
    b += '</div>';
    render(page(hd, b, foot));
    if (q.type === 'w' && !Q.res) bindAny(sid, document.getElementById('qpad'), q.s.m, Q.user);
  }
  function answer(btn) {
    var q = Q.qs[Q.i], id = btn.getAttribute('data-ans');
    if (id === q.s.id) { btn.classList.add('ok'); if (!q.tried) Q.score++; Audio_.play(q.s.audio); app.querySelectorAll('.opt').forEach(function (x) { x.disabled = true; }); setTimeout(function () { Q.i++; quiz(); }, 800); }
    else { q.tried = true; btn.classList.add('bad'); btn.disabled = true; }
  }

  /* ---------- 4. review: five signs from earlier lessons ---------- */
  var R = { key: '', ids: [], open: {} };
  function review() {
    var sid = CUR.sid, S = SS[sid], n = CUR.n;
    if (R.key !== sid + n) {
      var pool = []; S.lessons.slice(0, n - 1).forEach(function (l) { pool = pool.concat(l.signs); });
      if (!pool.length) pool = S.lessons[0].signs;
      R = { key: sid + n, ids: shuffle(pool).slice(0, 5), open: {} };
    }
    var b = illu(S.img, S.name, 'grow opt') + '<div class="mascot-row"><img class="mascot" src="images/mascot.webp" alt=""><div class="bubble">' + (n > 1 ? 'یادت هست؟ این‌ها از درس‌های پیش‌اند. پیش از زدن، صدایش را در دل بگو.' : 'این نخستین درس است؛ همین نشانه‌ها را مرور کن.') + ' روی هر کارت بزن.</div></div>';
    b += '<div class="' + gridCls(R.ids.length) + '">' + R.ids.map(function (id) { var x = S.SIG[id], o = R.open[id]; return '<button class="sg' + (o ? ' seen' : '') + (x.kind === 'hz' ? ' hz' : '') + '" data-rev="' + id + '"><span class="' + S.cls + '">' + x.g + '</span><span class="lat">' + (o ? (x.kind === 'hz' ? x.read : first(x.tr)) : '؟') + '</span></button>'; }).join('') + '</div>';
    var all = R.ids.every(function (id) { return R.open[id]; });
    render(page(lhead('review', S.short), b, '<button class="btn btn-coral btn-block" data-act="rev-done"' + (all ? '' : ' disabled') + '>' + (lp(sid, n).review ? '✓ مرور شد · بازگشت به درس' : 'مرور شد ✓') + '</button>'));
    Audio_.preload(R.ids.map(function (id) { return S.SIG[id].audio; }));
  }

  /* ---------- notebook: all three scripts ---------- */
  var NB = { sid: null, pg: 0 };
  function practised(sid) { var nb = PS(sid).nb; return SS[sid].signs.filter(function (s) { return nb[s.id] && (nb[s.id].tries || []).filter(Boolean).length; }).map(function (s) { return s.id; }); }
  function notebook() {
    if (!NB.sid) NB.sid = P.last || 'op';
    var sid = NB.sid, S = SS[sid], nb = PS(sid).nb, ids = practised(sid);
    var per = 4, pages = Math.max(1, Math.ceil(ids.length / per)); if (NB.pg >= pages) NB.pg = pages - 1;
    var b = '<div class="seg big">' + ORDER.map(function (x) { var c = practised(x).length; return '<button class="' + (x === sid ? 'on' : '') + '" data-nb="' + x + '">' + SS[x].short + (c ? ' · ' + fn(c) : '') + '</button>'; }).join('') + '</div>';
    if (!ids.length) b += illu('images/scribe.webp', 'دبیر', 'grow opt') + '<div class="card celebrate"><div class="big">✍</div><h3>هنوز مشقی در خط ' + S.short + ' ننوشته‌ای</h3><p>در هر درس، بخش «مشق» را باز کن.</p></div>';
    else b += '<div class="nb">' + ids.slice(NB.pg * per, NB.pg * per + per).map(function (id) {
      var s = S.SIG[id], e = nb[id], tr = (e.tries || []).filter(Boolean);
      return '<div class="card nb-row"><span class="g ' + S.cls + '">' + s.g + '</span><div class="t"><b><span class="lat">' + first(s.tr) + '</span> · ' + last(s.fa) + '</b><div class="muted">' + fn(tr.length) + ' مشق · ' + stars(e.best || 0) + '</div></div>' +
        '<div class="nb-thumbs">' + [0, 1, 2, 3, 4].map(function (k) { var t = tr[k]; return t ? thumb(sid, t, s.m) : '<svg viewBox="0 0 1 1" class="empty"></svg>'; }).join('') + '</div></div>';
    }).join('') + '</div>';
    var foot = pages > 1 ? '<div class="pager"><button class="btn btn-line" data-act="nbpg" data-n="' + (NB.pg - 1) + '"' + (NB.pg ? '' : ' disabled') + '>→</button><span class="pg">' + fn(NB.pg + 1) + ' از ' + fn(pages) + '</span><button class="btn btn-coral" data-act="nbpg" data-n="' + (NB.pg + 1) + '"' + (NB.pg < pages - 1 ? '' : ' disabled') + '>←</button></div>' : null;
    render(head('دفتر مشق من', 'روی همین گوشی', null, null) + '<main class="body">' + b + '</main>' + (foot ? '<footer class="fbar">' + foot + '</footer>' : '') + tabbar('notebook'));
  }

  /* ---------- builder (words & sentences) ---------- */
  var W = { sid: '', i: 0 }, SN = { sid: '', i: 0 }, B = null;
  function newBuilder(ans, pool, kind) { return { kind: kind, answer: ans, tiles: shuffle(pool.map(function (v, k) { return { v: v, k: k }; })), picked: [], wrong: 0, help: false, solved: false, viaHelp: false }; }
  function tileVal(k) { return B.tiles.filter(function (t) { return t.k === k; })[0].v; }
  function slotsHtml(sid) {
    var S = SS[sid], n = B.answer.length, out = [];
    for (var j = 0; j < n; j++) {
      var v = B.picked[j] != null ? tileVal(B.picked[j]) : null;
      if (B.kind === 'sent' && j > 0 && S.div.trim()) out.push('<span class="divider ' + S.cls + '">' + S.div + '</span>');
      if (B.kind === 'word') out.push('<span class="slot' + (v ? '' : ' empty') + '">' + (v ? '<span class="' + S.cls + '">' + S.SIG[v].g + '</span>' : '·') + '</span>');
      else out.push('<span class="slot word' + (v ? '' : ' empty') + '">' + (v ? '<span class="' + S.cls + '">' + S.lex[v].g + '</span><small>' + S.lex[v].tr + '</small>' : '·') + '</span>');
    }
    return out.join('');
  }
  function tilesHtml(sid) {
    var S = SS[sid], nextNeed = B.help ? B.answer[B.picked.length] : null, hinted = false;
    return B.tiles.map(function (t) {
      var used = B.picked.indexOf(t.k) >= 0, hint = !used && !hinted && nextNeed === t.v; if (hint) hinted = true;
      var inner = B.kind === 'word' ? '<span class="' + S.cls + '">' + S.SIG[t.v].g + '</span>' : '<span class="' + S.cls + '">' + S.lex[t.v].g + '</span><small>' + S.lex[t.v].tr + '</small>';
      return '<button class="tile' + (B.kind === 'word' ? '' : ' word') + (used ? ' used' : '') + (hint ? ' hint' : '') + '" data-tile="' + t.k + '">' + inner + '</button>';
    }).join('');
  }
  function pickTile(k, rerender, sid) {
    if (B.solved) return;
    B.picked.push(k);
    var v = tileVal(k), S = SS[sid];
    Audio_.play(B.kind === 'word' ? S.SIG[v].audio : S.lex[v].audio);
    if (B.picked.length === B.answer.length) {
      var got = B.picked.map(tileVal);
      if (got.join() === B.answer.join()) { B.solved = true; rerender('ok'); return; }
      B.wrong++; rerender('bad'); setTimeout(function () { B.picked = []; rerender(); }, 700); return;
    }
    rerender();
  }
  function dirCls(sid) { return SS[sid].dir === 'rtl' ? ' rtl' : ''; }
  function wordsInit() {
    var S = SS[W.sid], w = S.lex[S.words[W.i].id];
    var learned = S.signs.filter(function (s) { return s.kind === 'sign' && w.s.indexOf(s.id) < 0; }).map(function (s) { return s.id; });
    B = newBuilder(w.s, w.s.concat(shuffle(learned).slice(0, 2)), 'word');
  }
  function words(state) {
    var sid = W.sid, S = SS[sid];
    if (!B || B.kind !== 'word') wordsInit();
    var wd = S.words[W.i], w = S.lex[wd.id], foot = null;
    var b = illu(K.alt[sid] || S.img, S.name, 'grow opt');
    b += '<div class="card task"><div class="goal"><p class="muted">این واژه را به خط ' + S.short + ' بنویس:</p><div class="fa">' + w.fa + '</div><div class="lat">' + w.tr + (w.read && w.read !== w.tr ? ' <span class="green">→ ' + w.read + '</span>' : '') + '</div></div>' +
      '<div class="slots' + dirCls(sid) + (state === 'ok' ? ' ok' : state === 'bad' ? ' bad' : '') + '" data-act="undo">' + slotsHtml(sid) + '</div>';
    if (B.solved) {
      b += '<div class="result"><b>✓ درست است!</b> <span class="' + S.cls + ' rg">' + w.g + '</span> = <span class="lat">' + w.tr + '</span><p>' + wd.note + '</p><p class="today">🌿 <b>در فارسی امروز:</b> ' + w.today + '</p></div>';
      foot = '<div class="tools"><button class="btn btn-line" data-play="' + w.audio + '">🔊 بشنو</button>' + (B.viaHelp ? '<button class="btn btn-coral" data-act="wretry">حالا خودت، از اول</button>' : '<button class="btn btn-coral" data-act="wnext">' + (W.i < S.words.length - 1 ? 'واژهٔ بعدی ←' : 'پایان واژه‌سازی ←') + '</button>') + '</div>';
    } else {
      if (!B.help) b += '<p class="note">' + (S.dir === 'ltr' ? 'از چپ به راست' : 'از راست به چپ') + ' بچین. برای پاک کردن آخرین ' + S.unit + '، روی خانه‌ها بزن.</p>';
      b += '<div class="tiles' + dirCls(sid) + (B.tiles.length > 7 ? ' many' : '') + '">' + tilesHtml(sid) + '</div>';
      if (B.help) b += '<div class="helpbox">پاسخ: <span class="' + S.cls + '">' + w.g + '</span> · ' + S.unit + 'ِ بعدی قاب طلایی دارد.</div>';
      if (B.wrong >= 2 && !B.help) foot = '<button class="btn btn-line btn-block" data-act="help">💡 کمک گرفتن</button>';
    }
    b += '</div>';
    render(page(head('واژه‌سازی', fn(W.i + 1) + ' از ' + fn(S.words.length), S.name, 's/' + sid), b, foot));
    if (state === 'ok') { Audio_.play(w.audio); if (!B.viaHelp) { PS(sid).words[wd.id] = true; save(); } }
    Audio_.preload(w.s.map(function (id) { return S.SIG[id].audio; }).concat([w.audio]));
  }
  function wordsEnd() {
    var sid = W.sid, S = SS[sid];
    render(page(head('واژه‌سازی', 'تمام شد', S.name, 's/' + sid), illu(S.img, S.name, 'grow opt') + '<div class="card celebrate"><div class="big">🏺</div><h3>' + fn(S.words.length) + ' واژه را نوشتی!</h3><p class="lat">' + S.words.slice(0, 4).map(function (w) { return S.lex[w.id].tr; }).join(' · ') + ' …</p></div>',
      '<button class="btn btn-coral btn-block" data-go="sent/' + sid + '">جمله‌سازی ←</button>'));
  }
  function sheet(html) {
    var s = document.getElementById('sheet');
    if (!s) { s = document.createElement('div'); s.id = 'sheet'; s.className = 'sheet'; document.body.appendChild(s); s.addEventListener('click', function (e) { if (e.target === s || e.target.closest('[data-x]')) sheet(null); }); }
    if (!html) { s.classList.remove('on'); s.innerHTML = ''; return; }
    s.innerHTML = '<div class="sheet-card card">' + wrapHtml(html) + '<button class="btn btn-coral btn-block" data-x="1">بستن</button></div>'; s.classList.add('on');
  }
  function sentence(state) {
    var sid = SN.sid, S = SS[sid], X = S.sentences[SN.i];
    if (!B || B.kind !== 'sent') B = newBuilder(X.w, X.w, 'sent');
    var b = illu(K.alt[sid] || S.img, S.name, 'grow opt');
    b += '<div class="card task"><div class="goal"><p class="muted">این جمله را بساز · <span class="en">' + X.ref + '</span></p><div class="fa">' + X.fa + '</div></div>' +
      '<div class="slots sent' + dirCls(sid) + (state === 'ok' ? ' ok' : state === 'bad' ? ' bad' : '') + '" data-act="undo">' + slotsHtml(sid) + '</div>';
    var gram = '<button class="btn btn-line" data-act="gram">📜 دستور ساده</button>', foot;
    if (B.solved) {
      b += '<div class="result"><b>✓ آفرین!</b> جمله‌ای از <span class="en">' + X.ref + '</span> را ساختی:<p class="lat big">' + X.w.map(function (k) { return S.lex[k].tr; }).join(' ') + '</p></div>';
      foot = '<div class="tools">' + gram + '<button class="btn btn-line" data-play="' + X.audio + '">🔊</button>' + (B.viaHelp ? '<button class="btn btn-coral" data-act="sretry">حالا خودت</button>' : '<button class="btn btn-coral" data-act="snext">' + (SN.i < S.sentences.length - 1 ? 'جملهٔ بعدی ←' : 'پایان ←') + '</button>') + '</div>';
    } else {
      b += '<p class="note">' + (S.div.trim() ? 'جداکنندهٔ <span class="' + S.cls + '">' + S.div + '</span> خودش میان واژه‌ها می‌آید. ' : '') + (S.dir === 'ltr' ? 'از چپ به راست.' : 'از راست به چپ.') + '</p><div class="tiles' + dirCls(sid) + '">' + tilesHtml(sid) + '</div>';
      if (B.help) b += '<div class="helpbox">ترتیب درست: <span class="lat">' + X.w.map(function (k) { return S.lex[k].tr; }).join(' · ') + '</span> · واژهٔ بعدی قاب طلایی دارد.</div>';
      foot = '<div class="tools">' + gram + (B.wrong >= 2 && !B.help ? '<button class="btn btn-line" data-act="help">💡 کمک گرفتن</button>' : '') + '</div>';
    }
    b += '</div>';
    render(page(head('جمله‌سازی', fn(SN.i + 1) + ' از ' + fn(S.sentences.length), S.name, 's/' + sid), b, foot));
    if (state === 'ok') { Audio_.play(X.audio); if (!B.viaHelp) { PS(sid).sents[SN.i] = true; save(); } }
    Audio_.preload(X.w.map(function (k) { return S.lex[k].audio; }).concat([X.audio]));
  }
  function sentEnd() {
    var sid = SN.sid, S = SS[sid];
    render(page(head('جمله‌سازی', 'تمام شد', S.name, 's/' + sid), illu(S.img, S.name, 'grow opt') + '<div class="card celebrate"><div class="big">📜</div><h3>' + fn(S.sentences.length) + ' جملهٔ واقعی ساختی!</h3><p>حالا متن‌های کامل را بخوان.</p></div>',
      '<button class="btn btn-coral btn-block" data-go="read/' + sid + '">' + K.readName[sid] + ' ←</button>'));
  }
  function grammarSheet() { var X = SS[SN.sid].sentences[SN.i]; sheet('<h3>📜 دستور ساده</h3><ul>' + X.grammar.map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ul>'); }

  /* ---------- reading: list of texts, then one line per page ---------- */
  function readList(sid) {
    var S = SS[sid];
    var b = S.texts.map(function (t, i) {
      var r = Object.keys(PS(sid).lines[t.id] || {}).length, d = PS(sid).done[t.id];
      return lrow('c' + ((i % 6) + 1) + (d ? ' done' : ''), 'data-go="text/' + sid + '/' + t.id + '"', fn(i + 1), t.title, '<span class="en">' + t.ref + '</span>', d ? '✓ خوانده شد' : fn(r) + ' از ' + fn(t.lines.length) + ' سطر');
    }).join('');
    render(page(head(K.readName[sid], fn(textsDone(sid)) + ' از ' + fn(S.texts.length), S.name, 's/' + sid), illu(S.texts[0].img, S.texts[0].title, 'grow opt') + b, null));
  }
  var I = { sid: '', tid: '', sel: null, pg: 0 };
  function textView() {
    var sid = I.sid, S = SS[sid], C = S.TX[I.tid], ps = PS(sid), rd = ps.lines[C.id] = ps.lines[C.id] || {}, N = C.lines.length, pg = I.pg, b, foot;
    var readN = Object.keys(rd).length;
    var dots = '<span class="dots">' + [0].concat(C.lines.map(function (_, n) { return n + 1; }), [N + 1]).map(function (k) { return '<i class="' + (k === pg ? 'cur' : k > 0 && k <= N && rd[k - 1] ? 'on' : '') + '"></i>'; }).join('') + '</span>';
    var prev = '<button class="btn btn-line" data-act="ipg" data-n="' + (pg - 1) + '"' + (pg ? '' : ' disabled') + '>→ قبلی</button>';
    if (pg === 0) {
      b = illu(C.img, C.title, 'grow opt') + '<div class="card intro"><p class="muted en">' + C.ref + '</p><p>' + C.about + '</p><p class="muted">👆 روی هر واژه بزن تا معنی و صدایش را ببینی؛ دکمهٔ 🔊 کل سطر را می‌خواند.</p></div>';
      foot = '<div class="pager">' + prev + dots + '<button class="btn btn-coral" data-act="ipg" data-n="1">شروع ←</button></div>';
    } else if (pg <= N) {
      var n = pg - 1, l = C.lines[n];
      var ws = l.w.map(function (k, j) { return (j && S.div.trim() ? '<span class="divider ' + S.cls + '">' + S.div + '</span>' : '') + '<button class="wbtn' + (I.sel === n + ':' + j ? ' on' : '') + '" data-w="' + n + ':' + j + '">' + S.lex[k].g + '</button>'; }).join('');
      var gl = '<div class="gloss empty">👆 روی یک واژه بزن</div>';
      if (I.sel && +I.sel.split(':')[0] === n) { var L = S.lex[l.w[+I.sel.split(':')[1]]]; gl = '<div class="gloss"><span class="' + S.cls + '">' + L.g + '</span> · <span class="lat">' + L.tr + (L.read && L.read !== L.tr ? ' → ' + L.read : '') + '</span> = <b>' + L.fa + '</b>' + (L.today && L.today !== '—' ? '<br>🌿 ' + L.today : '') + '</div>'; }
      b = '<div class="qcard line c' + ((n % 6) + 1) + (rd[n] ? ' read' : '') + '" data-swipe="i"><div class="top"><span class="num">' + fn(n + 1) + '</span><span class="muted">' + (rd[n] ? '✓ خوانده شد' : 'سطر ' + fn(n + 1) + ' از ' + fn(N)) + '</span><button class="play small" data-line="' + n + '">🔊 بخوان</button></div>' +
        '<div class="cuw' + dirCls(sid) + ' w-' + sid + '">' + ws + '</div><div class="tr">' + l.w.map(function (k) { return S.lex[k].tr; }).join(' ') + '</div>' + (sid === 'pa' ? '<div class="tr rd">' + l.w.map(function (k) { return S.lex[k].read; }).join(' ') + '</div>' : '') + '<div class="fa">' + l.fa + '</div>' + gl + '</div>';
      foot = '<div class="pager">' + prev + dots + '<button class="btn btn-coral" data-act="ipg" data-n="' + (pg + 1) + '">بعدی ←</button></div>';
      Audio_.preload(l.w.map(function (k) { return S.lex[k].audio; }).concat([l.audio]));
    } else {
      var tips = K.tips[sid] || [];
      b = '<div class="card grammar"><h3>🔎 نکته‌های خواندن</h3>' + tips.map(function (t) { return '<p>• ' + t + '</p>'; }).join('') + '</div>' +
        (ps.done[C.id] ? '<div class="card celebrate"><div class="big">🏛️</div><h3>' + C.title + ' را خواندی!</h3><p>' + fn(N) + ' سطر · ' + fn(textsDone(sid)) + ' از ' + fn(S.texts.length) + ' متن</p></div>' : illu(C.img, C.title, 'grow opt'));
      foot = '<div class="pager">' + prev + dots + '<button class="btn btn-coral" data-act="ifinish">' + (ps.done[C.id] ? 'متن‌ها' : 'خواندم ✓') + '</button></div>';
    }
    render(page(head(C.title, fn(readN) + ' از ' + fn(N), null, 'read/' + sid), b, foot));
  }

  /* ---------- name in three scripts (approximate, playful) ---------- */
  var CMAP = { 'ب': '𐎲', 'پ': '𐎱', 'ت': '𐎫', 'ط': '𐎫', 'ث': '𐎰', 'ج': '𐎩', 'چ': '𐎨', 'ح': '𐏃', 'ه': '𐏃', 'خ': '𐎧', 'د': '𐎭', 'ذ': '𐏀', 'ر': '𐎼', 'ز': '𐏀', 'ژ': '𐏀', 'ض': '𐏀', 'ظ': '𐏀',
    'س': '𐎿', 'ص': '𐎿', 'ش': '𐏁', 'ف': '𐎳', 'ق': '𐎥', 'غ': '𐎥', 'ک': '𐎣', 'ك': '𐎣', 'گ': '𐎥', 'ل': '𐎾', 'م': '𐎶', 'ن': '𐎴' };
  var PMAP = { 'ا': 'alef', 'آ': 'alef', 'ع': 'alef', 'ء': 'alef', 'ب': 'bet', 'پ': 'pe', 'ت': 'taw', 'ط': 'taw', 'ث': 'samekh', 'ج': 'sade', 'چ': 'sade', 'ح': 'he', 'ه': 'he', 'خ': 'het', 'د': 'dalet', 'ذ': 'zayin', 'ر': 'wr', 'ز': 'zayin', 'ژ': 'zayin', 'ض': 'zayin', 'ظ': 'zayin',
    'س': 'samekh', 'ص': 'samekh', 'ش': 'shin', 'غ': 'gimel', 'ف': 'pe', 'ق': 'kaf', 'ک': 'kaf', 'ك': 'kaf', 'گ': 'gimel', 'ل': 'lamed', 'م': 'mq', 'ن': 'nun', 'و': 'wr', 'ی': 'yod' };
  var VMAP = { 'ب': 'b', 'پ': 'p', 'ت': 't', 'ط': 't', 'ث': 'th', 'ج': 'j', 'چ': 'c', 'ح': 'h', 'ه': 'h', 'خ': 'x', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'ض': 'z', 'ظ': 'z',
    'س': 's', 'ص': 's', 'ش': 'sh', 'غ': 'gh', 'ف': 'f', 'ق': 'g', 'ک': 'k', 'ك': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n' };
  function normName(s) { return (s || '').trim().replace(/[\u064B-\u0652]/g, '').replace(/ي/g, 'ی').replace(/أ|إ/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ی').replace(/ة/g, 'ه'); }
  function nameOP(s) {
    return s.split(/\s+/).map(function (w) {
      var out = '', ch = Array.from(w);
      for (var i = 0; i < ch.length; i++) {
        var c = ch[i], prev = ch[i - 1], next = ch[i + 1], start = i === 0, nextV = next === 'ا' || next === 'آ' || next === 'و' || next === 'ی';
        if (c === 'آ') out += '𐎠';
        else if (c === 'ا' || c === 'ع' || c === 'ء') out += start || c === 'ا' ? '𐎠' : '';
        else if (c === 'ی') out += (start || prev === 'ا' || prev === 'و') ? '𐎹' : (nextV ? '𐎡𐎹' : '𐎡');
        else if (c === 'و') out += (start || prev === 'ا') ? '𐎺' : (nextV ? '𐎢𐎺' : '𐎢');
        else if (CMAP[c]) out += CMAP[c];
      }
      return out;
    }).filter(Boolean).join('𐏐');
  }
  function namePA(s) { var S = SS.pa; return s.split(/\s+/).map(function (w) { return Array.from(w).map(function (c) { return PMAP[c] ? S.SIG[PMAP[c]].g : ''; }).join(''); }).filter(Boolean).join(' '); }
  function nameAV(s) {
    var S = SS.av;
    return s.split(/\s+/).map(function (w) {
      var ch = Array.from(w), out = [], prevC = false;
      for (var i = 0; i < ch.length; i++) {
        var c = ch[i], next = ch[i + 1], start = i === 0, id = null, cons = false;
        if (c === 'آ') id = 'aa';
        else if (c === 'ا') id = start ? 'a' : 'aa';
        else if (c === 'ی') { id = start || next === 'ا' || next === 'و' ? 'y' : 'ii'; cons = id === 'y'; }
        else if (c === 'و') { id = start || next === 'ا' || next === 'ی' ? 'v' : 'uu'; cons = id === 'v'; }
        else if (VMAP[c]) { id = VMAP[c]; cons = true; }
        if (!id) continue;
        if (cons && prevC) out.push('a');
        out.push(id); prevC = cons;
      }
      return out.map(function (x) { return S.SIG[x].g; }).join('');
    }).filter(Boolean).join('\u2E31');
  }
  function nameOut(raw) {
    var s = normName(raw);
    if (!s) return '<small>نامت این‌جا به سه خط نوشته می‌شود</small>';
    var o = nameOP(s), p = namePA(s), a = nameAV(s);
    if (!o && !p && !a) return '<small>فقط حرف‌های فارسی را بنویس</small>';
    return [['op', o, 'میخی · از چپ به راست'], ['pa', p, 'پهلوی · بی‌واکه، مثل فارسی'], ['av', a, 'اوستایی · با واکه؛ «a» میان دو هم‌خوان از ماست']].map(function (x) {
      return '<div class="nrow"><span class="' + SS[x[0]].cls + '">' + (x[1] || '—') + '</span><small>' + x[2] + '</small></div>'; }).join('');
  }
  function nameTab() {
    var b = '<div class="card name-card"><p class="muted">نامت را به فارسی بنویس تا ببینی دبیران کهن چطور آن را می‌نوشتند. <b>تقریبی و برای سرگرمی است</b>؛ برای نام‌های امروزی قاعدهٔ یکتایی نیست.</p>' +
      '<input id="nm" type="text" autocomplete="off" placeholder="مثلاً دانیال" maxlength="20" value="' + esc(P.name || '') + '"><div class="name-out" id="nmo"></div></div>' + illu('images/scribe.webp', 'دبیر ساسانی', 'grow opt');
    render(head('نام تو به سه خط', null, null, null) + '<main class="body">' + b + '</main>' + tabbar('name'));
    var nm = $('#nm'); function upd() { P.name = nm.value; save(); $('#nmo').innerHTML = nameOut(nm.value); fit(); } nm.addEventListener('input', upd); upd();
  }
  var G = { i: 0 };
  function galleryTab() {
    var g = K.gallery[G.i], n = K.gallery.length;
    var b = '<figure class="card gview" data-swipe="g"><div class="gimg"><img src="' + g.img + '" alt="' + esc(g.name) + '"></div><figcaption><b>' + g.name + '</b><span>' + g.era + '</span></figcaption></figure>' +
      '<div class="pager"><button class="btn btn-line" data-act="gprev" aria-label="قبلی">→</button><span class="pg">' + fn(G.i + 1) + ' از ' + fn(n) + '</span><button class="btn btn-coral" data-act="gnext" aria-label="بعدی">←</button></div>';
    render(head('شکوه ایران باستان', null, 'نقاشی‌هایی از شاهان و بناهای باستانی', null) + '<main class="body">' + b + '</main>' + tabbar('gallery'));
    var nx = new Image(); nx.src = K.gallery[(G.i + 1) % n].img;
  }
  var CR = { pg: 0 };
  function credits() {
    var pages = K.credits, c = pages[CR.pg];
    render(page(head('منابع و تصویرها', null, null, 'home'), '<div class="card credits">' + c + '</div>',
      '<div class="pager"><button class="btn btn-line" data-act="crpg" data-n="' + (CR.pg - 1) + '"' + (CR.pg ? '' : ' disabled') + '>→</button><span class="pg">' + fn(CR.pg + 1) + ' از ' + fn(pages.length) + '</span><button class="btn btn-coral" data-act="crpg" data-n="' + (CR.pg + 1) + '"' + (CR.pg < pages.length - 1 ? '' : ' disabled') + '>←</button></div>'));
  }

  /* ---------- routing & events ---------- */
  function route() {
    sheet(null);
    var h = (location.hash || '#home').slice(1).split('/'), r = h[0], sid = h[1], n = +h[2];
    var simple = { home: home, scripts: scriptsTab, name: nameTab, gallery: galleryTab, notebook: notebook, credits: function () { CR.pg = 0; credits(); } };
    if (simple[r]) return simple[r]();
    if (!SS[sid]) return home();
    var S = SS[sid];
    if (r === 's') return scriptPath(sid);
    if (['l', 'learn', 'mashq', 'quiz', 'review'].indexOf(r) >= 0) {
      if (!(n >= 1 && n <= S.lessons.length)) return scriptPath(sid);
      if (!lessonOpen(sid, n)) { toast('اول درس ' + fn(n - 1) + ' را تمام کن'); return go('s/' + sid); }
      CUR.sid = sid; CUR.n = n; P.last = sid;
      if (r === 'l') return lessonView();
      if (r === 'learn') return learn();
      if (r === 'mashq') { if (!S.lessons[n - 1].mashq) return go('quiz/' + sid + '/' + n); mashqInit(); return mashq(); }
      if (r === 'quiz') return quiz();
      return review();
    }
    if (r === 'words') { if (!wordsOpen(sid)) { toast('واژه‌سازی پس از همهٔ درس‌ها باز می‌شود'); return go('s/' + sid); } if (W.sid !== sid) { W.sid = sid; W.i = firstUndone(sid); } B = null; return words(); }
    if (r === 'sent') { if (!sentOpen(sid)) { toast('جمله‌سازی پس از واژه‌سازی باز می‌شود'); return go('s/' + sid); } if (SN.sid !== sid) { SN.sid = sid; SN.i = firstUndoneSent(sid); } B = null; return sentence(); }
    if (r === 'read') { if (!readOpen(sid)) { toast(K.readName[sid] + ' پس از جمله‌سازی باز می‌شود'); return go('s/' + sid); } return readList(sid); }
    if (r === 'text') { if (!readOpen(sid) || !S.TX[h[2]]) return go('s/' + sid); if (I.sid !== sid || I.tid !== h[2]) { I.sid = sid; I.tid = h[2]; I.pg = 0; } I.sel = null; return textView(); }
    home();
  }
  function go(r) { if (location.hash === '#' + r) route(); else location.hash = r; }
  function firstUndone(sid) { var S = SS[sid]; for (var i = 0; i < S.words.length; i++) if (!PS(sid).words[S.words[i].id]) return i; return 0; }
  function firstUndoneSent(sid) { var S = SS[sid]; for (var i = 0; i < S.sentences.length; i++) if (!PS(sid).sents[i]) return i; return 0; }
  window.addEventListener('hashchange', route);
  var sw = null;
  app.addEventListener('touchstart', function (e) { var el = e.target.closest('[data-swipe]'); sw = el && e.touches.length === 1 ? { k: el.getAttribute('data-swipe'), x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
  app.addEventListener('touchend', function (e) {
    if (!sw) return; var t = e.changedTouches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y, k = sw.k; sw = null;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
    var fwd = dx > 0;
    if (k === 'g') { G.i = (G.i + (fwd ? 1 : K.gallery.length - 1)) % K.gallery.length; galleryTab(); }
    else if (k === 'i') { var n = I.pg + (fwd ? 1 : -1), N = SS[I.sid].TX[I.tid].lines.length; if (n >= 0 && n <= N + 1) { I.pg = n; I.sel = null; textView(); } }
  }, { passive: true });
  app.addEventListener('click', function (e) {
    var t = e.target.closest('button, [data-act]'); if (!t || t.disabled) return;
    var r = t.getAttribute('data-go'), act = t.getAttribute('data-act');
    if (t.hasAttribute('data-locked')) { toast('اول درس ' + fn(+t.getAttribute('data-locked')) + ' را تمام کن'); return; }
    if (t.hasAttribute('data-lockmsg')) { toast('🔒 ' + t.getAttribute('data-lockmsg') + ' باز می‌شود'); return; }
    if (r) { var p = r.split('/'); if (p[0] === 'quiz') Q = null; if (p[0] === 'text') I.sid = ''; if (p[0] === 'review') R.key = ''; if (p[0] === 'learn') A.key = ''; go(r); return; }
    if (t.hasAttribute('data-play')) { Audio_.play(t.getAttribute('data-play')); t.classList.remove('playing'); void t.offsetWidth; t.classList.add('playing'); return; }
    if (t.hasAttribute('data-ltab')) { A.tab = t.getAttribute('data-ltab'); learn(); return; }
    if (t.hasAttribute('data-sign')) { A.sel = t.getAttribute('data-sign'); A.tab = 'hint'; Audio_.play(SS[CUR.sid].SIG[A.sel].audio); learn(); return; }
    if (t.hasAttribute('data-rev')) { var rid = t.getAttribute('data-rev'); R.open[rid] = true; Audio_.play(SS[CUR.sid].SIG[rid].audio); review(); return; }
    if (t.hasAttribute('data-ans')) { answer(t); return; }
    if (t.hasAttribute('data-nb')) { NB.sid = t.getAttribute('data-nb'); NB.pg = 0; notebook(); return; }
    if (t.hasAttribute('data-tile')) { var isW = B.kind === 'word'; pickTile(+t.getAttribute('data-tile'), isW ? words : sentence, isW ? W.sid : SN.sid); return; }
    if (t.hasAttribute('data-w')) { var pw = t.getAttribute('data-w'), ln = +pw.split(':')[0], S = SS[I.sid]; I.sel = I.sel === pw ? null : pw; Audio_.play(S.lex[S.TX[I.tid].lines[ln].w[+pw.split(':')[1]]].audio); textView(); return; }
    if (t.hasAttribute('data-line')) { var li = +t.getAttribute('data-line'), C = SS[I.sid].TX[I.tid], rd = PS(I.sid).lines[C.id]; Audio_.play(C.lines[li].audio); if (!rd[li]) { rd[li] = true; save(); textView(); } return; }
    switch (act) {
      case 'about': { var as = t.getAttribute('data-sid'); sheet('<h3>' + SS[as].name + '</h3><p>' + SS[as].about + '</p>' + (K.caveat[as] ? '<p class="muted">' + K.caveat[as] + '</p>' : '')); break; }
      case 'undo-w': M.user.pop(); mashq(); break;
      case 'clear-w': M.user.length = 0; mashq(); break;
      case 'check-w': mashqCheck(); break;
      case 'retry-w': M.res = null; M.user = []; mashq(); break;
      case 'model-w': M.res = null; M.user = []; M.showModel = true; mashq(); break;
      case 'next-w': mashqNext(); break;
      case 'qclear': Q.user.length = 0; quiz(); break;
      case 'qcheck': { var q = Q.qs[Q.i]; Q.res = scoreAny(CUR.sid, q.s.m, Q.user); if (Q.res.stars >= 2) Q.score++; quiz(); break; }
      case 'qnext': Q.i++; Q.user = []; Q.res = null; quiz(); break;
      case 'quiz-again': Q = makeQuiz(CUR.sid, CUR.n); quiz(); break;
      case 'rev-done': partDone(CUR.sid, CUR.n, 'review'); go('l/' + CUR.sid + '/' + CUR.n); break;
      case 'undo': if (B && !B.solved && B.picked.length) { B.picked.pop(); (B.kind === 'word' ? words : sentence)(); } break;
      case 'help': B.help = true; B.viaHelp = true; B.picked = []; (B.kind === 'word' ? words : sentence)(); break;
      case 'wretry': wordsInit(); words(); toast('حالا بدون کمک، از اول'); break;
      case 'wnext': if (W.i < SS[W.sid].words.length - 1) { W.i++; B = null; words(); } else wordsEnd(); break;
      case 'sretry': B = null; sentence(); toast('حالا بدون کمک، از اول'); break;
      case 'snext': if (SN.i < SS[SN.sid].sentences.length - 1) { SN.i++; B = null; sentence(); } else sentEnd(); break;
      case 'gram': grammarSheet(); break;
      case 'gprev': G.i = (G.i + K.gallery.length - 1) % K.gallery.length; galleryTab(); break;
      case 'gnext': G.i = (G.i + 1) % K.gallery.length; galleryTab(); break;
      case 'nbpg': NB.pg = +t.getAttribute('data-n'); notebook(); break;
      case 'crpg': CR.pg = +t.getAttribute('data-n'); credits(); break;
      case 'ipg': I.pg = +t.getAttribute('data-n'); I.sel = null; textView(); break;
      case 'ifinish': { var ps = PS(I.sid); if (ps.done[I.tid]) go('read/' + I.sid); else { ps.done[I.tid] = true; save(); textView(); } break; }
    }
  });
  route();
  var sp = document.getElementById('splash');
  setTimeout(function () { sp.classList.add('out'); sp.setAttribute('aria-hidden', 'true'); setTimeout(function () { sp.remove(); }, 700); }, 3000);
  window.__kisti = { P: function () { return P; }, save: save, go: go, route: route, score: score, penScore: penScore, classify: classify, makeQuiz: makeQuiz, mashqNext: mashqNext,
    M: function () { return M; }, Q: function (q) { if (q !== undefined) Q = q; return Q; }, B: function () { return B; }, W: W, SN: SN, I: I, NB: NB, CR: CR, R: function () { return R; }, A: A,
    views: { mashq: mashq, quiz: quiz, words: words, sentence: sentence, textView: textView, wordsEnd: wordsEnd, sentEnd: sentEnd, notebook: notebook, credits: credits, learn: learn, review: review }, nameOut: nameOut };
})();
