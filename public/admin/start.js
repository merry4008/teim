(async function(){
 const text=document.getElementById('status');
 try{
 const response=await fetch('/api/cms/status',{cache:'no-store'});if(!response.ok)throw Error();
 const status=await response.json();if(!status.ready){text.textContent='관리자 로그인 설정 대기 중';document.getElementById('instructions').hidden=false;return;}
 text.textContent='콘텐츠 편집기를 불러오고 있습니다.';
 const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/decap-cms@3.16.3/dist/decap-cms.js';
 script.onerror=()=>{text.textContent='편집기를 불러오지 못했습니다. 새로고침해주세요.';};
 script.onload=()=>{document.getElementById('setup').hidden=true;window.CMS.init();};document.head.append(script);
 }catch{text.textContent='연결 상태를 확인하지 못했습니다. 잠시 후 새로고침해주세요.';}
})();
