// The OP-1 screens, drawn to pixels: each function returns an Image source
// sized to a box of terminal cells.

import { AVATARS } from './avatars'
import { BLACK as BLACK_INK, BLUE, Canvas, DIM, GREEN, GREY, ORANGE, RED, WHITE } from './pixels'
import type { Rgb } from './pixels'

// one terminal cell, in logical pixels; the terminal scales the picture to its cells
export const CELL_W = 8
export const CELL_H = 16
// pictures are drawn at twice that, so one-pixel strokes land under a device pixel
const ZOOM = 2

// while true every picture draws its calibration frame
export const CALIBRATE = false

export type Pose = 'idle' | 'think' | 'work' | 'wait' | 'done' | 'fail'

const clock = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const shortModel = (model: string) => {
  const m = /(fable|opus|sonnet|haiku)/i.exec(model)
  return (m?.[1] ?? model).toUpperCase().slice(0, 6)
}

// TURN, left: the running clock and the turn number
export type ClockState = { isActive: boolean; elapsedMs: number; turns: number }

export const drawClock = (columns: number, rows: number, s: ClockState) => {
  const c = new Canvas(columns * CELL_W, rows * CELL_H, ZOOM)
  const H = c.height
  const midY = H / 2

  const scale = Math.max(2, Math.min(6, Math.floor((H - 12) / 5)))
  const timer = clock(s.elapsedMs)
  const tx = 0
  c.text(tx, midY - (5 * scale) / 2, timer, s.isActive ? WHITE : GREY, scale)
  c.text(tx, midY + (5 * scale) / 2 + 4, 'TURN', GREY, 2)

  const box = `[${s.turns}]`
  const bs = Math.max(2, scale - 2)
  c.text(tx + Canvas.textWidth(timer, scale) + 12, midY - (5 * bs) / 2, box, ORANGE, bs)

  if (CALIBRATE) c.calibrate(CELL_W, CELL_H)
  return c.source()
}

// TURN, right: model and mode chips, the context ladder; changes rarely
export type MachineState = { model: string; mode: string; ctxPercent: number; limits: { label: string; percent: number }[] }

export const drawMachine = (columns: number, rows: number, s: MachineState) => {
  const c = new Canvas(columns * CELL_W, rows * CELL_H, ZOOM)
  const H = c.height
  const midY = H / 2

  // ladders, flush right: the rate-limit windows outermost, CTX nearest the chips,
  // all at one pitch and one colour scale, each as wide as its caption needs
  const ladderW = 10
  const segs = Math.max(4, Math.floor((H - 12) / 5))
  let right = c.width - 1
  const ladder = (label: string, percent: number) => {
    const w = Math.max(ladderW, Canvas.textWidth(label, 2))
    c.text(right - Canvas.textWidth(label, 2), 2, label, GREY, 2)
    const lit = Math.round((percent / 100) * segs)
    for (let i = 0; i < segs; i++) {
      const y = H - 4 - i * 5
      const on = i < lit
      const col = i >= segs * 0.85 ? RED : i >= segs * 0.6 ? ORANGE : GREEN
      c.fill(right - ladderW, y - 3, ladderW, 3, on ? col : DIM)
    }
    right -= w + 8
  }
  for (const l of [...s.limits].reverse()) ladder(l.label, l.percent)
  ladder('CTX', s.ctxPercent)
  right -= 6

  const chip = (label: string, color: Rgb, y: number) => {
    const w = Canvas.textWidth(label, 2) + 10
    c.rect(right - w, y, w, 16, color, 1)
    c.text(right - w + 5, y + 3, label, color, 2)
  }
  chip(shortModel(s.model), WHITE, midY - 19)
  chip(s.mode.toUpperCase().slice(0, 10) || 'DEFAULT', s.mode === 'bypassPermissions' ? RED : BLUE, midY + 3)

  if (CALIBRATE) c.calibrate(CELL_W, CELL_H)
  return c.source()
}

// which athlete stands for an agent type
export const kindOf = (subagentType: string): string => {
  const t = subagentType.toLowerCase()
  if (t === 'lead') return 'lead'
  if (t.includes('explore')) return 'explore'
  if (t.includes('plan')) return 'plan'
  if (t.includes('general')) return 'general-purpose'
  if (t.includes('guide')) return 'guide'
  if (t.includes('review')) return 'review'
  if (t.includes('status')) return 'status'
  if (t.includes('workflow') || t.includes('team')) return 'workflow'
  return 'other'
}

// a stroke-font athlete from avatars.ts, scaled into its box; poses the athlete
// lacks fall back to idle with a mark drawn over it
export const drawFigure = (columns: number, rows: number, color: Rgb, pose: Pose, frame: number, kind = 'other') => {
  const c = new Canvas(columns * CELL_W, rows * CELL_H, ZOOM)
  const set = AVATARS[kind] ?? AVATARS['other'] ?? {}
  const strokes = set[pose] ?? set['idle'] ?? []
  const hasPose = set[pose] !== undefined

  const k = Math.min(c.width, c.height) / 64
  const t = 1
  const ox = (c.width - 64 * k) / 2
  const X = (x: number) => ox + x * k
  const Y = (y: number) => y * k

  // the body stands still; while thinking, the ellipsis (the white-accent
  // marks of that pose) ripples upward, one dot at a time
  let mark = 0
  for (const stroke of strokes) {
    const isMark = stroke.c !== null && stroke.c.toUpperCase() === '#FFFFFF'
    // a white accent (dots, marks, motion lines) takes the figure's own colour; props keep theirs
    const col = stroke.c && !isMark ? parseInt(stroke.c.replace('#', ''), 16) : color
    const lift = isMark && pose === 'think' ? ((frame + mark++) % 3 === 0 ? -k * 1.5 : 0) : 0
    for (let i = 2; i < stroke.p.length; i += 2) {
      c.line(X(stroke.p[i - 2]!), Y(stroke.p[i - 1]!) + lift, X(stroke.p[i]!), Y(stroke.p[i + 1]!) + lift, col, t)
    }
  }

  // marks over the figure for states without a drawing of their own
  if (pose === 'think' && !hasPose) {
    for (let i = 0; i < 3; i++) if ((frame + i) % 3 === 0) c.dot(X(50 + i * 4), Y(8 - i * 3), color, t)
  }
  if (!hasPose && pose === 'wait' && frame % 2 === 0) c.text(X(50), Y(2), '!', ORANGE, Math.max(1, Math.round(k * 0.6)))
  if (!hasPose && pose === 'done') c.text(X(48), Y(2), 'OK', GREEN, Math.max(1, Math.round(k * 0.5)))
  if (!hasPose && pose === 'fail') c.text(X(50), Y(2), 'X', RED, Math.max(1, Math.round(k * 0.6)))
  if (pose === 'work') {
    // motion dashes trailing the athlete
    for (let i = 0; i < 3; i++) if ((frame + i) % 2 === 0) c.line(X(4), Y(30 + i * 6), X(10), Y(30 + i * 6), color, 1)
  }

  if (CALIBRATE) c.calibrate(CELL_W, CELL_H)
  return c.source()
}

export type Dial = { label: string; value: number; color: Rgb }

// TOOLS: one needle gauge per tool channel, a big count beneath; each dial is
// its own small picture, laid out by the pane six to a row
export const DIAL_MAX_PER_ROW = 6
export const DIAL_MIN_W = 8 // cells a dial needs at the least
export const DIAL_ROWS = 7

export const gaugeLayout = (columns: number, count: number) => {
  const perRow = Math.max(1, Math.min(DIAL_MAX_PER_ROW, Math.floor(columns / DIAL_MIN_W)))
  const bands = Math.max(1, Math.ceil(count / perRow))
  const dialColumns = Math.max(DIAL_MIN_W, Math.floor(columns / DIAL_MAX_PER_ROW))
  return { perRow, bands, rows: bands * DIAL_ROWS, dialColumns }
}

export const drawDial = (columns: number, d: Dial, peak: number) => {
  const c = new Canvas(columns * CELL_W, DIAL_ROWS * CELL_H, ZOOM)
  const r = Math.min(34, Math.max(18, c.width * 0.2))
  const ns = r >= 30 ? 6 : 5
  const cx = r + 8 // the arc's left edge sits on the picture's
  const py = r + 14

  c.arc(cx, py, r, 200, 340, GREY)
  for (let k = 0; k <= 4; k++) {
    const a = ((200 + k * 35) * Math.PI) / 180
    c.line(cx + Math.cos(a) * (r + 3), py + Math.sin(a) * (r + 3), cx + Math.cos(a) * (r + 7), py + Math.sin(a) * (r + 7), GREY, 1)
  }
  const a = ((200 + 140 * Math.min(1, d.value / Math.max(1, peak))) * Math.PI) / 180
  c.line(cx, py, cx + Math.cos(a) * (r - 4), py + Math.sin(a) * (r - 4), d.color, 2)
  c.disc(cx, py, 2, d.color)

  const n = String(d.value).padStart(2, '0')
  c.text(cx - Canvas.textWidth(n, ns) / 2, py + 12, n, d.color, ns)
  const ls = 2
  c.text(cx - Canvas.textWidth(d.label, ls) / 2, py + 12 + 5 * ns + 6, d.label, GREY, ls)

  if (CALIBRATE) c.calibrate(CELL_W, CELL_H)
  return c.source()
}

// a section title: tiny caps and a rule to the right edge
export const drawTitle = (columns: number, label: string) => {
  const c = new Canvas(columns * CELL_W, CELL_H, ZOOM)
  const w = c.text(0, 4, label, GREY, 2)
  c.line(w + 8, 8, c.width - 1, 8, DIM, 1)
  return c.source()
}

// WORK: where the crew is working: branch, worktree, plan mode, in chips
export const WORK_ROWS = 2
export type WorkChips = { branch: string; worktree: string; isPlanning: boolean }

export const drawWork = (columns: number, w: WorkChips) => {
  const c = new Canvas(columns * CELL_W, WORK_ROWS * CELL_H, ZOOM)
  let x = 0
  const chip = (label: string, color: Rgb, isSolid = false) => {
    const text = label.toUpperCase().slice(0, 28)
    const width = Canvas.textWidth(text, 2) + 10
    if (isSolid) c.fill(x, 8, width, 16, color)
    else c.rect(x, 8, width, 16, color, 1)
    c.text(x + 5, 11, text, isSolid ? BLACK_INK : color, 2)
    x += width + 8
  }
  chip(w.branch || 'no branch', GREEN)
  if (w.worktree) chip(`WT ${w.worktree}`, BLUE)
  chip(w.isPlanning ? 'PLAN' : 'BUILD', w.isPlanning ? ORANGE : GREY, w.isPlanning)
  if (CALIBRATE) c.calibrate(CELL_W, CELL_H)
  return c.source()
}

export type TaskDot = { status: 'pending' | 'in_progress' | 'completed' }

// TASKS: the count, big; the node line is text beside it
export const TASK_ROWS = 2
export const drawTasks = (columns: number, tasks: TaskDot[]) => {
  const c = new Canvas(columns * CELL_W, TASK_ROWS * CELL_H, ZOOM)
  const done = tasks.filter(t => t.status === 'completed').length
  c.text(0, 8, `${done}/${tasks.length}`, WHITE, 3)
  if (CALIBRATE) c.calibrate(CELL_W, CELL_H)
  return c.source()
}
