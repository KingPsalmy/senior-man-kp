# Media delivery

## Images

The original hero photos and logo stay in `public`. `node scripts/optimize-media.mjs`
creates WebP copies in `public/media` and updates `src/lib/media-assets.ts`.
Run it after changing a source image and commit both the generated files and manifest.
These generated URLs contain a hash of the image bytes and have a one-year immutable
cache lifetime. Only content-addressed files should go in `public/media`.

`CoverImage` uses Next's image optimizer to send appropriately sized artwork. It
only optimizes this project's HTTPS public `covers` bucket, with no query string
or redirects. Other legacy artwork and failed optimization requests use the original
image. Cards below the viewport load lazily; the beat-detail cover loads eagerly.

## Public audio and storage

Public covers and previews use 30-day browser cache headers. Admin uploads always
use a fresh timestamped path and cannot overwrite an existing object. Replacing
media therefore updates its URL and does not require customers to clear their caches.
Audio bytes, streaming range support, shuffle and the persistent player are unchanged.
Browsers choose how much streamed audio to retain and may evict it under storage pressure.
This is repeat-visit optimization, not guaranteed offline playback. The first play
still needs a network connection; no attempt is made to download the whole catalog.

Existing published media can be inspected with `node scripts/cache-public-media.mjs`.
The `--apply` option backs up each original file and its metadata in the git-ignored
`.media-cache-backup` directory, verifies ETags, updates cache headers using identical
bytes, and verifies SHA-256 hashes and stored cache headers afterward. It rejects
private buckets and leaves the database and original URLs intact. On 2026-11-11,
all 14 public objects referenced by the seven published beats were updated successfully.

Do not apply this policy to WAV masters, stems, receipts, checkout, admin data or
private download URLs. Those retain their existing authorization and no-store policy.
Catalog/pricing responses also remain fresh instead of being cached for 30 days.

## Verification

Use GET, including `Range: bytes=0-1023` for streaming checks. Supabase HEAD responses
can report `private, no-cache` even when the real GET response is publicly cached.
Check a production build: development mode intentionally changes image cache headers.
Expected: hashed local media `max-age=31536000, immutable`; public preview GET/206
`max-age=2592000`; optimized covers at least one day (currently 30 days inherited
from the original); protected APIs `private, no-store`. A repeated optimized-image
request should report `x-nextjs-cache: HIT` locally.

Measured: hero photos plus logo 8,076,140 → 326,714 bytes; After Hours card artwork
at 384 pixels 10,566 bytes. File-size savings are not a promise of a particular
page-load time; network speed, first-time image optimization and browser cache
retention still matter. Source changes need deployment; the storage header update
is already live.
