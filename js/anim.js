/* ============================================================
   ANIMATION SYSTEM — reusable, coherent, Anime.js based.
   ============================================================ */

const Anim = (() => {

  const EASE = {
    expo: 'easeOutExpo',
    quart: 'easeOutQuart',
    quartInOut: 'easeInOutQuart',
    cubic: 'easeOutCubic'
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Wrap words in spans for staggered reveals */
  function splitWords(el) {
    if (el.dataset.split) return;
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    text.split(/\s+/).forEach((w, i, arr) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = w;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.dataset.split = '1';
  }

  function splitLines(el) {
    // split by explicit <br> into line spans
    if (el.dataset.lsplit) return;
    const html = el.innerHTML;
    const parts = html.split(/<br\s*\/?>/i);
    el.innerHTML = '';
    parts.forEach((p, i) => {
      const span = document.createElement('span');
      span.className = 'line-mask';
      span.innerHTML = `<span class="line-inner">${p}</span>`;
      el.appendChild(span);
      if (i < parts.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.dataset.lsplit = '1';
  }

  /* Reveal text word-by-word */
  function revealText(target, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    splitWords(el);
    if (reduced) return;
    anime.set(el.querySelectorAll('.w'), { opacity: 0, translateY: '0.6em' });
    return anime({
      targets: el.querySelectorAll('.w'),
      opacity: [0, 1],
      translateY: ['0.6em', '0em'],
      delay: anime.stagger(opts.stagger || 35, { start: opts.delay || 0 }),
      duration: opts.duration || 900,
      easing: EASE.expo
    });
  }

  /* Reveal text line-by-line (for masked hero headings) */
  function revealLines(target, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    splitLines(el);
    if (reduced) return;
    const inners = el.querySelectorAll('.line-inner');
    anime.set(inners, { translateY: '110%' });
    return anime({
      targets: inners,
      translateY: ['110%', '0%'],
      delay: anime.stagger(opts.stagger || 140, { start: opts.delay || 0 }),
      duration: opts.duration || 1100,
      easing: EASE.expo
    });
  }

  /* Generic section reveal: marker → line → heading → text → visual → meta */
  function revealSection(section, opts = {}) {
    if (!section) return;
    const q = s => section.querySelector(s);
    const seq = [];
    const push = (sel, animFn) => {
      const el = q(sel);
      if (el) seq.push({ el, animFn });
    };

    push('[data-seq="marker"]', el => anime({ targets: el, opacity: [0, 1], translateY: ['1.2rem', '0rem'], duration: 700, easing: EASE.expo }));
    push('[data-seq="line"]', el => anime({ targets: el, scaleX: [0, 1], duration: 900, easing: EASE.quartInOut, transformOrigin: '0 50%' }));
    push('[data-seq="heading"]', el => revealLines(el, { delay: 0 }));
    push('[data-seq="text"]', el => anime({ targets: el, opacity: [0, 1], translateY: ['1.5rem', '0rem'], duration: 900, easing: EASE.expo }));
    push('[data-seq="visual"]', el => anime({ targets: el, opacity: [0, 1], translateY: ['2.5rem', '0rem'], scale: [0.97, 1], duration: 1100, easing: EASE.expo }));
    push('[data-seq="meta"]', el => anime({ targets: el, opacity: [0, 1], translateY: ['0.8rem', '0rem'], duration: 700, easing: EASE.quart }));

    if (reduced) {
      seq.forEach(({ el }) => anime.set(el, { opacity: 1 }));
      return;
    }

    let t = opts.start || 0;
    const step = opts.step || 150;
    seq.forEach(({ el, animFn }, i) => {
      setTimeout(() => animFn(el), t);
      t += (i === 0 ? 0 : step);
    });
  }

  /* Stagger a list of items upward */
  function staggerItems(targets, opts = {}) {
    const els = typeof targets === 'string' ? document.querySelectorAll(targets) : targets;
    if (!els || !els.length) return;
    if (reduced) { anime.set(els, { opacity: 1 }); return; }
    anime.set(els, { opacity: 0, translateY: '2rem' });
    return anime({
      targets: els,
      opacity: [0, 1],
      translateY: ['2rem', '0rem'],
      delay: anime.stagger(opts.stagger || 90, { start: opts.delay || 0 }),
      duration: opts.duration || 900,
      easing: EASE.expo
    });
  }

  /* Draw a horizontal/vertical line */
  function animateLine(target, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (reduced) { anime.set(el, { scaleX: 1, scaleY: 1 }); return; }
    const horizontal = opts.axis !== 'y';
    anime.set(el, horizontal ? { scaleX: 0 } : { scaleY: 0 });
    return anime({
      targets: el,
      [horizontal ? 'scaleX' : 'scaleY']: [0, 1],
      duration: opts.duration || 1200,
      delay: opts.delay || 0,
      easing: EASE.quartInOut,
      transformOrigin: opts.origin || '0 50%'
    });
  }

  /* Counter animation */
  function animateCounter(target, endValue, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (reduced) { el.textContent = endValue.toLocaleString() + (opts.suffix || ''); return; }
    const obj = { v: 0 };
    return anime({
      targets: obj,
      v: endValue,
      duration: opts.duration || 1800,
      delay: opts.delay || 0,
      easing: EASE.quart,
      update: () => { el.textContent = Math.round(obj.v).toLocaleString() + (opts.suffix || ''); }
    });
  }

  /* Scroll-linked parallax on an element */
  function parallaxElement(target, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el || reduced) return;
    const speed = opts.speed || 0.15;
    const clamp = opts.clamp || 120;
    let ticking = false;
    function update() {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2 - window.innerHeight / 2;
      const y = Math.max(-clamp, Math.min(clamp, -mid * speed));
      el.style.transform = `translate3d(0, ${y}px, 0)`;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* Scroll progress of an element through the viewport: 0 → 1 */
  function scrollProgress(el) {
    const r = el.getBoundingClientRect();
    const total = r.height + window.innerHeight;
    return Math.min(1, Math.max(0, (window.innerHeight - r.top) / total));
  }

  /* IntersectionObserver-driven scroll animations */
  function initScrollAnimations() {
    const seen = new WeakSet();

    const seqObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !seen.has(e.target)) {
          seen.add(e.target);
          revealSection(e.target);
          seqObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 });

    document.querySelectorAll('[data-reveal-section]').forEach(s => seqObserver.observe(s));

    const itemObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !seen.has(e.target)) {
          seen.add(e.target);
          const items = e.target.querySelectorAll('[data-stagger-item]');
          staggerItems(items.length ? items : e.target.children, {
            stagger: parseInt(e.target.dataset.stagger || '90', 10)
          });
          itemObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-stagger]').forEach(s => itemObserver.observe(s));

    const lineObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !seen.has(e.target)) {
          seen.add(e.target);
          animateLine(e.target, { axis: e.target.dataset.axis });
          lineObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('[data-draw-line]').forEach(l => lineObserver.observe(l));

    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !seen.has(e.target)) {
          seen.add(e.target);
          animateCounter(e.target, parseInt(e.target.dataset.count, 10), { suffix: e.target.dataset.suffix || '' });
          counterObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(c => counterObserver.observe(c));
  }

  /* Cinematic page transition. dir: 'in' | 'out'. Returns promise. */
  function pageTransition(dir, label) {
    return new Promise(resolve => {
      const overlay = document.getElementById('page-transition');
      const title = overlay.querySelector('.pt-title');
      if (reduced) { resolve(); return; }

      if (dir === 'out') {
        title.textContent = label || '';
        overlay.classList.add('active');
        anime.timeline({ complete: resolve })
          .add({ targets: overlay, clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], duration: 420, easing: EASE.quartInOut })
          .add({ targets: title, opacity: [0, 1], translateY: ['1rem', '0rem'], duration: 300, easing: EASE.quart }, '-=180')
          .add({ targets: title, opacity: [1, 0], translateY: ['0rem', '-1rem'], duration: 240, easing: EASE.quart }, '+=120');
      } else {
        anime.timeline({ complete: () => { overlay.classList.remove('active'); resolve(); } })
          .add({ targets: overlay, clipPath: ['inset(0 0 0% 0)', 'inset(0 0 100% 0)'], duration: 480, easing: EASE.quartInOut, delay: 80 });
      }
    });
  }

  /* Custom cursor */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const cursor = document.getElementById('cursor');
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    const label = cursor.querySelector('.cursor-label');
    if (!cursor) return;

    let x = -100, y = -100, rx = -100, ry = -100;
    let mode = 'default';

    document.addEventListener('mousemove', e => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });

    (function loop() {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();

    function setMode(m, text) {
      if (mode === m) return;
      mode = m;
      cursor.dataset.mode = m;
      label.textContent = text || '';
    }

    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) { setMode('label', t.dataset.cursor); return; }
      const link = e.target.closest('a, button, [role="button"]');
      if (link) { setMode('hover', ''); return; }
      setMode('default', '');
    }, { passive: true });

    document.addEventListener('mouseleave', () => setMode('default', ''));
    document.documentElement.classList.add('has-cursor');
  }

  return {
    EASE, reduced,
    revealText, revealLines, revealSection, staggerItems,
    animateLine, animateCounter, parallaxElement, scrollProgress,
    initScrollAnimations, pageTransition, initCursor, splitWords
  };
})();

window.Anim = Anim;
