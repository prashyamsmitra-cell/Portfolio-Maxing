/* ============================================================
   ADMIN — post management UI at #/admin/posts.
   Auth: email + password checked by Supabase Auth through /api/admin-login; every write is
   re-verified server-side against ADMIN_EMAILS. The UI gate is convenience, not security.
   Token is kept in sessionStorage only (cleared when the tab closes) with its expiry.
   ============================================================ */
const Admin = (() => {
  const KEY = 'psm-admin-session';
  const esc = Markdown.esc;

  const session = {
    get() { try { const s = JSON.parse(sessionStorage.getItem(KEY)); return s && s.exp > Date.now() ? s.token : null; } catch { return null; } },
    set(token, secs) { try { sessionStorage.setItem(KEY, JSON.stringify({ token, exp: Date.now() + (secs - 30) * 1000 })); } catch { /* ignore */ } },
    clear() { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } },
  };

  async function api(path, { method = 'GET', body } = {}) {
    const token = session.get();
    const url = window.PortfolioConfig ? window.PortfolioConfig.apiUrl(path) : path;
    let res;
    try {
      res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (netErr) {
      throw new Error(netErr.message === 'Failed to fetch' ? 'Cannot reach backend server. Check backend URL and CORS configuration.' : netErr.message);
    }
    const json = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) { if (token) session.clear(); throw Object.assign(new Error(json?.error?.message || 'Not authorised'), { auth: true }); }
    if (!res.ok) throw new Error(json?.error?.message || `Request failed (${res.status})`);
    return json;
  }

  const page = () => `
    <section class="page-hero admin-hero">
      <div class="section-head"><span class="section-marker">ADMIN</span><span class="section-line" style="transform:none"></span><a href="#/journal" data-route class="section-back">← PUBLIC POSTS</a></div>
      <h1 class="page-title">MANAGE POSTS</h1>
    </section>
    <section class="section admin" id="admin-root"></section>`;

  /* ---------- login ---------- */
  function showLogin(root, onDone, note) {
    root.innerHTML = `
      <form class="admin-form admin-login" id="login-form" autocomplete="on">
        <label>EMAIL<input type="email" name="email" autocomplete="username" required maxlength="254"></label>
        <label>PASSWORD<input type="password" name="password" autocomplete="current-password" required maxlength="200"></label>
        <p class="admin-msg" id="login-msg" role="alert">${esc(note || '')}</p>
        <button class="btn-solid" type="submit">SIGN IN</button>
      </form>`;
    root.querySelector('#login-form').addEventListener('submit', async e => {
      e.preventDefault();
      const f = new FormData(e.target), msg = root.querySelector('#login-msg'), btn = e.target.querySelector('button');
      btn.disabled = true; msg.textContent = '';
      try {
        const url = window.PortfolioConfig ? window.PortfolioConfig.apiUrl('/api/admin-login') : '/api/admin-login';
        let r;
        try {
          r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: f.get('email'), password: f.get('password') }) });
        } catch (netErr) {
          throw new Error(netErr.message === 'Failed to fetch' ? 'Cannot reach backend server. Check backend URL and CORS configuration.' : netErr.message);
        }
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error?.message || 'Sign-in failed');
        session.set(j.access_token, j.expires_in || 3600);
        onDone();
      } catch (err) { msg.textContent = err.message; btn.disabled = false; }
    });
  }

  /* ---------- manager ---------- */
  async function showManager(root) {
    root.innerHTML = Views.skeleton(3, 'LOADING POSTS');
    let posts;
    try { posts = (await api('/api/posts?all=1')).posts; }
    catch (err) {
      if (err.auth) return showLogin(root, () => showManager(root), session.get() === null ? '' : err.message);
      root.innerHTML = Views.stateBox('COULD NOT LOAD POSTS', err.message, ['retry', 'RETRY']);
      root.querySelector('[data-action="retry"]').onclick = () => showManager(root);
      return;
    }
    let current = null; // post being edited (null = new)

    const status = p => (p.published ? (p.featured ? 'PUBLISHED · FEATURED' : 'PUBLISHED') : 'DRAFT');
    const dateLabel = p => {
      const live = p.published && p.published_at;
      const d = Posts.fmtDate(live ? p.published_at : p.created_at);
      return d ? ` · ${live ? 'POSTED' : 'CREATED'} ${d}` : '';
    };

    function drawList() {
      root.querySelector('#admin-list').innerHTML = posts.length
        ? posts.map(p => `<li><button type="button" class="admin-item ${current?.id === p.id ? 'active' : ''}" data-id="${esc(p.id)}"><span>${esc(p.title)}</span><small>${status(p)}${dateLabel(p)}</small></button></li>`).join('')
        : '<li class="admin-empty">No posts yet — create the first one.</li>';
    }

    function drawEditor() {
      const p = current || { title: '', slug: '', excerpt: '', content: '', cover_image: '', images: [], tags: [], published: false, featured: false, linkedin_post_id: '', linkedin_post_url: '', linkedin_comments_url: '', linkedin_shares_url: '', linkedin_likes_url: '' };
      let photos = (p.images && p.images.length) ? [...p.images] : (p.cover_image ? [p.cover_image] : []);
      root.querySelector('#admin-editor').innerHTML = `
        <form class="admin-form" id="post-form" novalidate>
          <label>TITLE<input name="title" value="${esc(p.title)}" required maxlength="160"></label>
          <label>SLUG <small>(blank = from title)</small><input name="slug" value="${esc(p.slug)}" maxlength="80" pattern="[a-z0-9]+(-[a-z0-9]+)*"></label>
          <label>EXCERPT<textarea name="excerpt" rows="2" maxlength="400">${esc(p.excerpt)}</textarea></label>
          <label>TAGS <small>(comma separated, max 10)</small><input name="tags" value="${esc((p.tags || []).join(', '))}"></label>
          <div class="admin-photos">
            <span class="admin-label">PHOTOS <small>(up to 9 — the first one is the cover)</small></span>
            <div class="photo-slots" id="photo-slots"></div>
            <button class="btn-line" type="button" id="photo-add">+ ADD PHOTO</button>
          </div>
          <div class="linkedin-section">
            <span class="admin-label">LINKEDIN INTEGRATION</span>
            <label>LINKEDIN POST ID<input type="text" name="linkedin_post_id" value="${esc(p.linkedin_post_id || '')}" maxlength="255" placeholder="e.g., urn:li:activity:123456789" disabled title="Auto-filled when linking post"></label>
            <label>LINKEDIN POST URL<input type="url" name="linkedin_post_url" value="${esc(p.linkedin_post_url || '')}" maxlength="500" placeholder="https://linkedin.com/posts/..." required></label>
            <label>LINKEDIN COMMENTS URL<input type="url" name="linkedin_comments_url" value="${esc(p.linkedin_comments_url || '')}" maxlength="500" placeholder="https://linkedin.com/posts/..."></label>
            <label>LINKEDIN SHARES URL<input type="url" name="linkedin_shares_url" value="${esc(p.linkedin_shares_url || '')}" maxlength="500" placeholder="https://linkedin.com/posts/..."></label>
            <label>LINKEDIN LIKES URL<input type="url" name="linkedin_likes_url" value="${esc(p.linkedin_likes_url || '')}" maxlength="500" placeholder="https://linkedin.com/posts/..."></label>
            ${p.linkedinPost?.url ? `
              <a href="${esc(p.linkedinPost.url)}" target="_blank" rel="noopener noreferrer" class="linkedin-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.038-1.852-3.038-1.853 0-2.136 1.445-2.136 2.939v5.668H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                view on linkedin
              </a>
            ` : ''}
          </div>
          <div class="admin-split">
            <label>CONTENT <small>(Markdown)</small><textarea name="content" rows="18" maxlength="100000" spellcheck="true">${esc(p.content)}</textarea></label>
            <div><span class="admin-label">PREVIEW</span><div class="post-prose admin-preview" id="preview" aria-live="polite"></div></div>
          </div>
          <div class="admin-checks">
            <label><input type="checkbox" name="published" ${p.published ? 'checked' : ''}> PUBLISHED</label>
            <label><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}> FEATURED</label>
          </div>
          <p class="admin-date">${current ? (dateLabel(p).replace(' · ', '') || 'DRAFT — not published yet') : 'NEW POST — the date is stamped when you publish'}</p>
          <p class="admin-msg" id="post-msg" role="status"></p>
          <div class="admin-actions">
            <button class="btn-solid" type="submit">${current ? 'SAVE CHANGES' : 'CREATE POST'}</button>
            ${current ? '<button class="btn-line" type="button" id="del">DELETE</button>' : ''}
            <button class="btn-line" type="button" id="new">NEW POST</button>
            <button class="btn-line" type="button" id="logout">SIGN OUT</button>
          </div>
        </form>`;
      const form = root.querySelector('#post-form'), msg = root.querySelector('#post-msg');
      const preview = () => { root.querySelector('#preview').innerHTML = Markdown.render(form.content.value); };
      preview(); form.content.addEventListener('input', preview);

      const drawPhotos = () => {
        const resolve = window.PortfolioConfig?.resolveAssetUrl || (u => u);
        root.querySelector('#photo-slots').innerHTML = photos.length
          ? photos.map((src, i) => `
            <div class="photo-slot">
              <span class="ps-num">${String(i + 1).padStart(2, '0')}</span>
              <div class="ps-thumb">${src ? `<img src="${esc(resolve(src))}" alt="">` : '<span>EMPTY</span>'}</div>
              <label class="ps-url">IMAGE URL<input type="url" value="${esc(src)}" data-photo-url="${i}" maxlength="500" placeholder="https://…"></label>
              <label class="ps-file">UPLOAD<input type="file" accept="image/png,image/jpeg,image/webp" data-photo-file="${i}"></label>
              <button type="button" class="ps-remove" data-photo-remove="${i}" aria-label="Remove photo ${i + 1}">×</button>
            </div>`).join('')
          : '<p class="admin-empty">No photos yet — a post works without them.</p>';
      };
      drawPhotos();

      form.addEventListener('input', e => {
        const i = e.target.dataset?.photoUrl;
        if (i !== undefined) photos[+i] = e.target.value.trim();
      });

      form.addEventListener('click', e => {
        const rm = e.target.closest('[data-photo-remove]');
        if (rm) { photos.splice(+rm.dataset.photoRemove, 1); drawPhotos(); return; }
        if (e.target.closest('#photo-add')) {
          if (photos.length >= 9) { msg.textContent = 'A post can hold at most 9 photos.'; return; }
          photos.push(''); drawPhotos();
          root.querySelector('#photo-slots .photo-slot:last-child input')?.focus();
        }
      });

      form.addEventListener('change', async e => {
        const slot = e.target.closest('[data-photo-file]');
        if (!slot) return;
        const file = slot.files[0]; if (!file) return;
        const i = +slot.dataset.photoFile;
        if (file.size > 3 * 1024 * 1024) { msg.textContent = 'Image must be under 3 MB.'; return; }
        msg.textContent = 'Uploading…';
        try {
          const data = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = no; r.readAsDataURL(file); });
          photos[i] = (await api('/api/upload', { method: 'POST', body: { contentType: file.type, data } })).url;
          drawPhotos();
          msg.textContent = `Photo ${i + 1} uploaded — save the post to keep it.`;
        } catch (err) { msg.textContent = err.message; }
      });

      form.addEventListener('submit', async e => {
        e.preventDefault();
        const imgs = photos.filter(Boolean);
const body = {
           title: form.title.value, slug: form.slug.value, excerpt: form.excerpt.value, content: form.content.value,
           tags: form.tags.value.split(',').map(t => t.trim()).filter(Boolean),
           cover_image: imgs[0] || null, images: imgs,
           published: form.published.checked, featured: form.featured.checked,
           linkedin_post_id: form.linkedin_post_id?.value || '',
           linkedin_post_url: form.linkedin_post_url?.value || '',
           linkedin_comments_url: form.linkedin_comments_url?.value || '',
           linkedin_shares_url: form.linkedin_shares_url?.value || '',
           linkedin_likes_url: form.linkedin_likes_url?.value || '',
         };
        msg.textContent = 'Saving…';
        try {
          const saved = (await api(current ? `/api/posts?id=${encodeURIComponent(current.id)}` : '/api/posts', { method: current ? 'PATCH' : 'POST', body })).post;
          posts = current ? posts.map(x => (x.id === saved.id ? saved : x)) : [saved, ...posts];
          current = saved; Posts.invalidate(); drawList(); drawEditor();
          root.querySelector('#post-msg').textContent = `Saved${saved.published ? ' and live' : ' as draft'}.`;
        } catch (err) { if (err.auth) return showLogin(root, () => showManager(root), 'Session expired — sign in again.'); msg.textContent = err.message; }
      });
      root.querySelector('#new').onclick = () => { current = null; drawList(); drawEditor(); };
      root.querySelector('#logout').onclick = () => { session.clear(); showLogin(root, () => showManager(root)); };
      const del = root.querySelector('#del');
      if (del) del.onclick = async () => {
        if (!confirm(`Delete "${current.title}"? This cannot be undone.`)) return;
        try { await api(`/api/posts?id=${encodeURIComponent(current.id)}`, { method: 'DELETE' }); posts = posts.filter(x => x.id !== current.id); current = null; Posts.invalidate(); drawList(); drawEditor(); }
        catch (err) { msg.textContent = err.message; }
      };
    }

    root.innerHTML = `<div class="admin-layout"><ul class="admin-list" id="admin-list" aria-label="Posts"></ul><div id="admin-editor"></div></div>`;
    root.querySelector('#admin-list').addEventListener('click', e => {
      const b = e.target.closest('[data-id]'); if (!b) return;
      current = posts.find(p => p.id === b.dataset.id) || null; drawList(); drawEditor();
    });
    drawList(); drawEditor();
  }

  function bind() {
    const root = document.getElementById('admin-root');
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    meta.content = 'noindex, nofollow';
    if (session.get()) showManager(root); else showLogin(root, () => showManager(root));
    return () => { meta.content = 'index, follow'; };
  }

  return { page, bind, authed: () => session.get() !== null };
})();
window.Admin = Admin;
