/* ============================================================
   APP — hash router, page templates, nav, cursor, boot.
   ============================================================ */

const App = (() => {

  const root = document.getElementById('app');
  const nav = document.getElementById('nav');
  let cleanupFns = [];
  let renderToken = 0; // lets async hydrators ignore responses that arrive after the user navigated away
  const BASE_TITLE = document.title;
  const $ = sel => root.querySelector(sel);

  /* ---------------- helpers ---------------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const projectBySlug = slug => DATA.projects.find(p => p.slug === slug);
  const relatedProject = post => DATA.projects.find(p => post.related === p.slug || post.tags.includes(p.slug)) || null;
  const handle = url => { try { return new URL(url).pathname.replace(/\/+$/, '').replace(/^\/in/, ''); } catch { return ''; } };
  const gmailCompose = (subject = '', body = '') => {
    const params = new URLSearchParams({ view: 'cm', fs: '1', to: DATA.identity.email, su: subject, body });
    return `https://mail.google.com/mail/?${params}`;
  };

  /* ---------------- templates ---------------- */

  function navHTML() {
    return `
      <a class="nav-logo" href="#/" data-route aria-label="Home — Prashyam Sankar Mitra">
        PSM<span class="nav-logo-dot">.</span>
      </a>
      <div class="nav-right">
        <nav class="nav-links" aria-label="Primary">
          ${[
            ['work', 'WORK'], ['journal', 'JOURNAL'], ['experience', 'EXPERIENCE'],
            ['about', 'ABOUT'], ['contact', 'CONTACT']
          ].map(([r, label], i) => `
            <a href="#/${r}" data-route data-nav="${r}" class="nav-link">
              <span class="nav-num">0${i + 1}</span>${label}
            </a>`).join('')}
        </nav>
        <button class="theme-toggle" id="theme-toggle" type="button" aria-pressed="false" aria-label="Switch theme" data-cursor="THEME">
          <span class="tt-dot" aria-hidden="true"></span><span class="tt-label">DARK</span>
        </button>
      </div>
      <button class="nav-burger" id="nav-burger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span>
      </button>
      <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
        ${[
          ['', 'HOME'], ['work', 'WORK'], ['journal', 'JOURNAL'], ['experience', 'EXPERIENCE'],
          ['about', 'ABOUT'], ['contact', 'CONTACT']
        ].map(([r, label], i) => `
          <a href="#/${r}" data-route data-nav="${r}" class="mobile-link">
            <span class="nav-num">0${i}</span>${label}
          </a>`).join('')}
      </div>`;
  }

  function footerHTML() {
    return `
      <footer class="footer">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="footer-name">PRASHYAM SANKAR MITRA</div>
            <div class="footer-role">SOFTWARE DEVELOPER · AI SYSTEMS BUILDER</div>
            <div class="footer-loc">KOLKATA, INDIA</div>
          </div>
          <div class="footer-links">
            <a href="${DATA.identity.links.github}" target="_blank" rel="noopener" data-cursor="OPEN ↗">GITHUB</a>
            <a href="${DATA.identity.links.linkedin}" target="_blank" rel="noopener" data-cursor="OPEN ↗">LINKEDIN</a>
            <a href="${gmailCompose('Hello, Prashyam')}" target="_blank" rel="noopener noreferrer" data-cursor="EMAIL ↗">EMAIL</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} PRASHYAM SANKAR MITRA</span>
          <span class="footer-status"><span class="status-dot"></span>SYSTEM STATUS — ONLINE</span>
        </div>
      </footer>`;
  }

  /* ---------- HOME ---------- */
  function homePage() {
    const featured = DATA.projects.filter(p => p.featured);
    const H = DATA.hero;
    return `
    <section class="hero" id="hero">
      <canvas class="hero-canvas" id="constellation" aria-hidden="true"></canvas>
      <div class="hero-frame" aria-hidden="true">
        <span class="hf tl">PORTFOLIO — ${new Date().getFullYear()}</span>
        <span class="hf tr">${esc(DATA.identity.location)}</span>
        <span class="hf bl">SCROLL TO EXPLORE ↓</span>
        <span class="hf br">SYSTEM v1.0</span>
      </div>
      <div class="hero-inner">
        <div class="hero-meta" data-hero-fade aria-hidden="true">
          <span>FULL-STACK</span>
          <span>AI SYSTEMS</span>
          <span>PRODUCTION UI</span>
        </div>
        <p class="hero-eyebrow" data-hero-fade>${esc(H.eyebrow)}</p>
        <h1 class="hero-name" aria-label="Prashyam Sankar Mitra">
          <span class="hero-line"><span class="hero-line-inner">PRASHYAM</span></span>
          <span class="hero-line"><span class="hero-line-inner">SANKAR</span></span>
          <span class="hero-line"><span class="hero-line-inner">MITRA</span></span>
        </h1>
        <p class="hero-intro" data-hero-fade>${esc(H.intro)}</p>
        <p class="hero-desc" data-hero-fade>${esc(H.description)}</p>
        <ul class="hero-keywords" data-hero-fade aria-label="Focus areas">${H.keywords.map(k => `<li>${esc(k)}</li>`).join('')}</ul>
        <div class="hero-cta" data-hero-fade>
          <a class="btn-solid" href="${esc(H.primaryCta.href)}" data-route data-cursor="GO">${esc(H.primaryCta.label.toUpperCase())} →</a>
          <a class="btn-line" href="${esc(H.secondaryCta.href)}" data-route data-cursor="GO">${esc(H.secondaryCta.label.toUpperCase())}</a>
        </div>
      </div>
    </section>

    <section class="section intro-strip" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">§</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">MANIFESTO</span>
      </div>
      <h2 class="intro-statement" data-seq="heading">I don't just write code.<br>I build systems.</h2>
      <p class="intro-support" data-seq="text">Software that survives contact with real users — designed, engineered and shipped end to end. This site is my archive: what I've built, how I think, and what I'm building now.</p>
    </section>

    <section class="section work-preview" id="work-preview">
      <div class="section-head" data-reveal-section>
        <span class="section-marker" data-seq="marker">01</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">SELECTED WORK</span>
      </div>
      <h2 class="section-heading" data-reveal-section data-seq="heading">ENGINEERING<br>WORK</h2>
      <div class="work-list">${featured.map(Views.workItem).join('')}</div>
      <div class="section-more" data-stagger>
        <a href="#/work" data-route class="btn-line" data-cursor="VIEW ALL" data-stagger-item>VIEW ALL PROJECTS →</a>
      </div>
    </section>

    <section class="section signal-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">02</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">ENGINEERING SIGNAL</span>
      </div>
      <h2 class="section-heading" data-seq="heading">ACTIVITY</h2>
      <p class="signal-note" id="signal-note" data-seq="text">// Public GitHub data · cached</p>
      <div class="signal-grid" id="signal-grid" role="status" aria-live="polite">
        ${['REPOSITORIES', 'STARS', 'LANGUAGES', 'LAST PUSH'].map(l => `
          <div class="signal-item"><span class="signal-value">—</span><span class="signal-label">${l}</span></div>`).join('')}
      </div>
    </section>

    <section class="section now-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">03</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">NOW</span>
      </div>
      <div class="now-grid" data-stagger>
        <div class="now-col" data-stagger-item>
          <h3 class="now-title">CURRENTLY<br>BUILDING</h3>
          <ul class="now-list">${DATA.now.building.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
        <div class="now-col" data-stagger-item>
          <h3 class="now-title">CURRENTLY<br>LEARNING</h3>
          <ul class="now-list">${DATA.now.learning.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
      </div>
    </section>

    <section class="section journal-preview" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">04</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">JOURNAL</span>
      </div>
      <h2 class="section-heading" data-seq="heading">RECENT<br>ENTRIES</h2>
      <div class="journal-list" id="home-posts">${Views.skeleton(3, 'LOADING POSTS')}</div>
      <div class="section-more">
        <a href="#/journal" data-route class="btn-line" data-cursor="VIEW ALL">ALL ENTRIES →</a>
      </div>
    </section>

    <section class="section tech-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">05</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">TECHNOLOGY CONSTELLATION</span>
      </div>
      <h2 class="section-heading" data-seq="heading">TOOLS OF<br>THE TRADE</h2>
      <div class="tech-map" data-seq="visual">
        ${Object.entries(DATA.technologies).map(([group, techs]) => `
          <div class="tech-group">
            <span class="tech-group-label">${group}</span>
            <div class="tech-nodes">
              ${techs.map(t => `<button class="tech-node" data-tech="${t}" data-cursor="INFO">${t}</button>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <div class="tech-context" id="tech-context" aria-live="polite">
        <span class="tc-label">// HOVER A TECHNOLOGY</span>
        <span class="tc-text">Hover or focus a technology to see how I've used it.</span>
      </div>
    </section>

    <section class="section contact-cta" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">06</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">CONTACT</span>
      </div>
      <h2 class="cta-statement" data-seq="heading">HAVE A PROBLEM<br>WORTH BUILDING?</h2>
      <a href="#/contact" data-route class="cta-link" data-cursor="GO" data-seq="text">LET'S BUILD IT →</a>
    </section>`;
  }

  /* ---------- WORK INDEX ---------- */
  function workPage() {
    const featured = DATA.projects.find(p => p.featured) || DATA.projects[0];
    const rest = DATA.projects.filter(p => p !== featured);
    return `
    <section class="page-hero" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">01</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">INDEX</span>
      </div>
      <h1 class="page-title" data-seq="heading">WORK</h1>
      <p class="page-sub" data-seq="text">Systems I've designed, engineered and shipped — each one a feature, not a card.</p>
    </section>
    <section class="section work-index">
      <div class="work-featured">${featured ? Views.workItem(featured, 0, { featured: true }) : ''}</div>
      <div class="work-grid">${rest.map((p, i) => Views.workItem(p, i + 1, { compact: true })).join('')}</div>
    </section>
    ${Views.explorerShell()}`;
  }

  /* ---------- PROJECT CASE STUDY ---------- */
  function projectPage(slug) {
    const p = projectBySlug(slug);
    if (!p) return notFoundPage();
    const arch = ['FRONTEND', 'BACKEND API', 'AUTH', 'DATABASE', 'AI SERVICE', 'EXTERNAL APIS'];
    return `
    <section class="page-hero project-hero" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">PROJECT ${p.num}</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <a href="#/work" data-route class="section-back" data-cursor="BACK">← ALL WORK</a>
      </div>
      <h1 class="page-title project-title" data-seq="heading">${p.name}</h1>
      <p class="project-tagline" data-seq="text">${p.tagline}</p>
      <div class="project-meta" data-seq="meta">
        <div class="pm"><span class="pm-label">ROLE</span><span class="pm-value">${p.role}</span></div>
        <div class="pm"><span class="pm-label">TIMELINE</span><span class="pm-value">${p.timeline}</span></div>
        <div class="pm"><span class="pm-label">TECH</span><span class="pm-value">${p.technologies.join(' · ')}</span></div>
        <div class="pm"><span class="pm-label">GITHUB</span><span class="pm-value work-live" data-project="${esc(p.slug)}"></span></div>
      </div>
      <div class="project-visual" data-seq="visual">
        ${Views.projectVisual(p, { large: true, eager: true })}
      </div>
    </section>

    <section class="section doc-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">A</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">THE PROBLEM</span>
      </div>
      <p class="doc-text" data-seq="text">${p.problem}</p>
    </section>

    <section class="section doc-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">B</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">WHAT I BUILT</span>
      </div>
      <p class="doc-text" data-seq="text">${p.built}</p>
    </section>

    <section class="section arch-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">C</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">ARCHITECTURE</span>
      </div>
      <div class="arch-diagram" id="arch-diagram" data-seq="visual">
        ${arch.map((n, i) => `
          <div class="arch-node" data-arch-node style="--i:${i}">
            <span class="an-index">${String(i).padStart(2, '0')}</span>
            <span class="an-label">${n}</span>
          </div>
          ${i < arch.length - 1 ? '<div class="arch-connector" data-arch-connector style="--i:' + i + '"><span class="ac-line"></span><span class="ac-arrow">↓</span></div>' : ''}
        `).join('')}
      </div>
    </section>

    <section class="section doc-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">D</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">ENGINEERING DECISIONS</span>
      </div>
      <div class="decision-table" data-stagger>
        <div class="dt-head" data-stagger-item>
          <span>DECISION</span><span>WHY</span><span>TRADEOFF</span><span>RESULT</span>
        </div>
        ${p.decisions.map(d => `
          <div class="dt-row" data-stagger-item>
            <span class="dt-cell dt-decision">${d.decision}</span>
            <span class="dt-cell">${d.why}</span>
            <span class="dt-cell dt-tradeoff">${d.tradeoff}</span>
            <span class="dt-cell dt-result">${d.result}</span>
          </div>`).join('')}
      </div>
    </section>

    <section class="section doc-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">E</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">CHALLENGES</span>
      </div>
      <div class="challenge-list" data-stagger>
        ${p.challenges.map(c => `
          <div class="challenge" data-stagger-item>
            <span class="ch-title">⚠ ${c.title}</span>
            <p class="ch-solution">${c.solution}</p>
          </div>`).join('')}
      </div>
    </section>

    <section class="section doc-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">F</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">RESULTS</span>
      </div>
      <p class="doc-text" data-seq="text">${p.results}</p>
    </section>

    <section class="section doc-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">G</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">TECHNOLOGY</span>
      </div>
      <div class="tech-nodes tech-nodes-wide" data-stagger>
        ${p.technologies.map(t => `<span class="tech-node tech-static" data-stagger-item>${t}</span>`).join('')}
      </div>
      <div class="project-cta" id="project-cta" data-seq="meta">${Views.projectCta(p)}</div>
    </section>

    <section class="section doc-section" id="related-posts" data-reveal-section hidden>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">H</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">RELATED JOURNAL</span>
      </div>
      <div class="journal-list" id="related-list"></div>
    </section>

    <section class="section next-project" data-reveal-section>
      ${(() => { const idx = DATA.projects.findIndex(x => x.slug === slug); const nx = DATA.projects[(idx + 1) % DATA.projects.length]; return `
      <a href="#/work/${nx.slug}" data-route class="next-project-link" data-cursor="NEXT">
        <span class="np-label">NEXT PROJECT</span>
        <span class="np-name">${nx.name}</span>
        <span class="np-arrow">→</span>
      </a>`; })()}
    </section>`;
  }

  /* ---------- JOURNAL ---------- */
  function journalPage() {
    return `
    <section class="page-hero" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">02</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">ARCHIVE</span>
      </div>
      <h1 class="page-title" data-seq="heading">JOURNAL</h1>
      <p class="page-sub" data-seq="text">A public engineering record — build logs, technical notes, milestones and imported LinkedIn posts.</p>
    </section>
    <section class="section">
      <div class="journal-bar">
        <div class="journal-filters" id="j-filters" role="group" aria-label="Filter entries"></div>
        <a href="#/admin/posts" data-route class="journal-write" data-cursor="${Admin.authed() ? 'WRITE' : 'SIGN IN'}">${Admin.authed() ? '+ NEW POST' : 'SIGN IN'}</a>
      </div>
      <div class="journal-list" id="journal-list" aria-live="polite">${Views.skeleton(4, 'LOADING POSTS')}</div>
      <p class="state-note" id="j-note"></p>
    </section>`;
  }

  /* ---------- JOURNAL POST ---------- */
  function journalPostPage() {
    return `<div id="post-view">${Views.skeleton(3, 'LOADING POST')}</div>`;
  }

  function postView(post, all) {
    const related = relatedProject(post);
    const i = all.findIndex(x => x.slug === post.slug);
    const prev = all[i + 1], next = all[i - 1];
    const photos = (post.images || []).filter(Boolean);
    const media = photos.length === 1
      ? `<img class="post-cover" src="${esc(photos[0])}" alt="${esc(post.title)}" decoding="async">`
      : photos.length > 1
        ? `<div class="post-gallery" role="group" aria-label="Photos from ${esc(post.title)}">${photos.map((src, n) => `<img src="${esc(src)}" alt="${esc(post.title)} — photo ${n + 1}" loading="${n === 0 ? 'eager' : 'lazy'}" decoding="async">`).join('')}</div>`
        : '';
    return `
    <section class="page-hero post-hero" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">${esc(post.category)}</span>
        <span class="section-line" data-seq="line"></span>
        <a href="#/journal" data-route class="section-back" data-cursor="BACK">← JOURNAL</a>
      </div>
      <h1 class="post-title" data-seq="heading">${esc(post.title)}</h1>
      <div class="post-meta" data-seq="meta">
        <time datetime="${esc(post.dateISO)}">${esc(post.date)}</time>
        ${post.readMin ? `<span>${post.readMin} MIN READ</span>` : ''}
        ${post.tags.map(t => `<span class="j-cat">${esc(t.toUpperCase())}</span>`).join('')}
        ${post.linkedinPost?.url ? `
          <a href="${esc(post.linkedinPost.url)}" target="_blank" rel="noopener noreferrer" data-cursor="VIEW" aria-label="View on LinkedIn" class="linkedin-link">
            <svg viewBox="0 0 24 24" fill="currentcolor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.038-1.852-3.038-1.853 0-2.136 1.445-2.136 2.939v5.668H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LINKED IN
          </a>
        ` : ''}
        ${related ? `<a href="#/work/${esc(related.slug)}" data-route data-cursor="VIEW">RELATED: ${esc(related.name)} →</a>` : ''}
      </div>
    </section>
    <section class="section post-body" data-reveal-section>
      <article>
        ${media}
        <div class="post-prose" data-seq="text">${Markdown.render(post.content)}</div>
      </article>
      <nav class="post-nav" aria-label="More posts" data-seq="meta">
        ${prev ? `<a href="#/journal/${esc(prev.slug)}" data-route data-cursor="READ" class="post-nav-link">← ${esc(prev.title)}</a>` : '<span></span>'}
        ${next ? `<a href="#/journal/${esc(next.slug)}" data-route data-cursor="READ" class="post-nav-link right">${esc(next.title)} →</a>` : '<span></span>'}
      </nav>
    </section>`;
  }

  /* ---------- ACHIEVEMENTS ---------- */
  function achievementsPage() {
    return `
    <section class="page-hero" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">§</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">ARCHIVE</span>
      </div>
      <h1 class="page-title" data-seq="heading">ACHIEVEMENTS</h1>
      <p class="page-sub" data-seq="text">An expandable record — internships, projects, education and milestones. Click any entry to expand.</p>
    </section>
    <section class="section">
      <div class="ach-list" data-stagger>
        ${DATA.achievements.map(a => `
          <div class="ach-item" data-stagger-item>
            <button class="ach-head" aria-expanded="false" data-cursor="OPEN">
              <span class="ach-date">${a.date}</span>
              <span class="ach-type">${a.type}</span>
              <span class="ach-title">${a.title}</span>
              <span class="ach-org">${a.org}</span>
              <span class="ach-toggle">+</span>
            </button>
            <div class="ach-body">
              <p>${a.description}</p>
              <div class="ach-foot">
                ${a.related ? `<a href="#/work/${a.related}" data-route data-cursor="VIEW">RELATED PROJECT →</a>` : ''}
                ${a.proof && a.proof !== '#' ? `<a href="${esc(a.proof)}" target="_blank" rel="noopener noreferrer" data-cursor="OPEN ↗">PROOF ↗</a>` : ''}
              </div>
            </div>
          </div>`).join('')}
      </div>
    </section>`;
  }

  /* ---------- EXPERIENCE ---------- */
  function experiencePage() {
    return `
    <section class="page-hero" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">03</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">TIMELINE</span>
      </div>
      <h1 class="page-title" data-seq="heading">EXPERIENCE</h1>
      <p class="page-sub" data-seq="text">From first principles to applied AI, each chapter adds a new way to build useful software.</p>
    </section>
    <section class="section">
      <div class="timeline experience-timeline" id="timeline">
        <div class="timeline-track"><span class="timeline-progress" id="timeline-progress"></span></div>
        ${DATA.experience.map((e, i) => `
          <article class="tl-item ${i % 2 ? 'right' : ''}" data-tl-item>
            <div class="tl-node" data-tl-node></div>
            <div class="tl-card" data-stagger>
              <span class="tl-year" data-stagger-item>${e.year}</span>
              <h3 class="tl-company" data-stagger-item>${e.company}</h3>
              <span class="tl-role" data-stagger-item>${e.role}</span>
              <span class="tl-period" data-stagger-item>${e.period}</span>
              <p class="tl-desc" data-stagger-item>${e.description}</p>
              <div class="tl-tech" data-stagger-item>${e.technologies.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
          </article>`).join('')}
      </div>
    </section>`;
  }

  /* ---------- ABOUT ---------- */
  function aboutPage() {
    return `
    <section class="page-hero" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">04</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">PROFILE</span>
      </div>
      <h1 class="page-title about-page-title" data-seq="heading">BUILT BY CURIOSITY.<br>SHAPED BY PRACTICE.</h1>
      <p class="page-sub" data-seq="text">A computer science student growing into an engineer through deliberate study, team challenges, and real product work.</p>
    </section>
    <section class="section about-statements" data-reveal-section>
      <div class="about-editorial">
        <div class="about-copy">
          <p class="about-kicker">LEARN WITH INTENT. BUILD WITH CARE.</p>
          <h2 class="about-line" data-seq="heading">I TURN<br>QUESTIONS INTO<br>WORKING SYSTEMS.</h2>
          <p class="about-support" data-seq="text">I began with data structures and algorithms, then moved into full-stack development and applied AI. I care about clear decisions, useful products, and the details that make software dependable.</p>
          <a class="about-link" href="#/experience" data-route>FOLLOW THE TIMELINE <span aria-hidden="true">↗</span></a>
        </div>
        <div class="about-art" data-seq="visual" role="img" aria-label="A visual timeline from 2023 to 2026">
          <span class="about-art-year">23<span>→</span>26</span>
          <span class="aa-orbit"></span>
          <span class="aa-block one"></span>
          <span class="aa-block two"></span>
          <span class="aa-block three"></span>
          <span class="aa-label">STUDY / PRACTICE / ENGINEER</span>
        </div>
      </div>
    </section>
    <section class="section about-grid" data-reveal-section>
      <div class="about-col" data-stagger>
        <h3 data-stagger-item>EDUCATION</h3>
        <p data-stagger-item>Computer Science undergraduate, building foundations in algorithms, software engineering, and applied AI.</p>
      </div>
      <div class="about-col" data-stagger>
        <h3 data-stagger-item>TECHNICAL INTERESTS</h3>
        <p data-stagger-item>Full-stack development, backend engineering, AI-powered systems, developer tooling, cloud deployment, and automation.</p>
      </div>
      <div class="about-col" data-stagger>
        <h3 data-stagger-item>ENGINEERING PHILOSOPHY</h3>
        <p data-stagger-item>Design for the conditions software actually meets: clear failure paths, useful logs, sensible fallbacks, and maintainable decisions.</p>
      </div>
      <div class="about-col" data-stagger>
        <h3 data-stagger-item>CURRENT FOCUS</h3>
        <p data-stagger-item>AI engineering · Cloud architecture · System design</p>
      </div>
      <div class="about-col" data-stagger>
        <h3 data-stagger-item>LOCATION</h3>
        <p data-stagger-item>Kolkata, India</p>
      </div>
      <div class="about-col" data-stagger>
        <h3 data-stagger-item>LINKS</h3>
        <p data-stagger-item>
          <a href="${DATA.identity.links.github}" target="_blank" rel="noopener" data-cursor="OPEN ↗">GITHUB ↗</a><br>
          <a href="${DATA.identity.links.linkedin}" target="_blank" rel="noopener" data-cursor="OPEN ↗">LINKEDIN ↗</a><br>
          <a href="${gmailCompose('Hello, Prashyam')}" target="_blank" rel="noopener noreferrer" data-cursor="EMAIL ↗">EMAIL ↗</a>
        </p>
      </div>
    </section>`;
  }

  /* ---------- CONTACT ---------- */
  function contactPage() {
    return `
    <section class="page-hero contact-hero" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">05</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">CONTACT</span>
      </div>
      <h1 class="contact-statement" data-seq="heading">HAVE A QUESTION<br>OR AN IDEA?</h1>
      <a class="contact-big" href="${gmailCompose('Hello, Prashyam')}" target="_blank" rel="noopener noreferrer" data-cursor="OPEN GMAIL ↗" data-seq="text">WRITE TO ME.</a>
      <div class="contact-links" data-stagger>
        <a href="${gmailCompose('Hello, Prashyam')}" target="_blank" rel="noopener noreferrer" data-cursor="OPEN GMAIL ↗" data-stagger-item><span>EMAIL</span><span>${DATA.identity.email}</span><span>↗</span></a>
        <a href="${DATA.identity.links.linkedin}" target="_blank" rel="noopener" data-cursor="OPEN ↗" data-stagger-item><span>LINKEDIN</span><span>${esc(handle(DATA.identity.links.linkedin))}</span><span>↗</span></a>
        <a href="${DATA.identity.links.github}" target="_blank" rel="noopener" data-cursor="OPEN ↗" data-stagger-item><span>GITHUB</span><span>${esc(handle(DATA.identity.links.github))}</span><span>↗</span></a>
      </div>
    </section>
    <section class="section contact-form-section" data-reveal-section>
      <div class="contact-form-intro">
        <h2>START A CONVERSATION</h2>
        <p>Share a product idea, a collaboration, or a question. I’ll reply to the email address you provide.</p>
      </div>
      <form class="contact-form" id="contact-form">
        <label for="contact-name">YOUR NAME <span>(OPTIONAL)</span></label>
        <input id="contact-name" name="name" type="text" maxlength="100" autocomplete="name">
        <label for="contact-email">EMAIL ADDRESS</label>
        <input id="contact-email" name="email" type="email" maxlength="254" autocomplete="email" required>
        <label for="contact-message">WHAT WOULD YOU LIKE TO DISCUSS?</label>
        <textarea id="contact-message" name="message" rows="6" maxlength="4000" required></textarea>
        <div class="contact-trap" aria-hidden="true">
          <label for="contact-website">Leave this field empty</label>
          <input id="contact-website" name="website" type="text" tabindex="-1" autocomplete="off">
        </div>
        <div class="contact-form-footer">
          <p class="contact-form-note">Your message is sent securely. Your address is used only to reply.</p>
          <button class="btn-solid contact-submit" type="submit">SEND ENQUIRY <span aria-hidden="true">↗</span></button>
        </div>
        <p class="contact-form-status" id="contact-form-status" role="status" aria-live="polite"></p>
      </form>
    </section>`;
  }

  /* ---------- RESUME (section on about) ---------- */
  function resumeSection() {
    const resumeUrl = '/assets/resume.pdf';
    return `
    <section class="section resume-section" data-reveal-section>
      <div class="section-head">
        <span class="section-marker" data-seq="marker">§</span>
        <span class="section-line" data-seq="line" data-draw-line></span>
        <span class="section-tag">RESUME / PDF</span>
      </div>
      <div class="resume-asset" data-seq="visual">
        <div class="resume-asset-head">
          <div>
            <h2>PRASHYAM SANKAR MITRA</h2>
            <p>SOFTWARE DEVELOPER / AI SYSTEMS</p>
          </div>
          <span class="resume-file-name">ASSET / RESUME.PDF</span>
        </div>
        <object class="resume-preview" data="${resumeUrl}#view=FitH" type="application/pdf" aria-label="Resume PDF preview">
          <div class="resume-fallback">
            <p>The resume preview is unavailable in this browser.</p>
            <a href="${resumeUrl}" target="_blank" rel="noopener noreferrer">OPEN THE RESUME PDF</a>
          </div>
        </object>
      </div>
      <div class="resume-actions" data-seq="meta">
        <a href="${resumeUrl}" class="btn-solid" download="resume.pdf" data-cursor="DOWNLOAD">DOWNLOAD RESUME <span aria-hidden="true">↓</span></a>
      </div>
    </section>`;
  }

  function notFoundPage() {
    return `
    <section class="page-hero" data-reveal-section>
      <h1 class="page-title" data-seq="heading">404</h1>
      <p class="page-sub" data-seq="text">This route doesn't exist yet.</p>
      <div class="section-more"><a href="#/" data-route class="btn-line" data-cursor="GO">← BACK HOME</a></div>
    </section>`;
  }

  /* ---------------- routing ---------------- */

  function parseRoute() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean).slice(0, 3);
    if (parts[0] === 'posts') parts[0] = 'journal'; // #/posts and #/posts/<slug> are aliases of the journal routes
    return parts;
  }

  function pageTitle(parts) {
    if (parts.length === 0) return 'HOME';
    const map = { work: 'WORK', journal: 'JOURNAL', achievements: 'ACHIEVEMENTS', experience: 'EXPERIENCE', about: 'ABOUT', contact: 'CONTACT' };
    if (parts[0] === 'work' && parts[1]) { const p = projectBySlug(parts[1]); return p ? p.name : 'WORK'; }
    if (parts[0] === 'admin') return 'ADMIN';
    return map[parts[0]] || 'PSM';
  }

  function render() {
    const parts = parseRoute();
    let html = '';
    let route = parts[0] || 'home';

    if (parts.length === 0) html = homePage();
    else if (parts[0] === 'work' && parts[1]) html = projectPage(parts[1]);
    else if (parts[0] === 'work') html = workPage();
    else if (parts[0] === 'journal' && parts[1]) html = journalPostPage();
    else if (parts[0] === 'admin' && parts[1] === 'posts') { html = Admin.page(); route = 'admin'; }
    else if (parts[0] === 'journal') html = journalPage();
    else if (parts[0] === 'achievements') html = achievementsPage();
    else if (parts[0] === 'experience') html = experiencePage();
    else if (parts[0] === 'about') html = aboutPage() + resumeSection();
    else if (parts[0] === 'contact') html = contactPage();
    else html = notFoundPage();

    const token = ++renderToken;
    document.title = BASE_TITLE;
    root.innerHTML = html + footerHTML();
    window.scrollTo(0, 0);
    bindPage(route, parts, token);
    updateNav(route);
  }

  async function navigate() {
    closeMobileMenu();
    const parts = parseRoute();
    const label = pageTitle(parts);
    await Anim.pageTransition('out', label);
    render();
    Anim.pageTransition('in');
  }

  /* ---------------- per-page bindings ---------------- */

  function bindPage(route, parts, token) {
    // cleanup previous
    cleanupFns.forEach(fn => fn());
    cleanupFns = [];

    Anim.initScrollAnimations();

    // hero
    if (route === 'home' && parts.length === 0) {
      startHero();
      if (!Anim.reduced) {
        const tl = anime.timeline({ easing: 'easeOutExpo' });
        tl.add({ targets: '.hero-line-inner', translateY: ['110%', '0%'], delay: anime.stagger(130), duration: 1200 }, 150)
          .add({ targets: '[data-hero-fade]', opacity: [0, 1], translateY: ['1.2rem', '0rem'], delay: anime.stagger(100), duration: 900 }, '-=700');
      }
      // hero scroll transform
      const hero = document.getElementById('hero');
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const r = hero.getBoundingClientRect();
          const t = Math.min(1, Math.max(0, -r.top / (r.height * 0.85)));
          if (!Anim.reduced) {
            const inner = hero.querySelector('.hero-inner');
            inner.style.transform = `translate3d(0, ${-t * 18}vh, 0) scale(${1 - t * 0.12})`;
            inner.style.opacity = 1 - t * 1.1;
          }
          ticking = false;
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanupFns.push(() => window.removeEventListener('scroll', onScroll));

      // parallax on work visuals
      document.querySelectorAll('[data-parallax]').forEach(el => Anim.parallaxElement(el, { speed: 0.08, clamp: 60 }));

      // tech constellation hover
      const ctx = document.getElementById('tech-context');
      document.querySelectorAll('.tech-node[data-tech]').forEach(btn => {
        const enter = () => {
          const t = btn.dataset.tech;
          ctx.querySelector('.tc-label').textContent = `// ${t.toUpperCase()}`;
          ctx.querySelector('.tc-text').textContent = DATA.techContext[t] || '';
          ctx.classList.add('active');
          btn.classList.add('hovered');
        };
        const leave = () => { ctx.classList.remove('active'); btn.classList.remove('hovered'); };
        btn.addEventListener('mouseenter', enter);
        btn.addEventListener('mouseleave', leave);
        btn.addEventListener('focus', enter);
        btn.addEventListener('blur', leave);
      });
    }

    // achievements accordion
    if (route === 'achievements') {
      document.querySelectorAll('.ach-item').forEach(item => {
        const head = item.querySelector('.ach-head');
        const body = item.querySelector('.ach-body');
        head.addEventListener('click', () => {
          const open = item.classList.contains('open');
          document.querySelectorAll('.ach-item.open').forEach(o => {
            o.classList.remove('open');
            o.querySelector('.ach-head').setAttribute('aria-expanded', 'false');
            o.querySelector('.ach-toggle').textContent = '+';
            anime({ targets: o.querySelector('.ach-body'), height: 0, opacity: 0, duration: 400, easing: 'easeInOutQuart' });
          });
          if (!open) {
            item.classList.add('open');
            head.setAttribute('aria-expanded', 'true');
            item.querySelector('.ach-toggle').textContent = '−';
            anime.set(body, { height: 'auto', opacity: 1 });
            const h = body.offsetHeight;
            anime({ targets: body, height: [0, h], opacity: [0, 1], duration: 500, easing: 'easeOutQuart' });
          }
        });
      });
    }

    // experience timeline
    if (route === 'experience') {
      const track = document.getElementById('timeline-progress');
      const items = document.querySelectorAll('[data-tl-item]');
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        });
        const activeCount = [...items].filter(item => item.classList.contains('active')).length;
        track.style.transform = `scaleY(${items.length ? activeCount / items.length : 0})`;
      }, { threshold: 0.18 });
      items.forEach(item => observer.observe(item));
      cleanupFns.push(() => observer.disconnect());
    }

    if (route === 'contact') {
      const form = document.getElementById('contact-form');
      const status = document.getElementById('contact-form-status');
      form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const button = form.querySelector('[type="submit"]');
        button.disabled = true;
        status.classList.remove('is-error');
        status.textContent = 'Sending your message…';
        const fields = new FormData(form);
        const payload = {
          name: fields.get('name'),
          email: fields.get('email'),
          message: fields.get('message'),
          website: fields.get('website'),
        };
        try {
          const response = await fetch(window.PortfolioConfig.apiUrl('/api/contact'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result?.error?.message || `Message could not be sent (${response.status}).`);
          form.reset();
          status.textContent = 'Thank you. Your message is on its way, and a confirmation email has been sent.';
        } catch (error) {
          status.classList.add('is-error');
          status.textContent = error.message === 'Failed to fetch'
            ? 'Could not connect to the contact service. Please use the email link above.'
            : error.message;
        } finally {
          button.disabled = false;
        }
      });
    }

    // project architecture diagram
    if (route === 'work' && parts[1]) {
      const nodes = document.querySelectorAll('[data-arch-node]');
      const conns = document.querySelectorAll('[data-arch-connector]');
      const seen = new WeakSet();
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !seen.has(e.target)) {
            seen.add(e.target);
            const i = parseInt(e.target.style.getPropertyValue('--i'), 10);
            if (e.target.hasAttribute('data-arch-node')) {
              anime({ targets: e.target, opacity: [0, 1], translateX: ['-1.5rem', '0rem'], duration: 600, delay: i * 160, easing: 'easeOutExpo' });
            } else {
              anime({ targets: e.target.querySelector('.ac-line'), scaleY: [0, 1], duration: 500, delay: i * 160 + 300, easing: 'easeInOutQuart', transformOrigin: '50% 0' });
              anime({ targets: e.target.querySelector('.ac-arrow'), opacity: [0, 1], duration: 300, delay: i * 160 + 700 });
            }
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.4 });
      nodes.forEach(n => io.observe(n));
      conns.forEach(c => io.observe(c));
      cleanupFns.push(() => io.disconnect());
    }

    // data hydration (GitHub + posts) — all async, all guarded by the render token
    if (route === 'home' && parts.length === 0) { hydrateSignal(token); hydrateHomePosts(token); }
    if (route === 'work' && !parts[1]) hydrateExplorer(token);
    if (route === 'work' && parts[1]) hydrateProject(parts[1], token);
    if (route === 'journal' && !parts[1]) hydrateJournal(token);
    if (route === 'journal' && parts[1]) hydratePost(parts[1], token);
    if (route === 'admin') cleanupFns.push(Admin.bind());
  }

  /* ---------------- hero: 3D scene with graceful 2D fallback ---------------- */

  function startHero() {
    const canvas = document.getElementById('constellation');
    let cancelled = false, scene = null, idleId = 0;
    const fallback = () => {
      document.body.classList.remove('has-3d');
      if (cancelled || !canvas || !canvas.isConnected) return;
      const c = initConstellation(canvas);
      cleanupFns.push(() => c.destroy());
    };
    cleanupFns.push(() => { cancelled = true; clearTimeout(idleId); scene && scene.destroy(); document.body.classList.remove('has-3d'); });

    if (!Hero3D.supported()) { fallback(); return; }
    // Start after first paint so three.js never delays the hero text.
    idleId = setTimeout(() => {
      Hero3D.start({ onDegrade: fallback })
        .then(h => { if (cancelled) { h.destroy(); return; } scene = h; document.body.classList.add('has-3d'); })
        .catch(fallback);
    }, 350);
  }

  /* ---------------- hydrators ---------------- */

  const fresh = t => t === renderToken;

  /** Merge live repo data into rendered project cards. Resolves to {data, merged} or null if stale. */
  function loadProjects(t) {
    return GitHub.load().then(data => {
      if (!fresh(t)) return null;
      const merged = GitHub.mergeProjects(DATA.projects, data.repos);
      Views.decorateProjects(root, merged.projects);
      return { data, merged };
    });
  }

  function hydrateSignal(t) {
    const grid = $('#signal-grid'), note = $('#signal-note');
    loadProjects(t).then(res => {
      if (!res) return;
      const { totals, languages, stale } = res.data;
      const items = [['REPOSITORIES', totals.repos], ['STARS', totals.stars], ['LANGUAGES', Object.keys(languages).length]];
      grid.innerHTML = items.map(([l, v]) => `<div class="signal-item"><span class="signal-value" data-n="${v}">${Anim.reduced ? v : 0}</span><span class="signal-label">${l}</span></div>`).join('')
        + `<div class="signal-item"><span class="signal-value signal-text">${esc(GitHub.ago(totals.lastPush) || '—')}</span><span class="signal-label">LAST PUSH</span></div>`;
      note.textContent = `// Public GitHub data · ${stale ? 'cached copy' : 'live'}`;
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        io.disconnect();
        grid.querySelectorAll('[data-n]').forEach(el => Anim.animateCounter(el, +el.dataset.n));
      }), { threshold: 0.4 });
      io.observe(grid);
      cleanupFns.push(() => io.disconnect());
    }).catch(() => {
      if (!fresh(t)) return;
      note.textContent = '// GitHub data is unavailable right now';
      grid.innerHTML = Views.stateBox('STATS UNAVAILABLE', 'Live GitHub stats could not be loaded.', ['retry', 'TRY AGAIN']);
      grid.querySelector('[data-action="retry"]').onclick = () => { grid.innerHTML = Views.skeleton(1, 'LOADING'); hydrateSignal(t); };
    });
  }

  function hydrateHomePosts(t) {
    Posts.list().then(({ posts }) => {
      if (!fresh(t)) return;
      const box = $('#home-posts');
      box.innerHTML = posts.length ? posts.slice(0, 3).map(Views.postRowCompact).join('') : Views.stateBox('NO POSTS YET', 'Nothing has been published yet.');
      Anim.staggerItems(box.querySelectorAll('.journal-row'));
    });
  }

  function hydrateExplorer(t) {
    const host = $('#explorer-body');
    loadProjects(t).then(res => { if (res) Views.bindExplorer(host, res.data, res.merged); })
      .catch(() => {
        if (!fresh(t)) return;
        host.innerHTML = Views.stateBox('GITHUB UNAVAILABLE', 'Repository data could not be loaded right now.', ['retry', 'TRY AGAIN']);
        host.onclick = e => { if (e.target.closest('[data-action="retry"]')) { host.innerHTML = Views.skeleton(4, 'LOADING REPOSITORIES'); hydrateExplorer(t); } };
      });
  }

  function hydrateProject(slug, t) {
    const proj = projectBySlug(slug);
    if (!proj) return;
    loadProjects(t).then(res => {
      const m = res && res.merged.projects.find(x => x.slug === slug);
      if (m) $('#project-cta').innerHTML = Views.projectCta(m);
    }).catch(() => { /* static links remain; nothing to show */ });
    Posts.list().then(({ posts }) => {
      if (!fresh(t)) return;
      const rel = posts.filter(x => proj.relatedJournal.includes(x.slug) || x.tags.includes(proj.slug));
      if (!rel.length) return;
      const sec = $('#related-posts');
      $('#related-list').innerHTML = rel.map(Views.postRowCompact).join('');
      sec.hidden = false;
      Anim.revealSection(sec);
      Anim.staggerItems(sec.querySelectorAll('.journal-row'));
    });
  }

  function hydrateJournal(t) {
    Posts.list().then(({ source, posts }) => {
      if (!fresh(t)) return;
      const list = $('#journal-list'), filters = $('#j-filters');
      if (source === 'bundled') $('#j-note').textContent = '// Showing bundled entries — the live archive is unreachable right now.';
      if (!posts.length) { filters.remove(); list.innerHTML = Views.stateBox('NO POSTS YET', 'Nothing has been published yet — check back soon.'); return; }
      const tags = [...new Set(posts.flatMap(p => p.tags.map(x => x.toUpperCase())))].sort();
      filters.innerHTML = ['ALL', ...tags].map((f, i) => `<button type="button" class="j-filter" data-filter="${esc(f)}" aria-pressed="${i === 0}">${esc(f)}</button>`).join('');
      list.innerHTML = posts.map(Views.postRow).join('');
      Anim.staggerItems(list.querySelectorAll('.journal-row'));
      filters.onclick = e => {
        const b = e.target.closest('[data-filter]'); if (!b) return;
        filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        const f = b.dataset.filter;
        list.querySelectorAll('.journal-row').forEach(r => {
          const show = f === 'ALL' || r.dataset.tags.split('|').includes(f);
          r.hidden = !show;
          if (show && !Anim.reduced) anime({ targets: r, opacity: [0, 1], translateY: ['1rem', '0rem'], duration: 500, easing: 'easeOutQuart' });
        });
      };
    });
  }

  function hydratePost(slug, t) {
    Promise.all([Posts.get(slug), Posts.list()]).then(([post, { posts }]) => {
      if (!fresh(t)) return;
      const view = $('#post-view');
      if (!post) view.innerHTML = notFoundPage();
      else { document.title = `${post.title} — Prashyam Sankar Mitra`; view.innerHTML = postView(post, posts); }
      view.querySelectorAll('[data-reveal-section]').forEach(sec => Anim.revealSection(sec));
    });
  }

  /* ---------------- nav ---------------- */

  function updateNav(route) {
    document.querySelectorAll('[data-nav]').forEach(a => {
      const active = a.dataset.nav === route || (route === 'home' && a.dataset.nav === '');
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const burger = document.getElementById('nav-burger');
    if (!menu || !menu.classList.contains('open')) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  function bindNav() {
    nav.innerHTML = navHTML();
    Theme.bind(document.getElementById('theme-toggle'));
    const burger = document.getElementById('nav-burger');
    const menu = document.getElementById('mobile-menu');
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      if (open) nav.classList.remove('hidden');
      burger.setAttribute('aria-expanded', open);
      menu.setAttribute('aria-hidden', !open);
      document.body.classList.toggle('menu-open', open);
    });
    // a tapped link should dismiss the overlay before the route transition
    menu.addEventListener('click', e => { if (e.target.closest('.mobile-link')) closeMobileMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileMenu(); });
    // nav scroll state
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 40);
      nav.classList.toggle('hidden', y > 500 && y > lastY && !document.body.classList.contains('menu-open'));
      lastY = y;
    }, { passive: true });
  }

  /* ---------------- boot ---------------- */

  function boot() {
    bindNav();
    Anim.initCursor();
    window.addEventListener('hashchange', navigate);
    render();
    // intro
    const intro = document.getElementById('intro');
    if (Anim.reduced) { intro.remove(); return; }
    anime.timeline()
      .add({ targets: intro, opacity: [1, 0], duration: 600, delay: 500, easing: 'easeInOutQuart', complete: () => intro.remove() });
  }

  document.addEventListener('DOMContentLoaded', boot);

  return { render };
})();

window.App = App;
