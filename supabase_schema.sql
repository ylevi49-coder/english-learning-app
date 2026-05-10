-- EnglishUp – Supabase Schema
-- Run this in the Supabase SQL editor to set up cloud sync

-- User progress (one row per user)
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  level text not null default 'A1',
  completed_lessons text[] default '{}',
  vocabulary_known text[] default '{}',
  xp integer default 0,
  streak integer default 0,
  last_activity timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- WhatsApp settings
create table if not exists whatsapp_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  phone_number text,
  enabled boolean default false,
  daily_tip boolean default true,
  word_of_day boolean default true,
  quizzes boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table user_progress enable row level security;
alter table whatsapp_settings enable row level security;

create policy "Users can manage their own progress"
  on user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own WhatsApp settings"
  on whatsapp_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_progress_updated_at
  before update on user_progress
  for each row execute function update_updated_at();
