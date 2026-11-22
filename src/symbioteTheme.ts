// Light <-> dark theme switch with a "symbiote" liquid transition.
// A black (or white) mass spreads from the toggle button with organic tendrils
// until it covers the screen. Uses the View Transitions API + animated clip-path.

const K = 140            // number of points on the blob outline
const FRAMES = 30        // number of keyframes
const DURATION = 1500    // ms

const rand = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647) })()
const phases = Array.from({ length: 6 }, () => rand() * Math.PI * 2)
const tendrils = Array.from({ length: 9 }, () => ({
  a: rand() * Math.PI * 2,        // direction of the tendril
  w: 0.05 + rand() * 0.07,        // width
  depth: 0.35 + rand() * 0.3,     // how far ahead of the rest it reaches
}))

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

// Per-angle start delay: a lower delay means the liquid reaches further in that direction (a tendril)
function delayAt(theta: number) {
  let n = 0
  for (let k = 0; k < phases.length; k++) n += Math.sin(theta * (k + 2) + phases[k]) / (k + 2)
  let d = 0.42 + 0.22 * n
  for (const t of tendrils) {
    let da = Math.abs(theta - t.a)
    da = Math.min(da, Math.PI * 2 - da)
    d -= t.depth * Math.exp(-(da / t.w) * (da / t.w))
  }
  return clamp(d, 0, 0.8)
}

function frame(p: number, cx: number, cy: number, maxR: number, delays: number[]) {
  const pts: string[] = []
  for (let i = 0; i < K; i++) {
    const th = (i / K) * Math.PI * 2
    const local = clamp((p - delays[i]) / (1 - delays[i]))
    const wobble = 1 + 0.05 * Math.sin(th * 7 + p * 9) * (1 - p)   // living wobble on the edge
    const r = maxR * ease(local) * wobble
    pts.push(`${(cx + Math.cos(th) * r).toFixed(1)}px ${(cy + Math.sin(th) * r).toFixed(1)}px`)
  }
  return `polygon(${pts.join(",")})`
}

export function setTheme(next: "light" | "dark") {
  document.documentElement.dataset.theme = next
  try { localStorage.setItem("theme", next) } catch {}
}

export function toggleTheme(origin?: { x: number; y: number }) {
  const cur = document.documentElement.dataset.theme === "dark" ? "dark" : "light"
  const next = cur === "dark" ? "light" : "dark"
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const vt = (document as any).startViewTransition?.bind(document)
  // Fallback: no View Transitions support or reduced motion -> instant switch
  if (!vt || reduced) { setTheme(next); return }

  const W = window.innerWidth, H = window.innerHeight
  const cx = origin?.x ?? W / 2, cy = origin?.y ?? H / 2
  const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.25
  const delays = Array.from({ length: K }, (_, i) => delayAt((i / K) * Math.PI * 2))

  const t = vt(() => setTheme(next))
  t.ready.then(() => {
    const frames = Array.from({ length: FRAMES + 1 }, (_, i) => ({
      clipPath: frame(i / FRAMES, cx, cy, maxR, delays),
    }))
    document.documentElement.animate(frames, {
      duration: DURATION, easing: "linear", fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    })
  })
}
