import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// Stored file URLs look like: `${R2_ENDPOINT}/${R2_BUCKET_NAME}/<key>`
// Strip that prefix to get back the raw object key for signing.
function extractR2Key(fileUrl: string | null): string | null {
  if (!fileUrl) return null
  const prefix = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/`
  return fileUrl.startsWith(prefix) ? fileUrl.slice(prefix.length) : null
}

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

  // Fetch the beat's actual R2 file URLs
  const { data: beat, error: beatError } = await supabase
    .from("beats")
    .select("title, wav_url, stems_url")
    .eq("id", purchase.beat_id)
    .single()

  if (beatError || !beat) {
    return NextResponse.json(
      { error: "Beat not found" },
      { status: 404 }
    )
  }

  // Determine which files this license type includes
  const beatFiles: { key: string | null; label: string }[] = []

  if (["basic", "premium", "unlimited", "exclusive"].includes(purchase.license_type)) {
    beatFiles.push({ key: extractR2Key(beat.wav_url), label: "WAV File" })
  }

  if (["premium", "unlimited", "exclusive"].includes(purchase.license_type)) {
    beatFiles.push({ key: extractR2Key(beat.stems_url), label: "Stems (ZIP)" })
  }

  const signedUrls: { label: string; url: string }[] = []

  // Generate signed R2 GET URLs for each included file
  for (const file of beatFiles) {
    if (!file.key) {
      console.error(`No R2 key found for ${file.label} on beat ${purchase.beat_id}`)
      continue
    }

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: file.key,
      })
      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })
      signedUrls.push({ label: file.label, url: signedUrl })
    } catch (signError) {
      console.error(`Failed to sign R2 URL for ${file.key}:`, signError)
    }
  }

  // Generate signed URL for license PDF from Supabase's licenses bucket
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
    beat_title: beat.title,
    files: signedUrls,
  })
}