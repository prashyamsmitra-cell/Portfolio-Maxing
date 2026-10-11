/* ============================================================
   THEME — light / dark switch for the monochrome palette.
   index.html applies the stored theme before first paint; this
   module owns the toggle, persistence and the reveal animation:
   View Transitions (circular wipe out of the button) when the
   browser has it, an equivalent clip-path iris when it doesn't.
   ============================================================ */

const Theme = (() => {
  const KEY = 'psm-theme';
  const root = document.documentElement;
  const FAVICON = {
    light: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23ffffff'/%3E%3Ctext x='6' y='22' font-family='Georgia' font-size='16' fill='%23111111'%3EP%3C/text%3E%3C/svg%3E",
    dark: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230a0a0a'/%3E%3Ctext x='6' y='22' font-family='Georgia' font-size='16' fill='%23f2f1ee'%3EP%3C/text%3E%3C/svg%3E",
  };

  let button = null;
  let busy = false;

  const get = () => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  const target = theme => (theme === 'dark' ? 'light' : 'dark');
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sync(theme) {
    if (!button || !button.isConnected) return;
    const label = button.querySelector('.tt-label');
    const next = target(theme);
    if (label) label.textContent = next.toUpperCase();
    button.setAttribute('aria-label', `Switch to ${next} theme`);
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  /** Flip the palette, the chrome around it, and tell the canvases. */
  function paint(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) { /* private mode: choice dies with the tab */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
    const icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.setAttribute('href', FAVICON[theme]);
    sync(theme);
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  /* ---- fallback: a disc of the current palette grows from the click, covers the
          screen, and dissolves to reveal the next one (same read as the View Transition) ---- */
  function iris(next, x, y, r, done) {
    const before = getComputedStyle(document.body).backgroundColor;
    const wipe = document.createElement('div');
    wipe.className = 'theme-wipe';
    wipe.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    wipe.style.background = before;
    document.body.appendChild(wipe);
    const dissolve = () =>
      wipe.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease', fill: 'forwards' }).finished;
    wipe.animate(
      [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }],
      { duration: 620, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
    ).finished
      .then(() => { paint(next); return dissolve(); })
      .then(() => wipe.remove())
      .catch(() => { paint(next); wipe.remove(); })
      .finally(done);
  }

  /** Toggle with an iris reveal that starts at the button. */
  function toggle(clientX, clientY) {
    if (busy) return;
    const next = target(get());
    const rect = button?.getBoundingClientRect();
    const x = Number.isFinite(clientX) && clientX > 0 ? clientX : rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = Number.isFinite(clientY) && clientY > 0 ? clientY : rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    if (reduced()) { paint(next); return; }

    if (document.startViewTransition) {
      root.style.setProperty('--vt-x', `${x}px`);
      root.style.setProperty('--vt-y', `${y}px`);
      root.style.setProperty('--vt-r', `${Math.ceil(r)}px`);
      busy = true;
      let vt;
      try { vt = document.startViewTransition(() => paint(next)); }
      catch { paint(next); busy = false; return; }
      vt.finished.then(() => busy = false, () => busy = false);
      vt.finished.finally(() => {
        root.style.removeProperty('--vt-x');
        root.style.removeProperty('--vt-y');
        root.style.removeProperty('--vt-r');
      });
      return;
    }

    busy = true;
    iris(next, x, y, r, () => { busy = false; });
  }

  /** Called once the nav exists — keeps the button in step with the palette. */
  function bind(el) {
    button = el;
    sync(get());
    el.addEventListener('click', e => toggle(e.clientX, e.clientY));
  }

  paint(get()); // first load: favicon + meta follow whatever index.html applied

  return { get, toggle, bind, paint };
})();

window.Theme = Theme;
