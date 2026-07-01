-- BeatDrop — Initial Schema
-- Run in Supabase SQL editor or via supabase db push

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- ─────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  username      text,
  avatar_url    text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null,
  streak_current  int default 0 not null,
  streak_best     int default 0 not null,
  total_games     int default 0 not null,
  total_wins      int default 0 not null,
  total_points    int default 0 not null,
  achievements    text[] default '{}' not null
);

alter table public.users enable row level security;

create policy "Users can read own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Public profiles readable" on public.users
  for select using (true);

-- ─────────────────────────────────────────────────────────────
-- ARTISTS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.artists (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  image_url   text,
  genres      text[] default '{}' not null,
  created_at  timestamptz default now() not null
);

alter table public.artists enable row level security;
create policy "Anyone can read artists" on public.artists for select using (true);

create index if not exists artists_name_idx on public.artists using gin(name gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────
-- ALBUMS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.albums (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  artist_id     uuid not null references public.artists(id) on delete cascade,
  cover_url     text,
  release_year  int,
  created_at    timestamptz default now() not null,
  unique(title, artist_id)
);

alter table public.albums enable row level security;
create policy "Anyone can read albums" on public.albums for select using (true);

-- ─────────────────────────────────────────────────────────────
-- SONGS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.songs (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  artist_id       uuid not null references public.artists(id) on delete cascade,
  album_id        uuid references public.albums(id) on delete set null,
  audio_url       text not null,
  preview_start   float default 0 not null,
  duration        float default 30 not null,
  genres          text[] default '{}' not null,
  decade          int,
  popularity      int default 50 not null check (popularity between 0 and 100),
  play_count      int default 0 not null,
  is_active       boolean default true not null,
  search_vector   tsvector,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

alter table public.songs enable row level security;
create policy "Anyone can read active songs" on public.songs
  for select using (is_active = true);

-- Full text search index
create index if not exists songs_search_idx on public.songs using gin(search_vector);
create index if not exists songs_popularity_idx on public.songs (popularity desc) where is_active = true;
create index if not exists songs_artist_idx on public.songs (artist_id);

-- Auto-update search_vector
create or replace function songs_search_vector_update() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.title, ''))), 'A');
  return new;
end;
$$ language plpgsql;

create trigger songs_search_vector_trigger
  before insert or update of title
  on public.songs
  for each row execute function songs_search_vector_update();

-- ─────────────────────────────────────────────────────────────
-- DAILY GAMES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.daily_games (
  id          uuid primary key default uuid_generate_v4(),
  date        date not null unique,
  song_id     uuid not null references public.songs(id) on delete cascade,
  created_at  timestamptz default now() not null
);

alter table public.daily_games enable row level security;
create policy "Anyone can read daily games" on public.daily_games for select using (true);

-- ─────────────────────────────────────────────────────────────
-- GAME SESSIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.game_sessions (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references public.users(id) on delete set null,
  song_id           uuid not null references public.songs(id) on delete cascade,
  mode              text not null check (mode in ('daily', 'infinite', 'challenge')),
  status            text not null default 'in_progress' check (status in ('in_progress', 'won', 'lost')),
  attempts_used     int default 0 not null,
  score             int default 0 not null,
  seconds_revealed  float default 1 not null,
  started_at        timestamptz default now() not null,
  finished_at       timestamptz,
  daily_date        date
);

alter table public.game_sessions enable row level security;

create policy "Users can read own sessions" on public.game_sessions
  for select using (auth.uid() = user_id or user_id is null);

create policy "Users can insert sessions" on public.game_sessions
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Users can update own sessions" on public.game_sessions
  for update using (auth.uid() = user_id or user_id is null);

create index if not exists sessions_user_idx on public.game_sessions (user_id, started_at desc);
create index if not exists sessions_daily_idx on public.game_sessions (user_id, daily_date) where mode = 'daily';

-- ─────────────────────────────────────────────────────────────
-- GUESSES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.guesses (
  id                uuid primary key default uuid_generate_v4(),
  session_id        uuid not null references public.game_sessions(id) on delete cascade,
  attempt_number    int not null,
  guessed_song_id   uuid references public.songs(id) on delete set null,
  guessed_text      text not null,
  is_correct        boolean default false not null,
  created_at        timestamptz default now() not null
);

alter table public.guesses enable row level security;
create policy "Users can manage own guesses" on public.guesses
  for all using (
    exists (
      select 1 from public.game_sessions gs
      where gs.id = session_id and (gs.user_id = auth.uid() or gs.user_id is null)
    )
  );

-- ─────────────────────────────────────────────────────────────
-- MULTIPLAYER ROOMS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.multiplayer_rooms (
  id                    uuid primary key default uuid_generate_v4(),
  code                  text not null unique,
  host_id               uuid not null references public.users(id) on delete cascade,
  status                text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  current_song_index    int default 0 not null,
  song_ids              uuid[] not null default '{}',
  settings              jsonb default '{}' not null,
  created_at            timestamptz default now() not null,
  updated_at            timestamptz default now() not null
);

alter table public.multiplayer_rooms enable row level security;
create policy "Anyone can read rooms" on public.multiplayer_rooms for select using (true);
create policy "Host can update rooms" on public.multiplayer_rooms
  for update using (auth.uid() = host_id);
create policy "Authenticated can create rooms" on public.multiplayer_rooms
  for insert with check (auth.uid() = host_id);

-- ─────────────────────────────────────────────────────────────
-- ROOM PLAYERS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.room_players (
  id          uuid primary key default uuid_generate_v4(),
  room_id     uuid not null references public.multiplayer_rooms(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  score       int default 0 not null,
  is_ready    boolean default false not null,
  joined_at   timestamptz default now() not null,
  unique(room_id, user_id)
);

alter table public.room_players enable row level security;
create policy "Anyone can read room players" on public.room_players for select using (true);
create policy "Users can manage own membership" on public.room_players
  for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- LEADERBOARDS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.leaderboards (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  period      text not null check (period in ('daily', 'weekly', 'monthly', 'all_time')),
  score       int default 0 not null,
  rank        int,
  updated_at  timestamptz default now() not null,
  unique(user_id, period)
);

alter table public.leaderboards enable row level security;
create policy "Anyone can read leaderboard" on public.leaderboards for select using (true);
create policy "Service role can upsert leaderboard" on public.leaderboards
  for all using (true);

create index if not exists leaderboard_period_score_idx on public.leaderboards (period, score desc);

-- ─────────────────────────────────────────────────────────────
-- CHALLENGES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.challenges (
  id          uuid primary key default uuid_generate_v4(),
  creator_id  uuid not null references public.users(id) on delete cascade,
  song_ids    uuid[] not null,
  code        text not null unique,
  created_at  timestamptz default now() not null,
  expires_at  timestamptz
);

alter table public.challenges enable row level security;
create policy "Anyone can read challenges" on public.challenges for select using (true);
create policy "Users can create challenges" on public.challenges
  for insert with check (auth.uid() = creator_id);
