type ExclusiveSoldNoticeParams = {
  beatTitle: string
}

export function exclusiveSoldNoticeEmail({ beatTitle }: ExclusiveSoldNoticeParams) {
  const storeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/store`

  const subject = `${beatTitle} just sold exclusively`

  const html = `
  <div style="background-color:#0a0a0a; padding:40px 20px; font-family:Arial, sans-serif;">
    <div style="max-width:520px; margin:0 auto; background-color:#141414; border:1px solid #262626; border-radius:12px; overflow:hidden;">
      <div style="padding:32px; border-bottom:1px solid #262626;">
        <p style="color:#C9A84C; font-size:11px; letter-spacing:2px; text-transform:uppercase; margin:0 0 8px;">Senior Man KP</p>
        <h1 style="color:#F5F0E8; font-size:22px; margin:0;">Heads up.</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#c9c9c9; font-size:14px; line-height:1.6; margin:0 0 16px;">
          <strong style="color:#F5F0E8;">${beatTitle}</strong> just sold as an exclusive license, so it's now retired from the store.
        </p>
        <p style="color:#c9c9c9; font-size:14px; line-height:1.6; margin:0 0 24px;">
          Your license is unaffected — everything you're entitled to still stands. Just didn't want you to be surprised if you went looking for it.
        </p>
        <a href="${storeUrl}" style="display:block; text-align:center; padding:14px; background:linear-gradient(135deg,#C9A84C,#F5D98B); color:#000; text-decoration:none; font-weight:700; font-size:13px; letter-spacing:1px; text-transform:uppercase; border-radius:6px;">
          Browse More Beats
        </a>
      </div>
      <div style="padding:20px 32px; border-top:1px solid #262626;">
        <p style="color:#555; font-size:11px; margin:0;">© ${new Date().getFullYear()} Senior Man KP. All rights reserved.</p>
      </div>
    </div>
  </div>
  `

  return { subject, html }
}