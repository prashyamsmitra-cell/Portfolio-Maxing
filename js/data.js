/* ============================================================
   DATA LAYER — single source of truth for all content.
   Later: swap these objects with GitHub / Supabase fetches.
   ============================================================ */

const DATA = {

  identity: {
    name: "PRASHYAM SANKAR MITRA",
    role: "SOFTWARE DEVELOPER",
    subrole: "FULL STACK DEVELOPER · AI SYSTEMS BUILDER",
    statement: "FULL STACK · AI · BACKEND · CLOUD · AUTOMATION",
    currently: "CURRENTLY BUILDING — AI systems · Full-stack applications · Developer tooling",
    location: "KOLKATA, INDIA",
    email: "prashyamsmitra@gmail.com",
    links: {
      github: "https://github.com/prashyamsmitra-cell",
      linkedin: "https://www.linkedin.com/in/prashyam-s-mitra-2b55ba2b5",
      email: "mailto:prashyamsmitra@gmail.com"
    }
  },

  projects: [
    {
      slug: "caresync",
      num: "01",
      name: "CARESYNC",
      category: "AI SYSTEM",
      tagline: "AI-POWERED HEALTHCARE PLATFORM",
      short: "A full-stack healthcare platform that uses AI to triage symptoms, manage patient records and coordinate care between patients and providers.",
      role: "FULL-STACK DEVELOPER",
      timeline: "2025 — 2026",
      technologies: ["React", "Express", "Supabase", "FastAPI", "Gemini"],
      featured: true,
      problem: "Healthcare access is fragmented. Patients struggle to describe symptoms clearly, and early signals get lost before a clinician ever sees them. Existing tools are either consumer chatbots with no real system behind them, or enterprise software too heavy for small practices.",
      built: "CareSync is a production-oriented healthcare platform: a React frontend for patients and providers, an Express API layer, Supabase for auth and structured data, and a FastAPI microservice that wraps the Gemini model for symptom triage and summarisation. Every AI response is logged, versioned and reviewable.",
      decisions: [
        { decision: "Separate AI service behind FastAPI", why: "Keep the model layer swappable and independently deployable", tradeoff: "Extra service to operate", result: "Swapped models twice without touching the app" },
        { decision: "Supabase for auth + Postgres", why: "Ship auth and relational data fast with row-level security", tradeoff: "Tied to Supabase conventions", result: "Auth + RLS working in days, not weeks" },
        { decision: "Log every AI interaction", why: "Healthcare demands auditability", tradeoff: "Storage cost and schema design effort", result: "Full review trail for every triage" }
      ],
      challenges: [
        { title: "Hallucinated triage output", solution: "Constrained prompting + structured output schemas + confidence thresholds that force human review below a cutoff." },
        { title: "Latency on first AI call", solution: "Cold-start mitigation via keep-alive pings and response streaming so the UI feels alive while the model thinks." }
      ],
      results: "End-to-end flow working: patient intake → AI triage → provider review. Response times under ~2s for streamed triage on warm instances.",
      links: { github: "#", live: "#" },
      relatedJournal: ["reworking-portfolio", "ai-triage-notes"]
    },
    {
      slug: "cvanalyzer",
      num: "02",
      name: "CVANALYZER",
      category: "AI SYSTEM",
      tagline: "AI-POWERED CV ANALYSIS",
      short: "An AI pipeline that parses, scores and explains CVs against job descriptions — built to understand resumes the way a recruiter skims them.",
      role: "DEVELOPER",
      timeline: "2025",
      technologies: ["Python", "FastAPI", "LLMs", "React"],
      featured: true,
      problem: "Recruiters spend seconds per CV, yet most screening tools produce opaque scores with no explanation. Candidates never learn why they were rejected.",
      built: "CVAnalyzer extracts structured sections from raw PDFs, matches them against a job description with an LLM, and returns a scored breakdown with cited reasons — section by section. A React UI renders the analysis as an annotated document, not a black-box score.",
      decisions: [
        { decision: "Section-aware parsing before scoring", why: "Scores without structure are noise", tradeoff: "More complex pipeline", result: "Explanations map to real CV regions" },
        { decision: "Cited, per-section feedback", why: "Explainability is the product", tradeoff: "Longer prompts, higher token cost", result: "Users trust and act on the output" }
      ],
      challenges: [
        { title: "Messy PDF layouts breaking extraction", solution: "Multi-strategy extraction with fallback heuristics and confidence flags on every parsed field." },
        { title: "Scoring drift between runs", solution: "Temperature pinned to 0 for scoring calls and golden-set regression checks in CI." }
      ],
      results: "Working pipeline from upload to annotated report. Parsing accuracy high on standard single-column CVs; flagged confidently on complex layouts.",
      links: { github: "#", live: "#" },
      relatedJournal: ["ai-triage-notes"]
    },
    {
      slug: "saveittrip",
      num: "03",
      name: "SAVEITTRIP",
      category: "FULL-STACK",
      tagline: "SAFETY-FIRST TRAVEL PLANNING",
      short: "An autonomous travel planning system that treats traveller safety as a first-class constraint — not an afterthought filter.",
      role: "DEVELOPER",
      timeline: "2024 — 2025",
      technologies: ["Next.js", "Node.js", "PostgreSQL", "External APIs"],
      featured: true,
      problem: "Travel planners optimise for price and popularity. Safety data — crime, health, infrastructure, seasonal risk — lives in separate silos and rarely influences the plan itself.",
      built: "SaveItTrip builds itineraries where every recommendation carries a risk profile. A Node backend aggregates external safety and travel APIs, normalises them into a risk model, and a planning engine generates routes that avoid high-risk windows and regions.",
      decisions: [
        { decision: "Risk model as a first-class data layer", why: "Safety must shape the plan, not decorate it", tradeoff: "Heavier data ingestion", result: "Itineraries genuinely reroute around risk" },
        { decision: "Deterministic planning over pure LLM output", why: "Plans must be reproducible and auditable", tradeoff: "Less 'creative' itineraries", result: "Same inputs → same safe plan" }
      ],
      challenges: [
        { title: "Conflicting safety sources", solution: "Weighted scoring with source freshness as a first-class signal; stale sources decay." },
        { title: "API rate limits during aggregation", solution: "Aggressive caching and async refresh jobs so planning never blocks on slow sources." }
      ],
      results: "Prototype generates multi-day safety-aware itineraries with per-leg risk annotations.",
      links: { github: "#", live: "#" },
      relatedJournal: []
    },
    {
      slug: "vms-exide",
      num: "04",
      name: "VMS / EXIDE",
      category: "INTERNSHIP PROJECT",
      tagline: "QR-BASED APPOINTMENT SCHEDULING",
      short: "A visitor management prototype built during my internship at Exide Industries — QR-coded appointments, location scheduling and front-desk flow.",
      role: "SOFTWARE DEVELOPER INTERN",
      timeline: "2026",
      technologies: ["React", "Node.js", "PostgreSQL", "QR"],
      featured: false,
      problem: "Front-desk visitor flow at large facilities is paper-driven: no-shows clog slots, walk-ins collide with scheduled visits, and there's no auditable trail of who was where and when.",
      built: "A visitor management system where hosts pre-book visitors, visitors receive QR passes, and security scans entry/exit. Slots are location-aware so room capacity is never double-booked. Built as an internal prototype during my internship at Exide Industries.",
      decisions: [
        { decision: "QR as the only entry token", why: "Dead simple for security staff, hard to forge, works offline at the gate", tradeoff: "Requires phone access for visitors", result: "Scan-in under 3 seconds at the desk" },
        { decision: "Slot model over free-form booking", why: "Front desks think in slots, not timestamps", tradeoff: "Less flexible for visitors", result: "Predictable, collision-free scheduling" }
      ],
      challenges: [
        { title: "Offline gate scanning", solution: "Signed QR payloads with local validation; sync when connectivity returns." },
        { title: "Legacy staff workflows", solution: "Designed the desk UI around the existing paper checklist order to minimise retraining." }
      ],
      results: "Prototype validated with the facilities team; entry flow demonstrated end-to-end with real QR scans.",
      links: { github: "#", live: "#" },
      relatedJournal: ["exide-internship"]
    }
  ],

  journal: [
    {
      slug: "reworking-portfolio",
      date: "06 OCT 2026",
      category: "BUILD LOG",
      title: "Reworking my portfolio into a self-updating engineering archive",
      excerpt: "The old portfolio was a static resume page. This one is designed as a living system — data-driven from day one, wired for GitHub and Supabase later.",
      related: "caresync",
      body: [
        "Most developer portfolios are snapshots. Mine was too — a grid of projects frozen the day it shipped. The problem: my work moves faster than my website.",
        "So I rebuilt it around a simple idea: the portfolio is an archive, and archives should update themselves. Every project, journal entry, achievement and metric on this site renders from a single data layer — plain JavaScript objects today, GitHub + Supabase tomorrow.",
        "The visual language is deliberately strict: black, white, grayscale. No gradients, no neon. If the site feels rich, it should be because of typography, motion and depth — not decoration.",
        "Next: wire the data layer to real sources and let the Engineering Signal section count real commits."
      ]
    },
    {
      slug: "exide-internship",
      date: "18 SEP 2026",
      category: "ACHIEVEMENT",
      title: "Started as Software Developer Intern at Exide Industries",
      excerpt: "Joined the digital team at Exide Industries. First project: a QR-based visitor management prototype for front-desk flow.",
      related: "vms-exide",
      body: [
        "Started my internship at Exide Industries this month, working with the digital team on internal tooling.",
        "My first assignment is a visitor management prototype — QR-coded appointments, location-aware scheduling, and a scan-in flow at the gate. It's a small system, but a real one: real users at a real front desk, with real constraints like offline scanning and legacy workflows.",
        "More than anything, it's a chance to learn how software gets adopted inside a large organisation — which, it turns out, is a harder problem than writing the software."
      ]
    },
    {
      slug: "ai-triage-notes",
      date: "02 SEP 2026",
      category: "TECHNICAL",
      title: "Notes on constraining LLMs for medical triage",
      excerpt: "What I learned building the triage layer in CareSync: structured outputs, confidence cutoffs, and why every AI response needs an audit trail.",
      related: "caresync",
      body: [
        "An LLM asked to 'triage this patient' will happily invent a diagnosis. The trick is to never ask it to.",
        "In CareSync the model is constrained to a strict output schema: symptoms extracted, severity scored, recommended action chosen from a fixed set. Free text exists only as a summary of structured fields — never as the source of truth.",
        "Below a confidence threshold, the response is flagged for mandatory human review. The model proposes; the system disposes.",
        "Every interaction is logged with the prompt version, model version and output. In healthcare, an unauditable AI is a liability, not a feature."
      ]
    },
    {
      slug: "cvanalyzer-shipped",
      date: "21 AUG 2026",
      category: "PROJECTS",
      title: "CVAnalyzer: from parsing mess to explainable scoring",
      excerpt: "Shipped the first working version of CVAnalyzer — section-aware parsing, per-section scoring and cited feedback.",
      related: "cvanalyzer",
      body: [
        "CVAnalyzer started as a weekend experiment: can an LLM read a CV the way a recruiter does — fast, section-aware, and able to say why?",
        "The first version scored whole documents and produced confident nonsense. The fix was structural: parse sections first, score each against the job description, and require citations back to the CV text.",
        "Scoring calls run at temperature zero with a golden regression set in CI. Creative writing gets high temperature; hiring decisions do not."
      ]
    },
    {
      slug: "saveittrip-risk-model",
      date: "30 JUL 2026",
      category: "BUILD LOG",
      title: "Designing the risk model behind SaveItTrip",
      excerpt: "Safety-first travel planning means the risk data has to shape the itinerary, not decorate it. Notes on the model and its tradeoffs.",
      related: "saveittrip",
      body: [
        "The core decision in SaveItTrip: risk is a data layer, not a filter applied at the end.",
        "External sources are normalised into a weighted model with source freshness as a first-class signal. Stale data decays. Conflicting sources are surfaced, not silently averaged.",
        "The planning engine itself is deterministic — same inputs, same safe route. Creativity in travel planning is nice; reproducibility in safety planning is non-negotiable."
      ]
    },
    {
      slug: "linkedin-ai-systems-post",
      date: "12 JUL 2026",
      category: "LINKEDIN",
      title: "I don't just write code. I build systems.",
      excerpt: "A post on why I optimise for systems that survive contact with real users — cross-posted from LinkedIn.",
      related: null,
      body: [
        "Cross-posted from Linkedin.",
        "",
        "A tutorial shows you how to build a thing. Production shows you why the thing breaks.",
        "Every project I've shipped — CareSync, CVAnalyzer, SaveItTrip — taught me the same lesson: the code is the easy part. The system around the code is the work.",
        "Auth, audit trails, failure modes, the boring plumbing — that's what separates software that demos from software that ships."
      ]
    },
    {
      slug: "systems-over-snippets",
      date: "28 JUN 2026",
      category: "ENGINEERING NOTE",
      title: "Systems over snippets: what 'production-oriented' actually means",
      excerpt: "A personal note on my engineering philosophy — why I care more about the shape of a system than the cleverness of a function.",
      related: null,
      body: [
        "Personal engineering note.",
        "",
        "It's easy to write a clever function. It's hard to write a system that keeps working when a user does the wrong thing, an API times out, and the database is down — all at 2am.",
        "Production-oriented means designing for the day everything breaks: logs, retries, fallbacks, and a human who can understand what happened.",
        "This is the bar I hold my own projects to, even the prototypes. Especially the prototypes."
      ]
    }
  ],

  achievements: [
    {
      date: "2026",
      title: "Software Developer Intern",
      org: "EXIDE INDUSTRIES",
      type: "INTERNSHIP",
      description: "Joined the digital team; building internal tooling including a QR-based visitor management prototype.",
      related: "vms-exide",
      proof: "#"
    },
    {
      date: "2025",
      title: "CareSync — AI Healthcare Platform",
      org: "PERSONAL PROJECT",
      type: "PROJECT",
      description: "Designed and shipped a full-stack AI healthcare platform with auditable triage.",
      related: "caresync",
      proof: "#"
    },
    {
      date: "2025",
      title: "CVAnalyzer — Explainable CV Scoring",
      org: "PERSONAL PROJECT",
      type: "PROJECT",
      description: "Built an AI pipeline that scores CVs with cited, per-section feedback.",
      related: "cvanalyzer",
      proof: "#"
    },
    {
      date: "2024",
      title: "SaveItTrip — Safety-First Travel Planning",
      org: "PERSONAL PROJECT",
      type: "PROJECT",
      description: "Prototype of a travel planner with a first-class risk model.",
      related: "saveittrip",
      proof: "#"
    },
    {
      date: "2024",
      title: "B.Tech — Computer Science",
      org: "UNDERGRADUATE",
      type: "EDUCATION",
      description: "Computer Science undergraduate focused on systems, AI and software engineering.",
      related: null,
      proof: "#"
    }
  ],

  experience: [
    {
      year: "2026",
      company: "EXIDE INDUSTRIES",
      role: "SOFTWARE DEVELOPER INTERN",
      period: "2026 — PRESENT",
      description: "Digital team. Building internal tooling — starting with a QR-based visitor management prototype for front-desk flow, designed around real adoption constraints.",
      technologies: ["React", "Node.js", "PostgreSQL", "QR"]
    },
    {
      year: "2025",
      company: "INDEPENDENT",
      role: "FULL-STACK / AI SYSTEMS BUILDER",
      period: "2025 — PRESENT",
      description: "Designing and shipping production-oriented systems: CareSync (AI healthcare), CVAnalyzer (explainable CV scoring), SaveItTrip (risk-aware travel planning).",
      technologies: ["React", "FastAPI", "Supabase", "LLMs"]
    },
    {
      year: "2024",
      company: "FOUNDATIONS",
      role: "COMPUTER SCIENCE UNDERGRADUATE",
      period: "2024 —",
      description: "Deep focus on full-stack development, backend engineering, AI systems and the discipline of building software that survives real users.",
      technologies: ["Python", "JavaScript", "SQL", "Git"]
    }
  ],

  technologies: {
    FRONTEND: ["React", "TypeScript", "Next.js"],
    BACKEND: ["Node.js", "Express", "FastAPI"],
    AI: ["Python", "LLMs", "Gemini", "Groq"],
    DATABASE: ["PostgreSQL", "Supabase"],
    CLOUD: ["Vercel", "Cloudflare", "Render"]
  },

  techContext: {
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
  },

  signal: [
    { label: "REPOSITORIES", value: 24, suffix: "" },
    { label: "PROJECTS", value: 12, suffix: "" },
    { label: "COMMITS", value: 1400, suffix: "+" },
    { label: "TECHNOLOGIES", value: 15, suffix: "" },
    { label: "YEARS BUILDING", value: 3, suffix: "" }
  ],

  now: {
    building: ["AI systems", "Developer tooling", "Full-stack applications"],
    learning: ["AI engineering", "Cloud architecture", "System design"]
  }
};

window.DATA = DATA;
