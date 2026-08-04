# One-Page Studio

<p align="right"><a href="README.md">English</a> | 简中 | <a href="README.zh-TW.md">繁中</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a></p>

用于在纸张上打印大字号通知的单文件 HTML 工具。无需安装、无需服务器，打开即可打印。

![One-Page Studio](https://img.shields.io/badge/version-2026--07--20-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 功能

- **实时预览**：输入时即时渲染，自动调整字号填满页面
- **富文本格式**：粗体、斜体、下划线、文字颜色、高亮颜色
- **自动分行**：可识别 `1.2` 或 `7月25日` 等日期模式并自动换行
- **自动换行开关**：可在多行渲染与单行渲染之间切换
- **智能方向**：根据内容形态自动选择横向或纵向
- **多种纸张**：A3、A4、A5、B4、B5、Letter
- **背景选项**：纯色、图片上传（覆盖/包含/拉伸/平铺）、独立水印叠加（6 种样式）
- **水印**：Staggered、Tiled、Horizontal、Stamp、Wave、Spiral；支持描边、自定义字体和字号
- **6 套主题**：Studio、Night、Forest、Sakura、LV Monogram、LV Damier
- **5 种界面语言**：English、简体中文、繁體中文、日本語、한국어（自动识别）
- **打印就绪**：打印时保留颜色与高亮

## 使用方法

1. 下载 `one-page-studio.html`
2. 用浏览器打开（双击或执行 `open one-page-studio.html`）
3. 输入通知文本
4. 点击 **Print**

无需构建工具、无需依赖、无需服务器。可直接通过 `file://` 运行。

### URL 参数模式

通过 URL 传入文本可在加载后自动渲染：

```
one-page-studio.html?text=URGENT+NOTICE
```

## 快速开始

| 步骤 | 操作 |
|------|------|
| 1 | 在输入框中输入文本 |
| 2 | 查看下方实时预览 |
| 3 | 点击 **Print** |

### 提示

- 使用 `①②③` 可手动强制分行
- `7月25日` 或 `1.25（周六）` 之类日期模式会自动分行
- 点击 **⇄ Orientation** 可切换横向/纵向
- 关闭 **Auto-wrap Lines** 可将内容作为单行不换行显示
- 状态栏会显示当前方向、背景、字体、字号和纸张

## 文件结构

```
one-page-studio/
├── one-page-studio.html      # 主应用（源码）
├── one-page-studio.min.html  # 用于分发的压缩版
├── test-runner.html             # 回归测试套件
├── archive/                     # 版本归档备份
└── docs/                        # 设计规范与实现说明
```

## 测试

需要本地 HTTP 服务器（用于 iframe 访问）：

```bash
python3 -m http.server 8900
open http://localhost:8900/test-runner.html
```

测试指定版本：
```
http://localhost:8900/test-runner.html?target=one-page-studio.min.html
```

## 浏览器兼容性

支持现代浏览器（Chrome、Safari、Firefox、Edge）。推荐使用 Chrome 以获得更好的打印颜色一致性。

## 许可证

MIT — 可自由使用、修改和分发。

## 联系方式

earsday@163.com
