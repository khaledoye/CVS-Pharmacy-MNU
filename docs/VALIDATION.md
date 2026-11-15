# Scientific validation record — Arrhythmia EP simulator

Primary source: lecture *Arrythmia*, PP 907 Pharmacotherapy of Cardiovascular Diseases, Pharm D level 5, pp. 47–59.
Audit date: Nov 2026. Tests: `node tests/test-models.js` (99 assertions).

## What this model is
A **phenomenological, phase-structured teaching model**. Each AP phase is a shaped segment whose
geometry is driven by conductance multipliers, so every drug effect propagates consistently from
ion channel → action potential → conduction → ECG. It is **not** a biophysical ionic model
(no Hodgkin–Huxley gating, no ion concentrations, no cable/tissue propagation) and has **no drug
concentrations**: each drug is a single fixed "therapeutic" point.

Gold-standard quantitative references this approximates: O'Hara–Rudy ORd human ventricular model
(DOI 10.1371/journal.pcbi.1002061), Courtemanche human atrial (DOI 10.1152/ajpheart.1998.275.1.H301),
Fabbri human SA-node (DOI 10.1113/JP273259), Fenton–Karma re-entry (DOI 10.1063/1.166311), CiPA.

## Corrections implemented (audit → code)

| # | Finding | Status before | Correction |
|---|---|---|---|
| 1 | Resting potential hard-coded −85 mV, I_K1 omitted | INCORRECT (oversimplified) | `EP.vrest(Ko)` from Nernst E_K + Na⁺ leak; Vpeak and V90 now track it. Hyper-/hypokalaemia shift resting potential. Ref: Shaw & Rudy, Circ Res 1997;81:727 |
| 2 | Hypokalaemia = generic `gK × 0.75` | INCORRECT (mechanism inverted) | Modelled through I_Kr: conductance ∝ √[K]o **and** low [K]o potentiates drug block of I_Kr (`EP.effGK`). Na⁺ availability now follows h∞(Vrest). Ref: Yang & Roden, Circulation 1996;93:407 |
| 3 | Accessory-pathway ERP 250 → 417 ms with procainamide (+67%) | INCORRECT (magnitude) | Baseline 260 ms (published 237 ± 24 to 282 ± 7 ms); increment is now **baseline-length-dependent** and capped (≤ ~35%). Short-ERP (high-risk) pathways barely respond; long-ERP pathways block — the logic of the procainamide test. Refs: Brugada, Am J Cardiol 1983; Wellens, Am J Cardiol 1982; Benditt, JACC 1992 (DOI 10.1016/0735-1097(92)90061-Q) |
| 4 | Digoxin = vagal effect only; no Na⁺/K⁺-ATPase, no DADs | VERIFIED WITH LIMITATIONS | DAD module added: index scales with drug level × (4/[K]o)^1.5, produces a late phase-4 hump and, above threshold, a triggered beat. Distinguished from EADs in-app |
| 5 | EAD rule heuristic; Mg²⁺ boolean | VERIFIED WITH LIMITATIONS | Kept (defensible proxy: needs prolonged APD + available I_CaL, worse with bradycardia). Labelled as a deterministic simplification. Ref: Tzivoni, Circulation 1988;77:392 |
| 6 | CV ∝ √(dV/dt max) | VERIFIED WITH LIMITATIONS | Kept (cable theory θ ∝ √g_Na) but labelled in-app as valid only at modest block — it loses accuracy near conduction failure and ignores gap-junction coupling |
| 7 | No use-/reverse-use-dependence | NOT VALIDATED (not modelled) | Structural limitation of a fixed-multiplier design. Stated explicitly in-app rather than faked |
| 8 | Amiodarone acute IV vs chronic oral conflated | VERIFIED WITH LIMITATIONS | Profile shown is labelled **chronic oral**; IV caveat added, incl. "avoid in pre-excited AF — delayed action" (2024 ESC) |
| 9 | Adenosine modelled as steady peak effect | VERIFIED WITH LIMITATIONS | Labelled as peak of a transient (t½ < 10 s) effect |

## Verified without change
Baseline AV-nodal ERP ~300 ms (published 230–310, mean 269 ± 27); AF f-wave 5–9 Hz (published 4.4–7.8);
VF dominant frequency 4–8 Hz (test measures it by DFT); TdP rate and twisting; WPW short PR + delta;
Wenckebach pause < 2 × PP; VT width/rate and AV dissociation; adenosine t½ < 10 s;
AP-ERP < 250 ms as the high-risk marker; post-repolarisation refractoriness for class IA/IC.

## Numbers that may NOT be presented as quantitative predictions
dV/dt percentages; exact QRS/QT/QTc values; AF rate figures; AP-ERP increments; EAD/DAD thresholds.
All are labelled **Simplified simulation** in-app. Nothing here supports patient-specific prediction,
dose–response, or real proarrhythmia probability.

## Unresolved limitations
No ion concentrations or drug concentrations (no dose–response); no rate-dependent block or reverse
use-dependence; no stochastic substrate/dispersion of repolarisation, so TdP initiation is
deterministic; no tissue-level propagation (re-entry is animated schematically, not solved);
reduced I_K1 in severe hypokalaemia not represented; NAPA (procainamide's class III metabolite) not
modelled; single lead-II-like trace, so electrical axis cannot be measured.

## Guideline alignment of management trees
2023 ACC/AHA/ACCP/HRS AF (DOI 10.1161/CIR.0000000000001193); 2024 ESC AF (Eur Heart J 2024;45:3314);
2019 ESC SVT (Eur Heart J 2020;41:655); 2022 ESC ventricular arrhythmias (Eur Heart J 2022;43:3997);
2018 ACC/AHA/HRS bradycardia; 2025 AHA ACLS (Circulation 2025;152:S538).
Changes made from the audit: ibutilide added alongside procainamide for stable pre-excited AF;
amiodarone flagged as avoid/delayed-action there; sotalol added as an ACLS option in stable
wide-complex tachycardia; atropine dose stated as 1 mg IV (max 3 mg); acute vs long-term separated.
