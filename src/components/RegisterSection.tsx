import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { User, Mail, Phone, ChevronRight, CircleCheck as CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FormState = "idle" | "submitting" | "success"

export function RegisterSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const [formState, setFormState] = useState<FormState>("idle")
  const [form, setForm] = useState({ name: "", email: "", phone: "", wave: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.wave) return
    setFormState("submitting")
    setTimeout(() => setFormState("success"), 1800)
  }

  return (
    <section id="register" className="py-24 px-6 max-w-7xl mx-auto" ref={ref}>
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 mb-6 uppercase tracking-widest text-xs">
            Registration
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Secure Your<br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, oklch(0.9 0.18 60) 0%, oklch(0.72 0.19 45) 100%)",
              }}
            >
              Spot Now
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Join 5,000 runners on Indonesia's Independence Day — 17 Agustus 2026. Limited slots available. Early registration gets priority corral placement.
          </p>

          <ul className="space-y-3 mb-8">
            {[
              "Secure digital ticket with QR verification",
              "Finisher medal + event T-shirt included",
              "Free virtual entry with physical registration",
              "Timing chip included in all waves",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>

          {/* Urgency */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-sm font-medium text-primary">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Only 1,912 slots remaining across all waves
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Registration Form</CardTitle>
              <CardDescription>Fill in your details to secure your slot</CardDescription>
            </CardHeader>
            <CardContent>
              {formState === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-8 gap-4"
                >
                  <div
                    className="size-16 rounded-full flex items-center justify-center"
                    style={{ background: "oklch(0.72 0.19 45 / 0.15)" }}
                  >
                    <CheckCircle2 className="size-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Registration Received!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check your email for payment instructions and ticket confirmation.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
                    REF: NVM-2025-JKRT-{String(Math.floor(Math.random() * 90000) + 10000)}
                  </Badge>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Budi Santoso"
                        className="pl-9"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="budi@example.com"
                        className="pl-9"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+62 812 0000 0000"
                        className="pl-9"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="wave" className="text-sm font-medium">
                      Select Wave
                    </Label>
                    <Select
                      value={form.wave}
                      onValueChange={(v) => setForm({ ...form, wave: v })}
                      required
                    >
                      <SelectTrigger id="wave" className="w-full">
                        <SelectValue placeholder="Choose your wave..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wave-a">Wave A — Elite (Rp 450.000)</SelectItem>
                        <SelectItem value="wave-b">Wave B — General (Rp 350.000)</SelectItem>
                        <SelectItem value="wave-c">Wave C — Fun Run (Rp 275.000)</SelectItem>
                        <SelectItem value="virtual">Virtual Run (Rp 150.000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-bold text-base h-11"
                    disabled={formState === "submitting"}
                  >
                    {formState === "submitting" ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Register & Secure Ticket
                        <ChevronRight className="size-4" />
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Payment instructions will be sent via email. Slot secured for 24 hours.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
