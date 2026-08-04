# One-Page Studio

<p align="right"><a href="README.md">English</a> | <a href="README.zh-CN.md">简中</a> | 繁中 | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a></p>

用於在紙張上列印大字通知的單檔 HTML 工具。無需安裝、無需伺服器，開啟即可列印。

![One-Page Studio](https://img.shields.io/badge/version-2026--07--20-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 功能

- **即時預覽**：輸入時立即渲染，自動調整字級填滿頁面
- **富文字格式**：粗體、斜體、底線、文字顏色、螢光標示
- **自動分行**：可辨識 `1.2` 或 `7月25日` 等日期格式並自動換行
- **自動換行開關**：可在多行與單行渲染模式間切換
- **智慧方向**：依內容形態自動選擇橫向或直向
- **多種紙張**：A3、A4、A5、B4、B5、Letter
- **背景選項**：純色、圖片上傳（Cover/Contain/Stretch/Tile）、獨立浮水印疊加（6 種樣式）
- **浮水印**：Staggered、Tiled、Horizontal、Stamp、Wave、Spiral；支援外框、自訂字體與字級
- **6 種主題**：Studio、Night、Forest、Sakura、LV Monogram、LV Damier
- **5 種介面語言**：English、简体中文、繁體中文、日本語、한국어（自動偵測）
- **列印就緒**：列印時保留顏色與螢光標示

## 使用方式

1. 下載 `one-page-studio.html`
2. 用瀏覽器開啟（雙擊或執行 `open one-page-studio.html`）
3. 輸入通知文字
4. 點擊 **Print**

無需建置工具、無需相依套件、無需伺服器。可直接透過 `file://` 執行。

### URL 參數模式

透過 URL 傳入文字可在載入後自動渲染：

```
one-page-studio.html?text=URGENT+NOTICE
```

## 快速開始

| 步驟 | 操作 |
|------|------|
| 1 | 在輸入框輸入文字 |
| 2 | 查看下方即時預覽 |
| 3 | 點擊 **Print** |

### 提示

- 使用 `①②③` 可手動強制分行
- `7月25日` 或 `1.25（週六）` 等日期格式會自動分行
- 點擊 **⇄ Orientation** 可切換橫向/直向
- 關閉 **Auto-wrap Lines** 可將內容以單行不換行顯示
- 狀態列會顯示目前方向、背景、字體、字級與紙張

## 檔案結構

```
one-page-studio/
├── one-page-studio.html      # 主程式（原始碼）
├── one-page-studio.min.html  # 發佈用壓縮版本
├── test-runner.html             # 回歸測試套件
├── archive/                     # 版本備份
└── docs/                        # 設計規格與實作說明
```

## 測試

需要本機 HTTP 伺服器（供 iframe 存取）：

```bash
python3 -m http.server 8900
open http://localhost:8900/test-runner.html
```

測試特定版本：
```
http://localhost:8900/test-runner.html?target=one-page-studio.min.html
```

## 瀏覽器相容性

支援現代瀏覽器（Chrome、Safari、Firefox、Edge）。建議使用 Chrome 以獲得最佳列印色彩一致性。

## 授權

MIT — 可自由使用、修改與散佈。

## 聯絡方式

earsday@163.com
