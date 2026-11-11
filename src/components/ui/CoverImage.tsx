"use client"

import Image from "next/image"
import { useState, type CSSProperties } from "react"
import { canOptimizeCover } from "@/lib/public-media"

type Props = {
  src: string
  alt: string
  sizes?: string
  style?: CSSProperties
  loading?: "lazy" | "eager"
}

export default function CoverImage({ src, alt, sizes = "(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 320px", style, loading = "lazy" }: Props) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  // Keep legacy external artwork working without turning the optimizer into an
  // unrestricted proxy or allowing it to retrieve private download URLs.
  if (failedSource === src || !canOptimizeCover(src, process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} style={style} loading={loading} decoding="async" />
  }
  // A cold optimizer request can time out on a slow upstream connection. Keep
  // the original artwork available rather than leaving a broken image.
  return <Image src={src} alt={alt} width={1024} height={1024} sizes={sizes} style={style} loading={loading} onError={() => setFailedSource(src)} />
}
