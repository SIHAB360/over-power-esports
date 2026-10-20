-- Approved-player Match Center delivery repair (presentation / notification only).
-- Roster inactive still excludes competitive lineup selection and public listing,
-- but APPROVED logged-in members may read their own squad match announcements.
-- Orphan roster rows lacking auth.users/profiles NEVER receive inbox items.
create or replace function public.op_enqueue_match_publication(p_schedule_id uuid)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_inserted integer:=0;
begin
  with schedule as (
    select s.id,s.team_id from public.op_match_schedules s
    where s.id=p_schedule_id and s.status='published'
  ), inserted as (
    insert into public.op_match_notifications(schedule_id,user_id,event_key)
    select s.id,p.user_id,'created'
    from schedule s
    join public.players p on p.status='approved'
      and (s.team_id is null or s.team_id=p.team_id)
    join auth.users a on a.id=p.user_id
    join public.profiles pr on pr.id=p.user_id and lower(pr.role)='player'
    on conflict(schedule_id,user_id,event_key) do nothing
    returning id
  ) select count(*) into v_inserted from inserted;
  return v_inserted;
end
$$;
revoke all on function public.op_enqueue_match_publication(uuid) from public,anon,authenticated;
grant execute on function public.op_enqueue_match_publication(uuid) to service_role;

-- Same recipient rule for the 60m, 30m and 15m reminders.
create or replace function public.op_claim_due_match_reminders()
returns table(notification_id uuid,schedule_id uuid,user_id uuid,event_key text)
language sql security definer set search_path=''
as $$
 with due as (
   select s.id, e.event_key
   from public.op_match_schedules s
   cross join (values ('60m'::text,60),('30m'::text,30),('15m'::text,15)) e(event_key,minute_offset)
   where s.status='published'
     and now() >= s.starts_at - make_interval(mins => e.minute_offset)
     and now() < least(s.starts_at, s.starts_at - make_interval(mins=>e.minute_offset) + interval '5 minutes')
 ), eligible as (
   select d.id schedule_id,p.user_id,d.event_key
   from due d
   join public.op_match_schedules s on s.id=d.id
   join public.players p on p.status='approved'
      and (s.team_id is null or s.team_id=p.team_id)
   join auth.users a on a.id=p.user_id
   join public.profiles pr on pr.id=p.user_id and lower(pr.role)='player'
 ), inserted as (
   insert into public.op_match_notifications(schedule_id,user_id,event_key)
   select distinct schedule_id,user_id,event_key from eligible
   on conflict(schedule_id,user_id,event_key) do nothing
   returning id,schedule_id,user_id,event_key
 ) select id,schedule_id,user_id,event_key from inserted;
$$;
revoke all on function public.op_claim_due_match_reminders() from public,anon,authenticated;
grant execute on function public.op_claim_due_match_reminders() to service_role;

-- Repair existing FUTURE published schedules without changing the audience or
-- resending duplicate 'created' events to recipients already in the inbox.
insert into public.op_match_notifications(schedule_id,user_id,event_key)
select s.id,p.user_id,'created'
from public.op_match_schedules s
join public.players p on p.status='approved'
  and (s.team_id is null or s.team_id=p.team_id)
join auth.users a on a.id=p.user_id
join public.profiles pr on pr.id=p.user_id and lower(pr.role)='player'
where s.status='published' and s.starts_at>now()
on conflict(schedule_id,user_id,event_key) do nothing;
