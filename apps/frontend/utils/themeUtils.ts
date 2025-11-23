/**
 * テーマユーティリティ（v2対応）
 * プリセット⇔px変換、色変換、コントラスト計算、旧データ丸め込み
 */

import type { RGBA, MessageTheme, MessageThemeV2, FontPreset } from '@talking/types'
import {
  FONT_K,
  PADDING_K,
  RADIUS_PX,
  BORDER_PX,
  TYPE_MS,
  WINDOW_PRESET,
} from '@talking/types'

// ========== 色変換 ==========

/** HEX文字列 (#RRGGBB or #RRGGBBAA) → RGBA */
export function hexToRgba(hex: string): RGBA {
  const h = hex.replace('#', '')
  let r = 0, g = 0, b = 0, a = 1
  if (h.length === 6) {
    r = parseInt(h.slice(0, 2), 16)
    g = parseInt(h.slice(2, 4), 16)
    b = parseInt(h.slice(4, 6), 16)
  } else if (h.length === 8) {
    r = parseInt(h.slice(0, 2), 16)
    g = parseInt(h.slice(2, 4), 16)
    b = parseInt(h.slice(4, 6), 16)
    a = parseInt(h.slice(6, 8), 16) / 255
  } else if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16)
    g = parseInt(h[1] + h[1], 16)
    b = parseInt(h[2] + h[2], 16)
  }
  return { r, g, b, a }
}

/** RGBA → HEX文字列 (#RRGGBB) ※アルファは含めない */
export function rgbaToHex(rgba: RGBA): string {
  const { r, g, b } = rgba
  const rr = Math.round(r).toString(16).padStart(2, '0')
  const gg = Math.round(g).toString(16).padStart(2, '0')
  const bb = Math.round(b).toString(16).padStart(2, '0')
  return `#${rr}${gg}${bb}`
}

/** RGBA → CSS文字列 "rgba(r,g,b,a)" */
export function rgbaToCss(rgba: RGBA): string {
  return `rgba(${Math.round(rgba.r)},${Math.round(rgba.g)},${Math.round(rgba.b)},${rgba.a})`
}

/** CSS rgba/rgb文字列 or HEX → RGBA */
export function parseColor(color: string | RGBA | undefined): RGBA | null {
  if (!color) return null
  if (typeof color !== 'string') return color
  if (color.startsWith('#')) return hexToRgba(color)
  // rgba(r,g,b,a) or rgb(r,g,b)
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1,
    }
  }
  return null
}

/** 任意形式の色 → RGBA（フォールバック付き） */
export function toRgba(color: string | RGBA | undefined, fallback: RGBA = { r: 255, g: 255, b: 255, a: 1 }): RGBA {
  const parsed = parseColor(color)
  return parsed ?? fallback
}

// ========== コントラスト比計算 ==========

/** 相対輝度（sRGB） */
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/** コントラスト比（WCAG）: 1.0 〜 21.0 */
export function contrastRatio(fg: RGBA, bg: RGBA): number {
  const l1 = luminance(fg.r, fg.g, fg.b)
  const l2 = luminance(bg.r, bg.g, bg.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** コントラストレベル判定（AAA/AA/低） */
export function contrastLevel(ratio: number): 'AAA' | 'AA' | 'low' {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'low'
}

// ========== プリセット⇔px 変換 ==========

/** px → 最寄りプリセット（1..10） */
export function pxToPresetIndex(
  px: number,
  table: number[],
  basePx: number
): FontPreset {
  const ratio = px / basePx
  let best: FontPreset = 5
  let minDiff = Infinity
  for (let i = 1; i <= 10; i++) {
    const diff = Math.abs(table[i] - ratio)
    if (diff < minDiff) {
      minDiff = diff
      best = i as FontPreset
    }
  }
  return best
}

/** フォントサイズ px → fontPreset */
export function fontPxToPreset(px: number): FontPreset {
  return pxToPresetIndex(px, FONT_K, 16)
}

/** パディング px → paddingPreset */
export function paddingPxToPreset(px: number): FontPreset {
  return pxToPresetIndex(px, PADDING_K, 16)
}

/** 角丸 px → radiusPreset */
export function radiusPxToPreset(px: number): FontPreset {
  let best: FontPreset = 5
  let minDiff = Infinity
  for (let i = 1; i <= 10; i++) {
    const diff = Math.abs(RADIUS_PX[i] - px)
    if (diff < minDiff) {
      minDiff = diff
      best = i as FontPreset
    }
  }
  return best
}

/** 枠線 px → borderPreset */
export function borderPxToPreset(px: number): FontPreset {
  let best: FontPreset = 3
  let minDiff = Infinity
  for (let i = 1; i <= 10; i++) {
    const diff = Math.abs(BORDER_PX[i] - px)
    if (diff < minDiff) {
      minDiff = diff
      best = i as FontPreset
    }
  }
  return best
}

/** タイプ速度 ms/char → typeSpeedPreset */
export function typeMsToPreset(ms: number): FontPreset {
  let best: FontPreset = 6
  let minDiff = Infinity
  for (let i = 1; i <= 10; i++) {
    const diff = Math.abs(TYPE_MS[i] - ms)
    if (diff < minDiff) {
      minDiff = diff
      best = i as FontPreset
    }
  }
  return best
}

/** scale(sm/md/lg) → windowPreset */
export function scaleToWindowPreset(scale?: 'sm' | 'md' | 'lg'): FontPreset {
  if (scale === 'sm') return 4
  if (scale === 'lg') return 8
  return 6 // md
}

// ========== v1 → v2 変換 ==========

/**
 * 旧テーマ(v1) を v2 へ丸め込む
 * 既存データからプリセット値を推定
 */
export function migrateToV2(v1: MessageTheme | MessageThemeV2 | undefined): MessageThemeV2 {
  // 既に v2 なら、色フィールドをRGBAオブジェクトに正規化してから返す
  if (v1 && 'themeVersion' in v1 && v1.themeVersion === 2) {
    const v2 = { ...v1 } as MessageThemeV2
    
    console.log('[migrateToV2] v2テーマを正規化中', v2)
    
    // 色フィールドが文字列の場合はRGBAオブジェクトに変換
    if (v2.frameBg && typeof v2.frameBg === 'string') {
      const parsed = parseColor(v2.frameBg)
      if (parsed) {
        console.log('[migrateToV2] frameBg を変換:', v2.frameBg, '→', parsed)
        v2.frameBg = parsed
      }
    }
    if (v2.frameBorder && typeof v2.frameBorder === 'string') {
      const parsed = parseColor(v2.frameBorder)
      if (parsed) v2.frameBorder = parsed
    }
    if (v2.nameBg && typeof v2.nameBg === 'string') {
      const parsed = parseColor(v2.nameBg)
      if (parsed) v2.nameBg = parsed
    }
    if (v2.textColor && typeof v2.textColor === 'string') {
      const parsed = parseColor(v2.textColor)
      if (parsed) v2.textColor = parsed
    }
    
    console.log('[migrateToV2] 正規化完了', v2)
    return v2
  }

  const old = v1 as MessageTheme | undefined

  // デフォルト
  const v2: MessageThemeV2 = {
    themeVersion: 2,
    rows: old?.text?.rows ?? 3,
    scale: old?.scale ?? 'md',
    fontPreset: 5,
    windowPreset: 6,
    paddingPreset: 5,
    radiusPreset: 5,
    borderPreset: 3,
    shadowPreset: 4,
    typeSpeedPreset: 6,
    frameBg: { r: 20, g: 24, b: 36, a: 0.72 },
    frameBorder: { r: 255, g: 255, b: 255, a: 0.2 },
    nameBg: { r: 0, g: 0, b: 0, a: 0.55 },
    textColor: { r: 255, g: 255, b: 255, a: 1 },
  }

  if (!old) return v2

  // fontPreset
  if (old.text?.fontPreset != null) {
    v2.fontPreset = old.text.fontPreset
  } else if (old.text?.size != null) {
    v2.fontPreset = fontPxToPreset(old.text.size)
  }

  // windowPreset
  if (old.scale) {
    v2.windowPreset = scaleToWindowPreset(old.scale)
  }

  // paddingPreset
  if (old.frame?.padding != null) {
    v2.paddingPreset = paddingPxToPreset(old.frame.padding)
  }

  // radiusPreset
  if (old.frame?.radius != null) {
    v2.radiusPreset = radiusPxToPreset(old.frame.radius)
  }

  // borderPreset
  if (old.frame?.borderWidth != null) {
    v2.borderPreset = borderPxToPreset(old.frame.borderWidth)
  }

  // typeSpeedPreset
  if (old.typewriter?.msPerChar != null) {
    v2.typeSpeedPreset = typeMsToPreset(old.typewriter.msPerChar)
  }

  // 色
  if (old.frame?.bg) {
    const parsed = parseColor(old.frame.bg)
    if (parsed) v2.frameBg = parsed
  }
  if (old.frame?.borderColor) {
    const parsed = parseColor(old.frame.borderColor)
    if (parsed) v2.frameBorder = parsed
  }
  if (old.name?.bg) {
    const parsed = parseColor(old.name.bg)
    if (parsed) v2.nameBg = parsed
  }
  if (old.text?.color) {
    const parsed = parseColor(old.text.color)
    if (parsed) v2.textColor = parsed
  }

  // 旧データ保持（fallback）
  v2.frame = old.frame
  v2.name = old.name
  v2.text = old.text
  v2.typewriter = old.typewriter

  return v2
}

// ========== v2 → CSS適用用のマッピング ==========

/**
 * v2テーマから実際の値（px/color/etc.）を取得
 */
export interface ResolvedTheme {
  fontK: number
  windowW: string
  windowH: string
  windowMb: string
  windowMw: string
  paddingK: number
  radiusPx: number
  borderPx: number
  shadowClass: string
  typeMs: number
  frameBgCss: string
  frameBorderCss: string
  nameBgCss: string
  textColorCss: string
  rows: number
  fontWeight: string
  fontStyle: string
  fontFamily: string | undefined
  textStrokeColorCss: string | undefined
  textStrokeWidth: number
}

export function resolveThemeV2(theme: MessageThemeV2 | MessageTheme | undefined): ResolvedTheme {
  const v2 = migrateToV2(theme as any)

  const fontK = FONT_K[v2.fontPreset ?? 5]
  const wp = v2.windowPreset ?? 6
  const win = WINDOW_PRESET[wp] ?? WINDOW_PRESET[6]
  const paddingK = PADDING_K[v2.paddingPreset ?? 5]
  const radiusPx = RADIUS_PX[v2.radiusPreset ?? 5]
  const borderPx = BORDER_PX[v2.borderPreset ?? 3]
  const shadowIdx = v2.shadowPreset ?? 4
  const shadowClass = shadowIdx === 1 ? 'shadow-none' : `shadow-${String(shadowIdx)}`
  const typeMs = TYPE_MS[v2.typeSpeedPreset ?? 6]

  const frameBgCss = rgbaToCss(toRgba(v2.frameBg))
  const frameBorderCss = rgbaToCss(toRgba(v2.frameBorder))
  const nameBgCss = rgbaToCss(toRgba(v2.nameBg))
  const textColorCss = rgbaToCss(toRgba(v2.textColor))

  const rows = v2.rows ?? 3
  const fontWeight = v2.fontWeight ?? 'normal'
  const fontStyle = v2.fontStyle ?? 'normal'
  const fontFamily = v2.fontFamily
  const textStrokeColorCss = v2.textStrokeColor ? rgbaToCss(toRgba(v2.textStrokeColor)) : undefined
  const textStrokeWidth = v2.textStrokeWidth ?? 0

  return {
    fontK,
    windowW: win.w,
    windowH: win.h,
    windowMb: win.mb,
    windowMw: win.mw,
    paddingK,
    radiusPx,
    borderPx,
    shadowClass,
    typeMs,
    frameBgCss,
    frameBorderCss,
    nameBgCss,
    textColorCss,
    rows,
    fontWeight,
    fontStyle,
    fontFamily,
    textStrokeColorCss,
    textStrokeWidth,
  }
}
