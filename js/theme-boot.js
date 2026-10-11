/* Runs in <head> before first paint (external because the CSP forbids inline scripts).
   Applies the stored theme; js/theme.js is what writes the key on every toggle. */
(function () {
  try {
    var t = localStorage.getItem('psm-theme');
    t = (t === 'dark') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '#0f0d0c' : '#faf9f7');
  } catch (e) { /* private mode — keep the markup default */ }
})();
