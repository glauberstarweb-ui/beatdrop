import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.argv[2],
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const sql = `
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

create table if not exists artists (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text not null unique,
  image_url  text,
  genres     text[] default '{}' not null,
  created_at timestamptz default now() not null
);

create index if not exists artists_name_idx on artists using gin(name gin_trgm_ops);

create table if not exists albums (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  artist_id    uuid not null references artists(id) on delete cascade,
  cover_url    text,
  release_year int,
  created_at   timestamptz default now() not null,
  unique(title, artist_id)
);

create table if not exists songs (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  artist_id     uuid not null references artists(id) on delete cascade,
  album_id      uuid references albums(id) on delete set null,
  audio_url     text not null,
  preview_start float default 0 not null,
  duration      float default 30 not null,
  genres        text[] default '{}' not null,
  decade        int,
  popularity    int default 50 not null,
  play_count    int default 0 not null,
  is_active     boolean default true not null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index if not exists songs_popularity_idx on songs (popularity desc) where is_active = true;
create index if not exists songs_artist_idx on songs (artist_id);
create index if not exists songs_title_idx on songs using gin(title gin_trgm_ops);

create table if not exists daily_games (
  id         uuid primary key default uuid_generate_v4(),
  date       date not null unique,
  song_id    uuid not null references songs(id) on delete cascade,
  created_at timestamptz default now() not null
);

create table if not exists game_sessions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid,
  song_id          uuid not null references songs(id) on delete cascade,
  mode             text not null,
  status           text not null default 'in_progress',
  attempts_used    int default 0 not null,
  score            int default 0 not null,
  seconds_revealed float default 1 not null,
  started_at       timestamptz default now() not null,
  finished_at      timestamptz,
  daily_date       date
);

create table if not exists guesses (
  id              uuid primary key default uuid_generate_v4(),
  session_id      uuid not null references game_sessions(id) on delete cascade,
  attempt_number  int not null,
  guessed_text    text not null,
  is_correct      boolean default false not null,
  created_at      timestamptz default now() not null
);

create table if not exists app_users (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null unique,
  username   text not null unique,
  password_hash text not null,
  created_at timestamptz default now() not null
);
`;

try {
  await client.query(sql);
  console.log("✅ Tabelas criadas com sucesso no Neon!");
} catch (e) {
  console.error("❌ Erro:", e.message);
} finally {
  await client.end();
}
