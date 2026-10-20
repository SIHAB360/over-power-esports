-- Secure account sign-in overview from existing authentication audit timestamps.
-- No passwords, tokens, OTPs, location or new behavioral surveillance is collected.
create or replace function public.visitor_verified_signins()
returns jsonb language plpgsql security definer set search_path='' as $auth_audit$
declare result jsonb;
begin
 if auth.role() is distinct from 'service_role' then
  raise exception 'Only server-side verified main admin routes may read authentication activity' using errcode='42501';
 end if;
 select coalesce(jsonb_agg(to_jsonb(row_data)),'[]'::jsonb) into result from
 (select u.id as account_id,left(coalesce(u.email,''),180) as email,
         u.last_sign_in_at,p.role as account_role
  from auth.users u left join public.profiles p on p.id=u.id
  where u.last_sign_in_at is not null
  order by u.last_sign_in_at desc limit 30) row_data;
 return result;
end;$auth_audit$;
revoke all on function public.visitor_verified_signins() from public,anon,authenticated;
grant execute on function public.visitor_verified_signins() to service_role;