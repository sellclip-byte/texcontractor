# TexContractor production migration gate — 2026-10-11

## Verified
- GitHub repository is accessible and editable, default branch `main`.
- `tex-auth.js` in GitHub `main` references Supabase project `rryehtaskbjnfbodymjj`.
- That Supabase project is ACTIVE_HEALTHY and contains TexContractor-specific tables with row counts:
  - `texcontractor_submissions`: 49
  - `texcontractor_public_services`: 49
  - `texcontractor_members`: 2
  - `texcontractor_conversations`: 1
  - `texcontractor_messages`: 1
  - `texcontractor_site_settings`: 1
  - `texcontractor_side_ads`: 14
  - `texcontractor_admins`: 1
- RLS is enabled on these tables. Counts do **not** establish that all records are valid or that the GitHub static frontend uses them.
- 56 catalog pages plus directory are generated in GitHub staging. Live site may have 61 categories.
- GitHub staging static checks passed.

## Do not cut over until
1. Confirm frontend data flows for registration, public listings, profiles, messaging and photos use shared Supabase storage and correct RLS.
2. Back up database and uploaded media independently; Git repository backups do NOT include Supabase data.
3. Compare the 61 live catalog names against the 56 GitHub catalog names.
4. Test signup, profile photo, portfolio gallery, text-message links, search, and admin moderation on a separate GitHub-hosted preview.
5. Verify GitHub Pages is configured, set correct custom domain and DNS, and validate HTTPS.
6. Verify public routes and sitemap URLs return HTTP 200 on the intended host before setting index,follow or submitting to Google.

**No DNS, production deployment or database modifications were made in this audit.**
