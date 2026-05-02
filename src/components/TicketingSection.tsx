import { useState, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Shield, QrCode, CircleCheck as CheckCircle2, Circle as XCircle, Scan, Lock, Hash, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const DUMMY_VALID_CODE = "NVM-2025-JKRT-00842"

type VerifyStatus = "idle" | "loading" | "valid" | "invalid"

const ticketCategories = [
  {
    name: "Wave A — Elite",
    price: "Rp 450.000",
    color: "oklch(0.72 0.19 45)",
    perks: ["Front Start Corral", "Timing Chip Included", "Finisher Medal + Tee", "Priority Hydration"],
    slots: 200,
    remaining: 42,
  },
  {
    name: "Wave B — General",
    price: "Rp 350.000",
    color: "oklch(0.6 0.12 220)",
    perks: ["General Start Corral", "Timing Chip Included", "Finisher Medal + Tee", "Hydration Stations"],
    slots: 3000,
    remaining: 1230,
    highlight: true,
  },
  {
    name: "Wave C — Fun Run",
    price: "Rp 275.000",
    color: "oklch(0.65 0.15 160)",
    perks: ["Rear Start Corral", "Basic Timing", "Finisher Tee", "Hydration Stations"],
    slots: 1800,
    remaining: 640,
  },
]

const steps = [
  { icon: <QrCode className="size-5" />, title: "Scan QR", desc: "Each ticket has a unique cryptographic QR code" },
  { icon: <Lock className="size-5" />, title: "Validate Hash", desc: "Server checks HMAC-SHA256 signature" },
  { icon: <Hash className="size-5" />, title: "Check Registry", desc: "Cross-reference with registration database" },
  { icon: <CheckCircle2 className="size-5" />, title: "Entry Granted", desc: "One-time use — marked as used instantly" },
]

function TicketCard({ cat, index }: { cat: typeof ticketCategories[0]; index: number }) {
  const pct = Math.round((cat.remaining / cat.slots) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: "easeOut" }}
    >
      <Card
        className="relative border overflow-hidden h-full"
        style={{
          borderColor: cat.highlight ? cat.color : "oklch(0.22 0.01 260)",
          background: cat.highlight ? `oklch(0.12 0.01 260)` : "oklch(0.1 0.006 260)",
        }}
      >
        {cat.highlight && (
          <div className="absolute top-3 right-3">
            <Badge className="text-xs font-bold" style={{ background: cat.color, color: "oklch(0.1 0 0)" }}>
              Most Popular
            </Badge>
          </div>
        )}
        {/* Color accent bar */}
        <div className="h-1 w-full" style={{ background: cat.color }} />

        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">{cat.name}</CardTitle>
          <CardDescription className="text-2xl font-black" style={{ color: cat.color }}>
            {cat.price}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <ul className="space-y-1.5">
            {cat.perks.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-3.5 shrink-0" style={{ color: cat.color }} />
                {p}
              </li>
            ))}
          </ul>

          {/* Availability bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Slots Available</span>
              <span className="font-medium" style={{ color: pct < 30 ? "oklch(0.577 0.245 27.325)" : cat.color }}>
                {cat.remaining} / {cat.slots}
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: cat.color }}
              />
            </div>
          </div>

          <Button
            className="w-full font-semibold"
            variant={cat.highlight ? "default" : "outline"}
            asChild
          >
            <a href="#register">Get Ticket</a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TicketVerifier() {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<VerifyStatus>("idle")
  const [result, setResult] = useState<{ name?: string; bib?: string; wave?: string } | null>(null)

  const handleVerify = () => {
    if (!code.trim()) return
    setStatus("loading")
    setResult(null)

    setTimeout(() => {
      const normalized = code.trim().toUpperCase()
      if (normalized === DUMMY_VALID_CODE) {
        setStatus("valid")
        setResult({ name: "Budi Santoso", bib: "#00842", wave: "Wave B — General" })
      } else {
        setStatus("invalid")
      }
    }, 1600)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="size-5 text-primary" />
          <CardTitle className="text-base">Ticket Verifier Demo</CardTitle>
        </div>
        <CardDescription>
          Simulate our secure ticket verification. Try code:{" "}
          <code className="text-primary text-xs font-mono bg-primary/10 px-1.5 py-0.5 rounded">
            NVM-2025-JKRT-00842
          </code>
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter ticket code or scan QR..."
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setStatus("idle")
            }}
            className="font-mono text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
          <Button onClick={handleVerify} disabled={status === "loading" || !code.trim()}>
            {status === "loading" ? (
              <Scan className="size-4 animate-spin" />
            ) : (
              <Scan className="size-4" />
            )}
            <span className="ml-1">Verify</span>
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border"
            >
              <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <div>
                <p className="text-sm font-medium">Validating signature...</p>
                <p className="text-xs text-muted-foreground">Checking HMAC-SHA256 + registry</p>
              </div>
            </motion.div>
          )}

          {status === "valid" && result && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="p-4 rounded-lg border bg-card"
              style={{ borderColor: "oklch(0.65 0.2 145)" }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-8 text-green-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-sm text-green-400">Ticket Valid</p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Runner</span>
                      <span className="font-medium text-foreground">{result.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bib Number</span>
                      <span className="font-medium text-foreground">{result.bib}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wave</span>
                      <span className="font-medium text-foreground">{result.wave}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status</span>
                      <Badge className="text-xs h-4 bg-green-500/20 text-green-400 border-green-500/30">
                        NOT YET USED
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {status === "invalid" && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="p-4 rounded-lg border border-destructive/40 bg-destructive/10"
            >
              <div className="flex items-start gap-3">
                <XCircle className="size-8 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-destructive">Invalid Ticket</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ticket not found or signature mismatch. This may be a counterfeit ticket.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security steps */}
        <div className="pt-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="size-3.5" /> Verification Pipeline
          </p>
          <div className="grid grid-cols-2 gap-2">
            {steps.map((s) => (
              <div key={s.title} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                <div
                  className="size-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: "oklch(0.72 0.19 45 / 0.15)" }}
                >
                  <span className="text-primary">{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TicketingSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section id="ticketing" className="py-24 px-6 max-w-7xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 mb-4 uppercase tracking-widest text-xs">
          Secure Ticketing
        </Badge>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Your Race Ticket
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Anti-counterfeit tickets secured by cryptographic verification. Each ticket is unique, traceable, and one-time-use.
        </p>
      </motion.div>

      {/* Ticket categories */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {ticketCategories.map((cat, i) => (
          <TicketCard key={cat.name} cat={cat} index={i} />
        ))}
      </div>

      {/* Verifier demo */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        <TicketVerifier />
      </motion.div>
    </section>
  )
}
