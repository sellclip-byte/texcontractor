/* TexContractor chat: customer <-> technician messages on the site (numbers stay private),
   plus the red unread badge. Everything stays hidden until the chat database is installed. */
(function () {
  const SUPABASE_URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const headers = (token) => ({ apikey: SUPABASE_KEY, Authorization: 'Bearer ' + (token || SUPABASE_KEY), 'Content-Type': 'application/json' });
  const token = async () => (window.TexAuth ? await TexAuth.getAccessToken().catch(() => null) : null);

  async function rpc(name, body, needAuth) {
    const t = needAuth ? await token() : await token();
    if (needAuth && !t) throw Object.assign(new Error('Please sign in to send a message.'), { code: 'signin' });
    const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, { method: 'POST', headers: headers(t), body: JSON.stringify(body || {}) });
    const text = await r.text();
    let data = null; try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
    if (!r.ok) throw Object.assign(new Error((data && (data.message || data.msg)) || 'Chat is not available right now.'), { status: r.status });
    return data;
  }

  let enabledPromise = null;
  // Set of service ids that accept chat. Empty when the chat database is not installed yet.
  function enabledServices() {
    if (!enabledPromise) enabledPromise = rpc('texcontractor_chat_service_ids', {}, false).then((ids) => new Set(ids || [])).catch(() => new Set());
    return enabledPromise;
  }

  async function start(serviceId) {
    let t = await token();
    if (!t && window.TexQuickSignup) { if (await TexQuickSignup.require({ source: 'chat' })) t = await token(); else return; }
    if (!t) {
      window.location.href = 'auth.html?mode=signup&intent=customer&return_to=' + encodeURIComponent('chat.html?service=' + serviceId);
      return;
    }
    const chatId = await rpc('texcontractor_start_chat', { p_service_id: serviceId }, true);
    window.location.href = 'chat.html?c=' + encodeURIComponent(chatId);
  }

  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><circle cx="9" cy="10.5" r=".6"/><circle cx="12" cy="10.5" r=".6"/><circle cx="15" cy="10.5" r=".6"/></svg>';
  // A white "Chat" button styled like the Call / Text icons.
  function button(serviceId, displayName) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'provider-contact-icon provider-contact-chat';
    b.title = 'Chat with this contractor on TexContractor';
    b.setAttribute('aria-label', 'Chat with ' + (displayName || 'this contractor'));
    b.innerHTML = ICON + '<span>Chat</span>';
    b.hidden = true;
    enabledServices().then((set) => { b.hidden = !set.has(serviceId); });
    b.addEventListener('click', async () => {
      b.disabled = true;
      try { await start(serviceId); } catch (e) { window.alert(e.message); } finally { b.disabled = false; }
    });
    return b;
  }

  if (!document.getElementById('tex-chat-style')) {
    const s = document.createElement('style');
    s.id = 'tex-chat-style';
    s.textContent = `.provider-contact-chat[hidden],.chat-action[hidden]{display:none!important}
.provider-contact-chat{background:#fff!important;color:#0f5132!important;border:1.5px solid #0f5132!important}
.provider-contact-chat:hover{background:#eef7f2!important}.provider-contact-chat svg{fill:none;stroke:currentColor}
.tex-chat-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;margin-left:6px;border-radius:999px;background:#d92d20;color:#fff;font:700 11px/1 system-ui,sans-serif;vertical-align:middle}
.tex-chat-float{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:50;display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border-radius:999px;background:#fff;color:#0f5132;border:1.5px solid #0f5132;font:700 14px/1 system-ui,sans-serif;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.15)}`;
    document.head.appendChild(s);
  }

  // Red badge with the number of unread chat messages.
  async function refreshBadge() {
    if (/chat\.html$/.test(location.pathname)) return;
    const t = await token();
    if (!t) return;
    let n = 0;
    try { n = Number(await rpc('texcontractor_chat_unread', {}, true)) || 0; } catch (_) { return; }
    document.querySelectorAll('.tex-chat-badge').forEach((el) => el.remove());
    let float = document.getElementById('tex-chat-float');
    if (!n) { float?.remove(); return; }
    const toggle = document.getElementById('account-toggle');
    if (toggle) {
      const badge = document.createElement('span');
      badge.className = 'tex-chat-badge'; badge.textContent = n > 99 ? '99+' : String(n);
      badge.setAttribute('aria-label', n + ' unread messages');
      toggle.appendChild(badge);
    }
    if (!float) {
      float = document.createElement('a');
      float.id = 'tex-chat-float'; float.className = 'tex-chat-float'; float.href = 'chat.html';
      document.body.appendChild(float);
    }
    float.innerHTML = 'Messages <span class="tex-chat-badge">' + (n > 99 ? '99+' : n) + '</span>';
  }
  window.addEventListener('load', () => { refreshBadge(); setInterval(refreshBadge, 60000); });

  window.TexChat = { rpc, token, headers, SUPABASE_URL, enabledServices, start, button, refreshBadge };
})();
