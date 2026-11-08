# UI Redesign — Split Layout Design

## Goal

Redesign the One-Page Studio UI from a single vertical-scroll column into a no-scroll split layout: settings panel on the left, live preview on the right, always both visible simultaneously.

## Selected Direction: B2

- **Slim dark header** (full width) — app title, language switcher, theme switcher, help/about/tour buttons
- **Left panel** — all editing controls: label, rich toolbar (B/I/U/colour), text input, action buttons (rotate, wrap, paper, BG, font, size), print button, status chips
- **Right panel** — live preview fills remaining space; the A4 page scales to fit the available area

---

## Layout Architecture

### Overall structure

```
┌─────────────────────────────────────────────┐
│  #app-header  (full width, fixed height)    │
├───────────────────┬─────────────────────────┤
│  #left-panel      │  #preview-panel         │
│  (fixed width,    │  (flex:1, centers       │
│   scrollable)     │   #a4-page inside)      │
└───────────────────┴─────────────────────────┘
```

- `body` changes from `flex-direction: column` to a two-row layout: header row + main row
- `#main-area` is a new `display:flex; flex-direction:row` container filling the remaining viewport height
- `#left-panel` — fixed width (~340px), `overflow-y: auto`, contains all current `#input-ui` contents
- `#preview-panel` — `flex:1`, centers `#a4-page` both axes, dotted linen background

### A4 page scaling

The page currently has fixed mm dimensions. In the new layout it must scale to fit `#preview-panel`. Two approaches are possible:

- **CSS `transform: scale()`** — keeps real mm dimensions, scales visually. Simpler but requires computing scale factor on resize.
- **Dynamic px sizing proportional to panel** — resize the page div to fill the panel at the correct aspect ratio. Consistent with how the page already works at different paper sizes.

**Decision: use dynamic px sizing** (proportional to panel). The `applyPaperSize` function already handles this; we extend it to also consider the available panel height/width and pick the largest fitting size.

### Responsive fallback

On viewports narrower than 900px: stack vertically (left panel on top, preview below) — same as current behaviour. A CSS media query handles this; no JS needed.

---

## Changes to Existing Code

### HTML structure

1. Wrap `#input-ui` + the preview section in a new `#main-area` flex row div
2. Rename / re-id the left container to `#left-panel`
3. Add `#preview-panel` div that contains `#section-divider`, `#preview-status`, `#a4-page`, and measure containers
4. Remove `#section-divider` label (no longer needed as a divider — preview is always visible)

### CSS

- `body`: remove `align-items: center`, `padding`, `gap`; change to a column flex with full viewport height
- Add `#main-area`: `display:flex; flex-direction:row; flex:1; overflow:hidden`
- `#left-panel`: `width:340px; flex-shrink:0; overflow-y:auto; padding:20px; background:var(--paper)`
- `#preview-panel`: `flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--linen); overflow:hidden`
- `#a4-page`: replace fixed mm width/height with JS-computed px values (see below)
- `@media (max-width: 900px)`: `#main-area { flex-direction: column }`, restore body padding

### JS — preview panel sizing

New function `fitPageToPanel()`:
- Reads `#preview-panel` `clientWidth` / `clientHeight` (minus padding)
- Computes max scale that fits the current paper aspect ratio within the panel
- Calls `applyPaperSize` with the resulting px dimensions
- Called on: window resize (debounced 100ms), orientation change, paper size change

The measure containers (`#measure-landscape`, `#measure-portrait`) remain at fixed mm dimensions (they must stay accurate for font size calculation).

### Print

`@page` rule and `@media print` already hide `.no-print` elements. No change needed — the left panel gets `class="no-print"` added, so it disappears in print output leaving only `#a4-page`.

---

## What Does NOT Change

- All JS logic: `preprocessText`, `calcFontSizeIn`, `renderText`, `updateWatermark`, `distributeLineSpacing`, etc.
- All feature panels: background, watermark, font list, paper size, font size controls — they stay inside `#left-panel`
- i18n, themes, modal dialogs (About, Help, Tour, Side Panel) — unchanged
- URL param mode (`?text=…`) — still works; the floating print button is shown, layout is the same
- Test suite — existing tests remain valid; new tests cover `fitPageToPanel`

---

## Out of Scope

- Mobile/touch optimisation beyond the responsive fallback
- Drag-to-resize panel divider
- Persistent panel width preference
