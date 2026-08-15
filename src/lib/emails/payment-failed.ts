type PaymentFailedParams = {
  beatTitle: string
}

export function paymentFailedEmail({ beatTitle }: PaymentFailedParams) {
  const storeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/store`

  const subject = `Your payment didn't go through`

  const html = `
  <div style="background-color:#0a0a0a; padding:40px 20px; font-family:Arial, sans-serif;">
    <div style="max-width:520px; margin:0 auto; background-color:#141414; border:1px solid #262626; border-radius:12px; overflow:hidden;">
      <div style="padding:32px; border-bottom:1px solid #262626;">
        <p style="color:#C9A84C; font-size:11px; letter-spacing:2px; text-transform:uppercase; margin:0 0 8px;">Senior Man KP</p>
        <h1 style="color:#F5F0E8; font-size:22px; margin:0;">Payment didn't go through.</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#c9c9c9; font-size:14px; line-height:1.6; margin:0 0 24px;">
          Your payment for <strong style="color:#F5F0E8;">${beatTitle}</strong> wasn't successful — nothing was charged. This usually happens from a declined card or a connection hiccup mid-checkout.
        </p>
        <a href="${storeUrl}" style="display:block; text-align:center; padding:14px; background:linear-gradient(135deg,#C9A84C,#F5D98B); color:#000; text-decoration:none; font-weight:700; font-size:13px; letter-spacing:1px; text-transform:uppercase; border-radius:6px;">
          Try Again
        </a>
        <p style="color:#666; font-size:12px; line-height:1.6; margin:20px 0 0;">
          Still stuck? Just reply to this email and we'll sort it out.
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