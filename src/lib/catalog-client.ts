import type { CatalogBeat } from "@/components/store/BeatCollection"
export async function fetchCatalog(
  params: Record<string, string> = {},
): Promise<{ data: CatalogBeat[] | null; error: Error | null }> {
  try {
    const response = await fetch(`/api/beats?${new URLSearchParams(params)}`)
    if (!response.ok) throw new Error("Catalog unavailable")
    const { beats } = await response.json()
    return { data: beats, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Catalog unavailable"),
    }
  }
}
