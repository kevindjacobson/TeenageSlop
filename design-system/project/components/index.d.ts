// OP-1 Crew components: window.Op1Crew
export type Color = 'blue' | 'green' | 'white' | 'red' | 'orange' | 'grey'
export type Pose = 'idle' | 'think' | 'work' | 'wait' | 'done' | 'fail'
export type Kind = 'lead' | 'explore' | 'plan' | 'general-purpose' | 'guide' | 'review' | 'status' | 'workflow' | 'other'

/** A one-cell chip: the model, the mode, the branch, the worktree, PLAN or BUILD. */
export type ChipProps = { label: string; color: Color; /** only PLAN is solid */ solid?: boolean }
/** Caption, value and pips; green, a white head from 60%, red on the last two. */
export type LadderProps = { label: string; percent: number; pips?: number }
/** The turn timer and count. */
export type ClockProps = { elapsedMs: number; turns: number; isActive: boolean }
/** A tool-channel gauge; the needle is relative to `peak`, the busiest channel. */
export type DialProps = { label: string; value: number; peak: number; color: Color }
/** A zone title with a rule. */
export type TitleProps = { label: string }
/** An athlete, posed by state, in its own colour. */
export type FigureProps = { kind: Kind; pose?: Pose; color: Color; name?: string }
/** The TASKS count and rows. */
export type TasksProps = { tasks: { text: string; status: 'pending' | 'in_progress' | 'completed' }[] }
/** SHELL rows. */
export type ShellProps = { rows: { text: string; elapsedMs: number; isLive?: boolean; isError?: boolean; isInterrupted?: boolean; isBackground?: boolean }[] }
/** The last three LOG lines. */
export type LogProps = { lines: string[] }

export declare const Chip: (p: ChipProps) => JSX.Element
export declare const Ladder: (p: LadderProps) => JSX.Element
export declare const Clock: (p: ClockProps) => JSX.Element
export declare const Dial: (p: DialProps) => JSX.Element
export declare const Title: (p: TitleProps) => JSX.Element
export declare const Figure: (p: FigureProps) => JSX.Element
export declare const Tasks: (p: TasksProps) => JSX.Element
export declare const Shell: (p: ShellProps) => JSX.Element
export declare const Log: (p: LogProps) => JSX.Element
