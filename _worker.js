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

    pageHtml = pageHtml.replace(/<a class="service-item" href="action\.html">((?:(?!<\/a>).)*<span>집중음악<\/span>(?:(?!<\/a>).)*)<\/a>/gs, '<a class="service-item" href="action.html#musicSection">$1</a>')
      .replace(/href="action\.html">바로해냄 열기/g, 'href="action.html">트임타임 열기');

    const active = pathname.includes("test.html") ? "test" : pathname.includes("space.html") ? "space" : pathname.includes("challenge.html") ? "challenge" : pathname.includes("action.html") ? "action" : pathname.includes("program.html") ? "program" : "home";
    if (active === "home") pageHtml = enhanceHome(pageHtml);

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

function enhanceHome(pageHtml) {
  let html = pageHtml.replace(/부모·가족/g, "가족");

  html = html.replace(/<section class="mind-section( home-mind-service-ux)?">/g, '<section class="mind-section home-mind-service-ux">');
  html = html.replace(/(<section class="service-section">[\s\S]*?<\/section>)\s*(<section class="mind-section home-mind-service-ux">[\s\S]*?<\/section>)/, "$2\n$1");
  html = html.replace(/<p class="kicker">PERSONALITY TEST<\/p><h1>나는 왜<br>정리가 어려울까\?<\/h1><p>물건보다 먼저 마음과 행동 패턴을 확인해보세요\.<\/p><a href="test\.html">성향테스트 시작<\/a>/, '<p class="kicker">TRY TEIM</p><h1>지금 딱 하나만<br>비워볼까요?</h1><p>지금 내 상태에 맞는 작은 비움 하나를 찾아드려요.</p><a href="#quickTeimExperience">시작하기 →</a>');

  const quickSection = `<section id="quickTeimExperience" class="quick-teim-panel" aria-label="지금 딱 하나만 비워보기"><div class="quick-teim-card" data-quick-card data-step="intro"><div class="quick-stage" data-quick-stage></div></div></section>`;

  // Force replace any previously-rendered quick experience block.
  if (html.includes('id="quickTeimExperience"')) {
    html = html.replace(/<section[^>]*id="quickTeimExperience"[\s\S]*?<\/section>/, quickSection);
  } else {
    html = html.replace("</main>", `${quickSection}</main>`);
  }

  if (!html.includes("home-mind-ux-style")) {
    html = html.replace("</head>", `<style id="home-mind-ux-style">.banner-copy h1{font-size:24px!important;line-height:1.18!important}.home-mind-service-ux .mind-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:14px 8px!important}.home-mind-service-ux .mind-card:nth-child(4),.home-mind-service-ux .mind-card:nth-child(5){display:none!important}.home-mind-service-ux .mind-card{display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important;gap:8px!important;color:#183B6B!important;font-weight:850!important;font-size:12px!important;background:transparent!important;border:0!important;border-radius:0!important;padding:0!important;box-shadow:none!important}.home-mind-service-ux .mind-icon{width:48px!important;height:48px!important;border-radius:17px!important;border:1px solid rgba(37,99,235,.22)!important;background:#fff!important;color:#183B6B!important}.home-mind-service-ux .mind-icon svg{width:27px!important;height:27px!important;stroke:#183B6B!important;stroke-width:1.75!important}.home-mind-service-ux .mind-card b{margin:0!important;font-size:12px!important;font-weight:850!important;color:#183B6B!important}.home-mind-service-ux .mind-card p,.home-mind-service-ux .mind-card span:last-child{display:none!important}.quick-teim-panel{margin-top:12px;background:#fff;border:1px solid rgba(37,99,235,.14);border-radius:30px;padding:18px;box-shadow:0 16px 38px rgba(37,99,235,.08)}.quick-teim-card{position:relative;overflow:hidden;border-radius:26px;background:#2563EB;color:#fff;padding:24px 20px;min-height:292px;display:flex;align-items:center;transition:background .28s ease,transform .22s ease}.quick-teim-card[data-step="complete"]{background:#FFC928;color:#183B6B}.quick-stage{width:100%;animation:quickSlide .24s ease}.quick-teim-card.quick-pop{animation:quickPop .3s ease}.quick-stage.result-pop h2{animation:resultBounce .38s ease}.quick-stage .small-label{color:#FFC928;margin:0 0 9px;font-size:12px;font-weight:950;letter-spacing:.12em}.quick-teim-card[data-step="complete"] .small-label{color:#183B6B}.quick-stage h2{margin:0;color:inherit;font-size:31px;line-height:1.12;letter-spacing:-.075em}.quick-stage p{margin:12px 0 0;color:rgba(255,255,255,.86);font-size:14px;line-height:1.55}.quick-teim-card[data-step="complete"] p{color:#183B6B}.quick-time{display:inline-flex;margin-top:14px;border-radius:999px;background:rgba(255,255,255,.14);color:#fff;font-size:12px;font-weight:900;padding:8px 11px}.quick-teim-card[data-step="complete"] .quick-time{background:#fff;color:#183B6B}.quick-main-btn,.quick-done{margin-top:20px;border:0;border-radius:999px;background:#fff;color:#2563EB;font-size:15px;font-weight:1000;padding:14px 18px}.quick-options{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:18px}.quick-options button{border:1px solid rgba(255,255,255,.22);border-radius:18px;background:#fff;color:#183B6B;font-weight:950;font-size:15px;padding:14px 10px;text-align:left}.quick-ghost{margin-top:10px;border:0;background:transparent;color:#fff;font-weight:900;padding:8px;display:block}.quick-teim-card[data-step="complete"] .quick-ghost{color:#183B6B;margin-left:auto;margin-right:auto}.quick-complete-link{display:inline-flex;border-radius:999px;background:#2563EB;color:#fff!important;font-weight:1000;padding:13px 16px;margin-top:16px}.quick-sun{font-size:22px;font-weight:1000;margin-bottom:8px}.quick-next-copy{margin-top:18px!important}.quick-next-copy b{font-weight:1000}@keyframes quickSlide{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}@keyframes quickPop{0%{transform:scale(1)}45%{transform:scale(.985) translateY(3px)}100%{transform:scale(1)}}@keyframes resultBounce{0%{opacity:0;transform:translateY(12px) scale(.98)}60%{opacity:1;transform:translateY(-4px) scale(1.02)}100%{transform:none}}@media(max-width:640px){.banner-copy h1{font-size:22px!important}.home-mind-service-ux .mind-grid{grid-template-columns:repeat(4,1fr)!important;gap:14px 4px!important}.home-mind-service-ux .mind-icon{width:42px!important;height:42px!important;border-radius:15px!important}.home-mind-service-ux .mind-icon svg{width:24px!important;height:24px!important}.home-mind-service-ux .mind-card b{font-size:11px!important}.quick-teim-panel{border-radius:26px;padding:14px}.quick-teim-card{border-radius:24px;padding:22px 18px;min-height:278px}.quick-stage h2{font-size:28px}.quick-options button{font-size:14px;padding:13px 9px}}</style></head>`);
  }

  // Always inject the latest quick card script version.
  html = html.replace(/<script id="quick-teim-flow-script">[\s\S]*?<\/script>/g, "");
  html = html.replace("</body>", `${quickScript()}</body>`);
  return html;
}

function quickScript() {
  return `<script id="quick-teim-flow-script">(function(){var card=document.querySelector('[data-quick-card]');var stage=document.querySelector('[data-quick-stage]');if(!card||!stage)return;var state={step:'intro',concern:'work',space:'desk'};var lastKey='';var aliases={kitchen:'living',entry:'living',bath:'living',transit:'outside'};var current=['💼 브라우저 탭 3개 닫기','다시 볼 것 같아도 일단 닫기. 필요하면 어차피 또 찾습니다 😌'];var missions={love:{bed:[['💗 전 애인 사진 3장 숨기기','오늘은 삭제까지 안 가도 됩니다. 일단 안 보이게만 해두세요 😌'],['🎁 받았던 선물 1개 서랍에 넣기','딱 1개만 시야 밖으로 옮겨보세요.']],desk:[['📸 같이 찍은 사진 3장 숨기기','지우는 게 아니라 잠깐 안 보이게 하는 거예요.'],['💌 받았던 편지 1장 서랍에 넣기','책상 위에서 계속 말을 거는 물건 하나만 넣어둘게요.']],living:[['☕ 같이 쓰던 컵 1개 찬장에 넣기','지금은 보이는 자리에서만 빼볼게요.'],['🧸 받았던 인형 1개 다른 방에 두기','거실의 시선을 가볍게 만들어보세요.']],outside:[['💬 카톡 채팅방 1개 알림 끄기','알림 하나만 줄여볼게요.'],['📱 인스타 계정 1개 뮤트하기','오늘은 뮤트 하나면 충분해요.']]},work:{bed:[['💬 회사 단톡 알림 30분 끄기','30분만 꺼보세요.'],['💻 침대 위 노트북 책상에 두기','침대를 쉬는 곳으로 돌려놓을게요.']],desk:[['💼 브라우저 탭 3개 닫기','다시 볼 것 같아도 일단 닫기. 필요하면 어차피 또 찾습니다 😌'],['🗂 바탕화면 파일 3개 폴더에 넣기','눈앞의 복잡함 3개만 접어둘게요.']],living:[['🧾 가방 속 영수증 3장 버리기','일의 흔적 3장만 비워볼게요.'],['🔕 회사 메신저 알림 30분 끄기','집에 있는 30분만큼은 나에게 돌려줄게요.']],outside:[['🔕 업무 메신저 알림 30분 끄기','지금 당장 답하지 않아도 되는 시간을 만들어보세요.'],['📧 안 읽어도 되는 업무 메일 3개 읽음 처리하기','알림 숫자부터 줄여볼게요.']]},family:{bed:[['👕 침대 위 가족 옷 1벌 밖으로 옮기기','내가 쉬는 자리를 내 공간으로 돌려놓을게요.'],['☕ 가족이 놓고 간 컵 1개 주방에 두기','제자리로 보내는 정도면 충분해요.']],desk:[['✉️ 가족 우편물 1개 주인에게 가져다주기','남의 일을 하나만 돌려보내요.'],['🧩 내 물건 3개만 책상 위에 남기기','내 것만 남겨도 책상이 가벼워집니다.']],living:[['👕 내 옷 1벌 방으로 가져가기','내 흔적 하나만 회수해볼게요.'],['☕ 내 컵 1개 주방에 가져다놓기','내 컵 하나만 움직여요.']],outside:[['🔕 가족 단톡 알림 30분 끄기','잠깐 조용한 시간은 필요해요.'],['📝 부탁받은 일 1개 메모하고 휴대폰 닫기','메모에 맡겨두세요.']]},study:{bed:[['📚 교재 1권 책상에 가져다놓기','공부가 아니라 위치만 바꾸는 것으로 충분해요.'],['📱 휴대폰을 침대에서 2m 떨어뜨려놓기','의지를 쓰기 전에 거리부터 만들어요.']],desk:[['📄 필요 없는 프린트 3장 버리기','종이 3장만 줄여볼게요.'],['⬜ 책상 가운데 A4 한 장 크기만 비우기','딱 A4 한 장만큼만 비워보세요.']],living:[['📚 오늘 볼 교재 1권만 꺼내기','오늘 볼 것 하나만 남겨요.'],['☕ 테이블 위 컵 1개 주방에 가져가기','컵 하나면 충분합니다.']],outside:[['📱 인스타 앱 홈 화면에서 빼기','방해하는 입구를 하나 줄여요.'],['🌐 사파리·크롬 탭 3개 닫기','찾다 만 생각 3개를 잠깐 닫아둘게요.']]},self:{bed:[['⏰ 알람 1개 삭제하기','나를 재촉하는 소리 하나를 줄여보세요.'],['📵 휴대폰 뒤집어놓고 1분 있기','아무것도 안 하는 1분도 트임이에요.']],desk:[['✅ 오늘 할 일 1개 삭제하기','더 잘하기보다 덜어내는 연습부터 해볼게요.'],['☕ 빈 컵 1개 싱크대에 가져가기','성과 말고 컵 하나면 됩니다.']],living:[['📦 테이블 위 물건 3개 제자리에 두기','눈앞의 3개만 움직여도 틈이 생겨요.'],['📺 TV·유튜브 끄고 1분 있기','채우는 소리를 잠깐 꺼보세요.']],outside:[['🎧 이어폰 빼고 1분 걷기','1분만 소리를 덜어보세요.'],['🖼 스크린샷 3장 삭제하기','손 안의 공간을 가볍게 해요.']]}};var mind={love:['근데 왜 아직 못 놓고 있을까요?','💗 관계 마음비움 해보기 →','test.html?type=love'],work:['퇴근했는데 머리는 아직 출근 중?','💼 일상 마음비움 해보기 →','test.html?type=work'],family:['가족 앞에만 가면 왜 내 페이스가 사라질까?','🏠 가족 마음비움 해보기 →','test.html?type=family'],study:['해야 하는 건 아는데 왜 시작은 안 될까?','📚 해야 할 일 마음비움 해보기 →','test.html?type=study'],self:['쉬고 있는데도 왜 계속 뭔가 해야 할 것 같지?','☀️ 나 자신 마음비움 해보기 →','test.html?type=self']};function render(step,pop){state.step=step;card.dataset.step=step;if(pop){card.classList.remove('quick-pop');void card.offsetWidth;card.classList.add('quick-pop')}var html='';if(step==='intro')html='<p class="small-label">TRY TEIM</p><h2>지금 딱 하나만<br>비워볼까요?</h2><p>지금 내 상태에 맞는 작은 비움 하나를 찾아드려요.</p><span class="quick-time">약 30초 · 바로 시작</span><button class="quick-main-btn" data-next="concern">시작하기 →</button>';if(step==='concern')html='<p class="small-label">STEP 01</p><h2>지금 뭐가<br>제일 막혀요?</h2><div class="quick-options"><button data-concern="love">💗 관계</button><button data-concern="work">💼 일상</button><button data-concern="family">🏠 가족</button><button data-concern="study">📚 해야 할 일</button><button data-concern="self">☀️ 나 자신</button></div>';if(step==='space')html='<p class="small-label">STEP 02</p><h2>지금 어디에<br>있나요?</h2><div class="quick-options"><button data-space="bed">🛏 침대</button><button data-space="desk">🖥 책상</button><button data-space="living">🛋 거실</button><button data-space="kitchen">🍳 주방</button><button data-space="entry">🚪 현관</button><button data-space="bath">🛁 화장실</button><button data-space="outside">🚶 밖</button><button data-space="transit">🚇 이동 중</button></div>';if(step==='result')html='<div class="quick-stage result-pop"><p class="small-label">오늘은 이것 하나만 👀</p><h2>'+titleBreak(current[0])+'</h2><p>'+current[1]+'</p><span class="quick-time">약 10초</span><button class="quick-done">✓ 했어요</button><button class="quick-ghost quick-again">↻ 이건 싫어요. 다른 거 주세요</button></div>';if(step==='complete'){var m=mind[state.concern]||mind.work;html='<div class="quick-sun">☀️ +1 트임</div><h2>오, 진짜 했네요.</h2><p>작아 보여도<br>방금 내 공간에 틈 하나 만든 거예요.</p><p class="quick-next-copy">그런데 혹시 요즘<br><b>'+m[0]+'</b></p><a class="quick-complete-link" href="'+m[2]+'">'+m[1]+'</a><button class="quick-ghost quick-restart">하나 더 비우기</button>';}stage.className='quick-stage'+(step==='result'?' result-pop':'');stage.innerHTML=html}function titleBreak(t){return t.replace(/ (\d개|\d장|\d분|\d벌|\d권|\dm|\d초)/,'<br>$1')}function pick(){var space=aliases[state.space]||state.space;var list=(missions[state.concern]&&missions[state.concern][space])||missions.work.desk;var idx=Math.floor(Math.random()*list.length);var key=state.concern+'-'+space+'-'+idx;if(key===lastKey)idx=(idx+1)%list.length;lastKey=state.concern+'-'+space+'-'+idx;current=list[idx]}card.addEventListener('click',function(e){var btn=e.target.closest('button,a');if(!btn)return;if(btn.dataset.next)render(btn.dataset.next,true);if(btn.dataset.concern){state.concern=btn.dataset.concern;render('space',true)}if(btn.dataset.space){state.space=btn.dataset.space;pick();render('result',true)}if(btn.classList.contains('quick-done'))render('complete',true);if(btn.classList.contains('quick-again')){pick();render('result',true)}if(btn.classList.contains('quick-restart'))render('concern',true)});render('intro',false)})();</script>`;
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
    return jsonResponse({ ok: true, source: "open-meteo", location: { latitude, longitude }, weather: { temperature: current.temperature_2m, humidity: current.relative_humidity_2m, weatherCode: current.weather_code, windSpeed: current.wind_speed_10m, weatherText: getWeatherText(current.weather_code) }, mission: createTeimMission({ temperature: current.temperature_2m, humidity: current.relative_humidity_2m, weatherCode: current.weather_code, windSpeed: current.wind_speed_10m }) });
  } catch (error) {
    return jsonResponse({ ok: false, message: "날씨 데이터를 불러오지 못했습니다.", weather: null, mission: { title: "오늘의 기본 트임 기록", emotion: "날씨를 불러오지 못했지만, 오늘도 작게 기록할 수 있어요.", action: "눈에 가장 먼저 들어오는 물건 5개만 제자리로 돌려놓고 사진으로 기록해보세요.", tag: "기록" } });
  }
}
function sanitizeNumber(value, fallback) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
function getWeatherText(code) { if (code === 0) return "맑음"; if ([1,2,3].includes(code)) return "구름"; if ([45,48].includes(code)) return "안개"; if (code >= 51 && code <= 67) return "비"; if (code >= 71 && code <= 77) return "눈"; if (code >= 80 && code <= 82) return "소나기"; if (code >= 95) return "천둥"; return "흐림"; }
function createTeimMission(weather) { const { temperature, humidity, weatherCode, windSpeed } = weather; if (humidity >= 75) return { title: "습기가 쌓이는 날이에요", emotion: "오늘처럼 습하고 무거운 날에는 몸도 마음도 쉽게 처질 수 있어요.", action: "신발장이나 옷장 문을 열고 10분만 환기한 뒤, 눅눅하거나 냄새나는 물건 1개를 사진으로 기록해보세요.", tag: "기록" }; if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) return { title: "비 오는 날엔 작은 구역부터", emotion: "비 오는 날에는 움직임이 줄고 마음도 조금 가라앉을 수 있어요.", action: "침대 옆, 책상 위, 식탁 위 중 한 곳만 골라 정리하고 사진으로 기록해보세요.", tag: "기록" }; if (temperature >= 28) return { title: "더운 날엔 가볍게만", emotion: "더운 날에는 정리를 시작하기도 전에 피로감이 먼저 올 수 있어요.", action: "냉장고 문 쪽이나 책상 서랍처럼 오래 움직이지 않아도 되는 공간 하나를 사진으로 기록해보세요.", tag: "기록" }; if (temperature <= 5) return { title: "추운 날엔 앉아서 정리해요", emotion: "추운 날에는 몸이 움츠러들면서 정리 의욕도 같이 줄어들 수 있어요.", action: "가방 속 물건, 영수증, 종이류를 분류하고 사진으로 기록해보세요.", tag: "기록" }; if (windSpeed >= 25) return { title: "마음이 산만한 날엔 제자리부터", emotion: "바람이 강한 날에는 괜히 마음도 산만하게 느껴질 수 있어요.", action: "현관 주변의 신발, 우산, 가방 중 하나를 정리하고 사진으로 기록해보세요.", tag: "기록" }; return { title: "작은 기록을 만들기 좋은 날", emotion: "오늘은 무리하지 않고 작은 기록을 만들기 좋은 날이에요.", action: "가장 자주 쓰는 물건 3개의 자리를 정하고, 정리한 모습을 사진으로 기록해보세요.", tag: "기록" }; }
function jsonResponse(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=900", "Access-Control-Allow-Origin": "*" } }); }
