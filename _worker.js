import { handleCmsAuth } from "./cms-auth.js";
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (["/api/cms/status", "/api/cms/auth", "/api/cms/callback"].includes(url.pathname)) return handleCmsAuth(request, env);
    if (url.pathname === "/admin") return Response.redirect(url.origin + "/admin/", 302);
    if (url.pathname.startsWith("/admin/")) {
      const asset = await env.ASSETS.fetch(new Request(url.toString(), request));
      const headers = new Headers(asset.headers);
      headers.set("cache-control", "no-store");
      headers.set("x-frame-options", "DENY");
      headers.set("x-content-type-options", "nosniff");
      headers.set("referrer-policy", "same-origin");
      return new Response(asset.body, {status: asset.status, headers});
    }

    if (url.pathname === "/api/weather-mission") return handleWeatherMission(request);
    if (url.pathname === "/api/teim-ai") return handleTeimAi(request, env);
    if (url.pathname === "/api/space-scan") return handleSpaceScan(request, env);
    if (url.pathname === "/api/clothing-bins") return handleClothingBins(request, env);
    if (url.pathname === "/api/clothing-bins/geocode") return handleClothingBinsGeocode(request, env);
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

    const active = pathname.includes("test.html") ? "test" : pathname.includes("space.html") || pathname.includes("clothing-bins.html") ? "space" : pathname.includes("challenge.html") ? "challenge" : pathname.includes("action.html") ? "action" : pathname.includes("program.html") ? "program" : "home";
    if (active === "home" && !pageHtml.includes('data-home-version="2"')) pageHtml = enhanceHome(pageHtml);

    if (!pageHtml.includes("mission-record-link-style")) {
      pageHtml = pageHtml.replace("</head>", `<style id="mission-record-link-style">.mission-record-link{background:#FFC928!important;color:#183B6B!important;text-decoration:none}.mission-record-link span{background:#fff!important;color:#183B6B!important}.mission-record-link strong{color:#183B6B!important}</style></head>`);
    }

    if (!pageHtml.includes('teum-design.css')) pageHtml = pageHtml.replace('</head>', '<link rel="stylesheet" href="teum-design.css?v=20261004-1" /></head>');
    if (active !== "test") pageHtml = injectTeumBottomNav(pageHtml);
    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    return new Response(pageHtml, { status: response.status, statusText: response.statusText, headers });
  });
}

function injectTeumBottomNav(html) {
  const oldNavScript = /<script\b[^>]*src=["'][^"']*teum-bottom-nav\.js[^"']*["'][^>]*>\s*<\/script>/gi;
  const cleanHtml = html.replace(oldNavScript, "");
  const scriptTag = '<script src="/teum-bottom-nav.js?v=20261008-1" defer></script>';
  const bodyEnd = cleanHtml.toLowerCase().lastIndexOf("</body>");
  if (bodyEnd < 0) return cleanHtml + scriptTag;
  return cleanHtml.slice(0, bodyEnd) + scriptTag + cleanHtml.slice(bodyEnd);
}

function enhanceHome(pageHtml) {
  let html = pageHtml.replace(/부모·가족/g, "가족");
  html = html.replace(/<section class="mind-section( home-mind-service-ux)?">/g, '<section class="mind-section home-mind-service-ux">');
  html = html.replace(/(<section class="service-section">[\s\S]*?<\/section>)\s*(<section class="mind-section home-mind-service-ux">[\s\S]*?<\/section>)/, "$2\n$1");
  return html;
}

async function handleSpaceScan(request, env) {
  if (request.method !== "POST") return privateJsonResponse({ ok:false, message:"POST 요청만 지원합니다." }, 405);
  let body = {};
  try { body = await request.json(); } catch (_) { return privateJsonResponse({ ok:false, message:"요청 형식이 올바르지 않습니다." }, 400); }

  const image = String(body.image || "");
  const selectedSpace = ["침실","거실","주방","책상","옷장","기타"].includes(String(body.space || "")) ? String(body.space) : "";
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(image)) {
    return privateJsonResponse({ ok:false, message:"공간 사진이 필요합니다." }, 400);
  }
  if (image.length > 1600000) {
    return privateJsonResponse({ ok:false, message:"테스트용 이미지가 너무 큽니다. 사진을 다시 선택해주세요." }, 413);
  }
  if (!env.AI || typeof env.AI.run !== "function") {
    return privateJsonResponse({
      ok:true, mode:"unavailable", diagnostic:"binding",
      result:{ shotType:"unknown", summary:"무료 AI 연결을 준비 중이에요.", points:[] }
    });
  }

  function visionText(response) {
    if (!response) return "";
    if (typeof response === "string") return response;
    if (typeof response.response === "string") return response.response;
    if (typeof response.answer === "string") return response.answer;
    if (typeof response.text === "string") return response.text;
    if (response.choices && response.choices[0] && response.choices[0].message) {
      const content=response.choices[0].message.content;
      if (typeof content === "string") return content;
      if (Array.isArray(content)) return content.map(x=>x && (x.text || x.content || "")).join("\n");
    }
    return "";
  }

  function clamp(n,min,max,fallback) {
    n=Number(n);
    return Number.isFinite(n) ? Math.max(min,Math.min(max,n)) : fallback;
  }

  function parseTargets(text) {
    text=String(text||"").trim();
    const lines=text.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
    let shotType="unknown";
    let valid=true;
    const first=lines[0]||"";
    if (/^INVALID/i.test(first)) valid=false;
    if (/\bcloseup\b/i.test(first)) shotType="closeup";
    else if (/\bwide\b/i.test(first)) shotType="wide";

    const points=[];
    for (const line of lines) {
      const m=line.match(/^(?:TARGET\s*)?(\d)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*(\d+(?:\.\d+)?)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*(\d+(?:\.\d+)?)/i);
      if (!m) continue;
      points.push({
        anchor:m[2].trim().slice(0,60),
        evidence:m[3].trim().slice(0,180),
        confidence:clamp(m[4],0,100,60),
        x:clamp(m[5],0,100,50),
        y:clamp(m[6],0,100,50),
        w:clamp(m[7],5,95,22),
        h:clamp(m[8],5,95,22)
      });
      if (points.length>=3) break;
    }
    return {valid,shotType,points};
  }

  function organizePoint(p) {
    const key=(p.anchor+" "+p.evidence).toLowerCase();
    let method="제자리", criteria=["가시성","유지용이성"], duration=3;

    if (/(쓰레기|포장|포장지|비닐|휴지|빈병|빈 병|페트병|trash|wrapper|packaging|empty bottle)/i.test(key)) {
      method="비우기"; criteria=["가시성","위생·안전"]; duration=2;
    } else if (/(옷|의류|수건|침구|양말|clothes|shirt|towel|sock)/i.test(key)) {
      method="접기·세우기"; criteria=["종류분류","유지용이성"]; duration=5;
    } else if (/(책|서류|종이|문구|화장품|케이블|충전|선|안경|이어버드|book|paper|stationery|cable|cosmetic|glasses|earbud)/i.test(key)) {
      method="같은종류"; criteria=["종류분류","사용빈도"]; duration=4;
    } else if (/(책상|테이블|선반|서랍|바닥|침대|화장대|구역|desk|table|shelf|drawer|floor|bed|surface|area)/i.test(key)) {
      method="구역나누기"; criteria=["공간목적","가시성"]; duration=5;
    }

    let title,action,reason;
    if (method==="비우기") {
      title=p.anchor+"부터 비우기";
      action="사진 속 ‘"+p.anchor+"’부터 확인해서 버려도 되는 것만 먼저 비워주세요.";
      reason="바로 비울 수 있는 항목을 먼저 줄이면 공간 변화가 가장 빨리 보여요.";
    } else if (method==="접기·세우기") {
      title=p.anchor+" 정돈하기";
      action="사진 속 ‘"+p.anchor+"’을 같은 종류끼리 모아 접거나 세워 한 구역에 정리해보세요.";
      reason="형태와 방향을 맞추면 공간을 덜 차지하고 다시 흐트러지기도 어려워요.";
    } else if (method==="같은종류") {
      title=p.anchor+" 한곳에 모으기";
      action="사진 속 ‘"+p.anchor+"’과 같은 종류를 한곳에 모으고 자주 쓰는 것만 가까이에 남겨주세요.";
      reason="같은 종류가 흩어져 있으면 찾고 되돌려놓는 시간이 늘어나기 때문에 먼저 묶어주는 게 좋아요.";
    } else if (method==="구역나누기") {
      title=p.anchor+" 범위부터 정리하기";
      action="사진 속 ‘"+p.anchor+"’ 범위만 정해서 필요한 것과 다른 곳으로 옮길 것을 나눠보세요.";
      reason="공간 전체가 아니라 작은 구역 하나만 끝내면 부담이 줄고 유지하기도 쉬워요.";
    } else {
      title=p.anchor+" 제자리 정하기";
      action="사진 속 ‘"+p.anchor+"’이 사용 후 바로 돌아갈 한 자리를 정해주세요.";
      reason="제자리가 정해진 물건은 다시 쌓이거나 흩어질 가능성이 줄어들어요.";
    }

    return {...p,method,criteria,title,action,reason,duration};
  }

  async function detect(rescue=false) {
    const prompt = rescue ? [
      "Inspect the image carefully.",
      "Find exactly ONE clearly visible movable object or small surface that can be organized.",
      "A bottle, phone, earbud case, pouch, glasses, book, cable, desk surface, shelf, drawer or floor area all count.",
      "If any such object or surface is visible, DO NOT return INVALID.",
      "Return exactly 2 lines:",
      "VALID|wide or VALID|closeup",
      "1|Korean target name|Korean visual evidence|confidence 0-100|center x 0-100|center y 0-100|width 5-95|height 5-95",
      "No markdown. No JSON. No extra text."
    ].join("\n") : [
      "Inspect this photo and find 1 to 3 clearly visible objects or small areas that could be organized.",
      "Wide room photos and close-up desk/shelf/floor photos are both valid.",
      "A bottle, phone, earbud case, pouch, glasses, book, cable, cosmetics, desk surface, shelf, drawer or floor area all count.",
      "If at least one object or usable surface is visible, you MUST return at least one target.",
      "Use only what is actually visible. Do not invent hidden objects.",
      "Return plain text lines ONLY in this exact format:",
      "VALID|wide or VALID|closeup",
      "1|Korean target name|Korean visual evidence|confidence 0-100|center x 0-100|center y 0-100|width 5-95|height 5-95",
      "2|... optional",
      "3|... optional",
      "If the image is genuinely unreadable, return only INVALID|unknown.",
      "No markdown. No JSON. No commentary."
    ].join("\n");

    const response=await env.AI.run("@cf/qwen/qwen3.8-27b",{
      messages:[{
        role:"user",
        content:[
          {type:"image_url",image_url:{url:image}},
          {type:"text",text:prompt+(selectedSpace?"\nThe user selected "+selectedSpace+" as the room. Use it only as context and identify only objects visible in the image.":"")}
        ]
      }],
      reasoning_effort:"low",
      temperature:0,
      max_completion_tokens:420,
      stream:false
    });

    return parseTargets(visionText(response));
  }

  try {
    let detection=await detect(false);
    let mode="qwen_vision";

    if (!detection.points.length && detection.valid) {
      detection=await detect(true);
      mode="qwen_vision_retry";
    }

    if (!detection.points.length) {
      return privateJsonResponse({
        ok:true,
        mode:"no_vision",
        diagnostic:detection.valid ? "vision_empty" : "invalid_photo",
        result:{
          shotType:detection.shotType,
          summary:detection.valid
            ? "사진은 읽었지만 정리 대상을 특정하지 못했어요. 같은 사진으로 다시 체크해주세요."
            : "사진에서 공간이나 물건을 확인하기 어려웠어요.",
          points:[]
        }
      });
    }

    const points=detection.points.map(organizePoint);
    return privateJsonResponse({
      ok:true,
      mode,
      result:{
        shotType:detection.shotType,
        summary:"사진에서 실제로 보이는 정리 포인트 "+points.length+"개를 찾았어요.",
        points
      }
    });
  } catch (error) {
    const reason=String(error && error.message || "");
    const diagnostic=/3036|429/.test(reason) ? "free_limit" :
      /3040/.test(reason) ? "capacity" :
      /403|5035/.test(reason) ? "plan" : "upstream";
    return privateJsonResponse({
      ok:true,
      mode:"unavailable",
      diagnostic,
      result:{
        shotType:"unknown",
        summary:diagnostic==="free_limit"
          ? "오늘 무료 AI 사용량을 모두 사용했어요."
          : "사진 분석 연결이 잠시 불안정해요. 같은 사진으로 다시 체크해주세요.",
        points:[]
      }
    });
  }
}

async function handleTeimAi(request, env) {
  if (request.method !== "POST") return privateJsonResponse({ ok: false, message: "POST 요청만 지원합니다." }, 405);
  let body = {};
  try { body = await request.json(); } catch (e) { return privateJsonResponse({ ok: false, message: "요청 형식이 올바르지 않습니다." }, 400); }

  const state = String(body.state || "").slice(0, 160);
  const minutes = [3, 10, 20].includes(Number(body.minutes)) ? Number(body.minutes) : 3;
  const history = Array.isArray(body.history) ? body.history.slice(-5).map((x) => ({
    title: String((x && x.title) || "").slice(0, 80),
    category: String((x && x.category) || "").slice(0, 30),
    completedAt: String((x && x.completedAt) || "").slice(0, 40)
  })) : [];
  const challengeDone = Math.max(0, Math.min(14, Number(body.challengeDone) || 0));
  const excludeTitle = String(body.excludeTitle || "").slice(0, 80);

  if (!state) return privateJsonResponse({ ok: false, message: "오늘 상태를 선택해주세요." }, 400);

  const fallback = createFallbackAiMission({ state, minutes, history, excludeTitle });
  if (!env.OPENAI_API_KEY) return privateJsonResponse({ ok: true, mode: "fallback", mission: fallback });

  const systemPrompt = [
    "너는 정리·비움 플랫폼 '트임'의 오늘의 비움 추천 AI다.",
    "사용자의 현재 상태, 가능한 시간, 최근 완료 기록을 보고 지금 바로 실행할 수 있는 단 하나의 구체적인 행동만 추천한다.",
    "규칙:",
    "1. 반드시 미션 하나만 추천한다.",
    "2. 사용자가 선택한 시간을 넘지 않는다.",
    "3. 최근 기록 및 제외 미션과 같은 행동을 가능하면 반복하지 않는다.",
    "4. '추억 물건', '마음 정리', '필요 없는 것'처럼 판단하기 어려운 추상어만으로 지시하지 않는다. 무엇을 어디서 몇 개/어디까지 할지 구체적으로 쓴다.",
    "5. 대청소, 고강도 작업, 물건 대량 폐기를 요구하지 않는다.",
    "6. 사용자가 지쳤다면 앉아서 하거나 3분 안에 끝낼 수 있는 쉬운 행동을 우선한다.",
    "7. 가족·동거인의 물건을 허락 없이 버리거나 옮기라고 하지 않는다.",
    "8. 위험물, 약, 중요 문서, 신분증, 금융자료 등 안전·법률상 주의가 필요한 물건을 버리라고 하지 않는다.",
    "9. 사용자의 심리 상태를 진단하거나 치료한다고 표현하지 않는다.",
    "10. 20~30대가 부담 없이 읽는 짧고 명확한 한국어를 쓴다.",
    "11. reason은 추천 이유를 1문장으로 설명하며 과도한 심리 해석을 하지 않는다."
  ].join("\\n");

  const payload = {
    state,
    available_minutes: minutes,
    recent_completed_missions: history,
    teim_record_days: challengeDone,
    do_not_repeat: excludeTitle || null
  };

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        store: false,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(payload) }
        ],
        max_output_tokens: 450,
        text: {
          format: {
            type: "json_schema",
            name: "teim_daily_mission",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                target: { type: "string" },
                action: { type: "string" },
                reason: { type: "string" },
                duration: { type: "integer", minimum: 1, maximum: 20 },
                category: { type: "string", enum: ["공간비움", "디지털비움", "일상비움", "마음비움"] }
              },
              required: ["title", "target", "action", "reason", "duration", "category"]
            }
          }
        }
      })
    });

    if (!aiResponse.ok) throw new Error("OpenAI response error: " + aiResponse.status);
    const data = await aiResponse.json();
    const text = extractOpenAiText(data);
    if (!text) throw new Error("Empty AI response");
    const mission = JSON.parse(text);
    mission.duration = Math.min(minutes, Math.max(1, Number(mission.duration) || minutes));
    return privateJsonResponse({ ok: true, mode: "ai", mission });
  } catch (error) {
    return privateJsonResponse({ ok: true, mode: "fallback", mission: fallback });
  }
}

function extractOpenAiText(data) {
  if (data && typeof data.output_text === "string" && data.output_text) return data.output_text;
  const output = data && Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    const content = item && Array.isArray(item.content) ? item.content : [];
    for (const part of content) {
      if (part && part.type === "output_text" && typeof part.text === "string") return part.text;
    }
  }
  return "";
}

function createFallbackAiMission({ state, minutes, history, excludeTitle }) {
  const pools = {
    "머리가 복잡해요": [
      { title: "화면부터 세 칸 비우기", target: "휴대폰 또는 브라우저", action: "지금 필요 없는 탭이나 앱 화면 3개만 닫아주세요.", reason: "생각을 더 정리하려 하지 말고 눈에 들어오는 정보량부터 작게 줄여볼게요.", duration: 3, category: "디지털비움" },
      { title: "책상 A4 한 장만큼 비우기", target: "책상 위", action: "A4 한 장이 놓일 자리만 만들고 그 안의 물건만 제자리로 보내주세요.", reason: "범위를 눈에 보이게 제한하면 시작과 끝이 분명해져요.", duration: 10, category: "공간비움" }
    ],
    "몸이 지쳤어요": [
      { title: "앉아서 가방 하나만 비우기", target: "오늘 쓴 가방", action: "가방 안 영수증과 포장지만 꺼내 버려주세요.", reason: "움직임을 최소화하고 판단이 쉬운 것만 골라 빠르게 끝내요.", duration: 3, category: "공간비움" },
      { title: "침대 옆 세 개만 제자리로", target: "침대 주변", action: "가장 가까운 물건 3개만 원래 자리로 보내주세요.", reason: "오늘은 넓게 정리하지 않고 손 닿는 범위만 끝내는 편이 좋아요.", duration: 10, category: "공간비움" }
    ],
    "뭔가 정리하고 싶어요": [
      { title: "서랍 한 칸만 끝내기", target: "자주 여는 서랍 한 칸", action: "서랍 한 칸에서 쓰레기만 버리고 같은 종류끼리 모아주세요.", reason: "정리하고 싶은 에너지를 한 칸에만 써서 완료감을 남겨요.", duration: 20, category: "공간비움" },
      { title: "컵과 그릇만 제자리로", target: "지금 보이는 테이블", action: "테이블 위 컵과 그릇만 골라 싱크대로 옮겨주세요.", reason: "한 종류만 골라 움직이면 짧은 시간에도 변화가 바로 보여요.", duration: 10, category: "공간비움" }
    ],
    "그냥 하나 끝내고 싶어요": [
      { title: "스크린샷 다섯 장 지우기", target: "휴대폰 사진첩", action: "최근 스크린샷에서 다시 볼 일 없는 사진 5장만 삭제해주세요.", reason: "시작과 끝이 분명한 작은 작업 하나를 바로 완료해요.", duration: 3, category: "디지털비움" },
      { title: "현관 신발 두 켤레만 맞추기", target: "현관", action: "지금 가장 흐트러진 신발 2켤레만 가지런히 맞춰주세요.", reason: "결과가 바로 보이는 행동 하나로 오늘의 완료를 만들어요.", duration: 3, category: "공간비움" }
    ]
  };
  const pool = pools[state] || pools["그냥 하나 끝내고 싶어요"];
  const used = new Set((history || []).map((x) => x.title).concat(excludeTitle ? [excludeTitle] : []));
  let candidates = pool.filter((x) => x.duration <= minutes && !used.has(x.title));
  if (!candidates.length) candidates = pool.filter((x) => x.duration <= minutes);
  if (!candidates.length) candidates = pool;
  const chosen = { ...candidates[0] };
  chosen.duration = Math.min(minutes, chosen.duration);
  return chosen;
}

function privateJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
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

// Deploy trigger: mobile bottom navigation SVG icons (2026-10-01).


/* TEUM: clothing collection bins. Official nationwide public data / Kakao keyword fallback.
   Secrets are Worker runtime bindings only: DATA_GO_KR_SERVICE_KEY, KAKAO_REST_API_KEY.
   Do not cache user coordinates or search terms; only publicly available bins are cached. */
const TEUM_BINS_SOURCE = "https://www.data.go.kr/data/15139214/standard.do";
const TEUM_BINS_COLUMNS = {
  name: ["INSTL_PLC_NM", "instlPlcNm", "설치장소명"],
  region: ["CTPV_NM", "ctpvNm", "시도명"],
  district: ["SGG_NM", "sggNm", "시군구명"],
  address: ["LCTN_ROAD_NM_ADDR", "lctnRoadNmAddr", "소재지도로명주소"],
  lotAddress: ["LCTN_LOTNO_ADDR", "lctnLotnoAddr", "소재지지번주소"],
  lat: ["LAT", "lat", "latitude", "LATITUDE", "위도"],
  lng: ["LOT", "lot", "lng", "LONGITUDE", "경도", "longitude"],
  detail: ["DTL_PSTN", "dtlPstn", "상세위치"],
  date: ["DATA_CRTR_YMD", "dataCrtrYmd", "crtrYmd", "데이터기준일자"],
  authority: ["MNG_INST_NM", "mngInstNm", "관리기관명"]
};
function teumBinField(item, keys) {
  for (const k of keys) if (item && item[k] != null && String(item[k]).trim()) return String(item[k]).trim();
  return "";
}
function teumBinNum(value) { if (value === "" || value == null) return null; const n = Number(value); return Number.isFinite(n) ? n : null; }
function teumBinKm(a, b, x, y) {
  const radians = Math.PI / 180;
  const dlat = (x - a) * radians, dlng = (y - b) * radians;
  const h = Math.sin(dlat/2)**2 + Math.cos(a*radians) * Math.cos(x*radians) * Math.sin(dlng/2)**2;
  return 12742 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}
function teumBinsResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff" } });
}
function teumBinKey(env) {
  let key = String(env.DATA_GO_KR_SERVICE_KEY || env.DATA_GO_KR_API_KEY || "").trim();
  if (/%[0-9a-fA-F]{2}/.test(key)) { try { key = decodeURIComponent(key); } catch (_) {} }
  return key;
}
function teumBinNormalize(row, index) {
  const f = TEUM_BINS_COLUMNS;
  const lat = teumBinNum(teumBinField(row,f.lat)), lng = teumBinNum(teumBinField(row,f.lng));
  const region = teumBinField(row,f.region), district = teumBinField(row,f.district);
  const address = teumBinField(row,f.address) || teumBinField(row,f.lotAddress);
  const detail = teumBinField(row,f.detail);
  const name = teumBinField(row,f.name) || (detail || "의류수거함");
  if (!address && !detail && (lat === null || lng === null)) return null;
  if (lat !== null && (lat < 33 || lat > 39)) return null;
  if (lng !== null && (lng < 124 || lng > 132)) return null;
  return {id:"official-"+index,name,region,district,address,detail,lat,lng,referenceDate:teumBinField(row,f.date),authority:teumBinField(row,f.authority),source:"official"};
}
/* Parse RFC4180-ish CSV: quoted commas, escaped quotes and multiline cells. */
function teumBinCsv(text) {
  const source=String(text||"").replace(/^\uFEFF/,""); const rows=[]; let row=[],field="",quoted=false;
  for(let i=0;i<source.length;i++) {
    const ch=source[i];
    if(ch==='"') {if(quoted && source[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
    else if(ch===','&&!quoted){row.push(field);field="";}
    else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&source[i+1]==='\n')i++;row.push(field);field="";if(row.some(v=>String(v).trim()))rows.push(row);row=[];}
    else field+=ch;
  }
  row.push(field);if(row.some(v=>String(v).trim()))rows.push(row);
  const header=(rows.shift()||[]).map(v=>v.trim().replace(/^\uFEFF/,""));
  if(!header.length || !header.some(h=>/설치|위도|소재지|instl|latitude|lat/i.test(h)))throw new Error("OFFICIAL_FORMAT");
  return rows.map(c=>Object.fromEntries(header.map((h,i)=>[h,(c[i]||"").trim()])));
}
function teumBinRows(raw) {
  const body=raw?.response?.body || raw?.body || raw;
  const rows=body?.items?.item ?? body?.items ?? body?.data ?? raw?.data ?? (Array.isArray(raw)?raw:null);
  if(Array.isArray(rows))return rows;
  if(rows&&typeof rows==="object")return [rows];
  throw new Error("OFFICIAL_FORMAT");
}
/* Official nationwide API. The private service key is never returned to the browser. */
const TEUM_BINS_API = "https://api.data.go.kr/openapi/tn_pubr_public_clothing_collect_bins_api";
function teumBinParseOfficialJson(raw) {
  const code=String(raw?.response?.header?.resultCode ?? raw?.response?.header?.resultCd ?? "00");
  if(!["00","0","NORMAL_SERVICE","NORMAL_CODE"].includes(code))throw new Error("OFFICIAL_RESULT_"+code);
  const body=raw?.response?.body || raw?.body || raw;
  const total=Number(body?.totalCount ?? body?.total_count);
  const empty=Number.isFinite(total)&&total===0;
  const rows=empty&&body?.items==null?[]:teumBinRows(raw);
  return {rows,total:Number.isFinite(total)&&total>=0?total:null};
}
async function teumBinFetchOfficialPage(key,page,pageSize){
  const url=new URL(TEUM_BINS_API);
  url.search=new URLSearchParams({serviceKey:key,pageNo:String(page),numOfRows:String(pageSize),type:"json"}).toString();
  const response=await fetch(url.toString(),{headers:{Accept:"application/json"},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error("OFFICIAL_UPSTREAM_"+response.status);
  const rawText=await response.text();
  if(rawText.length>4000000)throw new Error("OFFICIAL_PAGE_TOO_LARGE");
  let raw;try{raw=JSON.parse(rawText);}catch(_){throw new Error("OFFICIAL_JSON_ERROR");}
  return teumBinParseOfficialJson(raw);
}
async function teumBinFetchOfficialApi(env){
  const key=teumBinKey(env);if(!key)throw new Error("OFFICIAL_KEY_MISSING");
  const pageSize=1000,maxPages=40;const all=[];let expected=null;
  for(let page=1;page<=maxPages;page++){
    const {rows,total}=await teumBinFetchOfficialPage(key,page,pageSize);
    if(expected===null&&total!==null)expected=total;
    all.push(...rows);
    if((expected!==null&&all.length>=expected)||rows.length<pageSize)return all;
  }
  throw new Error("OFFICIAL_PAGE_LIMIT"); /* Never present truncated results. */
}
async function teumBinFetchConfiguredFile(request,env){
  const configured=String(env.CLOTHING_BINS_DATA_URL||"").trim();
  let upstream;
  if(configured){
    const src=new URL(configured);
    if(src.protocol!=="https:"||!["www.data.go.kr","data.go.kr","api.data.go.kr","apis.data.go.kr","api.odcloud.kr"].includes(src.hostname))throw new Error("OFFICIAL_SOURCE_NOT_ALLOWED");
    if(src.hostname==="api.data.go.kr"||src.hostname==="apis.data.go.kr"){
      const key=teumBinKey(env);
      if(key&&!src.searchParams.has("serviceKey"))src.searchParams.set("serviceKey",key);
    }
    upstream=await fetch(src.toString(),{headers:{Accept:"application/json,text/csv,text/plain"},signal:AbortSignal.timeout(15000)});
  }else{
    upstream=await env.ASSETS.fetch(new Request(new URL("/clothing-bins-data.csv",request.url).toString()));
    if(!upstream.ok)throw new Error("OFFICIAL_NOT_CONFIGURED");
  }
  if(!upstream.ok)throw new Error("OFFICIAL_UPSTREAM_"+upstream.status);
  const content=await upstream.text();
  if(content.length>15000000)throw new Error("OFFICIAL_TOO_LARGE");
  const type=(upstream.headers.get("content-type")||"").toLowerCase();
  if(type.includes("json")||/^\s*[\[{]/.test(content)){
    let parsed;try{parsed=JSON.parse(content);}catch(_){throw new Error("OFFICIAL_FORMAT");}
    return teumBinParseOfficialJson(parsed).rows;
  }
  return teumBinCsv(content);
}
async function teumBinOfficialData(request,env){
  const cache=typeof caches!=="undefined"?caches.default:null;
  const cacheRequest=new Request(new URL("/__internal/teum-clothing-bins-dataset-api-v3",request.url).toString());
  if(cache){const hit=await cache.match(cacheRequest);if(hit){try{const cached=await hit.json();if(Array.isArray(cached)&&cached.length)return cached;}catch(_){}}}
  let rows,primaryError=null;
  if(teumBinKey(env)){try{rows=await teumBinFetchOfficialApi(env);}catch(err){primaryError=err;}}
  if(!Array.isArray(rows)||!rows.length){
    try{rows=await teumBinFetchConfiguredFile(request,env);}
    catch(fallbackError){throw primaryError||fallbackError;}
  }
  const cleaned=rows.map(teumBinNormalize).filter(Boolean);
  if(!cleaned.length)throw new Error("OFFICIAL_EMPTY");
  if(cache){try{await cache.put(cacheRequest,new Response(JSON.stringify(cleaned),{headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=43200"}}));}catch(_){}}
  return cleaned;
}
async function teumBinKakaoSearch(lat, lng, radius, env) {
  const key = String(env.KAKAO_REST_API_KEY || "").trim();
  if (!key) return [];
  const queries = ["헌옷수거함", "의류수거함"];
  const found = [];
  const unique = new Set();
  for (const query of queries) {
    const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
    url.search = new URLSearchParams({query,x:String(lng),y:String(lat),radius:String(Math.min(radius,20000)),size:"15",page:"1",sort:"distance"}).toString();
    const response = await fetch(url.toString(), {headers:{Authorization:"KakaoAK "+key},signal:AbortSignal.timeout(9000)});
    if (!response.ok) continue;
    const result = await response.json();
    for (const p of (Array.isArray(result.documents) ? result.documents : [])) {
      if (!/의류\s*수거함|헌옷\s*수거함|헌의류\s*수거함/.test(p.place_name || "")) continue;
      const itemLat = teumBinNum(p.y), itemLng = teumBinNum(p.x);
      if (itemLat === null || itemLng === null || itemLat < 33 || itemLat > 39 || itemLng < 124 || itemLng > 132) continue;
      const id = String(p.id || (itemLat+","+itemLng));
      if (unique.has(id)) continue;
      unique.add(id);
      found.push({id:"kakao-"+id,name:p.place_name,address:p.road_address_name || p.address_name || "",detail:"",region:"",district:"",lat:itemLat,lng:itemLng,referenceDate:"",authority:"",placeUrl:/^https:\/\/place\.map\.kakao\.com\/\d+$/.test(p.place_url || "")?p.place_url:"",source:"kakao"});
    }
  }
  return found;
}
function teumBinResult(item,lat,lng) {
  const km = item.lat != null && item.lng != null && lat != null && lng != null ? teumBinKm(lat,lng,item.lat,item.lng) : null;
  return {...item,distanceMeters:km === null ? null : Math.round(km*1000)};
}
function teumBinTokens(query) {
  const aliases = {서울:"서울특별시",경기:"경기도",인천:"인천광역시",부산:"부산광역시",대구:"대구광역시",대전:"대전광역시",광주:"광주광역시",울산:"울산광역시",세종:"세종특별자치시",강원:"강원특별자치도",충북:"충청북도",충남:"충청남도",전북:"전북특별자치도",전남:"전라남도",경북:"경상북도",경남:"경상남도",제주:"제주특별자치도"};
  return query.split(/\s+/).map(t=>aliases[t] || t).filter(Boolean);
}
async function handleClothingBins(request,env) {
  if (request.method !== "GET") return teumBinsResponse({ok:false,code:"METHOD",message:"GET 요청만 지원합니다."},405);
  const u = new URL(request.url), latRaw = u.searchParams.get("lat"), lngRaw = u.searchParams.get("lng");
  const lat = teumBinNum(latRaw), lng = teumBinNum(lngRaw);
  const hasLocation = latRaw !== null || lngRaw !== null;
  if (hasLocation && (lat === null || lng === null || lat < 33 || lat > 39 || lng < 124 || lng > 132)) return teumBinsResponse({ok:false,code:"INVALID_COORDS",message:"국내 위치 좌표를 확인해주세요."},400);
  const query = String(u.searchParams.get("query") || "").trim().slice(0,80);
  if (!hasLocation && !query) return teumBinsResponse({ok:false,code:"MISSING_SEARCH",message:"현재 위치 또는 검색할 동네를 알려주세요."},400);
  const radius = [1000,3000,5000,10000].includes(Number(u.searchParams.get("radius"))) ? Number(u.searchParams.get("radius")) : 1000;
  const kakaoAvailable = !!String(env.KAKAO_REST_API_KEY || "").trim();
  let official = [], officialFailed = false, missingSource = false;
  try { official = await teumBinOfficialData(request,env); } catch (err) { officialFailed = true; missingSource = String(err?.message || "") === "OFFICIAL_NOT_CONFIGURED"; }
  if (officialFailed && !(kakaoAvailable && hasLocation)) return teumBinsResponse({ok:false,code:missingSource?"DATA_NOT_CONFIGURED":"UPSTREAM_ERROR",message:missingSource?"공식 수거함 데이터가 아직 연결되지 않았습니다. Cloudflare에 DATA_GO_KR_SERVICE_KEY를 Secret으로 등록해주세요.":"공공데이터 조회가 원활하지 않습니다. 인증키 상태와 API 승인 여부를 확인한 뒤 다시 시도해주세요.",sourceUrl:TEUM_BINS_SOURCE,canOpenMap:true},missingSource?503:502);
  let matches = official;
  if (hasLocation) {
    matches = matches.filter(i=>i.lat !== null && i.lng !== null).map(i=>teumBinResult(i,lat,lng)).filter(i=>i.distanceMeters <= radius);
    if (kakaoAvailable) {
      let kakao = [];
      try { kakao = await teumBinKakaoSearch(lat,lng,radius,env); } catch (_) {}
      const already = new Set(matches.map(i=> i.lat != null ? (i.lat.toFixed(4)+":"+i.lng.toFixed(4)):""));
      const extra = kakao.map(i=>teumBinResult(i,lat,lng)).filter(i=>i.distanceMeters <= radius && !already.has(i.lat.toFixed(4)+":"+i.lng.toFixed(4)));
      matches = matches.concat(extra);
    }
    matches.sort((a,b)=>a.distanceMeters-b.distanceMeters);
  } else {
    const tokens = teumBinTokens(query);
    matches = matches.filter(i=>tokens.every(t=>[i.name,i.region,i.district,i.address,i.detail].join(" ").includes(t))).map(i=>teumBinResult(i,null,null));
  }
  return teumBinsResponse({ok:true,items:matches.slice(0,30),count:matches.length,radius:hasLocation?radius:null,sourceUrl:TEUM_BINS_SOURCE,officialConnected:!officialFailed,kakaoConnected:kakaoAvailable,partial:officialFailed,notes:officialFailed?"공식 자료 연결 전이거나 조회가 원활하지 않아 카카오맵 등록 장소만 표시합니다.":"등록 정보와 실제 설치 상태가 다를 수 있으므로 방문 전 확인해주세요."});
}
async function handleClothingBinsGeocode(request,env) {
  if (request.method !== "GET") return teumBinsResponse({ok:false,code:"METHOD"},405);
  const key = String(env.KAKAO_REST_API_KEY || "").trim(), query = String(new URL(request.url).searchParams.get("query") || "").trim().slice(0,80);
  if (query.length < 2) return teumBinsResponse({ok:false,code:"INVALID_QUERY",message:"두 글자 이상 입력해주세요."},400);
  if (!key) return teumBinsResponse({ok:false,code:"GEOCODE_NOT_CONFIGURED",message:"주소 좌표 변환을 사용하려면 카카오 REST API 키가 필요합니다."},503);
  try {
    const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
    url.searchParams.set("query",query);url.searchParams.set("size","1");
    let response = await fetch(url.toString(),{headers:{Authorization:"KakaoAK "+key},signal:AbortSignal.timeout(9000)});
    if (!response.ok) throw new Error("address");
    let data = await response.json(), item = data.documents?.[0];
    if (!item) {
      const backup = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
      backup.searchParams.set("query",query);backup.searchParams.set("size","1");
      response = await fetch(backup.toString(),{headers:{Authorization:"KakaoAK "+key},signal:AbortSignal.timeout(9000)});
      if (!response.ok) throw new Error("keyword");
      data = await response.json(); item = data.documents?.[0];
    }
    const lat = teumBinNum(item?.y), lng = teumBinNum(item?.x);
    if (lat === null || lng === null || lat < 33 || lat > 39 || lng < 124 || lng > 132) return teumBinsResponse({ok:false,code:"NOT_FOUND",message:"입력한 지역의 좌표를 찾지 못했습니다."},404);
    return teumBinsResponse({ok:true,lat,lng,label:item.address_name || item.place_name || query});
  } catch (_) { return teumBinsResponse({ok:false,code:"GEOCODE_ERROR",message:"주소를 확인하지 못했습니다. 지역명을 조금 더 구체적으로 입력해주세요."},502); }
}


