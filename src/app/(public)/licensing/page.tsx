"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import PageIntro from "@/components/ui/PageIntro"
import { Check, ArrowUpRight, X } from "lucide-react"
import Navbar from "@/components/layout/Navbar"

const licenses = [
  {
    type: "basic",
    name: "Basic License",
    price: "₦30,000",
    popular: false,
    tag: null as string | null,
    features: [
      "MP3 & WAV files",
      "One commercial song",
      "Streaming on all major platforms",
      "YouTube monetization",
      "Social media usage",
      "Live performances",
    ],
    bulkDeal: "Buy 3 Beats, Get 1 FREE" as string | null,
    ctaStyle: "outline",
  },

  {
    type: "premium",
    name: "Premium License",
    price: "₦70,000",
    popular: true,
    tag: "POPULAR" as string | null,
    features: [
      "MP3, WAV & full stems",
      "One commercial song",
      "Streaming & global distribution",
      "Unlimited music videos",
      "Radio broadcasting rights",
      "Online commercial promotion",
      "Live performances",
    ],

    bulkDeal: "Buy 3 Beats, Get 1 Basic Beat FREE" as string | null,
    ctaStyle: "filled",
  },
  {
    type: "unlimited",
    name: "Unlimited License",
    price: "₦120,000",
    popular: false,
    tag: "BEST VALUE" as string | null,
    features: [
      "MP3, WAV & full stems",
      "One commercial song",
      "Streaming & global distribution",
      "Unlimited music videos",
      "Radio & television usage",
      "Commercial advertising usage",
      "Physical distribution",
      "Live performances",
    ],

    bulkDeal: "Buy 3 Beats, Get 1 Unlimited Beat FREE" as string | null,
    ctaStyle: "outline",
  },
  {
    type: "exclusive",
    name: "Exclusive License",
    price: "₦180,000",
    popular: false,
    tag: null as string | null,
    features: [
      "MP3, WAV & full stems",
      "Full commercial exploitation rights",
      "Streaming, video, radio & TV",
      "Film, documentary & advertising",
      "Physical & digital distribution",
      "Beat permanently removed from store",
      "Direct producer access",
      "Beat modifications & collaboration",
    ],

    bulkDeal: "Buy 3 Exclusives, Get 1 Exclusive FREE" as string | null,
    ctaStyle: "gold",
  },
]

const licenseTexts: Record<string, string> = {
  basic: `BASIC LICENSE AGREEMENT
Producer: Senior Man KP

LICENSE TYPE
Non-Exclusive License

RIGHTS GRANTED
Licensee may:
- Receive MP3 and WAV files of the Instrumental.
- Create and commercially release one (1) new Song.
- Monetize the Song on digital streaming platforms.
- Distribute the Song through Spotify, Apple Music, Audiomack, Boomplay, YouTube Music, Deezer, and similar services.
- Upload and monetize the Song on YouTube.
- Use the Song on social media platforms.
- Perform the Song live for commercial and non-commercial purposes.

RESTRICTIONS
Licensee may not:
- Register the Song or Instrumental with YouTube Content ID.
- Register the Song or Instrumental with Meta Rights Manager.
- Register the Song or Instrumental with TikTok Rights Management.
- Register the Song or Instrumental with any automated fingerprinting or copyright-claiming system.
- Use the Song in television, film, gaming, or advertising productions.
- Claim ownership of the Instrumental.
- Resell, sublicense, lease, transfer, or redistribute the Instrumental.

OWNERSHIP
Senior Man KP retains 100% ownership of the Instrumental.
Licensee retains ownership of their original lyrics and vocal performance embodied in the Song.

TERM
Ten (10) years from the date of purchase.`,

  premium: `PREMIUM LICENSE AGREEMENT
Producer: Senior Man KP

LICENSE TYPE
Non-Exclusive License

RIGHTS GRANTED
Licensee may:
- Receive MP3, WAV, and Stem files.
- Create and commercially release one (1) new Song.
- Monetize the Song worldwide.
- Distribute the Song through all major digital streaming platforms.
- Create and monetize unlimited music videos.
- Broadcast the Song on radio stations.
- Use the Song for online commercial promotional campaigns.
- Perform the Song live without limitation.

RESTRICTIONS
Licensee may not:
- Register the Song or Instrumental with YouTube Content ID.
- Register the Song or Instrumental with Meta Rights Manager.
- Register the Song or Instrumental with TikTok Rights Management.
- Register the Song or Instrumental with any automated copyright-claiming system.
- Claim ownership of the Instrumental.
- Resell, sublicense, lease, transfer, or redistribute the Instrumental.

OWNERSHIP
Senior Man KP retains 100% ownership of the Instrumental.
Licensee retains ownership of their original lyrics and vocal performance embodied in the Song.

TERM
Ten (10) years from the date of purchase.`,

  unlimited: `UNLIMITED LICENSE AGREEMENT
Producer: Senior Man KP

LICENSE TYPE
Non-Exclusive Unlimited License

RIGHTS GRANTED
Licensee may:
- Receive MP3, WAV, and Stem files.
- Create and commercially release one (1) new Song.
- Monetize the Song worldwide.
- Distribute the Song through all major digital streaming platforms.
- Create and monetize unlimited music videos.
- Broadcast the Song through radio and television outlets.
- Use the Song in commercial advertising campaigns.
- Manufacture and distribute physical copies of the Song.
- Perform the Song live without limitation.
- Use the Song for commercial promotional purposes.

NON-EXCLUSIVE NATURE
Licensee acknowledges that this is a non-exclusive license. Senior Man KP reserves the unrestricted right to continue licensing the Instrumental to additional parties. No exclusivity is granted under this Agreement.

RESTRICTIONS
Licensee may not:
- Register the Song or Instrumental with YouTube Content ID.
- Register the Song or Instrumental with Meta Rights Manager.
- Register the Song or Instrumental with TikTok Rights Management.
- Register the Song or Instrumental with any automated copyright-claiming system.
- Claim ownership of the Instrumental.
- Resell, sublicense, lease, transfer, or redistribute the Instrumental.
- Use the Song in major motion pictures, television network productions, or national advertising campaigns without obtaining an Exclusive License or prior written approval from Senior Man KP.

OWNERSHIP
Senior Man KP retains 100% ownership of the Instrumental.
Licensee retains ownership of their original lyrics and vocal performance embodied in the Song.

TERM
Ten (10) years from the date of purchase.`,

  exclusive: `EXCLUSIVE LICENSE AGREEMENT
Producer: Senior Man KP

LICENSE TYPE
Exclusive License

RIGHTS GRANTED
Licensee may:
- Receive MP3, WAV, and Stem files.
- Create and commercially release one (1) new Song.
- Monetize the Song worldwide.
- Distribute the Song through all digital streaming platforms.
- Create and monetize unlimited music videos.
- Broadcast the Song through radio and television outlets.
- Use the Song in commercial advertising campaigns.
- Use the Song in film, television, documentary, and audiovisual productions.
- Use the Song in major motion pictures, television network productions, and national advertising campaigns.
- Manufacture and distribute physical copies of the Song.
- Perform the Song live without limitation.
- Monetize the Song through all currently existing and future media formats.

EXCLUSIVITY
Following execution of this Agreement, Senior Man KP shall cease offering the Instrumental for future sale or licensing. The Instrumental shall be removed from public sale within a reasonable period following purchase. No future licenses shall be issued after the effective date of this Agreement.

PRIOR LICENSES
Licensee acknowledges that any licenses issued before the execution of this Agreement shall remain valid and enforceable. Nothing in this Agreement revokes rights previously granted to earlier purchasers.

OWNERSHIP
Senior Man KP retains ownership of the underlying musical composition and authorship of the Instrumental unless otherwise agreed in writing. Licensee receives exclusive commercial exploitation rights as granted under this Agreement.

PUBLISHING
Unless otherwise agreed in writing:
- Senior Man KP shall retain fifty percent (50%) of the writers and publishing share attributable to the Instrumental.
- Licensee shall retain fifty percent (50%) of the writers and publishing share attributable to the Song.

CONTENT ID
Licensee may register the Song with YouTube Content ID, Meta Rights Manager, TikTok Rights Management, and similar systems, provided such registration does not interfere with the legitimate rights of previous license holders.

TERM
Perpetual (Lifetime).

BREACH
Any violation of this Agreement immediately terminates all rights granted herein. Any continued use following termination constitutes copyright infringement.

GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.`,
}

function Agreement({ type, onClose }: { type: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = dialog.current
    d?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      d?.close()
      document.body.style.overflow = overflow
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      className="kp-dialog agreement-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose()
      }}
      aria-labelledby="agreement-title"
    >
      <div className="dialog-top">
        <h2 id="agreement-title">{type} license agreement</h2>
        <button
          className="icon-button"
          aria-label="Close agreement"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      <pre>{licenseTexts[type]}</pre>
    </dialog>
  )
}
export default function LicensingPage() {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <main>
      <Navbar />
      <PageIntro
        title="Your sound Your license"
        description="From a first release to an exclusive record Compare your options and read the full terms before you buy"
      />
      <section className="container section licensing-content">
        <div className="plans-grid">
          {licenses.map((plan, i) => (
            <article
              className={"plan-card " + (plan.popular ? "recommended" : "")}
              key={plan.type}
            >
              <div className="plan-top">
                <span className="eyebrow">
                  0{i + 1} / {plan.type}
                </span>
                {plan.popular && (
                  <span className="plan-badge">Artist favorite</span>
                )}
              </div>
              <h2>{plan.name.replace(" License", "")}</h2>
              <p className="plan-price">
                {plan.price}
                <small>standard price / beat</small>
              </p>
              <p className="plan-caption">
                {
                  [
                    "Start your next release",
                    "Make room for your sound",
                    "Take your music further",
                    "Make this one yours",
                  ][i]
                }
              </p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/beatstore/beats"
                className={
                  "button full-width " + (plan.popular ? "primary" : "")
                }
              >
                Find your beat
                <ArrowUpRight size={16} />
              </Link>
              <button
                className="text-link"
                onClick={() => setSelected(plan.type)}
              >
                Read full agreement
                <ArrowUpRight size={14} />
              </button>
            </article>
          ))}
        </div>
        <p className="muted pricing-note">
          Prices may vary by beat Your selected beat’s price is shown before
          checkout The full license agreement defines your usage rights
        </p>
        <div className="bundle-banner">
          <div>
            <span className="eyebrow">A little more room to create</span>
            <h2>Three beats One less to pay for</h2>
            <p>
              Add 3 beats in the same license tier The lowest-priced beat is
              free, automatically
            </p>
          </div>
          <Link className="button primary" href="/beatstore/beats">
            Build your bundle
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      {selected && (
        <Agreement type={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  )
}
