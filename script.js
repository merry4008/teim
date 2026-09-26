const questions = [
  {domain:'연애', en:'LOVE', text:'관계에서 마음이 복잡해지면, 주변 물건이나 공간도 함께 흐트러지는 편인가요?', key:'emotion'},
  {domain:'연애', en:'LOVE', text:'추억이 담긴 물건은 쓰지 않아도 쉽게 버리지 못하는 편인가요?', key:'attachment'},
  {domain:'직장', en:'WORK', text:'할 일이 많아지면 책상 정리보다 눈앞의 업무를 먼저 쌓아두는 편인가요?', key:'overload'},
  {domain:'직장', en:'WORK', text:'정리할 시간을 따로 잡아야 한다고 생각해 시작을 미루는 편인가요?', key:'perfection'},
  {domain:'부모', en:'FAMILY', text:'물건을 버릴 때 “나중에 필요할 수도 있어”라는 생각이 자주 드나요?', key:'security'},
  {domain:'부모', en:'FAMILY', text:'내 물건을 정리하거나 버리는 일에 다른 사람의 의견이 크게 신경 쓰이나요?', key:'emotion'},
  {domain:'학업', en:'STUDY', text:'정리를 시작하면 분류 기준을 세우느라 시간이 오래 걸리는 편인가요?', key:'perfection'},
  {domain:'학업', en:'STUDY', text:'눈앞에 물건이 많이 보이면 집중하기 어렵지만 치우는 것도 벅차게 느껴지나요?', key:'overload'},
  {domain:'성취', en:'ACHIEVEMENT', text:'깔끔하게 끝낼 자신이 없으면 아예 시작하지 않는 편인가요?', key:'perfection'},
  {domain:'성취', en:'ACHIEVEMENT', text:'정리보다 더 중요한 목표가 많다고 느껴 계속 뒤로 미루게 되나요?', key:'overload'}
];

const choices = [
  {label:'전혀 그렇지 않아요', value:0},
  {label:'별로 그렇지 않아요', value:1},
  {label:'조금 그런 편이에요', value:2},
  {label:'매우 그래요', value:3}
];

const results = {
  perfection:{type:'완벽 기준형', title:'잘하려는 마음이 시작을 어렵게 만들 수 있어요.', desc:'정리를 크게 생각할수록 시작 기준이 높아집니다. 완벽한 결과보다 작은 완료를 먼저 만드는 방식이 잘 맞을 수 있어요.', guide:'오늘은 공간 전체가 아니라 “서랍 한 칸”만 정해 10분 안에 끝내보세요. 기준은 예쁘게가 아니라, 다시 찾기 쉽게입니다.'},
  overload:{type:'과부하형', title:'정리할 힘이 없는 게 아니라, 이미 너무 많은 일을 들고 있을 수 있어요.', desc:'할 일과 자극이 겹칠수록 정리는 우선순위에서 밀리기 쉽습니다. 판단해야 할 것을 줄이는 방식이 도움이 될 수 있어요.', guide:'버릴지 말지 오래 고민하지 말고 ①버림 ②제자리 ③보류 세 구역만 만드세요. 오늘은 10개까지만 분류합니다.'},
  attachment:{type:'기억 애착형', title:'물건보다 그 안의 기억을 놓기 어려운 편일 수 있어요.', desc:'의미 있는 물건을 무조건 버리는 것이 답은 아닙니다. 기억과 사용 기능을 분리하면 선택이 조금 쉬워질 수 있어요.', guide:'추억 물건은 별도의 “기억 상자” 하나에만 모아보세요. 상자 크기가 기준이 되어 무엇을 남길지 선택을 도와줍니다.'},
  security:{type:'안전 확보형', title:'혹시 모를 미래를 위해 물건을 남겨두는 편일 수 있어요.', desc:'물건이 많아서라기보다 “없으면 불안할 것 같다”는 생각이 정리 결정을 어렵게 할 수 있습니다.', guide:'“6개월 안에 실제로 쓸 상황이 떠오르는가?”만 묻고, 애매한 것은 보류함에 날짜를 적어 한 달 뒤 다시 판단하세요.'},
  emotion:{type:'감정 연동형', title:'마음이 복잡한 날, 공간도 함께 멈추는 편일 수 있어요.', desc:'컨디션이 낮을 때 정리를 의지로 밀어붙이면 더 지칠 수 있습니다. 정리를 감정 회복의 작은 행동으로 바꿔보세요.', guide:'가장 눈에 띄는 한 면만 비워보세요. 책상 모서리, 침대 옆처럼 시야가 바로 편해지는 곳이 좋습니다.'}
};

let index = 0;
let answers = [];

const $ = (s) => document.querySelector(s);
const startState = $('#test-start');
const questionState = $('#test-question');
const resultState = $('#test-result');

function showState(el){document.querySelectorAll('.test-state').forEach(x=>x.classList.remove('active')); el.classList.add('active');}
function renderQuestion(){
  const q = questions[index];
  $('#question-count').textContent = `${index+1} / ${questions.length}`;
  $('#question-domain').textContent = q.domain;
  $('#question-kicker').textContent = q.en;
  $('#question-text').textContent = q.text;
  $('#progress-fill').style.width = `${((index+1)/questions.length)*100}%`;
  const wrap = $('#answer-grid'); wrap.innerHTML='';
  choices.forEach(c=>{
    const b=document.createElement('button'); b.className='answer-btn'; b.type='button'; b.textContent=c.label;
    b.addEventListener('click',()=>selectAnswer(q.key,c.value)); wrap.appendChild(b);
  });
  $('#prev-question').style.visibility = index === 0 ? 'hidden':'visible';
}
function selectAnswer(key,value){answers[index]={key,value}; if(index<questions.length-1){index++;renderQuestion();}else{showResult();}}
function showResult(){
  const scores={perfection:0,overload:0,attachment:0,security:0,emotion:0};
  answers.forEach(a=>{if(a) scores[a.key]+=a.value});
  const top=Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
  const r=results[top];
  $('#result-type').textContent=r.type; $('#result-title').textContent=r.title; $('#result-desc').textContent=r.desc; $('#result-guide').textContent=r.guide;
  showState(resultState);
}
$('#start-test').addEventListener('click',()=>{index=0;answers=[];renderQuestion();showState(questionState)});
$('#restart-test').addEventListener('click',()=>{index=0;answers=[];showState(startState)});
$('#prev-question').addEventListener('click',()=>{if(index>0){index--;renderQuestion();}});

const menuBtn=$('.menu-btn'), nav=$('#site-nav');
menuBtn.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}));

const io=new IntersectionObserver((entries)=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
window.addEventListener('scroll',()=>document.querySelector('.site-header').classList.toggle('scrolled',window.scrollY>12));
$('#year').textContent=new Date().getFullYear();

$('#share-demo').addEventListener('click',()=>{const t=$('#toast');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)});
