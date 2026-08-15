type SuggestedBeat = {
  title: string
  slug: string
  coverUrl: string | null
  price: number
}

type PurchaseConfirmationParams = {
  customerEmail: string
  beatTitle: string
  licenseType: string
  amountPaid: number
  downloadToken: string
  suggestedBeats?: SuggestedBeat[]
}

export function purchaseConfirmationEmail({
  beatTitle,
  licenseType,
  amountPaid,
  downloadToken,
  suggestedBeats = [],
}: PurchaseConfirmationParams) {
  const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/download?token=${downloadToken}`
  const licenseLabel = licenseType.charAt(0).toUpperCase() + licenseType.slice(1)

  const subject = `Your beat is ready — ${beatTitle} 🎧`

  const suggestionsHtml = suggestedBeats.length > 0 ? `
    <div style="padding:28px 32px; border-top:1px solid #262626;">
      <p style="color:#8a8a8a; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; margin:0 0 16px;">You Might Also Like</p>
      ${suggestedBeats.map((beat) => `
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/beat/${beat.slug}" style="display:flex; align-items:center; gap:14px; text-decoration:none; margin-bottom:14px;">
          ${beat.coverUrl ? `<img src="${beat.coverUrl}" width="52" height="52" style="border-radius:6px; object-fit:cover; flex-shrink:0;" />` : `<div style="width:52px; height:52px; border-radius:6px; background:#262626; flex-shrink:0;"></div>`}
          <div style="flex:1;">
            <p style="color:#F5F0E8; font-size:13px; font-weight:600; margin:0 0 2px;">${beat.title}</p>
            <p style="color:#C9A84C; font-size:12px; margin:0;">from ₦${beat.price.toLocaleString()}</p>
          </div>
        </a>
      `).join("")}
    </div>
  ` : ""

  const html = `
  <div style="background-color:#0a0a0a; padding:40px 20px; font-family:Arial, sans-serif;">
    <div style="max-width:520px; margin:0 auto; background-color:#141414; border:1px solid #262626; border-radius:12px; overflow:hidden;">
      <div style="padding:32px; border-bottom:1px solid #262626;">
        <p style="color:#C9A84C; font-size:11px; letter-spacing:2px; text-transform:uppercase; margin:0 0 8px;">Senior Man KP</p>
        <h1 style="color:#F5F0E8; font-size:22px; margin:0;">You're all set.</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#c9c9c9; font-size:14px; line-height:1.6; margin:0 0 24px;">
          <strong style="color:#F5F0E8;">${beatTitle}</strong> is yours under the ${licenseLabel} License. Your files are ready whenever you are.
        </p>
        <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
          <tr>
            <td style="color:#8a8a8a; font-size:13px; padding:6px 0;">Beat</td>
            <td style="color:#F5F0E8; font-size:13px; padding:6px 0; text-align:right;">${beatTitle}</td>
          </tr>
          <tr>
            <td style="color:#8a8a8a; font-size:13px; padding:6px 0;">License</td>
            <td style="color:#F5F0E8; font-size:13px; padding:6px 0; text-align:right;">${licenseLabel}</td>
          </tr>
          <tr>
            <td style="color:#8a8a8a; font-size:13px; padding:6px 0;">Amount Paid</td>
            <td style="color:#F5F0E8; font-size:13px; padding:6px 0; text-align:right;">₦${amountPaid.toLocaleString()}</td>
          </tr>
        </table>
        <a href="${downloadUrl}" style="display:block; text-align:center; padding:14px; background:linear-gradient(135deg,#C9A84C,#F5D98B); color:#000; text-decoration:none; font-weight:700; font-size:13px; letter-spacing:1px; text-transform:uppercase; border-radius:6px;">
          Download Your Files
        </a>
        <p style="color:#666; font-size:12px; line-height:1.6; margin:20px 0 0;">
          Need anything else? Just reply to this email.
        </p>
      </div>
      ${suggestionsHtml}
      <div style="padding:20px 32px; border-top:1px solid #262626;">
        <p style="color:#555; font-size:11px; margin:0;">© ${new Date().getFullYear()} Senior Man KP. All rights reserved.</p>
      </div>
    </div>
  </div>
  `

  return { subject, html }
}