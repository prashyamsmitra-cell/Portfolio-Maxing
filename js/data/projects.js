/* PROJECTS — editorial layer. GitHub supplies live metadata (stars, languages, activity);
   everything here (copy, case study, featured flag) stays under your control.
   Link a project to a repo with `githubRepo: "owner/name"`, or leave it null and
   `repoHint` is matched against repo names. */
window.DATA = window.DATA || {};
DATA.projects = [
  {
    "slug": "caresync",
    "num": "01",
    "name": "CARESYNC",
    "category": "AI SYSTEM",
    "tagline": "AI-POWERED HEALTHCARE PLATFORM",
    "short": "A full-stack healthcare platform that uses AI to triage symptoms, manage patient records and coordinate care between patients and providers.",
    "visualLabel": "TRIAGE / PROVIDER REVIEW",
    "visualTone": "clinical-system",
    "screenshots": [],
    "role": "FULL-STACK DEVELOPER",
    "timeline": "2025 — 2026",
    "technologies": [
      "React",
      "Express",
      "Supabase",
      "FastAPI",
      "Gemini"
    ],
    "featured": true,
    "problem": "Healthcare access is fragmented. Patients struggle to describe symptoms clearly, and early signals get lost before a clinician ever sees them. Existing tools are either consumer chatbots with no real system behind them, or enterprise software too heavy for small practices.",
    "built": "CareSync is a production-oriented healthcare platform: a React frontend for patients and providers, an Express API layer, Supabase for auth and structured data, and a FastAPI microservice that wraps the Gemini model for symptom triage and summarisation. Every AI response is logged, versioned and reviewable.",
    "decisions": [
      {
        "decision": "Separate AI service behind FastAPI",
        "why": "Keep the model layer swappable and independently deployable",
        "tradeoff": "Extra service to operate",
        "result": "Swapped models twice without touching the app"
      },
      {
        "decision": "Supabase for auth + Postgres",
        "why": "Ship auth and relational data fast with row-level security",
        "tradeoff": "Tied to Supabase conventions",
        "result": "Auth + RLS working in days, not weeks"
      },
      {
        "decision": "Log every AI interaction",
        "why": "Healthcare demands auditability",
        "tradeoff": "Storage cost and schema design effort",
        "result": "Full review trail for every triage"
      }
    ],
    "challenges": [
      {
        "title": "Hallucinated triage output",
        "solution": "Constrained prompting + structured output schemas + confidence thresholds that force human review below a cutoff."
      },
      {
        "title": "Latency on first AI call",
        "solution": "Cold-start mitigation via keep-alive pings and response streaming so the UI feels alive while the model thinks."
      }
    ],
    "results": "End-to-end flow working: patient intake → AI triage → provider review. Response times under ~2s for streamed triage on warm instances.",
    "githubRepo": null,
      "repoHint": "caresync",
      "links": { "github": null, "live": null },
    "relatedJournal": [
      "reworking-portfolio",
      "ai-triage-notes"
    ]
  },
  {
    "slug": "cvanalyzer",
    "num": "02",
    "name": "CVANALYZER",
    "category": "AI SYSTEM",
    "tagline": "AI-POWERED CV ANALYSIS",
    "short": "An AI pipeline that parses, scores and explains CVs against job descriptions — built to understand resumes the way a recruiter skims them.",
    "visualLabel": "PARSING / SCORING PIPELINE",
    "visualTone": "document-intelligence",
    "screenshots": [],
    "role": "DEVELOPER",
    "timeline": "2025",
    "technologies": [
      "Python",
      "FastAPI",
      "LLMs",
      "React"
    ],
    "featured": true,
    "problem": "Recruiters spend seconds per CV, yet most screening tools produce opaque scores with no explanation. Candidates never learn why they were rejected.",
    "built": "CVAnalyzer extracts structured sections from raw PDFs, matches them against a job description with an LLM, and returns a scored breakdown with cited reasons — section by section. A React UI renders the analysis as an annotated document, not a black-box score.",
    "decisions": [
      {
        "decision": "Section-aware parsing before scoring",
        "why": "Scores without structure are noise",
        "tradeoff": "More complex pipeline",
        "result": "Explanations map to real CV regions"
      },
      {
        "decision": "Cited, per-section feedback",
        "why": "Explainability is the product",
        "tradeoff": "Longer prompts, higher token cost",
        "result": "Users trust and act on the output"
      }
    ],
    "challenges": [
      {
        "title": "Messy PDF layouts breaking extraction",
        "solution": "Multi-strategy extraction with fallback heuristics and confidence flags on every parsed field."
      },
      {
        "title": "Scoring drift between runs",
        "solution": "Temperature pinned to 0 for scoring calls and golden-set regression checks in CI."
      }
    ],
    "results": "Working pipeline from upload to annotated report. Parsing accuracy high on standard single-column CVs; flagged confidently on complex layouts.",
    "githubRepo": null,
      "repoHint": "cvanalyzer",
      "links": { "github": null, "live": null },
    "relatedJournal": [
      "ai-triage-notes"
    ]
  },
  {
    "slug": "saveittrip",
    "num": "03",
    "name": "SAVEITTRIP",
    "category": "FULL-STACK",
    "tagline": "SAFETY-FIRST TRAVEL PLANNING",
    "short": "An autonomous travel planning system that treats traveller safety as a first-class constraint — not an afterthought filter.",
    "visualLabel": "RISK MODEL / ITINERARY",
    "visualTone": "risk-map",
    "screenshots": [],
    "role": "DEVELOPER",
    "timeline": "2024 — 2025",
    "technologies": [
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "External APIs"
    ],
    "featured": true,
    "problem": "Travel planners optimise for price and popularity. Safety data — crime, health, infrastructure, seasonal risk — lives in separate silos and rarely influences the plan itself.",
    "built": "SaveItTrip builds itineraries where every recommendation carries a risk profile. A Node backend aggregates external safety and travel APIs, normalises them into a risk model, and a planning engine generates routes that avoid high-risk windows and regions.",
    "decisions": [
      {
        "decision": "Risk model as a first-class data layer",
        "why": "Safety must shape the plan, not decorate it",
        "tradeoff": "Heavier data ingestion",
        "result": "Itineraries genuinely reroute around risk"
      },
      {
        "decision": "Deterministic planning over pure LLM output",
        "why": "Plans must be reproducible and auditable",
        "tradeoff": "Less 'creative' itineraries",
        "result": "Same inputs → same safe plan"
      }
    ],
    "challenges": [
      {
        "title": "Conflicting safety sources",
        "solution": "Weighted scoring with source freshness as a first-class signal; stale sources decay."
      },
      {
        "title": "API rate limits during aggregation",
        "solution": "Aggressive caching and async refresh jobs so planning never blocks on slow sources."
      }
    ],
    "results": "Prototype generates multi-day safety-aware itineraries with per-leg risk annotations.",
    "githubRepo": null,
      "repoHint": "saveitrip",
      "links": { "github": null, "live": null },
    "relatedJournal": []
  },
  {
    "slug": "vms-exide",
    "num": "04",
    "name": "VMS / EXIDE",
    "category": "INTERNSHIP PROJECT",
    "tagline": "QR-BASED APPOINTMENT SCHEDULING",
    "short": "A visitor management prototype built during my internship at Exide Industries — QR-coded appointments, location scheduling and front-desk flow.",
    "visualLabel": "QR FLOW / FRONT DESK",
    "visualTone": "access-control",
    "screenshots": [],
    "role": "SOFTWARE DEVELOPER INTERN",
    "timeline": "2026",
    "technologies": [
      "React",
      "Node.js",
      "PostgreSQL",
      "QR"
    ],
    "featured": false,
    "problem": "Front-desk visitor flow at large facilities is paper-driven: no-shows clog slots, walk-ins collide with scheduled visits, and there's no auditable trail of who was where and when.",
    "built": "A visitor management system where hosts pre-book visitors, visitors receive QR passes, and security scans entry/exit. Slots are location-aware so room capacity is never double-booked. Built as an internal prototype during my internship at Exide Industries.",
    "decisions": [
      {
        "decision": "QR as the only entry token",
        "why": "Dead simple for security staff, hard to forge, works offline at the gate",
        "tradeoff": "Requires phone access for visitors",
        "result": "Scan-in under 3 seconds at the desk"
      },
      {
        "decision": "Slot model over free-form booking",
        "why": "Front desks think in slots, not timestamps",
        "tradeoff": "Less flexible for visitors",
        "result": "Predictable, collision-free scheduling"
      }
    ],
    "challenges": [
      {
        "title": "Offline gate scanning",
        "solution": "Signed QR payloads with local validation; sync when connectivity returns."
      },
      {
        "title": "Legacy staff workflows",
        "solution": "Designed the desk UI around the existing paper checklist order to minimise retraining."
      }
    ],
    "results": "Prototype validated with the facilities team; entry flow demonstrated end-to-end with real QR scans.",
    "githubRepo": null,
      "repoHint": "visitor",
      "links": { "github": null, "live": null },
    "relatedJournal": [
      "exide-internship"
    ]
  }
];
