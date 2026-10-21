export type Guy = {
  id: string
  kind: string
  agentId?: string
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

export type Turn = { isActive: boolean; startedAt: number; elapsed: number; count: number }

export type Machine = { model: string; mode: string; ctxPercent: number }

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
      shells: Shell[]
    }
  }
}
