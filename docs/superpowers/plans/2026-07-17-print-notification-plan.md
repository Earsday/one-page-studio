# Print Notification — Implementation Plan

**Last updated:** 2026-07-20

> This plan reflects the current implemented state of `print-notification.html`.

**Goal:** Single HTML file that accepts text, auto-splits on date/number patterns, auto-calculates maximum font size, auto-selects orientation, supports multiple paper sizes, rich text formatting, and prints with optional background/watermark.

**Architecture:** Self-contained `print-notification.html` — HTML + CSS + JS, no external dependencies, works via `file://`. Two hidden measure containers (`opacity:0`) drive binary-search font sizing. `@page` rule injected dynamically.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+)

---

## Key JS Functions

- `preprocessText(raw)` — splits on circled numbers `①②③...`, date patterns `/(?=\d+\.\d)/` and `/(?=\d+月\d+日)/`, and post-date CJK lookahead splits
- `htmlToPlain(html)` — converts HTML to plain text; adds `\n` before `<div>` opening tags (not just `</div>`) to correctly handle Chrome contenteditable structure
- `normaliseEditorHtml(html)` — converts `<div>/<p>/<br>` structure to `<br>` tags, collapses multiple consecutive `<br>` to single
- `calcFontSizeIn(text, containerId)` — binary search 1–500px using plain text; respects current `white-space` on measure containers
- `calcFontSizeForHtml(html, containerId)` — binary search for HTML content with `white-space:normal`; used by Stamp watermark size
- `renderText(raw, keepOrientation)` — preprocesses, calculates font sizes for both orientations, picks best orientation, renders; `keepOrientation` locks orientation when set
- `distributeLineSpacing()` — debounced 150ms; adjusts `#print-text` `line-height` to fill page when content uses < 95% of page height; caps at 3.0, minimum 1.2; includes safety revert if overflow detected
- `applyPaperSize(w, h, name)` — resizes page div, updates measure containers, triggers font recalculation
- `setOrientation(orientation)` — switches landscape/portrait, updates page size and `@page` rule
- `setFontSize(size)` — sets font size, triggers debounced `distributeLineSpacing`
- `applyWrap(rerender)` — syncs `white-space` on `#print-text` and measure containers; when `rerender=true`: clears `_distributeTimer`, resets `line-height`, rebuilds `displayHtml` respecting wrap state, recalculates font and orientation
- `setLang(lang)` — walks DOM swapping `data-i18n` strings, calls `updatePreviewLabel()`, `buildWmFontSelect()`, `syncBgStatus()`
- `syncBgStatus()` — inspects actual page background state (`backgroundColor`, `backgroundImage`, watermark `innerHTML`) to update status chip; handles combined "Colour + Watermark" display
- `updateWatermark()` — renders watermark SVG using current style/outline/font/size/spacing settings
- `buildWmFontSelect()` — populates watermark typeface dropdown; guarded against being called before `FONTS` is defined

## Key State Flags

- `_manualRotation` — set `true` on Rotate click; cleared when text content changes; makes `renderText` use `keepOrientation` to preserve user's choice
- `_inputReady` — set `true` after 300ms on load; prevents spurious input events from clearing Quick Start
- `_lastInputRaw` — tracks last input innerHTML; skips re-render when content hasn't changed
- `_wrapEnabled` — controls Auto-wrap Lines toggle; when `false`, `preprocessText` skipped, measure containers use `nowrap`, block tags stripped from `displayHtml`
- `_distributeTimer` — debounce timer ID for `distributeLineSpacing`; cancelled at start of every `renderText` call and at start of input listener

---

## Implemented Features

### Core
- Live preview — text renders on every keystroke, no manual Preview button
- `preprocessText` — splits on circled numbers, date patterns, post-date CJK boundaries
- `calcFontSizeIn` — binary search respecting `white-space` (pre-wrap or nowrap)
- `renderText(raw, keepOrientation)` — full pipeline: preprocess → size → orient → render
- Orientation auto-selection: for multi-line content, portrait threshold = `sizeLandscape * 0.9`; for single line, portrait must strictly exceed landscape; equal sizes default to landscape
- `distributeLineSpacing` — distributes free vertical space as `line-height` on `#print-text`; only runs when content < 95% of page height
- `window.print()` deferred 50ms after render
- Print preserves `_manualRotation` — user's rotation not reset on re-type

### Rich Text Editor
- `contenteditable` div replaces plain textarea
- Toolbar: **B** / **I** / **U** | text colour picker | highlight colour picker | Clear
- `document.execCommand` for formatting; selection saved/restored around toolbar clicks
- Paste handler strips HTML to plain text
- `htmlToPlain` correctly handles Chrome's `<div>`-based newlines

### Font Size Controls
- Hold-to-repeat: fires once on `mousedown`, delays 400ms, then repeats at 80ms
- `mouseup`/`mouseleave` cancel both timers

### Auto-wrap Lines
- Toggle button (always visible, first in action row)
- ON: `preprocessText` runs, `white-space: normal`, measure containers use `pre-wrap`
- OFF: block tags stripped, content shown as single line, measure containers use `nowrap`
- `applyWrap(true)` rebuilds content and recalculates font/orientation without going through full `renderText`

### Paper Sizes
- A3 (420×297mm), A4 (297×210mm, default), A5 (210×148mm), B4 (353×250mm), B5 (250×176mm), Letter (279×216mm)

### Status Bar (5 chips)
- `#status-orientation` — current orientation (translated); clicking triggers Rotate
- `#status-bg` — background state via `syncBgStatus()` (e.g. "Colour + Watermark")
- `#status-font` — active font name
- `#status-size` — font size in px
- `#status-paper` — paper name

### Background Panel
- **2 tabs**: Colour | Image — mutually exclusive
- **Watermark toggle** (`#bg-watermark-toggle`) — independent, below tabs; can combine with any background
- **Reset button** (`#bg-reset-all`) — clears all backgrounds and watermark at once
- `syncBgStatus()` — shows combined state e.g. "Colour + Watermark" or "Watermark"

### Watermark
Rendered as inline SVG (`#watermark`, z-index:0). Six styles with group + Outline checkbox:
- Staggered (default), Tiled, Horizontal, Stamp, Wave, Spiral

### i18n
- 5 languages: EN, 简中 (zh_CN), 繁中 (zh_TW), 日本語 (ja), 한국어 (ko)
- Auto-detected from `navigator.language`
- Quick start stored as pipe-free strings; `preprocessText` splits on `①②` characters

### Themes
- Studio (default), Night, Forest, Sakura, LV Monogram, LV Damier

### Help System
- **? Reference** — modal with 15 sections (includes Preview and "More to explore")
- **⊙ Tour** — 14-step guided tour with group labels:
  - "Core" (3 steps): Enter text, Preview, Print
  - "Configuration" (7 steps): Text formatting, Auto-wrap, Orientation, Background, Typeface, Font size, Paper
  - "App & Info" (4 steps): Language, Theme, Help, About
- **≡ Guide** — side panel with collapsible accordion sections
- All three fully translated in all 5 languages

### Print
- All UI hidden via `.no-print` + `@media print`
- `@page` rule set correctly before printing
- `print-color-adjust: exact` forces colour/highlight fidelity
- Print button scrolls preview into view

### Version
- About dialog shows `YYYY-MM-DD HH:MM` timestamp
- Auto-updated by PostToolUse hook in `.claude/settings.local.json`

---

## File Structure

| File | Purpose |
|------|---------|
| `print-notification.html` | Entire app |
| `print-notification.min.html` | Minified distribution version |
| `test-runner.html` | Regression test suite (requires HTTP server) |
| `.claude/settings.local.json` | PostToolUse hook (auto-version-update) |
| `.claude/skills/backup-html/SKILL.md` | `/backup-html` skill — archives to `archive/` |
| `archive/` | Versioned HTML backups |
| `docs/superpowers/specs/2026-07-17-print-notification-design.md` | Design spec |
| `docs/superpowers/plans/2026-07-17-print-notification-plan.md` | This file |
