/* TEUM MY reward dashboard: reflects existing browser records, no fictional points. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id);};if(!$("trTotal"))return;
var kDaily="teumV2Daily",kBingo="teumV2Bingo",kQuick="teimQuickCount",kPhoto="teimChallenge14";
function read(key,fallback){try{var value=JSON.parse(localStorage.getItem(key)||"null");return value&&typeof value==="object"&&!Array.isArray(value)?value:fallback;}catch(e){return fallback;}}
function number(key){try{return Math.min(100000,Math.max(0,Math.floor(Number(localStorage.getItem(key)||0)||0)));}catch(e){return 0;}}
var dailyKinds=["daily","digital","space","space","digital","daily","space"];
var bingoKinds=["daily","digital","space","digital","space","space","digital","daily","space"];
var data={};var gifts=[1,3,7,15];
var cards={
 1:{title:"첫 번째 틈이 생겼어요 ✳",message:"뭔가를 크게 바꾸지 않아도 괜찮아요.\n오늘 작은 행동을 하나 해낸 나에게 주는 첫 선물이에요."},
 3:{title:"작은 시작도 충분해요 ☀",message:"조금씩 만든 틈이 어느새 세 개가 됐어요.\n오늘은 이미 해낸 일들을 떠올리며 잠시 쉬어가도 좋아요."},
 7:{title:"나를 위한 쉼표 ♡",message:"일곱 번의 작은 실천을 기록했어요.\n이만큼 해낸 나에게, 서두르지 않아도 되는 시간을 선물해 주세요."},
 15:{title:"나의 트임 선언 ✦",message:"조금씩 비워온 나만의 리듬을 발견했어요.\n완벽하게 비우기보다 필요한 만큼의 여유를 만들어갈게요."}
};
var suggest={
 space:{title:"책상 위 물건 하나 제자리로",body:"전체를 정리할 필요 없어요. 지금 눈앞에 보이는 물건 하나부터 시작해요.",href:"index.html#bingo"},
 digital:{title:"필요 없는 사진 딱 세 장 비우기",body:"사진첩에서 다시 보지 않을 사진 세 장만 선택해요.",href:"index.html#bingo"},
 daily:{title:"가방 속 영수증 한 장 정리하기",body:"가방을 다 정리하지 말고, 필요 없는 영수증 한 장만 골라요.",href:"index.html#today"}
};
var active="space";
function getStats(){
 var counts={space:0,digital:0,daily:0};var completedDays=read(kDaily,{}),daily=0;
 Object.keys(completedDays).forEach(function(date){if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&completedDays[date]===true){daily++;counts[dailyKinds[(Number(date.slice(-2))-1)%7]]++;}});
 var months=read(kBingo,{}),bingo=0;
 Object.keys(months).forEach(function(month){if(!/^\d{4}-\d{2}$/.test(month)||!Array.isArray(months[month])||months[month].length!==9)return;months[month].forEach(function(done,index){if(done===true){bingo++;counts[bingoKinds[index]]++;}});});
 var photos=read(kPhoto,{}),photo=0;for(var i=1;i<=14;i++){if(photos[i]&&typeof photos[i].photo==="string"&&photos[i].photo)photo++;}
 var quick=number(kQuick);
 return{daily:daily,bingo:bingo,quick:quick,photo:photo,counts:counts,total:daily+bingo+quick+photo};
}
function setSuggestion(){
 var c=suggest[active];var lowest=Math.min(data.counts.space,data.counts.digital,data.counts.daily);
 $("trSuggestionTag").textContent=data.counts[active]===lowest?"여기에도 작은 틈을 내볼까요?":"다음에 해볼 작은 비움";
 $("trSuggestionTitle").textContent=c.title;$("trSuggestionBody").textContent=c.body;$("trSuggestionLink").href=c.href;
 document.querySelectorAll(".tr-category").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.kind===active));});
 $("trEncourage").textContent=data.total===0?"작은 시작 하나면 충분해요.":data.counts[active]===0?"이 영역은 아직 체크된 기록이 없어요. 괜찮다면 오늘 처음 시도해봐요.":"지금까지 "+data.counts[active]+"번 체크했어요. 다른 영역도 천천히 둘러보세요.";
}
function render(){
 data=getStats();
 $("trTotal").textContent=data.total.toLocaleString("ko-KR");
 $("trDaily").textContent=data.daily;$("trBingo").textContent=data.bingo;$("trQuick").textContent=data.quick;$("trPhoto").textContent=data.photo;
 $("trHeadline").textContent=data.total===0?"첫 틈이 생길 준비가 됐어요.":data.total===1?"첫 번째 틈이 생겼어요!":data.total+"번의 작은 실행이 쌓였어요.";
 var target=gifts.find(function(n){return n>data.total;});var previous=target===undefined?15:(gifts.filter(function(n){return n<target;}).pop()||0);
 var fraction=target===undefined?1:Math.max(0,Math.min(1,(data.total-previous)/(target-previous)));
 $("trCircleValue").style.strokeDashoffset=(414.69*(1-fraction)).toFixed(2);
 $("trRemaining").textContent=target===undefined?"✳":String(target-data.total);
 $("trNextText").textContent=target===undefined?"모든 카드 열림":target+"틈 선물까지";
 $("trCircle").setAttribute("aria-label",target===undefined?"디지털 선물 카드 네 종류를 모두 열었어요.":"다음 디지털 선물까지 "+(target-data.total)+"개의 틈이 남았어요.");
 var maximum=Math.max(1,data.counts.space,data.counts.digital,data.counts.daily);
 [["space","trSpace","trSpaceBar"],["digital","trDigital","trDigitalBar"],["daily","trRoutine","trRoutineBar"]].forEach(function(line){
  $(line[1]).textContent=data.counts[line[0]];$(line[2]).style.width=(data.counts[line[0]]/maximum*100)+"%";
  var button=document.querySelector('.tr-category[data-kind="'+line[0]+'"]');button.setAttribute("aria-label",button.querySelector("b").textContent+" "+data.counts[line[0]]+"번 완료, 눌러서 추천 확인");
 });
 document.querySelectorAll(".tr-gift").forEach(function(button){var needed=Number(button.dataset.needed),unlocked=data.total>=needed;button.dataset.open=String(unlocked);button.setAttribute("aria-disabled",String(!unlocked));button.querySelector("em").textContent=unlocked?"선물 열기 ↗":"앞으로 "+(needed-data.total)+"틈";});
 if(!$("trGiftOpen").hidden&&Number($("trGiftOpen").dataset.needed)>data.total)$("trGiftOpen").hidden=true;
 setSuggestion();
}
document.querySelectorAll(".tr-category").forEach(function(button){button.addEventListener("click",function(){active=button.dataset.kind;setSuggestion();});});
document.querySelectorAll(".tr-gift").forEach(function(button){button.addEventListener("click",function(){var needed=Number(button.dataset.needed);if(data.total<needed)return;var card=cards[needed];$("trGiftTitle").textContent=card.title;$("trGiftMessage").textContent=card.message;$("trGiftOpen").dataset.needed=String(needed);$("trGiftOpen").hidden=false;$("trGiftOpen").scrollIntoView({block:"nearest",behavior:window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});});});
$("trGiftClose").addEventListener("click",function(){$("trGiftOpen").hidden=true;});
window.addEventListener("teum:records-updated",render);window.addEventListener("storage",render);window.addEventListener("pageshow",render);document.addEventListener("visibilitychange",function(){if(!document.hidden)render();});
render();
})();