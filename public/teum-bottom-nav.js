/* TEUM shared bottom navigation */
(function () {
  "use strict";

  const NAV_ID = "teumGlobalBottomNav";
  const STYLE_ID = "teumGlobalBottomNavStyle";
  const routeMap = {
    "index.html": "home",
    "test.html": "ai",
    "mind.html": "ai",
    "program.html": "ai",
    "space-scan.html": "ar",
    "space.html": "ar",
    "clothing-bins.html": "ar",
    "put-away.html": "ar",
    "discard.html": "ar",
    "community.html": "feed",
    "mind-feed.html": "feed",
    "space-feed.html": "feed",
    "magazine.html": "feed",
    "challenge.html": "my",
    "action.html": "my"
  };

  const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 3.5l8.5 7v9.2a.8.8 0 0 1-.8.8h-5.4v-6.1H9.7v6.1H4.3a.8.8 0 0 1-.8-.8z"/></svg>',
    ai: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 14.2 9.8 21.2 12l-7 2.2L12 21.2l-2.2-7L2.8 12l7-2.2z"/></svg>',
    ar: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.3"/></svg>',
    feed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h3v3H4zM10.5 4h3v3h-3zM17 4h3v3h-3zM4 10.5h3v3H4zM10.5 10.5h3v3h-3zM17 10.5h3v3h-3zM4 17h3v3H4zM10.5 17h3v3h-3zM17 17h3v3h-3z"/></svg>',
    my: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>'
  };

  const items = [
    { key: "home", label: "홈", href: "/index.html" },
    { key: "ai", label: "트임AI", href: "/test.html" },
    { key: "ar", label: "트임AR", href: "/space-scan.html" },
    { key: "feed", label: "트임피드", href: "/community.html" },
    { key: "my", label: "마이트임", href: "/challenge.html" }
  ];

  function removeLegacyNavigation() {
    document.querySelectorAll("#teumAiNav, #teumActionNav, #teumRecordNav, #teumUnifiedBottomNav, .bottom, .bottom-nav, [data-teum-bottom-nav]").forEach(function (node) {
      if (node.id !== NAV_ID) node.remove();
    });
    document.querySelectorAll("nav, footer, [role='navigation']").forEach(function (node) {
      if (node.id === NAV_ID) return;
      const className = typeof node.className === "string" ? node.className : "";
      const signature = (node.id + " " + className + " " + (node.getAttribute("aria-label") || "")).toLowerCase();
      if (/bottom|하단|teumainav|teumactionnav|teumrecordnav|teumunified/.test(signature)) node.remove();
    });
  }

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "body{padding-bottom:calc(108px + env(safe-area-inset-bottom,0px))!important}",
      "#teumGlobalBottomNav{position:fixed!important;left:50%!important;right:auto!important;bottom:0!important;transform:translateX(-50%)!important;z-index:2147483000!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;align-items:stretch!important;width:min(100%,760px)!important;height:calc(82px + env(safe-area-inset-bottom,0px))!important;padding:0 0 env(safe-area-inset-bottom,0px)!important;box-sizing:border-box!important;background:#fff!important;border-top:1px solid #e3e6eb!important;box-shadow:none!important}",
      "#teumGlobalBottomNav a{display:flex!important;min-width:0!important;min-height:60px!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:8px!important;padding:6px 2px!important;border:0!important;border-radius:0!important;background:transparent!important;color:#89919b!important;text-decoration:none!important;font:500 12px/1.2 system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif!important;white-space:nowrap!important}",
      "#teumGlobalBottomNav a[aria-current='page']{color:#2367e8!important;font-weight:750!important;background:#edf4ff!important}",
      "#teumGlobalBottomNav a[aria-current='page'] svg{color:#2367e8!important;stroke-width:2.2!important}",
      "#teumGlobalBottomNav a:focus-visible{outline:2px solid #2367e8!important;outline-offset:-3px!important;border-radius:8px!important}",
      "#teumGlobalBottomNav svg{display:block!important;width:24px!important;height:24px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important;flex:none!important}",
      "#teumGlobalBottomNav a[data-key='ai'] svg{fill:currentColor!important;stroke:none!important}",
      ".fab{bottom:calc(82px + env(safe-area-inset-bottom,0px) + 14px)!important}",
      "@media(min-width:761px){#teumGlobalBottomNav{border-left:1px solid #e3e6eb!important;border-right:1px solid #e3e6eb!important}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function render() {
    if (!document.body || !document.head) return;
    removeLegacyNavigation();
    addStyles();
    const existing = document.getElementById(NAV_ID);
    if (existing) existing.remove();

    const page = decodeURIComponent(location.pathname.split("/").pop() || "index.html");
    const active = Object.prototype.hasOwnProperty.call(routeMap, page) ? routeMap[page] : null;
    const nav = document.createElement("nav");
    nav.id = NAV_ID;
    nav.setAttribute("aria-label", "트임 공통 하단 메뉴");
    nav.innerHTML = items.map(function (item) {
      const current = item.key === active ? ' aria-current="page"' : "";
      return '<a data-key="' + item.key + '" href="' + item.href + '"' + current + '>' +
        icons[item.key] + "<span>" + item.label + "</span></a>";
    }).join("");
    document.body.appendChild(nav);
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.querySelectorAll("a").forEach(function (other) { other.removeAttribute("aria-current"); });
        link.setAttribute("aria-current", "page");
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, { once: true });
  else render();
})();
