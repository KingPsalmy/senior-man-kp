// Default: read-only plan. --apply preserves byte-for-byte backups and updates
// cache headers on existing public artwork/previews, never paid download files.
import nextEnv from "@next/env"
import { createClient } from "@supabase/supabase-js"
import { createHash } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"

nextEnv.loadEnvConfig(process.cwd())
const base = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!base || !key) throw new Error("Supabase configuration is incomplete")
const apply = process.argv.includes("--apply")
const cacheSeconds = "2592000" // 30 days; replacements use new object paths.
const supabase = createClient(base, key, { auth: { persistSession: false } })
const { data: beats, error } = await supabase.from("beats").select("cover_url,preview_url").eq("is_published", true)
if (error) throw new Error(error.message)
const sources = [...new Set(beats.flatMap(beat => [beat.cover_url, beat.preview_url]).filter(Boolean))]
const backupDir = `.media-cache-backup/${new Date().toISOString().replaceAll(":", "-")}`
const digest = (buffer, algorithm = "sha256") => createHash(algorithm).update(buffer).digest("hex")
let updated = 0
for (const src of sources) {
  const url = new URL(src)
  const match = url.pathname.match(/^\/storage\/v1\/object\/public\/(covers|previews)\/(.+)$/)
  if (url.origin !== new URL(base).origin || url.search || !match) throw new Error("Unexpected media URL; no changes made to this object")
  const [, bucket, encodedPath] = match
  const path = decodeURIComponent(encodedPath)
  const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket(bucket)
  if (bucketError || !bucketInfo.public) throw new Error(`Refusing to cache non-public bucket ${bucket}`)
  const { data: info, error: infoError } = await supabase.storage.from(bucket).info(path)
  if (infoError) throw new Error(infoError.message)
  const oldCache = info.cacheControl
  console.log(`${apply ? "Apply" : "Plan"}: ${bucket}/${path}: ${oldCache} → max-age=${cacheSeconds}`)
  if (!apply || oldCache === `max-age=${cacheSeconds}`) continue
  const { data: blob, error: downloadError } = await supabase.storage.from(bucket).download(path)
  if (downloadError) throw new Error(downloadError.message)
  const bytes = Buffer.from(await blob.arrayBuffer())
  const before = digest(bytes)
  const etag = String(info.etag ?? "").replaceAll('"', "")
  if (!etag || digest(bytes, "md5") !== etag) throw new Error("Downloaded bytes did not match stored ETag; stopping before write")
  // Avoid changing an object that somebody replaced during this run.
  const { data: latest, error: latestError } = await supabase.storage.from(bucket).info(path)
  if (latestError || latest.version !== info.version || latest.etag !== info.etag) throw new Error("Media changed during inspection; rerun later")
  await mkdir(backupDir, { recursive: true })
  const backupName = `${bucket}-${digest(Buffer.from(path)).slice(0, 16)}`
  await writeFile(`${backupDir}/${backupName}.bin`, bytes)
  await writeFile(`${backupDir}/${backupName}.json`, JSON.stringify({ bucket, path, sha256: before, info }, null, 2))
  const { error: updateError } = await supabase.storage.from(bucket).update(path, bytes, { cacheControl: cacheSeconds, contentType: info.contentType, metadata: info.metadata, upsert: false })
  if (updateError) throw new Error(updateError.message)
  const { data: verified, error: verifyError } = await supabase.storage.from(bucket).download(path)
  if (verifyError || digest(Buffer.from(await verified.arrayBuffer())) !== before) throw new Error(`Verification failed; original backup is in ${backupDir}`)
  const { data: after, error: afterError } = await supabase.storage.from(bucket).info(path)
  if (afterError || after.cacheControl !== `max-age=${cacheSeconds}`) throw new Error("Cache header update was not retained")
  updated++
}
console.log(apply ? `Verified ${updated} updates; original bytes and metadata backed up in ${backupDir}` : `${sources.length} public objects inspected; use --apply to update`)
