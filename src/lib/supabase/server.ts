import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// This client runs on the server (Server Components, API routes)
export const createServerSupabase = () =>
  createServerComponentClient({ cookies })