/* CVS-Pharmacy-MNU — © 2026 Khaled Osama Yaseen. All rights reserved.
 * Faculty of Pharmacy, Mansoura National University. Proprietary — not licensed
 * for reuse, copying, modification, or redistribution. See LICENSE. */
/* =====================================================================
   render.js — Canvas renderers: ECG strip (+ladder diagram), AP plot
   ===================================================================== */
(function () {
  const RD = {};
  window.RD = RD;
  const C = {
    grid1: 'rgba(56,189,248,0.07)', grid2: 'rgba(56,189,248,0.17)', trace: '#5eead4', traceOld: 'rgba(94,234,212,0.28)',
    text: '#9fb3c8', red: '#f87171', amber: '#fbbf24', cyan: '#22d3ee', violet: '#a78bfa', white: '#e6f1ff'
  };
  RD.C = C;

  RD.fit = function (canvas, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const par = canvas.parentElement;
    // Measure the parent with the canvas removed from the flow, so a previously
    // over-wide canvas can never keep the container stretched (observed on resize).
    const prev = canvas.style.width; canvas.style.width = '0px';
    const rect = par.getBoundingClientRect();
    const avail = Math.floor(Math.min(rect.width || par.clientWidth || 0, document.documentElement.clientWidth));
    canvas.style.width = prev;
    const w = Math.max(240, avail || 240);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  };

  /* -------------------------- ECG STRIP --------------------------- */
  RD.ECGStrip = function (host, o) {
    o = o || {};
    const self = this;
    this.dur = o.dur || 6000;
    this.gen = o.gen;               // (seed) => rhythm
    this.seed = 1;
    this.ladder = o.ladder !== false;
    this.hl = [];                   // highlights {a,b,color,label,row}
    this.marks = [];                // P-wave markers etc {t,label,color}
    this.speed = 1; this.playing = o.autoplay !== false; this.head = 0; this.prev = null;
    this.ecgH = o.ecgH || 150; this.ladH = this.ladder ? 84 : 0;
    this.label = o.label || '';
    const wrap = document.createElement('div'); wrap.className = 'strip';
    this.canvas = document.createElement('canvas'); wrap.appendChild(this.canvas); host.appendChild(wrap);
    this.note = document.createElement('div'); this.note.className = 'sim-note';
    this.note.textContent = 'Simulated waveform (educational model, lead II-like, 25 mm/s, 10 mm/mV) — not a patient recording.';
    host.appendChild(this.note);
    this.onClick = o.onClick || null;
    this.canvas.addEventListener('click', (e) => {
      if (!self.onClick) return;
      const r = self.canvas.getBoundingClientRect();
      self.onClick(((e.clientX - r.left) / r.width) * self.dur, e);
    });
    this.load = function () { this.rh = this.gen(this.seed); this.ys = EP.sample(this.rh, this.dur, 2); };
    this.setGen = function (g, keepHead) { this.gen = g; this.load(); this.prev = null; if (!keepHead) this.head = 0; this.draw(); };
    this.load();
    this.resize = function () { const r = RD.fit(this.canvas, this.ecgH + this.ladH); this.ctx = r.ctx; this.W = r.w; this.draw(); };
    RD.observe(this);
    this.x = (t) => (t / this.dur) * this.W;
    this.draw = function () {
      if (!this.ctx) return;
      const ctx = this.ctx, W = this.W, H = this.ecgH, dur = this.dur;
      ctx.clearRect(0, 0, W, H + this.ladH);
      ctx.fillStyle = '#04101c'; ctx.fillRect(0, 0, W, H + this.ladH);
      const pxms = W / dur, mm = 40 * pxms, pxmv = 10 * mm;
      // grid
      for (let i = 0, x = 0; x <= W; i++, x = i * mm) { ctx.strokeStyle = i % 5 ? C.grid1 : C.grid2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let i = 0, y = 0; y <= H; i++, y = i * mm) { ctx.strokeStyle = i % 5 ? C.grid1 : C.grid2; ctx.beginPath(); ctx.moveTo(0, H - y); ctx.lineTo(W, H - y); ctx.stroke(); }
      const base = H * 0.62;
      // highlights
      this.hl.forEach((h) => {
        ctx.fillStyle = h.color || 'rgba(251,191,36,0.18)';
        ctx.fillRect(this.x(h.a), 0, Math.max(2, this.x(h.b) - this.x(h.a)), H);
        if (h.label) { ctx.fillStyle = h.text || C.amber; ctx.font = '600 11px Inter, sans-serif'; ctx.fillText(h.label, this.x(h.a) + 3, 13 + (h.row || 0) * 13); }
      });
      // trace
      const ys = this.ys, n = ys.length, dt = 2;
      const headI = this.playing || this.head > 0 ? Math.floor(this.head / dt) : n;
      const drawSeg = (arr, i0, i1, col, lw) => {
        if (!arr || i1 <= i0) return;
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.beginPath();
        for (let i = i0; i < i1 && i < arr.length; i++) { const X = i * dt * pxms, Y = base - arr[i] * pxmv; i === i0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); }
        ctx.stroke();
      };
      const full = !this.playing && this.head === 0;
      if (full) drawSeg(ys, 0, n, C.trace, 1.8);
      else {
        drawSeg(this.prev || ys, Math.min(n, headI + 25), n, C.traceOld, 1.4);
        drawSeg(ys, 0, Math.min(headI, n), C.trace, 1.9);
        const hx = headI * dt * pxms; ctx.fillStyle = 'rgba(94,234,212,0.9)';
        if (headI < n) { ctx.beginPath(); ctx.arc(hx, base - ys[Math.min(headI, n - 1)] * pxmv, 3, 0, 7); ctx.fill(); }
      }
      // markers
      this.marks.forEach((m) => {
        const X = this.x(m.t); ctx.fillStyle = m.color || C.amber; ctx.font = '700 10px Inter, sans-serif';
        ctx.fillText(m.label, X - 4, m.y != null ? m.y : H - 6);
      });
      if (this.label) { ctx.fillStyle = 'rgba(230,241,255,0.75)'; ctx.font = '600 12px Inter, sans-serif'; ctx.fillText(this.label, 8, 16); }
      if (this.ladder) this.drawLadder(H);
    };
    this.drawLadder = function (y0) {
      const ctx = this.ctx, W = this.W, h = this.ladH, rowH = h / 3;
      ctx.fillStyle = '#071827'; ctx.fillRect(0, y0, W, h);
      ctx.strokeStyle = 'rgba(148,163,184,0.25)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(0, y0 + i * rowH); ctx.lineTo(W, y0 + i * rowH); ctx.stroke(); }
      ctx.fillStyle = 'rgba(7,24,39,.92)'; ctx.fillRect(0, y0, 24, h);
      ctx.fillStyle = C.text; ctx.font = '600 10px Inter, sans-serif';
      ctx.fillText('A', 6, y0 + rowH / 2 + 4); ctx.fillText('AV', 3, y0 + rowH * 1.5 + 4); ctx.fillText('V', 6, y0 + rowH * 2.5 + 4);
      const yA0 = y0, yA1 = y0 + rowH, yV0 = y0 + 2 * rowH, yV1 = y0 + 3 * rowH;
      const line = (x1, y1, x2, y2, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
      const rh = this.rh;
      if (rh.ladderAF) {
        const r = EP.rng(5); for (let t = 0; t < this.dur; t += 40 + r() * 70) line(this.x(t), yA0 + 3, this.x(t + 15), yA1 - 3, 'rgba(34,211,238,0.5)', 1);
      }
      rh.beats.forEach((b) => {
        const xp = b.p != null ? this.x(b.p + 10) : null;
        if (xp != null) line(xp, yA0 + 2, xp + 4, yA1, b.dissoc ? 'rgba(34,211,238,0.6)' : C.cyan);
        if (b.kind === 'tdp') { if (b.q != null) line(this.x(b.q), yV1, this.x(b.q + 25), yV0, C.red, 1.5); return; }
        if (b.q != null && b.p != null && b.conducted) {
          line(xp + 4, yA1, this.x(b.q), yV0, C.cyan);
          line(this.x(b.q), yV0, this.x(b.q + 10), yV1, C.cyan);
          if (b.pr) { const lx = (xp + this.x(b.q)) / 2 - 6; if (lx > 26) { ctx.fillStyle = C.amber; ctx.font = '600 9px Inter, sans-serif'; ctx.fillText(Math.round(b.pr), lx, yA1 + rowH / 2 + 3); } }
        } else if (b.p != null && b.q == null && !b.dissoc) {
          // blocked P wave
          const xb = xp + 4 + (b.blocked ? 10 : 22);
          line(xp + 4, yA1, xb, yA1 + rowH * (b.blocked ? 0.45 : 0.6), C.red);
          line(xb - 5, yA1 + rowH * (b.blocked ? 0.45 : 0.6), xb + 5, yA1 + rowH * (b.blocked ? 0.45 : 0.6), C.red, 2.5);
        } else if (b.q != null && b.p == null) {
          const xq = this.x(b.q);
          if (b.kind === 'v' || b.escape || b.ectopic) {
            ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(xq, yV1 - 6, 3.5, 0, 7); ctx.fill();
            line(xq, yV1 - 6, xq - 8, yV0, C.red); line(xq, yV1 - 6, xq + 8, yV0, C.red);
            if (b.escape) { ctx.fillStyle = C.red; ctx.font = '600 9px Inter, sans-serif'; ctx.fillText('escape', xq + 8, yV1 - 3); }
          } else if (b.retro) {
            // re-entry within the AV junction: down slow pathway, back up fast pathway
            line(xq - this.x(60), yA1 + 2, xq, yV0, C.violet); line(xq, yV0, xq + this.x(60), yA1 + 2, C.violet, 1.5);
            line(xq, yV0, xq + 4, yV1, C.cyan);
          } else {
            line(xq - this.x(70), yA1, xq, yV0, C.cyan, 1.2); line(xq, yV0, xq + this.x(10), yV1, b.kind === 'pre' ? C.amber : C.cyan);
          }
        }
      });
    };
    this.tick = function (dtReal) {
      if (!this.playing) return;
      this.head += dtReal * this.speed;
      if (this.head >= this.dur) {
        this.head = 0; this.prev = this.ys;
        if (this.regen) { this.seed++; this.load(); }
      }
      this.draw();
    };
    RD.register(this);
    this.resize();
  };
  RD.ECGStrip.prototype.pause = function () { this.playing = false; this.head = 0; this.draw(); };
  RD.ECGStrip.prototype.play = function () { this.playing = true; };

  /* Re-fit whenever the container's own width changes (layout, viewport, nav). */
  RD.observe = function (obj) {
    if (!window.ResizeObserver || obj._ro) return;
    let last = -1;
    obj._ro = new ResizeObserver(() => {
      if (!obj.canvas || !obj.canvas.parentElement) return;
      const w = Math.round(obj.canvas.parentElement.getBoundingClientRect().width);
      if (w > 0 && Math.abs(w - last) > 1) { last = w; obj.resize(); }
    });
    try { obj._ro.observe(obj.canvas.parentElement.parentElement || obj.canvas.parentElement); } catch (e) { }
  };

  /* ---------------- animation registry (one RAF loop) --------------- */
  const live = new Set();
  RD.register = (o) => live.add(o);
  RD.unregisterAll = () => live.clear();
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(now - last, 60); last = now;
    live.forEach((o) => { if (o.canvas && !document.body.contains(o.canvas)) { live.delete(o); return; } o.tick && o.tick(dt); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.addEventListener('resize', () => live.forEach((o) => o.resize && o.resize()));

  /* -------------------------- AP PLOT ---------------------------- */
  RD.APPlot = function (host, o) {
    o = o || {};
    const self = this;
    this.h = o.h || 260; this.series = []; this.phases = null; this.active = null; this.yr = o.yr || [-100, 50]; this.xr = o.xr || [0, 500];
    this.title = o.title || ''; this.onPhase = o.onPhase || null; this.inset = o.inset || false; this.extra = null;
    const wrap = document.createElement('div'); wrap.className = 'plot';
    this.canvas = document.createElement('canvas'); wrap.appendChild(this.canvas); host.appendChild(wrap);
    this.pad = { l: 44, r: 10, t: 22, b: 26 };
    this.X = (t) => this.pad.l + ((t - this.xr[0]) / (this.xr[1] - this.xr[0])) * (this.W - this.pad.l - this.pad.r);
    this.Y = (v) => this.pad.t + (1 - (v - this.yr[0]) / (this.yr[1] - this.yr[0])) * (this.h - this.pad.t - this.pad.b);
    this.canvas.addEventListener('click', (e) => {
      if (!self.phases || !self.onPhase) return;
      const r = self.canvas.getBoundingClientRect(); const x = e.clientX - r.left;
      const t = self.xr[0] + ((x - self.pad.l) / (self.W - self.pad.l - self.pad.r)) * (self.xr[1] - self.xr[0]);
      const ph = self.phases.find((p) => t >= p.a && t <= p.b);
      if (ph) self.onPhase(ph.id);
    });
    this.canvas.style.cursor = o.onPhase ? 'pointer' : 'default';
    this.resize = function () { const r = RD.fit(this.canvas, this.h); this.ctx = r.ctx; this.W = r.w; this.draw(); };
    RD.observe(this);
    this.draw = function () {
      if (!this.ctx) return;
      const ctx = this.ctx, W = this.W, h = this.h;
      ctx.clearRect(0, 0, W, h); ctx.fillStyle = '#04101c'; ctx.fillRect(0, 0, W, h);
      // phase bands
      if (this.phases) this.phases.forEach((p, i) => {
        const a = this.X(Math.max(p.a, this.xr[0])), b = this.X(Math.min(p.b, this.xr[1])); if (b <= a) return;
        const on = this.active && p.id === this.active;
        ctx.fillStyle = on ? 'rgba(34,211,238,0.20)' : i % 2 ? 'rgba(148,163,184,0.04)' : 'rgba(148,163,184,0.08)';
        ctx.fillRect(a, this.pad.t, b - a, h - this.pad.t - this.pad.b);
        ctx.fillStyle = on ? C.cyan : 'rgba(159,179,200,0.8)'; ctx.font = '700 11px Inter, sans-serif';
        const lab = (RD.PH_LABEL[p.id] || p.id);
        if (b - a > 14) ctx.fillText(lab, (a + b) / 2 - 4, this.pad.t + 13);
      });
      // axes
      ctx.strokeStyle = 'rgba(148,163,184,0.25)'; ctx.lineWidth = 1; ctx.fillStyle = C.text; ctx.font = '10px Inter, sans-serif';
      for (let v = Math.ceil(this.yr[0] / 20) * 20; v <= this.yr[1]; v += 20) { const y = this.Y(v); ctx.beginPath(); ctx.moveTo(this.pad.l, y); ctx.lineTo(W - this.pad.r, y); ctx.stroke(); ctx.fillText(v + '', 8, y + 3); }
      const step = (this.xr[1] - this.xr[0]) > 1200 ? 500 : (this.xr[1] - this.xr[0]) > 300 ? 100 : 5;
      for (let t = Math.ceil(this.xr[0] / step) * step; t <= this.xr[1]; t += step) { const x = this.X(t); ctx.fillText(t + '', x - 8, h - 8); }
      ctx.fillText('mV', 8, 14); ctx.fillText('ms', W - 24, h - 8);
      if (this.title) { ctx.fillStyle = C.white; ctx.font = '600 12px Inter, sans-serif'; ctx.fillText(this.title, this.pad.l + 4, 14); }
      // series
      this.series.forEach((s) => {
        ctx.strokeStyle = s.color; ctx.lineWidth = s.w || 2; ctx.setLineDash(s.dash || []); ctx.beginPath();
        let started = false;
        for (let i = 0; i < s.t.length; i++) {
          if (s.t[i] < this.xr[0] || s.t[i] > this.xr[1]) continue;
          const x = this.X(s.t[i]), y = this.Y(s.v[i]);
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.setLineDash([]);
      });
      // legend
      let lx = W - this.pad.r - 8; ctx.font = '600 11px Inter, sans-serif';
      this.series.slice().reverse().forEach((s) => {
        if (!s.label) return; const tw = ctx.measureText(s.label).width; lx -= tw + 22;
        ctx.fillStyle = s.color; ctx.fillRect(lx, 8, 12, 3); ctx.fillStyle = C.white; ctx.fillText(s.label, lx + 16, 13);
      });
      if (this.extra) this.extra(ctx, this);
    };
    RD.register(this);
    this.resize();
  };
  RD.PH_LABEL = { p0: '0', p1: '1', p2: '2', p3: '3', p4: '4', n0: '0', n3: '3', n4: '4' };
})();