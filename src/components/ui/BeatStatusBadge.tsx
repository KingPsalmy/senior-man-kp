type Props = {
  status: "AVAILABLE" | "LOCKED" | "SOLD_EXCLUSIVE"
}

export default function BeatStatusBadge({ status }: Props) {
  if (status === "AVAILABLE") return null

  const styles = {
    LOCKED: {
      bg: "rgba(255,200,0,0.1)",
      color: "#ffcc00",
      label: "LOCKED",
    },
    SOLD_EXCLUSIVE: {
      bg: "rgba(255,50,50,0.1)",
      color: "#ff5555",
      label: "SOLD EXCLUSIVE",
    },
  }

  const s = styles[status]

  return (
    <span style={{
      fontSize: "0.6rem",
      padding: "2px 8px",
      backgroundColor: s.bg,
      color: s.color,
      borderRadius: "2px",
      fontFamily: "var(--font-mono)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}>
      {s.label}
    </span>
  )
}