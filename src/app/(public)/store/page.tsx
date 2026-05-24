import Navbar from "@/components/layout/Navbar"

export default function StorePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-void)" }}>
      <Navbar />

      {/* Page Header */}
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12" style={{ backgroundColor: "var(--gold-dim)" }} />
          <span
            className="font-mono text-[10px] tracking-[0.4em] uppercase"
            style={{ color: "var(--gold)" }}
          >
            Beat Catalog
          </span>
          <div className="h-px w-12" style={{ backgroundColor: "var(--gold-dim)" }} />
        </div>
        <h1
          className="font-display text-6xl md:text-7xl mb-4"
          style={{ color: "var(--text-primary)", fontStyle: "italic" }}
        >
          All Beats
        </h1>
        <p
          className="text-xs tracking-[0.25em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Select a beat. Choose your license. Create.
        </p>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-8 mb-12">
        <div className="flex flex-wrap items-center gap-3">

          <input
            type="text"
            placeholder="Search beats..."
            className="flex-1 min-w-[220px] px-5 py-3 rounded-sm text-xs tracking-wider outline-none"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-dim)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-ui)",
            }}
          />

          {[
            {
              options: ["All Genres", "Afrobeats", "Afro-Fusion", "Afro-Drill", "Amapiano", "Afropop", "R&B", "Trap"],
            },
            {
              options: ["Any BPM", "Slow (60–89)", "Mid (90–119)", "Fast (120+)"],
            },
            {
              options: ["Any Mood", "Dark", "Euphoric", "Melancholic", "Energetic", "Romantic"],
            },
          ].map((filter, i) => (
            <select
              key={i}
              className="px-5 py-3 rounded-sm text-xs tracking-wider outline-none cursor-pointer"
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-ui)",
              }}
            >
              {filter.options.map((opt) => (
                <option key={opt} value={opt.toLowerCase()}>
                  {opt}
                </option>
              ))}
            </select>
          ))}

        </div>
      </section>

      {/* Beat Grid */}
      <section className="max-w-7xl mx-auto px-8 pb-40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="beat-card rounded-sm overflow-hidden"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {/* Cover Art */}
              <div
                className="aspect-square w-full relative group"
                style={{ backgroundColor: "var(--bg-elevated)" }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Cover Art
                  </span>
                </div>
                {/* Play overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center glow-gold"
                    style={{ backgroundColor: "var(--gold)" }}
                  >
                    <span style={{ color: "#000", fontSize: "20px", marginLeft: "3px" }}>▶</span>
                  </div>
                </div>
              </div>

              {/* Beat Info */}
              <div className="p-5">
                <h3
                  className="font-display text-xl mb-2 line-clamp-1"
                  style={{ color: "var(--text-primary)", fontStyle: "italic" }}
                >
                  Beat Title {i + 1}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                    140 BPM
                  </span>
                  <span style={{ color: "var(--border-dim)" }}>·</span>
                  <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                    A Min
                  </span>
                  <span style={{ color: "var(--border-dim)" }}>·</span>
                  <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Afro-Fusion
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className="font-display text-2xl gradient-gold"
                    style={{ fontStyle: "italic" }}
                  >
                    ₦15,000
                  </span>
                  <button className="btn-gold px-4 py-2 rounded-sm">
                    License
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

    </main>
  )
}