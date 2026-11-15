/* =====================================================================
   models.js — SIMULATION CORE
   Simplified, phase-structured electrophysiology models (educational).
   Every waveform feature is DERIVED from channel conductance multipliers
   so that AP, ECG and clinical read-outs stay mutually consistent:
     g_Na  → phase-0 dV/dt, overshoot → conduction velocity → QRS width
     g_NaL → late Na⁺ current sustaining plateau → APD (lidocaine target)
     g_CaL → plateau height/APD (fast tissue); upstroke + AV conduction (node)
     g_K   → phase-3 repolarisation → APD, ERP → QT
     β (sympathetic), vagal tone, g_K(ACh/Ado) → nodal phase 4, MDP
   These are NOT biophysical Hodgkin–Huxley/Luo–Rudy models; magnitudes
   are calibrated to textbook ranges, not to individual patients.
   ===================================================================== */
(function () {
  const EP = {};
  window.EP = EP;

  EP.BASE = {
    gNa: 1, gNaL: 1, gCa: 1, gK: 1, prr: 0,          // fast-response tissue
    nCa: 1, nK: 1, p4: 1, beta: 1, vagal: 1,          // nodal tissue
    apNa: 1, apK: 1                                   // accessory pathway (Na/K dependent tissue)
  };
  EP.clone = (o) => JSON.parse(JSON.stringify(o));

  /* Combine drug effect objects multiplicatively (prr additive) */
  EP.combine = function (effects) {
    const p = EP.clone(EP.BASE);
    effects.forEach((e) => {
      for (const k in e) {
        if (k === 'prr') p.prr += e[k];
        else if (k in p) p[k] *= e[k];
      }
    });
    return p;
  };

  const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ------------------------------------------------------------------
     FAST-RESPONSE ACTION POTENTIAL (ventricular myocyte / Purkinje)
     ------------------------------------------------------------------ */
  EP.APD0 = 270; // ms, reference APD90 at 1 Hz
  /* [K⁺]o HANDLING — audit correction (see docs/VALIDATION.md §1, §2)
     • Resting potential is set by I_K1 and E_K, not hard-coded. E_K from Nernst at 37 °C
       (61.5·log10([K]o/[K]i), [K]i = 140 mM); a Na⁺ leak holds Vrest ≈ 10 mV positive to E_K,
       giving −85 mV at [K]o = 4 mM. Ref: Shaw & Rudy, Circ Res 1997;81:727 (DOI 10.1161/01.RES.81.5.727).
     • Na⁺-channel availability follows steady-state inactivation h∞(Vrest): a depolarised rest
       (hyperkalaemia) inactivates Na⁺ channels → slower phase 0 → slower conduction.
     • I_Kr conductance scales ≈ √[K]o AND low [K]o potentiates drug block of I_Kr
       (Yang & Roden, Circulation 1996;93:407, DOI 10.1161/01.CIR.93.3.407). Hypokalaemia is
       therefore modelled through I_Kr — NOT as the earlier generic "gK × 0.75".
     LIMITATION: reduced I_K1 in severe hypokalaemia (<2.5 mM), which can paradoxically
     depolarise and trigger automaticity, is not represented. */
  EP.EK = (Ko) => 61.5 * Math.log10(Ko / 140);
  EP.vrest = (Ko) => -85 + 0.8 * (EP.EK(Ko) - EP.EK(4));
  const hInf = (v) => 1 / (1 + Math.exp((v + 72) / 6));
  EP.naAvail = (Ko) => hInf(EP.vrest(Ko)) / hInf(EP.vrest(4));
  // gK passed in is a DRUG multiplier (1 = no block). Returns effective I_Kr conductance.
  EP.effGK = function (gK, Ko) {
    const block = 1 - gK;                                  // fraction of I_Kr blocked at [K]o = 4
    const potentiated = Math.min(0.92, block * Math.sqrt(4 / Ko));  // low K⁺ deepens the block
    return Math.max(0.08, 1 - potentiated) * Math.sqrt(Ko / 4);     // × conductance ∝ √[K]o
  };

  EP.fastAP = function (p, opts) {
    opts = opts || {};
    const Ko = opts.Ko != null ? opts.Ko : (opts.hypoK ? 2.8 : 4);
    const Vrest = EP.vrest(Ko), ts = 20;
    const gNa = clamp(p.gNa * EP.naAvail(Ko), 0.05, 3), gCa = clamp(p.gCa, 0.05, 3);
    const gK = clamp(EP.effGK(p.gK, Ko), 0.1, 3);
    const gNaL = clamp(p.gNaL, 0, 3);
    const Vpeak = Vrest + 110 * Math.pow(gNa, 0.25);
    const t0 = 0.5 / Math.pow(gNa, 0.6);                       // upstroke duration (ms)
    const dvdt = (1.5 * (Vpeak - Vrest)) / t0;                  // V/s (mV/ms)
    const Vplat = clamp(8 + 10 * Math.log(gCa) - 5 * Math.log(gK), -30, 25);
    const Vnotch = Math.min(Vplat - 6, Vpeak);
    const apdTarget = (opts.purkinje ? 1.12 : 1) * EP.APD0 * Math.pow(gCa, 0.25) * Math.pow(gK, -0.55) * (1 + 0.25 * (gNaL - 1)) * (opts.apdScale || 1);
    const tau3 = 14 / Math.sqrt(gK);
    const tDome0 = ts + t0, tNotch = tDome0 + 6, tDome = tDome0 + 26;
    const Vp = (t) => Vplat - 0.04 * (t - tDome);
    const V90 = Vrest + 0.1 * (Vpeak - Vrest);
    function core(t, tR) {
      if (t < ts) return Vrest;
      if (t < ts + t0) return Vrest + (Vpeak - Vrest) * smooth((t - ts) / t0);
      if (t < tNotch) return Vpeak + (Vnotch - Vpeak) * smooth((t - tDome0) / (tNotch - tDome0));
      if (t < tDome) return Vnotch + (Vplat - Vnotch) * smooth((t - tNotch) / (tDome - tNotch));
      const S = 1 / (1 + Math.exp((t - tR) / tau3));
      return Vrest + (Vp(t) - Vrest) * S;
    }
    // solve for tR so that APD90 == apdTarget
    let lo = tDome, hi = ts + apdTarget + 200;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (core(ts + apdTarget, m) > V90) hi = m; else lo = m; }
    const tR = (lo + hi) / 2;
    // EAD (early after-depolarisation) — simplified rule: needs marked APD prolongation and
    // available L-type Ca²⁺ current for reactivation; Mg²⁺ suppresses it.
    const eadIndex = (apdTarget / EP.APD0) * Math.sqrt(gCa) * (opts.brady ? 1.08 : 1);
    const ead = !opts.mg && eadIndex > 1.4;
    const tE = tR - tau3 * 0.4;
    /* DAD (delayed after-depolarisation) — digoxin. Na⁺/K⁺-ATPase inhibition → intracellular Na⁺ ↑
       → Na⁺/Ca²⁺ exchanger extrudes less Ca²⁺ → Ca²⁺ overload → spontaneous SR Ca²⁺ release →
       transient inward current AFTER repolarisation is complete (unlike an EAD, which interrupts it).
       K⁺ competes with digoxin at the ATPase, so hypokalaemia raises the risk: index scales with
       (4/[K]o)^1.5. opts.dig is a relative drug level (1 = therapeutic), NOT a serum concentration.
       Thresholds are illustrative, chosen so that a therapeutic level alone produces no DAD. */
    const dadIndex = (opts.dig || 0) * Math.pow(4 / Ko, 1.5);
    const dad = dadIndex > 1.5, dadTrig = dadIndex > 2.4;
    const tD = ts + apdTarget + 150;
    const V = (t) => {
      let v = core(t, tR);
      if (ead) v += 26 * Math.exp(-Math.pow((t - tE) / 16, 2)) + 18 * Math.exp(-Math.pow((t - tE - 45) / 14, 2));
      if (dad) {
        const amp = Math.min(30, 9 * (dadIndex - 1));
        v += amp * Math.exp(-Math.pow((t - tD) / 32, 2));
        if (dadTrig) v += (Vpeak - Vrest) * 0.92 * Math.exp(-Math.pow((t - tD - 70) / 22, 2)); // triggered beat
      }
      return v;
    };
    const T = opts.T || (dad ? 700 : 520), dt = opts.dt || 0.5;
    const t = [], v = [];
    for (let x = 0; x <= T; x += dt) { t.push(x); v.push(V(x)); }
    // measured metrics
    let apd90 = null, erp = null;
    for (let i = 0; i < t.length; i++) {
      if (t[i] > tDome) {
        if (erp === null && v[i] < -60) erp = t[i] - ts;
        if (v[i] < V90 && t[i] > tE + 70) { apd90 = t[i] - ts; break; }
        if (!ead && apd90 === null && v[i] < V90) { apd90 = t[i] - ts; break; }
      }
    }
    if (apd90 === null) apd90 = apdTarget;
    if (ead) apd90 = Math.max(apd90, apdTarget);  // EAD genuinely delays repolarisation further
    if (erp === null) erp = apd90 * 0.85;
    erp += p.prr || 0;
    const cvRel = Math.sqrt(dvdt / EP.FAST0.dvdt);
    const phases = [
      { id: 'p0', a: ts, b: ts + t0 },
      { id: 'p1', a: ts + t0, b: tDome },
      { id: 'p2', a: tDome, b: tR - 1.2 * tau3 },
      { id: 'p3', a: tR - 1.2 * tau3, b: ts + apd90 + 25 },
      { id: 'p4', a: ts + apd90 + 25, b: T }
    ];
    return { t, v, V, ts, dvdt, Vpeak, Vrest, Vplat, apd90, erp, cvRel, ead, eadIndex, eadT: tE - ts,
      dad, dadTrig, dadIndex, dadT: tD - ts, Ko, gKeff: gK, naAvail: EP.naAvail(Ko), phases, contract: gCa };
  };
  EP.FAST0 = { dvdt: (1.5 * 110) / 0.5 };

  /* ------------------------------------------------------------------
     SLOW-RESPONSE (NODAL) ACTION POTENTIAL (SA node; AV node behaves alike)
     ------------------------------------------------------------------ */
  EP.nodeAP = function (p, opts) {
    opts = opts || {};
    const nCa = clamp(p.nCa, 0.02, 3), nK = clamp(p.nK, 0.2, 4), vag = clamp(p.vagal, 0.2, 4), beta = clamp(p.beta, 0, 3);
    const MDP = -62 - 6 * Math.log(nK) - 5 * Math.log(vag);
    const Vth = -40 - 4 * Math.log(nCa);
    const slope = 0.0328 * p.p4 * (0.45 + 0.55 * beta) / Math.pow(vag, 0.4) / Math.pow(nK, 0.3) * Math.pow(nCa, 0.3); // mV/ms
    const T4 = (Vth - MDP) / Math.max(slope, 0.004);
    const t0 = 25 / Math.pow(nCa, 0.6);
    const Vpk = -40 + 52 * Math.pow(nCa, 0.4);
    const fails = Vpk < -15;                                   // insufficient Ca²⁺ current → no propagated AP
    const tau = 22 / Math.pow(nK, 0.6), tR3 = 70 / Math.pow(nK, 0.4);
    const T3 = tR3 + 4 * tau;
    const CL = t0 + T3 + T4;
    const ncyc = opts.cycles || 2;
    const T = opts.T || Math.max(1800, CL * ncyc + 100);
    const dt = opts.dt || 1;
    function Vcycle(tc) {      // tc measured from start of phase 0
      if (tc < t0) return Vth + (Vpk - Vth) * smooth(tc / t0);
      const tt = tc - t0;
      if (tt < T3) return MDP + (Vpk - MDP) / (1 + Math.exp((tt - tR3) / tau)) * (1 - smooth((tt - T3 + 30) / 30) * 0) ;
      const u = (tt - T3) / T4;
      return MDP + (Vth - MDP) * Math.pow(clamp(u, 0, 1), 1.6);
    }
    const start = 60; // first upstroke at 60 ms (start in late phase 4)
    const V = (x) => {
      if (fails) { // oscillates sub-threshold: local response only
        const tc = ((x - start) % CL + CL) % CL;
        const u = clamp(tc / CL, 0, 1);
        return MDP + (Vth - MDP) * Math.pow(u, 1.6) + (tc < t0 ? (Vpk - Vth) * Math.sin(Math.PI * tc / t0) * 0.6 : 0);
      }
      if (x < start) { const u = (x + (T4 - start)) / T4; return MDP + (Vth - MDP) * Math.pow(clamp(u, 0, 1), 1.6); }
      const tc = (x - start) % CL;
      return Vcycle(tc);
    };
    const t = [], v = [];
    for (let x = 0; x <= T; x += dt) { t.push(x); v.push(V(x)); }
    const hr = fails ? 0 : 60000 / CL;
    // AV-node read-outs (same cell type): conduction time & refractoriness
    const betaF = 0.6 + 0.4 * beta;
    const avTime = fails ? Infinity : 90 / (Math.pow(nCa, 0.6) * betaF) * Math.pow(vag, 0.5) * Math.pow(nK, 0.25);
    const avERP = 300 * Math.pow(nCa, -0.5) / betaF * Math.pow(vag, 0.5) * Math.pow(nK, 0.2);
    const phases = [
      { id: 'n4', a: 0, b: start },
      { id: 'n0', a: start, b: start + t0 },
      { id: 'n3', a: start + t0, b: start + t0 + T3 },
      { id: 'n4', a: start + t0 + T3, b: start + CL }
    ];
    return { t, v, V, MDP, Vth, Vpk, slope, CL, hr, T4, t0, fails, avTime, avERP, phases, start };
  };

  /* ------------------------------------------------------------------
     DERIVED ECG INTERVALS from the two cell models
     ------------------------------------------------------------------ */
  EP.REF = null;
  EP.intervals = function (p, opts) {
    opts = opts || {};
    // ECG reflects working ventricular MYOCARDIUM; late-Na⁺ (lidocaine) effect is largely a
    // Purkinje-fibre phenomenon, so it is damped here.
    const pm = Object.assign({}, p, { gNaL: 1 - 0.3 * (1 - p.gNaL) });
    const f = EP.fastAP(pm, opts), n = EP.nodeAP(p);
    if (!EP.REF) EP.REF = { f: EP.fastAP(EP.BASE), n: EP.nodeAP(EP.BASE) };
    const R = EP.REF;
    const hr = opts.hr || n.hr;
    const atrial = 40, his = 30;
    const pr = n.fails ? Infinity : atrial + n.avTime + his / Math.max(f.cvRel, 0.3);
    const qrs = 90 * (1 + 0.6 * (1 / f.cvRel - 1));
    // QT at 60 bpm proportional to ventricular APD (+ extra depolarisation time if QRS widens)
    const qt60 = 400 * (f.apd90 / R.f.apd90) + (qrs - 90);
    const rr = 60000 / hr;
    const qt = qt60 * Math.sqrt(rr / 1000);
    const qtc = qt / Math.sqrt(rr / 1000);
    return { hr, pr, qrs, qt, qtc, rr, fast: f, node: n, avERP: n.avERP, ead: f.ead };
  };

  /* ACCESSORY PATHWAY — fast-response (Na⁺-dependent) tissue, so AV-nodal blockers do not slow it,
     while class I/III drugs prolong its refractoriness.
     AUDIT CORRECTION: the earlier exponents produced ~250 → 417 ms (+67%) with procainamide,
     which overstates the real effect. Published baseline anterograde AP-ERP ≈ 237 ± 24 ms
     (Brugada et al., Am J Cardiol 1983) to 282 ± 7 ms (Benditt et al., JACC 1992;
     DOI 10.1016/0735-1097(92)90061-Q). IV procainamide prolongs it by tens of ms and the
     increment DEPENDS ON THE BASELINE LENGTH: pathways with a long ERP block completely, while
     short-ERP (dangerous) pathways change little — the basis of the procainamide/ajmaline test
     (Wellens et al., Am J Cardiol 1982: block in 20/39; 19/20 of those had AP-ERP ≥ 270 ms).
     Modelled as a baseline-dependent increment, capped; block is declared above ~400 ms.
     Baseline AP-ERP is a PATIENT property, not a model output — exposed as an input. */
  EP.AP_ERP0 = 260;
  EP.apERP = function (p, base) {
    const b = base || EP.AP_ERP0;
    const naBlock = 1 - Math.max(p.gNa, 0.05), kBlock = 1 - Math.max(p.gK, 0.05);
    const sens = Math.max(0.15, (b - 180) / 160);     // long-ERP pathways respond much more
    const inc = (95 * naBlock + 45 * kBlock + 0.4 * (p.prr || 0)) * sens;
    const erp = b + inc;
    // Complete anterograde block is declared once refractoriness exceeds ~360 ms: the pathway can no
    // longer conduct at physiological atrial rates (Wellens 1982: block in pathways with long baseline ERP).
    return { erp, inc, base: b, block: erp > 360 };
  };

  /* ------------------------------------------------------------------
     ECG SYNTHESIS — beats described as events, then summed Gaussians
     beat: {p: P-onset ms|null, q: QRS-onset|null, w: QRS ms, qt, kind,
            conducted, pr, retro, delta, flags}
     ------------------------------------------------------------------ */
  const G = (t, c, s, a) => a * Math.exp(-0.5 * ((t - c) / s) * ((t - c) / s));
  const G2 = (t, c, s1, s2, a) => a * Math.exp(-0.5 * Math.pow((t - c) / (t < c ? s1 : s2), 2));

  EP.beatValue = function (b, t) {
    let y = 0;
    if (b.p != null && Math.abs(t - b.p - 50) < 200) {
      y += G(t, b.p + 50, 20, b.pAmp != null ? b.pAmp : 0.15);
    }
    if (b.q == null) return y;
    const q = b.q, w = b.w || 90;
    if (t < q - 200 || t > q + (b.qt || 400) + 200) return y;
    const kind = b.kind || 'n';
    const amp = b.amp == null ? 1 : b.amp;
    if (kind === 'n' || kind === 'pre') {
      let ww = w;
      if (kind === 'pre') { // delta wave: slurred initial upstroke
        y += 0.32 * smooth((t - q) / 45) * (t < q + 75 ? 1 : Math.max(0, 1 - (t - q - 75) / 20));
      }
      y += G(t, q + 0.15 * ww, 0.06 * ww, -0.10 * amp);
      y += G(t, q + 0.45 * ww, 0.10 * ww, 1.25 * amp);
      y += G(t, q + 0.72 * ww, 0.08 * ww, -0.28 * amp);
      const tC = q + b.qt - 75;
      y += G2(t, tC, 48, 32, (b.tAmp != null ? b.tAmp : 0.32));
      if (b.dig) y += G(t, q + ww + 70, 45, -0.10);
      if (b.retro) y += G(t, q + ww + 40, 14, -0.10);
    } else if (kind === 'v') { // wide ventricular (ectopic / escape / VT)
      y += G(t, q + 0.35 * w, 0.17 * w, 1.15 * amp);
      y += G(t, q + 0.78 * w, 0.14 * w, -0.55 * amp);
      y += G2(t, q + b.qt - 85, 55, 40, -0.38 * amp);
    } else if (kind === 'tdp') {
      // polymorphic: sinusoidal complex with time-varying amplitude/polarity
      const per = b.rr || 240;
      if (t >= q && t < q + per) y += amp * Math.sin((2 * Math.PI * (t - q)) / per) * 1.0;
    }
    return y;
  };

  // deterministic RNG
  EP.rng = function (seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

  /* Rhythm generators. Each returns {beats, bg(t), dur, info} for a strip of dur ms */
  EP.rhythms = {};
  const R = EP.rhythms;
  function regular(dur, rr, pr, w, qt, extra) {
    const beats = [];
    for (let q = 300; q < dur + 400; q += rr) beats.push(Object.assign({ p: q - pr, q, w, qt, pr, conducted: true }, extra || {}));
    return beats;
  }
  R.nsr = (o) => { o = o || {}; const hr = o.hr || 75, rr = 60000 / hr; const it = { pr: o.pr || 160, w: o.qrs || 90, qt: o.qt || 400 * Math.sqrt(rr / 1000) };
    return { beats: regular(o.dur || 6000, rr, it.pr, it.w, it.qt, o.extra), bg: null }; };
  R.brady = (o) => { o = o || {}; return R.nsr(Object.assign({ hr: 45 }, o)); };
  R.avb1 = (o) => { o = o || {}; return R.nsr(Object.assign({ hr: 70, pr: 300 }, o)); };
  R.mobitz1 = (o) => {
    o = o || {}; const pp = 760, prs = [160, 250, 300, null]; const beats = []; let i = 0;
    for (let p = 140; p < (o.dur || 6000) + 400; p += pp, i++) {
      const pr = prs[i % prs.length];
      beats.push(pr == null ? { p, q: null, conducted: false, pr: null } : { p, q: p + pr, w: 90, qt: 380, pr, conducted: true, seq: i % 4 });
    }
    return { beats };
  };
  R.mobitz2 = (o) => {
    o = o || {}; const pp = 760; const pat = [1, 1, 1, 0]; const beats = []; let i = 0;
    for (let p = 140; p < (o.dur || 6000) + 400; p += pp, i++) {
      const c = pat[i % pat.length];
      beats.push(c ? { p, q: p + 180, w: 110, qt: 390, pr: 180, conducted: true } : { p, q: null, conducted: false, pr: null });
    }
    return { beats };
  };
  R.avb3 = (o) => {
    o = o || {}; const beats = []; const dur = (o.dur || 6000) + 600;
    for (let p = 90; p < dur; p += 720) beats.push({ p, q: null, conducted: false, pr: null, blocked: true });
    for (let q = 520; q < dur; q += 1650) beats.push({ p: null, q, w: 140, qt: 470, kind: 'v', escape: true, amp: 0.9 });
    return { beats };
  };
  R.af = (o) => {
    o = o || {}; const rnd = EP.rng(o.seed || 7); const beats = []; const dur = (o.dur || 6000) + 600;
    const erp = o.avERP || 300; const apERP = o.apERP || null;
    let t = 250;
    while (t < dur) {
      // AV node: next conducted impulse after its refractory period + random f-wave arrival
      let rrAV = erp + (-Math.log(1 - rnd()) * 0.35 * erp) + rnd() * 30;
      let kind = 'n', w = o.qrs || 90;
      if (apERP) {
        const rrAP = apERP + (-Math.log(1 - rnd()) * 0.15 * apERP);
        if (rrAP < rrAV) { rrAV = rrAP; kind = 'pre'; w = 140; }
      }
      beats.push({ p: null, q: t, w: kind === 'pre' ? 130 : w, qt: Math.min(360, 0.5 * rrAV + 150), kind, conducted: true, amp: kind === 'pre' ? 1.1 : 1 });
      t += rrAV;
    }
    const ph = [rnd() * 6, rnd() * 6, rnd() * 6];
    const bg = (t) => 0.05 * Math.sin(2 * Math.PI * t / 160 + ph[0]) + 0.035 * Math.sin(2 * Math.PI * t / 113 + ph[1]) + 0.025 * Math.sin(2 * Math.PI * t / 197 + ph[2]);
    return { beats, bg };
  };
  R.psvt = (o) => { o = o || {}; const rr = 60000 / (o.hr || 190); const beats = []; for (let q = 200; q < (o.dur || 6000) + 400; q += rr) beats.push({ p: null, q, w: 85, qt: 250, conducted: true, retro: true, tAmp: 0.22 }); return { beats }; };
  R.vt = (o) => {
    o = o || {}; const rr = 60000 / (o.hr || 180); const beats = [];
    for (let q = 150; q < (o.dur || 6000) + 400; q += rr) beats.push({ p: null, q, w: 160, qt: 300, kind: 'v' });
    if (o.dissoc !== false) for (let p = 400; p < (o.dur || 6000) + 400; p += 800) beats.push({ p, q: null, pAmp: 0.09, conducted: false, dissoc: true });
    return { beats };
  };
  R.vf = (o) => {
    o = o || {}; const rnd = EP.rng(o.seed || 3); const comps = [];
    for (let i = 0; i < 7; i++) comps.push({ f: 4 + rnd() * 4, ph: rnd() * 6.28, a: 0.15 + rnd() * 0.25, m: 0.2 + rnd() * 0.8, mp: rnd() * 6.28 });
    const bg = (t) => { const s = t / 1000; let y = 0; comps.forEach((c) => (y += c.a * Math.sin(2 * Math.PI * c.f * s + c.ph) * (0.6 + 0.4 * Math.sin(2 * Math.PI * c.m * s + c.mp)))); return y * 1.1; };
    return { beats: [], bg };
  };
  R.tdp = (o) => {
    o = o || {}; const beats = []; const dur = (o.dur || 6000) + 400;
    // two sinus beats with markedly prolonged QT, then R-on-T initiation of polymorphic VT
    beats.push({ p: 100, q: 260, w: 95, qt: 600, pr: 160, conducted: true, tAmp: 0.38 });
    beats.push({ p: 1300, q: 1460, w: 95, qt: 600, pr: 160, conducted: true, tAmp: 0.38 });
    const start = 1460 + 540, per = 230;
    for (let q = start; q < dur; q += per) {
      const env = Math.cos((2 * Math.PI * (q - start)) / 2100);      // twisting envelope (polarity reversal)
      beats.push({ p: null, q, kind: 'tdp', rr: per, amp: 1.3 * env + (env >= 0 ? 0.12 : -0.12) });
    }
    return { beats, tdpStart: start };
  };
  R.pre = (o) => { o = o || {}; const rr = 60000 / 75; return { beats: regular(o.dur || 6000, rr, 100, 130, 410, { kind: 'pre' }) }; };
  R.ectopic = (o) => { // sinus with interpolated ectopic ventricular beats (abnormal automaticity)
    o = o || {}; const sinusRR = o.sinusRR || 900, ecRR = o.ectopicRR || 99999; const beats = []; const dur = (o.dur || 6000) + 400;
    let ts = 300, te = o.ecStart || 600; let lastV = -9999;
    while (ts < dur || te < dur) {
      if (ts <= te) { if (ts - lastV >= 280) { beats.push({ p: ts - 160, q: ts, w: 90, qt: 380, pr: 160, conducted: true }); lastV = ts; } else beats.push({ p: ts - 160, q: null, conducted: false, hidden: true }); ts += sinusRR; }
      else { if (te - lastV >= 280) { beats.push({ p: null, q: te, w: 150, qt: 400, kind: 'v', ectopic: true }); lastV = te; te += ecRR; } else te += ecRR; }
    }
    return { beats };
  };

  EP.sample = function (rh, dur, dt) {
    dt = dt || 2; const ys = [];
    const bs = rh.beats;
    for (let t = 0; t <= dur; t += dt) {
      let y = rh.bg ? rh.bg(t) : 0;
      for (let i = 0; i < bs.length; i++) {
        const b = bs[i];
        const ref = b.q != null ? b.q : b.p;
        if (ref == null || Math.abs(t - ref) > 900) continue;
        y += EP.beatValue(b, t);
      }
      ys.push(y);
    }
    return ys;
  };
})();
