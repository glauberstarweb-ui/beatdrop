# 🎵 BeatDrop

Jogo de adivinhação musical — ouça trechos e adivinhe qual é a música.

## Stack

- **Next.js 15** (App Router, Server Components)
- **React 19** + **TypeScript**
- **Tailwind CSS** (dark mode, glassmorphism)
- **Supabase** (Auth, Database, Realtime, Storage)
- **Vercel** (deploy)

## Funcionalidades

| Recurso | Status |
|---|---|
| Modo Diário | ✅ |
| Modo Infinito | ✅ |
| Multiplayer em tempo real | ✅ |
| Desafios compartilháveis | ✅ |
| Ranking global | ✅ |
| Perfil + histórico | ✅ |
| Login Google / Discord / Email | ✅ |
| Painel Admin | ✅ |
| PWA (installable) | ✅ |
| Dark mode | ✅ |
| Responsivo | ✅ |

## Setup local

### 1. Instalar Node.js

```bash
# via nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 22
nvm use 22
```

### 2. Instalar dependências

```bash
cd songless
npm install
```

### 3. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Copie `.env.local.example` para `.env.local`
3. Preencha as variáveis com as chaves do Supabase
4. Execute as migrations no SQL editor do Supabase:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_functions.sql`
   - `supabase/migrations/003_seed_demo.sql` (opcional)

### 4. Configurar Auth

No dashboard do Supabase → Authentication → Providers:
- **Google**: ative e adicione Client ID + Secret
- **Discord**: ative e adicione Client ID + Secret
- **Email**: ative Magic Link

Redirect URLs permitidas:
```
http://localhost:3000/auth/callback
https://seu-dominio.vercel.app/auth/callback
```

### 5. Configurar Storage

No Supabase → Storage, crie um bucket chamado `audio` (público).
Faça upload dos arquivos MP3 e use as URLs no painel admin.

### 6. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`

## Adicionar músicas

1. Acesse `/admin/songs/new`
2. Preencha título, artista, álbum e URL do áudio
3. A URL do áudio deve apontar para um arquivo `.mp3` ou `.m4a` acessível publicamente
4. Agende músicas diárias executando no SQL editor:

```sql
select public.schedule_daily_songs();
```

## Deploy no Vercel

```bash
npm i -g vercel
vercel
```

Configure as variáveis de ambiente no painel do Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Estrutura do projeto

```
beatdrop/
├── app/
│   ├── (auth)/          # Login
│   ├── (main)/          # Páginas principais (Navbar)
│   │   ├── daily/       # Modo diário
│   │   ├── infinite/    # Modo infinito
│   │   ├── multiplayer/ # Salas multiplayer
│   │   ├── challenge/   # Desafios
│   │   ├── leaderboard/ # Ranking
│   │   └── profile/     # Perfil do usuário
│   ├── admin/           # Painel administrativo
│   ├── api/             # API Routes
│   └── auth/            # Callback OAuth
├── components/
│   ├── ui/              # Componentes base (Button, Card, Input…)
│   ├── game/            # AudioPlayer, GuessInput, AttemptTracker…
│   └── layout/          # Navbar
├── hooks/               # useGameEngine, useAudioPlayer, useUser
├── services/            # songs.ts, game.ts, multiplayer.ts
├── lib/                 # Supabase clients, utils, fuzzy search
├── types/               # TypeScript types (database, game)
└── supabase/
    └── migrations/      # SQL schemas e funções
```

## Sistema de pontuação

| Tentativa | Trecho | Pontos |
|---|---|---|
| 1ª | 1s | 100 |
| 2ª | 2s | 80 |
| 3ª | 4s | 60 |
| 4ª | 7s | 40 |
| 5ª | 11s | 20 |
| 6ª | 16s | 10 |
| Errou tudo | — | 0 |

## Tornar usuário admin

No SQL editor do Supabase:

```sql
update auth.users
set app_metadata = jsonb_set(
  coalesce(app_metadata, '{}'),
  '{role}',
  '"admin"'
)
where email = 'seu@email.com';
```
