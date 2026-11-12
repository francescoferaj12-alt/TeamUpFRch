-- Member content is readable only after signing in. Keep aff_clubs public:
-- its official club names are required by the pre-login registration form.
revoke select on public.public_profiles, public.profiles, public.annonces,
  public.career_experiences, public.coach_certificates, public.applications,
  public.messages from anon, public;

revoke execute on function public.browse_public_profiles(jsonb, integer, integer) from anon, public;
revoke execute on function public.browse_annonces(jsonb, integer, integer) from anon, public;
grant execute on function public.browse_public_profiles(jsonb, integer, integer) to authenticated;
grant execute on function public.browse_annonces(jsonb, integer, integer) to authenticated;
