const categories={
 love:{no:'01',title:'연애',subtitle:'관계 비움 · 나는 연애에서 무엇을 못 놓을까?'},
 work:{no:'02',title:'직장',subtitle:'일상 비움 · 요즘 일이 나를 얼마나 채우고 있을까?'},
 family:{no:'03',title:'부모·가족',subtitle:'관계 비움 · 가족 앞에서 나는 어떤 사람이 될까?'},
 study:{no:'04',title:'학업',subtitle:'행동 비움 · 나는 왜 해야 할 일을 자꾸 미룰까?'},
 achieve:{no:'05',title:'성취',subtitle:'마음 비움 · 나는 왜 쉬어도 쉰 것 같지 않을까?'},
 all:{no:'06',title:'종합',subtitle:'나에게 필요한 비움 · 나는 지금 어디에서 가장 답답할까?'}
};

const factors={
  E:{name:'감정보관'},D:{name:'결정지연'},P:{name:'완벽압박'},L:{name:'실행방전'},C:{name:'기준부재'},R:{name:'관계마찰'}
};

const questions=[
 {factor:'R',text:'요즘 사람과의 관계 때문에 마음이 복잡한 날이 많다.'},
 {factor:'R',text:'누군가와 관련된 물건이나 기억을 쉽게 놓지 못한다.'},
 {factor:'L',text:'일이나 해야 할 일이 많아 내 공간까지 신경 쓸 여유가 없다.'},
 {factor:'L',text:'자주 머무는 공간을 보면 피곤하다는 생각부터 든다.'},
 {factor:'D',text:'정리해야 한다고 생각하면서도 계속 다음으로 미룬다.'},
 {factor:'D',text:'어디부터 손대야 할지 몰라 시작하지 못할 때가 많다.'},
 {factor:'P',text:'쉬고 있어도 해야 할 일이 떠올라 마음이 편하지 않다.'},
 {factor:'P',text:'다른 사람과 비교하며 스스로를 압박하는 편이다.'},
 {factor:'C',text:'집에서 가장 신경 쓰이는 공간이 분명히 있다.'},
 {factor:'C',text:'회사나 학교에서 내 주변이 복잡하면 집중하기 어렵다.'},
 {factor:'E',text:'물건을 보면 기억이나 감정이 떠올라 쉽게 비우지 못한다.'},
 {factor:'E',text:'지금 쓰지 않아도 언젠가 필요할 것 같아 남겨두는 편이다.'}
];

const typeMap={
  ED:{title:'감정 보류형',desc:'물건에 붙은 기억과 감정이 커서 결정이 늦어지고 보류 물건이 늘어나는 유형입니다.',mission:'추억 물건 5개만 한곳에 모으기',guide:['추억 물건은 바로 버리지 말고 한 박스에만 모으세요.','판단이 어려운 물건은 30일 보류함에 넣으세요.','사진으로 남길 물건과 실물로 남길 물건을 분리하세요.']},
  EC:{title:'추억 분산형',desc:'의미 있는 물건이 곳곳에 흩어져 정리 기준이 흐려지는 유형입니다.',mission:'흩어진 추억 물건 한 종류만 모으기',guide:['추억 물건 전용 구역을 하나만 정하세요.','종류보다 사람·시기 기준으로 먼저 모으세요.','보관함이 넘치면 사진 보관으로 전환하세요.']},
  ER:{title:'가족기억 압박형',desc:'관계가 얽힌 물건을 혼자 결정하기 어려운 유형입니다.',mission:'가족 확인 상자 하나 만들기',guide:['타인의 물건은 대신 버리지 말고 확인 상자를 만드세요.','선물은 고마움과 보관 여부를 분리하세요.','공용 추억함은 크기를 먼저 정하세요.']},
  DP:{title:'완벽 미룸형',desc:'잘 정리하고 싶은 마음이 커서 시작과 결정이 늦어지는 유형입니다.',mission:'서랍 한 칸만 10분 정리하기',guide:['오늘은 완벽한 정리 대신 70% 정리를 목표로 하세요.','공간 전체가 아니라 한 칸만 끝내세요.','정리용품 구매는 정리 후로 미루세요.']},
  DC:{title:'보류상자 증식형',desc:'결정 기준이 부족해 보류 물건이 계속 늘어나는 유형입니다.',mission:'보류함 하나에 날짜 쓰기',guide:['보류함은 하나만 만들고 날짜를 적으세요.','물건마다 버림·보관·이동 중 하나만 선택하세요.','자주 쓰는 물건 10개부터 고정 위치를 만드세요.']},
  DL:{title:'결정방전형',desc:'판단 자체에 에너지가 많이 들어 정리하다 쉽게 지치는 유형입니다.',mission:'같은 종류 물건 10개만 모으기',guide:['버릴지 판단하지 말고 같은 종류끼리 모으세요.','15분 타이머로 선택 시간을 제한하세요.','중요한 결정은 피곤하지 않은 시간에 하세요.']},
  PL:{title:'시작방전형',desc:'크게 마음먹고 시작하려다 에너지 부족으로 중단되기 쉬운 유형입니다.',mission:'눈에 거슬리는 한 지점만 10분 정리하기',guide:['정리 시간을 10분으로 제한하세요.','완료 기준을 눈에 보이는 한 곳으로 낮추세요.','청소와 정리를 같은 날 하지 마세요.']},
  PC:{title:'계획과잉형',desc:'계획은 많은데 실제 물건의 자리 기준이 부족한 유형입니다.',mission:'자주 쓰는 물건 3개의 자리 정하기',guide:['계획표보다 물건 자리 3개를 먼저 정하세요.','분류 이름은 5개 이하로 제한하세요.','정리 전 수납용품 구매를 멈추세요.']},
  LC:{title:'생활동선 붕괴형',desc:'피곤한 생활패턴과 불편한 수납 동선이 겹쳐 정리가 유지되지 않는 유형입니다.',mission:'현관 또는 책상 근처에 임시 바구니 두기',guide:['자주 쓰는 물건은 가장 가까운 곳에 두세요.','뚜껑 있는 수납보다 열린 바구니를 먼저 쓰세요.','퇴근 후 동선에 임시 보관 바구니를 두세요.']},
  LR:{title:'돌봄과부하형',desc:'가족, 아이, 동료의 물건과 역할을 떠안아 정리 에너지가 고갈된 유형입니다.',mission:'사람별 바구니 하나씩 만들기',guide:['사람별 바구니를 먼저 만드세요.','공용공간에는 개인 물건 24시간 규칙을 정하세요.','정리 담당자가 아니라 공간 규칙을 만드는 사람으로 역할을 바꾸세요.']},
  CR:{title:'공동공간 충돌형',desc:'문제는 물건의 양보다 누구의 기준으로 치울 것인가에 가까운 유형입니다.',mission:'공용공간 1곳의 사용 목적 정하기',guide:['공용공간과 개인공간을 먼저 나누세요.','공용공간 규칙은 3개 이하로 정하세요.','상대 물건은 허락 없이 버리지 마세요.']},
  RP:{title:'기준강요 피로형',desc:'정리 방식이 지적이나 통제로 느껴져 피로가 쌓이는 유형입니다.',mission:'정리 대화 문장 하나 바꿔보기',guide:['왜 안 치워?보다 이 공간을 어떻게 쓰고 싶어?로 대화하세요.','각자 개인 구역은 존중하세요.','완벽보다 합의 가능한 상태를 목표로 하세요.']}
};

const fallbackTypes={
  E:{title:'감정보관형',desc:'물건에 붙은 기억과 의미가 커서 쉽게 비우기 어려운 유형입니다.',mission:'추억 물건 5개만 모으기',guide:['추억 물건을 한곳에 모으세요.','실물 보관과 사진 보관을 나누세요.']},
  D:{title:'결정지연형',desc:'버릴지 말지 판단하는 과정에서 에너지를 많이 쓰는 유형입니다.',mission:'보류함 하나 만들기',guide:['보류함은 하나만 만드세요.','판단 시간을 15분으로 제한하세요.']},
  P:{title:'완벽압박형',desc:'잘하고 싶은 마음이 커서 시작이 늦어지는 유형입니다.',mission:'서랍 한 칸만 정리하기',guide:['70%만 해도 된다고 정하세요.','수납용품 구매는 뒤로 미루세요.']},
  L:{title:'실행방전형',desc:'정리 기준보다 체력과 마음의 에너지가 부족한 유형입니다.',mission:'10분만 정리하기',guide:['정리 시간을 짧게 제한하세요.','가장 쉬운 곳부터 시작하세요.']},
  C:{title:'기준부재형',desc:'물건의 자리와 분류 기준이 흐려 정리가 유지되지 않는 유형입니다.',mission:'자주 쓰는 물건 3개 자리 정하기',guide:['물건 자리를 먼저 정하세요.','분류는 단순하게 유지하세요.']},
  R:{title:'관계마찰형',desc:'함께 쓰는 사람과 기준이 달라 공간이 반복해서 무너지는 유형입니다.',mission:'공용공간 규칙 1개 정하기',guide:['개인공간과 공용공간을 나누세요.','상대 물건은 대신 버리지 마세요.']}
};

const page=document.body.dataset.page;
if(page==='home') initHome();
if(page==='test') initTest();

async function initHome(){
  const card=document.querySelector('#todayTeimMission');
  if(!card)return;
  try{
    const res=await fetch('/api/weather-mission?lat=37.5665&lon=126.9780');
    const data=await res.json();
    const m=data.mission;
    const w=data.weather;
    card.innerHTML=`<p class="small-label">TODAY MISSION</p><div class="weather-pill">${w?`${w.weatherText} · ${w.temperature}°C · 습도 ${w.humidity}%`:'기본 미션'}</div><h2>${m.title}</h2><p>${m.emotion}</p><div class="mission-action"><span>${m.tag}</span><strong>${m.action}</strong></div>`;
  }catch(e){
    card.innerHTML=`<p class="small-label">TODAY MISSION</p><div class="weather-pill">기본 미션</div><h2>오늘도 작게 시작할 수 있어요.</h2><p>지금 보이는 작은 행동 하나면 충분합니다.</p><div class="mission-action"><span>기본 정리</span><strong>눈에 가장 먼저 들어오는 물건 5개만 제자리로 돌려놓아 보세요.</strong></div>`;
  }
}

function initTest(){
  const state={category:null,index:0,answers:Array(questions.length).fill(null),result:null};
  const $=s=>document.querySelector(s);
  const selectView=$('#selectView'),quizView=$('#quizView'),resultView=$('#resultView');
  const grid=$('#categoryGrid');
  grid.innerHTML=Object.entries(categories).map(([key,c])=>`<button class="select-card" data-category="${key}" type="button"><span>${c.no}</span><b>${c.title}</b><p>${c.subtitle}</p></button>`).join('');
  const direct=new URLSearchParams(location.search).get('type'); if(direct&&categories[direct]){setTimeout(()=>grid.querySelector(`[data-category="${direct}"]`)?.click(),0);}
  grid.addEventListener('click',e=>{
    const btn=e.target.closest('[data-category]');
    if(!btn)return;
    state.category=btn.dataset.category;
    state.index=0;
    state.answers=Array(questions.length).fill(null);
    localStorage.setItem('teimTestCategory',state.category);
    show('quiz');
    renderQuestion();
  });
  $('#backToSelect').onclick=()=>show('select');
  $('#prevQuestion').onclick=()=>{if(state.index>0){state.index--;renderQuestion();}};
  $('#nextQuestion').onclick=()=>{
    if(state.answers[state.index]===null)return;
    if(state.index<questions.length-1){state.index++;renderQuestion();}else{renderResult();show('result');}
  };
  $('#restartTest').onclick=()=>{show('select');window.scrollTo({top:0,behavior:'smooth'});};
  $('#shareResult').onclick=async()=>{
    const text=`나는 트임 정리방해요인 테스트 결과 ${state.result.code} ${state.result.type.title}! 오늘의 미션: ${state.result.type.mission}`;
    if(navigator.share){await navigator.share({title:'트임 테스트 결과',text,url:location.href});}
    else{await navigator.clipboard.writeText(text);alert('결과가 복사됐어요.');}
  };
  function show(name){
    [selectView,quizView,resultView].forEach(v=>v.classList.remove('active'));
    ({select:selectView,quiz:quizView,result:resultView})[name].classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function renderQuestion(){
    const q=questions[state.index];
    $('#progressText').textContent=`${state.index+1} / ${questions.length}`;
    $('#progressFill').style.width=`${((state.index+1)/questions.length)*100}%`;
    $('#questionFactor').textContent=`${q.factor} ${factors[q.factor].name}`;
    $('#questionText').textContent=q.text;
    const options=[['1','전혀 아니다'],['2','아니다'],['3','보통이다'],['4','그렇다'],['5','매우 그렇다']];
    $('#answerOptions').innerHTML=options.map(([v,label])=>`<button class="answer-btn ${state.answers[state.index]===Number(v)?'active':''}" data-value="${v}" type="button">${label}</button>`).join('');
    $('#nextQuestion').textContent=state.index===questions.length-1?'결과 보기':'다음';
    $('#nextQuestion').disabled=state.answers[state.index]===null;
    $('#prevQuestion').disabled=state.index===0;
  }
  $('#answerOptions').addEventListener('click',e=>{
    const btn=e.target.closest('[data-value]');
    if(!btn)return;
    state.answers[state.index]=Number(btn.dataset.value);
    renderQuestion();
  });
  function renderResult(){
    const scores={E:0,D:0,P:0,L:0,C:0,R:0};
    questions.forEach((q,i)=>scores[q.factor]+=state.answers[i]||0);
    const ranked=Object.entries(scores).map(([k,v])=>({key:k,raw:v,score:Math.round(((v-4)/16)*100)})).sort((a,b)=>b.score-a.score);
    const code=ranked[0].key+ranked[1].key;
    const reverse=ranked[1].key+ranked[0].key;
    const type=typeMap[code]||typeMap[reverse]||fallbackTypes[ranked[0].key];
    state.result={code: typeMap[code]||typeMap[reverse]?code:ranked[0].key,type,ranked};
    $('#resultCode').textContent=state.result.code;
    $('#resultTitle').textContent=type.title;
    $('#resultDesc').textContent=type.desc;
    $('#missionText').textContent=type.mission;
    $('#topFactors').innerHTML=ranked.slice(0,2).map(f=>`<div class="factor-tile"><span>${f.key} ${factors[f.key].name}</span><b>${f.score}점</b></div>`).join('');
    $('#scoreBars').innerHTML=ranked.map(f=>`<div class="score-row"><b>${f.key} ${factors[f.key].name}</b><div class="bar-track"><div class="bar-fill" style="width:${f.score}%"></div></div><span>${f.score}</span></div>`).join('');
    $('#guideList').innerHTML=type.guide.map(g=>`<li>${g}</li>`).join('');
  }
}

if(page==='test'){
 const start=document.querySelector('#startMission'), box=document.querySelector('#timerBox'), timer=document.querySelector('#timerText'), tm=document.querySelector('#timerMission'), done=document.querySelector('#completeMission');
 let remain=600, tick;
 if(start) start.addEventListener('click',()=>{const mission=document.querySelector('#missionText')?.textContent||'눈에 가장 거슬리는 한 곳에서 필요 없는 물건 5개 치우기';tm.textContent=mission;box.hidden=false;start.hidden=true;tick=setInterval(()=>{remain--;timer.textContent=String(Math.floor(remain/60)).padStart(2,'0')+':'+String(remain%60).padStart(2,'0');if(remain<=0){clearInterval(tick);done.click()}},1000)});
 if(done) done.addEventListener('click',()=>{clearInterval(tick);const mission=tm.textContent;const rec=JSON.parse(localStorage.getItem('teimRecords')||'[]');rec.unshift({date:new Date().toISOString(),category:localStorage.getItem('teimTestCategory')||'종합',mission,seconds:600-remain,complete:true});localStorage.setItem('teimRecords',JSON.stringify(rec));box.innerHTML='<div class="completion-card"><b>오늘도 하나 트였습니다.</b><p>'+mission+'</p><small>트임기록에 저장했어요.</small></div>'});
 const fc=document.querySelector('#friendCount');if(fc){const base=24+(new Date().getHours()%9);fc.textContent=base+'명';}
}
