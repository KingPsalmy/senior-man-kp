import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// Anything a visitor types goes into an HTML email, so special characters
// must be escaped. Otherwise someone could inject HTML into your inbox.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body.name ?? "").trim()
    const email = String(body.email ?? "").trim()
    const message = String(body.message ?? "").trim()
    const website = String(body.website ?? "")

    // Honeypot filled in = a bot. Pretend it worked so it doesn't retry.
    if (website) return NextResponse.json({ success: true })

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 })
    }
    if (name.length > 100 || email.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 })
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Your message is a bit short. Add a few more details." }, { status: 400 })
    }

    // Created inside the handler so a missing key can't break the build
    const resend = new Resend(process.env.RESEND_API_KEY)

    const to = process.env.CONTACT_TO_EMAIL ?? "contact@seniormankp.com"
    const from = process.env.CONTACT_FROM_EMAIL ?? "Senior Man KP <onboarding@resend.dev>"
    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>")

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email, // hitting Reply in your inbox goes straight to the visitor
      subject: `New message from ${name.replace(/[\r\n]+/g, " ")} — Senior Man KP`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; padding: 32px; border-radius: 8px;">
          <h2 style="color: #C9A84C; margin: 0 0 20px;">New message from the store</h2>
          <p style="color: #aaa; margin: 0 0 4px;"><strong style="color: #F5F0E8;">Name:</strong> ${safeName}</p>
          <p style="color: #aaa; margin: 0 0 20px;"><strong style="color: #F5F0E8;">Email:</strong> ${safeEmail}</p>
          <div style="background: #141414; border: 1px solid #C9A84C33; border-radius: 8px; padding: 18px; color: #F5F0E8; line-height: 1.7;">
            ${safeMessage}
          </div>
          <p style="color: #666; font-size: 12px; margin: 20px 0 0;">Reply to this email to respond directly to ${safeName}.</p>
        </div>
      `,
    })

    if (error) {
      console.error("[contact] Resend error:", error)
      return NextResponse.json(
        { error: "We couldn't send your message right now. Please try again shortly." },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[contact] error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}