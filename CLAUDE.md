# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Two self-contained HTML files — no build tools, no dependencies, no server required. Open directly via `file://` in a browser.

| File | Description |
|------|-------------|
| `one-page-printing-studio.html` | **Active v2** — split layout: slim header + left settings panel + live preview panel |
| `one-page-printing-studio.min.html` | Minified distribution copy of v2 |
| `one-page-studio.html` | Original v1 — single scrolling column layout |
| `one-page-studio.min.html` | Minified distribution copy of v1 |

## Running / Testing

```bash
open one-page-printing-studio.html       # v2 (active)
open one-page-studio.html                # v1 (original)
open "one-page-printing-studio.html?text=HELLO"  # URL-param mode
```

Run regression tests (requires HTTP server for iframe access):
```bash
python3 -m http.server 8900
open http://localhost:8900/test-runner.html
open "http://localhost:8900/test-runner.html?target=one-page-printing-studio.html"
```

There are no unit tests, no linter, no build step.

## Architecture

Everything lives in a single HTML file: HTML structure, `<style>` block (CSS), and `<script>` block (JS).

### v2 Split Layout (`one-page-printing-studio.html`)

```
<body>                      flex column, 100vh, overflow:hidden
  <header #app-header>      full-width dark bar; flex-shrink:0
  <div #main-area>          flex row, flex:1, min-height:0
    <div #left-panel>       340px fixed, overflow-y:auto, settings
    <div #preview-panel>    flex:1, centres the scaled A4 page
      <div #page-scale-wrapper>
        <div #a4-page>      scaled via CSS zoom
  <div #measure-landscape>  position:absolute, opacity:0 — font measurement
  <div #measure-portrait>
```

**CSS zoom vs transform:** `#a4-page` is scaled with `zoom` (not `transform: scale()`). `zoom` shrinks the element's layout footprint; `transform` keeps the full layout size causing overflow/clipping. `fitPageToPanel()` sets `page.style.zoom = scale`.

**Print:** `beforeprint` restores real mm pixel dimensions (`page.dataset.paperW/H`); `afterprint` re-applies zoom via `fitPageToPanel()`. Measure containers are hidden in `@media print`.

### Key JS Functions

- `preprocessText(raw)` — splits on circled numbers `①②③...`, date patterns `/(?=\d+\.\d)/` and `/(?=\d+月\d+日)/`, and post-date CJK splits; returns `\n`-joined lines
- `calcFontSizeIn(text, containerId)` — binary search (1–500px); rejects any size where a logical line exceeds container width in nowrap mode (prevents internal wrapping that height-only check misses)
- `calcFontSizeForHtml(html, containerId)` — binary search for HTML content with `white-space:normal`; used by watermark size calculation
- `countRenderedLines(plain, containerId, fontSize)` — measures actual wrapped line count by `scrollHeight / (fontSize * 1.2)`; used by auto-orientation logic
- `renderText(raw, keepOrientation)` — preprocesses, calculates font size via `calcFontSizeIn`, picks orientation, renders; `keepOrientation` locks orientation (set by `_manualRotation` flag)
- `fitPageToPanel()` — scales `#a4-page` via CSS `zoom` to fit `#page-scale-wrapper`; called after render, paper/orientation change, and window resize
- `distributeLineSpacing()` — debounced (150ms); adjusts `#print-text` `line-height` to evenly fill page height when content is smaller than page
- `applyPaperSize(w, h, name)` — resizes page div, stores dimensions in `page.dataset.paperW/H`, updates measure containers, triggers font recalculation
- `setOrientation(orientation)` — switches between landscape/portrait, updates page size and `@page` rule
- `setFontSize(size)` — sets font size, triggers debounced `distributeLineSpacing`
- `setLang(lang)` — walks DOM swapping `data-i18n` strings; re-renders Quick Start when input is empty; all additions must guard with `typeof currentPaper !== 'undefined'` (called early, before vars are declared)
- `updateWatermark()` — renders watermark SVG using current style/outline/font/size/spacing/colour settings
- `syncBgStatus()` — updates background status chip based on actual page background state
- `buildWmFontSelect()` — populates watermark typeface dropdown; guarded against being called before `FONTS` is defined
- `htmlToPlain(html)` — converts editor HTML to plain text with `\n` line separators; handles `<br>`, `<div>`, `<p>` tags; exposed as `window.htmlToPlain` for test access
- `normaliseEditorHtml(html)` — converts `<div>`/`<p>` block structure to `<br>` tags before rendering; collapses double `<br>` to single
- `updateStatusBar()` — updates all 5 status chips (orientation, BG, font, size, paper) after render
- `makeToggle(btnId, panelId)` — wires a button to toggle a panel's visibility with active-state sync; also wires matching status chip click if a `statusId` is found
- `savedSelection()` / `restoreSelection(range)` — save and restore contenteditable cursor position around toolbar `execCommand` calls (prevents focus loss)

### Two Render Modes

| Mode | Trigger | Behaviour |
|------|---------|-----------|
| URL param | `?text=…` | Auto-renders on load; shows floating Print button only |
| Input UI | No param | Shows text input field + action buttons; live preview on every keystroke |

### Key State Flags

- `_manualRotation` — set `true` when user clicks Rotate; cleared when text changes; prevents auto-orientation re-selection on input
- `_inputReady` — set `true` after 300ms on load; prevents spurious input events from clearing Quick Start
- `_lastInputRaw` — tracks last input HTML; skips re-render when content hasn't changed
- `_wrapEnabled` — controls Auto-wrap Lines; when `false`, `preprocessText` is skipped and measure containers use `nowrap`

### Layout Invariants

- Measure containers use `opacity:0` (not `visibility:hidden`) so `clientWidth`/`clientHeight` return real dimensions
- Measure containers always stay at real mm dimensions — font size calculation accuracy depends on this
- Watermark layer `z-index: 0`; text layer `z-index: 1`
- Page background hardcoded `#ffffff` — never affected by theme
- `#print-text` `line-height` is managed dynamically by `distributeLineSpacing`

### Auto-Orientation Logic

Compares rendered line counts in landscape vs portrait at their respective best font sizes. Prefers landscape if portrait adds extra line wrapping. Threshold: portrait chosen only if it doesn't wrap more lines AND its font size is ≥ 85% of landscape's.

### Print Button Behaviour

- If text input has content and no preview yet: renders then prints (auto-selects orientation)
- If text input has content and preview already exists: re-renders preserving orientation if `_manualRotation` is true
- If text input is empty but preview has content (e.g. Quick Start): prints as-is
- `window.print()` deferred 50ms after render to allow `@page` rule to apply

### Rich Text Editor

The notification text input is a `contenteditable` div. Toolbar provides Bold/Italic/Underline and text/highlight colour pickers via `document.execCommand`. Paste handler strips HTML formatting to plain text. The `normaliseEditorHtml` function converts `<div>/<p>` block structure to `<br>` tags before rendering.

### Background Panel

- **Colour / Image** tabs — mutually exclusive, control `#a4-page` background
- **Watermark** — independent toggle below tabs, always accessible regardless of which tab is active; can be combined with any background
- **Reset** button — clears all backgrounds and watermark at once
- `syncBgStatus()` — chip shows combined state e.g. "Colour + Watermark"

### Watermark

Rendered as inline SVG inside `#watermark` (position:absolute, inset:0, z-index:0). Six styles:

| Style | Description |
|-------|-------------|
| Staggered (default) | Diagonal grid, alternate rows offset by half tile |
| Tiled | Straight diagonal grid |
| Horizontal | Left-to-right rows, no rotation |
| Stamp | Single large text centred on page, diagonal |
| Wave | Rows following sine wave path, text rotated to tangent |
| Spiral | Archimedean spiral from centre, text rotated to tangent |

- **Outline checkbox** — applies to all styles; switches fill→stroke
- Text limit 25 chars; Wave/Spiral hint when `cjkCount * 2 + alphanumCount > 10`

### Quick Start Content

Stored as HTML strings in `LANGS[lang].quick_start`. Uses `①②` characters as line separators — `preprocessText` splits on these. Each language's step-1 text is sized to fit within A4 landscape width at the target font size — do not lengthen without measuring.

### i18n

5 languages: EN, 简中 (zh_CN), 繁中 (zh_TW), 日本語 (ja), 한국어 (ko). Auto-detected from `navigator.language`. All strings via `data-i18n` / `data-i18n-title` / `data-i18n-placeholder` attributes.

### Themes

CSS custom properties on `<html data-theme="...">`. Six themes: Studio (default), Night, Forest, Sakura, LV Monogram, LV Damier.

### Version

The About dialog shows a version timestamp (`YYYY-MM-DD HH:MM`) in a `<span class="about-value">` immediately after the `about_version_label` span. A PostToolUse hook in `.claude/settings.local.json` auto-updates this timestamp whenever `one-page-studio.html` is edited. **For `one-page-printing-studio.html`, update the timestamp manually.**

### Minified Version

`one-page-studio.min.html` is a distribution copy of v1. It is **not** auto-generated — update it manually when releasing.

### archive/ Directory

Versioned backups are created by the `backup-html` skill (invokable via `/backup-html`). Files are named `one-page-studio.YYYY-MM-DD-HH-MM.html`. Do not edit archive files.

## Known Pitfalls

- **`setLang()` early-call crash**: `setLang` is called during language auto-detection before `currentPaper`, `renderText`, and `htmlToPlain` are declared. Any code added to `setLang` that uses these must guard with `typeof currentPaper !== 'undefined'` etc.
- **`calcFontSizeIn` measures plain text**: quick_start content is rich HTML with `<span>` padding — HTML elements add extra width not captured by plain-text measurement. Keep quick_start step-1 lines short enough to fit at the target font size.
- **Scroll restoration drift**: `focus()` on load causes the browser to save a non-zero scroll offset; on refresh it restores that offset, then focus scrolls more — accumulating upward drift. Fixed with `history.scrollRestoration = 'manual'` and `window.scrollTo(0,0)` at script start, plus `{ preventScroll: true }` on the load-time `focus()` call.
- **Playwright won't catch scroll drift**: headless Chrome doesn't persist scroll state across navigations the way a real browser session does.
- **CSS zoom vs transform**: only `zoom` shrinks the element's layout footprint. `transform: scale()` keeps the full layout size, causing overflow/clipping in the preview panel.

## Verification Checklist

After any change to `one-page-printing-studio.html`, manually verify:
1. `open one-page-printing-studio.html` — Quick Start renders, text field focused, live preview works, no scroll drift on repeated refresh
2. `open "one-page-printing-studio.html?text=URGENT"` — auto-renders, no input UI
3. CJK split: `通知7月25日()7月26日()休息` → 4 lines; `某某某 医生1.2（周三）1.3（周四）门诊停诊` → 4 lines
4. Auto-wrap Lines OFF → content renders as single unwrapped line, font recalculates
5. Rotate → orientation switches, font recalculates; subsequent typing preserves orientation
6. Background: Colour + Watermark simultaneously; Reset clears both; watermark controls fit within left panel
7. Switch language → all UI strings update, Quick Start re-renders in new language
8. Switch theme → full UI recolours, page stays white
9. Print → correct paper size and orientation, watermark prints, no UI controls visible, single page
10. Resize browser window → A4 page rescales to fit preview panel
11. Run test suite at `http://localhost:8900/test-runner.html?target=one-page-printing-studio.html` — all tests pass
