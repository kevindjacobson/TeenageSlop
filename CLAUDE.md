# OP-1 Crew — project notes for Claude

A Claude Code mod (`op1-crew/`) that draws the side pane in the Teenage Engineering OP-1 display language. Read `README.md` for what it shows and how it installs.

## Rules that are not derivable from the code

- The OP-1 is a **visual skin, not a metaphor**. Every label is Claude Code vocabulary (TURN, CTX, CREW, WORK, TASKS, TOOLS, SHELL, LOG). Never "tracks", "REC", "tape", "mixer".
- Palette is the OP-1 firmware's own: `#4D9EFF` blue, `#00ED95` green, `#FFFFFF` white, `#FF3A5D` red, `#6F7173` grey, black background. Dim is a darker shade, never opacity.
- Pictures are rendered in the mod (`hooks/pixels.ts` rasterizer, `hooks/png.ts` encoder, `hooks/scene.ts` scenes) and shipped as PNG through the `Image` element. Keep every picture small and self-contained: the engine refuses a tree with more than 2 MiB of image source, and raw pictures over ~700 KB drew at half scale on Ghostty.
- Canvas cells are 8×16 logical px drawn at `ZOOM = 2`; strokes are 1–2 px so they land under a device pixel. The user's Ghostty cells measure 14×28 device px.
- Every canvas pins its four corners one shade off black: the terminal trims a picture to its non-black bounds and centres it otherwise.
- Never hook `turn.step` (or any streaming event). Hooks run in their own environment, so a streaming hook relays every chunk of the model's response across that boundary and the whole TUI slows down (tried 2026-10-22, reverted). Poses are inferred from `tool.call` and the turn events instead.
- The lead's working state comes from `turn.start` / `turn.complete`, never `prompt.submit` (a message sent mid-turn is also a prompt). The mod's own tool calls are skipped in `tool.call` via `next.origin.plugin`.
- Figures: one line-art athlete per agent type, poses from state (idle, think, work, wait, done, fail). Bodies never bob; only the think ellipsis ripples. White accents in the SVGs mean "the figure's own colour".
- Athlete SVGs in `avatars/svg/` are the source; `python3 avatars/build.py avatars/svg op1-crew/hooks/avatars.ts` bakes them. They are original work traced from `avatars/concepts/`; Teenage Engineering's own artwork is never committed.

## Working on the mod

```
claude --plugin-dir op1-crew        # run a session with the repo's mod live and hot-reloading
claude plugin validate op1-crew
claude plugin test op1-crew
cd op1-crew && npx -p typescript tsc -p .
```

The task tools (TaskCreate/TaskUpdate) need `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` on models newer than Opus 4.7; it is set in the user's `~/.claude/settings.json`.

## Where things are

- `op1-crew/hooks/register.tsx` — events, state atoms, the pane tree
- `op1-crew/hooks/scene.ts` — one draw function per zone
- `op1-crew/hooks/pixels.ts` — Canvas, stroke font (4×7 grid glyphs), base64
- `op1-crew/hooks/png.ts` — PNG encoder (fixed-Huffman deflate + LZ77)
- `op1-crew/types/index.d.ts` — the `$.state` contract
- `research_notes/`, `reports/` — the design research behind all of the above
