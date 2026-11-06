// Comparison pages: TexContractor vs Angi, Thumbtack, Yelp and Craigslist (EN + ES).
// Every claim about another company must be a checked fact with its source linked on the page.
// Facts last checked: November 2026. Re-check before changing any wording about a competitor.
// Run: node scripts/build-compare-pages.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const SITE = 'https://texcontractor.com';
const CHECKED = { en: 'November 2026', es: 'noviembre de 2026' };
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// Facts about each company, with the page where we read them.
const RIVALS = [
  {
    slug: 'angi-alternative', name: 'Angi',
    source: ['Angi billing FAQ (Angi help center)', 'https://intercom.help/angi/en/articles/11024858-billing-frequently-asked-questions'],
    en: { pay: 'Pros are charged per lead, from a monthly budget they set. Angi says lead prices vary by task, location and demand.', reach: 'Angi matches homeowners with pros and sends the pro the lead.' },
    es: { pay: 'Los profesionales pagan por cada cliente potencial (lead), con un presupuesto mensual que ellos fijan. Angi dice que el precio varía según el trabajo, la zona y la demanda.', reach: 'Angi conecta al cliente con profesionales y le envía el lead al profesional.' },
  },
  {
    slug: 'thumbtack-alternative', name: 'Thumbtack',
    source: ['Thumbtack community: How leads are priced', 'https://community.thumbtack.com/discussion/2397/how-leads-are-priced'],
    en: { pay: 'Pros pay for leads. Thumbtack lets pros set a maximum lead price in their settings.', reach: 'Customers request quotes and pros pay to receive those leads.' },
    es: { pay: 'Los profesionales pagan por los leads. Thumbtack les deja poner un precio máximo por lead en su configuración.', reach: 'El cliente pide cotizaciones y el profesional paga por recibir esos leads.' },
  },
  {
    slug: 'craigslist-alternative', name: 'Craigslist',
    source: ['Craigslist posting fees', 'https://www.craigslist.org/about/help/posting_fees'],
    en: { pay: 'Posting in the “services offered” section costs $5 per post in the US.', reach: 'Customers browse posts by city and contact the poster. Posts expire and have to be posted again.' },
    es: { pay: 'Publicar en la sección de “servicios” cuesta $5 por anuncio en EE. UU.', reach: 'El cliente busca anuncios por ciudad y contacta al que publicó. Los anuncios vencen y hay que volver a publicarlos.' },
  },
  {
    slug: 'yelp-alternative', name: 'Yelp',
    source: ['Yelp for Business', 'https://business.yelp.com/'],
    en: { pay: 'A basic Yelp business page is free. Yelp sells advertising to show a business more often.', reach: 'Customers read reviews and contact the business through Yelp or directly.' },
    es: { pay: 'La página básica de negocio en Yelp es gratis. Yelp vende publicidad para que un negocio aparezca más.', reach: 'El cliente lee reseñas y contacta al negocio por Yelp o directamente.' },
  },
];

const US = {
  en: { pay: 'Listing your service is free. No per-lead fees and no commission.', reach: 'Customers find you by service and city, then text you directly. No middleman, no bidding against other pros for a lead.' },
  es: { pay: 'Anunciar tu servicio es gratis. Sin pago por lead y sin comisión.', reach: 'El cliente te encuentra por servicio y ciudad y te escribe directo. Sin intermediarios y sin competir pagando por un lead.' },
};

const L = {
  en: {
    dir: 'compare', other: 'es/comparar', lang: 'en', switchTo: 'Español',
    hubTitle: 'TexContractor vs Angi, Thumbtack, Yelp & Craigslist',
    hubDesc: 'An honest comparison of how pros pay and how customers reach them on TexContractor, Angi, Thumbtack, Yelp and Craigslist. Listing on TexContractor is free.',
    hubLead: 'Why pay to reach customers who are already around you? Here is how each site works for local service pros and for customers, using what each company says on its own pages.',
    title: (n) => `${n} Alternative for Local Pros: TexContractor vs ${n}`,
    desc: (n) => `Comparing TexContractor and ${n}: how pros pay and how customers reach them. On TexContractor listing is free and customers text you directly.`,
    h1: (n) => `Looking for a ${n} alternative?`,
    lead: (n) => `${n} is a well-known way to find local service pros. TexContractor works differently: listing is free and customers text the pro directly. Here is a side-by-side look.`,
    col: ['', 'TexContractor'], rows: ['How pros pay', 'How customers reach the pro'],
    forPros: 'For pros', forProsText: 'Already paying for posts or leads? Add a free TexContractor listing too. Customers in your city can find you by service and text you directly.',
    forCustomers: 'For customers', forCustomersText: 'No need to search for hours. Find local pros by service and city, look at their profile and text them directly for a quote.',
    ctaPro: 'List your service free', ctaCustomer: 'Find a local pro',
    checked: 'Facts about other companies checked', source: 'Source', more: 'Other comparisons',
    note: 'Angi, Thumbtack, Yelp and Craigslist are trademarks of their owners. TexContractor is not affiliated with them. Their prices and rules can change; check their sites for the latest.',
    home: 'Home', compare: 'Compare',
  },
  es: {
    dir: 'es/comparar', other: 'compare', lang: 'es', switchTo: 'English',
    hubTitle: 'TexContractor vs Angi, Thumbtack, Yelp y Craigslist',
    hubDesc: 'Comparación honesta de cómo pagan los profesionales y cómo los contactan los clientes en TexContractor, Angi, Thumbtack, Yelp y Craigslist. Anunciarte en TexContractor es gratis.',
    hubLead: '¿Por qué pagar para llegar a clientes que ya están cerca de ti? Así funciona cada sitio para profesionales y clientes, según lo que cada empresa dice en sus propias páginas.',
    title: (n) => `Alternativa a ${n} para profesionales: TexContractor vs ${n}`,
    desc: (n) => `Comparamos TexContractor y ${n}: cómo pagan los profesionales y cómo los contactan los clientes. En TexContractor anunciarte es gratis y el cliente te escribe directo.`,
    h1: (n) => `¿Buscas una alternativa a ${n}?`,
    lead: (n) => `${n} es una forma conocida de encontrar profesionales locales. TexContractor funciona diferente: anunciarte es gratis y el cliente le escribe directo al profesional. Aquí los comparamos.`,
    col: ['', 'TexContractor'], rows: ['Cómo paga el profesional', 'Cómo llega el cliente al profesional'],
    forPros: 'Para profesionales', forProsText: '¿Ya pagas por anuncios o por leads? Agrega también tu perfil gratis en TexContractor. Los clientes de tu ciudad te encuentran por servicio y te escriben directo.',
    forCustomers: 'Para clientes', forCustomersText: 'No tienes que buscar por horas. Encuentra profesionales por servicio y ciudad, mira su perfil y escríbeles directo para pedir un precio.',
    ctaPro: 'Anuncia tu servicio gratis', ctaCustomer: 'Encuentra un profesional',
    checked: 'Datos sobre otras empresas revisados en', source: 'Fuente', more: 'Otras comparaciones',
    note: 'Angi, Thumbtack, Yelp y Craigslist son marcas de sus dueños. TexContractor no está afiliado con ellos. Sus precios y reglas pueden cambiar; revisa sus sitios para la información más reciente.',
    home: 'Inicio', compare: 'Comparar',
  },
};

const css = `:root{--ink:#14262b;--muted:#5a6c70;--line:#dbe4e6;--bg:#f5f8f8;--card:#fff;--accent:#0b6a55;--gold:#f5b84b}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}a{color:var(--accent)}
.wrap{max-width:900px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
header.top{background:#fff;border-bottom:1px solid var(--line)}header.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-block:10px}header.top img{height:44px;width:auto;display:block}
.crumbs{font-size:14px;color:var(--muted);padding-top:14px}.crumbs a{color:var(--muted)}h1{font-size:clamp(26px,5vw,38px);line-height:1.15;margin:10px 0 8px;text-wrap:balance}h2{font-size:22px;margin:30px 0 10px}
.lead{max-width:68ch}.tablewrap{overflow-x:auto;margin:18px 0}table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}
th,td{padding:12px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line);font-size:15px}thead th{background:#eef5f3}td.us{background:#f3faf7;font-weight:600}
@media (max-width:640px){table,tbody,tr,th,td{display:block;width:100%}thead{display:none}tr{border-bottom:3px solid var(--line)}tbody th{background:#eef5f3}td{border-bottom:1px solid var(--line)}td[data-label]::before{content:attr(data-label);display:block;font-size:12px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.03em}}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:14px}.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px}.card h3{margin:0 0 6px}
.cta{display:inline-flex;align-items:center;min-height:46px;padding:0 18px;border-radius:12px;background:var(--gold);color:#1b1b1b;font-weight:800;text-decoration:none;margin-top:8px}.cta.alt{background:var(--accent);color:#fff}
.links{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0}.links a{display:inline-block;background:#fff;border:2px solid #d4a017;border-radius:999px;padding:7px 14px;text-decoration:none;color:#000;font-weight:700}
.note{font-size:14px;color:var(--muted);max-width:72ch}footer{margin-top:40px;border-top:1px solid var(--line);background:#fff}footer .wrap{padding-block:18px;font-size:14px;color:var(--muted);display:flex;gap:14px;flex-wrap:wrap}`;

const gtag = `<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18516159223"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18516159223');</script>`;

function page(t, path, altPath, { title, desc, crumbs, body, ld }) {
  return `<!doctype html>
<html lang="${t.lang}"><head>
${gtag}
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow">
<link rel="canonical" href="${SITE}/${path}">
<link rel="alternate" hreflang="${t.lang}" href="${SITE}/${path}"><link rel="alternate" hreflang="${t.lang === 'en' ? 'es' : 'en'}" href="${SITE}/${altPath}"><link rel="alternate" hreflang="x-default" href="${SITE}/${t.lang === 'en' ? path : altPath}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}/${path}"><meta property="og:image" content="${SITE}/texcontractor-logo.png">
<link rel="icon" type="image/png" sizes="192x192" href="/texcontractor-icon-192.png">
<style>${css}</style>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head><body>
<header class="top"><div class="wrap"><a href="/" aria-label="TexContractor"><img src="/texcontractor-logo.png" alt="TexContractor" width="132" height="44"></a><a href="/${altPath}" hreflang="${t.lang === 'en' ? 'es' : 'en'}" style="font-weight:700">${t.switchTo}</a></div></header>
<main class="wrap">
<nav class="crumbs">${crumbs.map(([l, h]) => (h ? `<a href="${h}">${esc(l)}</a>` : esc(l))).join(' › ')}</nav>
${body}
</main>
<footer><div class="wrap"><a href="/">TexContractor</a><a href="/local/">${t.lang === 'es' ? 'Por ciudad' : 'Browse by city'}</a><a href="/${t.dir}/">${t.compare}</a></div></footer>
</body></html>
`;
}

const ctas = (t) => `<div class="cards">
<div class="card"><h3>${t.forPros}</h3><p>${t.forProsText}</p><a class="cta" href="/start.html">${t.ctaPro}</a></div>
<div class="card"><h3>${t.forCustomers}</h3><p>${t.forCustomersText}</p><a class="cta alt" href="${t.lang === 'es' ? '/es/local/tx/' : '/local/'}">${t.ctaCustomer}</a></div>
</div>`;

const urls = [];
for (const t of Object.values(L)) {
  const k = t.lang;
  mkdirSync(join(root, t.dir), { recursive: true });
  for (const r of RIVALS) {
    const path = `${t.dir}/${r.slug}.html`, alt = `${t.other}/${r.slug}.html`;
    const others = RIVALS.filter((o) => o !== r);
    const body = `<h1>${esc(t.h1(r.name))}</h1>
<p class="lead">${esc(t.lead(r.name))}</p>
<div class="tablewrap"><table><thead><tr><th></th><th>${r.name}</th><th>TexContractor</th></tr></thead><tbody>
<tr><th scope="row">${t.rows[0]}</th><td data-label="${r.name}">${esc(r[k].pay)}</td><td class="us" data-label="TexContractor">${esc(US[k].pay)}</td></tr>
<tr><th scope="row">${t.rows[1]}</th><td data-label="${r.name}">${esc(r[k].reach)}</td><td class="us" data-label="TexContractor">${esc(US[k].reach)}</td></tr>
</tbody></table></div>
${ctas(t)}
<p class="note">${t.checked}: ${CHECKED[k]}. ${t.source}: <a href="${r.source[1]}" rel="nofollow noopener" target="_blank">${esc(r.source[0])}</a>.</p>
<h2>${t.more}</h2><ul class="links">${others.map((o) => `<li><a href="/${t.dir}/${o.slug}.html">TexContractor vs ${o.name}</a></li>`).join('')}<li><a href="/${t.dir}/">${esc(t.hubTitle)}</a></li></ul>
<p class="note">${t.note}</p>`;
    const crumbs = [[t.home, '/'], [t.compare, `/${t.dir}/`], [r.name, null]];
    writeFileSync(join(root, path), page(t, path, alt, { title: t.title(r.name), desc: t.desc(r.name), crumbs, body,
      ld: { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [[t.home, '/'], [t.compare, `/${t.dir}/`], [r.name, `/${path}`]].map(([n, h], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + h })) } }));
    urls.push(path);
  }
  const rows = RIVALS.map((r) => `<tr><th scope="row"><a href="/${t.dir}/${r.slug}.html">${r.name}</a></th><td data-label="${t.rows[0]}">${esc(r[k].pay)}</td><td data-label="${t.rows[1]}">${esc(r[k].reach)}</td></tr>`).join('\n');
  const body = `<h1>${esc(t.hubTitle)}</h1>
<p class="lead">${esc(t.hubLead)}</p>
<div class="tablewrap"><table><thead><tr><th></th><th>${t.rows[0]}</th><th>${t.rows[1]}</th></tr></thead><tbody>
<tr><th scope="row">TexContractor</th><td class="us" data-label="${t.rows[0]}">${esc(US[k].pay)}</td><td class="us" data-label="${t.rows[1]}">${esc(US[k].reach)}</td></tr>
${rows}
</tbody></table></div>
${ctas(t)}
<p class="note">${t.checked}: ${CHECKED[k]}. ${t.source}: ${RIVALS.map((r) => `<a href="${r.source[1]}" rel="nofollow noopener" target="_blank">${esc(r.source[0])}</a>`).join(', ')}.</p>
<p class="note">${t.note}</p>`;
  writeFileSync(join(root, t.dir, 'index.html'), page(t, `${t.dir}/`, `${t.other}/`, { title: `${t.hubTitle} | TexContractor`, desc: t.hubDesc, crumbs: [[t.home, '/'], [t.compare, null]], body,
    ld: { '@context': 'https://schema.org', '@type': 'WebPage', name: t.hubTitle, inLanguage: t.lang } }));
  urls.unshift(`${t.dir}/`);
}
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(root, 'sitemap-compare.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log(`Compare pages: ${urls.length}`);
