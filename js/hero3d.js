/* ============================================================
   HERO 3D — a single procedural wireframe object that lives behind the home page
   and responds to scroll. Monochrome, no textures, no model files (~0 KB of assets).

   Cost controls:
   • three.js is lazy-loaded from a CDN only when 3D is actually going to run
   • desktop-class devices only; reduced-motion / low-power / no-WebGL → caller falls back to the 2D canvas
   • DPR capped at 1.5; antialias off
   • renders on demand (scroll / pointer / easing) — idle only during a throttled hero drift
   • a frame-time watchdog bails out to the fallback if the GPU can't keep up
   ============================================================ */
const Hero3D = (() => {
  const THREE_SRC = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';

  // Scroll choreography. Columns: progress, x, y, scale, rotY, rotX, canvas opacity.
  // x is kept to the right so the object frames the text rather than sitting behind it.
  const KEYS = [
    [0.00, 2.05,  0.02, 1.22, 0.0,  0.18, 1.00],
    [0.10, 2.22, -0.18, 1.02, 1.1,  0.48, 0.48],
    [0.35, 2.55,  0.28, 0.78, 2.7,  0.90, 0.22],
    [0.65, 2.36, -0.25, 0.88, 4.4,  1.25, 0.22],
    [1.00, 1.78,  0.00, 1.12, 6.283, 1.55, 0.38],
  ];

  function supported() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900) return false;
    if ((navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2) return false;
    if (navigator.connection?.saveData) return false;
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch { return false; }
  }

  let threePromise = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (!threePromise) {
      threePromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = THREE_SRC; s.async = true; s.crossOrigin = 'anonymous';
        s.onload = () => (window.THREE ? resolve(window.THREE) : reject(new Error('three missing')));
        s.onerror = () => { threePromise = null; reject(new Error('three failed to load')); };
        document.head.appendChild(s);
      });
    }
    return threePromise;
  }

  const lerp = (a, b, t) => a + (b - a) * t;
  function sample(p) {
    p = Math.min(1, Math.max(0, p));
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
    const a = KEYS[i], b = KEYS[i + 1];
    const t = (p - a[0]) / (b[0] - a[0]);
    const e = t * t * (3 - 2 * t); // smoothstep between keys
    return a.slice(1).map((v, k) => lerp(v, b[k + 1], e));
  }

  /** Resolves to { destroy } or rejects (caller then uses the 2D fallback). `onDegrade` fires if it bails out later. */
  async function start({ onDegrade } = {}) {
    if (!supported()) throw new Error('3D not supported');
    const THREE = await loadThree();

    const canvas = document.createElement('canvas');
    canvas.id = 'scene3d';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' }); }
    catch (e) { canvas.remove(); throw e; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.z = 7;

    // --- object: faceted shell + faint outer cage + inner core + vertex nodes + dual orbit rings
    const rig = new THREE.Group();
    scene.add(rig);
    const shellGeo = new THREE.IcosahedronGeometry(1.9, 1);
    const coreGeo = new THREE.OctahedronGeometry(0.95, 0);
    const edgesA = new THREE.EdgesGeometry(shellGeo);
    const edgesB = new THREE.EdgesGeometry(coreGeo);
    const haloGeo = new THREE.IcosahedronGeometry(2.45, 2);
    const haloEdges = new THREE.EdgesGeometry(haloGeo);
    const ringGeo = new THREE.TorusGeometry(2.95, 0.005, 3, 180);
    const ringGeoB = new THREE.TorusGeometry(2.18, 0.004, 3, 144);
    const mats = {
      occluder: new THREE.MeshBasicMaterial({ color: 0x0a0a0a, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
      halo: new THREE.LineBasicMaterial({ color: 0xf2f1ee, transparent: true, opacity: 0.14 }),
      shell: new THREE.LineBasicMaterial({ color: 0xf2f1ee, transparent: true, opacity: 0.5 }),
      core: new THREE.LineBasicMaterial({ color: 0xf2f1ee, transparent: true, opacity: 0.9 }),
      nodes: new THREE.PointsMaterial({ color: 0xf2f1ee, size: 0.06, sizeAttenuation: true, transparent: true, opacity: 0.9 }),
      ring: new THREE.MeshBasicMaterial({ color: 0x777777, transparent: true, opacity: 0.6 }),
    };
    const shell = new THREE.Group();

    // Palette follows <html data-theme>: the shell is painted with the page colour so it can
    // occlude its own back edges, the wireframe with the ink colour.
    const THEME = {
      light: { occ: 0xffffff, ink: 0x111111, ring: 0x8e8b84 },
      dark: { occ: 0x0a0a0a, ink: 0xf2f1ee, ring: 0x777777 },
    };
    function syncTheme() {
      const p = THEME[document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'];
      mats.occluder.color.setHex(p.occ);
      mats.halo.color.setHex(p.ink);
      mats.shell.color.setHex(p.ink);
      mats.core.color.setHex(p.ink);
      mats.nodes.color.setHex(p.ink);
      mats.ring.color.setHex(p.ring);
      wake();
    }
    document.addEventListener('themechange', syncTheme);

    const halo = new THREE.LineSegments(haloEdges, mats.halo);
    shell.add(halo, new THREE.Mesh(shellGeo, mats.occluder), new THREE.LineSegments(edgesA, mats.shell), new THREE.Points(shellGeo, mats.nodes));
    const core = new THREE.LineSegments(edgesB, mats.core);
    const ring = new THREE.Mesh(ringGeo, mats.ring);
    const ringB = new THREE.Mesh(ringGeoB, mats.ring);
    ring.rotation.x = Math.PI / 2.4;
    ringB.rotation.x = Math.PI / 1.85;
    ringB.rotation.y = Math.PI / 5;
    rig.add(shell, core, ring, ringB);

    // --- state
    const cur = sample(0);       // eased values actually drawn
    let tgt = sample(0);         // scroll-driven targets
    const ptr = { x: 0, y: 0, cx: 0, cy: 0 };
    let docH = 1, running = false, raf = 0, last = 0, dead = false, driftT = 0;
    let slow = 0, frames = 0;

    syncTheme(); // paints the object for the palette already on screen (after state, so wake() is safe)

    function measure() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      docH = Math.max(1, document.documentElement.scrollHeight - h);
      rig.userData.fit = Math.min(1, camera.aspect / 1.5);          // shrink on narrower windows
      rig.userData.xk = Math.min(1, Math.max(0.45, camera.aspect / 1.7)); // pull toward centre-right when narrower
      onScroll();
    }

    function onScroll() { tgt = sample(window.scrollY / docH); wake(); }
    function onPointer(e) { ptr.x = (e.clientX / window.innerWidth - 0.5) * 2; ptr.y = (e.clientY / window.innerHeight - 0.5) * 2; wake(); }

    function frame(now, throttledFrame) {
      raf = 0;
      if (dead) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const k = 1 - Math.exp(-dt * 5); // frame-rate independent easing
      let moving = 0;
      for (let i = 0; i < cur.length; i++) { const d = tgt[i] - cur[i]; cur[i] += d * k; moving = Math.max(moving, Math.abs(d)); }
      ptr.cx += (ptr.x - ptr.cx) * k; ptr.cy += (ptr.y - ptr.cy) * k;
      moving = Math.max(moving, Math.abs(ptr.x - ptr.cx), Math.abs(ptr.y - ptr.cy));

      const inHero = window.scrollY < window.innerHeight * 0.6;
      if (inHero) driftT += dt; // slow idle drift only while the hero is on screen
      const fit = rig.userData.fit, xk = rig.userData.xk;
      rig.position.set(cur[0] * xk * 0.88, cur[1], 0);
      rig.scale.setScalar(cur[2] * fit * 0.82); // keeps the larger shell inside the frame next to the text column
      rig.rotation.set(cur[4] + ptr.cy * 0.12, cur[3] + driftT * 0.12 + ptr.cx * 0.18, 0);
      halo.rotation.set(driftT * 0.05, -driftT * 0.07, driftT * 0.03);
      core.rotation.set(-driftT * 0.2, driftT * 0.3, 0);
      ring.rotation.z = cur[3] * 0.5 + driftT * 0.08;
      ringB.rotation.z = -cur[3] * 0.34 - driftT * 0.06;
      canvas.style.opacity = cur[5].toFixed(3);
      renderer.render(scene, camera);

      // watchdog: if early *unthrottled* frames are consistently slow, fall back to the 2D canvas
      if (!throttledFrame && frames < 120) {
        frames++;
        if (dt > 0.034) slow++;
        if (frames === 120 && slow > 70) return degrade();
      }

      if (moving > 0.0008 || inHero) {
        running = true;
        raf = requestAnimationFrame(inHero && moving <= 0.0008 ? throttled : t => frame(t, false));
      } else running = false;
    }
    // ~30fps for the idle drift
    function throttled(now) { if (now - last < 33) { raf = requestAnimationFrame(throttled); return; } frame(now, true); }

    function wake() { if (!running && !dead && !document.hidden) { running = true; last = performance.now(); raf = requestAnimationFrame(t => frame(t, false)); } }
    function onVisibility() { if (document.hidden) { cancelAnimationFrame(raf); running = false; } else wake(); }
    function degrade() { destroy(); onDegrade && onDegrade(); }

    let resizeT;
    const onResize = () => { clearTimeout(resizeT); resizeT = setTimeout(measure, 150); };
    const ro = 'ResizeObserver' in window ? new ResizeObserver(onResize) : null;
    ro && ro.observe(document.getElementById('app'));
    const onLost = e => { e.preventDefault(); degrade(); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onLost);

    function destroy() {
      if (dead) return;
      dead = true;
      cancelAnimationFrame(raf); clearTimeout(resizeT);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('themechange', syncTheme);
      canvas.removeEventListener('webglcontextlost', onLost);
      ro && ro.disconnect();
      [shellGeo, coreGeo, haloGeo, edgesA, edgesB, haloEdges, ringGeo, ringGeoB, ...Object.values(mats)].forEach(o => o.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    }

    // Fade in gently so it never competes with first paint; drop the CSS transition afterwards so
    // per-frame opacity updates aren't smoothed twice.
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 1.2s ease';
    setTimeout(() => { canvas.style.transition = 'none'; }, 1300);
    measure();
    return { destroy };
  }

  return { supported, start };
})();
window.Hero3D = Hero3D;
