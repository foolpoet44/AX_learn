// ── STATE ──
const state = {
  currentTask: 'overview',
  taskSteps: { t1: 1, t2: 1, t3: 1, t4: 1, t5: 1, t6: 1, t7: 1 },
  completedTasks: new Set(),
  quizAnswers: [],
  currentQ: 0,
  selectedMood: null,
};

// ── PERSIST ──
function saveProgress() {
  try {
    localStorage.setItem(
      'hrax_progress',
      JSON.stringify({
        currentTask: state.currentTask,
        taskSteps: state.taskSteps,
        completedTasks: [...state.completedTasks],
      }),
    );
  } catch (e) { }
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem('hrax_progress') || 'null');
    if (!saved) return;
    if (saved.completedTasks) {
      saved.completedTasks.forEach((task) => {
        state.completedTasks.add(task);
        const navBtn = document.querySelector(`[data-task="${task}"]`);
        if (navBtn) navBtn.classList.add('done');
        const bar = document.getElementById(`p-${task}`);
        if (bar) bar.style.width = '100%';
      });
    }
    if (saved.taskSteps) Object.assign(state.taskSteps, saved.taskSteps);
    const taskToShow = saved.currentTask || 'overview';
    showTask(taskToShow, true);
    if (taskToShow !== 'overview' && saved.taskSteps && saved.taskSteps[taskToShow] > 1) {
      goStep(taskToShow, saved.taskSteps[taskToShow], true);
    }
  } catch (e) { }
}

// ── NAVIGATION ──
function showTask(taskId, skipSave) {
  document.querySelectorAll('.task-selector').forEach((el) => el.classList.remove('active'));
  document.getElementById('view-' + taskId).classList.add('active');
  document.querySelectorAll('.task-btn').forEach((btn) => btn.classList.remove('active'));
  const btn = document.querySelector(`[data-task="${taskId}"]`);
  if (btn) btn.classList.add('active');
  state.currentTask = taskId;
  const mobileNav = document.getElementById('mobileNavSelect');
  if (mobileNav) mobileNav.value = taskId;
  const view = document.getElementById('view-' + taskId);
  requestAnimationFrame(() => {
    const anchor = view ? view.querySelector('.task-header') || view : null;
    if (anchor && anchor.scrollIntoView) {
      anchor.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
  });
  if (!skipSave) saveProgress();
}

function goStep(task, step, skipSave) {
  const total = 4;
  document
    .querySelectorAll(`#view-${task} .step-content`)
    .forEach((el) => el.classList.remove('active'));
  const target = document.getElementById(`${task}-s${step}`);
  if (target) target.classList.add('active');

  document.querySelectorAll(`#flow-${task} .step-pill`).forEach((pill, i) => {
    pill.classList.remove('active', 'done');
    if (i + 1 < step) pill.classList.add('done');
    else if (i + 1 === step) pill.classList.add('active');
  });

  const pct = ((step - 1) / (total - 1)) * 100;
  const bar = document.getElementById(`p-${task}`);
  if (bar) bar.style.width = pct + '%';
  state.taskSteps[task] = step;
  if (!skipSave) saveProgress();
}

function completeTask(task) {
  state.completedTasks.add(task);
  const navBtn = document.querySelector(`[data-task="${task}"]`);
  if (navBtn) navBtn.classList.add('done');
  const badge = document.getElementById(`badge-${task}`);
  if (badge) badge.style.display = 'block';
  const bar = document.getElementById(`p-${task}`);
  if (bar) bar.style.width = '100%';
  saveProgress();
}

// ── INSTRUCTOR GUIDE TOGGLE ──
function toggleIG(header) {
  const body = header.nextElementSibling;
  const arrow = header.querySelector('.instructor-guide-toggle');
  if (!body) return;
  const open = body.classList.toggle('open');
  header.setAttribute('aria-expanded', open ? 'true' : 'false');
  body.setAttribute('aria-hidden', open ? 'false' : 'true');
  if (arrow) arrow.textContent = open ? '▴ 접기' : '▾ 펼치기';
}

// ── CHECKLIST ──
function toggleCheck(li) {
  li.classList.toggle('checked');
  if (li.classList.contains('checked')) li.querySelector('.cb').textContent = '✓';
  else li.querySelector('.cb').textContent = '';
}

// ── COPY PROMPT ──
function copyPrompt(btn, taskId) {
  const text = document.getElementById('prompt-' + taskId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'COPIED!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'COPY';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ── TASK 1: AGENDA GENERATOR ──
function generateAgenda() {
  const name = document.getElementById('t1-name').value || '팀원';
  const issue = document.getElementById('t1-issue').value || '업무 이슈';
  const goal = document.getElementById('t1-goal').value;

  const goalMap = {
    'check-in': [
      '이번 주 전반적으로 어떻게 지냈나요?',
      '요즘 가장 에너지가 넘치는 업무는 무엇인가요?',
    ],
    performance: [
      '최근 성과 중 가장 자랑스러운 것은 무엇인가요?',
      '목표 달성에 어려움이 있다면 어떤 지원이 필요한가요?',
    ],
    growth: ['6개월 후 어떤 역량을 키우고 싶나요?', '지금 가장 배우고 싶은 것은 무엇인가요?'],
    problem: ['현재 가장 큰 장애물은 무엇인가요?', '내가 어떤 방식으로 도움이 되면 좋겠나요?'],
  };

  const qs = goalMap[goal];
  const html = `
    <div style="font-size:13px;color:var(--accent);margin-bottom:16px;font-family:'DM Mono',monospace;">📅 ${name}님과의 1on1 어젠다</div>
    <div style="display:grid;gap:12px;">
      ${[
      {
        t: '🧊 아이스브레이크',
        time: '2분',
        q: `${name}님, 요즘 업무 외에 어떤 것에 관심 가지고 계세요?`,
      },
      {
        t: '📋 업무 현황',
        time: '10분',
        q: `${issue}와 관련해서 현재 어떤 상황인지 말씀해주세요. 진행 중인 것 중 막히는 부분이 있나요?`,
      },
      {
        t: '💬 피드백 & 성장',
        time: '10분',
        q: `${qs[0]}<br><small style="color:var(--muted)">${qs[1]}</small>`,
      },
      {
        t: '✅ 다음 액션',
        time: '3분',
        q: `오늘 대화를 바탕으로 ${name}님이 다음 1주일 안에 할 한 가지 액션을 정해봅시다.`,
      },
    ]
      .map(
        (s) => `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:14px;font-weight:600;">${s.t}</span>
            <span style="font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;">${s.time}</span>
          </div>
          <div style="font-size:13px;color:var(--muted);">${s.q}</div>
        </div>
      `,
      )
      .join('')}
    </div>
  `;
  const out = document.getElementById('t1-output');
  out.innerHTML = html;
  out.classList.add('visible');
}

// ── TASK 2: ROLE IDEAS ──
const roleIdeas = {
  생산기술: [
    { t: '공정 이상 자동 감지', d: '센서 데이터를 AI로 분석해 이상 패턴 사전 감지', l: 'Advanced' },
    { t: '작업 지시서 자동 생성', d: '조건 입력 시 작업 절차서를 AI가 초안 작성', l: 'Medium' },
    { t: '생산성 리포트 자동화', d: '일일 생산 데이터를 요약 보고서로 자동 변환', l: 'Easy' },
    { t: '불량 원인 분석 어시스트', d: '불량 데이터와 공정 파라미터 상관 분석', l: 'Advanced' },
    { t: '기술 문서 검색 AI', d: '방대한 기술 문서를 자연어로 검색', l: 'Easy' },
    { t: '교육 훈련 콘텐츠 생성', d: '신규 공정 투입 시 온보딩 자료 자동 제작', l: 'Medium' },
    { t: '시뮬레이션 결과 해석', d: 'CAE 시뮬레이션 결과를 비전문가 언어로 요약', l: 'Medium' },
    { t: '특허 선행조사 자동화', d: '키워드 기반 특허 검색 및 유사도 분석', l: 'Advanced' },
    { t: '설비 메뉴얼 Q&A 봇', d: '설비 매뉴얼을 학습한 AI에게 질문', l: 'Easy' },
    {
      t: '개선 아이디어 수집 플랫폼',
      d: '현장 개선 제안을 AI가 카테고리화 및 우선순위화',
      l: 'Easy',
    },
  ],
  품질관리: [
    { t: '외관 불량 자동 검사', d: '카메라 + Vision AI로 불량품 자동 선별', l: 'Advanced' },
    { t: '검사 성적서 자동 생성', d: '측정 데이터 입력 시 성적서 자동 완성', l: 'Easy' },
    { t: '고객 클레임 패턴 분석', d: '누적 클레임 데이터에서 반복 패턴 추출', l: 'Medium' },
    { t: 'SPC 이상 신호 알림', d: '관리도 이상 신호를 AI가 자동 분류 및 알림', l: 'Medium' },
    { t: '규격서 변경 영향 분석', d: '규격 변경 시 영향 받는 공정 자동 파악', l: 'Advanced' },
    { t: '불량률 예측 모델', d: '과거 데이터 기반 다음 달 불량률 예측', l: 'Advanced' },
    { t: '검사 기준서 자동 번역', d: '글로벌 납품용 품질 문서 다국어 자동 번역', l: 'Easy' },
    { t: '측정 데이터 이상값 탐지', d: '수기 입력 데이터의 오류 자동 플래깅', l: 'Easy' },
    { t: '공급업체 품질 리포트', d: '협력사별 품질 트렌드 자동 분석 및 보고', l: 'Medium' },
    { t: '품질 교육 퀴즈 생성', d: '품질 매뉴얼 기반 교육 테스트 자동 출제', l: 'Easy' },
  ],
  '설비/유지보수': [
    { t: '예지보전 알고리즘', d: '진동/온도 데이터로 고장 시점 사전 예측', l: 'Advanced' },
    { t: '고장 원인 진단 봇', d: '증상 입력 시 원인 후보 및 해결책 제시', l: 'Medium' },
    { t: '정비 이력 자동 정리', d: '정비 완료 후 보고서를 자동 구조화', l: 'Easy' },
    { t: '부품 재고 최적화', d: '소모품 교체 주기 기반 자동 발주 추천', l: 'Medium' },
    { t: '설비 가동률 대시보드', d: 'OEE 데이터를 실시간 시각화', l: 'Easy' },
    { t: '작업자 안전 체크 AI', d: '정비 전 안전 수칙 체크리스트 AI 생성', l: 'Easy' },
    { t: '설비 도면 검색 시스템', d: '자연어로 설비 도면 및 사양 검색', l: 'Medium' },
    { t: '에너지 사용 최적화', d: '설비별 전력 소비 패턴 분석 및 절감 제안', l: 'Advanced' },
    { t: '유지보수 일정 자동 수립', d: '생산 계획과 연동한 PM 스케줄 자동화', l: 'Medium' },
    { t: '기술 노하우 디지털화', d: '숙련자 경험을 AI 인터뷰로 구조화 저장', l: 'Advanced' },
  ],
  'HR/교육': [
    { t: '교육 자료 자동 생성', d: '주제 입력 시 슬라이드 초안 및 스크립트 생성', l: 'Easy' },
    { t: '역량 평가 자동 분석', d: '평가 결과 데이터를 패턴 분석하여 인사이트 도출', l: 'Medium' },
    { t: '1on1 어젠다 생성기', d: '팀원 정보 기반 맞춤형 미팅 어젠다 자동 생성', l: 'Easy' },
    { t: 'AX 역량 자가진단', d: '5문항으로 AI 활용 레벨 즉시 판정', l: 'Easy' },
    { t: '채용 공고 최적화', d: '직무 분석 기반 채용 공고 자동 작성', l: 'Medium' },
    { t: '조직 건강도 분석', d: 'Pulse Check 데이터를 AI가 인사이트로 변환', l: 'Advanced' },
    { t: '교육 수요 조사 분석', d: '수요 조사 응답을 자동 분류 및 우선순위화', l: 'Easy' },
    { t: '인터뷰 질문 생성', d: '직무 및 역량 기반 면접 질문 자동 생성', l: 'Easy' },
    { t: '교육 효과 예측 모델', d: '수강 이력 기반 과정 추천 및 효과 예측', l: 'Advanced' },
    { t: 'HR 리포트 자동화', d: '주요 HR 지표를 자동 집계하여 경영진 보고', l: 'Medium' },
  ],
  '구매/조달': [
    { t: '견적서 자동 비교 분석', d: '다수 업체 견적을 AI가 항목별 비교 정리', l: 'Easy' },
    { t: '계약서 리스크 탐지', d: '계약서 텍스트에서 불리한 조항 자동 하이라이트', l: 'Advanced' },
    { t: '공급업체 평가 자동화', d: '납기/품질/가격 데이터 기반 자동 스코어링', l: 'Medium' },
    { t: '발주 수요 예측', d: '과거 구매 이력으로 다음 분기 소요량 예측', l: 'Advanced' },
    { t: '구매 요청서 자동 작성', d: '품목 코드 입력 시 구매 요청서 자동 완성', l: 'Easy' },
    { t: '시장 가격 모니터링', d: '원자재 가격 변동을 자동 수집 및 알림', l: 'Medium' },
    { t: '납품 지연 예측', d: '공급망 데이터로 납기 리스크 사전 감지', l: 'Advanced' },
    { t: '카탈로그 검색 AI', d: '자연어로 구매 가능 품목 검색', l: 'Easy' },
    { t: '협상 자료 자동 생성', d: '업체별 거래 이력 분석 기반 협상 브리핑', l: 'Medium' },
    { t: 'ESG 공급망 평가', d: '협력사 ESG 정보를 수집·분석하여 위험 평가', l: 'Advanced' },
  ],
  연구개발: [
    { t: '논문·특허 자동 요약', d: '최신 논문/특허를 AI가 핵심만 추출해 요약', l: 'Easy' },
    {
      t: '실험 데이터 패턴 분석',
      d: '대규모 실험 결과에서 유의미한 패턴 자동 발굴',
      l: 'Advanced',
    },
    { t: '선행기술 조사 자동화', d: '키워드 기반 특허·논문 검색 및 유사도 분석', l: 'Medium' },
    { t: '연구 제안서 초안 생성', d: '연구 배경·목적·방법론 구조에 맞춰 초안 작성', l: 'Easy' },
    { t: '실험 설계 아이디어 도출', d: '연구 목적 입력 시 가설·변수 설계 제안', l: 'Medium' },
    { t: '다국어 기술 문서 번역', d: '영문 기술 문서를 한국어로 정확하게 자동 번역', l: 'Easy' },
    { t: '데이터 시각화 자동 생성', d: '실험 결과 데이터를 그래프·차트로 즉시 변환', l: 'Easy' },
    {
      t: '경쟁사 기술 동향 모니터링',
      d: '웹·논문 데이터 기반 경쟁사 R&D 트렌드 추적',
      l: 'Advanced',
    },
    { t: '연구 진행 보고서 자동화', d: '실험 기록을 기반으로 주간 진행 보고서 생성', l: 'Medium' },
    { t: '아이디어 유효성 검토 AI', d: '신규 아이디어의 기술적 실현 가능성 1차 검토', l: 'Medium' },
  ],
  안전관리: [
    { t: '위험성 평가 자동 작성', d: '작업 조건 입력 시 위험 요인·대책 자동 작성', l: 'Medium' },
    { t: '사고 사례 분석 AI', d: '과거 사고 데이터에서 원인 패턴 및 예방책 추출', l: 'Advanced' },
    { t: '안전 교육 콘텐츠 생성', d: '직무별 맞춤 안전 교육 자료 자동 제작', l: 'Easy' },
    { t: '안전 점검표 자동 생성', d: '설비·공정 정보 기반 점검 체크리스트 자동화', l: 'Easy' },
    { t: '아차사고 패턴 탐지', d: '아차사고 보고 데이터에서 재발 위험 패턴 도출', l: 'Advanced' },
    { t: '법규 준수 여부 자동 확인', d: '산업안전보건법 기준 자동 비교 검토', l: 'Medium' },
    { t: '응급 대응 가이드 AI', d: '사고 유형 입력 시 즉각 대응 절차 안내', l: 'Easy' },
    {
      t: 'CCTV 이상 행동 감지',
      d: 'Vision AI로 안전모 미착용·위험 행동 실시간 감지',
      l: 'Advanced',
    },
    { t: '안전 개선 제안 수집', d: '현장 제안을 AI가 카테고리화 및 우선순위화', l: 'Easy' },
    {
      t: '유해물질 노출 리스크 분석',
      d: '작업 환경 데이터 기반 건강 위험도 자동 평가',
      l: 'Advanced',
    },
  ],
};

const diffColor = { Easy: '#47ff8a', Medium: '#e8ff47', Advanced: '#ff6b6b' };

function showRoleIdeas(role) {
  const ideas = roleIdeas[role];
  if (!ideas) return;
  document.getElementById('ideas-output').style.display = 'block';
  document.getElementById('ideas-role-label').textContent =
    `${role} — AI 활용 아이디어 ${ideas.length}가지`;
  const grid = document.getElementById('ideas-grid');
  grid.innerHTML = ideas
    .map(
      (i) => `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:14px;transition:all 0.2s;cursor:default;"
         onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="font-size:13px;font-weight:600;margin-bottom:6px;">${i.t}</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:10px;">${i.d}</div>
      <span style="font-size:10px;font-weight:700;color:${diffColor[i.l]};border:1px solid ${diffColor[i.l]};padding:2px 8px;border-radius:2px;font-family:'DM Mono',monospace;">${i.l}</span>
    </div>
  `,
    )
    .join('');
}

// ── TASK 3: MOOD ──
function selectMood(btn, emoji) {
  document.querySelectorAll('#moodPicker .eval-item').forEach((b) => {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('selected');
  btn.setAttribute('aria-pressed', 'true');
  state.selectedMood = emoji;
}

function submitMood() {
  if (!state.selectedMood) {
    alert('이모지를 선택해주세요!');
    return;
  }
  const comment = document.getElementById('mood-comment').value;
  const moodLabel = {
    '😄': '최고에요',
    '🙂': '괜찮아요',
    '😐': '보통이에요',
    '😔': '힘들어요',
    '😤': '스트레스받아요',
  };
  const out = document.getElementById('mood-output');
  out.innerHTML = `
    <div style="text-align:center;padding:16px 0;">
      <div style="font-size:48px;margin-bottom:12px;">${state.selectedMood}</div>
      <div style="font-size:16px;font-weight:600;margin-bottom:8px;">"${moodLabel[state.selectedMood]}"</div>
      ${comment ? `<div style="font-size:13px;color:var(--muted);margin-bottom:16px;">"${comment}"</div>` : ''}
      <div style="font-size:13px;color:var(--accent);">✓ 익명으로 제출되었습니다</div>
      <hr style="border-color:var(--border);margin:20px 0;">
      <div style="font-size:12px;color:var(--muted);text-align:left;margin-bottom:8px;">오늘 팀 감정 분포 (데모)</div>
      <div style="display:flex;gap:8px;align-items:flex-end;height:60px;margin-bottom:8px;">
        ${[
      ['😄', 65],
      ['🙂', 20],
      ['😐', 10],
      ['😔', 3],
      ['😤', 2],
    ]
      .map(
        ([e, v]) => `
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;">
            <div style="font-size:9px;color:var(--muted);">${v}%</div>
            <div style="width:100%;background:var(--accent);border-radius:2px 2px 0 0;height:${v * 0.55}px;opacity:0.7;transition:height 0.5s;"></div>
            <div style="font-size:16px;">${e}</div>
          </div>
        `,
      )
      .join('')}
      </div>
    </div>
  `;
  out.classList.add('visible');
}

// ── TASK 4: JD GENERATOR ──
function generateJobDescription() {
  const role = document.getElementById('t4-p-role').value || '직무 미입력';
  const skills = document.getElementById('t4-p-skills').value || '핵심 역량 미입력';
  const career = document.getElementById('t4-career').value;
  const skillList = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const out = document.getElementById('t4-output');
  out.innerHTML = `
    <div style="font-size:12px;color:var(--accent);margin-bottom:16px;font-family:'DM Mono',monospace;">📄 ${role} 채용 JD 초안</div>
    <div style="display:grid;gap:14px;">
      ${[
      {
        title: '포지션 개요',
        content: `저희 팀은 비즈니스 성장을 이끌어갈 전문성 있는 <strong style="color:var(--text)">${role}</strong> 포지션을 모집합니다. 본 포지션은 팀 내 핵심 역할을 수행하며, 주어진 목표를 달성하기 위해 주도적으로 업무를 리드합니다.`,
      },
      {
        title: '담당 업무',
        content:
          skillList.map((s) => `• ${s} 관련 전략 수립 및 실행`).join('<br>') +
          '<br>• 유관 부서와의 긴밀한 커뮤니케이션 및 협업<br>• 성과 지표(KPI) 및 데이터 기반 인사이트 도출',
      },
      {
        title: '자격 요건',
        content: `• 해당 직무 경력 ${career}<br>• ${skillList[0] || '관련 분야'} 실무 경험 2년 이상<br>• 논리적 사고 및 문제 해결 능력<br>• 원활한 대내외 커뮤니케이션 능력`,
      },
      {
        title: '우대사항',
        content: '• 관련 산업군(IT/스타트업) 경험자<br>• 업무 자동화 및 AI 툴(ChatGPT 등) 활용 능통자<br>• 자기주도적 학습 및 성장 지향적인 분',
      },
    ]
      .map(
        (s) => `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:16px;">
          <div style="font-size:11px;color:var(--accent);font-family:'DM Mono',monospace;margin-bottom:8px;">${s.title}</div>
          <div style="font-size:13px;color:var(--muted);line-height:1.8;">${s.content}</div>
        </div>
      `,
      )
      .join('')}
    </div>
  `;
  out.classList.add('visible');
}

// ── TASK 5: MINUTES ──
const sampleMinutes = `[2026년 3월 6일 AX 추진팀 주간 미팅]
참석: 김팀장, 이대리, 박사원, 최주임

1. Vibe-Coding 교육 커리큘럼 관련
- 이대리가 3월 14일까지 1차 초안 작성 예정
- 박사원은 Lovable 실습 예제 5개 이번 주 금요일까지 준비
- 최주임이 수강 신청 시스템 연동 여부 다음 주 수요일까지 확인

2. Pulse Check 시스템
- 김팀장이 3월 말까지 경영진 보고 자료 준비
- 이대리가 설문 문항 초안 검토 후 이번 주 중 공유

3. 기타
- 팀 전체 AI 툴 체험 세션 일정 미정 (담당자 미정)`;

function loadSampleMinutes() {
  document.getElementById('minutes-input').value = sampleMinutes;
}

function extractActions() {
  const text = document.getElementById('minutes-input').value;
  if (!text.trim()) {
    alert('회의록을 입력해주세요.');
    return;
  }

  const actions = [];
  const lines = text.split('\n');

  // 소제목 패턴: "1.", "2.", "1)", "가.", "[..." 등으로 시작하는 섹션 제목
  const isSectionHeading = (s) =>
    /^\d+[\.\)]\s+\S/.test(s) || // 숫자 소제목 (예: "1. 주제")
    /^[가-힣]+[\.\)]\s/.test(s) || // 한글 소제목 (예: "가. 주제")
    s.startsWith('[') || // [날짜/회의명]
    /^참석/.test(s) || // 참석자 라인
    s.length < 6; // 너무 짧은 라인 (빈 제목 등)

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || isSectionHeading(trimmed)) return;

    // 액션아이템 키워드가 없으면 스킵
    const actionKeywords = [
      '예정',
      '준비',
      '작성',
      '확인',
      '공유',
      '검토',
      '진행',
      '완료',
      '보고',
      '수립',
      '제출',
    ];
    if (!actionKeywords.some((k) => trimmed.includes(k))) return;

    let assignee = '미정';
    let task = trimmed.replace(/^[-\*]\s*/, ''); // 불릿 기호 제거
    let due = '미정';
    let priority = 'Medium';

    // 담당자 추출: "- 이대리가", "김팀장이" 등
    const personMatch = trimmed.match(
      /([가-힣]{2,4})(팀장|대리|사원|주임|과장|차장|부장|책임|수석)?(?=이|가)/,
    );
    if (personMatch) assignee = personMatch[1] + (personMatch[2] || '');

    // 기한 추출
    const dueMatch = trimmed.match(
      /(\d+월\s*\d+일|이번\s*주\s*[가-힣]+요일?|다음\s*주\s*[가-힣]+요일?|[가-힣]+\s*말|[가-힣]+\s*중|[가-힣]+\s*까지)/,
    );
    if (dueMatch) due = dueMatch[0];

    // 우선순위 판단
    if (
      trimmed.includes('경영진') ||
      trimmed.includes('보고') ||
      trimmed.includes('즉시') ||
      trimmed.includes('긴급')
    )
      priority = 'High';
    else if (trimmed.includes('미정') || trimmed.includes('검토')) priority = 'Low';

    actions.push({ task: task.substring(0, 60), assignee, due, priority });
  });

  if (actions.length === 0) {
    actions.push({
      task: '자동 추출 결과 없음 — 샘플 데이터를 사용해보세요',
      assignee: '미정',
      due: '미정',
      priority: 'Low',
    });
  }

  const pColor = { High: '#ff6b6b', Medium: '#e8ff47', Low: '#47ff8a' };
  const out = document.getElementById('minutes-output');
  out.innerHTML = `
    <div style="font-size:12px;color:var(--accent);margin-bottom:12px;font-family:'DM Mono',monospace;">✓ 액션아이템 ${actions.length}개 추출</div>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="border-bottom:1px solid var(--border);">
            <th style="text-align:left;padding:8px 12px;color:var(--muted);font-weight:600;">할 일</th>
            <th style="text-align:left;padding:8px 12px;color:var(--muted);font-weight:600;">담당자</th>
            <th style="text-align:left;padding:8px 12px;color:var(--muted);font-weight:600;">기한</th>
            <th style="text-align:left;padding:8px 12px;color:var(--muted);font-weight:600;">우선순위</th>
          </tr>
        </thead>
        <tbody>
          ${actions
      .map(
        (a) => `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:10px 12px;">${a.task}</td>
              <td style="padding:10px 12px;${a.assignee === '미정' ? 'color:#ff6b6b' : ''}">${a.assignee}</td>
              <td style="padding:10px 12px;color:var(--muted);">${a.due}</td>
              <td style="padding:10px 12px;"><span style="font-size:11px;font-weight:700;color:${pColor[a.priority]};border:1px solid ${pColor[a.priority]};padding:2px 8px;border-radius:2px;font-family:'DM Mono',monospace;">${a.priority}</span></td>
            </tr>
          `,
      )
      .join('')}
        </tbody>
      </table>
    </div>
  `;
  out.classList.add('visible');
}

// ── TASK 6: JOB POSTING ──
function generateJobPosting() {
  const role = document.getElementById('t6-role').value || '미입력 직무';
  const skills = document.getElementById('t6-skills').value || '커뮤니케이션, 문제 해결, 협업';
  const career = document.getElementById('t6-career').value;
  const skillList = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const out = document.getElementById('t6-output');
  out.innerHTML = `
    <div style="font-size:12px;color:var(--accent);margin-bottom:16px;font-family:'DM Mono',monospace;">📄 ${role} 채용 공고 초안</div>
    <div style="display:grid;gap:14px;">
      ${[
      {
        title: '포지션 개요',
        content: `저희 팀은 <strong style="color:var(--text)">${role}</strong>를 모집합니다. ${skillList.slice(0, 2).join('과 ')} 역량을 갖추고, 빠르게 변화하는 환경에서 주도적으로 성장할 인재를 찾습니다. 함께 더 나은 조직을 만들어갈 분을 기다립니다.`,
      },
      {
        title: '담당 업무',
        content:
          skillList.map((s) => `• ${s} 관련 업무 기획 및 실행`).join('<br>') +
          '<br>• 유관 부서와의 협업 및 프로젝트 관리<br>• 결과 분석 및 개선 방향 도출',
      },
      {
        title: '자격 요건',
        content: `• 경력 ${career}<br>• ${skillList[0] || '관련 분야'} 실무 경험 보유자<br>• 데이터 기반 의사결정 가능자<br>• 원활한 대내외 커뮤니케이션 능력<br>• 주도적이고 책임감 있는 업무 태도`,
      },
      {
        title: '우대사항',
        content: `• ${skillList[1] || '관련 자격증'} 경험자<br>• AI/자동화 도구 활용 경험자<br>• 관련 프로젝트 성과 보유자`,
      },
    ]
      .map(
        (s) => `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:16px;">
          <div style="font-size:11px;color:var(--accent);font-family:'DM Mono',monospace;margin-bottom:8px;">${s.title}</div>
          <div style="font-size:13px;color:var(--muted);line-height:1.8;">${s.content}</div>
        </div>
      `,
      )
      .join('')}
    </div>
  `;
  out.classList.add('visible');
}

// ── TASK 7: ONBOARDING GUIDE ──
function generateOnboardingGuide() {
  const name = document.getElementById('t7-p-name').value || '신규 입사자';
  const role = document.getElementById('t7-p-role').value || '직무 미상';
  const teamInfo = document.getElementById('t7-p-team').value || '우리 팀에 오신 것을 환영합니다.';
  const startDate = document.getElementById('t7-start-date').value || '출근 예정일';

  const out = document.getElementById('t7-output');
  out.innerHTML = `
    <div style="font-size:12px;color:var(--accent);margin-bottom:16px;font-family:'DM Mono',monospace;">🌱 ${name}님 맞춤형 온보딩 가이드</div>
    <div style="display:grid;gap:14px;">
      ${[
      {
        title: '🎉 환영 메시지',
        content: `안녕하세요, <strong style="color:var(--text)">${name}</strong>님! ${role} 포지션으로 우리 팀에 합류하신 것을 진심으로 환영합니다. ${startDate}부터 함께하게 되어 기쁩니다.`,
      },
      {
        title: '📋 첫 주 할 일',
        content:
          '• 인사팀 신규 입사자 오리엔테이션 참석<br>• 업무 계정 세팅 및 보안 서약서 작성<br>• 온보딩 버디(Buddy)와의 점심 식사<br>• 사내 위키 및 팀 내 컨플루언스 문서 열람 권한 확인<br>• 개발/디자인/기획 팀별 초기 환경 구축(Set-up)',
      },
      {
        title: '👨‍👩‍👧‍👦 팀 소개',
        content: `${teamInfo}<br><br>우리 팀은 수평적이고 자유로운 의견 교환을 중시합니다. 메신저 채널의 #team-general 에 가입해서 인사말을 남겨주시면 모두가 반겨줄거에요!`,
      },
      {
        title: '🔗 유용한 링크 서랍',
        content: '• <a href="#" style="color:var(--accent2)">사내 인트라넷 (포털)</a><br>• <a href="#" style="color:var(--accent2)">복리후생 및 휴가 규정 안내서</a><br>• <a href="#" style="color:var(--accent2)">IT 헬프데스크 및 장비 신청</a>',
      },
    ]
      .map(
        (s) => `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:16px;">
          <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:8px;">${s.title}</div>
          <div style="font-size:13px;color:var(--muted);line-height:1.8;">${s.content}</div>
        </div>
      `,
      )
      .join('')}
    </div>
  `;
  out.classList.add('visible');
}

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-task]').forEach((btn) => {
    btn.addEventListener('click', () => showTask(btn.dataset.task));
  });

  document.querySelectorAll('.output-area').forEach((el) => {
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
  });

  document.querySelectorAll('.overview-card').forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    const title = card.querySelector('.card-title');
    if (title) card.setAttribute('aria-label', title.innerText.replace(/\s+/g, ' ').trim());
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  document.querySelectorAll('#moodPicker .eval-item').forEach((btn) => {
    btn.setAttribute('aria-pressed', 'false');
  });

  document.querySelectorAll('.instructor-guide-header').forEach((header, idx) => {
    const body = header.nextElementSibling;
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');
    if (body) {
      if (!body.id) body.id = 'ig-' + (idx + 1);
      body.setAttribute('aria-hidden', 'true');
      header.setAttribute('aria-controls', body.id);
    }
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleIG(header);
      }
    });
  });

  loadProgress();
  const mobileNav = document.getElementById('mobileNavSelect');
  if (mobileNav) mobileNav.value = state.currentTask;

  // ── DYNAMIC PROMPT BUILDER: TASK 01 ──
  const mapPrompt = (taskId, inputKeys) => {
    const updatePrompt = () => {
      inputKeys.forEach(key => {
        const inputEl = document.getElementById(`t${taskId}-p-${key}`);
        const dispEl = document.getElementById(`t${taskId}-disp-${key}`);
        if (inputEl && dispEl) {
          dispEl.textContent = inputEl.value;
        }
      });
    };

    inputKeys.forEach(key => {
      const inputEl = document.getElementById(`t${taskId}-p-${key}`);
      if (inputEl) {
        inputEl.addEventListener('input', updatePrompt);
      }
    });
  };

  mapPrompt(1, ['input', 'output', 'user', 'value']);
  mapPrompt(4, ['role', 'team', 'skills']);
  mapPrompt(7, ['name', 'role', 'team']);
});
