# SHAKS Portfolio CMS — V1.0.0

## CMS
Admin areas:
- Dashboard
- Projects
- Categories
- Services
- Testimonials
- Media Library
- Messages
- Website Settings
- SEO defaults

## Supabase setup
Run these SQL files in order:
1. `supabase/schema.sql`
2. `supabase/storage.sql`
3. `supabase/security-fixes.sql`

Create one administrator in Supabase Authentication. Add that user's Auth UUID to `public.admin_users`. Disable public sign-up after the admin account is created.

## Security
The browser may contain the Supabase project URL and publishable/anon key. Never expose a service-role/secret key or database password.

`security-fixes.sql` changes CMS access from generic authenticated access to the `admin_users` allow-list.

## Vercel
Use the included `vercel.json`.

Build command:
`npm run build`

Output directory:
`dist`

Vercel environment variables:
- `SHAKS_SUPABASE_URL`
- `SHAKS_SUPABASE_ANON_KEY`

Redeploy after adding or changing them.

## Cloudflare
The same build can be hosted on Cloudflare Pages later. Its deployment directory is also `dist`.

## SEO
Replace the temporary domain in `robots.txt`, `sitemap.xml`, canonical URLs and OG URLs with the final SHAKS domain before launch.
