const LICENSE_LABELS: Record<string, string> = {
  basic: "Basic",
  premium: "Premium",
  unlimited: "Unlimited",
}

export function upgradeRequestNotificationEmail({
  beatTitle,
  customerEmail,
  currentLicenseType, 
  priceDifference,
}: {
  beatTitle: string
  customerEmail: string
  currentLicenseType: string
  priceDifference: number
}) {
  const subject = `Upgrade request: ${beatTitle} → Exclusive`

  const html = `
  <div style="font-family: -apple-system, sans-serif; background:#0a0a0a; padding:40px 20px;">
    <div style="max-width:520px; margin:0 auto; background:#141414; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:32px;">
      <p style="color:#C9A84C; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; margin:0 0 16px;">
        Upgrade Request
      </p>
      <h1 style="color:#F5F0E8; font-size:22px; margin:0 0 20px;">
        ${beatTitle}
      </h1>
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="color:rgba(245,240,232,0.5); font-size:13px; padding:8px 0;">Customer</td>
          <td style="color:#F5F0E8; font-size:13px; padding:8px 0; text-align:right;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="color:rgba(245,240,232,0.5); font-size:13px; padding:8px 0;">Current License</td>
          <td style="color:#F5F0E8; font-size:13px; padding:8px 0; text-align:right;">${LICENSE_LABELS[currentLicenseType] ?? currentLicenseType}</td>
        </tr>
        <tr>
          <td style="color:rgba(245,240,232,0.5); font-size:13px; padding:8px 0;">Requesting</td>
          <td style="color:#F5F0E8; font-size:13px; padding:8px 0; text-align:right;">Exclusive</td>
        </tr>
        <tr>
          <td style="color:#C9A84C; font-size:14px; font-weight:700; padding:12px 0 0; border-top:1px solid rgba(255,255,255,0.08);">Amount Owed</td>
          <td style="color:#C9A84C; font-size:14px; font-weight:700; padding:12px 0 0; border-top:1px solid rgba(255,255,255,0.08); text-align:right;">₦${priceDifference.toLocaleString()}</td>
        </tr>
      </table>
      <p style="color:rgba(245,240,232,0.4); font-size:12px; margin-top:24px; line-height:1.6;">
        Reach out to the customer directly to collect the price difference and finalize the exclusive license.
      </p>
    </div>
  </div>
  `

  return { subject, html }
}
