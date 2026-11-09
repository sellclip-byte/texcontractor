/* TexContractor quick sign-up: a small window on the same page (no redirect) so a visitor can
   create a free account in seconds and continue straight to texting/calling the technician. */
(function () {
  const inApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|TikTok|musical_ly|Snapchat|Twitter|LinkedInApp/i.test(navigator.userAgent || '');
  let box = null, pending = null, login = false;

  const css = `
  .tqs-back{position:fixed;inset:0;z-index:1000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px}
  .tqs-back[hidden]{display:none}
  .tqs{width:min(420px,100%);max-height:calc(100dvh - 32px);overflow:auto;background:#fff;border-radius:16px;padding:22px 20px 18px;box-shadow:0 24px 60px rgba(0,0,0,.3);font-family:"Trebuchet MS","Segoe UI",Arial,sans-serif;color:#0f172a;position:relative}
  .tqs h2{margin:0 26px 6px 0;font-size:1.25rem;line-height:1.25}
  .tqs .tqs-sub{margin:0 0 14px;color:#475569;font-size:.93rem;line-height:1.45}
  .tqs label{display:block;font-weight:800;font-size:.88rem;margin:10px 0 5px}
  .tqs input{box-sizing:border-box;width:100%;min-height:46px;padding:10px 12px;border:1px solid #a5b6b0;border-radius:9px;font:inherit;font-size:16px}
  .tqs .tqs-hint{font-size:.8rem;color:#64748b;margin:5px 0 0}
  .tqs .tqs-go{display:block;width:100%;margin-top:14px;min-height:48px;border:0;border-radius:10px;background:#075c4b;color:#fff;font:inherit;font-weight:800;font-size:1rem;cursor:pointer}
  .tqs .tqs-go:disabled{opacity:.6;cursor:wait}
  .tqs .tqs-google{display:block;width:100%;margin-top:10px;min-height:44px;border:1.5px solid #cbd5e1;border-radius:10px;background:#fff;color:#0f172a;font:inherit;font-weight:800;cursor:pointer}
  .tqs .tqs-x{position:absolute;top:10px;right:10px;width:34px;height:34px;border:0;border-radius:50%;background:#f1f5f9;font-size:1.2rem;cursor:pointer}
  .tqs .tqs-msg{min-height:1.2em;margin:10px 0 0;font-size:.88rem;color:#475569}
  .tqs .tqs-msg.err{color:#b42318;font-weight:700}
  .tqs .tqs-switch{margin:12px 0 0;font-size:.9rem;text-align:center}
  .tqs .tqs-switch a{color:#075c4b;font-weight:800}
  .tqs .tqs-perks{margin:0 0 4px;padding-left:18px;color:#334155;font-size:.88rem}
  .tqs .tqs-perks li{margin:2px 0}`;

  function build() {
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    box = document.createElement('div');
    box.className = 'tqs-back'; box.hidden = true;
    box.innerHTML = `<form class="tqs" role="dialog" aria-modal="true" aria-labelledby="tqs-title" novalidate>
      <button class="tqs-x" type="button" aria-label="Close">&times;</button>
      <h2 id="tqs-title"></h2>
      <p class="tqs-sub" id="tqs-sub"></p>
      <ul class="tqs-perks" id="tqs-perks"><li>Text or call local technicians directly</li><li>Chat on TexContractor and post job requests</li></ul>
      <div id="tqs-phonebox">
        <label for="tqs-phone" id="tqs-phone-l">Mobile number</label>
        <input id="tqs-phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="(214) 555-0123" maxlength="16">
        <div id="tqs-codebox" hidden><label for="tqs-code" id="tqs-code-l">Code we texted you</label>
        <input id="tqs-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456">
        <p class="tqs-switch" style="margin:6px 0 0"><button type="button" id="tqs-resend" style="background:none;border:0;padding:0;color:#0b7a63;font-weight:800;text-decoration:underline;cursor:pointer" disabled></button></p></div>
        <p class="tqs-hint" id="tqs-phint">We text you a one-time code. No password needed. Msg &amp; data rates may apply.</p>
        <button class="tqs-go" type="button" id="tqs-pgo">Text me a code</button>
        <p class="tqs-switch"><a href="#" id="tqs-useemail">Use email instead</a></p>
      </div>
      <div id="tqs-emailbox" hidden>
      <label for="tqs-email">Email</label>
      <input id="tqs-email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" required>
      <label for="tqs-pass">Password</label>
      <input id="tqs-pass" type="password" autocomplete="new-password" required>
      <p class="tqs-hint" id="tqs-hint">At least 6 characters, with a letter and a number.</p>
      <button class="tqs-go" type="submit" id="tqs-go"></button>
      ${inApp ? '' : '<button class="tqs-google" type="button" id="tqs-google">Continue with Google</button>'}
      <p class="tqs-switch" id="tqs-switch"></p>
      </div>
      <p class="tqs-msg" id="tqs-msg" role="status"></p>
    </form>`;
    document.body.appendChild(box);
    const form = box.querySelector('form');
    box.querySelector('.tqs-x').addEventListener('click', () => finish(false));
    box.addEventListener('click', (e) => { if (e.target === box) finish(false); });
    document.addEventListener('keydown', (e) => { if (!box.hidden && e.key === 'Escape') finish(false); });
    box.querySelector('#tqs-google')?.addEventListener('click', () => {
      TexAuth.signInWithGoogle(current.returnTo || (location.pathname.replace(/^\//, '') + location.search));
    });
    box.querySelector('#tqs-useemail').addEventListener('click', (e) => { e.preventDefault(); box.querySelector('#tqs-phonebox').hidden = true; box.querySelector('#tqs-emailbox').hidden = false; box.querySelector('#tqs-msg').textContent = ''; setTimeout(() => box.querySelector('#tqs-email').focus(), 30); });
    // Owner 11-09: on some phones the first text is slow, so offer "send a new code" after 25 s.
    let resendTimer = null;
    const startResend = (es) => {
      const b = box.querySelector('#tqs-resend'); let left = 25; clearInterval(resendTimer); b.disabled = true;
      const paint = () => { b.textContent = left > 0 ? (es ? `¿No llegó? Puedes pedir otro en ${left} s` : `Didn't get it? You can resend in ${left}s`) : (es ? '¿No llegó? Mandar otro código' : "Didn't get it? Send a new code"); b.disabled = left > 0; b.style.opacity = left > 0 ? '.6' : '1'; };
      paint(); resendTimer = setInterval(() => { left -= 1; paint(); if (left <= 0) clearInterval(resendTimer); }, 1000);
    };
    box.querySelector('#tqs-resend').addEventListener('click', async () => {
      const es = (() => { try { return localStorage.getItem('texcontractor-language') === 'es'; } catch (_) { return false; } })();
      const msg = box.querySelector('#tqs-msg');
      try { await TexAuth.sendPhoneCode(box.querySelector('#tqs-phone').value, current.intent || 'customer'); msg.className = 'tqs-msg'; msg.textContent = es ? 'Te mandamos un código nuevo.' : 'We sent a new code.'; startResend(es); }
      catch (err) { msg.className = 'tqs-msg err'; msg.textContent = (err && err.message) || 'Something went wrong. Please try again.'; }
    });
    box.querySelector('#tqs-code').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); if (e.target.value.length === 6) box.querySelector('#tqs-pgo').click(); });
    box.querySelector('#tqs-pgo').addEventListener('click', async () => {
      const msg = box.querySelector('#tqs-msg'), go = box.querySelector('#tqs-pgo');
      const es = (() => { try { return localStorage.getItem('texcontractor-language') === 'es'; } catch (_) { return false; } })();
      msg.className = 'tqs-msg'; msg.textContent = es ? 'Un momento…' : 'Please wait…'; go.disabled = true;
      try {
        const phone = box.querySelector('#tqs-phone').value;
        if (box.dataset.sent !== '1') {
          await TexAuth.sendPhoneCode(phone, current.intent || 'customer');
          box.dataset.sent = '1'; box.querySelector('#tqs-codebox').hidden = false; box.querySelector('#tqs-phone').readOnly = true;
          go.textContent = es ? 'Confirmar y continuar' : 'Confirm & continue';
          msg.textContent = es ? 'Te mandamos un código por mensaje.' : 'We texted you a code.';
          if (typeof gtag === 'function') gtag('event', 'quick_code_sent', { source: 'quick_signup' });
          setTimeout(() => box.querySelector('#tqs-code').focus(), 30);
          startResend(es);
        } else {
          await TexAuth.verifyPhoneCode(phone, box.querySelector('#tqs-code').value);
          if (typeof gtag === 'function') gtag('event', 'sign_up', { method: 'phone', source: 'quick_signup' });
          msg.textContent = es ? '¡Listo!' : 'You are in!';
          finish(true);
        }
      } catch (err) {
        msg.className = 'tqs-msg err'; msg.textContent = (err && err.message) || 'Something went wrong. Please try again.';
      } finally { go.disabled = false; }
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = box.querySelector('#tqs-msg'), go = box.querySelector('#tqs-go');
      msg.className = 'tqs-msg'; msg.textContent = 'Please wait…'; go.disabled = true;
      try {
        const email = box.querySelector('#tqs-email').value, pass = box.querySelector('#tqs-pass').value;
        const ret = location.pathname.replace(/^\//, '') + location.search;
        const result = await TexAuth.passwordRequest(email, pass, login ? null : (current.intent || 'customer'), current.returnTo || ret);
        if (!result.signedIn) throw new Error('Please sign in with your email and password.');
        if (!login && typeof gtag === 'function') gtag('event', 'sign_up', { method: 'email', source: 'quick_signup' });
        msg.textContent = 'You are in!';
        finish(true);
      } catch (err) {
        let text = err.message || 'Something went wrong. Please try again.';
        if (/already registered|already exists/i.test(text)) { text = 'This email already has an account. Sign in below.'; setMode(true); }
        msg.className = 'tqs-msg err'; msg.textContent = text;
      } finally { go.disabled = false; }
    });
  }

  let current = { name: '' };
  const PROVIDER = {
    en: { t: 'Create your free technician account', tl: 'Sign in to finish your profile', s: 'Then add your name, phone and a photo of your work.', sl: 'Welcome back. Sign in and finish your profile.', p: ['Free profile, no lead fees', 'Customers near you text you directly'], go: 'Create account & continue', gol: 'Sign in & continue', sw: 'Already have an account? <a href="#">Sign in</a>', swl: 'New here? <a href="#">Create a free account</a>', h: 'At least 6 characters, with a letter and a number.', pw: 'Password', g: 'Continue with Google' },
    es: { t: 'Crea tu cuenta gratis de técnico', tl: 'Inicia sesión para terminar tu perfil', s: 'Después agrega tu nombre, teléfono y una foto de tu trabajo.', sl: 'Bienvenido de nuevo. Inicia sesión y termina tu perfil.', p: ['Perfil gratis, sin pagar por clientes', 'Los clientes cerca de ti te escriben directo'], go: 'Crear cuenta y continuar', gol: 'Iniciar sesión y continuar', sw: '¿Ya tienes cuenta? <a href="#">Inicia sesión</a>', swl: '¿Eres nuevo? <a href="#">Crea una cuenta gratis</a>', h: 'Mínimo 6 caracteres, con una letra y un número.', pw: 'Contraseña', g: 'Continuar con Google' }
  };
  function setMode(isLogin) {
    login = isLogin;
    if (current.intent === 'provider') {
      let L = 'en'; try { L = localStorage.getItem('texcontractor-language') === 'es' ? 'es' : 'en'; } catch (_) {}
      const P = PROVIDER[L];
      box.querySelector('#tqs-title').textContent = login ? P.tl : P.t;
      box.querySelector('#tqs-sub').textContent = login ? P.sl : P.s;
      const perks = box.querySelector('#tqs-perks'); perks.hidden = login; perks.innerHTML = P.p.map(x => '<li>' + x + '</li>').join('');
      box.querySelector('#tqs-hint').hidden = login; box.querySelector('#tqs-hint').textContent = P.h;
      box.querySelector('label[for="tqs-pass"]').textContent = P.pw;
      const g = box.querySelector('#tqs-google'); if (g) g.textContent = P.g;
      box.querySelector('#tqs-pass').autocomplete = login ? 'current-password' : 'new-password';
      box.querySelector('#tqs-go').textContent = login ? P.gol : P.go;
      const sw = box.querySelector('#tqs-switch');
      sw.innerHTML = login ? P.swl : P.sw;
      sw.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); box.querySelector('#tqs-msg').textContent = ''; setMode(!login); });
      return;
    }
    const who = current.name ? current.name : 'this technician';
    box.querySelector('#tqs-title').textContent = login ? 'Sign in to contact ' + who : 'Create a free account to contact ' + who;
    box.querySelector('#tqs-sub').textContent = login ? 'Welcome back. Sign in and we will open the message for you.' : 'It takes about 20 seconds. Right after, we open the message for you.';
    const perks = box.querySelector('#tqs-perks'); perks.hidden = login; perks.innerHTML = '<li>Text or call local technicians directly</li><li>Chat on TexContractor and post job requests</li>';
    box.querySelector('#tqs-hint').hidden = login; box.querySelector('#tqs-hint').textContent = 'At least 6 characters, with a letter and a number.';
    box.querySelector('label[for="tqs-pass"]').textContent = 'Password';
    const g = box.querySelector('#tqs-google'); if (g) g.textContent = 'Continue with Google';
    box.querySelector('#tqs-pass').autocomplete = login ? 'current-password' : 'new-password';
    box.querySelector('#tqs-go').textContent = login ? 'Sign in & continue' : 'Create account & continue';
    const sw = box.querySelector('#tqs-switch');
    sw.innerHTML = login ? 'New here? <a href="#">Create a free account</a>' : 'Already have an account? <a href="#">Sign in</a>';
    sw.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); box.querySelector('#tqs-msg').textContent = ''; setMode(!login); });
  }

  function finish(ok) {
    if (!box) return;
    box.hidden = true;
    document.documentElement.style.overflow = '';
    const p = pending; pending = null;
    if (p) p(ok);
  }

  // Resolves true when the visitor is signed in (already, or after signing up / in here).
  async function require(opts) {
    try { if (window.TexAuth && await TexAuth.getUser()) return true; } catch (_) {}
    if (!window.TexAuth) return false;
    if (!box) build();
    if (pending) finish(false);
    current = { name: (opts && opts.name) || '', intent: (opts && opts.intent) || '', returnTo: (opts && opts.returnTo) || '' };
    setMode(false);
    box.querySelector('#tqs-msg').textContent = '';
    box.querySelector('#tqs-phonebox').hidden = false; box.querySelector('#tqs-emailbox').hidden = true;
    { const es = (() => { try { return localStorage.getItem('texcontractor-language') === 'es'; } catch (_) { return false; } })();
      box.querySelector('#tqs-phone-l').textContent = es ? 'Número de celular' : 'Mobile number';
      box.querySelector('#tqs-code-l').textContent = es ? 'Código que te mandamos' : 'Code we texted you';
      box.querySelector('#tqs-phint').textContent = es ? 'Te mandamos un código por mensaje. Sin contraseña. Pueden aplicar cargos.' : 'We text you a one-time code. No password needed. Msg & data rates may apply.';
      box.querySelector('#tqs-useemail').textContent = es ? 'Usar email' : 'Use email instead';
      box.querySelector('#tqs-pgo').textContent = es ? 'Mándame un código' : 'Text me a code';
      box.dataset.sent = ''; box.querySelector('#tqs-codebox').hidden = true; box.querySelector('#tqs-phone').readOnly = false; box.querySelector('#tqs-code').value = ''; }
    box.hidden = false; try { sessionStorage.setItem('tex_signup_started', '1'); } catch (_) {}
    document.documentElement.style.overflow = 'hidden';
    if (typeof gtag === 'function') gtag('event', 'quick_signup_open', { source: (opts && opts.source) || 'contact' });
    setTimeout(() => box.querySelector('#tqs-phone').focus(), 50);
    return new Promise((resolve) => { pending = resolve; });
  }

  window.TexQuickSignup = { require };
})();
