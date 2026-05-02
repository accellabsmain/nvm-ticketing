import { Navbar } from "@/components/Navbar"
import { HeroSection } from "@/components/HeroSection"
import { RouteSection } from "@/components/RouteSection"
import { TicketingSection } from "@/components/TicketingSection"
import { VirtualRunSection } from "@/components/VirtualRunSection"
import { RegisterSection } from "@/components/RegisterSection"
import { Footer } from "@/components/Footer"

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <RouteSection />
        <TicketingSection />
        <VirtualRunSection />
        <RegisterSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
