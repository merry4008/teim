/* TEUM POINTS preview v1: local, non-redeemable activity score. Not cash or coupons. */
(function () {
  "use strict";
  if (!document.getElementById("tpPreviewBalance") && !document.getElementById("tpBalance")) return;
  var DAILY=10, BINGO=5, QUICK=10, PHOTO=15;
  function object(key) {
    try {
      var item=JSON.parse(localStorage.getItem(key)||"null");
      return item && typeof item==="object" && !Array.isArray(item) ? item : {};
    } catch (_) { return {}; }
  }
  function validDate(key) { return /^\d{4}-\d{2}-\d{2}$/.test(key); }
  function validMonth(key) { return /^\d{4}-\d{2}$/.test(key); }
  function counts() {
    var today=new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
    var days=object("teumV2Daily"), bingo=object("teumV2Bingo"), quick=object("teumQuickRewardDates"), photos=object("teimChallenge14");
    var d=0,b=0,q=0,p=0;
    Object.keys(days).forEach(function(k){if(validDate(k)&&k<=today&&days[k]===true)d++;});
    Object.keys(bingo).forEach(function(k){if(validMonth(k)&&k<=today.slice(0,7)&&Array.isArray(bingo[k])&&bingo[k].length===9){bingo[k].forEach(function(value){if(value===true)b++;});}});
    Object.keys(quick).forEach(function(k){if(validDate(k)&&k<=today&&quick[k]===true)q++;});
    for(var i=1;i<=14;i++){if(photos[i]&&typeof photos[i].photo==="string"&&photos[i].photo.length>0)p++;}
    return {daily:d, bingo:b, quick:q, photo:p, total:d*DAILY+b*BINGO+q*QUICK+p*PHOTO};
  }
  function set(id,value){var el=document.getElementById(id);if(el)el.textContent=value;}
  function render(){
    var c=counts(), format=function(n){return n.toLocaleString("ko-KR");};
    set("tpPreviewBalance",format(c.total));set("tpBalance",format(c.total));
    set("tpDailyPoints",format(c.daily*DAILY)+" P");set("tpBingoPoints",format(c.bingo*BINGO)+" P");
    set("tpQuickPoints",format(c.quick*QUICK)+" P");set("tpPhotoPoints",format(c.photo*PHOTO)+" P");
    set("tpPreviewHint",c.total?"작은 비움의 기록이 포인트로 쌓이고 있어요.":"첫 비움을 완료하면 체험 포인트가 표시돼요.");
    set("tpStatus",c.total?"총 "+format(c.daily+c.bingo+c.quick+c.photo)+"건의 포인트 대상 기록을 반영했어요.":"아직 포인트 대상 기록이 없어요. 첫 미션부터 시작해 보세요.");
  }
  window.addEventListener("teum:records-updated",render);
  window.addEventListener("storage",render);
  window.addEventListener("pageshow",render);
  document.addEventListener("visibilitychange",function(){if(!document.hidden)render();});
  render();
})();
