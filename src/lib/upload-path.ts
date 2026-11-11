// Normalize display filenames into private storage keys without rejecting
// ordinary punctuation or non-ASCII characters in a musician's filename.
export function prepareAudioUpload(folder: "wavs" | "stems", title: string, filename: string) {
  const extension = folder === "wavs" ? "wav" : "zip"
  if (!filename.toLowerCase().endsWith("." + extension)) {
    throw new Error(folder === "wavs" ? "Choose a WAV file for the full audio" : "Choose a ZIP file for the stems")
  }
  const safeName = (value: string) => value.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)
  const name = safeName(filename.slice(0, -(extension.length + 1))) || "audio"
  const path = `${folder}/${safeName(title) || "beat"}-${crypto.randomUUID()}-${name}.${extension}`
  return { path, contentType: folder === "wavs" ? "audio/wav" : "application/zip" }
}
