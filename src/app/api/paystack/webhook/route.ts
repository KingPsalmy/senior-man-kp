import { fulfillPayment } from "@/lib/fulfillment"
import { errorResponse, readText, validSignature } from "@/lib/security"
export async function POST(req: Request) {
  try {
    if (Number(req.headers.get("content-length")) > 131072) return new Response(null, { status: 413 })
    const body = await readText(req, 131072)
    if (!validSignature(body, req.headers.get("x-paystack-signature"), process.env.PAYSTACK_SECRET_KEY)) return Response.json({ error: "Invalid signature" }, { status: 401 })
    const event = JSON.parse(body)
    if (event.event === "charge.success") await fulfillPayment(event.data)
    return Response.json({ received: true })
  } catch (error) { return errorResponse(error) }
}
