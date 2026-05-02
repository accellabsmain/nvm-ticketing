import { motion } from "framer-motion"
import { Globe, Hash, Play, Radio } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const socials = [
  { icon: <Globe className="size-4" />, href: "#", label: "Instagram" },
  { icon: <Hash className="size-4" />, href: "#", label: "Twitter" },
  { icon: <Radio className="size-4" />, href: "#", label: "Facebook" },
  { icon: <Play className="size-4" />, href: "#", label: "YouTube" },
]

const links = [
  { label: "About", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms", href: "#" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary font-black text-2xl tracking-tight">NVM</span>
              <span className="text-foreground font-black text-2xl tracking-tight">RUN</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Indonesia's premier half marathon event. 21.1km through the heart of Jakarta on Independence Day 2025.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Quick Links</p>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Contact</p>
            <p className="text-sm text-muted-foreground">info@nvmrun.id</p>
            <p className="text-sm text-muted-foreground mt-1">+62 21 0000 0000</p>
            <div className="flex items-center gap-3 mt-4">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2025 NVM RUN. All rights reserved.</p>
          <p>17 Agustus 2026 · Gelora Bung Karno, Jakarta</p>
        </div>
      </div>
    </footer>
  )
}
