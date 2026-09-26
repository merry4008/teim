const categories = {
  self: { no: '01', title: '나', subtitle: '혼자 쓰는 공간을 정리하고 싶을 때', desc: '내 생활패턴과 마음의 에너지를 기준으로 정리방해요인을 확인합니다.' },
  couple: { no: '02', title: '연인·부부', subtitle: '함께 사는 공간의 기준이 다를 때', desc: '정리 기준 차이와 관계 갈등이 공간에 미치는 영향을 확인합니다.' },
  family: { no: '03', title: '가족', subtitle: '가족 물건과 공용공간이 부담될 때', desc: '역할 부담, 가족 기준, 공용공간 스트레스를 함께 살펴봅니다.' },
  child: { no: '04', title: '아이', subtitle: '아이 물건이 계속 늘어날 때', desc: '장난감, 작품, 옷, 추억 물품을 어떻게 다룰지 확인합니다.' },
  team: { no: '05', title: '직장·팀', subtitle: '일하는 공간이 자꾸 무너질 때', desc: '책상, 자료, 공유공간, 업무 과부하와 정리의 관계를 확인합니다.' }
};

const factors = {
  E: { name: '감정보관', desc: '물건에 감정과 기억이 많이 붙는 요인' },
  D: { name: '결정지연', desc: '버릴지 말지 판단이 오래 걸리는 요인' },
  P: { name: '완벽압박', desc: '제대로 해야 한다는 압박으로 시작이 늦어지는 요인' },
  L: { name: '실행방전', desc: '체력, 시간, 정서적 에너지가 부족한 요인' },
  C: { name: '기준부재', desc: '물건의 자리와 분류 기준이 흐린 요인' },
  R: { name: '관계마찰', desc: '함께 쓰는 사람과 정리 기준이 다른 요인' }
};

const baseQuestions = [
  { factor: 'E', text: '물건을 보면 사람, 시기, 기억이 떠올라 쉽게 정리하지 못한다.' },
  { factor: 'E', text: '지금 쓰지 않는 물건도 버리면 그때의 마음까지 사라질 것 같다.' },
  { factor: 'E', text: '선물, 사진, 작품, 기념품은 필요 없어도 남겨두는 편이다.' },
  { factor: 'E', text: '물건을 버리는 일이 누군가에게 미안한 일처럼 느껴질 때가 있다.' },
  { factor: 'D', text: '버릴지 말지 판단하다가 지쳐서 그대로 둔 적이 많다.' },
  { factor: 'D', text: '정리하다 보면 “일단 보류” 물건이 계속 늘어난다.' },
  { factor: 'D', text: '확신이 들지 않으면 결정을 다음으로 미루는 편이다.' },
  { factor: 'D', text: '정리 기준을 정하려다가 오히려 선택지가 많아져 멈춘다.' },
  { factor: 'P', text: '정리를 시작하면 한 번에 완벽하게 끝내야 마음이 편하다.' },
  { factor: 'P', text: '제대로 할 시간이 없으면 아예 시작하지 않는 편이다.' },
  { factor: 'P', text: '정리용품이나 계획이 준비되지 않으면 시작하기 어렵다.' },
  { factor: 'P', text: '정리 중간에 더 어질러지는 과정이 싫어서 시작이 부담스럽다.' },
  { factor: 'L', text: '정리해야 한다는 건 알지만 몸이 너무 지쳐 움직이기 어렵다.' },
  { factor: 'L', text: '하루 일과가 끝나면 집 상태를 봐도 손댈 힘이 없다.' },
  { factor: 'L', text: '정리를 못 하는 가장 큰 이유는 기준보다 에너지 부족에 가깝다.' },
  { factor: 'L', text: '한 번 치워도 유지할 체력이 없어서 다시 무너진다.' },
  { factor: 'C', text: '물건마다 정확한 자리가 정해져 있지 않다.' },
  { factor: 'C', text: '같은 종류의 물건이 여러 곳에 흩어져 있다.' },
  { factor: 'C', text: '수납공간은 있는데 어떻게 나눠야 할지 모르겠다.' },
  { factor: 'C', text: '치워도 며칠 지나면 다시 원래대로 돌아간다.' },
  { factor: 'R', text: '함께 쓰는 사람이 정리하지 않아 스트레스를 받는다.' },
  { factor: 'R', text: '버리자고 말하면 갈등이 생길까 봐 그냥 둔다.' },
  { factor: 'R', text: '정리에 대해 지적받으면 반발심이 들거나 위축된다.' },
  { factor: 'R', text: '내 방식과 상대방의 방식이 달라 정리가 오래 유지되지 않는다.' }
];

const categoryTone = {
  self: '내 공간에서',
  couple: '우리 둘의 공간에서',
  family: '가족이 함께 쓰는 공간에서',
  child: '아이와 함께 사는 집에서',
  team: '일하는 공간에서'
};

const typeMap = {
  ED: { title: '감정 보류형', desc: '물건 자체보다 물건에 붙은 기억과 감정이 커서, 결정이 늦어지고 보류 물건이 늘어나는 유형입니다.', guide: ['추억 물건은 바로 버리지 말고 한 박스에만 모으세요.', '판단이 어려운 물건은 30일 보류함에 날짜를 적어 넣으세요.', '사진으로 남길 물건과 실물로 남길 물건을 분리하세요.'], mission: '추억 물건 5개만 한곳에 모으기' },
  EC: { title: '추억 분산형', desc: '의미 있는 물건들이 집안 곳곳에 흩어져 있어 정리 기준이 흐려지는 유형입니다.', guide: ['추억 물건 전용 구역을 하나만 정하세요.', '종류보다 사람·시기 기준으로 먼저 모으세요.', '보관함이 넘치면 사진 보관으로 전환하세요.'], mission: '흩어진 추억 물건 한 종류만 모으기' },
  ER: { title: '가족기억 압박형', desc: '선물, 가족 물건, 아이 물건처럼 관계가 얽힌 물건을 혼자 결정하기 어려운 유형입니다.', guide: ['타인의 물건은 대신 버리지 말고 확인 상자를 만드세요.', '선물은 고마움과 보관 여부를 분리해 생각하세요.', '공용 추억함은 크기를 먼저 정하세요.'], mission: '가족 확인 상자 하나 만들기' },
  DP: { title: '완벽 미룸형', desc: '잘 정리하고 싶은 마음이 커서 오히려 결정과 시작이 모두 늦어지는 유형입니다.', guide: ['오늘은 완벽한 정리 대신 70% 정리를 목표로 하세요.', '공간 전체가 아니라 한 칸만 끝내세요.', '정리용품 구매는 정리 후로 미루세요.'], mission: '서랍 한 칸만 10분 정리하기' },
  DC: { title: '보류상자 증식형', desc: '결정 기준이 부족해 보류 물건이 계속 늘어나고 정리가 끝나지 않는 유형입니다.', guide: ['보류함은 하나만 만들고 날짜를 적으세요.', '물건마다 버림·보관·이동 중 하나만 선택하세요.', '자주 쓰는 물건 10개부터 고정 위치를 만드세요.'], mission: '보류함 하나에 날짜 쓰기' },
  DL: { title: '결정방전형', desc: '판단 자체에 에너지가 많이 들어 정리하다가 쉽게 지치는 유형입니다.', guide: ['버릴지 판단하지 말고 먼저 같은 종류끼리 모으세요.', '15분 타이머로 선택 시간을 제한하세요.', '중요한 결정은 피곤하지 않은 시간에 하세요.'], mission: '같은 종류 물건 10개만 모으기' },
  PL: { title: '시작방전형', desc: '크게 마음먹고 시작하려다 에너지 부족으로 중단되기 쉬운 유형입니다.', guide: ['정리 시간을 10분으로 제한하세요.', '완료 기준을 “눈에 보이는 한 곳”으로 낮추세요.', '청소와 정리를 같은 날 하지 마세요.'], mission: '가장 눈에 거슬리는 한 지점만 10분 정리하기' },
  PC: { title: '계획과잉형', desc: '정리 계획은 많은데 실제 물건의 자리 기준이 부족해 실행이 늦어지는 유형입니다.', guide: ['계획표보다 물건 자리 3개를 먼저 정하세요.', '분류 이름은 5개 이하로 제한하세요.', '정리 전 수납용품 구매를 멈추세요.'], mission: '자주 쓰는 물건 3개의 자리 정하기' },
  LC: { title: '생활동선 붕괴형', desc: '피곤한 생활패턴과 불편한 수납 동선이 겹쳐 정리가 유지되지 않는 유형입니다.', guide: ['가장 자주 쓰는 물건은 가장 가까운 곳에 두세요.', '뚜껑 있는 수납보다 열린 바구니를 먼저 쓰세요.', '퇴근 후 동선에 임시 보관 바구니를 두세요.'], mission: '현관 또는 책상 근처에 임시 바구니 두기' },
  LR: { title: '돌봄과부하형', desc: '내 물건보다 가족, 아이, 동료의 물건과 역할을 떠안아 정리 에너지가 고갈된 유형입니다.', guide: ['사람별 바구니를 먼저 만드세요.', '공용공간에는 개인 물건 24시간 규칙을 정하세요.', '정리 담당자가 아니라 공간 규칙을 만드는 사람으로 역할을 바꾸세요.'], mission: '사람별 바구니 하나씩 만들기' },
  CR: { title: '공동공간 충돌형', desc: '문제는 물건의 양보다 누구의 기준으로 치울 것인가에 가까운 유형입니다.', guide: ['공용공간과 개인공간을 먼저 나누세요.', '공용공간 규칙은 3개 이하로 정하세요.', '상대 물건은 허락 없이 버리지 마세요.'], mission: '공용공간 1곳의 사용 목적 정하기' },
  RP: { title: '기준강요 피로형', desc: '정리 방식이 지적이나 통제로 느껴져 저항감과 피로감이 쌓이는 유형입니다.', guide: ['“왜 안 치워?”보다 “이 공간을 어떻게 쓰고 싶어?”로 대화하세요.', '정리 기준은 함께 고르고, 각자 개인 구역은 존중하세요.', '완벽한 상태보다 합의 가능한 상태를 목표로 하세요.'], mission: '정리 대화 문장 하나 바꿔보기' }
};

const fallbackTypes = {
  E: { title: '감정보관형', desc: '물건에 붙은 기억과 의미가 커서 쉽게 비우기 어려운 유형입니다.', guide: ['추억 물건을 한곳에 모으세요.', '실물 보관과 사진 보관을 나누세요.', '감정이 큰 물건은 바로 버리지 말고 보류함에 넣으세요.'], mission: '추억 물건 5개 모으기' },
  D: { title: '결정지연형', desc: '버릴지 말지 결정하는 과정에서 에너지를 많이 쓰는 유형입니다.', guide: ['보류함을 하나만 만드세요.', '판단 시간을 15분으로 제한하세요.', '버림보다 분류부터 시작하세요.'], mission: '보류함 하나 만들기' },
  P: { title: '완벽압박형', desc: '완벽하게 하려는 마음이 시작을 어렵게 만드는 유형입니다.', guide: ['10분 정리로 시작하세요.', '한 칸만 끝내세요.', '70%만 해도 성공으로 정하세요.'], mission: '한 칸만 10분 정리하기' },
  L: { title: '실행방전형', desc: '의지보다 에너지 부족이 정리를 막는 유형입니다.', guide: ['동선을 짧게 만드세요.', '열린 바구니를 활용하세요.', '가장 피곤한 시간에는 정리 결정을 피하세요.'], mission: '자주 쓰는 물건 5개 가까이 두기' },
  C: { title: '기준부재형', desc: '물건의 자리와 분류 기준이 없어 정리가 반복해서 무너지는 유형입니다.', guide: ['물건별 자리를 먼저 정하세요.', '같은 종류끼리 모으세요.', '분류 이름을 단순하게 정하세요.'], mission: '물건 3개의 고정 자리 정하기' },
  R: { title: '관계마찰형', desc: '함께 쓰는 사람과 기준이 달라 정리 갈등이 생기는 유형입니다.', guide: ['개인공간과 공용공간을 나누세요.', '상대 물건은 허락 없이 버리지 마세요.', '공용공간 규칙을 3개 이하로 정하세요.'], mission: '공용공간 규칙 하나 정하기' }
};

const categoryGrid = document.getElementById('categoryGrid');
const quizPanel = document.getElementById('quizPanel');
const resultPanel = document.getElementById('resultPanel');
const quizForm = document.getElementById('quizForm');
const quizLabel = document.getElementById('quizLabel');
const quizTitle = document.getElementById('quizTitle');
const quizDesc = document.getElementById('quizDesc');
const submitQuiz = document.getElementById('submitQuiz');
const resetCategory = document.getElementById('resetCategory');
const retryQuiz = document.getElementById('retryQuiz');
const chooseOther = document.getElementById('chooseOther');
let currentCategory = null;

function renderCategories() {
  categoryGrid.innerHTML = Object.entries(categories).map(([key, item]) => `
    <button class="category-card" type="button" data-category="${key}">
      <span>${item.no}</span>
      <div><h3>${item.title}</h3><p>${item.subtitle}</p></div>
    </button>
  `).join('');
}

function makeQuestionText(question) {
  const tone = categoryTone[currentCategory] || '내 공간에서';
  if (currentCategory === 'self') return question.text;
  if (question.factor === 'R') return question.text;
  return `${tone} ${question.text}`;
}

function startQuiz(key) {
  currentCategory = key;
  const category = categories[key];
  quizLabel.textContent = `${category.no} ${category.title} 테스트`;
  quizTitle.textContent = `${category.title} 정리방해요인 테스트`;
  quizDesc.textContent = category.desc;
  resultPanel.hidden = true;
  quizPanel.hidden = false;
  categoryGrid.hidden = true;
  renderQuestions();
  quizPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderQuestions() {
  quizForm.innerHTML = baseQuestions.map((q, index) => `
    <fieldset class="question">
      <div class="question-head"><span class="factor-chip">${q.factor}</span><strong>${index + 1}. ${makeQuestionText(q)}</strong></div>
      <div class="scale">
        ${[1,2,3,4,5].map(value => `
          <label><input type="radio" name="q${index}" value="${value}" data-factor="${q.factor}">${['전혀 아니다','아니다','보통','그렇다','매우 그렇다'][value-1]}</label>
        `).join('')}
      </div>
    </fieldset>
  `).join('');
}

function calculateScores() {
  const raw = { E: 0, D: 0, P: 0, L: 0, C: 0, R: 0 };
  for (let i = 0; i < baseQuestions.length; i++) {
    const selected = quizForm.querySelector(`input[name="q${i}"]:checked`);
    if (!selected) return null;
    raw[selected.dataset.factor] += Number(selected.value);
  }
  const scores = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Math.round(((value - 4) / 16) * 100)]));
  return scores;
}

function getType(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const code = `${sorted[0][0]}${sorted[1][0]}`;
  const reverseCode = `${sorted[1][0]}${sorted[0][0]}`;
  const type = typeMap[code] || typeMap[reverseCode] || fallbackTypes[sorted[0][0]];
  return { code, sorted, type };
}

function showResult() {
  const scores = calculateScores();
  if (!scores) {
    alert('모든 문항에 답변해주세요.');
    return;
  }
  const { code, sorted, type } = getType(scores);
  const category = categories[currentCategory];
  document.getElementById('resultLabel').textContent = `${category.no} ${category.title} 결과 · ${code}`;
  document.getElementById('resultTitle').textContent = `${type.title}`;
  document.getElementById('resultDesc').textContent = type.desc;
  document.getElementById('scoreBars').innerHTML = sorted.map(([key, value]) => `
    <div class="score-row">
      <b>${key} ${factors[key].name}</b>
      <div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div>
      <span>${value}</span>
    </div>
  `).join('');
  document.getElementById('prescriptionList').innerHTML = type.guide.map(item => `<li>${item}</li>`).join('');
  document.getElementById('missionText').textContent = type.mission;
  quizPanel.hidden = true;
  resultPanel.hidden = false;
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function backToCategories() {
  currentCategory = null;
  quizPanel.hidden = true;
  resultPanel.hidden = true;
  categoryGrid.hidden = false;
  document.getElementById('test').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

renderCategories();
categoryGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (button) startQuiz(button.dataset.category);
});
submitQuiz.addEventListener('click', showResult);
resetCategory.addEventListener('click', backToCategories);
chooseOther.addEventListener('click', backToCategories);
retryQuiz.addEventListener('click', () => startQuiz(currentCategory));
