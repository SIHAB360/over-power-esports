-- Remote software content controls. Apply through Supabase migration tooling.
create table if not exists public.op_software_settings (
 id integer primary key default 1 check (id = 1),
 announcement text not null default '',
 announcement_enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.op_software_settings enable row level security;
revoke all on public.op_software_settings from anon, authenticated;
insert into public.op_software_settings (id) values (1) on conflict (id) do nothing;
