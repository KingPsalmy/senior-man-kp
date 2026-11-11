// Only these already-public storage objects may use the image optimizer/cache.
export function publicCoverPattern(supabaseUrl: string | undefined) {
  if (!supabaseUrl) return null
  try {
    const url = new URL(supabaseUrl)
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null
    return { protocol: "https" as const, hostname: url.hostname, port: "", pathname: "/storage/v1/object/public/covers/**", search: "" }
  } catch { return null }
}

export function canOptimizeCover(src: string, supabaseUrl: string | undefined) {
  const pattern = publicCoverPattern(supabaseUrl)
  if (!pattern) return false
  try {
    const url = new URL(src)
    return url.protocol === "https:" && url.hostname === pattern.hostname && !url.port && !url.username && !url.password && !url.search && !url.hash && url.pathname.startsWith("/storage/v1/object/public/covers/")
  } catch { return false }
}

// Replacements receive a fresh path, so cached previews never hide an edit.
export const PUBLIC_MEDIA_CACHE_SECONDS = 60 * 60 * 24 * 30
