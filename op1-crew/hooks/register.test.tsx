import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'op1-crew',
  component: 'Pane',
  requestId: 'op1-crew',
  props: {
    title: 'OP-1 · CREW',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

const views: unknown[] = []
// what the model stream beneath yields in a test, set per test before $.turn.step
let stepChunks: any[] = []
const boot = async ($: any, on: any) => {
  views.length = 0
  stepChunks = []
  on('turn.start', (_: any, e: any) => ({ turnId: e.turnId ?? 'turn1' }))
  on('turn.step', async function* (_: any, e: any) { for (const c of stepChunks) yield c; return { turnId: e.turnId, index: e.index, answer: '', toolUses: [], usage: null } })
  on('agent.spawn', (_: any, e: any) => ({ model: 'haiku', agentId: `a${e.workflow?.agentIndex ?? e.tool_use_id ?? 1}` }))
  on('ui.view', (_: any, e: any) => { views.push(e); return { value: {} } })
  on('command.register', () => ({ value: { command: 'crew' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 3 }))
  on('tool.call', () => ({ result: {} }))
  on('clock.every', () => ({ value: {} }))
  on('clock.now', () => ({ value: 1_700_000_000_000 }))
  on('session.measure', (_: any, e: any) => ({ changed: e.changed }))
  on('classic.SubagentStop', () => ({}))
  on('session.cwd', () => ({ value: '/' }))
  on('session.root', () => ({ value: '/' }))
  on('process.run', () => ({ value: { exitCode: 1, stdout: '' } }))
  on('store.get', () => ({ value: undefined }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
}

test('a spawned subagent joins the crew as a figure and a todo becomes a task', async ($, on) => {
  await boot($, on)

  await $.agent.spawn({ prompt: 'look around', description: 'Explore the repo', subagentType: 'Explore' } as any)
  await $.tool.call({
    tool: 'TodoWrite',
    todos: [{ content: 'Write the thing', status: 'in_progress', activeForm: 'Writing the thing' }],
  })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /EXPLORE/ }))?.text).toBe('EXPLORE')
  expect((await ui.find({ type: 'Image', key: 'guy-1' }))?.props.alt).toBe('EXPLORE think')
  expect((await ui.find({ type: 'Text', text: /Writing the thing/ }))?.text).toMatch(/Writing the thing/)
  expect((await ui.find({ type: 'Image', key: 'tasks' }))?.props.alt).toBe('tasks 0/1')
  await ui.unmount()
})

test('a Bash call lights the SHELL gauge', async ($, on) => {
  await boot($, on)
  await $.tool.call({ tool: 'Bash', command: 'ls' })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Image', key: 'dial-SHELL' }))?.props.alt).toBe('SHELL 1')
  expect((await ui.find({ type: 'Image', key: 'clock' }))?.props.alt).toBe('turn 3 idle')
  expect((await ui.find({ type: 'Text', text: /ls/ }))?.text).toMatch(/● 00:00 {3} ls$/)
  await ui.unmount()
})

test('workflow agents sharing one Workflow call each get their own figure', async ($, on) => {
  await boot($, on)

  const shared = { tool_use_id: 'toolu_wf', prompt: 'probe', description: 'probe', subagentType: 'general-purpose' }
  await $.agent.spawn({ ...shared, workflow: { runId: 'wf_1', agentIndex: 1 } } as any)
  await $.agent.spawn({ ...shared, workflow: { runId: 'wf_1', agentIndex: 2 } } as any)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Image', key: 'guy-wf_1#1' }))?.props.alt).toBe('GENERAL#1 think')
  expect((await ui.find({ type: 'Image', key: 'guy-wf_1#2' }))?.props.alt).toBe('GENERAL#2 think')
  await ui.unmount()
})

test('a Workflow call lights the AGENT gauge', async ($, on) => {
  await boot($, on)
  await $.tool.call({ tool: 'Workflow', script: 'export const meta = {}' } as any)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Image', key: 'dial-AGENT' }))?.props.alt).toBe('AGENT 1')
  await ui.unmount()
})

test('the rate-limit windows light ladders beside CTX', async ($, on) => {
  await boot($, on)
  await $.session.measure({
    context: { window: 200000, percent: 62 },
    rateLimits: [{ kind: 'five_hour', percentUsed: 38 }, { kind: 'seven_day', percentUsed: 91.5 }],
    changed: ['context', 'rateLimits'],
  } as any)

  const ui = await $.ui.mount({ ...PANE, props: { ...PANE.props, bodyColumns: 80 }, surface: 'terminal' })
  expect((await ui.find({ type: 'Image', key: 'machine' }))?.props.alt).toMatch(/ctx 62% 5H 38% 7D 92%$/)
  await ui.unmount()
})


test('a workflow run shows a RUN row that counts stops and ends with the Workflow call', async ($, on) => {
  await boot($, on)
  const shared = { tool_use_id: 'toolu_wf', prompt: 'probe', description: 'probe', subagentType: 'general-purpose' }
  for (const i of [1, 2, 3]) await $.agent.spawn({ ...shared, workflow: { runId: 'wf_abc1', agentIndex: i } } as any)
  await $.classic.SubagentStop({ agent_id: 'a1' } as any)
  await $.classic.SubagentStop({ agent_id: 'a2' } as any)

  let ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /WF_ABC1/ }))?.text).toMatch(/WF_ABC1 2\/3 AGENTS 00:00$/)
  await ui.unmount()

  await $.tool.call({ tool: 'Workflow', script: 'export const meta = {}' } as any)
  ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /WF_ABC1/ }))?.text).toMatch(/DONE$/)
  await ui.unmount()
})

test('past nine helpers the crew collapses to one figure per kind with a count', async ($, on) => {
  await boot($, on)
  for (let i = 0; i < 12; i++) await $.agent.spawn({ tool_use_id: `t${i}`, prompt: 'look', description: 'look', subagentType: 'Explore' } as any)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Image', key: 'guy-kind-explore' }))?.props.alt).toBe('EXPLORE ×12 think')
  expect((await ui.findAll({ type: 'Image' })).filter((el: any) => String(el.key ?? '').startsWith('guy-')).length).toBe(1)
  await ui.unmount()
})

test('pressing a name puts that agent in view; the lead returns to the main view', async ($, on) => {
  await boot($, on)
  await $.agent.spawn({ tool_use_id: 't1', prompt: 'look', description: 'look', subagentType: 'Explore' } as any)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ plugin: 'op1-crew', key: 'view-t1' })
  await ui.press({ plugin: 'op1-crew', key: 'view-lead' })
  expect(views).toEqual([{ agentId: 'at1' }, {}])
  await ui.unmount()
})

test('the lead poses follow the stream, and the STEP row reads the stop', async ($, on) => {
  await boot($, on)
  await $.turn.start({ turnId: 'turn1', prompt: 'go' } as any)
  const usage = { input_tokens: 10, output_tokens: 1200, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, model: 'claude-sonnet-5-5' }
  stepChunks = [
    { kind: 'thinking', index: 0, text: 'hm' },
    { kind: 'text', index: 1, text: 'Let me look.' },
    { kind: 'tool', index: 2, id: 'toolu_1', name: 'Bash' },
    { kind: 'stop', stopReason: 'tool_use', usage },
  ]
  const stream = $.turn.step({ turnId: 'turn1', index: 2, model: 'claude-opus-5-5', messageCount: 3 } as any)
  const kinds: string[] = []
  for await (const chunk of stream as any) kinds.push(chunk.kind)
  expect(kinds).toEqual(['thinking', 'text', 'tool', 'stop'])

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Image', key: 'lead' }))?.props.alt).toBe('lead work')
  expect((await ui.find({ type: 'Text', text: /STEP 03/ }))?.text).toMatch(/STEP 03 SONNET TOOL STOP TOOL_USE 1\.2K OUT$/)
  await ui.unmount()
})
