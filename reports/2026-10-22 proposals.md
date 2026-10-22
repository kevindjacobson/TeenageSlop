# Proposals, 2026-10-22

What to add to the mod next, each item sized for one agent in a parallel batch. Visual examples: the Design canvas "OP-1 Crew Proposals" (https://claude.ai/artifact/RGquZ52XT1xrgykNd97Uzy). Tokens, components and the figure contract: the design system "OP-1 Crew" (https://claude.ai/artifact/2KVaPJNLnUWwrS5itjbArQ), whose source is `design-system/project/` in this repo.

Every item: a hook in `register.tsx`, a state atom if new, a draw function in `scene.ts` where a picture is needed, a test in `register.test.tsx`, and `CLAUDE.md` updated if it adds a rule. Keep the vocabulary rule: labels are Claude Code's words.

## 0. Done this session (uncommitted)

- Workflow agents keyed by `workflow.runId#agentIndex` on `agent.spawn`, so a run's figures no longer share the Workflow call's tool_use_id.
- `Workflow` counted on the AGENT gauge.
- Duplicate crew ids healed on `session.start`.
- Two tests for the above.

## 1. Rate-limit ladders beside CTX (small)

- Hook: `session.measure` already handled; also read `e.rateLimits[]` (`kind` five_hour / seven_day, `percentUsed`, `resetsAt`) and `e.cost?.usd`.
- State: extend `machine` with `limits: {kind, percent, resetsAt}[]` and `usd`.
- Scene: `drawMachine` draws one ladder per window right of CTX at the same pitch, captions `5H` and `7D`. No cost or reset chips: they crowd the header (Kevin, canvas comment). Keep `MACHINE_COLS` or grow it by 12 per ladder.
- Test: a measure event with two windows lights two ladders; alt text carries the percents.

## 2. RUN zone for a workflow (medium)

- Hook: `agent.spawn` with `e.workflow` opens a run (`runId`, started at, agent count); `classic.SubagentStop` ticks it; the Workflow `tool.call` closing ends it.
- State: new atom `runs: {id, startedAt, spawned, done, endedAt?}[]`.
- Scene: a `RUN` title, chips for the short run id, `AGENTS`, `DONE`, `NEED YOU`, elapsed; phase dots are out of reach unless the engine passes labels. Group the run's figures after the lead.
- Crowd rule (Kevin, canvas comment, 27+ agents): over nine agents the crew collapses to the lead, every agent in wait or fail on its own, then one figure per kind with a `×count` badge. Totals stay in the chips.
- Click to view (Kevin, canvas comment): only `Button` is pressable in a pane, so the name under each figure becomes a `Button` with `key` = the guy id and a digit `hotkey`; `onPress: () => $.ui.view({ agentId })` puts that agent's transcript in the main view and routes the next Enter to it; `0` is `$.ui.view({})`. Applies to every helper, not only workflow agents.
- Test: three workflow spawns and two stops render `2/3 AGENTS`.

## 3. Poses from the stream (medium)

- Hook: `turn.step`, main loop only (`e.agentId` undefined). On a `thinking` chunk set the lead `isBusy` with no tool (think pose); on a `tool` chunk set `tool` to the name before the call runs; on `stop` record `stopReason` and `usage`. Also show `e.model` when it differs from the session model (fallback) as a red chip.
- State: extend `turn` with `step`, `stopReason`, `outTokens`, `stepModel`.
- Scene: a `STEP` row of chips, optional; the pose change needs no new picture.
- Caveat: pass every chunk on unchanged; a hook that drops chunks drops the response.

## 4. Permission verdicts (small)

- Hook: `tool.check` after the engine's verdict (`await next(e)`), count `allow`, `ask`, `deny` per session; on `ask` raise the lead's wait pose and a `✋` LOG line with the tool and a short argument; on `deny` a red `✕ DENY` line. Guard with `.catch(() => ({decision: 'deny'}))` only if the hook can fail before `next`.
- State: `meters` gains `ASK` and `DENY`.
- Scene: two more dials, both red.

## 5. Refusal with a reason (small)

- Hook: `turn.complete` with `e.reason === 'refusal'`: fail pose, job `refused`, LOG `✕ refusal · <category>`; the clock freezes grey.

## 6. Session recall (small)

- Hook: `session.end` writes `{turns, elapsedMs, usd, meters}` to `$.store` under `last:<cwd>` within `next.budget`; `session.start` reads it and seeds LOG with two grey lines.

## 7. Agent badges (small)

- Hook: `agent.spawn` already seen; keep `fork`, `isTeammate`, `background`, `cwd !== session cwd` on the Guy as `badges: string[]`; `$.agent.list()` on `clock.every` for the seven-state status when it differs from the pose.
- Scene: one `label`-sized badge row under the name.

## 8. Avatar sets (large; split per set)

Infrastructure (one agent):
- `avatars/sets/<set>/svg/*.svg` beside `avatars/svg/` (which stays the athletes).
- `avatars/build.py` takes several input dirs and writes `AVATAR_SETS: Record<string, Avatars>` with `athletes` first; `AVATARS` stays as an alias of `AVATAR_SETS.athletes` so nothing else changes.
- `scene.ts`: `drawFigure` takes a `set` argument; `register.tsx` reads the chosen set from `$.store` (`set`), command `/crew-set <athletes|dogs|cats|birds|mice>`, memo keys include the set.
- A set missing a kind or pose falls back to the athletes' drawing for that kind, so a half-finished set still runs.

Drawings (one agent per set, 22 files each): follow `design-system/project/figures.md` for the SVG contract and the species table. Draw from the athlete file of the same kind and pose as the pose reference: same baseline, same box, same accents, body still. Validate with the existing avatars validator, bake, run `claude plugin test op1-crew`, and look at the pane in a 110-column Ghostty.

## 9. Session timer (small)

- Hook: `session.start` stores `startedAt` from `$.clock.now()` in the `turn` atom (a resumed session keeps the earlier start if the store has one under the session id); the existing `clock.every` tick that advances the turn clock also advances it.
- Scene: `drawClock` gains a second line under `TURN`: `HH:MM:SS` in `grey` at stroke scale 3, caption `SESSION`. Grow `HEADER_ROWS` to 5 if the 4-row header cannot hold it.
- Test: a session start then a tick renders `00:00:01` in the alt text.

## Order

1 and 4 first (an afternoon, visible at once). 2 and 3 next. 5, 6, 7 and 9 are small and independent. 8's infrastructure can run alongside anything; the four drawing agents after it lands.
