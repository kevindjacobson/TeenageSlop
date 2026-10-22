# Figures

How an avatar is drawn so the mod can bake and stroke it, and the sets planned beyond the athletes.

## The SVG contract (what `avatars/build.py` reads)

- `viewBox="0 0 64 64"`, no width or height, `xmlns` set. Feet or the equipment baseline near y=60; the figure fitted in about 58 by 58 and centred horizontally. Tall narrow figures keep their proportions.
- Only `path`, `polyline`, `line`, `circle` and `ellipse`. Paths use absolute `M`, `L`, `C`, `Q`, `Z`. No groups, text, rects, transforms, defs, styles or references. At most 90 elements a file.
- Every element: `fill="none"`, `stroke-width="0.75"`, `stroke-linecap="round"`, `stroke-linejoin="round"`. The athletes all use 0.75; the mod strokes at `stroke` 1px whatever the SVG says, so the width is for previewing.
- Bodies are `stroke="currentColor"`: the host paints them in the figure's colour. A prop or an overhead symbol may use one accent per file from `#4D9EFF`, `#00ED95`, `#FFFFFF`, `#FF3A5D`. `#FFFFFF` is special: the mod treats a white stroke as the figure's own colour and, in the `think` pose, ripples those strokes as the ellipsis.
- File name `<kind>-<pose>.svg`. Kinds: `lead`, `explore`, `plan`, `general-purpose`, `guide`, `review`, `status`, `workflow`, `other`. Poses: `idle`, `work` for every kind; `think`, `wait`, `done`, `fail` for the lead. A kind missing a pose falls back to `idle` with a mark drawn over it.
- Strokes are smooth curves, monoline, no texture, no fills, no labels. A number on a prop is outlined geometry.

## The athletes (the shipped set)

| Kind | Athlete | Idle | Work |
| --- | --- | --- | --- |
| lead | sprinter | crouched at the start | running, speed lines |
| explore | swimmer / diver | standing on the block | swimming, wave line |
| plan | archer | ponytail, bow at rest | capped, drawing the bow |
| general-purpose | hurdler | clearing a hurdle | a longer clearance |
| guide | coach | standing, whistle | directing |
| review | referee | raising a 10 scorecard | free arm extended |
| status | gymnast | on the beam | side-facing, leg raised |
| workflow | relay runner | holding the baton | the handoff stride |
| other | weightlifter | bar overhead | the lift |

The 22 files are in the Athletes asset group; the sources are `avatars/svg/` in the repository and `avatars/concepts/` holds the sheets they were traced from.

## Planned sets: dogs, cats, birds, mice

A set is a complete family of 22 drawings in the contract above, one species or breed per kind, each action the animal's own version of the athlete's. Draw them from the athlete drawings as the pose reference: same stroke, same box, same baseline, same accents, same still body. Each set lives in `avatars/sets/<set>/svg/`, bakes into `AVATAR_SETS[<set>]` beside the athletes, and is chosen with `/crew-set <athletes|dogs|cats|birds|mice>`, remembered per machine.

| Kind | Action | Dogs | Cats | Birds | Mice |
| --- | --- | --- | --- | --- | --- |
| lead | sprint | greyhound | cat mid-pounce | roadrunner | mouse on the wheel |
| explore | swim / dive | retriever fetching from water | cat at the fish bowl | duck diving | mouse swimming the moat |
| plan | aim | pointer on point | cat eyeing a laser dot | heron poised to strike | mouse lining up a cheese shot |
| general-purpose | hurdle | border collie over an agility jump | cat over the fence | sparrow hopping a twig | mouse over the mousetrap |
| guide | coach | sheepdog herding | cat on the windowsill, watching | owl on the branch | mouse with a whistle |
| review | judge | beagle, nose up, scorecard | cat holding a 10 | parrot with a scorecard | mouse holding a 10 |
| status | balance | poodle on hind legs | cat on the fence top | flamingo on one leg | mouse on a tightrope |
| workflow | relay | husky in harness | cat passing a toy | pigeons in a line | mouse passing a seed |
| other | lift | bulldog with a bone | cat lifting a yarn ball | crow with a stick | mouse lifting a cheese wedge |

Lead keeps its six poses in every set: idle, think (chin on paw, three dots), work, wait (paw up, `!`), done (green tape), fail (slumped).
