# SHAKS Portfolio CMS — V1.0.0

Static portfolio website with a Supabase-backed CMS.

## Stack
HTML/CSS/JavaScript + Supabase Auth/PostgreSQL/Storage + Vercel or Cloudflare.

## Version
**V1.0.0**

This is the canonical Version 1 release.

## Local build
```bash
npm install
npm run build
```
The build produces `dist/`.

## Vercel
The repository contains `vercel.json`:
- Build Command: `npm run build`
- Output Directory: `dist`

Do **not** configure Vercel to use `public`.

## Environment variables
Set:
- `SHAKS_SUPABASE_URL`
- `SHAKS_SUPABASE_ANON_KEY`

Only the browser-safe Supabase publishable/anon key is used client-side. Never expose a service-role/secret key or database password.

## Supabase
Run:
1. `supabase/schema.sql`
2. `supabase/storage.sql`
3. `supabase/security-fixes.sql`

Create the first Auth user and add its UUID to `public.admin_users` as documented in `CMS-GUIDE.md`.

## Production checklist
- Set the real domain in canonical/OG/sitemap/robots files.
- Configure Vercel environment variables.
- Deploy.
- Test admin login.
- Test project creation/editing/publishing.
- Test media upload.
- Test contact submission.
- Verify RLS.
- Submit sitemap to Google Search Console.
