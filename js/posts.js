/* ============================================================
   POSTS — client for /api/posts (Supabase-backed). Falls back to the bundled
   entries in data/posts.fallback.js ONLY if the API is unreachable/not configured.
   ============================================================ */
const Posts = (() => {
  let listPromise = null;
  const detailCache = new Map();

  const fmtDate = iso => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '').toUpperCase();
  };
  const minutes = text => Math.max(1, Math.round(String(text).trim().split(/\s+/).length / 200));
  const catClass = c => 'j-cat-' + String(c).replace(/\s+/g, '-').toLowerCase();

  function fromApi(p) {
    const tags = p.tags || [];
    const resolve = window.PortfolioConfig?.resolveAssetUrl || (u => u);
    const rawImages = (p.images || []).slice(0, 9);
    if (!rawImages.length && p.cover_image) rawImages.push(p.cover_image);
    const images = rawImages.map(resolve);
    return {
      id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt || '', images, cover: images[0] || null,
      tags, category: (tags[0] || 'post').toUpperCase(), featured: !!p.featured,
      dateISO: p.published_at || p.created_at, date: fmtDate(p.published_at || p.created_at),
      readMin: p.reading_minutes || (p.content ? minutes(p.content) : null),
      content: p.content ?? null, related: null,
      linkedinPost: {
        id: p.linkedin_post_id || '',
        url: p.linkedin_post_url || '',
        comments: p.linkedin_comments_url || '',
        shares: p.linkedin_shares_url || '',
        likes: p.linkedin_likes_url || ''
      }
    };
  }

  function fromStatic(j) {
    const content = j.body.join('\n\n');
    const images = j.images || [];
    return {
      slug: j.slug, title: j.title, excerpt: j.excerpt, images, cover: images[0] || null,
      tags: [j.category.toLowerCase()],
      category: j.category, featured: false, dateISO: new Date(j.date).toISOString(), date: j.date,
      readMin: minutes(content), content, related: j.related || null,
    };
  }

  async function getJson(path) {
    const url = window.PortfolioConfig ? window.PortfolioConfig.apiUrl(path) : path;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!(res.headers.get('content-type') || '').includes('json')) throw Object.assign(new Error('no api'), { status: 404 });
    const body = await res.json();
    if (!res.ok) throw Object.assign(new Error(body?.error?.message || 'request failed'), { status: res.status });
    return body;
  }

  /** → { posts, source: 'api' | 'bundled' } sorted newest first. */
  function list() {
    if (!listPromise) {
      listPromise = getJson('/api/posts')
        .then(j => ({ source: 'api', posts: j.posts.map(fromApi) }))
        .catch(() => ({ source: 'bundled', posts: (DATA.journal || []).map(fromStatic) }));
    }
    return listPromise;
  }

  /** → post with content, or null. */
  async function get(slug) {
    if (detailCache.has(slug)) return detailCache.get(slug);
    const { source, posts } = await list();
    let post = null;
    if (source === 'api') {
      try { post = fromApi((await getJson(`/api/posts?slug=${encodeURIComponent(slug)}`)).post); } catch { post = null; }
    } else post = posts.find(p => p.slug === slug) || null;
    if (post) detailCache.set(slug, post);
    return post;
  }

  const invalidate = () => { listPromise = null; detailCache.clear(); };

  return { list, get, invalidate, fromApi, fmtDate, catClass };
})();
window.Posts = Posts;
