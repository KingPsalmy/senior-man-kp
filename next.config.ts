import type { NextConfig } from "next"
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/store", destination: "/beatstore/beats", permanent: true },
      { source: "/beat/:slug", destination: "/beatstore/:slug", permanent: true },
      { source: "/store/beat/:slug", destination: "/beatstore/:slug", permanent: true },
    ]
  },
  async headers() {
    return [
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://checkout.paystack.com" },
        { key: "Strict-Transport-Security", value: "max-age=31536000" },
      ] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/download", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/success", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ]
  },
}
export default nextConfig
