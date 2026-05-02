import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { MapPin, Flag, Droplets, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const waypoints = [
  { km: 0, label: "Start Line", desc: "Gelora Bung Karno, Senayan", icon: "🏁" },
  { km: 5, label: "Checkpoint 1", desc: "Semanggi Interchange", icon: "📍" },
  { km: 10, label: "Checkpoint 2 + Hydration", desc: "Sudirman CBD", icon: "💧" },
  { km: 15, label: "Checkpoint 3", desc: "Bundaran HI", icon: "📍" },
  { km: 18, label: "Final Hydration", desc: "Thamrin Corridor", icon: "💧" },
  { km: 21.1, label: "Finish Line", desc: "Gelora Bung Karno, Senayan", icon: "🏆" },
]

const stats = [
  { icon: <Activity className="size-5 text-primary" />, label: "Total Distance", value: "21.1 km" },
  { icon: <MapPin className="size-5 text-primary" />, label: "Elevation Gain", value: "±62 m" },
  { icon: <Droplets className="size-5 text-primary" />, label: "Hydration Points", value: "4 Stops" },
  { icon: <Flag className="size-5 text-primary" />, label: "Cut-off Time", value: "3.5 Hours" },
]

function fadeUpProps(i: number) {
  return {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" as const },
  }
}

// SVG path data for a stylized loop route
const ROUTE_PATH = "M 60 280 C 80 250, 100 200, 150 180 C 200 160, 260 140, 320 130 C 380 120, 430 125, 470 150 C 510 175, 530 210, 520 250 C 510 290, 480 320, 450 340 C 420 360, 380 365, 340 360 C 300 355, 260 340, 230 320 C 200 300, 180 270, 160 260 C 140 250, 100 260, 80 270 Z"

function AnimatedRoute() {
  const ref = useRef<SVGPathElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto">
      {/* Map background placeholder */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden border border-border"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, oklch(0.16 0.015 260) 0%, oklch(0.1 0.006 260) 100%)",
        }}
      >
        {/* Grid lines to simulate map */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.72 0.19 45)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Road-like base paths */}
        <svg viewBox="0 0 600 400" className="absolute inset-0 w-full h-full">
          {/* Background city roads */}
          <line x1="0" y1="200" x2="600" y2="200" stroke="oklch(0.25 0.01 260)" strokeWidth="12" strokeLinecap="round" />
          <line x1="300" y1="0" x2="300" y2="400" stroke="oklch(0.25 0.01 260)" strokeWidth="12" strokeLinecap="round" />
          <line x1="0" y1="130" x2="600" y2="130" stroke="oklch(0.22 0.01 260)" strokeWidth="8" strokeLinecap="round" />
          <line x1="0" y1="280" x2="600" y2="280" stroke="oklch(0.22 0.01 260)" strokeWidth="8" strokeLinecap="round" />
          <line x1="150" y1="0" x2="150" y2="400" stroke="oklch(0.22 0.01 260)" strokeWidth="8" strokeLinecap="round" />
          <line x1="450" y1="0" x2="450" y2="400" stroke="oklch(0.22 0.01 260)" strokeWidth="8" strokeLinecap="round" />

          {/* Glow effect behind route */}
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="oklch(0.72 0.19 45)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.15"
          />

          {/* Animated route line */}
          <path
            ref={ref}
            d={ROUTE_PATH}
            fill="none"
            stroke="oklch(0.72 0.19 45)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1200"
            strokeDashoffset={inView ? "0" : "1200"}
            style={{
              transition: inView ? "stroke-dashoffset 2.5s cubic-bezier(0.22,1,0.36,1)" : "none",
            }}
          />

          {/* Direction arrows along path */}
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="oklch(0.72 0.19 45)" />
          </marker>

          {/* Waypoint markers */}
          {/* Start */}
          <circle cx="60" cy="280" r="8" fill="oklch(0.72 0.19 45)" stroke="oklch(0.9 0 0)" strokeWidth="2" />
          <text x="70" y="268" fill="oklch(0.97 0 0)" fontSize="10" fontWeight="bold">START</text>

          {/* CP1 */}
          <circle cx="150" cy="180" r="6" fill="oklch(0.6 0.12 220)" stroke="oklch(0.9 0 0)" strokeWidth="2" />
          <text x="158" y="175" fill="oklch(0.97 0 0)" fontSize="9">5km</text>

          {/* CP2 */}
          <circle cx="320" cy="130" r="6" fill="oklch(0.72 0.19 45)" stroke="oklch(0.9 0 0)" strokeWidth="2" />
          <text x="328" y="125" fill="oklch(0.97 0 0)" fontSize="9">10km</text>

          {/* CP3 */}
          <circle cx="470" cy="150" r="6" fill="oklch(0.6 0.12 220)" stroke="oklch(0.9 0 0)" strokeWidth="2" />
          <text x="478" y="145" fill="oklch(0.97 0 0)" fontSize="9">15km</text>

          {/* Hydration */}
          <circle cx="450" cy="340" r="5" fill="oklch(0.6 0.2 200)" stroke="oklch(0.9 0 0)" strokeWidth="2" />
          <text x="460" y="345" fill="oklch(0.97 0 0)" fontSize="9">18km</text>

          {/* Finish */}
          <circle cx="60" cy="280" r="12" fill="none" stroke="oklch(0.72 0.19 45)" strokeWidth="2" strokeDasharray="4 2" />
          <text x="15" y="305" fill="oklch(0.72 0.19 45)" fontSize="10" fontWeight="bold">FINISH</text>
        </svg>

        {/* Map label overlay */}
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground font-mono bg-card/80 px-2 py-1 rounded border border-border">
          Jakarta · 21.1 km Loop
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="text-xs border-primary/40 text-primary bg-primary/10">
            Official Race Route
          </Badge>
        </div>
      </div>
    </div>
  )
}

export function RouteSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="route" className="py-24 px-6 max-w-7xl mx-auto" ref={ref}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 mb-4 uppercase tracking-widest text-xs">
          Race Route
        </Badge>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          The Course
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A scenic 21.1km loop through Jakarta's iconic landmarks — from Senayan to Sudirman, passing Bundaran HI.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-10 items-start">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <AnimatedRoute />
        </motion.div>

        {/* Route details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <Card key={s.label} className="border-border bg-card">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      {s.icon}
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </div>
                    <p className="text-xl font-black">{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Waypoints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Checkpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[22px] top-4 bottom-4 w-px bg-border" />

                  <ul className="space-y-3">
                    {waypoints.map((wp, i) => (
                      <motion.li
                        key={wp.km}
                        {...fadeUpProps(i)}
                        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        className="flex items-start gap-3 pl-1"
                      >
                        <div
                          className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 border border-border"
                          style={{
                            background:
                              i === 0 || i === waypoints.length - 1
                                ? "oklch(0.72 0.19 45 / 0.2)"
                                : "oklch(0.18 0.008 260)",
                          }}
                        >
                          {wp.icon}
                        </div>
                        <div className="pt-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{wp.label}</span>
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0 h-4 border-border text-muted-foreground"
                            >
                              {wp.km} km
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{wp.desc}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
