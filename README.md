# Teacher's Pet

Kind sub plans, ready to print.

## Setup

### 1. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Supabase project URL and anon key. Get these from your Supabase project dashboard under **Settings → API**.

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_APP_URL` | App base URL (`http://localhost:5173` for local dev) |

### 2. Install dependencies

```bash
npm install
```

### 3. Supabase setup

If you haven't already:

1. Create a project at [supabase.com](https://supabase.com).
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started).
3. Log in and link your project:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
4. Push the migration:
   ```bash
   supabase db push
   ```
5. Generate TypeScript types from the live schema:
   ```bash
   npm run db:types
   ```

### 4. Auth providers

In your Supabase dashboard under **Authentication → Providers**, enable:
- **Google** — requires a Google Cloud OAuth 2.0 client ID and secret.
- **Apple** — requires a paid Apple Developer account ($99/yr) and an App ID with Sign In with Apple enabled. See [Supabase Apple OAuth docs](https://supabase.com/docs/guides/auth/social-login/auth-apple).

### 5. Run the dev server

```bash
npm run dev
```

App is at `http://localhost:5173`.

### Useful commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run db:types` | Regenerate Supabase TypeScript types |

## Status

In active development.

Current increment covers: database schema, auth (email + Google + Apple), template definitions, and the agent-turn Edge Function skeleton. Stripe, the agent chat UI, file uploads, and PDF/DOCX rendering are in subsequent increments.

<!-- TODO(domain): Replace all placeholder URLs with the real domain once purchased. Run: grep -r "TODO(domain)" . -->
