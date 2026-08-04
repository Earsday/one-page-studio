# One-Page Studio

<p align="right"><a href="README.md">English</a> | <a href="README.zh-CN.md">简中</a> | <a href="README.zh-TW.md">繁中</a> | 日本語 | <a href="README.ko.md">한국어</a></p>

大きな文字の通知を紙に印刷するための単一 HTML ファイルツールです。インストール不要、サーバー不要で、開いてすぐ印刷できます。

![One-Page Studio](https://img.shields.io/badge/version-2026--07--20-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 主な機能

- **ライブプレビュー**: 入力と同時に即時レンダリングし、ページいっぱいに自動で文字サイズ調整
- **リッチテキスト**: 太字、斜体、下線、文字色、ハイライト色
- **自動改行分割**: `1.2` や `7月25日` などの日付パターンを自動で行分割
- **Auto-wrap Lines 切り替え**: 複数行表示と単一行表示を切り替え可能
- **スマート向き判定**: 内容の形に応じて横向き/縦向きを自動選択
- **複数の用紙サイズ**: A3、A4、A5、B4、B5、Letter
- **背景オプション**: 単色、画像アップロード（Cover/Contain/Stretch/Tile）、独立した透かしオーバーレイ（6スタイル）
- **透かし**: Staggered、Tiled、Horizontal、Stamp、Wave、Spiral。アウトライン表示、フォント、サイズをカスタマイズ可能
- **6つのテーマ**: Studio、Night、Forest、Sakura、LV Monogram、LV Damier
- **5言語対応 UI**: English、简体中文、繁體中文、日本語、한국어（自動判定）
- **印刷向け最適化**: 印刷時も色とハイライトを保持

## 使い方

1. `print-notification.html` をダウンロード
2. ブラウザで開く（ダブルクリックまたは `open print-notification.html`）
3. 通知テキストを入力
4. **Print** をクリック

ビルドツール不要、依存関係不要、サーバー不要。`file://` でそのまま動作します。

### URL パラメータモード

URL でテキストを渡すと、読み込み時に自動レンダリングされます。

```
print-notification.html?text=URGENT+NOTICE
```

## クイックスタート

| 手順 | 操作 |
|------|------|
| 1 | 入力欄にテキストを入力 |
| 2 | 下のライブプレビューを確認 |
| 3 | **Print** をクリック |

### ヒント

- `①②③` を使うと手動で改行を強制できます
- `7月25日` や `1.25（土）` のような日付パターンは自動で分割されます
- **⇄ Orientation** で横向き/縦向きを切り替えできます
- **Auto-wrap Lines** をオフにすると、折り返しなしの単一行表示になります
- ステータスバーに向き、背景、フォント、文字サイズ、用紙サイズが表示されます

## ファイル構成

```
one-page-studio/
├── print-notification.html      # メインアプリ（ソース）
├── print-notification.min.html  # 配布用の圧縮版
├── test-runner.html             # 回帰テストスイート
├── archive/                     # バージョン別バックアップ
└── docs/                        # 設計仕様と実装メモ
```

## テスト

iframe アクセスのため、ローカル HTTP サーバーが必要です。

```bash
python3 -m http.server 8900
open http://localhost:8900/test-runner.html
```

特定バージョンをテストする場合:
```
http://localhost:8900/test-runner.html?target=print-notification.min.html
```

## ブラウザ対応

Chrome、Safari、Firefox、Edge などのモダンブラウザで動作します。印刷時の色再現性は Chrome 推奨です。

## ライセンス

MIT — 自由に利用、改変、再配布できます。

## 連絡先

earsday@163.com
