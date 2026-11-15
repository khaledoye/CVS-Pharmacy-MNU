# CVS-Pharmacy-MNU — Interactive Cardiac Electrophysiology & Antiarrhythmic Pharmacotherapy Simulator

An interactive learning lab built from the lecture **"Arrythmia"** (PP 907, Pharmacotherapy of
Cardiovascular Diseases), Clinical Pharmacy Pharm D level 5, Faculty of Pharmacy,
Mansoura National University.

## What it contains
13 linked modules: cardiac electrical anatomy in 3D, action-potential laboratory,
arrhythmogenesis mechanisms, ECG interpretation laboratory, Vaughan Williams classification,
drug → action-potential and drug → ECG simulators, miscellaneous agents, management decision
trees, bradyarrhythmias and AV blocks, the five clinical cases with questions Q1–Q27, and a
final assessment.

## Scientific transparency
Every statement is tagged: **Lecture content**, **Evidence-based supplementary**,
**Simplified simulation**, **Matches published range**, **Context-dependent**, or
**Lecture note** (a point flagged as ambiguous rather than silently changed).

All waveforms are produced by a simplified teaching model. They are **not patient recordings**
and must not be used for clinical decisions. The model's limitations and the full validation
record are in [`docs/VALIDATION.md`](docs/VALIDATION.md) and inside the app (module 13).

## Running it
Static site — no build step. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

## Credits
Lecture content © its authors (Faculty of Pharmacy, Mansoura National University).
Built with [three.js](https://threejs.org) (MIT) for the 3D conduction system.
