# Athlete avatars

22 SVG figures redrawn from the three approved [concept sheets](concepts/). The contours follow the drawings' silhouettes, head shapes, clothing, faces, equipment and motion marks. `index.json` lists every figure with `type`, `pose`, a relative `file`, the prop/symbol `accent` (or `null`), and a description.

| Athlete | Idle | Work | Additional poses |
| --- | --- | --- | --- |
| Lead / sprinter | [lead-idle.svg](svg/lead-idle.svg) | [lead-work.svg](svg/lead-work.svg) | [lead-think.svg](svg/lead-think.svg), [lead-wait.svg](svg/lead-wait.svg), [lead-done.svg](svg/lead-done.svg), [lead-fail.svg](svg/lead-fail.svg) |
| Explore / swimmer | [explore-idle.svg](svg/explore-idle.svg) | [explore-work.svg](svg/explore-work.svg) | |
| Plan / archer | [plan-idle.svg](svg/plan-idle.svg) | [plan-work.svg](svg/plan-work.svg) | |
| General / hurdler | [general-purpose-idle.svg](svg/general-purpose-idle.svg) | [general-purpose-work.svg](svg/general-purpose-work.svg) | |
| Guide / coach | [guide-idle.svg](svg/guide-idle.svg) | [guide-work.svg](svg/guide-work.svg) | |
| Review / referee | [review-idle.svg](svg/review-idle.svg) | [review-work.svg](svg/review-work.svg) | |
| Status / gymnast | [status-idle.svg](svg/status-idle.svg) | [status-work.svg](svg/status-work.svg) | |
| Workflow / relay runner | [workflow-idle.svg](svg/workflow-idle.svg) | [workflow-work.svg](svg/workflow-work.svg) | |
| Other / weightlifter | [other-idle.svg](svg/other-idle.svg) | [other-work.svg](svg/other-work.svg) | |

## Source choices and necessary differences

- All nine idle poses follow `concepts/sheet-nine-idle.png`. In particular, lead crouches at the start, general clears a hurdle, review raises a **10** scorecard, and other already holds the bar overhead. These actions are intentional idle concepts.
- Lead think, work, wait and done follow `concepts/lead-poses.png`, including the chin-resting hand and three dots, running speed lines, raised fist and exclamation mark, and green finish tape. The two sheets disagree about lead idle: the nine-athlete crouch takes precedence over the dedicated sheet's standing idle. The larger head proportions in the dedicated sheet are preserved for its poses.
- Explore, plan, status and other work follow `concepts/action-four.png` directly. Differences already present between sheets are retained, such as the work archer's cap instead of the idle ponytail, the gymnast's side-facing head and raised leg, and the weightlifter's headband and simplified face.
- No direct concepts exist for `general-purpose-work.svg`, `guide-work.svg`, `review-work.svg`, `workflow-work.svg`, or `lead-fail.svg`. These are derived poses: longer hurdle clearance, a directing coach, a referee extending the free arm, a relay handoff stride, and a sprinter recovering with hands braced on the legs. Each keeps the corresponding athlete's hair/headwear, outfit and equipment. Lead fail uses the dedicated lead sheet's standing costume.
- Geometry uses smooth curves with a uniform **1.5-unit stroke**, so it is heavier at this scale than the concept sheets' thin, slightly irregular strokes. No raster texture, filled details or labels are embedded. The scorecard's **10** is outlined path geometry, not text.
- Figures are uniformly fitted within approximately 58 × 58 units and centred horizontally, with their feet or equipment baseline near y=60. Tall, narrow figures retain their source proportions instead of being widened to fill the square. Beam feet and wave lines establish the lower edge for those scenes.
- The requested 22-entry set consists of idle/work for nine athletes plus lead think/wait/done/fail. Other athletes do not gain additional wait/done/fail files.

## SVG contract

Every SVG has `xmlns="http://www.w3.org/2000/svg"` and `viewBox="0 0 64 64"`, with no width or height. Drawing elements have explicit `fill="none"`, `stroke-width="1.5"`, `stroke-linecap="round"` and `stroke-linejoin="round"`.

Only `path`, `polyline`, `line`, `circle` and `ellipse` are allowed. Paths use absolute `M`, `L`, `C`, `Q` and `Z` commands. There are no groups, text, rectangles, references, definitions, transforms or styles. Each file may contain at most 90 elements; a path may contain several subpaths. Bodies use `stroke="currentColor"`. Props or overhead symbols may use one accent colour per file, selected from `#4D9EFF`, `#00ED95`, `#FFFFFF` and `#FF3A5D`; multiple elements may share that single accent.

The host supplies the background and body colour. To reproduce the nine-athlete sheet, use blue for lead/review, green for explore/status, white for general/workflow, and red for plan/guide/other. The action sheet changes explore to blue, plan to green and status to white. These body colours are intentionally not hard-coded into the SVGs.

Host aliases remain: `claude-code-guide` → `guide`, `statusline-setup` → `status`, multi-agent workflows → `workflow`, and unknown agent types → `other`.

## Validation and build

Run from the repository root; both scripts use only the Python standard library:

```sh
python3 avatars/validate.py
python3 avatars/build.py avatars/svg /tmp/avatars.ts
```

`validate.py` checks XML, namespace, exact attributes, element limits, path commands and argument counts, palette, manifest coverage, the 22 expected athlete/pose pairs, sampled stroke bounds and the lower baseline. It also passes every element through the existing build parser. `build.py` converts the SVG curves into the TypeScript polyline table consumed by the host rasterizer.

[preview.png](preview.png) shows all 22 figures at enlarged and native 64px sizes, rendered offline from that same parsed polyline geometry. It is a review artifact, not an avatar asset. Actual host rendering and animation transitions still need an integration check.
