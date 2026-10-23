The turn clock: elapsed time in the current turn and the turn count.

The timer is `timer`, `white` while a turn runs and `grey` when idle, over the caption `TURN` in `label` `grey`. The turn count sits right of the timer in `turn-box`, `orange`, in square brackets. Minutes and seconds, zero-padded; the clock resets at each turn start and freezes at turn complete. The consumer provides elapsed milliseconds, the running flag and the count.

Mount `TeenageSlop.Clock` with `elapsedMs`, `turns` and `isActive`.
