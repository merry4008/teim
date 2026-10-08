// GitHub OAuth bridge for Decap. Secrets live only in Cloudflare Worker bindings.
const ORIGIN = 'https://teim.merry4008.workers.dev';
const COOKIE = '__Host-teum-cms-state';
const encoder = new TextEncoder();
const cookie = value => `${COOKIE}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${value ? 600 : 0}`;
const noCache = {'cache-control':'no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff'};
function status(body, code=200) {return new Response(JSON.stringify(body),{status:code,headers:{...noCache,'content-type':'application/json; charset=utf-8'}});}
async function key(secret){return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
const hex = bytes => Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
async function makeState(secret){const payload=crypto.randomUUID()+'.'+(Date.now()+600000);return payload+'.'+hex(await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(payload)));}
async function validState(state,secret){
  if(!/^[\da-f-]{36}\.\d{13}\.[\da-f]{64}$/.test(state))return false;
  const [nonce,exp,signature]=state.split('.');const expiry=Number(exp);
  if(expiry<Date.now()||expiry>Date.now()+610000)return false;
  const bytes=Uint8Array.from(signature.match(/../g),h=>parseInt(h,16));
  return crypto.subtle.verify('HMAC',await key(secret),bytes,encoder.encode(nonce+'.'+exp));
}
function messagePage(type,payload,httpStatus=200){
  const nonce=crypto.randomUUID();
  const message=JSON.stringify('authorization:github:'+type+':'+JSON.stringify(payload)).replace(/</g,'\\u003c');
  const html=`<!doctype html><html lang="ko"><meta charset="utf-8"><title>트임 관리자 로그인</title><p id="state">로그인 결과를 관리자 화면으로 전달하고 있습니다.</p><script nonce="${nonce}">
  const origin=${JSON.stringify(ORIGIN)}, message=${message};
  if(!window.opener){document.getElementById('state').textContent='관리자 화면에서 로그인을 다시 시작해주세요.';}
  else {let sent=false;window.addEventListener('message',function(e){if(sent||e.origin!==origin||e.source!==window.opener||e.data!=='authorizing:github')return;sent=true;window.opener.postMessage(message,origin);window.close();});window.opener.postMessage('authorizing:github',origin);}
  </script></html>`;
  return new Response(html,{status:httpStatus,headers:{...noCache,'content-type':'text/html; charset=utf-8','set-cookie':cookie(''),'content-security-policy':`default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'`}});
}
export async function handleCmsAuth(request,env){
 const url=new URL(request.url);
 if(request.method!=='GET')return status({error:'Method not allowed'},405);
 const ready=Boolean(env.CMS_GITHUB_CLIENT_ID&&env.CMS_GITHUB_CLIENT_SECRET);
 if(url.pathname==='/api/cms/status')return status({ready});
 if(url.origin!==ORIGIN)return status({error:'Use the canonical admin address.'},403);
 if(!ready)return status({error:'관리자 로그인 초기 설정이 필요합니다.',code:'CMS_SETUP_REQUIRED'},503);
 if(url.pathname==='/api/cms/auth'){
  if(url.searchParams.get('provider')&&url.searchParams.get('provider')!=='github')return status({error:'Unsupported provider'},400);
  const state=await makeState(env.CMS_GITHUB_CLIENT_SECRET);
  const auth=new URL('https://github.com/login/oauth/authorize');
  auth.search=new URLSearchParams({client_id:env.CMS_GITHUB_CLIENT_ID,redirect_uri:ORIGIN+'/api/cms/callback',scope:'public_repo',state}).toString();
  return new Response(null,{status:302,headers:{...noCache,location:auth.toString(),'set-cookie':cookie(state)}});
 }
 if(url.pathname==='/api/cms/callback'){
  const state=url.searchParams.get('state')||'';
  const saved=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  if(!saved||state!==saved||!await validState(state,env.CMS_GITHUB_CLIENT_SECRET))return messagePage('error',{message:'로그인 시간이 지났거나 요청이 올바르지 않습니다. 다시 로그인해주세요.'},403);
  const code=url.searchParams.get('code');if(!code||code.length>1024)return messagePage('error',{message:'GitHub 로그인이 취소되었습니다.'},400);
  try{
   const response=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:env.CMS_GITHUB_CLIENT_ID,client_secret:env.CMS_GITHUB_CLIENT_SECRET,code,redirect_uri:ORIGIN+'/api/cms/callback'}),signal:AbortSignal.timeout(15000)});
   const data=await response.json();if(!response.ok||typeof data.access_token!=='string')return messagePage('error',{message:'GitHub 인증에 실패했습니다. 다시 시도해주세요.'},401);
   const access=await fetch('https://api.github.com/repos/merry4008/teim',{headers:{Authorization:'Bearer '+data.access_token,Accept:'application/vnd.github+json','User-Agent':'TEUM-CMS'},signal:AbortSignal.timeout(15000)});
   const repo=await access.json();if(!access.ok||repo.permissions?.push!==true)return messagePage('error',{message:'트임 저장소를 수정할 권한이 있는 관리자 계정으로 로그인해주세요.'},403);
   return messagePage('success',{token:data.access_token,provider:'github'});
  }catch{return messagePage('error',{message:'로그인 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'},502);}
 }
 return status({error:'Not found'},404);
}
