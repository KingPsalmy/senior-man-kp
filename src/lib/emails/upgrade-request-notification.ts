type UpgradeRequestNotificationParams = {
  beatTitle: string
  customerEmail: string
  currentLicenseType: string
  priceDifference: number
}

export function upgradeRequestNotificationEmail({
  beatTitle,
  customerEmail,
  currentLicenseType,
  priceDifference,
}: UpgradeRequestNotificationParams) {
  const subject = `Upgrade request — ${beatTitle} → Exclusive`

  const html = `
  <div style="background-color:#0a0a0a; padding:40px 20px; font-family:Arial, sans-serif;">
    <div style="max-width:480px; margin:0 auto; background-color:#141414; border:1px solid #262626; border-radius:12px; overflow:hidden;">
      <div style="padding:28px 32px; border-bottom:1px solid #262626;">
        <p style="color:#C9A84C; font-size:11px; letter-spacing:2px; text-transform:uppercase; margin:0 0 8px;">Upgrade Request</p>
        <h1 style="color:#F5F0E8; font-size:20px; margin:0;">${beatTitle}</h1>
      </div>
      <div style="padding:28px 32px;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="color:#8a8a8a; font-size:13px; padding:6px 0;">Customer</td>
            <td style="color:#F5F0E8; font-size:13px; padding:6px 0; text-align:right;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="color:#8a8a8a; font-size:13px; padding:6px 0;">Current License</td>
            <td style="color:#F5F0E8; font-size:13px; padding:6px 0; text-align:right; text-transform:capitalize;">${currentLicenseType}</td>
          </tr>
          <tr>
            <td style="color:#8a8a8a; font-size:13px; padding:6px 0;">Wants</td>
            <td style="color:#F5F0E8; font-size:13px; padding:6px 0; text-align:right;">Exclusive</td>
          </tr>
          <tr>
            <td style="color:#8a8a8a; font-size:13px; padding:6px 0;">Price Difference</td>
            <td style="color:#C9A84C; font-size:13px; padding:6px 0; text-align:right; font-weight:700;">₦${priceDifference.toLocaleString()}</td>
          </tr>
        </table>
        <p style="color:#666; font-size:12px; line-height:1.6; margin:20px 0 0;">
          Reply directly to ${customerEmail} to arrange payment of the difference and complete the upgrade manually.
        </p>
      </div>
    </div>
  </div>
  `

  return { subject, html }
}