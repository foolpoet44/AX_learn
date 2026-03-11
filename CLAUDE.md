# CLAUDE.md — HR AX 실습 교재 프로젝트 가이드

## 프로젝트 개요

코딩 지식이 없는 HR 담당자를 위한 인터랙티브 실습 교재입니다. 브라우저만 있으면 즉시 실행 가능한 정적 SPA(단일 페이지 애플리케이션)로, Lovable 등 노코드 AI 빌더를 활용한 앱 제작 과정을 단계별로 체험할 수 있습니다.

## 기술 스택

- **HTML5 / Vanilla JavaScript (ES6+)** — 별도 프레임워크 없음
- **순수 CSS3** — CSS Variables 기반 디자인 시스템
- **Web Storage API (localStorage)** — 진행 상태 영속성 관리
- **Vercel** — 정적 파일 호스팅 및 배포

## 디렉토리 구조

```
/
├── index.html          # 메인 엔트리 포인트 (UI 마크업)
├── assets/
│   ├── app.js          # 전역 상태, DOM 조작, 데모 로직
│   └── styles.css      # 반응형 레이아웃, 컴포넌트 스타일
├── scripts/
│   └── smoke-test.js   # Puppeteer 기반 E2E 스모크 테스트
├── package.json
├── eslint.config.js
├── vercel.json
├── PRD.md
├── TECH.md
└── README.md
```

## 개발 명령어

```bash
# 린트 실행
npm run lint

# 코드 포맷팅
npm run format

# 스모크 테스트 실행
npm test
```

## 핵심 아키텍처

### 전역 상태 (`assets/app.js`)
- `state.currentTask` — 현재 활성 과제 식별자 (`'overview'`, `'t1'`~`'t5'`)
- `state.taskSteps` — 과제별 현재 단계(1~4) 딕셔너리
- `state.completedTasks` — 완료된 과제 Set

### 상태 영속성
- `saveProgress()` / `loadProgress()` 함수가 `localStorage` (`hrax_progress` 키)에 JSON으로 직렬화
- 브라우저 재시작 후에도 진행 상태 유지

### 동적 프롬프트 생성 흐름
1. STEP 01(기획) 폼에서 사용자 입력 수집
2. `input` 이벤트 위임으로 실시간 감지
3. 다음 단계 프롬프트 템플릿에 즉시 주입
4. 복사 버튼 클릭 한 번으로 클립보드 전달

### 미니 데모 엔진
- `generateAgenda()`, `showRoleIdeas()` 등 — 실제 AI 호출 없이 정적 데이터로 즉각적인 결과 시뮬레이션

## 5가지 실습 과제

| 과제 | 설명 |
|------|------|
| Task 01 | 1on1 미팅 어젠다 생성기 |
| Task 02 | 역할별 AI 활용 브레인스토머 |
| Task 03 | JD(Job Description) 자동 생성기 |
| Task 04 | 채용 공고 자동 작성기 |
| Task 05 | 신입사원 온보딩 가이드 앱 |

## 수정 가이드

| 수정 대상 | 파일 |
|-----------|------|
| 텍스트/과제 내용 | `index.html` |
| 테마 컬러/디자인 | `assets/styles.css` (`:root` CSS 변수) |
| 데모 결과값/비즈니스 로직 | `assets/app.js` 내 하드코딩된 함수 |

## 배포

```bash
npm install -g vercel
vercel          # 프리뷰 배포
vercel --prod   # 프로덕션 배포
```

## 진행 상태 초기화

브라우저 개발자 도구(F12) → Application → Local Storage → `hrax_progress` 키 삭제 후 새로고침
