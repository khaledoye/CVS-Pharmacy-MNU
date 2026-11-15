/* =====================================================================
   content.js — EDUCATIONAL CONTENT (data only)
   Source tags:  L = stated in the lecture (Arrythmia.pdf, pp. 47–59)
                 S = supplementary explanation (standard physiology/
                     pharmacology references listed in K.refs)
   ===================================================================== */
(function () {
  const K = {};
  window.K = K;

  /* Four-tier evidence labelling used throughout the app (audit recommendation) */
  K.tiers = {
    L: ['Lecture content', 'Stated in the PP 907 Arrythmia lecture (pp. 47–59).'],
    S: ['Evidence-based supplementary', 'Not in the lecture; anchored to a guideline or standard textbook, cited in References.'],
    M: ['Simplified simulation', 'Output of the teaching model. Qualitatively correct — the direction and the mechanism are right — but the exact numbers are illustrative, not clinical predictions.'],
    Q: ['Matches published range', 'The simulated value falls inside a range reported in human studies (range and source given).'],
    U: ['Uncertain / context-dependent', 'Evidence conflicts, or the effect depends on dose, rate, tissue or clinical context that this model does not represent.'],
    F: ['Lecture note', 'A point in the lecture that is ambiguous or incomplete; flagged rather than silently changed.']
  };
  K.modelLimits = [
    'No ion or drug concentrations: each drug is one fixed “therapeutic” point, so dose–response and toxic thresholds cannot be shown.',
    'No use-dependence or reverse use-dependence: real class I block grows at fast heart rates, and class III QT prolongation is greatest at slow rates. Fixed multipliers cannot show this.',
    'Conduction velocity is estimated as √(dV/dt max) — defensible for modest Na⁺ block (cable theory), but it loses accuracy near conduction failure and ignores gap-junction coupling.',
    'EAD, DAD and torsades initiation are deterministic thresholds. Real proarrhythmia depends on dispersion of repolarisation and is probabilistic.',
    'Re-entry is animated schematically; no tissue-level wave propagation is solved.',
    'A single lead-II-like trace is drawn, so the electrical axis cannot be measured from it.',
    'Severe hypokalaemia also reduces I_K1 (which can depolarise the cell and provoke automaticity) — not represented.',
    'Procainamide’s active class III metabolite NAPA, which adds QT prolongation without widening QRS, is not modelled.',
    'Nothing here is a patient recording or a patient-specific prediction.'
  ];

  K.sections = [
    { id: 'overview', t: 'Overview & objectives', n: 1 },
    { id: 'anatomy', t: 'Cardiac electrical anatomy (3D)', n: 2 },
    { id: 'ap', t: 'Action potentials', n: 3 },
    { id: 'mechanisms', t: 'Arrhythmogenesis mechanisms', n: 4 },
    { id: 'ecg', t: 'ECG interpretation lab', n: 5 },
    { id: 'classes', t: 'Antiarrhythmic classification', n: 6 },
    { id: 'drugap', t: 'Drug → action potential', n: 7 },
    { id: 'drugecg', t: 'Drug → ECG simulator', n: 8 },
    { id: 'misc', t: 'Miscellaneous agents', n: 9 },
    { id: 'management', t: 'Arrhythmia management', n: 10 },
    { id: 'brady', t: 'Bradyarrhythmias & AV blocks', n: 11 },
    { id: 'cases', t: 'Clinical cases (Q1–Q27)', n: 12 },
    { id: 'assessment', t: 'Final assessment & report', n: 13 }
  ];

  K.definition = 'Disturbance in the normal rate, regularity, origin, or conduction of the cardiac electrical impulse.';

  K.objectives = [
    'Trace the normal impulse from the SA node to the ventricular myocardium and relate each step to an ECG component.',
    'Explain fast-response and slow-response (nodal) action potentials in terms of the ionic currents of each phase.',
    'Describe the two mechanisms of arrhythmogenesis in the lecture: abnormal automaticity and re-entry (incl. WPW).',
    'Apply the Vaughan Williams classification and the general principles by which antiarrhythmics act (automaticity, conduction velocity, ERP, membrane responsiveness).',
    'Predict each drug’s effect on the action potential, the ECG and the clinical condition — and its key adverse effects and precautions.',
    'Recognise AF, PSVT, VT, VF, torsades de pointes, sinus node dysfunction and 1st/2nd/3rd-degree AV block, and outline their initial management.',
    'Solve the five clinical cases and questions Q1–Q27.'
  ];

  /* Lecture statements that are ambiguous / incomplete — flagged, never silently fixed */
  K.flags = [
    { where: 'PSVT management (p. 52)', text: 'The lecture writes “If stable: vagal maneuvers. If not → adenosine – cardioversion”. “If not” is ambiguous: it most likely means “if vagal manoeuvres fail → adenosine, then cardioversion if adenosine fails”. An UNSTABLE patient goes straight to synchronized cardioversion (the lecture’s own DC-cardioversion card: “terminates unstable tachyarrhythmias”). The management tree shows this interpretation explicitly.' },
    { where: 'Sinus node dysfunction (p. 53)', text: 'The ECG clue given (“HR < 60 with a normal P wave before every QRS”) describes sinus bradycardia, which is only one presentation of sinus node dysfunction. Supplementary: SND also includes sinus pauses/arrest, sino-atrial exit block and tachy-brady syndrome.' },
    { where: 'AV-block management (p. 53)', text: 'IV atropine is listed for acute symptomatic AV block in general. Supplementary: atropine acts at the AV node (vagal level) and is often ineffective in infranodal Mobitz II or 3rd-degree block with a wide escape rhythm — temporary pacing is then needed.' },
    { where: 'Drug-table spelling', text: 'Minor: “Wolf Parkinson White” → Wolff–Parkinson–White; “Arrythmia” → Arrhythmia. No change in meaning.' }
  ];

  /* ------------------------ ACTION-POTENTIAL PHASES ------------------------ */
  K.phases = {
    p0: { name: 'Phase 0 — rapid depolarisation', src: 'S', ions: 'Massive Na⁺ influx (I_Na) through fast voltage-gated Na⁺ channels (Nav1.5) once threshold (~−70 mV) is reached.', channels: 'Nav1.5 (SCN5A) fast sodium channel',
      drugs: 'Class I Na⁺-channel blockers (L): IA procainamide = moderate, IB lidocaine = weak, IC flecainide = strong blockade → ↓ phase-0 slope.', consequence: 'Maximum upstroke velocity (dV/dt max) determines how fast the impulse spreads cell-to-cell → conduction velocity. Slower phase 0 = slower conduction.', ecg: 'QRS complex (ventricular depolarisation). Slower phase 0 → wider QRS.' },
    p1: { name: 'Phase 1 — initial (early) repolarisation', src: 'S', ions: 'Na⁺ channels inactivate; transient outward K⁺ current (I_to) produces the “notch”.', channels: 'Kv4.2/4.3 (I_to)', drugs: 'No lecture drug acts mainly here.', consequence: 'Sets the starting voltage of the plateau; the notch is prominent in epicardium.', ecg: 'J point (end of QRS).' },
    p2: { name: 'Phase 2 — plateau', src: 'S', ions: 'Inward L-type Ca²⁺ current (I_CaL) balanced by outward delayed-rectifier K⁺ currents (I_Kr, I_Ks); a small late Na⁺ current also sustains it.', channels: 'Cav1.2 (L-type Ca²⁺), hERG/Kv11.1 (I_Kr), KvLQT1/minK (I_Ks)',
      drugs: 'Class IV (verapamil/diltiazem) reduce Ca²⁺ entry → negative inotropy (L, Q27); lidocaine blocks late Na⁺ → shorter plateau (S); class III lengthen it (L).', consequence: 'Ca²⁺ entering here triggers sarcoplasmic Ca²⁺ release → contraction. The long plateau keeps the cell refractory (protects against tetany and re-excitation).', ecg: 'ST segment — isoelectric because all ventricular cells sit at a similar plateau voltage.' },
    p3: { name: 'Phase 3 — final repolarisation', src: 'S', ions: 'K⁺ efflux via I_Kr, I_Ks then I_K1 returns the membrane to rest; Ca²⁺ channels close.', channels: 'hERG (I_Kr) — the target of most QT-prolonging drugs; KvLQT1 (I_Ks); Kir2.x (I_K1)',
      drugs: 'Class III (amiodarone, sotalol) “prolong phase 3 repolarization, ↑APD and ERP” (L); class IA procainamide also ↑APD (L).', consequence: 'Duration of phase 3 sets APD and therefore the effective refractory period (ERP). Excessive prolongation → early after-depolarisations (EADs) → torsades de pointes.', ecg: 'T wave; the QT interval ≈ ventricular APD.' },
    p4: { name: 'Phase 4 — resting membrane potential', src: 'S', ions: 'Stable at about −85 to −90 mV, maintained by the inward-rectifier K⁺ current (I_K1) and the Na⁺/K⁺-ATPase.', channels: 'Kir2.x (I_K1), Na⁺/K⁺-ATPase',
      drugs: 'Digoxin inhibits Na⁺/K⁺-ATPase (L). Working myocytes have no spontaneous phase-4 depolarisation; in ischaemia/hypokalaemia they can acquire it → abnormal automaticity (L mechanism).', consequence: 'A stable, negative resting potential keeps fast Na⁺ channels available (membrane responsiveness). Partial depolarisation inactivates Na⁺ channels.', ecg: 'TQ segment (electrical diastole, isoelectric baseline).' },
    n4: { name: 'Nodal phase 4 — spontaneous diastolic depolarisation', src: 'S', ions: 'Slow inward “funny” current I_f (Na⁺/K⁺ through HCN channels), then T-type and L-type Ca²⁺ current, plus decaying outward K⁺ current. Maximum diastolic potential ≈ −60 mV.', channels: 'HCN4 (I_f), Cav3.1 (I_CaT), Cav1.3 (I_CaL); I_K,ACh / I_K,Ado (GIRK) oppose it',
      drugs: 'β-blockers inhibit phase-4 depolarisation (L); adenosine opens K⁺ channels (L); digoxin ↑ vagal tone (L); atropine removes vagal tone → ↑ SA-node activity (L); Ca²⁺-channel blockers ↓ SA-node activity (L).', consequence: 'The slope of phase 4 sets the firing rate (automaticity). Steeper slope = faster heart rate. Ectopic cells with a phase-4 slope steeper than the SA node take over (abnormal automaticity).', ecg: 'Sinus-node phase 4 determines the RR interval / heart rate.' },
    n0: { name: 'Nodal phase 0 — Ca²⁺-mediated (slow) upstroke', src: 'S', ions: 'L-type Ca²⁺ current (I_CaL). Fast Na⁺ channels are inactivated at the less negative nodal potential, so the upstroke is slow (~5–10 V/s vs ~300 V/s in myocytes).', channels: 'Cav1.2 / Cav1.3 (L-type)',
      drugs: 'Class IV verapamil/diltiazem (L) and adenosine (inhibits Ca²⁺ channels, L) reduce it.', consequence: 'The slow upstroke is why AV-nodal conduction is slow (the physiological AV delay that lets the atria fill the ventricles).', ecg: 'AV-nodal conduction occupies most of the PR interval (PR segment). Slower → longer PR.' },
    n3: { name: 'Nodal phase 3 — repolarisation', src: 'S', ions: 'K⁺ efflux (I_Kr/I_Ks) returns the cell to the maximum diastolic potential. No true plateau (phases 1–2 absent).', channels: 'hERG, KvLQT1',
      drugs: 'Class IV “increasing AV nodal ERP” (L): in nodal tissue refractoriness outlasts repolarisation because Ca²⁺ channels recover slowly (time-dependent refractoriness, S).', consequence: 'The AV-nodal ERP limits how many atrial impulses can pass — the basis of ventricular RATE CONTROL in AF.', ecg: 'Longer AV-nodal ERP → fewer conducted beats → slower ventricular response in AF / dropped beats.' }
  };

  /* ----------------------------- ECG COMPONENTS ---------------------------- */
  K.ecgParts = {
    P: { name: 'P wave', ev: 'Atrial depolarisation (right then left atrium).', st: 'SA node fires → atrial myocardium (incl. Bachmann’s bundle to LA).', ap: 'Phase 0 of atrial myocytes (fast-response AP).', abn: 'Absent/replaced by fibrillatory baseline → atrial fibrillation (L: “no distinct/organised P waves”). Hidden/retrograde → PSVT. P waves with no QRS → AV block. Normal duration < 120 ms (S).' },
    PR: { name: 'PR interval', ev: 'Time from onset of atrial depolarisation to onset of ventricular depolarisation (lecture slide p. 48).', st: 'Atria + AV node + His–Purkinje; dominated by AV-nodal delay.', ap: 'Slow, Ca²⁺-dependent nodal phase 0 (slow conduction).', abn: 'PR > 200 ms = 1st-degree AV block (L). Progressive lengthening then dropped QRS = Mobitz I (L). Short PR (< 120 ms) + delta wave = pre-excitation/WPW (S). Prolonged by β-blockers, verapamil/diltiazem, digoxin, adenosine (S).' },
    PRs: { name: 'PR segment', ev: '“AV node delay” (lecture slide p. 48) — end of P to start of QRS.', st: 'AV node, His bundle and bundle branches (electrically silent on the surface ECG).', ap: 'Nodal phase 0/3; His–Purkinje fast APs too small to be seen.', abn: 'Lengthens with AV-nodal blocking drugs; absent in pre-excitation (accessory pathway bypasses the AV node).' },
    QRS: { name: 'QRS complex', ev: 'Ventricular depolarisation.', st: 'His bundle → bundle branches → Purkinje fibres → ventricular myocardium (septum first, then free walls).', ap: 'Phase 0 of ventricular myocytes; width reflects conduction velocity (Na⁺ current).', abn: 'Narrow (< 120 ms) = supraventricular origin (PSVT, AF). Wide = ventricular origin (VT), bundle-branch block, pre-excitation, or class I (esp. IC) drugs (S). Absent/chaotic = VF (L).' },
    ST: { name: 'ST segment', ev: 'Ventricles fully depolarised (plateau).', st: 'Entire ventricular myocardium.', ap: 'Phase 2 plateau.', abn: 'Elevation/depression = ischaemia/injury (S, beyond this lecture). “Scooped” ST depression = digoxin effect (S).' },
    T: { name: 'T wave', ev: 'Ventricular repolarisation.', st: 'Ventricular myocardium (epicardium repolarises before endocardium → upright T).', ap: 'Phase 3.', abn: 'Delayed/broad with K⁺-channel block (class III, IA) and hypokalaemia (S). Discordant T after wide QRS (S).' },
    QT: { name: 'QT interval', ev: 'Total time of ventricular depolarisation and repolarisation (lecture slide p. 48).', st: 'Ventricular myocardium.', ap: '≈ ventricular action-potential duration (phases 0–3).', abn: 'Prolonged by procainamide, amiodarone, sotalol (L). Markedly prolonged QTc → torsades de pointes (L). Rate-corrected QTc (Bazett: QT/√RR) > ~450 ms men/470 ms women is prolonged (S).' },
    RR: { name: 'RR interval & heart rate', ev: 'Time between successive ventricular depolarisations.', st: 'Set by the dominant pacemaker (normally the SA node).', ap: 'SA-node phase-4 slope.', abn: 'HR = 60 000 / RR(ms) (S). Irregularly irregular RR = AF (L). HR < 60 = bradycardia (L); > 100 = tachycardia.' },
    AX: { name: 'Electrical axis', ev: 'Mean direction of ventricular depolarisation in the frontal plane.', st: 'Normally −30° to +90° (down and to the left) (S).', ap: '—', abn: 'Supplementary only: needs ≥ 2 leads (I and aVF). Not covered in the lecture; shown here for completeness. This simulator draws a single lead-II-like trace, so axis cannot be measured from it.' }
  };

  /* ------------------------------- RHYTHMS -------------------------------- */
  K.rhythms = {
    nsr: { name: 'Normal sinus rhythm', group: 'ref', clue: 'Regular, 60–100 bpm, upright P before every QRS, PR 120–200 ms, narrow QRS (S).', mech: 'SA node is the dominant pacemaker; normal conduction sequence.', cons: '—', mgmt: '—', origin: 'SA node' },
    af: { name: 'Atrial fibrillation (AF)', group: 'Supraventricular (above the bundle of His)', clue: 'Irregular rhythm with no distinct/organized P waves (L).',
      mech: 'Multiple chaotic atrial wavelets (re-entry + ectopic triggers, classically from the pulmonary veins) activate the atria at 350–600/min. The AV node, acting as a filter limited by its refractory period, conducts only some impulses → irregularly irregular narrow QRS (S).',
      cons: 'Loss of atrial kick (↓ cardiac output, esp. in HF), fast ventricular rate → palpitations, fatigue, tachycardia-induced cardiomyopathy; blood stasis in the left atrial appendage → thrombo-embolic stroke (S).',
      mgmt: ['Rate control with β-blocker, diltiazem/verapamil, or digoxin with HF (L)', 'Rhythm control with antiarrhythmic drugs or cardioversion (L)', 'Assess the need for stroke prevention (Direct Oral Anticoagulants): apixaban generally preferred over warfarin (L)'], origin: 'Atria (multiple wavelets)' },
    psvt: { name: 'Paroxysmal supraventricular tachycardia (PSVT)', group: 'Supraventricular', clue: 'Sudden palpitations; regular narrow-QRS tachycardia (L).',
      mech: 'Usually re-entry involving the AV node — AV-nodal re-entrant tachycardia (dual slow/fast pathways) or AV re-entrant tachycardia using an accessory pathway (WPW). Ventricles are activated normally via His–Purkinje → narrow QRS; P waves are buried in or just after the QRS (S).',
      cons: 'Palpitations, dizziness, dyspnoea; usually well tolerated in young patients; rarely haemodynamic compromise (S).',
      mgmt: ['If stable: vagal maneuvers (L)', 'If not (vagal manoeuvres fail) → adenosine → cardioversion (L — see flag on wording)'], origin: 'AV-nodal circuit (re-entry)' },
    vt: { name: 'Ventricular tachycardia (stable monomorphic VT)', group: 'Ventricular (below the bundle of His)', clue: '≥ 3 consecutive ventricular beats at > 100 bpm; regular monomorphic wide-complex tachycardia with preserved haemodynamics (L).',
      mech: 'Most commonly re-entry around a myocardial scar (e.g., previous MI). Activation spreads muscle-to-muscle rather than through Purkinje fibres → slow, wide QRS. Atria may continue independently (AV dissociation) (S).',
      cons: 'Reduced cardiac output, can degenerate into VF → sudden cardiac death (S).', mgmt: ['IV amiodarone or procainamide (L)', 'IV verapamil should never be used in VT → haemodynamic collapse (L)'], origin: 'Ventricular myocardium (scar re-entry)' },
    vf: { name: 'Ventricular fibrillation (VF)', group: 'Ventricular', clue: 'Unresponsive, no pulse, chaotic rhythm with no organized QRS complexes (L).',
      mech: 'Multiple disorganised, continuously wandering re-entrant wavefronts in the ventricles; no coordinated contraction (S).', cons: 'No cardiac output → cardiac arrest; death within minutes without defibrillation (S).',
      mgmt: ['CPR + immediate unsynchronized defibrillation (L)', 'Amiodarone or lidocaine used for refractory VF (L)'], origin: 'Ventricles (chaotic wavelets)' },
    tdp: { name: 'Torsades de pointes', group: 'Ventricular', clue: 'Polymorphic VT with markedly prolonged QTc (L); QRS axis “twists” around the baseline (Case 4).',
      mech: 'Prolonged repolarisation (↓ K⁺ current: drugs such as class IA/III, hypokalaemia, hypomagnesaemia) allows L-type Ca²⁺ channels to reactivate → early after-depolarisations (EADs) → triggered beats on a dispersed, prolonged repolarisation substrate (S).',
      cons: 'Syncope; may degenerate into VF (S).', mgmt: ['IV magnesium sulfate (L)', 'Discontinue QT-prolonging drugs (L)', 'Correct electrolyte abnormalities (Mg²⁺ – K⁺) (L)'], origin: 'Ventricles (EAD-triggered)' },
    brady: { name: 'Sinus node dysfunction / sinus bradycardia', group: 'Bradyarrhythmia & conduction disorders', clue: 'HR < 60 beats/min with a normal P wave before every QRS (L).',
      mech: 'Reduced SA-node phase-4 slope or exit block — intrinsic (degeneration/fibrosis: sick sinus syndrome) or extrinsic (drugs: β-blockers, verapamil, diltiazem, digoxin; ↑ vagal tone; hypothyroidism) (S).', cons: 'Fatigue, dizziness, syncope, exercise intolerance if symptomatic (S).',
      mgmt: ['Identify and treat the cause (L)', 'Review rate-slowing medications such as β-blockers, verapamil, diltiazem and digoxin (L)', 'Atropine may help if symptomatic (L)'], origin: 'SA node (slow)' },
    avb1: { name: '1st-degree AV block', group: 'Conduction disorder', clue: 'PR interval > 200 ms; delayed AV conduction (L). Every P is conducted.', mech: 'Slowed conduction, usually within the AV node (S).', cons: 'Usually asymptomatic (S).', mgmt: ['Usually no treatment (L)', 'Discontinue causative drugs (L)'], origin: 'AV node (delay)' },
    mobitz1: { name: '2nd-degree AV block — Mobitz I (Wenckebach)', group: 'Conduction disorder', clue: 'Progressive PR prolongation followed by intermittent non-conducted P waves (dropped QRS complexes) (L).',
      mech: 'Decremental conduction in the AV node: each impulse arrives earlier in the node’s recovery period, so conduction is slower, until one arrives during the ERP and is blocked; the pause lets the node recover and the cycle repeats (S).',
      cons: 'Often benign (vagal, drugs); usually nodal level (S).', mgmt: ['Discontinue causative drugs (L)', 'Acute symptomatic cases: IV atropine (L)'], origin: 'AV node (progressive delay → block)' },
    mobitz2: { name: '2nd-degree AV block — Mobitz II (more risk)', group: 'Conduction disorder', clue: 'Constant PR intervals in conducted beats, with intermittent non-conducted P waves (dropped QRS complexes) (L).',
      mech: '“All-or-none” failure, usually infranodal (His–Purkinje) — conducted beats are not delayed, then a beat fails without warning (S).',
      cons: 'May progress to complete heart block (Q17) → syncope, sudden death (L/S).', mgmt: ['Discontinue causative drugs (L)', 'Acute symptomatic: IV atropine (L; often ineffective if infranodal — see flag)', 'Long-term: permanent pacemaker if not due to a reversible cause (L)'], origin: 'His–Purkinje (sudden block)' },
    avb3: { name: '3rd-degree AV block (complete heart block)', group: 'Conduction disorder', clue: 'Complete AV dissociation, with severe bradycardia (L).',
      mech: 'No atrial impulse reaches the ventricles. Atria follow the SA node; ventricles are driven by a slower junctional (narrow, 40–60) or ventricular (wide, 20–40) escape pacemaker (S).',
      cons: 'Severe bradycardia, hypotension, syncope (Stokes–Adams attacks), heart failure (S).', mgmt: ['Discontinue causative drugs (L)', 'Acute symptomatic: IV atropine (L)', 'Long-term: permanent pacemaker if not reversible (L)'], origin: 'AV conduction absent; ventricular escape' },
    pre: { name: 'Ventricular pre-excitation (WPW pattern)', group: 'Re-entry substrate', clue: 'Wolff–Parkinson–White syndrome is an atrioventricular re-entrant tachycardia secondary to an accessory AV conducting pathway (L). Short PR & delta wave (lecture figure p. 48).',
      mech: 'Accessory pathway (bundle of Kent) is fast-response tissue that bypasses the AV-nodal delay → part of the ventricle activates early (delta wave) (S).', cons: 'Substrate for AVRT; in AF, very rapid conduction down the pathway can cause VF (S).', mgmt: ['Pre-excited AF (stable): procainamide is the preferred initial drug (L)', 'Avoid adenosine in pre-excited AF associated with WPW (L)'], origin: 'Accessory pathway' }
  };

  /* ------------------------------ DRUGS ---------------------------------- */
  // fx = channel-effect multipliers used by EP models (educational calibration)
  K.drugs = {
    procainamide: { name: 'Procainamide', cls: 'IA', group: 'I', label: 'Class IA — moderate Na⁺-channel blocker',
      target: 'Fast Na⁺ channel (Nav1.5) — moderate block, intermediate kinetics; also blocks K⁺ channels (I_Kr) (S)', receptor: 'Ion channel (Na⁺ > K⁺)',
      mech: { L: '↓ conduction velocity and ↑ action potential duration and ERP.', S: 'Na⁺ block slows phase 0; additional K⁺ block delays phase 3. Slow recovery from block adds refractoriness beyond repolarisation (post-repolarisation refractoriness).' },
      phase: 'Phase 0 ↓ slope; phase 3 prolonged', cv: '↓ (moderate)', apd: '↑', erp: '↑', ecg: 'QRS widening (modest) and QT prolongation',
      uses: ['The preferred initial drug in stable patients with pre-excited AF associated with Wolff–Parkinson–White syndrome (L)', 'Stable VT: IV amiodarone or procainamide (L)'],
      adverse: ['Drug-induced SLE (lupus-like syndrome) (L)', 'Hypotension (L)', 'QT prolongation (L)'], prec: ['Avoid with prolonged QT and significant HF (L)'],
      acute: 'Procainamide’s effect on an accessory pathway depends on that pathway’s own refractory period: pathways with a long ERP may block completely, while short-ERP (high-risk) pathways change little — this is why the drug is used as a diagnostic test (Wellens 1982). Its active metabolite NAPA is a pure class III agent that adds QT prolongation without widening QRS; NAPA is not simulated here (S).',
      clinical: 'Why in pre-excited AF (S): the accessory pathway is Na⁺-dependent fast tissue — procainamide prolongs its refractory period, whereas AV-nodal blockers do not and may favour conduction down the pathway. Lupus-like syndrome is more common in slow acetylators (S).',
      fx: { gNa: 0.6, gK: 0.75, prr: 25 } },
    lidocaine: { name: 'Lidocaine', cls: 'IB', group: 'I', label: 'Class IB — weak Na⁺-channel blocker',
      target: 'Fast Na⁺ channel — binds inactivated channels with very fast on/off kinetics; also blocks late Na⁺ current (S)', receptor: 'Ion channel (Na⁺)',
      mech: { L: '↓ APD and ERP (weak Na⁺ block).', S: 'Little effect on normal tissue at normal rates; block is greater in partially depolarised (ischaemic) myocardium and at fast rates, where channels spend more time inactivated. Late-Na⁺ block shortens the plateau, mainly in Purkinje fibres.' },
      phase: 'Phase 0 (minimal in normal tissue); shortens phase 2–3', cv: '↔/slight ↓ (↓ more in ischaemic tissue)', apd: '↓', erp: '↓', ecg: 'Relatively minimal ECG change at therapeutic doses',
      uses: ['Acute ventricular arrhythmias especially post-MI (L)', 'Refractory VF: amiodarone or lidocaine (L)'],
      adverse: ['Neurological toxicity: dizziness, paresthesia, confusion (L)'], prec: ['Dose reduction in HF or hepatic dysfunction (L)'],
      clinical: 'High hepatic extraction: clearance depends on liver blood flow, which falls in HF → accumulation and CNS toxicity (S). Use-/state-dependence explains its selectivity for ischaemic ventricular tissue post-MI (S).',
      fx: { gNa: 0.92, gNaL: 0.4 }, fxIsch: { gNa: 0.6, gNaL: 0.4 } },
    flecainide: { name: 'Flecainide', cls: 'IC', group: 'I', label: 'Class IC — strong Na⁺-channel blocker',
      target: 'Fast Na⁺ channel — strong block, slow dissociation kinetics (S)', receptor: 'Ion channel (Na⁺)',
      mech: { L: '↓ conduction velocity with minimal effect on APD and ERP.', S: 'Marked slowing of phase 0 at all heart rates, with little change in repolarisation.' },
      phase: 'Phase 0 markedly ↓', cv: '↓↓ (marked)', apd: '↔ (minimal)', erp: '↔ (minimal)', ecg: 'QRS widening (± mild PR prolongation)',
      uses: ['PSVT (L)', 'AF rhythm control in selected patients (L)'], adverse: ['Ventricular pro-arrhythmia (L)'], prec: ['Contraindicated after MI and in significant structural heart disease (L)'],
      clinical: 'Why contraindicated post-MI (S): marked conduction slowing in scarred myocardium creates the slow-conduction limb needed for re-entry → VT/VF; the CAST trial showed increased mortality with class IC drugs after MI.',
      fx: { gNa: 0.35, gK: 0.95, prr: 8 } },
    metoprolol: { name: 'Metoprolol', cls: 'II', group: 'II', label: 'Class II — β-blocker (β1-selective)',
      target: 'β1-adrenergic receptor (G_s-coupled) — antagonist', receptor: 'GPCR (β1)',
      mech: { L: '↓ sympathetic stimulation, inhibit phase 4 depolarization and slow AV conduction.', S: '↓ cAMP → less I_f and less phosphorylated L-type Ca²⁺ current in nodal cells → flatter phase 4 (↓ SA automaticity) and slower, more refractory AV node.' },
      phase: 'Nodal phase 4 (↓ slope) and nodal phase 0', cv: '↓ in AV node only', apd: '↔ (myocardium)', erp: '↑ AV-nodal ERP', ecg: '↓ heart rate; ± PR prolongation',
      uses: ['AF rate control (L)'], adverse: ['Bradycardia (L)', 'AV block (L)', 'Hypotension (L)'], prec: ['Avoid with AV block (L)', 'Avoid in acute decompensated heart failure (ADHF) (L)'],
      clinical: 'Effects are greatest when sympathetic tone is high (exercise, stress, thyrotoxicosis) (S).',
      fx: { beta: 0.55 } },
    amiodarone: { name: 'Amiodarone', cls: 'III', group: 'III', label: 'Class III — multi-channel blocker (K⁺, Na⁺, Ca²⁺ and β-blocker)',
      target: 'K⁺ channels (I_Kr, I_Ks) + Na⁺ + L-type Ca²⁺ channels + non-competitive β-blockade (L)', receptor: 'Ion channels + β-receptor',
      mech: { L: 'Prolong phase 3 repolarization, ↑APD and ERP; multi-channel blocker.', S: 'The combination of class I, II, III and IV actions explains its broad spectrum (atrial + ventricular) and the relatively low torsades risk despite QT prolongation (Ca²⁺ block limits EADs).' },
      phase: 'Phase 3 prolonged (+ phase 0 ↓, nodal phase 4 ↓)', cv: 'slight ↓', apd: '↑', erp: '↑', ecg: 'QT prolongation; bradycardia; ± PR prolongation',
      uses: ['Atrial and ventricular arrhythmias; resistant arrhythmias (L)', 'Stable VT (IV) (L)', 'Refractory VF (L)'],
      adverse: ['Pulmonary toxicity (L)', 'Hepatic toxicity (L)', 'Thyroid toxicity (L)', 'Visual toxicity (L)', 'Neurological toxicity (L)', 'Bradycardia (L)', 'QT prolongation (L)'], prec: ['Interacts with digoxin and warfarin (L)'],
      acute: 'The profile simulated here is CHRONIC ORAL amiodarone (full class III effect). Acute IV amiodarone behaves differently — its early actions are mainly AV-nodal, β-blocking and Ca²⁺-channel block with much less QT effect, and the class III effect builds over days. 2024 ESC: avoid amiodarone in pre-excited AF because of its delayed action (S).',
      clinical: 'Interactions (S): inhibits P-glycoprotein (↑ digoxin levels → reduce digoxin dose) and CYP2C9 (↑ warfarin effect → reduce dose, monitor INR). Iodine-rich structure → hypo-/hyperthyroidism; very long half-life (weeks) so toxicity and interactions persist (S).',
      fx: { gK: 0.62, gNa: 0.85, gCa: 0.85, nCa: 0.85, beta: 0.75, prr: 10 } },
    sotalol: { name: 'Sotalol', cls: 'II + III', group: 'III', label: 'Class II + III — β-blocker and K⁺-channel blocker',
      target: 'I_Kr K⁺ channel + β-adrenergic receptors (L)', receptor: 'Ion channel + β-receptor',
      mech: { L: 'Combined β-blocking (class II) and K⁺-channel-blocking (class III) actions.', S: 'I_Kr block lengthens phase 3 (more so at slow heart rates — “reverse use-dependence”), increasing torsades risk with bradycardia/hypokalaemia.' },
      phase: 'Phase 3 prolonged; nodal phase 4 ↓', cv: '↔ (↓ AV node)', apd: '↑', erp: '↑', ecg: 'QT prolongation; bradycardia',
      uses: ['Atrial and ventricular arrhythmias (L)'], adverse: ['QT prolongation (L)', 'Bradycardia (L)'], prec: ['Renal dose adjustment (L)'],
      clinical: 'Eliminated unchanged by the kidney (S) → accumulates in renal impairment → excessive QT prolongation → torsades.',
      fx: { gK: 0.65, beta: 0.6 } },
    verapamil: { name: 'Verapamil', cls: 'IV', group: 'IV', label: 'Class IV — non-dihydropyridine Ca²⁺-channel blocker',
      target: 'L-type Ca²⁺ channel (Cav1.2), use-dependent (S)', receptor: 'Ion channel (Ca²⁺)',
      mech: { L: '↓ SA node activity and slow AV conduction, increasing AV nodal ERP.', S: 'Nodal phase 0 is Ca²⁺-dependent, so block slows nodal upstroke and conduction; reduced Ca²⁺ entry into myocytes during phase 2 reduces contractility (negative inotropy).' },
      phase: 'Nodal phase 0 (and phase 4); myocardial phase 2 (Ca²⁺ entry)', cv: '↓ in AV node only', apd: '↔ (myocardium)', erp: '↑ AV-nodal ERP', ecg: 'PR prolongation; slower ventricular rate in AF',
      uses: ['AF rate control (L)'], adverse: ['Bradycardia (L)', 'AV block (L)', 'Hypotension (L)'], prec: ['IV verapamil should never be used in VT → haemodynamic collapse (L)', 'Negative inotropic effects → potentially unsuitable in reduced ejection fraction (L, Q27)'],
      clinical: 'Why not in VT (S): VT does not depend on the AV node, so verapamil cannot terminate it, while vasodilation and negative inotropy collapse an already compromised output. Also avoid in pre-excited AF (blocking the AV node favours pathway conduction).',
      fx: { gCa: 0.85, nCa: 0.55 } },
    diltiazem: { name: 'Diltiazem', cls: 'IV', group: 'IV', label: 'Class IV — non-dihydropyridine Ca²⁺-channel blocker',
      target: 'L-type Ca²⁺ channel (S)', receptor: 'Ion channel (Ca²⁺)',
      mech: { L: '↓ SA node activity and slow AV conduction, increasing AV nodal ERP.', S: 'Same nodal mechanism as verapamil; somewhat less negative inotropy and more vasodilation (S).' },
      phase: 'Nodal phase 0 & 4', cv: '↓ in AV node only', apd: '↔', erp: '↑ AV-nodal ERP', ecg: 'PR prolongation; slower ventricular rate in AF',
      uses: ['AF rate control (L)'], adverse: ['Bradycardia (L)', 'AV block (L)', 'Hypotension (L)'], prec: ['Same class precautions as verapamil; caution in reduced ejection fraction (negative inotropy) (S)'],
      clinical: 'Listed with verapamil in the lecture table (“Verapamil / Diltiazem”).', fx: { gCa: 0.9, nCa: 0.6 } },
    adenosine: { name: 'Adenosine', cls: 'Misc', group: 'M', label: 'Miscellaneous — A1-receptor agonist',
      target: 'A1 adenosine receptor (G_i) → opens K⁺ channels and inhibits Ca²⁺ channels (L)', receptor: 'GPCR (A1)',
      mech: { L: 'A1 receptor agonist → opens K⁺ channels and inhibits Ca²⁺ channels → transient AV nodal block.', S: 'I_K,Ado (GIRK) hyperpolarises nodal cells; ↓ cAMP reduces I_CaL and I_f. Both actions stop conduction through the Ca²⁺-dependent AV node for a few seconds, interrupting any re-entry circuit that uses it.' },
      phase: 'Nodal phase 4 (hyperpolarised, flatter) & nodal phase 0', cv: 'Transient AV-nodal block', apd: '—', erp: '↑↑ AV node (seconds)', ecg: 'Transient sinus slowing & AV block (often brief asystole), then recovery within ~10–20 s',
      uses: ['Acute termination of PSVT (L)'], adverse: ['Flushing (L)', 'Chest discomfort (L)', 'Dyspnea (L)', 'Bronchospasm (L)'], prec: ['Avoid in asthma (L)', 'Avoid in pre-excited AF associated with WPW (L)', 'Half-life 8–10 seconds; rapid IV push (L)'],
      acute: 'The simulator shows the PEAK of a transient effect lasting only seconds (t½ < 10 s), not a steady state (S).',
      clinical: 'Rapid push followed by a saline flush is needed because the drug is cleared by red cells and endothelium within seconds (S).', fx: { nK: 2.5, nCa: 0.7 } },
    digoxin: { name: 'Digoxin', cls: 'Misc', group: 'M', label: 'Miscellaneous — cardiac glycoside',
      target: 'Na⁺/K⁺-ATPase (inhibition) + central vagal stimulation (L)', receptor: 'Ion pump',
      mech: { L: 'Inhibits Na⁺/K⁺-ATPase and ↑ vagal tone → slows AV conduction.', S: 'Pump inhibition → ↑ intracellular Na⁺ → less Ca²⁺ extrusion by Na⁺/Ca²⁺ exchanger → ↑ intracellular Ca²⁺ (positive inotropy). Vagal (ACh) effect prolongs AV-nodal refractoriness.' },
      phase: 'AV-nodal phase 4/0 (vagal); myocardial Ca²⁺ handling → delayed after-depolarisations (DADs) in toxicity', cv: '↓ AV node', apd: '↔ / slight ↓', erp: '↑ AV-nodal ERP', ecg: 'Slower ventricular response in AF; PR ↑; “scooped” ST depression (digoxin effect, S)',
      uses: ['AF rate control, particularly in patients with HF (L)'], adverse: ['Neurological symptoms (L)', 'Arrhythmias (L)', 'Nausea and visual disturbances (Q23)'], prec: ['Severe toxicity → digoxin immune Fab (L)', 'Hypokalaemia increases the risk of toxicity (Q23)'],
      clinical: 'K⁺ and digoxin compete for the same pump binding site, so hypokalaemia ↑ digoxin binding and toxicity (S). Narrow therapeutic index; renally cleared; amiodarone ↑ levels (S). Rate control relies on vagal tone, so it is weaker during exercise (S).',
      fx: { vagal: 1.5 } },
    atropine: { name: 'Atropine', cls: 'Misc', group: 'M', label: 'Miscellaneous — muscarinic antagonist',
      target: 'M2 muscarinic receptor (antagonist) (L)', receptor: 'GPCR (M2)',
      mech: { L: 'Muscarinic receptor antagonist → increases SA node activity and HR.', S: 'Removes vagal (ACh) tone: closes I_K,ACh, steepens phase 4 and speeds AV-nodal conduction.' },
      phase: 'Nodal phase 4 ↑ slope; AV-nodal conduction ↑', cv: '↑ AV node', apd: '—', erp: '↓ AV-nodal ERP', ecg: '↑ heart rate; shorter PR',
      uses: ['Acute symptomatic sinus bradycardia (L)', 'Acute symptomatic AV block (IV) (L)', '2025 AHA ACLS dose: 1 mg IV, repeated every 3–5 min to a maximum of 3 mg (S)'], adverse: ['Tachycardia (L)', 'Dry mouth (L)', 'Urinary retention (L)'], prec: ['Use cautiously in ischaemic heart disease and tachyarrhythmias (L)'],
      clinical: 'Works only where vagal tone acts — SA and AV nodes; little effect on infranodal block (S).', fx: { vagal: 0.4 } },
    magnesium: { name: 'Magnesium sulfate', cls: 'Misc', group: 'M', label: 'Miscellaneous — electrolyte / membrane stabiliser',
      target: 'Modulates cardiac ion channels (L) — notably L-type Ca²⁺ channels (S)', receptor: 'Ion channels',
      mech: { L: 'Modulates cardiac ion channels and stabilizes electrical activity → suppresses abnormal ventricular electrical activity.', S: 'Reduces L-type Ca²⁺ reactivation during a prolonged plateau, suppressing early after-depolarisations — the trigger of torsades — even when serum Mg²⁺ is normal; it does not markedly shorten QT.' },
      phase: 'Phases 2–3 (suppresses EADs)', cv: '—', apd: '↔', erp: '↔', ecg: 'Suppression of torsades/EAD-triggered beats (QT itself changes little)',
      uses: ['Torsades de pointes (L)'], adverse: ['Hypotension and respiratory depression with excessive doses (L)'], prec: ['Monitor magnesium levels and renal function (L)'],
      clinical: 'Renally excreted (S) → accumulation in renal impairment causes toxicity (loss of reflexes, respiratory depression).', fx: {} }
  };
  K.drugOrder = ['procainamide', 'lidocaine', 'flecainide', 'metoprolol', 'amiodarone', 'sotalol', 'verapamil', 'diltiazem', 'adenosine', 'digoxin', 'atropine', 'magnesium'];

  K.classes = [
    { c: 'I', name: 'Class I: Na⁺ channel blockers', sub: [
      { c: 'IA', s: 'Moderate', a: '↓ conduction velocity and ↑ action potential duration and ERP.', d: ['procainamide'] },
      { c: 'IB', s: 'Weak', a: '↓ APD and ERP.', d: ['lidocaine'] },
      { c: 'IC', s: 'Strong', a: '↓ conduction velocity with minimal effect on APD and ERP.', d: ['flecainide'] }],
      why: 'Phase 0 in fast tissue is driven by Na⁺ influx. Blocking it lowers dV/dt max → slower conduction (wider QRS). The strength of block and the drug’s binding kinetics decide how much conduction slows; IA’s additional K⁺ block lengthens the AP, IB’s late-Na⁺ block shortens it (S).' },
    { c: 'II', name: 'Class II: β-blockers', a: '↓ sympathetic stimulation, inhibit phase 4 depolarization and slow AV conduction.', d: ['metoprolol', 'sotalol'], why: 'Sympathetic tone (via cAMP) steepens nodal phase 4 and speeds AV-nodal conduction; blocking it does the reverse (S).' },
    { c: 'III', name: 'Class III: K⁺ channel blockers', a: 'Prolong phase 3 repolarization, ↑APD and ERP.', d: ['amiodarone', 'sotalol'], why: 'Longer ERP means a re-entering wavefront meets refractory tissue → re-entry stops; the cost is QT prolongation and torsades risk (S).' },
    { c: 'IV', name: 'Class IV: Ca²⁺ channel blockers', a: '↓ SA node activity and slow AV conduction, increasing AV nodal ERP.', d: ['verapamil', 'diltiazem'], why: 'Nodal phase 0 depends on L-type Ca²⁺ current, so these drugs act mainly on the SA and AV nodes — not on fast-response ventricular tissue (S).' }
  ];
  K.principles = ['Automaticity', 'Conduction velocity', 'Refractory period (ERP)', 'Membrane responsiveness'];
  K.principlesWhy = {
    'Automaticity': 'Rate of spontaneous phase-4 depolarisation (β-blockers, Ca²⁺ blockers, adenosine ↓; atropine ↑).',
    'Conduction velocity': 'Set by phase-0 upstroke: Na⁺ current in fast tissue (class I), Ca²⁺ current in nodes (class IV).',
    'Refractory period (ERP)': 'Time during which a new impulse cannot propagate; ↑ by class IA and III (fast tissue) and class II/IV (AV node).',
    'Membrane responsiveness': 'Relationship between the membrane potential at stimulation and the resulting phase-0 dV/dt; Na⁺ blockers shift it so that fewer channels open (S).'
  };

  /* ------------------------ NON-PHARMACOLOGICAL ------------------------ */
  K.nonpharm = [
    { n: 'DC cardioversion', tag: 'Synchronized', p: 'Terminates unstable tachyarrhythmias', s: 'The shock is timed to the R wave to avoid delivering it during the vulnerable period of the T wave (which could induce VF). Used in AF, PSVT, VT with a pulse when unstable (S).' },
    { n: 'Defibrillation', tag: 'Unsynchronized', p: 'Terminates VF or pulseless VT (cardiac arrest)', s: 'No organised QRS exists to synchronise to; the shock depolarises the whole myocardium simultaneously so the SA node can regain control (S).' },
    { n: 'Catheter ablation', tag: 'Radiofrequency (hot) / Cryoablation (cold)', p: 'Destroys abnormal electrical tissue', s: 'Curative for re-entry with a discrete critical limb: accessory pathways (WPW), AV-nodal slow pathway (AVNRT), pulmonary-vein isolation in AF (S).' },
    { n: 'Permanent pacemaker (PPM)', tag: 'Bradycardia device', p: 'Maintains adequate heart rate in bradycardia', s: 'Indicated in Mobitz II and 3rd-degree block not due to a reversible cause (lecture p. 53) and in symptomatic sinus node dysfunction (S).' },
    { n: 'Cardiac resynchronization therapy (CRT)', tag: 'Biventricular pacing', p: 'Resynchronizes ventricular contraction in ventricular dyssynchrony', s: 'Paces both ventricles in HFrEF with wide QRS (e.g., LBBB) to restore coordinated contraction (S).' },
    { n: 'Implantable cardioverter-defibrillator (ICD)', tag: 'Implanted device', p: 'Detects and terminates life-threatening ventricular arrhythmias', s: 'By anti-tachycardia pacing or shock; used for secondary prevention after VT/VF and primary prevention in high-risk patients (S).' }
  ];

  K.refs = [
    'Lecture: Pharmacotherapy of Cardiovascular Diseases (PP 907), Clinical Pharmacy Pharm D 2026–2027, level 5 — “Arrythmia”, pp. 47–59 (primary source).',
    'Hall JE, Hall ME. Guyton and Hall Textbook of Medical Physiology, 14th ed. Elsevier; 2021 — ch. 10 (rhythmical excitation), ch. 11–13 (ECG).',
    'Katzung BG, Vanderah TW. Basic & Clinical Pharmacology, 15th ed. McGraw-Hill; 2021 — ch. 14 (antiarrhythmic drugs).',
    'Libby P, et al. Braunwald’s Heart Disease, 12th ed. Elsevier; 2022 — arrhythmia mechanisms and management chapters.',
    'Van Gelder IC, et al. 2024 ESC Guidelines for the management of atrial fibrillation. Eur Heart J. 2024;45:3314–3414.',
    'Joglar JA, et al. 2023 ACC/AHA/ACCP/HRS Guideline for the diagnosis and management of atrial fibrillation. Circulation. 2024;149:e1–e156.',
    'Page RL, et al. 2015 ACC/AHA/HRS Guideline for the management of adult patients with supraventricular tachycardia. Circulation. 2016;133:e506–e574.',
    'Kusumoto FM, et al. 2018 ACC/AHA/HRS Guideline on the evaluation and management of patients with bradycardia and cardiac conduction delay. Circulation. 2019;140:e382–e482.',
    'Zeppenfeld K, et al. 2022 ESC Guidelines for ventricular arrhythmias and the prevention of sudden cardiac death. Eur Heart J. 2022;43:3997–4126.',
    'O’Hara T, Virág L, Varró A, Rudy Y. Simulation of the undiseased human cardiac ventricular action potential. PLoS Comput Biol. 2011;7(5):e1002061. doi:10.1371/journal.pcbi.1002061',
    'Shaw RM, Rudy Y. Ionic mechanisms of propagation in cardiac tissue. Circ Res. 1997;81:727–741. doi:10.1161/01.RES.81.5.727',
    'Yang T, Roden DM. Extracellular potassium modulation of drug block of I_Kr. Circulation. 1996;93:407–411. doi:10.1161/01.CIR.93.3.407',
    'Tzivoni D, et al. Treatment of torsade de pointes with magnesium sulfate. Circulation. 1988;77:392–397. doi:10.1161/01.CIR.77.2.392',
    'Hohnloser SH, et al. Amiodarone-associated proarrhythmic effects. Ann Intern Med. 1994;121:529–535. doi:10.7326/0003-4819-121-7-199410010-00009',
    'Wellens HJJ, et al. Use of procainamide in patients with the Wolff–Parkinson–White syndrome to disclose a short refractory period of the accessory pathway. Am J Cardiol. 1982;50:1087–1089.',
    'Benditt DG, et al. Differential effects of intravenous procainamide on anterograde and retrograde accessory pathway refractoriness. J Am Coll Cardiol. 1992. doi:10.1016/0735-1097(92)90061-Q',
    'Hondeghem LM, Katzung BG. Time- and voltage-dependent interactions of antiarrhythmic drugs with cardiac sodium channels. Biochim Biophys Acta. 1977;472:373–398.',
    'Brugada J, et al. 2019 ESC Guidelines for the management of patients with supraventricular tachycardia. Eur Heart J. 2020;41:655–720.',
    'Part 9: Adult Advanced Life Support — 2025 American Heart Association Guidelines for CPR and ECC. Circulation. 2025;152(suppl 2):S538–S577.',
    'Echt DS, et al. Mortality and morbidity in patients receiving encainide, flecainide, or placebo: the Cardiac Arrhythmia Suppression Trial (CAST). N Engl J Med. 1991;324:781–788.'
  ];
})();
