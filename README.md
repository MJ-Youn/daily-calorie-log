# 🥗 Daily Calorie Log (일일 칼로리 & 운동 기록 트래커)

AI(Google Gemini)를 활용하여 자연어 입력만으로 음식 섭취량과 운동량을 자동으로 분석하고 기록하는 스마트 건강 관리 웹 어플리케이션입니다. 

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
npm run start
```

---

## 📦 빌드 및 배포 (Build & Deployment)

### 1. 원격 데이터베이스 설정 (최초 1회)
```bash
# Cloudflare에 D1 데이터베이스 생성
npx wrangler d1 create daily-calorie-db

# 원격 DB에 마이그레이션 적용
npx wrangler d1 migrations apply daily-calorie-db --remote
```

### 2. 비밀키(Secrets) 등록
배포 환경에서는 `.dev.vars` 대신 Wrangler를 통해 비밀키를 등록해야 합니다.
```bash
npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name daily-calorie-log
npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name daily-calorie-log
npx wrangler pages secret put GOOGLE_REDIRECT_URI --project-name daily-calorie-log
npx wrangler pages secret put JWT_SECRET --project-name daily-calorie-log
npx wrangler pages secret put GEMINI_API_KEY --project-name daily-calorie-log
```

### 3. 배포 실행
```bash
npm run build
npx wrangler pages deploy dist --project-name daily-calorie-log
```

---

## 📝 프로젝트 정보 및 면책 조항
- **개발자**: 윤명준 (MJ Yune / (주)유미테크)
- **오픈 소스**: 본 프로젝트는 오픈 소스로 제공되며, 관리자 페이지는 하드코딩된 이메일 계정으로 접근 권한을 제어합니다.
- **정확도**: AI가 분석한 칼로리 데이터는 참고용이며, 실제 영양 정보와 차이가 있을 수 있습니다.

---

### 📅 마스터 릴리즈 노트
- **v1.0 (2026-01-28)**: 초기 릴리즈. AI 분석, 관리자 대시보드, 통계 기능 포함.

