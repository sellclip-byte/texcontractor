// Generate SEO landing pages from real service links in the existing homepage.
// Run: node scripts/generate-service-seo.mjs
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const html = readFileSync(join(root, 'index.html'), 'utf8');
const found = new Map();
// Read the actual catalog card titles; most cards use onclick handlers, not href links.
for (const m of html.matchAll(/<h[234][^>]*class=["'][^"']*service-title[^"']*["'][^>]*>([\s\S]*?)<\/h[234]>/gi)) {
  const service = m[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
  if (service && service.length < 110 && !/[<>]/.test(service)) found.set(service.toLowerCase(), service);
}
// The homepage also uses div.service-title cards, not just heading tags.
for (const m of html.matchAll(/<[^>]+class=["'][^"']*service-title[^"']*["'][^>]*>([^<]{2,110})</gi)) {
  const service = m[1].replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
  if (service && !/[<>]/.test(service)) found.set(service.toLowerCase(), service);
}
for (const m of html.matchAll(/(?:href|data-href)\s*=\s*["']([^"']*contractor\.html\?[^"']+)["']/gi)) {
  const raw = m[1].replaceAll('&amp;', '&');
  let u;
  try { u = new URL(raw, 'https://texcontractor.com/'); } catch { continue; }
  const service = (u.searchParams.get('service') || '').trim();
  if (service && service.length < 110 && !/[<>]/.test(service)) found.set(service.toLowerCase(), service);
}
const services = [...found.values()].sort((a,b)=>a.localeCompare(b));
if (services.length !== 61) throw Error('Expected 61 verified catalog names in the current homepage, found '+services.length+'. Review catalog source before publishing.');
if (!services.length) throw Error('No real service links found in index.html; no SEO pages generated. Check the homepage catalog markup first.');
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,85);
const dir = join(root,'services'); mkdirSync(dir,{recursive:true});
// Keep generated landing pages noindex until substantive, unique content and live-domain verification are complete.
// Reviewed, service-specific editorial copy. Other categories remain noindex until reviewed.
const reviewed = {
  'garage door repair': {
    intro: 'Find contractors for garage door problems such as a door that will not open or close, noisy operation, broken springs, damaged cables, misaligned tracks, or opener and remote-control issues.',
    heading: 'Describe your garage door problem',
    details: 'When contacting a contractor, mention whether the door is stuck open or closed, whether the opener motor runs, and any unusual sounds or visible damage. Share your city or ZIP code and ask about inspection fees, parts, availability, and a written estimate before scheduling.',
    safetyHeading: 'Garage door safety',
    safety: 'Garage door springs and cables are under high tension. Do not attempt to loosen or remove them yourself. If a spring or cable appears damaged, stop operating the door and ask a qualified technician to assess it.'
  },
  'roof repair or maintenance': {
    intro: 'Roof repair requests may involve missing shingles, damaged flashing, leaks around vents, or storm-related wear. Describe where and when you noticed the issue.',
    heading: 'Information to share before a roof inspection',
    details: 'Tell the contractor the approximate roof age, roofing material if known, whether water enters during rain, and whether you see damage from the ground. Ask about inspection scope, repair options, written estimates, and cleanup.',
    safetyHeading: 'Roof access safety',
    safety: 'Avoid climbing onto a wet, steep, or damaged roof. If water is entering near electrical fixtures, keep clear of the affected area and seek appropriate professional help.'
  },
  'electrical and wiring repair': {
    intro: 'Electrical repair can include outlets that stop working, tripping breakers, flickering lights, damaged switches, and wiring faults. A qualified electrician can evaluate the cause.',
    heading: 'Describe the electrical symptoms',
    details: 'Explain which rooms or circuits are affected, when the problem began, and whether you noticed heat, buzzing, or a burning smell. Ask about licensing, diagnosis charges, permits where applicable, and a written repair estimate.',
    safetyHeading: 'Electrical safety',
    safety: 'Do not touch exposed wires or repeatedly reset a breaker that keeps tripping. If you notice smoke or signs of fire, move to safety and contact emergency services.'
  },
  'central air conditioning repair or maintenance': {
    intro: 'Air-conditioning service may involve weak airflow, warm air from vents, unusual noises, thermostat problems, or routine filter and equipment checks.',
    heading: 'Prepare for an AC service request',
    details: 'Provide the system type if known, whether the outdoor unit runs, any error codes, and the rooms affected. Ask whether diagnostic fees, replacement parts, and maintenance work are quoted separately.',
    safetyHeading: 'AC system precautions',
    safety: 'Switch off equipment that is leaking heavily, sparking, or making severe mechanical noises. Refrigerant handling and electrical repairs should be performed by qualified professionals.'
  },
  'home foundation repair': {
    intro: 'Foundation concerns can include new wall cracks, sticking doors, uneven floors, or visible movement around a slab or pier-and-beam structure.',
    heading: 'Document foundation movement',
    details: 'Share photos of cracks and note when they appeared, whether they are widening, and any drainage or soil problems around the property. Ask about inspection methods, engineering evaluation, repair proposals, and warranty terms.',
    safetyHeading: 'Structural safety',
    safety: 'If you see sudden major movement, severe structural cracking, or a risk of collapse, avoid the affected area and seek urgent professional assessment.'
  },
  'plumbing pipe repair': {
    intro: 'Pipe repair work may address dripping joints, leaking supply lines, low water pressure, corrosion, or damaged drain and water pipes.',
    heading: 'Details that help a plumber estimate the job',
    details: 'Identify the leak location, whether it occurs constantly, the visible pipe material if known, and whether water service has been shut off. Ask about leak detection, access repairs, replacement materials, and a written estimate.',
    safetyHeading: 'Water leak precautions',
    safety: 'If a pipe is actively flooding the property, use the main water shutoff when safe. Keep away from electrical equipment exposed to water.'
  },
  'tree trimming and removal': {
    intro: 'Tree services can involve pruning overgrown limbs, removing dead branches, storm cleanup, or assessing trees that lean toward buildings and power lines.',
    heading: 'Describe the tree and access conditions',
    details: 'Tell the provider the approximate tree size, proximity to structures, access for equipment, and whether debris removal or stump work is needed. Ask about insurance, permits where required, and cleanup.',
    safetyHeading: 'Tree work safety',
    safety: 'Do not approach fallen power lines or attempt to cut suspended limbs. Large-tree removal and work near utility lines require appropriately equipped professionals.'
  },
  'lawn mower water pump and outdoor equipment repair': {
    intro: 'Outdoor equipment repair can cover lawn mowers, water pumps, and small-engine machines that will not start, run unevenly, leak, or stop under load.',
    heading: 'Identify the equipment and failure',
    details: 'Share the make, model, engine type if known, and whether the unit starts, stalls, or has visible leaks. Ask about mobile service availability, diagnostic fees, parts, and repair-versus-replacement costs.',
    safetyHeading: 'Equipment safety',
    safety: 'Shut down equipment and disconnect its power source before inspection. Do not run fuel-powered engines indoors or touch moving blades and belts.'
  },
  'fence and gate installation': {
    intro: 'Fence and gate projects include replacing damaged panels, installing posts, repairing latches, and planning new wood, metal, or other boundary fencing.',
    heading: 'Plan your fence or gate project',
    details: 'Describe the approximate length, desired height and material, gate width, terrain, and whether old fencing must be removed. Ask about property-line checks, local requirements, materials, and a written quote.',
    safetyHeading: 'Before digging',
    safety: 'Have underground utilities located before excavation. Confirm property boundaries and applicable permits before installation.'
  },
  'plumbing drain repair': {
    intro: 'Find contractors who work on slow-draining sinks, clogged tubs, backed-up toilets, and blocked household drain lines. Describe the symptoms before arranging a visit.',
    heading: 'What to tell a drain repair contractor',
    details: 'Explain which fixtures are affected, whether the problem is recurring, and whether water is backing up in more than one drain. Share your city or ZIP code, and ask whether diagnostic work, drain clearing, and any follow-up repairs are priced separately.',
    safetyHeading: 'Drain and sewage precautions',
    safety: 'If wastewater is backing up, avoid using affected plumbing fixtures until the problem is assessed. Do not mix chemical drain cleaners, and tell the contractor if any cleaning products were already poured into the drain.'
  }
};
const used = new Set(); const urls = [];
for (const service of services) {
  let id = slug(service);
  if (!id) continue;
  if (used.has(id)) throw Error('SEO slug collision: '+id);
  used.add(id);
  const target = '../contractor.html?service='+encodeURIComponent(service);
  const canonical = 'https://texcontractor.com/services/'+id+'.html';
  const editorial = reviewed[service.toLowerCase()];
  const serviceCopy = editorial
    ? '<p>'+esc(editorial.intro)+'</p><h2>'+esc(editorial.heading)+'</h2><p>'+esc(editorial.details)+'</p><h2>'+esc(editorial.safetyHeading)+'</h2><p>'+esc(editorial.safety)+'</p><p>Browse available TexContractor profiles below. Listings and availability vary by location; review each contractor’s information and contact them directly by text message.</p>'
    : '<p>Looking for '+esc(service)+' services? Browse available contractor profiles on TexContractor and send a text message directly to a contractor about your project.</p><p>Contractor availability depends on your location and current listings. Check each profile for service details and contact information.</p>';
  const title = service+' Contractors | TexContractor';
  const desc = 'Explore '+service+' contractors on TexContractor. Compare service profiles and contact contractors directly by text message.';
  const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex,follow"><link rel="canonical" href="${canonical}">
<style>body{font:16px/1.6 system-ui,sans-serif;margin:auto;max-width:800px;padding:24px;color:#192b38}a{color:#0769a3}header,footer{padding:14px 0}main{padding:35px 0}a.cta{display:inline-block;padding:12px 20px;background:#075c80;color:white;border-radius:8px;text-decoration:none}</style>
</head><body><header><a href="../index.html">TexContractor</a> / Services</header><main><h1>${esc(service)} Contractors</h1>
${serviceCopy}
<a class="cta" href="${esc(target)}">Browse ${esc(service)} contractors</a>
</main><footer><a href="index.html">Browse all services</a></footer></body></html>`;
  writeFileSync(join(dir,id+'.html'),page);
  urls.push(canonical);
}
const directoryLinks = services.map(service => '<li><a href="'+slug(service)+'.html">'+esc(service)+'</a></li>').join('\n');
const directoryPage = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Browse Services | TexContractor</title><meta name="description" content="Browse TexContractor service categories and find contractors you can contact by text."><link rel="canonical" href="https://texcontractor.com/services/"></head><body><main><h1>Browse Contractor Services</h1><p>Choose a service category to browse contractor listings and contact providers directly by text message.</p><ul>'+directoryLinks+'</ul><p><a href="../index.html">TexContractor home</a></p></main></body></html>';
writeFileSync(join(dir,'index.html'),directoryPage);
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
 ['https://texcontractor.com/','https://texcontractor.com/contractor.html','https://texcontractor.com/services/',...urls].map(u=>'  <url><loc>'+u.replaceAll('&','&amp;')+'</loc></url>').join('\n')+'\n</urlset>\n';
writeFileSync(join(root,'sitemap.xml'),xml);
console.log('Generated '+urls.length+' SEO service pages from existing homepage links.');
