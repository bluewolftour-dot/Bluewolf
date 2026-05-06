insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'bluewolf-uploads',
    'bluewolf-uploads',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read access for Bluewolf uploads" on storage.objects;

create policy "Public read access for Bluewolf uploads"
on storage.objects
for select
using (bucket_id = 'bluewolf-uploads');
