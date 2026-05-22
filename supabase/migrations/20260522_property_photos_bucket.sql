-- Public bucket for property listing photos (uploads via service role in API routes).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-photos',
  'property-photos',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read property photos"
  on storage.objects for select
  using (bucket_id = 'property-photos');

create policy "Admins read property_photos"
  on property_photos for select
  using (exists (select 1 from admins where admins.id = auth.uid()));
