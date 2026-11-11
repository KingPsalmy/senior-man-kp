import { requireAdmin } from "@/lib/admin"
import { errorResponse, readJson, RequestError } from "@/lib/security"
import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

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


export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const { path, contentType } = await readJson(req)

    if (typeof path !== "string" || path.length > 250 || !/^(wavs|stems)\/[a-zA-Z0-9_ .()-]+\.(wav|zip)$/i.test(path) || path.includes("..")) {
      return NextResponse.json({ error: "Invalid WAV or stems path" }, { status: 400 })
    }

    if (contentType !== undefined && (typeof contentType !== "string" || !["audio/wav", "audio/x-wav", "audio/wave", "application/zip", "application/x-zip-compressed", "application/octet-stream"].includes(contentType))) throw new RequestError("Invalid file type")

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: path,
      ContentType: contentType || "application/octet-stream",
    })

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 600 })

    const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${path}`

    return NextResponse.json({ success: true, signedUrl, fileUrl })
  } catch (err: any) {
    return errorResponse(err)
  }
}
