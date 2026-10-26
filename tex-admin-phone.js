// Admin header: look up any phone number and see who it belongs to
// (technician listings, imported listings, customer/technician accounts, requests, removal requests).
(function () {
  const URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const day = (v) => { if (!v) return ''; const d = new Date(v); return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };

  const css = `
  .tex-phone-form{display:inline-flex;align-items:center;gap:0;border:2px solid #1d4ed8;border-radius:999px;overflow:hidden;background:#fff}
  .tex-phone-form input{width:150px;border:0;padding:8px 12px;font:600 .95rem system-ui,sans-serif;outline:none;background:transparent}
  .tex-phone-form button{border:0;background:#1d4ed8;color:#fff;padding:9px 14px;font:800 .9rem system-ui,sans-serif;cursor:pointer}
  .tex-phone-modal{position:fixed;inset:0;z-index:2000;background:rgba(16,24,40,.45);display:grid;place-items:start center;padding:70px 12px 20px;overflow:auto}
  .tex-phone-modal[hidden]{display:none}
  .tex-phone-box{width:min(720px,100%);background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(16,24,40,.3);padding:20px 22px;font:500 .95rem/1.45 system-ui,sans-serif;color:#101828}
  .tex-phone-box h2{margin:0 0 4px;font-size:1.25rem}
  .tex-phone-box h3{margin:18px 0 8px;font-size:1rem;color:#1d4ed8}
  .tex-phone-box .row{border:1px solid #eaecf0;border-radius:12px;padding:10px 12px;margin:8px 0}
  .tex-phone-box .row b{font-size:1rem}
  .tex-phone-box .muted{color:#667085}
  .tex-phone-box .tag{display:inline-block;padding:2px 8px;border-radius:999px;background:#f2f4f7;font-size:.8rem;font-weight:700;margin-left:6px}
  .tex-phone-box .tag.red{background:#fee4e2;color:#b42318}
  .tex-phone-box .close{float:right;border:0;background:#f2f4f7;border-radius:999px;width:34px;height:34px;font-size:1.1rem;cursor:pointer}
  .tex-phone-box a{color:#1d4ed8;font-weight:700}
  .tex-phone-box .acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
  .tex-phone-box .act{border:1px solid #d0d5dd;background:#fff;border-radius:10px;padding:7px 12px;font:700 .85rem system-ui,sans-serif;cursor:pointer;color:#101828}
  .tex-phone-box .act.danger{border-color:#fda29b;color:#b42318;background:#fef3f2}
  .tex-phone-box .act.warn{border-color:#fec84b;color:#93370d;background:#fffaeb}
  .tex-phone-box .act.ok{border-color:#75e0a7;color:#067647;background:#ecfdf3}
  .tex-phone-box .act:disabled{opacity:.5;cursor:wait}
  .tex-phone-box .compose{width:100%}
  .tex-phone-box .compose textarea{width:100%;box-sizing:border-box;border:1px solid #d0d5dd;border-radius:10px;padding:10px;font:500 .95rem system-ui,sans-serif;margin-bottom:8px}
  .tex-phone-box .compose div{display:flex;gap:8px;flex-wrap:wrap}
  .tex-phone-box .small{font-size:.82rem;margin:6px 0 0}
  .tex-phone-box .flash{margin:12px 0 0;font-weight:700}
  .tex-phone-box .flash.good{color:#067647}.tex-phone-box .flash.bad{color:#b42318}
  header .header-actions{flex-wrap:wrap;justify-content:flex-end}
  @media (max-width:640px){.tex-phone-form input{width:120px}}`;

  const getToken = async () => {
    try { if (window.TexAuth && TexAuth.getAccessToken) return await TexAuth.getAccessToken(); } catch (_) {}
    try { const s = JSON.parse(localStorage.getItem('texcontractor-auth-session') || 'null'); return s && s.access_token; } catch (_) { return null; }
  };

  let modal, box, lastDigits = '';
  const show = (html) => { box.innerHTML = '<button class="close" type="button" aria-label="Close">×</button>' + html; box.querySelector('.close').onclick = () => { modal.hidden = true; }; modal.hidden = false; };

  const call = async (name, args) => {
    const t = await getToken();
    const r = await fetch(`${URL}/rest/v1/rpc/${name}`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args || {}) });
    const text = await r.text(); let d = null; try { d = text ? JSON.parse(text) : null; } catch (_) { d = { message: text }; }
    if (!r.ok) throw new Error((d && (d.message || d.hint)) || 'Request failed');
    return d;
  };

  const section = (title, list, fn) => list && list.length ? `<h3>${title} (${list.length})</h3>` + list.map(fn).join('') : '';
  const btn = (act, label, attrs, cls) => `<button type="button" class="act${cls ? ' ' + cls : ''}" data-act="${act}" ${attrs}>${label}</button>`;
  const ida = (k, v) => `data-${k}="${esc(v)}"`;
  const notifyBtns = (uid) => uid ? btn('compose', 'Warn · تنبيه', ida('user', uid) + ' data-kind="warning"', 'warn') + btn('compose', 'Message · رسالة', ida('user', uid) + ' data-kind="message"') : '';
  const listingBtns = (x) => x.status === 'approved'
    ? btn('listing', 'Hide from site · إخفاء من الموقع', ida('id', x.id) + ' data-status="rejected"', 'danger')
    : btn('listing', 'Show on site · إظهار في الموقع', ida('id', x.id) + ' data-status="approved"', 'ok');

  const lookup = async (raw) => {
    const digits = String(raw || '').replace(/\D/g, '');
    if (digits.length < 7) { show('<h2>Phone search · بحث برقم</h2><p class="muted">Enter at least 7 digits · أدخل 7 أرقام على الأقل</p>'); return; }
    lastDigits = digits;
    if (modal.hidden) show('<h2>Searching… · جاري البحث</h2>');
    try {
      const d = await call('texcontractor_admin_phone_lookup', { p_phone: digits });
      const n = d.technicians.length + d.imported.length + d.accounts.length + d.requests.length + d.removals.length;
      const pretty = d.digits.length === 10 ? `(${d.digits.slice(0, 3)}) ${d.digits.slice(3, 6)}-${d.digits.slice(6)}` : d.digits;
      let html = `<h2>${esc(pretty)}</h2><p class="muted">${n ? `${n} result${n === 1 ? '' : 's'} · نتائج` : 'No match found · لا يوجد تطابق'}${d.blocked ? ' <span class="tag red">Blocked number · رقم محظور</span>' : ''}</p>`;
      if (d.digits.length === 10) html += `<div class="acts">${d.blocked ? btn('block', 'Unblock number · إلغاء حظر الرقم', ida('phone', d.digits) + ' data-block="0"', 'ok') : btn('block', 'Block number · حظر الرقم', ida('phone', d.digits) + ' data-block="1"', 'danger')}</div>`;
      html += section('Technician listings · إعلانات فنيين', d.technicians, (x) => `<div class="row"><b>${esc(x.name)}</b><span class="tag ${x.status === 'approved' ? '' : 'red'}">${esc(x.status)}</span><br>${esc(x.service)} · ${esc(x.city)}, ${esc(x.state)}<br><span class="muted">Contact: ${esc(x.real_name)} · ${esc(x.phone)}${x.email ? ' · ' + esc(x.email) : ''} · Added ${esc(day(x.created_at))}</span><br><a href="profile.html?contractor=${encodeURIComponent(x.id)}" target="_blank" rel="noopener">Open profile · فتح الصفحة</a><div class="acts">${listingBtns(x)}${x.owner_is_admin ? '' : notifyBtns(x.owner_id)}</div></div>`);
      html += section('Accounts · حسابات مسجلة', d.accounts, (x) => `<div class="row"><b>${esc(x.name || x.email)}</b><span class="tag ${x.status === 'blocked' ? 'red' : ''}">${x.status === 'blocked' ? 'suspended' : 'active'}</span><br><span class="muted">${esc(x.email)} · Joined ${esc(day(x.created_at))} · Last sign-in ${esc(day(x.last_sign_in_at)) || '—'}</span><br>Requests: ${x.requests} · Chats: ${x.chats} · Listings: ${x.listings}${x.is_admin ? '' : `<div class="acts">${x.status === 'blocked' ? btn('member', 'Restore account · إعادة تفعيل', ida('user', x.user_id) + ' data-status="active"', 'ok') : btn('member', 'Suspend account · إيقاف الحساب', ida('user', x.user_id) + ' data-status="blocked"', 'danger')}${notifyBtns(x.user_id)}</div>`}</div>`);
      html += section('Customer requests · طلبات عملاء', d.requests, (x) => `<div class="row"><b>${esc(x.title || x.service)}</b><span class="tag">${esc(x.status)}</span><br>${esc(x.service)} · ${esc(x.city)}<br><span class="muted">Customer: ${esc(x.customer || '—')} · ${esc(day(x.created_at))}</span><div class="acts">${notifyBtns(x.customer_id)}</div></div>`);
      html += section('Imported listings · إعلانات مستوردة', d.imported, (x) => `<div class="row"><b>${esc(x.name)}</b><span class="tag ${x.status === 'approved' ? '' : 'red'}">${esc(x.status)}</span><br>${esc(x.service)} · ${esc(x.city)}, ${esc(x.state)}<br><span class="muted">${esc(x.phone)}${x.website ? ' · ' + esc(x.website) : ''}</span><div class="acts">${listingBtns(x)}</div></div>`);
      html += section('Number removal requests · طلبات حذف الرقم', d.removals, (x) => `<div class="row"><b>${esc(x.status)}</b><br><span class="muted">${esc(x.contact)} · ${esc(day(x.created_at))}${x.resolved_at ? ' · resolved ' + esc(day(x.resolved_at)) : ''}</span> · <a href="number-removals-admin.html">Open · فتح</a></div>`);
      html += '<p class="flash" role="status"></p>';
      show(html);
    } catch (e) { show(`<h2>Phone search · بحث برقم</h2><p class="muted">${esc(e.message)}</p>`); }
  };

  const flash = (msg, bad) => { const f = box.querySelector('.flash'); if (f) { f.textContent = msg; f.className = 'flash ' + (bad ? 'bad' : 'good'); } };

  const onAction = async (b) => {
    const act = b.dataset.act;
    try {
      if (act === 'compose') {
        const acts = b.closest('.acts');
        const warn = b.dataset.kind === 'warning';
        acts.innerHTML = `<div class="compose"><textarea rows="3" maxlength="2000" placeholder="${warn ? 'Warning text (English) · نص التنبيه' : 'Message text (English) · نص الرسالة'}"></textarea><div>${btn('send', warn ? 'Send warning · إرسال التنبيه' : 'Send message · إرسال الرسالة', ida('user', b.dataset.user) + ` data-kind="${b.dataset.kind}"`, warn ? 'warn' : 'ok')}${btn('cancel', 'Cancel · إلغاء', '')}</div><p class="muted small">The user sees it in a box the next time they open the site. They cannot reply to it.<br>يظهر للمستخدم عند فتحه الموقع، ولا يمكنه الرد.</p></div>`;
        acts.querySelector('textarea').focus();
        return;
      }
      if (act === 'cancel') { lookup(lastDigits); return; }
      if (act === 'send') {
        const text = b.closest('.compose').querySelector('textarea').value.trim();
        if (!text) { flash('Write the text first · اكتب النص أولًا', true); return; }
        b.disabled = true;
        await call('texcontractor_admin_send_notice', { p_user: b.dataset.user, p_kind: b.dataset.kind, p_body: text });
        await lookup(lastDigits); flash(b.dataset.kind === 'warning' ? 'Warning sent ✓ · تم إرسال التنبيه' : 'Message sent ✓ · تم إرسال الرسالة');
        return;
      }
      if (act === 'listing') {
        if (b.dataset.status === 'rejected' && !confirm('Hide this listing from the site? You can show it again later.\nإخفاء هذا الإعلان من الموقع؟ يمكنك إظهاره لاحقًا.')) return;
        b.disabled = true;
        await call('texcontractor_admin_listing_status', { p_id: b.dataset.id, p_status: b.dataset.status });
        await lookup(lastDigits); flash(b.dataset.status === 'approved' ? 'Listing is visible ✓ · الإعلان ظاهر' : 'Listing hidden ✓ · تم إخفاء الإعلان');
        return;
      }
      if (act === 'member') {
        if (b.dataset.status === 'blocked' && !confirm('Suspend this account? They will not be able to send messages.\nإيقاف هذا الحساب؟ لن يستطيع إرسال رسائل.')) return;
        b.disabled = true;
        await call('texcontractor_admin_member_status', { p_user: b.dataset.user, p_status: b.dataset.status });
        await lookup(lastDigits); flash(b.dataset.status === 'blocked' ? 'Account suspended ✓ · تم إيقاف الحساب' : 'Account restored ✓ · تم تفعيل الحساب');
        return;
      }
      if (act === 'block') {
        const on = b.dataset.block === '1';
        if (on && !confirm('Block this number? It cannot be used to list a service.\nحظر هذا الرقم؟ لن يمكن استخدامه لنشر إعلان.')) return;
        b.disabled = true;
        await call('texcontractor_admin_block_phone', { p_phone: b.dataset.phone, p_block: on });
        await lookup(lastDigits); flash(on ? 'Number blocked ✓ · تم حظر الرقم' : 'Number unblocked ✓ · تم إلغاء الحظر');
      }
    } catch (e) { b.disabled = false; flash(e.message, true); }
  };

  const init = () => {
    const bar = document.querySelector('.header-actions');
    if (!bar || document.getElementById('tex-phone-form')) return;
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    const form = document.createElement('form'); form.className = 'tex-phone-form'; form.id = 'tex-phone-form';
    form.innerHTML = '<input type="tel" inputmode="tel" placeholder="Phone · رقم الهاتف" aria-label="Search by phone number"><button type="submit">🔍</button>';
    bar.insertBefore(form, bar.firstChild);
    form.addEventListener('submit', (e) => { e.preventDefault(); lookup(form.querySelector('input').value); });
    modal = document.createElement('div'); modal.className = 'tex-phone-modal'; modal.hidden = true;
    box = document.createElement('div'); box.className = 'tex-phone-box'; modal.appendChild(box);
    box.addEventListener('click', (e) => { const b = e.target.closest('button[data-act]'); if (b) onAction(b); });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.hidden = true; });
    document.body.appendChild(modal);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
