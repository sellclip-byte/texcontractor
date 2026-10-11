# TexContractor SEO deployment checklist

This is a staging-only checklist. Do not merge until the actual live deployment source is verified.

## Current confirmed facts
- GitHub repository: sellclip-byte/texcontractor, default branch main.
- Live Search Console has accepted https://texcontractor.com/sitemap.xml and reported two discovered URLs.
- The live site has previously differed from GitHub versions. No assumption that a GitHub commit updates production.
- GitHub tex-auth.js references Supabase for authentication. Preserve its configuration and never copy user records into Git.
- The 6.6 MB index.html requires separate inspection before any rewrite.

## Before deployment
1. Identify live hosting origin and compare its HTML, CSS, JS, assets, and SMS behavior with GitHub main.
2. Verify Supabase project, access policies, database/storage ownership and backups; do not migrate data blindly.
3. Confirm GitHub Pages custom-domain status and publication branch through repository settings.
4. Verify the existing live sitemap and robots responses, canonical URLs, and indexability.
5. Test registration, profile photos, contractor catalog results, SMS templates and mobile layout in an isolated preview.
6. Only after parity is proven, plan a reversible DNS and hosting cutover with rollback.

## SEO work after parity
- Keep unique, useful service landing pages; avoid auto-generated thin city pages.
- Add accurate page-specific title, meta description, canonical, and internal links.
- List only real indexable 200-OK canonical URLs in sitemap.xml.
- Keep account and registration flows out of search indexes when appropriate.
- Recheck Search Console coverage after production deployment.

No production deployment is authorized by this checklist.
