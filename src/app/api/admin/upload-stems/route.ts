import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  if (!token) return false
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return false
  return true
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { path, contentType } = await req.json()

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 })
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: path,
      ContentType: contentType || "application/octet-stream",
    })

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 600 })

    const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${path}`

    return NextResponse.json({ success: true, signedUrl, fileUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate upload URL" }, { status: 500 })
  }
}