/* CVS-Pharmacy-MNU — © 2026 Khaled Osama Yaseen. All rights reserved.
 * Faculty of Pharmacy, Mansoura National University. Proprietary — not licensed
 * for reuse, copying, modification, or redistribution. See LICENSE. */
/* =====================================================================
   heart3d.js — Three.js cardiac conduction-system model.
   Schematic (not anatomically exact) geometry; activation timing based on
   textbook values (Guyton & Hall ch. 10): SA→AV ≈ 30–50 ms, AV delay ≈ 90–
   100 ms, His–Purkinje ≈ 30–40 ms, ventricular activation ≈ 80–90 ms.
   ===================================================================== */
(function () {
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const INFO = {
    SA: { name: 'SA node', loc: 'Wall of the right atrium at the junction with the superior vena cava (subepicardial).', role: 'Primary pacemaker — the steepest spontaneous phase-4 depolarisation (60–100/min), so it normally sets the heart rate.', clin: 'Sinus node dysfunction / sick sinus syndrome. Slowed by β-blockers, verapamil/diltiazem, digoxin; accelerated by atropine (lecture p. 51–53).' },
    RA: { name: 'Right atrium', loc: 'Receives systemic venous blood; houses SA and AV nodes.', role: 'Atrial myocardium (fast-response APs) conducts at ~0.3–1 m/s → P wave (first half).', clin: 'Site of AF wavelets/flutter circuits; atrial activation absent → no organised P waves in AF.' },
    LA: { name: 'Left atrium', loc: 'Posterior; receives the pulmonary veins.', role: 'Activated via Bachmann’s bundle → second half of the P wave.', clin: 'Pulmonary-vein triggers initiate AF; stasis in the LA appendage → stroke (anticoagulation).' },
    INT: { name: 'Internodal pathways', loc: 'Right atrial wall between SA and AV nodes.', role: 'Preferential atrial conduction from SA to AV node.', clin: 'Atrial conduction time is a small part of the PR interval.' },
    BB: { name: 'Bachmann’s bundle', loc: 'Interatrial band.', role: 'Rapid conduction from RA to LA.', clin: 'Delay here widens/notches the P wave (S).' },
    AV: { name: 'AV node', loc: 'Floor of the right atrium (Koch’s triangle) near the coronary-sinus ostium.', role: 'Slow, Ca²⁺-dependent conduction delays the impulse ≈ 0.1 s (PR segment) and filters fast atrial rates (refractory period).', clin: 'Target of rate control in AF (β-blockers, diltiazem/verapamil, digoxin) and of vagal manoeuvres/adenosine in PSVT. Site of 1st-degree and Mobitz I block.' },
    HIS: { name: 'Bundle of His', loc: 'Penetrates the fibrous AV ring and runs along the membranous septum.', role: 'The only normal electrical connection between atria and ventricles. Lecture divides arrhythmias as above (supraventricular) or below (ventricular) this bundle.', clin: 'Infranodal disease → Mobitz II and complete heart block → pacemaker.' },
    LBB: { name: 'Left bundle branch', loc: 'Left side of the interventricular septum (fascicles).', role: 'Rapid conduction to the LV.', clin: 'Bundle-branch block → wide QRS (S).' },
    RBB: { name: 'Right bundle branch', loc: 'Right side of the septum to the moderator band.', role: 'Rapid conduction to the RV.', clin: 'Bundle-branch block → wide QRS (S).' },
    PK: { name: 'Purkinje fibres', loc: 'Subendocardial network of both ventricles.', role: 'Fastest conduction (≈ 2–4 m/s) → near-simultaneous ventricular activation → narrow QRS.', clin: 'Lidocaine’s late-Na⁺ (APD-shortening) effect is greatest here (S). Wide QRS whenever activation bypasses this network (VT, ectopic beats, pre-excitation).' },
    RV: { name: 'Right ventricle', loc: 'Anterior.', role: 'Ventricular myocardium (fast-response AP): phase 0 → QRS, phase 2 → ST, phase 3 → T.', clin: 'Origin of some VTs (S).' },
    LV: { name: 'Left ventricle', loc: 'Posterior-left; forms the apex.', role: 'Thick-walled systemic pump.', clin: 'Post-MI scar → re-entrant VT (Case 3); flecainide contraindicated (lecture).' },
    KENT: { name: 'Accessory pathway (bundle of Kent)', loc: 'Abnormal muscle bridge across the AV ring (here: left lateral).', role: 'Fast-response tissue that bypasses the AV-nodal delay → early ventricular activation (pre-excitation: short PR + delta wave).', clin: 'WPW = AV re-entrant tachycardia via the accessory pathway (lecture). Pre-excited AF: procainamide preferred; avoid adenosine (lecture).' },
    RING: { name: 'Fibrous AV ring (cardiac skeleton)', loc: 'Plane between atria and ventricles.', role: 'Electrically insulating — forces the impulse through the AV node/His bundle.', clin: 'An accessory pathway is a gap in this insulation (S).' },
    ECT: { name: 'Ectopic focus', loc: 'Ventricular myocardium (illustrative).', role: 'Cells that acquire spontaneous phase-4 depolarisation (abnormal automaticity).', clin: 'Activation spreads cell-to-cell, bypassing Purkinje fibres → wide, bizarre QRS.' }
  };
  window.HEART_INFO = INFO;

  window.Heart3D = function (host, opt) {
    opt = opt || {};
    const self = this;
    this.host = host;
    let gl;
    try { const c = document.createElement('canvas'); gl = !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { gl = false; }
    if (!window.THREE || !gl) { host.innerHTML = '<div class="fallback">3D rendering (WebGL / Three.js) is not available in this browser. The 2D ladder diagrams and ECG modules still demonstrate conduction.</div>'; this.ok = false; return; }
    this.ok = true;
    const W = () => host.clientWidth, H = () => host.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(W(), H());
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 100); camera.position.set(0.4, 0.3, 7.2);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.minDistance = 3; controls.maxDistance = 14; controls.enablePan = true;
    scene.add(new THREE.AmbientLight(0x8fb3d9, 0.55));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(3, 5, 6); scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0x5eead4, 0.35); dl2.position.set(-4, -2, -3); scene.add(dl2);
    const heart = new THREE.Group(); heart.rotation.z = 0.42; heart.rotation.y = -0.25; scene.add(heart);
    const pick = []; const parts = {};

    function chamber(id, pos, scl, col) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide, emissive: 0x000000, shininess: 40 }));
      m.position.copy(pos); m.scale.copy(scl); m.userData.id = id; heart.add(m); pick.push(m); parts[id] = { mesh: m, kind: 'ch', base: col, glow: 0 };
      // wire outline for depth perception
      const wf = new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.05 })); wf.position.copy(pos); wf.scale.copy(scl); heart.add(wf);
    }
    chamber('RA', V3(-0.95, 0.95, 0.25), V3(0.72, 0.72, 0.65), 0x3b82f6);
    chamber('LA', V3(0.65, 1.05, -0.55), V3(0.72, 0.58, 0.6), 0xef4444);
    chamber('RV', V3(-0.5, -0.45, 0.5), V3(0.95, 1.25, 0.7), 0x2563eb);
    chamber('LV', V3(0.45, -0.55, -0.2), V3(0.92, 1.45, 0.92), 0xdc2626);
    // AV ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.03, 8, 80), new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.35 }));
    ring.rotation.x = Math.PI / 2; ring.position.set(-0.05, 0.38, 0); ring.scale.set(1.15, 0.8, 1); heart.add(ring);
    const ringPick = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.09, 6, 60), new THREE.MeshBasicMaterial({ visible: false })); ringPick.rotation.copy(ring.rotation); ringPick.position.copy(ring.position); ringPick.scale.copy(ring.scale); ringPick.userData.id = 'RING'; heart.add(ringPick); pick.push(ringPick); parts.RING = { mesh: ring, kind: 'ring' };

    function path(id, pts, col, r) {
      const curve = new THREE.CatmullRomCurve3(pts);
      const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, r || 0.045, 10, false), new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: 0.25 }));
      heart.add(m);
      const pk = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.13, 6, false), new THREE.MeshBasicMaterial({ visible: false })); pk.userData.id = id; heart.add(pk); pick.push(pk);
      if (!parts[id]) parts[id] = { meshes: [], curves: [], kind: 'path', col };
      parts[id].meshes = (parts[id].meshes || []).concat([m]); parts[id].curves = (parts[id].curves || []).concat([curve]);
      return curve;
    }
    function node(id, pos, col, r) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r || 0.12, 24, 16), new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: 0.4 }));
      m.position.copy(pos); m.userData.id = id; heart.add(m); pick.push(m); parts[id] = { mesh: m, kind: 'node', col, pos };
    }
    const P = { SA: V3(-1.08, 1.6, 0.45), AV: V3(-0.28, 0.42, 0.18), HISe: V3(-0.05, 0.02, 0.12), apex: V3(0.15, -1.85, 0.05) };
    node('SA', P.SA, 0xfbbf24, 0.14);
    node('AV', P.AV, 0xfbbf24, 0.12);
    path('INT', [P.SA, V3(-1.15, 1.05, 0.55), V3(-0.75, 0.6, 0.35), P.AV], 0xfde68a, 0.03);
    path('BB', [P.SA, V3(-0.4, 1.55, 0.05), V3(0.35, 1.45, -0.35), V3(0.95, 1.2, -0.55)], 0xfde68a, 0.03);
    path('HIS', [P.AV, V3(-0.15, 0.22, 0.15), P.HISe], 0xfacc15, 0.055);
    path('LBB', [P.HISe, V3(0.2, -0.35, 0.02), V3(0.38, -1.05, -0.05), V3(0.25, -1.7, 0.0)], 0xfacc15, 0.045);
    path('RBB', [P.HISe, V3(-0.25, -0.45, 0.32), V3(-0.38, -1.15, 0.42), V3(-0.12, -1.72, 0.28)], 0xfacc15, 0.045);
    const pkC = [
      path('PK', [V3(0.25, -1.7, 0.0), V3(0.85, -1.4, -0.35), V3(1.2, -0.6, -0.4), V3(1.25, 0.1, -0.35)], 0x67e8f9, 0.025),
      path('PK', [V3(0.25, -1.7, 0.0), V3(0.7, -1.3, 0.25), V3(1.0, -0.6, 0.35), V3(1.05, 0.05, 0.2)], 0x67e8f9, 0.025),
      path('PK', [V3(-0.12, -1.72, 0.28), V3(-0.85, -1.2, 0.75), V3(-1.25, -0.5, 0.75), V3(-1.3, 0.15, 0.55)], 0x67e8f9, 0.025),
      path('PK', [V3(-0.12, -1.72, 0.28), V3(-0.6, -1.4, 0.05), V3(-1.05, -0.8, 0.0)], 0x67e8f9, 0.025)
    ];
    const kent = path('KENT', [V3(1.15, 0.85, -0.45), V3(1.32, 0.42, -0.42), V3(1.25, 0.05, -0.35)], 0xf472b6, 0.05);
    parts.KENT.meshes.forEach((m) => (m.visible = false));
    node('ECT', V3(0.95, -0.85, 0.45), 0xf87171, 0.1); parts.ECT.mesh.visible = false;
    // pre-excitation patch & ectopic wave sphere
    const wave = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.0, depthWrite: false })); heart.add(wave);

    // impulse sprites
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
    const halo = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
    const pool = []; for (let i = 0; i < 40; i++) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), pulseMat)); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), halo)); g.visible = false; heart.add(g); pool.push(g); }

    /* ---------------------------- MODES ---------------------------- */
    // track: {k:'pulse', id, c: curve index or 'all', t0, t1, rev} | {k:'glow', id, t0, t1, fall} | {k:'node', id, t0, t1}
    const sinus = (vent) => {
      const tr = [
        { k: 'node', id: 'SA', t0: 0, t1: 25 },
        { k: 'pulse', id: 'INT', t0: 0, t1: 40 }, { k: 'pulse', id: 'BB', t0: 0, t1: 35 },
        { k: 'glow', id: 'RA', t0: 5, t1: 75, fall: 180 }, { k: 'glow', id: 'LA', t0: 25, t1: 95, fall: 180 },
        { k: 'node', id: 'AV', t0: 40, t1: 130 }
      ];
      if (vent) tr.push({ k: 'pulse', id: 'HIS', t0: 130, t1: 145 }, { k: 'pulse', id: 'LBB', t0: 145, t1: 170 }, { k: 'pulse', id: 'RBB', t0: 145, t1: 175 },
        { k: 'pulse', id: 'PK', t0: 170, t1: 195 }, { k: 'glow', id: 'LV', t0: 175, t1: 255, fall: 300 }, { k: 'glow', id: 'RV', t0: 180, t1: 250, fall: 300 });
      return tr;
    };
    const MODES = {
      normal: { name: 'Normal sinus rhythm', sources: [{ period: 860, tracks: sinus(true), beat: { p: 0, q: 175, w: 90, qt: 380 } }],
        steps: [[0, 'SA node fires (nodal phase 0)'], [5, 'Atrial depolarisation → P wave'], [40, 'Impulse reaches AV node: slow Ca²⁺-dependent conduction (PR segment)'], [130, 'Bundle of His'], [145, 'Right & left bundle branches'], [170, 'Purkinje fibres'], [175, 'Ventricular depolarisation → QRS'], [260, 'Plateau (ST) then repolarisation (T)']] },
      wpw: { name: 'WPW — ventricular pre-excitation', kent: true, sources: [{ period: 860, tracks: sinus(true).concat([{ k: 'pulse', id: 'KENT', t0: 30, t1: 48 }, { k: 'glow', id: 'LV', t0: 48, t1: 255, fall: 300 }]), beat: { p: 0, q: 60, w: 130, qt: 410, kind: 'pre' } }],
        steps: [[0, 'SA node fires'], [30, 'Impulse enters the accessory pathway (no AV-nodal delay)'], [48, 'LV base activated early, cell-to-cell → delta wave, short PR'], [175, 'Normal His–Purkinje wavefront arrives and fuses → wide QRS']] },
      avrt: { name: 'Orthodromic AVRT (WPW re-entry)', kent: true, sources: [{ period: 330, tracks: [
        { k: 'node', id: 'AV', t0: 0, t1: 100 }, { k: 'pulse', id: 'HIS', t0: 100, t1: 112 }, { k: 'pulse', id: 'LBB', t0: 112, t1: 135 }, { k: 'pulse', id: 'RBB', t0: 112, t1: 138 },
        { k: 'pulse', id: 'PK', t0: 135, t1: 158 }, { k: 'glow', id: 'LV', t0: 140, t1: 215, fall: 110 }, { k: 'glow', id: 'RV', t0: 145, t1: 210, fall: 110 },
        { k: 'pulse', id: 'KENT', t0: 205, t1: 228, rev: true }, { k: 'glow', id: 'LA', t0: 228, t1: 290, fall: 60 }, { k: 'glow', id: 'RA', t0: 245, t1: 315, fall: 40 }, { k: 'pulse', id: 'INT', t0: 270, t1: 330, rev: true }], beat: { p: null, q: 140, w: 85, qt: 250, retro: true } }],
        steps: [[0, 'Down the AV node (antegrade)'], [100, 'His–Purkinje → narrow QRS'], [205, 'Back UP the accessory pathway (retrograde)'], [228, 'Atria re-activated (retrograde P)'], [300, 'Impulse re-enters the AV node → circuit repeats ≈ 180 bpm']] },
      ectopic: { name: 'Abnormal automaticity — ventricular ectopic focus', ect: true, sources: [
        { period: 860, tracks: sinus(false), beat: { p: 0, q: null } },
        { period: 560, tracks: [{ k: 'node', id: 'ECT', t0: 0, t1: 25 }, { k: 'wave', t0: 0, t1: 170 }, { k: 'glow', id: 'LV', t0: 10, t1: 150, fall: 250 }, { k: 'glow', id: 'RV', t0: 60, t1: 190, fall: 250 }], beat: { q: 0, w: 160, qt: 360, kind: 'v' } }],
        steps: [[0, 'Ectopic ventricular cell reaches threshold (steep abnormal phase 4) — 107/min, faster than the SA node'], [10, 'Slow cell-to-cell spread (no Purkinje) → wide QRS'], [0, 'SA node keeps firing the atria independently (AV dissociation in this illustration)']] }
    };
    this.MODES = MODES;
    let mode = MODES.normal; this.modeId = 'normal';
    let simT = 0, speed = opt.speed || 0.25, playing = true;
    let selected = null;

    /* labels */
    const lab = document.createElement('div'); lab.className = 'h3d-labels'; host.appendChild(lab);
    let showAll = false;
    function labels() {
      lab.innerHTML = '';
      const ids = showAll ? ['SA', 'AV', 'HIS', 'LBB', 'RBB', 'PK', 'RA', 'LA', 'RV', 'LV', 'KENT', 'ECT'] : selected ? [selected] : [];
      ids.forEach((id) => {
        const p = parts[id]; if (!p) return; if ((id === 'KENT' && !mode.kent) || (id === 'ECT' && !mode.ect)) return;
        let v;
        if (p.mesh && p.kind !== 'ring') v = p.mesh.position.clone(); else if (p.curves) v = p.curves[0].getPointAt(0.55); else return;
        v.applyMatrix4(heart.matrixWorld).project(camera);
        const x = (v.x * 0.5 + 0.5) * W(), y = (-v.y * 0.5 + 0.5) * H();
        const d = document.createElement('div'); d.className = 'h3d-lab' + (id === selected ? ' on' : ''); d.textContent = INFO[id].name; d.style.left = x + 'px'; d.style.top = y + 'px'; lab.appendChild(d);
      });
    }

    /* picking */
    const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2(); let downXY = null;
    renderer.domElement.addEventListener('pointerdown', (e) => { downXY = [e.clientX, e.clientY]; });
    renderer.domElement.addEventListener('pointerup', (e) => {
      if (!downXY || Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]) > 5) return;
      const r = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1; mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(mouse, camera);
      const vis = pick.filter((m) => (m.userData.id !== 'KENT' || mode.kent) && (m.userData.id !== 'ECT' || mode.ect));
      const hits = ray.intersectObjects(vis, false);
      // prefer conduction structures over chambers
      const pri = (id) => (['RA', 'LA', 'RV', 'LV', 'RING'].includes(id) ? 1 : 0);
      hits.sort((a, b) => pri(a.object.userData.id) - pri(b.object.userData.id) || a.distance - b.distance);
      self.select(hits.length ? hits[0].object.userData.id : null);
    });
    this.select = function (id) { selected = id; opt.onSelect && opt.onSelect(id, INFO[id]); };

    this.setMode = function (id) {
      mode = MODES[id]; this.modeId = id; simT = 0;
      parts.KENT.meshes.forEach((m) => (m.visible = !!mode.kent)); parts.ECT.mesh.visible = !!mode.ect;
      opt.onMode && opt.onMode(id, mode);
    };
    this.setSpeed = (s) => (speed = s);
    this.play = () => (playing = true); this.pause = () => (playing = false); this.replay = () => { simT = 0; playing = true; };
    this.step = (dt) => { simT += dt; };
    this.setShowAll = (b) => (showAll = b);
    this.getT = () => simT;
    this.mode = () => mode;

    function env(t, a, b, fall) { if (t < a) return 0; if (t < b) return (t - a) / (b - a); return Math.max(0, 1 - (t - b) / fall); }
    let last = performance.now(); let alive = true;
    function frame(now) {
      if (!alive) return;
      if (!document.body.contains(host)) { alive = false; renderer.dispose(); return; }
      const dt = Math.min(now - last, 50); last = now;
      if (playing) simT += dt * speed;
      // reset visuals
      ['RA', 'LA', 'RV', 'LV'].forEach((id) => (parts[id].glow = 0));
      ['SA', 'AV', 'ECT'].forEach((id) => { parts[id].mesh.scale.setScalar(1); parts[id].mesh.material.emissiveIntensity = 0.4; });
      pool.forEach((g) => (g.visible = false)); let pi = 0; wave.material.opacity = 0;
      mode.sources.forEach((src) => {
        const lt = simT % src.period;
        src.tracks.forEach((tr) => {
          if (tr.k === 'glow') parts[tr.id].glow = Math.max(parts[tr.id].glow, env(lt, tr.t0, tr.t1, tr.fall));
          else if (tr.k === 'node' && lt >= tr.t0 && lt <= tr.t1) { const p = parts[tr.id]; const s = 1 + 0.6 * Math.sin(((lt - tr.t0) / (tr.t1 - tr.t0)) * Math.PI); p.mesh.scale.setScalar(s); p.mesh.material.emissiveIntensity = 1.2; }
          else if (tr.k === 'pulse' && lt >= tr.t0 && lt <= tr.t1) {
            const u = (lt - tr.t0) / (tr.t1 - tr.t0);
            parts[tr.id].curves.forEach((c) => { for (let k = 0; k < 3 && pi < pool.length; k++) { const uu = Math.max(0, Math.min(1, u - k * 0.06)); const g = pool[pi++]; g.visible = true; g.position.copy(c.getPointAt(tr.rev ? 1 - uu : uu)); g.scale.setScalar(1 - k * 0.25); } });
          } else if (tr.k === 'wave' && lt >= tr.t0 && lt <= tr.t1) {
            const u = (lt - tr.t0) / (tr.t1 - tr.t0); wave.position.copy(parts.ECT.mesh.position); wave.scale.setScalar(0.1 + u * 1.6); wave.material.opacity = 0.35 * (1 - u);
          }
        });
      });
      ['RA', 'LA', 'RV', 'LV'].forEach((id) => {
        const p = parts[id], g = p.glow, sel = selected === id;
        p.mesh.material.emissive.setRGB(0.1 * g, 0.75 * g, 0.85 * g);
        p.mesh.material.opacity = 0.16 + 0.32 * g + (sel ? 0.18 : 0);
      });
      // selection highlight for paths
      Object.keys(parts).forEach((id) => { const p = parts[id]; if (p.kind === 'path') p.meshes.forEach((m) => { m.material.emissiveIntensity = id === selected ? 1.4 : 0.25; }); if (p.kind === 'node') { if (id === selected) p.mesh.material.emissiveIntensity = 1.5; } });
      ring.material.opacity = selected === 'RING' ? 0.9 : 0.35;
      controls.update();
      renderer.render(scene, camera);
      labels();
      opt.onFrame && opt.onFrame(simT, mode);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    this.resize = () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); };
    window.addEventListener('resize', this.resize);
  };
})();