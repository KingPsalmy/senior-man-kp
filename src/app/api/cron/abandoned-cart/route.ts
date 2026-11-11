// Checkout email entry alone is not verified opt-in for reminder emails.
export async function GET(req: Request) {
  if (
    !process.env.CRON_SECRET ||
    req.headers.get("authorization") !== "Bearer " + process.env.CRON_SECRET
  )
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  return Response.json({
    success: true,
    sent: 0,
    reason: "Verified reminder opt-in is not configured",
  })
}
