// A tiny RGBA rasterizer: the mod draws its own pictures and hands the bytes
// to an Image element, so nothing leaves the module and no file is written.

export type Rgb = number // 0xRRGGBB

export const BLACK = 0x000000
// the OP-1 firmware's own colours, as read from its display SVGs
export const BLUE = 0x4d9eff
export const GREEN = 0x00ed95
export const WHITE = 0xffffff
export const ORANGE = 0xff3a5d // TE's "red": the fourth encoder colour
export const RED = 0xff3a5d
export const GREY = 0x6f7173
export const DIM = 0x2a2b2d

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

// es2023 has no Uint8Array#toBase64, so spell it out
export const base64 = (bytes: Uint8Array): string => {
  let out = ''
  let i = 0
  for (; i + 2 < bytes.length; i += 3) {
    const n = ((bytes[i] ?? 0) << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0)
    out += B64[(n >> 18) & 63]! + B64[(n >> 12) & 63]! + B64[(n >> 6) & 63]! + B64[n & 63]!
  }
  if (i < bytes.length) {
    const a = bytes[i] ?? 0
    const b = bytes[i + 1] ?? 0
    const n = (a << 16) | (b << 8)
    out += B64[(n >> 18) & 63]! + B64[(n >> 12) & 63]!
    out += i + 1 < bytes.length ? B64[(n >> 6) & 63]! : '='
    out += '='
  }
  return out
}

// 3x5 caps font; each glyph is five rows of three cells
const FONT: Record<string, string[]> = {
  '0': ['###', '# #', '# #', '# #', '###'],
  '1': [' # ', '## ', ' # ', ' # ', '###'],
  '2': ['###', '  #', '###', '#  ', '###'],
  '3': ['###', '  #', '###', '  #', '###'],
  '4': ['# #', '# #', '###', '  #', '  #'],
  '5': ['###', '#  ', '###', '  #', '###'],
  '6': ['###', '#  ', '###', '# #', '###'],
  '7': ['###', '  #', '  #', '  #', '  #'],
  '8': ['###', '# #', '###', '# #', '###'],
  '9': ['###', '# #', '###', '  #', '###'],
  A: [' # ', '# #', '###', '# #', '# #'],
  B: ['## ', '# #', '## ', '# #', '## '],
  C: ['###', '#  ', '#  ', '#  ', '###'],
  D: ['## ', '# #', '# #', '# #', '## '],
  E: ['###', '#  ', '## ', '#  ', '###'],
  F: ['###', '#  ', '## ', '#  ', '#  '],
  G: ['###', '#  ', '# #', '# #', '###'],
  H: ['# #', '# #', '###', '# #', '# #'],
  I: ['###', ' # ', ' # ', ' # ', '###'],
  J: ['  #', '  #', '  #', '# #', '###'],
  K: ['# #', '# #', '## ', '# #', '# #'],
  L: ['#  ', '#  ', '#  ', '#  ', '###'],
  M: ['# #', '###', '###', '# #', '# #'],
  N: ['## ', '# #', '# #', '# #', '# #'],
  O: ['###', '# #', '# #', '# #', '###'],
  P: ['###', '# #', '###', '#  ', '#  '],
  Q: ['###', '# #', '# #', '###', '  #'],
  R: ['## ', '# #', '## ', '# #', '# #'],
  S: ['###', '#  ', '###', '  #', '###'],
  T: ['###', ' # ', ' # ', ' # ', ' # '],
  U: ['# #', '# #', '# #', '# #', '###'],
  V: ['# #', '# #', '# #', '# #', ' # '],
  W: ['# #', '# #', '###', '###', '# #'],
  X: ['# #', '# #', ' # ', '# #', '# #'],
  Y: ['# #', '# #', ' # ', ' # ', ' # '],
  Z: ['###', '  #', ' # ', '#  ', '###'],
  ' ': ['   ', '   ', '   ', '   ', '   '],
  ':': ['   ', ' # ', '   ', ' # ', '   '],
  '.': ['   ', '   ', '   ', '   ', ' # '],
  '-': ['   ', '   ', '###', '   ', '   '],
  '/': ['  #', '  #', ' # ', '#  ', '#  '],
  '%': ['# #', '  #', ' # ', '#  ', '# #'],
  '[': ['## ', '#  ', '#  ', '#  ', '## '],
  ']': [' ##', '  #', '  #', '  #', ' ##'],
  '!': [' # ', ' # ', ' # ', '   ', ' # '],
  '?': ['###', '  #', ' ##', '   ', ' # '],
  '_': ['   ', '   ', '   ', '   ', '###'],
  '…': ['   ', '   ', '   ', '   ', '# #'],
}

export class Canvas {
  readonly width: number
  readonly height: number
  readonly data: Uint8Array

  constructor(width: number, height: number, bg: Rgb = BLACK) {
    this.width = Math.max(1, Math.round(width))
    this.height = Math.max(1, Math.round(height))
    this.data = new Uint8Array(this.width * this.height * 4)
    this.clear(bg)
  }

  clear(bg: Rgb) {
    for (let i = 0; i < this.data.length; i += 4) {
      this.data[i] = (bg >> 16) & 255
      this.data[i + 1] = (bg >> 8) & 255
      this.data[i + 2] = bg & 255
      this.data[i + 3] = 255
    }
  }

  px(x: number, y: number, c: Rgb) {
    x = Math.round(x)
    y = Math.round(y)
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return
    const i = (y * this.width + x) * 4
    this.data[i] = (c >> 16) & 255
    this.data[i + 1] = (c >> 8) & 255
    this.data[i + 2] = c & 255
    this.data[i + 3] = 255
  }

  // a square dot of side `t`, centred: every stroke is drawn with it
  dot(x: number, y: number, c: Rgb, t = 2) {
    const o = Math.floor(t / 2)
    for (let dy = 0; dy < t; dy++) for (let dx = 0; dx < t; dx++) this.px(x - o + dx, y - o + dy, c)
  }

  line(x0: number, y0: number, x1: number, y1: number, c: Rgb, t = 2) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))))
    for (let i = 0; i <= steps; i++) {
      const k = i / steps
      this.dot(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, c, t)
    }
  }

  rect(x: number, y: number, w: number, h: number, c: Rgb, t = 2) {
    this.line(x, y, x + w, y, c, t)
    this.line(x + w, y, x + w, y + h, c, t)
    this.line(x + w, y + h, x, y + h, c, t)
    this.line(x, y + h, x, y, c, t)
  }

  fill(x: number, y: number, w: number, h: number, c: Rgb) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c)
  }

  // angles in degrees, 0 at 3 o'clock, clockwise on screen
  arc(cx: number, cy: number, r: number, a0: number, a1: number, c: Rgb, t = 2) {
    const steps = Math.max(8, Math.ceil((Math.abs(a1 - a0) / 360) * r * 8))
    for (let i = 0; i <= steps; i++) {
      const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180
      this.dot(cx + Math.cos(a) * r, cy + Math.sin(a) * r, c, t)
    }
  }

  circle(cx: number, cy: number, r: number, c: Rgb, t = 2) {
    this.arc(cx, cy, r, 0, 360, c, t)
  }

  disc(cx: number, cy: number, r: number, c: Rgb) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) this.px(cx + x, cy + y, c)
  }

  // the 3x5 font at `s` pixels per cell; returns the width drawn
  text(x: number, y: number, s: string, c: Rgb, scale = 2, gap = 1): number {
    let cx = x
    for (const ch of s.toUpperCase()) {
      const rows = FONT[ch] ?? FONT['?']!
      rows.forEach((row, ry) => {
        for (let rx = 0; rx < 3; rx++) if (row[rx] === '#') this.fill(cx + rx * scale, y + ry * scale, scale, scale, c)
      })
      cx += (3 + gap) * scale
    }
    return cx - x
  }

  static textWidth(s: string, scale = 2, gap = 1) {
    return s.length * (3 + gap) * scale
  }

  // a calibration frame: the canvas edge, a tick per CELL column along the top
  // and per row down the left, so a screenshot shows how cells map to pixels
  calibrate(cellW: number, cellH: number) {
    this.rect(0, 0, this.width - 1, this.height - 1, DIM, 1)
    for (let x = 0; x < this.width; x += cellW) this.line(x, 0, x, x % (cellW * 10) === 0 ? 6 : 3, GREY, 1)
    for (let y = 0; y < this.height; y += cellH) this.line(0, y, y % (cellH * 5) === 0 ? 6 : 3, y, GREY, 1)
    this.text(this.width - Canvas.textWidth(`${this.width}X${this.height}`, 1) - 2, this.height - 7, `${this.width}X${this.height}`, GREY, 1)
  }

  // the terminal trims a picture to its non-black bounds and centres the rest,
  // which floats every drawing off the pane's edges: a pixel in each corner,
  // one shade off black, keeps the bounds the whole canvas
  source() {
    const PIN = 0x060606
    this.px(0, 0, PIN)
    this.px(this.width - 1, 0, PIN)
    this.px(0, this.height - 1, PIN)
    this.px(this.width - 1, this.height - 1, PIN)
    return { rgba: base64(this.data), width: this.width, height: this.height }
  }
}
