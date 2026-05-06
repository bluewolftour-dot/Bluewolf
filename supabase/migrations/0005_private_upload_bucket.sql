update storage.buckets
set public = false
where id = 'bluewolf-uploads';

drop policy if exists "Public read access for Bluewolf uploads" on storage.objects;

revoke all on storage.objects from anon, authenticated;
revoke all on storage.buckets from anon, authenticated;
