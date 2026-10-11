/* ============================================================
   MARKDOWN — tiny, safe renderer for post bodies.
   Security model: ALL input is HTML-escaped first; markup is then produced only from
   a fixed set of patterns, and URLs are allow-listed. Raw HTML in posts is never rendered.
   Supports: # headings, paragraphs, lists, > quotes, ``` code ```, `inline`, **b**, *i*, [l](u), ![a](u), ---
   ============================================================ */
const Markdown = (() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SAFE_LINK = /^(https?:\/\/|mailto:|#|\/(?!\/))/i;
  const SAFE_IMG = /^https?:\/\//i;

  function inline(raw) {
    const stash = [];
    let s = esc(String(raw).replace(/\u0000/g, ''));
    s = s.replace(/`([^`]+)`/g, (_, c) => { stash.push(`<code>${c}</code>`); return `\u0000${stash.length - 1}\u0000`; });
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) =>
      SAFE_IMG.test(url) ? `<img src="${url}" alt="${alt}" loading="lazy" decoding="async">` : m);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) => {
      if (!SAFE_LINK.test(url)) return m;
      const ext = /^https?:/i.test(url);
      return `<a href="${url}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[+i]);
  }

  const isBlockStart = l => /^(#{1,4}\s|```|>\s?|\s*[-*]\s+|\s*\d+\.\s+|(-{3,}|\*{3,})\s*$)/.test(l);

  function render(md) {
    const lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }

      if (/^```/.test(line)) {
        const lang = line.slice(3).trim().replace(/[^\w+#-]/g, '').slice(0, 20);
        const buf = [];
        for (i++; i < lines.length && !/^```/.test(lines[i]); i++) buf.push(lines[i]);
        i++;
        out.push(`<pre class="md-code"${lang ? ` data-lang="${lang}"` : ''} tabindex="0"><code>${esc(buf.join('\n'))}</code></pre>`);
        continue;
      }
      const h = /^(#{1,4})\s+(.*)$/.exec(line);
      if (h) { const lvl = h[1].length + 1; out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); i++; continue; } // page title is the h1
      if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
      if (/^>\s?/.test(line)) {
        const buf = [];
        for (; i < lines.length && /^>\s?/.test(lines[i]); i++) buf.push(lines[i].replace(/^>\s?/, ''));
        out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`);
        continue;
      }
      const list = /^\s*([-*]|\d+\.)\s+/.exec(line);
      if (list) {
        const ordered = /\d/.test(list[1]);
        const re = ordered ? /^\s*\d+\.\s+(.*)$/ : /^\s*[-*]\s+(.*)$/;
        const items = [];
        for (; i < lines.length && re.test(lines[i]); i++) items.push(`<li>${inline(re.exec(lines[i])[1])}</li>`);
        out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
        continue;
      }
      const buf = [];
      for (; i < lines.length && lines[i].trim() && (buf.length === 0 || !isBlockStart(lines[i])); i++) buf.push(lines[i].trim());
      out.push(`<p>${inline(buf.join(' '))}</p>`);
    }
    return out.join('\n');
  }

  return { render, esc };
})();
window.Markdown = Markdown;
