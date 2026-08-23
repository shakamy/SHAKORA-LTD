# SHAKS Portfolio CMS — Version 1.0.0

SHAKS — Creative & Digital Studio.

A production-oriented portfolio CMS using static HTML/CSS/JS, Supabase PostgreSQL/Auth/Storage, and Cloudflare Pages.

## V1 includes
- Public portfolio website
- Dynamic projects and case studies
- Services
- Insights/posts and post detail pages
- Testimonials
- Contact enquiries
- Media Library with Supabase Storage
- Project gallery relationships
- Website and SEO settings
- Admin authentication
- Admin dashboard
- Project/category/service/testimonial management
- Cloudflare Pages deployment support
- SEO metadata, canonical URLs, Open Graph/Twitter cards, robots.txt and sitemap

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql`.
3. Run `supabase/storage.sql`.
4. Create your admin user in Supabase Authentication.
5. Add that user to `public.admin_users` using the SQL editor.
6. Disable public sign-up in Supabase Auth.
7. For local builds, set `SHAKS_SUPABASE_URL` and `SHAKS_SUPABASE_ANON_KEY` or copy the example config.
8. For Cloudflare Pages, set those two variables as build environment variables and use `npm run build`.

The Supabase publishable/anon key is intended for browser use. Never put a service-role key in browser code.

## Version
**1.0.0** — Version 1.
