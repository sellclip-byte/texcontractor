// Shows "enter the 6-digit code we texted you" for technicians whose new listing waits for phone verification.
(function () {
  const URL = 'https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/rpc/';
  const KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const es = () => { try { return localStorage.getItem('texcontractor-language') === 'es'; } catch (e) { return false; } };
  const T = () => es() ? {
    title: 'Confirma tu número de celular',
    body: (l4, sent) => `Para proteger a nuestros clientes, publicamos tu servicio cuando confirmes que el número que termina en ${l4} es tuyo. ${sent ? 'Ya te enviamos' : 'Te enviaremos pronto'} un código de 6 dígitos por mensaje de texto.`,
    label: 'Código de 6 dígitos', btn: 'Confirmar y publicar', ok: '¡Listo! Tu servicio ya está publicado.', bad: 'Algo salió mal.'
  } : {
    title: 'Confirm your mobile number',
    body: (l4, sent) => `To protect our customers, your service goes live once you confirm the number ending in ${l4} is yours. ${sent ? 'We have texted you' : 'We will text you shortly'} a 6-digit code.`,
    label: '6-digit code', btn: 'Confirm and publish', ok: 'Done! Your service is now published.', bad: 'Something went wrong.'
  };
  async function rpc(fn, body) {
    const token = window.TexAuth && await TexAuth.getAccessToken();
    if (!token) return null;
    const r = await fetch(URL + fn, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(j.message || T().bad);
    return j;
  }
  async function render(target) {
    const box = typeof target === 'string' ? document.getElementById(target) : target;
    if (!box) return false;
    let st;
    try { st = await rpc('texcontractor_my_phone_verification'); } catch (e) { return false; }
    if (!st || !st.waiting) { box.hidden = true; box.replaceChildren(); return false; }
    const t = T();
    box.hidden = false;
    box.innerHTML = '';
    box.style.cssText = 'max-width:720px;margin:0 auto 20px;padding:16px 18px;border:2px solid #075c4b;border-radius:13px;background:#ecfdf5;color:#0f172a';
    const h = document.createElement('h2'); h.style.cssText = 'margin:0 0 6px;font-size:1.15rem'; h.textContent = t.title;
    const p = document.createElement('p'); p.style.margin = '0 0 10px'; p.textContent = t.body(st.phone_last4, st.sent);
    const f = document.createElement('form'); f.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center';
    const i = document.createElement('input'); i.inputMode = 'numeric'; i.maxLength = 6; i.autocomplete = 'one-time-code'; i.placeholder = t.label; i.setAttribute('aria-label', t.label); i.required = true;
    i.style.cssText = 'font:inherit;font-size:1.1rem;letter-spacing:3px;padding:10px;border:1px solid #94a3b8;border-radius:9px;width:150px';
    const b = document.createElement('button'); b.type = 'submit'; b.textContent = t.btn; b.style.cssText = 'font:inherit;font-weight:800;padding:11px 14px;border:0;border-radius:9px;background:#075c4b;color:#fff;cursor:pointer';
    const m = document.createElement('p'); m.setAttribute('role', 'status'); m.style.cssText = 'margin:8px 0 0;font-weight:700';
    f.append(i, b);
    f.onsubmit = async (e) => {
      e.preventDefault(); b.disabled = true; m.textContent = '…'; m.style.color = '#0f172a';
      try { await rpc('texcontractor_verify_my_phone', { p_code: i.value }); m.style.color = '#14532d'; m.textContent = t.ok; f.remove(); document.dispatchEvent(new CustomEvent('tex-phone-verified')); }
      catch (err) { m.style.color = '#991b1b'; m.textContent = err.message; b.disabled = false; }
    };
    box.append(h, p, f, m);
    return true;
  }
  window.TexPhoneVerify = { render };
})();
