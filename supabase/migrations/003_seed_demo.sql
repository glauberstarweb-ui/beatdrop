-- Demo seed data — replace audio_url with real Supabase Storage URLs or preview URLs

-- Artists
insert into public.artists (name, slug, genres) values
  ('The Beatles', 'the-beatles', array['Rock', 'Pop']),
  ('Queen', 'queen', array['Rock', 'Classic Rock']),
  ('Michael Jackson', 'michael-jackson', array['Pop', 'R&B']),
  ('Beyoncé', 'beyonce', array['Pop', 'R&B']),
  ('Raul Seixas', 'raul-seixas', array['Rock', 'MPB']),
  ('Roberto Carlos', 'roberto-carlos', array['MPB', 'Pop']),
  ('Ivete Sangalo', 'ivete-sangalo', array['Axé', 'MPB']),
  ('Anitta', 'anitta', array['Pop', 'Funk']),
  ('Taylor Swift', 'taylor-swift', array['Pop', 'Country']),
  ('Ed Sheeran', 'ed-sheeran', array['Pop', 'Folk'])
on conflict (slug) do nothing;

-- Note: Add real songs via the admin panel or API after creating Supabase storage
-- and uploading audio files. The audio_url should point to a publicly accessible
-- audio file (Supabase Storage, CDN, or any HTTPS URL).

-- Schedule today's daily game (requires a real song to exist)
-- insert into public.daily_games (date, song_id)
-- select current_date, id from public.songs where is_active = true order by random() limit 1
-- on conflict (date) do nothing;
