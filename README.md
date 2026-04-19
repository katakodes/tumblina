# Tumblr Studio

Tumblr Studio is a polished personal companion app for Tumblr discovery, curation, archive browsing, previewing, and web capture. Tumblr stays the source of truth; this app becomes the faster, more visual working surface around it.

## Tech Stack

- Next.js App Router, TypeScript, React 19, Tailwind CSS
- Prisma ORM with SQLite for local development
- Tumblr API service layer with OAuth-ready credential handling
- Local sync jobs for likes, posts, and color backfills
- Image palette extraction with named color buckets
- Safari Web Extension scaffold for Mac Safari capture
- Vitest for utility tests

## Project Structure

- `src/app`: product routes and API routes
- `src/components`: reusable interface pieces
- `src/lib/tumblr`: Tumblr API client, types, normalization
- `src/lib/color`: palette analysis, taxonomy, similarity
- `src/lib/sync`: import/upsert logic
- `prisma/schema.prisma`: local data model
- `scripts`: manual sync and color jobs
- `extensions/safari`: Safari Web Extension scaffold
- `docs/architecture.md`: architecture, schema, API assumptions, risks

## Environment Variables

Copy `.env.example` to `.env`.

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
TUMBLR_CONSUMER_KEY=""
TUMBLR_CONSUMER_SECRET=""
TUMBLR_OAUTH2_CLIENT_ID=""
TUMBLR_OAUTH2_CLIENT_SECRET=""
TUMBLR_CALLBACK_URL="http://localhost:3000/api/auth/tumblr/callback"
TUMBLR_USER_AGENT="Tumblr Studio/0.1 (+local-dev)"
CAPTURE_SHARED_SECRET="replace-with-a-local-extension-secret"
```

For local manual sync while auth is being wired, you can also set:

```bash
TUMBLR_DEV_OAUTH_TOKEN=""
TUMBLR_DEV_OAUTH_SECRET=""
TUMBLR_DEFAULT_BLOG="your-blog-name"
```

## Register a Tumblr App

1. Go to Tumblr's developer/app registration area and create an application.
2. Set the callback URL to `http://localhost:3000/api/auth/tumblr/callback`.
3. Copy the consumer key and consumer secret into `.env`.
4. If OAuth 2 credentials are available for your app, copy the client ID and client secret too.
5. Keep the app's `User-Agent` stable. Tumblr expects a consistent user-agent value for API requests.

## Login Through the App

1. Make sure `.env` contains `TUMBLR_CONSUMER_KEY`, `TUMBLR_CONSUMER_SECRET`, and `TUMBLR_CALLBACK_URL`.
2. Restart the dev server after changing `.env`.
3. Visit `http://localhost:3000/login`.
4. Click **Start Tumblr auth**.
5. Approve the Tumblr authorization screen.
6. Tumblr redirects back to `/api/auth/tumblr/callback`, and the app stores your Tumblr account and blogs locally.
7. You land on `/onboarding?connected=1`.

This first login path uses Tumblr OAuth 1.0a because the current service layer signs authenticated Tumblr API calls that way. The schema also has OAuth 2 token fields for a later OAuth 2 exchange/refresh-token upgrade.

If Tumblr returns `oauth_consumer_key not recognized`, open `/api/debug/tumblr-env` while the dev server is running. It returns a masked runtime view of the values the backend is actually using. Compare the shown length, first four characters, last four characters, and fingerprint with the Tumblr app dashboard. For this OAuth 1.0a flow, use Tumblr's **OAuth Consumer Key** and **Secret Key**, not the OAuth 2 client ID/client secret.

Then open `/api/debug/tumblr-preflight`. This calls Tumblr's public API-key path with the configured OAuth Consumer Key. If it returns `401`, Tumblr does not recognize that key at all, so the fix is to create or update the Tumblr application credentials, not to change OAuth signing code.

## Run Locally

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

Open `http://localhost:3000`.

## Sync Jobs

```bash
npm run sync:likes
npm run sync:posts -- your-blog-name
npm run sync:colors
```

The jobs create `SyncJob` records, import Tumblr posts into SQLite, preserve raw payloads, and attach palette metadata when media analysis succeeds.

## Safari Extension

The Mac Safari scaffold lives in `extensions/safari`.

1. Run the app locally.
2. Set `CAPTURE_SHARED_SECRET` in `.env`.
3. Open Xcode and create a Safari Web Extension wrapper.
4. Import or point the generated extension resources at `extensions/safari`.
5. In the popup, set the app URL and secret.

The extension supports toolbar capture, page snapshot capture, and image context-menu capture. Captures post to `/api/capture` and appear in `/capture/inbox`.

## Current Limitations

- Full Tumblr OAuth callback exchange is stubbed behind `/api/auth/tumblr/start`; the service layer and sync jobs are ready for token-backed calls.
- Core authenticated endpoints are implemented with OAuth 1.0a signing because current official docs still mark many user workflows that way. OAuth 2 bearer handling is structurally reserved.
- Preview Studio is an approximation of Tumblr rendering, not a theme-perfect renderer.
- SQLite search is MVP-grade; Postgres full-text search should replace it for a very large likes archive.
- Safari extension packaging requires Xcode and local extension signing.
- Color analysis may fail for remote images that block processing; the post remains imported and can be backfilled later.

## Roadmap

- Complete Tumblr OAuth handshake and secure encrypted token storage.
- Add background scheduler with rate-limit-aware cursors.
- Replace demo data in UI with paginated Prisma queries and server actions.
- Add autocomplete endpoints for tags, blogs, labels, and recent searches.
- Add collection bulk actions and saved views.
- Add Postgres/Supabase adapter notes and migration profile.
- Add native Share Extension for iPhone/iPad capture.
- Improve Preview Studio with theme-aware rendering experiments.
