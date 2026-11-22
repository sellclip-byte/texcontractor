/* Owner 11-21: chat stays ON the site, like Craigslist. A small "Chat" button at the bottom corner for anyone
   signed in, a red badge when a message is waiting, and the conversations open in a panel on the same page.
   Also tells the site the member is online (green dot next to the pro's name, never at the top). */
(function () {
  try {
    if (window.top !== window.self || window.TexChatDock) return;
    if (/\/chat\.html$/.test(location.pathname) || /\/(admin|admin-login)\.html$/.test(location.pathname)) return;
    var SB = 'https://rryehtaskbjnfbodymjj.supabase.co', K = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
    var session = function () { try { return JSON.parse(localStorage.getItem('texcontractor-auth-session') || 'null'); } catch (_) { return null; } };
    if (!session()) return;
    window.TexChatDock = true;
    var es = function () { return (document.documentElement.lang || '').indexOf('es') === 0; };
    async function tok() {
      try { if (window.TexAuth && TexAuth.getAccessToken) { var t = await TexAuth.getAccessToken(); if (t) return t; } } catch (_) {}
      var s = session(); if (!s || !s.access_token) return null;
      try { var p = JSON.parse(atob(s.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); if (p.exp && p.exp * 1000 < Date.now()) return null; } catch (_) {}
      return s.access_token;
    }
    async function rpc(name) {
      var t = await tok(); if (!t) return null;
      var r = await fetch(SB + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: K, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: '{}' });
      return r.ok ? r.text() : null;
    }
    var css = document.createElement('style');
    css.textContent = '#tcd-btn{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2147481000;display:flex;align-items:center;gap:8px;padding:12px 18px;border:0;border-radius:999px;background:#1d4ed8;color:#fff;font:800 16px system-ui,-apple-system,sans-serif;box-shadow:0 10px 26px rgba(29,78,216,.35);cursor:pointer}' +
      '#tcd-btn .n{display:none;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:#ef4444;color:#fff;font-size:12px;align-items:center;justify-content:center;box-shadow:0 0 0 2px #fff}#tcd-btn.has .n{display:inline-flex}' +
      '#tcd-btn.has{animation:tcdPulse 1.6s ease-in-out infinite}@keyframes tcdPulse{50%{box-shadow:0 0 0 8px rgba(239,68,68,.18),0 10px 26px rgba(29,78,216,.35)}}' +
      '#tcd-panel{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:2147481001;width:min(400px,calc(100vw - 28px));height:min(600px,calc(100vh - 110px));background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(15,23,42,.3);overflow:hidden;display:none;flex-direction:column;border:1px solid #e2e8f0}' +
      '#tcd-panel.open{display:flex}#tcd-panel .hd{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#0e1b37;color:#fff;font:800 15px system-ui,sans-serif}' +
      '#tcd-panel .hd button{border:0;background:transparent;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:2px 6px}#tcd-panel iframe{flex:1;width:100%;border:0}' +
      '@media(max-width:600px){#tcd-panel{right:0;left:0;bottom:0;width:100%;height:calc(100% - 56px);border-radius:18px 18px 0 0}#tcd-btn{padding:11px 15px;font-size:15px}}' +
      'body.tcd-open #tex-chat-float{display:none!important}#tex-chat-float{display:none!important}';
    document.head.appendChild(css);
    var btn = document.createElement('button'); btn.id = 'tcd-btn'; btn.type = 'button';
    var label = function () { btn.innerHTML = '💬 <span class="t">' + (es() ? 'Chat' : 'Chat') + '</span><span class="n"></span>'; };
    label();
    var panel = document.createElement('div'); panel.id = 'tcd-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Chat');
    panel.innerHTML = '<div class="hd"><span>💬 ' + (es() ? 'Mensajes' : 'Messages') + '</span><button type="button" aria-label="Close">×</button></div>';
    var frame = null;
    function open(chatId) {
      if (!frame) { frame = document.createElement('iframe'); frame.title = 'Chat'; panel.appendChild(frame); }
      var want = 'chat.html?embed=1' + (chatId ? '&c=' + encodeURIComponent(chatId) : '') + (es() ? '&lang=es' : '');
      if (chatId || !frame.getAttribute('src')) frame.setAttribute('src', want);
      panel.classList.add('open'); document.body.classList.add('tcd-open');
      btn.classList.remove('has');
    }
    function close() { panel.classList.remove('open'); document.body.classList.remove('tcd-open'); badge(); }
    btn.onclick = function () { panel.classList.contains('open') ? close() : open(); };
    panel.querySelector('.hd button').onclick = close;
    function mount() { if (!document.body) return setTimeout(mount, 50); document.body.appendChild(panel); document.body.appendChild(btn); badge(); ping(); }
    async function badge() {
      try {
        var n = Number(await rpc('texcontractor_chat_unread')) || 0;
        var el = btn.querySelector('.n'); el.textContent = n > 99 ? '99+' : String(n);
        btn.classList.toggle('has', n > 0 && !panel.classList.contains('open'));
        btn.setAttribute('aria-label', n ? n + ' unread messages' : 'Chat');
      } catch (_) {}
    }
    async function ping() { if (document.visibilityState === 'visible') { try { await rpc('texcontractor_ping'); } catch (_) {} } }
    setInterval(badge, 45000); setInterval(ping, 120000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') { ping(); badge(); } });
    window.TexChatDockOpen = open;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  } catch (_) {}
})();
