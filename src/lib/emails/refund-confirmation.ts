type RefundConfirmationParams = {
  beatTitle: string
  amountRefunded: number
}

export function refundConfirmationEmail({ beatTitle, amountRefunded }: RefundConfirmationParams) {
  const subject = `Your refund for ${beatTitle} is confirmed`

  const html = `
  <div style="background-color:#0a0a0a; padding:40px 20px; font-family:Arial, sans-serif;">
    <div style="max-width:520px; margin:0 auto; background-color:#141414; border:1px solid #262626; border-radius:12px; overflow:hidden;">
      <div style="padding:32px; border-bottom:1px solid #262626;">
        <p style="color:#C9A84C; font-size:11px; letter-spacing:2px; text-transform:uppercase; margin:0 0 8px;">Senior Man KP</p>
        <h1 style="color:#F5F0E8; font-size:22px; margin:0;">Refund confirmed.</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#c9c9c9; font-size:14px; line-height:1.6; margin:0 0 24px;">
          Your refund of <strong style="color:#F5F0E8;">₦${amountRefunded.toLocaleString()}</strong> for <strong style="color:#F5F0E8;">${beatTitle}</strong> has been processed. It should reflect on your original payment method within a few business days, depending on your bank.
        </p>
        <p style="color:#666; font-size:12px; line-height:1.6; margin:0;">
          Questions about the refund? Just reply to this email.
        </p>
      </div>
      <div style="padding:20px 32px; border-top:1px solid #262626;">
        <p style="color:#555; font-size:11px; margin:0;">© ${new Date().getFullYear()} Senior Man KP. All rights reserved.</p>
      </div>
    </div>
  </div>
  `

  return { subject, html }
}