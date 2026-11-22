/* eslint-disable */
// Metallic Glass Mosaic — Originkit

"use client"

import { useEffect, useRef, type CSSProperties } from "react"

type RGBA = [number, number, number, number]

const COLOR_CACHE = new Map<string, RGBA | null>()

function parseColor(input: string | undefined, fallback: RGBA): RGBA {
    if (typeof input !== "string") return fallback
    let hit = COLOR_CACHE.get(input)
    if (hit === undefined) {
        hit = parseColorRaw(input)
        COLOR_CACHE.set(input, hit)
    }
    return hit ?? fallback
}

function parseColorRaw(raw: string): RGBA | null {
    let s = raw.trim()
    const v = /^var\(\s*--[^,]+,\s*(.+)\)$/.exec(s)
    if (v) s = v[1].trim()
    if (s[0] === "#") {
        const h = s.slice(1)
        const x = (a: string) => parseInt(a, 16)
        let r: number, g: number, b: number, a = 255
        if (h.length === 3 || h.length === 4) {
            r = x(h[0] + h[0]); g = x(h[1] + h[1]); b = x(h[2] + h[2])
            if (h.length === 4) a = x(h[3] + h[3])
        } else if (h.length === 6 || h.length === 8) {
            r = x(h.slice(0, 2)); g = x(h.slice(2, 4)); b = x(h.slice(4, 6))
            if (h.length === 8) a = x(h.slice(6, 8))
        } else return null
        const out: RGBA = [r / 255, g / 255, b / 255, a / 255]
        return out.every(Number.isFinite) ? out : null
    }
    const m = /^(rgba?|hsla?)\(([^)]*)\)$/i.exec(s)
    if (!m) return null
    const parts = m[2].split(/[\s,/]+/).filter(Boolean)
    if (parts.length < 3) return null
    const num = (p: string, scale: number) =>
        p.endsWith("%") ? (parseFloat(p) / 100) * scale : parseFloat(p)
    const alpha = parts.length > 3 ? num(parts[3], 1) : 1
    let rgb: [number, number, number]
    if (m[1].toLowerCase().startsWith("rgb")) {
        rgb = [num(parts[0], 255) / 255, num(parts[1], 255) / 255, num(parts[2], 255) / 255]
    } else {
        const hh = (((parseFloat(parts[0]) % 360) + 360) % 360) / 360
        const ss = num(parts[1], 1), ll = num(parts[2], 1)
        const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss
        const p = 2 * ll - q
        const f = (t: number) => {
            t = (t + 1) % 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }
        rgb = [f(hh + 1 / 3), f(hh), f(hh - 1 / 3)]
    }
    const out: RGBA = [rgb[0], rgb[1], rgb[2], alpha]
    return out.every(Number.isFinite) ? out.map((c) => Math.min(1, Math.max(0, c))) as RGBA : null
}

const ADVANCED_DEFAULTS = {
    rows: 16,
    tileAspect: 75,
    gap: 4,
    rowJitter: 20,
    bodyColor: "#343640",
    bodyLight: 60,
    tilt: 35,
    reflect: 30,
    lightSize: 30,
    drift: 24,
    driftAngle: 155,
    evolve: 25,
    wobbleMin: 3200,
    wobbleMax: 6400,
    spotWidth: 45,
    spotHeight: 60,
    spotGain: 90,
    whiteness: 75,
    blueLevel: 20,
    cyanLevel: 30,
    amberLevel: 75,
    fullTile: 70,
    streak: 140,
    rim: 70,
    seed: 0,
    grain: 0,
    vignette: 25,
    hover: 50,
}

const MOVED_CONTROLS: { into: Record<string, string>; out: Record<string, string> } = {"into":{},"out":{"hover":"advanced"}}
const GROUP_FALLBACKS: Record<string, any> = { advanced: ADVANCED_DEFAULTS }
function withMovedControls(props: any): any {
    const out = { ...props }
    for (const [k, g] of Object.entries(MOVED_CONTROLS.into)) out[k] = props?.[g]?.[k] ?? GROUP_FALLBACKS[g]?.[k]
    for (const [k, g] of Object.entries(MOVED_CONTROLS.out)) {
        if (out[k] !== undefined) out[g] = { ...(out[g] ?? {}), [k]: out[k] }
    }
    return out
}

interface EffectProps {
    shimmer?: number
    warmth?: number
    warmColor?: string
    advanced?: Partial<typeof ADVANCED_DEFAULTS>
}

function effectUniforms(gl: WebGL2RenderingContext, u: (name: string) => WebGLUniformLocation | null, p: LapisCourseProps): void {
    const adv = { ...ADVANCED_DEFAULTS, ...(p.advanced ?? {}) }
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
    const warm = parseColor(p.warmColor, [0.83, 0.68, 0.22, 1]) // Metallic Gold #D4AF37
    const body = parseColor(adv.bodyColor, [0.2, 0.21, 0.25, 1]) // Graphite #343640
    gl.uniform3f(u("uWarm"), warm[0], warm[1], warm[2])
    gl.uniform3f(u("uBody"), body[0], body[1], body[2])
    gl.uniform1f(u("uWarmth"), clamp(num(p.warmth, 60), 0, 100) / 50)
    gl.uniform1f(u("uShimmer"), clamp(num(p.shimmer, 50), 0, 100) / 50)
    gl.uniform1f(u("uHoverAmt"), clamp(num(adv.hover, 50), 0, 100) / 50)
    gl.uniform4f(
        u("uGrid"),
        clamp(num(adv.rows, 16), 2, 80),
        clamp(num(adv.tileAspect, 75), 20, 200) / 100,
        clamp(num(adv.gap, 4), 0, 40) / 100,
        clamp(num(adv.rowJitter, 20), 0, 100) / 100
    )
    const lightSize = clamp(num(adv.lightSize, 30), 2, 200) / 100
    gl.uniform4f(
        u("uTiltP"),
        clamp(num(adv.tilt, 35), 0, 100) / 100,
        clamp(num(adv.reflect, 30), 0, 200) / 100,
        1 / Math.max(lightSize, 1e-3),
        clamp(num(adv.evolve, 25), 0, 300) / 100
    )
    const a = (num(adv.driftAngle, 155) * Math.PI) / 180
    const sp = clamp(num(adv.drift, 24), 0, 200) / 1000
    const wMin = clamp(num(adv.wobbleMin, 3200), 50, 10000) / 1000
    const wMax = Math.max(wMin, clamp(num(adv.wobbleMax, 6400), 50, 10000) / 1000)
    gl.uniform4f(u("uDriftP"), Math.cos(a) * sp, -Math.sin(a) * sp, wMin, wMax)
    gl.uniform4f(
        u("uSpot"),
        clamp(num(adv.spotWidth, 45), 2, 150) / 100,
        clamp(num(adv.spotHeight, 60), 2, 150) / 100,
        clamp(num(adv.spotGain, 90), 0, 400) / 100,
        clamp(num(adv.whiteness, 75), 0, 100) / 100
    )
    gl.uniform4f(
        u("uLevels"),
        clamp(num(adv.blueLevel, 20), 0, 100) / 100,
        clamp(num(adv.cyanLevel, 30), 0, 100) / 100,
        clamp(num(adv.amberLevel, 75), 0, 100) / 100,
        clamp(num(adv.bodyLight, 60), 0, 200) / 100
    )
    gl.uniform4f(
        u("uExtras"),
        clamp(num(adv.fullTile, 70), 0, 100) / 100,
        clamp(num(adv.streak, 140), 0, 200) / 100,
        clamp(num(adv.rim, 70), 0, 200) / 100,
        clamp(num(adv.seed, 0), 0, 100)
    )
    gl.uniform2f(u("uPost"), clamp(num(adv.grain, 0), 0, 100) / 100, clamp(num(adv.vignette, 25), 0, 100) / 100)
}

const FIELD = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec2 uFieldRes;
uniform float uTime;
uniform float uScale;
uniform vec4 uTiltP;
uniform vec4 uDriftP;
out vec4 outColor;

float h31(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
}
float vn3(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = h31(i), b = h31(i + vec3(1, 0, 0)), c = h31(i + vec3(0, 1, 0)), d = h31(i + vec3(1, 1, 0));
    float e = h31(i + vec3(0, 0, 1)), g = h31(i + vec3(1, 0, 1)), k = h31(i + vec3(0, 1, 1)), l = h31(i + vec3(1, 1, 1));
    return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), mix(mix(e, g, f.x), mix(k, l, f.x), f.y), f.z);
}
float fbm3(vec3 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { s += a * vn3(p); p = p * 2.03 + vec3(5.1, 1.7, 3.3); a *= 0.5; }
    return s / 0.875;
}

void main() {
    vec2 frag = gl_FragCoord.xy / max(uFieldRes, vec2(1.0)) * uRes;
    float ry = max(uRes.y, 1.0);
    vec2 ctr = vec2(uRes.x / ry * 0.5, 0.5);
    vec2 w = (frag / ry - ctr) / max(uScale, 0.05) + ctr;
    float ev = uTime * uTiltP.w;
    vec2 q = (w - uDriftP.xy * uTime) * uTiltP.z;
    vec2 qf = q * vec2(1.0, 0.7);
    vec2 lq = q * 0.8;
    outColor = vec4(
        fbm3(vec3(qf, ev)),
        fbm3(vec3(qf * 0.9 + vec2(17.3, -9.1), ev * 1.1 + 31.0)),
        vn3(vec3(lq * 0.6, ev + 3.0)),
        vn3(vec3(lq + 5.2, ev + 9.0)));
}`

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uBg;
uniform vec3 uBase;
uniform vec3 uAccent;
uniform float uScale;
uniform vec3 uWarm;
uniform vec3 uBody;
uniform float uWarmth;
uniform float uShimmer;
uniform float uHoverAmt;
uniform vec4 uGrid;
uniform vec4 uTiltP;
uniform vec4 uDriftP;
uniform vec4 uSpot;
uniform vec4 uLevels;
uniform vec4 uExtras;
uniform vec2 uPost;
uniform sampler2D uField;
out vec4 outColor;

const float TAU = 6.2831853;
const float LEAN_LOW = 0.0;
const float LEAN_HIGH = 0.13;
const float YAW_RANGE = 2.2;
const float PITCH_RANGE = 0.2;
const float CURVE = 0.24;
const float BEVEL = 0.06;
const float F0 = 0.5;
const float DEPTH = 0.95;
const float LIGHT_PITCH = 0.8;
const float FILL = 0.84;

float h31(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
}
vec4 h42(vec2 p) {
    vec4 p4 = fract(vec4(p.xyxy) * vec4(0.1031, 0.1030, 0.0973, 0.1099));
    p4 += dot(p4, p4.wzxy + 33.33);
    return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }

float boxHit(vec3 ro, vec3 rd, vec3 h, out vec3 nrm) {
    vec3 m = 1.0 / rd;
    vec3 n = m * ro;
    vec3 k = abs(m) * h;
    vec3 t1 = -n - k, t2 = -n + k;
    float tN = max(max(t1.x, t1.y), t1.z);
    float tF = min(min(t2.x, t2.y), t2.z);
    nrm = -sign(rd) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);
    return (tN > tF || tF < 0.0) ? -1.0 : tN;
}

mat3 gMi[4];
vec3 gH[4];
vec3 gRd[4];
vec3 gInv[4];
vec3 gK[4];
vec3 gO[4];
vec4 gR[4];
float gI[4];
float gTileH, gPx, gT, gSeed;
vec4 gFld;
vec2 gUV, gToUV;

struct Hit { float t; vec3 n; vec3 lp; vec3 h; mat3 Mi; vec4 hC; float infl; float id; };

Hit castAt(vec2 o) {
    float best = 1e9;
    int bk = -1;
    for (int k = 0; k < 4; k++) {
        vec3 n = gInv[k] * (gO[k] + gMi[k][0] * o.x + gMi[k][1] * o.y);
        vec3 t1 = -n - gK[k], t2 = -n + gK[k];
        float tN = max(max(t1.x, t1.y), t1.z);
        float tF = min(min(t2.x, t2.y), t2.z);
        if (tN <= tF && tN > 0.0 && tN < best) { best = tN; bk = k; }
    }
    if (bk < 0) return Hit(1e9, vec3(0.0, 0.0, 1.0), vec3(0.0), vec3(1.0), mat3(1.0), vec4(0.0), 0.0, -1.0);
    vec3 rol = gO[bk] + gMi[bk][0] * o.x + gMi[bk][1] * o.y;
    vec3 nl;
    float th = boxHit(rol, gRd[bk], gH[bk], nl);
    return Hit(th, nl, rol + gRd[bk] * th, gH[bk], gMi[bk], gR[bk], gI[bk], float(bk) * 8.0 + dot(nl, vec3(1.0, 2.0, 3.0)) + 4.0);
}

vec3 shade(Hit H, vec2 q) {
    if (H.id < 0.0) return uBg;
    float tileH = gTileH, t = gT, seed = gSeed;
    vec3 rd = vec3(0.0, 0.0, -1.0);
    vec3 wp = vec3(q, 4.0) + rd * H.t;
    vec3 lp = H.lp, h = H.h, bN = H.n;
    mat3 bM = transpose(H.Mi);
    vec4 bC = H.hC;
    vec3 e3 = h - abs(lp) + abs(bN) * 1e3;
    float e = min(e3.x, min(e3.y, e3.z));
    vec3 ea = step(e3, e3.yzx) * step(e3, e3.zxy);
    float pxl = gPx / max(abs((bM * bN).z), 0.15);
    float bev = 1.0 - smoothstep(0.0, max(BEVEL * tileH, 2.2 * pxl), e);
    vec3 fc = lp / h * (1.0 - abs(bN));
    vec3 nl = normalize(bN + fc * vec3(CURVE, CURVE * 0.6, CURVE) + ea * sign(lp) * bev * 1.2);
    vec3 N = bM * nl;
    vec3 Nf = bM * bN;
    vec3 R = reflect(rd, N);
    float ndv = clamp(-dot(rd, N), 0.0, 1.0);
    float fres = F0 + (1.0 - F0) * pow(1.0 - ndv, 5.0);

    float ev = t * uTiltP.w;
    float silver = min(1.0, smoothstep(uLevels.x, uLevels.x + 0.3, gFld.r) + H.infl * 0.5);
    float sh = smoothstep(uLevels.y, uLevels.y + 0.16, gFld.r);
    float gold = clamp(smoothstep(uLevels.z, uLevels.z + 0.12, gFld.g) * uWarmth, 0.0, 1.0);

    vec2 Rr = R.xy * (uTiltP.y / 0.3);
    float sx = Rr.x / LIGHT_PITCH + gFld.b * 1.5;
    float lyBase = -0.12 + (gFld.a - 0.5) * 0.3;
    vec2 sig = max(uSpot.xy, vec2(0.02)) * vec2(0.42 * LIGHT_PITCH, 0.3);
    vec3 spec = vec3(0.0);
    for (int k = -1; k <= 1; k++) {
        float si = floor(sx + 0.5) + float(k);
        vec4 hl = h42(vec2(si, 7.7 + seed));
        float isGold = smoothstep(hl.x - 0.15, hl.x + 0.15, gold * 0.95);
        float isWhite = step(0.5, hl.z) * (1.0 - isGold);
        vec2 dl = vec2((sx - si) * LIGHT_PITCH, Rr.y - lyBase - (hl.y - 0.5) * 0.16) / (sig * mix(1.0, 0.7, isWhite));
        float lobe = (exp(-dot(dl, dl)) + 0.08 * exp(-dot(dl, dl) * 0.2)) * mix(1.0, 1.5, isWhite);
        vec3 lightCol = mix(mix(uBase * 1.2, uAccent, isWhite), uWarm * 1.4, isGold);
        float lightAmt = mix(mix(0.5 + 0.6 * silver, 0.6 + 0.8 * sh, isWhite), 0.6 + 0.9 * gold, isGold) * (0.7 + 0.5 * hl.w);
        spec += lightCol * lightAmt * lobe;
    }
    float into = smoothstep(-0.6, 0.2, R.z);
    spec *= uSpot.z * 3.2 * mix(0.4, 1.0, into);
    vec3 amb = uBase * (0.3 + 0.7 * silver) * uLevels.w * 0.8 * (1.0 - 0.4 * gold) * mix(0.5, 1.0, into)
             * (0.6 + 0.4 * smoothstep(-0.8, 0.8, R.x - R.y));
    float blot = 0.5 + 0.3 * sin(Rr.x * 2.6 + gFld.b * 9.0 + ev * 0.5) + 0.2 * sin(Rr.y * 2.2 - Rr.x * 1.1 + gFld.a * 7.0);
    amb *= mix(0.4, 1.4, blot);
    amb += uWarm * 0.25 * gold * uLevels.w;

    float lb = textureLod(uField, gUV - Nf.xy * 0.08 * gToUV, 0.0).r;
    vec3 body = uBody * (0.6 + 0.5 * bC.z) + uBase * smoothstep(0.35, 0.75, lb) * silver * 0.15 * uLevels.w;
    vec3 col = mix(body, amb, 0.3 + 0.7 * fres) + spec * mix(0.6, 1.1, fres);

    vec3 hot = mix(mix(uBase * 1.4, uAccent, step(0.5, bC.y)) * (0.6 + 0.6 * max(silver, sh)),
                   uWarm * 1.5 * (0.7 + 0.5 * gold), smoothstep(0.1, 0.4, gold));
    float pick = step(1.0 - uExtras.x * 0.3, bC.w);
    float graze = smoothstep(0.65, 0.25, -dot(rd, Nf)) * pick * (1.0 - smoothstep(0.5, 0.9, abs(bN.y)));
    col += hot * graze * 1.8 * mix(0.6, 1.0, lp.y / h.y * 0.5 + 0.5);
    
    // Metallic gold edges and bevel highlights
    col += (uWarm * 1.3 + amb * 0.5 + spec * 0.3) * bev * uExtras.y * 0.75 * (0.5 + 0.8 * gold);
    
    float cap = smoothstep(0.5, 0.9, bN.y);
    col += mix(uAccent, uWarm, 0.4) * cap * uExtras.z * 0.45 * (0.4 + sh + 0.5 * silver);
    col *= mix(0.45, 1.0, smoothstep(0.0, 2.0 * h.z + 0.3 * tileH, wp.z));
    float outline = smoothstep(0.12, -0.12, (bM * (ea * sign(lp))).z);
    col *= mix(mix(0.7, 0.25, outline), 1.0, smoothstep(0.0, 1.5 * pxl, e));
    float L = max(col.r, max(col.g, col.b));
    return mix(col, vec3(1.0), smoothstep(1.0, 2.2, L) * uSpot.w * 0.8);
}

void main() {
    float ry = max(uRes.y, 1.0);
    float aspect = uRes.x / ry;
    vec2 ctr = vec2(aspect * 0.5, 0.5);
    float zoom = max(uScale, 0.05);
    vec2 p = (gl_FragCoord.xy / ry - ctr) / zoom + ctr;
    vec2 m = (uMouse * vec2(aspect, 1.0) - ctr) / zoom + ctr;
    vec2 uv = gl_FragCoord.xy / max(uRes, vec2(1.0));
    float px = 1.0 / (ry * zoom);
    float t = uTime;
    float seed = uExtras.w * 13.1;

    float tileH = 1.0 / max(uGrid.x, 1.0);
    float tileW = tileH * max(uGrid.y, 0.05);
    float fill = 1.0 - uGrid.z;
    vec3 hs = vec3(tileW * fill * FILL * 0.5, tileH * fill * FILL * 0.5, tileW * fill * FILL * 0.5 * DEPTH);
    float wMin = max(uDriftP.z, 0.05);
    float wMax = max(uDriftP.w, wMin);
    gTileH = tileH; gPx = px; gT = t; gSeed = seed;
    gUV = uv;
    gToUV = zoom / vec2(aspect, 1.0);
    gFld = texture(uField, uv);

    float fy = p.y / tileH;
    float row0 = floor(fy);
    float rowN = row0 + (fract(fy) < 0.5 ? -1.0 : 1.0);
    for (int j = 0; j < 2; j++) {
        float r = j == 0 ? row0 : rowN;
        float off = (h42(vec2(r, 91.7 + seed)).x - 0.5) * uGrid.w;
        float gx = p.x / tileW + off;
        float c0 = floor(gx);
        float cN = c0 + (fract(gx) < 0.5 ? -1.0 : 1.0);
        for (int i = 0; i < 2; i++) {
            vec2 cell = vec2(i == 0 ? c0 : cN, r);
            vec2 cxy = vec2((cell.x + 0.5 - off) * tileW, (r + 0.5) * tileH);
            vec4 hA = h42(cell + seed);
            vec4 hB = h42(cell + 47.3 + seed);
            vec4 hC = h42(cell + 123.9 + seed);
            float sway = sin(t * TAU / mix(wMin, wMax, hB.x) + hB.z * TAU);
            float nod = sin(t * TAU / mix(wMin, wMax, hB.y) + hB.w * TAU);
            float yu = hA.x * 2.0 - 1.0;
            float yaw = sign(yu) * pow(abs(yu), 0.7) * uTiltP.x * YAW_RANGE + sway * 0.1 * uShimmer;
            float lean = mix(LEAN_LOW, LEAN_HIGH, clamp((cxy.y - ctr.y) * zoom + 0.5, 0.0, 1.0));
            float pitch = lean + (hA.y * 2.0 - 1.0) * uTiltP.x * YAW_RANGE * PITCH_RANGE + nod * 0.035 * uShimmer;
            vec2 dm = cxy - m;
            float infl = uHover * uHoverAmt * exp(-dot(dm, dm) * 14.0);
            vec2 to = -dm / (length(dm) + 0.05);
            yaw += to.x * 0.55 * infl;
            pitch -= to.y * 0.35 * infl;
            vec3 h = hs * vec3(mix(0.92, 1.06, hC.x), 1.0, mix(0.85, 1.15, hC.y));
            int k = j * 2 + i;
            mat3 Mi = transpose(rotX(pitch) * rotY(yaw));
            vec3 c = vec3(cxy, h.z + hA.z * 0.3 * tileH + infl * 0.3 * tileH);
            vec3 rdl = -Mi[2];
            rdl += step(abs(rdl), vec3(1e-6)) * 1e-6;
            gMi[k] = Mi;
            gH[k] = h;
            gRd[k] = rdl;
            gInv[k] = 1.0 / rdl;
            gK[k] = abs(gInv[k]) * h;
            gO[k] = Mi * (vec3(p, 4.0) - c);
            gR[k] = hC;
            gI[k] = infl;
        }
    }

    vec2 o0 = vec2(0.125, 0.375) * px, o1 = vec2(-0.375, 0.125) * px;
    vec2 o2 = vec2(-0.125, -0.375) * px, o3 = vec2(0.375, -0.125) * px;
    Hit h0 = castAt(o0);
    vec3 c0 = shade(h0, p + o0);
    vec3 col = c0;
    Hit s1 = castAt(o1);
    col += s1.id == h0.id ? c0 : shade(s1, p + o1);
    Hit s2 = castAt(o2);
    col += s2.id == h0.id ? c0 : shade(s2, p + o2);
    Hit s3 = castAt(o3);
    col += s3.id == h0.id ? c0 : shade(s3, p + o3);
    col *= 0.25;

    vec2 q = (uv - 0.5) * vec2(0.8, 1.2);
    col *= mix(1.0, 1.0 - uPost.y, smoothstep(0.3, 0.72, length(q)));
    col += (h31(vec3(gl_FragCoord.xy, floor(t * 30.0))) - 0.5) * uPost.x * 0.25;
    outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`

const VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const MAX_PIXELS = 2_000_000
const FIELD_DIV = 4
const SLOW_DT = 1 / 48
const FAST_DT = 1 / 56
const MIN_QUALITY = 0.5

function num(v: unknown, d: number): number {
    return typeof v === "number" && Number.isFinite(v) ? v : d
}

function __OriginkitBase_LapisCourse(props: LapisCourseProps) {
    props = withMovedControls(props)
    const { background = "#101116", baseColor = "#C9CBD2", accentColor = "#FFFFFF", speed = 50, scale = 200, style } = props
    void [baseColor, accentColor, speed, scale]
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const propsRef = useRef(props)
    propsRef.current = props

    useEffect(() => {
        const root = rootRef.current
        const canvas = canvasRef.current
        if (!root || !canvas) return
        const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false })
        if (!gl) return
        const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

        const build = (fs: string) => {
            const sh = (type: number, src: string) => {
                const s = gl.createShader(type)!
                gl.shaderSource(s, src)
                gl.compileShader(s)
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error("LapisCourse shader:", gl.getShaderInfoLog(s))
                return s
            }
            const prog = gl.createProgram()!
            const vs = sh(gl.VERTEX_SHADER, VERT)
            const fsh = sh(gl.FRAGMENT_SHADER, fs)
            gl.attachShader(prog, vs)
            gl.attachShader(prog, fsh)
            gl.linkProgram(prog)
            gl.deleteShader(vs)
            gl.deleteShader(fsh)
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error("LapisCourse link:", gl.getProgramInfoLog(prog))
                gl.deleteProgram(prog)
                return null
            }
            const cache = new Map<string, WebGLUniformLocation | null>()
            const u = (name: string) => {
                if (!cache.has(name)) cache.set(name, gl.getUniformLocation(prog, name))
                return cache.get(name) ?? null
            }
            return { prog, u }
        }
        const wall = build(FRAG)
        const field = build(FIELD)
        if (!wall || !field) return

        const buf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

        const fieldTex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, fieldTex)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        const fbo = gl.createFramebuffer()
        let fw = 0
        let fh = 0

        let quality = 1
        const resize = () => {
            const cw = Math.max(1, root.offsetWidth)
            const ch = Math.max(1, root.offsetHeight)
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            const s = Math.min(dpr * quality, Math.sqrt(MAX_PIXELS / (cw * ch)))
            const w = Math.max(1, Math.round(cw * s))
            const h = Math.max(1, Math.round(ch * s))
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w
                canvas.height = h
            }
            const nfw = Math.max(1, Math.ceil(w / FIELD_DIV))
            const nfh = Math.max(1, Math.ceil(h / FIELD_DIV))
            if (nfw !== fw || nfh !== fh) {
                fw = nfw
                fh = nfh
                gl.bindTexture(gl.TEXTURE_2D, fieldTex)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fieldTex, 0)
                gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            }
        }
        const ro = new ResizeObserver(resize)
        ro.observe(root)
        resize()

        let mx = 0.5
        let my = 0.5
        let tx = 0.5
        let ty = 0.5
        let over = 0
        let hov = 0
        const onMove = (e: PointerEvent) => {
            const r = root.getBoundingClientRect()
            if (r.width <= 0 || r.height <= 0) return
            tx = (e.clientX - r.left) / r.width
            ty = 1 - (e.clientY - r.top) / r.height
            over = 1
        }
        const onLeave = () => {
            over = 0
        }
        root.addEventListener("pointermove", onMove)
        root.addEventListener("pointerdown", onMove)
        root.addEventListener("pointerleave", onLeave)
        root.addEventListener("pointerup", onLeave)

        const common = (u: (name: string) => WebGLUniformLocation | null, p: LapisCourseProps) => {
            gl.uniform2f(u("uRes"), canvas.width, canvas.height)
            gl.uniform1f(u("uTime"), clock)
            gl.uniform1f(u("uScale"), Math.max(10, Math.min(300, num(p.scale, 100))) / 100)
            effectUniforms(gl, u, p)
        }

        let clock = 0
        let raf = 0
        let last = -1
        let avgDt = 1 / 60
        let calm = 0
        let cooldown = 1
        const frame = (now: number) => {
            raf = requestAnimationFrame(frame)
            const raw = last < 0 ? 1 / 60 : Math.min((now - last) / 1000, 0.25)
            const dt = Math.min(raw, 1 / 20)
            last = now

            avgDt += (raw - avgDt) * 0.1
            cooldown -= raw
            if (cooldown <= 0) {
                if (avgDt > SLOW_DT && quality > MIN_QUALITY) {
                    quality = Math.max(MIN_QUALITY, quality * 0.8)
                    cooldown = 0.75
                    calm = 0
                    resize()
                } else if (avgDt < FAST_DT && quality < 1) {
                    calm += raw
                    if (calm > 3) {
                        quality = Math.min(1, quality * 1.15)
                        cooldown = 0.75
                        calm = 0
                        resize()
                    }
                } else calm = 0
            }

            const p = propsRef.current
            clock = (clock + dt * (Math.max(0, Math.min(100, num(p.speed, 50))) / 50) * (reduced ? 0.25 : 1)) % 3600
            const k = 1 - Math.exp(-dt * 14)
            mx += (tx - mx) * k
            my += (ty - my) * k
            hov += (over - hov) * (1 - Math.exp(-dt * 6))

            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
            gl.viewport(0, 0, fw, fh)
            gl.useProgram(field.prog)
            gl.uniform2f(field.u("uFieldRes"), fw, fh)
            common(field.u, p)
            gl.drawArrays(gl.TRIANGLES, 0, 3)

            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.viewport(0, 0, canvas.width, canvas.height)
            gl.useProgram(wall.prog)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, fieldTex)
            gl.uniform1i(wall.u("uField"), 0)
            const bg = parseColor(p.background, [0.06, 0.07, 0.09, 1]) // #101116
            const base = parseColor(p.baseColor, [0.79, 0.8, 0.82, 1]) // #C9CBD2
            const acc = parseColor(p.accentColor, [1, 1, 1, 1]) // #FFFFFF
            gl.uniform2f(wall.u("uMouse"), mx, my)
            gl.uniform1f(wall.u("uHover"), hov)
            gl.uniform3f(wall.u("uBg"), bg[0], bg[1], bg[2])
            gl.uniform3f(wall.u("uBase"), base[0], base[1], base[2])
            gl.uniform3f(wall.u("uAccent"), acc[0], acc[1], acc[2])
            common(wall.u, p)
            gl.drawArrays(gl.TRIANGLES, 0, 3)
        }

        const start = () => {
            if (raf) return
            last = -1
            raf = requestAnimationFrame(frame)
        }
        const stop = () => {
            cancelAnimationFrame(raf)
            raf = 0
        }
        const io =
            typeof IntersectionObserver === "function"
                ? new IntersectionObserver((entries) => (entries[entries.length - 1].isIntersecting ? start() : stop()))
                : null
        if (io) io.observe(root)
        start()

        return () => {
            stop()
            io?.disconnect()
            ro.disconnect()
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerdown", onMove)
            root.removeEventListener("pointerleave", onLeave)
            root.removeEventListener("pointerup", onLeave)
            gl.deleteFramebuffer(fbo)
            gl.deleteTexture(fieldTex)
            gl.deleteBuffer(buf)
            gl.deleteProgram(wall.prog)
            gl.deleteProgram(field.prog)
        }
    }, [])

    return (
        <div ref={rootRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background, ...style }}>
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
        </div>
    )
}

const __originkitPresetProps = {
  "background": "#101116",
  "baseColor": "#C9CBD2",
  "accentColor": "#FFFFFF",
  "warmColor": "#D4AF37",
  "advanced": {
    "rows": 16,
    "tileAspect": 75,
    "gap": 4,
    "rowJitter": 20,
    "bodyColor": "#343640",
    "bodyLight": 60,
    "tilt": 35,
    "reflect": 30,
    "lightSize": 30,
    "drift": 24,
    "driftAngle": 155,
    "evolve": 25,
    "wobbleMin": 3200,
    "wobbleMax": 6400,
    "spotWidth": 45,
    "spotHeight": 60,
    "spotGain": 90,
    "whiteness": 75,
    "blueLevel": 20,
    "cyanLevel": 30,
    "amberLevel": 75,
    "fullTile": 70,
    "streak": 140,
    "rim": 70,
    "seed": 0,
    "grain": 0,
    "vignette": 25
  }
};

export interface LapisCourseProps extends EffectProps {
    background?: string
    baseColor?: string
    accentColor?: string
    speed?: number
    scale?: number
    style?: CSSProperties
}

export default function LapisCourse(props: Record<string, unknown>) {
  return <__OriginkitBase_LapisCourse {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}
