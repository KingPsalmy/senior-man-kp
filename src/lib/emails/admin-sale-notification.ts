type AdminSaleNotificationParams = {
  beatTitle: string
  licenseType: string
  amountPaid: number
  customerEmail: string
}

export function adminSaleNotificationEmail({
  beatTitle,
  licenseType,
  amountPaid,
  customerEmail,
}: AdminSaleNotificationParams) {
  const licenseLabel = licenseType.charAt(0).toUpperCase() + licenseType.slice(1)

  const subject = `New sale — ${beatTitle} (${licenseLabel}) — ₦${amountPaid.toLocaleString()}`

  const html = `
  <div style="background-color:#0a0a0a; padding:40px 20px; font-family:Arial, sans-serif;">
    <div style="max-width:480px; margin:0 auto; background-color:#141414; border:1px solid #262626; border-radius:12px; overflow:hidden;">
      <div style="padding:28px 32px; border-bottom:1px solid #262626;">
        <p style="color:#C9A84C; font-size:11px; letter-spacing:2px; text-transform:uppercase; margin:0 0 8px;">New Sale</p>
        <h1 style="color:#F5F0E8; font-size:20px; margin:0;">${beatTitle}</h1>
      </div>
      <div style="padding:28px 32px;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="color:#8a8a8a; font-size:13px; padding:6px 0;">License</td>
            <td style="color:#F5F0E8; font-size:13px; padding:6px 0; text-align:right;">${licenseLabel}</td>
          </tr>
          <tr>
            <td style="color:#8a8a8a; font-size:13px; padding:6px 0;">Amount</td>
            <td style="color:#F5F0E8; font-size:13px; padding:6px 0; text-align:right;">₦${amountPaid.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color:#8a8a8a; font-size:13px; padding:6px 0;">Customer</td>
            <td style="color:#F5F0E8; font-size:13px; padding:6px 0; text-align:right;">${customerEmail}</td>
          </tr>
        </table>
        ${licenseType === "exclusive" ? `<p style="color:#C9A84C; font-size:12px; margin:20px 0 0;">This beat has been automatically marked as sold and removed from the store.</p>` : ""}
      </div>
    </div>
  </div>
  `

  return { subject, html }
}