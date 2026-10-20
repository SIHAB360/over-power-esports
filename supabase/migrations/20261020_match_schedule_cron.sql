-- pg_cron runs each minute independently of admins or players visiting the site.
-- Credential is stored separately in Supabase Vault, never committed to GitHub.
create extension if not exists pg_net with schema extensions;
select cron.schedule('op-match-schedule-push-dispatch-v1','* * * * *',
 $cron$
 select net.http_post(
  url:='https://over-power-esports.vercel.app/api/cron/match-reminders',
  headers:=jsonb_build_object(
   'Content-Type','application/json',
   'Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='op_match_cron_secret_20261020')
  ),
  body:='{}'::jsonb,
  timeout_milliseconds:=15000
 )
 where exists(
   select 1 from public.op_match_schedules s
   where s.status='published'
     and s.starts_at > now()
     and s.starts_at <= now()+interval '61 minutes'
 ) or exists(
   select 1 from public.op_match_notifications n
   where n.push_sent_at is null
     and n.created_at >= now()-interval '10 minutes'
 );
 $cron$
);
