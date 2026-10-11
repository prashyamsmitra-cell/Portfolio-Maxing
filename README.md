# Portfolio Frontend

Standalone static frontend repository for the portfolio application.

Features:
- **Vanilla HTML, CSS, and JavaScript**: Zero-build architecture. No bundlers, compilers, or runtime npm dependencies.
- **Single Page Application (SPA)**: Hash-based routing (`#/work`, `#/journal`, `#/about`, `#/contact`, `#/admin/posts`).
- **Visual Design System**: Monochromatic editorial serif typography (Fraunces + Inter + JetBrains Mono), View Transitions API theme switcher (light/dark with persistent preference), custom cursor, smooth route reveal animations via anime.js.
- **3D Hero & 2D Fallback**: Procedural Three.js icosahedral hero that occludes its back edges and tracks scroll progress; gracefully falls back to a 2D canvas constellation for mobile/reduced-motion/low-spec devices.
- **GitHub Integration**: Live repository and language metrics from backend proxy, with automatic client-side fallback to direct unauthenticated GitHub API.
- **Journal & Admin Editor**: Dynamic markdown rendering, photo slots gallery, post composer, and sign-in gate.
- **Configurable Backend Integration**: Single-point configuration in `js/config.js` with CORS and asset URL resolution.

---

## Directory Structure

```
portfolio-frontend/
├── index.html               # Main HTML entry point
├── _headers                 # Cloudflare Pages security headers and CSP
├── vercel.json              # Vercel static hosting headers and caching
├── package.json             # Dev scripts (zero dependencies)
├── .env.example             # Frontend configuration reference
├── .gitignore               # Standard ignores
├── css/
│   ├── style.css            # Core design system tokens, typography, layouts
│   └── features.css         # 3D layer, article typography, admin UI styles
├── js/
│   ├── config.js            # Central API base URL configuration & asset resolver
│   ├── theme-boot.js        # Early theme applicator before paint (prevents flash)
│   ├── theme.js             # View Transitions & clip-path theme switcher
│   ├── markdown.js          # Client-side safe Markdown parser
│   ├── github.js            # Live GitHub metadata loader with direct fallback
│   ├── posts.js             # Post client (queries backend API, falls back to static)
│   ├── views.js             # HTML templates and UI component builders
│   ├── anim.js              # Page transitions & anime.js choreography
│   ├── constellation.js     # 2D canvas particle fallback
│   ├── hero3d.js            # Three.js 3D procedural object
│   ├── admin.js             # Admin post composer and photo uploader
│   ├── app.js               # Router, navigation, and page life-cycle
│   └── data/
│       ├── profile.js       # Bio, links, and hero copy
│       ├── projects.js      # Curated projects and case studies
│       ├── experience.js    # Work & educational history
│       ├── skills.js        # Technical competencies
│       └── posts.fallback.js# Static fallback journal entries
└── scripts/
    └── dev.mjs              # Zero-dependency local preview server (port 3000)
```

---

## Configuration: Connecting to the Backend

The frontend communicates with `portfolio-backend` via HTTP.

### Option 1: In `js/config.js` (Recommended)
Edit the `DEFAULT_API_BASE` constant in `js/config.js`:
```javascript
const DEFAULT_API_BASE = 'https://your-portfolio-backend.vercel.app';
```

### Option 2: In `index.html`
Add or update the meta tag in the `<head>` of `index.html`:
```html
<meta name="portfolio-api-base" content="https://your-portfolio-backend.vercel.app" />
```

### Option 3: Same-Origin / Reverse Proxy
If the frontend and backend are served from the same domain or behind a reverse proxy (e.g. `/api/*` routed to backend):
Set `API_BASE` to `''` (empty string) to use root-relative paths.

---

## Local Development

1. Start the frontend static server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

2. In a separate terminal, start `portfolio-backend`:
   ```bash
   cd ../portfolio-backend
   npm run dev
   ```
   Runs at `http://localhost:3001`.

The frontend defaults to `http://localhost:3001` for API requests in local development, so everything connects automatically.

### Running Frontend Without the Backend
The frontend is completely resilient when the backend is offline:
- **Journal**: If `/api/posts` cannot be reached, the journal automatically renders bundled posts from `js/data/posts.fallback.js`.
- **GitHub**: If `/api/github` is unavailable, `js/github.js` automatically queries `https://api.github.com/users/<user>/repos` directly using the public API.
- **Admin**: If `/api/admin-login` cannot be reached, the UI displays a clear connectivity notice instead of hanging.

---

## Independent Deployment

### 1. Cloudflare Pages
- Connect your Git repository to Cloudflare Pages.
- Build command: *None* (leave blank).
- Output directory: `.` (or root of repository).
- Cloudflare Pages automatically picks up the `_headers` file for CSP, caching, and security headers.
- Update `js/config.js` or `index.html` with your production backend URL.

### 2. Vercel (Static)
- Import the `portfolio-frontend` repository into Vercel.
- Framework Preset: **Other**.
- Build command: *None*.
- Output directory: `.` (leave blank).
- Vercel automatically applies the rules in `vercel.json` for caching, headers, and CSP.

---

## Content Security Policy (CSP)

The frontend enforces strict CSP headers in both `vercel.json` and `_headers`:
- Scripts: `'self' https://cdn.jsdelivr.net` (for anime.js and Three.js).
- Fonts: `https://fonts.googleapis.com https://fonts.gstatic.com`.
- Connect: `'self' https://api.github.com https: http:` (allows API calls to your configured backend).
- Images: `'self' data: https: blob: http:` (allows project screenshots and Supabase storage images).
