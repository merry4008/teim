(function(){
"use strict";
var locate=document.getElementById("binsLocate"),form=document.getElementById("binsForm"),address=document.getElementById("binsAddress");
var status=document.getElementById("binsStatus"),list=document.getElementById("binsList"),count=document.getElementById("binsCount");
var caption=document.getElementById("binsResultsCaption"),title=document.getElementById("binsResultsTitle");
var resultSection=document.querySelector(".bins-results"),radiusGroup=document.getElementById("binsRadius");
var serial=0,controller=null,point=null,lastQuery="",radius=1000,lastRetry=null,lastLookup="";var steps=[1000,3000,5000];
function text(parent,tag,cls,value){var el=document.createElement(tag);if(cls)el.className=cls;el.textContent=value;parent.appendChild(el);return el;}
function setStatus(message,kind){status.textContent=message;status.dataset.kind=kind||"info";status.classList.toggle("error",kind==="error");}
function setCount(n,total){if(n===null){count.hidden=true;count.textContent="";}else{count.hidden=false;count.textContent=n+"곳"+(total>n?" 이상":"");}}
function clear(){list.replaceChildren();}
function busy(on){locate.disabled=on;form.querySelector("button").disabled=on;resultSection.setAttribute("aria-busy",String(on));list.setAttribute("aria-busy",String(on));}
function searchLink(query){return "https://map.kakao.com/?q="+encodeURIComponent(query&&query!=="현위치"?query+" 헌옷수거함":"헌옷수거함");}
function directions(item){
 if(Number.isFinite(item.lat)&&Number.isFinite(item.lng))return "https://map.kakao.com/link/to/"+encodeURIComponent(item.name||"의류수거함")+","+item.lat+","+item.lng;
 return searchLink(item.address||item.detail||item.name||"");
}
function showState(kind,heading,description,action){
 clear();setCount(null);var wrap=text(list,"div","bins-placeholder","");wrap.dataset.state=kind;
 text(wrap,"span","bins-placeholder-icon",kind==="error"?"!":kind==="empty"?"⌕":"⌖").setAttribute("aria-hidden","true");
 text(wrap,"strong","",heading);text(wrap,"p","",description);
 if(action==="retry"&&typeof lastRetry==="function"){var b=text(wrap,"button","bins-retry","다시 검색하기 →");b.type="button";b.addEventListener("click",function(){lastRetry();});}
 if(action==="external"){var a=text(wrap,"a","bins-external","카카오맵에서 직접 찾아보기 ↗");a.href=searchLink(lastQuery);a.target="_blank";a.rel="noopener noreferrer";}
}
function showLoading(message){clear();setCount(null);var wrap=text(list,"div","bins-loading","");var note=text(wrap,"div","bins-loading-note","");text(note,"span","bins-spinner","").setAttribute("aria-hidden","true");text(note,"span","",message);for(var i=0;i<3;i++)text(wrap,"div","bins-skeleton","").setAttribute("aria-hidden","true");setStatus(message,"loading");}
function formatMeters(m){if(m==null)return "";return m<1000?m+"m":(m/1000).toFixed(1)+"km";}
function draw(items,meta,description){
 clear();busy(false);
 if(!items.length){caption.textContent=description||"확인된 수거함이 없습니다.";showState("empty","이 범위에서는 아직 찾지 못했어요.","공공데이터에 등록된 위치가 없을 수 있어요. 검색 범위를 늘리거나 다른 동네로 다시 검색해 주세요.","external");setStatus("검색은 완료됐지만 일치하는 수거함이 없습니다.","info");return;}
 setCount(items.length,meta.count);caption.textContent=description||"가까운 곳부터 확인해 보세요.";
 items.forEach(function(item,i){
  var card=text(list,"article","bins-place","");text(card,"span","bins-place-index",String(i+1).padStart(2,"0")+" · COLLECTION POINT");
  var top=text(card,"div","bins-place-top","");text(top,"h3","",item.name||"의류수거함");
  if(item.distanceMeters!=null)text(top,"span","bins-distance",formatMeters(item.distanceMeters));
  text(card,"p","bins-address",item.address||[item.region,item.district].filter(Boolean).join(" ")||"주소 미등록");
  if(item.detail&&item.detail!==item.name)text(card,"p","bins-detail","상세 위치 · "+item.detail);
  var tags=text(card,"div","bins-place-meta","");var source=text(tags,"span","",item.source==="official"?"지자체 공개자료":"카카오맵 등록 장소");source.dataset.source=item.source;
  if(item.referenceDate)text(tags,"span","","자료 기준 · "+item.referenceDate);
  var route=text(card,"a","bins-map","카카오맵으로 길찾기 ↗");route.href=directions(item);route.target="_blank";route.rel="noopener noreferrer";
 });
 setStatus(meta.partial?"공식 자료 조회가 원활하지 않아 확인 가능한 지도 등록 장소만 보여드려요.":"총 "+meta.count+"곳 검색 완료 · 실제 설치 여부는 방문 전에 확인해주세요.",meta.partial?"error":"success");
}
function fail(message){busy(false);caption.textContent="조회에 실패했어요.";showState("error","검색 결과를 불러오지 못했어요.",message||"연결 상태를 확인한 뒤 다시 시도해주세요.","retry");setStatus(message||"잠시 후 다시 시도해주세요.","error");}
function begin(searchTitle,searchCaption){if(controller)controller.abort();controller=new AbortController();var token=++serial;title.textContent=searchTitle;caption.textContent=searchCaption;setCount(null);busy(true);return token;}
async function getJson(path,token){
 var resp=await fetch(path,{headers:{Accept:"application/json"},cache:"no-store",signal:controller.signal});
 var data=await resp.json().catch(function(){return {ok:false,message:"서버 응답을 읽지 못했어요."};});
 if(token!==serial)return null;return {ok:resp.ok&&data.ok,data:data};
}
function radiusSelect(n){radius=n;radiusGroup.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-pressed",String(Number(b.dataset.radius)===n));});}
async function byCoords(lat,lng,requested,automatic,query){
 point={lat:lat,lng:lng};lastQuery=query||"현위치";lastRetry=function(){byCoords(lat,lng,requested,automatic,query);};
 var token=begin("내 주변 수거함","현재 위치 기준 · 가까운 순서로 보여드려요.");radiusGroup.hidden=false;
 var tries=automatic?steps.filter(function(n){return n>=requested;}):[requested];if(!tries.length)tries=[requested];
 var ended=false;
 for(var i=0;i<tries.length;i++){
  if(token!==serial)return;
  var current=tries[i];radiusSelect(current);showLoading(current/1000+"km 이내 수거함을 확인하고 있어요…");
  try{
   var q=new URLSearchParams({lat:String(lat),lng:String(lng),radius:String(current)});
   var response=await getJson("/api/clothing-bins?"+q,token);
   if(token!==serial||!response)return;
   if(!response.ok){fail(response.data.message||"데이터를 불러오지 못했어요.");ended=true;break;}
   if(response.data.items.length||i===tries.length-1){
    draw(response.data.items,response.data,(query&&query!=="현위치"?query+" 주변 · ":"현재 위치 기준 · ")+current/1000+"km 이내 · 거리순");
    ended=true;break;
   }
  }catch(error){if(token!==serial)return;fail(error.name==="AbortError"?"요청이 중단됐어요. 다시 검색해주세요.":"인터넷 연결이나 서버 응답을 확인해주세요.");ended=true;break;}
 }
 if(token===serial&&!ended)busy(false);
}
async function byName(query){
 point=null;lastQuery=query;lastRetry=function(){byName(query);};radiusGroup.hidden=true;
 var token=begin("지역 검색 결과","‘"+query+"’ 지역에서 수거함을 찾고 있어요.");showLoading("지역명과 설치 위치를 확인하고 있어요…");
 try{
  var geo=await getJson("/api/clothing-bins/geocode?"+new URLSearchParams({query:query}),token);
  if(token!==serial||!geo)return;
  if(geo.ok){busy(false);return byCoords(geo.data.lat,geo.data.lng,1000,true,query);}
  showLoading("공식 데이터에서 동네 이름으로 검색하고 있어요…");
  var response=await getJson("/api/clothing-bins?"+new URLSearchParams({query:query}),token);
  if(token!==serial||!response)return;
  if(!response.ok){fail(response.data.message||"지역 검색이 원활하지 않아요.");return;}
  draw(response.data.items,response.data,"‘"+query+"’ 검색 결과 · 공식 데이터 주소 기준");
 }catch(error){if(token!==serial)return;fail(error.name==="AbortError"?"요청이 중단됐어요.":"연결 상태를 확인하고 다시 검색해주세요.");}
}
locate.addEventListener("click",function(){
 if(!navigator.geolocation){setStatus("이 브라우저는 위치 검색을 지원하지 않아요. 동네 이름을 입력해주세요.","error");address.focus();return;}
 if(controller)controller.abort();var token=++serial;busy(true);radiusGroup.hidden=true;title.textContent="내 주변 수거함";caption.textContent="위치 권한 확인 중";showLoading("현재 위치 권한을 확인하고 있어요…");
 navigator.geolocation.getCurrentPosition(function(p){if(token!==serial)return;busy(false);byCoords(p.coords.latitude,p.coords.longitude,1000,true,"현위치");},function(e){
  if(token!==serial)return;busy(false);var message=e.code===1?"위치 권한이 거부됐습니다. 동네 이름으로 검색할 수 있어요.":e.code===3?"위치를 확인하는 데 시간이 오래 걸리고 있어요. 다시 시도해주세요.":"현재 위치를 확인할 수 없어요. 동네 이름으로 검색해주세요.";
  lastRetry=function(){locate.click();};fail(message);address.focus();
 },{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
});
form.addEventListener("submit",function(event){event.preventDefault();var q=address.value.trim();if(q.length<2){setStatus("동네나 주소를 두 글자 이상 입력해주세요.","error");address.focus();return;}byName(q);});
radiusGroup.addEventListener("click",function(event){var b=event.target.closest("button[data-radius]");if(b&&point&&!locate.disabled)byCoords(point.lat,point.lng,Number(b.dataset.radius),false,lastQuery);});
})();