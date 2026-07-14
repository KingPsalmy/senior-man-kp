import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateDiscount } from "@/lib/discount"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { guest_id, items } = await req.json()

    if (!guest_id || !items?.length) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Validate guest_id format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(guest_id)) {
      return NextResponse.json({ error: "Invalid guest_id" }, { status: 400 })
    }

    // Run stale lock cleanup before validating
    await supabase.rpc("unlock_stale_beats")

    // Fetch beats from DB — never trust frontend prices
    const beatIds = items.map((i: any) => i.beat_id)
    const { data: beats, error } = await supabase
      .from("beats")
      .select("id, title, status, is_published, is_exclusive_sold, basic_price, premium_price, unlimited_price, exclusive_price")
      .in("id", beatIds)

    if (error || !beats) {
      return NextResponse.json({ error: "Failed to fetch beats" }, { status: 500 })
    }

    // Validate each item
    const validatedItems = []
    const beatsToLock: string[] = []

    for (const item of items) {
      const beat = beats.find((b) => b.id === item.beat_id)

      if (!beat) {
        return NextResponse.json(
          { error: `Beat not found: ${item.beat_id}` },
          { status: 400 }
        )
      }

      if (!beat.is_published) {
        return NextResponse.json(
          { error: `"${beat.title}" is no longer available.` },
          { status: 400 }
        )
      }

      if (beat.is_exclusive_sold || beat.status === "sold_exclusive") {
        return NextResponse.json(
          { error: `"${beat.title}" has already been sold exclusively.` },
          { status: 400 }
        )
      }

      if (!["basic", "premium", "unlimited", "exclusive"].includes(item.license_type)) {
        return NextResponse.json(
          { error: "Invalid license type" },
          { status: 400 }
        )
      }

      // Check if beat is locked by someone else
      if (item.license_type === "exclusive" && beat.status === "locked") {
        return NextResponse.json(
          { error: `"${beat.title}" is currently being purchased by someone else. Please try again in a few minutes.` },
          { status: 409 }
        )
      }

      // Queue exclusive beats for locking
      if (item.license_type === "exclusive") {
        beatsToLock.push(beat.id)
      }

      const priceMap: Record<string, number> = {
        basic: Number(beat.basic_price),
        premium: Number(beat.premium_price),
        unlimited: Number(beat.unlimited_price),
        exclusive: Number(beat.exclusive_price),
      }

      validatedItems.push({
        beat_id: beat.id,
        title: beat.title,
        license_type: item.license_type,
        price: priceMap[item.license_type],
        beats: beat,
      })
    }

    // Lock exclusive beats
    if (beatsToLock.length > 0) {
      const { error: lockError } = await supabase
        .from("beats")
        .update({
          status: "locked",
          locked_at: new Date().toISOString(),
        })
        .in("id", beatsToLock)
        .eq("status", "available") // Only lock if still available — prevents race condition

      if (lockError) {
        console.error("Failed to lock beats:", lockError)
        return NextResponse.json(
          { error: "Failed to reserve beat. Please try again." },
          { status: 500 }
        )
      }
    }

    // Calculate discount server-side
    const { subtotal, discount, total, freeItems } = calculateDiscount(validatedItems)

    return NextResponse.json({
      valid: true,
      items: validatedItems,
      subtotal,
      discount,
      total,
      freeItems,
    })

  } catch (err) {
    console.error("[validate error]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}