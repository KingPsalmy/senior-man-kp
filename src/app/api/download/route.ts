import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { error: "Missing download token" },
      { status: 400 }
    )
  }

  // Look up purchase by token
  const { data: purchase, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("download_token", token)
    .eq("payment_status", "success")
    .single()

  if (error || !purchase) {
    return NextResponse.json(
      { error: "Invalid download token" },
      { status: 404 }
    )
  }

  // Determine beat file paths based on license type
  const beatFilePaths: { path: string; label: string }[] = []

  if (["basic", "premium", "unlimited", "exclusive"].includes(purchase.license_type)) {
    beatFilePaths.push({
      path: `beats/${purchase.beat_id}/wav`,
      label: "WAV File",
    })
  }

  if (["premium", "unlimited", "exclusive"].includes(purchase.license_type)) {
    beatFilePaths.push({
      path: `beats/${purchase.beat_id}/stems`,
      label: "Stems (ZIP)",
    })
  }

  const signedUrls: { label: string; url: string }[] = []

  // Generate signed URLs for beat files from beat-files bucket
  for (const file of beatFilePaths) {
    const { data: signed, error: signError } = await supabase.storage
      .from("beat-files")
      .createSignedUrl(file.path, 60 * 60)

    if (signError || !signed) {
      console.error(`Failed to sign URL for ${file.path}:`, signError)
      continue
    }

    signedUrls.push({ label: file.label, url: signed.signedUrl })
  }

  // Generate signed URL for license PDF from licenses bucket
  const { data: pdfSigned, error: pdfError } = await supabase.storage
    .from("licenses")
    .createSignedUrl(`${purchase.license_type}-license.pdf`, 60 * 60)

  if (pdfError) {
    console.error(`Failed to sign PDF URL:`, pdfError)
  } else if (pdfSigned) {
    signedUrls.push({
      label: "License Agreement (PDF)",
      url: pdfSigned.signedUrl,
    })
  }

  if (signedUrls.length === 0) {
    return NextResponse.json(
      { error: "Files not found. Please contact support." },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    license_type: purchase.license_type,
    customer_email: purchase.customer_email,
    files: signedUrls,
  })
}