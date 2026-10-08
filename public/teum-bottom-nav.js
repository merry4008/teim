/* TEUM unified bottom navigation across all pages */
(function(){
function init(){
const path=location.pathname.split('/').pop()||'index.html';
const group=path==='index.html'?'home':(['test.html','mind.html','program.html'].includes(path)?'ai':path==='space-scan.html'?'ar':(['community.html','mind-feed.html','space-feed.html','magazine.html'].includes(path)?'feed':'my');
const items=[['home','⌂','홈','index.html'],['ai','✦','트임AI','test.html'],['ar','◎','트임AR','space-scan.html'],['feed','♧','트임피드','community.html'],['my','◯','마이','challenge.html']];
const css=document.createElement('style');css.textContent=`
body{padding-bottom:calc(76px + env(safe-area-inset-bottom,0px))!important}
#teumUnifiedBottomNav{position:fixed!important;bottom:0!important;left:0!important;right:0!important;z-index:2147483000!important;display:flex!important;justify-content:space-around!important;align-items:stretch!important;background:#fff!important;border-top:1px solid #e7e9ef!important;box-shadow:0 -3px 18px rgba(20,35,65,.05)!important;padding:8px max(8px,env(safe-area-inset-left,0px)) calc(7px + env(safe-area-inset-bottom,0px))!important;box-sizing:border-box!important;width:100%!important;max-width:none!important;height:auto!important;min-height:64px!important}
#teumUnifiedBottomNav a{display:flex!important;flex:1!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;text-decoration:none!important;color:#6b7280!important;font:500 11px/1.3 system-ui,-apple-system,'Noto Sans KR',sans-serif!important;background:transparent!important;border:0!important;padding:3px 0!important;min-width:0!important}
#teumUnifiedBottomNav a[aria-current=page]{color:#2367e8!important;font-weight:700!important}
#teumUnifiedBottomNav .teum-nav-icon{font:500 23px/1 system-ui,sans-serif!important;display:block!important}
@media(min-width:1024px){#teumUnifiedBottomNav{max-width:620px!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;border-left:1px solid #e7e9ef!important;border-right:1px solid #e7e9ef!important}}
`;document.head.appendChild(css);
document.querySelectorAll('nav').forEach(n=>{if(n.id==='teumUnifiedBottomNav')return;const s=(n.id+' '+n.className+' '+n.getAttribute('aria-label')).toLowerCase();if(/bottom|하단|teumainav|teumactionnav|teumrecordnav/.test(s)||n.querySelector('a[data-nav]')){n.style.setProperty('display','none','important');n.setAttribute('aria-hidden','true');}});
const nav=document.createElement('nav');nav.id='teumUnifiedBottomNav';nav.setAttribute('aria-label','트임 공통 하단 메뉴');
nav.innerHTML=items.map(([key,icon,label,url])=>'<a href="'+url+'"'+(key===group?' aria-current="page"':'')+'><span class="teum-nav-icon" aria-hidden="true">'+icon+'</span><span>'+label+'</span></a>').join('');
document.body.querySelectorAll('#teumUnifiedBottomNav').forEach(n=>n.remove());document.body.appendChild(nav);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();