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
 );
 $cron$
);
