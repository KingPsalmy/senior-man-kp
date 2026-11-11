import type { ReactNode } from "react"
export default function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <header className="page-intro">
      <div className="container">
        <div>
          {eyebrow && (
            <p className="eyebrow">
              <span />
              {eyebrow}
            </p>
          )}
          <h1>{title}</h1>
          <p className="intro-description">{description}</p>
        </div>
        {children && <div className="intro-aside">{children}</div>}
      </div>
    </header>
  )
}
