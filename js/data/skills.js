/* SKILLS — grouped technologies and the context note shown on hover. */
window.DATA = window.DATA || {};
DATA.technologies = {
  "FRONTEND": [
    "React",
    "TypeScript",
    "Next.js"
  ],
  "BACKEND": [
    "Node.js",
    "Express",
    "FastAPI"
  ],
  "AI": [
    "Python",
    "LLMs",
    "Gemini",
    "Groq"
  ],
  "DATABASE": [
    "PostgreSQL",
    "Supabase"
  ],
  "CLOUD": [
    "Vercel",
    "Cloudflare",
    "Render"
  ]
};
DATA.techContext = {
  "React": "Primary UI library across CareSync, CVAnalyzer and VMS.",
  "TypeScript": "Typed frontends where the data model matters.",
  "Next.js": "Used for SaveItTrip; SSR where SEO and first paint matter.",
  "Node.js": "API layer for CareSync and VMS.",
  "Express": "REST APIs, middleware discipline, structured error handling.",
  "FastAPI": "AI service layer — model endpoints with typed contracts.",
  "Python": "AI pipelines, parsing, scripting, data work.",
  "LLMs": "Constrained, structured, auditable — never free-running.",
  "Gemini": "Triage and summarisation model in CareSync.",
  "Groq": "Fast inference for latency-sensitive scoring paths.",
  "PostgreSQL": "Primary relational store — the source of truth.",
  "Supabase": "Auth + Postgres + RLS for rapid, secure shipping.",
  "Vercel": "Frontend deployment with preview environments.",
  "Cloudflare": "Edge caching and DNS.",
  "Render": "Long-running API services."
};
