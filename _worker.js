export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/weather-mission") return handleWeatherMission(request);
    if (url.pathname === "/api/teim-ai") return handleTeimAi(request, env);
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
    if (html.includes('data-teum-shell="ai"')) {
      const headers = new Headers(response.headers);
      headers.set("content-type", "text/html; charset=utf-8");
      return new Response(html, { status: response.status, statusText: response.statusText, headers });
    }
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

    const navIcon = (key) => ({
      home: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.8V21h13V9.8"/><path d="M9.5 21v-6h5v6"/></svg>',
      test: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
      space: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7 8 4 8-4"/><path d="M4 7v10l8 4 8-4V7"/><path d="M9 15h6"/></svg>',
      challenge: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h6"/><path d="M9 3h6v4H9z"/><path d="M7 5H5.8A1.8 1.8 0 0 0 4 6.8v13.4h16V6.8A1.8 1.8 0 0 0 18.2 5H17"/><path d="m8 14 2.3 2.3L16 10.6"/></svg>',
      action: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.3 2"/></svg>',
      program: '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2L12 3Z"/><path d="m18.5 13 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/><path d="M5 13.5v6h9"/></svg>'
    })[key] || '';
    const navActive = ["action", "program"].includes(active) ? "space" : active;
    const item = (key, href, label) => `<a${navActive === key ? ' class="active"' : ""} data-nav="${key}" href="${href}">${navIcon(key)}<span class="nav-label">${label}</span></a>`;
    const nav = `<nav class="bottom-nav" aria-label="하단 메뉴">${item("home", "index.html", "홈")}${item("space", "index.html#quickTeimExperience", "비움하기")}${item("test", "test.html", "마음 비움")}${item("challenge", "challenge.html", "트임기록")}</nav>`;

    if (!pageHtml.includes("mission-record-link-style")) {
      pageHtml = pageHtml.replace("</head>", `<style id="mission-record-link-style">.mission-record-link{background:#FFC928!important;color:#183B6B!important;text-decoration:none}.mission-record-link span{background:#fff!important;color:#183B6B!important}.mission-record-link strong{color:#183B6B!important}</style></head>`);
    }

    if (!pageHtml.includes("teum2-nav-style")) pageHtml = pageHtml.replace("</head>", '<style id="teum2-nav-style">.bottom-nav{grid-template-columns:repeat(4,minmax(0,1fr))!important}.bottom-nav .nav-label{white-space:normal!important;line-height:1.2}.bottom-nav a{font-size:12px!important}</style></head>');

    if (!pageHtml.includes('teum-design.css')) pageHtml = pageHtml.replace('</head>', '<link rel="stylesheet" href="teum-design.css?v=20261004-1" /></head>');

    const rewritten = pageHtml.includes('class="bottom-nav"') ? pageHtml.replace(/<nav class="bottom-nav"(?:\s[^>]*)?>[\s\S]*?<\/nav>/, nav) : pageHtml.replace("</body>", `${nav}</body>`);
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
  if (html.includes('id="quickTeimExperience"')) html = html.replace(/<section[^>]*id="quickTeimExperience"[\s\S]*?<\/section>/, quickSection);
  else html = html.replace("</main>", `${quickSection}</main>`);

  if (!html.includes("home-mind-ux-style")) {
    html = html.replace("</head>", `<style id="home-mind-ux-style">.banner-copy h1{font-size:24px!important;line-height:1.18!important}.home-mind-service-ux .mind-grid{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:14px 8px!important}.home-mind-service-ux .mind-card:nth-child(4),.home-mind-service-ux .mind-card:nth-child(5){display:none!important}.home-mind-service-ux .mind-card{display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important;gap:8px!important;color:#183B6B!important;font-weight:850!important;font-size:12px!important;background:transparent!important;border:0!important;border-radius:0!important;padding:0!important;box-shadow:none!important}.home-mind-service-ux .mind-icon{width:48px!important;height:48px!important;border-radius:17px!important;border:1px solid rgba(37,99,235,.22)!important;background:#fff!important;color:#183B6B!important}.home-mind-service-ux .mind-icon svg{width:27px!important;height:27px!important;stroke:#183B6B!important;stroke-width:1.75!important}.home-mind-service-ux .mind-card b{margin:0!important;font-size:12px!important;font-weight:850!important;color:#183B6B!important}.home-mind-service-ux .mind-card p,.home-mind-service-ux .mind-card span:last-child{display:none!important}.quick-teim-panel{margin-top:12px;background:#fff;border:1px solid rgba(37,99,235,.14);border-radius:30px;padding:18px;box-shadow:0 16px 38px rgba(37,99,235,.08)}.quick-teim-card{position:relative;overflow:hidden;border-radius:26px;background:#2563EB;color:#fff;padding:24px 20px;min-height:292px;display:flex;align-items:center;transition:background .28s ease,transform .22s ease}.quick-teim-card[data-step="complete"]{background:#FFC928;color:#183B6B}.quick-stage{width:100%;animation:quickSlide .24s ease}.quick-teim-card.quick-pop{animation:quickPop .3s ease}.quick-stage.result-pop h2{animation:resultBounce .38s ease}.quick-stage .small-label{color:#FFC928;margin:0 0 9px;font-size:12px;font-weight:950;letter-spacing:.12em}.quick-teim-card[data-step="complete"] .small-label{color:#183B6B}.quick-stage h2{margin:0;color:inherit;font-size:31px;line-height:1.12;letter-spacing:-.075em}.quick-stage p{margin:12px 0 0;color:rgba(255,255,255,.86);font-size:14px;line-height:1.55}.quick-teim-card[data-step="complete"] p{color:#183B6B}.quick-time{display:inline-flex;margin-top:14px;border-radius:999px;background:rgba(255,255,255,.14);color:#fff;font-size:12px;font-weight:900;padding:8px 11px}.quick-teim-card[data-step="complete"] .quick-time{background:#fff;color:#183B6B}.quick-main-btn,.quick-done{margin-top:20px;border:0;border-radius:999px;background:#fff;color:#2563EB;font-size:15px;font-weight:1000;padding:14px 18px}.quick-options{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:18px}.quick-options button{border:1px solid rgba(255,255,255,.22);border-radius:18px;background:#fff;color:#183B6B;font-weight:950;font-size:15px;padding:14px 10px;text-align:left}.quick-ghost{margin-top:10px;border:0;background:transparent;color:#fff;font-weight:900;padding:8px;display:block}.quick-teim-card[data-step="complete"] .quick-ghost{color:#183B6B;margin-left:auto;margin-right:auto}.quick-complete-link{display:inline-flex;border-radius:999px;background:#2563EB;color:#fff!important;font-weight:1000;padding:13px 16px;margin-top:16px}.quick-sun{font-size:22px;font-weight:1000;margin-bottom:8px}.quick-next-copy{margin-top:18px!important}.quick-next-copy b{font-weight:1000}@keyframes quickSlide{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}@keyframes quickPop{0%{transform:scale(1)}45%{transform:scale(.985) translateY(3px)}100%{transform:scale(1)}}@keyframes resultBounce{0%{opacity:0;transform:translateY(12px) scale(.98)}60%{opacity:1;transform:translateY(-4px) scale(1.02)}100%{transform:none}}@media(max-width:640px){.banner-copy h1{font-size:22px!important}.home-mind-service-ux .mind-grid{grid-template-columns:repeat(4,1fr)!important;gap:14px 4px!important}.home-mind-service-ux .mind-icon{width:42px!important;height:42px!important;border-radius:15px!important}.home-mind-service-ux .mind-icon svg{width:24px!important;height:24px!important}.home-mind-service-ux .mind-card b{font-size:11px!important}.quick-teim-panel{border-radius:26px;padding:14px}.quick-teim-card{border-radius:24px;padding:22px 18px;min-height:278px}.quick-stage h2{font-size:28px}.quick-options button{font-size:14px;padding:13px 9px}}</style></head>`);
  }

  html = html.replace(/<script id="quick-teim-flow-script">[\s\S]*?<\/script>/g, "");
  html = html.replace("</body>", `${quickScript()}</body>`);
  return html;
}

function quickScript() {
  return `<script id="quick-teim-flow-script">(function(){var card=document.querySelector('[data-quick-card]');var stage=document.querySelector('[data-quick-stage]');if(!card||!stage)return;var state={step:'intro',concern:'work',space:'desk'};var history=[];var aliases={kitchen:'living',entry:'living',bath:'living',transit:'outside'};var current=['💼 브라우저 탭 3개 닫기','다시 볼 것 같아도 일단 닫기. 필요하면 어차피 또 찾습니다 😌'];var base={bed:[['🛏 이불 위 물건 1개 내리기','침대 위에 올라온 것 하나만 내려도 충분해요.'],['📱 휴대폰 뒤집어놓고 1분 있기','일단 화면을 안 보이게만 해볼게요.'],['👕 침대 위 옷 1벌 옷장에 넣기','딱 한 벌만 제자리로 보내요.'],['📚 책 1권 책상에 두기','읽을지 말지는 나중에, 위치만 바꿔요.'],['🔌 충전선 1개 정리하기','꼬인 선 하나만 풀어도 시야가 가벼워져요.'],['🧦 양말 1켤레 빨래통에 넣기','가장 쉬운 것 하나만 움직여요.'],['🧴 침대 옆 물건 1개 서랍에 넣기','보이는 것을 하나만 줄여볼게요.'],['⏰ 알람 1개 끄기','나를 재촉하는 소리 하나를 줄여요.'],['🧻 휴지 1개 버리기','손에 잡히는 쓰레기 하나면 충분해요.'],['💡 조명 밝기 낮추기','공간을 조금 쉬는 모드로 바꿔요.'],['📝 내일 할 일 1개만 메모하기','머릿속에서 하나만 꺼내놓으세요.'],['🧺 침대 밑 물건 1개 빼기','깊게 말고 하나만 꺼내요.'],['📸 사진 1장 숨기기','계속 보이는 장면 하나만 잠깐 숨겨요.'],['🚪 방문 10초 열어두기','공기를 바꾸는 것도 비움이에요.'],['🧘 눈 감고 10초 쉬기','아무것도 안 하는 10초를 만들어보세요.']],desk:[['💼 브라우저 탭 3개 닫기','다시 볼 것 같아도 일단 닫기. 필요하면 어차피 또 찾습니다 😌'],['🗂 파일 3개 폴더에 넣기','바탕화면 복잡함 3개만 접어둘게요.'],['📄 종이 1장 버리기','판단 쉬운 종이 한 장만 비워요.'],['🖊 안 쓰는 펜 1개 서랍에 넣기','책상 위 도구 하나만 줄여요.'],['☕ 컵 1개 주방에 두기','컵 하나만 사라져도 책상이 달라져요.'],['📱 휴대폰 화면 뒤집기','시야에서 알림을 잠깐 빼요.'],['✅ 할 일 1개 삭제하기','오늘 안 해도 되는 것 하나만 덜어요.'],['🧽 책상 한 뼘 닦기','전부 말고 손바닥만큼만 닦아요.'],['🔌 충전기 선 1개 감기','선 하나만 정리해도 훨씬 덜 복잡해요.'],['🧾 영수증 1장 버리기','쌓인 기록 하나만 비워요.'],['🖥 창 1개 최소화하기','화면에 보이는 것 하나만 줄여요.'],['📌 메모 1개 떼기','이미 끝난 메모 하나만 빼요.'],['🎧 이어폰 케이스에 넣기','작은 물건 하나만 자리로 보내요.'],['⬜ A4 한 장 크기만 비우기','책상 전체 말고 한 장만큼만 비워요.'],['📝 지금 해야 할 일 1개만 남기기','나머지는 잠깐 뒤로 보내요.']],living:[['📦 테이블 위 물건 1개 제자리로','거실 전체 말고 하나만 움직여요.'],['☕ 컵 1개 주방에 두기','가장 쉬운 것부터 옮겨요.'],['👕 옷 1벌 방으로 가져가기','내 흔적 하나만 회수해요.'],['🎒 가방 1개 한쪽에 세우기','바닥에 퍼진 느낌을 줄여요.'],['🧾 영수증 1장 버리기','작은 종이 하나만 비워요.'],['📺 TV 1분 끄기','채우는 소리를 잠깐 줄여요.'],['🧸 쿠션 1개 바로 놓기','정리보다 정돈에 가까운 행동이에요.'],['🧻 쓰레기 1개 버리기','보이는 쓰레기 하나만 처리해요.'],['🔌 리모컨 제자리 두기','찾기 쉬운 자리를 하나 만들어요.'],['🧺 빨래 1개 빨래통에 넣기','한 개만 넣어도 시작이에요.'],['📚 책 1권 꽂기','읽을지 말지 말고 위치만 정해요.'],['🍽 접시 1개 싱크대로','가벼운 이동 하나면 충분해요.'],['🚪 현관 신발 1켤레 맞추기','나가는 자리부터 정돈해요.'],['🧴 화장품 1개 욕실로','제자리 하나만 찾아줘요.'],['🌬 창문 10초 열기','공기부터 살짝 바꿔요.']],outside:[['🔕 알림 1개 끄기','나를 부르는 소리 하나를 줄여요.'],['📱 앱 1개 홈 화면에서 빼기','보이는 입구 하나만 줄여요.'],['🌐 탭 3개 닫기','찾다 만 생각 3개를 닫아둘게요.'],['🖼 스크린샷 3장 삭제하기','손 안의 공간을 가볍게 해요.'],['💬 채팅방 1개 알림 끄기','지금 안 봐도 되는 방 하나만 조용히 해요.'],['📧 메일 3개 읽음 처리하기','알림 숫자부터 줄여요.'],['🎧 이어폰 빼고 1분 걷기','계속 채우지 않아도 괜찮아요.'],['📝 해야 할 일 1개만 메모하기','머릿속에서 하나만 꺼내요.'],['⭐ 사진 즐겨찾기 1장 해제','계속 보던 장면 하나만 덜어내요.'],['🚇 휴대폰 10초 내려놓기','이동 중에도 틈은 만들 수 있어요.'],['📍 저장 장소 1개 삭제하기','안 갈 곳 하나만 지워요.'],['🛒 장바구니 1개 삭제하기','살지 말지 고민 하나를 줄여요.'],['🧾 결제 알림 1개 지우기','지나간 알림 하나를 비워요.'],['📆 오늘 안 할 일 1개 내일로','오늘의 나를 조금 덜 몰아붙여요.'],['🌤 하늘 10초 보기','화면 말고 바깥을 잠깐 봐요.']]};var flavor={love:['관계 생각이 떠오르면, 일단 보이는 것 하나만 줄여요.','지금은 끊어내기보다 덜 보이게 하기.','마음이 흔들릴수록 행동은 작게 가요.'],work:['일 생각이 따라올 땐 화면과 알림부터 줄여요.','퇴근 모드로 바꾸는 작은 신호예요.','다 해내기보다 하나 덜어내기.'],family:['가족 전체가 아니라 내 몫 하나만 정리해요.','내 공간의 경계를 작게 세워요.','버리는 게 아니라 제자리로 보내요.'],study:['공부 시작 전, 시작선을 작게 만들어봐요.','계획보다 눈앞 하나가 먼저예요.','미루는 마음엔 아주 작은 행동이 좋아요.'],self:['성과보다 회복을 먼저 둬요.','나를 재촉하는 것을 하나 줄여요.','오늘은 잘하기보다 덜어내기예요.']};var mind={love:['근데 왜 아직 못 놓고 있을까요?','💗 관계 마음비움 해보기 →','test.html?type=love'],work:['퇴근했는데 머리는 아직 출근 중?','💼 일상 마음비움 해보기 →','test.html?type=work'],family:['가족 앞에만 가면 왜 내 페이스가 사라질까?','🏠 가족 마음비움 해보기 →','test.html?type=family'],study:['해야 하는 건 아는데 왜 시작은 안 될까?','📚 해야 할 일 마음비움 해보기 →','test.html?type=study'],self:['쉬고 있는데도 왜 계속 뭔가 해야 할 것 같지?','☀️ 나 자신 마음비움 해보기 →','test.html?type=self']};function render(step,pop){state.step=step;card.dataset.step=step;if(pop){card.classList.remove('quick-pop');void card.offsetWidth;card.classList.add('quick-pop')}var html='';if(step==='intro')html='<p class="small-label">TRY TEIM</p><h2>지금 딱 하나만<br>비워볼까요?</h2><p>지금 내 상태에 맞는 작은 비움 하나를 찾아드려요.</p><span class="quick-time">약 30초 · 바로 시작</span><button class="quick-main-btn" data-next="concern">시작하기 →</button>';if(step==='concern')html='<p class="small-label">STEP 01</p><h2>지금 뭐가<br>제일 막혀요?</h2><div class="quick-options"><button data-concern="love">💗 관계</button><button data-concern="work">💼 일상</button><button data-concern="family">🏠 가족</button><button data-concern="study">📚 해야 할 일</button><button data-concern="self">☀️ 나 자신</button></div>';if(step==='space')html='<p class="small-label">STEP 02</p><h2>지금 어디에<br>있나요?</h2><div class="quick-options"><button data-space="bed">🛏 침대</button><button data-space="desk">🖥 책상</button><button data-space="living">🛋 거실</button><button data-space="kitchen">🍳 주방</button><button data-space="entry">🚪 현관</button><button data-space="bath">🛁 화장실</button><button data-space="outside">🚶 밖</button><button data-space="transit">🚇 이동 중</button></div>';if(step==='result')html='<div class="quick-stage result-pop"><p class="small-label">오늘은 이것 하나만 👀</p><h2>'+titleBreak(current[0])+'</h2><p>'+current[1]+'</p><span class="quick-time">약 10초~1분</span><button class="quick-done">✓ 했어요</button><button class="quick-ghost quick-again">↻ 이건 싫어요. 다른 거 주세요</button></div>';if(step==='complete'){var m=mind[state.concern]||mind.work;html='<div class="quick-sun">☀️ +1 트임</div><h2>오, 진짜 했네요.</h2><p>작아 보여도<br>방금 내 공간에 틈 하나 만든 거예요.</p><p class="quick-next-copy">그런데 혹시 요즘<br><b>'+m[0]+'</b></p><a class="quick-complete-link" href="'+m[2]+'">'+m[1]+'</a><button class="quick-ghost quick-restart">하나 더 비우기</button>';}stage.className='quick-stage'+(step==='result'?' result-pop':'');stage.innerHTML=html}function titleBreak(t){return t.replace(/ (\d개|\d장|\d분|\d벌|\d권|\dm|\d초|1켤레)/,'<br>$1')}function pick(){var space=aliases[state.space]||state.space;var list=base[space]||base.desk;var idx=Math.floor(Math.random()*list.length);var guard=0;while(history.indexOf(space+'-'+idx)>-1&&guard<20){idx=Math.floor(Math.random()*list.length);guard++}history.push(space+'-'+idx);if(history.length>8)history.shift();var item=list[idx];var fl=flavor[state.concern]||flavor.work;current=[item[0],item[1]+' '+fl[Math.floor(Math.random()*fl.length)]]}card.addEventListener('click',function(e){var btn=e.target.closest('button,a');if(!btn)return;if(btn.dataset.next)render(btn.dataset.next,true);if(btn.dataset.concern){state.concern=btn.dataset.concern;render('space',true)}if(btn.dataset.space){state.space=btn.dataset.space;pick();render('result',true)}if(btn.classList.contains('quick-done'))render('complete',true);if(btn.classList.contains('quick-again')){pick();render('result',true)}if(btn.classList.contains('quick-restart'))render('concern',true)});render('intro',false)})();</script>`;
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

