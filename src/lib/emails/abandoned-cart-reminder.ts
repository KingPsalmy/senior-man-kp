type CartItem = {
  title: string
  license_type: string
  price: number
}

type AbandonedCartReminderParams = {
  items: CartItem[]
  total: number
}

export function abandonedCartReminderEmail({ items, total }: AbandonedCartReminderParams) {
  const checkoutUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`

  const subject = items.length === 1
    ? `You left ${items[0].title} in your cart`
    : `You left ${items.length} beats in your cart`

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="color:#F5F0E8; font-size:13px; padding:8px 0;">${item.title}</td>
      <td style="color:#8a8a8a; font-size:12px; padding:8px 0; text-transform:uppercase;">${item.license_type}</td>
      <td style="color:#F5F0E8; font-size:13px; padding:8px 0; text-align:right;">₦${item.price.toLocaleString()}</td>
    </tr>
  `).join("")

  const html = `
  <div style="background-color:#0a0a0a; padding:40px 20px; font-family:Arial, sans-serif;">
    <div style="max-width:520px; margin:0 auto; background-color:#141414; border:1px solid #262626; border-radius:12px; overflow:hidden;">
      <div style="padding:32px; border-bottom:1px solid #262626;">
        <p style="color:#C9A84C; font-size:11px; letter-spacing:2px; text-transform:uppercase; margin:0 0 8px;">Senior Man KP</p>
        <h1 style="color:#F5F0E8; font-size:22px; margin:0;">Still thinking it over?</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#c9c9c9; font-size:14px; line-height:1.6; margin:0 0 24px;">
          Your beats are still sitting in your cart, ready whenever you are.
        </p>
        <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
          ${itemsHtml}
        </table>
        <p style="color:#C9A84C; font-size:16px; font-weight:700; margin:0 0 24px; text-align:right;">
          Total: ₦${total.toLocaleString()}
        </p>
        <a href="${checkoutUrl}" style="display:block; text-align:center; padding:14px; background:linear-gradient(135deg,#C9A84C,#F5D98B); color:#000; text-decoration:none; font-weight:700; font-size:13px; letter-spacing:1px; text-transform:uppercase; border-radius:6px;">
          Complete Your Order
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