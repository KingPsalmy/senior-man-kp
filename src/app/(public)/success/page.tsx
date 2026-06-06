"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"

function SuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const email = searchParams.get("email") ?? ""
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [purchase, setPurchase] = useState<any>(null)

  useEffect(() => {
    if (!reference) {
      setStatus("error")
      return
    }

    async function verifyPayment() {
      try {
        const res = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference, customer_email: email }),
        })
        const data = await res.json()
        if (data.success) {
          setPurchase(data.purchase)
          setStatus("success")
        } else {
          setStatus("error")
        }
      } catch {
        setStatus("error")
      }
    }

    verifyPayment()
  }, [reference, email])

  return (
    <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh" }}>
      <Navbar />

      <div style={{
        maxWidth: "560px", margin: "0 auto",
        padding: "120px 24px 80px",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center",
      }}>

        {status === "loading" && (
          <>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: "3px solid var(--border-dim)", borderTop: "3px solid var(--gold)", animation: "spin 1s linear infinite", marginBottom: "24px" }} />
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginBottom: "12px" }}>
              Verifying Payment...
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)" }}>
              Please wait while we confirm your purchase.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(74,222,128,0.1)", border: "2px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "24px" }}>
              🎉
            </div>

            <h1 style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
              Payment Successful!
            </h1>

            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", marginBottom: "32px", lineHeight: 1.7 }}>
              Thank you for your purchase. Your download link has been sent to your email.
            </p>

            {purchase && (
              <div style={{ width: "100%", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px", marginBottom: "24px", textAlign: "left" }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>
                  Order Summary
                </h2>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>Beat</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 600, fontFamily: "var(--font-ui)" }}>{purchase.beat_title}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>License</span>
                  <span style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", padding: "3px 10px", borderRadius: "2px", textTransform: "uppercase" }}>{purchase.license_type}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>Amount</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 700, fontFamily: "var(--font-ui)" }}>₦{purchase.amount_paid?.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>Transaction ID</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontFamily: "var(--font-mono)" }}>{reference}</span>
                </div>
              </div>
            )}

            {purchase && (
              <div style={{ width: "100%", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px", marginBottom: "28px", textAlign: "left" }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>
                  What You Get
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {purchase.license_type === "basic" && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>High-quality WAV file</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>Non-exclusive license — 10 years</span></div>
                    </>
                  )}
                  {purchase.license_type === "premium" && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>High-quality WAV + Full Stems</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>Non-exclusive license — 10 years</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>License Agreement (PDF)</span></div>
                    </>
                  )}
                  {purchase.license_type === "unlimited" && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>High-quality WAV + Full Stems</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>Non-exclusive license — 10 years</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>Radio, TV and commercial advertising</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>Physical distribution rights</span></div>
                    </>
                  )}
                  {purchase.license_type === "exclusive" && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>Full ownership rights — unlimited usage</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>WAV + Full Stems</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "var(--gold)" }}>✓</span><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-ui)" }}>Direct producer contact for collaboration</span></div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", width: "100%", flexWrap: "wrap" }}>
              <Link href="/my-downloads" style={{ flex: 1, padding: "13px", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", borderRadius: "4px", textDecoration: "none", color: "#000", fontSize: "0.75rem", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
                Access Downloads
              </Link>
              <Link href="/store" style={{ flex: 1, padding: "13px", backgroundColor: "transparent", border: "1px solid var(--border-dim)", borderRadius: "4px", textDecoration: "none", color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
                Browse More Beats
              </Link>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-mono)", marginTop: "20px" }}>
              Access your downloads anytime at{" "}
              <Link href="/my-downloads" style={{ color: "var(--gold)" }}>/my-downloads</Link>
              {" "}using your email address.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(255,100,100,0.1)", border: "2px solid rgba(255,100,100,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "24px" }}>
              ⚠️
            </div>
            <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginBottom: "12px" }}>
              Something went wrong
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "var(--font-ui)", marginBottom: "28px", lineHeight: 1.7 }}>
              We couldn't verify your payment. If you were charged, please contact us at{" "}
              <a href="mailto:contact@seniormankp.com" style={{ color: "var(--gold)" }}>contact@seniormankp.com</a>
            </p>
            <Link href="/store" style={{ padding: "13px 28px", background: "linear-gradient(135deg, #C9A84C, #F5D98B)", borderRadius: "4px", textDecoration: "none", color: "#000", fontSize: "0.75rem", fontWeight: 800, fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Back to Store
            </Link>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main style={{ backgroundColor: "var(--bg-void)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--border-dim)", borderTop: "3px solid var(--gold)", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}