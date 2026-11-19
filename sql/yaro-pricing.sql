-- Exécuter dans l'éditeur SQL du projet Supabase Yaro Consulting.
create extension if not exists pgcrypto;
create table if not exists public.yaro_pricing_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  prospect_label text not null default 'Prospect',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  constraint yaro_pricing_code_ttl check (expires_at > created_at and expires_at <= created_at + interval '24 hours 5 minutes')
);
alter table public.yaro_pricing_codes enable row level security;
revoke all on public.yaro_pricing_codes from anon, authenticated;
create table if not exists public.yaro_pricing_attempts (
  visitor_hash text primary key,
  window_start timestamptz not null default now(),
  attempts integer not null default 0
);
alter table public.yaro_pricing_attempts enable row level security;
revoke all on public.yaro_pricing_attempts from anon, authenticated;
create or replace function public.yaro_pricing_rate_limit(visitor_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  insert into public.yaro_pricing_attempts(visitor_hash,window_start,attempts)
  values(visitor_hash,now(),1)
  on conflict (visitor_hash) do update set
    window_start=case when public.yaro_pricing_attempts.window_start < now()-interval '15 minutes' then now() else public.yaro_pricing_attempts.window_start end,
    attempts=case when public.yaro_pricing_attempts.window_start < now()-interval '15 minutes' then 1 else public.yaro_pricing_attempts.attempts+1 end
  returning attempts into n;
  return n<=10;
end $$;
revoke all on function public.yaro_pricing_rate_limit(text) from public, anon, authenticated;
grant execute on function public.yaro_pricing_rate_limit(text) to service_role;
-- Maintenance facultative : supprimer périodiquement les codes expirés après conservation nécessaire.
