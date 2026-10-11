/* ============================================================
   VIEWS — reusable HTML builders for data-driven components.
   Pure string builders (no DOM side effects) except bindExplorer().
   Everything that comes from outside the bundle (GitHub, DB) is escaped.
   ============================================================ */
const Views = (() => {
  const esc = Markdown.esc;
  const ext = (href, label) => `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" data-cursor="OPEN ↗" class="wlink">${label} ↗</a>`;

  /* ---------- projects ---------- */
  const repoUrls = p => ({
    github: p.links?.github || p.repo?.url || null,
    live: p.links?.live || p.repo?.homepage || null,
  });
  const toneClass = p => `tone-${esc((p.visualTone || p.slug || 'system').toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`;

  function projectVisual(p, opts = {}) {
    const img = p.coverImage || (Array.isArray(p.screenshots) && p.screenshots[0]) || null;
    const label = p.visualLabel || p.category || 'SYSTEM PREVIEW';
    const alt = p.coverAlt || `${p.name} project visual`;
    const loading = opts.eager ? 'eager' : 'lazy';
    const placeholder = img ? '' : 'placeholder';
    return `
      <div class="project-art ${toneClass(p)} ${opts.large ? 'large' : ''} ${placeholder}">
        ${img ? `<img class="project-shot" src="${esc(img)}" alt="${esc(alt)}" loading="${loading}" decoding="async">` : ''}
        <div class="project-art-fallback" aria-hidden="${img ? 'true' : 'false'}">
          <span class="pa-kicker">${esc(label)}</span>
          <span class="pa-title">${esc(p.name)}</span>
          <span class="pa-module primary"></span>
          <span class="pa-module secondary"></span>
          <span class="pa-module tertiary"></span>
          <span class="pa-scan"></span>
          <span class="pa-line one"></span>
          <span class="pa-line two"></span>
          <span class="pa-grid"></span>
          <span class="pa-index">${esc(p.num)}</span>
        </div>
      </div>`;
  }

  function projectLinks(p) {
    const { github, live } = repoUrls(p);
    return [github && ext(github, 'GITHUB'), live && ext(live, 'LIVE')].filter(Boolean).join('');
  }

  function repoMeta(p) {
    const r = p.repo;
    if (!r) return '';
    return [`★ ${r.stars}`, r.language ? esc(r.language.toUpperCase()) : '', r.pushedAt ? `UPDATED ${GitHub.ago(r.pushedAt)}` : '']
      .filter(Boolean).map(t => `<span>${t}</span>`).join('');
  }

  function workItem(p, i = 0, opts = {}) {
    return `
      <article class="work-item ${i % 2 ? 'alt' : ''} ${opts.featured ? 'is-featured' : ''} ${opts.compact ? 'is-compact' : ''}" data-stagger data-project="${esc(p.slug)}" data-cursor="VIEW PROJECT">
        <div class="work-link">
          <div class="work-visual" data-stagger-item>
            <div class="work-visual-inner" data-parallax>
              ${projectVisual(p, { large: opts.featured })}
            </div>
          </div>
          <div class="work-info">
            <span class="work-num" data-stagger-item>${esc(p.num)}</span>
            <h3 class="work-name" data-stagger-item><a class="work-stretch" href="#/work/${esc(p.slug)}" data-route>${esc(p.name)}</a></h3>
            <p class="work-tagline" data-stagger-item>${esc(p.tagline)}</p>
            <p class="work-short" data-stagger-item>${esc(p.short)}</p>
            <div class="work-tech" data-stagger-item>${p.technologies.map(t => `<span>${esc(t)}</span>`).join('')}</div>
            <div class="work-live" data-stagger-item>${repoMeta(p)}</div>
            <div class="work-links" data-stagger-item>${projectLinks(p)}</div>
          </div>
        </div>
      </article>`;
  }

  function projectCta(p) {
    const { github, live } = repoUrls(p);
    return [
      github && `<a href="${esc(github)}" target="_blank" rel="noopener noreferrer" class="btn-solid" data-cursor="OPEN ↗">SOURCE CODE ↗</a>`,
      live && `<a href="${esc(live)}" target="_blank" rel="noopener noreferrer" class="btn-line" data-cursor="OPEN ↗">LIVE APPLICATION ↗</a>`,
    ].filter(Boolean).join('');
  }

  /** Refresh live bits (links + GitHub meta) on already-rendered project cards/pages. */
  function decorateProjects(root, merged) {
    merged.forEach(p => {
      root.querySelectorAll(`[data-project="${CSS.escape(p.slug)}"]`).forEach(card => {
        const live = card.querySelector('.work-live'); if (live) live.innerHTML = repoMeta(p);
        const links = card.querySelector('.work-links'); if (links) links.innerHTML = projectLinks(p);
      });
    });
  }

  /* ---------- posts ---------- */
  function postRow(p) {
    const meta = [p.readMin ? `${p.readMin} MIN READ` : '', (p.images && p.images.length > 1) ? `${p.images.length} PHOTOS` : '', ...p.tags.slice(0, 3).map(t => `#${esc(t)}`)].filter(Boolean).join(' · ');
    return `
      <a href="#/journal/${esc(p.slug)}" data-route class="journal-row ${p.cover ? 'has-cover' : ''}" data-cursor="READ" data-stagger-item data-tags="${esc(p.tags.join('|').toUpperCase())}">
        <span class="j-date">${esc(p.date)}</span>
        <span class="j-cat ${esc(Posts.catClass(p.category))}">${esc(p.category)}</span>
        <span class="j-title">${esc(p.title)}${p.featured ? ' <span class="j-flag">FEATURED</span>' : ''}</span>
        ${p.excerpt ? `<span class="j-excerpt">${esc(p.excerpt)}</span>` : ''}
        <span class="j-meta">${meta}</span>
        ${p.cover ? `<img class="j-cover" src="${esc(p.cover)}" alt="" loading="lazy" decoding="async">` : ''}
        <span class="j-arrow" aria-hidden="true">→</span>
      </a>`;
  }

  const postRowCompact = p => `
      <a href="#/journal/${esc(p.slug)}" data-route class="journal-row" data-cursor="READ" data-stagger-item>
        <span class="j-date">${esc(p.date)}</span>
        <span class="j-cat ${esc(Posts.catClass(p.category))}">${esc(p.category)}</span>
        <span class="j-title">${esc(p.title)}</span>
        <span class="j-arrow" aria-hidden="true">→</span>
      </a>`;

  /* ---------- states ---------- */
  const skeleton = (rows = 3, label = 'LOADING') => `
    <div class="skeleton" role="status" aria-live="polite"><span class="sr-only">${label}…</span>${'<div class="sk-row" aria-hidden="true"></div>'.repeat(rows)}</div>`;
  const stateBox = (title, text, action) => `
    <div class="state-box" role="status"><span class="state-title">${esc(title)}</span><p>${esc(text)}</p>${action ? `<button class="btn-line" type="button" data-action="${esc(action[0])}">${esc(action[1])}</button>` : ''}</div>`;

  /* ---------- repository explorer ---------- */
  function explorerShell() {
    return `
    <section class="section explorer" id="explorer" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">02</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">REPOSITORY EXPLORER</span>
      </div>
      <h2 class="section-heading" data-seq="heading">LIVE FROM<br>GITHUB</h2>
      <div id="explorer-body" data-seq="text">${skeleton(4, 'LOADING REPOSITORIES')}</div>
    </section>`;
  }

  const SORTS = [['featured', 'FEATURED'], ['recent', 'RECENTLY UPDATED'], ['stars', 'MOST STARRED']];

  function bindExplorer(host, data, merged, onRetry) {
    const byName = new Map(merged.projects.filter(p => p.repo).map(p => [p.repo.fullName, p]));
    const items = data.repos.map(repo => {
      const project = byName.get(repo.fullName) || null;
      return { repo, project, type: (project?.category || repo.topics[0] || 'other').toUpperCase() };
    });
    if (!items.length) { host.innerHTML = stateBox('NO PUBLIC REPOSITORIES', 'Nothing to show from GitHub yet.'); return; }

    const langs = [...new Set(items.map(i => i.repo.language).filter(Boolean))].sort();
    const types = [...new Set(items.map(i => i.type))].sort();
    const st = { sort: 'featured', lang: null, type: null };

    const chips = (label, key, values) => values.length < 2 ? '' : `
      <div class="ex-group" role="group" aria-label="${label}">
        <span class="ex-label">${label}</span>
        <button type="button" class="j-filter" data-key="${key}" data-val="" aria-pressed="${st[key] === null}">ALL</button>
        ${values.map(v => `<button type="button" class="j-filter" data-key="${key}" data-val="${esc(v)}" aria-pressed="${st[key] === v}">${esc(v.toUpperCase())}</button>`).join('')}
      </div>`;

    function visible() {
      const rank = i => (i.project?.featured ? 0 : i.project ? 1 : 2);
      const cmp = {
        featured: (a, b) => rank(a) - rank(b) || b.repo.pushedAt.localeCompare(a.repo.pushedAt),
        recent: (a, b) => b.repo.pushedAt.localeCompare(a.repo.pushedAt),
        stars: (a, b) => b.repo.stars - a.repo.stars || b.repo.pushedAt.localeCompare(a.repo.pushedAt),
      }[st.sort];
      return items.filter(i => (!st.lang || i.repo.language === st.lang) && (!st.type || i.type === st.type)).sort(cmp);
    }

    function row({ repo, project, type }) {
      const title = project
        ? `<a class="work-stretch" href="#/work/${esc(project.slug)}" data-route>${esc(project.name)}</a>`
        : `<a class="work-stretch" href="${esc(repo.url)}" target="_blank" rel="noopener noreferrer">${esc(repo.name)}</a>`;
      return `
        <li class="repo-row" data-cursor="${project ? 'VIEW PROJECT' : 'OPEN ↗'}">
          <span class="repo-type">${esc(type)}${project?.featured ? ' · FEATURED' : ''}</span>
          <h3 class="repo-name">${title}</h3>
          <p class="repo-desc">${esc(project?.short || repo.description || 'No description provided.')}</p>
          <div class="repo-meta">
            <span>★ ${repo.stars}</span><span>⑂ ${repo.forks}</span>
            ${repo.language ? `<span>${esc(repo.language.toUpperCase())}</span>` : ''}
            <span>UPDATED ${GitHub.ago(repo.pushedAt)}</span>
          </div>
          <div class="repo-links">
            ${project ? ext(repo.url, 'REPO') : ''}${repo.homepage && /^https?:\/\//i.test(repo.homepage) ? ext(repo.homepage, 'DEMO') : ''}
          </div>
        </li>`;
    }

    function draw() {
      const list = visible();
      host.innerHTML = `
        <div class="ex-controls">
          <div class="ex-group" role="group" aria-label="Sort">
            <span class="ex-label">SORT</span>
            ${SORTS.map(([k, l]) => `<button type="button" class="j-filter" data-sort="${k}" aria-pressed="${st.sort === k}">${l}</button>`).join('')}
          </div>
          ${chips('LANGUAGE', 'lang', langs)}${chips('TYPE', 'type', types)}
        </div>
        <p class="ex-count" aria-live="polite">${list.length} OF ${items.length} REPOSITORIES${data.stale ? ' · CACHED' : ''}</p>
        ${list.length ? `<ul class="repo-list">${list.map(row).join('')}</ul>` : stateBox('NO MATCHES', 'No repositories match these filters.', ['reset', 'RESET FILTERS'])}`;
    }

    host.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.sort) st.sort = b.dataset.sort;
      else if (b.dataset.key) st[b.dataset.key] = b.dataset.val || null;
      else if (b.dataset.action === 'reset') { st.lang = null; st.type = null; }
      else return;
      // Redraw replaces the buttons, so put focus back on the equivalent control.
      const sel = b.dataset.sort ? `[data-sort="${CSS.escape(b.dataset.sort)}"]`
        : b.dataset.key ? `[data-key="${b.dataset.key}"][data-val="${CSS.escape(b.dataset.val)}"]` : '.ex-controls .j-filter';
      draw();
      host.querySelector(sel)?.focus({ preventScroll: true });
    };
    draw();
  }

  return { workItem, projectVisual, projectLinks, projectCta, decorateProjects, postRow, postRowCompact, skeleton, stateBox, explorerShell, bindExplorer };
})();
window.Views = Views;
