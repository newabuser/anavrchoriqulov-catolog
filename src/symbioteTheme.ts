// Light <-> dark theme switch with a "symbiote" liquid transition.
//
// A mass in the destination theme's background colour spreads from the toggle
// button with organic tendrils until it covers the whole screen. The theme is
// swapped underneath while the screen is fully covered, then the mass fades out.
//
// Why a canvas overlay instead of the View Transitions API:
//  - iOS Safari < 18 has no startViewTransition(), so on those phones the switch
//    was instant (no animation at all).
//  - Where it exists, View Transitions snapshots the whole (huge, animated) page and
//    animates a 140-point polygon clip-path over it, which stutters or never shows on phones.
// A single lightweight fixed <canvas> works on every browser and is cheap to draw.

import { setHeavyAnimationsPaused } from "./utils/renderPerformance"

const K = 120                    // number of points on the blob outline
const DURATION_DESKTOP = 1400    // ms
const DURATION_MOBILE = 1000     // ms
const FADE_OUT = 320             // ms, mass fading out after the swap

const BG = { light: "#FFFFFF", dark: "#0a0a0a" } as const

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

// Precomputed once: direction vectors and per-angle delays
const COS = new Float32Array(K)
const SIN = new Float32Array(K)
const DELAYS = new Float32Array(K)
for (let i = 0; i < K; i++) {
  const th = (i / K) * Math.PI * 2
  COS[i] = Math.cos(th)
  SIN[i] = Math.sin(th)
  DELAYS[i] = delayAt(th)
}

function applyThemeColorMeta(next: "light" | "dark") {
  try {
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement("meta")
      meta.name = "theme-color"
      document.head.appendChild(meta)
    }
    meta.content = BG[next]
  } catch {}
}

export function setTheme(next: "light" | "dark") {
  document.documentElement.dataset.theme = next
  applyThemeColorMeta(next)
  try { localStorage.setItem("theme", next) } catch {}
}

let running = false

export function toggleTheme(origin?: { x: number; y: number }) {
  if (running) return
  const root = document.documentElement
  const cur = root.dataset.theme === "dark" ? "dark" : "light"
  const next = cur === "dark" ? "light" : "dark"
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Reduced motion (or no canvas support) -> instant switch
  const canvas = document.createElement("canvas")
  const ctx = reduced ? null : canvas.getContext("2d")
  if (!ctx) { setTheme(next); return }

  running = true
  const W = window.innerWidth, H = window.innerHeight
  const isMobile = W < 768
  // A solid fill needs no retina resolution; keep the canvas small on phones.
  const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  Object.assign(canvas.style, {
    position: "fixed", left: "0", top: "0", width: "100vw", height: "100vh",
    zIndex: "2147483000", pointerEvents: "none", opacity: "1",
  })
  canvas.setAttribute("aria-hidden", "true")
  canvas.setAttribute("data-testid", "symbiote-overlay")
  document.body.appendChild(canvas)

  const cx = (origin?.x ?? W / 2) * dpr
  const cy = (origin?.y ?? H / 2) * dpr
  const maxR = Math.hypot(Math.max(cx, canvas.width - cx), Math.max(cy, canvas.height - cy)) * 1.25
  const duration = isMobile ? DURATION_MOBILE : DURATION_DESKTOP
  const fill = BG[next]

  // Stop the heavy canvas/WebGL background animations while the mass is spreading,
  // so all of the CPU/GPU goes to this animation.
  setHeavyAnimationsPaused(true)

  const draw = (p: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (p >= 1) {
      ctx.fillStyle = fill
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }
    ctx.beginPath()
    for (let i = 0; i < K; i++) {
      const local = clamp((p - DELAYS[i]) / (1 - DELAYS[i]))
      const wobble = 1 + 0.05 * Math.sin((i / K) * Math.PI * 2 * 7 + p * 9) * (1 - p) // living wobble on the edge
      const r = maxR * ease(local) * wobble
      const x = cx + COS[i] * r
      const y = cy + SIN[i] * r
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    // thin crimson rim on the leading edge for the "living" look
    ctx.lineWidth = 2 * dpr
    ctx.strokeStyle = `rgba(198, 40, 40, ${(0.55 * (1 - p)).toFixed(3)})`
    ctx.stroke()
  }

  const finish = () => {
    // Screen is fully covered: swap the theme with transitions disabled, then fade the mass away.
    root.classList.add("theme-switching")
    setTheme(next)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      canvas.style.transition = `opacity ${FADE_OUT}ms ease-out`
      canvas.style.opacity = "0"
      setHeavyAnimationsPaused(false)
      window.setTimeout(() => {
        canvas.remove()
        root.classList.remove("theme-switching")
        running = false
      }, FADE_OUT + 60)
    }))
  }

  const start = performance.now()
  const tick = (now: number) => {
    const p = clamp((now - start) / duration)
    draw(p)
    if (p < 1) requestAnimationFrame(tick)
    else finish()
  }
  requestAnimationFrame(tick)
}
