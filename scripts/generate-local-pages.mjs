// Generate city + service landing pages ("Plumbing Drain Repair in Houston, TX") from the
// live provider directory, so Google can send people searching for a service in their city.
//
// Run: node scripts/generate-local-pages.mjs            (fetches the public directory)
//      LOCAL_PAGES_DATA=rows.json node scripts/...      (offline test with saved rows)
//
// Only real listings are used. A city/service page is created only when at least MIN_PER_PAGE
// providers are listed there, so no page is thin or empty. Phone numbers and web links are
// stripped from descriptions: contact details stay behind sign-in, as on the rest of the site.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const SITE = 'https://texcontractor.com';
const SUPABASE_URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
const MIN_PER_PAGE = Number(process.env.LOCAL_MIN_PER_PAGE || 5);
const OUT = join(root, 'local');

const STATES = { AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia' };

const esc = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 85);
const titleCase = (s) => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|[\s\-'.])\S/g, (m) => m.toUpperCase());
// Craigslist page chrome ("CL dallas > services > ... reply favorite flag") that slipped into some
// imported descriptions, decorative unicode fonts and emoji are removed before anything is shown.
const JUNK_LINE = /^(cl|post|account|reply|favorite|favorites|hide|flag|share|⚐|◀.*|.*▶|\d+ favorites?|posted .*|updated .*|©.*|.*map data.*|.*>\s*)$/i;
const plain = (s) => String(s || '').normalize('NFKC').replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '');
const cleanAbout = (s) => {
  let lines = String(s || '').normalize('NFKC').split(/\n+/).map((l) => l.trim()).filter(Boolean);
  // A pasted Craigslist page starts with "CL" and its navigation; the real text follows "Posted …".
  if (/^cl$/i.test(lines[0] || '')) { const at = lines.findIndex((l) => /^posted\b/i.test(l)); lines = at >= 0 ? lines.slice(at + 1) : []; }
  lines = lines.filter((l) => !JUNK_LINE.test(l) && !/prev.*next/i.test(l)).map(plain).map((l) => l.trim()).filter(Boolean);
  let text = lines.join(' ')
    .replace(/https?:\/\/\S+|www\.\S+/gi, '')
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, '')
    .replace(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '')
    .replace(/[*]{2,}/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/\b(call|text|call or text|call\/text)( me| us)?( at| now| today)?\s*[:.!]*$/i, '').trim();
  if (text.length > 240) text = text.slice(0, 240).replace(/\s+\S*$/, '') + '…';
  return text;
};
const cleanName = (s) => plain(s).replace(/[*()\[\]"“”]+/g, ' ').replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}.!)]+$/gu, '').replace(/\s+/g, ' ').trim();

async function fetchAll(table, select, extra = {}) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const q = new URLSearchParams({ select, order: 'id.asc', limit: '1000', offset: String(offset), ...extra });
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${q}`, { headers: { apikey: SUPABASE_KEY } });
    if (!r.ok) throw new Error(`${table}: HTTP ${r.status} ${await r.text()}`);
    const page = await r.json();
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

async function loadRows() {
  if (process.env.LOCAL_PAGES_DATA) return JSON.parse(readFileSync(process.env.LOCAL_PAGES_DATA, 'utf8'));
  const imported = await fetchAll('texcontractor_approved_imported_directory', 'id,business_name,service,city,state,about');
  const registered = await fetchAll('texcontractor_public_services', 'id,display_name,service,city,state,about', { is_published: 'eq.true' });
  return [
    ...registered.map((r) => ({ id: r.id, kind: 'contractor', name: r.display_name, service: r.service, city: r.city, state: r.state, about: r.about })),
    ...imported.map((r) => ({ id: r.id, kind: 'imported', name: r.business_name, service: r.service, city: r.city, state: r.state, about: r.about })),
  ];
}

const gtag = `<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18516159223"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18516159223');</script>`;

const css = `:root{--ink:#14262b;--muted:#5a6c70;--line:#dbe4e6;--bg:#f5f8f8;--card:#fff;--accent:#0b6a55;--accent-soft:#e3f2ee;--gold:#f5b84b}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--accent)}.wrap{max-width:960px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
header.top{background:#fff;border-bottom:1px solid var(--line)}header.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-block:10px}
header.top img{height:44px;width:auto;display:block}.crumbs{font-size:14px;color:var(--muted);padding-block:14px 0}.crumbs a{color:var(--muted)}
h1{font-size:clamp(26px,5vw,38px);line-height:1.15;margin:10px 0 8px;text-wrap:balance}.lead{color:var(--muted);max-width:68ch;margin:0 0 18px}
.cta{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 20px;border-radius:12px;background:var(--gold);color:#1b1b1b;font-weight:800;text-decoration:none}
.cta.alt{background:var(--accent);color:#fff}.ctas{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 26px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:8px;min-width:0}
.card h3{margin:0;font-size:18px;line-height:1.3}.card .loc{font-size:13px;color:var(--muted);font-weight:600}.card p{margin:0;color:#34484c;font-size:15px}
.card a.more{margin-top:auto;font-weight:700;text-decoration:none}.badge{display:inline-block;background:var(--accent-soft);color:var(--accent);font-size:12px;font-weight:700;border-radius:999px;padding:2px 10px}
h2{font-size:22px;margin:34px 0 10px}.links{display:flex;flex-wrap:wrap;gap:8px;padding:0;margin:0;list-style:none}
.links a{display:inline-block;background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 12px;text-decoration:none;color:var(--ink);font-size:14px}
.links a span{color:var(--muted)}.note{font-size:14px;color:var(--muted);max-width:70ch}
footer{margin-top:40px;border-top:1px solid var(--line);background:#fff}footer .wrap{padding-block:18px;font-size:14px;color:var(--muted);display:flex;gap:14px;flex-wrap:wrap}`;

function page({ path, title, description, crumbs, body, jsonld }) {
  const url = `${SITE}/${path}`;
  return `<!doctype html>
<html lang="en"><head>
${gtag}
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow"><link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:type" content="website"><meta property="og:image" content="${SITE}/texcontractor-logo.png">
<link rel="icon" type="image/png" sizes="192x192" href="/texcontractor-icon-192.png">
<style>${css}</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
</head><body>
<header class="top"><div class="wrap"><a href="/" aria-label="TexContractor home"><img src="/texcontractor-logo.png" alt="TexContractor" width="132" height="44"></a><a class="cta" href="/auth.html">Sign up</a></div></header>
<main class="wrap">
<nav class="crumbs" aria-label="Breadcrumb">${crumbs.map(([label, href]) => href ? `<a href="${href}">${esc(label)}</a>` : esc(label)).join(' › ')}</nav>
${body}
</main>
<footer><div class="wrap"><a href="/">TexContractor home</a><a href="/local/">Browse by city</a><a href="/services/">All services</a><span>Listings come from the TexContractor directory and change over time. Confirm details directly with each provider.</span></div></footer>
</body></html>
`;
}

const breadcrumbLd = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + href })) });

async function main() {
  const raw = await loadRows();
  const servicePages = new Set(existsSync(join(root, 'services')) ? readdirSync(join(root, 'services')) : []);
  const rows = raw
    .map((r) => ({ ...r, state: String(r.state || '').trim().toUpperCase(), city: titleCase(r.city), service: String(r.service || '').trim(), name: cleanName(r.name), about: cleanAbout(r.about) }))
    .filter((r) => STATES[r.state] && r.city && r.service && r.name && r.id);

  // Group by state → city → service.
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.state}|${r.city}|${r.service}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const pages = [...groups.entries()].filter(([, list]) => list.length >= MIN_PER_PAGE).map(([key, list]) => {
    const [state, city, service] = key.split('|');
    list.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'contractor' ? -1 : 1) || a.name.localeCompare(b.name));
    return { state, city, service, list, path: `local/${state.toLowerCase()}/${slug(city)}/${slug(service)}.html` };
  });

  rmSync(OUT, { recursive: true, force: true });
  const cityMap = new Map(); // "ST|City" -> pages
  for (const p of pages) { const k = `${p.state}|${p.city}`; if (!cityMap.has(k)) cityMap.set(k, []); cityMap.get(k).push(p); }
  const stateMap = new Map(); // ST -> [city keys]
  for (const k of cityMap.keys()) { const st = k.split('|')[0]; if (!stateMap.has(st)) stateMap.set(st, []); stateMap.get(st).push(k); }
  const updated = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // City + service pages.
  for (const p of pages) {
    const stName = STATES[p.state];
    const cityPath = `/local/${p.state.toLowerCase()}/${slug(p.city)}/`;
    const others = cityMap.get(`${p.state}|${p.city}`).filter((o) => o !== p).sort((a, b) => b.list.length - a.list.length);
    const sameServiceElsewhere = pages.filter((o) => o.state === p.state && o.service === p.service && o.city !== p.city).sort((a, b) => b.list.length - a.list.length).slice(0, 12);
    const browse = `/contractor.html?${new URLSearchParams({ service: p.service, city: p.city, state: p.state })}`;
    const serviceSlug = slug(p.service) + '.html';
    const cards = p.list.map((r) => {
      const href = `/profile.html?${new URLSearchParams(r.kind === 'contractor' ? { contractor: r.id, service: r.service } : { imported: r.id, service: r.service })}`;
      return `<article class="card"><h3>${esc(r.name)}</h3><div class="loc">${esc(r.city)}, ${esc(r.state)}</div>${r.about ? `<p>${esc(r.about)}</p>` : ''}<a class="more" href="${esc(href)}">View profile &amp; text →</a></article>`;
    }).join('\n');
    const body = `<h1>${esc(p.service)} in ${esc(p.city)}, ${esc(p.state)}</h1>
<p class="lead">${p.list.length} ${esc(p.service.toLowerCase())} providers based in ${esc(p.city)}, ${esc(stName)} are listed on TexContractor. Open a profile, sign in to see the phone number, and text the provider directly for a quote — no middleman. Updated ${esc(updated)}.</p>
<div class="ctas"><a class="cta" href="${esc(browse)}">Browse more near ${esc(p.city)}</a><a class="cta alt" href="/auth.html?return_to=contractor-register.html">List your service</a></div>
<section class="grid" aria-label="${esc(p.service)} providers in ${esc(p.city)}">
${cards}
</section>
<p class="note">Before you hire, describe the job, share photos if helpful, and ask about price, timing, licensing and insurance where they apply. TexContractor does not perform the work or verify every listing.</p>
${others.length ? `<h2>Other services in ${esc(p.city)}</h2><ul class="links">${others.map((o) => `<li><a href="/${o.path}">${esc(o.service)} <span>(${o.list.length})</span></a></li>`).join('')}</ul>` : ''}
${sameServiceElsewhere.length ? `<h2>${esc(p.service)} in other ${esc(stName)} cities</h2><ul class="links">${sameServiceElsewhere.map((o) => `<li><a href="/${o.path}">${esc(o.city)} <span>(${o.list.length})</span></a></li>`).join('')}</ul>` : ''}
${servicePages.has(serviceSlug) ? `<p class="note">Tips for hiring: <a href="/services/${serviceSlug}">${esc(p.service)} guide</a>.</p>` : ''}`;
    const crumbs = [['Home', '/'], ['Browse by city', '/local/'], [stName, `/local/${p.state.toLowerCase()}/`], [p.city, cityPath], [p.service, null]];
    const html = page({
      path: p.path,
      title: `${p.service} in ${p.city}, ${p.state} — ${p.list.length} local providers | TexContractor`,
      description: `Find ${p.list.length} ${p.service.toLowerCase()} providers in ${p.city}, ${stName}. View profiles and text local providers directly for a quote on TexContractor.`,
      crumbs, body,
      jsonld: [breadcrumbLd(crumbs.slice(0, 4).concat([[p.service, '/' + p.path]])), { '@context': 'https://schema.org', '@type': 'ItemList', name: `${p.service} in ${p.city}, ${p.state}`, numberOfItems: p.list.length, itemListElement: p.list.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: r.name })) }],
    });
    mkdirSync(join(root, p.path, '..'), { recursive: true });
    writeFileSync(join(root, p.path), html);
  }

  // City hubs.
  for (const [k, list] of cityMap) {
    const [state, city] = k.split('|');
    const path = `local/${state.toLowerCase()}/${slug(city)}/index.html`;
    list.sort((a, b) => b.list.length - a.list.length);
    const total = list.reduce((s, p) => s + p.list.length, 0);
    const crumbs = [['Home', '/'], ['Browse by city', '/local/'], [STATES[state], `/local/${state.toLowerCase()}/`], [city, null]];
    const body = `<h1>Local services in ${esc(city)}, ${esc(state)}</h1>
<p class="lead">${total} providers across ${list.length} service categories in ${esc(city)}, ${esc(STATES[state])}. Choose a service to see who is listed and text them directly.</p>
<ul class="links">${list.map((p) => `<li><a href="/${p.path}">${esc(p.service)} <span>(${p.list.length})</span></a></li>`).join('')}</ul>`;
    writeFileSync(join(root, path), page({ path: path.replace(/index\.html$/, ''), title: `Local services in ${city}, ${state} | TexContractor`, description: `Find local service providers in ${city}, ${STATES[state]}: ${list.slice(0, 4).map((p) => p.service).join(', ')} and more. Text providers directly on TexContractor.`, crumbs, body, jsonld: breadcrumbLd(crumbs.slice(0, 3).concat([[city, '/' + path.replace(/index\.html$/, '')]])) }));
  }

  // State hubs.
  for (const [st, cityKeys] of stateMap) {
    const path = `local/${st.toLowerCase()}/index.html`;
    const cities = cityKeys.map((k) => ({ city: k.split('|')[1], count: cityMap.get(k).reduce((s, p) => s + p.list.length, 0) })).sort((a, b) => b.count - a.count);
    const crumbs = [['Home', '/'], ['Browse by city', '/local/'], [STATES[st], null]];
    const body = `<h1>Local service providers in ${esc(STATES[st])}</h1>
<p class="lead">Choose your city to see local providers by service.</p>
<ul class="links">${cities.map((c) => `<li><a href="/local/${st.toLowerCase()}/${slug(c.city)}/">${esc(c.city)} <span>(${c.count})</span></a></li>`).join('')}</ul>`;
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), page({ path: `local/${st.toLowerCase()}/`, title: `Local service providers in ${STATES[st]} by city | TexContractor`, description: `Browse local service providers in ${STATES[st]} by city on TexContractor and text them directly.`, crumbs, body, jsonld: breadcrumbLd(crumbs.slice(0, 2).concat([[STATES[st], `/local/${st.toLowerCase()}/`]])) }));
  }

  // Root hub.
  const states = [...stateMap.keys()].sort((a, b) => STATES[a].localeCompare(STATES[b]));
  const topCities = [...cityMap.entries()].map(([k, l]) => ({ k, count: l.reduce((s, p) => s + p.list.length, 0) })).sort((a, b) => b.count - a.count).slice(0, 30);
  writeFileSync(join(OUT, 'index.html'), page({
    path: 'local/', title: 'Browse local service providers by city | TexContractor',
    description: 'Find local service providers by state and city on TexContractor — plumbers, electricians, AC repair, cleaning, lawn care and more. Text providers directly.',
    crumbs: [['Home', '/'], ['Browse by city', null]],
    body: `<h1>Browse local service providers by city</h1>
<p class="lead">Pick your state or one of the most-listed cities below.</p>
<h2>States</h2><ul class="links">${states.map((st) => `<li><a href="/local/${st.toLowerCase()}/">${esc(STATES[st])}</a></li>`).join('')}</ul>
<h2>Popular cities</h2><ul class="links">${topCities.map(({ k, count }) => { const [st, c] = k.split('|'); return `<li><a href="/local/${st.toLowerCase()}/${slug(c)}/">${esc(c)}, ${st} <span>(${count})</span></a></li>`; }).join('')}</ul>`,
  }));

  // Separate sitemap so the existing 66-URL sitemap and its checks stay untouched.
  const urls = ['local/', ...states.map((st) => `local/${st.toLowerCase()}/`), ...[...cityMap.keys()].map((k) => { const [st, c] = k.split('|'); return `local/${st.toLowerCase()}/${slug(c)}/`; }), ...pages.map((p) => p.path)];
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(join(root, 'sitemap-local.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  console.log(`Local pages: ${pages.length} city/service pages, ${cityMap.size} city hubs, ${stateMap.size} state hubs, ${urls.length} sitemap URLs (min ${MIN_PER_PAGE} providers per page, ${rows.length} usable listings).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
