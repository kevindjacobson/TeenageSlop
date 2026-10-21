# Open-source terminal (TUI) projects relevant to an OP-1-style character-cell display

Scope: inventory of linkable projects (music TUIs, terminal pets/companions, pixel-to-cell renderers, visualizers, LCD/retro skins) plus terminal-animation practice. Star counts, language, license and "pushed" dates below come from the GitHub REST API queried on 2026-10-21 unless otherwise noted; "NOASSERTION" means GitHub could not classify the license file (read it before reuse).

---

## Key Question 1: Which TUI music tools exist (trackers, synths, sequencers) and how do they draw meters / sequencer grids?

### Takeaway
There is a small but real ecosystem of terminal trackers and step sequencers, concentrated in Go/Bubble Tea (signls, sektron, collidertracker) and Rust/Ratatui (trk, miditui, arcorrust, trem-tui), plus the canonical ncurses grid sequencer Orca-c. None of the sources describe a dedicated VU-meter or tape-reel widget; grids are drawn as styled text cells, and meter/waveform drawing is better sourced from visualizer and charting libraries (Key Question 3/4).

### Cited Findings

**Go / Bubble Tea**
- **signls** — `https://github.com/emprcl/signls` — "a non-linear, generative midi sequencer in the terminal"; Go; MIT; 267 stars; pushed 2026-08-07. Described as inspired by Orca and Nodal, runs on Linux/macOS/Windows, "still in development but expected to be fairly stable." — [GitHub API metadata](https://github.com/emprcl/signls); [search summary of README](https://github.com/emprcl/signls)
- **sektron** — `https://github.com/emprcl/sektron` — "a midi step sequencer in the terminal, made with live performance in mind"; Go; MIT; 92 stars; pushed 2024-10-25. Uses Bubble Tea as TUI framework and Lipgloss for styling; up to 10 tracks each bound to a MIDI device/channel via gomidi/midi; keyboard-only with QWERTY/AZERTY/Mac layouts configured in `config.json`; author states "The project isn't under active development right now." Inspired by Elektron hardware (the closest analogue to a hardware-skin TUI found). — [sektron README](https://github.com/emprcl/sektron)
- **collidertracker** — `https://github.com/schollz/collidertracker` — "A terminal-based music tracker that uses SuperCollider for synthesis and sample playback"; Go; MIT; 164 stars; pushed 2026-01-14. Views: Song (8 tracks x 16 rows), Chain (16 rows), Phrase (main tracker grid, Sampler or Instrument mode), plus Settings, Mixer (per-track volume), File Browser, Retrigger, Timestretch, Arpeggio, Modulate. README says "in development and likely unstable." The README does not name the TUI library. — [collidertracker README](https://github.com/schollz/collidertracker)

**Rust / Ratatui**
- **trk** — `https://github.com/delaudio/trk` — "A MIDI-first terminal tracker and music composition environment built with Rust"; Ratatui + Crossterm; pattern/sequence editing, JSON project files, realtime MIDI I/O, WAV sample playback; 2 stars; pushed 2026-09-15; license shows NOASSERTION in API (the search summary said MIT; verify in repo). — [trk repo](https://github.com/delaudio/trk)
- **miditui** — `https://github.com/pinkpixel-dev/miditui` — "A terminal MIDI player and multi-track piano roll visualizer with SoundFont synthesis, built with Rust and Ratatui"; Apache-2.0; 21 stars; pushed 2026-09-20. — [miditui repo](https://github.com/pinkpixel-dev/miditui)
- **resonator** — `https://github.com/makalin/resonator` — Rust MIDI sequencer & mixer with TUI multi-track piano roll, real-time mixing, Vim-style navigation; MIT; 5 stars; pushed 2026-01-04. — [resonator repo](https://github.com/makalin/resonator)
- **arcorrust** — terminal virtual instrument with real-time synthesis, built-in pattern sequencer and effects, Rust + ratatui, MIT (per LinuxLinks review; GitHub URL not confirmed in this research). — [LinuxLinks review](https://www.linuxlinks.com/arcorrust-terminal-based-virtual-instrument-playground/)
- **trem-tui** — Ratatui-based TUI for a step-grid sequencer with "Sequencer (step grid) and Graph (nested DAG + params) views switched through transport tabs." Published on crates.io/docs.rs; GitHub URL not confirmed. — [docs.rs trem-tui](https://docs.rs/trem-tui)

**C / ncurses (canonical)**
- **Orca-c** — `https://github.com/hundredrabbits/Orca-c` — C port of the ORCΛ livecoding grid sequencer; requires ncurses/ncursesw; MIDI (optional PortMidi), OSC and UDP output; `--strict-timing` option to reduce MIDI/OSC jitter; headless `cli` binary prints the grid to stdout; MIT; 538 stars; pushed 2025-04-16. The README does not document how the grid is drawn. — [Orca-c README](https://github.com/hundredrabbits/Orca-c)
- **ttrk / Tektracker** — console MIDI tracker writing to `/dev/midi`; only found as an AUR package, not on GitHub. — [AUR mirror listing](https://linux-meta.duckdns.org/en/p/ttrk)
- **cuse** — "lightweight MIDI sequencer for the terminal"; only found on AUR. — [AUR mirror listing](https://linux-meta.duckdns.org/en/p/cuse)

**Meter / chart building blocks used by music TUIs**
- **ntcharts** — `https://github.com/NimbleMarkets/ntcharts` — "Nimble Terminal Charts for the Golang BubbleTea framework and your TUIs"; chart types: Canvas (base), bar, line, scatter, streamline, time series, waveline, sparkline; uses Lip Gloss for styling and BubbleZone for mouse; MIT; 807 stars; pushed 2026-10-12. Streamline chart is described as "a line moving across the canvas" (closest thing to a scrolling waveform). — [ntcharts repo](https://github.com/NimbleMarkets/ntcharts)
- **Ratatui Canvas** widget: blank area to draw shapes (Circle, Line, Map, Points, Rectangle) or custom `Shape` implementations via `Painter`; includes `Label` for text and `FilledLine` (fill down to a y value, useful for waveform fills). — [docs.rs ratatui canvas](https://docs.rs/ratatui/latest/ratatui/widgets/canvas/index.html)
- **Ratatui `symbols::Marker`** variants and per-cell resolution: Dot/Block/Bar (1x1), Braille (2x4), HalfBlock (1x2, "double the resolution... roughly square pixels"), Quadrant (2x2, "no visible gaps"), Sextant (2x3) and Octant (2x4) from Unicode Symbols for Legacy Computing Supplement (noted as "less widely supported than Braille"; unsupported terminals show replacement characters), Custom(char). — [docs.rs Marker](https://docs.rs/ratatui/latest/ratatui/symbols/enum.Marker.html)
- **charmbracelet/bubbles** — `https://github.com/charmbracelet/bubbles` — "TUI components for Bubble Tea" (progress bar, spinner, etc.); Go; MIT; 8,999 stars; pushed 2026-10-04. — [bubbles repo](https://github.com/charmbracelet/bubbles)

### Inferences
- The two most study-worthy "hardware-feel" sequencers are **sektron** (Elektron-inspired, Bubble Tea/Lipgloss, keyboard-first, 16-step grid idiom) and **Orca-c** (ncurses grid with frame-stepping). Both are grid-of-styled-cells designs; neither attempts skeuomorphic hardware graphics, so an OP-1 skin would be novel.
- For meters and waveforms in a Go/Bubble Tea stack, **ntcharts** (sparkline/waveline/streamline on a canvas) is the most direct reusable code; in Rust, Ratatui's Canvas + HalfBlock/Braille markers plus the built-in Sparkline/Gauge widgets are the analogue.
- Bubble Tea music apps all appear to use Lipgloss for colour/borders, so colour handling is reusable via Lipgloss adaptive colours rather than app-specific code.

### Gaps
- No README I fetched (sektron, collidertracker, Orca-c, signls) documents its frame/tick rate or how it renders meters; reading their source would be required to confirm drawing technique.
- I found no project literally named "ktracker", "termdj", "tui-synth", "beatbox tui" or "tenet"; a GitHub search for "vu meter terminal tui" returned zero repositories.
- arcorrust and trem-tui GitHub URLs were not verified (only docs.rs / LinuxLinks pages surfaced).

---

## Key Question 2: Which terminal projects draw animated ASCII/pixel characters reacting to activity (pets, companions, classic screensavers)?

### Takeaway
A 2025–2026 wave of "AI coding companion" pets (petdex, buddy, tamagotchi, clawd-pet, buddymon) provides reusable sprite frames and event-to-mood mappings for Claude Code/Codex hooks, alongside the classic screensaver animations (asciiquarium, pipes.sh, nyancat, cbonsai, tty-clock) that show frame-timer ncurses/ANSI techniques.

### Cited Findings

**Event-reactive companions (2025–2026)**
- **petdex** — `https://github.com/crafter-station/petdex` — "A public gallery of animated pets for Codex, Claude Code, DeepSeek Harness, Hermes, OpenCode, Gemini CLI, and more"; TypeScript; MIT (code; pet assets owned by submitters); 4,266 stars; pushed 2026-10-10. Each pet is a folder with `pet.json` (name, slug, tags, kind, frame size, animation states) plus `spritesheet.webp`/`.png`; frames are 192x208 px in an 8-column x 9-row grid (v2: 8x11 with two rows left for the client to define); nine state rows: idle, running-right, running-left, waving, jumping, failed, waiting, running, review; agent hooks map activity to these states; manifest at `petdex.dev/api/manifest`; desktop renderer is a native floater with a Zig hook server on 127.0.0.1:7777 that "animates on each tool call." Frame timing and character-cell size are not documented. — [petdex README](https://github.com/crafter-station/petdex)
- **buddy** — `https://github.com/fiorastudio/buddy` — MCP-server virtual pet for Claude Code, Codex, Cursor CLI, Copilot CLI, OpenClaw; TypeScript (Node 18+, SQLite state in `~/.buddy/buddy.db`); MIT; 116 stars; pushed 2026-10-21. 21 species each with own ASCII art; mood affects animation ("happy... expressive animations", "grumpy ones blink rarely"); `buddy_observe` tool called from per-client hooks (Claude Code hooks/statusline, Codex `PostToolUse`, Copilot `postToolUse`, Cursor `afterShellExecution`); sprite GIFs in `demo/sprites/`. — [buddy README](https://github.com/fiorastudio/buddy)
- **tamagotchi (usik)** — `https://github.com/usik/tamagotchi` — Python 3.12+, Textual TUI; MIT; 14 stars; pushed 2026-05-14. "Animated ASCII sprites — unique art per character and mood", sprites in `src/tamagotchi/sprites/`; Claude Code hooks (`tama install --claude-code`) map agent events to stats (tests pass: Happy +2; stuck in loop: Happy −1, Hungry −1, etc.); tmux TPM plugin shows mood in status bar; Starship module reads `tama status --json`; plugin API `on_agent_event`. — [tamagotchi README](https://github.com/usik/tamagotchi)
- **clawd-pet** — `https://github.com/Revono/clawd-pet` — "Clawd lives above your prompt in Claude Code. A pet mod that reacts to what Claude is doing"; TypeScript; MIT; pushed 2026-10-02. — [GitHub search result](https://github.com/Revono/clawd-pet)
- **buddymon** — `https://github.com/Marcel-Bich/buddymon` — "A virtual buddy for AI coding CLIs - Claude Code, OpenCode"; 45 stars; pushed 2026-07-19; license NOASSERTION. — [GitHub search result](https://github.com/Marcel-Bich/buddymon)
- **petsonality** — `https://github.com/nanami-he/petsonality` — "16 MBTI ASCII animals for your AI coding terminal"; TypeScript; MIT; pushed 2026-06-11. — [GitHub search result](https://github.com/nanami-he/petsonality)
- **terminal-pet (Go)** — `https://github.com/HonourableAF/terminal-pet` — "A tamagotchi-style terminal pet written in Go (Bubble Tea)"; pushed 2026-10-19; no license listed. — [GitHub search result](https://github.com/HonourableAF/terminal-pet)
- **virtual-pet (Go)** — Bubble Tea pet with cat/bunny, feed/play/sleep/pet commands. — [pkg.go.dev](https://pkg.go.dev/github.com/emmyme/virtual-pet)
- **commitachi** — `https://github.com/senotron/commitachi` — JS pet that "feeds on your git commits"; pushed 2026-07-26. — [GitHub search result](https://github.com/senotron/commitachi)
- **koi** — `https://github.com/james-tharit/koi` — "Run KOI pond in your terminal"; Go; pushed 2026-10-06. — [GitHub search result](https://github.com/james-tharit/koi)
- **Bashou** — `https://github.com/IAmAStealer/Bashou` — "a pixel-art pet that teaches you" bash; Python; MIT; pushed 2026-10-21. — [GitHub search result](https://github.com/IAmAStealer/Bashou)
- **askiimon** — JS library giving "a living ASCII companion for your own CLI, with switchable ASCII emotions." — [askiimon docs](https://pfmcodes.onrender.com/askiimon/docs/)
- **pi-pokepet** — companion for the pi coding agent, with "compact and large terminal line-art roster as an ASCII option, plus Petdex image pets." — [npm README](https://cdn.jsdelivr.net/npm/pi-pokepet@1.6.4/README.md)
- **tpet** — generates a pet with ASCII art/personality, sits in a tmux pane and watches Claude Code session files via watchdog (Reddit post; repo URL not found). — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1sem7sw/snapshots/2026-04-09T16%3A41%3A00.47446Z)
- Claude Code's built-in companion ("Knurl the penguin") is not open source; a feature request asks for custom ASCII art. — [issue mirror](https://claudeissues.com/issue/43306-feature-request-custom-companion-ascii-art)

**Classic animations (canonical)**
- **asciiquarium** — `https://github.com/cmatsuoka/asciiquarium` — Perl; GPL-2.0 per LinuxLinks; 1,282 stars; pushed 2023-08-25. — [LinuxLinks](https://linuxlinks.com/linux-candy-asciiquarium-embrace-marine-life-terminal/3); [repo](https://github.com/cmatsuoka/asciiquarium)
- **pipes.sh** — `https://github.com/pipeseroni/pipes.sh` — "Animated pipes terminal screensaver"; Shell; MIT; 3,044 stars; pushed 2024-08-12. — [repo](https://github.com/pipeseroni/pipes.sh)
- **nyancat** — `https://github.com/klange/nyancat` — "Nyancat in your terminal, rendered through ANSI escape sequences"; C; 1,593 stars; pushed 2024-04-19. — [repo](https://github.com/klange/nyancat)
- **cbonsai** — C/ncurses; live mode grows the tree step by step with configurable wait time; hosted on GitLab (`https://gitlab.com/jallbrit/cbonsai`, per LinuxLinks). — [LinuxLinks](https://www.linuxlinks.com/linux-candy-cbonsai-generate-bonsai-trees/)
- **tty-clock** — `https://github.com/xorg62/tty-clock` — "Clock using lib ncurses"; C; BSD-3-Clause; 1,158 stars; pushed 2024-07-31; options for seconds, 12h, centre, box border and "rebound" (bouncing around the screen). — [LinuxLinks](https://www.linuxlinks.com/tty-clock-terminal-digital-clock/); [repo](https://github.com/xorg62/tty-clock)
- **GitHub Copilot CLI animated banner** (Ink/React): ~20 frames over ~3 s, each frame a TypeScript object `{title, duration, content, colors}` where `colors` maps `"row,col"` to semantic roles (border, head, goggles, eyes, shine, stars, text); separate dark/light themes map roles to 4-bit ANSI colours; frames authored with the open-source editor Ascii-Motion. — [GitHub Blog](https://github.blog/engineering/from-pixels-to-characters-the-engineering-behind-github-copilot-clis-animated-ascii-banner/)
- **Ascii-Motion** — `https://github.com/CameronFoxly/Ascii-Motion` — "A modern web application for creating and animating ASCII art"; TypeScript; MIT; 930 stars; pushed 2026-10-20. — [repo](https://github.com/CameronFoxly/Ascii-Motion)

### Inferences
- The petdex "state rows" vocabulary (idle / running / waiting / failed / review / waving) is a ready-made taxonomy for an OP-1-style character that reacts to transport state (playing, recording, stopped, error).
- Copilot CLI's frame format (multi-line string + sparse `"row,col" -> role` colour map + role -> ANSI theme) is the most directly reusable sprite-frame schema found and is framework-agnostic; it also demonstrates why 4-bit colour was chosen over truecolor for consistency.
- Pets built for Claude Code hooks (buddy, tamagotchi, clawd-pet) show that "reacting to events" is implemented as external hook -> state file/DB -> renderer poll, not in-process audio/MIDI callbacks.

### Gaps
- oneko (the X11 cat) did not surface in any result; no terminal port was found.
- Frame timing (ms per frame) is not documented for petdex, buddy or tamagotchi; would require reading source.

---

## Key Question 3: Which libraries render pixel-art/PNG to terminal cells well, and which handle animation frames?

### Takeaway
chafa (C library + CLI, LGPL-3.0) is the most complete pixel-to-cell engine (symbols, sixel, kitty, iTerm2, GIF animation) and has Python/JS bindings; framework-specific widgets exist for Ratatui (ratatui-image), Textual (textual-image) and Go (pixterm), while braille rendering is covered by drawille (Python) and several small libraries.

### Cited Findings
- **chafa** — `https://github.com/hpjansson/chafa` — "Terminal graphics for the 21st century"; C; LGPL-3.0 (library and tools LGPLv3+); 5,342 stars; pushed 2026-10-19. Core is a C library with "public, well-documented API"; Python and JavaScript bindings maintained by third parties; animated GIF input supported; default output "iterm, kitty or sixels if the connected terminal supports one of these, falling back to symbols ('ANSI art') otherwise"; can pass graphics through tmux/screen. — [chafa README](https://github.com/hpjansson/chafa); [chafa(1) man page](https://man.archlinux.org/man/chafa.1.en); [LinuxLinks review noting "animations are particularly well implemented"](https://www.linuxlinks.com/chafa-terminal-graphics-image-viewer/2/)
- **timg** — `https://github.com/hzeller/timg` — "A terminal image and video viewer"; C++; GPL-2.0; 2,787 stars; pushed 2026-08-05; "designed to bring image and video viewing capabilities to the terminal," with a grid view. — [repo](https://github.com/hzeller/timg); [man page](https://linuxcommandlibrary.com/man/timg)
- **viu** — `https://github.com/atanunq/viu` — "Terminal image viewer with native support for iTerm and Kitty"; Rust; MIT; 3,298 stars; pushed 2025-12-15. — [repo](https://github.com/atanunq/viu)
- **pixterm** — `https://github.com/eliukblau/pixterm` — "Draw images in your ANSI terminal with true color"; Go; MPL-2.0; 1,021 stars; pushed 2026-08-01. — [repo](https://github.com/eliukblau/pixterm)
- **drawille** — `https://github.com/asciimoo/drawille` — "Pixel graphics in terminal with unicode braille characters"; Python; AGPL-3.0 (copyleft, note for reuse); 3,259 stars; pushed 2024-11-13. — [repo](https://github.com/asciimoo/drawille)
- **ratatui-image** — `https://github.com/ratatui/ratatui-image` — "Ratatui widget for rendering image graphics in terminals that support it"; Rust; MIT; 409 stars; pushed 2026-10-18. Supports Sixel, Kitty, iTerm2 and unicode half-blocks; "checks the terminal for a graphics protocol, falling back to halfblocks"; needs terminal font size in pixels to map image onto cells; Sixel "immediate-mode" vs Kitty "stateful"; `Image` (stateless) and `StatefulImage` widgets; README recommends resizing/encoding on a background thread; latest release 10.0.8. — [docs.rs ratatui-image](https://docs.rs/ratatui-image); [repo](https://github.com/ratatui/ratatui-image)
- **textual-image** — `https://github.com/lnqs/textual-image` — "Render images in the terminal with Textual and rich"; Python; LGPL-3.0; 186 stars; pushed 2026-10-20. Widgets `HalfcellImage`, `SixelImage`, `TGPImage`, `UnicodeImage`; uses Terminal Graphics Protocol and Sixel with Unicode fallback. — [PyPI](https://pypi.org/project/textual-image); [repo](https://github.com/lnqs/textual-image)
- **ink-image** — Ink image component, "currently only supported on iTerm >=3"; static, not animated. — [npm ink-image](https://www.npmjs.com/package/ink-image)
- **ink-spinner** — Ink frame-cycling component built on the cli-spinners collection (spinner styles only). — [tessl registry page](https://tessl.io/registry/tessl/npm-ink-spinner)
- **notcurses** — `https://github.com/dankamongmen/notcurses` — "blingful character graphics/TUI library. definitely not curses."; C; 4,755 stars; pushed 2026-05-18; license NOASSERTION in API. — [repo](https://github.com/dankamongmen/notcurses)
- **blessed** — `https://github.com/chjj/blessed` — Node.js high-level terminal interface; 11,887 stars; last pushed 2024-03-22. — [repo](https://github.com/chjj/blessed)
- **Tachikoma.jl** — `https://github.com/kahliburke/Tachikoma.jl` — Julia terminal apps with "sixel graphics, Kitty graphics, animations"; MIT; pushed 2026-09-19. — [GitHub search result](https://github.com/kahliburke/Tachikoma.jl)
- Small braille/pixel canvases found via GitHub search (all low-star, 2023–2026): **dapple** (Python, MIT, "multiple renderers (braille, quadrants, sextants, ASCII, sixel, kitty)") `https://github.com/queelius/dapple`; **rustille** (Rust, Apache-2.0, image-to-braille with Python/Node/WASM/C bindings) `https://github.com/a269ch/rustille`; **braillecanvas** (JS, MIT, "24-bit colour, 2x4 dots per cell") `https://github.com/Igfray/braillecanvas`; **term_canvas.h** (C, MIT) `https://github.com/blueberry077/term_canvas.h`. — [GitHub search](https://github.com/search?q=braille+terminal+canvas)
- **Ascii-Motion** (see KQ2) is the frame editor used to author the Copilot CLI banner frames. — [GitHub Blog](https://github.blog/engineering/from-pixels-to-characters-the-engineering-behind-github-copilot-clis-animated-ascii-banner/)

### Inferences
- For a character-cell OP-1 skin that must look identical everywhere, the half-block (▀/▄ with fg+bg colour, 1x2 per cell) technique used by ratatui-image's fallback, textual-image's `HalfcellImage` and pixterm is the safest "pixel" path; braille gives 2x4 but one colour per cell (consistent with the Marker docs listing no colour for braille and braillecanvas's "24-bit colour per cell").
- chafa's C library can be used offline as a build step to convert PNG sprite sheets into pre-rendered cell/colour frames, avoiding runtime image dependencies in an Ink/Bubble Tea app.
- For Ink/React there is no sprite-sheet component; the Copilot CLI post confirms the team hand-built frame cycling with `setInterval` + `useState`.

### Gaps
- chafa's README fetch did not enumerate symbol classes (block/half/quad/sextant/octant/braille) or colour modes; the man page should be consulted for the exact `--symbols` and `--colors` options.
- I could not confirm notcurses' sprite/animation API (ncvisual) from fetched sources in this session.
- dpayne/cli-visualizer returned 404 from the GitHub API (repo may have been renamed or removed).

---

## Key Question 4: Known good practices for terminal animation (frame rates, diff redraw, flicker, Unicode width-1 glyph ranges)

### Takeaway
Primary sources converge on: overwrite rather than clear, emit each frame as one write, use the Synchronized Output escape protocol where available, and keep ASCII-sprite frame rates modest (Copilot CLI used 75 ms ~13 fps and noted higher rates flicker in some terminals; Textual targets 60 fps for its diff-based compositor; a Charm physics library assumes a fixed FPS time step).

### Cited Findings
- Copilot CLI (Ink): prototype loop `setInterval` at **75 ms (~13 fps)** with a comment that "higher rates can cause flicker in some terminals"; frame durations of 80 ms in the data; banner area 11 rows x 78 columns, lines truncated at 80 chars; animation kept under ~3 s, static and animated components separated to limit redraws, animation opt-in and skipped in `--screen-reader` mode; palette restricted to 4-bit ANSI because 8-bit/truecolor "render inconsistently"; Ink "doesn't manage frame deltas, paint-cycle sync, or flicker" so that logic was hand-built; ~6,000 lines of TypeScript mostly for terminal inconsistencies/accessibility. — [GitHub Blog](https://github.blog/engineering/from-pixels-to-characters-the-engineering-behind-github-copilot-clis-animated-ascii-banner/)
- Textual (Will McGugan): "overwrite, don't clear" (clearing then writing risks a visible blank frame); write each frame in a single write to stdout to avoid partial updates; use the Synchronized Output protocol ("tell the terminal when you begin and end a frame... flicker-free updates"); Textual uses 60 fps as a baseline. — [Textualize blog, "7 things I've learned building a modern TUI framework"](https://www.textualize.io/blog/7-things-ive-learned-building-a-modern-tui-framework) (note: a direct fetch of this URL returned 404 on 2026-10-21; findings come from search-engine excerpts of the post)
- A terminal video/ASCII player offering braille, half-block and ASCII modes "converts the canvas to terminal escape sequences with cursor positioning (no newlines — eliminates flickering)." — [r/commandline mirror](https://rl.klein.ruhr/r/commandline/comments/1rwydjy/i_made_a_terminal_video_ascii_player_that_uses/)
- A skill-pack guideline defaults animations to 10 fps, short duration, easy exit and disabled for non-interactive output. — [ascii terminal animation pack](https://skillselion.com/skills/full-statck-skills/ascii-skills/ascii-terminal-animation-pack)
- The Rust crate "dotmax" advertises 60–120 fps flicker-free braille animation but the listed versions are marked yanked; treat as marketing, not evidence. — [docs.rs dotmax](https://docs.rs/crate/dotmax/0.1.2)
- **harmonica** — `https://github.com/charmbracelet/harmonica` — Charm's "simple, physics-based animation library" (Go, MIT, 1,628 stars, pushed 2026-08-13): `NewSpring(harmonica.FPS(60), angularFrequency, dampingRatio)` then `Update(pos, vel, target)` each frame; "the framerate you set must match your actual framerate"; damping < 1 overshoots, = 1 critically damped, > 1 slow. — [harmonica README](https://github.com/charmbracelet/harmonica)
- cava draws bars with characters so "performance is dependent on the terminal font," and uses "the 1/8 - 7/8 blocks... on the top of each bar to increase resolution"; bar count configurable 0–512 (0 = auto-fill). — [cava README (via search excerpt)](https://github.com/karlstav/cava)
- Ratatui Marker docs: Braille is "limited to terminals and fonts that support Unicode Braille Patterns"; Sextant/Octant are "less widely supported than Braille" and unsupported terminals show replacement characters. — [docs.rs Marker](https://docs.rs/ratatui/latest/ratatui/symbols/enum.Marker.html)
- Unicode code charts for the width-1 glyph ranges relevant to cell art: Block Elements U+2580–U+259F — [Unicode chart](https://www.unicode.org/charts/PDF/U2580.pdf); Box Drawing U+2500–U+257F — [Unicode chart](https://www.unicode.org/charts/PDF/U2500.pdf); Braille Patterns U+2800–U+28FF — [Unicode chart](https://www.unicode.org/charts/PDF/U2800.pdf); Symbols for Legacy Computing U+1FB00–U+1FBFF (sextants, octants) — [Unicode chart](https://www.unicode.org/charts/PDF/U1FB00.pdf)

### Inferences
- A comfortable target for a sprite-based OP-1 character in Ink or Bubble Tea is ~8–13 fps (75–125 ms), matching Copilot CLI's empirically tested interval; faster rates are only safe with a diff-based compositor and Synchronized Output (Textual, Ratatui's double buffer).
- Smooth needle/reel motion (VU meters, tape reels) is better modelled with a spring (harmonica) at a fixed tick than with hand-tuned easing, provided the tick interval is held constant.
- Restricting glyphs to Block Elements + Box Drawing + Braille (all East-Asian-Width "Neutral/Narrow", width 1) and 16-colour ANSI maximises portability; Legacy Computing sextants/octants should be an opt-in "hi-res" mode.

### Gaps
- No authoritative benchmark of flicker vs frame rate across terminals was found; all fps figures are anecdotal/project-specific.
- The Textual blog post could not be fetched directly (404), so its exact escape sequences for Synchronized Output (DEC 2026) were not verified from the page.

---

## Key Question 5: Projects that do LCD / 7-segment / retro-device skins in a terminal

### Takeaway
Direct "retro device skin" TUIs are rare; the nearest are 7-segment/big-digit clocks (tty-clock, tock, 7clock, sigye with FIGlet fonts), the CRT-emulating terminal emulator cool-retro-term, and the Elektron-inspired sektron sequencer. No OP-1 or Teenage-Engineering-style terminal emulation was found.

### Cited Findings
- **tty-clock** — `https://github.com/xorg62/tty-clock` — ncurses large-digit clock; C; BSD-3-Clause; 1,158 stars; pushed 2024-07-31. Sources do not state whether digits are strictly 7-segment. — [LinuxLinks](https://www.linuxlinks.com/tty-clock-terminal-digital-clock/)
- **tock** — `https://github.com/nwtnni/tock` — "Digital clock for the terminal"; Rust; MIT; 167 stars; pushed 2025-01-16. — [repo](https://github.com/nwtnni/tock)
- **7clock** — "seven-segment display style clock for your terminal"; display-only; found on AUR, GitHub URL not confirmed. — [AUR mirror](https://www.linux-meta.duckdns.org/en/p/7clock)
- **sigye** — Rust/Ratatui clock with Clock, Pomodoro, Timer, Stopwatch, World Clock, Countdown modes and "40+ bundled FIGlet fonts"; compares itself to tty-clock. — [docs.rs sigye](https://docs.rs/sigye)
- **Seven-Seg-Clock** — `https://github.com/Foidii/Seven-Seg-Clock` — C++ university project, 0 stars, pushed 2023-12-04 (only exact 7-segment hit on GitHub search). — [GitHub search result](https://github.com/Foidii/Seven-Seg-Clock)
- **cool-retro-term** — `https://github.com/Swordfish90/cool-retro-term` — "A good looking terminal emulator which mimics the old cathode display"; QML; 26,523 stars; pushed 2026-05-31 (a terminal *emulator* with CRT shaders, not a TUI). — [repo](https://github.com/Swordfish90/cool-retro-term)
- **sektron** is explicitly "inspired by Elektron devices" (hardware-sequencer UI idiom in a TUI). — [sektron README](https://github.com/emprcl/sektron)
- **cava** — `https://github.com/karlstav/cava` — "Cross-platform Audio Visualizer" (ncurses bars or SDL); C; MIT; 6,489 stars; pushed 2026-10-21; inputs PipeWire, PulseAudio, ALSA, OSS, JACK, Sndio, MPD. — [repo](https://github.com/karlstav/cava); [LinuxLinks](https://www.linuxlinks.com/cava-cross-platform-audio-visualizer/)
- **tiptop** — `https://github.com/nschloe/tiptop` — "Command-line system monitoring"; Python; MIT; 2,127 stars; pushed 2025-09-04 (Textual-era braille/graph system monitor, useful for meter layouts). — [repo](https://github.com/nschloe/tiptop)
- A search for "OP-1 tape reels terminal ASCII emulation" returned only unrelated 1970s–80s terminal hardware (Ontel OP-1/70, Friden 2301) and a Nintendo DS homebrew DAW with a "reel-to-reel tape recorder" page. — [gamebrew OP-1 DS](https://www.gamebrew.org/index.php?title=Op-1)
- GitHub repository searches for "op-1 teenage engineering terminal" and "vu meter terminal tui" returned zero repositories on 2026-10-21. — [GitHub search API query](https://github.com/search?q=op-1+teenage+engineering+terminal)

### Inferences
- FIGlet-style big-digit rendering (as in sigye, tty-clock) is the established way to do an LCD-ish numeric readout (BPM, bar:beat) in cells; a 7-segment look can be built from Block Elements with per-segment on/off colour.
- cava's "1/8–7/8 block" bar-top technique (U+2581–U+2587) is the canonical way to get sub-cell vertical resolution for VU/level meters without braille.

### Gaps
- No existing open-source terminal project reproduces an OP-1 (or any specific music-hardware) display; the skin would have to be assembled from the sequencer grids (KQ1), sprite/pet frame formats (KQ2), pixel-to-cell renderers (KQ3) and meter techniques (KQ4/5) listed here.
- Curated lists (`https://github.com/rothgar/awesome-tuis`, 20,955 stars; `https://github.com/ratatui/awesome-ratatui`, 2,049 stars) were confirmed to exist via the GitHub API but their contents were not fetched; they may list further music/visualizer entries.
