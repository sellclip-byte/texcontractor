// Shows warnings and messages the TexContractor team sent to the signed-in user.
(function () {
  const URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const token = async () => {
    try { if (window.TexAuth && TexAuth.getAccessToken) return await TexAuth.getAccessToken(); } catch (_) {}
    return null;
  };
  const rpc = async (t, name, args) => {
    const r = await fetch(`${URL}/rest/v1/rpc/${name}`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args || {}) });
    if (!r.ok) throw new Error('notice request failed');
    const text = await r.text();
    return text ? JSON.parse(text) : null;
  };

  const css = `
  .tex-notice-back{position:fixed;inset:0;z-index:3000;background:rgba(16,24,40,.5);display:grid;place-items:center;padding:16px}
  .tex-notice{box-sizing:border-box;width:min(460px,100%);background:#fff;border-radius:18px;padding:22px;box-shadow:0 24px 60px rgba(16,24,40,.3);font:500 1rem/1.5 system-ui,-apple-system,sans-serif;color:#101828}
  .tex-notice .k{display:inline-block;padding:4px 10px;border-radius:999px;font-weight:800;font-size:.8rem;letter-spacing:.02em;margin-bottom:10px}
  .tex-notice.warning .k{background:#fef0c7;color:#93370d}
  .tex-notice.message .k{background:#dbeafe;color:#1d4ed8}
  .tex-notice p{margin:0 0 6px;white-space:pre-wrap;overflow-wrap:anywhere}
  .tex-notice small{color:#667085}
  .tex-notice button{margin-top:16px;width:100%;border:0;border-radius:12px;padding:12px;font:800 1rem system-ui,sans-serif;background:#101828;color:#fff;cursor:pointer}`;

  const showOne = (t, list) => {
    const n = list.shift();
    if (!n) return;
    const back = document.createElement('div'); back.className = 'tex-notice-back';
    const date = new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    back.innerHTML = `<div class="tex-notice ${n.kind === 'warning' ? 'warning' : 'message'}" role="alertdialog" aria-modal="true" aria-labelledby="tex-notice-k"><span class="k" id="tex-notice-k">${n.kind === 'warning' ? 'Warning from TexContractor' : 'Message from TexContractor'}</span><p>${esc(n.body)}</p><small>${esc(date)}</small><button type="button">OK, I read it</button></div>`;
    document.body.appendChild(back);
    const ok = back.querySelector('button'); ok.focus();
    ok.addEventListener('click', async () => {
      ok.disabled = true;
      try { await rpc(t, 'texcontractor_notice_read', { p_id: n.id }); } catch (_) {}
      back.remove();
      showOne(t, list);
    });
  };

  const run = async () => {
    const t = await token();
    if (!t) return;
    let list;
    try { list = await rpc(t, 'texcontractor_my_notices'); } catch (_) { return; }
    if (!Array.isArray(list) || !list.length) return;
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    showOne(t, list);
  };
  const start = () => setTimeout(run, 1200);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
