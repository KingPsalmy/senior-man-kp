"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

const genres = ["Afrobeat", "Afro Fusion", "Afro-Soul", "Afropop", "Amapiano", "Trap", "Drill", "R&B", "Hip-Hop", "Dancehall", "Reggae", "Highlife", "Fuji", "Gospel", "Alternative", "Pop", "Soul", "Lo-Fi", "House", "EDM", "Jersey Club", "UK Afroswing", "Afro House", "Piano Fusion", "Neo Soul"]
const moods = ["Dark", "Euphoric", "Melancholic", "Energetic", "Romantic", "Chill", "Soulful", "Emotional", "Happy", "Uplifting", "Inspirational", "Reflective", "Dreamy", "Smooth", "Groovy", "Luxury", "Sexy", "Confident", "Aggressive", "Epic", "Cinematic", "Party", "Rave", "Spiritual", "Hopeful", "Nostalgic", "Motivational", "Passionate", "Intimate", "Triumphant"]
const keys = [
  "A Major", "Bb Major", "B Major", "C Major", "C# Major", "D Major",
  "Eb Major", "E Major", "F Major", "F# Major", "G Major", "Ab Major",
  "A Minor", "Bb Minor", "B Minor", "C Minor", "C# Minor", "D Minor",
  "Eb Minor", "E Minor", "F Minor", "F# Minor", "G Minor", "Ab Minor",
]

type Beat = {
  id: string
  title: string
  genre: string
  mood: string
  bpm: number
  key: string
  description: string
  duration: string
  basic_price: number
  premium_price: number
  unlimited_price: number
  exclusive_price: number
  is_published: boolean
  is_featured: boolean
  cover_url: string | null
  preview_url: string | null
  wav_url: string | null
  stems_url: string | null
  play_count: number
  created_at: string
}

const emptyForm = {
  title: "", genre: "Afrobeat", mood: "Dark", bpm: "",
  key: "A Minor", description: "", duration: "",
  basic_price: "", premium_price: "", unlimited_price: "", exclusive_price: "",
  is_published: false, is_featured: false,
}

export default function AdminBeatsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"list" | "upload">("list")
  const [beats, setBeats] = useState<Beat[]>([])
  const [loadingBeats, setLoadingBeats] = useState(true)
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editBeat, setEditBeat] = useState<Beat | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")
  const [editSuccess, setEditSuccess] = useState(false)
  const [editUploadStatus, setEditUploadStatus] = useState("")

  const [form, setForm] = useState<typeof emptyForm>({ ...emptyForm })
  const [files, setFiles] = useState<{ cover: File | null; preview: File | null; wav: File | null; stems: File | null }>
    ({ cover: null, preview: null, wav: null, stems: null })

  const [editFiles, setEditFiles] = useState<{ cover: File | null; preview: File | null; wav: File | null; stems: File | null }>
    ({ cover: null, preview: null, wav: null, stems: null })

  const [editForm, setEditForm] = useState({
    title: "", genre: "Afrobeat", mood: "Dark", bpm: "",
    key: "A Minor", description: "", duration: "",
    basic_price: "", premium_price: "", unlimited_price: "", exclusive_price: "",
    is_published: false, is_featured: false,
  })

  useEffect(() => { checkAuth(); fetchBeats() }, [])

  async function checkAuth() {
    const { data } = await supabase.auth.getSession()
    if (!data.session) router.push("/admin/login")
  }

  async function fetchBeats() {
    setLoadingBeats(true)
    const { data } = await supabase.from("beats").select("*").order("created_at", { ascending: false })
    setBeats(data || [])
    setLoadingBeats(false)
  }

  async function getAuthToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token
  }

  async function togglePublish(beat: Beat) {
    const token = await getAuthToken()
    await fetch("/api/admin/beats", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: beat.id, is_published: !beat.is_published }),
    })
    fetchBeats()
  }

  async function toggleFeatured(beat: Beat) {
    const token = await getAuthToken()
    await fetch("/api/admin/beats", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: beat.id, is_featured: !beat.is_featured }),
    })
    fetchBeats()
  }

  async function deleteBeat(id: string) {
    const token = await getAuthToken()
    await fetch(`/api/admin/beats?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    setDeleteId(null)
    fetchBeats()
  }

  function openEdit(beat: Beat) {
    setEditBeat(beat)
    setEditForm({
      title: beat.title,
      genre: beat.genre,
      mood: beat.mood || "Dark",
      bpm: String(beat.bpm),
      key: beat.key,
      description: beat.description || "",
      duration: beat.duration || "",
      basic_price: String(beat.basic_price),
      premium_price: String(beat.premium_price),
      unlimited_price: String(beat.unlimited_price),
      exclusive_price: String(beat.exclusive_price),
      is_published: beat.is_published,
      is_featured: beat.is_featured,
    })
    setEditFiles({ cover: null, preview: null, wav: null, stems: null })
    setEditError("")
    setEditSuccess(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }))
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }))
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>, key: "cover" | "preview" | "wav" | "stems") {
    setFiles((prev) => ({ ...prev, [key]: e.target.files?.[0] || null }))
  }

  function handleEditFile(e: React.ChangeEvent<HTMLInputElement>, key: "cover" | "preview" | "wav" | "stems") {
    setEditFiles((prev) => ({ ...prev, [key]: e.target.files?.[0] || null }))
  }

  async function uploadFile(file: File, bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async function uploadToR2(file: File, path: string) {
    const token = await getAuthToken()
    const presignRes = await fetch("/api/admin/upload-stems", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ path, contentType: file.type || "application/octet-stream" }),
    })
    const presignData = await presignRes.json()
    if (!presignRes.ok) throw new Error(presignData.error || "Failed to get R2 upload URL")
    const uploadRes = await fetch(presignData.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    })
    if (!uploadRes.ok) throw new Error("Failed to upload file to R2")
    return presignData.fileUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(""); setSuccess(false); setUploadStatus("")
    try {
      const slug = form.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
      const timestamp = Date.now()
      let cover_url = null, preview_url = null, wav_url = null, stems_url = null

      if (files.cover) { setUploadStatus("Uploading cover art..."); cover_url = await uploadFile(files.cover, "covers", `${slug}-${timestamp}`) }
      if (files.preview) { setUploadStatus("Uploading preview..."); preview_url = await uploadFile(files.preview, "previews", `${slug}-${timestamp}`) }
      if (files.wav) { setUploadStatus("Uploading WAV to R2..."); wav_url = await uploadToR2(files.wav, `wavs/${slug}-${timestamp}-${files.wav.name}`) }
      if (files.stems) { setUploadStatus("Uploading stems to R2..."); stems_url = await uploadToR2(files.stems, `stems/${slug}-${timestamp}-${files.stems.name}`) }
      setUploadStatus("Saving beat details...")

      const token = await getAuthToken()
      const res = await fetch("/api/admin/beats", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title, slug, genre: form.genre, mood: form.mood,
          bpm: parseInt(form.bpm), key: form.key, description: form.description,
          duration: form.duration || null,
          basic_price: parseFloat(form.basic_price), premium_price: parseFloat(form.premium_price),
          unlimited_price: parseFloat(form.unlimited_price), exclusive_price: parseFloat(form.exclusive_price),
          cover_url, preview_url, wav_url, stems_url,
          is_published: form.is_published, is_featured: form.is_featured,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Upload failed")
      setSuccess(true)
      setForm({ ...emptyForm })
      setFiles({ cover: null, preview: null, wav: null, stems: null })
      fetchBeats()
      setTimeout(() => setTab("list"), 1500)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false); setUploadStatus("")
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editBeat) return
    setEditLoading(true); setEditError(""); setEditSuccess(false); setEditUploadStatus("")
    try {
      const slug = editForm.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
      const timestamp = Date.now()

      // Only upload files that have been changed
      let cover_url = editBeat.cover_url
      let preview_url = editBeat.preview_url
      let wav_url = editBeat.wav_url
      let stems_url = editBeat.stems_url

      if (editFiles.cover) { setEditUploadStatus("Uploading cover art..."); cover_url = await uploadFile(editFiles.cover, "covers", `${slug}-${timestamp}`) }
      if (editFiles.preview) { setEditUploadStatus("Uploading preview..."); preview_url = await uploadFile(editFiles.preview, "previews", `${slug}-${timestamp}`) }
      if (editFiles.wav) { setEditUploadStatus("Uploading WAV to R2..."); wav_url = await uploadToR2(editFiles.wav, `wavs/${slug}-${timestamp}-${editFiles.wav.name}`) }
      if (editFiles.stems) { setEditUploadStatus("Uploading stems to R2..."); stems_url = await uploadToR2(editFiles.stems, `stems/${slug}-${timestamp}-${editFiles.stems.name}`) }
      setEditUploadStatus("Saving changes...")

      const token = await getAuthToken()
      const res = await fetch("/api/admin/beats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: editBeat.id, title: editForm.title, slug,
          genre: editForm.genre, mood: editForm.mood,
          bpm: parseInt(editForm.bpm), key: editForm.key,
          description: editForm.description, duration: editForm.duration || null,
          basic_price: parseFloat(editForm.basic_price), premium_price: parseFloat(editForm.premium_price),
          unlimited_price: parseFloat(editForm.unlimited_price), exclusive_price: parseFloat(editForm.exclusive_price),
          cover_url, preview_url, wav_url, stems_url,
          is_published: editForm.is_published, is_featured: editForm.is_featured,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Update failed")
      setEditSuccess(true)
      fetchBeats()
      setTimeout(() => setEditBeat(null), 1200)
    } catch (err: any) {
      setEditError(err.message || "Something went wrong")
    } finally {
      setEditLoading(false); setEditUploadStatus("")
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)",
    borderRadius: "4px", color: "var(--text-primary)",
    fontSize: "0.82rem", fontFamily: "var(--font-ui)", outline: "none",
  }

  const labelStyle = {
    display: "block", color: "var(--text-muted)",
    fontSize: "0.6rem", fontFamily: "var(--font-mono)",
    letterSpacing: "0.15em", textTransform: "uppercase" as const, marginBottom: "6px",
  }

  const fileRowStyle = (hasFile: boolean) => ({
    border: `1px dashed ${hasFile ? "rgba(201,168,76,0.3)" : "var(--border-dim)"}`,
    borderRadius: "4px", padding: "12px 16px",
    backgroundColor: hasFile ? "rgba(201,168,76,0.05)" : "transparent",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
    marginBottom: "12px",
  })

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-void)", display: "flex" }}>

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{
        width: "220px", flexShrink: 0, backgroundColor: "var(--bg-deep)",
        borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column",
        padding: "24px 0", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40,
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
              display: "flex", alignItems: "center", gap: "12px", padding: "10px 24px", textDecoration: "none",
              color: (item as any).active ? "var(--gold)" : "var(--text-secondary)",
              fontSize: "0.78rem", fontFamily: "var(--font-ui)", fontWeight: 500,
              backgroundColor: (item as any).active ? "rgba(201,168,76,0.06)" : "transparent",
              borderRight: (item as any).active ? "2px solid var(--gold)" : "2px solid transparent",
            }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/admin/login") }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 24px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", cursor: "pointer" }}
          >
            <span>→</span> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="admin-main" style={{ marginLeft: "220px", flex: 1, padding: "32px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>Beats</h1>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/admin/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", textDecoration: "none", padding: "9px 16px", border: "1px solid var(--border-dim)", borderRadius: "4px" }}>
              ← Dashboard
            </Link>
            <button
              onClick={() => setTab(tab === "list" ? "upload" : "list")}
              style={{
                padding: "9px 20px", fontSize: "0.72rem", fontWeight: 700,
                background: tab === "upload" ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
                border: "none", borderRadius: "4px", cursor: "pointer",
                color: tab === "upload" ? "var(--text-secondary)" : "#000",
                fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase",
              }}
            >
              {tab === "upload" ? "← Beat List" : "+ Upload Beat"}
            </button>
          </div>
        </div>

        {/* ── BEAT LIST TAB ── */}
        {tab === "list" && (
          <div>
            {loadingBeats ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Loading beats...</div>
            ) : beats.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>♪</div>
                <h2 style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "8px" }}>No beats yet</h2>
                <button onClick={() => setTab("upload")} style={{ padding: "10px 24px", fontSize: "0.72rem", fontWeight: 700, background: "linear-gradient(135deg, #C9A84C, #F5D98B)", border: "none", borderRadius: "4px", cursor: "pointer", color: "#000", fontFamily: "var(--font-ui)" }}>
                  + Upload First Beat
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 150px", padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)", gap: "12px" }}>
                  {["Beat", "Genre", "BPM", "Price", "Published", "Featured", "Actions"].map((h) => (
                    <span key={h} style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>

                {beats.map((beat, i) => (
                  <div key={beat.id} style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 150px",
                    padding: "14px 20px", gap: "12px", alignItems: "center",
                    borderBottom: i < beats.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "4px", flexShrink: 0, backgroundColor: "var(--bg-elevated)", overflow: "hidden" }}>
                        {beat.cover_url
                          ? <img src={beat.cover_url} alt={beat.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.6rem" }}>♪</div>
                        }
                      </div>
                      <span style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 600, fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{beat.title}</span>
                    </div>

                    <span style={{ color: "var(--gold)", fontSize: "0.72rem", fontFamily: "var(--font-ui)" }}>{beat.genre}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}>{beat.bpm} BPM</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.72rem", fontFamily: "var(--font-ui)" }}>₦{beat.basic_price?.toLocaleString()}</span>

                    <button onClick={() => togglePublish(beat)} style={{
                      padding: "4px 10px", borderRadius: "20px", border: "none", cursor: "pointer",
                      backgroundColor: beat.is_published ? "rgba(74,222,128,0.12)" : "var(--bg-elevated)",
                      color: beat.is_published ? "#4ade80" : "var(--text-muted)",
                      fontSize: "0.6rem", fontFamily: "var(--font-mono)", fontWeight: 700,
                    }}>
                      {beat.is_published ? "Live" : "Draft"}
                    </button>

                    <button onClick={() => toggleFeatured(beat)} style={{
                      padding: "4px 10px", borderRadius: "20px", border: "none", cursor: "pointer",
                      backgroundColor: beat.is_featured ? "rgba(201,168,76,0.12)" : "var(--bg-elevated)",
                      color: beat.is_featured ? "var(--gold)" : "var(--text-muted)",
                      fontSize: "0.6rem", fontFamily: "var(--font-mono)", fontWeight: 700,
                    }}>
                      {beat.is_featured ? "★ Featured" : "Feature"}
                    </button>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => openEdit(beat)}
                        style={{
                          padding: "5px 10px", borderRadius: "3px",
                          backgroundColor: "rgba(201,168,76,0.08)",
                          border: "1px solid rgba(201,168,76,0.2)",
                          color: "var(--gold)", fontSize: "0.6rem",
                          fontFamily: "var(--font-mono)", cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(beat.id)}
                        style={{
                          padding: "5px 10px", borderRadius: "3px",
                          backgroundColor: "rgba(255,100,100,0.08)",
                          border: "1px solid rgba(255,100,100,0.2)",
                          color: "#ff6b6b", fontSize: "0.6rem",
                          fontFamily: "var(--font-mono)", cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── UPLOAD TAB ── */}
        {tab === "upload" && (
          <form onSubmit={handleSubmit}>
            {success && (
              <div style={{ backgroundColor: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "6px", padding: "14px 18px", marginBottom: "24px", color: "#4ade80", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>
                ✓ Beat uploaded successfully! Redirecting to beat list...
              </div>
            )}
            {error && (
              <div style={{ backgroundColor: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "6px", padding: "14px 18px", marginBottom: "24px", color: "#ff6b6b", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>
                {error}
              </div>
            )}

            <div className="upload-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px" }}>
                  <h2 style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "20px" }}>Beat Info</h2>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Title *</label>
                    <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Midnight Drive" style={inputStyle} />
                  </div>
                  <div className="upload-inner-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    <div><label style={labelStyle}>Genre *</label><select name="genre" value={form.genre} onChange={handleChange} style={inputStyle}>{genres.map((g) => <option key={g}>{g}</option>)}</select></div>
                    <div><label style={labelStyle}>Mood</label><select name="mood" value={form.mood} onChange={handleChange} style={inputStyle}>{moods.map((m) => <option key={m}>{m}</option>)}</select></div>
                  </div>
                  <div className="upload-inner-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    <div><label style={labelStyle}>BPM *</label><input name="bpm" value={form.bpm} onChange={handleChange} required type="number" placeholder="98" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Key *</label><select name="key" value={form.key} onChange={handleChange} style={inputStyle}>{keys.map((k) => <option key={k}>{k}</option>)}</select></div>
                    <div><label style={labelStyle}>Duration</label><input name="duration" value={form.duration} onChange={handleChange} placeholder="3:45" style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>Description</label><textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the beat..." rows={3} style={{ ...inputStyle, resize: "vertical" as const }} /></div>
                </div>

                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px" }}>
                  <h2 style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "20px" }}>Pricing (₦)</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { name: "basic_price", label: "Basic License", placeholder: "30000" },
                      { name: "premium_price", label: "Premium License", placeholder: "70000" },
                      { name: "unlimited_price", label: "Unlimited License", placeholder: "120000" },
                      { name: "exclusive_price", label: "Exclusive License", placeholder: "180000" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label style={labelStyle}>{field.label} *</label>
                        <input name={field.name} value={form[field.name as keyof typeof form] as string} onChange={handleChange} required type="number" placeholder={field.placeholder} style={inputStyle} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px" }}>
                  <h2 style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "20px" }}>Files</h2>
                  {([
                    { key: "cover" as const, label: "Cover Art", accept: "image/*", hint: "JPG, PNG — Square recommended" },
                    { key: "preview" as const, label: "Preview Audio", accept: "audio/*", hint: "MP3 — Watermarked version" },
                    { key: "wav" as const, label: "WAV File (Private)", accept: "audio/wav,.wav", hint: "WAV — Uploaded to R2" },
                    { key: "stems" as const, label: "Stems ZIP (Private)", accept: ".zip,.rar", hint: "ZIP — Uploaded to R2" },
                  ]).map((f) => (
                    <div key={f.key} style={{ marginBottom: "16px" }}>
                      <label style={labelStyle}>{f.label}</label>
                      <div style={{ border: `1px dashed ${files[f.key] ? "rgba(201,168,76,0.3)" : "var(--border-dim)"}`, borderRadius: "4px", padding: "16px", textAlign: "center", backgroundColor: files[f.key] ? "rgba(201,168,76,0.05)" : "transparent" }}>
                        <input type="file" accept={f.accept} onChange={(e) => handleFile(e, f.key)} style={{ display: "none" }} id={`file-${f.key}`} />
                        <label htmlFor={`file-${f.key}`} style={{ cursor: "pointer" }}>
                          <div style={{ color: files[f.key] ? "var(--gold)" : "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-ui)", marginBottom: "4px" }}>
                            {files[f.key] ? `✓ ${files[f.key]!.name}` : `Click to upload ${f.label}`}
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.62rem", fontFamily: "var(--font-mono)" }}>{f.hint}</div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "24px" }}>
                  <h2 style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-ui)", marginBottom: "20px" }}>Settings</h2>
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginBottom: "16px" }}>
                    <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} style={{ width: "16px", height: "16px", accentColor: "var(--gold)" }} />
                    <div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>Publish immediately</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-ui)" }}>Beat will appear in the store</div>
                    </div>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginBottom: "24px" }}>
                    <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} style={{ width: "16px", height: "16px", accentColor: "var(--gold)" }} />
                    <div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontFamily: "var(--font-ui)", fontWeight: 600 }}>Feature on Homepage</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-ui)" }}>Shows in "Latest Drops" section</div>
                    </div>
                  </label>
                  <button type="submit" disabled={loading} style={{
                    width: "100%", padding: "13px",
                    background: loading ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
                    border: "none", borderRadius: "4px", color: loading ? "var(--text-muted)" : "#000",
                    fontSize: "0.75rem", fontWeight: 800, fontFamily: "var(--font-ui)",
                    letterSpacing: "0.12em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                  }}>
                    {loading ? (uploadStatus || "Uploading...") : "Upload Beat"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {editBeat && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: "24px", overflowY: "auto",
        }}>
          <div style={{
            backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)",
            borderRadius: "12px", width: "100%", maxWidth: "780px",
            padding: "32px", margin: "auto",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
              <div>
                <h2 style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-ui)" }}>Edit Beat</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontFamily: "var(--font-ui)", marginTop: "4px" }}>
                  Only upload new files to replace existing ones. Leave file fields empty to keep current files.
                </p>
              </div>
              <button onClick={() => setEditBeat(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.3rem" }}>✕</button>
            </div>

            {editSuccess && (
              <div style={{ backgroundColor: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px", color: "#4ade80", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>
                ✓ Beat updated successfully!
              </div>
            )}
            {editError && (
              <div style={{ backgroundColor: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.2)", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px", color: "#ff6b6b", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                {/* Left — Beat info + pricing */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={labelStyle}>Title *</label>
                    <input name="title" value={editForm.title} onChange={handleEditChange} required style={inputStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div><label style={labelStyle}>Genre</label><select name="genre" value={editForm.genre} onChange={handleEditChange} style={inputStyle}>{genres.map((g) => <option key={g}>{g}</option>)}</select></div>
                    <div><label style={labelStyle}>Mood</label><select name="mood" value={editForm.mood} onChange={handleEditChange} style={inputStyle}>{moods.map((m) => <option key={m}>{m}</option>)}</select></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div><label style={labelStyle}>BPM</label><input name="bpm" value={editForm.bpm} onChange={handleEditChange} type="number" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Key</label><select name="key" value={editForm.key} onChange={handleEditChange} style={inputStyle}>{keys.map((k) => <option key={k}>{k}</option>)}</select></div>
                    <div><label style={labelStyle}>Duration</label><input name="duration" value={editForm.duration} onChange={handleEditChange} placeholder="3:45" style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>Description</label><textarea name="description" value={editForm.description} onChange={handleEditChange} rows={3} style={{ ...inputStyle, resize: "vertical" as const }} /></div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={labelStyle}>Pricing (₦)</label>
                    {[
                      { name: "basic_price", label: "Basic" },
                      { name: "premium_price", label: "Premium" },
                      { name: "unlimited_price", label: "Unlimited" },
                      { name: "exclusive_price", label: "Exclusive" },
                    ].map((f) => (
                      <div key={f.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontFamily: "var(--font-ui)", width: "70px", flexShrink: 0 }}>{f.label}</span>
                        <input name={f.name} value={editForm[f.name as keyof typeof editForm] as string} onChange={handleEditChange} type="number" style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input type="checkbox" name="is_published" checked={editForm.is_published} onChange={handleEditChange} style={{ width: "16px", height: "16px", accentColor: "var(--gold)" }} />
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>Published</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input type="checkbox" name="is_featured" checked={editForm.is_featured} onChange={handleEditChange} style={{ width: "16px", height: "16px", accentColor: "var(--gold)" }} />
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem", fontFamily: "var(--font-ui)" }}>Featured on Homepage</span>
                    </label>
                  </div>
                </div>

                {/* Right — File replacements */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: "12px" }}>Replace Files (optional)</label>
                    {([
                      { key: "cover" as const, label: "Cover Art", accept: "image/*", current: editBeat.cover_url },
                      { key: "preview" as const, label: "Preview MP3", accept: "audio/*", current: editBeat.preview_url },
                      { key: "wav" as const, label: "WAV File", accept: "audio/wav,.wav", current: editBeat.wav_url },
                      { key: "stems" as const, label: "Stems ZIP", accept: ".zip,.rar", current: editBeat.stems_url },
                    ]).map((f) => (
                      <div key={f.key} style={fileRowStyle(!!editFiles[f.key])}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", fontWeight: 600, marginBottom: "2px" }}>{f.label}</div>
                          <div style={{ color: editFiles[f.key] ? "var(--gold)" : "var(--text-muted)", fontSize: "0.65rem", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {editFiles[f.key] ? `→ ${editFiles[f.key]!.name}` : f.current ? "✓ File exists" : "No file"}
                          </div>
                        </div>
                        <div>
                          <input type="file" accept={f.accept} onChange={(e) => handleEditFile(e, f.key)} style={{ display: "none" }} id={`edit-file-${f.key}`} />
                          <label htmlFor={`edit-file-${f.key}`} style={{
                            padding: "6px 12px", borderRadius: "3px", cursor: "pointer",
                            backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-dim)",
                            color: "var(--text-secondary)", fontSize: "0.65rem", fontFamily: "var(--font-mono)",
                            whiteSpace: "nowrap",
                          }}>
                            {editFiles[f.key] ? "Change" : "Replace"}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cover art preview */}
                  {editBeat.cover_url && !editFiles.cover && (
                    <div>
                      <label style={labelStyle}>Current Cover</label>
                      <img src={editBeat.cover_url} alt="Current cover" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border-subtle)" }} />
                    </div>
                  )}
                  {editFiles.cover && (
                    <div>
                      <label style={labelStyle}>New Cover Preview</label>
                      <img src={URL.createObjectURL(editFiles.cover)} alt="New cover" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(201,168,76,0.3)" }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
                <button type="submit" disabled={editLoading} style={{
                  flex: 1, padding: "13px",
                  background: editLoading ? "var(--bg-elevated)" : "linear-gradient(135deg, #C9A84C, #F5D98B)",
                  border: "none", borderRadius: "4px", cursor: editLoading ? "not-allowed" : "pointer",
                  color: editLoading ? "var(--text-muted)" : "#000",
                  fontSize: "0.75rem", fontWeight: 800, fontFamily: "var(--font-ui)",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                }}>
                  {editLoading ? (editUploadStatus || "Saving...") : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditBeat(null)} style={{
                  padding: "13px 24px", background: "none",
                  border: "1px solid var(--border-dim)", borderRadius: "4px", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-ui)",
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "32px", maxWidth: "400px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🗑️</div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-ui)", marginBottom: "8px" }}>Delete this beat?</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-ui)", marginBottom: "24px", lineHeight: 1.6 }}>
              This action cannot be undone. The beat and all its files will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => deleteBeat(deleteId)} style={{ flex: 1, padding: "12px", background: "rgba(255,100,100,0.15)", border: "1px solid rgba(255,100,100,0.3)", borderRadius: "4px", color: "#ff6b6b", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-ui)", cursor: "pointer" }}>
                Yes, Delete
              </button>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "12px", background: "none", border: "1px solid var(--border-dim)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-ui)", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
