/* POSTS FALLBACK — only used when /api/posts is unreachable (e.g. static preview with no backend).
    The live source of truth is the `posts` table (Supabase) or data/posts.json in local dev.
    Deliberately empty: new entries are written from #/admin/posts. */
window.DATA = window.DATA || {};
DATA.journal = [];

/* LINKEDIN-IMPORTED POST EXAMPLE — uncomment to preview LinkedIn integration */
DATA.journal.push({
  slug: "linkedin-ai-systems-import",
  title: "Why I Optimise for Systems that Survive Real-World Contact",
  excerpt: "A deep dive into the thinking behind building resilient AI systems that handle real user challenges.",
  category: "Systems Engineering",
  date: "October 8, 2026",
  images: [],
  cover_image: null,
  linkedinPost: {
    id: "urn:li:activity:123456789",
    url: "https://linkedin.com/posts/prashyam-sankar-mitra-123456789_",
    comments: "https://linkedin.com/posts/prashyam-sankar-mitra-123456789_a1B2C3D4E5",
    shares: "https://linkedin.com/posts/prashyam-sankar-mitra-123456789_F6G7H8I9J0",
    likes: "https://linkedin.com/posts/prashyam-sankar-mitra-123456789_K1L2M3N4O5"
  }
});
