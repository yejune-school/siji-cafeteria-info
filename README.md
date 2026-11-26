# 모급 — iOS(프로필 설치) · Windows 가이드

## 먼저 알아둘 점
- **iOS 네이티브 앱(IPA)은 이 폴더로 만들 수 없습니다.** IPA는 Mac + Xcode + Apple 서명이 있어야 만들어지고, Termux나 Windows에서는 빌드할 수 없습니다.
- 대신 **웹 앱 + 프로필(.mobileconfig)** 방식으로 iPhone 홈 화면에 모급 아이콘을 설치합니다. 앱처럼 전체 화면으로 열리지만, 홈 화면 위젯은 지원하지 않습니다. (위젯은 Android 앱에서만 동작)
- 프로필은 서명되지 않아 설치 때 "서명되지 않음" 표시가 나옵니다. 정상이며 계속 진행하면 됩니다.

## 1. 폴더 구성
```
index.html  shim.js  config.js    웹앱 본체 (config.js 에 NEIS 인증키)
manifest.webmanifest, icon-*.png  홈 화면 추가용 설정·아이콘
MoGeup.mobileconfig               iOS 홈 화면 설치 프로필
_headers                          Cloudflare Pages 사용 시 프로필 MIME 설정
package.json, main.js, icon.ico   Windows 앱(Electron) 빌드용
```

## 2. 사이트 올리기 (GitHub Pages) — iPhone 설치 전에 꼭 필요
프로필은 `https://yejune-school.github.io/siji-cafeteria-info/` 주소를 홈 화면에 설치합니다. 먼저 이 주소에 파일을 올려야 합니다.

Termux에서 (zip 을 다운로드 폴더에 `mogeup.zip` 으로 저장했다고 가정):
```bash
pkg install -y git unzip
cd ~
git clone https://github.com/yejune-school/siji-cafeteria-info.git
cd siji-cafeteria-info
mkdir -p docs
unzip -o ~/storage/downloads/mogeup.zip -d docs
git add docs
git commit -m "모급 웹앱 추가"
git push
```
`git push` 때 비밀번호 대신 **Personal Access Token**(GitHub → Settings → Developer settings → Personal access tokens)을 입력합니다.

그다음 GitHub 저장소 → **Settings → Pages → Branch: main, 폴더: /docs → Save**. 1~2분 뒤 위 주소가 열리면 성공입니다.

## 3. iPhone 설치 (Direct install)
**방법 A — 프로필 (사이트 버튼 한 번)**
1. iPhone의 **Safari**에서 `https://yejune-school.github.io/siji-cafeteria-info/MoGeup.mobileconfig` 를 엽니다. (소개 사이트의 "iOS 프로필 설치" 버튼도 같은 주소)
2. "프로필을 다운로드하시겠습니까?" → **허용**
3. **설정** 앱 → 맨 위 **프로필이 다운로드됨** → **설치** → 암호 입력 → 경고에서 다시 **설치**
4. 홈 화면에 모급 아이콘이 생깁니다. 학교를 한 번 선택하면 다음부터 기억합니다.

**방법 B — 프로필 없이**: Safari로 사이트를 열고 **공유 버튼 → 홈 화면에 추가**.

**삭제**: 아이콘을 길게 눌러 앱 제거, 프로필은 설정 → 일반 → VPN 및 기기 관리에서 삭제.

프로필 대신 파일만 내려받아지면: GitHub Pages가 프로필 형식을 인식하지 못한 경우일 수 있습니다. 방법 B를 쓰거나, 이 폴더를 **Cloudflare Pages**에 올리면 `_headers` 파일이 형식을 지정해 줍니다.

## 4. 진짜 IPA를 직접 설치하려면 (참고)
- 필요한 것: Mac, Xcode, Apple 개발자 계정, **서명된 IPA**, HTTPS 주소에 올린 `manifest.plist`
- 설치 링크 형식: `itms-services://?action=download-manifest&url=https://주소/manifest.plist`
- 유료 개발자 계정(Ad Hoc는 등록한 기기만) 또는 Enterprise 가 있어야 하며, 무료 계정은 AltStore/SideStore 같은 도구로 7일마다 재서명해야 합니다.
- 서명된 IPA 가 준비되면 manifest.plist 를 만들어 드릴 수 있습니다.

## 5. Windows
**방법 A — 빌드 없이 (가장 간단)**: Edge 또는 Chrome으로 사이트 주소를 열고 Edge는 **⋯ → 앱 → 이 사이트를 앱으로 설치**, Chrome은 주소창의 **설치** 아이콘을 누릅니다.

**방법 B — exe 로 빌드**
1. `https://nodejs.org` 에서 **LTS** 버전을 설치합니다. (설치 후 명령 프롬프트를 새로 엽니다)
2. 이 폴더(zip 을 푼 폴더)에서 **명령 프롬프트 또는 PowerShell**을 엽니다. (폴더 주소창에 `cmd` 입력 후 Enter)
3. 아래를 순서대로 실행합니다.
```bat
node -v
npm install
npm start
npm run build
```
- `npm start` : 빌드 없이 창으로 실행해 보기
- `npm run build` : exe 만들기
4. 결과: `dist\MoGeup-win32-x64\MoGeup.exe` (폴더 전체를 압축해서 배포)

## 6. 자주 생기는 문제
- **앱에서 "인터넷 연결을 확인하세요 (TypeError)"**: 브라우저가 NEIS API 호출을 막은 경우(CORS)입니다. Cloudflare Workers에 아래 코드를 배포하고, `config.js` 의 `NEIS_PROXY` 에 주소를 `https://...workers.dev/` 처럼 **끝에 /** 까지 넣으세요. (Windows 앱은 이 문제가 없도록 처리돼 있습니다.)
```js
export default { async fetch(r) {
  const u = new URL(r.url);
  const t = await fetch("https://open.neis.go.kr/hub" + u.pathname + u.search);
  return new Response(t.body, { headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
} }
```
- **`npm` 인식 불가**: Node.js 설치 후 명령 프롬프트를 새로 여세요.
- **빌드 중 네트워크 오류**: Electron 다운로드가 필요하니 인터넷 연결 후 `npm install` 을 다시 실행하세요.
- **exe 실행 시 SmartScreen 경고**: **추가 정보 → 실행**.
- **인증키 공개 주의**: 웹으로 올리면 `config.js` 의 인증키가 누구에게나 보입니다. 남용이 걱정되면 NEIS에서 키를 재발급하세요.
