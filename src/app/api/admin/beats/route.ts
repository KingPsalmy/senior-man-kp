import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized")
  const token = authHeader.split(" ")[1]
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) throw new Error("Unauthorized")
  return data.user
}

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const body = await req.json()

    const { data, error } = await supabaseAdmin
      .from("beats")
      .insert([{
        title: body.title,
        slug: body.slug,
        genre: body.genre,
        mood: body.mood,
        bpm: body.bpm,
        key: body.key,
        description: body.description,
        duration: body.duration,
        basic_price: body.basic_price,
        premium_price: body.premium_price,
        unlimited_price: body.unlimited_price,
        exclusive_price: body.exclusive_price,
        cover_url: body.cover_url,
        preview_url: body.preview_url,
        wav_url: body.wav_url,
        stems_url: body.stems_url,
        is_published: body.is_published,
        is_featured: body.is_featured,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ beat: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const body = await req.json()
    const { id, ...updates } = body

    const { data, error } = await supabaseAdmin
      .from("beats")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ beat: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await verifyAdmin(req)
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const { error } = await supabaseAdmin
      .from("beats")
      .delete()
      .eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}