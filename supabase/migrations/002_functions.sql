-- BeatDrop — Database Functions

-- ─────────────────────────────────────────────────────────────
-- Get daily song for a given date
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_daily_song(target_date date)
returns json
language sql
stable
security definer
as $$
  select row_to_json(t)
  from (
    select
      s.id,
      s.title,
      s.artist_id,
      a.name as artist_name,
      al.title as album_title,
      al.cover_url as album_cover,
      s.audio_url,
      s.preview_start,
      s.duration,
      s.genres,
      s.decade
    from public.daily_games dg
    join public.songs s on s.id = dg.song_id
    join public.artists a on a.id = s.artist_id
    left join public.albums al on al.id = s.album_id
    where dg.date = target_date
      and s.is_active = true
    limit 1
  ) t;
$$;

-- ─────────────────────────────────────────────────────────────
-- Get random song excluding recently played
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_random_song(exclude_ids uuid[])
returns json
language sql
stable
security definer
as $$
  select row_to_json(t)
  from (
    select
      s.id,
      s.title,
      s.artist_id,
      a.name as artist_name,
      al.title as album_title,
      al.cover_url as album_cover,
      s.audio_url,
      s.preview_start,
      s.duration,
      s.genres,
      s.decade
    from public.songs s
    join public.artists a on a.id = s.artist_id
    left join public.albums al on al.id = s.album_id
    where s.is_active = true
      and (array_length(exclude_ids, 1) is null or s.id != all(exclude_ids))
    order by random() * (s.popularity::float / 100 + 0.1) desc
    limit 1
  ) t;
$$;

-- ─────────────────────────────────────────────────────────────
-- Fuzzy search songs
-- ─────────────────────────────────────────────────────────────
create or replace function public.search_songs(query text, limit_count int default 8)
returns table (
  id          uuid,
  title       text,
  artist_name text,
  album_cover text
)
language sql
stable
security definer
as $$
  select distinct on (s.id)
    s.id,
    s.title,
    a.name as artist_name,
    al.cover_url as album_cover
  from public.songs s
  join public.artists a on a.id = s.artist_id
  left join public.albums al on al.id = s.album_id
  where s.is_active = true
    and (
      s.search_vector @@ plainto_tsquery('portuguese', unaccent(query))
      or unaccent(lower(s.title)) ilike '%' || unaccent(lower(query)) || '%'
      or unaccent(lower(a.name)) ilike '%' || unaccent(lower(query)) || '%'
    )
  order by s.id,
    ts_rank(s.search_vector, plainto_tsquery('portuguese', unaccent(query))) desc,
    s.popularity desc
  limit limit_count;
$$;

-- ─────────────────────────────────────────────────────────────
-- Upsert leaderboard score
-- ─────────────────────────────────────────────────────────────
create or replace function public.upsert_leaderboard(
  p_user_id uuid,
  p_score   int,
  p_period  text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.leaderboards (user_id, period, score)
  values (p_user_id, p_period, p_score)
  on conflict (user_id, period)
  do update set
    score = leaderboards.score + p_score,
    updated_at = now();

  -- Also update total_points on user
  update public.users
  set total_points = total_points + p_score,
      updated_at = now()
  where id = p_user_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Update user stats on session finish (trigger)
-- ─────────────────────────────────────────────────────────────
create or replace function public.on_session_finish()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.status in ('won', 'lost') and old.status = 'in_progress' and new.user_id is not null then
    update public.users
    set
      total_games = total_games + 1,
      total_wins = case when new.status = 'won' then total_wins + 1 else total_wins end,
      updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger on_session_finish_trigger
  after update on public.game_sessions
  for each row
  when (old.status = 'in_progress' and new.status in ('won', 'lost'))
  execute function public.on_session_finish();

-- ─────────────────────────────────────────────────────────────
-- Update play count on song when a session is created
-- ─────────────────────────────────────────────────────────────
create or replace function public.on_session_created()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.songs set play_count = play_count + 1 where id = new.song_id;
  return new;
end;
$$;

create trigger on_session_created_trigger
  after insert on public.game_sessions
  for each row
  execute function public.on_session_created();

-- ─────────────────────────────────────────────────────────────
-- Auto-schedule daily songs for next 30 days (run as cron)
-- ─────────────────────────────────────────────────────────────
create or replace function public.schedule_daily_songs()
returns void
language plpgsql
security definer
as $$
declare
  v_date date;
  v_song_id uuid;
begin
  for i in 1..30 loop
    v_date := current_date + i;

    -- Skip if already assigned
    if exists (select 1 from public.daily_games where date = v_date) then
      continue;
    end if;

    -- Pick random active song not used in last 90 days
    select s.id into v_song_id
    from public.songs s
    where s.is_active = true
      and s.id not in (
        select dg.song_id from public.daily_games dg
        where dg.date >= current_date - 90
      )
    order by random()
    limit 1;

    if v_song_id is not null then
      insert into public.daily_games (date, song_id) values (v_date, v_song_id);
    end if;
  end loop;
end;
$$;
