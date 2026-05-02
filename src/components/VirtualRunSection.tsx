import { useState, useRef, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Activity, Navigation, Timer, Zap, Trophy, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

const TOTAL_DISTANCE = 21.1

// Simulated split data
const SPLITS = [
  { km: 1, pace: "5:42", hr: 142 }, { km: 2, pace: "5:38", hr: 148 },
  { km: 3, pace: "5:35", hr: 152 }, { km: 4, pace: "5:40", hr: 155 },
  { km: 5, pace: "5:32", hr: 158 }, { km: 6, pace: "5:29", hr: 161 },
  { km: 7, pace: "5:45", hr: 159 }, { km: 8, pace: "5:50", hr: 163 },
  { km: 9, pace: "5:38", hr: 165 }, { km: 10, pace: "5:33", hr: 167 },
]

const features = [
  {
    icon: <Activity className="size-5 text-primary" />,
    title: "Real-Time Pace",
    desc: "Live pace calculation using GPS data with rolling average over last 500m.",
  },
  {
    icon: <Navigation className="size-5 text-primary" />,
    title: "GPS Distance",
    desc: "Accurate distance tracking via browser Geolocation API with elevation correction.",
  },
  {
    icon: <Timer className="size-5 text-primary" />,
    title: "Split Tracking",
    desc: "Auto-capture every 1km split with timestamp, pace, and heart rate zone.",
  },
  {
    icon: <Zap className="size-5 text-primary" />,
    title: "Pace Zones",
    desc: "Color-coded pace zones: Green (easy), Amber (tempo), Red (race effort).",
  },
  {
    icon: <TrendingUp className="size-5 text-primary" />,
    title: "Elevation Profile",
    desc: "Real-time elevation data synced with barometric or GPS altitude.",
  },
  {
    icon: <Trophy className="size-5 text-primary" />,
    title: "Leaderboard Sync",
    desc: "Upload your run data to the NVM RUN virtual leaderboard after completion.",
  },
]

function PaceGauge({ pace }: { pace: number }) {
  // pace in sec/km, display as mm:ss
  const mins = Math.floor(pace / 60)
  const secs = Math.floor(pace % 60)
  const paceStr = `${mins}:${String(secs).padStart(2, "0")}`

  // Zone color
  const color =
    pace < 330 ? "oklch(0.65 0.2 145)" // fast - green
      : pace < 390 ? "oklch(0.72 0.19 45)" // medium - orange
        : "oklch(0.65 0.22 35)" // slow - red-orange

  const zone = pace < 330 ? "Race Pace" : pace < 390 ? "Tempo" : "Easy"
  const pct = Math.max(0, Math.min(100, ((480 - pace) / (480 - 270)) * 100))

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Arc gauge */}
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="38" fill="none" stroke="oklch(0.22 0.01 260)" strokeWidth="8" strokeDasharray="190" strokeDashoffset="0" strokeLinecap="round" />
          <circle
            cx="50" cy="50" r="38" fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray="190"
            strokeDashoffset={190 - (190 * pct) / 100}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black leading-none">{paceStr}</span>
          <span className="text-xs text-muted-foreground">min/km</span>
        </div>
      </div>
      <Badge
        variant="outline"
        className="text-xs font-semibold"
        style={{ borderColor: color, color }}
      >
        {zone}
      </Badge>
    </div>
  )
}

function SplitBar({ split, maxPace }: { split: typeof SPLITS[0]; maxPace: number }) {
  const paceSeconds = parseInt(split.pace.split(":")[0]) * 60 + parseInt(split.pace.split(":")[1])
  const pct = (paceSeconds / maxPace) * 100
  const isGood = paceSeconds < 345

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-muted-foreground text-right font-mono">{split.km}km</span>
      <div className="flex-1 h-4 bg-muted rounded-sm overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-sm"
          style={{
            background: isGood ? "oklch(0.65 0.2 145)" : "oklch(0.72 0.19 45)",
          }}
        />
      </div>
      <span className="w-10 font-mono font-medium">{split.pace}</span>
      <span className="w-8 text-muted-foreground font-mono">{split.hr}</span>
    </div>
  )
}

function VirtualTracker() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [distance, setDistance] = useState(0)
  const [pace, setPace] = useState(342) // ~5:42 in seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1)
        setDistance((d) => {
          const next = d + 0.0028 + (Math.random() - 0.5) * 0.0006
          return Math.min(next, TOTAL_DISTANCE)
        })
        setPace((p) => {
          const drift = (Math.random() - 0.5) * 4
          return Math.max(295, Math.min(420, p + drift))
        })
      }, 200)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const reset = () => {
    setRunning(false)
    setElapsed(0)
    setDistance(0)
    setPace(342)
  }

  const h = Math.floor(elapsed / 18000)
  const m = Math.floor((elapsed % 18000) / 300)
  const s = Math.floor((elapsed % 300) / 5)
  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  const pct = (distance / TOTAL_DISTANCE) * 100

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            Virtual Run Tracker
          </CardTitle>
          {running && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="flex items-center gap-1.5"
            >
              <div className="size-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-400 font-medium">LIVE</span>
            </motion.div>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 space-y-4">
        {/* Main stats */}
        <div className="grid grid-cols-3 gap-3">
          {/* Timer */}
          <div className="flex flex-col items-center p-3 rounded-xl bg-muted/60 border border-border">
            <Timer className="size-4 text-muted-foreground mb-1" />
            <span className="text-2xl font-black font-mono tabular-nums">{timeStr}</span>
            <span className="text-xs text-muted-foreground">Time</span>
          </div>

          {/* Distance */}
          <div className="flex flex-col items-center p-3 rounded-xl bg-muted/60 border border-border">
            <Navigation className="size-4 text-muted-foreground mb-1" />
            <span className="text-2xl font-black tabular-nums">{distance.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">km</span>
          </div>

          {/* Pace gauge */}
          <PaceGauge pace={pace} />
        </div>

        {/* Distance progress */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span className="font-medium text-foreground">{pct.toFixed(1)}% of {TOTAL_DISTANCE}km</span>
          </div>
          <div className="relative">
            <Progress value={pct} className="h-2" />
            <AnimatePresence>
              {pct > 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${pct}%` }}
                >
                  <div className="size-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                    <div className="size-1.5 rounded-full bg-primary" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Start</span>
            <span>21.1 km</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            className="flex-1 font-bold"
            onClick={() => setRunning(!running)}
            variant={running ? "outline" : "default"}
          >
            {running ? (
              <><Pause className="size-4 mr-1" /> Pause</>
            ) : (
              <><Play className="size-4 mr-1" /> {elapsed === 0 ? "Start Run" : "Resume"}</>
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={reset}>
            <RotateCcw className="size-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Demo simulation — real app uses GPS + device sensors
        </p>
      </CardContent>
    </Card>
  )
}

export function VirtualRunSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const maxPace = Math.max(...SPLITS.map((s) => parseInt(s.pace.split(":")[0]) * 60 + parseInt(s.pace.split(":")[1])))

  return (
    <section id="virtual" className="py-24 px-6 max-w-7xl mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 mb-4 uppercase tracking-widest text-xs">
          Virtual Run
        </Badge>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Run Anywhere, Track Everything
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Can't make it in-person? Join the virtual division — run your 21.1km anywhere in the world and track your performance in real time.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Tracker demo */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <VirtualTracker />

          {/* Split analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6"
          >
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="size-4" /> Sample Split Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 font-mono">
                  <span className="w-8 text-right">km</span>
                  <span className="flex-1">pace bar</span>
                  <span className="w-10">pace</span>
                  <span className="w-8">bpm</span>
                </div>
                <div className="space-y-1.5">
                  {SPLITS.map((s) => (
                    <SplitBar key={s.km} split={s} maxPace={maxPace} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold mb-6">Tracking Features</h3>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
            >
              <Card className="border-border bg-card hover:border-primary/30 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{f.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Virtual leaderboard teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Trophy className="size-8 text-primary" />
                  <div>
                    <p className="font-bold text-sm">Virtual Leaderboard</p>
                    <p className="text-xs text-muted-foreground">
                      Submit your GPS data after your run. Rankings based on verified finishing time. Top 3 win prizes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
