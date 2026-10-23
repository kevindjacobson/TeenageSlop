A crew figure: one line-art athlete per agent type, posed by state.

Drawn from a 64 by 64 SVG (the Athletes group) scaled to the shorter side of its box, `figure-h` tall, `lead-w` wide for the lead. The body is `currentColor`, so the consumer sets the colour: `blue` for the lead, then `green`, `white`, `red` for helpers in join order. Pose follows state: `fail` over `wait` over `done` over `work` over `think` over `idle`. The body never moves; in `think` the white-accent dots ripple, in `work` three dashes trail the figure alternating frames. A kind without a drawing for a pose shows its idle drawing with a mark: `OK` in `green`, `X` in `red`, `!` in `orange`. The name goes under the figure in `label`.

Mount `TeenageSlop.Figure` with `kind`, `pose`, `color` and `name`; the strokes are embedded in the bundle, so no asset is needed.
