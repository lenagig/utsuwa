-- Supabase SQL Editor で一度だけ実行してください。
-- Auth は Supabase の Email/Password を利用します。

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 1 and 32),
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.unlocked_vessels (
  user_id uuid not null references auth.users(id) on delete cascade,
  vessel_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, vessel_id)
);

create table if not exists public.vessel_creations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  vessel_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_vessel_stats (
  stat_date date primary key,
  created_count integer not null default 0 check (created_count >= 0)
);

alter table public.profiles enable row level security;
alter table public.unlocked_vessels enable row level security;
alter table public.vessel_creations enable row level security;
alter table public.daily_vessel_stats enable row level security;

create policy "Users can read their profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can read their unlocked vessels"
  on public.unlocked_vessels for select using (auth.uid() = user_id);
create policy "Anyone can read daily vessel stats"
  on public.daily_vessel_stats for select using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, location)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), '名無しの器'),
    nullif(new.raw_user_meta_data ->> 'location', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- サーバー（service_role）だけが呼ぶ、競合に強い日次カウント更新。
create or replace function public.increment_daily_vessel_count(p_stat_date date)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  next_count integer;
begin
  insert into public.daily_vessel_stats (stat_date, created_count)
  values (p_stat_date, 1)
  on conflict (stat_date)
  do update set created_count = public.daily_vessel_stats.created_count + 1
  returning created_count into next_count;

  return next_count;
end;
$$;

revoke all on function public.increment_daily_vessel_count(date) from public;
