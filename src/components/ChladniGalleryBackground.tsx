/* eslint-disable */
// Chladni Tune — Persistent Gallery Background

"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import {
    CHLADNI_DESKTOP_PARTICLES,
    getActiveHeavyAnimation,
    getChladniRuntimeConfig,
    setHeavyAnimationWanted,
    subscribeHeavyAnimationCoordinator,
} from "../utils/renderPerformance"

type RGBA = [number, number, number, number]
const CT_SAND = "#D20000"
const CT_PLATE = "#FFFFFF"
const ctColorCache = new Map<string, RGBA>()

function parseHexDirect(c: string): RGBA | null {
    const s = c.trim()
    if (!s.startsWith("#")) return null
    const h = s.slice(1)
    if (h.length === 3 || h.length === 4) {
        const r = parseInt(h[0] + h[0], 16)
        const g = parseInt(h[1] + h[1], 16)
        const b = parseInt(h[2] + h[2], 16)
        const a = h.length === 4 ? parseInt(h[3] + h[3], 16) / 255 : 1
        if ([r, g, b, a].every(Number.isFinite)) return [r, g, b, a]
    } else if (h.length === 6 || h.length === 8) {
        const r = parseInt(h.slice(0, 2), 16)
        const g = parseInt(h.slice(2, 4), 16)
        const b = parseInt(h.slice(4, 6), 16)
        const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
        if ([r, g, b, a].every(Number.isFinite)) return [r, g, b, a]
    }
    return null
}

function ctResolveColor(el: HTMLElement, c: string, fallback: RGBA): RGBA {
    const hit = ctColorCache.get(c)
    if (hit) return hit
    const direct = parseHexDirect(c)
    if (direct) {
        ctColorCache.set(c, direct)
        return direct
    }
    let out = fallback
    try {
        const prev = el.style.color
        el.style.color = ""
        el.style.color = c
        const s = el.style.color ? getComputedStyle(el).color : ""
        el.style.color = prev
        const m = s.match(/rgba?\(([^)]+)\)/)
        if (m) {
            const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat)
            if (p.length >= 3 && p.every((v) => isFinite(v))) {
                out = [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]
            }
        }
    } catch {
        out = fallback
    }
    ctColorCache.set(c, out)
    return out
}

const ctMix = (a: RGBA, b: [number, number, number], k: number): string =>
    `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`

// (n, m, sign) ascending; frequency ∝ n² + m²
const CT_MODES: readonly [number, number, number][] = [
    [1, 2, 1],
    [1, 3, -1],
    [2, 3, 1],
    [1, 5, -1],
    [3, 5, 1],
    [3, 7, -1],
]
const CT_NM = CT_MODES.length
const CT_DK = CT_MODES.map((m) => 5.2 / (Math.PI * Math.PI * (m[0] * m[0] + m[1] * m[1])))
const CT_MAX_N = CHLADNI_DESKTOP_PARTICLES
const CT_SIG = 0.34 // kick strength, plate heights per √s at full amplitude
const CT_REST = 0.3 // off-resonance agitation
const CT_FLOOR = 0.035 // residual agitation (line thickness)
const CT_HOP = 0.013 // hop height at full amplitude, plate heights
const CT_LUT = 4096
const CT_COS = new Float32Array(CT_LUT + 1)
for (let i = 0; i <= CT_LUT; i++) CT_COS[i] = Math.cos((2 * Math.PI * i) / CT_LUT)
function ctCosp(t: number): number {
    let u = t * 0.5
    u -= Math.floor(u)
    return CT_COS[(u * CT_LUT) | 0]
}
const ctRes = (d: number): number => 1 / (1 + (d / 0.1) * (d / 0.1))
const ctSs = (a: number, b: number, x: number): number => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)
}

function mulberry32(seed: number): () => number {
    let a = seed >>> 0
    return function () {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const CT_PATTERN_RECIPES: readonly number[][] = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 2], [1, 3], [1, 4], [1, 5], [2, 3],
    [2, 4], [2, 5], [3, 4], [3, 5], [4, 5],
    [0, 1, 2], [0, 1, 3], [0, 1, 4], [0, 1, 5], [0, 2, 3],
    [0, 2, 4], [0, 2, 5], [0, 3, 4], [0, 3, 5], [0, 4, 5],
    [1, 2, 3], [1, 2, 4], [1, 2, 5], [1, 3, 4], [1, 3, 5],
    [1, 4, 5], [2, 3, 4], [2, 3, 5], [2, 4, 5], [3, 4, 5],
    [0, 1, 2, 3], [0, 1, 2, 4], [0, 1, 2, 5], [0, 1, 3, 4], [0, 1, 3, 5],
    [0, 1, 4, 5], [0, 2, 3, 4], [0, 2, 3, 5], [0, 2, 4, 5], [0, 3, 4, 5],
    [1, 2, 3, 4], [1, 2, 3, 5], [1, 2, 4, 5], [1, 3, 4, 5], [2, 3, 4, 5],
]

const CT_PATTERN_ORDER: readonly number[] = [
    7, 32, 14, 41, 2, 27, 48, 18, 35, 9,
    44, 21, 3, 39, 12, 30, 46, 5, 24, 37,
    16, 49, 10, 28, 43, 1, 34, 20, 47, 6,
    26, 15, 40, 23, 45, 8, 31, 19, 42, 4,
    29, 11, 36, 0, 33, 22, 38, 13, 17, 25,
]

const CT_RECIPE_BASE_WEIGHTS = [1.0, 0.72, 0.48, 0.30] as const

export interface ChladniGalleryProps {
    minTime?: number
    sand?: string
    plate?: string
    interaction?: boolean
    interactionStrength?: number
    multiplePatterns?: boolean
    patternCount?: number
    active?: boolean
    style?: CSSProperties
}

export function ChladniGalleryBackground({
    minTime = 4,
    sand = CT_SAND,
    plate = CT_PLATE,
    interaction = true,
    interactionStrength = 1.15,
    multiplePatterns = false,
    patternCount = 3,
    active = true,
    style,
}: ChladniGalleryProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const optsRef = useRef({
        minTime,
        sand,
        plate,
        interaction,
        interactionStrength,
        multiplePatterns,
        patternCount,
        active,
    })
    optsRef.current = {
        minTime,
        sand,
        plate,
        interaction,
        interactionStrength,
        multiplePatterns,
        patternCount,
        active,
    }

    const syncRunningRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        syncRunningRef.current?.()
    }, [active, sand, plate])

    useEffect(() => {
        const root = rootRef.current
        const canvas = canvasRef.current
        if (!root || !canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const reducedMotion =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches

        let W = 0
        let H = 0
        let dpr = 1
        let runtimeConfig = getChladniRuntimeConfig({
            viewportWidth: window.innerWidth,
            hardwareConcurrency: navigator.hardwareConcurrency,
        })
        let activeParticles = runtimeConfig.particleCount
        let minFrameMs = runtimeConfig.maxFps ? 1000 / runtimeConfig.maxFps : 0

        const X = new Float32Array(CT_MAX_N)
        const Y = new Float32Array(CT_MAX_N)
        const HS = new Float32Array(CT_MAX_N)
        const PH = new Float32Array(CT_MAX_N)
        const OM = new Float32Array(CT_MAX_N)
        const Z = new Float32Array(CT_MAX_N)
        const TONE = new Uint8Array(CT_MAX_N)
        let aspect = 1.6
        let ns = 0x9e3779b9 >>> 0

        let pointerX = 0.5
        let pointerY = 0.5
        let pointerActive = false
        let pointerEnergy = 0

        const rnd = (): number => {
            ns ^= ns << 13
            ns ^= ns >>> 17
            ns ^= ns << 5
            return (ns >>> 0) / 4294967296
        }
        const gauss = (): number => (rnd() + rnd() + rnd() - 1.5) * 2

        const updatePointer = (e: PointerEvent) => {
            if (!optsRef.current.interaction) return
            const rect = canvas.getBoundingClientRect()
            if (!rect.width || !rect.height) return
            if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            ) {
                pointerActive = false
                return
            }
            pointerX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
            pointerY = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
            pointerActive = true
            pointerEnergy = 1
        }

        const onPointerLeave = () => {
            pointerActive = false
        }

        window.addEventListener("pointermove", updatePointer, { passive: true })
        window.addEventListener("pointerdown", updatePointer, { passive: true })
        window.addEventListener("pointerup", onPointerLeave, { passive: true })
        window.addEventListener("pointercancel", onPointerLeave, { passive: true })
        document.documentElement.addEventListener("pointerleave", onPointerLeave)

        let U = 0
        let UX = 0
        let UY = 0
        function modeEval(k: number, x: number, y: number) {
            const M = CT_MODES[k], n = M[0], m = M[1], s = M[2]
            const cnx = ctCosp(n * x), cmx = ctCosp(m * x), cny = ctCosp(n * y), cmy = ctCosp(m * y)
            const snx = ctCosp(n * x - 0.5), smx = ctCosp(m * x - 0.5), sny = ctCosp(n * y - 0.5), smy = ctCosp(m * y - 0.5)
            U = cnx * cmy + s * cmx * cny
            UX = -Math.PI * (n * snx * cmy + s * m * smx * cny)
            UY = -Math.PI * (m * cnx * smy + s * n * cmx * sny)
        }

        function multiModeEval(recipeIndex: number, x: number, y: number) {
            const fullRecipe = CT_PATTERN_RECIPES[recipeIndex % CT_PATTERN_RECIPES.length]
            const layerCount = Math.max(
                1,
                Math.min(fullRecipe.length, Math.round(optsRef.current.patternCount))
            )
            let e = 0, gx = 0, gy = 0
            let weightSum = 0
            const phase = recipeIndex * 1.61803398875
            for (let j = 0; j < layerCount; j++) {
                const k = fullRecipe[j]
                modeEval(k, x, y)
                const slot = (j + recipeIndex) % 4
                const base = CT_RECIPE_BASE_WEIGHTS[slot]
                const variation = 0.82 + 0.18 * (0.5 + 0.5 * Math.sin(phase + j * 2.17))
                const weight = base * variation
                weightSum += weight
                e += U * weight
                gx += CT_DK[k] * UX * weight
                gy += CT_DK[k] * UY * weight
            }
            U = e / (weightSum || 1)
            UX = gx / (weightSum || 1)
            UY = gy / (weightSum || 1)
        }

        function modeCoord(p: number): number {
            const raw = p * CT_NM - 0.5
            const k = Math.floor(raw)
            const q = k + ctSs(0.62, 1, raw - k)
            return Math.max(-1, Math.min(CT_NM - 1, q))
        }

        const r = mulberry32(4211)
        aspect = root.offsetWidth && root.offsetHeight ? root.offsetWidth / root.offsetHeight : 1.6
        for (let i = 0; i < CT_MAX_N; i++) {
            X[i] = r() * aspect
            Y[i] = r()
            HS[i] = CT_REST
            PH[i] = r()
            OM[i] = 3.2 + r() * 2.8
            Z[i] = 0
            TONE[i] = (r() * 3) | 0
        }

        const syncAttributes = (running: boolean) => {
            root.setAttribute("data-running", running ? "true" : "false")
            root.setAttribute("data-particles", String(activeParticles))
            root.setAttribute("data-dpr-cap", String(runtimeConfig.maxDpr))
            root.setAttribute("data-fps-cap", runtimeConfig.maxFps ? String(runtimeConfig.maxFps) : "uncapped")
            root.setAttribute("data-sand", optsRef.current.sand || CT_SAND)
            root.setAttribute("data-plate", optsRef.current.plate || CT_PLATE)
        }

        const resize = () => {
            runtimeConfig = getChladniRuntimeConfig({
                viewportWidth: window.innerWidth,
                hardwareConcurrency: navigator.hardwareConcurrency,
            })
            activeParticles = runtimeConfig.particleCount
            minFrameMs = runtimeConfig.maxFps ? 1000 / runtimeConfig.maxFps : 0

            const w = root.offsetWidth
            const h = root.offsetHeight
            const d = Math.min(window.devicePixelRatio || 1, runtimeConfig.maxDpr)
            if (w <= 0 || h <= 0) return
            if (w !== W || h !== H || d !== dpr) {
                W = w
                H = h
                dpr = d
                canvas.width = Math.max(1, Math.round(W * dpr))
                canvas.height = Math.max(1, Math.round(H * dpr))
                const na = W / H
                if (na > 0 && Math.abs(na - aspect) > 1e-4) {
                    const s = na / aspect
                    for (let i = 0; i < CT_MAX_N; i++) X[i] *= s
                    aspect = na
                }
            }
            syncAttributes(raf !== 0)
        }

        function simulate(
            dt: number,
            p: number,
            patternIndex = 0,
            morph = 0,
            nextPatternIndex = 0,
            timeS = 0
        ): { q: number; A: number } {
            const useMulti = optsRef.current.multiplePatterns
            const q = useMulti
                ? ((patternIndex % CT_PATTERN_RECIPES.length) / CT_PATTERN_RECIPES.length) * CT_NM
                : modeCoord(p)
            const k0 = Math.floor(q)
            const fr = q - k0
            const k1 = k0 + 1
            const w0 = k0 >= 0 ? ctRes(fr) : 0
            const w1 = k1 < CT_NM ? ctRes(1 - fr) : 0
            const A = useMulti ? 1 : Math.max(w0, w1)
            const R = useMulti ? 0 : 1 - A
            const use0 = w0 > 0.02
            const use1 = w1 > 0.02
            const ws = (use0 ? w0 : 0) + (use1 ? w1 : 0) || 1
            const sq = Math.sqrt(dt)
            const lim = 0.02

            for (let i = 0; i < activeParticles; i++) {
                const x = X[i] / aspect
                const y = Y[i]
                let E = 0, gx = 0, gy = 0

                if (useMulti) {
                    multiModeEval(patternIndex, x, y)
                    const e0 = U, gx0 = UX, gy0 = UY
                    if (morph > 0) {
                        multiModeEval(nextPatternIndex, x, y)
                        E = e0 * (1 - morph) + U * morph
                        gx = gx0 * (1 - morph) + UX * morph
                        gy = gy0 * (1 - morph) + UY * morph
                    } else {
                        E = e0
                        gx = gx0
                        gy = gy0
                    }
                } else {
                    if (use0) {
                        modeEval(k0, x, y)
                        E += w0 * U
                        gx += w0 * CT_DK[k0] * UX
                        gy += w0 * CT_DK[k0] * UY
                    }
                    if (use1) {
                        modeEval(k1, x, y)
                        E += w1 * U
                        gx += w1 * CT_DK[k1] * UX
                        gy += w1 * CT_DK[k1] * UY
                    }
                    E /= ws
                    gx /= ws
                    gy /= ws
                }

                const aLoc = A * Math.min(1, Math.abs(E) * 0.5)
                const ag = aLoc + CT_REST * R + CT_FLOOR
                HS[i] += (ag - HS[i]) * Math.min(1, dt * 8)
                let dx = (-A * 2 * E * gx * dt) / aspect + CT_SIG * ag * gauss() * sq
                let dy = -A * 2 * E * gy * dt + CT_SIG * ag * gauss() * sq

                const phase0 = PH[i] * Math.PI * 2 + timeS * 1.37
                const phase1 = (X[i] * 9.7 + Y[i] * 13.1) + timeS * 0.83
                const ambient = 0.0028 * (0.35 + 0.65 * Math.min(1, ag * 2.2))
                dx += Math.sin(phase0 + phase1) * ambient * dt
                dy += Math.cos(phase0 * 0.77 - phase1) * ambient * dt

                if (optsRef.current.interaction) {
                    const hoverAmount = pointerActive ? 1 : pointerEnergy
                    if (hoverAmount > 0.001) {
                        const px = pointerX * aspect
                        const py = pointerY
                        const cdx = px - X[i]
                        const cdy = py - Y[i]
                        const cd = Math.hypot(cdx, cdy) + 0.0001
                        const radius = 0.34
                        if (cd < radius) {
                            const falloff = Math.pow(1 - cd / radius, 2)
                            const strength = optsRef.current.interactionStrength * hoverAmount

                            const radial = 1.15 * strength * falloff
                            dx += (cdx / cd) * radial * dt
                            dy += (cdy / cd) * radial * dt

                            const swirl = 0.72 * strength * falloff
                            dx += (-cdy / cd) * swirl * dt
                            dy += (cdx / cd) * swirl * dt

                            const shell = Math.exp(-Math.pow((cd - radius * 0.72) / (radius * 0.18), 2))
                            const shellForce = 0.55 * strength * shell
                            dx += (-cdy / cd) * shellForce * dt
                            dy += (cdx / cd) * shellForce * dt

                            HS[i] = Math.min(1.8, HS[i] + 1.0 * falloff * strength * dt)
                            Z[i] = Math.min(0.055, Z[i] + 0.04 * falloff * strength * dt)
                        }
                    }
                }

                dx = dx > lim ? lim : dx < -lim ? -lim : dx
                dy = dy > lim ? lim : dy < -lim ? -lim : dy
                let nx = X[i] + dx
                let ny = Y[i] + dy
                if (!isFinite(nx) || !isFinite(ny)) {
                    nx = gauss() * 0.01 + aspect * 0.5
                    ny = gauss() * 0.01 + 0.5
                    HS[i] = CT_REST
                }
                if (nx < 0) nx = -nx
                else if (nx > aspect) nx = 2 * aspect - nx
                if (ny < 0) ny = -ny
                else if (ny > 1) ny = 2 - ny
                X[i] = nx
                Y[i] = ny
            }

            return { q, A }
        }

        let t = 0
        let raf = 0
        let last = -1
        const initialRect = root.getBoundingClientRect()
        let isIntersecting =
            initialRect.width > 0 &&
            initialRect.height > 0 &&
            initialRect.bottom > 0 &&
            initialRect.top < window.innerHeight
        let isTabVisible = typeof document !== "undefined" ? !document.hidden : true
        let disposed = false

        const drawFrame = (dt: number) => {
            if (W < 2 || H < 2) return

            const plateCol = ctResolveColor(canvas, optsRef.current.plate || CT_PLATE, [255, 255, 255, 1])
            const sandCol = ctResolveColor(canvas, optsRef.current.sand || CT_SAND, [210, 0, 0, 1])

            t += dt
            const width = canvas.width
            const height = canvas.height
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.globalAlpha = 1
            ctx.clearRect(0, 0, width, height)

            const patternInterval = Math.max(0.5, optsRef.current.minTime)
            const patternCycle = Math.floor(t / patternInterval)
            const cycleT = t - patternCycle * patternInterval
            const progress = cycleT / patternInterval

            const orderIndex = patternCycle % CT_PATTERN_ORDER.length
            const useMulti = optsRef.current.multiplePatterns
            const patternIndex = useMulti ? CT_PATTERN_ORDER[orderIndex] : 0
            const nextPatternIndex = useMulti
                ? CT_PATTERN_ORDER[(orderIndex + 1) % CT_PATTERN_ORDER.length]
                : 0
            const morphStart = 0.68
            const morphT = Math.max(0, Math.min(1, (progress - morphStart) / (1 - morphStart)))
            const morph = morphT * morphT * (3 - 2 * morphT)

            const steps = Math.max(1, Math.ceil(dt / (1 / 55)))
            let o = { q: modeCoord(progress), A: 1 - CT_REST }
            if (dt > 0) {
                for (let s = 0; s < steps; s++) {
                    const stepT = ((cycleT - dt + (s + 1) * (dt / steps)) % patternInterval) / patternInterval
                    o = simulate(
                        dt / steps,
                        stepT,
                        patternIndex,
                        morph,
                        nextPatternIndex,
                        fTimeAtStep(t, dt, s, steps)
                    )
                }
            }

            const A = o.A

            // Solid metal plate background
            ctx.fillStyle = `rgb(${Math.round(plateCol[0])},${Math.round(plateCol[1])},${Math.round(plateCol[2])})`
            ctx.fillRect(0, 0, width, height)

            const shakeA = useMulti ? 0 : height * 0.0012 * A * (progress > 0 ? 1 : 0)
            const sx = shakeA * Math.sin(t * 97)
            const sy = shakeA * Math.cos(t * 83)
            ctx.setTransform(1, 0, 0, 1, sx, sy)
            ctx.globalAlpha = 1

            const g0 = dpr * Math.min(2, Math.max(1, H / 330))
            const sandA = sandCol[3]

            for (let i = 0; i < activeParticles; i++) {
                PH[i] += dt * OM[i] * (0.5 + 0.8 * Math.min(1, HS[i]))
            }

            // Airborne grain shadows
            ctx.globalAlpha = sandA * 0.5
            ctx.fillStyle = "#050706"
            ctx.beginPath()
            for (let i = 0; i < activeParticles; i++) {
                const u = PH[i] - Math.floor(PH[i])
                const z = CT_HOP * HS[i] * 4 * u * (1 - u)
                const zp = z * height
                if (zp < 0.6) continue
                const s = g0 * (1 + Math.min(0.8, z * 1.6))
                ctx.rect(X[i] * height + zp * 0.35, Y[i] * height + zp * 0.2, s, s)
            }
            ctx.fill()

            const tones = [
                ctMix(sandCol, [0, 0, 0], 0.09),
                ctMix(sandCol, [0, 0, 0], 0),
                ctMix(sandCol, [255, 255, 255], 0.45),
            ]

            ctx.globalAlpha = sandA
            for (let tt = 0; tt < 3; tt++) {
                ctx.fillStyle = tones[tt]
                ctx.beginPath()
                for (let i = 0; i < activeParticles; i++) {
                    if (TONE[i] !== tt) continue
                    const u = PH[i] - Math.floor(PH[i])
                    const z = CT_HOP * HS[i] * 4 * u * (1 - u)
                    const s = g0 * (1 + Math.min(0.8, Math.max(0, z) * 1.6))
                    const px = X[i] * height
                    const py = (Y[i] - z) * height
                    if (px < -8 || py < -8 || px > width + 8 || py > height + 8) continue
                    ctx.rect(px, py, s, s)
                }
                ctx.fill()
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.globalAlpha = 1

            if (optsRef.current.interaction && pointerActive) {
                pointerEnergy = Math.min(1, pointerEnergy + dt * 8)
            } else {
                pointerEnergy = Math.max(0, pointerEnergy - dt * 1.8)
            }
        }

        function fTimeAtStep(totalT: number, dt: number, s: number, steps: number): number {
            return totalT - dt + (s + 1) * (dt / steps)
        }

        const isWanted = () =>
            !disposed &&
            !reducedMotion &&
            optsRef.current.active &&
            isIntersecting &&
            isTabVisible

        const shouldRun = () =>
            isWanted() && getActiveHeavyAnimation() === "chladni"

        const frame = (now: number) => {
            if (!shouldRun()) {
                raf = 0
                last = -1
                syncAttributes(false)
                return
            }
            if (minFrameMs > 0 && last >= 0 && now - last < minFrameMs - 0.5) {
                raf = requestAnimationFrame(frame)
                return
            }
            const dt = last < 0 ? 0 : Math.min(0.05, (now - last) / 1000)
            last = now
            drawFrame(dt)
            raf = requestAnimationFrame(frame)
        }

        const syncRunning = () => {
            setHeavyAnimationWanted("chladni", isWanted())
            if (shouldRun()) {
                if (raf === 0) {
                    last = -1
                    raf = requestAnimationFrame(frame)
                }
                syncAttributes(true)
            } else {
                if (raf !== 0) {
                    cancelAnimationFrame(raf)
                    raf = 0
                    last = -1
                }
                syncAttributes(false)
            }
        }
        syncRunningRef.current = syncRunning

        resize()

        // Draw one initial settled frame if reduced motion is requested
        if (reducedMotion) {
            for (let k = 0; k < 24; k++) simulate(1 / 55, 0.35, 0, 0, 0, k / 55)
            drawFrame(0)
            syncAttributes(false)
        }

        const ro = new ResizeObserver(() => {
            resize()
            if (reducedMotion) drawFrame(0)
        })
        ro.observe(root)

        const io =
            typeof IntersectionObserver !== "undefined"
                ? new IntersectionObserver(
                      (entries) => {
                          const latest = entries[entries.length - 1]
                          isIntersecting = latest ? latest.isIntersecting : false
                          syncRunning()
                      },
                      { threshold: 0 }
                  )
                : null
        io?.observe(root)

        const unsubCoordinator = subscribeHeavyAnimationCoordinator(syncRunning)

        const onVisibilityChange = () => {
            isTabVisible = !document.hidden
            syncRunning()
        }
        document.addEventListener("visibilitychange", onVisibilityChange)

        syncRunning()

        return () => {
            disposed = true
            syncRunningRef.current = null
            setHeavyAnimationWanted("chladni", false)
            unsubCoordinator()
            if (raf !== 0) cancelAnimationFrame(raf)
            ro.disconnect()
            io?.disconnect()
            document.removeEventListener("visibilitychange", onVisibilityChange)
            window.removeEventListener("pointermove", updatePointer)
            window.removeEventListener("pointerdown", updatePointer)
            window.removeEventListener("pointerup", onPointerLeave)
            window.removeEventListener("pointercancel", onPointerLeave)
            document.documentElement.removeEventListener("pointerleave", onPointerLeave)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            canvas.width = 0
            canvas.height = 0
        }
    }, [])

    return (
        <div
            ref={rootRef}
            data-testid="chladni-gallery-background"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                pointerEvents: "none",
                touchAction: "pan-y",
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                data-testid="chladni-gallery-canvas"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                    pointerEvents: "none",
                    touchAction: "pan-y",
                }}
            />
        </div>
    )
}

