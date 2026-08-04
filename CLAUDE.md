# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single self-contained HTML file (`one-page-studio.html`) — no build tools, no dependencies, no server required. Open directly via `file://` in a browser.

## Running / Testing

Open the file in a browser:
```
open one-page-studio.html
```

Or test URL-param mode:
```
open "one-page-studio.html?text=HELLO"
```

Run regression tests (requires HTTP server for iframe access):
```
python3 -m http.server 8900
open http://localhost:8900/test-runner.html
# Test specific version: http://localhost:8900/test-runner.html?target=one-page-studio.min.html
```

There are no unit tests, no linter, no build step.

## Architecture

Everything lives in `one-page-studio.html`: HTML structure, `<style>` block (CSS), and `<script>` block (JS).

### Key JS Functions

- `preprocessText(raw)` — splits on circled numbers `①②③...`, date patterns `/(?=\d+\.\d)/` and `/(?=\d+月\d+日)/`, and post-date CJK splits; returns `\n`-joined lines
- `calcFontSizeIn(text, containerId)` — binary search (1–500px) using plain text; respects current `white-space` on measure containers (nowrap when Auto-wrap Lines is OFF)
- `calcFontSizeForHtml(html, containerId)` — binary search for HTML content with `white-space:normal`; used by watermark size calculation
- `renderText(raw, keepOrientation)` — preprocesses, calculates font size via `calcFontSizeIn`, picks orientation, renders; `keepOrientation` locks orientation (set by `_manualRotation` flag)
- `distributeLineSpacing()` — debounced (150ms); adjusts `#print-text` `line-height` to evenly fill page height when content is smaller than page
- `applyPaperSize(w, h, name)` — resizes page div, updates measure containers, triggers font recalculation
- `setOrientation(orientation)` — switches between landscape/portrait, updates page size and `@page` rule
- `setFontSize(size)` — sets font size, triggers debounced `distributeLineSpacing`
- `setLang(lang)` — walks DOM swapping `data-i18n` strings, calls `updatePreviewLabel()` and `buildWmFontSelect()`
- `updateWatermark()` — renders watermark SVG using current style/outline/font/size/spacing/colour settings
- `syncBgStatus()` — updates background status chip based on actual page background state
- `buildWmFontSelect()` — populates watermark typeface dropdown; guarded against being called before `FONTS` is defined

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

- Page `<div>` is always sized to the selected paper dimensions in `px` (at 96 dpi)
- Measure containers use `opacity:0` (not `visibility:hidden`) so `clientWidth`/`clientHeight` return real dimensions
- Watermark layer `z-index: 0`; text layer `z-index: 1`
- Page background hardcoded `#ffffff` — never affected by theme
- `#print-text` `line-height` is managed dynamically by `distributeLineSpacing`

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

Stored as pipe-free plain strings in `LANGS[lang].quick_start`. Uses `①②` characters as line separators — `preprocessText` splits on these. Joined with `<br>` at render time via the normal pipeline, not hardcoded.

### i18n

5 languages: EN, 简中 (zh_CN), 繁中 (zh_TW), 日本語 (ja), 한국어 (ko). Auto-detected from `navigator.language`. All strings via `data-i18n` / `data-i18n-title` / `data-i18n-placeholder` attributes.

### Themes

CSS custom properties on `<html data-theme="...">`. Six themes: Studio (default), Night, Forest, Sakura, LV Monogram, LV Damier.

### Version

The About dialog shows a version timestamp (`YYYY-MM-DD HH:MM`) in a `<span class="about-value">` immediately after the `about_version_label` span. A PostToolUse hook in `.claude/settings.local.json` auto-updates this timestamp whenever the HTML file is edited.

## Verification Checklist

After any change, manually verify:
1. `open one-page-studio.html` — Quick Start renders, text field focused, live preview works
2. `open "one-page-studio.html?text=URGENT"` — auto-renders, no input UI
3. CJK split: `通知7月25日()7月26日()休息` → 4 lines; `某某某 医生1.2（周三）1.3（周四）门诊停诊` → 4 lines
4. Auto-wrap Lines OFF → content renders as single unwrapped line, font recalculates
5. Rotate → orientation switches, font recalculates; subsequent typing preserves orientation
6. Background: Colour + Watermark simultaneously; Reset clears both
7. Switch language → all UI strings update
8. Switch theme → full UI recolours, page stays white
9. Print → correct paper size and orientation, watermark prints, no UI controls visible
10. Run test suite at `http://localhost:8900/test-runner.html` — all tests pass
