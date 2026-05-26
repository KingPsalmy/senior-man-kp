"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

const genres = ["Afrobeat", "Afro Fusion", "Trap", "R&B", "Amapiano", "Drill", "Afropop"]
const moods = ["Dark", "Euphoric", "Melancholic", "Energetic", "Romantic", "Chill"]
const keys = ["A Minor", "B Minor", "C Minor", "D Minor", "E Minor", "F Minor", "G Minor", "A Major", "B Major", "C Major", "D Major", "E Major", "F Major", "G Major", "F# Minor", "C# Minor"]

export default function AdminBeatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    title: "",
    genre: "Afrobeat",
    mood: "Dark",
    bpm: "",
    key: "A Minor",
    description: "",
    basic_price: "",
    premium_price: "",
    exclusive_price: "",
    is_published: false,
  })

  const [files, setFiles] = useState<{
    cover: File | null
    preview: File | null
    stems: File | null
  }>({ cover: null, preview: null, stems: null })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>, key: "cover" | "preview" | "stems") {
    const file = e.target.files?.[0] || null
    setFiles((prev) => ({ ...prev, [key]: file }))
  }

  async function uploadFile(file: File, bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const slug = form.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
      const timestamp = Date.now()

      let cover_url = null
      let preview_url = null
      let stems_url = null

      if (files.cover) cover_url = await uploadFile(files.cover, "covers", `${slug}-${timestamp}-cover`)
      if (files.preview) preview_url = await uploadFile(files.preview, "previews", `${slug}-${timestamp}-preview`)
      if (files.stems) stems_url = await uploadFile(files.stems, "stems", `${slug}-${timestamp}-stems`)

      const { error: dbError } = await supabase.from("beats").insert({
        title: form.title,
        slug,
        genre: form.genre,
        mood: form.mood,
        bpm: parseInt(form.bpm),
        key: form.key,
        description: form.description,
        basic_price: parseFloat(form.basic_price),
        premium_price: parseFloat(form.premium_price),
        exclusive_price: parseFloat(form.exclusive_price),
        cover_url,
        preview_url,
        stems_url,
        is_published: form.is_published,
      })

      if (dbError) throw dbError

      setSuccess(true)
      setForm({
        title: "", genre: "Afrobeat", mood: "Dark", bpm: "", key: "A Minor",
        description: "", basic_price: "", premium_price: "", exclusive_price: "",
        is_published: false,
      })
      setFiles({ cover: null, preview: null, stems: null })

    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border-dim)",
    borderRadius: "4px", color: "var(--text-primary)",
    fontSize: "0.82rem", fontFamily: "var(--font-ui)", outline: "none",
  }

  const labelStyle = {
    display: "block", color: "var(--text-muted)",
    fontSize: "0.6rem", fontFamily: "var(--font-mono)",
    letterSpacing: "0.15em", textTransform: "uppercase" as const,
    marginBottom: "6px",
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex" }}>

      {/* Sidebar */}
     <aside className="admin-sidebar" style={{
  backgroundColor: "var(--bg-deep)",
  display: "flex", flexDirection: "column",
  padding: "24px 0",
  position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40,
  width: "var(--sidebar-width, 220px)",
}}>
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>Senior Man</div>
          <div style={{ background: "linear-gradient(135deg, #C9A84C, #F5D98B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-ui)", lineHeight: 1 }}>KP</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {[
            { icon: "⊞", label: "Dashboard", href: "/admin/dashboard" },
            { icon: "♪", label: "Beats", href: "/admin/dashboard/beats", active: true },
            { icon: "💳", label: "Purchases", href: "/admin/dashboard/purchases" },
            { icon: "👤", label: "Customers", href: "/admin/dashboard/customers" },
            { icon: "⚙", label: "Settings", href: "/admin/dashboard/settings" },
          ].map((item) => (
            <Link key={item.label} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 24px", textDecoration: "none",
              color: item.active ? "var(--gold)" : "var(--text-secondary)",
              fontSize: "0.78rem", fontFamily: "var(--font-ui)", fontWeight: 500,
              backgroundColor: item.active ? "rgba(201,168,76,0.06)" : "transparent",
              borderRight: item.active ? "2px solid var(--gold)" : "2px solid transparent",
            }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/admin/login") }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 24px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", cursor: "pointer" }}>
            <span>→</span> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="admin-main" style={{ marginLeft: "220px", flex: 1, padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>
            Upload Beat
          </h1>
          <Link href="/admin/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
            ← Back to Dashboard
          </Link>
        </div>

        {success && (
          <div style={{ backgroundColor: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "6px", padding: "14px 18px", marginBottom: "24px", color: "#4ade80", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>
            ✓ Beat uploaded successfully!
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "6px", padding: "14px 18px", marginBottom: "24px", color: "#ff6b6b", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="upload-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Beat Info Card */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px" }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "20px" }}>Beat Info</h2>

                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Midnight Drive" style={inputStyle} />
                </div>

                <div className="upload-inner-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Genre *</label>
                    <select name="genre" value={form.genre} onChange={handleChange} style={inputStyle}>
                      {genres.map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Mood</label>
                    <select name="mood" value={form.mood} onChange={handleChange} style={inputStyle}>
                      {moods.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>BPM *</label>
                    <input name="bpm" value={form.bpm} onChange={handleChange} required type="number" placeholder="e.g. 98" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Key *</label>
                    <select name="key" value={form.key} onChange={handleChange} style={inputStyle}>
                      {keys.map((k) => <option key={k}>{k}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the beat..." rows={3}
                    style={{ ...inputStyle, resize: "vertical" as const }} />
                </div>
              </div>

              {/* Pricing Card */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px" }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "20px" }}>Pricing (₦)</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { name: "basic_price", label: "Basic License" },
                    { name: "premium_price", label: "Premium License" },
                    { name: "exclusive_price", label: "Exclusive License" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label style={labelStyle}>{field.label} *</label>
                      <input
                        name={field.name}
                        value={form[field.name as keyof typeof form] as string}
                        onChange={handleChange}
                        required type="number" placeholder="e.g. 10000"
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Files Card */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px" }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "20px" }}>Files</h2>

                {[
                  { key: "cover" as const, label: "Cover Art", accept: "image/*", hint: "JPG, PNG — Square recommended" },
                  { key: "preview" as const, label: "Preview Audio", accept: "audio/*", hint: "MP3 — Watermarked version" },
                  { key: "stems" as const, label: "Stems ZIP (Private)", accept: ".zip", hint: "ZIP — For Premium license buyers" },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>{f.label}</label>
                    <div style={{
                      border: "1px dashed var(--border-dim)", borderRadius: "4px",
                      padding: "16px", textAlign: "center", cursor: "pointer",
                      backgroundColor: files[f.key] ? "rgba(201,168,76,0.05)" : "transparent",
                      borderColor: files[f.key] ? "rgba(201,168,76,0.3)" : "var(--border-dim)",
                    }}>
                      <input type="file" accept={f.accept} onChange={(e) => handleFile(e, f.key)}
                        style={{ display: "none" }} id={`file-${f.key}`} />
                      <label htmlFor={`file-${f.key}`} style={{ cursor: "pointer" }}>
                        <div style={{ color: files[f.key] ? "var(--gold)" : "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", marginBottom: "4px" }}>
                          {files[f.key] ? `✓ ${files[f.key]!.name}` : `Click to upload ${f.label}`}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-mono)" }}>
                          {f.hint}
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Publish Card */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px" }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "16px" }}>Publish</h2>

                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <input
                    type="checkbox" name="is_published"
                    checked={form.is_published}
                    onChange={handleChange}
                    style={{ width: "16px", height: "16px", accentColor: "var(--gold)" }}
                  />
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>
                    Publish immediately
                  </span>
                </label>
                <p style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-ui)", marginTop: "8px", lineHeight: 1.6 }}>
                  If unchecked, the beat will be saved as a draft and won't appear in the store.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", marginTop: "20px", padding: "13px",
                    background: loading ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
                    border: "none", borderRadius: "4px",
                    color: loading ? "var(--text-muted)" : "#000",
                    fontSize: "0.75rem", fontWeight: 800,
                    fontFamily: "var(--font-ui)", letterSpacing: "0.12em",
                    textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? "Uploading..." : "Upload Beat"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}