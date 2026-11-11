// Read-only deployment audit: never prints credentials or customer records.
import nextEnv from "@next/env"
import fs from "node:fs/promises"
nextEnv.loadEnvConfig(process.cwd())
const base = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!base || !anon || !service)
  throw new Error("Supabase configuration is incomplete")
async function read(path, key = anon) {
  const response = await fetch(base + path, {
    headers: { apikey: key, Authorization: "Bearer " + key },
    signal: AbortSignal.timeout(20000),
  })
  let data
  try {
    data = await response.json()
  } catch {
    data = null
  }
  return { status: response.status, data }
}
const report = {
  checkedAt: new Date().toISOString(),
  configuration: {},
  anonymousReads: {},
  privateColumns: {},
  functions: {},
  storage: [],
}
for (const name of [
  "DATABASE_URL",
  "SUPABASE_DB_URL",
  "SUPABASE_ACCESS_TOKEN",
  "CRON_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "R2_ENDPOINT",
  "R2_BUCKET_NAME",
  "RESEND_FROM_EMAIL",
])
  report.configuration[name] = !!process.env[name]
for (const [table, column] of [
  ["purchases", "id"],
  ["orders", "id"],
  ["admin_users", "id"],
  ["guests", "guest_id"],
  ["cart_items", "beat_id"],
  ["favorites", "beat_id"],
]) {
  const { status, data } = await read(
    "/rest/v1/" + table + "?select=" + column + "&limit=1",
  )
  report.anonymousReads[table] = {
    status,
    returnsRows: Array.isArray(data) && data.length > 0,
    errorCode: data?.code,
  }
}
const columns = await read("/rest/v1/beats?select=wav_url,stems_url&limit=0")
report.privateColumns = {
  status: columns.status,
  selectAllowed: columns.status === 200,
  errorCode: columns.data?.code,
}
for (const [role, key] of [
  ["anon", anon],
  ["service", service],
]) {
  const { status, data } = await read("/rest/v1/", key)
  report.functions[role] = {
    status,
    paths: Object.keys(data?.paths ?? {}).filter((p) => p.startsWith("/rpc/")),
  }
  if (role === "service")
    report.schema = Object.fromEntries(
      Object.entries(data?.definitions ?? {}).map(([name, definition]) => [
        name,
        {
          required: definition.required,
          columns: Object.keys(definition.properties ?? {}),
        },
      ]),
    )
}
const buckets = await read("/storage/v1/bucket", service)
report.storage = Array.isArray(buckets.data)
  ? buckets.data.map((b) => ({ name: b.name, public: b.public }))
  : [{ status: buckets.status }]
await fs.writeFile(
  "security-preflight.json",
  JSON.stringify(report, null, 2) + "\n",
)
console.log(JSON.stringify(report, null, 2))
