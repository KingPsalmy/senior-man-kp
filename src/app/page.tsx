import type { Metadata } from "next"
import StageEntrance from "@/components/entrance/StageEntrance"
export const metadata: Metadata = {
  title: "Senior Man KP",
  description: "Step into the world of Senior Man KP",
  openGraph: { title: "Senior Man KP", description: "Step into the world of Senior Man KP" },
}
export default function HomePage() { return <StageEntrance /> }
