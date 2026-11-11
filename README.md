# Senior Man KP Beat Store

Next.js storefront with Supabase, Paystack, Cloudflare R2 and Resend. The black-and-gold catalog, previews, guest cart, four license tiers and bundle discount are retained.

## Local development

Install with npm ci, then run npm run dev. Keep credentials in an ignored .env.local file. Never use NEXT_PUBLIC_ for service credentials.

Required configuration: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY, NEXT_PUBLIC_SITE_URL, R2_ENDPOINT, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL, CRON_SECRET. Use a dedicated random GUEST_SESSION_SECRET for guest cookies (otherwise the server service-role key is used). Existing optional CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL and ADMIN_NOTIFICATION_EMAIL settings remain supported.

## Security rollout

Read [SECURITY_AUDIT.md](SECURITY_AUDIT.md) before deployment. Run the read-only [database inspection](supabase/security-inspection.sql), validate existing RLS/storage policies, and apply all three [migrations](supabase/migrations) in filename order in staging before production: payment/rate-limit functions, access-control restrictions, then the receipt outbox. Coordinate application and database rollout under a maintenance window. Required database functions fail closed if missing. The migration was tested against a local fixture; confirm compatibility with the actual schema and reconcile duplicate historical references.

New checkout quotes expire after 30 minutes. Callback and webhook share atomic, signature-checked fulfillment. Receipt links open downloads automatically using the checkout email and payment reference. Browsing, previews, carts and favorites do not require email or signup. Guest sessions are server-signed; unverified old guest UUIDs are not adopted, so old carts/favorites reset once at rollout. Test-order bypasses are disabled; production fulfillment requires Paystack live-domain transactions. Existing unsigned in-flight payments need reconciliation during rollout. Refund controls record refunds already completed in Paystack; they do not move money.

Receipts are queued transactionally and attempted immediately; an authenticated cron retries failures. The supplied cron runs daily, so configure a faster schedule if required before launch. Abandoned-cart emails are disabled until verified recipient opt-in is implemented.

Run `node scripts/security-preflight.mjs` for read-only database permission/configuration checks. It records no credentials or customer values. The owner applied the three migrations on 6 November; follow-up checks confirm required functions and anonymous restrictions. Missing functions deliberately fail closed on other deployments.

## Public routes

- `/` is the curtain entrance; continue opens `/beatstore`
- `/beatstore` is the Beat Store homepage with the original blended hero
- `/beatstore/beats` is Discover beats, including search and genre filters
- `/beatstore/[slug]` is an individual beat, for example `/beatstore/after-hours`
- `/shop` is reserved for the future marketplace and is not implemented yet

Old `/store`, `/beat/[slug]` and `/store/beat/[slug]` links redirect to their current equivalents, preserving query parameters. Checkout and download routes remain unchanged. The navbar logo returns to `/beatstore` through client navigation, keeping the shared audio player mounted. Public catalog pages use `/api/beats`; anonymous direct database reads are deliberately restricted.

Admin WAV and stems filenames are normalized into unique storage keys, so punctuation and accented filenames do not fail signing. Offline tests verify authorization, path validation, and signing with fake credentials. These tests do not replace a real upload through the admin UI and provider CORS configuration.

## Validation

- npm test — offline security tests, including an isolated PostgreSQL migration test; no real provider requests or customer messages.
- npm run typecheck — TypeScript validation.
- npm run build — production build.
- npm run lint — full repository lint (known existing cleanup items are recorded in the audit).
- npm audit --omit=dev — production dependency advisories.

Live payment, email, storage, admin-auth and responsive browser acceptance tests are still required before release. No deployment was performed as part of this audit.
