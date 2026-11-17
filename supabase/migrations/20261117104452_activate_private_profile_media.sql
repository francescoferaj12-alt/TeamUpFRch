-- Stale JWTs cannot read or mint profile-media signed URLs after logout.
create policy "Live session required for profile media reads"
on storage.objects as restrictive for select to authenticated
using (bucket_id not in ('avatars','videos') or (select private.profile_media_reader()) is not null);

-- Apply only after the authenticated gateway and compatibility readers are deployed.
-- Existing objects and profile references remain unchanged.
update storage.buckets set public=false where id in ('avatars','videos');
