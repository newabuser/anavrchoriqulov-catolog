"use client"
import { useEffect, useRef } from "react"
import { instantResetScrollToTop } from "../utils/scrollReset"

export type ParticleTransitionProps = {
  active: boolean          // WELCOME bosilganda true bo'ladi
  imageSrc: string         // hero'dagi portret rasmi (heroImg url)
  text: string             // zarrachalar yig'iladigan tarjima sarlavhasi
  locale?: string          // joriy til kodi ("uz" | "en" | "ru")
  bg?: string              // hero fon rangi (quyuq)
  ink?: string             // yakuniy zarracha rangi
  onStart?: () => void     // 1-kadrda: hero'ni yashiring, galereyani orqada ko'rsating
  onDone?: () => void      // tugadi: canvas yashirinadi, sarlavhani ko'rsating
}

export const DEFAULT_HEADING_FONT_FAMILY =
  '"CaskoLuxuryDemo-Regular", "Cormorant Garamond", "Bodoni Moda", serif'

export interface CoverRectInput {
  sw: number
  sh: number
  viewportWidth: number
  viewportHeight: number
  naturalWidth: number
  naturalHeight: number
  heroImgRect?: { left: number; top: number; width: number; height: number } | null
}

export interface CoverDrawRect {
  dx: number
  dy: number
  dw: number
  dh: number
}

export function computeHeroCoverRect({
  sw,
  sh,
  viewportWidth,
  viewportHeight,
  naturalWidth,
  naturalHeight,
  heroImgRect,
}: CoverRectInput): CoverDrawRect {
  const safeNatW = Math.max(1, naturalWidth)
  const safeNatH = Math.max(1, naturalHeight)

  let boxLeft: number
  let boxTop: number
  let boxW: number
  let boxH: number

  if (
    heroImgRect &&
    heroImgRect.width > 0 &&
    heroImgRect.height > 0 &&
    viewportWidth > 0 &&
    viewportHeight > 0
  ) {
    const scaleX = sw / viewportWidth
    const scaleY = sh / viewportHeight
    boxLeft = heroImgRect.left * scaleX
    boxTop = heroImgRect.top * scaleY
    boxW = heroImgRect.width * scaleX
    boxH = heroImgRect.height * scaleY
  } else {
    // WelcomeGate parallax container rests at scale(1.06) at scrollY = 0
    boxW = sw * 1.06
    boxH = sh * 1.06
    boxLeft = (sw - boxW) / 2
    boxTop = (sh - boxH) / 2
  }

  const k = Math.max(boxW / safeNatW, boxH / safeNatH)
  const dw = safeNatW * k
  const dh = safeNatH * k
  // Match WelcomeGate className: object-[38%_center] lg:object-center
  const posX = viewportWidth < 1024 ? 0.38 : 0.5
  const posY = 0.5

  return {
    dx: boxLeft + (boxW - dw) * posX,
    dy: boxTop + (boxH - dh) * posY,
    dw,
    dh,
  }
}

export function formatParticleHeadingText(rawText: string, locale = "uz"): string {
  const trimmed = rawText.trim()
  if (!trimmed) return ""
  try {
    return trimmed.toLocaleUpperCase(locale)
  } catch {
    return trimmed.toUpperCase()
  }
}

export interface FitHeadingInput {
  fontSize: number
  letterSpacing: number
  measuredWidth: number
  maxWidth: number
}

export interface FitHeadingResult {
  fontSize: number
  letterSpacing: number
  scale: number
}

export function fitHeadingDimensions({
  fontSize,
  letterSpacing,
  measuredWidth,
  maxWidth,
}: FitHeadingInput): FitHeadingResult {
  if (measuredWidth > maxWidth && maxWidth > 0 && measuredWidth > 0) {
    const scale = maxWidth / measuredWidth
    return {
      fontSize: fontSize * scale,
      letterSpacing: letterSpacing * scale,
      scale,
    }
  }
  return {
    fontSize,
    letterSpacing,
    scale: 1,
  }
}

export interface HeadingSpec {
  renderText: string
  fontFamily: string
  fontSize: number
  fontWeight: string
  letterSpacing: number
  centerX: number
  centerY: number
}

export function computeHeadingSpec(
  viewportWidth: number,
  _viewportHeight: number,
  rawText: string,
  locale = "uz",
  headingEl?: HTMLElement | null
): HeadingSpec {
  const defaultFs = Math.min(26, Math.max(20, viewportWidth * 0.022))
  const defaultLetterSpacing = defaultFs * 0.46
  const navTop = viewportWidth >= 640 ? 16 : 12
  const navH = viewportWidth >= 768 ? 62 : 56
  const galleryPt = viewportWidth >= 1024 ? 112 : viewportWidth >= 640 ? 104 : 96
  const defaultCenterY = navTop + navH + galleryPt + (defaultFs * 1.25) / 2
  const formattedPropText = formatParticleHeadingText(rawText, locale)

  if (headingEl && typeof window !== "undefined") {
    const rect = headingEl.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      const cs = window.getComputedStyle(headingEl)
      const fs = parseFloat(cs.fontSize) || defaultFs
      const ls = parseFloat(cs.letterSpacing)
      const letterSpacing = Number.isFinite(ls) ? ls : fs * 0.46
      const domText = formatParticleHeadingText(headingEl.textContent ?? "", locale)
      const renderText = domText || formattedPropText

      return {
        renderText,
        fontFamily: cs.fontFamily || DEFAULT_HEADING_FONT_FAMILY,
        fontSize: fs,
        fontWeight: cs.fontWeight || "400",
        letterSpacing,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      }
    }
  }

  return {
    renderText: formattedPropText,
    fontFamily: DEFAULT_HEADING_FONT_FAMILY,
    fontSize: defaultFs,
    fontWeight: "400",
    letterSpacing: defaultLetterSpacing,
    centerX: viewportWidth / 2,
    centerY: defaultCenterY,
  }
}

export interface TransitionStepState {
  t: number
  lastNow: number
  justStarted: boolean
}

export function advanceTransitionTime(
  state: TransitionStepState,
  nowMs: number,
  maxDt = 0.12
): { state: TransitionStepState; dt: number } {
  if (state.justStarted) {
    const dt = 1 / 60
    return {
      state: {
        t: state.t + dt,
        lastNow: nowMs,
        justStarted: false,
      },
      dt,
    }
  }
  const rawDt = state.lastNow > 0 ? Math.max(0, (nowMs - state.lastNow) / 1000) : 0
  const dt = Math.min(maxDt, rawDt)
  return {
    state: {
      t: state.t + dt,
      lastNow: nowMs,
      justStarted: false,
    },
    dt,
  }
}

const DISSOLVE = 1.2
const GATHER = 1.3
const FADE = 0.7
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function ParticleTransition({
  active,
  imageSrc,
  text,
  locale,
  bg = "#080808",
  ink = "#D20000",
  onStart,
  onDone,
}: ParticleTransitionProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const preloadedImgRef = useRef<HTMLImageElement | null>(null)
  const cb = useRef({ onStart, onDone })
  cb.current = { onStart, onDone }

  // Preload hero portrait image and editorial fonts (Latin + Cyrillic)
  useEffect(() => {
    if (!imageSrc || typeof window === "undefined") return
    const pre = new Image()
    pre.crossOrigin = "anonymous"
    pre.src = imageSrc
    preloadedImgRef.current = pre
    if ("fonts" in document) {
      const sampleText = formatParticleHeadingText(text, locale || document.documentElement.lang || "uz")
      document.fonts.load('400 26px "CaskoLuxuryDemo-Regular"', sampleText).catch(() => {})
      document.fonts.load('400 26px "Cormorant Garamond"', sampleText).catch(() => {})
    }
  }, [imageSrc, text, locale])

  useEffect(() => {
    const canvas = ref.current
    if (!active || !canvas) return

    const resolvedLocale = locale || document.documentElement.lang || "uz"
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      cb.current.onStart?.()
      canvas.style.display = "none"
      cb.current.onDone?.()
      return
    }

    const htmlEl = document.documentElement
    const bodyEl = document.body
    const prevHtmlOverflow = htmlEl.style.overflow
    const prevBodyOverflow = bodyEl.style.overflow
    let scrollLocked = true
    htmlEl.style.overflow = "hidden"
    bodyEl.style.overflow = "hidden"

    const unlockScroll = () => {
      if (!scrollLocked) return
      scrollLocked = false
      htmlEl.style.overflow = prevHtmlOverflow === "hidden" ? "" : prevHtmlOverflow
      bodyEl.style.overflow = prevBodyOverflow === "hidden" ? "" : prevBodyOverflow
    }

    const W = window.innerWidth
    const H = window.innerHeight
    const mobile = W < 768
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5)
    canvas.width = Math.max(1, Math.round(W * dpr))
    canvas.height = Math.max(1, Math.round(H * dpr))
    canvas.style.display = "block"
    canvas.setAttribute("data-running", "true")
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalAlpha = 1
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    let raf = 0
    let waitRaf = 0
    let dead = false

    const stopLoop = () => {
      if (waitRaf !== 0) {
        cancelAnimationFrame(waitRaf)
        waitRaf = 0
      }
      if (raf !== 0) {
        cancelAnimationFrame(raf)
        raf = 0
      }
      canvas.setAttribute("data-running", "false")
    }

    const finish = () => {
      stopLoop()
      unlockScroll()
      canvas.style.display = "none"
      cb.current.onDone?.()
    }

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      cb.current.onStart?.()
      finish()
      return () => {
        dead = true
        stopLoop()
        unlockScroll()
      }
    }

    const heroImgEl = document.querySelector(
      '[data-testid="welcome-parallax-bg"] img'
    ) as HTMLImageElement | null
    const heroImgRect = heroImgEl ? heroImgEl.getBoundingClientRect() : null

    const waitForMountedHeading = (attempt: number, onReady: () => void) => {
      if (dead) return
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        instantResetScrollToTop()
      }
      const headingEl = document.getElementById("portfolio-heading")
      if (
        (headingEl && headingEl.getBoundingClientRect().width > 0) ||
        attempt >= 5
      ) {
        onReady()
        return
      }
      waitRaf = requestAnimationFrame(() => waitForMountedHeading(attempt + 1, onReady))
    }

    const prepareAndRun = (loadedImg: HTMLImageElement) => {
      if (dead) return
      // Hide hero, mount gallery, and reset scroll instantly while dark curtain covers screen
      cb.current.onStart?.()
      waitRaf = requestAnimationFrame(() => {
        waitForMountedHeading(0, async () => {
          if (dead) return
          const initialHeadingEl = document.getElementById("portfolio-heading")
          const initialSpec = computeHeadingSpec(W, H, text, resolvedLocale, initialHeadingEl)
          const fontDecl = `${initialSpec.fontWeight} ${initialSpec.fontSize}px ${initialSpec.fontFamily}`
          if ("fonts" in document) {
            await Promise.all([
              document.fonts.ready.catch(() => {}),
              document.fonts.load(fontDecl, initialSpec.renderText).catch(() => {}),
              document.fonts
                .load(`400 ${initialSpec.fontSize}px "Cormorant Garamond"`, initialSpec.renderText)
                .catch(() => {}),
            ])
          }
          if (!dead) {
            run(loadedImg)
          }
        })
      })
    }

    const cached = preloadedImgRef.current
    let img: HTMLImageElement | null = null
    if (cached && cached.src === imageSrc && cached.complete && cached.naturalWidth > 0) {
      prepareAndRun(cached)
    } else {
      img = new Image()
      img.crossOrigin = "anonymous"
      img.onerror = () => {
        if (dead) return
        cb.current.onStart?.()
        finish()
      }
      img.onload = () => {
        if (img) prepareAndRun(img)
      }
      img.src = imageSrc
    }

    function run(img: HTMLImageElement) {
      if (dead || !ctx || !canvas) return
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        instantResetScrollToTop()
      }

      const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined
      const lowCores = typeof cores === "number" && cores > 0 && cores <= 4
      const N = mobile ? 3500 : lowCores ? 5000 : 8000
      const S = mobile ? 5 : 4

      // 1) Portrait particles matching WelcomeGate object-fit / object-position
      const sw = Math.max(1, Math.ceil(W / S))
      const sh = Math.max(1, Math.ceil(H / S))
      const off = document.createElement("canvas")
      off.width = sw
      off.height = sh
      const octx = off.getContext("2d", { willReadFrequently: true })
      if (!octx) {
        finish()
        return
      }

      const cover = computeHeroCoverRect({
        sw,
        sh,
        viewportWidth: W,
        viewportHeight: H,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        heroImgRect,
      })

      octx.fillStyle = bg
      octx.fillRect(0, 0, sw, sh)
      octx.drawImage(img, cover.dx, cover.dy, cover.dw, cover.dh)

      let px: Uint8ClampedArray
      try {
        px = octx.getImageData(0, 0, sw, sh).data
      } catch {
        finish()
        return
      }

      const cand: number[] = []
      const mono = new Uint8Array(sw * sh)
      for (let i = 0; i < sw * sh; i++) {
        const rawLum = (px[i * 4] * 77 + px[i * 4 + 1] * 150 + px[i * 4 + 2] * 29) >> 8
        // Match WelcomeGate grayscale + contrast(1.14) + brightness(1.04)
        const adjLum = clamp(Math.round(((rawLum - 128) * 1.14 + 128) * 1.04), 0, 255)
        mono[i] = adjLum
        if (adjLum > 22) cand.push(i)
      }
      const n = Math.min(N, cand.length)
      if (n === 0) {
        finish()
        return
      }
      for (let i = 0; i < n; i++) {
        const j = i + Math.floor(Math.random() * (cand.length - i))
        ;[cand[i], cand[j]] = [cand[j], cand[i]]
      }

      // 2) Target shape: exact position, font & uppercase localized word of real heading, auto-fitted to <= 80% screen width
      const headingEl = document.getElementById("portfolio-heading")
      const spec = computeHeadingSpec(W, H, text, resolvedLocale, headingEl)

      const tc = document.createElement("canvas")
      const tctx = tc.getContext("2d", { willReadFrequently: true })
      if (!tctx || !spec.renderText) {
        finish()
        return
      }

      const chars = Array.from(spec.renderText)
      const measureTracked = (fontSizePx: number, letterSpacingPx: number) => {
        const fontDecl = `${spec.fontWeight} ${fontSizePx}px ${spec.fontFamily}`
        tctx.font = fontDecl
        const widths = chars.map((ch) => tctx.measureText(ch).width)
        const total =
          widths.reduce((acc, w) => acc + w, 0) +
          Math.max(0, chars.length - 1) * letterSpacingPx
        return { fontDecl, widths, total }
      }

      const initialMeasured = measureTracked(spec.fontSize, spec.letterSpacing)
      const fitted = fitHeadingDimensions({
        fontSize: spec.fontSize,
        letterSpacing: spec.letterSpacing,
        measuredWidth: initialMeasured.total,
        maxWidth: W * 0.8,
      })

      const finalMeasured =
        fitted.scale < 1
          ? measureTracked(fitted.fontSize, fitted.letterSpacing)
          : initialMeasured

      const activeFontSize = fitted.fontSize
      const activeLetterSpacing = fitted.letterSpacing
      const totalWidth = finalMeasured.total
      const charWidths = finalMeasured.widths

      const x0 = Math.max(0, Math.floor(spec.centerX - totalWidth * 0.65))
      const x1 = Math.min(W, Math.ceil(spec.centerX + totalWidth * 0.65))
      const y0 = Math.max(0, Math.floor(spec.centerY - activeFontSize * 1.4))
      const y1 = Math.min(H, Math.ceil(spec.centerY + activeFontSize * 1.4))
      const boxW = Math.max(1, x1 - x0)
      const boxH = Math.max(1, y1 - y0)

      tc.width = boxW
      tc.height = boxH

      tctx.fillStyle = "#000"
      tctx.font = finalMeasured.fontDecl
      tctx.textAlign = "left"
      tctx.textBaseline = "middle"

      let cursorX = spec.centerX - totalWidth / 2 - x0
      const localCenterY = spec.centerY - y0
      for (let ci = 0; ci < chars.length; ci++) {
        tctx.fillText(chars[ci], cursorX, localCenterY)
        cursorX += charWidths[ci] + activeLetterSpacing
      }

      const td = tctx.getImageData(0, 0, boxW, boxH).data
      const targets: number[] = []
      for (let py = 0; py < boxH; py++) {
        for (let pxCol = 0; pxCol < boxW; pxCol++) {
          if (td[(py * boxW + pxCol) * 4 + 3] > 64) {
            targets.push(x0 + pxCol, y0 + py)
          }
        }
      }
      const tn = targets.length / 2
      if (tn === 0) {
        finish()
        return
      }

      // 3) Particle state arrays (rebuilt fresh every activation)
      const x = new Float32Array(n)
      const y = new Float32Array(n)
      const sx = new Float32Array(n)
      const sy = new Float32Array(n)
      const tx = new Float32Array(n)
      const ty = new Float32Array(n)
      const dl = new Float32Array(n)
      const st = new Float32Array(n)
      const sp = new Float32Array(n)
      const BK = 8
      const bucket = new Uint8Array(n)
      const sum = Array.from({ length: BK }, () => [0, 0, 0, 0])

      for (let i = 0; i < n; i++) {
        const c = cand[i]
        const cx = c % sw
        const cy = (c / sw) | 0
        x[i] = cx * S + Math.random() * S
        y[i] = cy * S + Math.random() * S
        const v = mono[c]
        const bi = Math.min(BK - 1, (v / 32) | 0)
        bucket[i] = bi
        const s = sum[bi]
        s[0] += v
        s[1] += v
        s[2] += v
        s[3]++
        const ti = ((Math.random() * tn) | 0) * 2
        tx[i] = targets[ti] + (Math.random() - 0.5) * 0.75
        ty[i] = targets[ti + 1] + (Math.random() - 0.5) * 0.75
        dl[i] = (x[i] / W) * 0.35
        st[i] = Math.random() * 0.3
        sp[i] = 90 + Math.random() * 160
      }

      const groups: number[][] = Array.from({ length: BK }, () => [])
      for (let i = 0; i < n; i++) groups[bucket[i]].push(i)
      const base = sum.map((s) =>
        s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : [128, 128, 128]
      )
      const m = /^#?([0-9a-f]{6})$/i.exec(ink)
      const inkRGB = m
        ? [0, 2, 4].map((o) => parseInt(m[1].slice(o, o + 2), 16))
        : [210, 0, 0]

      const TG = DISSOLVE + 0.35
      const TF = TG + GATHER + 0.3
      const startSize = mobile ? 2.2 : 2
      const endSize = mobile ? 1.35 : 1.45
      let stepState: TransitionStepState = { t: 0, lastNow: 0, justStarted: true }
      let captured = false
      let firstLoopFrame = true

      const frame = (now: number) => {
        if (dead) return

        let dt = 0
        if (firstLoopFrame) {
          firstLoopFrame = false
          stepState = { t: 0, lastNow: now, justStarted: true }
        } else {
          const advanced = advanceTransitionTime(stepState, now)
          stepState = advanced.state
          dt = advanced.dt
        }
        const t = stepState.t

        ctx.globalAlpha = 1
        ctx.clearRect(0, 0, W, H)

        // Dark curtain holds hero backdrop while Gallery mounts at scroll 0, then opens underneath
        const curtain = 1 - clamp((t - 0.35) / DISSOLVE)
        if (curtain > 0) {
          ctx.globalAlpha = curtain
          ctx.fillStyle = bg
          ctx.fillRect(0, 0, W, H)
        }

        if (t >= TG && !captured) {
          sx.set(x)
          sy.set(y)
          captured = true
        }
        const gt = clamp((t - TG) / (GATHER + 0.3))
        const alpha = 1 - clamp((t - TF) / FADE)

        for (let i = 0; i < n; i++) {
          if (t < TG) {
            const lt = t - dl[i]
            if (lt > 0) {
              const a =
                Math.sin(x[i] * 0.006 + t * 1.3) * 3 +
                Math.cos(y[i] * 0.007 - t) * 3
              x[i] += (Math.cos(a) * sp[i] * 0.6 + 120) * dt
              y[i] += (Math.sin(a) * sp[i] * 0.6 - 40) * dt
            }
          } else {
            const e = ease(clamp((t - TG - st[i]) / GATHER))
            const sw2 = Math.sin(i + t * 3) * (1 - e) * 28
            x[i] = sx[i] + (tx[i] - sx[i]) * e + sw2
            y[i] = sy[i] + (ty[i] - sy[i]) * e + Math.cos(i + t * 3) * (1 - e) * 28
          }
        }

        const mix = ease(gt)
        const particleSize = startSize + (endSize - startSize) * mix
        ctx.globalAlpha = alpha
        for (let b = 0; b < BK; b++) {
          const c = base[b]
          ctx.fillStyle = `rgb(${(c[0] + (inkRGB[0] - c[0]) * mix) | 0},${
            (c[1] + (inkRGB[1] - c[1]) * mix) | 0
          },${(c[2] + (inkRGB[2] - c[2]) * mix) | 0})`
          const g = groups[b]
          for (let j = 0; j < g.length; j++) {
            const idx = g[j]
            ctx.fillRect((x[idx] + 0.5) | 0, (y[idx] + 0.5) | 0, particleSize, particleSize)
          }
        }

        if (t > TF + FADE) {
          ctx.clearRect(0, 0, W, H)
          finish()
          return
        }

        raf = requestAnimationFrame(frame)
      }

      raf = requestAnimationFrame(frame)
    }

    return () => {
      dead = true
      stopLoop()
      unlockScroll()
    }
  }, [active, imageSrc, text, locale, bg, ink])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-testid="particle-transition-canvas"
      data-running={active ? "true" : "false"}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: active ? "block" : "none",
        pointerEvents: "none",
      }}
    />
  )
}
