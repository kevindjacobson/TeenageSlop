// A tiny RGBA rasterizer: the mod draws its own pictures and hands the bytes
// to an Image element, so nothing leaves the module and no file is written.
//
// A canvas has a zoom: its logical size is what the scene lays out in, its
// pixel size is zoom times that. Coordinates are logical; stroke thickness is
// in pixels, so a drawing zoomed 2x keeps one-pixel lines that land under a
// device pixel once the terminal scales the picture into its cells.

export type Rgb = number // 0xRRGGBB

// the OP-1 firmware's own colours, as read from its display SVGs
export const BLACK = 0x000000
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

// A monoline stroke font in the OP-1's spirit: each glyph is a list of
// polylines in a 4-wide, 7-tall grid (x 0..4, y 0..7, baseline at 7), drawn
// with one stroke width whatever the size. Rounded corners are a point or two
// on the way round.
type Poly = number[] // x0,y0,x1,y1,...
const G: Record<string, Poly[]> = {
  '0': [[1, 0, 3, 0, 4, 1, 4, 6, 3, 7, 1, 7, 0, 6, 0, 1, 1, 0]],
  '1': [[0.5, 1.5, 2, 0, 2, 7]],
  '2': [[0, 1, 1, 0, 3, 0, 4, 1, 4, 2.5, 0, 6.5, 0, 7, 4, 7]],
  '3': [[0, 1, 1, 0, 3, 0, 4, 1, 4, 2.5, 3, 3.5, 1.5, 3.5], [3, 3.5, 4, 4.5, 4, 6, 3, 7, 1, 7, 0, 6]],
  '4': [[3, 7, 3, 0, 0, 4.5, 0, 5, 4, 5]],
  '5': [[4, 0, 0, 0, 0, 3, 3, 3, 4, 4, 4, 6, 3, 7, 1, 7, 0, 6]],
  '6': [[3.5, 0, 1, 0, 0, 1, 0, 6, 1, 7, 3, 7, 4, 6, 4, 4, 3, 3, 0, 3]],
  '7': [[0, 0, 4, 0, 1.5, 7]],
  '8': [[1, 0, 3, 0, 4, 1, 4, 2.5, 3, 3.5, 1, 3.5, 0, 2.5, 0, 1, 1, 0], [1, 3.5, 0, 4.5, 0, 6, 1, 7, 3, 7, 4, 6, 4, 4.5, 3, 3.5]],
  '9': [[4, 4, 1, 4, 0, 3, 0, 1, 1, 0, 3, 0, 4, 1, 4, 6, 3, 7, 0.5, 7]],
  A: [[0, 7, 0, 2, 2, 0, 4, 2, 4, 7], [0, 4.5, 4, 4.5]],
  B: [[0, 0, 0, 7, 3, 7, 4, 6, 4, 4.5, 3, 3.5, 0, 3.5], [3, 3.5, 4, 2.5, 4, 1, 3, 0, 0, 0]],
  C: [[4, 1, 3, 0, 1, 0, 0, 1, 0, 6, 1, 7, 3, 7, 4, 6]],
  D: [[0, 0, 0, 7, 2, 7, 4, 5, 4, 2, 2, 0, 0, 0]],
  E: [[4, 0, 0, 0, 0, 7, 4, 7], [0, 3.5, 3, 3.5]],
  F: [[4, 0, 0, 0, 0, 7], [0, 3.5, 3, 3.5]],
  G: [[4, 1, 3, 0, 1, 0, 0, 1, 0, 6, 1, 7, 3, 7, 4, 6, 4, 4, 2, 4]],
  H: [[0, 0, 0, 7], [4, 0, 4, 7], [0, 3.5, 4, 3.5]],
  I: [[1, 0, 3, 0], [2, 0, 2, 7], [1, 7, 3, 7]],
  J: [[4, 0, 4, 6, 3, 7, 1, 7, 0, 6]],
  K: [[0, 0, 0, 7], [4, 0, 0, 4], [1.2, 2.8, 4, 7]],
  L: [[0, 0, 0, 7, 4, 7]],
  M: [[0, 7, 0, 0, 2, 3, 4, 0, 4, 7]],
  N: [[0, 7, 0, 0, 4, 7, 4, 0]],
  O: [[1, 0, 3, 0, 4, 1, 4, 6, 3, 7, 1, 7, 0, 6, 0, 1, 1, 0]],
  P: [[0, 7, 0, 0, 3, 0, 4, 1, 4, 3, 3, 4, 0, 4]],
  Q: [[1, 0, 3, 0, 4, 1, 4, 6, 3, 7, 1, 7, 0, 6, 0, 1, 1, 0], [2.5, 5.5, 4.5, 7.5]],
  R: [[0, 7, 0, 0, 3, 0, 4, 1, 4, 3, 3, 4, 0, 4], [2, 4, 4, 7]],
  S: [[4, 1, 3, 0, 1, 0, 0, 1, 0, 2.5, 1, 3.5, 3, 3.5, 4, 4.5, 4, 6, 3, 7, 1, 7, 0, 6]],
  T: [[0, 0, 4, 0], [2, 0, 2, 7]],
  U: [[0, 0, 0, 6, 1, 7, 3, 7, 4, 6, 4, 0]],
  V: [[0, 0, 2, 7, 4, 0]],
  W: [[0, 0, 1, 7, 2, 3, 3, 7, 4, 0]],
  X: [[0, 0, 4, 7], [4, 0, 0, 7]],
  Y: [[0, 0, 2, 3.5, 4, 0], [2, 3.5, 2, 7]],
  Z: [[0, 0, 4, 0, 0, 7, 4, 7]],
  ' ': [],
  ':': [[2, 2, 2, 2.3], [2, 5, 2, 5.3]],
  '.': [[2, 6.7, 2, 7]],
  '-': [[0.5, 3.5, 3.5, 3.5]],
  '/': [[0, 7, 4, 0]],
  '%': [[0.5, 0.5, 0.5, 0.8], [0, 7, 4, 0], [3.5, 6.5, 3.5, 6.8]],
  '[': [[3, 0, 1, 0, 1, 7, 3, 7]],
  ']': [[1, 0, 3, 0, 3, 7, 1, 7]],
  '!': [[2, 0, 2, 4.5], [2, 6.7, 2, 7]],
  '?': [[0, 1, 1, 0, 3, 0, 4, 1, 4, 2.5, 2, 4, 2, 5], [2, 6.7, 2, 7]],
  '_': [[0, 7, 4, 7]],
  '…': [[0.3, 6.7, 0.3, 7], [2, 6.7, 2, 7], [3.7, 6.7, 3.7, 7]],
  '·': [[2, 3.5, 2, 3.8]],
}
// a glyph is 4 wide plus a gap of 1.6, so one character of `scale` advances
// 4 * scale logical pixels, as the old block font did
const ADVANCE = 5.6
const UNIT = 5 / 7 // scale -> logical pixels per grid unit, keeping a cap height of 5 * scale

export class Canvas {
  readonly width: number // logical
  readonly height: number
  readonly zoom: number
  readonly pw: number // pixels
  readonly ph: number
  readonly data: Uint8Array

  constructor(width: number, height: number, zoom = 1, bg: Rgb = BLACK) {
    this.width = Math.max(1, Math.round(width))
    this.height = Math.max(1, Math.round(height))
    this.zoom = zoom
    this.pw = Math.round(this.width * zoom)
    this.ph = Math.round(this.height * zoom)
    this.data = new Uint8Array(this.pw * this.ph * 4)
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

  // one pixel, in pixel coordinates
  px(x: number, y: number, c: Rgb) {
    x = Math.round(x)
    y = Math.round(y)
    if (x < 0 || y < 0 || x >= this.pw || y >= this.ph) return
    const i = (y * this.pw + x) * 4
    this.data[i] = (c >> 16) & 255
    this.data[i + 1] = (c >> 8) & 255
    this.data[i + 2] = c & 255
    this.data[i + 3] = 255
  }

  // a square dot of side `t` pixels, centred on a logical point: every stroke is drawn with it
  dot(x: number, y: number, c: Rgb, t = 1) {
    const o = Math.floor(t / 2)
    const px = x * this.zoom
    const py = y * this.zoom
    for (let dy = 0; dy < t; dy++) for (let dx = 0; dx < t; dx++) this.px(px - o + dx, py - o + dy, c)
  }

  line(x0: number, y0: number, x1: number, y1: number, c: Rgb, t = 1) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * this.zoom))
    for (let i = 0; i <= steps; i++) {
      const k = i / steps
      this.dot(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, c, t)
    }
  }

  poly(points: number[], c: Rgb, t = 1) {
    for (let i = 2; i < points.length; i += 2) this.line(points[i - 2]!, points[i - 1]!, points[i]!, points[i + 1]!, c, t)
  }

  rect(x: number, y: number, w: number, h: number, c: Rgb, t = 1) {
    this.poly([x, y, x + w, y, x + w, y + h, x, y + h, x, y], c, t)
  }

  fill(x: number, y: number, w: number, h: number, c: Rgb) {
    const x0 = Math.round(x * this.zoom)
    const y0 = Math.round(y * this.zoom)
    const x1 = Math.round((x + w) * this.zoom)
    const y1 = Math.round((y + h) * this.zoom)
    for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) this.px(i, j, c)
  }

  // angles in degrees, 0 at 3 o'clock, clockwise on screen
  arc(cx: number, cy: number, r: number, a0: number, a1: number, c: Rgb, t = 1) {
    const steps = Math.max(8, Math.ceil((Math.abs(a1 - a0) / 360) * r * 8 * this.zoom))
    for (let i = 0; i <= steps; i++) {
      const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180
      this.dot(cx + Math.cos(a) * r, cy + Math.sin(a) * r, c, t)
    }
  }

  circle(cx: number, cy: number, r: number, c: Rgb, t = 1) {
    this.arc(cx, cy, r, 0, 360, c, t)
  }

  disc(cx: number, cy: number, r: number, c: Rgb) {
    const rp = r * this.zoom
    const cxp = cx * this.zoom
    const cyp = cy * this.zoom
    for (let y = -rp; y <= rp; y++) for (let x = -rp; x <= rp; x++) if (x * x + y * y <= rp * rp) this.px(cxp + x, cyp + y, c)
  }

  // stroke text, cap height 5 * scale logical pixels, top-left at (x, y);
  // returns the width advanced. Stroke width grows gently with the size.
  text(x: number, y: number, s: string, c: Rgb, scale = 2, t?: number): number {
    const u = scale * UNIT
    const width = t ?? Math.max(1, Math.round(u * this.zoom * 0.28))
    let cx = x
    for (const ch of s.toUpperCase()) {
      const polys = G[ch] ?? G['?']!
      for (const p of polys) {
        const pts: number[] = []
        for (let i = 0; i < p.length; i += 2) pts.push(cx + p[i]! * u, y + p[i + 1]! * u)
        this.poly(pts, c, width)
      }
      cx += ADVANCE * u
    }
    return cx - x
  }

  static textWidth(s: string, scale = 2) {
    return s.length * ADVANCE * scale * UNIT
  }

  // a calibration frame: the canvas edge, a tick per cell column along the
  // top and per row down the left, so a screenshot shows how cells map to pixels
  calibrate(cellW: number, cellH: number) {
    this.rect(0, 0, this.width - 1, this.height - 1, DIM, 1)
    for (let x = 0; x < this.width; x += cellW) this.line(x, 0, x, x % (cellW * 10) === 0 ? 6 : 3, GREY, 1)
    for (let y = 0; y < this.height; y += cellH) this.line(0, y, y % (cellH * 5) === 0 ? 6 : 3, y, GREY, 1)
    this.text(this.width - Canvas.textWidth(`${this.pw}X${this.ph}`, 1) - 2, this.height - 7, `${this.pw}X${this.ph}`, GREY, 1)
  }

  // the terminal trims a picture to its non-black bounds and centres the rest,
  // which floats every drawing off the pane's edges: a pixel in each corner,
  // one shade off black, keeps the bounds the whole canvas
  source() {
    const PIN = 0x060606
    this.px(0, 0, PIN)
    this.px(this.pw - 1, 0, PIN)
    this.px(0, this.ph - 1, PIN)
    this.px(this.pw - 1, this.ph - 1, PIN)
    return { rgba: base64(this.data), width: this.pw, height: this.ph }
  }
}
