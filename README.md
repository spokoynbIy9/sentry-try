# Sentry Next.js + TypeScript Demo

Minimal realistic demo of Sentry integration in a Next.js App Router project.

## 1) Prepare Sentry project

1. Create a project in Sentry (platform: Next.js).
2. Copy DSN value.
3. Create env file:

```bash
cp .env.example .env.local
```

4. Put DSN into `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://<key>@<host>/<project-id>
```

Optional for sourcemaps upload during build:

```env
SENTRY_AUTH_TOKEN=<token>
SENTRY_ORG=<org-slug>
SENTRY_PROJECT=<project-slug>
```

## 2) Install and run

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## 3) Trigger demo events

1. Click `Send handled error`.
2. Click `Throw unhandled error`.
3. Open `http://localhost:3000/api/debug-sentry` for a server-side error.

Then check Sentry Issues/Events in your project.

## Notes

- `sentry.client.config.ts` configures browser SDK.
- `sentry.server.config.ts` and `sentry.edge.config.ts` configure runtime SDKs.
- `instrumentation.ts` registers server/edge configs.
- `next.config.mjs` wraps config with `withSentryConfig`.
