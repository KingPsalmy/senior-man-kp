export type LicenseType = "basic" | "premium" | "exclusive"

export type Beat = {
  id: string
  title: string
  slug: string
  bpm: number
  key: string
  genre: string
  mood: string | null
  tags: string[] | null
  description: string | null
  cover_url: string | null
  preview_url: string | null
  basic_price: number
  premium_price: number
  exclusive_price: number
  stems_url: string | null
  is_published: boolean
  is_exclusive_sold: boolean
  created_at: string
}

export type Purchase = {
  id: string
  beat_id: string
  customer_email: string
  customer_name: string | null
  license_type: LicenseType
  amount_paid: number
  paystack_reference: string
  payment_status: "pending" | "success" | "failed"
  download_token: string | null
  download_expires_at: string | null
  created_at: string
}

export type License = {
  type: LicenseType
  label: string
  price: number
  features: string[]
  deliverable: string
}