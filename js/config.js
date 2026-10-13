/* ============================================================
   PORTFOLIO CONFIGURATION
   Single source of truth for frontend environment settings and backend API base URL.
   No build step required. Works seamlessly across static hosting (Cloudflare Pages, Vercel)
   and local development.
   ============================================================ */
(function () {
  // Check for meta tag override: <meta name="portfolio-api-base" content="https://api.example.com">
  const metaTag = document.querySelector('meta[name="portfolio-api-base"]');
  const metaBase = metaTag ? metaTag.getAttribute('content') : null;

  const userConfig = window.PORTFOLIO_CONFIG || {};

  /**
   * BACKEND BASE URL:
   * - Local development: 'http://localhost:3001' (matches backend default port)
   * - Production: 'https://portfolio-max-backend.onrender.com'
   * - Same-origin / Reverse proxy: Set to '' (empty string) to use root-relative paths like '/api/*'
   */
  const DEFAULT_API_BASE = 'https://portfolio-max-backend.onrender.com';

  const rawBase = (
    userConfig.API_BASE !== undefined
      ? userConfig.API_BASE
      : (metaBase !== null ? metaBase : DEFAULT_API_BASE)
  );

  const activeBase = (typeof rawBase === 'string' ? rawBase.trim() : '').replace(/\/+$/, '');

  window.PortfolioConfig = {
    // Current backend base URL (without trailing slash)
    API_BASE: activeBase,

    /**
     * Resolves an API endpoint path to the full target URL.
     * Examples:
     *   apiUrl('/api/posts') => 'http://localhost:3001/api/posts'
     *   apiUrl('https://external.com/api') => 'https://external.com/api'
     */
    apiUrl(path) {
      if (!path) return activeBase;
      if (/^https?:\/\//i.test(path)) return path;
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return activeBase ? `${activeBase}${cleanPath}` : cleanPath;
    },

    /**
     * Resolves asset URLs. If an asset is a relative path from the backend
     * (such as dev uploads '/uploads/...'), prefixes the backend base URL.
     */
    resolveAssetUrl(url) {
      if (!url) return null;
      if (/^https?:\/\/|^data:|^blob:/i.test(url)) return url;
      if (url.startsWith('/uploads/') && activeBase) {
        return `${activeBase}${url}`;
      }
      return url;
    }
  };
})();
