#!/usr/bin/env node
// TexContractor non-destructive staging checks. Run: node scripts/check-static-site.mjs
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
let errors = 0;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function check(label, condition) {
  process.stdout.write((condition ? 'PASS' : 'FAIL') + ' ' + label + '\n');
  if (!condition) errors++;
}
function read(path) {
  const full = resolve(root, path);
  check(path + ' exists', existsSync(full));
  return existsSync(full) ? readFileSync(full, 'utf8') : '';
}
const contractor = read('contractor.html');
const profile = read('profile.html');
const registration = read('contractor-register.html');
const auth = read('auth.html');
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');
const authJs = read('tex-auth.js');
check('contractor catalog retains SMS action', contractor.includes('sms:'));
check('contractor catalog retains profile link', contractor.includes('profile.html'));
check('contractor catalog contains search description', /<meta name="description"/.test(contractor));
check('profile retains SMS action', profile.includes('sms:'));
check('registration retains profile photo field', registration.includes('name="profilePhoto"'));
check('registration retains work photo field', registration.includes('name="workPhotos"'));
check('registration is not indexed', /name="robots" content="noindex, follow"/.test(registration));
check('auth page is not indexed', /name="robots" content="noindex, follow"/.test(auth));
check('sample contractor profiles are not indexed', /name="robots" content="noindex, follow"/.test(profile));
check('unverified badge is not presented', !profile.includes('✓ Verified contractor'));
check('sample phone numbers cannot receive SMS', profile.includes('Text contact unavailable'));
check('robots points to production sitemap', robots.includes('https://texcontractor.com/sitemap.xml'));
check('sitemap lists canonical homepage', sitemap.includes('<loc>https://texcontractor.com/</loc>'));
check('sitemap lists contractor directory', sitemap.includes('<loc>https://texcontractor.com/contractor.html</loc>'));
check('auth configuration still present', authJs.includes('SUPABASE_URL'));
const usesBrowserOnlyRecords = registration.includes("localStorage.setItem('texcontractor-contractors'");
process.stdout.write((usesBrowserOnlyRecords ? 'WARN' : 'INFO') + ' Browser-local contractor storage ' + (usesBrowserOnlyRecords ? 'still exists; do not deploy as centralized registration.\n' : 'not detected in registration file.\n'));
process.stdout.write('NOTE These checks do not validate live deployment, real SMS delivery, data sync or security.\n');
process.exitCode = errors ? 1 : 0;
