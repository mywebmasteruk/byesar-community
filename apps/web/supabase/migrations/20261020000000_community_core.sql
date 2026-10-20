-- Community core schema. One engine, many spaces ("communities").
create table communities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                -- subdomain, e.g. demo
  name_en text not null,
  name_ar text,
  default_locale text not null default 'en' check (default_locale in ('en','ar')),
  pre_moderation boolean not null default true,   -- halal default: review before publish
  ai_seed_enabled boolean not null default false, -- AI seed content OFF by default
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  is_platform_admin boolean not null default false
);

create table community_members (
  community_id uuid references communities on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null default 'member' check (role in ('member','moderator','owner')),
  primary key (community_id, user_id)
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  author_id uuid references auth.users,      -- null = anonymous
  title text not null,
  body text not null default '',
  locale text not null default 'en' check (locale in ('en','ar')),
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','published','rejected','hidden')),
  is_ai_seed boolean not null default false,
  religious_flag boolean not null default false, -- set by the religious-text checker hook
  created_at timestamptz not null default now()
);

create table answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions on delete cascade,
  community_id uuid not null references communities on delete cascade,
  author_id uuid references auth.users,
  body text not null,
  status text not null default 'pending' check (status in ('pending','published','rejected','hidden')),
  religious_flag boolean not null default false,
  created_at timestamptz not null default now()
);

create table votes (
  user_id uuid not null references auth.users,
  target_type text not null check (target_type in ('question','answer')),
  target_id uuid not null,
  value smallint not null check (value in (-1,1)),
  primary key (user_id, target_type, target_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  target_type text not null check (target_type in ('question','answer')),
  target_id uuid not null,
  reporter_id uuid references auth.users,
  reason text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table blocked_terms (       -- block list: riba/gambling promotion etc.
  community_id uuid references communities on delete cascade, -- null = all communities
  term text not null,
  reason text
);

-- Row level security: public reads only published rows; writes go through the server.
alter table communities enable row level security;
alter table profiles enable row level security;
alter table community_members enable row level security;
alter table questions enable row level security;
alter table answers enable row level security;
alter table votes enable row level security;
alter table reports enable row level security;
alter table blocked_terms enable row level security;

create policy "communities readable" on communities for select using (true);
create policy "published questions readable" on questions for select using (status = 'published');
create policy "published answers readable" on answers for select using (status = 'published');
create policy "own profile" on profiles for select using (id = auth.uid());
create policy "own votes" on votes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own memberships" on community_members for select using (user_id = auth.uid());
-- Inserts (questions, answers, reports) are done by server routes with the service role,
-- after Turnstile, rate limit, block list and the religious-text hook have run.
