# TexContractor restore points

## Code (GitHub)
- Every change is a commit on `post-service-move`; the live site is the branch `seo-safe-review-20261011`.
- Named restore point: branch `restore-2026-10-23` (live site on 2026-10-23 00:05 CT, commit 960c1d6).
- To put the site back exactly as it was: push that commit to the live branch, e.g.
  `git push --force origin restore-2026-10-23:seo-safe-review-20261011`

## Data (Supabase, project rryehtaskbjnfbodymjj, Pro plan)
- Automatic: Supabase takes a daily backup of the whole database (kept 7 days) — Dashboard → Database → Backups.
- Manual: schema `texcontractor_backup` holds full copies of all 17 `texcontractor_*` tables,
  named `<table>_20261023` (not reachable from the website).
- Restore one table, e.g. listings:
  ```sql
  begin;
  delete from public.texcontractor_submissions;
  insert into public.texcontractor_submissions select * from texcontractor_backup.texcontractor_submissions_20261023;
  commit;
  ```
- Not covered by the manual copy: login accounts (auth) and uploaded photo files (storage).
