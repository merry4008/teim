(function(){
"use strict";
var locate=document.getElementById("binsLocate"),form=document.getElementById("binsForm"),address=document.getElementById("binsAddress");
var status=document.getElementById("binsStatus"),list=document.getElementById("binsList"),count=document.getElementById("binsCount");
var radiusGroup=document.getElementById("binsRadius");var latest=0, point=null, radius=1000, lastQuery="";
var steps=[1000,3000,5000];
function statusText(message,error){status.textContent=message;status.classList.toggle("error",!!error);}
function empty(message){list.replaceChildren();var d=document.createElement("div");d.className="bins-empty";d.textContent=message;list.appendChild(d);count.textContent="0곳";}
function formatDistance(m){return m==null?"거리 미확인":m<1000?m+"m":(m/1000).toFixed(1)+"km";}
function safeKakaoUrl(item){
 if(item.lat!=null&&item.lng!=null&&Number.isFinite(item.lat)&&Number.isFinite(item.lng)){
  return "https://map.kakao.com/link/to/"+encodeURIComponent(item.name||"의류수거함")+","+item.lat+","+item.lng;
 }
 return mapSearch(item.address||item.detail||item.name);
}
function mapSearch(q){return "https://map.kakao.com/?q="+encodeURIComponent((q||"")+" 헌옷수거함");}
function addText(parent,tag,cl,value){var e=document.createElement(tag);if(cl)e.className=cl;e.textContent=value;parent.appendChild(e);return e;}
function addMapFallback(message,query){
 empty(message);var box=document.createElement("div");box.className="bins-empty";
 var desc=addText(box,"p","","카카오맵에서도 등록된 장소를 직접 확인할 수 있어요.");
 var link=addText(box,"a","bins-record","카카오맵에서 검색하기 ↗");
 link.href=mapSearch(query||lastQuery||"");link.target="_blank";link.rel="noopener noreferrer";link.style.cssText="display:inline-block;margin-top:6px;background:#ffc928;color:#183b6b;border-radius:12px;padding:10px 13px;font-size:12px;font-weight:900;text-decoration:none";list.appendChild(box);
}
function render(items,meta){
 list.replaceChildren();count.textContent=items.length+"곳"+(meta.count>items.length?" 이상":"");
 if(!items.length){addMapFallback("해당 조건에서 확인된 수거함이 없어요. 검색 범위를 넓히거나 동네 이름을 변경해보세요.",lastQuery);return;}
 items.forEach(function(item){
  var card=document.createElement("article");card.className="bins-place";
  var top=addText(card,"div","bins-place-top",""),title=addText(top,"h3","",item.name||"의류수거함");
  if(item.distanceMeters!=null)addText(top,"span","bins-distance",formatDistance(item.distanceMeters));
  addText(card,"p","bins-address",item.address||[item.region,item.district].filter(Boolean).join(" ")||"주소 미등록");
  if(item.detail && item.detail!==item.name)addText(card,"p","bins-detail","상세 위치: "+item.detail);
  var tags=addText(card,"div","bins-place-meta","");
  var source=addText(tags,"span","",item.source==="official"?"지자체 공개자료":"카카오맵 등록 장소");source.dataset.source=item.source;
  if(item.referenceDate)addText(tags,"span","","자료 기준: "+item.referenceDate);
  var route=addText(card,"a","bins-map","카카오맵 길찾기 ↗");route.href=safeKakaoUrl(item);route.target="_blank";route.rel="noopener noreferrer";
  list.appendChild(card);
 });
 if(meta.partial)statusText("공식 자료에 일시적으로 연결할 수 없어 카카오맵 등록 장소만 표시합니다.",true);
 else statusText("검색 결과를 확인했어요. 방문 전 수거함 설치 상태를 확인해주세요.");
}
function loading(value){locate.disabled=value;form.querySelector("button").disabled=value;}
async function getJson(url){
 var resp=await fetch(url,{headers:{"Accept":"application/json"},cache:"no-store"});
 var data=await resp.json().catch(function(){return {ok:false,message:"응답을 불러오지 못했습니다."};});
 return {data:data,ok:resp.ok};
}
async function searchByCoords(lat,lng,requestedRadius,auto){
 var id=++latest;point={lat:lat,lng:lng};radiusGroup.hidden=false;radius=requestedRadius;lastQuery=lastQuery||"현위치";loading(true);
 var tries=auto?steps.filter(function(v){return v>=requestedRadius;}):[requestedRadius];
 if(!tries.length)tries=[requestedRadius];
 for(var i=0;i<tries.length;i++){
  var current=tries[i];selectRadius(current);statusText("가까운 수거함을 찾고 있어요…");empty("검색 중입니다.");
  try{
   var qs=new URLSearchParams({lat:String(lat),lng:String(lng),radius:String(current)});
   var response=await getJson("/api/clothing-bins?"+qs);
   if(id!==latest)return;
   if(!response.ok||!response.data.ok){statusText(response.data.message||"위치 검색에 실패했어요.",true);addMapFallback("확인된 데이터가 아직 없어요.",lastQuery);break;}
   if(response.data.items.length||i===tries.length-1){render(response.data.items,response.data);break;}
  }catch(err){if(id===latest){statusText("네트워크 오류로 수거함을 불러오지 못했어요.",true);addMapFallback("수거함 위치를 조회할 수 없어요.",lastQuery);}break;}
 }
 if(id===latest)loading(false);
}
function selectRadius(n){radius=n;radiusGroup.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-pressed",String(Number(b.dataset.radius)===n));});}
async function searchByName(query){
 var id=++latest;point=null;lastQuery=query;radiusGroup.hidden=true;loading(true);empty("지역을 검색하고 있어요.");statusText("지역명을 기준으로 찾고 있어요…");
 try{
  /* Kakao REST key is optional: official nationwide CSV still supports direct text search. */
  var geocode=await getJson("/api/clothing-bins/geocode?"+new URLSearchParams({query:query}));
  if(id!==latest)return;
  if(geocode.ok && geocode.data.ok){
   loading(false);lastQuery=query;return searchByCoords(geocode.data.lat,geocode.data.lng,1000,true);
  }
  var result=await getJson("/api/clothing-bins?"+new URLSearchParams({query:query}));
  if(id!==latest)return;
  if(result.ok&&result.data.ok)render(result.data.items,result.data);
  else{statusText(result.data.message||"지역 검색에 실패했어요.",true);addMapFallback("해당 지역의 공식 데이터가 연결되지 않았어요.",query);}
 }catch(err){if(id===latest){statusText("검색 중 오류가 발생했어요. 다시 시도해주세요.",true);addMapFallback("지역을 조회하지 못했어요.",query);}}
 if(id===latest)loading(false);
}
locate.addEventListener("click",function(){
 if(!navigator.geolocation){statusText("이 브라우저에서는 위치 확인을 지원하지 않아요. 동네 이름으로 검색해주세요.",true);address.focus();return;}
 loading(true);statusText("위치 권한을 확인하고 있어요…");
 navigator.geolocation.getCurrentPosition(function(p){
  loading(false);lastQuery="현위치";searchByCoords(p.coords.latitude,p.coords.longitude,1000,true);
 },function(e){
  loading(false);var message=e.code===1?"위치 권한이 거부됐어요. 브라우저 설정에서 허용하거나 동네 이름으로 검색해주세요.":e.code===3?"위치 확인 시간이 초과됐어요. 다시 시도하거나 동네 이름으로 검색해주세요.":"현재 위치를 확인하지 못했어요. 동네 이름으로 검색해주세요.";
  statusText(message,true);address.focus();
 },{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
});
form.addEventListener("submit",function(e){e.preventDefault();var q=address.value.trim();if(q.length<2){statusText("동네 이름 또는 주소를 두 글자 이상 입력해주세요.",true);address.focus();return;}searchByName(q);});
radiusGroup.addEventListener("click",function(e){var b=e.target.closest("button[data-radius]");if(b&&point)searchByCoords(point.lat,point.lng,Number(b.dataset.radius),false);});
})();