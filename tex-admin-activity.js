// Admin dashboard: today's real customer activity (contacts opened, chats started, requests posted).
(function () {
  const URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const token = () => {
    try { const s = JSON.parse(localStorage.getItem('texcontractor-auth-session') || 'null'); return s && (s.access_token || (s.currentSession && s.currentSession.access_token)); } catch (_) { return null; }
  };
  const getToken = async () => { try { if (window.TexAuth && TexAuth.getAccessToken) return await TexAuth.getAccessToken(); } catch (_) {} return token(); };
  const box = document.createElement('div');
  box.style.cssText = 'margin:0 0 14px;padding:12px 16px;border-radius:12px;background:#0c3b2c;color:#fff;font:600 .98rem/1.5 system-ui,sans-serif;display:none';
  async function load() {
    const t = await getToken(); if (!t) return;
    try {
      const r = await fetch(URL + '/rest/v1/rpc/texcontractor_admin_activity_today', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: '{}' });
      if (!r.ok) return;
      const d = await r.json();
      box.innerHTML = '<span style="color:#f6c445">● Real activity today</span> &nbsp; ' + d.contacts + ' contacts opened · ' + d.chats + ' chats · ' + d.requests + ' requests · from ' + d.states + ' states'
        + '<br><span style="color:#cfe3dc;font-weight:500">النشاط الحقيقي اليوم: ' + d.contacts + ' فتح رقم · ' + d.chats + ' محادثة · ' + d.requests + ' طلب · من ' + d.states + ' ولاية</span>';
      box.style.display = 'block';
    } catch (_) {}
  }
  function mount() {
    const hero = document.querySelector('.hero');
    if (hero && hero.parentNode) hero.parentNode.insertBefore(box, hero.nextSibling); else document.body.prepend(box);
    load(); setInterval(load, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
