# TexContractor data audit — GitHub staging copy

Audit date: 2026-10-11. Scope: GitHub branch only. This does NOT prove the live site uses the same files.

## Confirmed in this repository
- `tex-auth.js` calls Supabase Auth endpoints (OTP, user, refresh, logout). This establishes authentication integration, **not** centralized contractor storage.
- `contractor-register.html` reads profile and work images into browser-side data, then stores registration drafts, media, and contractor records in `localStorage`.
- `contractor.html` reads `texcontractor-contractors` from `localStorage` and renders these contractor cards.
- `profile.html` reads the same browser storage and also reads blocked-provider state.
- `index.html` is about 6.6 MB according to GitHub metadata but text retrieval has returned empty; do not assume its source or behavior without inspecting its bytes.
- The staged `sitemap.xml` lists only two confirmed public paths. It is not a complete inventory of services.

## Consequences
Browser localStorage is device/browser/origin-specific. Entries saved on one user's phone do not automatically appear for all visitors, and changing domains can make them inaccessible. Images encoded in localStorage may exceed browser quotas. Supabase Auth alone does not solve this.

## Required migration safeguards
1. Determine the actual live app and its persistence mechanism independently.
2. Before any replacement, make a verified backup of all contractor records and images, preserving ownership and consent.
3. Build a centralized contractor record + photo storage flow with access controls and moderation, then test on a non-production domain.
4. Confirm SMS and catalog rendering work across two unrelated browsers and after a page reload.
5. Only then consider a reversible production deployment and SEO sitemap expansion.

Do not change DNS or deploy the GitHub branch to production based solely on this audit.
