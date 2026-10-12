// Read-only check of publicly deployed TexContractor pages.
// Run: node scripts/check-live-seo.mjs
import { readFileSync } from 'node:fs';
const xml = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replaceAll('&amp;', '&'));
const failures = [];
let passed = 0;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
for (const [i, url] of urls.entries()) {
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'TexContractor-ReadOnly-SEOVerification/1.0' } });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const html = await response.text();
    if (url.endsWith('.html') && url.includes('/services/')) {
      const canonical = '<link rel="canonical" href="' + url + '">';
      if (!html.includes(canonical)) throw new Error('Canonical mismatch');
      if (!/<h2(?:\s[^>]*)?>/i.test(html)) throw new Error('Missing service guidance; final URL: ' + response.url + '; bytes: ' + Buffer.byteLength(html) + '; title: ' + (html.match(/<title[^>]*>([^<]*)/i)?.[1] ?? 'missing') + '; cache: ' + (response.headers.get('cache-control') ?? 'unknown'));
      if (!html.includes('https://texcontractor.com/contractor.html?service=')) throw new Error('Missing contractor link');
      if (!html.includes('name="robots" content="index,follow"')) throw new Error('Robots policy changed');
    }
    passed++;
  } catch (error) {
    failures.push({ url, error: String(error) });
  }
  if ((i + 1) % 10 === 0) console.log('Checked ' + (i + 1) + '/' + urls.length);
  await sleep(150);
}
console.log(JSON.stringify({ checked: urls.length, passed, failed: failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
