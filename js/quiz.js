/* CVS-Pharmacy-MNU — © 2026 Khaled Osama Yaseen. All rights reserved.
 * Faculty of Pharmacy, Mansoura National University. Proprietary — not licensed
 * for reuse, copying, modification, or redistribution. See LICENSE. */
/* =====================================================================
   quiz.js — Lecture cases/questions (Q1–Q27, verbatim), supplementary
   practice bank, management decision trees, and the quiz engine.
   ===================================================================== */
(function () {
  const K = window.K;
  K.cases = {
    1: { t: 'Case 1', stem: 'A 68-year-old man presents with intermittent palpitations and fatigue. His pulse is irregular, and the ECG strip shows an irregularly irregular rhythm with no distinct P waves. He has a history of heart failure and is not currently receiving anticoagulation.', ecg: 'af' },
    2: { t: 'Case 2', stem: 'A 24-year-old woman presents to the emergency department with sudden-onset palpitations. Her heart rate is 190 beats/min. Blood pressure is 118/76 mmHg. The ECG shows a regular narrow-complex tachycardia. She is conscious and hemodynamically stable.', ecg: 'psvt' },
    3: { t: 'Case 3', stem: 'A 59-year-old man with a previous myocardial infarction presents with palpitations and dizziness. His ECG shows a regular wide-complex tachycardia at 180 beats/min. He remains conscious, with a blood pressure of 112/70 mmHg.', ecg: 'vt' },
    4: { t: 'Case 4', stem: 'A 45-year-old woman presents with syncope. Her ECG shows polymorphic ventricular tachycardia with a twisting appearance around the baseline. The QT interval is markedly prolonged.', ecg: 'tdp' },
    5: { t: 'Case 5', stem: 'A 72-year-old man presents with dizziness and near-syncope. His ECG shows intermittent non-conducted P waves. The PR intervals of conducted beats remain constant.', ecg: 'mobitz2' },
    0: { t: 'Questions', stem: 'General questions (lecture p. 58–59).' }
  };
  const Q = (id, cs, stem, opts, ans, why, dis, topic, link) => ({ id, cs, stem, opts, ans, why, dis, topic, link });
  K.questions = [
    Q('Q1', 1, 'Which rhythm best explains the ECG findings?', ['Atrial fibrillation', 'PSVT', 'Mobitz II block', 'Ventricular tachycardia'], 0,
      'An irregularly irregular rhythm with no distinct P waves is the lecture’s defining clue for AF: chaotic atrial activity replaces P waves, and the AV node conducts impulses at irregular intervals.',
      { 1: 'PSVT is a REGULAR narrow-complex tachycardia.', 2: 'Mobitz II shows P waves with constant PR and intermittently dropped QRS — P waves are present.', 3: 'VT is a regular wide-complex tachycardia.' }, 'ECG recognition', ['ecg', 'af']),
    Q('Q2', 1, 'Which medication is an appropriate option for ventricular rate control in this patient with heart failure?', ['Flecainide', 'Digoxin', 'Adenosine', 'Lidocaine'], 1,
      'The lecture lists “rate control with β-blocker, diltiazem/verapamil, or digoxin with HF”. Digoxin slows AV-nodal conduction (↑ vagal tone) without negative inotropy — it even increases contractility.',
      { 0: 'Flecainide is a rhythm-control drug and is contraindicated in significant structural heart disease.', 2: 'Adenosine causes only seconds of AV block (t½ 8–10 s) — used to terminate PSVT, not for sustained rate control.', 3: 'Lidocaine is for ventricular arrhythmias (especially post-MI); it has no AV-nodal effect.' }, 'AF management', ['drugecg', 'af']),
    Q('Q3', 1, 'The team decides to initiate anticoagulation. Which drug is preferred over warfarin according to the section?', ['Procainamide', 'Amiodarone', 'Apixaban', 'Atropine'], 2,
      'Lecture: “Assess the need for stroke prevention (Direct Oral Anticoagulants): Apixaban are generally preferred over Warfarin.”',
      { 0: 'Procainamide is a class IA antiarrhythmic, not an anticoagulant.', 1: 'Amiodarone is an antiarrhythmic — and it actually interacts with warfarin.', 3: 'Atropine treats symptomatic bradycardia.' }, 'AF management', ['management', 'af']),
    Q('Q4', 1, 'Which electrophysiological effect explains digoxin’s ability to slow ventricular rate in AF?', ['Increased AV nodal conduction', 'Shortening of AV nodal refractory period', 'Increased sympathetic stimulation', 'Increased vagal tone with slowed AV nodal conduction'], 3,
      'Digoxin ↑ vagal tone → ACh prolongs AV-nodal refractoriness and slows conduction, so fewer fibrillatory impulses reach the ventricles (lecture: “Inhibits Na⁺/K⁺-ATPase and ↑ vagal tone… slows AV conduction”).',
      { 0: 'Faster AV conduction would INCREASE the ventricular rate.', 1: 'A shorter AV-nodal ERP would let more impulses through → faster rate.', 2: 'Sympathetic stimulation speeds the AV node — opposite effect.' }, 'Drug mechanism', ['misc', 'digoxin']),
    Q('Q5', 2, 'Which is the most appropriate initial intervention?', ['Immediate unsynchronized defibrillation', 'IV magnesium sulfate', 'Vagal maneuvers', 'Permanent pacemaker'], 2,
      'A stable regular narrow-complex tachycardia = PSVT. Lecture: “If stable: vagal maneuvers.” Increased vagal tone slows/blocks the AV node, interrupting a re-entry circuit that uses it.',
      { 0: 'Unsynchronized defibrillation is for VF/pulseless VT (cardiac arrest).', 1: 'IV magnesium is for torsades de pointes.', 3: 'A pacemaker treats bradycardia, not tachycardia.' }, 'PSVT management', ['management', 'psvt']),
    Q('Q6', 2, 'The tachycardia persists despite the initial intervention. Which drug should be administered?', ['Adenosine', 'Lidocaine', 'Atropine', 'Digoxin immune Fab'], 0,
      'Lecture: if vagal manoeuvres fail → adenosine (acute termination of PSVT), then cardioversion.',
      { 1: 'Lidocaine targets ventricular arrhythmias.', 2: 'Atropine would remove vagal tone and speed AV conduction — counter-productive.', 3: 'Digoxin immune Fab is the antidote for severe digoxin toxicity.' }, 'PSVT management', ['misc', 'adenosine']),
    Q('Q7', 2, 'Which action is primarily responsible for this drug effect on the AV node?', ['Blocking fast sodium channels', 'Inhibiting calcium channels', 'Blocking potassium channels', 'Increasing phase 4 depolarization'], 1,
      'Adenosine (A1 agonist) “opens K⁺ channels and inhibits Ca²⁺ channels”. AV-nodal phase 0 is Ca²⁺-dependent, so inhibiting Ca²⁺ current blocks nodal conduction. (Opening K⁺ channels also contributes by hyperpolarising the cell — but the option offered is “blocking”, which is the opposite.)',
      { 0: 'The AV node has no functional fast Na⁺ current; its upstroke is Ca²⁺-mediated.', 2: 'Adenosine OPENS K⁺ channels; it does not block them.', 3: 'Increasing phase-4 depolarisation would increase automaticity, not block conduction.' }, 'Drug mechanism', ['misc', 'adenosine']),
    Q('Q8', 3, 'Which diagnosis best fits the ECG and clinical presentation?', ['Ventricular tachycardia', 'Atrial fibrillation', 'PSVT', 'First-degree AV block'], 0,
      'Regular wide-complex tachycardia (> 100 bpm) in a patient with previous MI and preserved haemodynamics = stable monomorphic VT (scar-related re-entry).',
      { 1: 'AF is irregular (and usually narrow).', 2: 'PSVT is narrow-complex.', 3: '1st-degree AV block is a prolonged PR, not a tachycardia.' }, 'ECG recognition', ['ecg', 'vt']),
    Q('Q9', 3, 'Which treatment is listed for this hemodynamically stable patient?', ['Vagal maneuvers', 'IV amiodarone or procainamide', 'IV atropine', 'Oral apixaban'], 1,
      'Lecture: Stable VT → IV amiodarone or procainamide. Both prolong refractoriness/slow conduction in the re-entry circuit.',
      { 0: 'Vagal manoeuvres act on the AV node — VT originates below it.', 2: 'Atropine treats bradycardia.', 3: 'Apixaban is for stroke prevention in AF.' }, 'VT management', ['management', 'vt']),
    Q('Q10', 3, 'The patient is being considered for flecainide. Which feature makes this choice inappropriate?', ['Previous myocardial infarction', 'Narrow QRS complexes', 'Normal renal function', 'Intermittent palpitations'], 0,
      'Flecainide is contraindicated after MI and in significant structural heart disease (ventricular pro-arrhythmia; CAST trial).',
      { 1: 'QRS width is not the contraindication (and this patient’s QRS is wide).', 2: 'Normal renal function is not a contraindication.', 3: 'Palpitations are a symptom, not a contraindication.' }, 'Drug safety', ['drugap', 'flecainide']),
    Q('Q11', 3, 'Another patient develops ventricular arrhythmia during an acute myocardial infarction. Which drug acts by weak sodium-channel blockade and decreases APD and ERP?', ['Flecainide', 'Procainamide', 'Lidocaine', 'Verapamil'], 2,
      'Lidocaine = class IB: weak Na⁺ block, ↓ APD and ERP; used for acute ventricular arrhythmias especially post-MI.',
      { 0: 'Flecainide (IC) is a STRONG blocker with minimal APD/ERP effect.', 1: 'Procainamide (IA) INCREASES APD and ERP.', 3: 'Verapamil is a Ca²⁺-channel blocker and must never be given IV in VT.' }, 'Drug classification', ['drugap', 'lidocaine']),
    Q('Q12', 4, 'Which rhythm is most likely present?', ['PSVT', 'Atrial fibrillation', 'Mobitz II block', 'Torsades de Pointes'], 3,
      'Polymorphic VT twisting around the baseline with a markedly prolonged QT = torsades de pointes.',
      { 0: 'PSVT is regular and narrow.', 1: 'AF is irregular and narrow, without a twisting pattern.', 2: 'Mobitz II is a bradyarrhythmia with dropped beats.' }, 'ECG recognition', ['ecg', 'tdp']),
    Q('Q13', 4, 'Which treatment should be administered in this type of arrythmia?', ['IV magnesium sulfate', 'IV digoxin', 'Adenosine', 'Verapamil'], 0,
      'Lecture: TdP → IV magnesium sulfate, discontinue QT-prolonging drugs, correct Mg²⁺/K⁺. Mg²⁺ suppresses the early after-depolarisations that trigger TdP.',
      { 1: 'Digoxin is for AF rate control.', 2: 'Adenosine is for PSVT.', 3: 'Verapamil is for AF rate control and must not be used in VT.' }, 'TdP management', ['misc', 'magnesium']),
    Q('Q14', 4, 'Which electrophysiological change can increase the risk of this arrhythmia?', ['Shortening of phase 3 repolarization', 'Prolongation of APD and ERP', 'Increased AV nodal conduction', 'Decreased QT interval'], 1,
      'Prolonged APD (= long QT) gives L-type Ca²⁺ channels time to reactivate → EADs → TdP. This is why class IA/III drugs (which ↑ APD and ERP) carry TdP risk.',
      { 0: 'Shorter phase 3 shortens QT (opposite).', 2: 'AV-nodal conduction is irrelevant to this ventricular mechanism.', 3: 'A shorter QT reduces TdP risk.' }, 'Mechanism', ['ap', 'p3']),
    Q('Q15', 4, 'Which drug has both beta-blocking and potassium-channel-blocking actions and requires renal dose adjustment?', ['Lidocaine', 'Flecainide', 'Sotalol', 'Adenosine'], 2,
      'Sotalol = class II + III; renal dose adjustment (eliminated unchanged by the kidney); causes QT prolongation and bradycardia.',
      { 0: 'Lidocaine is IB (hepatic clearance).', 1: 'Flecainide is IC.', 3: 'Adenosine is an A1 agonist with an 8–10 s half-life.' }, 'Drug classification', ['drugap', 'sotalol']),
    Q('Q16', 5, 'Which diagnosis is most consistent with the ECG?', ['First-degree AV block', 'Mobitz I AV block', 'Third-degree AV block', 'Mobitz II AV block'], 3,
      'Constant PR intervals in conducted beats with intermittent non-conducted P waves = Mobitz II.',
      { 0: '1st-degree: every P is conducted (no dropped beats).', 1: 'Mobitz I: PR progressively lengthens before the dropped beat.', 2: '3rd-degree: no P waves conduct (complete AV dissociation).' }, 'AV block', ['brady', 'mobitz2']),
    Q('Q17', 5, 'Why is this condition more concerning than the other one carrying the same name?', ['It always produces atrial fibrillation', 'It may progress to complete heart block', 'It is characterized by progressive PR prolongation', 'It causes irregularly irregular rhythm'], 1,
      'Mobitz II (lecture: “more risk”) is usually infranodal and can suddenly progress to complete (3rd-degree) heart block — hence the pacemaker indication.',
      { 0: 'AV block does not cause AF.', 2: 'Progressive PR prolongation describes Mobitz I.', 3: 'Irregularly irregular rhythm describes AF.' }, 'AV block', ['brady', 'mobitz2']),
    Q('Q18', 5, 'If no reversible cause is identified, which long-term intervention is generally indicated?', ['Adenosine', 'Digoxin', 'Permanent pacemaker', 'Verapamil'], 2,
      'Lecture: long-term permanent pacemaker is indicated if not due to a reversible cause (Mobitz II – 3rd degree).',
      { 0: 'Adenosine would cause further AV block.', 1: 'Digoxin slows AV conduction — harmful here.', 3: 'Verapamil slows AV conduction — harmful here.' }, 'AV block', ['management', 'avb']),
    Q('Q19', 5, 'A different patient presents with an ECG showing complete AV dissociation. Which diagnosis is most likely?', ['Third-degree AV block', 'First-degree AV block', 'Mobitz I AV block', 'Sinus tachycardia'], 0,
      'Complete AV dissociation (P waves and QRS complexes independent) with severe bradycardia = 3rd-degree (complete) heart block.',
      { 1: '1st-degree: all P conducted with long PR.', 2: 'Mobitz I: some P waves conducted with progressive PR.', 3: 'Sinus tachycardia: fast, normal conduction.' }, 'AV block', ['brady', 'avb3']),
    Q('Q20', 0, 'Which factor should be assessed first as a possible cause in patients with bradycardia?', ['Excessive AV nodal blocking therapy', 'Sodium-channel activation', 'Increased sympathetic stimulation', 'Potassium-channel activation'], 0,
      'Lecture: identify and treat the cause; review rate-slowing medications such as β-blockers, verapamil, diltiazem and digoxin.',
      { 1: 'Na⁺-channel activation is not a recognised cause of bradycardia here.', 2: 'Sympathetic stimulation causes tachycardia.', 3: 'Not the first cause to assess in this lecture.' }, 'Bradycardia', ['brady', 'brady']),
    Q('Q21', 0, 'Which drug may be used initially in acute symptomatic bradycardia?', ['Flecainide', 'Procainamide', 'Amiodarone', 'Atropine'], 3,
      'Atropine (muscarinic antagonist) removes vagal tone → ↑ SA-node activity and HR.',
      { 0: 'Flecainide slows conduction.', 1: 'Procainamide slows conduction, causes hypotension.', 2: 'Amiodarone causes bradycardia.' }, 'Bradycardia', ['misc', 'atropine']),
    Q('Q22', 0, 'Which antiarrhythmic is the preferred initial option for stable AF associated with WPW?', ['Verapamil', 'Procainamide', 'Digoxin', 'Diltiazem'], 1,
      'Lecture: procainamide is the preferred initial drug in stable pre-excited AF with WPW — it prolongs refractoriness of the Na⁺-dependent accessory pathway.',
      { 0: 'Verapamil blocks only the AV node → can favour conduction down the accessory pathway (S).', 2: 'Digoxin: AV-nodal blocker — same risk (S).', 3: 'Diltiazem: AV-nodal blocker — same risk (S).' }, 'WPW', ['drugecg', 'preaf']),
    Q('Q23', 0, 'A patient taking digoxin develops nausea, visual disturbances, and arrhythmia. Which factor increases the risk of digoxin toxicity?', ['Hyperkalemia', 'Hypokalemia', 'Increased renal clearance', 'Increased magnesium level'], 1,
      'Low K⁺ increases digoxin binding to Na⁺/K⁺-ATPase (K⁺ normally competes for the site) → toxicity.',
      { 0: 'High K⁺ reduces digoxin binding (though severe toxicity itself causes hyperkalaemia).', 2: 'Increased clearance lowers digoxin levels.', 3: 'Hypomagnesaemia (not high Mg²⁺) predisposes to toxicity.' }, 'Digoxin', ['misc', 'digoxin']),
    Q('Q24', 0, 'Which treatment is indicated in severe digoxin toxicity?', ['Digoxin immune Fab', 'Adenosine', 'Atropine as a specific antidote', 'Procainamide'], 0,
      'Lecture: severe toxicity → digoxin immune Fab (antibody fragments bind and neutralise digoxin).',
      { 1: 'Adenosine is for PSVT.', 2: 'Atropine may treat bradycardia symptomatically but is not a specific antidote.', 3: 'Procainamide is not used for digoxin toxicity.' }, 'Digoxin', ['misc', 'digoxin']),
    Q('Q25', 0, 'A patient receiving an antiarrhythmic drug develops a lupus-like syndrome after prolonged treatment. Which drug is most likely responsible?', ['Lidocaine', 'Procainamide', 'Adenosine', 'Verapamil'], 1,
      'Drug-induced SLE is a listed adverse effect of procainamide.',
      { 0: 'Lidocaine: neurological toxicity.', 2: 'Adenosine: flushing, chest discomfort, dyspnoea, bronchospasm.', 3: 'Verapamil: bradycardia, AV block, hypotension.' }, 'Adverse effects', ['drugap', 'procainamide']),
    Q('Q26', 0, 'Which drug produces marked slowing of phase 0 depolarization with minimal effects on APD and ERP?', ['Flecainide', 'Lidocaine', 'Procainamide', 'Metoprolol'], 0,
      'Flecainide = class IC (strong Na⁺ block): ↓ conduction velocity with minimal effect on APD and ERP.',
      { 1: 'Lidocaine (IB) is weak and ↓ APD/ERP.', 2: 'Procainamide (IA) ↑ APD and ERP.', 3: 'Metoprolol acts on nodal phase 4, not phase 0 of fast tissue.' }, 'Drug classification', ['drugap', 'flecainide']),
    Q('Q27', 0, 'A patient with reduced ejection fraction is prescribed verapamil for rate control. Which property makes this drug potentially unsuitable?', ['It increases sympathetic stimulation', 'It increases ventricular automaticity', 'It has negative inotropic effects', 'It markedly increases phase 4 depolarization'], 2,
      'Verapamil reduces Ca²⁺ entry during the plateau → weaker contraction (negative inotropy), which can worsen HFrEF.',
      { 0: 'It does not increase sympathetic activity (reflex activation is a vasodilator effect, not the reason).', 1: 'It does not increase automaticity.', 3: 'It decreases, not increases, nodal phase-4 activity.' }, 'Drug safety', ['drugap', 'verapamil'])
  ];

  /* Supplementary practice bank — NOT from the lecture */
  const P = (sec, stem, opts, ans, why) => ({ sec, stem, opts, ans, why, supp: true });
  K.practice = [
    P('anatomy', 'Why is the AV node normally the only electrical connection between atria and ventricles?', ['The fibrous AV ring insulates the chambers', 'The atria have no Na⁺ channels', 'Purkinje fibres block retrograde conduction', 'The SA node inhibits other pathways'], 0, 'The fibrous skeleton (AV rings) is electrically insulating; only the AV node–His bundle crosses it — unless an accessory pathway (WPW) exists.'),
    P('anatomy', 'Which structure produces the physiological delay that allows ventricular filling?', ['Bundle of His', 'AV node', 'Purkinje fibres', 'Bachmann’s bundle'], 1, 'Slow, Ca²⁺-dependent conduction through the AV node creates the delay seen as the PR segment.'),
    P('ap', 'A drug reduces phase-0 dV/dt in ventricular myocytes. Which ECG change best follows?', ['Shorter PR', 'Wider QRS', 'Taller P wave', 'Faster heart rate'], 1, 'Slower phase 0 → slower conduction → longer ventricular activation time → wider QRS.'),
    P('ap', 'In an SA-node cell, which change slows the heart rate?', ['Steeper phase-4 slope', 'Less negative maximum diastolic potential', 'Flatter phase-4 slope', 'Lower threshold'], 2, 'A flatter phase 4 takes longer to reach threshold → longer cycle length.'),
    P('mechanisms', 'In the re-entry simulator, which change is most likely to TERMINATE a circuit?', ['Shorter ERP', 'Longer ERP, so that it exceeds the time the impulse takes to travel round the circuit', 'Faster recovery of the blocked pathway', 'More ectopic beats'], 1, 'Re-entry needs the circulating wavefront to keep finding excitable tissue. Prolonging ERP (class III/IA) beyond the circuit time closes the excitable gap.'),
    P('mechanisms', 'Hypokalaemia and catecholamines can make a ventricular myocyte fire spontaneously. Which mechanism is this?', ['Re-entry', 'Abnormal automaticity', 'Decremental conduction', 'Pre-excitation'], 1, 'Acquiring a phase-4 slope outside the SA node = abnormal automaticity (ectopic pacemaker).'),
    P('ecg', 'Which interval is the best surface marker of ventricular action-potential duration?', ['PR', 'QRS', 'QT', 'RR'], 2, 'QT spans ventricular depolarisation and repolarisation ≈ APD.'),
    P('ecg', 'A regular rhythm at 40 bpm with P waves at 80 bpm marching through unrelated wide QRS complexes is:', ['Mobitz I', 'Sinus bradycardia', '3rd-degree AV block', 'Mobitz II'], 2, 'P and QRS independent = AV dissociation; slow wide escape = complete heart block.'),
    P('classes', 'Which class acts mainly on the SA and AV nodes rather than on ventricular myocytes?', ['Class IB', 'Class IC', 'Class IV', 'Class III'], 2, 'Nodal phase 0 is Ca²⁺-dependent, so L-type Ca²⁺ blockers act mainly on nodal tissue.'),
    P('classes', 'Sotalol appears in two Vaughan Williams classes. Which?', ['I and III', 'II and III', 'II and IV', 'III and IV'], 1, 'β-blocking (II) + K⁺-channel blocking (III).'),
    P('drugap', 'Which drug would you expect to shorten the Purkinje-fibre APD?', ['Procainamide', 'Lidocaine', 'Sotalol', 'Amiodarone'], 1, 'Lidocaine (IB) blocks late Na⁺ current → shorter plateau.'),
    P('drugap', 'In the simulator, why does verapamil hardly change the ventricular AP but markedly slow the AV node?', ['Ventricular phase 0 is Na⁺-dependent; nodal phase 0 is Ca²⁺-dependent', 'Verapamil is not absorbed by ventricles', 'Ventricles lack K⁺ channels', 'It only acts during exercise'], 0, 'Different tissues depend on different currents for their upstroke.'),
    P('drugecg', 'Which pair is most likely to produce additive PR prolongation and AV block?', ['Lidocaine + magnesium', 'Metoprolol + verapamil', 'Atropine + adenosine', 'Flecainide + lidocaine'], 1, 'Both depress AV-nodal conduction (cAMP ↓ and Ca²⁺-channel block).'),
    P('drugecg', 'Which drug produces the greatest QRS widening at therapeutic levels?', ['Flecainide', 'Metoprolol', 'Digoxin', 'Diltiazem'], 0, 'Strong Na⁺ block (IC) → marked conduction slowing → QRS widening.'),
    P('misc', 'Why must adenosine be given as a rapid IV push followed by a flush?', ['It is irritant', 'Its half-life is only 8–10 s', 'It is inactive orally', 'To avoid bronchospasm'], 1, 'It is cleared within seconds; a slow injection never reaches the heart in an effective concentration.'),
    P('misc', 'Magnesium is effective in torsades even when serum Mg²⁺ is normal mainly because it:', ['Markedly shortens QT', 'Suppresses early after-depolarisations', 'Blocks the AV node', 'Increases heart rate'], 1, 'It limits L-type Ca²⁺ reactivation that drives EADs.'),
    P('management', 'A patient in AF with WPW is stable with very fast, wide, irregular complexes. Which drug class must be avoided?', ['Class IA', 'AV-nodal blockers (adenosine, verapamil, digoxin)', 'Anticoagulants', 'Oxygen'], 1, 'Blocking the AV node can favour conduction down the accessory pathway (S); lecture: avoid adenosine in pre-excited AF.'),
    P('management', 'A patient with VT becomes hypotensive and confused but still has a pulse. Next step?', ['IV verapamil', 'Synchronized DC cardioversion', 'Vagal manoeuvres', 'Permanent pacemaker'], 1, 'Unstable tachyarrhythmia with a pulse → synchronized cardioversion (lecture non-pharmacological card).'),
    P('brady', 'Why is atropine less effective in infranodal (Mobitz II/3rd-degree, wide escape) block?', ['It only works orally', 'Vagal innervation acts on SA/AV nodes, not His–Purkinje', 'It blocks Na⁺ channels', 'It shortens QT'], 1, 'Atropine reverses vagal tone, which influences nodal, not infranodal, tissue.'),
    P('brady', 'In Mobitz I, the RR interval containing the dropped beat is…', ['Exactly 2 × PP', 'Less than 2 × PP', 'More than 2 × PP', 'Unchanged'], 1, 'The pause equals 2 × PP minus the PR increment — a classic Wenckebach clue (contrast Mobitz II: pause = 2 × PP).')
  ];

  /* ------------------------ MANAGEMENT DECISION TREES ------------------------ */
  // node: {q, o:[[label, nextId]]} | leaf: {a:[actions], why, mech, src}
  K.trees = {
    af: { t: 'Atrial fibrillation', root: 'a0', n: {
      a0: { q: 'Irregular rhythm, no organised P waves. Is the patient haemodynamically stable?', o: [['Unstable (hypotension, shock, ischaemia, acute HF)', 'aU'], ['Stable', 'a1']] },
      aU: { a: ['Synchronized DC cardioversion'], why: 'Lecture card: DC cardioversion (synchronized) terminates unstable tachyarrhythmias.', mech: 'Simultaneous depolarisation of all atrial tissue extinguishes the re-entrant wavelets; synchronisation to the R wave avoids shocking on the T wave.', src: 'L + S' },
      a1: { q: 'Address all three goals. Which one do you want to explore?', o: [['Rate control', 'r0'], ['Rhythm control', 'h0'], ['Stroke prevention', 's0']] },
      r0: { q: 'Is there pre-excitation (WPW) or heart failure?', o: [['Heart failure (reduced EF)', 'rHF'], ['No HF, no pre-excitation', 'rN'], ['Pre-excited AF (WPW)', 'rW']] },
      rHF: { a: ['Digoxin (lecture: “digoxin with HF”)', 'β-blocker if not in acute decompensated HF', 'Avoid verapamil/diltiazem in reduced EF (Q27)'], why: 'Digoxin slows AV conduction without negative inotropy. Verapamil has negative inotropic effects; β-blockers must be avoided in ADHF (lecture).', mech: 'Digoxin ↑ vagal tone → ↑ AV-nodal ERP → fewer conducted impulses.', src: 'L' },
      rN: { a: ['β-blocker (metoprolol)', 'or diltiazem / verapamil'], why: 'Lecture: rate control with β-blocker, diltiazem/verapamil, or digoxin with HF.', mech: '↓ cAMP or L-type Ca²⁺ block → ↑ AV-nodal ERP → slower ventricular response. Try it in the Drug → ECG simulator (AF baseline).', src: 'L' },
      rW: { a: ['Stable: procainamide — the lecture’s preferred initial drug', 'IV ibutilide is an equally recommended option (2023 ACC/AHA, Class I C-LD) (S)', 'Avoid adenosine (L); avoid all AV-nodal blockers — verapamil, diltiazem, digoxin, β-blockers (S)', 'Avoid amiodarone here: delayed action in pre-excited AF (2024 ESC) (S)', 'Unstable: synchronized cardioversion'], why: 'Lecture: procainamide is the preferred initial drug in stable pre-excited AF with WPW; avoid adenosine in pre-excited AF. Current guidelines add ibutilide and warn against amiodarone.', mech: 'The accessory pathway is Na⁺-dependent: procainamide prolongs its ERP — though how much depends on the pathway’s own baseline refractoriness. Pure AV-nodal blockers leave the pathway untouched and may favour conduction down it → very rapid pre-excited rates → VF (S).', src: 'L + S' },
      h0: { q: 'Rhythm control: is there prior MI or significant structural heart disease?', o: [['Yes', 'hS'], ['No (selected patients)', 'hN']] },
      hS: { a: ['Amiodarone (atrial and ventricular arrhythmias)', 'or cardioversion', 'Avoid flecainide'], why: 'Flecainide is contraindicated after MI and in significant structural heart disease (lecture).', mech: 'Amiodarone prolongs phase 3 → ↑ ERP terminates and prevents re-entry; flecainide’s conduction slowing in scar promotes pro-arrhythmia.', src: 'L' },
      hN: { a: ['Flecainide (AF rhythm control in selected patients)', 'or sotalol (renal dose adjustment; QT)', 'or cardioversion'], why: 'Lecture lists flecainide for AF rhythm control in selected patients and sotalol for atrial arrhythmias.', mech: 'IC: marked ↓ conduction; III: ↑ ERP — both destabilise re-entrant wavelets.', src: 'L' },
      s0: { a: ['Assess the need for stroke prevention', 'Direct oral anticoagulant: apixaban generally preferred over warfarin'], why: 'Lecture p. 52 and Q3.', mech: 'Atrial stasis (no organised contraction) promotes LA-appendage thrombus. Supplementary: risk scored with CHA₂DS₂-VA (2024 ESC guideline).', src: 'L + S' } } },
    psvt: { t: 'PSVT', root: 'p0', n: {
      p0: { q: 'Regular narrow-QRS tachycardia, sudden onset. Haemodynamically stable?', o: [['Stable', 'p1'], ['Unstable', 'pU']] },
      p1: { a: ['Vagal manoeuvres (e.g., modified Valsalva)'], why: 'Lecture: “If stable: vagal maneuvers.”', mech: '↑ vagal tone → ACh opens I_K,ACh and slows/blocks AV-nodal conduction, breaking the re-entry loop that uses the node.', src: 'L', next: [['Tachycardia persists', 'p2']] },
      p2: { a: ['Adenosine — rapid IV push + flush'], why: 'Lecture: if not → adenosine (acute termination of PSVT). Avoid in asthma.', mech: 'A1 agonism → K⁺ channels open, Ca²⁺ channels inhibited → transient AV-nodal block → circuit interrupted (see Misc agents).', src: 'L', next: [['Still persists', 'p3']] },
      p3: { a: ['Cardioversion (synchronized)'], why: 'Lecture sequence: adenosine – cardioversion.', mech: 'Depolarises the whole circuit at once.', src: 'L' },
      pU: { a: ['Synchronized cardioversion'], why: 'Lecture non-pharmacological card: synchronized DC cardioversion terminates unstable tachyarrhythmias. (See flag on the lecture’s “If not” wording.)', mech: 'Immediate termination of re-entry.', src: 'L + S' } } },
    vt: { t: 'Ventricular tachycardia', root: 'v0', n: {
      v0: { q: 'Wide-complex tachycardia. Is there a pulse?', o: [['No pulse (pulseless VT)', 'vP'], ['Pulse present', 'v1']] },
      vP: { a: ['CPR + immediate unsynchronized defibrillation'], why: 'Lecture: defibrillation (unsynchronized) terminates VF or pulseless VT.', mech: 'Treated as cardiac arrest — see VF pathway.', src: 'L' },
      v1: { q: 'Is the patient haemodynamically stable?', o: [['Stable', 'vS'], ['Unstable', 'vU']] },
      vS: { a: ['IV amiodarone or procainamide (L)', 'Guideline nuance: 2022 ESC rates procainamide IIa and amiodarone IIb for stable monomorphic VT (PROCAMIO trial); 2025 AHA ACLS also lists sotalol (S)', 'Never IV verapamil or diltiazem in wide-complex tachycardia (L/S)', 'Post-MI ventricular arrhythmia: lidocaine is an option (L)', 'Avoid flecainide after MI (L)'], why: 'Lecture p. 52 (stable VT) and drug table.', mech: 'Amiodarone/procainamide prolong refractoriness and slow conduction in the scar circuit; verapamil cannot act on a circuit that does not involve the AV node and causes haemodynamic collapse.', src: 'L' },
      vU: { a: ['Synchronized DC cardioversion'], why: 'Unstable tachyarrhythmia with a pulse (lecture card).', mech: 'Synchronised shock terminates the organised re-entry.', src: 'L + S' } } },
    vf: { t: 'Ventricular fibrillation', root: 'f0', n: {
      f0: { a: ['CPR', 'Immediate unsynchronized defibrillation'], why: 'Lecture: CPR + immediate unsynchronized defibrillation.', mech: 'No organised QRS to synchronise to; the shock depolarises all ventricular tissue simultaneously.', src: 'L', next: [['VF persists after shocks (refractory)', 'f1']] },
      f1: { a: ['Amiodarone or lidocaine', 'Continue CPR/defibrillation'], why: 'Lecture: amiodarone or lidocaine used for refractory VF.', mech: '↑ ERP (amiodarone) or Na⁺ block in ischaemic tissue (lidocaine) make it harder for fibrillatory wavelets to re-form after the shock.', src: 'L' } } },
    tdp: { t: 'Torsades de pointes', root: 't0', n: {
      t0: { q: 'Polymorphic VT with markedly prolonged QTc. Pulse present?', o: [['Pulse present', 't1'], ['Pulseless', 'tP']] },
      t1: { a: ['IV magnesium sulfate', 'Discontinue QT-prolonging drugs (e.g., procainamide, sotalol, amiodarone)', 'Correct electrolyte abnormalities (Mg²⁺ – K⁺)'], why: 'Lecture p. 52.', mech: 'Mg²⁺ suppresses EADs; removing I_Kr blockers and correcting hypokalaemia restore repolarisation reserve. Monitor Mg²⁺ and renal function.', src: 'L' },
      tP: { a: ['Unsynchronized defibrillation + CPR'], why: 'Supplementary: a pulseless polymorphic VT is cardiac arrest; synchronisation is not possible with polymorphic complexes.', mech: '—', src: 'S' } } },
    brady: { t: 'Sinus node dysfunction / bradycardia', root: 'b0', n: {
      b0: { a: ['Identify and treat the cause', 'Review rate-slowing medications: β-blockers, verapamil, diltiazem, digoxin'], why: 'Lecture p. 53; Q20.', mech: 'These drugs reduce nodal phase-4 slope (β-blockers, Ca²⁺ blockers) or increase vagal tone (digoxin).', src: 'L', next: [['Symptomatic', 'b1']] },
      b1: { a: ['Atropine may help (acute) — 2025 AHA ACLS: 1 mg IV every 3–5 min, maximum 3 mg (S)', 'If atropine fails: transcutaneous pacing, or an IV β-agonist such as dopamine/adrenaline (S)'], why: 'Lecture; Q21.', mech: 'Muscarinic block removes vagal tone → steeper nodal phase 4 → ↑ HR. Use cautiously in ischaemic heart disease.', src: 'L', next: [['Persistent, no reversible cause', 'b2']] },
      b2: { a: ['Permanent pacemaker'], why: 'Lecture card: PPM maintains adequate heart rate in bradycardia.', mech: 'Pacing replaces the failing intrinsic pacemaker.', src: 'L + S' } } },
    avb: { t: 'AV blocks', root: 'k0', n: {
      k0: { q: 'Which AV block?', o: [['1st-degree', 'k1'], ['Mobitz I (Wenckebach)', 'k2'], ['Mobitz II', 'k3'], ['3rd-degree', 'k3']] },
      k1: { a: ['Usually no treatment', 'Discontinue causative drugs'], why: 'Lecture p. 53.', mech: 'All impulses still conduct, just late.', src: 'L' },
      k2: { a: ['Discontinue causative drugs', 'Acute symptomatic: IV atropine'], why: 'Lecture p. 53.', mech: 'Block is usually at the AV-node level, which responds to vagal withdrawal.', src: 'L' },
      k3: { a: ['Discontinue causative drugs', 'Acute symptomatic: IV atropine 1 mg (max 3 mg) — often fails if the block is infranodal → transcutaneous/temporary pacing (S)', 'Long-term: permanent pacemaker if not due to a reversible cause'], why: 'Lecture p. 53; Q17–Q18.', mech: 'Infranodal disease is unpredictable and may progress to complete heart block with a slow, unreliable escape rhythm.', src: 'L + S' } } }
  };

  /* ------------------------------ QUIZ ENGINE ------------------------------ */
  K.QuizRunner = function (host, list, opt) {
    opt = opt || {};
    const st = App.state; let i = opt.start || 0;
    const box = h('div', { class: 'quiz' }); host.appendChild(box);
    function render() {
      box.innerHTML = '';
      const q = list[i]; const key = q.id || ('P:' + q.stem.slice(0, 40));
      const chosen = st.answers[key];
      const head = h('div', { class: 'qhead' },
        h('span', { class: 'tag ' + (q.supp ? 'tag-s' : 'tag-l') }, q.supp ? 'Supplementary practice' : 'Lecture question'),
        h('span', { class: 'qcount' }, (q.id ? q.id + ' · ' : '') + (i + 1) + ' / ' + list.length));
      box.appendChild(head);
      if (q.cs != null && K.cases[q.cs] && opt.showCase !== false) {
        const c = K.cases[q.cs];
        const cb = h('div', { class: 'case' }, h('b', {}, c.t + ' '), c.stem);
        box.appendChild(cb);
        if (c.ecg && opt.ecg !== false) { const e = h('div', { class: 'case-ecg' }); box.appendChild(e); new RD.ECGStrip(e, { gen: (s) => EP.rhythms[c.ecg]({ seed: s, dur: 5000 }), dur: 5000, ladder: false, ecgH: 120 }).regen = c.ecg === 'af' || c.ecg === 'vf'; }
      }
      box.appendChild(h('div', { class: 'qstem' }, q.stem));
      const ol = h('div', { class: 'opts' });
      q.opts.forEach((o, k) => {
        let cls = 'opt';
        if (chosen != null) { if (k === q.ans) cls += ' ok'; else if (k === chosen) cls += ' bad'; else cls += ' dim'; }
        const b = h('button', { class: cls, onclick: () => { if (chosen != null) return; st.answers[key] = k; App.save(); render(); opt.onAnswer && opt.onAnswer(); } }, h('b', {}, 'ABCD'[k] + '. '), o);
        ol.appendChild(b);
      });
      box.appendChild(ol);
      if (chosen != null) {
        const ok = chosen === q.ans;
        const fb = h('div', { class: 'fb ' + (ok ? 'fb-ok' : 'fb-bad') }, h('div', { class: 'fbt' }, ok ? '✓ Correct — ' + 'ABCD'[q.ans] : '✗ Not quite — correct answer: ' + 'ABCD'[q.ans] + '. ' + q.opts[q.ans]), h('p', {}, q.why));
        if (q.dis) { const ul = h('ul', { class: 'dis' }); Object.keys(q.dis).forEach((k) => ul.appendChild(h('li', {}, h('b', {}, 'ABCD'[k] + ': '), q.dis[k]))); fb.appendChild(h('div', { class: 'small muted' }, 'Why the other options are wrong:')); fb.appendChild(ul); }
        if (q.link) fb.appendChild(h('button', { class: 'btn btn-ghost', onclick: () => App.go(q.link[0], q.link[1]) }, '→ Explore the mechanism'));
        box.appendChild(fb);
      }
      const nav = h('div', { class: 'qnav' },
        h('button', { class: 'btn', disabled: i === 0 ? '' : null, onclick: () => { i--; render(); } }, '← Previous'),
        h('button', { class: 'btn', onclick: () => { st.answers[key] = undefined; delete st.answers[key]; App.save(); render(); } }, 'Reset question'),
        h('button', { class: 'btn btn-p', disabled: i === list.length - 1 ? '' : null, onclick: () => { i++; render(); } }, 'Next →'));
      box.appendChild(nav);
      const sc = K.score(list); box.appendChild(h('div', { class: 'qscore' }, 'Score in this set: ' + sc.c + ' / ' + sc.a + ' answered (' + list.length + ' total)'));
    }
    this.goto = (k) => { i = k; render(); };
    render();
  };
  K.score = function (list) {
    let a = 0, c = 0;
    list.forEach((q) => { const key = q.id || ('P:' + q.stem.slice(0, 40)); const v = App.state.answers[key]; if (v != null) { a++; if (v === q.ans) c++; } });
    return { a, c };
  };
})();