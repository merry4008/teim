(function () {
  'use strict';
  var app = document.getElementById('teumBannerApp');
  if (!app) return;
  var missions = {
    desk: {name:'책상',time:'약 1분',title:'책상 위 컵 하나 제자리로',description:'다 쓴 컵 하나를 주방으로 옮겨주세요. 컵이 없다면 펜 하나를 제자리에 놓아도 좋아요.'},
    bed: {name:'침대',time:'약 1분',title:'침대 위 옷 한 벌 정리하기',description:'옷 한 벌만 옷걸이에 걸거나 빨래 바구니에 넣어주세요. 옷이 없다면 이불을 한 번 펴주세요.'},
    living: {name:'거실',time:'약 2분',title:'테이블 위 물건 하나 제자리로',description:'리모컨이나 책 중 하나만 원래 자리에 놓아주세요. 테이블이 비어 있다면 쿠션 하나를 바로 놓아요.'},
    entry: {name:'현관',time:'약 1분',title:'신발 한 켤레 가지런히 놓기',description:'지금 눈에 보이는 내 신발 한 켤레만 맞춰 놓아주세요. 다른 신발까지 정리하지 않아도 괜찮아요.'}
  };
  var selected = null, completed = new Set();
  var get = function (id) { return document.getElementById(id); };
  var choices=get('teumBannerChoices'), result=get('teumBannerResult'), done=get('teumBannerDone');
  function render() {
    var mission=missions[selected], isDone=completed.has(selected);
    get('teumBannerSpace').textContent=mission.name+' 비움';
    get('teumBannerTime').textContent=mission.time+' · 딱 하나만 해요';
    get('teumBannerMission').textContent=mission.title;
    get('teumBannerDescription').textContent=mission.description;
    done.disabled=isDone; done.textContent=isDone?'기록했어요 ✓':'비웠어요 ✓';
    get('teumBannerStatus').textContent=isDone?'이 공간의 비움을 기록했어요. 작은 틈이 하나 생겼네요!':'';
    get('teumBannerRecord').hidden=!isDone;
    choices.hidden=true;result.hidden=false;
    get('teumBannerMission').focus({preventScroll:true});
  }
  app.querySelectorAll('[data-banner-space]').forEach(function(button){
    button.addEventListener('click',function(){
      selected=button.dataset.bannerSpace;
      app.querySelectorAll('[data-banner-space]').forEach(function(b){b.setAttribute('aria-pressed',String(b===button));});
      render();
    });
  });
  get('teumBannerBack').addEventListener('click',function(){
    result.hidden=true;choices.hidden=false;
    app.querySelector('[data-banner-space="'+selected+'"]').focus({preventScroll:true});
  });
  done.addEventListener('click',function(){
    if(!selected||completed.has(selected)) return;
    try {
      var raw=Number(localStorage.getItem('teimQuickCount')||0);
      var count=Number.isFinite(raw)?Math.max(0,Math.floor(raw)):0;
      localStorage.setItem('teimQuickCount',String(count+1));
    } catch (_) {
      get('teumBannerStatus').textContent='브라우저 저장이 제한되어 기록하지 못했어요. 저장 설정을 확인하고 다시 눌러주세요.';
      return;
    }
    completed.add(selected);render();
    window.dispatchEvent(new Event('teum:records-updated'));
  });
})();
