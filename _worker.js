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

  if (!html.includes("home-mind-ux-style")) {
    html = html.replace(
      "</head>",
      `<style id="home-mind-ux-style">.home-mind-service-ux .mind-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:14px 8px!important}.home-mind-service-ux .mind-card:nth-child(4),.home-mind-service-ux .mind-card:nth-child(5){display:none!important}.home-mind-service-ux .mind-card{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;text-align:center!important;gap:8px!important;color:#183B6B!important;font-weight:850!important;font-size:12px!important;letter-spacing:-.03em!important;background:transparent!important;border:0!important;border-radius:0!important;padding:0!important;box-shadow:none!important}.home-mind-service-ux .mind-icon{width:48px!important;height:48px!important;border-radius:17px!important;border:1px solid rgba(37,99,235,.22)!important;background:#fff!important;color:#183B6B!important}.home-mind-service-ux .mind-icon svg{width:27px!important;height:27px!important;stroke:#183B6B!important;stroke-width:1.75!important}.home-mind-service-ux .mind-card b{margin:0!important;font-size:12px!important;font-weight:850!important;letter-spacing:-.03em!important;color:#183B6B!important}.home-mind-service-ux .mind-card p,.home-mind-service-ux .mind-card span:last-child{display:none!important}@media(max-width:640px){.home-mind-service-ux .mind-grid{grid-template-columns:repeat(4,1fr)!important;gap:14px 4px!important}.home-mind-service-ux .mind-icon{width:42px!important;height:42px!important;border-radius:15px!important}.home-mind-service-ux .mind-icon svg{width:24px!important;height:24px!important}.home-mind-service-ux .mind-card b{font-size:11px!important}}</style></head>`
    );
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
