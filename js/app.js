/* CVS-Pharmacy-MNU — © 2026 Khaled Osama Yaseen. All rights reserved.
 * Faculty of Pharmacy, Mansoura National University. Proprietary — not licensed
 * for reuse, copying, modification, or redistribution. See LICENSE. */
/* =====================================================================
   app.js — shell: DOM helper, state/progress, router, shared widgets
   ===================================================================== */
(function () {
  window.h = function (tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k]; if (v === null || v === undefined || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    const add = (c) => { if (c == null || c === false) return; if (Array.isArray(c)) c.forEach(add); else el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); };
    for (let i = 2; i < arguments.length; i++) add(arguments[i]);
    return el;
  };

  const App = { state: { visited: {}, answers: {} }, S: {}, sub: null };
  window.App = App;
  try { const s = JSON.parse(localStorage.getItem('ep-sim-v2') || 'null'); if (s) App.state = Object.assign(App.state, s); } catch (e) { }
  App.save = function () { try { localStorage.setItem('ep-sim-v2', JSON.stringify(App.state)); } catch (e) { } App.progress(); };

  /* ---------------- shared widgets ---------------- */
  const U = {}; window.U = U;
  const TIER = { L: 'Lecture', S: 'Supplementary', M: 'Simplified simulation', Q: 'Published range', U: 'Context-dependent', F: '⚑ Lecture note' };
  U.tag = function (s, extra) {
    const t = K.tiers[s];
    return h('span', { class: 'tag tag-' + s, title: t ? t[0] + ' — ' + t[1] : '' }, (TIER[s] || s) + (extra ? ' ' + extra : ''));
  };
  U.card = (title, ...kids) => h('section', { class: 'card' }, title ? h('h3', {}, title) : null, ...kids);
  U.sub = (t) => h('h4', { class: 'sub' }, t);
  U.p = (...k) => h('p', {}, ...k);
  U.muted = (t) => h('p', { class: 'muted small' }, t);
  U.slider = function (label, min, max, step, val, fn, fmt) {
    const out = h('span', { class: 'sv' }, fmt ? fmt(val) : String(val));
    const inp = h('input', { type: 'range', min, max, step, value: val, 'aria-label': label });
    inp.addEventListener('input', () => { const v = parseFloat(inp.value); out.textContent = fmt ? fmt(v) : String(v); fn(v); });
    const row = h('label', { class: 'sl' }, h('span', { class: 'sll' }, label), inp, out);
    row.set = (v) => { inp.value = v; out.textContent = fmt ? fmt(v) : String(v); };
    row.input = inp; return row;
  };
  U.seg = function (items, cur, fn, cls) {
    const box = h('div', { class: 'seg ' + (cls || '') });
    const render = () => { box.innerHTML = ''; items.forEach((it) => box.appendChild(h('button', { class: it[0] === cur ? 'on' : '', onclick: () => { cur = it[0]; render(); fn(it[0]); } }, it[1]))); };
    render(); box.setCur = (id) => { cur = id; render(); }; return box;
  };
  U.toggle = function (label, val, fn) { const i = h('input', { type: 'checkbox' }); i.checked = !!val; i.addEventListener('change', () => fn(i.checked)); const l = h('label', { class: 'tg' }, i, h('span', {}, label)); l.input = i; return l; };
  U.btn = (lab, fn, cls) => h('button', { class: 'btn ' + (cls || ''), onclick: fn }, lab);
  U.kp = (list) => h('div', { class: 'kp' }, h('h4', {}, 'Key learning points'), h('ul', {}, list.map((x) => h('li', {}, x))));
  U.checks = function (sec) {
    const list = K.practice.filter((q) => q.sec === sec);
    if (!list.length) return null;
    const box = h('div', { class: 'checks' }, h('h4', {}, 'Knowledge check ', U.tag('S')));
    new K.QuizRunner(box, list, { showCase: false }); return box;
  };
  U.note = (tier, text) => h('div', { class: 'note note-' + tier }, U.tag(tier), h('span', {}, text));
  U.link = (sec, sub, label) => h('button', { class: 'xlink', onclick: () => App.go(sec, sub) }, label, h('span', { class: 'xarrow' }, '→'));
  U.xrow = (label, items) => h('div', { class: 'xrow' }, h('span', { class: 'xlab' }, label), items.map((i) => U.link(i[0], i[1], i[2])));
  U.table = function (head, rows, cls) {
    return h('div', { class: 'tw' }, h('table', { class: cls || '' },
      h('thead', {}, h('tr', {}, head.map((x) => h('th', {}, x)))),
      h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c) => h('td', {}, c)))))));
  };
  U.dl = (pairs) => h('dl', { class: 'dl' }, pairs.map((p) => [h('dt', {}, p[0]), h('dd', {}, p[1])]));
  U.chain = function (active) {
    const steps = [['ap', null, 'Ion channel'], ['ap', null, 'Action potential'], ['anatomy', null, 'Conduction'], ['ecg', null, 'ECG'], ['mechanisms', null, 'Arrhythmia'], ['drugap', null, 'Drug effect'], ['management', null, 'Management']];
    return h('div', { class: 'chain' }, steps.map((s, i) => h('span', { class: 'chain-i' },
      h('button', { class: 'chain-b' + (i === active ? ' on' : ''), onclick: () => App.go(s[0], s[1]) }, s[2]),
      i < steps.length - 1 ? h('span', { class: 'chain-s' }, '›') : null)));
  };

  /* ---------------- progress ---------------- */
  App.progress = function () {
    const total = K.sections.length;
    const done = K.sections.filter((s) => App.state.visited[s.id]).length;
    const sc = K.score(K.questions);
    const bar = document.getElementById('prog-bar'); if (bar) bar.style.width = Math.round((done / total) * 100) + '%';
    const txt = document.getElementById('prog-txt');
    if (txt) txt.textContent = done + '/' + total + ' modules · ' + sc.c + '/' + K.questions.length + ' lecture Qs correct';
    document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('seen', !!App.state.visited[a.dataset.id]));
  };

  /* ---------------- router ---------------- */
  App.go = function (sec, sub) {
    App.sub = sub || null;
    if (location.hash === '#' + sec) App.render(); else location.hash = sec;
    if (window.innerWidth < 900) document.body.classList.remove('nav-open');
  };
  App.render = function () {
    const id = (location.hash || '#overview').slice(1).split('?')[0];
    const sec = K.sections.find((s) => s.id === id) || K.sections[0];
    App.cur = sec.id;
    App.state.visited[sec.id] = true; App.save();
    document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.id === sec.id));
    const main = document.getElementById('main');
    main.innerHTML = ''; main.scrollTop = 0;
    main.appendChild(h('div', { class: 'sec-head' },
      h('div', { class: 'sec-n' }, 'Module ' + sec.n + ' of ' + K.sections.length),
      h('h2', {}, sec.t)));
    try { App.S[sec.id](main, App.sub); }
    catch (e) { console.error(e); main.appendChild(h('div', { class: 'err' }, 'This module failed to render: ' + e.message)); }
    const i = K.sections.indexOf(sec);
    main.appendChild(h('div', { class: 'pager' },
      i > 0 ? U.btn('← ' + K.sections[i - 1].t, () => App.go(K.sections[i - 1].id)) : h('span', {}),
      i < K.sections.length - 1 ? U.btn(K.sections[i + 1].t + ' →', () => App.go(K.sections[i + 1].id), 'btn-p') : h('span', {})));
    App.sub = null;
  };

  /* ---------------- boot ---------------- */
  App.boot = function () {
    const nav = document.getElementById('nav');
    K.sections.forEach((s) => {
      const a = h('a', { href: '#' + s.id, 'data-id': s.id }, h('span', { class: 'nn' }, String(s.n)), h('span', {}, s.t));
      a.addEventListener('click', () => { if (window.innerWidth < 900) document.body.classList.remove('nav-open'); });
      nav.appendChild(a);
    });
    document.getElementById('menu').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    document.getElementById('scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
    const th = document.getElementById('theme');
    const setT = (t) => { document.documentElement.setAttribute('data-theme', t); App.state.theme = t; th.textContent = t === 'light' ? '◐' : '◑'; try { App.save(); } catch (e) { } };
    th.addEventListener('click', () => setT(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));
    if (App.state.themeV !== 2) { App.state.theme = 'light'; App.state.themeV = 2; }
    setT(App.state.theme || 'light');
    // quick search
    const q = document.getElementById('q'), res = document.getElementById('qres');
    const INDEX = [];
    K.sections.forEach((s) => INDEX.push({ t: s.t, s: s.id, sub: null, k: 'Module ' + s.n }));
    K.drugOrder.forEach((d) => INDEX.push({ t: K.drugs[d].name, s: 'drugap', sub: d, k: K.drugs[d].label }));
    Object.keys(K.rhythms).forEach((r) => INDEX.push({ t: K.rhythms[r].name, s: 'ecg', sub: r, k: 'Rhythm' }));
    Object.keys(K.ecgParts).forEach((p) => INDEX.push({ t: K.ecgParts[p].name, s: 'ecg', sub: 'part:' + p, k: 'ECG component' }));
    Object.keys(K.phases).forEach((p) => INDEX.push({ t: K.phases[p].name, s: 'ap', sub: p, k: 'AP phase' }));
    K.questions.forEach((x) => INDEX.push({ t: x.id + ' — ' + x.stem.slice(0, 60), s: 'cases', sub: x.id, k: x.topic }));
    Object.keys(K.trees).forEach((t) => INDEX.push({ t: K.trees[t].t + ' — management', s: 'management', sub: t, k: 'Decision tree' }));
    function run() {
      const v = q.value.trim().toLowerCase(); res.innerHTML = '';
      if (!v) { res.classList.remove('on'); return; }
      const hits = INDEX.filter((x) => (x.t + ' ' + x.k).toLowerCase().includes(v)).slice(0, 10);
      res.classList.toggle('on', hits.length > 0);
      hits.forEach((x) => res.appendChild(h('button', { onclick: () => { q.value = ''; res.classList.remove('on'); App.go(x.s, x.sub); } }, h('b', {}, x.t), h('i', {}, x.k))));
    }
    q.addEventListener('input', run);
    q.addEventListener('keydown', (e) => { if (e.key === 'Escape') { q.value = ''; run(); q.blur(); } });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search')) res.classList.remove('on'); });
    window.addEventListener('hashchange', App.render);
    App.render(); App.progress();
  };
})();