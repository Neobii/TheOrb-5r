import dynamic from "next/dynamic"
import { Suspense } from "react"

const Cube = dynamic(() => import("@/components/Globe"), { ssr: false })

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <Suspense fallback={<div>Loading...</div>}>
        <Cube />
      </Suspense>
    </main>
  )
}
