export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/weather-mission") {
      return handleWeatherMission(request);
    }

    if (
      url.pathname === "/teum-logo.png" ||
      url.pathname === "/tuim%20logo.png" ||
      decodeURIComponent(url.pathname) === "/tuim logo.png"
    ) {
      url.pathname = "/tuim_logo.png";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    const response = await env.ASSETS.fetch(request);

    if (url.pathname.endsWith("/script.js") || url.pathname === "/script.js") {
      return rewriteScript(response);
    }

    return rewriteHtmlNavigation(response, url.pathname);
  },
};

function rewriteScript(response) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("javascript") && !type.includes("text/plain")) return response;

  return response.text().then((js) => {
    let rewritten = js
      .replace(
        /<div class=\\"mission-action\\"><span>\$\{m\.tag\}<\/span><strong>\$\{m\.action\}<\/strong><\/div>/g,
        '<a class=\\"mission-action mission-record-link\\" href=\\"challenge.html\\"><span>${m.tag}</span><strong>${m.action}</strong></a>'
      )
      .replace(
        /<div class=\\"mission-action\\"><span>기본 정리<\/span><strong>눈에 가장 먼저 들어오는 물건 5개만 제자리로 돌려놓아 보세요\.<\/strong><\/div>/g,
        '<a class=\\"mission-action mission-record-link\\" href=\\"challenge.html\\"><span>기록</span><strong>눈에 가장 먼저 들어오는 물건 5개만 제자리로 돌려놓아 보세요.</strong></a>'
      );

    const headers = new Headers(response.headers);
    headers.set("content-type", "application/javascript; charset=utf-8");
    return new Response(rewritten, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  });
}

function rewriteHtmlNavigation(response, pathname) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  return response.text().then((html) => {
    let pageHtml = html;

    pageHtml = pageHtml.replace(/<title>트임 \| 지금해냄<\/title>/g, "<title>트임 | 공간비움</title>");
    pageHtml = pageHtml.replace(/<title>트임 \| 바로시작<\/title>/g, "<title>트임 | 트임타임</title>");
    pageHtml = pageHtml.replace(/<title>트임 \| 정리 챌린지<\/title>/g, "<title>트임 | 트임기록</title>");
    pageHtml = pageHtml.replace(/<h1>바로 해냄<\/h1>/g, "<h1>트임타임</h1>");
    pageHtml = pageHtml.replace(/<h1>14일 정리 챌린지<\/h1>/g, "<h1>트임기록</h1>");
    pageHtml = pageHtml.replace(/14 DAYS CHALLENGE/g, "14 DAYS RECORD");
    pageHtml = pageHtml.replace(/챌린지 초기화/g, "기록 초기화");
    pageHtml = pageHtml.replace(/챌린지 인증 사진/g, "트임기록 인증 사진");
    pageHtml = pageHtml.replace(/챌린지/g, "트임기록");
    pageHtml = pageHtml.replace(/바로시작/g, "트임타임");
    pageHtml = pageHtml.replace(/지금해냄/g, "공간비움");

    pageHtml = pageHtml.replace(
      /<a class="service-item" href="action\.html">((?:(?!<\/a>).)*<span>집중음악<\/span>(?:(?!<\/a>).)*)<\/a>/gs,
      '<a class="service-item" href="action.html#musicSection">$1</a>'
    );
    pageHtml = pageHtml.replace(/href="action\.html">바로해냄 열기/g, 'href="action.html">트임타임 열기');

    const active = pathname.includes("test.html")
      ? "test"
      : pathname.includes("space.html")
      ? "space"
      : pathname.includes("challenge.html")
      ? "challenge"
      : pathname.includes("action.html")
      ? "action"
      : pathname.includes("program.html")
      ? "program"
      : "home";

    if (active === "home") {
      pageHtml = enhanceHomeSections(pageHtml);
    }

    const item = (key, href, label) =>
      `<a${active === key ? ' class="active"' : ""} data-nav="${key}" href="${href}">${label}</a>`;

    const nav = `<nav class="bottom-nav">${item("home", "index.html", "홈")}${item("test", "test.html", "마음비움")}${item("space", "space.html", "공간비움")}${item("challenge", "challenge.html", "트임기록")}${item("action", "action.html", "트임타임")}${item("program", "program.html", "문의")}</nav>`;

    if (!pageHtml.includes("mission-record-link-style")) {
      pageHtml = pageHtml.replace(
        "</head>",
        `<style id="mission-record-link-style">.mission-record-link{background:#FFC928!important;color:#183B6B!important;text-decoration:none}.mission-record-link span{background:#fff!important;color:#183B6B!important}.mission-record-link strong{color:#183B6B!important}</style></head>`
      );
    }

    const rewritten = pageHtml.includes('class="bottom-nav"')
      ? pageHtml.replace(/<nav class="bottom-nav">[\s\S]*?<\/nav>/, nav)
      : pageHtml.replace("</body>", `${nav}</body>`);

    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    return new Response(rewritten, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  });
}

function enhanceHomeSections(pageHtml) {
  let html = pageHtml;

  html = html.replace(/부모·가족/g, "가족");
  html = html.replace(
    /<section class="mind-section( home-mind-service-ux)?">/g,
    '<section class="mind-section home-mind-service-ux">'
  );

  html = html.replace(
    /(<section class="service-section">[\s\S]*?<\/section>)\s*(<section class="mind-section home-mind-service-ux">[\s\S]*?<\/section>)/,
    "$2\n$1"
  );

  html = html.replace(/<p class="kicker">PERSONALITY TEST<\/p><h1>나는 왜<br>정리가 어려울까\?<\/h1><p>물건보다 먼저 마음과 행동 패턴을 확인해보세요\.<\/p><a href="test\.html">성향테스트 시작<\/a>/,
    '<p class="kicker">TRY TEIM</p><h1>지금 딱 하나만<br>비워볼까요?</h1><p>지금 내 상태에 맞는 작은 비움 하나를 찾아드려요.</p><a href="#quickTeimExperience">시작하기 →</a>');

  if (!html.includes('id="quickTeimExperience"')) {
    const quickSection = `<section id="quickTeimExperience" class="quick-teim-panel" aria-label="지금 딱 하나만 비워보기"><div class="quick-teim-card" data-quick-card><div class="quick-screen active" data-screen="intro"><p class="small-label">TRY TEIM</p><h2>지금 딱 하나만<br>비워볼까요?</h2><p>지금 내 상태에 맞는 작은 비움 하나를 찾아드려요.</p><span class="quick-time">약 30초 · 바로 시작</span><button class="quick-start" type="button" data-next="concern">시작하기 →</button></div><div class="quick-screen" data-screen="concern" hidden><p class="small-label">STEP 01</p><h2>요즘 어디가<br>제일 답답해요?</h2><div class="quick-options"><button type="button" data-concern="love">💗 연애</button><button type="button" data-concern="work">💼 직장</button><button type="button" data-concern="family">🏠 가족</button><button type="button" data-concern="study">📚 학업</button><button type="button" data-concern="self">☀️ 성취</button></div></div><div class="quick-screen" data-screen="space" hidden><p class="small-label">STEP 02</p><h2>지금 어디에<br>있나요?</h2><div class="quick-options"><button type="button" data-space="bed">🛏 침대</button><button type="button" data-space="desk">🖥 책상</button><button type="button" data-space="living">🛋 거실</button><button type="button" data-space="outside">🚶 밖</button></div></div><div class="quick-screen" data-screen="result" hidden><p class="small-label">오늘의 트임</p><h2 id="quickMissionTitle">열어둔 창 3개 닫기</h2><p id="quickMissionText">머릿속이 복잡할 땐 눈앞에 열린 것부터 줄여볼게요. 딱 3개만 닫아보세요.</p><button class="quick-done" type="button">비웠어요 ✓</button><button class="quick-again" type="button">↻ 다른 트임 받기</button></div><div class="quick-screen quick-complete" data-screen="complete" hidden><div class="quick-sun">☀️</div><h2>틈이 하나 생겼어요.</h2><p>오늘 첫 번째 트임 완료!</p><strong>+1 트임</strong><a href="test.html">나를 더 알아보기 →</a></div></div></section>`;
    html = html.replace("</main>", `${quickSection}</main>`);
  }

  if (!html.includes("home-mind-ux-style")) {
    html = html.replace(
      "</head>",
      `<style id="home-mind-ux-style">.home-mind-service-ux .mind-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:14px 8px!important}.home-mind-service-ux .mind-card:nth-child(4),.home-mind-service-ux .mind-card:nth-child(5){display:none!important}.home-mind-service-ux .mind-card{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;text-align:center!important;gap:8px!important;color:#183B6B!important;font-weight:850!important;font-size:12px!important;letter-spacing:-.03em!important;background:transparent!important;border:0!important;border-radius:0!important;padding:0!important;box-shadow:none!important}.home-mind-service-ux .mind-icon{width:48px!important;height:48px!important;border-radius:17px!important;border:1px solid rgba(37,99,235,.22)!important;background:#fff!important;color:#183B6B!important}.home-mind-service-ux .mind-icon svg{width:27px!important;height:27px!important;stroke:#183B6B!important;stroke-width:1.75!important}.home-mind-service-ux .mind-card b{margin:0!important;font-size:12px!important;font-weight:850!important;letter-spacing:-.03em!important;color:#183B6B!important}.home-mind-service-ux .mind-card p,.home-mind-service-ux .mind-card span:last-child{display:none!important}.quick-teim-panel{margin-top:12px;background:#fff;border:1px solid rgba(37,99,235,.14);border-radius:30px;padding:18px;box-shadow:0 16px 38px rgba(37,99,235,.08)}.quick-teim-card{position:relative;overflow:hidden;border-radius:26px;background:#2563EB;color:#fff;padding:24px 20px;min-height:268px;display:flex;align-items:center}.quick-screen{width:100%;animation:quickFade .22s ease}.quick-screen[hidden]{display:none!important}.quick-screen .small-label{color:#FFC928;margin-bottom:9px}.quick-screen h2{margin:0;color:inherit;font-size:31px;line-height:1.12;letter-spacing:-.075em}.quick-screen p{margin:12px 0 0;color:rgba(255,255,255,.86);font-size:14px;line-height:1.55}.quick-time{display:inline-flex;margin-top:14px;border-radius:999px;background:rgba(255,255,255,.14);color:#fff;font-size:12px;font-weight:900;padding:8px 11px}.quick-start,.quick-done{margin-top:20px;border:0;border-radius:999px;background:#fff;color:#2563EB;font-size:15px;font-weight:1000;padding:14px 18px}.quick-options{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:18px}.quick-options button{border:1px solid rgba(255,255,255,.22);border-radius:18px;background:#fff;color:#183B6B;font-weight:950;font-size:15px;padding:14px 10px;text-align:left}.quick-again{margin-top:10px;border:0;background:transparent;color:#fff;font-weight:900;padding:8px}.quick-complete{background:#FFC928;color:#183B6B!important;text-align:center;border-radius:24px;padding:24px 18px}.quick-complete p{color:#183B6B}.quick-sun{font-size:42px}.quick-complete strong{display:inline-flex;margin:8px auto 18px;border-radius:999px;background:#fff;color:#183B6B;padding:8px 13px}.quick-complete a{display:inline-flex;border-radius:999px;background:#2563EB;color:#fff;font-weight:1000;padding:13px 16px}.quick-complete h2{color:#183B6B}@keyframes quickFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media(max-width:640px){.home-mind-service-ux .mind-grid{grid-template-columns:repeat(4,1fr)!important;gap:14px 4px!important}.home-mind-service-ux .mind-icon{width:42px!important;height:42px!important;border-radius:15px!important}.home-mind-service-ux .mind-icon svg{width:24px!important;height:24px!important}.home-mind-service-ux .mind-card b{font-size:11px!important}.quick-teim-panel{border-radius:26px;padding:14px}.quick-teim-card{border-radius:24px;padding:22px 18px;min-height:264px}.quick-screen h2{font-size:28px}.quick-options button{font-size:14px;padding:13px 9px}}</style></head>`
    );
  }

  if (!html.includes("quick-teim-flow-script")) {
    html = html.replace("</body>", `<script id="quick-teim-flow-script">(function(){var card=document.querySelector('[data-quick-card]');if(!card)return;var state={concern:'',space:''};var missions={love:{bed:['채팅방 하나 정리하기','마음이 복잡할 땐 대화보다 먼저 보이는 알림을 줄여볼게요. 지금 채팅방 하나만 정리해보세요.'],desk:['메모 3개만 덜어내기','계속 붙잡고 있던 생각을 종이 위에서 먼저 비워볼게요. 필요 없는 메모 3개만 지워보세요.'],living:['눈에 걸리는 물건 1개 치우기','관계 생각이 많을 땐 공간의 자극부터 줄이는 게 좋아요. 거실에서 가장 눈에 걸리는 물건 1개만 치워보세요.'],outside:['사진첩 5장 정리하기','밖에 있을 땐 큰 정리보다 손 안의 정리가 좋아요. 사진첩에서 필요 없는 사진 5장만 지워보세요.']},work:{bed:['알람 1개 줄이기','일 생각이 침대까지 따라왔다면 내일의 부담을 하나만 덜어볼게요. 필요 없는 알람 1개를 꺼보세요.'],desk:['열어둔 창 3개 닫기','머릿속이 복잡할 땐 눈앞에 열린 것부터 줄여볼게요. 딱 3개만 닫아보세요.'],living:['가방 속 5개 꺼내기','일이 끝났다는 감각을 공간에 남겨볼게요. 가방 속 물건 5개만 제자리로 보내세요.'],outside:['할 일 하나 삭제하기','지금 밖이라면 더하는 것보다 덜어내는 게 좋아요. 오늘 안 해도 되는 일 하나를 지워보세요.']},family:{bed:['침대 옆 물건 3개 치우기','가족 생각으로 마음이 복잡할 땐 내 자리부터 작게 회복해요. 침대 옆 물건 3개만 치워보세요.'],desk:['내 물건과 가족 물건 나누기','섞여 있으면 마음도 같이 복잡해져요. 책상 위에서 내 물건과 가족 물건을 딱 2분만 나눠보세요.'],living:['공용 물건 1개 자리 정하기','가족 공간은 완벽보다 기준 하나가 먼저예요. 자주 쓰는 공용 물건 1개의 자리를 정해보세요.'],outside:['말하고 싶은 것 한 줄 적기','밖에서는 물건보다 마음을 먼저 정리해요. 가족에게 말하고 싶은 것을 한 줄만 적어보세요.']},study:{bed:['책 1권만 제자리로','미루는 마음이 클 땐 시작을 아주 작게 만들어야 해요. 책 1권만 제자리로 보내보세요.'],desk:['책상 위 한 칸 비우기','공부는 넓은 책상보다 시작할 수 있는 한 칸이 필요해요. 손바닥만 한 공간을 비워보세요.'],living:['가장 가까운 물건 5개 정리','집중이 흩어질 땐 가까운 것부터 정리해요. 눈앞의 물건 5개만 정리해보세요.'],outside:['해야 할 일 1개만 고르기','밖에서는 계획을 줄이는 게 좋아요. 오늘 할 일 중 딱 1개만 남겨보세요.']},self:{bed:['이불 위 물건 모두 내리기','나 자신이 버거운 날엔 몸을 눕힐 공간부터 만들어보세요. 이불 위 물건을 모두 내려보세요.'],desk:['컵이나 쓰레기 1개 치우기','성취보다 회복이 먼저인 날도 있어요. 컵이나 쓰레기 1개만 치워보세요.'],living:['바닥 한 부분 보이게 하기','공간에 작은 틈이 보이면 마음에도 틈이 생겨요. 바닥 한 부분만 보이게 해보세요.'],outside:['숨 고르고 앱 하나 닫기','밖에서는 마음을 많이 쓰지 않는 정리가 좋아요. 숨을 한 번 고르고 앱 하나만 닫아보세요.']}};function show(name){card.querySelectorAll('[data-screen]').forEach(function(s){s.hidden=s.dataset.screen!==name;s.classList.toggle('active',s.dataset.screen===name);});}function setMission(){var item=(missions[state.concern]&&missions[state.concern][state.space])||missions.work.desk;document.getElementById('quickMissionTitle').textContent=item[0];document.getElementById('quickMissionText').textContent=item[1];}card.addEventListener('click',function(e){var btn=e.target.closest('button,a');if(!btn)return;if(btn.dataset.next){show(btn.dataset.next)}if(btn.dataset.concern){state.concern=btn.dataset.concern;show('space')}if(btn.dataset.space){state.space=btn.dataset.space;setMission();show('result')}if(btn.classList.contains('quick-done')){show('complete')}if(btn.classList.contains('quick-again')){state={concern:'',space:''};show('concern')}});})();</script></body>`);
  }

  return html;
}

async function handleWeatherMission(request) {
  const url = new URL(request.url);
  const latitude = sanitizeNumber(url.searchParams.get("lat"), 37.5665);
  const longitude = sanitizeNumber(url.searchParams.get("lon"), 126.9780);

  try {
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
      timezone: "Asia/Seoul",
    });

    const weatherResponse = await fetch(weatherUrl.toString(), {
      headers: { Accept: "application/json" },
      cf: { cacheTtl: 900, cacheEverything: true },
    });

    if (!weatherResponse.ok) {
      throw new Error("Open-Meteo API error");
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    const temperature = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const weatherCode = current.weather_code;
    const windSpeed = current.wind_speed_10m;
    const weatherText = getWeatherText(weatherCode);

    const mission = createTeimMission({
      temperature,
      humidity,
      weatherCode,
      windSpeed,
      weatherText,
    });

    return jsonResponse({
      ok: true,
      source: "open-meteo",
      location: { latitude, longitude },
      weather: {
        temperature,
        humidity,
        weatherCode,
        windSpeed,
        weatherText,
      },
      mission,
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: "날씨 데이터를 불러오지 못했습니다.",
      weather: null,
      mission: {
        title: "오늘의 기본 트임 기록",
        emotion: "날씨를 불러오지 못했지만, 오늘도 작게 기록할 수 있어요.",
        action: "눈에 가장 먼저 들어오는 물건 5개만 제자리로 돌려놓고 사진으로 기록해보세요.",
        tag: "기록",
      },
    });
  }
}

function sanitizeNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getWeatherText(code) {
  if (code === 0) return "맑음";
  if ([1, 2, 3].includes(code)) return "구름";
  if ([45, 48].includes(code)) return "안개";
  if (code >= 51 && code <= 67) return "비";
  if (code >= 71 && code <= 77) return "눈";
  if (code >= 80 && code <= 82) return "소나기";
  if (code >= 95) return "천둥";
  return "흐림";
}

function createTeimMission(weather) {
  const { temperature, humidity, weatherCode, windSpeed } = weather;

  if (humidity >= 75) {
    return {
      title: "습기가 쌓이는 날이에요",
      emotion: "오늘처럼 습하고 무거운 날에는 몸도 마음도 쉽게 처질 수 있어요. 큰 정리보다 공기를 바꾸는 작은 행동부터 시작해도 충분합니다.",
      action: "신발장이나 옷장 문을 열고 10분만 환기한 뒤, 눅눅하거나 냄새나는 물건 1개를 사진으로 기록해보세요.",
      tag: "기록",
    };
  }

  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return {
      title: "비 오는 날엔 작은 구역부터",
      emotion: "비 오는 날에는 움직임이 줄고 마음도 조금 가라앉을 수 있어요. 오늘은 넓은 공간보다 손이 닿는 작은 곳이 잘 맞습니다.",
      action: "침대 옆, 책상 위, 식탁 위 중 한 곳만 골라 정리하고 사진으로 기록해보세요.",
      tag: "기록",
    };
  }

  if (temperature >= 28) {
    return {
      title: "더운 날엔 가볍게만",
      emotion: "더운 날에는 정리를 시작하기도 전에 피로감이 먼저 올 수 있어요. 오래 걸리는 정리보다 땀이 나지 않는 정리가 좋습니다.",
      action: "냉장고 문 쪽이나 책상 서랍처럼 오래 움직이지 않아도 되는 공간 하나를 사진으로 기록해보세요.",
      tag: "기록",
    };
  }

  if (temperature <= 5) {
    return {
      title: "추운 날엔 앉아서 정리해요",
      emotion: "추운 날에는 몸이 움츠러들면서 정리 의욕도 같이 줄어들 수 있어요. 따뜻한 자리에서 할 수 있는 정리가 좋습니다.",
      action: "가방 속 물건, 영수증, 종이류를 분류하고 사진으로 기록해보세요.",
      tag: "기록",
    };
  }

  if (windSpeed >= 25) {
    return {
      title: "마음이 산만한 날엔 제자리부터",
      emotion: "바람이 강한 날에는 괜히 마음도 산만하게 느껴질 수 있어요. 새로운 정리보다 흐트러진 것을 다시 잡아주는 정리가 좋습니다.",
      action: "현관 주변의 신발, 우산, 가방 중 하나를 정리하고 사진으로 기록해보세요.",
      tag: "기록",
    };
  }

  return {
    title: "작은 기록을 만들기 좋은 날",
    emotion: "오늘은 무리하지 않고 작은 기록을 만들기 좋은 날이에요. 완벽하게 치우기보다 오늘의 변화를 남겨보는 게 좋습니다.",
    action: "가장 자주 쓰는 물건 3개의 자리를 정하고, 정리한 모습을 사진으로 기록해보세요.",
    tag: "기록",
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=900",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
