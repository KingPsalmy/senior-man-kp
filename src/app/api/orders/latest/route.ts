export async function GET() {
 return Response.json({ error: "Use your email and payment reference at /my-downloads." }, { status: 410 })
}
