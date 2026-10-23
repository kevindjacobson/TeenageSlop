# TeenageSlop

A Claude Code mod that turns the side pane into a Teenage Engineering OP-1 style display: the lead agent and every spawned subagent drawn as a line-art athlete, a turn clock, a context ladder, model and permission chips, tasks as a progress line, tool usage as needle gauges, shell commands as they run, and the current branch and worktree.

The OP-1 is the visual language only. Every label is Claude Code's own vocabulary: TURN, CTX, CREW, WORK, TASKS, TOOLS, SHELL, LOG.

The pictures are rendered in the mod itself (RGBA, no files, no external process) and drawn through the kitty graphics protocol, so the pane needs a terminal that supports it: **Ghostty** or **kitty**. Elsewhere the pictures fall back to their alt text.

## Install

At the prompt of a terminal session:

```
/plugin install teenageslop --marketplace kevindjacobson/TeenageSlop
```

Answer `y` to add the marketplace, then pick a scope (user is the usual one).

From a shell:

```
claude plugin install teenageslop --marketplace kevindjacobson/TeenageSlop
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `kevindjacobson/TeenageSlop`, then **Add plugin**.

Once installed, the pane docks by itself in a terminal 110 columns or wider; `/crew` opens it anywhere. `/crew-goal <text>` sets a goal line shown under WORK (empty clears it).

## What is in this repository

| Path | What |
| --- | --- |
| `teenageslop/` | The mod: `hooks/register.tsx` (events and the pane), `hooks/scene.ts` (the OP-1 pictures), `hooks/pixels.ts` (a tiny rasterizer), `hooks/avatars.ts` (baked athlete strokes) |
| `avatars/svg/` | The 22 original athlete drawings (one per agent type and pose), parseable line art in a 64×64 space |
| `avatars/concepts/` | The raster concept sheets the drawings were traced from |
| `avatars/build.py` | Bakes the SVGs into `teenageslop/hooks/avatars.ts`; rerun after editing a drawing |
| `research_notes/`, `reports/` | The research behind the design: OP-1 display language, palette, prior art |

## Athletes

| Agent type | Athlete |
| --- | --- |
| lead | sprinter |
| Explore | swimmer / diver |
| Plan | archer |
| general-purpose | hurdler |
| claude-code-guide | coach |
| code review | referee |
| statusline-setup | gymnast |
| workflow | relay runner |
| anything else | weightlifter |

Poses follow the agent's state: idle, think, work, wait (asking you something), done, fail.

## Developing

```
claude plugin validate teenageslop
claude plugin test teenageslop
claude --plugin-dir teenageslop
```

Colours are the OP-1 firmware's own: `#4D9EFF` blue, `#00ED95` green, `#FFFFFF` white, `#FF3A5D` red, `#6F7173` grey, on black.
