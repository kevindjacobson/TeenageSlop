export type Guy = {
  id: string
  kind: string
  agentId?: string
  // a workflow run's agent: the run it belongs to and its place in the run's agent() calls
  runId?: string
  index?: number
  name: string
  color: number
  job: string
  tool?: string
  isBusy: boolean
  isDone: boolean
  isFailed: boolean
  isWaiting: boolean
}

export type Track = { id: string; text: string; status: 'pending' | 'in_progress' | 'completed' }

// step: the model request inside the turn, from 1; phase: what the stream is delivering now
export type Turn = {
  isActive: boolean
  startedAt: number
  elapsed: number
  count: number
  step: number
  stepModel: string
  phase: '' | 'thinking' | 'text' | 'tool'
  stopReason: string
  outTokens: number
}

export type Limit = { label: string; percent: number }
// limits: the rate-limit windows the last response reported (5H, 7D), empty off a subscription
export type Machine = { model: string; mode: string; ctxPercent: number; limits: Limit[] }

export type Shell = {
  id: string
  text: string
  startedAt: number
  endedAt?: number
  isBackground: boolean
  taskId?: string
  isError: boolean
  isInterrupted: boolean
}

export type Work = { cwd: string; branch: string; worktree: string; isPlanning: boolean; goal: string }

declare module 'claude-code' {
  interface PluginState {
    'op1-crew': {
      crew: Guy[]
      tracks: Track[]
      meters: Record<string, number>
      ticker: string[]
      frame: number
      turn: Turn
      machine: Machine
      work: Work
      runs: Run[]
      shells: Shell[]
    }
  }
}

// a workflow run: opened by its first agent.spawn, counted by SubagentStop, ended when the Workflow call returns
export type Run = { id: string; startedAt: number; spawned: number; done: number; endedAt?: number }
