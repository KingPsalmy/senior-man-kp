import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// This client runs in the browser (React components)
export const supabase = createClientComponentClient()