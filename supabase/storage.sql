insert into storage.buckets(id,name,public) values('portfolio-media','portfolio-media',true) on conflict(id) do update set public=true;
create policy public_portfolio_media_read on storage.objects for select using(bucket_id='portfolio-media');
create policy auth_portfolio_media_insert on storage.objects for insert to authenticated with check(bucket_id='portfolio-media');
create policy auth_portfolio_media_update on storage.objects for update to authenticated using(bucket_id='portfolio-media') with check(bucket_id='portfolio-media');
create policy auth_portfolio_media_delete on storage.objects for delete to authenticated using(bucket_id='portfolio-media');
