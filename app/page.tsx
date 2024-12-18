import { PhoneLookup } from '@/components/phone-lookup'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Phone Identifier</h1>
          <ThemeToggle />
        </header>
        <main>
          <PhoneLookup />
        </main>
      </div>
    </div>
  )
}

