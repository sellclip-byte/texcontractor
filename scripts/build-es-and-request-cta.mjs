// Adds the "Post a request" box + hreflang/language links to English service pages,
// and builds Spanish landing pages under /es/servicios/ from scripts/data/services-es.json.
// Run: node scripts/build-es-and-request-cta.mjs   (idempotent)
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const svcDir = join(root, 'services');
const esDir = join(root, 'es', 'servicios');
mkdirSync(esDir, { recursive: true });
const es = JSON.parse(readFileSync(join(root, 'scripts', 'data', 'services-es.json'), 'utf8'));
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const unesc = (s) => s.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const SITE = 'https://texcontractor.com';

const adsTag = `  <!-- Google Ads tag: AW-18516159223 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18516159223"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-18516159223');
  </script>`;

const reqCss = '.tc-req{margin:28px 0 0;padding:18px 20px;border:2px solid #f0b44c;background:#fff8ec;border-radius:12px}.tc-req h2{margin:0 0 6px;font-size:1.15rem;color:#7c2d12}.tc-req p{margin:0 0 12px}.tc-req a.tc-req-btn{display:inline-block;padding:12px 20px;background:#b45309;color:#fff;border-radius:8px;text-decoration:none;font-weight:700}.tc-lang{float:right}';

const pages = readdirSync(svcDir).filter((f) => f.endsWith('.html') && f !== 'index.html');
const esUrls = [];
const dirLinks = [];

for (const file of pages) {
  const slug = file.replace(/\.html$/, '');
  const p = join(svcDir, file);
  let html = readFileSync(p, 'utf8');
  const m = html.match(/contractor\.html\?service=([^"]+)"/);
  if (!m) throw Error('No contractor link in ' + file);
  const enName = decodeURIComponent(unesc(m[1]));
  const t = es[slug];
  if (!t) throw Error('Missing Spanish copy for ' + slug);
  const enUrl = `${SITE}/services/${slug}.html`;
  const esUrl = `${SITE}/es/servicios/${slug}.html`;
  const reqHref = `/requests.html?post=1&service=${encodeURIComponent(enName)}`;
  const alt = `<link rel="alternate" hreflang="en" href="${enUrl}"><link rel="alternate" hreflang="es" href="${esUrl}"><link rel="alternate" hreflang="x-default" href="${enUrl}">`;

  // ---- English page (idempotent: strip previous injections first)
  html = html.replace(/<!--tc-alt-->[\s\S]*?<!--\/tc-alt-->/g, '')
    .replace(/<!--tc-req-->[\s\S]*?<!--\/tc-req-->/g, '')
    .replace(/<!--tc-lang-->[\s\S]*?<!--\/tc-lang-->/g, '')
    .replace(/<style id="tc-req-css">[\s\S]*?<\/style>/g, '');
  html = html.replace('</head>', `<!--tc-alt-->${alt}<!--/tc-alt--><style id="tc-req-css">${reqCss}</style></head>`);
  html = html.replace(/(<header>)/, `$1<!--tc-lang--><a class="tc-lang" href="/es/servicios/${slug}.html" hreflang="es" lang="es">Español</a><!--/tc-lang-->`);
  html = html.replace('</main>', `<!--tc-req--><section class="tc-req"><h2>Prefer that technicians contact you?</h2><p>Post a request with your city, a short description and photos. Local technicians can send you offers, and you choose how they reach you: chat, text or call.</p><a class="tc-req-btn" href="${esc(reqHref)}">Post a request</a></section><!--/tc-req--></main>`);
  writeFileSync(p, html);

  // ---- Spanish page
  const parts = t.parts.map(([tag, text]) => `<${tag}>${esc(text)}</${tag}>`).join('\n');
  const title = `${t.h1} | TexContractor`;
  const desc = `Encuentra técnicos de ${t.name} en TexContractor. Mira sus perfiles y escríbeles directamente por mensaje de texto para pedir un presupuesto.`;
  const browse = `/contractor.html?service=${encodeURIComponent(enName)}&lang=es`;
  const reqEs = `${reqHref}&lang=es`;
  const page = `<!doctype html>
<html lang="es"><head>${adsTag}<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow"><link rel="canonical" href="${esUrl}">${alt}
<style>body{font:16px/1.6 system-ui,sans-serif;margin:auto;max-width:800px;padding:24px;color:#192b38}a{color:#0769a3}header,footer{padding:14px 0}main{padding:35px 0}a.cta{display:inline-block;padding:12px 20px;background:#075c80;color:white;border-radius:8px;text-decoration:none}${reqCss}</style>
</head><body><header><a class="tc-lang" href="/services/${slug}.html" hreflang="en" lang="en">English</a><a href="/">TexContractor</a> / <a href="/es/servicios/">Servicios</a></header><main><h1>${esc(t.h1)}</h1>
${parts}
<a class="cta" href="${esc(browse)}">Ver técnicos de ${esc(/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(t.name) ? t.name[0].toLowerCase() + t.name.slice(1) : t.name)}</a>
<section class="tc-req"><h2>¿Prefieres que los técnicos te contacten?</h2><p>Publica una solicitud con tu ciudad, una breve descripción y fotos. Los técnicos locales pueden enviarte ofertas, y tú eliges cómo te contactan: chat, mensaje de texto o llamada.</p><a class="tc-req-btn" href="${esc(reqEs)}">Publicar una solicitud</a></section>
</main><footer><a href="/es/servicios/">Ver todos los servicios</a></footer></body></html>`;
  writeFileSync(join(esDir, file), page);
  esUrls.push(esUrl);
  dirLinks.push([t.name, slug]);
}

dirLinks.sort((a, b) => a[0].localeCompare(b[0], 'es'));
const list = dirLinks.map(([n, s]) => `<li><a href="/es/servicios/${s}.html">${esc(n)}</a></li>`).join('\n');
writeFileSync(join(esDir, 'index.html'), `<!doctype html><html lang="es"><head>${adsTag}<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Servicios para el hogar cerca de ti | TexContractor</title><meta name="description" content="Elige un servicio, mira los perfiles de técnicos locales y escríbeles directamente por mensaje de texto."><link rel="canonical" href="${SITE}/es/servicios/"><link rel="alternate" hreflang="en" href="${SITE}/services/"><link rel="alternate" hreflang="es" href="${SITE}/es/servicios/"><style>body{font:16px/1.6 system-ui,sans-serif;margin:auto;max-width:800px;padding:24px;color:#192b38}a{color:#0769a3}.tc-lang{float:right}</style></head><body><header><a class="tc-lang" href="/services/" hreflang="en" lang="en">English</a><a href="/">TexContractor</a></header><main><h1>Servicios para el hogar cerca de ti</h1><p>Elige un servicio para ver los perfiles de técnicos locales y escribirles directamente por mensaje de texto.</p><ul>${list}</ul><p><a href="/requests.html?post=1&amp;lang=es">Publicar una solicitud</a></p></main></body></html>`);
esUrls.unshift(`${SITE}/es/servicios/`);

writeFileSync(join(root, 'sitemap-es.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + esUrls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') + '\n</urlset>\n');
const robots = readFileSync(join(root, 'robots.txt'), 'utf8');
if (!robots.includes('sitemap-es.xml')) writeFileSync(join(root, 'robots.txt'), robots.trimEnd() + '\nSitemap: https://texcontractor.com/sitemap-es.xml\n');
const dirPath = join(svcDir, 'index.html');
let dirHtml = readFileSync(dirPath, 'utf8').replace(/<!--tc-lang-->[\s\S]*?<!--\/tc-lang-->/g, '');
dirHtml = dirHtml.replace('<main>', '<main><!--tc-lang--><p style="text-align:right"><a href="/es/servicios/" hreflang="es" lang="es">Servicios en español</a></p><!--/tc-lang-->');
writeFileSync(dirPath, dirHtml);
console.log('EN pages updated:', pages.length, '| ES pages:', esUrls.length - 1);
