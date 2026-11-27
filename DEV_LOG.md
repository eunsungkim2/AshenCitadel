# AshenCitadel 개발 로그

## 2026-11-27 · 두 PC 개발 환경 인계

- GitHub `main`의 초기 커밋 `74ff583`을 기준으로 프로젝트를 확인하고, 동기화·테스트·커밋·푸시 규칙을 `AGENTS.md`에 정리했다.
- 웹 진입점은 `index.html`이다. `style.css`가 레이아웃과 화면 스타일을 담당하고, `game.js`가 게임 규칙, Canvas 렌더링, Web Audio, 입력과 저장을 담당한다. npm 설치나 웹 빌드 없이 최신 브라우저에서 열 수 있다. 로컬 서버를 사용할 경우 루트에서 `python -m http.server 8765 --bind 127.0.0.1`을 실행하고 `http://127.0.0.1:8765/`를 연다.
- `node --check game.js` 통과. Linux Chromium에서 타이틀, 새 게임 시작, 소환, 적 웨이브 진행, 일시정지·재개, 도감의 브라우저 저장을 확인했다.
- Windows 빌드는 PowerShell, Windows x64 .NET Framework C# 컴파일러, WebView2 SDK `1.0.2210.55`를 사용한다. 프로젝트 루트에서 `powershell -File .\desktop\build.ps1`을 실행하면 `AshenCitadel.exe`가 생성된다. SDK는 기본적으로 NuGet에서 내려받으며, 기존 SDK는 `-SdkDirectory`로 지정할 수 있다. EXE 실행에는 Microsoft Edge WebView2 Runtime이 필요하다.
- 게임 프로필은 브라우저 또는 WebView2의 `localStorage`에 저장된다. GitHub로 공유되는 것은 프로젝트와 개발 문서이며, 계승·도감·플레이 기록은 PC 간 자동 동기화되지 않는다.

### 미완료 작업 및 다음 확인

- Windows 개발 PC에서 EXE를 빌드하고 WebView2 런타임으로 실행한다. 빌드 후 PowerShell에서 `Start-Process .\AshenCitadel.exe -ArgumentList '--smoke-test smoke-result.txt' -Wait -PassThru`로 내장 스모크 테스트를 실행하고 종료 코드와 보고서를 확인한다. Linux에서는 이 검증을 실행하지 못했다. 보고서와 스크린샷은 커밋 대상에서 제외한다.
- 다른 PC에서 개발을 재개할 때 `AGENTS.md`에 따라 최신 `main`과 작업 트리 상태를 확인한다. 현재 별도로 지정된 게임 기능 변경은 없다.

## 2026-11-27 · 악마 이미지 폴더

- 악마 이미지 원본을 두 PC에서 공유할 수 있도록 `assets/demons/` 폴더를 추가했다.
- 다음 작업은 ChatGPT에서 생성한 원본 이미지를 전달받아 이 폴더에 보관하는 것이다.

## 2026-11-27 · 7대죄 인게임 스프라이트

- 7대죄 참고 시트를 바탕으로 교만·탐욕·분노·질투·색욕·폭식·나태의 16비트풍 전신 스프라이트를 각각 만들어 `assets/demons/`에 추가했다.
- PNG 7개 모두 1254×1254 RGBA이며 투명 픽셀과 불투명 픽셀이 있는 것을 확인했다.
- 현재 게임 도감 집계는 아군 87개와 적 21개다. 적 집계에 웨이브 보스 패턴 3종이 포함되며 일부 적은 스프라이트를 공유한다.
- 다음 작업은 새 PNG를 7성 악마 렌더링에 연결하고 보드에서 크기와 발 위치를 조정하는 것이다.
