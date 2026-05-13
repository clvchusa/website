-- =====================================================================
-- CLVCH 2026 — Postgres schema (Supabase / Neon / Vercel Postgres)
-- =====================================================================
-- Mirrors the localStorage shape used in the prototype:
--   clvch_locations  → cities (+ city_marquee_words)
--   clvch_gameday    → city_gameday_meta + gameday_posters
--   clvch_home       → home_content (single row, JSONB)
--   clvch_admin_role → handled by Auth provider, not a table
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Cities ---------------------------------------------------------
create type city_status as enum ('open', 'prep', 'soon');

create table cities (
  id              text primary key,                 -- slug, e.g. 'atlanta'
  city            text not null,
  state           text not null,
  status          city_status not null default 'soon',
  count           int  not null default 0,          -- room count badge
  tonight         text,                             -- headline event line
  tonight_time    text,                             -- e.g. '8:00 PM'
  address         text,
  phone           text,
  hours           text,
  capacity        int  not null default 0,
  opened          text,                             -- e.g. '2024' or 'Q3 2026'
  hero_url        text,                             -- S3/R2 URL or relative
  blurb           text,
  coords_x        int  not null default 480,        -- map pin (0..960)
  coords_y        int  not null default 310,        -- map pin (0..620)
  disabled        boolean not null default false,
  sort_order      int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index cities_active_idx on cities (disabled, sort_order);

-- Per-city marquee words (ordered)
create table city_marquee_words (
  city_id    text not null references cities(id) on delete cascade,
  position   int  not null,
  word       text not null,
  primary key (city_id, position)
);

-- Gameday section meta (1:1 with city)
create table city_gameday_meta (
  city_id     text primary key references cities(id) on delete cascade,
  enabled     boolean not null default true,
  caption     text,
  instagram   text,
  facebook    text,
  updated_at  timestamptz not null default now()
);

-- Gameday posters (uploaded media)
create table gameday_posters (
  id          uuid primary key default gen_random_uuid(),
  city_id     text not null references cities(id) on delete cascade,
  src         text not null,                       -- cloud storage URL
  label       text not null,
  is_on       boolean not null default true,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create index gameday_posters_city_idx on gameday_posters (city_id, sort_order);

-- ---------- Home page content (single-row JSON document) -------------------
-- Kept as JSONB so the admin home form can save the whole document atomically.
-- See README → "Home content shape" for the document schema.
create table home_content (
  id          int primary key default 1 check (id = 1),
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  text                                  -- user email/id
);

-- ---------- Staff (auth) ---------------------------------------------------
-- If using NextAuth/Auth.js, `users` is provided. Add a role table:
create type admin_role as enum ('super', 'manager');

create table staff_roles (
  user_id     uuid primary key,                     -- NextAuth users.id
  email       citext not null unique,
  role        admin_role not null,
  city_id     text references cities(id) on delete set null,
  -- super: city_id NULL. manager: city_id required.
  check ((role = 'super' and city_id is null) or (role = 'manager' and city_id is not null)),
  created_at  timestamptz not null default now()
);

-- ---------- Audit (optional but recommended) -------------------------------
create table admin_audit_log (
  id          bigserial primary key,
  actor_id    uuid,
  actor_email text,
  action      text not null,                        -- 'city.update', 'home.save', 'poster.delete', etc.
  target      text,                                 -- city_id or 'home' or poster id
  payload     jsonb,
  at          timestamptz not null default now()
);

-- ---------- Row-level security (Supabase pattern) -------------------------
-- Enable on cities, posters, gameday meta, home_content. Policies (sketch):
--   • super: can read/write everything
--   • manager: can read/write only rows where city_id = their staff_roles.city_id
--   • public: can read cities where disabled=false, posters where is_on=true,
--     gameday meta where enabled=true, home_content always.
-- Implement these in your migration framework once Auth is wired.

alter table cities            enable row level security;
alter table city_marquee_words enable row level security;
alter table city_gameday_meta enable row level security;
alter table gameday_posters   enable row level security;
alter table home_content      enable row level security;
alter table staff_roles       enable row level security;
alter table admin_audit_log   enable row level security;

-- ---------- Articles (Stories blog) ----------------------------------------
create table articles (
  id          text primary key,                 -- URL slug, e.g. 'game-day-at-clvch-atlanta'
  title       text not null,
  excerpt     text not null default '',
  body        text not null default '',         -- Markdown source
  city_id     text references cities(id) on delete set null,  -- null = brand-wide
  cover       text not null default '',         -- image URL
  date        date not null,
  published   boolean not null default false,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index articles_published_date_idx on articles (published, date desc);

alter table articles enable row level security;
-- Policies: super can read/write all; public can read where published=true
