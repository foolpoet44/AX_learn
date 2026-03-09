# HR AX 실습 교재 (Lovable)

단일 HTML 파일로 구성된 인터랙티브 실습 교재입니다. 브라우저에서 바로 열어 사용할 수 있습니다.

## 구성
- `index.html`: 메인 페이지 (실습 과제/인터랙션 포함)
- `Lovable_ HR_AX 실습 교재_files/css2`: 외부 폰트(CSS) 참조용 파일

## 사용 방법
1. `index.html` 파일을 브라우저에서 열어 실행합니다.
2. 좌측 과제 목록 또는 상단 과제 카드에서 원하는 과제를 선택합니다.
3. 각 과제의 단계(기획 → 프롬프트 → 수정 → 배포/체험)를 따라 진행합니다.

## 기능 요약
- 7개 과제(1on1 어젠다, 브레인스토머, 팀 감정 온도계, AX 레벨 자가진단, 회의록 액션 추출, 채용 공고 자동 작성, 교육 만족도 분석)
- 단계별 진행 UI 및 진행률 표시
- 샘플 데이터 제공/결과 출력 데모
- 진행 상태 로컬 저장(localStorage)

## 진행 상태 초기화
브라우저 개발자 도구에서 `localStorage`의 `hrax_progress` 키를 삭제하면 진행 상태가 초기화됩니다.

## 오프라인/사내망 주의
`Lovable_ HR_AX 실습 교재_files/css2`는 Google Fonts CDN을 참조합니다. 사내망이나 오프라인 환경에서는 폰트가 기본 폰트로 대체될 수 있습니다.

## 수정/커스터마이징 가이드
- 텍스트/과제 내용 수정: `index.html` 내부의 해당 섹션을 편집
- 스타일 수정: 동일 파일의 `<style>` 영역 수정
- 데이터/로직 수정: 동일 파일의 `<script>` 영역 수정


## Vercel 배포로 현재 단계 확인하기
현재 리포는 정적 파일(`index.html`) 기반이므로 Vercel에 바로 배포해 확인할 수 있습니다.

### 방법 1) Vercel 웹 UI
1. Git 저장소를 Vercel에 Import 합니다.
2. Framework Preset은 `Other`(또는 자동 감지)로 둡니다.
3. Build Command는 비워두고, Output Directory도 기본값(루트) 그대로 둡니다.
4. Deploy 후 발급된 URL에서 과제 동작을 확인합니다.

### 방법 2) Vercel CLI
```bash
npm i -g vercel
vercel
vercel --prod
```

### 포함된 설정
- `vercel.json`을 추가해 `/` 요청이 `index.html`로 매핑되도록 했습니다.
- 현재 구조를 바꾸지 않고도 배포 URL에서 즉시 확인 가능한 상태입니다.

## 라이선스
별도 명시가 없으므로 내부 사용 목적에 맞게 관리하세요.

