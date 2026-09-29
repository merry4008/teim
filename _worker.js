export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/weather-mission") return handleWeatherMission(request);
    if (url.pathname === "/teum-logo.png" || url.pathname === "/tuim%20logo.png" || decodeURIComponent(url.pathname) === "/tuim logo.png") {
      url.pathname = "/tuim_logo.png";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    const response = await env.ASSETS.fetch(request);
    if (url.pathname.endsWith("/script.js") || url.pathname === "/script.js") return rewriteScript(response);
    return rewriteHtml(response, url.pathname);
  },
};

function rewriteScript(response) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("javascript") && !type.includes("text/plain")) return response;
  return response.text().then((js) => {
    const rewritten = js
      .replace(/<div class=\\"mission-action\\"><span>\$\{m\.tag\}<\/span><strong>\$\{m\.action\}<\/strong><\/div>/g, '<a class=\\"mission-action mission-record-link\\" href=\\"challenge.html\\"><span>${m.tag}</span><strong>${m.action}</strong></a>')
      .replace(/<div class=\\"mission-action\\"><span>기본 정리<\/span><strong>눈에 가장 먼저 들어오는 물건 5개만 제자리로 돌려놓아 보세요\.<\/strong><\/div>/g, '<a class=\\"mission-action mission-record-link\\" href=\\"challenge.html\\"><span>기록</span><strong>눈에 가장 먼저 들어오는 물건 5개만 제자리로 돌려놓아 보세요.</strong></a>');
    const headers = new Headers(response.headers);
    headers.set("content-type", "application/javascript; charset=utf-8");
    return new Response(rewritten, { status: response.status, statusText: response.statusText, headers });
  });
}

function rewriteHtml(response, pathname) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  return response.text().then((html) => {
    let pageHtml = html
      .replace(/<title>트임 \| 지금해냄<\/title>/g, "<title>트임 | 공간비움</title>")
      .replace(/<title>트임 \| 바로시작<\/title>/g, "<title>트임 | 트임타임</title>")
      .replace(/<title>트임 \| 정리 챌린지<\/title>/g, "<title>트임 | 트임기록</title>")
      .replace(/<h1>바로 해냄<\/h1>/g, "<h1>트임타임</h1>")
      .replace(/<h1>14일 정리 챌린지<\/h1>/g, "<h1>트임기록</h1>")
      .replace(/14 DAYS CHALLENGE/g, "14 DAYS RECORD")
      .replace(/챌린지 초기화/g, "기록 초기화")
      .replace(/챌린지 인증 사진/g, "트임기록 인증 사진")
      .replace(/챌린지/g, "트임기록")
      .replace(/바로시작/g, "트임타임")
      .replace(/지금해냄/g, "공간비움");

    pageHtml = pageHtml
      .replace(/<a class="service-item" href="action\.html">((?:(?!<\/a>).)*<span>집중음악<\/span>(?:(?!<\/a>).)*)<\/a>/gs, '<a class="service-item" href="action.html#musicSection">$1</a>')
      .replace(/href="action\.html">바로해냄 열기/g, 'href="action.html">트임타임 열기');

    const active = pathname.includes("test.html") ? "test" : pathname.includes("space.html") ? "space" : pathname.includes("challenge.html") ? "challenge" : pathname.includes("action.html") ? "action" : pathname.includes("program.html") ? "program" : "home";
    if (active === "home") pageHtml = restoreHomeSections(pageHtml);

    const item = (key, href, label) => `<a${active === key ? ' class="active"' : ""} data-nav="${key}" href="${href}">${label}</a>`;
    const nav = `<nav class="bottom-nav">${item("home", "index.html", "홈")}${item("test", "test.html", "마음비움")}${item("space", "space.html", "공간비움")}${item("challenge", "challenge.html", "트임기록")}${item("action", "action.html", "트임타임")}${item("program", "program.html", "문의")}</nav>`;

    if (!pageHtml.includes("mission-record-link-style")) {
      pageHtml = pageHtml.replace("</head>", `<style id="mission-record-link-style">.mission-record-link{background:#FFC928!important;color:#183B6B!important;text-decoration:none}.mission-record-link span{background:#fff!important;color:#183B6B!important}.mission-record-link strong{color:#183B6B!important}</style></head>`);
    }

    const rewritten = pageHtml.includes('class="bottom-nav"') ? pageHtml.replace(/<nav class="bottom-nav">[\s\S]*?<\/nav>/, nav) : pageHtml.replace("</body>", `${nav}</body>`);
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    return new Response(rewritten, { status: response.status, statusText: response.statusText, headers });
  });
}

function restoreHomeSections(pageHtml) {
  let html = pageHtml;

  html = html.replace(/부모·가족/g, "가족");
  html = html.replace(/<section class="mind-section( home-mind-service-ux)?">/g, '<section class="mind-section home-mind-service-ux">');

  const quickSection = `<section id="quickTeimExperience" class="quick-teim-panel" aria-label="지금 딱 하나만 비워보기"><div class="quick-teim-card"><p class="small-label">TRY TEIM</p><h2>지금 딱하나만<br>비워볼까요?</h2><p>지금 내 상태에 맞는 작은 비움 하나를 찾아드려요.</p><div class="quick-teim-actions"><span>약 30초 · 바로 시작</span><a href="test.html">시작하기 →</a></div></div></section>`;
  if (html.includes('id="quickTeimExperience"')) html = html.replace(/<section[^>]*id="quickTeimExperience"[\s\S]*?<\/section>/, quickSection);
  else html = html.replace("</main>", `${quickSection}</main>`);

  html = applyTodayMissionCard(html);

  if (!html.includes("home-restore-sections-style")) {
    html = html.replace("</head>", `<style id="home-restore-sections-style">.home-mind-service-ux .mind-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:14px 8px!important}.home-mind-service-ux .mind-card:nth-child(4),.home-mind-service-ux .mind-card:nth-child(5){display:none!important}.home-mind-service-ux .mind-card{display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important;gap:8px!important;color:#183B6B!important;font-weight:850!important;font-size:12px!important;background:transparent!important;border:0!important;border-radius:0!important;padding:0!important;box-shadow:none!important}.home-mind-service-ux .mind-icon{width:48px!important;height:48px!important;border-radius:17px!important;border:1px solid rgba(37,99,235,.22)!important;background:#fff!important;color:#183B6B!important}.home-mind-service-ux .mind-icon svg{width:27px!important;height:27px!important;stroke:#183B6B!important;stroke-width:1.75!important}.home-mind-service-ux .mind-card b{margin:0!important;font-size:12px!important;font-weight:850!important;color:#183B6B!important}.home-mind-service-ux .mind-card p,.home-mind-service-ux .mind-card span:last-child{display:none!important}.quick-teim-panel{margin-top:12px;background:#fff;border:1px solid rgba(37,99,235,.14);border-radius:30px;padding:18px;box-shadow:0 16px 38px rgba(37,99,235,.08);scroll-margin-top:90px}.quick-teim-card{position:relative;overflow:hidden;border-radius:26px;background:#2563EB;color:#fff;padding:42px 38px;min-height:292px;display:flex;flex-direction:column;justify-content:center}.quick-teim-card .small-label{color:#FFC928!important;margin:0 0 26px!important;font-size:16px!important;font-weight:1000!important;letter-spacing:.22em!important}.quick-teim-card h2{margin:0!important;color:#fff!important;font-size:44px!important;line-height:1.13!important;letter-spacing:-.08em!important;font-weight:1000!important}.quick-teim-card p{margin:28px 0 0!important;color:rgba(255,255,255,.82)!important;font-size:25px!important;line-height:1.45!important;letter-spacing:-.05em!important}.quick-teim-actions{display:flex;align-items:center;gap:0;margin-top:44px}.quick-teim-actions span{display:inline-flex;align-items:center;justify-content:center;height:66px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;font-size:22px;font-weight:1000;padding:0 30px;white-space:nowrap}.quick-teim-actions a{display:inline-flex;align-items:center;justify-content:center;height:82px;border-radius:999px;background:#fff;color:#2563EB;font-size:27px;font-weight:1000;padding:0 44px;text-decoration:none;white-space:nowrap;margin-left:-4px}@media(max-width:640px){.home-mind-service-ux .mind-grid{grid-template-columns:repeat(4,1fr)!important;gap:14px 4px!important}.home-mind-service-ux .mind-icon{width:42px!important;height:42px!important;border-radius:15px!important}.home-mind-service-ux .mind-icon svg{width:24px!important;height:24px!important}.home-mind-service-ux .mind-card b{font-size:11px!important}.quick-teim-panel{border-radius:26px;padding:14px}.quick-teim-card{border-radius:24px;padding:34px 28px;min-height:278px}.quick-teim-card .small-label{font-size:13px!important;margin-bottom:20px!important}.quick-teim-card h2{font-size:36px!important}.quick-teim-card p{font-size:20px!important;margin-top:24px!important}.quick-teim-actions{margin-top:34px}.quick-teim-actions span{height:54px;font-size:17px;padding:0 20px}.quick-teim-actions a{height:64px;font-size:21px;padding:0 28px}}</style></head>`);
  }

  return html;
}

function applyTodayMissionCard(pageHtml) {
  const style = `<style id="today-mission-final-style">#todayTeimMission{position:relative!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;gap:14px!important;min-height:132px!important;margin-top:12px!important;padding:18px 18px 18px 20px!important;border:0!important;border-radius:28px!important;background:linear-gradient(120deg,#2563EB 0%,#43B6FF 64%,#FFC928 150%)!important;box-shadow:0 18px 42px rgba(37,99,235,.22)!important;overflow:hidden!important;color:#fff!important;writing-mode:horizontal-tb!important}#todayTeimMission *{box-sizing:border-box!important;writing-mode:horizontal-tb!important;text-orientation:mixed!important}#todayTeimMission:before{content:'';position:absolute;right:46px;top:-54px;width:170px;height:170px;border-radius:50%;background:rgba(255,255,255,.14);pointer-events:none}#todayTeimMission .today-left{position:relative;z-index:2;flex:1 1 auto!important;min-width:0!important;max-width:none!important;width:auto!important;display:block!important}#todayTeimMission .small-label{display:block!important;margin:0 0 6px!important;color:rgba(255,255,255,.78)!important;font-size:10.5px!important;font-weight:950!important;letter-spacing:.12em!important;line-height:1.1!important;text-transform:uppercase!important}#todayTeimMission .today-weather-line{display:flex!important;flex-direction:row!important;align-items:flex-end!important;gap:9px!important;margin:0 0 5px!important;white-space:nowrap!important}#todayTeimMission .today-temp{display:inline-block!important;color:#fff!important;font-size:34px!important;font-weight:800!important;line-height:.95!important;letter-spacing:-.06em!important;white-space:nowrap!important}#todayTeimMission .today-weather-text{display:inline-block!important;color:rgba(255,255,255,.95)!important;font-size:13px!important;font-weight:950!important;line-height:1.15!important;padding-bottom:2px!important;white-space:nowrap!important}#todayTeimMission .today-meta{display:block!important;margin:0 0 5px!important;color:rgba(255,255,255,.78)!important;font-size:11px!important;font-weight:800!important;line-height:1.25!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}#todayTeimMission .today-title{display:block!important;margin:0 0 6px!important;color:#fff!important;font-size:17px!important;font-weight:1000!important;line-height:1.24!important;letter-spacing:-.045em!important;white-space:normal!important;word-break:keep-all!important;overflow:visible!important;text-overflow:clip!important}#todayTeimMission .today-action-text{display:block!important;margin:0 0 10px!important;color:rgba(255,255,255,.9)!important;font-size:12px!important;font-weight:800!important;line-height:1.35!important;white-space:normal!important;word-break:keep-all!important;overflow:visible!important;text-overflow:clip!important}#todayTeimMission .today-buttons{display:flex!important;align-items:center!important;gap:7px!important;margin:0!important}#todayTeimMission .today-buttons a,#todayTeimMission .today-buttons button{display:inline-flex!important;align-items:center!important;justify-content:center!important;height:32px!important;padding:0 12px!important;border-radius:999px!important;border:0!important;background:#fff!important;color:#2563EB!important;font-size:12px!important;font-weight:1000!important;line-height:1!important;text-decoration:none!important;white-space:nowrap!important}#todayTeimMission .today-buttons button{background:rgba(255,255,255,.18)!important;color:#fff!important}#todayTeimMission .today-art{position:relative!important;z-index:2!important;flex:0 0 64px!important;width:64px!important;height:64px!important;display:grid!important;place-items:center!important;margin:0!important}#todayTeimMission .today-art svg{display:block!important;width:64px!important;height:64px!important;filter:drop-shadow(0 8px 14px rgba(0,0,0,.12))!important}@media(max-width:640px){#todayTeimMission{min-height:124px!important;padding:16px!important;gap:10px!important;border-radius:24px!important}#todayTeimMission .today-temp{font-size:30px!important}#todayTeimMission .today-title{font-size:15.5px!important;line-height:1.26!important}#todayTeimMission .today-action-text{font-size:11.5px!important}#todayTeimMission .today-art{flex-basis:54px!important;width:54px!important;height:54px!important}#todayTeimMission .today-art svg{width:54px!important;height:54px!important}}</style>`;

  const script = `<script id="today-mission-final-script">(function(){function icon(t){if(t==='맑음')return '<svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="25" fill="#FFC928"/><g fill="#FFC928"><rect x="60" y="14" width="8" height="22" rx="4"/><rect x="60" y="92" width="8" height="22" rx="4"/><rect x="14" y="60" width="22" height="8" rx="4"/><rect x="92" y="60" width="22" height="8" rx="4"/></g><path d="M51 50c6-7 17-10 23-8" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".75"/></svg>';return '<svg viewBox="0 0 128 128"><path d="M34 83c-12 0-22-9-22-21 0-11 9-20 20-20 4 0 7 1 10 3 5-13 17-22 32-22 18 0 33 14 34 32 9 1 16 8 16 18 0 10-8 18-19 18H34z" fill="#DDEBFF"/><path d="M45 47c6-11 18-18 31-18 16 0 29 11 33 26" fill="#fff" opacity=".42"/></svg>'}function title(t){if(t==='맑음')return '햇살 좋은 날, 마음도 가볍게';if(t==='구름')return '흐름이 느린 날, 시원하게 하나부터';if(t==='흐림')return '마음이 무거운 날, 시야 하나 비우기';if(t==='비')return '비 오는 날엔 손 닿는 곳부터';if(t==='소나기')return '소나기처럼 짧게, 10초 비움';if(t==='천둥')return '우루루쾅쾅 한 날, 제자리부터';if(t==='눈')return '눈 오는 날엔 앉아서 차분히';if(t==='안개')return '뿌연 날엔 시야부터 트이게';return '오늘의 트임 미션'}function paint(data){var card=document.getElementById('todayTeimMission');if(!card)return;var w=(data&&data.weather)||{};var m=(data&&data.mission)||{};var wt=w.weatherText||'구름';card.innerHTML='<div class="today-left"><p class="small-label">TODAY MISSION</p><div class="today-weather-line"><strong class="today-temp">'+(w.temperature!=null?Math.round(w.temperature):'--')+'°</strong><span class="today-weather-text">'+wt+'</span></div><p class="today-meta">'+new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'})+' · 오늘의 트임</p><h2 class="today-title">'+title(wt)+'</h2><p class="today-action-text">'+(m.action||'눈에 보이는 물건 하나만 제자리로 옮겨보세요.')+'</p><div class="today-buttons"><a href="challenge.html">오늘 기록하기</a></div></div><div class="today-art" aria-hidden="true">'+icon(wt)+'</div>'}setTimeout(function(){fetch('/api/weather-mission?lat=37.5665&lon=126.9780').then(function(r){return r.json()}).then(paint).catch(function(){paint({weather:{weatherText:'맑음'},mission:{action:'눈에 보이는 물건 하나만 제자리로 옮겨보세요.'}})})},150);})();</script>`;

  let html = pageHtml.replace(/<style id="today-mission-final-style">[\s\S]*?<\/style>/g, "").replace(/<script id="today-mission-final-script">[\s\S]*?<\/script>/g, "");
  html = html.replace("</head>", `${style}</head>`);
  html = html.replace("</body>", `${script}</body>`);
  return html;
}

async function handleWeatherMission(request) {
  const url = new URL(request.url);
  const latitude = sanitizeNumber(url.searchParams.get("lat"), 37.5665);
  const longitude = sanitizeNumber(url.searchParams.get("lon"), 126.9780);
  try {
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m", timezone: "Asia/Seoul" });
    const weatherResponse = await fetch(weatherUrl.toString(), { headers: { Accept: "application/json" }, cf: { cacheTtl: 900, cacheEverything: true } });
    if (!weatherResponse.ok) throw new Error("Open-Meteo API error");
    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    const weather = { temperature: current.temperature_2m, humidity: current.relative_humidity_2m, weatherCode: current.weather_code, windSpeed: current.wind_speed_10m, weatherText: getWeatherText(current.weather_code) };
    return jsonResponse({ ok: true, source: "open-meteo", location: { latitude, longitude }, weather, mission: createTeimMission(weather) });
  } catch (error) {
    return jsonResponse({ ok: false, message: "날씨 데이터를 불러오지 못했습니다.", weather: null, mission: { title: "작은 기록을 만들기 좋은 날", emotion: "날씨를 불러오지 못했지만, 오늘도 작게 기록할 수 있어요.", action: "눈에 가장 먼저 들어오는 물건 5개만 제자리로 돌려놓고 사진으로 기록해보세요.", tag: "기록" } });
  }
}

function sanitizeNumber(value, fallback) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
function getWeatherText(code) { if (code === 0) return "맑음"; if ([1,2].includes(code)) return "구름"; if (code === 3) return "흐림"; if ([45,48].includes(code)) return "안개"; if (code >= 51 && code <= 67) return "비"; if (code >= 71 && code <= 77) return "눈"; if (code >= 80 && code <= 82) return "소나기"; if (code >= 95) return "천둥"; return "흐림"; }
function createTeimMission(weather) { const { weatherCode } = weather; if (weatherCode === 0) return { title: "햇살 좋은 날, 마음도 가볍게", emotion: "오늘은 가볍게 시작하기 좋은 날이에요.", action: "가장 자주 쓰는 물건 3개의 자리를 정하고, 정리한 모습을 사진으로 기록해보세요.", tag: "기록" }; if ([1,2].includes(weatherCode)) return { title: "흐름이 느린 날, 시원하게 하나부터", emotion: "느리게 흘러가는 날에는 눈앞의 작은 것부터 시작해도 충분해요.", action: "책상 위나 테이블 위 물건 하나만 제자리로 옮겨보세요.", tag: "기록" }; if (weatherCode === 3) return { title: "마음이 무거운 날, 시야 하나 비우기", emotion: "하늘이 흐린 날에는 시야를 조금 비우는 것만으로도 답답함이 줄어요.", action: "눈앞에 가장 먼저 보이는 물건 하나만 치워보세요.", tag: "기록" }; if (weatherCode >= 51 && weatherCode <= 67) return { title: "비 오는 날엔 손 닿는 곳부터", emotion: "비 오는 날에는 멀리 움직이기보다 손이 닿는 곳부터 가볍게 시작해요.", action: "침대 옆, 책상 위, 식탁 위 중 한 곳만 골라 정리하고 사진으로 기록해보세요.", tag: "기록" }; if (weatherCode >= 80 && weatherCode <= 82) return { title: "소나기처럼 짧게, 10초 비움", emotion: "길게 붙잡지 말고 소나기처럼 짧게 끝내도 좋아요.", action: "10초 안에 끝낼 수 있는 물건 하나만 제자리로 옮겨보세요.", tag: "기록" }; if (weatherCode >= 95) return { title: "우루루쾅쾅 한 날, 제자리부터", emotion: "요란한 날에는 큰 정리보다 제자리 하나가 더 잘 맞아요.", action: "현관 주변의 신발, 우산, 가방 중 하나를 정리하고 사진으로 기록해보세요.", tag: "기록" }; if (weatherCode >= 71 && weatherCode <= 77) return { title: "눈 오는 날엔 앉아서 차분히", emotion: "눈 오는 날에는 움직임을 줄이고 앉아서 할 수 있는 정리가 좋아요.", action: "가방 속 물건, 영수증, 종이류를 분류하고 사진으로 기록해보세요.", tag: "기록" }; if ([45,48].includes(weatherCode)) return { title: "뿌연 날엔 시야부터 트이게", emotion: "뿌연 날에는 보이는 곳 하나를 비워 시야를 먼저 틔워요.", action: "창가나 책상 위에서 시야를 가리는 물건 하나만 치워보세요.", tag: "기록" }; return { title: "작은 기록을 만들기 좋은 날", emotion: "오늘은 무리하지 않고 작은 기록을 만들기 좋은 날이에요.", action: "가장 자주 쓰는 물건 3개의 자리를 정하고, 정리한 모습을 사진으로 기록해보세요.", tag: "기록" }; }
function jsonResponse(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=900", "Access-Control-Allow-Origin": "*" } }); }
