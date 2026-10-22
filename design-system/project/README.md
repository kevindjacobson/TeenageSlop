The side pane of Claude Code drawn in the Teenage Engineering OP-1 display language: a crew of line-art figures for the lead and each subagent, a turn clock, a context ladder, chips, needle gauges and terminal rows. The OP-1 is the skin. Claude Code is the subject.

## Content fundamentals

- Use Claude Code's own vocabulary and nothing else. Zone titles are `TURN`, `CTX`, `CREW`, `WORK`, `TASKS`, `TOOLS`, `SHELL`, `LOG`. Never "tracks", "REC", "tape" or "mixer": the OP-1 is a visual skin, not a metaphor.
- Set every label in caps in `label`. Captions are at most one word. A figure's name is its agent type, upper-cased (`EXPLORE`, `GENERAL-PURPOSE`), clipped to 18 columns.
- Write LOG lines as one glyph, one space, a short clause: `▶ turn started`, `+ EXPLORE joins`, `✋ Allow Bash?`, `✕ Edit failed`, `◆ skill code-review`, `◀◀ compacting context`, `■ turn done`. Keep three lines; the newest is `white`, the rest `grey`, a failure `red`.
- Numbers are the content. A gauge reads `07`, tasks read `2/5`, the clock reads `00:42`. Zero-pad two-digit readings; never a unit after them.

## Visual foundations

### Colour

- `ground` is the only background. Pin the four corners of every canvas in `corner` so the terminal does not trim and recentre the picture.
- The palette is the OP-1 firmware's: `blue`, `green`, `white`, `red`, `grey`, `dim`. `orange` is an alias of `red`, because the firmware's fourth encoder colour is that same value. Add no hue.
- Dim is a darker shade, never opacity. The rasterizer writes RGBA with no blending, so an unlit segment is `dim`, not `green` at 20%.
- Colour carries state. `green` means alive and fine (a live timer, a branch, done). `red` means failed, interrupted, bypassing permissions, or the last two pips of a ladder. `white` is what is running now. `grey` is everything resting.
- Figures take one body colour each from `blue`, `green`, `white`, `red` in join order; the lead is always `blue`. A `white` stroke inside a figure SVG means the figure's own colour; a prop keeps its own colour.
- `grey` reads 4.1:1 on `ground`. Keep it to `label` size and larger and to secondary text. Anything the person must read now is `white`.

### Strokes and the grid

- Draw everything in logical pixels on an 8 by 16 cell grid (`cell-w`, `cell-h`) and ship each picture at `zoom` 2. Every picture is a whole number of cells.
- Strokes are `stroke` 1px; the dial needle and bold text are `stroke-bold` 2px. Nothing thicker, nothing anti-aliased.
- Nothing is rounded (`radius-0`). Chips are 1px rectangles. Fills are flat.
- Keep each picture small and self-contained. The engine refuses a pane tree with more than 2 MiB of image source.

### Type

- The pane's text is a monoline stroke font in the OP-1's spirit: each glyph is a set of polylines on a 4 by 7 grid, cap height `stroke-cap` 5px per unit of scale, advancing `stroke-advance` 4px per unit. The glyph set is `0-9`, `A-Z`, space, `. - / % ] ! ? _ … ·`. Caps only.
- On the web, stand in for it with `stroke` (Share Tech Mono) at the sizes in the `Stroke font` group: `label` for scale 2, `count` for 3, `turn-box` for 4, `dial-number` for 5, `timer` for 6. Font sizes are 7px per unit of scale, which keeps the cap height.
- Rows the engine draws (SHELL, LOG) are terminal text in `terminal` at `row`.

### Layout: the zones, top to bottom

1. `TURN` header, `header-h`: the clock (`timer` and `turn-box`) at left over `clock-w`; at right over `machine-w` the model chip, the mode chip, then the `CTX` ladder flush right.
2. `CREW`: the lead at `lead-w` by `figure-h`, then helpers in rows, each `figure-h` tall with its name under it in `label`.
3. `WORK`: chips for the branch (`green` outline), the worktree (`blue` outline, `WT` prefix) and `BUILD` (`grey` outline) or `PLAN` (`orange` solid, `ink-on-solid` text). A goal line under them when set.
4. `TASKS`: the count in `count`, then one row per task, `white` pending, `red` in progress, `grey` done.
5. `TOOLS`: one dial per channel that has been used, up to 6 a row: `READ`, `EDIT`, `SHELL`, `WEB`, `AGENT`, `SKILL`, `MCP`, `OTHER`.
6. `SHELL`: the last 8 commands, each a glyph, a timer, `BG` when backgrounded, the command text.
7. `LOG`: the last three event lines.

Each zone opens with a `Title`: the word in `label` `grey`, then a `dim` rule to the right edge. A zone with nothing in it is not drawn.

### Figures and poses

- One athlete per agent type, drawn once as line art in a `figure-box` of 64 by 64 and scaled to its cell box. See the Figures section for the drawing contract and the planned sets.
- Pose follows state, in this order of precedence: `fail`, `wait`, `done`, `work`, `think`, `idle`. A figure with a tool in hand works; busy with no tool thinks; a hand raised waits.
- Bodies never bob. Only the think ellipsis ripples (one dot lifts per frame over 6 frames) and the work dashes alternate (2 frames). Done and fail are still.

### Gauges and ladders

- A `Dial` is a 140 degree arc from 200 to 340 degrees with five ticks, a `stroke-bold` needle in the channel's colour, the reading in `dial-number` under the pivot and the label in `label` `grey` under that. Needles scale to the busiest channel, so the fullest dial always points right.
- The `Ladder` is vertical, `ladder-w` wide, pips `ladder-seg` tall at `ladder-pitch`, under a `label` caption in `grey` and the rounded value in `white`. Lit pips are `green`; from 60% the top lit pip is `white` as a warning; the last two pips are `red` when lit, whatever the percent. Unlit pips are `dim`.

### Motion

- Frames tick with the engine's clock; the pane redraws from memoised pictures, one per distinct input. Never animate a body; animate marks.
- A live shell row alternates `▶` and `▷`. A waiting figure's `!` blinks every other frame.

## Iconography

There are no icons. Marks are glyphs the terminal already has: `▶ ▷ ■ ● ✕ ✋ ◆ ◀◀ +`, and the stroke font's `OK`, `X`, `!` drawn over a figure that lacks a pose. No emoji.

