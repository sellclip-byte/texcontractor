// Adds the site-wide readability script to every static page (run after any page generator).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const TAG = '<script src="/tex-readable.js?v=1" defer></script>';
let n = 0;
const walk = (d) => { for (const f of readdirSync(d)) { if (f === '.git' || f === 'node_modules' || f === 'local') continue; const p = join(d, f); const st = statSync(p); if (st.isDirectory()) walk(p); else if (f.endsWith('.html')) { const s = readFileSync(p, 'utf8'); if (s.includes('/tex-readable.js') || !s.includes('</head>')) continue; writeFileSync(p, s.replace('</head>', TAG + '</head>')); n++; } } };
walk(process.argv[2] || '.');
console.log('added to', n, 'pages');
