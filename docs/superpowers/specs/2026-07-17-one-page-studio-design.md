# Print Notification — Design Spec

**Date:** 2026-07-16 (last updated 2026-07-17)

## Problem

Need a quick way to print large text on paper — e.g. a notification, label, or sign — where the text fills the page as large as possible without overflowing or spilling to a second page.

## Goal

A single-file HTML page that:
1. Accepts text via URL query parameter or an on-screen input field
2. Auto-splits text on date patterns into logical lines
3. Auto-calculates the maximum font size that fits all text on one page (with word wrap)
4. Auto-selects landscape or portrait orientation
5. Supports multiple paper sizes (A3, A4, A5, B4, B5, Letter)
6. Supports background customisation and watermark
7. Supports i18n (EN, 简中, 繁中) with auto-detection
8. Supports 6 UI themes
9. Opens the browser print dialog ready to print

---

## Architecture

Single file: `one-page-studio.html` — no external dependencies, no build tools, works via `file://` protocol.

### Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| URL param | `?text=Hello%20World` | Renders immediately, shows floating Print button — spaces preserved via `URLSearchParams.get()` |
| Input UI | No param present | Shows text input field + action buttons; focused on load |

### Layout

- Page dimensions controlled by selected paper size and orientation
- Page container has `position: relative`; watermark layer at `z-index: 0`, print text at `z-index: 1`
- Text is centered horizontally and vertically; `text-align: center`
- Font: bold, CJK-compatible — `PingFang SC`, `Microsoft YaHei`, `Noto Sans SC`, `sans-serif` fallback
- `word-break: break-word` + `overflow-wrap: break-word` + `white-space: pre-wrap`
- `lang` attribute updated dynamically per selected language

### Text Pre-processing

Before rendering, input text is split into logical lines:

- Split before `数字.数字` (e.g. `1.2`, `12.31`) — regex: `/(?=\d+\.\d)/`
- Split before `数字月数字日` (e.g. `7月25日`) — regex: `/(?=\d+月\d+日)/`
- Example: `某某某 医生1.2（周三）1.3（周四）门诊停诊` → 4 lines

### Paper Sizes

| Size | Dimensions (landscape W×H) |
|------|--------------------------|
| A3 | 420mm × 297mm |
| A4 | 297mm × 210mm (default) |
| A5 | 210mm × 148mm |
| B4 | 353mm × 250mm |
| B5 | 250mm × 176mm |
| Letter | 279mm × 216mm |

Paper size selector shown after first Preview. Changing size recalculates font size and updates `@page` rule.

### Orientation Auto-Selection

- Calculates best font size for both landscape and portrait
- Chooses landscape unless portrait gives >20% larger font size
- `@page` rule injected dynamically via JS
- Manual override via **⇄ Rotate** button
- Print button preserves user's manual orientation (does not re-auto-select if preview already exists)
- `window.print()` deferred 50ms after render so `@page` rule is applied before dialog opens

### Font Size Auto-Calculation

Binary search algorithm (1px–500px) using two hidden measure containers sized to current paper minus 20mm padding. Checks `scrollHeight <= clientHeight && scrollWidth <= clientWidth`. Returns largest fitting size.

### Font Picker

8 fonts: PingFang SC, Heiti SC, Microsoft YaHei, SimSun, SimHei, KaiTi, Arial, Times New Roman. Hidden until first Preview. Switching font recalculates size.

### Font Size Fine-Tuning

`−` / `+` buttons adjust by 1px. **Fit** recalculates auto size. Shown after first Preview.

### Background Options

Four mutually exclusive modes:

| Tab | Behaviour |
|-----|-----------|
| None | White background |
| Colour | Solid colour via colour picker |
| Image | Upload image; Fill modes: Cover, Contain, Stretch, Tile |
| Watermark | Tiled diagonal SVG text; controls: text, colour, opacity, spacing |

### i18n

- Supported: EN, 简中 (zh_CN), 繁中 (zh_TW)
- Auto-detected from `navigator.language` on load
- Manual override via language switcher in header
- All UI strings, tooltips, placeholders, page title translated
- Orientation words translated via `orientation_landscape` / `orientation_portrait` keys per language
- `setLang()` refreshes the preview label (paper + orientation chip) on language switch

### Themes

6 named themes via CSS custom properties (`data-theme` on `<html>`):

| Theme | Body | Accent |
|-------|------|--------|
| Studio | Warm linen | Vermillion |
| Night | Dark charcoal | Cyan |
| Forest | Deep green | Moss |
| Sakura | Blush pink | Rose |
| LV Monogram | Dark chocolate | Gold |
| LV Damier | Caramel tan | Saddle brown |

### Help System

Three modes accessible from header:
- **? Reference** — modal with 12 feature sections
- **⊙ Tour** — spotlight guided tour with popovers; steps follow button order in UI; hidden targets (pre-Preview) show centered popover
- **≡ Guide** — slide-in side panel with accordion sections

### Print

- All UI hidden via `.no-print` + `@media print`
- `@page` rule set to correct size and orientation before printing
- Page background always white (hardcoded `#ffffff`)
- Print button scrolls preview into view before opening dialog

### Version

- About dialog shows `YYYY-MM-DD HH:MM` version timestamp
- Auto-updated by PostToolUse hook on every file edit

---

## Files

| File | Purpose |
|------|---------|
| `one-page-studio.html` | Entire app — HTML, CSS, JS in one file |
| `.claude/settings.local.json` | PostToolUse hook for auto-version-update |
| `.claude/skills/backup-html/SKILL.md` | Project skill for versioned backup to `archive/` |

---

## Verification

1. Open `one-page-studio.html` directly — text input field is focused automatically
2. Type `HELLO` → Preview → large text centered, landscape orientation
3. Type `某某某 医生1.2（周三）1.3（周四）门诊停诊` → 4 lines, maximally sized
4. Type a long English sentence → word wrap respects word boundaries
5. Open `?text=URGENT` → auto-renders, no input UI
6. Click Rotate → orientation switches, font size recalculates
7. Click Print after Rotate → orientation preserved, not reset to auto
8. Switch paper size → page resizes, font recalculates
9. Switch fonts → font updates, size recalculates
10. Use −/+ → font size adjusts; Fit → restores auto size
11. Background → Colour/Image/Watermark → all work correctly
12. Switch language → all UI strings update, preview label orientation word translates
13. Switch theme → full UI recolours, page stays white
14. Help → ?, Tour, Guide all open and function correctly
15. Print preview shows correct paper size, orientation, no UI controls visible
