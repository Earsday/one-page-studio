# One-Page Studio

<p align="right">EN | <a href="README.zh-CN.md">简中</a> | <a href="README.zh-TW.md">繁中</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a></p>

A single-file HTML tool for printing large-text notifications on paper. No installation, no server — just open and print.

![One-Page Studio](https://img.shields.io/badge/version-2026--07--20-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Live preview** — text renders instantly as you type, auto-sized to fill the page
- **Rich text formatting** — Bold, Italic, Underline, text colour, highlight colour
- **Auto line splitting** — date patterns like `1.2` or `7月25日` split automatically onto separate lines
- **Auto-wrap Lines toggle** — switch between multi-line and single-line rendering
- **Smart orientation** — automatically selects landscape or portrait based on content shape
- **Multiple paper sizes** — A3, A4, A5, B4, B5, Letter
- **Background options** — solid colour, image upload (Cover/Contain/Stretch/Tile), independent watermark overlay with 6 styles
- **Watermark** — Staggered, Tiled, Horizontal, Stamp, Wave, Spiral; with outline mode, custom typeface and size
- **6 themes** — Studio, Night, Forest, Sakura, LV Monogram, LV Damier
- **5 languages** — English, 简体中文, 繁體中文, 日本語, 한국어 (auto-detected)
- **Print-ready** — colours and highlights preserved in print output

## Usage

1. Download `one-page-studio.html`
2. Open it in your browser (double-click or `open one-page-studio.html`)
3. Type your notification text
4. Click **Print**

No build tools, no dependencies, no server required. Works entirely from `file://`.

### URL Parameter Mode

Pass text via URL to auto-render on load:

```
one-page-studio.html?text=URGENT+NOTICE
```

## Quick Start

| Step | Action |
|------|--------|
| 1 | Type your text in the input box |
| 2 | See the live preview below |
| 3 | Click **Print** |

### Tips

- Use `①②③` to manually force line breaks
- Date patterns like `7月25日` or `1.25（周六）` split automatically
- Click **⇄ Orientation** to toggle landscape/portrait
- Toggle **Auto-wrap Lines** off to display text as a single unwrapped line
- The status bar shows current orientation, background, typeface, font size, and paper

## File Structure

```
one-page-studio/
├── one-page-studio.html      # Main app (source)
├── one-page-studio.min.html  # Minified version for distribution
├── test-runner.html             # Regression test suite
├── archive/                     # Versioned backups
└── docs/                        # Design specs and implementation notes
```

## Testing

Requires a local HTTP server (for iframe access):

```bash
python3 -m http.server 8900
open http://localhost:8900/test-runner.html
```

Test a specific version:
```
http://localhost:8900/test-runner.html?target=one-page-studio.min.html
```

## Browser Compatibility

Works in modern browsers (Chrome, Safari, Firefox, Edge). Chrome recommended for best print colour fidelity.

## License

MIT — free to use, modify, and distribute.

## Contact

earsday@163.com
