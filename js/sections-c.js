/* CVS-Pharmacy-MNU — © 2026 Khaled Osama Yaseen. All rights reserved.
 * Faculty of Pharmacy, Mansoura National University. Proprietary — not licensed
 * for reuse, copying, modification, or redistribution. See LICENSE. */
/* =====================================================================
   sections-c.js — modules 9–13: miscellaneous agents, management trees,
   bradyarrhythmias, clinical cases, final assessment
   ===================================================================== */
(function () {
  const S = App.S;

  /* ---------------- 9. MISCELLANEOUS AGENTS ---------------- */
  S.misc = function (m, sub) {
    const MISC = ['adenosine', 'digoxin', 'atropine', 'magnesium'];
    let cur = MISC.includes(sub) ? sub : 'adenosine';
    m.appendChild(U.card('The four miscellaneous agents',
      U.table(['', 'Adenosine', 'Digoxin', 'Atropine', 'Magnesium sulfate'], [
        ['Mechanism', 'A1 receptor agonist → opens K⁺ channels and inhibits Ca²⁺ channels', 'Inhibits Na⁺/K⁺-ATPase and ↑ vagal tone', 'Muscarinic receptor antagonist', 'Modulates cardiac ion channels and stabilizes electrical activity'],
        ['Main effect', 'Transient AV nodal block', 'Slows AV conduction', 'Increases SA node activity and HR', 'Suppresses abnormal ventricular electrical activity'],
        ['Therapeutic uses', 'Acute termination of PSVT', 'AF rate control, particularly in patients with HF', 'Acute symptomatic sinus bradycardia', 'Torsades de pointes'],
        ['Adverse effects', 'Flushing, chest discomfort, dyspnea, bronchospasm', 'Neurological symptoms and arrhythmias', 'Tachycardia, dry mouth, urinary retention', 'Hypotension and respiratory depression with excessive doses'],
        ['Important precautions', 'Avoid in asthma. Avoid in pre-excited AF associated with WPW. Half-life 8–10 seconds; rapid IV push', 'Severe toxicity → digoxin immune Fab', 'Use cautiously in ischemic heart disease and tachyarrhythmias', 'Monitor magnesium levels and renal function']
      ], 'lect'), U.tag('L')));

    const card = U.card('Interactive agent simulator');
    const seg = U.seg(MISC.map((d) => [d, K.drugs[d].name]), cur, (d) => { cur = d; draw(); });
    const body = h('div', {});
    card.appendChild(seg); card.appendChild(body); m.appendChild(card);

    function draw() {
      body.innerHTML = '';
      const dr = K.drugs[cur];
      body.appendChild(h('h4', {}, dr.name, ' ', h('span', { class: 'gchip' }, dr.label)));
      body.appendChild(U.dl([['Molecular target', dr.target], ['Mechanism (lecture)', [dr.mech.L, ' ', U.tag('L')]], ['Mechanism (supplementary)', [dr.mech.S, ' ', U.tag('S')]], ['Expected ECG effect', dr.ecg]]));

      if (cur === 'adenosine') {
        const hst = h('div', {}); body.appendChild(h('p', {}, 'Adenosine given during PSVT: transient AV-nodal block interrupts the re-entry circuit, and sinus rhythm resumes.'));
        body.appendChild(hst);
        new RD.ECGStrip(hst, { dur: 9000, ecgH: 160, label: 'PSVT → adenosine IV push → sinus rhythm', gen: () => {
          const beats = [];
          for (let q = 200; q < 3000; q += 316) beats.push({ p: null, q, w: 85, qt: 250, conducted: true, retro: true, tAmp: 0.22 });
          // push at ~3.0 s: a few seconds of AV block (flat line / P waves only), then sinus
          for (let p = 3100; p < 5200; p += 850) beats.push({ p, q: null, conducted: false, pAmp: 0.14 });
          for (let q = 5400; q < 9200; q += 820) beats.push({ p: q - 160, q, w: 90, qt: 390, pr: 160, conducted: true });
          return { beats };
        } });
        body.appendChild(U.note('U', dr.acute));
        body.appendChild(U.note('S', 'The pause is the drug working: an AV node that cannot conduct cannot sustain an AV-nodal re-entry circuit. Because the half-life is under 10 seconds, the effect passes before it can be useful for rate control — which is why adenosine terminates PSVT but has no role in AF.'));
        const nodeHost = h('div', {}); body.appendChild(nodeHost);
        const AP = new RD.APPlot(nodeHost, { h: 240, title: 'Nodal action potential: adenosine hyperpolarises and slows phase 4', yr: [-85, 25], xr: [0, 2400] });
        const n0 = EP.nodeAP(EP.BASE, { T: 2400 }), n1 = EP.nodeAP(EP.combine([dr.fx]), { T: 2400 });
        AP.series = [{ t: n0.t, v: n0.v, color: 'rgba(148,163,184,0.55)', dash: [5, 4], w: 1.6, label: 'No drug' }, { t: n1.t, v: n1.v, color: '#5eead4', w: 2.3, label: 'Adenosine (peak)' }];
        AP.draw();
      }

      if (cur === 'digoxin') {
        body.appendChild(h('p', {}, 'Two separate actions, two separate consequences. The ', h('b', {}, 'vagal'), ' effect slows the AV node — that is the therapeutic one in AF. The ', h('b', {}, 'Na⁺/K⁺-ATPase'), ' inhibition raises intracellular Ca²⁺ — positive inotropy at therapeutic levels, and delayed after-depolarisations when it goes too far.'));
        const afH = h('div', {}); body.appendChild(afH);
        const iv = EP.intervals(EP.combine([dr.fx]));
        new RD.ECGStrip(afH, { dur: 6000, ecgH: 150, label: 'AF after digoxin — slower ventricular response, still irregular', gen: (s) => EP.rhythms.af({ seed: s, dur: 6000, avERP: iv.avERP, extra: null }) }).regen = true;
        let lvl = 1, Ko = 4;
        const dH = h('div', {}), dM = h('div', { class: 'metrics' });
        body.appendChild(h('h4', {}, 'Digoxin toxicity — delayed after-depolarisations'));
        body.appendChild(U.slider('Digoxin level', 0, 3.2, 0.1, 1, (v) => { lvl = v; dd(); }, (v) => v === 0 ? 'none' : '×' + v.toFixed(1) + ' therapeutic'));
        body.appendChild(U.slider('Extracellular K⁺', 2.2, 5.5, 0.1, 4, (v) => { Ko = v; dd(); }, (v) => v.toFixed(1) + ' mM'));
        body.appendChild(dH); body.appendChild(dM);
        const DP = new RD.APPlot(dH, { h: 260, title: 'Ventricular action potential', yr: [-100, 50], xr: [0, 700] });
        function dd() {
          const a0 = EP.fastAP(EP.BASE, { T: 700 }), a1 = EP.fastAP(EP.BASE, { dig: lvl, Ko, T: 700 });
          DP.series = [{ t: a0.t, v: a0.v, color: 'rgba(148,163,184,0.5)', dash: [5, 4], w: 1.5, label: 'Normal' }, { t: a1.t, v: a1.v, color: '#f87171', w: 2.3, label: 'Digoxin ×' + lvl.toFixed(1) + ', K⁺ ' + Ko.toFixed(1) }];
          DP.draw();
          dM.innerHTML = '';
          const st = a1.dadTrig ? ['Triggered beat', 'The DAD reaches threshold and fires an extra beat — this is how digoxin toxicity produces arrhythmias.'] : a1.dad ? ['DAD present', 'A hump appears AFTER repolarisation is complete. It has not yet reached threshold.'] : ['No after-depolarisation', 'Therapeutic levels with normal K⁺ produce no DAD in this model.'];
          dM.appendChild(h('div', { class: 'warn' }, h('b', {}, st[0]), h('span', {}, st[1])));
          if (Ko < 3.4) dM.appendChild(h('div', { class: 'warn' }, h('b', {}, 'Hypokalaemia'), h('span', {}, 'K⁺ competes with digoxin for the Na⁺/K⁺-ATPase, so low K⁺ means more drug bound and a lower threshold for toxicity (Q23).')));
        }
        dd();
        body.appendChild(U.note('M', 'Thresholds here are illustrative, chosen so a therapeutic level alone produces no DAD. They are not serum concentrations and do not define a toxic level.'));
        body.appendChild(U.note('S', 'Severe toxicity → digoxin immune Fab (Q24). Note the distinction from an EAD: a DAD comes after full repolarisation (Ca²⁺ overload), an EAD interrupts repolarisation (prolonged APD).'));
      }

      if (cur === 'atropine') {
        body.appendChild(h('p', {}, 'Atropine removes vagal tone. That steepens nodal phase 4 and speeds AV-nodal conduction — so it works where vagal nerves act: the SA and AV nodes.'));
        const two = h('div', { class: 'two' }); body.appendChild(two);
        const l = h('div', {}), r = h('div', {}); two.appendChild(l); two.appendChild(r);
        new RD.ECGStrip(l, { gen: () => EP.rhythms.brady({ dur: 5000 }), dur: 5000, ecgH: 130, ladder: false, label: 'Symptomatic sinus bradycardia 45/min' });
        const iv = EP.intervals(EP.combine([K.drugs.atropine.fx]));
        new RD.ECGStrip(r, { gen: () => EP.rhythms.nsr({ hr: iv.hr, pr: iv.pr, dur: 5000 }), dur: 5000, ecgH: 130, ladder: false, label: 'After atropine — ' + iv.hr.toFixed(0) + '/min' });
        const nh = h('div', {}); body.appendChild(nh);
        const AP = new RD.APPlot(nh, { h: 240, title: 'Nodal phase 4 steepens → threshold reached sooner', yr: [-80, 25], xr: [0, 2400] });
        const n0 = EP.nodeAP(EP.BASE, { T: 2400 }), n1 = EP.nodeAP(EP.combine([K.drugs.atropine.fx]), { T: 2400 });
        AP.series = [{ t: n0.t, v: n0.v, color: 'rgba(148,163,184,0.55)', dash: [5, 4], w: 1.6, label: 'Baseline ' + n0.hr.toFixed(0) + '/min' }, { t: n1.t, v: n1.v, color: '#fbbf24', w: 2.3, label: 'Atropine ' + n1.hr.toFixed(0) + '/min' }];
        AP.draw();
        body.appendChild(U.note('S', 'Because the effect is purely vagolytic, atropine is often ineffective in infranodal block (Mobitz II, complete block with a wide escape) — the His–Purkinje system has little vagal innervation. 2025 AHA ACLS dose: 1 mg IV every 3–5 min, maximum 3 mg.'));
        body.appendChild(U.link('brady', null, 'AV blocks and where atropine fails'));
      }

      if (cur === 'magnesium') {
        body.appendChild(h('p', {}, 'Magnesium does not shorten the QT. It suppresses the ', h('b', {}, 'trigger'), ' — the early after-depolarisation that starts torsades — by limiting L-type Ca²⁺ reactivation during a prolonged plateau. That is why it works even when serum magnesium is normal.'));
        const two = h('div', { class: 'two' }); body.appendChild(two);
        const l = h('div', {}), r = h('div', {}); two.appendChild(l); two.appendChild(r);
        const P = EP.combine([K.drugs.sotalol.fx]);
        const AP1 = new RD.APPlot(l, { h: 250, title: 'Long QT + hypokalaemia → EAD', yr: [-100, 60], xr: [0, 700] });
        const AP2 = new RD.APPlot(r, { h: 250, title: 'After magnesium → EAD suppressed', yr: [-100, 60], xr: [0, 700] });
        const e1 = EP.fastAP(P, { Ko: 2.8, T: 700 }), e2 = EP.fastAP(P, { Ko: 2.8, mg: true, T: 700 });
        const n0 = EP.fastAP(EP.BASE, { T: 700 });
        AP1.series = [{ t: n0.t, v: n0.v, color: 'rgba(148,163,184,0.45)', dash: [5, 4], w: 1.4, label: 'Normal' }, { t: e1.t, v: e1.v, color: '#f87171', w: 2.3, label: 'EAD' }];
        AP2.series = [{ t: n0.t, v: n0.v, color: 'rgba(148,163,184,0.45)', dash: [5, 4], w: 1.4, label: 'Normal' }, { t: e2.t, v: e2.v, color: '#5eead4', w: 2.3, label: 'Mg²⁺' }];
        AP1.draw(); AP2.draw();
        const th = h('div', {}); body.appendChild(th);
        new RD.ECGStrip(th, { gen: () => EP.rhythms.tdp({ dur: 6000 }), dur: 6000, ecgH: 150, label: 'Torsades de pointes — the arrhythmia those EADs trigger' });
        body.appendChild(U.note('S', 'Full management (lecture): IV magnesium sulfate, discontinue QT-prolonging drugs, correct electrolyte abnormalities (Mg²⁺ – K⁺). Monitor magnesium levels and renal function — magnesium is renally excreted.'));
        body.appendChild(U.link('management', 'tdp', 'Torsades management pathway →'));
      }

      body.appendChild(h('div', { class: 'two' },
        h('div', {}, U.sub('Therapeutic uses'), h('ul', {}, dr.uses.map((x) => h('li', {}, x)))),
        h('div', {}, U.sub('Adverse effects & precautions'), h('ul', {}, dr.adverse.concat(dr.prec).map((x) => h('li', {}, x))))));
      body.appendChild(U.note('S', dr.clinical));
    }
    draw();
    const c = U.checks('misc'); if (c) m.appendChild(c);
    m.appendChild(U.kp(['Adenosine: seconds of AV-nodal block — terminates PSVT, useless for rate control, dangerous in pre-excited AF.', 'Digoxin: vagal AV slowing (therapeutic) plus Na⁺/K⁺-ATPase inhibition (inotropy, and DADs in toxicity); hypokalaemia increases toxicity.', 'Atropine: vagolytic, so it works at the SA and AV nodes — not below them.', 'Magnesium: suppresses the EAD trigger in torsades without shortening the QT.']));
  };

  /* ---------------- 10. MANAGEMENT ---------------- */
  S.management = function (m, sub) {
    let cur = K.trees[sub] ? sub : 'af';
    m.appendChild(U.card('How to use this',
      h('p', {}, 'Each pathway starts from the ECG finding and the patient’s stability. Click a branch to follow it; every endpoint explains ', h('b', {}, 'why'), ' the treatment works at the level of the mechanism.'),
      U.note('S', 'Acute management (what you do in the next minutes) is separated from long-term management (anticoagulation, pacemakers, chronic drug choice). These pathways teach the lecture’s content; they are not a substitute for current emergency protocols at the bedside.')));

    const card = U.card('Decision pathways');
    const seg = U.seg(Object.keys(K.trees).map((k) => [k, K.trees[k].t]), cur, (k) => { cur = k; run(); });
    const body = h('div', { class: 'tree' });
    card.appendChild(seg); card.appendChild(body); m.appendChild(card);

    function run() {
      body.innerHTML = '';
      const T = K.trees[cur];
      const ecgId = { af: 'af', psvt: 'psvt', vt: 'vt', vf: 'vf', tdp: 'tdp', brady: 'brady', avb: 'mobitz2' }[cur];
      if (ecgId) { const eh = h('div', {}); body.appendChild(eh); const st = new RD.ECGStrip(eh, { gen: (s) => EP.rhythms[ecgId]({ seed: s, dur: 5000, avERP: 300 }), dur: 5000, ecgH: 130, ladder: false, label: T.t }); if (ecgId === 'af' || ecgId === 'vf') st.regen = true; }
      const path = h('div', { class: 'path' }); body.appendChild(path);
      step(T.root, path, T);
    }
    function step(id, host, T) {
      const n = T.n[id]; if (!n) return;
      const box = h('div', { class: 'tnode' });
      if (n.q) {
        box.appendChild(h('p', { class: 'tq' }, n.q));
        const opts = h('div', { class: 'row' });
        n.o.forEach((o) => opts.appendChild(h('button', {
          class: 'tbtn', onclick: (e) => {
            box.querySelectorAll('.tbtn').forEach((b) => b.classList.remove('on'));
            e.currentTarget.classList.add('on');
            let nx = box.nextSibling; while (nx) { const t = nx.nextSibling; nx.remove(); nx = t; }
            step(o[1], host, T);
          }
        }, o[0])));
        box.appendChild(opts);
      } else {
        box.appendChild(h('div', { class: 'tleaf' },
          h('h4', {}, 'Do this'),
          h('ul', { class: 'tact' }, n.a.map((x) => h('li', {}, x))),
          U.sub('Why'), h('p', {}, n.why),
          U.sub('Mechanism'), h('p', {}, n.mech),
          h('div', { class: 'row' }, U.tag(n.src === 'L' ? 'L' : n.src === 'S' ? 'S' : 'L'), n.src === 'L + S' ? U.tag('S') : null)));
        if (n.next) {
          const opts = h('div', { class: 'row' });
          n.next.forEach((o) => opts.appendChild(h('button', {
            class: 'tbtn', onclick: (e) => {
              e.currentTarget.classList.add('on');
              let nx = box.nextSibling; while (nx) { const t = nx.nextSibling; nx.remove(); nx = t; }
              step(o[1], host, T);
            }
          }, o[0])));
          box.appendChild(opts);
        }
      }
      host.appendChild(box);
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    run();

    m.appendChild(U.card('Stable or unstable — the question that comes before every pathway',
      h('p', {}, 'Instability means the arrhythmia itself is causing hypotension, shock, altered mental status, ischaemic chest pain or acute heart failure. The lecture’s own non-pharmacological card makes the rule: ', h('b', {}, 'synchronized DC cardioversion terminates unstable tachyarrhythmias'), '; unsynchronized defibrillation is for VF or pulseless VT.'), U.tag('L'),
      U.note('S', 'Synchronisation times the shock to the R wave. Delivering an unsynchronized shock onto a T wave can induce VF — which is why synchronisation matters whenever there is an organised QRS to synchronise to, and why it is impossible in VF or polymorphic VT.')));

    const c = U.checks('management'); if (c) m.appendChild(c);
    m.appendChild(U.kp(['Unstable tachyarrhythmia → electricity, not drugs.', 'AF has three separate goals: rate, rhythm, and stroke prevention — the first two do not replace the third.', 'PSVT: vagal → adenosine → cardioversion.', 'Stable VT: amiodarone or procainamide; never IV verapamil.', 'Torsades: magnesium, stop the offending drug, correct K⁺ and Mg²⁺.']));
  };

  /* ---------------- 11. BRADYARRHYTHMIAS ---------------- */
  S.brady = function (m, sub) {
    m.appendChild(U.card('Bradyarrhythmia and conduction disorders',
      U.table(['Arrhythmia', 'Clinical & ECG clues', 'Initial management'], [
        ['Sinus node dysfunction (ex: sick sinus syndrome)', 'HR <60 beats/min with a normal P wave before every QRS', 'Identify and treat the cause; review rate-slowing medications such as beta-blockers, verapamil, diltiazem, and digoxin. Atropine may help if symptomatic.'],
        ['1st-degree AV block', 'PR interval >200 ms. Delayed AV conduction.', 'Usually no treatment. Discontinue causative drugs.'],
        ['Second-degree AV block, Mobitz I (Wenckebach)', 'Progressive PR prolongation followed by intermittent non-conducted P waves (dropped QRS complexes).', 'Discontinue causative drugs. Acute symptomatic cases: IV atropine.'],
        ['Second-degree AV block, Mobitz II (more risk)', 'Constant PR intervals in conducted beats, with intermittent non-conducted P waves (dropped QRS complexes).', 'Long-term: permanent pacemaker is indicated if not due to a reversible cause (Mobitz II – 3rd degree).'],
        ['3rd-degree AV block (complete heart block)', 'Complete AV dissociation: with severe bradycardia', 'As above — permanent pacemaker if not reversible.']
      ], 'lect'), U.tag('L'),
      U.note('F', K.flags[1].text)));

    const ids = ['brady', 'avb1', 'mobitz1', 'mobitz2', 'avb3'];
    let cur = ids.includes(sub) ? sub : 'brady';
    const card = U.card('Compare them on the trace and the ladder');
    const seg = U.seg(ids.map((i) => [i, K.rhythms[i].name]), cur, (i) => { cur = i; draw(); });
    const body = h('div', {});
    card.appendChild(seg); card.appendChild(body); m.appendChild(card);
    function draw() {
      body.innerHTML = '';
      const d = K.rhythms[cur];
      const eh = h('div', {}); body.appendChild(eh);
      new RD.ECGStrip(eh, { gen: () => EP.rhythms[cur]({ dur: 7000 }), dur: 7000, ecgH: 160, label: d.name });
      body.appendChild(h('div', { class: 'rgrid' },
        h('div', {}, U.sub('ECG clues'), h('p', {}, d.clue)),
        h('div', {}, U.sub('Mechanism'), h('p', {}, d.mech)),
        h('div', {}, U.sub('Clinical consequences'), h('p', {}, d.cons)),
        h('div', {}, U.sub('Management'), h('ul', {}, d.mgmt.map((x) => h('li', {}, x))))));
      body.appendChild(U.note('S', 'In the ladder diagram the middle row is the AV node. In Mobitz I the AV line gets progressively more slanted (slower conduction) until one impulse stops at a bar. In Mobitz II the slant is identical every time — then one stops dead. In complete block nothing crosses at all, and the ventricles run their own escape rhythm.'));
      body.appendChild(h('div', { class: 'row' }, U.link('management', 'avb', 'Management pathway →'), U.link('misc', 'atropine', 'Atropine →'), U.link('ap', 'n0', 'Nodal phase 0 →')));
    }
    draw();

    m.appendChild(U.card('Drug-induced bradycardia — build it yourself',
      h('p', {}, 'The lecture’s first management step is to review rate-slowing medications. Here is why: add AV-nodal blockers together and watch the PR interval and the heart rate.'),
      (function () {
        const box = h('div', {});
        const sel = { metoprolol: false, verapamil: false, digoxin: false, adenosine: false };
        const out = h('div', { class: 'metrics' }), eh = h('div', {});
        const row = h('div', { class: 'row' });
        Object.keys(sel).forEach((d) => row.appendChild(U.toggle(K.drugs[d].name, false, (b) => { sel[d] = b; upd(); })));
        box.appendChild(row); box.appendChild(out); box.appendChild(eh);
        function upd() {
          const fx = Object.keys(sel).filter((d) => sel[d]).map((d) => K.drugs[d].fx);
          const P = EP.combine(fx.length ? fx : [{}]);
          const iv = EP.intervals(P);
          out.innerHTML = '';
          [['Heart rate', iv.hr.toFixed(0) + ' /min'], ['PR interval', isFinite(iv.pr) ? iv.pr.toFixed(0) + ' ms' : 'block'], ['AV-nodal ERP', iv.avERP.toFixed(0) + ' ms']]
            .forEach((x) => out.appendChild(h('div', { class: 'met' }, h('b', {}, x[1]), h('span', {}, x[0]))));
          if (iv.hr < 50 || iv.pr > 200) out.appendChild(h('div', { class: 'warn' }, h('b', {}, iv.pr > 200 ? 'First-degree AV block' : 'Bradycardia'), h('span', {}, 'This is iatrogenic. The lecture’s first step — review rate-slowing medications — comes before atropine or a pacemaker.')));
          eh.innerHTML = '';
          new RD.ECGStrip(eh, { gen: () => EP.rhythms.nsr({ hr: iv.hr, pr: Math.min(iv.pr, 400), dur: 6000 }), dur: 6000, ecgH: 140 });
        }
        upd();
        return box;
      })(),
      U.note('M', 'Combined effects are multiplied in the model. Real drug–drug interactions are not simply multiplicative, and the model has no doses.')));

    const c = U.checks('brady'); if (c) m.appendChild(c);
    m.appendChild(U.kp(['Always look for a reversible cause first — above all rate-slowing drugs.', '1st degree: delayed but every beat conducts. Mobitz I: progressive delay then a drop. Mobitz II: no warning.', 'Mobitz II and complete block carry the pacemaker indication when not reversible.', 'Atropine works at the nodes; it often fails when the block is below them.']));
  };

  /* ---------------- 12. CLINICAL CASES ---------------- */
  S.cases = function (m, sub) {
    m.appendChild(U.card('The five lecture cases and questions Q1–Q27',
      h('p', {}, 'These are the lecture’s own questions, unchanged. Answer one at a time; each answer explains why the right option is right and why each distractor is wrong, and links to the mechanism behind it.'), U.tag('L')));
    const groups = [[1, 'Case 1 — Q1–Q4'], [2, 'Case 2 — Q5–Q7'], [3, 'Case 3 — Q8–Q11'], [4, 'Case 4 — Q12–Q15'], [5, 'Case 5 — Q16–Q19'], [0, 'Questions Q20–Q27'], ['all', 'All 27 in order']];
    let g = 'all', startAt = 0;
    if (sub) { const q = K.questions.find((x) => x.id === sub); if (q) { g = 'all'; startAt = K.questions.indexOf(q); } }
    const card = U.card('');
    const seg = U.seg(groups, g, (x) => { g = x; startAt = 0; run(); });
    const body = h('div', {});
    card.appendChild(seg); card.appendChild(body); m.appendChild(card);
    function run() {
      body.innerHTML = '';
      const list = g === 'all' ? K.questions : K.questions.filter((q) => String(q.cs) === String(g));
      new K.QuizRunner(body, list, { start: Math.min(startAt, list.length - 1), onAnswer: () => App.save() });
    }
    run();
    m.appendChild(U.card('Progress on the lecture questions', (function () {
      const box = h('div', { class: 'qmap' });
      const upd = () => {
        box.innerHTML = '';
        K.questions.forEach((q) => {
          const v = App.state.answers[q.id];
          box.appendChild(h('button', { class: 'qm ' + (v == null ? '' : v === q.ans ? 'ok' : 'bad'), onclick: () => { App.go('cases', q.id); } }, q.id));
        });
      };
      upd(); setInterval(upd, 1500);
      return box;
    })(), U.muted('Green = correct, red = incorrect, grey = unanswered. Your answers are stored in this browser only.')));
  };

  /* ---------------- 13. FINAL ASSESSMENT ---------------- */
  S.assessment = function (m) {
    const sc = K.score(K.questions), sp = K.score(K.practice);
    const pct = sc.a ? Math.round((sc.c / sc.a) * 100) : 0;
    m.appendChild(U.card('Your performance report',
      h('div', { class: 'report' },
        h('div', { class: 'rbig' }, h('b', {}, sc.c + ' / ' + K.questions.length), h('span', {}, 'Lecture questions correct')),
        h('div', { class: 'rbig' }, h('b', {}, sc.a ? pct + '%' : '—'), h('span', {}, 'Accuracy on answered')),
        h('div', { class: 'rbig' }, h('b', {}, sp.c + ' / ' + K.practice.length), h('span', {}, 'Supplementary practice correct')),
        h('div', { class: 'rbig' }, h('b', {}, K.sections.filter((s) => App.state.visited[s.id]).length + ' / ' + K.sections.length), h('span', {}, 'Modules visited'))),
      (function () {
        const by = {};
        K.questions.forEach((q) => { const v = App.state.answers[q.id]; by[q.topic] = by[q.topic] || { a: 0, c: 0, n: 0 }; by[q.topic].n++; if (v != null) { by[q.topic].a++; if (v === q.ans) by[q.topic].c++; } });
        const rows = Object.keys(by).map((t) => [t, by[t].c + ' / ' + by[t].n, by[t].a === 0 ? 'not attempted' : by[t].c === by[t].a ? 'solid' : by[t].c / by[t].a >= 0.5 ? 'review' : 'needs work']);
        return U.table(['Topic', 'Correct', 'Status'], rows);
      })(),
      h('div', { class: 'row' }, U.btn('Go to the lecture questions', () => App.go('cases'), 'btn-p'),
        U.btn('Reset all answers', () => { if (confirmBox()) { App.state.answers = {}; App.save(); App.render(); } }))));

    function confirmBox() { return true; }

    m.appendChild(U.card('Mixed practice — supplementary',
      U.muted('These are additional items written for this lab, kept separate from the lecture’s own questions.'),
      (function () { const b = h('div', {}); new K.QuizRunner(b, K.practice, { showCase: false }); return b; })()));

    m.appendChild(U.card('Can you predict? — the goal of this course',
      h('p', {}, 'You have understood the material when you can answer these three in order, for any drug, without memorising a table:'),
      h('ol', { class: 'obj' },
        h('li', {}, 'Which channel or receptor does it act on, and in which tissue?'),
        h('li', {}, 'What does that do to the action potential — phase 0 slope, APD, ERP, phase 4?'),
        h('li', {}, 'What must the ECG therefore do, and which arrhythmia does that help or harm?')),
      U.chain(-1),
      h('div', { class: 'row' }, U.link('drugap', null, 'Practise on the AP simulator'), U.link('drugecg', null, 'Practise on the ECG simulator'))));

    m.appendChild(U.card('Scientific transparency',
      h('p', {}, 'What each label means:'),
      h('div', { class: 'tiers' }, Object.keys(K.tiers).map((k) => h('div', { class: 'tier' }, U.tag(k), h('span', {}, K.tiers[k][1])))),
      U.sub('What this model does not do'),
      h('ul', { class: 'lim' }, K.modelLimits.map((x) => h('li', {}, x))),
      U.sub('Points flagged in the lecture'),
      h('div', { class: 'flags' }, K.flags.map((f) => h('div', { class: 'flag' }, U.tag('F'), h('b', {}, f.where), h('p', {}, f.text))))));

    m.appendChild(U.card('References',
      U.muted('The lecture is the primary source. Supplementary explanations are anchored to the following.'),
      h('ol', { class: 'refs' }, K.refs.map((r) => h('li', {}, r)))));
  };
})();