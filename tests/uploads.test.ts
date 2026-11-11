import test from "node:test"
import assert from "node:assert/strict"
import { NextRequest } from "next/server"
import { prepareAudioUpload } from "../src/lib/upload-path"

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.invalid"
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-placeholder"
process.env.R2_ENDPOINT = "https://storage.example.invalid"
process.env.R2_ACCESS_KEY_ID = "test-placeholder"
process.env.R2_SECRET_ACCESS_KEY = "test-placeholder"
process.env.R2_BUCKET_NAME = "test-bucket"

test("audio uploads accept ordinary filenames and produce unique safe storage keys", () => {
  for (const filename of ["Afro & Soul + mix (final).WAV", "Àṣẹ — mix #2.wav", "🎵.wav", "x".repeat(300) + ".wav"]) {
    const first = prepareAudioUpload("wavs", "Àṣẹ / night", filename)
    assert.match(first.path, /^wavs\/[a-z0-9-]+\.wav$/)
    assert.ok(first.path.length < 250)
    assert.equal(first.contentType, "audio/wav")
    assert.notEqual(first.path, prepareAudioUpload("wavs", "Àṣẹ / night", filename).path)
  }
  assert.equal(prepareAudioUpload("stems", "Beat", "stems & drums.ZIP").contentType, "application/zip")
  assert.throws(() => prepareAudioUpload("wavs", "Beat", "preview.mp3"), /WAV/)
  assert.throws(() => prepareAudioUpload("stems", "Beat", "stems.zip.exe"), /ZIP/)
})

test("upload signing requires an admin, rejects unsafe paths and signs valid WAV/ZIP uploads", async () => {
  const { POST } = await import("../src/app/api/admin/upload-stems/route")
  const original = globalThis.fetch
  let admin = true
  let requests = 0
  globalThis.fetch = async (input) => {
    requests++
    const url = String(input)
    if (url.startsWith("https://test.invalid/auth/v1/user")) return Response.json({ id: "admin", email: "admin@example.com" })
    assert.ok(url.startsWith("https://test.invalid/rest/v1/admin_users"), "No actual storage request should be made")
    return Response.json(admin ? { id: "admin" } : null)
  }
  const request = (body: object, authorized = true) => new NextRequest("https://example.com/api/admin/upload-stems", {
    method: "POST", headers: authorized ? { authorization: "Bearer test-token", "content-type": "application/json" } : {}, body: JSON.stringify(body),
  })
  try {
    assert.equal((await POST(request({}, false))).status, 401)
    assert.equal(requests, 0)
    admin = false
    assert.equal((await POST(request({}))).status, 403)
    admin = true
    for (const path of ["wavs/../secret.wav", "other/test.wav", "wavs/file.exe"]) {
      assert.equal((await POST(request({ path, contentType: "audio/wav" }))).status, 400)
    }
    for (const folder of ["wavs", "stems"] as const) {
      const upload = prepareAudioUpload(folder, "Beat", folder === "wavs" ? "mix + master.wav" : "stems & drums.zip")
      const result = await POST(request(upload))
      assert.equal(result.status, 200)
      const body = await result.json()
      const signed = new URL(body.signedUrl)
      assert.equal(signed.hostname, "storage.example.invalid")
      assert.equal(signed.searchParams.get("X-Amz-Expires"), "600")
      assert.equal(body.fileUrl, `https://storage.example.invalid/test-bucket/${upload.path}`)
    }
  } finally { globalThis.fetch = original }
})
