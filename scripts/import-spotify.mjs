import pg from "pg";

const { Client } = pg;

const db = new Client({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
});

const SEARCH_TERMS = [
  "pop", "rock", "hip hop", "samba", "funk brasil",
  "sertanejo", "jazz", "soul", "reggae", "electronic",
  "taylor swift", "beyonce", "beatles", "michael jackson",
  "anitta", "roberto carlos", "ivete sangalo", "caetano veloso",
  "adele", "ed sheeran", "drake", "rihanna", "eminem",
  "madonna", "nirvana", "queen", "coldplay", "the weeknd",
  "bad bunny", "j balvin", "shakira", "gloria gaynor",
  "bon jovi", "ac dc", "guns n roses", "metallica",
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80);
}

async function searchDeezer(term) {
  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(term)}&limit=50&output=json`;
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`   ⚠️ Erro HTTP: ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (data.error) {
      console.log(`   ⚠️ Erro Deezer: ${data.error.message}`);
      return [];
    }
    const results = (data.data ?? []).filter(t => t.preview && t.preview.length > 0);
    console.log(`   → ${data.data?.length ?? 0} resultados, ${results.length} com preview`);
    return results;
  } catch (e) {
    console.log(`   ⚠️ Erro: ${e.message}`);
    return [];
  }
}

async function importTracks(tracks) {
  let count = 0;
  for (const track of tracks) {
    try {
      const artistName = track.artist?.name;
      const trackName = track.title;
      const albumName = track.album?.title;
      const coverUrl = track.album?.cover_medium ?? track.album?.cover ?? null;
      const deezerId = track.id;

      if (!artistName || !trackName || !deezerId) continue;

      const previewUrl = `/api/audio/${deezerId}`;

      // Upsert artista
      const slug = slugify(artistName) + "-" + Math.random().toString(36).slice(2, 6);
      const artistRes = await db.query(
        `INSERT INTO public.artists (name, slug, genres)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [artistName, slug, []]
      );
      const artistId = artistRes.rows[0].id;

      // Upsert álbum
      let albumId = null;
      if (albumName) {
        const albumRes = await db.query(
          `INSERT INTO public.albums (title, artist_id, cover_url)
           VALUES ($1, $2, $3)
           ON CONFLICT (title, artist_id) DO UPDATE SET cover_url = EXCLUDED.cover_url
           RETURNING id`,
          [albumName, artistId, coverUrl]
        );
        albumId = albumRes.rows[0].id;
      }

      // Inserir música
      await db.query(
        `INSERT INTO public.songs (title, artist_id, album_id, audio_url, deezer_id, preview_start, duration, genres, popularity, is_active)
         VALUES ($1, $2, $3, $4, $5, 0, 30, '{}', $6, true)
         ON CONFLICT DO NOTHING`,
        [
          trackName, artistId, albumId, previewUrl, deezerId,
          Math.min(100, Math.max(30, Math.round((track.rank ?? 50000) / 10000))),
        ]
      );

      count++;
      console.log(`   ✅ ${trackName} — ${artistName}`);
    } catch {
      // ignora duplicatas
    }
  }
  return count;
}

async function scheduleDailyGames() {
  const { rows: songs } = await db.query(
    `SELECT id FROM public.songs WHERE is_active = true ORDER BY popularity DESC LIMIT 60`
  );
  if (songs.length === 0) {
    console.log("⚠️ Nenhuma música para agendar.");
    return;
  }

  const today = new Date();
  for (let i = 0; i < songs.length; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    await db.query(
      `INSERT INTO public.daily_games (date, song_id) VALUES ($1, $2) ON CONFLICT (date) DO NOTHING`,
      [dateStr, songs[i].id]
    );
  }
  console.log(`\n📅 ${songs.length} dias de músicas diárias agendados!`);
}

async function main() {
  console.log("🔌 Conectando ao banco de dados...");
  await db.connect();
  console.log("✅ Conectado!\n");

  // Testa Deezer
  console.log("🎵 Testando API do Deezer...");
  const teste = await searchDeezer("beyonce");
  if (teste.length === 0) {
    console.log("❌ Deezer não retornou resultados. Verifique sua internet.");
    await db.end();
    return;
  }
  console.log("✅ Deezer funcionando!\n");

  let total = 0;
  for (const term of SEARCH_TERMS) {
    console.log(`\n📋 Buscando: "${term}"...`);
    const tracks = await searchDeezer(term);
    if (tracks.length > 0) {
      const count = await importTracks(tracks);
      total += count;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n🎉 Total: ${total} músicas importadas!`);

  if (total > 0) {
    await scheduleDailyGames();
    console.log("\n✅ Pronto! Acesse http://localhost:3000/daily para jogar.");
  } else {
    console.log("\n⚠️ Nenhuma música importada. Verifique sua internet.");
  }

  await db.end();
}

main().catch(console.error);
