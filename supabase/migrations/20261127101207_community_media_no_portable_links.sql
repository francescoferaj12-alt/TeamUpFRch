-- Community links always require a live member session, including the original Storage endpoint.
create policy "Community media cannot issue portable read links" on storage.objects as restrictive for select to authenticated
using(bucket_id<>'community-media' or not storage.allow_any_operation(array['object.sign','object.sign_many','render.image_sign']));
create policy "Community uploads require current membership" on storage.objects as restrictive for insert to authenticated
with check(bucket_id<>'community-media' or not storage.allow_only_operation('object.sign_upload_url'));
