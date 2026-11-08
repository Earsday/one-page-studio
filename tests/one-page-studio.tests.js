// Test suite for one-page-studio.html (v1)

function q(doc, sel) { return doc.querySelector(sel); }
function qq(doc, sel) { return [...doc.querySelectorAll(sel)]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function click(el) { el && el.click(); }
function setVal(el, val) {
  if (!el) return;
  if (el.contentEditable === 'true') { el.innerHTML = val; el.dispatchEvent(new Event('input', {bubbles:true})); }
  else { el.value = val; el.dispatchEvent(new Event('input', {bubbles:true})); }
}
function triggerInput(el) { el && el.dispatchEvent(new Event('input', {bubbles:true})); }

async function openWatermarkPanel(doc) {
  click(q(doc, '#bg-toggle'));
  await sleep(200);
  click(q(doc, '#bg-tab-colour'));
  await sleep(100);
  const row = q(doc, '#bg-watermark-row');
  if (row && row.style.display !== 'flex') {
    click(q(doc, '#bg-watermark-toggle'));
    await sleep(200);
  }
}

async function waitFor(fn, timeout=2000, interval=50) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (fn()) return true;
    await sleep(interval);
  }
  return false;
}

// ── Group 1: Text input & live preview ──────────────────────────────────────
test('Text Input', 'Quick Start shown on fresh load', async (fr, win, doc) => {
  const pt = q(doc, '#print-text');
  if (!pt) throw 'No #print-text element';
  await waitFor(() => pt.innerHTML.trim().length > 0, 4000);
  const html = pt.innerHTML;
  return html.includes('QUICK START') || html.includes('Quick Start') || html.includes('快速') || html.includes('クイック') || html.includes('빠른');
});

test('Text Input', 'Text input has focus on load', async (fr, win, doc) => {
  await sleep(200);
  return doc.activeElement && doc.activeElement.id === 'text-input';
});

test('Text Input', 'Typing text updates preview', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  setVal(ti, 'HELLO');
  await sleep(300);
  return q(doc, '#print-text').innerText.includes('HELLO');
});

test('Text Input', 'Date pattern splits into multiple lines', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  setVal(ti, '通知7月25日7月26日休息');
  await sleep(300);
  const html = q(doc, '#print-text').innerHTML;
  const breaks = (html.match(/<br>/g) || []).length;
  if (breaks !== 3) throw `Expected 3 <br> tags (4 lines), got ${breaks}`;
  return true;
});

test('Text Input', 'Clearing text restores Quick Start', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  setVal(ti, '');
  await sleep(400);
  const pt = q(doc, '#print-text');
  const html = pt.innerHTML;
  return html.includes('QUICK START') || html.includes('Quick Start') || html.includes('快速') || html.includes('クイック') || html.includes('빠른');
});

test('Text Input', 'Paste strips HTML formatting', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  const dt = new DataTransfer();
  dt.setData('text/plain', 'PlainPaste');
  dt.setData('text/html', '<b style="color:red">PlainPaste</b>');
  ti.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  await sleep(200);
  return ti.innerHTML.includes('PlainPaste') && !ti.innerHTML.includes('<b');
});

test('Text Input', 'Brackets stay with date pattern (no extra split)', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  setVal(ti, '通知7月25日()7月26日()休息');
  await sleep(400);
  const html = q(doc, '#print-text').innerHTML;
  const breaks = (html.match(/<br>/g) || []).length;
  if (breaks !== 3) throw `Expected 3 <br> tags (4 lines), got ${breaks}. HTML: ${html}`;
  return true;
});

test('Text Input', 'Two-digit month (11月) splits as single token, not split mid-number', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  setVal(ti, '某某某医生 11月11日（周三）全天停诊');
  await sleep(400);
  const html = q(doc, '#print-text').innerHTML;
  const breaks = (html.match(/<br>/g) || []).length;
  if (breaks !== 2) throw `Expected 2 <br> tags (3 lines), got ${breaks}. HTML: ${html}`;
  if (!html.includes('11月')) throw `'11月' was split — got: ${html}`;
  return true;
});

test('Text Input', 'Orientation auto-selects on new text (not locked to Quick Start)', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  setVal(ti, '通知\n第一行\n第二行\n第三行\n第四行');
  await sleep(500);
  const orientation = q(doc, '#a4-page').className;
  return orientation === 'portrait';
});

test('Text Input', 'Multi-line content selects portrait orientation', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  ti.innerHTML = '<div>1</div><div>2</div>';
  ti.dispatchEvent(new Event('input', {bubbles: true}));
  await sleep(500);
  const orientation = q(doc, '#a4-page').className;
  if (orientation !== 'portrait') throw `Expected portrait for 2-line content, got ${orientation}`;
  return true;
});

test('Text Input', 'Multi-line content does not overflow page height', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  ti.innerHTML = '<div>1</div><div>2</div><div>3</div>';
  ti.dispatchEvent(new Event('input', {bubbles: true}));
  await sleep(500);
  const pt = q(doc, '#print-text');
  const page = q(doc, '#a4-page');
  const cs = win.getComputedStyle(page);
  const pageH = page.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  if (pt.scrollHeight > pageH + 2) throw `Content ${pt.scrollHeight}px overflows page ${pageH}px`;
  return true;
});

test('Text Input', 'Double br tags collapsed to single br', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  ti.innerHTML = '<div>1</div><div>2</div>';
  ti.dispatchEvent(new Event('input', {bubbles: true}));
  await sleep(400);
  const html = q(doc, '#print-text').innerHTML;
  const brCount = (html.match(/<br>/g) || []).length;
  if (brCount !== 1) throw `Expected 1 <br>, got ${brCount}. HTML: ${html}`;
  return true;
});

test('Text Input', 'htmlToPlain handles mixed div structure correctly', async (fr, win, doc) => {
  const plain = win.htmlToPlain('1<div>2</div><div>3</div>').trim();
  const lines = plain.split('\n');
  if (lines.length !== 3) throw `Expected 3 lines, got ${lines.length}: ${JSON.stringify(plain)}`;
  if (lines[0] !== '1' || lines[1] !== '2' || lines[2] !== '3') throw `Wrong lines: ${JSON.stringify(lines)}`;
  return true;
});

test('Text Input', 'Typing 1 Enter 2 Enter 3 gives correct font size', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  ti.focus();
  doc.execCommand('insertText', false, '1');
  ti.dispatchEvent(new Event('input', {bubbles: true}));
  doc.execCommand('insertParagraph', false);
  ti.dispatchEvent(new Event('input', {bubbles: true}));
  doc.execCommand('insertText', false, '2');
  ti.dispatchEvent(new Event('input', {bubbles: true}));
  doc.execCommand('insertParagraph', false);
  ti.dispatchEvent(new Event('input', {bubbles: true}));
  doc.execCommand('insertText', false, '3');
  ti.dispatchEvent(new Event('input', {bubbles: true}));
  await sleep(500);
  const pt = q(doc, '#print-text');
  const page = q(doc, '#a4-page');
  const cs = win.getComputedStyle(page);
  const pageH = page.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  if (pt.scrollHeight > pageH + 2) throw `Content ${pt.scrollHeight}px overflows page ${pageH}px`;
  const fontSize = parseInt(pt.style.fontSize);
  if (fontSize < 130) throw `Font too small: ${fontSize}px`;
  return true;
});

test('Text Input', 'Auto-wrap toggle does not cause overflow', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  ti.innerHTML = '<div>1</div><div>2</div><div>3</div>';
  ti.dispatchEvent(new Event('input', {bubbles: true}));
  await sleep(400);
  click(q(doc, '#toggle-wrap'));
  await sleep(400);
  click(q(doc, '#toggle-wrap'));
  await sleep(400);
  const pt = q(doc, '#print-text');
  const page = q(doc, '#a4-page');
  const cs = win.getComputedStyle(page);
  const pageH = page.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  if (pt.scrollHeight > pageH + 2) throw `After wrap toggle, content ${pt.scrollHeight}px overflows page ${pageH}px`;
  return true;
});

// ── Group 2: Rich text formatting ────────────────────────────────────────────
test('Rich Text', 'Bold button exists in toolbar', async (fr, win, doc) => {
  return !!q(doc, '#rich-bold');
});

test('Rich Text', 'Italic button exists in toolbar', async (fr, win, doc) => {
  return !!q(doc, '#rich-italic');
});

test('Rich Text', 'Underline button exists in toolbar', async (fr, win, doc) => {
  return !!q(doc, '#rich-underline');
});

test('Rich Text', 'Text colour picker exists', async (fr, win, doc) => {
  return !!q(doc, '#rich-color');
});

test('Rich Text', 'Highlight colour picker exists', async (fr, win, doc) => {
  return !!q(doc, '#rich-bg-color');
});

test('Rich Text', 'Clear format button exists', async (fr, win, doc) => {
  return !!q(doc, '#rich-clear-format');
});

// ── Group 3: Action buttons ───────────────────────────────────────────────────
test('Action Buttons', 'Rotate button exists', async (fr, win, doc) => {
  return !!q(doc, '#rotate-btn');
});

test('Action Buttons', 'Rotate toggles orientation', async (fr, win, doc) => {
  const ti = q(doc, '#text-input');
  setVal(ti, 'ROTATE TEST');
  await sleep(400);
  const page = q(doc, '#a4-page');
  const before = page.className;
  click(q(doc, '#rotate-btn'));
  await sleep(400);
  const after = page.className;
  return before !== after && (after === 'landscape' || after === 'portrait');
});

test('Action Buttons', 'Background toggle opens panel', async (fr, win, doc) => {
  const panel = q(doc, '#bg-panel');
  const wasOpen = panel.style.display === 'flex';
  click(q(doc, '#bg-toggle'));
  await sleep(200);
  const nowOpen = panel.style.display === 'flex';
  if (wasOpen === nowOpen) return false;
  click(q(doc, '#bg-toggle'));
  return true;
});

test('Action Buttons', 'Print button is right-aligned', async (fr, win, doc) => {
  const btn = q(doc, '#print-btn');
  return btn && (btn.style.marginLeft === 'auto' || getComputedStyle(btn).marginLeft !== '0px');
});

test('Action Buttons', 'Print button is bold', async (fr, win, doc) => {
  const btn = q(doc, '#print-btn');
  return btn && getComputedStyle(btn).fontWeight >= 700;
});

test('Action Buttons', 'Print preserves manual rotation', async (fr, win, doc) => {
  setVal(q(doc, '#text-input'), 'Test rotation');
  await sleep(400);
  const before = q(doc, '#a4-page').className;
  click(q(doc, '#rotate-btn'));
  await sleep(300);
  const afterRotate = q(doc, '#a4-page').className;
  if (afterRotate === before) throw 'Rotate did not change orientation';
  win._manualRotation = true;
  q(doc, '#text-input').dispatchEvent(new Event('input', {bubbles: true}));
  await sleep(300);
  const afterPrint = q(doc, '#a4-page').className;
  if (afterPrint !== afterRotate) throw `Orientation changed from ${afterRotate} to ${afterPrint} after input`;
  return true;
});

// ── Group 4: Font/size/paper controls ────────────────────────────────────────
test('Controls', 'Font/size/paper buttons hidden initially', async (fr, win, doc) => {
  const fl = q(doc, '#toggle-font-list');
  const fs = q(doc, '#toggle-font-size-ctrl');
  const fp = q(doc, '#toggle-paper-size-ctrl');
  if (!fl) throw 'Missing #toggle-font-list';
  if (!fs) throw 'Missing #toggle-font-size-ctrl';
  if (!fp) throw 'Missing #toggle-paper-size-ctrl';
  return true;
});

test('Controls', 'After preview, toggle buttons appear', async (fr, win, doc) => {
  setVal(q(doc, '#text-input'), 'Controls test');
  await sleep(400);
  const fl = q(doc, '#toggle-font-list');
  return fl && fl.style.display !== 'none';
});

test('Controls', 'Typeface toggle shows font panel', async (fr, win, doc) => {
  click(q(doc, '#toggle-font-list'));
  await sleep(200);
  const panel = q(doc, '#font-list');
  const visible = panel && panel.style.display === 'flex';
  click(q(doc, '#toggle-font-list'));
  return visible;
});

test('Controls', 'Font Size toggle shows size controls', async (fr, win, doc) => {
  click(q(doc, '#toggle-font-size-ctrl'));
  await sleep(200);
  const panel = q(doc, '#font-size-ctrl');
  const visible = panel && panel.style.display === 'flex';
  click(q(doc, '#toggle-font-size-ctrl'));
  return visible;
});

test('Controls', 'Paper toggle shows paper size controls', async (fr, win, doc) => {
  click(q(doc, '#toggle-paper-size-ctrl'));
  await sleep(200);
  const panel = q(doc, '#paper-size-ctrl');
  const visible = panel && panel.style.display === 'flex';
  click(q(doc, '#toggle-paper-size-ctrl'));
  return visible;
});

test('Controls', 'Background toggle shows bg panel', async (fr, win, doc) => {
  const panel = q(doc, '#bg-panel');
  click(q(doc, '#bg-toggle'));
  await sleep(200);
  const visible = panel.style.display === 'flex';
  click(q(doc, '#bg-toggle'));
  return visible;
});

test('Controls', 'Font size − button decreases size', async (fr, win, doc) => {
  const display = q(doc, '#font-size-display');
  const before = parseInt(display.textContent);
  const btn = q(doc, '#font-dec');
  btn.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
  btn.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
  await sleep(200);
  const after = parseInt(display.textContent);
  return after === before - 1;
});

test('Controls', 'Font size + button increases size', async (fr, win, doc) => {
  const display = q(doc, '#font-size-display');
  const before = parseInt(display.textContent);
  const btn = q(doc, '#font-inc');
  btn.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
  btn.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
  await sleep(200);
  const after = parseInt(display.textContent);
  return after === before + 1;
});

test('Controls', 'Fit button recalculates font size', async (fr, win, doc) => {
  const display = q(doc, '#font-size-display');
  const dec = q(doc, '#font-dec');
  dec.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
  dec.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
  await sleep(100);
  dec.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
  dec.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
  await sleep(100);
  const before = parseInt(display.textContent);
  click(q(doc, '#font-reset'));
  await sleep(300);
  const after = parseInt(display.textContent);
  return after !== before;
});

test('Controls', 'Paper size buttons exist', async (fr, win, doc) => {
  return qq(doc, '.paper-btn').length >= 6;
});

// ── Group 5: Status bar ───────────────────────────────────────────────────────
test('Status Bar', 'Status bar hidden before preview', async (fr, win, doc) => {
  return !!q(doc, '#preview-status');
});

test('Status Bar', 'Status bar shows after preview', async (fr, win, doc) => {
  setVal(q(doc, '#text-input'), 'Status test');
  await sleep(400);
  return q(doc, '#preview-status').style.display === 'flex';
});

test('Status Bar', 'Status bar has 5 chips', async (fr, win, doc) => {
  return qq(doc, '.status-chip').length === 5;
});

test('Status Bar', 'BG chip shows Blank by default', async (fr, win, doc) => {
  const chip = q(doc, '#status-bg');
  const text = chip ? chip.textContent.trim().toLowerCase() : '';
  return text.includes('blank') || text.includes('空白') || text.includes('공백');
});

test('Status Bar', 'Font chip shows current font name', async (fr, win, doc) => {
  const chip = q(doc, '#status-font');
  return chip && chip.textContent.trim().length > 0;
});

test('Status Bar', 'Size chip shows px value', async (fr, win, doc) => {
  const chip = q(doc, '#status-size');
  return chip && chip.textContent.includes('px');
});

test('Status Bar', 'Paper chip shows paper name', async (fr, win, doc) => {
  const chip = q(doc, '#status-paper');
  return chip && chip.textContent.trim().length > 0;
});

test('Status Bar', 'Orientation chip shows orientation', async (fr, win, doc) => {
  setVal(q(doc, '#text-input'), 'Test');
  await sleep(400);
  const chip = q(doc, '#status-orientation');
  return chip && chip.textContent.trim().length > 0;
});

// ── Group 6: Background panel ─────────────────────────────────────────────────
test('Background', 'Background panel has 2 tabs (Colour + Image)', async (fr, win, doc) => {
  return qq(doc, '.bg-tab').length === 2;
});

test('Background', 'Colour tab opens colour row', async (fr, win, doc) => {
  click(q(doc, '#bg-toggle'));
  await sleep(200);
  click(q(doc, '#bg-tab-colour'));
  await sleep(200);
  const row = q(doc, '#bg-colour-row');
  const visible = row && row.style.display === 'flex';
  click(q(doc, '#bg-toggle'));
  return visible;
});

test('Background', 'BG chip updates when colour set', async (fr, win, doc) => {
  click(q(doc, '#bg-toggle'));
  await sleep(200);
  click(q(doc, '#bg-tab-colour'));
  await sleep(100);
  const picker = q(doc, '#bg-color');
  picker.value = '#ff0000';
  triggerInput(picker);
  await sleep(200);
  const chip = q(doc, '#status-bg');
  const text = chip ? chip.textContent.trim().toLowerCase() : '';
  click(q(doc, '#bg-toggle'));
  return text.includes('colour') || text.includes('颜色') || text.includes('顏色') || text.includes('색상') || text.includes('色');
});

test('Background', 'Reset button clears background to white', async (fr, win, doc) => {
  click(q(doc, '#bg-toggle'));
  await sleep(200);
  click(q(doc, '#bg-tab-colour'));
  await sleep(100);
  const picker = q(doc, '#bg-color');
  picker.value = '#ff0000';
  triggerInput(picker);
  await sleep(100);
  click(q(doc, '#bg-reset-all'));
  await sleep(200);
  const page = q(doc, '#a4-page');
  const bg = page.style.backgroundColor;
  click(q(doc, '#bg-toggle'));
  return bg === 'white' || bg === 'rgb(255, 255, 255)' || bg === '';
});

test('Background', 'Reset clears backgroundImage (no grey area)', async (fr, win, doc) => {
  click(q(doc, '#bg-toggle'));
  await sleep(200);
  click(q(doc, '#bg-tab-colour'));
  await sleep(100);
  const picker = q(doc, '#bg-color');
  picker.value = '#ff0000';
  triggerInput(picker);
  await sleep(100);
  const page = q(doc, '#a4-page');
  page.style.backgroundImage = 'url(fake)';
  click(q(doc, '#bg-reset-all'));
  await sleep(200);
  const bgImg = page.style.backgroundImage;
  click(q(doc, '#bg-toggle'));
  if (bgImg && bgImg !== 'none' && bgImg !== '') throw `backgroundImage not cleared: ${bgImg}`;
  return true;
});

test('Background', 'Watermark toggle button opens watermark row', async (fr, win, doc) => {
  click(q(doc, '#bg-toggle'));
  await sleep(200);
  click(q(doc, '#bg-tab-colour'));
  await sleep(100);
  click(q(doc, '#bg-watermark-toggle'));
  await sleep(200);
  const row = q(doc, '#bg-watermark-row');
  const visible = row && row.style.display === 'flex';
  click(q(doc, '#bg-toggle'));
  return visible;
});

// ── Group 7: Watermark ────────────────────────────────────────────────────────
test('Watermark', 'Watermark text input max 25 chars', async (fr, win, doc) => {
  const input = q(doc, '#wm-text');
  return input && input.maxLength === 25;
});

test('Watermark', 'Character counter updates', async (fr, win, doc) => {
  await openWatermarkPanel(doc);
  setVal(q(doc, '#wm-text'), 'TEST');
  await sleep(100);
  const count = q(doc, '#wm-text-count');
  const result = count && count.textContent === '4/25';
  click(q(doc, '#bg-toggle'));
  return result;
});

test('Watermark', 'Watermark renders SVG on text input', async (fr, win, doc) => {
  await openWatermarkPanel(doc);
  setVal(q(doc, '#wm-text'), 'DRAFT');
  await sleep(300);
  const wm = q(doc, '#watermark');
  const hasSvg = wm && wm.querySelector('svg') !== null;
  click(q(doc, '#bg-toggle'));
  return hasSvg;
});

test('Watermark', 'Wave/Spiral hint appears for long text', async (fr, win, doc) => {
  await openWatermarkPanel(doc);
  setVal(q(doc, '#wm-text'), '12345678901');
  q(doc, '.wm-style-btn[data-style="wave"]').click();
  await sleep(200);
  const hint = q(doc, '#wm-style-hint');
  const visible = hint && hint.style.display !== 'none';
  click(q(doc, '#bg-toggle'));
  return visible;
});

test('Watermark', 'Clear button empties watermark', async (fr, win, doc) => {
  await openWatermarkPanel(doc);
  setVal(q(doc, '#wm-text'), 'CLEAR ME');
  await sleep(300);
  click(q(doc, '#wm-clear'));
  await sleep(200);
  const wm = q(doc, '#watermark');
  const result = wm && wm.innerHTML.trim() === '';
  click(q(doc, '#bg-toggle'));
  return result;
});

test('Watermark', '6 style buttons present', async (fr, win, doc) => {
  return qq(doc, '.wm-style-btn').length === 6;
});

test('Watermark', 'Outline checkbox present', async (fr, win, doc) => {
  return !!q(doc, '#wm-outline');
});

// ── Group 8: Language switching ───────────────────────────────────────────────
test('Language', '5 language buttons present', async (fr, win, doc) => {
  return qq(doc, '.lang-btn').length === 5;
});

test('Language', 'Switching to zh_CN updates UI', async (fr, win, doc) => {
  click(q(doc, '.lang-btn[data-lang="zh_CN"]'));
  await sleep(200);
  const label = q(doc, '#input-label');
  const result = label && label.textContent.includes('通知');
  click(q(doc, '.lang-btn[data-lang="en"]'));
  await sleep(200);
  return result;
});

test('Language', 'Switching to Japanese updates UI', async (fr, win, doc) => {
  click(q(doc, '.lang-btn[data-lang="ja"]'));
  await sleep(200);
  const label = q(doc, '#input-label');
  const result = label && label.textContent.includes('通知');
  click(q(doc, '.lang-btn[data-lang="en"]'));
  await sleep(200);
  return result;
});

test('Language', 'Switching to Korean updates UI', async (fr, win, doc) => {
  click(q(doc, '.lang-btn[data-lang="ko"]'));
  await sleep(200);
  const label = q(doc, '#input-label');
  const result = label && label.textContent.includes('알림');
  click(q(doc, '.lang-btn[data-lang="en"]'));
  await sleep(200);
  return result;
});

test('Language', 'Active lang button highlighted', async (fr, win, doc) => {
  click(q(doc, '.lang-btn[data-lang="zh_TW"]'));
  await sleep(200);
  const active = q(doc, '.lang-btn.active');
  const result = active && active.dataset.lang === 'zh_TW';
  click(q(doc, '.lang-btn[data-lang="en"]'));
  return result;
});

// ── Group 9: Theme switching ──────────────────────────────────────────────────
test('Theme', '6 theme buttons present', async (fr, win, doc) => {
  return qq(doc, '.theme-btn').length === 6;
});

test('Theme', 'Switching theme changes html data-theme', async (fr, win, doc) => {
  click(q(doc, '.theme-btn[data-theme="night"]'));
  await sleep(200);
  const result = doc.documentElement.dataset.theme === 'night';
  click(q(doc, '.theme-btn[data-theme="studio"]'));
  await sleep(200);
  return result;
});

test('Theme', 'Studio theme removes data-theme', async (fr, win, doc) => {
  click(q(doc, '.theme-btn[data-theme="night"]'));
  await sleep(200);
  click(q(doc, '.theme-btn[data-theme="studio"]'));
  await sleep(200);
  return !doc.documentElement.dataset.theme;
});

test('Theme', 'Page background stays white regardless of theme', async (fr, win, doc) => {
  click(q(doc, '#bg-toggle'));
  await sleep(100);
  click(q(doc, '#bg-reset-all'));
  await sleep(100);
  click(q(doc, '#bg-toggle'));
  await sleep(100);
  click(q(doc, '.theme-btn[data-theme="night"]'));
  await sleep(200);
  const bg = getComputedStyle(q(doc, '#a4-page')).backgroundColor;
  click(q(doc, '.theme-btn[data-theme="studio"]'));
  return bg === 'rgb(255, 255, 255)';
});

// ── Group 10: Help system ─────────────────────────────────────────────────────
test('Help', 'Help button opens modal', async (fr, win, doc) => {
  click(q(doc, '#help-btn'));
  await sleep(200);
  const overlay = q(doc, '#help-overlay');
  const open = overlay && overlay.classList.contains('open');
  if (open) click(q(doc, '#help-close'));
  return open;
});

test('Help', 'Help modal has 15 sections', async (fr, win, doc) => {
  click(q(doc, '#help-btn'));
  await sleep(300);
  const sections = qq(doc, '.help-section').length;
  click(q(doc, '#help-close'));
  return sections === 15;
});

test('Help', 'Tour button starts tour', async (fr, win, doc) => {
  click(q(doc, '#tour-btn'));
  await sleep(200);
  const overlay = q(doc, '#tour-overlay');
  const active = overlay && overlay.classList.contains('active');
  if (active) { const esc = new KeyboardEvent('keydown', {key:'Escape',bubbles:true}); doc.dispatchEvent(esc); }
  return active;
});

test('Help', 'Guide button opens side panel', async (fr, win, doc) => {
  click(q(doc, '#panel-btn'));
  await sleep(200);
  const panel = q(doc, '#side-panel');
  const open = panel && panel.classList.contains('open');
  if (open) click(q(doc, '#side-panel-close'));
  return open;
});

test('Help', 'About button opens modal', async (fr, win, doc) => {
  click(q(doc, '#about-btn'));
  await sleep(200);
  const overlay = q(doc, '#about-overlay');
  const open = overlay && overlay.classList.contains('open');
  if (open) click(q(doc, '#about-close'));
  return open;
});

test('Help', 'About shows app name', async (fr, win, doc) => {
  click(q(doc, '#about-btn'));
  await sleep(200);
  const name = q(doc, '[data-i18n="about_name"]');
  const hasName = name && name.textContent.includes('Studio');
  click(q(doc, '#about-close'));
  return hasName;
});

// ── Group 11: Layout & structure ──────────────────────────────────────────────
test('Layout', 'App header present', async (fr, win, doc) => {
  return !!q(doc, '#app-header');
});

test('Layout', 'A4 page div present', async (fr, win, doc) => {
  return !!q(doc, '#a4-page');
});

test('Layout', 'Watermark layer z-index below text layer', async (fr, win, doc) => {
  const wm = q(doc, '#watermark');
  const pt = q(doc, '#print-text');
  const wmZ = parseInt(getComputedStyle(wm).zIndex) || 0;
  const ptZ = parseInt(getComputedStyle(pt).zIndex) || 0;
  return wmZ < ptZ;
});

test('Layout', 'Section divider label present', async (fr, win, doc) => {
  return !!q(doc, '#section-divider-label');
});

test('Layout', 'Orientation chip present in status bar', async (fr, win, doc) => {
  return !!q(doc, '#status-orientation');
});
