export async function POST() {
  return Response.json({ error: "Test orders are disabled." }, { status: 410 })
}
