A one-cell-tall rectangle of text: the model, the permission mode, the branch, the worktree, plan or build.

Outline chips are the rule: a `stroke` 1px rectangle in the chip colour with the text in the same colour, `chip-pad` either side. The one solid chip is `PLAN`: `orange` fill with `ink-on-solid` text, because plan mode should read at a glance. The mode chip turns `red` for `bypassPermissions`. Text is `label`, caps, clipped to 10 characters for the mode and 28 for the branch. Chips sit `gap` apart in a row. The consumer provides the text and the colour; the chip never picks its own.

Mount `Op1Crew.Chip` with `label`, `color` (`blue`, `green`, `white`, `red`, `orange`, `grey`) and `solid` for PLAN.
