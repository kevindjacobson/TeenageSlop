import { atom, read, update } from 'claude-code'
import type { Register, StateDollar } from 'claude-code'

import { BLUE, GREEN, GREY, ORANGE, WHITE } from './pixels'
import type { Picture } from './pixels'
import { DIAL_ROWS, TASK_ROWS, WORK_ROWS, drawClock, drawDial, drawFigure, drawMachine, drawTasks, drawTitle, drawWork, gaugeLayout, kindOf } from './scene'
import type { Pose } from './scene'
import type { Limit, Guy, Machine, Run, Shell, Track, Turn, Work } from '../types'

const PANE = 'op1-crew'
const TITLE = 'OP-1 · CREW'
const CREW_COLORS = [GREEN, WHITE, ORANGE, BLUE]
const HEADER_ROWS = 4
const TITLE_COLS = 9
const TASKS_COLS = 8
const CLOCK_COLS = 30
const MACHINE_COLS = 22
const LIMIT_COLS = 4 // columns one rate-limit ladder adds to the machine picture
const LEAD_COLS = 14
const LEAD_ROWS = 7
const GUY_ROWS = 7

const crew = atom({ plugin: 'op1-crew', key: 'crew' } as const, [])
const tracks = atom({ plugin: 'op1-crew', key: 'tracks' } as const, [])
const meters = atom({ plugin: 'op1-crew', key: 'meters' } as const, {})
const ticker = atom({ plugin: 'op1-crew', key: 'ticker' } as const, [])
const frame = atom({ plugin: 'op1-crew', key: 'frame' } as const, 0)
const turn = atom({ plugin: 'op1-crew', key: 'turn' } as const, { isActive: false, startedAt: 0, elapsed: 0, count: 0 })
const machine = atom({ plugin: 'op1-crew', key: 'machine' } as const, { model: '', mode: '', ctxPercent: 0, limits: [] as Limit[] })
const shells = atom({ plugin: 'op1-crew', key: 'shells' } as const, [])
const work = atom({ plugin: 'op1-crew', key: 'work' } as const, { cwd: '', branch: '', worktree: '', isPlanning: false, goal: '' })
const runs = atom({ plugin: 'op1-crew', key: 'runs' } as const, [] as Run[])

// the shapes newer fields take when an older version's state comes back from the store
const withTurnDefaults = (t: Partial<Turn>): Turn => ({ isActive: false, startedAt: 0, elapsed: 0, count: 0, ...t })
const withMachineDefaults = (m: Partial<Machine>): Machine => ({ model: '', mode: '', ctxPercent: 0, limits: [], ...m })

// the crew shows at most this many figures; past it, helpers collapse to one figure per kind
const MAX_FIGURES = 9
// a run id reads as its first four characters after wf_
const runLabel = (id: string) => `WF_${id.replace(/^wf_/, '').slice(0, 4).toUpperCase()}`

type WorkDollar = StateDollar & { process: { run: (argv: readonly string[], init?: { cwd?: string }) => Promise<{ exitCode: number; stdout: string }> }; session: { cwd: () => Promise<string>; root: () => Promise<string> } }

// the engine's own task list replaces whatever the session kept
type TaskDollar = StateDollar & { tool: { call: (input: { tool: 'TaskList' }) => Promise<{ deny?: string; isError?: boolean; result?: { tasks?: { id: string; subject: string; status: Track['status'] }[] } }> } }
const syncTasks = async ($: unknown) => {
  try {
    const ran = await ($ as TaskDollar).tool.call({ tool: 'TaskList' })
    if (ran.deny !== undefined || ran.isError || !ran.result?.tasks) return
    const list = ran.result.tasks.map(t => ({ id: t.id, text: t.subject, status: t.status }))
    await update($ as StateDollar, tracks, () => list)
  } catch {
    // no task tools in this session: the tool-driven list stands
  }
}

const git = async ($: WorkDollar, cwd: string, ...args: string[]) => {
  try {
    const ran = await $.process.run(['git', ...args], { cwd })
    return ran.exitCode === 0 ? ran.stdout.trim() : ''
  } catch {
    return ''
  }
}

// where the crew works now: the branch, and the worktree when not the main one
const measureWork = async ($: WorkDollar) => {
  const [cwd, root] = await Promise.all([$.session.cwd(), $.session.root()])
  const [branch, top, common] = await Promise.all([
    git($, cwd, 'symbolic-ref', '--short', 'HEAD'),
    git($, cwd, 'rev-parse', '--show-toplevel'),
    git($, cwd, 'rev-parse', '--git-common-dir'),
  ])
  const isWorktree = top !== '' && common !== '' && common !== '.git' && !common.endsWith('/.git') === false && !top.endsWith(common.replace(/\/\.git$/, ''))
  const worktree = isWorktree ? top.split('/').pop() ?? '' : ''
  await update($, work, w => ({ ...w, cwd, branch: branch === 'HEAD' ? 'detached' : branch, worktree }))
  void root
}

const LEAD: Guy = { id: 'lead', kind: 'lead', name: 'LEAD', color: BLUE, job: 'standing by', isBusy: false, isDone: false, isFailed: false, isWaiting: false }

const CHANNELS: [string, RegExp][] = [
  ['READ', /^(Read|Glob|Grep|LS|NotebookRead)$/],
  ['EDIT', /^(Edit|Write|MultiEdit|NotebookEdit)$/],
  ['SHELL', /^(Bash|Monitor|BashOutput|KillShell)$/],
  ['WEB', /^(WebFetch|WebSearch)$/],
  ['AGENT', /^(Agent|Task|SendMessage|Workflow)$/],
  ['SKILL', /^Skill$/],
  ['MCP', /^mcp__/],
]
// the window names the engine reports, as two-character captions
const limitLabel = (kind: string) => (kind === 'five_hour' ? '5H' : kind === 'seven_day' ? '7D' : kind.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 3))

const channelOf = (tool: string) => CHANNELS.find(([, re]) => re.test(tool))?.[0] ?? 'OTHER'

const asRgb = (c: unknown): number =>
  typeof c === 'number' ? c : typeof c === 'string' && /^#?[0-9a-f]{6}$/i.test(c) ? parseInt(c.replace('#', ''), 16) : WHITE

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`

const short = (text: string, n: number) => (text.length > n ? text.slice(0, Math.max(0, n - 1)) + '…' : text)

const poseOf = (g: Guy): Pose =>
  g.isFailed ? 'fail' : g.isWaiting ? 'wait' : g.isDone ? 'done' : g.isBusy ? (g.tool ? 'work' : 'think') : 'idle'

// each picture is drawn once per distinct input: drawing and shipping pixels is the costly part
const pictures = new Map<string, Picture>()
const memo = (key: string, draw: () => Picture) => {
  const hit = pictures.get(key)
  if (hit) return hit
  if (pictures.size > 256) pictures.clear()
  const made = draw()
  pictures.set(key, made)
  return made
}

// how many frames a pose cycles over, so its pictures repeat from the memo
const CYCLE: Record<Pose, number> = { idle: 1, think: 6, work: 2, wait: 2, done: 1, fail: 1 }

const say = ($: StateDollar, line: string) => update($, ticker, list => [...list, line].slice(-3))

const setGuy = ($: StateDollar, match: (g: Guy) => boolean, fn: (g: Guy) => Guy) =>
  update($, crew, list => list.map(g => (match(g) ? fn(g) : g)))

const byAgent = (agentId?: string) => (g: Guy) => (agentId ? g.agentId === agentId : g.id === 'lead')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // state outlives a reload: bring entries the earlier version wrote up to this shape
    await update($, crew, list => {
      const fixed = list.map(g => ({ ...LEAD, ...g, color: asRgb(g.color as unknown), kind: g.kind ?? (g.id === 'lead' ? 'lead' : kindOf(g.name)) }))
      // an earlier version keyed a workflow run's agents by one shared id; a pane with two of a key is refused
      const seen = new Set<string>()
      const unique = fixed.filter(g => !seen.has(g.id) && seen.add(g.id))
      return unique.some(g => g.id === 'lead') ? unique : [LEAD, ...unique]
    })
    await update($, ticker, () => [])
    await update($, turn, t => withTurnDefaults(t))
    await update($, machine, m => withMachineDefaults(m))
    const [model, count] = await Promise.all([$.session.model(), $.session.turns()])
    await update($, machine, m => ({ ...m, model }))
    await update($, turn, t => ({ ...t, count }))
    await $.command.register({ name: 'crew', description: 'Open the OP-1 crew pane' })
    await $.command.register({ name: 'crew-goal', description: 'Set the goal shown in the crew pane (empty clears it)', argumentHint: '<goal>' })
    await measureWork($ as unknown as WorkDollar)
    await syncTasks($)
    const stored = await $.store.get(`goal:${await $.session.cwd()}`)
    if (typeof stored === 'string') await update($, work, w => ({ ...w, goal: stored }))
    void $.ui.open({ id: PANE, title: TITLE })

    // the animation clock: only advances while someone is working
    $.clock.every(1000, async () => {
      const t = await read($, turn)
      const list = await read($, crew)
      if (!t.isActive && !list.some(g => g.isBusy || g.isWaiting)) return
      await update($, frame, n => (n + 1) % 100000)
      if (t.isActive) {
        const now = await $.clock.now()
        await update($, turn, x => ({ ...x, elapsed: now - x.startedAt }))
      }
    })

    return next(e)
  })

  on('command.run', { command: 'crew-goal' }, async ($, e) => {
    const goal = (e.args ?? '').trim()
    await update($, work, w => ({ ...w, goal }))
    await $.store.set(`goal:${await $.session.cwd()}`, goal)
    return { text: goal ? `Goal set: ${goal}` : 'Goal cleared.' }
  })

  on('classic.CwdChanged', async ($, e, next) => {
    await measureWork($ as unknown as WorkDollar)
    return next(e)
  })

  on('classic.WorktreeCreate', async ($, e, next) => {
    const ran = await next(e)
    await measureWork($ as unknown as WorkDollar)
    return ran
  })

  on('classic.WorktreeRemove', async ($, e, next) => {
    const ran = await next(e)
    await measureWork($ as unknown as WorkDollar)
    return ran
  })

  on('tool.call', { tool: 'EnterPlanMode' }, async ($, e, next) => {
    const ran = await next(e)
    await update($, work, w => ({ ...w, isPlanning: true }))
    return ran
  })

  on('tool.call', { tool: 'ExitPlanMode' }, async ($, e, next) => {
    const ran = await next(e)
    await update($, work, w => ({ ...w, isPlanning: false }))
    return ran
  })

  // every shell command is a row under SHELL: live while it runs, then marked
  // done or failed; a background one stays live until its notification lands.
  // A git command that can move HEAD also refreshes the branch chip.
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const id = e.tool_use_id ?? `${await $.clock.now()}`
    const startedAt = await $.clock.now()
    const text = e.description?.trim() || e.command.trim().split('\n')[0] || 'shell'
    const row: Shell = { id, text, startedAt, isBackground: e.run_in_background === true, isError: false, isInterrupted: false }
    await update($, shells, list => [...list, row].slice(-12))

    const ran = await next(e)

    const endedAt = await $.clock.now()
    const result = (ran.deny === undefined ? ran.result : undefined) as { backgroundTaskId?: string; interrupted?: boolean } | undefined
    const taskId = result?.backgroundTaskId
    await update($, shells, list =>
      list.map(sh =>
        sh.id !== id ? sh
          : taskId ? { ...sh, isBackground: true, taskId }
          : { ...sh, endedAt, isError: ran.deny !== undefined || ran.isError === true, isInterrupted: result?.interrupted === true },
      ),
    )
    if (/\bgit\s+(checkout|switch|commit|merge|rebase|pull|worktree|init|branch)\b/.test(e.command)) await measureWork($ as unknown as WorkDollar)
    return ran
  })

  // when the session stops, a background shell the engine no longer lists is over
  on('classic.Stop', async ($, e, next) => {
    const live = new Set((e.background_tasks ?? []).map(t => t.id))
    const now = await $.clock.now()
    await update($, shells, list => list.map(sh => (sh.taskId && sh.endedAt === undefined && !live.has(sh.taskId) ? { ...sh, endedAt: now } : sh)))
    return next(e)
  })

  on('command.run', { command: 'crew' }, async $ => {
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: 'Crew pane opened.' }
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.origin?.kind === 'task-notification') {
      const taskId = /<task-id>([^<]+)<\/task-id>/.exec(e.text)?.[1]
      const status = /<status>([^<]+)<\/status>/.exec(e.text)?.[1] ?? 'completed'
      const now = await $.clock.now()
      if (taskId) {
        await update($, shells, list =>
          list.map(sh => (sh.taskId === taskId && sh.endedAt === undefined ? { ...sh, endedAt: now, isError: status !== 'completed' } : sh)),
        )
      }
      return next(e)
    }
    // a prompt counts a turn; the engine's own turn.start says when work begins
    await update($, turn, t => ({ ...t, count: t.count + 1 }))
    return next(e)
  })

  // the main loop's turn: the clock runs and the lead works from here to turn.complete
  on('turn.start', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)
    const now = await $.clock.now()
    await update($, turn, t => ({ ...withTurnDefaults(t), isActive: true, startedAt: now, elapsed: 0 }))
    // finished helpers go home when a new turn starts
    await update($, crew, list =>
      list
        .filter(g => g.id === 'lead' || !g.isDone)
        .map(g => (g.id === 'lead' ? { ...g, isBusy: true, isWaiting: false, isFailed: false, job: 'thinking', tool: undefined } : g)),
    )
    await update($, runs, all => all.filter(x => x.endedAt === undefined))
    await say($, '▶ turn started')
    return next(e)
  })

  // No turn.step hook: a streaming hook relays every chunk of the response through the
  // plugin's environment, which slowed the whole TUI. What a turn cost comes from turn.complete.

  on('classic.UserPromptSubmit', async ($, e, next) => {
    if (e.permission_mode) await update($, machine, m => ({ ...m, mode: e.permission_mode ?? m.mode }))
    return next(e)
  })

  // the context fill and the rate-limit windows, pushed after each main-thread turn
  on('session.measure', async ($, e, next) => {
    const percent = e.context.percent
    const limits = (e.rateLimits ?? []).map(l => ({ label: limitLabel(l.kind), percent: Math.round(l.percentUsed) }))
    await update($, machine, m => ({ ...m, ctxPercent: percent ?? m.ctxPercent, limits }))
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (!('agentId' in e && e.agentId)) {
      await update($, turn, x => ({ ...withTurnDefaults(x), isActive: false }))
      await setGuy($, byAgent(), g => ({
        ...g,
        isBusy: false,
        isWaiting: false,
        isFailed: e.reason === 'error',
        job: e.reason === 'aborted' ? 'interrupted' : e.reason === 'error' ? 'error' : 'standing by',
        tool: undefined,
      }))
      await say($, e.reason === 'aborted' ? '■ interrupted' : e.reason === 'error' ? '✕ turn failed' : '■ turn done')
    }
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    // the mod's own calls (the TaskList sync at start) are not the crew at work
    if (next.origin.plugin === $.plugin.name) return next(e)
    const channel = channelOf(e.tool)
    await update($, meters, m => ({ ...m, [channel]: (m[channel] ?? 0) + 1 }))
    await setGuy($, byAgent(e.agentId), g => ({ ...g, isBusy: true, isWaiting: false, tool: e.tool, job: g.id === 'lead' ? 'working' : g.job }))

    const ran = await next(e)

    if (ran.deny === undefined && ran.isError) {
      await say($, `✕ ${e.tool} failed`)
    }
    // the Workflow call returns once its script is done: its runs end, their figures stay until the next turn
    if (e.tool === 'Workflow') {
      const now = await $.clock.now()
      await update($, runs, all => all.map(x => (x.endedAt === undefined ? { ...x, endedAt: now } : x)))
      await say($, ran.isError ? '✕ run failed' : '■ run done')
    }
    // back to thinking between calls; the next call sets a tool again. A permission
    // prompt raised during the call has been answered by now, so the wait is over.
    await setGuy($, byAgent(e.agentId), g => ({ ...g, tool: undefined, isWaiting: false, job: g.isWaiting ? 'working' : g.job }))
    return ran
  })

  // tasks: the classic TodoWrite list replaces the list wholesale
  on('tool.call', { tool: 'TodoWrite' }, async ($, e, next) => {
    await update($, tracks, () =>
      e.todos.map((t, i) => ({ id: String(i + 1), text: t.status === 'in_progress' ? t.activeForm : t.content, status: t.status })),
    )
    return next(e)
  })

  // tasks: the task tools add and move one at a time
  on('tool.call', { tool: 'TaskCreate' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && !ran.isError && ran.result?.task) {
      const task = ran.result.task
      await update($, tracks, list => [...list, { id: task.id, text: task.subject, status: 'pending' as const }])
    }
    return ran
  })

  on('tool.call', { tool: 'TaskUpdate' }, async ($, e, next) => {
    const ran = await next(e)
    const status = e.status
    await update($, tracks, list =>
      status === 'deleted'
        ? list.filter(t => t.id !== e.taskId)
        : list.map(t => (t.id === e.taskId ? { ...t, text: e.subject ?? t.text, status: status ?? t.status } : t)),
    )
    return ran
  })

  on('agent.spawn', async ($, e, next) => {
    const list = await read($, crew)
    // a workflow run's agents all share the Workflow call's tool_use_id: the agent index tells them apart
    const wf = e.workflow
    const runId = wf ? wf.runId || e.tool_use_id : undefined
    const id = wf ? `${runId}#${wf.agentIndex}` : e.tool_use_id || `${list.length}`
    const guy: Guy = {
      id,
      kind: wf ? 'workflow' : kindOf(e.subagentType || ''),
      name: wf ? `${(e.subagentType || 'agent').toUpperCase().split('-')[0]!.slice(0, 8)}#${wf.agentIndex}` : (e.subagentType || 'helper').toUpperCase(),
      color: CREW_COLORS[list.length % CREW_COLORS.length] ?? WHITE,
      job: e.description,
      isBusy: true,
      isDone: false,
      isFailed: false,
      isWaiting: false,
      ...(wf ? { runId, index: wf.agentIndex } : {}),
    }
    await update($, crew, all => [...all, guy].slice(-64))
    if (runId) {
      const now = await $.clock.now()
      await update($, runs, all =>
        all.some(x => x.id === runId)
          ? all.map(x => (x.id === runId ? { ...x, spawned: x.spawned + 1 } : x))
          : [...all, { id: runId, startedAt: now, spawned: 1, done: 0 }],
      )
      if (!list.some(g => g.runId === runId)) await say($, `▶ run ${runLabel(runId)}`)
    } else {
      await say($, `+ ${guy.name} joins`)
    }

    const ran = await next(e)
    if (ran.deny === undefined && ran.agentId) {
      await setGuy($, g => g.id === guy.id, g => ({ ...g, agentId: ran.agentId }))
    }
    return ran
  })

  on('classic.SubagentStop', async ($, e, next) => {
    const stopped = (await read($, crew)).find(g => g.agentId === e.agent_id)
    await setGuy($, g => g.agentId === e.agent_id, g => ({ ...g, isBusy: false, isDone: true, tool: undefined }))
    if (stopped?.runId) await update($, runs, all => all.map(x => (x.id === stopped.runId ? { ...x, done: x.done + 1 } : x)))
    return next(e)
  })

  // waiting on the person (a permission prompt, idle input): the lead raises a hand
  on('classic.Notification', async ($, e, next) => {
    await setGuy($, byAgent(), g => ({ ...g, isWaiting: true, job: 'needs you' }))
    await say($, `✋ ${short(e.message, 40)}`)
    return next(e)
  })

  on('skill.prompt', async ($, e, next) => {
    await say($, `◆ skill ${e.skill}`)
    return next(e)
  })

  on('session.compact', async ($, e, next) => {
    await say($, '◀◀ compacting context')
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const [guys, list, levels, lines, f, t0, m0, w, shellRows, runList] = await Promise.all([
      read($, crew), read($, tracks), read($, meters), read($, ticker), read($, frame), read($, turn), read($, machine), read($, work), read($, shells), read($, runs),
    ])
    // state outlives a reload: entries an earlier version wrote may lack newer fields
    const t = withTurnDefaults(t0)
    const m = withMachineDefaults(m0)
    const now = t.startedAt + t.elapsed
    const mmss = (ms: number) => {
      const s = Math.max(0, Math.floor(ms / 1000))
      return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
    }
    const width = Math.max(24, e.props.bodyColumns ?? 40)
    const lead = guys.find(g => g.id === 'lead') ?? LEAD
    const all = guys.filter(g => g.id !== 'lead')
    // past MAX_FIGURES helpers: those needing the person stay on their own, the rest collapse to one figure per kind
    const shownHelpers = (): Guy[] => {
      if (all.length <= MAX_FIGURES) return all
      const own = all.filter(g => g.isWaiting || g.isFailed)
      const rest = all.filter(g => !g.isWaiting && !g.isFailed)
      const byKind = new Map<string, Guy[]>()
      for (const g of rest) byKind.set(g.kind, [...(byKind.get(g.kind) ?? []), g])
      const groups = [...byKind.entries()].map(([kind, members]) => {
        const lead = members.find(g => g.isBusy) ?? members[0]!
        const busy = members.some(g => g.isBusy)
        return { ...lead, id: `kind-${kind}`, name: `${kind.toUpperCase().slice(0, 8)} ×${members.length}`, isBusy: busy, isDone: !busy, tool: undefined }
      })
      return [...own, ...groups].slice(0, MAX_FIGURES)
    }
    const helpers = shownHelpers()
    const peak = Math.max(1, ...Object.values(levels))
    const dials = [...CHANNELS.map(([c]) => c), 'OTHER']
      .filter(c => levels[c])
      .map((label, i) => ({ label, value: levels[label] ?? 0, color: CREW_COLORS[(i + 3) % CREW_COLORS.length] ?? WHITE }))
    const done = list.filter(x => x.status === 'completed').length

    if (e.surface !== 'terminal') {
      const { Box, Text } = $.ui.resolve(e)
      return (
        <Box flexDirection="column">
          <Text>{lead.job} · tasks {done}/{list.length}</Text>
          {helpers.map(g => <Text key={g.id}>{g.name}: {g.job}</Text>)}
        </Box>
      )
    }

    const { Box, Button, Image, Text } = $.ui.resolve(e)
    const view = (agentId?: string) => () => void ($ as unknown as { ui: { view: (v: { agentId?: string }) => Promise<unknown> } }).ui.view(agentId ? { agentId } : {})
    const seconds = Math.floor(t.elapsed / 1000)
    const clockPic = memo(`clock:${width}:${t.isActive}:${seconds}:${t.count}`, () =>
      drawClock(Math.min(CLOCK_COLS, width), HEADER_ROWS, { isActive: t.isActive, elapsedMs: seconds * 1000, turns: t.count }))
    // each window adds a ladder; on a pane too narrow for them the header keeps CTX alone
    const machineCols = MACHINE_COLS + LIMIT_COLS * m.limits.length
    const shown = width >= CLOCK_COLS + machineCols ? m : { ...m, limits: [] }
    const shownCols = MACHINE_COLS + LIMIT_COLS * shown.limits.length
    const limitsKey = shown.limits.map(l => `${l.label}=${l.percent}`).join(',')
    const machinePic = memo(`machine:${shownCols}:${m.model}:${m.mode}:${m.ctxPercent}:${limitsKey}`, () =>
      drawMachine(shownCols, HEADER_ROWS, shown))
    const figure = (cols: number, rows: number, g: Guy) => {
      const pose = poseOf(g)
      const step = f % CYCLE[pose]
      return memo(`fig:${cols}:${rows}:${g.kind}:${g.color}:${pose}:${step}`, () => drawFigure(cols, rows, g.color, pose, step, g.kind))
    }
    const guyW = Math.min(18, Math.max(LEAD_COLS, ...helpers.map(g => g.name.length + 1)))
    const hotkeyOf = (g: Guy) => { const i = helpers.indexOf(g) + 1; return i >= 1 && i <= 9 ? String(i) : undefined }
    const guyCols = Math.max(1, Math.floor((width - LEAD_COLS) / guyW))
    const bodyRows = e.props.scroll?.bodyRows ?? e.viewport?.rows ?? 40
    const guyRows: Guy[][] = []
    for (let i = 0; i < helpers.length; i += guyCols) guyRows.push(helpers.slice(i, i + guyCols))
    const { perRow, dialColumns } = gaugeLayout(width, dials.length)
    const dialRows: typeof dials[] = []
    for (let i = 0; i < dials.length; i += perRow) dialRows.push(dials.slice(i, i + perRow))
    const dial = (d: (typeof dials)[number]) =>
      memo(`dial:${dialColumns}:${d.label}:${d.value}:${peak}:${d.color}`, () => drawDial(dialColumns, d, peak))
    const title = (label: string) => (
      <Box flexDirection="row" marginTop={1}>
        <Image key={`title-${label}`} source={memo(`title:${label}`, () => drawTitle(TITLE_COLS, label))} columns={TITLE_COLS} rows={1} alt={label} />
        <Text color="#2a2b2d">{'─'.repeat(Math.max(0, width - TITLE_COLS))}</Text>
      </Box>
    )
    const workCols = Math.min(width, 60)
    const workPic = memo(`work:${workCols}:${w.branch}:${w.worktree}:${w.isPlanning}`, () => drawWork(workCols, w))
    const blink = list.some(x => x.status === 'in_progress') ? f % 2 : 0
    const taskLine = memo(`tasks:${done}/${list.length}`, () => drawTasks(TASKS_COLS, list))
    const nodes = list
      .map(x => (x.status === 'completed' ? '●' : x.status === 'in_progress' ? (blink ? '◉' : '○') : '○'))
      .join('─')

    return (
      <Box flexDirection="column" width={width} minHeight={bodyRows} backgroundColor="#000000">
        <Box flexDirection="row" justifyContent="space-between">
          <Image key="clock" source={clockPic} columns={Math.min(CLOCK_COLS, width)} rows={HEADER_ROWS} alt={`turn ${t.count} ${t.isActive ? 'running' : 'idle'}`} />
          {width >= CLOCK_COLS + MACHINE_COLS && (
            <Image key="machine" source={machinePic} columns={shownCols} rows={HEADER_ROWS} alt={[`${m.model} ${m.mode} ctx ${m.ctxPercent}%`, ...shown.limits.map(l => `${l.label} ${l.percent}%`)].join(' ')} />
          )}
        </Box>

        {title('CREW')}
        <Box flexDirection="row">
          <Box flexDirection="column" width={LEAD_COLS}>
            <Image key="lead" source={figure(LEAD_COLS, LEAD_ROWS, lead)} columns={LEAD_COLS} rows={LEAD_ROWS} alt={`lead ${poseOf(lead)}`} />
          </Box>
          <Box flexDirection="column">
            {guyRows.map((row, r) => (
              <Box key={`row${r}`} flexDirection="row">
                {row.map(g => (
                  <Box key={g.id} flexDirection="column" width={guyW}>
                    <Image key={`guy-${g.id}`} source={figure(guyW, GUY_ROWS, g)} columns={guyW} rows={GUY_ROWS} alt={`${g.name} ${poseOf(g)}`} />
                    <Button key={`view-${g.id}`} plain hotkey={hotkeyOf(g)} onPress={view(g.agentId)}>
                      <Text color={hex(g.color)}>{short(g.name, guyW - 4)}</Text>
                    </Button>
                  </Box>
                ))}
              </Box>
            ))}
            {helpers.length === 0 && <Text color="#6f7173">no subagents</Text>}
          </Box>
        </Box>
        <Box flexDirection="row">
          <Button key="view-lead" plain hotkey="0" onPress={view()}><Text color="#4d9eff">LEAD</Text></Button>
          <Text color="#6f7173"> {short(lead.tool ?? lead.job, width - 8)}
        </Text>
        </Box>
        {helpers.filter(g => !g.isDone).map(g => (
          <Text key={`job-${g.id}`} color="#6f7173">
            <Text color={hex(g.color)}>{g.name}</Text> {short(g.job, width - g.name.length - 1)}
          </Text>
        ))}

        {runList.length > 0 && title('RUN')}
        {runList.map(x => {
          const mine = guys.filter(g => g.runId === x.id)
          const need = mine.filter(g => g.isWaiting || g.isFailed).length
          const live = x.endedAt === undefined
          return (
            <Text key={`run-${x.id}`} color={live ? '#ffffff' : '#6f7173'}>
              <Text color="#4d9eff">{runLabel(x.id)}</Text> {x.done}/{x.spawned} AGENTS{need > 0 ? <Text color="#ff3a5d"> {need} NEED YOU</Text> : ''} <Text color={live ? '#00ed95' : '#6f7173'}>{mmss((x.endedAt ?? now) - x.startedAt)}</Text>{live ? '' : ' DONE'}
            </Text>
          )
        })}
        {title('WORK')}
        <Image key="work" source={workPic} columns={workCols} rows={WORK_ROWS} alt={`${w.branch} ${w.worktree} ${w.isPlanning ? 'plan' : 'build'}`} />
        {w.goal !== '' && (
          <Text color="#ffffff">
            <Text color="#6f7173">GOAL </Text>{short(w.goal, width - 5)}
          </Text>
        )}
        {list.length > 0 && title('TASKS')}
        {list.length > 0 && (
          <Box flexDirection="row">
            <Image key="tasks" source={taskLine} columns={TASKS_COLS} rows={TASK_ROWS} alt={`tasks ${done}/${list.length}`} />
            <Box paddingTop={1}>
              <Text color="#6f7173">{short(nodes, width - TASKS_COLS - 1)}</Text>
            </Box>
          </Box>
        )}
        {list.slice(-10).map(x => (
          <Text key={`t${x.id}`} color={x.status === 'completed' ? '#6f7173' : x.status === 'in_progress' ? '#ff3a5d' : '#ffffff'}>
            {x.status === 'completed' ? '●' : x.status === 'in_progress' ? (f % 2 ? '◉' : '○') : '○'} {short(x.text, width - 2)}
          </Text>
        ))}

        {dialRows.length > 0 && title('TOOLS')}
        {dialRows.map((row, r) => (
          <Box key={`dials${r}`} flexDirection="row">
            {row.map(d => (
              <Image key={`dial-${d.label}`} source={dial(d)} columns={dialColumns} rows={DIAL_ROWS} alt={`${d.label} ${d.value}`} />
            ))}
          </Box>
        ))}

        {shellRows.length > 0 && title('SHELL')}
        {shellRows.slice(-8).map(sh => {
          const isLive = sh.endedAt === undefined
          const glyph = isLive ? (f % 2 ? '▶' : '▷') : sh.isError ? '✕' : sh.isInterrupted ? '■' : '●'
          const color = isLive ? '#ffffff' : sh.isError ? '#ff3a5d' : '#6f7173'
          return (
            <Text key={`sh-${sh.id}`} color={color}>
              {glyph} <Text color={isLive ? '#00ed95' : '#6f7173'}>{mmss((sh.endedAt ?? now) - sh.startedAt)}</Text>
              {sh.isBackground ? <Text color="#4d9eff"> BG</Text> : '   '} {short(sh.text, width - 12)}
            </Text>
          )
        })}

        {lines.length > 0 && title('LOG')}
        {lines.map((line, i) => (
          <Text key={`l${i}`} color={i === lines.length - 1 ? (line.startsWith('✕') ? '#ff3a5d' : '#ffffff') : '#6f7173'}>{short(line, width)}</Text>
        ))}
      </Box>
    )
  })
}

