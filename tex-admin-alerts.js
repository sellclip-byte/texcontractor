// Red alert button in the admin header: unread messages, new reports, number removals,
// phone verifications and listings waiting for review. Refreshes every 60 seconds.
(function () {
  const URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';

  const css = `
  .tex-alert-wrap{position:relative;display:inline-flex}
  .tex-alert-btn{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:9px 16px;font:800 .95rem/1 system-ui,sans-serif;cursor:pointer;background:#e5e7eb;color:#475467}
  .tex-alert-btn.on{background:#d92d20;color:#fff;box-shadow:0 0 0 0 rgba(217,45,32,.6);animation:texAlertPulse 1.6s infinite}
  .tex-alert-btn .n{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:#fff;color:#d92d20;font-size:.85rem}
  .tex-alert-btn:not(.on) .n{display:none}
  @keyframes texAlertPulse{0%{box-shadow:0 0 0 0 rgba(217,45,32,.55)}70%{box-shadow:0 0 0 12px rgba(217,45,32,0)}100%{box-shadow:0 0 0 0 rgba(217,45,32,0)}}
  .tex-alert-menu{position:absolute;right:0;top:calc(100% + 8px);z-index:1000;min-width:340px;max-width:calc(100vw - 24px);background:#fff;border:1px solid #fecdca;border-radius:14px;box-shadow:0 16px 40px rgba(16,24,40,.18);padding:8px}
  .tex-alert-menu[hidden]{display:none}
  .tex-alert-menu a,.tex-alert-menu button{display:flex;justify-content:space-between;align-items:center;gap:12px;width:100%;padding:11px 12px;border:0;border-radius:10px;background:none;color:#101828;font:600 .95rem system-ui,sans-serif;text-decoration:none;text-align:left;cursor:pointer}
  .tex-alert-menu a:hover,.tex-alert-menu button:hover{background:#fef3f2}
  .tex-alert-menu b{background:#d92d20;color:#fff;border-radius:999px;padding:3px 9px;font-size:.85rem}
  .tex-alert-menu .empty{padding:12px;color:#667085;font:500 .95rem system-ui,sans-serif}
  @media (prefers-reduced-motion:reduce){.tex-alert-btn.on{animation:none}}`;

  const token = () => {
    try {
      const s = JSON.parse(localStorage.getItem('texcontractor-auth-session') || 'null');
      return s && (s.access_token || (s.currentSession && s.currentSession.access_token));
    } catch (_) { return null; }
  };
  const getToken = async () => {
    try { if (window.TexAuth && TexAuth.getAccessToken) return await TexAuth.getAccessToken(); } catch (_) {}
    return token();
  };
  const rpc = async (name) => {
    const t = await getToken();
    if (!t) return null;
    const r = await fetch(`${URL}/rest/v1/rpc/${name}`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: '{}' });
    if (!r.ok) return null;
    const text = await r.text();
    return text ? JSON.parse(text) : true;
  };

  const openTab = (name) => {
    const tab = document.querySelector(`[data-tab="${name}"]`);
    if (tab) { tab.click(); tab.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };

  const items = [
    { key: 'messages', label: 'New messages · رسائل جديدة', href: 'messages.html' },
    { key: 'reports', label: 'Customer reports · بلاغات العملاء', action: () => openTab('reports') },
    { key: 'removals', label: 'Number removal requests · طلبات حذف أرقام', href: 'number-removals-admin.html' },
    { key: 'verifications', label: 'Phone verifications · تأكيد أرقام', href: 'phone-verifications-admin.html' },
    { key: 'pending', label: 'Listings to review · إعلانات للمراجعة', action: () => openTab('submissions') },
    { key: 'mower_reviews', label: 'MowerMobile reviews · تقييمات موقع الجزازات', href: 'mowermobile-reviews-admin.html' }
  ];

  let btn, menu, data = {};
  const render = () => {
    const total = items.reduce((s, i) => s + (Number(data[i.key]) || 0), 0);
    btn.classList.toggle('on', total > 0);
    btn.querySelector('.t').textContent = total > 0 ? 'Alerts · تنبيهات' : 'No alerts · لا تنبيهات';
    btn.querySelector('.n').textContent = total > 99 ? '99+' : String(total);
    btn.setAttribute('aria-label', total > 0 ? `${total} alerts` : 'No alerts');
    menu.innerHTML = '';
    const active = items.filter((i) => Number(data[i.key]) > 0);
    if (!active.length) { menu.innerHTML = '<div class="empty">Nothing new right now · لا جديد الآن</div>'; return; }
    active.forEach((i) => {
      const el = document.createElement(i.href ? 'a' : 'button');
      if (i.href) el.href = i.href; else { el.type = 'button'; el.addEventListener('click', () => { menu.hidden = true; i.action(); }); }
      el.innerHTML = `<span>${i.label}</span><b>${data[i.key]}</b>`;
      menu.appendChild(el);
    });
  };
  const refresh = async () => {
    try { const r = await rpc('texcontractor_admin_alerts'); if (r && typeof r === 'object') { data = r; render(); } } catch (_) {}
  };

  const init = () => {
    const bar = document.querySelector('.header-actions');
    if (!bar || document.getElementById('tex-alert-btn')) return;
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    const wrap = document.createElement('div'); wrap.className = 'tex-alert-wrap';
    wrap.innerHTML = '<button class="tex-alert-btn" id="tex-alert-btn" type="button" aria-haspopup="true"><span class="t">Alerts</span><span class="n">0</span></button><div class="tex-alert-menu" hidden></div>';
    bar.insertBefore(wrap, bar.firstChild);
    btn = wrap.querySelector('button'); menu = wrap.querySelector('.tex-alert-menu');
    btn.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; if (!menu.hidden) refresh(); });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) menu.hidden = true; });
    render(); refresh();
    setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    const repTab = document.querySelector('[data-tab="reports"]');
    if (repTab) repTab.addEventListener('click', async () => { if (Number(data.reports) > 0) { await rpc('texcontractor_admin_reports_seen'); refresh(); } });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
