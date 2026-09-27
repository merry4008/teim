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
    return rewriteHtmlNavigation(response, url.pathname);
  },
};

function rewriteHtmlNavigation(response, pathname) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  return response.text().then((html) => {
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

    const item = (key, href, label) =>
      `<a${active === key ? ' class="active"' : ""} data-nav="${key}" href="${href}">${label}</a>`;

    const nav = `<nav class="bottom-nav">${item("home", "index.html", "홈")}${item("test", "test.html", "마음비움")}${item("space", "space.html", "공간비움")}${item("challenge", "challenge.html", "챌린지")}${item("action", "action.html", "바로시작")}${item("program", "program.html", "문의")}</nav>`;

    const rewritten = html.includes('class="bottom-nav"')
      ? html.replace(/<nav class="bottom-nav">[\s\S]*?<\/nav>/, nav)
      : html.replace("</body>", `${nav}</body>`);

    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    return new Response(rewritten, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  });
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
        title: "오늘의 기본 트임 미션",
        emotion: "날씨를 불러오지 못했지만, 오늘도 작게 시작할 수 있어요.",
        action: "눈에 가장 먼저 들어오는 물건 5개만 제자리로 돌려놓아 보세요.",
        tag: "기본 미션",
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
      action: "신발장이나 옷장 문을 열고 10분만 환기한 뒤, 눅눅하거나 냄새나는 물건 1개만 따로 빼두세요.",
      tag: "옷장·신발장 점검",
    };
  }

  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return {
      title: "비 오는 날엔 작은 구역부터",
      emotion: "비 오는 날에는 움직임이 줄고 마음도 조금 가라앉을 수 있어요. 오늘은 넓은 공간보다 손이 닿는 작은 곳이 잘 맞습니다.",
      action: "침대 옆, 책상 위, 식탁 위 중 한 곳만 골라 눈에 보이는 물건 5개를 제자리로 돌려놓으세요.",
      tag: "작은 공간 정리",
    };
  }

  if (temperature >= 28) {
    return {
      title: "더운 날엔 가볍게만",
      emotion: "더운 날에는 정리를 시작하기도 전에 피로감이 먼저 올 수 있어요. 오래 걸리는 정리보다 땀이 나지 않는 정리가 좋습니다.",
      action: "냉장고 문 쪽이나 책상 서랍처럼 오래 움직이지 않아도 되는 공간 하나만 정리하세요.",
      tag: "가벼운 정리",
    };
  }

  if (temperature <= 5) {
    return {
      title: "추운 날엔 앉아서 정리해요",
      emotion: "추운 날에는 몸이 움츠러들면서 정리 의욕도 같이 줄어들 수 있어요. 따뜻한 자리에서 할 수 있는 정리가 좋습니다.",
      action: "가방 속 물건, 영수증, 종이류처럼 앉아서 할 수 있는 물건 10개만 분류해보세요.",
      tag: "종이·가방 정리",
    };
  }

  if (windSpeed >= 25) {
    return {
      title: "마음이 산만한 날엔 제자리부터",
      emotion: "바람이 강한 날에는 괜히 마음도 산만하게 느껴질 수 있어요. 새로운 정리보다 흐트러진 것을 다시 잡아주는 정리가 좋습니다.",
      action: "현관 주변의 신발, 우산, 가방 중 하나만 골라 제자리를 정해주세요.",
      tag: "현관 정리",
    };
  }

  return {
    title: "작은 기준을 만들기 좋은 날",
    emotion: "오늘은 무리하지 않고 작은 루틴을 만들기 좋은 날이에요. 완벽하게 치우기보다 다시 어지러워지지 않는 기준 하나를 만드는 게 좋습니다.",
    action: "가장 자주 쓰는 물건 3개의 자리를 정하고, 오늘 하루만 그 자리에 다시 놓아보세요.",
    tag: "루틴 만들기",
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
