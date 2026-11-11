import test from "node:test"
import assert from "node:assert/strict"
import { canOptimizeCover, publicCoverPattern } from "../src/lib/public-media"

test("cover optimization allows only this project's public cover bucket", () => {
  const base = "https://project.supabase.co"
  assert.equal(canOptimizeCover(`${base}/storage/v1/object/public/covers/art-123`, base), true)
  for (const src of [
    `${base}/storage/v1/object/public/previews/song`,
    `${base}/storage/v1/object/public/wavs/master`,
    `${base}/storage/v1/object/sign/covers/art?token=private`,
    `${base}/storage/v1/object/public/covers/art?token=private`,
    `${base}/storage/v1/object/public/covers/../wavs/master`,
    "https://other.supabase.co/storage/v1/object/public/covers/art",
    "http://project.supabase.co/storage/v1/object/public/covers/art",
    "https://user:password@project.supabase.co/storage/v1/object/public/covers/art",
    "http://127.0.0.1/private",
  ]) assert.equal(canOptimizeCover(src, base), false, src)
  assert.equal(publicCoverPattern(undefined), null)
  assert.equal(publicCoverPattern("invalid"), null)
  assert.equal(publicCoverPattern("http://localhost"), null)
  assert.equal(publicCoverPattern(base)?.search, "")
})
