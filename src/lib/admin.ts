import { createClient } from "@supabase/supabase-js"
import { RequestError } from "./security"

export function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function requireAdmin(req: Request) {
  const match = req.headers.get("authorization")?.match(/^Bearer (\S+)$/i)
  if (!match) throw new RequestError("Unauthorized", 401)
  const db = serviceClient()
  const { data, error } = await db.auth.getUser(match[1])
  if (error || !data.user?.email) throw new RequestError("Unauthorized", 401)
  const { data: admin, error: adminError } = await db.from("admin_users").select("id").eq("email", data.user.email).maybeSingle()
  if (adminError || !admin) throw new RequestError("Forbidden", 403)
  return data.user
}
