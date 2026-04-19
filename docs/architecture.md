# Tumblr Studio Architecture

## Stage 1 Proposal

Tumblr Studio is a companion layer over Tumblr, not a clone. Tumblr remains the source of truth for account identity, blogs, posts, likes, drafts, queue, and publishing. The local app adds richer search, color analysis, saved filters, collections, archive navigation, previewing, and capture workflows.

## Application Shape

- Next.js App Router for pages, server routes, and server-side Tumblr integration.
- TypeScript throughout.
- Tailwind CSS with small local components inspired by shadcn/ui conventions.
- Prisma ORM with SQLite for local development.
- Data model uses JSON fields for Tumblr NPF and legacy payloads so the app can preserve original API responses while exposing typed search/filter fields.
- Tumblr API logic lives under `src/lib/tumblr`.
- Tumblr login starts at `/api/auth/tumblr/start`, uses Tumblr OAuth 1.0a temporary credentials, and finishes at `/api/auth/tumblr/callback`.
- Color analysis lives under `src/lib/color`.
- Sync/import code lives under `src/lib/sync` and `scripts`.
- Safari capture lives under `extensions/safari` and posts JSON into `/api/capture`.

## Route Structure

- `/login` starts Tumblr account connection.
- `/onboarding` walks through connection, blog selection, and first sync options.
- `/explore` searches public tagged Tumblr content, then applies local color filters after media analysis.
- `/likes` browses synced authenticated likes with tag, text, blog, date, label, and color filters.
- `/archive` browses own posts by year and month with density and grid/list views.
- `/preview` composes or imports draft content and renders approximate single-post/feed/archive previews.
- `/collections` manages local folders and saved references.
- `/post/new` composes NPF posts for draft, queue, publish, or internal save.
- `/settings` manages account, blogs, sync cadence, color taxonomy, capture defaults, and appearance.
- `/capture/inbox` reviews Safari captures.

## Schema Proposal

Core models:

- `User`: local profile and preferences.
- `TumblrAccount`: OAuth token storage and raw user profile.
- `Blog`: connected Tumblr blogs and selected sync/posting state.
- `Post`: normalized Tumblr post record with NPF/legacy payloads and searchable metadata.
- `Like`: private liked-post relation.
- `MediaAsset`: images/media, dimensions, alt text, palette data.
- `Collection` and `CollectionItem`: local organization.
- `Label` and `PostLabel`: manual tagging layer.
- `SavedFilter`: saved searches for explore, likes, archive, collections.
- `SyncJob`: background import status, retries, logs, cursor.
- `Capture`: Safari-captured image/page payloads.
- `PreviewItem`: local draft preview payloads.

The schema is designed so SQLite can be swapped for Postgres/Supabase by changing the Prisma datasource and replacing JSON indexing/search implementations with Postgres-native features later.

## Tumblr Capability Assumptions and API Questions

Confirmed from official Tumblr API docs:

- `/v2/tagged` supports public tag exploration with API key or OAuth.
- `/v2/user/likes` supports authenticated retrieval of the current user's likes.
- `/v2/blog/{blog-identifier}/posts` supports blog post retrieval, tags, types, pagination, and `npf=true`.
- `/v2/blog/{blog-identifier}/posts/draft` and queue endpoints require OAuth and are blog-owner workflows.
- NPF is the forward-looking format for fetching/editing/creating posts.
- Tumblr requires a consistent `User-Agent` header.

Assumed or deferred:

- OAuth 2 availability and refresh-token behavior should be verified against the exact Tumblr app registration settings. The service layer currently supports bearer-style credentials structurally, while implemented signed endpoint calls use OAuth 1.0a because the current official endpoint docs still label many user workflows as OAuth-signed requests.
- Exact theme-aware rendering is not guaranteed by API responses. Preview Studio labels its render as approximate until a theme-fetch/render strategy is validated.
- Date liked availability can vary by endpoint payload. The schema supports `likedAt`; import falls back to sync time if Tumblr does not include a dedicated liked timestamp.
- Relevance sorting is only available if Tumblr exposes it for the selected endpoint. MVP implements newest and local color similarity.

## Safari Extension Architecture Choice

The MVP uses a Safari Web Extension because toolbar capture, context-menu image capture, page metadata extraction, and local JSON submission are all web-extension-native. It targets Mac Safari first.

A native Share Extension is the likely next layer for iPhone/iPad and system share-sheet capture. The capture payload contract is intentionally simple so the native extension can call the same `/api/capture` route.

## Risks

- Tumblr auth may require OAuth 1.0a for core endpoints even when OAuth 2 credentials exist. The wrapper isolates this.
- Image color analysis may fail on hotlinked media with anti-bot or CORS-like restrictions; jobs should retry and keep posts usable without palette data.
- Local SQLite JSON search is fine for MVP but should move to Postgres FTS/indexed JSON for large libraries.
- Safari packaging requires Xcode and extension entitlements outside this repo.
- Tumblr exact post preview is not fully reproducible without theme-specific rendering constraints.
