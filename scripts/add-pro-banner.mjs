// Adds the "type your phone" pro banner above the footer of service, local and guide pages.
// Run after any page generator (together with add-readable.mjs). Safe to run again: pages that already have it are skipped.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MARK = 'tc-pro-banner';
const esc = (s) => s.replace(/[&"<>]/g, (c) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[c]));
function block({ src, lang, city }) {
  const q = ['theme=gold', 'src=' + src];
  if (lang) q.push('lang=' + lang);
  if (city) q.push('city=' + encodeURIComponent(city));
  const label = lang === 'es' ? '¿Eres técnico? Publícate gratis — solo con tu teléfono' : 'Are you a pro? Get listed free — just your phone';
  return `<section class="${MARK}" style="max-width:980px;margin:26px auto 22px;padding:0 14px;box-sizing:border-box"><p style="margin:0 0 8px;font:800 14px/1.35 Inter,Arial,sans-serif;color:#7a5a00;text-align:center">${label}</p><iframe src="/ad/banner.html?${esc(q.join('&'))}" title="TexContractor pro sign-up" loading="lazy" style="display:block;width:100%;height:250px;border:0;border-radius:14px;box-shadow:0 6px 18px rgba(15,23,42,.14)"></iframe></section>\n`;
}
function cityOf(html) {
  const m = /<title>\s*Local services in ([^,<]{2,30}),\s*[A-Z]{2}\b/.exec(html);
  return m ? m[1].trim() : '';
}
let n = 0;
function add(path, opts) {
  const s = readFileSync(path, 'utf8');
  if (s.includes(MARK)) return;
  const i = s.indexOf('<footer');
  if (i < 0) return;
  const o = typeof opts === 'function' ? opts(s) : opts;
  writeFileSync(path, s.slice(0, i) + block(o) + s.slice(i));
  n++;
}
function walk(dir, fn) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, fn); else if (f.endsWith('.html')) fn(p);
  }
}
const root = process.argv[2] || '.';
walk(join(root, 'services'), (p) => add(p, { src: 'services' }));
walk(join(root, 'es', 'servicios'), (p) => add(p, { src: 'servicios', lang: 'es' }));
walk(join(root, 'guides'), (p) => add(p, { src: 'guides' }));
walk(join(root, 'local'), (p) => add(p, (html) => ({ src: 'local', city: cityOf(html) })));
console.log('pro banner added to', n, 'pages');
