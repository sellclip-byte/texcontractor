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

const faviconUrl = 'https://texcontractor.com/texcontractor-icon-192.png';
let faviconDiagnostics = { url: faviconUrl };
try {
  const homeResponse = await fetch('https://texcontractor.com/', {
    redirect: 'follow', signal: AbortSignal.timeout(15000)
  });
  if (!homeResponse.ok) throw new Error('Homepage HTTP ' + homeResponse.status);
  const home = await homeResponse.text();
  const head = home.split(/<head[^>]*>/i)[1]?.split(/<\/head\s*>/i)[0] ?? '';
  const iconLinks = [...head.matchAll(/<link[^>]*>/gi)]
    .map(m => m[0])
    .filter(tag => /\brel\s*=\s*(?:"[^"]*icon[^"]*"|'[^']*icon[^']*'|[^\s>]*icon[^\s>]*)/i.test(tag));
  const declaresIcon = iconLinks.some(tag => /texcontractor-icon-192\.png/i.test(tag));
  faviconDiagnostics.home = {
    finalUrl: homeResponse.url,
    status: homeResponse.status,
    contentType: homeResponse.headers.get('content-type'),
    htmlBytes: Buffer.byteLength(home),
    headFound: Boolean(head),
    iconLinks,
    mentionsExpectedIcon: head.includes('texcontractor-icon-192.png')
  };
  if (!declaresIcon) failures.push({
    url: 'https://texcontractor.com/',
    error: 'Homepage favicon declaration missing or different',
    diagnostics: faviconDiagnostics.home
  });
} catch (error) {
  failures.push({url:'https://texcontractor.com/',error:'Homepage favicon check: '+String(error)});
}
try {
  const response = await fetch(faviconUrl, {
    redirect:'follow', signal:AbortSignal.timeout(15000),
    headers:{'user-agent':'Googlebot'}
  });
  if (!response.ok) throw new Error('Favicon HTTP '+response.status);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const signature = [137,80,78,71,13,10,26,10];
  if (!signature.every((n,i)=>bytes[i]===n)) throw new Error('Favicon is not a PNG');
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const width=view.getUint32(16), height=view.getUint32(20);
  if (width!==height || width<48) throw new Error('Unexpected favicon dimensions '+width+'x'+height);
  faviconDiagnostics.image = {status:response.status,finalUrl:response.url,width,height,bytes:bytes.length};
} catch(error) {
  failures.push({url:faviconUrl,error:'Favicon image check: '+String(error)});
}
console.log('FAVICON_DIAGNOSTICS '+JSON.stringify(faviconDiagnostics));

console.log(JSON.stringify({ checked: urls.length, passed, failed: failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
