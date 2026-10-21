# Licensed assets, fonts, glyphs, sounds and conversion tooling for an OP-1-style "little guys working" terminal UI

Research date: 2026-10-21. Every pack below was checked on its own page unless noted as "secondary source". Licenses are as stated on the linked page at research time; re-verify before shipping.

## Key Question 1: CC0 / CC-BY tiny character sprite packs (8x8 / 16x16, idle/walk/work/cheer)

### Takeaway
There are at least nine explicitly-licensed tiny character packs usable without negotiation, nearly all CC0. True 8x8 *animated* workers are rare; the realistic recipe is an 8x8 or 16x16 base body (Kenney Micro Roguelike / 8x8 Character Pack / DarkOnes) plus hand-drawn 2–4 frame idle/work/cheer variants, since none of the CC0 packs found ships an explicit "working" or "cheer" animation at 8x8.

### Cited Findings

**Kenney (all CC0, no attribution required)**
- Kenney "Micro Roguelike": 8 x 8 tiles, CC0, ~320 files; characters included but animation frames not stated on the page. Download: https://kenney.nl/media/pages/assets/micro-roguelike/bbcaf50993-1677578239/kenney_micro-roguelike.zip — [Kenney Micro Roguelike](https://kenney.nl/assets/micro-roguelike)
- Kenney "Tiny Dungeon": 16 x 16 tiles, CC0, ~130 files; sibling packs Tiny Town (https://kenney.nl/assets/tiny-town) and Tiny Battle (https://kenney.nl/assets/tiny-battle) listed in the same "Tiny" series; animation frames not stated. — [Kenney Tiny Dungeon](https://kenney.nl/assets/tiny-dungeon)
- Kenney "1-Bit Pack": 16 x 16 tiles, CC0, ~1078 files; monochrome, includes characters; animation not stated. — [Kenney 1-Bit Pack](https://kenney.nl/assets/1-bit-pack)
- A third-party guide confirms Kenney assets are CC0 with no attribution required, and that "Roguelike Characters" contains hundreds of small characters on a single sheet (secondary source). — [Cinevva guide](https://app.cinevva.com/guides/free-2d-sprites-tilesets)

**OpenGameArt (OGA)**
- "8x8 Character Pack" by patvanmackelberg: CC0; 8 villagers (4 m / 4 f), wizard, archer, swordsman, each with an "attack" variant sprite; single PNG `8X8 CharPack.png` (3.7 KB); no full walk cycle stated. — [OGA 8x8 Character Pack](https://opengameart.org/content/8x8-character-pack)
- "Puny Characters" by Shade: CC0 (listing also shows OGA-BY); 16x16 bodies drawn on 32x32 canvas; 8-directional Idle, Walk, Sword Attack, Bow Attack, Stave Attack, Throw, Hurt, Death; ZIP 236 KB (orcs variant 510 KB). — [OGA Puny Characters](https://opengameart.org/content/puny-characters)
- "Mini Roguelike 8x8 Tiles" by morgan3d (with Kenney): CC0, "attribution not required but appreciated"; more monsters/classes/female characters; no animation info. — [OGA Mini Roguelike 8x8](https://opengameart.org/content/mini-roguelike-8x8-tiles)
- "8x8 Rogue-Like Char/Enemies/Tiles" by Min: CC0; 3 classes x 3 armor tiers; note the mage is 8x11 (hat), so not strictly 8x8. — [OGA 8x8 rogue-like](https://opengameart.org/content/8x8)
- "Tiny Creatures" by Clint Bellanger: CC0 1.0; 180 sprites (100+ monsters, 50+ animals) compatible with Kenney Tiny Dungeon/Tiny Town style. — [itch Tiny Creatures](https://clintbellanger.itch.io/tiny-creatures); [OGA mirror](https://opengameart.org/node/160872)
- "Micro Character Bases - Basics": six characters with Idle, Walk, Punch, Hit, Death animations; license NOT visible in search snippet — verify on page before use. — [OGA Micro Character Bases](https://opengameart.org/node/31269)
- OGA "8x8 CC0 sprites" collection page aggregates further packs. — [OGA 8x8 collection](https://opengameart.org/content/8x8)

**itch.io (filter: CC0)**
- itch.io has a browsable CC0 + "1-bit" tag filter. — [itch CC0 1-bit assets](https://itch.io/game-assets/newest/assets-cc0/tag-1-bit)
- "PixelArt Character: DarkOnes" by The Lazy Sorcerer Arts (formerly zenn-project URL, 302-redirects): CC0; 16x16 drawn to be used at 8x8; animations Idle, Run, Death1, Death2, Pushing, Use, plus static Jump; 1 character, 2 skins; RAR archive 48 kB; name-your-own-price. "Pushing"/"Use" are the closest thing to a *working* animation found at 8x8. — [itch DarkOnes](https://the-lazy-sorcerer-arts.itch.io/platformer-characther)
- "1-Bit Doomsphere Charset" by BUTTERHANDS: CC0 1.0; 32x32; 42 characters (humans, skeletons, orcs, elves, goblins...); 4-frame idle each; single sprites + spritesheet; white-outline variants; ZIP 289 kB. — [itch Doomsphere](https://butterhands.itch.io/doomsphere-charset)
- "Fearless Beast" by tbleazy: CC0 1.0, 4-frame idle; size not stated; download listed as unavailable at research time. — [itch Fearless Beast](https://tbleazy.itch.io/fearless-beast)
- Excluded (attribution required, CC-BY 4.0, listed for completeness): IvoryRed "PICO-8 character sprite" 8x8 — [itch](https://ivoryred.itch.io/pico-8-character-sprite); colorsqueaks "1Bit Mushroom character" — [itch](https://colorsqueaks.itch.io/1bit-mushroom-character)

### Inferences
- Kenney packs are distributed as ZIPs of PNG (the pages do not list formats; the ZIP filenames and the "Files N×" counts imply per-tile PNGs plus a sheet).
- For a 1-bit OP-1 aesthetic, Kenney 1-Bit Pack (16x16, monochrome) and Doomsphere (1-bit, 32x32, 4-frame idle) convert cleanly to a two-color terminal palette; multi-color packs (Tiny Dungeon, Puny) need palette quantization to the terminal's 16/256 colors or truecolor.
- "Work" and "cheer/celebrate" frames will almost certainly need to be hand-drawn: no CC0 8x8/16x16 pack found exposes those states. "Pushing" (DarkOnes) and "attack" (8x8 Character Pack) are the nearest donors for a hammering/typing pose.
- Conversion sizing: an 8x8 sprite via half-blocks (▀/▄, 1 cell = 1 px wide x 2 px tall) becomes 8 columns x 4 rows; via braille (1 cell = 2 px wide x 4 px tall) becomes 4 columns x 2 rows; a 16x16 sprite becomes 16x8 (half-block) or 8x4 (braille). Kenney's Micro Roguelike 8x8 bodies therefore render as a 4x2-cell braille "guy" or an 8x4-cell colored half-block "guy".

### Gaps
- No pack found with explicit "working"/"celebrate" animations at 8x8 or 16x16 under CC0.
- Kenney pages don't state frame counts or formats; need to unzip to confirm.
- "Micro Character Bases - Basics" license unverified.

## Key Question 2: Open pixel fonts closest to the OP-1 display typeface

### Takeaway
The OP-1's on-screen typeface is not publicly identified or released; Departure Mono (OFL), Silkscreen (OFL), Pixel Operator (CC0), m5x7 (CC0) and a handful of 3x5 CC0 micro-fonts are the freely licensed candidates. Note that in a *terminal* UI the font is the user's terminal font, so these matter mainly for (a) recommending a terminal font, and (b) rasterizing text into sprite pixels that you then convert to cells.

### Cited Findings
- Departure Mono (Helena Zhang): monospaced pixel font with "lo-fi, techy vibe"; font licensed SIL OFL, site/repo MIT; recommended font sizes in increments of 11px for pixel-perfect rendering; download via GitHub releases. — [GitHub rektdeckard/departure-mono](https://github.com/rektdeckard/departure-mono)
- A Nerd-Font-patched Departure Mono exists (Homebrew cask `font-departure-mono-nerd-font`), packaged as OFL-1.1-no-RFN. — [brew cask](https://formulae.brew.sh/cask/font-departure-mono-nerd-font); [MSYS2 package](https://packages.msys2.org/packages/mingw-w64-x86_64-otf-departure-mono-nerd)
- Silkscreen (Jason Kottke): Open Font License; most glyphs 4x5 px (max 5x5), uppercase only, four fonts incl. bold and "Expanded"; use at multiples of 8pt with anti-aliasing off; TrueType for Win/Mac/Linux. — [kottke.org Silkscreen](https://kottke.org/plus/type/silkscreen/); also on [Google Fonts](https://fonts.google.com/specimen/Silkscreen)
- Pixel Operator (Jayvee Enaguas / HarvettFox96): author relicensed to CC0 1.0 in the 2018 update; DaFont lists "Public domain / GPL / OFL". — [DaFont Pixel Operator](https://www.dafont.com/pixel-operator.font)
- m5x7 (Daniel Linssen): CC0 1.0, "attribution appreciated"; use at 16/32/48 px; m5x7.ttf (33 kB); siblings m3x6 and m6x11. — [itch managore/m5x7](https://managore.itch.io/m5x7)
- Retro Pixel Font (TakWolf): OFL 1.1, multiple variants, glyphs editable as PNGs. — [itch takwolf/retro-pixel-font](https://takwolf.itch.io/retro-pixel-font)
- Micro fonts (CC0): "Another Tiny Pixel Font (Mono 3x5)" .ttf — [itch](https://alasseearfalas.itch.io/another-tiny-pixel-font-mono-3x5); Tom Thumb 3x5 (relicensed CC0 June 2015) — [OGA](https://opengameart.org/node/39490); "Tiny Bitmap Font" 3x6 PNG sheets — [OGA](https://opengameart.org/content/tiny-bitmap-font); "Tiny Nostalgia" 3x5 .ttf — [itch](https://wherbe.itch.io/tiny-nostalgia); "bitterBits" 3x4 — [itch](https://absentspaghetti.itch.io/bitterbits-3x4-cc0-pixel-font)
- Open Pixel Font Project: hand-drawn bitmap versions of popular vector fonts (e.g. Open Sans) under the originals' licenses. — [git.applefritter.com mirror](https://git.applefritter.com/6502/pixel-fonts)
- OP-1 hardware: 320x160 OLED (Wikipedia says AMOLED) showing graphical mode screens; no source identifies the display typeface. — [Wikipedia OP-1](https://en.wikipedia.org/wiki/Teenage_Engineering_OP-1)
- The only font-identification page found claims the TE wordmark is custom lettering, not a released font (low-authority SEO page). — [madegooddesigns](https://madegooddesigns.com/?p=18854)

### Inferences
- Departure Mono is the best single recommendation for the *terminal font* (monospace, Nerd-Font patched build exists so glyph coverage for ◐▰⠿ is better).
- For rasterizing labels into sprite pixels (e.g. an 8-px-tall "REC" tape label drawn with half-blocks), Silkscreen (4x5 caps) or a 3x5 CC0 micro-font gives the most OP-1-like compact caps; Tom Thumb/Tiny Bitmap Font ship as PNG/bitmap, which is simplest to pack into cell frames.

### Gaps
- No verified "TE font"/OP-1 display font lookalike exists under an open license; no fan recreation found.
- Pixel Operator's primary repo (notabug) returned 404; CC0 claim rests on the DaFont page and changelog.
- Google Fonts page for Silkscreen did not render text (JS); OFL is from kottke.org.

## Key Question 3: Unicode glyphs that render width-1 reliably, and pitfalls

### Takeaway
Block Elements, Braille Patterns, and most Geometric Shapes are either Neutral (N) or East-Asian-Ambiguous (A) width; both are treated as 1 cell by wcwidth and by Western-locale terminals, so ▁▂▃▄▅▆▇█ ▀▄▌▐ ⠀–⣿ ◐◓◑◒ ◴◷◶◵ ●○◉ ▮▯▰▱ are all safe. Avoid anything East-Asian-Wide (W) — ⬛⬜⏩⏪ノ︵ — and never append U+FE0F; those are 2 cells or terminal-dependent.

### Cited Findings
- Local check with Python 3 `unicodedata` (Unicode 16.0.0 data) on 2026-10-21 gave these East_Asian_Width classes (A = Ambiguous, N = Neutral, W = Wide):
  - Reels: ◐ U+25D0 A, ◓ U+25D3 N, ◑ U+25D1 A, ◒ U+25D2 N; ◴◷◶◵ U+25F4–F7 N; ⟳ U+27F3 N, ⟲ U+27F2 N, ↻ U+21BB N, ↺ U+21BA N; arcs ◜◠◝◞◡◟ N.
  - Meters: ▁▂▃▄▅▆▇█ U+2581–2588 A; ▏▎▍▌▋▊▉ U+258F–2589 A; ▮ U+25AE N, ▯ U+25AF N, ▰ U+25B0 N, ▱ U+25B1 N; ░ U+2591 N, ▒ U+2592 A, ▓ U+2593 A.
  - Half/quadrant blocks: ▀ U+2580 A, ▄ U+2584 A, ▌ U+258C A, ▐ U+2590 N; ▖▘▝▗ U+2596–259D N.
  - LEDs: ● U+25CF A, ○ U+25CB A, ◉ U+25C9 N, ◎ U+25CE A, ◯ U+25EF A, • U+2022 A, · U+00B7 A, ⬤ U+2B24 N.
  - Braille: ⠁ U+2801, ⠿ U+283F, ⣿ U+28FF all N.
  - Transport: ⏵ U+23F5 N, ⏸ U+23F8 N, ⏹ U+23F9 N, ⏺ U+23FA N, ⏏ U+23CF N, ▶ U+25B6 A, ◀ U+25C0 A; BUT ⏩ U+23E9 W and ⏪ U+23EA W.
  - Squares: ■ U+25A0 A, □ U+25A1 A, ▪▫ N; ⬛ U+2B1B W, ⬜ U+2B1C W (avoid).
  - Kaomoji parts: ʕ U+0295 N, ᴥ U+1D25 N, ʔ U+0294 N (safe); ノ U+30CE W, ︵ U+FE35 W (table-flip kaomoji are 2-cell).
  - Misc: ⚙ U+2699 N, ☺☻ N, ✓ ✗ N, ☐☑☒ N, ★☆ A, ♪ A, ♫ N, ° U+00B0 A, box drawing ┻━╯╰ A.
  (Source: local run of `unicodedata.east_asian_width`; script at /private/tmp/claude-501/-Users-kj-Code-mess-around/34d5dd32-dcd8-49af-a631-f38c3bb95545/scratchpad/eaw.py — primary data, not a web page.)
- Python `wcwidth` treats Ambiguous as narrow (1 cell) by default; `ambiguous_width=2` is only for CJK contexts. Neutral characters are assigned 1 cell. — [wcwidth API docs](https://wcwidth.readthedocs.io/en/latest/api.html)
- GNOME VTE issue: some Box Drawing (U+2500–257F) and Block Element characters (U+2590, U+2591) are Neutral while neighbours are Ambiguous, which mis-aligns them only when a terminal is configured to render Ambiguous as wide (CJK mode). — [VTE issue 2458](https://gitlab.gnome.org/GNOME/vte/-/issues/2458)
- Variation selector U+FE0F widens the preceding base character, which `wcwidth()` cannot handle because it only inspects the base codepoint. — [terminal-wg spec issue 9](https://gitlab.freedesktop.org/terminal-wg/specifications/issues/9)
- Terminals disagree on U+2601+U+FE0F: Kitty draws and counts 2 cells; macOS Terminal draws 2 but counts 1 (next char overlaps); Alacritty ignores the selector (1 cell). — [zsh-workers 2024 msg00487](https://www.zsh.org/mla/workers/2024/msg00487.html)
- U+2601 is Neutral and not Emoji_Presentation; only the selector makes it wide; fish handles codepoint-by-codepoint with hacks for VS. — [fish-shell issue 10461](https://github.com/fish-shell/fish-shell/issues/10461)
- Unicode's own document on emoji width in terminals (L2/16-027) is the standards reference for why Emoji_Presentation=Yes characters are treated as Wide. — [Unicode L2/16-027 PDF](https://www.unicode.org/L2/L2016/16027-emoji-terminals-eaw.pdf)
- Ready-made spinner frame sets (MIT, `cli-spinners`): dots `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` (80 ms), dots2 `⣾⣽⣻⢿⡿⣟⣯⣷`, circleHalves `◐◓◑◒` (50 ms), circleQuarters `◴◷◶◵` (120 ms), arc `◜◠◝◞◡◟`, squareCorners `◰◳◲◱`, boxBounce `▖▘▝▗`, growVertical `▁▃▄▅▆▇▆▅▄▃`, growHorizontal `▏▎▍▌▋▊▉▊▋▌▍▎`, noise `▓▒░`, pipe `┤┘┴└├┌┬┐`, star `✶✸✹✺✹✷`, bouncingBall `( ●    )`…; note `clock` and `runner` use emoji (🕛, 🚶) and are 2-cell. — [cli-spinners spinners.json](https://raw.githubusercontent.com/sindresorhus/cli-spinners/main/spinners.json)
- `chafa --symbols` classes include block, border, diagonal, dot, quad, half, hhalf, vhalf, braille, technical, geometric, ascii, extra — a convenient enumeration of "terminal-safe" glyph families. — [chafa(1) man page](https://manpages.ubuntu.com/manpages/jammy/man1/chafa.1.html)

### Inferences
- Safe reel animation: `◐◓◑◒` (mixed A/N, all 1-cell in Western locale) or `◴◷◶◵` (all N — the strictly safest choice). Safe VU meter: `▁▂▃▄▅▆▇█` (all A, 1-cell everywhere except CJK-ambiguous-wide mode). Safe LEDs: `○◉●` or `·•●`. Use `▮▯` or `▰▱` for segment meters (N).
- Pitfalls to codify: (1) never emit U+FE0F/U+FE0E; (2) exclude any codepoint with EAW=W or Emoji_Presentation=Yes; (3) for maximum safety prefer EAW=N over EAW=A, because terminals in CJK "ambiguous-wide" mode will double A glyphs (this includes the very common █ and ●); (4) ◐ and ◑ are A while ◓ and ◒ are N, so a reel made from the four will only misalign in ambiguous-wide mode; (5) kaomoji like ʕ•ᴥ•ʔ are safe but (╯°□°)╯︵ ┻━┻ contains W katakana/presentation-forms; (6) Nerd Font private-use glyphs are font-dependent and should be avoided unless the user opts in.
- Braille U+2800 (blank) is treated as whitespace by some applications/terminals (img2braille has a `--noempty` flag for this); use U+2800 vs ' ' consistently and test.

### Gaps
- No single authoritative table of per-terminal (iTerm2, Kitty, WezTerm, Windows Terminal, Alacritty, Ghostty) rendering for Geometric Shapes was found; the per-codepoint classes above are from Unicode data, not render tests.
- `wcwidth` package was not installed locally so its exact per-char output was not captured; its documented policy (A=1, N=1) was used.

## Key Question 4: Tools that convert PNG sprite sheets to terminal frames (and expose per-cell data)

### Takeaway
chafa is the only mature tool with a documented per-cell API (`chafa_canvas_get_char_at`, `chafa_canvas_get_colors_at`) rather than just escape strings; chafa.py exposes a `CanvasInspector` for the same in Python. For tiny 1-bit sprites a 30-line Pillow script (2x4 px → braille codepoint = 0x2800 + dot bits; 1x2 px → ▀/▄ with fg/bg) is simpler and gives you JSON frames directly.

### Cited Findings
- chafa: `-f/--format` accepts iterm, kitty, sixels, symbols; `--symbols` selects glyph classes (all, none, space, solid, stipple, block, border, diagonal, dot, quad, half, hhalf, vhalf, braille, technical, geometric, ascii, extra) combinable with `+`/`-`; `--fill` for gradients; `--font-ratio` default 1/2; e.g. `chafa -c none --symbols block+border-solid in.png`. — [chafa(1) Ubuntu man page](https://manpages.ubuntu.com/manpages/jammy/man1/chafa.1.html); [Debian man page](https://dyn.manpages.debian.org/bullseye/chafa/chafa.1.en.html)
- chafa C API (LGPL-3.0-or-later, (C) 2018–2025 Hans Petter Jansson) per-cell readers: `gunichar chafa_canvas_get_char_at(ChafaCanvas*, gint x, gint y)` (since 1.8); `void chafa_canvas_get_colors_at(ChafaCanvas*, gint x, gint y, gint *fg_out, gint *bg_out)` (1.8); `chafa_canvas_get_raw_colors_at(...)` (1.8); `chafa_canvas_print_rows_strv(...)` returns rows as strings (1.14). — [chafa-canvas.h](https://raw.githubusercontent.com/hpjansson/chafa/master/chafa/chafa-canvas.h)
- chafa symbol-map reference (ChafaSymbolMap) documents symbol tag selection in the library. — [ChafaSymbolMap ref](https://hpjansson.org/chafa/ref/chafa-ChafaSymbolMap.html)
- chafa.py: Python bindings on PyPI (`chafa.py`, versions through 1.2.0); API reference lists `CanvasInspector` under "The Canvas" and the tutorial has "Inspecting the canvas"; the Loader class needs MagickWand. — [chafa.py docs](https://chafapy.mage.black/); [PyPI chafa.py](https://pypi.org/project/chafa.py); [GitHub GuardKenzie/chafa.py](https://github.com/GuardKenzie/chafa.py)
- img2braille (TheFel0x): GPL-3.0, Pillow-based; each 2x4 pixel block → one braille char, codepoint = 0x2800 + dot bits (1,2,4,8,16,32,64,128); options `-w` width, `-d` dither, `-i` no-invert, `--calc RGBsum|R|G|B|BW`, `-a` autocontrast, `-c none|ansi|ansifg|ansiall|html|htmlbg|htmlall`, `-n` skip U+2800, `-b` blank/full-block mode; output is text to stdout (escape strings, not structured). — [GitHub TheFel0x/img2braille](https://github.com/TheFel0x/img2braille)
- picharsso (PyPI): renders images in braille style with PIL. — [python-picharsso spec](https://eur.openeuler.openatom.cn/results/mywaaagh_admin/pypi/openeuler-22.03_LTS_SP1-x86_64/00073801-python-picharsso/python-picharsso.spec)
- artty (PyPI): "Convert any image to Unicode braille ASCII art with 24-bit ANSI color support" (page body failed to load; details unverified). — [PyPI artty](https://pypi.org/project/artty/)
- art-txt (PyPI): CLI generating ASCII and Braille styles. — [PyPI art-txt](https://pypi.org/project/art-txt/)
- Node: `terminal-image` v4.3.0 renders with ANSI block characters when the terminal lacks graphics protocols (escape strings only). — [terminal-image README](https://cdn.jsdelivr.net/npm/terminal-image@4.3.0/readme.md)
- Node: `img2braille` (braille from image, dither/invert) — [npm img2braille](https://www.npmjs.com/package/img2braille); `braille-art` (jimp-based) — [npm braille-art](https://www.npmjs.com/package/braille-art); `tenjify` (width/threshold) — [npm tenjify](https://www.npmjs.com/package/tenjify); `terminal-art` (ANSI art) — [yarn terminal-art](https://classic.yarnpkg.com/en/package/terminal-art); `ansir` (PNG → UTF-8 block art with ANSI colors, no 24-bit yet) — [GitHub jcraywtf/ansir](https://github.com/jcraywtf/ansir)
- Go: `dots` converts images to braille with ANSI colors. — [pkg.go.dev imjasonh/dots](https://pkg.go.dev/github.com/imjasonh/dots)
- No chafa WebAssembly/npm binding was found; chafa is a C library (LGPLv3+) that would have to be compiled with Emscripten. — [search result summary; chafa README via Debian sources](https://sources.debian.org/src/chafa/1.18.0-1/README.md)

### Inferences
- None of the npm/pypi one-shot converters output per-cell `{codepoint, fg, bg}`; they emit escape strings. For a JSON frame pipeline, either (a) use chafa.py's `CanvasInspector` / chafa C API, or (b) write a Pillow script. Recommended Pillow recipe for 1-bit sprites: slice the sheet into frames (sprite size known from pack page), threshold alpha/luma, then per frame emit `rows[y][x] = {"ch": chr(0x2800 | bits), "fg": palette_index}` for braille (bits from the 2x4 block, dot order 1,2,3,7 left column top→bottom and 4,5,6,8 right column) or `{"ch": "▀", "fg": top_px, "bg": bottom_px}` for half-blocks. This mirrors the img2braille encoding above.
- For colored 16x16 sprites, chafa with `--symbols half` or `quad` at `--size 16x8` gives an 8-row half-block render; `--symbols braille` at `--size 8x4` gives the 2x4 braille cells, but braille drops color to a single fg per cell.
- GPL-3.0 (img2braille) matters only if you vendor its code; using it as an offline conversion step imposes no license on your output frames.

### Gaps
- Exact chafa.py `CanvasInspector` attribute names (char/fg/bg accessors) were not retrieved from the API page.
- No existing tool specifically slices sprite *sheets* into frames; pre-cut with Pillow or ImageMagick.
- No dedicated "sprite2ansi" package was found under that name.

## Key Question 5: Free (CC0) UI sound effects: clicks, tape start/stop, beeps, success/error, join/leave

### Takeaway
Kenney's three CC0 audio packs (UI Audio 50 files, Interface Sounds 100 files, Digital Audio 60 files) cover clicks, switches, confirms and chiptune-ish beeps; freesound.org's CC0 filter yields real cassette-deck button/tape-stop recordings. No explicitly OP-1-branded or "OP-1-like" CC0 UI pack was found.

### Cited Findings
- Kenney "UI Audio": CC0; 50 files; tags button, switch, click. ZIP: https://kenney.nl/media/pages/assets/ui-audio/490d233f68-1677590494/kenney_ui-audio.zip — [Kenney UI Audio](https://kenney.nl/assets/ui-audio)
- Kenney "Interface Sounds": CC0; 100 files; tags interface, click, button. ZIP: https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip — [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds)
- OGA mirror of Interface Sounds says 100 separate OGG files at normalized volume, covering button clicks, snaps, minimize/maximize, confirmations; attribution optional (credit "Kenney.nl" requested). — [OGA interface-sounds](https://opengameart.org/content/interface-sounds)
- Godot Asset Library repackagings: Kenney UI Audio (CC0, 50 UI sfx, converted Ogg Vorbis → WAV by Calinou, repo Calinou/kenney-ui-audio) — [Godot asset 795](https://godotengine.org/asset-library/asset/795), [asset 796](https://godotengine.org/asset-library/asset/796); Kenney Interface Sounds WAV — [Godot asset 794](https://godotengine.org/asset-library/asset/794)
- Kenney "Digital Audio": CC0; 60 files; tags space, laser; v1.0 2012. ZIP: https://kenney.nl/media/pages/assets/digital-audio/216eac4753-1677590265/kenney_digital-audio.zip — [Kenney Digital Audio](https://kenney.nl/assets/digital-audio)
- OGA "Atmospheric Interaction Sound Pack" (legoluft): CC0, 43 .wav, tagged beep/error/warning, "best for GUI". — [OGA node 3371](https://opengameart.org/node/3371)
- OGA "GUI Sound Effects" (Lokif): CC0; menu, error, confirmation, click. — [OGA gui-sound-effects](https://opengameart.org/content/gui-sound-effects)
- OGA "Good CC0 UI Sounds" (AnyRPG): curated CC0 interface beeps and pops. — [OGA node 145495](https://opengameart.org/node/145495)
- OGA "ui_sounds" (HaelDB): CC0; error, accept, notification, attention. — [OGA ui-sounds-0](https://opengameart.org/content/ui-sounds-0)
- OGA "UI Sound effects pack" (ViRiX): CC-BY 3.0 — attribution REQUIRED (credit line given on page). — [OGA ui-sound-effects-pack](https://opengameart.org/content/ui-sound-effects-pack)
- freesound.org search "cassette button" with CC0 filter returns 93 sounds (server-rendered HTML; aggregate formats wav: 62, flac: 24). Examples: "press button(Cassette player).wav" by 220bluebulb, 3 s — https://freesound.org/people/220bluebulb/sounds/572138/ ; "Cassette Tape Button" by albertomarun, 11 s — https://freesound.org/people/albertomarun/sounds/423870/ ; "Cassette Tape Play" by albertomarun, 6 s — https://freesound.org/people/albertomarun/sounds/423875/ ; "Tape stop effect" by not_yr, 18 s — https://freesound.org/people/not_yr/sounds/680836/ ; "RecButton_Sony_TCM-16.wav" by gigala, 4 s — https://freesound.org/people/gigala/sounds/494605/ ; "Sony Vintage Casette Player Knob Snap" by Joao_Janz, 9 s — https://freesound.org/people/Joao_Janz/sounds/477685/ . License shown only as the search filter, so confirm CC0 on each sound page. — [freesound CC0 search](https://freesound.org/search/?q=cassette+button&f=license%3A%22Creative+Commons+0%22)
- Commercial-only (not CC0, excluded): Uppbeat "Cassette tape start & stop" and Artlist cassette clicks. — [uppbeat](https://uppbeat.io/sfx/cassette-tape-start-stop/168892/63600); [artlist](https://artlist.io/sfx/track/cassette---pause-button-click/59595)

### Inferences
- Kenney native format is OGG (per the OGA mirror and the Godot "converted from Ogg Vorbis" note); the Godot repackagings give WAV if your playback lib (e.g. macOS `afplay`, Python `simpleaudio`) dislikes OGG.
- Mapping to events: click → Kenney UI Audio "click"/"switch"; tape start/stop → freesound cassette presses (trim to <300 ms); beep/boop → Kenney Digital Audio; success/error → Lokif GUI Sound Effects or HaelDB ui_sounds; join/leave blips → Kenney Interface Sounds "confirmation"/"minimize/maximize" pairs.
- For an OP-1 flavour, short square-wave beeps (Digital Audio) plus a mechanical cassette click layered underneath will be closer than any single pack.

### Gaps
- No CC0 pack explicitly marketed as "OP-1-like"/Teenage-Engineering-style was found.
- Per-file descriptions/durations for Kenney packs are not on the pages; need to unzip.
- Freesound per-sound license and format must be verified individually (page shows filter only).

## Key Question 6: Existing ASCII "crew of workers / busy little people" animations in the public domain

### Takeaway
No public-domain ASCII worker/construction-crew animation set was found. The big ASCII collections (asciiart.eu, Joan Stark–era archives) carry no blanket license and the community norm is per-artist permission; cowsay's figures are GPL/Artistic. The practical path is to draw your own 2–4 frame figures or derive them from the CC0 sprite packs above.

### Cited Findings
- asciiart.eu hosts 11,000+ pieces across categories but no license statement was found; the "Respect ASCII Artists Campaign" states not all ASCII art is freely available, artists' initials must be kept, and reposting/modification should be asked for. — [roysac.com Respect ASCII Artists](https://roysac.com/otherascii.html); [archive listing of asciiart.eu](https://echo.archivarix.net/pt/archive/asciiart-eu)
- cowsay: README says GPL 3; contributions since Dec 2024 dual GPL-1+/Artistic-1.0; older files' licensing "a little unclear"; .cow files live in `share/cowsay/cows` with no separate license. — [GitHub cowsay-org/cowsay](https://github.com/cowsay-org/cowsay)
- `awesome-ascii-art` (moul) is an Unlicense-licensed *list of links*, not a figure set. — [awesome.ecosyste.ms entry](https://awesome.ecosyste.ms/projects/1169594)
- figlet (text banners, not figures) is MIT on npm. — [licenses.dev figlet](https://licenses.dev/npm/figlet/1.8.2)
- An Apple II ASCII art repo exists with a LICENSE file (type not surfaced). — [git.applefritter.com ascii-art](https://git.applefritter.com/Apple-2-SW/ascii-art)
- cli-spinners (MIT) includes figure-like multi-cell animations: `bouncingBall`, `bouncingBar`, `runner` (emoji), `shark`, `dwarfFortress`, `fish`, `pong`. — [cli-spinners spinners.json](https://raw.githubusercontent.com/sindresorhus/cli-spinners/main/spinners.json)
- Searches for "ASCII animation construction workers" returned only commercial Lottie/Envato/Adobe vector packs (not ASCII, not free). — [LottieFiles example](https://lottiefiles.com/marketplace/construction-worker-animation-pack_394110)

### Inferences
- cli-spinners is the only MIT-licensed source of ready-made "little moving thing" frame sets; its `dwarfFortress` and `shark` entries show the multi-cell frame-array pattern you'd reuse for custom workers.
- Hand-drawing a 3-wide x 2-tall kaomoji-style worker (e.g. ʕ•ᴥ•ʔ variants, `o/`, `\o/`, `_o_` arm states for idle/work/cheer) sidesteps licensing entirely; all component glyphs are EAW=N or ASCII per the table in KQ3.

### Gaps
- asciimation.co.nz (Star Wars asciimation) license was not retrieved; it is a single narrative, not a worker set, anyway.
- No GitHub repo of PD stick-figure animations was located in this pass.

## Quick shopping list (summary table)

| Asset | URL | License | Format / size | Terminal conversion |
|---|---|---|---|---|
| Kenney Micro Roguelike | https://kenney.nl/assets/micro-roguelike | CC0 | PNG, 8x8 | 8x4 half-block or 4x2 braille |
| Kenney 1-Bit Pack | https://kenney.nl/assets/1-bit-pack | CC0 | PNG, 16x16 mono | 16x8 half-block / 8x4 braille, single fg |
| Kenney Tiny Dungeon / Tiny Town | https://kenney.nl/assets/tiny-dungeon | CC0 | PNG, 16x16 color | chafa `--symbols half --size 16x8` |
| OGA 8x8 Character Pack | https://opengameart.org/content/8x8-character-pack | CC0 | single PNG 3.7 KB, 8x8 | slice 8x8, 8x4 half-block |
| OGA Puny Characters | https://opengameart.org/content/puny-characters | CC0 | ZIP 236 KB, 16x16 on 32x32, 8-dir idle/walk | crop to 16x16, 16x8 half-block |
| itch DarkOnes | https://the-lazy-sorcerer-arts.itch.io/platformer-characther | CC0 | RAR 48 kB, 16x16 (use at 8x8), idle/run/push/use | 8x4 half-block |
| itch Doomsphere Charset | https://butterhands.itch.io/doomsphere-charset | CC0 | ZIP 289 kB, 32x32 1-bit, 4-frame idle x42 | downscale 2x → 16x16 → 8x4 braille |
| itch Tiny Creatures | https://clintbellanger.itch.io/tiny-creatures | CC0 | 180 sprites, Kenney Tiny style | as Tiny Dungeon |
| Departure Mono | https://github.com/rektdeckard/departure-mono | OFL (font) / MIT (site) | OTF via releases; Nerd Font cask | terminal font recommendation |
| Silkscreen | https://kottke.org/plus/type/silkscreen/ | OFL | TTF, 4x5 caps | rasterize labels to pixel rows |
| Pixel Operator | https://www.dafont.com/pixel-operator.font | CC0 (author changelog) | TTF family | terminal font / raster |
| m5x7 | https://managore.itch.io/m5x7 | CC0 | TTF 33 kB | raster labels |
| Tom Thumb 3x5 | https://opengameart.org/node/39490 | CC0 | bitmap | 3x5 px labels in sprite frames |
| cli-spinners | https://github.com/sindresorhus/cli-spinners | MIT | spinners.json | reels/meters frame sets |
| chafa / chafa.py | https://github.com/hpjansson/chafa | LGPL-3.0+ | CLI + C/Python API | per-cell char+fg+bg |
| img2braille | https://github.com/TheFel0x/img2braille | GPL-3.0 | Python CLI | braille text (offline step) |
| Kenney UI Audio | https://kenney.nl/assets/ui-audio | CC0 | 50 files (OGG; WAV via Godot repack) | click/switch |
| Kenney Interface Sounds | https://kenney.nl/assets/interface-sounds | CC0 | 100 OGG | confirm/minimize/maximize = join/leave |
| Kenney Digital Audio | https://kenney.nl/assets/digital-audio | CC0 | 60 files | beep/boop |
| OGA GUI Sound Effects (Lokif) | https://opengameart.org/content/gui-sound-effects | CC0 | WAV | success/error |
| freesound cassette CC0 | https://freesound.org/search/?q=cassette+button&f=license%3A%22Creative+Commons+0%22 | CC0 (verify per sound) | WAV/FLAC | tape start/stop |
