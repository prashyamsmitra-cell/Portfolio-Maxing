/* ============================================================
   GITHUB — live repo metadata, merged with curated project data.
   Source order: /api/github (server-side, cached, optional token) →
   direct unauthenticated GitHub API (public data only, cached in sessionStorage).
   No token ever lives in this file.
   ============================================================ */
const GitHub = (() => {
  const CACHE_KEY = 'gh-repos-v1';
  const CACHE_MS = 10 * 60 * 1000;
  let pending = null;

  const shape = r => ({
    name: r.name, fullName: r.full_name, description: r.description, url: r.html_url,
    homepage: r.homepage || null, language: r.language, stars: r.stargazers_count, forks: r.forks_count,
    topics: r.topics || [], pushedAt: r.pushed_at, fork: !!r.fork, archived: !!r.archived,
  });

  function summarise(repos, user) {
    const languages = {};
    repos.forEach(r => { if (r.language) languages[r.language] = (languages[r.language] || 0) + 1; });
    return {
      user: { login: user }, repos, languages,
      totals: { repos: repos.length, stars: repos.reduce((n, r) => n + r.stars, 0), lastPush: repos.reduce((m, r) => (r.pushedAt > m ? r.pushedAt : m), '') },
    };
  }

  async function viaApi() {
    const url = window.PortfolioConfig ? window.PortfolioConfig.apiUrl('/api/github') : '/api/github';
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) throw new Error('api unavailable');
    return res.json();
  }

  async function viaDirect() {
    const user = DATA.identity.githubUser;
    try {
      const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (c && Date.now() - c.at < CACHE_MS && c.user === user) return c.data;
    } catch { /* storage unavailable or corrupt — ignore */ }
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed&type=owner`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(res.status === 403 ? 'rate limited' : 'github error');
    const data = summarise((await res.json()).map(shape).filter(r => !r.fork && !r.archived), user);
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), user, data })); } catch { /* ignore */ }
    return data;
  }

  /** Resolves with repo data, or rejects if both sources fail. Memoised per page load. */
  function load() {
    if (!pending) {
      pending = viaApi().catch(viaDirect);
      pending.catch(() => { pending = null; }); // allow retry after failure
    }
    return pending;
  }

  const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  /** Attach `repo` to each curated project: explicit githubRepo first, then repoHint against repo names. */
  function mergeProjects(projects, repos) {
    const used = new Set();
    const merged = projects.map(p => {
      let repo = null;
      if (p.githubRepo) repo = repos.find(r => r.fullName.toLowerCase() === p.githubRepo.toLowerCase());
      else if (p.repoHint) repo = repos.find(r => !used.has(r.fullName) && norm(r.name).includes(norm(p.repoHint)));
      if (repo) used.add(repo.fullName);
      return { ...p, repo: repo || null };
    });
    return { projects: merged, other: repos.filter(r => !used.has(r.fullName)) };
  }

  function ago(iso) {
    if (!iso) return '';
    const d = Math.floor((Date.now() - new Date(iso)) / 864e5);
    if (d < 1) return 'TODAY';
    if (d < 31) return `${d}D AGO`;
    if (d < 365) return `${Math.floor(d / 30)}MO AGO`;
    return `${Math.floor(d / 365)}Y AGO`;
  }

  return { load, mergeProjects, ago };
})();
window.GitHub = GitHub;
