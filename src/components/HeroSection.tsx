import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { ChevronDown, MapPin, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const EVENT_DATE = new Date("2026-08-17T05:00:00+07:00")

function getTimeLeft() {
  const now = new Date()
  const diff = EVENT_DATE.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden">
          <motion.span
            key={value}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-2xl sm:text-3xl md:text-5xl font-black tabular-nums text-foreground"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
          {/* Glow */}
          <div className="absolute inset-0 bg-primary/5 rounded-xl" />
        </div>
        {/* Corner accent */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary rounded-tl-md" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary rounded-br-md" />
      </div>
      <span className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function fadeUpProps(i: number) {
  return {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" as const },
  }
}

export function HeroSection() {
  const [time, setTime] = useState(getTimeLeft())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTime(getTimeLeft())
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-marathon.webp"
          alt="NVM Run Marathon"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
      </div>

      {/* Animated grid lines */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.72 0.19 45 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.19 45 / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-28 pb-20">
        {/* Badge */}
        <motion.div
          {...fadeUpProps(0)}
          className="flex justify-center mb-6"
        >
          <Badge
            variant="outline"
            className="border-primary/50 text-primary bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest"
          >
            Indonesia's Premier Half Marathon 2025
          </Badge>
        </motion.div>

        {/* Title */}
        <motion.h1
          {...fadeUpProps(1)}
          className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none mb-2"
        >
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, oklch(0.9 0.18 60) 0%, oklch(0.72 0.19 45) 50%, oklch(0.6 0.22 35) 100%)",
            }}
          >
            NVM
          </span>
          <span className="text-foreground"> RUN</span>
        </motion.h1>

        <motion.p
          {...fadeUpProps(2)}
          className="text-lg sm:text-xl md:text-2xl text-white/90 mb-4 tracking-wide"
        >
          21.1 KM · HALF MARATHON
        </motion.p>

        {/* Meta info */}
        <motion.div
          {...fadeUpProps(3)}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 text-sm text-white/90"
        >
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4 text-primary" />
            17 Agustus 2026
          </span>
          <span className="hidden sm:block w-px h-4 bg-border" />
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" />
            Jakarta, Indonesia
          </span>
          <span className="hidden sm:block w-px h-4 bg-border" />
          <span className="flex items-center gap-1.5">
            <Users className="size-4 text-primary" />
            5,000 Runners
          </span>
        </motion.div>

        {/* Countdown */}
        <motion.div
          {...fadeUpProps(4)}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white mb-6">
            Event Starts In
          </p>
          <div className="flex items-start justify-center gap-2 sm:gap-4 md:gap-6">
            <CountdownUnit value={time.days} label="Days" />
            <span className="text-2xl sm:text-3xl md:text-5xl font-black text-primary mt-3 sm:mt-4 md:mt-6 select-none">:</span>
            <CountdownUnit value={time.hours} label="Hours" />
            <span className="text-2xl sm:text-3xl md:text-5xl font-black text-primary mt-3 sm:mt-4 md:mt-6 select-none">:</span>
            <CountdownUnit value={time.minutes} label="Minutes" />
            <span className="text-2xl sm:text-3xl md:text-5xl font-black text-primary mt-3 sm:mt-4 md:mt-6 select-none">:</span>
            <CountdownUnit value={time.seconds} label="Seconds" />
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          {...fadeUpProps(5)}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" className="text-base font-bold px-10 shadow-lg shadow-primary/25" asChild>
            <a href="#register">
              Register Now
            </a>
          </Button>
          <Button size="lg" variant="outline" className="text-base font-medium px-10" asChild>
            <a href="#route">View Route</a>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#route"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
        <ChevronDown className="size-4" />
      </motion.a>
    </section>
  )
}
