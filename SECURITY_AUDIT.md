# Security audit and release status — 6 November 2026

## Result

**Pre-launch acceptance testing remains required.** The owner reports applying all three migrations successfully on 6 November without a prior manual backup. Follow-up checks confirm the required RPCs and receipt outbox are present, anonymous private-table/file-column reads are denied, and the current storefront works with the new restrictions. No backup or pre-migration row-count baseline was available to independently prove historical record completeness. No real payment, refund or customer email was sent.

Scope: all application API handlers, admin authentication/authorization, guest carts and favorites, public catalog data, payment signing and fulfillment, downloads, email rendering/delivery, storage access, response headers, dependencies, and playback/navigation regressions. Initial live probes were read-only and recorded permission flags and schema metadata, not customer records or credentials. Post-migration testing also used a fresh temporary guest session to save/reload/remove one cart item and favorite, checked second-session isolation, and requested a signed checkout quote with a reserved invalid email domain. Temporary items were removed; only normal rate-limit counters were otherwise changed. This is a source review plus bounded integration checks, not a guarantee against every vulnerability.

## Original findings and post-migration status

| Severity | Evidence | Status |
| --- | --- | --- |
| High | Anonymous Supabase queries returned cart and favorite rows without a guest filter | Resolved in follow-up: anonymous reads return permission denied; signed guest-session save/reload/isolation checks pass |
| High | Anonymous SELECT of `wav_url,stems_url` was permitted (limit 0, no paid URLs retrieved) | Resolved for anonymous access: direct paid-column query returns permission denied; public API still returns seven available beats without paid fields |
| Release blocker | Service-role schema lists only the old lifecycle functions; `consume_request_limit`, `fulfill_verified_order`, and `record_completed_refund` are absent | Required functions now present; signed checkout quote and rate-limited guest mutations return success |
| Release blocker | No local `CRON_SECRET`, database connection string, or Supabase administrative access token is configured | Owner applied migrations through Supabase; CRON_SECRET still absent locally and must be configured on the deployment |
| Unresolved verification | Orders, purchases, guests and admin membership probes returned no rows | Follow-up anonymous requests now return permission denied, rather than empty readable results; authenticated admin/non-admin acceptance checks remain |
| Partial pass | Supabase WAV, stems and license buckets report private; covers and previews report public | Actual object policies and Cloudflare R2 public/custom-domain access still need staging verification |

The reproducible read-only command is `node scripts/security-preflight.mjs`. Its report is ignored by Git. It does not test arbitrary writes or execute privileged RPCs on the live service.

## Fixes in the current source

- **Guest isolation without signup:** server-minted, HMAC-signed, HttpOnly, SameSite cookies identify a visitor. Production cookies use Secure and the `__Host-` prefix. Cart/favorite reads and mutations use that identity; caller-supplied guest IDs are ignored. Mutations enforce JSON, same-origin browser requests, validation and shared rate limits. Checkout also binds its guest identity on the server. Removed unused unsigned guest-email merge and client-side beat lifecycle helpers.
- **Database and storage boundary:** migration 002 removes permissive policies and table/column grants on the eight application tables. Anonymous access is revoked. Authenticated users receive read access only when Supabase's verified user ID belongs to an admin. Client writes to orders, purchases and admin membership stay forbidden, including for admins; authorized API/service functions handle mutations. Legacy public RPCs become service-only. Restrictive storage policies protect paid objects and prevent non-admin uploads, replacement and deletion.
- **Catalog privacy:** homepage, discovery, detail pages and player fetch an explicit public field list from the server. The API excludes unpublished and exclusively sold beats and does not return paid-file locations.
- **Payment integrity:** test-order bypasses are disabled. Server-priced, signed, expiring quotes bind the payment reference, email, NGN amount and cart. Callback and webhook share atomic fulfillment, replay protection, exclusive allocation and stable download credentials. Webhooks verify their HMAC before processing. Provider test transactions cannot release downloads in a production build.
- **Download access:** receipt links still open downloads directly through email plus order reference in the URL fragment, which is cleared after use. Browsing requires no email or account; checkout requires email. Manual receipt lookup remains available. Download and upgrade requests validate credentials and expiry; refunded tokens are rejected. Unknown license types cannot request file signing. New purchases have no access expiry; individual signed file URLs last one hour and can be regenerated.
- **Receipt reliability:** migration 003 enqueues a receipt in the same database transaction as the paid order. The app attempts immediate delivery; a leased worker retries failures. Callback/webhook retries can also claim pending jobs. Resend idempotency keys reduce duplicate sends. The configured cron is a daily safety net; configure a more frequent authenticated schedule before launch if faster recovery is required. Provider acceptance is recorded, not proof that an inbox accepted the email.
- **Email abuse:** abandoned-cart emails are disabled until verified recipient opt-in exists. Entering an arbitrary checkout email was enough to schedule a reminder to somebody else. Pending checkout records remain; normal paid receipts are unaffected. Admin sale, exclusive-sale and refund notifications remain, but do not yet have durable retries.
- **Other controls:** centralized admin checks and mutation allowlists, bounded request bodies, escaped email HTML, shared rate limiting, private/no-store API responses, anti-framing, MIME-sniffing protection, no-referrer and baseline CSP. Preview deployments no longer redirect to the production domain. Saved-item failures display a recoverable message instead of an unhandled promise rejection.

## Playback and browser warnings

The homepage redesign had stopped initializing the automatic shuffled queue. That regression is corrected in the persistent player shared across public routes. Entering home or discovery initializes one shuffled queue; reaching its end reshuffles it without immediately repeating the last track when alternatives exist. Logo/navigation clicks retain the current track and progress. A deliberate pause remains paused. A browser-blocked autoplay attempt shows an honest Play state and retries after an eligible user interaction.

Browser evidence: the same audio source advanced from 11.800947 to 13.758919 seconds while clicking the logo from discovery to home. Next switched to a different beat. Pausing and navigating back to discovery left audio paused. The fresh in-app browser reported no console errors or warnings during those checks. This does not assert that every route or browser is warning-free.

The screenshot's `contentscript.js`, `ObjectMultiplex` liveness and `MaxListenersExceededWarning` messages exactly match reports in [MetaMask's issue tracker](https://github.com/MetaMask/metamask-extension/issues/43090). This strongly indicates an injected extension problem; the user's Chrome extension instance was not directly identified. Test Chrome with that extension disabled for this site, or an Incognito window with extensions disabled, and reload. HMR and the React DevTools suggestion are normal development messages. Do not suppress console output or increase listener limits in the Beat Store to hide extension warnings. The previously missing database functions are now present; follow-up quote and guest-mutation requests succeed.

## Validation

- Production dependency audit on 6 November: **0 known vulnerabilities**
- Full dependency tree: **8 moderate**, all in the ESLint/typescript-eslint/minimatch development chain; no critical or high reports. Do not force npm's suggested major downgrade of the Next.js lint configuration
- Offline suite: **21 tests pass**; tests cover payment tampering/replay, admin boundaries, download expiry/refund, bounded input, guest cookie tampering/CSRF/ownership, shuffle/navigation/pause, PostgreSQL grants/RLS/storage, and transactional receipt leasing/retries
- Local HTTP checks passed for anonymous admin rejection (401), invalid guest action (400), retired test orders (410), unauthenticated receipt cron (401), invalid download token (400), HttpOnly/SameSite guest cookie issuance, and catalog exclusion of paid-file fields
- Database migrations tested in isolated PGlite fixtures; this is not a live-schema migration rehearsal
- Production build and TypeScript: passed. Focused lint: 0 errors, 2 image-optimization warnings in the navbar/player
- Browser playback checks completed as described above. Updated header verified at normal width and at 390px: wordmark 17px on mobile, no horizontal overflow or overlap with cart/menu controls
- Earlier bounded source/history secret scan found no matching live key patterns or tracked environment files. It does not prove credentials have never leaked

## Deployment procedure and acceptance gates

1. Export the live schema, policies and grants using `supabase/security-inspection.sql` and create a recoverable backup. Reconcile duplicate historical payment references. Check table types, constraints, foreign keys, function ownership, storage policy compatibility and admin email membership in staging
2. Apply all migrations in order: `202611050001_security.sql`, `202611060002_access_control.sql`, `202611060003_receipt_outbox.sql`. Coordinate this with the new app under a maintenance window: the new guest/catalog endpoints and restricted direct database access must ship together. Owner reports these files are now applied; follow-up schema/access checks confirm the expected objects and anonymous restrictions
3. Configure deployment secrets, cron authorization, provider webhook, site URL, admin MFA, backups and monitoring. Prefer a dedicated random `GUEST_SESSION_SECRET`; the implementation falls back to the server service-role key when it is absent. Rotation invalidates guest sessions. Trust the rate-limit IP header only behind a proxy that overwrites it (Vercel); other hosts need an equivalent verified source
4. Old client-generated guest UUIDs cannot safely be adopted: they were publicly readable and are not proof of ownership. Existing carts/favorites start a new guest session at rollout. Paid purchases/downloads remain intact. Preserve old records for reconciliation rather than deleting them
5. Repeat anonymous and authenticated non-admin negative tests against staging, including RPC execution and storage writes. Check admin login, catalog management, cover/preview upload, guest cart/favorites across refreshes and tabs, and email-free browsing
6. Exercise Paystack checkout, discount totals, callback/webhook ordering and retries, all license downloads, receipt failure/retry, expiry and completed-refund revocation in an isolated test environment. A production build rejects provider test transactions; use a dedicated development-mode staging service with test keys and a separate database, never the live catalog. Perform an owner-authorized live smoke purchase before public launch
7. Confirm R2 has no public paid-file exposure through its origin or custom domains, validate CORS, and test signed files and PDFs. Re-run the read-only preflight and inspect queue/provider logs after rollout

## Post-migration application correction

Checkout verification exposed a false origin rejection when Next reconstructed the request URL with a different bind hostname. The check now uses the actual Host target and the explicitly configured HTTPS site origin, rejects missing/null/foreign origins, and does not trust arbitrary forwarded-host headers. Regression tests cover the local target mismatch and spoofed forwarded hosts. Full offline suite (21 tests), TypeScript and focused lint pass after the correction. This follows the target-origin distinction in the [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#identifying-the-target-origin).

## Remaining risks

- Two people can pay for an exclusive beat before fulfillment. The database allocates it only once; the other payment requires prompt reconciliation/refund. An expiring reservation/payment-intent flow is still needed to eliminate that customer-service risk
- Baseline CSP does not restrict script origins. A strict nonce policy needs compatibility testing with the payment widget and inline UI styles/scripts
- Receipt workers use a five-minute lease; Resend's [idempotency window is 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys). A provider-success/database-ack failure followed by a retry outside that window can duplicate a receipt. Monitor bounces, pending jobs and old leases; delivery is not guaranteed merely by queueing
- Email plus reference is order-specific bearer proof, not mailbox verification. Lost receipts require support. Already-issued file URLs remain valid until expiry after a refund, and downloaded files cannot be revoked. Historical expired tokens still need an explicit recovery/migration policy
- Refund recording trusts an authorized administrator's acknowledgement of a completed Paystack refund. It does not move funds or independently confirm the provider refund
- Repository-wide lint has existing cleanup debt (previous snapshot: 114 errors, 38 warnings); only focused changed-file lint is claimed here. No independent penetration test, credential rotation, live provider test, hosting configuration review or production deployment was completed
