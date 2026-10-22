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

const boot = async ($: any, on: any) => {
  on('agent.spawn', () => ({ model: 'haiku', agentId: 'a1' }))
  on('command.register', () => ({ value: { command: 'crew' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 3 }))
  on('tool.call', () => ({ result: {} }))
  on('clock.every', () => ({ value: {} }))
  on('clock.now', () => ({ value: 1_700_000_000_000 }))
  on('session.measure', (_: any, e: any) => ({ changed: e.changed }))
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
  expect((await ui.find({ type: 'Image', key: 'guy-wf_1#1' }))?.props.alt).toBe('GENERAL-PURPOSE think')
  expect((await ui.find({ type: 'Image', key: 'guy-wf_1#2' }))?.props.alt).toBe('GENERAL-PURPOSE think')
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
