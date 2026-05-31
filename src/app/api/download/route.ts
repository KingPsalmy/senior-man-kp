import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  // 1. Token must be present
  if (!token) {
    return NextResponse.json(
      { error: "Missing download token" },
      { status: 400 }
    )
  }

  // 2. Look up the purchase by token
  const { data: purchase, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("download_token", token)
    .eq("payment_status", "success")
    .single()

  if (error || !purchase) {
    return NextResponse.json(
      { error: "Invalid or expired download link" },
      { status: 404 }
    )
  }

  // 3. Check expiry
  const now = new Date()
  const expires = new Date(purchase.download_expires_at)

  if (now > expires) {
    return NextResponse.json(
      { error: "Download link has expired. Please contact support." },
      { status: 410 }
    )
  }

  // 4. Determine file path based on license type
  const filePaths: string[] = []

  if (["basic", "premium", "exclusive"].includes(purchase.license_type)) {
    filePaths.push(`beats/${purchase.beat_id}/wav`)
  }
  if (["premium", "exclusive"].includes(purchase.license_type)) {
    filePaths.push(`beats/${purchase.beat_id}/stems`)
  }

  // 5. Generate fresh signed URLs (short-lived — 1 hour)
  const signedUrls: { path: string; url: string }[] = []

  for (const path of filePaths) {
    const { data: signed, error: signError } = await supabase.storage
      .from("beat-files")
      .createSignedUrl(path, 60 * 60) // 1 hour only

    if (signError || !signed) {
      console.error(`Failed to sign URL for ${path}:`, signError)
      continue
    }

    signedUrls.push({ path, url: signed.signedUrl })
  }

  if (signedUrls.length === 0) {
    return NextResponse.json(
      { error: "Files not found. Please contact support." },
      { status: 404 }
    )
  }

  // 6. Return the signed URLs
  return NextResponse.json({
    success: true,
    license_type: purchase.license_type,
    customer_email: purchase.customer_email,
    expires_at: purchase.download_expires_at,
    files: signedUrls,
  })
}