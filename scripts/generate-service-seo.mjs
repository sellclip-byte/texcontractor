// Generate SEO landing pages from real service links in the existing homepage.
// Run: node scripts/generate-service-seo.mjs
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const html = readFileSync(join(root, 'index.html'), 'utf8');
const found = new Map();
// Read the actual catalog card titles; most cards use onclick handlers, not href links.
for (const m of html.matchAll(/<h[234][^>]*class=["'][^"']*service-title[^"']*["'][^>]*>([\\s\\S]*?)<\\/h[234]>/gi)) {
  const service = m[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
  if (service && service.length < 110 && !/[<>]/.test(service)) found.set(service.toLowerCase(), service);
}
for (const m of html.matchAll(/(?:href|data-href)\\s*=\\s*["']([^"']*contractor\\.html\\?[^"']+)["']/gi)) {
  const raw = m[1].replaceAll('&amp;', '&');
  let u;
  try { u = new URL(raw, 'https://texcontractor.com/'); } catch { continue; }
  const service = (u.searchParams.get('service') || '').trim();
  if (service && service.length < 110 && !/[<>]/.test(service)) found.set(service.toLowerCase(), service);
}
const services = [...found.values()].sort((a,b)=>a.localeCompare(b));
if (services.length !== 61) {
  const patterns = [
    /service\\s*[:=]\\s*["']([^"']{3,100})["']/gi,
    /(?:catalog|category|service)[^\\n]{0,90}/gi
  ];
  for (const [i, re] of patterns.entries()) {
    const hits = [...html.matchAll(re)].slice(0, 45).map(m => m[1] || m[0]);
    console.log('CATALOG_DIAGNOSTIC_'+i, JSON.stringify(hits));
  }
  console.log('FOUND_SERVICES', JSON.stringify(services));
}
if (!services.length) throw Error('No real service links found in index.html; no SEO pages generated. Check the homepage catalog markup first.');
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,85);
const dir = join(root,'services'); mkdirSync(dir,{recursive:true});
const used = new Set(); const urls = [];
for (const service of services) {
  let id = slug(service);
  if (!id) continue;
  if (used.has(id)) throw Error('SEO slug collision: '+id);
  used.add(id);
  const target = 'https://texcontractor.com/contractor.html?service='+encodeURIComponent(service);
  const canonical = 'https://texcontractor.com/services/'+id+'.html';
  const title = service+' Contractors | TexContractor';
  const desc = 'Explore '+service+' contractors on TexContractor. Compare service profiles and contact contractors directly by text message.';
  const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}">
<style>body{font:16px/1.6 system-ui,sans-serif;margin:auto;max-width:800px;padding:24px;color:#192b38}a{color:#0769a3}header,footer{padding:14px 0}main{padding:35px 0}a.cta{display:inline-block;padding:12px 20px;background:#075c80;color:white;border-radius:8px;text-decoration:none}</style>
</head><body><header><a href="/">TexContractor</a> / Services</header><main><h1>${esc(service)} Contractors</h1>
<p>Looking for ${esc(service)} services? Browse available contractor profiles on TexContractor and send a text message directly to a contractor about your project.</p>
<p>Contractor availability depends on your location and current listings. Check each profile for service details and contact information.</p>
<a class="cta" href="${esc(target)}">Browse ${esc(service)} contractors</a>
</main><footer><a href="/">Browse all services</a></footer></body></html>`;
  writeFileSync(join(dir,id+'.html'),page);
  urls.push(canonical);
}
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
 ['https://texcontractor.com/','https://texcontractor.com/contractor.html',...urls].map(u=>'  <url><loc>'+u.replaceAll('&','&amp;')+'</loc></url>').join('\n')+'\n</urlset>\n';
writeFileSync(join(root,'sitemap.xml'),xml);
console.log('Generated '+urls.length+' SEO service pages from existing homepage links.');
