"use client"

import { useEffect, useRef } from "react"

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Particles
    const particles: {
      x: number; y: number; size: number; speedY: number
      speedX: number; opacity: number; opacitySpeed: number
    }[] = []

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.4 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.5 + 0.1,
        opacitySpeed: Math.random() * 0.005 + 0.002,
      })
    }

    // Orb
    const orb = {
      x: canvas.width * 0.35,
      y: canvas.height * 0.55,
      radius: 180,
      phase: 0,
      phaseSpeed: 0.008,
    }

    // Scan line
    const scanLine = {
      y: 0,
      speed: 0.4,
      direction: 1,
    }

    let animFrame: number

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // --- Orb ---
      orb.phase += orb.phaseSpeed
      const pulse = Math.sin(orb.phase) * 0.3 + 0.7
      const orbX = orb.x + Math.sin(orb.phase * 0.7) * 20
      const orbY = orb.y + Math.cos(orb.phase * 0.5) * 15

      const gradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orb.radius * pulse)
      gradient.addColorStop(0, `rgba(201, 168, 76, ${0.12 * pulse})`)
      gradient.addColorStop(0.4, `rgba(201, 168, 76, ${0.06 * pulse})`)
      gradient.addColorStop(1, "rgba(201, 168, 76, 0)")
      ctx.beginPath()
      ctx.arc(orbX, orbY, orb.radius * pulse, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Second smaller orb
      const orb2X = orb.x * 0.5 + Math.cos(orb.phase * 0.6) * 30
      const orb2Y = orb.y * 0.4 + Math.sin(orb.phase * 0.4) * 20
      const gradient2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 100)
      gradient2.addColorStop(0, `rgba(201, 168, 76, ${0.07 * pulse})`)
      gradient2.addColorStop(1, "rgba(201, 168, 76, 0)")
      ctx.beginPath()
      ctx.arc(orb2X, orb2Y, 100, 0, Math.PI * 2)
      ctx.fillStyle = gradient2
      ctx.fill()

      // --- Particles ---
      particles.forEach((p) => {
        p.y += p.speedY
        p.x += p.speedX
        p.opacity += p.opacitySpeed
        if (p.opacity > 0.6 || p.opacity < 0.05) p.opacitySpeed *= -1
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width }
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`
        ctx.fill()

        // Occasional glow on larger particles
        if (p.size > 1.8) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity * 0.15})`
          ctx.fill()
        }
      })

      // --- Scan Line ---
      scanLine.y += scanLine.speed * scanLine.direction
      if (scanLine.y > canvas.height) scanLine.direction = -1
      if (scanLine.y < 0) scanLine.direction = 1

      const scanGrad = ctx.createLinearGradient(0, scanLine.y - 40, 0, scanLine.y + 40)
      scanGrad.addColorStop(0, "rgba(201, 168, 76, 0)")
      scanGrad.addColorStop(0.5, "rgba(201, 168, 76, 0.04)")
      scanGrad.addColorStop(1, "rgba(201, 168, 76, 0)")
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanLine.y - 40, canvas.width * 0.55, 80)

      // Thin bright scan line
      ctx.beginPath()
      ctx.moveTo(0, scanLine.y)
      ctx.lineTo(canvas.width * 0.45, scanLine.y)
      const lineGrad = ctx.createLinearGradient(0, 0, canvas.width * 0.45, 0)
      lineGrad.addColorStop(0, "rgba(201, 168, 76, 0.15)")
      lineGrad.addColorStop(1, "rgba(201, 168, 76, 0)")
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = 0.5
      ctx.stroke()

      animFrame = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  )
}