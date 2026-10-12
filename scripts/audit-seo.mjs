// Read-only SEO consistency audit. Run: node scripts/audit-seo.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const xml = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const directory = readFileSync(join(root, 'services/index.html'), 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const slugs = [...directory.matchAll(/href="\/services\/([^"]+\.html)"/g)].map(m => m[1]);
const issues = [];
const warnings = [];
if (slugs.length !== 61) issues.push('Expected 61 directory links, found ' + slugs.length);
if (new Set(slugs).size !== slugs.length) issues.push('Duplicate directory links');
if (new Set(urls).size !== urls.length) issues.push('Duplicate sitemap URLs');
if (urls.length !== 64) issues.push('Expected 64 sitemap URLs (61 services plus 3 core pages), found ' + urls.length);
for (const url of urls) if (!url.startsWith('https://texcontractor.com/')) issues.push('Unexpected sitemap host: ' + url);
for (const core of ['https://texcontractor.com/','https://texcontractor.com/contractor.html','https://texcontractor.com/services/']) if (!urls.includes(core)) issues.push('Missing core URL: ' + core);
for (const slug of slugs) {
  const file = join(root, 'services', slug);
  if (!existsSync(file)) { issues.push('Missing service page: ' + slug); continue; }
  const html = readFileSync(file, 'utf8');
  if (!html.includes('<title>')) issues.push('Missing title: ' + slug);
  if (!html.includes('name="description"')) issues.push('Missing description: ' + slug);
  if (!html.includes('rel="canonical"')) issues.push('Missing canonical: ' + slug);
  if (!html.includes('href="../contractor.html?service=') && !html.includes('href="https://texcontractor.com/contractor.html?service=')) issues.push('Missing service CTA: ' + slug);
  if (!urls.includes('https://texcontractor.com/services/' + slug)) issues.push('Missing sitemap URL: ' + slug);
  if (/name="robots"[^>]*noindex/i.test(html)) warnings.push('INTENTIONALLY NOT INDEXABLE (noindex): ' + slug);
}
console.log('Directory links:', slugs.length, '| Sitemap URLs:', urls.length);
console.log('This is a local file audit, NOT a live-domain availability or Google indexing test.');
if (warnings.length) console.log('Indexing review required (' + warnings.length + ' pages):\n' + warnings.join('\n'));
if (issues.length) {
  console.log(issues.join('\n'));
  process.exitCode = 1;
} else console.log('Local SEO file checks passed.');
