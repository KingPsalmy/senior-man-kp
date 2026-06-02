import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { calculateDiscount } from "@/lib/discount"

const LICENSE_PRICES = {
  basic: 30000,
  premium: 70000,
  unlimited: 120000,
  exclusive: 180000,
}

export async function POST(req: NextRequest) {
  try {
    const { guest_id, items } = await req.json()

    if (!guest_id || !items?.length) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Fetch beats from DB — never trust frontend prices
    const beatIds = items.map((i: any) => i.beat_id)
    const { data: beats, error } = await supabase
      .from("beats")
      .select("id, title, is_published, is_exclusive_sold, basic_price, premium_price, unlimited_price, exclusive_price")
      .in("id", beatIds)

    if (error || !beats) {
      return NextResponse.json({ error: "Failed to fetch beats" }, { status: 500 })
    }

    // Validate each item
    const validatedItems = []
    for (const item of items) {
      const beat = beats.find((b) => b.id === item.beat_id)

      if (!beat) {
        return NextResponse.json({ error: `Beat not found: ${item.beat_id}` }, { status: 400 })
      }
      if (!beat.is_published) {
        return NextResponse.json({ error: `Beat unavailable: ${beat.title}` }, { status: 400 })
      }
      if (beat.is_exclusive_sold) {
        return NextResponse.json({ error: `Beat sold exclusively: ${beat.title}` }, { status: 400 })
      }
      if (!["basic", "premium", "unlimited", "exclusive"].includes(item.license_type)) {
        return NextResponse.json({ error: "Invalid license type" }, { status: 400 })
      }

      // Use DB prices — not frontend prices
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

    // Lock exclusive beats before proceeding to payment
    for (const item of validatedItems) {
      if (item.license_type === "exclusive") {
        // Check if beat is already locked by someone else
        const { data: beatStatus } = await supabase
          .from("beats")
          .select("status")
          .eq("id", item.beat_id)
          .single()

        if (beatStatus?.status === "locked") {
          return NextResponse.json(
            { error: `"${item.title}" is currently being purchased by someone else. Please try again in a few minutes.` },
            { status: 409 }
          )
        }

        // Lock the beat — only if still available (guards against race conditions)
        await supabase
          .from("beats")
          .update({ status: "locked", locked_at: new Date().toISOString() })
          .eq("id", item.beat_id)
          .eq("status", "available")
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
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}