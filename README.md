# 🥗 Daily Calorie Log (일일 칼로리 & 운동 기록 트래커)

AI(Google Gemini)를 활용하여 자연어 입력만으로 음식 섭취량과 운동량을 자동으로 분석하고 기록하는 스마트 건강 관리 웹 어플리케이션입니다. 

### 🌐 [실제 서비스 접속하기](https://daily-calorie-log.pages.dev)

---

## ✨ 주요 기능

- **🤖 AI 자동 분석**: "아침에 사과 1개랑 계란 2개 먹었어"와 같은 자연어 입력 시 AI가 칼로리와 단백질을 자동으로 추출 및 분석합니다.
- **📊 스마트 대시보드**: 
  - 일일 권장량 대비 섭취 현황(칼로리, 단백질) 시각화.
  - 음식(FOOD)과 운동(EXERCISE)의 순 칼로리 자동 합산.
- **📈 통계 및 트렌드**: 최근 7일/30일/전체 기간의 칼로리 섭취 추이를 선 그래프로 제공합니다.
- **🛡️ 관리자 포털**: 시스템 전반의 사용자 현황, 최근 기록 모니터링 및 주요 인프라 상태(Google, Cloudflare 등) 실시간 체크 기능을 제공합니다.
- **🌗 다크 모드 지원**: 사용자 환경에 최적화된 테마(라이트/다크) 전환이 가능합니다.
- **🛡️ 안전한 보안**: Google OAuth 2.0 기반의 로그인 및 JWT 세션을 통한 데이터 보안을 지원합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS (Modern Squared UI)
- **Icons**: Lucide React
- **Charts**: Recharts
- **State/Auth**: Context API + Jose (JWT)

### Backend & Infrastructure
- **Hosting**: Cloudflare Pages
- **Functions**: Cloudflare Functions (Serverless)
- **Database**: Cloudflare D1 (SQLite-based distributed database)
- **AI**: Google Gemini 1.5 Flash API

---

## 🚀 로컬 실행 가이드 (Local Development)

### 1. 사전 요구사항
- **Node.js**: v20 이상 (v22 추천)
- **Google AI Studio Key**: Gemini API 호출을 위해 필요합니다.
- **Google Cloud Console OAuth**: Google 로그인을 위한 Client ID/Secret이 필요합니다.

### 2. 설치 및 설정
```bash
# 의존성 설치
npm install

# .dev.vars (환경 변수) 파일 생성
cat <<EOF > .dev.vars
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"
GOOGLE_REDIRECT_URI="http://localhost:8788/api/auth/callback"
JWT_SECRET="your_local_secret"
GEMINI_API_KEY="your_gemini_key"
EOF
```

### 3. 데이터베이스 설정 및 실행
```bash
# 로컬 DB 마이그레이션 적용
npx wrangler d1 migrations apply daily-calorie-db --local

# 개발 서버 실행 (Cloudflare Pages Functions 포함)
# 개발 서버 실행 (Cloudflare Pages Functions 포함)
npm run start
```

#### 🔄 원격 데이터베이스 가져오기 (DB Sync)
원격 환경(운영 서버)의 실제 데이터로 로컬 테스트를 하고 싶을 때 사용합니다.
> **주의**: 로컬 데이터베이스가 초기화(삭제 후 재생성)됩니다.

```bash
npm run db:pull
```

---

## 📦 빌드 및 배포 (Build & Deployment)

> **알림**: 현재 자동 배포(GitHub Actions) 대신 **수동 배포**를 권장합니다.

### 1. 배포 실행 (자동화)
번거로운 설정 변경 없이 아래 명령어 하나로 **빌드 + 설정 적용 + 배포 + 원복**이 한 번에 처리됩니다.
```bash
npm run deploy
```
*(배포 도중 `wrangler.toml`이 잠시 수정되지만, 완료 후 자동으로 원래대로 돌아옵니다.)*

---

### [참고] 초기 설정 (Initial Setup)

#### 1. 원격 데이터베이스 생성 (최초 1회)
```bash
npx wrangler d1 create daily-calorie-db
npx wrangler d1 migrations apply daily-calorie-db --remote
```

#### 2. 비밀키(Secrets) 등록
```bash
npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name daily-calorie-log
npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name daily-calorie-log
npx wrangler pages secret put GOOGLE_REDIRECT_URI --project-name daily-calorie-log
npx wrangler pages secret put JWT_SECRET --project-name daily-calorie-log
npx wrangler pages secret put GEMINI_API_KEY --project-name daily-calorie-log
```
---

## 📝 프로젝트 정보 및 면책 조항
- **개발자**: 윤명준 (MJ Yun)
- **오픈 소스**: 본 프로젝트는 오픈 소스로 제공되며, 관리자 페이지는 이미 정의 되어 있는 이메일 계정으로 접근 권한을 제어합니다.
- **정확도**: AI가 분석한 칼로리 데이터는 참고용이며, 실제 영양 정보와 차이가 있을 수 있습니다.

---

### 📅 마스터 릴리즈 노트
- **v1.2 (2026-01-29)**: UI/UX 전면 개편 및 안정화 (Current)
  - **UX/UI**: 메뉴 상단 배치, 화면별 요소(날짜 선택기 등) 조건부 표시로 몰입감 향상.
  - **Feature**: 통계 차트 상세 데이터 테이블 추가 및 시각적 필터(체크박스) 구현.
  - **Refactor**: 버전 정보(`v1.2.20260129`) 중앙 관리 및 Footer/Admin 표시 추가.
  - **Chore**: 프로덕션 로그 최적화 및 코드 클린업 완료.
- **v1.1 (2026-01-29)**: 로컬 개발 환경 개선 및 안정화
  - **Feature**: `npm run db:pull` 명령어 추가 (원격 데이터 로컬 동기화).
  - **Fix**: 프로덕션 환경 인증(쿠키 처리) 신뢰성 개선.
  - **Chore**: GitHub Actions 배포 워크플로우 안정화 및 날짜 표시 버그 수정.
- **v1.0 (2026-01-28)**: 초기 릴리즈. AI 분석, 관리자 대시보드, 통계 기능 포함.

