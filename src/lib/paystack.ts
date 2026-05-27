export function initializePaystack({
  email,
  amount,
  reference,
  metadata,
  onSuccess,
  onClose,
}: {
  email: string
  amount: number
  reference: string
  metadata: Record<string, any>
  onSuccess: (ref: string) => void
  onClose: () => void
}) {
  // Amount must be in kobo (multiply by 100)
  const handler = (window as any).PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100,
    currency: "NGN",
    ref: reference,
    metadata,
    callback: (response: any) => {
      onSuccess(response.reference)
    },
    onClose,
  })

  handler.openIframe()
}

export function generateReference(beatId: string, licenseType: string) {
  return `SMKP-${beatId}-${licenseType}-${Date.now()}`
}