# One-Page Studio

<p align="right"><a href="README.md">English</a> | <a href="README.zh-CN.md">简中</a> | <a href="README.zh-TW.md">繁中</a> | <a href="README.ja.md">日本語</a> | 한국어</p>

큰 글자 알림을 종이에 인쇄하기 위한 단일 HTML 파일 도구입니다. 설치나 서버 없이, 열어서 바로 인쇄할 수 있습니다.

![One-Page Studio](https://img.shields.io/badge/version-2026--07--20-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 주요 기능

- **실시간 미리보기**: 입력과 동시에 즉시 렌더링되고, 페이지를 채우도록 글자 크기를 자동 조정
- **리치 텍스트 서식**: Bold, Italic, Underline, 글자 색상, 하이라이트 색상
- **자동 줄 분할**: `1.2`, `7月25日` 같은 날짜 패턴을 자동으로 줄 단위 분할
- **Auto-wrap Lines 토글**: 여러 줄 렌더링과 한 줄 렌더링 전환
- **스마트 방향 선택**: 내용 형태에 따라 가로/세로 자동 선택
- **다양한 용지 크기**: A3, A4, A5, B4, B5, Letter
- **배경 옵션**: 단색, 이미지 업로드(Cover/Contain/Stretch/Tile), 독립 워터마크 오버레이(6가지 스타일)
- **워터마크**: Staggered, Tiled, Horizontal, Stamp, Wave, Spiral; 외곽선 모드, 사용자 글꼴, 크기 지원
- **6가지 테마**: Studio, Night, Forest, Sakura, LV Monogram, LV Damier
- **UI 5개 언어 지원**: English, 简体中文, 繁體中文, 日本語, 한국어(자동 감지)
- **인쇄 최적화**: 인쇄 시 색상과 하이라이트 유지

## 사용 방법

1. `print-notification.html` 다운로드
2. 브라우저에서 열기(더블클릭 또는 `open print-notification.html` 실행)
3. 알림 텍스트 입력
4. **Print** 클릭

빌드 도구, 의존성, 서버가 필요 없습니다. `file://`로 바로 동작합니다.

### URL 파라미터 모드

URL로 텍스트를 전달하면 로드 시 자동 렌더링됩니다.

```
print-notification.html?text=URGENT+NOTICE
```

## 빠른 시작

| 단계 | 작업 |
|------|------|
| 1 | 입력 상자에 텍스트 입력 |
| 2 | 아래 실시간 미리보기 확인 |
| 3 | **Print** 클릭 |

### 팁

- `①②③`를 사용하면 수동 줄바꿈을 강제할 수 있습니다
- `7月25日` 또는 `1.25（토）` 같은 날짜 패턴은 자동 분할됩니다
- **⇄ Orientation** 버튼으로 가로/세로 전환 가능
- **Auto-wrap Lines**를 끄면 줄바꿈 없는 한 줄로 표시됩니다
- 상태 표시줄에 현재 방향, 배경, 글꼴, 글자 크기, 용지 크기가 표시됩니다

## 파일 구조

```
one-page-studio/
├── print-notification.html      # 메인 앱(소스)
├── print-notification.min.html  # 배포용 축약 버전
├── test-runner.html             # 회귀 테스트 스위트
├── archive/                     # 버전 백업
└── docs/                        # 설계 명세 및 구현 노트
```

## 테스트

iframe 접근을 위해 로컬 HTTP 서버가 필요합니다.

```bash
python3 -m http.server 8900
open http://localhost:8900/test-runner.html
```

특정 버전 테스트:
```
http://localhost:8900/test-runner.html?target=print-notification.min.html
```

## 브라우저 호환성

최신 브라우저(Chrome, Safari, Firefox, Edge)에서 동작합니다. 인쇄 색상 정확도는 Chrome을 권장합니다.

## 라이선스

MIT — 자유롭게 사용, 수정, 배포할 수 있습니다.

## 연락처

earsday@163.com
