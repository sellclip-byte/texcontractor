// Adds the TexContractor logo header, slogan band and footer to service pages (EN/ES) and cost guides.
// Run LAST: node scripts/build-es-and-request-cta.mjs && node scripts/build-guides.mjs && node scripts/brand-pages.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dirs = ['services', 'es/servicios', 'guides', 'es/guias'];
const T = {
  en: { services: 'Services', guides: 'Cost guides', req: 'Post a request', home: 'Home', band: 'Find a local pro, view their work, and <b>text them directly</b> for a quote.', copy: 'TexContractor — find local technicians near you and text them directly.', lang: 'Español' },
  es: { services: 'Servicios', guides: 'Guías de precios', req: 'Publicar solicitud', home: 'Inicio', band: 'Encuentra un técnico local, mira su trabajo y <b>escríbele directo</b> para pedir un presupuesto.', copy: 'TexContractor — encuentra técnicos locales cerca de ti y escríbeles directamente.', lang: 'English' },
};
let n = 0;
for (const d of dirs) {
  const dir = join(root, d);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.html'))) {
    const p = join(dir, f);
    let h = readFileSync(p, 'utf8');
    const lang = /<html lang="es"/.test(h) ? 'es' : 'en';
    const t = T[lang];
    const other = lang === 'es' ? 'en' : 'es';
    const altM = h.match(new RegExp(`hreflang="${other}" href="https://texcontractor\\.com([^"]+)"`));
    const altPath = altM ? altM[1] : (lang === 'es' ? '/services/' : '/es/servicios/');
    const svc = lang === 'es' ? '/es/servicios/' : '/services/';
    const gd = lang === 'es' ? '/es/guias/' : '/guides/';
    const req = '/requests.html?post=1' + (lang === 'es' ? '&amp;lang=es' : '');
    const header = `<!--tc-brand-h--><header class="tc-top"><div class="tc-wrap"><a class="tc-logo" href="/" aria-label="TexContractor ${t.home}"><picture><source srcset="/assets-optimized/texcontractor-logo-88.webp" type="image/webp"><img src="/assets-optimized/texcontractor-logo-88.png" alt="TexContractor" width="128" height="64"></picture></a><nav class="tc-nav"><a href="${svc}">${t.services}</a><a href="${gd}">${t.guides}</a><a class="tc-nav-lang" href="${altPath}" hreflang="${other}" lang="${other}">${t.lang}</a><a class="tc-nav-req" href="${req}">${t.req}</a></nav></div></header><div class="tc-band"><div class="tc-wrap">${t.band}</div></div><!--/tc-brand-h-->`;
    const footer = `<!--tc-brand-f--><footer class="tc-foot"><div class="tc-wrap"><a href="/"><img src="/assets-optimized/texcontractor-logo-88.png" alt="TexContractor" width="80" height="40"></a><a href="/">${t.home}</a><a href="${svc}">${t.services}</a><a href="${gd}">${t.guides}</a><a href="/local/">${lang === 'es' ? 'Por ciudad' : 'Browse by city'}</a><a href="${req}">${t.req}</a><span class="tc-copy">${t.copy}</span></div></footer><!--/tc-brand-f-->`;
    // idempotent: remove previous brand blocks, then the original plain header/footer
    h = h.replace(/<!--tc-brand-h-->[\s\S]*?<!--\/tc-brand-h-->/g, '').replace(/<!--tc-brand-f-->[\s\S]*?<!--\/tc-brand-f-->/g, '');
    h = h.replace(/<header>[\s\S]*?<\/header>/, '').replace(/<footer>[\s\S]*?<\/footer>/, '');
    // services/index.html and guide index pages have <body> without header
    if (!h.includes('/tc-brand.css')) h = h.replace('</head>', '<link rel="icon" type="image/png" href="/texcontractor-icon-192.png"><link rel="stylesheet" href="/tc-brand.css?v=2"></head>');
    h = h.replace(/<body(?: class="tc-brand")?>/, '<body class="tc-brand">' + header);
    h = h.replace('</body>', footer + '</body>');
    writeFileSync(p, h);
    n++;
  }
}
console.log('Branded pages:', n);
