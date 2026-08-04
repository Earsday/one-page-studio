---
name: backup-html
description: Backs up one-page-studio.html with the app version as suffix (e.g. one-page-studio.2026-07-17-14-36.html). Use whenever the user says "backup", "save a version", "snapshot the file", "archive", or asks to preserve the current state of the HTML before making changes.
---

# Backup HTML with Version Suffix

Backup `one-page-studio.html` by copying it to a versioned filename in the same directory.

## Steps

1. **Ensure `archive/` exists** — check for an `archive/` folder in the project directory; create it if missing:
   ```bash
   mkdir -p archive
   ```

2. **Read the version** from the About section in `one-page-studio.html` — it's the text content of the `<span class="about-value">` immediately after the `about_version_label` span (line ~1079). Extract it with grep:
   ```bash
   grep -A1 'about_version_label' one-page-studio.html | grep 'about-value' | sed 's/.*>\(.*\)<.*/\1/'
   ```
   Sanitize the value for use in a filename by replacing spaces and colons with hyphens (e.g. `2026-07-17 14:36` → `2026-07-17-14-36`).

3. **Copy the file**:
   ```bash
   cp one-page-studio.html archive/one-page-studio.<version>.html
   ```

4. **Confirm** — tell the user the backup path created (e.g. `archive/one-page-studio.2026-07-17-14-36.html`).

That's it. No other files are touched.
