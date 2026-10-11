/* ============================================================
   ENGINEERING CONSTELLATION — canvas placeholder for a future
   Three.js scene. Concept: how software gets built.
   USER → APPLICATION → API → DATABASE → AI MODEL → DEPLOYMENT
   ============================================================ */

function initConstellation(canvas) {
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  const LABELS = ['USER', 'APPLICATION', 'API', 'DATABASE', 'AI MODEL', 'DEPLOYMENT'];
  const N = LABELS.length;

  // Ink colour follows the palette: the CSS token is the single source of truth.
  let INK = '242,241,238';
  function readInk() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--fg-rgb').trim();
    if (v) INK = v;
    if (reduced && W) draw(0); // static mode has no loop to pick it up
  }
  readInk();
  document.addEventListener('themechange', readInk);

  let W, H, dpr;
  let nodes = [];
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let scrollT = 0; // 0 = hero start, 1 = hero scrolled away
  let raf;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    nodes = [];
    // Network arranged as an organic constellation, slightly right of centre
    const cx = W * (coarse ? 0.5 : 0.66);
    const cy = H * 0.52;
    const spreadX = Math.min(W * 0.3, 380);
    const spreadY = Math.min(H * 0.32, 260);

    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      // organic path: gentle S-curve
      const px = cx + Math.sin(t * Math.PI * 1.4) * spreadX * 0.55 + (t - 0.5) * spreadX * 0.5;
      const py = cy + (t - 0.5) * spreadY * 2 * 0.8 + Math.cos(t * Math.PI * 2) * 24;
      nodes.push({
        label: LABELS[i],
        x: px, y: py,
        bx: px, by: py,       // base position
        r: i === 0 || i === N - 1 ? 5 : 3.5,
        phase: Math.random() * Math.PI * 2,
        depth: 0.4 + Math.random() * 0.6
      });
    }

    const count = coarse ? 26 : 64;
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.4 + 0.4,
        a: Math.random() * 0.35 + 0.08
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // scroll-driven reorganisation: nodes tighten & brighten as hero scrolls out
    const focus = 1 - scrollT; // 1 at top

    // particles
    particles.forEach(p => {
      if (!reduced) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      }
      ctx.globalAlpha = p.a * (0.5 + focus * 0.5);
      ctx.fillStyle = '#9a9a9a';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // connections between consecutive nodes
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i], b = nodes[i + 1];
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, `rgba(${INK},${0.16 + focus * 0.1})`);
      grad.addColorStop(1, `rgba(${INK},${0.05 + focus * 0.05})`);
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      // slight curve
      const mx = (a.x + b.x) / 2 + Math.sin(t * 0.0004 + i) * 8;
      const my = (a.y + b.y) / 2 + Math.cos(t * 0.0004 + i) * 8;
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.stroke();

      // travelling pulse
      if (!reduced) {
        const p = ((t * 0.00012 + i * 0.17) % 1);
        const px = a.x + (b.x - a.x) * p;
        const py = a.y + (b.y - a.y) * p;
        ctx.fillStyle = `rgba(${INK},${0.5 * focus + 0.15})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // nodes
    nodes.forEach((n, i) => {
      // float
      if (!reduced) {
        n.x = n.bx + Math.sin(t * 0.0006 + n.phase) * 6 * n.depth;
        n.y = n.by + Math.cos(t * 0.0005 + n.phase) * 6 * n.depth;
      }

      // mouse repulsion
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 120 && d > 0.01) {
        const f = (120 - d) / 120 * 14;
        n.x += (dx / d) * f;
        n.y += (dy / d) * f;
      }

      // glow ring
      ctx.strokeStyle = `rgba(${INK},${0.10 + focus * 0.08})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 7, 0, Math.PI * 2);
      ctx.stroke();

      // core
      ctx.fillStyle = `rgba(${INK},${0.55 + focus * 0.35})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      // label
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(${INK},${0.4 + focus * 0.25})`;
      ctx.textAlign = 'left';
      ctx.fillText(n.label, n.x + 12, n.y + 3);

      // index
      ctx.fillStyle = `rgba(${INK},${0.22 + focus * 0.15})`;
      ctx.fillText(String(i).padStart(2, '0'), n.x + 12, n.y + 14);
    });
  }

  function loop(t) {
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  // scroll progress of the hero section
  function onScroll() {
    const hero = canvas.closest('.hero') || canvas.parentElement;
    const r = hero.getBoundingClientRect();
    scrollT = Math.min(1, Math.max(0, -r.top / (r.height * 0.9)));
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  resize();
  onScroll();

  if (reduced) {
    draw(0); // single static frame
  } else {
    raf = requestAnimationFrame(loop);
  }

  // expose for future Three.js replacement
  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('themechange', readInk);
    }
  };
}

window.initConstellation = initConstellation;
