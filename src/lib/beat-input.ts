import { RequestError } from "./security"

const textFields = new Set(["title", "slug", "genre", "mood", "key", "description", "duration"])
const priceFields = new Set(["basic_price", "premium_price", "unlimited_price", "exclusive_price"])
const urlFields = new Set(["cover_url", "preview_url", "wav_url", "stems_url"])

export function beatInput(body: Record<string, unknown>, creating = false) {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (key === "id") continue
    if (textFields.has(key)) {
      if (value === null && ["mood", "description", "duration"].includes(key)) { result[key] = null; continue }
      if (typeof value !== "string" || value.length > (key === "description" ? 5000 : 200)) throw new RequestError("Invalid " + key)
      if (key === "slug" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new RequestError("Invalid slug")
      result[key] = value.trim()
    } else if (priceFields.has(key) || key === "bpm") {
      const n = Number(value)
      if (value === null || value === "" || !Number.isFinite(n) || n <= 0 || n > (key === "bpm" ? 400 : 100000000)) throw new RequestError("Invalid " + key)
      result[key] = n
    } else if (urlFields.has(key)) {
      if (value === null || value === "") { result[key] = null; continue }
      if (typeof value !== "string" || value.length > 2048) throw new RequestError("Invalid file URL")
      let url: URL
      try { url = new URL(value) } catch { throw new RequestError("Invalid file URL") }
      const allowed = [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.R2_ENDPOINT].filter(Boolean).map(v => new URL(v!).origin)
      if (url.protocol !== "https:" || url.username || url.password || !allowed.includes(url.origin)) throw new RequestError("File URL must use the configured storage service")
      result[key] = value
    } else if (["is_published", "is_featured"].includes(key)) {
      if (typeof value !== "boolean") throw new RequestError("Invalid " + key)
      result[key] = value
    } else { throw new RequestError("Unsupported beat field: " + key) }
  }
  if (creating && (!result.title || !result.slug || !result.genre || !result.bpm || [...priceFields].some(k => !result[k]))) throw new RequestError("Please provide the beat details and all license prices.")
  if (!Object.keys(result).length) throw new RequestError("No changes provided")
  return result
}
