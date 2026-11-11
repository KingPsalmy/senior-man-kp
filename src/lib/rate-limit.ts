import { createHash } from "node:crypto"
import { serviceClient } from "./admin"
import { RequestError } from "./security"

// Shared across server instances; fails closed if the migration is missing.
export async function rateLimit(req: Request, scope: string, limit: number, seconds = 600) {
  // Vercel supplies this header. Other hosts must overwrite it at their trusted proxy.
  const ip = req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ?? "unidentified"
  const key = createHash("sha256").update(`${scope}:${ip}`).digest("hex")
  const { data, error } = await serviceClient().rpc("consume_request_limit", { p_key: key, p_limit: limit, p_window: seconds })
  if (error) throw new RequestError("This service is temporarily unavailable. Please try again later.", 503)
  if (data !== true) throw new RequestError("Too many requests. Please try again later.", 429)
}
