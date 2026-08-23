# SHAKS CMS — Version 1.0.0

## Admin modules
- Dashboard
- Projects: create, edit, publish/archive, feature and delete
- Categories
- Services
- Testimonials
- Media Library: upload, metadata editing and protected deletion
- Project galleries
- Contact messages and status updates
- Website settings
- SEO defaults

## Security
Version 1 uses an explicit `admin_users` allow-list. Do not rely on merely being authenticated. The database policies in `schema.sql` and `storage.sql` are already scoped to `public.is_admin()`.

Create the first admin in Supabase Auth, then insert that user's UUID into `public.admin_users`. Disable public sign-up after the admin account exists.

## Deployment
Cloudflare Pages should run `npm run build`. Set `SHAKS_SUPABASE_URL` and `SHAKS_SUPABASE_ANON_KEY` as build environment variables. The build script generates `js/supabase-config.js`; the generated file must not contain secrets beyond the browser-safe Supabase publishable/anon key.

## SEO
The public pages contain titles, descriptions, canonical URLs, Open Graph and Twitter metadata. Project/post detail pages load content client-side, so their social previews use the generic fallback metadata unless prerendering is added later.

The sitemap contains the stable public pages. A future SEO enhancement can generate project/post URLs from Supabase during the build.
