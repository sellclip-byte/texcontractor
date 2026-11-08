// Site-wide readability: light-gray text on light backgrounds becomes near-black, and
// light pill buttons/links get bold black text with a bright gold border.
// Brand colors (green, orange, gold) and anything on a dark background are left alone.
(function () {
  const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const grayish = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b) < 40;
  function bgOf(el) {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; // photo or gradient behind the text: keep as designed
      const c = rgb(cs.backgroundColor);
      if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c;
    }
    return [255, 255, 255];
  }
  function fix(el) {
    if (el.dataset.texReadable) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || !el.offsetParent && cs.position !== 'fixed') return; // hidden now; checked again when shown
    el.dataset.texReadable = '1';
    const bg = bgOf(el);
    if (!bg || lum(bg) < 0.8) return; // dark or photo background: keep as designed
    const fg = rgb(cs.color);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText && grayish(fg) && lum(fg) > 0.12) el.style.setProperty('color', '#111', 'important');
    // Light pill buttons / chips.
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    const bw = parseFloat(cs.borderTopWidth) || 0;
    const ownBg = rgb(cs.backgroundColor);
    const ownBgLight = ownBg.length < 3 || ownBg[3] === 0 || lum(ownBg) > 0.85;
    if (/^(A|BUTTON|SPAN|LI|LABEL)$/.test(el.tagName) && radius >= 12 && bw > 0 && ownBgLight && el.offsetHeight < 70 && el.textContent.trim().length < 80 && grayish(rgb(cs.borderTopColor))) {
      el.style.setProperty('border', '2px solid #d4a017', 'important');
      el.style.setProperty('box-shadow', 'inset 0 0 0 1px #f7d774, 0 1px 4px rgba(212,160,23,.35)', 'important');
      el.style.setProperty('color', '#000', 'important');
      el.style.setProperty('font-weight', '700', 'important');
      el.querySelectorAll('*').forEach((c) => { c.style.setProperty('color', '#000', 'important'); c.dataset.texReadable = '1'; });
    }
  }
  const SEL = 'body *:not(script):not(style):not(svg):not(svg *):not(img):not(video):not(input):not(select):not(textarea)';
  const run = (root) => { try { (root.querySelectorAll ? root : document).querySelectorAll(SEL).forEach(fix); } catch (e) {} };
  let t = 0;
  const schedule = () => { clearTimeout(t); t = setTimeout(() => run(document), 250); };
  const start = () => { run(document); try { new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'open', 'aria-expanded'] }); } catch (e) {} };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

// Where visitors come from (same keys as tex-auth.js), so a later sign-up knows its source
// even when the visitor first landed on a service, city or guide page.
(function () {
  try {
    const q = new URLSearchParams(location.search);
    let ref = '';
    try { ref = document.referrer && new URL(document.referrer).hostname !== location.hostname ? new URL(document.referrer).hostname : ''; } catch (_) {}
    const ua = navigator.userAgent || '';
    const inApp = /Instagram/i.test(ua) ? 'instagram-app' : /FBAN|FBAV|FB_IAB/i.test(ua) ? 'facebook-app' : /musical_ly|TikTok|BytedanceWebview/i.test(ua) ? 'tiktok-app' : '';
    const source = q.get('utm_source') || (q.get('gclid') ? 'google-ads' : q.get('fbclid') ? 'facebook' : '') || inApp || ref || 'direct';
    const touch = {
      source: source.slice(0, 60), medium: (q.get('utm_medium') || (q.get('gclid') ? 'cpc' : '')).slice(0, 40),
      campaign: (q.get('utm_campaign') || '').slice(0, 80), ref: ref.slice(0, 80), landing: location.pathname.slice(0, 120), at: new Date().toISOString()
    };
    if (!localStorage.getItem('texcontractor-first-touch')) localStorage.setItem('texcontractor-first-touch', JSON.stringify(touch));
    if (touch.source !== 'direct') localStorage.setItem('texcontractor-last-touch', JSON.stringify(touch));
  } catch (_) { /* tracking must never break the page */ }
})();

// Always show the latest version of the page (owner 11-06): if the phone opened an old saved copy
// (from the browser cache or a restored old tab), check the server and reload once when the page changed.
(function () {
  try {
    var loadedAt = Date.now(), key = 'tc_fresh_' + location.pathname;
    function newer(cb) {
      fetch(location.href, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
        var lm = r.headers.get('last-modified');
        if (lm && new Date(lm).getTime() > new Date(document.lastModified).getTime() + 1000) cb();
      }).catch(function () {});
    }
    function reloadOnce() {
      try { if (sessionStorage.getItem(key) === document.lastModified) return; sessionStorage.setItem(key, document.lastModified); } catch (_) {}
      location.reload();
    }
    var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null;
    if (nav && nav.transferSize === 0 && nav.decodedBodySize > 0) newer(reloadOnce);       // opened from cache
    window.addEventListener('pageshow', function (e) {                                     // old tab brought back
      if (e.persisted && Date.now() - loadedAt > 5 * 60 * 1000) newer(reloadOnce);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && Date.now() - loadedAt > 30 * 60 * 1000) newer(reloadOnce);
    });
  } catch (_) {}
})();

// Owner 11-06: visitors browsing without signing in see the NEW sign-up panel (phone + customer/technician)
// after 30 seconds or after scrolling about 1.5 screens. Once per visit; closing it hides it for the visit.
(function () {
  try {
    if (window.top !== window.self) return;
    if (/bot|crawl|spider|slurp|lighthouse|headless|facebookexternalhit|preview/i.test(navigator.userAgent || '')) return;
    var p = location.pathname;
    if (/(signup|auth|start|account|admin|my-photos|messages|chat|contractor-register|remove-number|privacy|terms)/i.test(p)) return;
    if (/^\/(ad|join)\//.test(p)) return;
    if (sessionStorage.getItem('tex_panel_closed')) return;
    var a = JSON.parse(localStorage.getItem('texcontractor-auth-session') || 'null'); if (a && a.access_token) return;
    var shown = false, timer;
    function open() {
      if (shown || document.querySelector('dialog[open]')) return;
      shown = true; clearTimeout(timer); window.removeEventListener('scroll', onScroll);
      var es = (document.documentElement.lang || '').indexOf('es') === 0 || /\/es\//.test(p);
      var back = (p.replace(/^\//, '') || 'index.html') + location.search;
      var src = '/signup.html?embed=1&utm_source=site&utm_medium=panel' + (es ? '&lang=es' : '') +
        (/\.html$/.test(p.replace(/^\//, '') || 'index.html') ? '&return_to=' + encodeURIComponent(back) : '');
      var st = document.createElement('style');
      st.textContent = '.tex-panel{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:10px}' +
        '.tex-panel-box{position:relative;width:min(460px,100%);height:min(760px,calc(100dvh - 70px));margin-top:44px;border-radius:22px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
        '.tex-panel iframe{width:100%;height:100%;border:0;display:block;border-radius:22px}' +
        '.tex-panel-x{position:absolute;top:-46px;right:0;border:2px solid #fff!important;width:38px;height:38px;border-radius:50%;border:0;background:#0f172a;color:#fff;font-size:22px;line-height:38px;cursor:pointer;z-index:2}';
      document.head.appendChild(st);
      var w = document.createElement('div'); w.className = 'tex-panel'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Join TexContractor');
      w.innerHTML = '<div class="tex-panel-box"><button class="tex-panel-x" type="button" aria-label="Close">×</button><iframe title="Join TexContractor" src="' + src + '"></iframe></div>';
      function close() { try { sessionStorage.setItem('tex_panel_closed', '1'); } catch (_) {} w.remove(); document.documentElement.style.overflow = ''; }
      w.querySelector('.tex-panel-x').onclick = close;
      w.addEventListener('click', function (e) { if (e.target === w) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      document.body.appendChild(w); document.documentElement.style.overflow = 'hidden';
    }
    function onScroll() { if (window.scrollY > window.innerHeight * 1.5) open(); }
    timer = setTimeout(open, window.TEX_PANEL_DELAY || 30000); // homepage on phones: 10 s (owner 11-07)
    window.addEventListener('scroll', onScroll, { passive: true });
  } catch (_) {}
})();

// Owner 11-06: a signed-in member (pro or customer) who opens the site / home-screen icon sees a clear blinking
// red/green alert at the top when a message is waiting (support messages + customer chats). Also sets the app-icon badge.
(function () {
  try {
    if (window.top !== window.self) return;
    var SB = 'https://rryehtaskbjnfbodymjj.supabase.co', K = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
    function session() { try { return JSON.parse(localStorage.getItem('texcontractor-auth-session') || 'null'); } catch (_) { return null; } }
    async function tok() {
      try { if (window.TexAuth && TexAuth.getAccessToken) { var t = await TexAuth.getAccessToken(); if (t) return t; } } catch (_) {}
      var s = session(); if (!s || !s.access_token) return null;
      try { var p = JSON.parse(atob(s.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); if (p.exp && p.exp * 1000 < Date.now()) return null; } catch (_) {}
      return s.access_token;
    }
    function uid() { var s = session(); return s && s.user && s.user.id; }
    async function count() {
      var t = await tok(), me = uid(); if (!t || !me) return null;
      var h = { apikey: K, Authorization: 'Bearer ' + t };
      var support = 0, chats = 0;
      try {
        var r = await fetch(SB + '/rest/v1/texcontractor_messages?select=id&read_at=is.null&sender_id=neq.' + me + '&limit=50', { headers: h });
        if (r.ok) support = (await r.json()).length;
      } catch (_) {}
      try {
        var r2 = await fetch(SB + '/rest/v1/rpc/texcontractor_chat_unread', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, h), body: '{}' });
        if (r2.ok) chats = Number(await r2.text()) || 0;
      } catch (_) {}
      return { support: support, chats: chats };
    }
    function css() {
      if (document.getElementById('tex-msg-alert-css')) return;
      var s = document.createElement('style'); s.id = 'tex-msg-alert-css';
      s.textContent = '@keyframes texMsgBlink{0%,100%{background:#d92d20}50%{background:#0b7a63}}' +
        '.tex-msg-alert{position:fixed;top:calc(28px + env(safe-area-inset-top,0px));right:10px;left:auto;z-index:2147482000;display:flex;align-items:center;gap:6px;max-width:min(45vw,260px);padding:8px 10px 8px 12px;border-radius:16px;color:#fff;font:800 .9rem/1.2 system-ui,-apple-system,sans-serif;text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.3);animation:texMsgBlink 1.2s ease-in-out infinite}' +
        '.tex-msg-alert b{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;padding:0 7px;border-radius:999px;background:#fff;color:#d92d20}' +
        '.tex-msg-alert span.x{margin-left:2px;opacity:.85;font-size:1.1rem}' +
        '@media(min-width:700px){.tex-msg-alert{top:96px;right:18px;max-width:340px;font-size:1rem;padding:11px 16px}}';
      document.head.appendChild(s);
    }
    async function check() {
      if (/\/(messages|chat)(\.html)?$/.test(location.pathname)) { try { navigator.clearAppBadge && navigator.clearAppBadge(); } catch (_) {} return; }
      var c = await count(); if (!c) return;
      var n = c.support + c.chats, old = document.getElementById('tex-msg-alert');
      try { if (n && navigator.setAppBadge) navigator.setAppBadge(n); else if (!n && navigator.clearAppBadge) navigator.clearAppBadge(); } catch (_) {}
      if (!n) { if (old) old.remove(); return; }
      try { if (sessionStorage.getItem('tex_msg_alert_closed') === String(n)) return; } catch (_) {}
      css();
      var es = (document.documentElement.lang || '').indexOf('es') === 0;
      var a = old || document.createElement('a');
      a.id = 'tex-msg-alert'; a.className = 'tex-msg-alert'; a.href = c.chats ? '/chat.html' : '/messages.html';
      a.innerHTML = '🔔 ' + (es ? (n === 1 ? 'Tienes un mensaje nuevo' : 'Tienes mensajes nuevos') : (n === 1 ? 'You have a new message' : 'You have new messages')) +
        ' <b>' + (n > 99 ? '99+' : n) + '</b><span class="x" role="button" aria-label="Close">×</span>';
      a.querySelector('.x').onclick = function (e) { e.preventDefault(); e.stopPropagation(); try { sessionStorage.setItem('tex_msg_alert_closed', String(n)); } catch (_) {} a.remove(); };
      if (!old) document.body.appendChild(a);
    }
    function start() { if (!session()) return; setTimeout(check, 1500); setInterval(check, 60000);
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') check(); }); }
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
  } catch (_) {}
})();
