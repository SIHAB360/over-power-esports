-- DRAFT: review against existing profile-signup flows before deployment.
-- Existing profiles own-row UPDATE RLS currently permits changes to role.
-- A logged-in user must not change role to admin or moderator via Data API.
create or replace function public.prevent_self_profile_role_escalation()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if auth.role() is distinct from 'service_role' and auth.uid() is not null then
    if TG_OP='INSERT' and lower(coalesce(new.role,'')) not in ('player','') then
      raise exception 'Profiles can only register as players' using errcode='42501';
    elsif TG_OP='UPDATE' and new.role is distinct from old.role then
      raise exception 'Profile roles may only be changed by a trusted server' using errcode='42501';
    end if;
  end if;
  return new;
end;$$;
drop trigger if exists op_prevent_self_role_escalation on public.profiles;
create trigger op_prevent_self_role_escalation
before insert or update on public.profiles
for each row execute function public.prevent_self_profile_role_escalation();
revoke all on function public.prevent_self_profile_role_escalation() from public,anon,authenticated;
