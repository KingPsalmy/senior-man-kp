import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import PageIntro from "@/components/ui/PageIntro"
import { ArrowUpRight, Plus } from "lucide-react"
const questions = [
  [
    "Getting started",
    "Do I need an account?",
    "No You can explore, preview, save beats, and build a cart without an account At checkout, enter the email address where you want to receive your receipt and download link",
  ],
  [
    "Getting started",
    "How do I buy a beat?",
    "Choose a beat, select a license, and add it to your cart Enter your details at checkout and complete payment through Paystack Once payment is verified, your downloads become available",
  ],
  [
    "Licensing",
    "Which license should I choose?",
    "Basic covers a standard release; Premium and Unlimited offer additional usage rights and stems Exclusive removes the beat from sale Compare the full agreements on the Licensing page before choosing",
  ],
  [
    "Licensing",
    "How does the bundle offer work?",
    "For every three beats in the same license tier, the lowest-priced eligible beat is free The saving is calculated automatically in your cart",
  ],
  [
    "Licensing",
    "Can I upgrade my license later?",
    "Open My Downloads and use Request a license upgrade on an eligible purchase If the beat has been sold exclusively, an upgrade may no longer be available",
  ],
  [
    "Your purchase",
    "How do I get my files?",
    "After verified payment, open My Downloads from the confirmation page or your receipt email Your receipt link opens your purchase without an account If you have an older receipt, enter its checkout email and payment reference",
  ],
  [
    "Your purchase",
    "Can I download my beats again?",
    "Yes Keep your receipt email and use its link to return to your purchase Individual file links expire for security; use Refresh file links to generate new ones",
  ],
  [
    "Your purchase",
    "My payment went through but I can’t find my downloads",
    "Check your spam folder and confirm you are using the email from checkout Keep your payment reference and contact us if the order is still missing Avoid making another payment for the same order while it is being checked",
  ],
  [
    "Your purchase",
    "What if my beat is later sold exclusively?",
    "Your existing license remains valid Exclusive sales stop new purchases of that beat; they do not revoke licenses already purchased",
  ],
  [
    "Your purchase",
    "Can I get a refund?",
    "Digital beat sales are generally final If there is a problem with your payment or files, contact support with your payment reference so we can help See the store’s Terms & Conditions",
  ],
  [
    "Working together",
    "Do you offer custom production?",
    "Yes Use the Contact page to discuss your sound, project, and what you need",
  ],
]
export default function FAQPage() {
  return (
    <main>
      <Navbar />
      <PageIntro
        eyebrow="A little clarity"
        title="Before you hit record"
        description="Straight answers about licenses, payments, and your files"
      />
      <div className="container section faq-layout">
        <aside>
          <span className="eyebrow">Quick navigation</span>
          <nav>
            {[
              "Getting started",
              "Licensing",
              "Your purchase",
              "Working together",
            ].map((group, i) => (
              <a key={group} href={"#faq-" + i}>
                {group}
                <ArrowUpRight size={15} />
              </a>
            ))}
          </nav>
          <div className="surface-panel">
            <h3>Still have a question?</h3>
            <p className="muted">Let’s figure it out together</p>
            <Link className="text-link" href="/contact">
              Get in touch
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
        <section>
          {[
            "Getting started",
            "Licensing",
            "Your purchase",
            "Working together",
          ].map((group, i) => (
            <div className="faq-group" id={"faq-" + i} key={group}>
              <h2>{group}</h2>
              {questions
                .filter((q) => q[0] === group)
                .map((q) => (
                  <details className="faq-item" key={q[1]}>
                    <summary>
                      {q[1]}
                      <Plus size={18} />
                    </summary>
                    <p>{q[2]}</p>
                  </details>
                ))}
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
