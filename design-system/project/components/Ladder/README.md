The ladder: a caption, its value, then a vertical stack of pips lit from the bottom.

`ladder-w` wide, pips `ladder-seg` tall at `ladder-pitch`, as many as fit under the value, at least 4. The caption is `label` in `grey`; the value is the rounded percent in `label` `white` right under it. Lit pips are `green`. From 60% the top lit pip turns `white`, the warning stage. The last two pips of any ladder are `red` when lit, whatever the percent, so a short ladder goes red sooner. Unlit pips are `dim`. The consumer passes a percent. One ladder is `CTX`, the context fill. Beside it belong the two rate-limit windows the engine reports, `5H` and `7D`, each its own ladder at the same pitch, flush right, so the header reads context, session budget and weekly budget in one glance.

Mount `Op1Crew.Ladder` with `label` and `percent`; `pips` defaults to 10.
