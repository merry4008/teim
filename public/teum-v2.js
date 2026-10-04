/* TEUM 2.0 - home-only enhancement. Data stays in this browser. */
(function () {
  'use strict';
  if (!document.body || document.body.dataset.homeVersion !== '2') return;
  var $ = function (s) { return document.querySelector(s); };
  var timezone = 'Asia/Seoul';
  var today = new Intl.DateTimeFormat('sv-SE', {timeZone: timezone, year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  var month = today.slice(0,7);
  var dailyKey = 'teumV2Daily';
  var bingoKey = 'teumV2Bingo';
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toastTimer;
  function toast(message) { var node = $('#teum2Toast'); if (!node) return; clearTimeout(toastTimer); node.textContent=message; node.hidden=false; node.classList.remove('teum2-toast-out','teum2-toast-in'); void node.offsetWidth; node.classList.add('teum2-toast-in'); toastTimer=setTimeout(function(){node.classList.remove('teum2-toast-in');node.classList.add('teum2-toast-out');toastTimer=setTimeout(function(){node.hidden=true;node.classList.remove('teum2-toast-out');},reducedMotion?0:200);},2600); }
  function animateClass(node,name) { if (!node || reducedMotion) return; node.classList.remove(name); void node.offsetWidth; node.classList.add(name); node.addEventListener('animationend',function clear(e){if(e.target===node){node.classList.remove(name);node.removeEventListener('animationend',clear);}}); }
  function setValueWithUnit(selector,value,unit) { var node=$(selector); node.replaceChildren(document.createTextNode(String(value))); var suffix=document.createElement('small');suffix.textContent=unit;node.appendChild(suffix); }
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key) || 'null'); return v && typeof v === 'object' ? v : fallback; }
    catch (_) { return fallback; }
  }
  function save(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch (_) { return false; } }
  var completedDays = load(dailyKey, {});
  var bingoMonths = load(bingoKey, {});
  if (!Array.isArray(bingoMonths[month]) || bingoMonths[month].length !== 9) bingoMonths[month] = Array(9).fill(false);
  var moods = {
    complex: {title:'생각보다 화면부터 가볍게',text:'지금 열어둔 탭 세 개만 닫아볼까요? 부담 없는 행동 하나부터요.',href:'#quickTeimExperience',cta:'작은 비움 해보기 →'},
    rest: {title:'쉬는 시간을 먼저 만들어봐요',text:'지금은 무리해서 치울 필요 없어요. 좋아하는 음악부터 골라요.',href:'action.html#musicSection',cta:'음악 고르기 →'},
    active: {title:'이 기분으로 하나만 끝내기',text:'눈앞의 작은 공간 하나, 딱 정한 만큼만 가볍게 시작해요.',href:'#quickTeimExperience',cta:'지금 바로 비우기 →'},
    good: {title:'좋은 기분을 기록으로 남겨요',text:'오늘의 작은 비움을 체크하거나 사진 한 장을 기록해봐요.',href:'challenge.html',cta:'기록 보러 가기 →'}
  };
  var moodButtons = Array.prototype.slice.call(document.querySelectorAll('#teum2Moods button'));
  moodButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      moodButtons.forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
      var choice = moods[button.dataset.mood];
      $('#teum2RecommendationTitle').textContent = choice.title;
      $('#teum2RecommendationText').textContent = choice.text;
      $('#teum2RecommendationLink').textContent = choice.cta;
      $('#teum2RecommendationLink').href = choice.href;
      $('#teum2Recommendation').hidden = false;
      animateClass($('#teum2Recommendation'),'teum2-reveal');
      var banner = $('.teum2-hero'); banner.dataset.mood=button.dataset.mood;
      $('#teum2HeroMood').textContent = ({complex:'😵‍💫 생각 많은 날엔, 하나씩 덜어봐요.',rest:'😮‍💨 오늘은 쉬는 것도 트임이에요.',active:'⚡ 그 에너지로 딱 하나만 시작!',good:'😎 좋은 날의 순간도 기록해요.'})[button.dataset.mood];
    });
  });
  var daily = [
    ['가방 속 영수증 한 장 버리기','지금 가진 가방 안에서 더 이상 필요 없는 영수증 한 장만 골라요.'],
    ['열어둔 브라우저 탭 3개 닫기','다시 보지 않을 창만 세 개 정리해봐요.'],
    ['책상 위 컵 한 개 제자리로','책상 전체가 아니라 컵 하나만 옮기면 끝이에요.'],
    ['현관 신발 한 켤레 가지런히','눈에 들어오는 신발 한 켤레만 맞춰주세요.'],
    ['필요 없는 스크린샷 3장 정리','사진첩에서 확실히 필요 없는 것만 지워요.'],
    ['이미 끝난 메모 한 장 떼기','중요 문서는 제외하고 끝난 메모 한 장만 처리해요.'],
    ['침대 위 옷 한 벌 치우기','내 옷 한 벌만 원래 자리에 걸어봐요.']
  ];
  var dayIndex = (Number(today.slice(-2)) - 1) % daily.length;
  var mission = daily[dayIndex];
  $('#teum2Date').textContent = today.slice(5).replace('-', '.') + '.';
  $('#teum2DailyTitle').textContent = mission[0];
  $('#teum2DailyDescription').textContent = mission[1];
  function updateDaily() {
    var done = completedDays[today] === true, button = $('#teum2DailyDone');
    button.setAttribute('aria-pressed', String(done));
    button.textContent = done ? '완료했어요 ✓' : '했어요 ✓';
    $('.teum2-daily').dataset.done=String(done);
    $('#teum2DailyStatus').textContent = done ? '오늘의 작은 틈을 기록했어요. 내일 또 만나요!' : '완료 버튼을 누르면 이 브라우저에 기록됩니다.';
  }
  $('#teum2DailyDone').addEventListener('click', function () {
    var next = !completedDays[today]; completedDays[today] = next;
    if (!save(dailyKey, completedDays)) { completedDays[today]=!next; $('#teum2DailyStatus').textContent = '브라우저 저장이 제한되어 기록을 보존하지 못했어요.'; toast('저장이 제한돼 있어요. 브라우저 설정을 확인해주세요.'); return; }
    updateDaily(); updateArchive();
    if (next) { animateClass($('.teum2-daily'),'teum2-celebrate'); animateClass($('.teum2-stat-grid'),'teum2-stat-bump'); toast('✳ +1 트임! 오늘의 작은 틈이 기록됐어요.'); }
    else toast('오늘의 비움 체크를 취소했어요.');
  });
  var tasks = [
    '가방 속 영수증 정리','열린 탭 3개 닫기','신발 한 켤레 정돈',
    '안 쓰는 앱 알림 끄기','책상 한 뼘 비우기','컵 하나 제자리로',
    '필요 없는 사진 3장','끝난 메모 한 장','내 옷 한 벌 정리'
  ];
  var combinations = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  $('#teum2BingoPeriod').textContent = month.slice(5) + '월';
  function updateBingo() {
    var active = bingoMonths[month], count = active.filter(Boolean).length;
    var lines = combinations.filter(function (line) { return line.every(function (i) { return active[i]; }); }).length;
    $('#teum2BingoCount').textContent = count + ' / 9 칸';
    $('#teum2BingoLines').textContent = '빙고 ' + lines + '줄';
    $('#teum2BingoFill').style.width = (count/9*100) + '%';
    Array.prototype.forEach.call($('#teum2BingoGrid').children, function (button, i) {
      button.setAttribute('aria-pressed', String(Boolean(active[i])));
    });
  }
  tasks.forEach(function (title, index) {
    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    var check = document.createElement('span'); check.className = 'teum2-bingo-check'; check.textContent = '✓'; check.setAttribute('aria-hidden', 'true');
    var text = document.createElement('span'); text.textContent = title;
    button.appendChild(check); button.appendChild(text);
    button.addEventListener('click', function () {
      var previous = combinations.filter(function(line){return line.every(function(i){return bingoMonths[month][i];});}).length;
      bingoMonths[month][index] = !bingoMonths[month][index];
      if (!save(bingoKey,bingoMonths)) { bingoMonths[month][index] = !bingoMonths[month][index]; toast('빙고 저장이 제한돼 있어요.');return; }
      updateBingo(); updateArchive();
      var now = combinations.filter(function(line){return line.every(function(i){return bingoMonths[month][i];});}).length;
      if (bingoMonths[month][index]) { animateClass(button,'teum2-pop'); toast(now>previous?'☀️ 빙고 한 줄 완성!':'✳ 비움 빙고 한 칸을 채웠어요.'); }
      else toast('빙고 체크를 취소했어요.');
    });
    $('#teum2BingoGrid').appendChild(button);
  });
  function updateArchive() {
    var days = Object.keys(completedDays).filter(function (d) { return d.slice(0,7) === month && completedDays[d] === true; }).length;
    var count = bingoMonths[month].filter(Boolean).length;
    var quick = 0;
    try { quick = Math.max(0, Number(localStorage.getItem('teimQuickCount') || 0) || 0); } catch (_) {}
    setValueWithUnit('#teum2MonthDays',days,'일');
    setValueWithUnit('#teum2MonthBingo',count,'칸');
    setValueWithUnit('#teum2QuickCount',quick,'번');
    var elapsed = Number(today.slice(-2));
    var percentage = Math.min(100,Math.round(100*days/elapsed));
    $('#teum2RingPercent').textContent=percentage+'%';
    $('#teum2Ring').setAttribute('aria-label','이번 달 오늘까지 '+elapsed+'일 중 '+days+'일 비움 실천, '+percentage+'퍼센트');
    $('#teum2RingFill').style.strokeDashoffset=String(320.442*(1-percentage/100));
    $('#teum2DashboardTitle').textContent=days===0?'오늘 첫 틈을 만들어볼까요?':days===1?'첫 번째 틈이 생겼어요!':days+'일의 작은 틈이 모였어요.';
    $('#teum2DashboardText').textContent='이번 달 오늘까지 '+elapsed+'일 중 '+days+'일 실천했어요. 작은 행동도 기록으로 남아요.';
  }
  var quickApp = $('#quickTeimApp');
  if (quickApp) quickApp.addEventListener('click', function (event) {
    if (event.target.closest('.quick-complete')) requestAnimationFrame(function(){updateArchive();animateClass($('.teum2-stat-grid'),'teum2-stat-bump');toast('✳ 방금 비운 한 가지도 기록에 더했어요!');});
  });
  function highlightNav() {
    var key = location.hash === '#today' || location.hash === '#quickTeimExperience' ? 'space' : location.hash === '#my-teum' ? 'challenge' : 'home';
    document.querySelectorAll('.bottom-nav a').forEach(function (a) { a.classList.toggle('active', a.dataset.nav === key); if(a.dataset.nav === key) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('hashchange', highlightNav);
  updateDaily(); updateBingo(); updateArchive(); highlightNav();
})();
