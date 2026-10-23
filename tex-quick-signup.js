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
      <label for="tqs-email">Email</label>
      <input id="tqs-email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" required>
      <label for="tqs-pass">Password</label>
      <input id="tqs-pass" type="password" autocomplete="new-password" required>
      <p class="tqs-hint" id="tqs-hint">At least 6 characters, with a letter and a number.</p>
      <button class="tqs-go" type="submit" id="tqs-go"></button>
      ${inApp ? '' : '<button class="tqs-google" type="button" id="tqs-google">Continue with Google</button>'}
      <p class="tqs-msg" id="tqs-msg" role="status"></p>
      <p class="tqs-switch" id="tqs-switch"></p>
    </form>`;
    document.body.appendChild(box);
    const form = box.querySelector('form');
    box.querySelector('.tqs-x').addEventListener('click', () => finish(false));
    box.addEventListener('click', (e) => { if (e.target === box) finish(false); });
    document.addEventListener('keydown', (e) => { if (!box.hidden && e.key === 'Escape') finish(false); });
    box.querySelector('#tqs-google')?.addEventListener('click', () => {
      TexAuth.signInWithGoogle(location.pathname.replace(/^\//, '') + location.search);
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = box.querySelector('#tqs-msg'), go = box.querySelector('#tqs-go');
      msg.className = 'tqs-msg'; msg.textContent = 'Please wait…'; go.disabled = true;
      try {
        const email = box.querySelector('#tqs-email').value, pass = box.querySelector('#tqs-pass').value;
        const ret = location.pathname.replace(/^\//, '') + location.search;
        const result = await TexAuth.passwordRequest(email, pass, login ? null : 'customer', ret);
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
  function setMode(isLogin) {
    login = isLogin;
    const who = current.name ? current.name : 'this technician';
    box.querySelector('#tqs-title').textContent = login ? 'Sign in to contact ' + who : 'Create a free account to contact ' + who;
    box.querySelector('#tqs-sub').textContent = login ? 'Welcome back. Sign in and we will open the message for you.' : 'It takes about 20 seconds. Right after, we open the message for you.';
    box.querySelector('#tqs-perks').hidden = login;
    box.querySelector('#tqs-hint').hidden = login;
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
    current = { name: (opts && opts.name) || '' };
    setMode(false);
    box.querySelector('#tqs-msg').textContent = '';
    box.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    if (typeof gtag === 'function') gtag('event', 'quick_signup_open', { source: (opts && opts.source) || 'contact' });
    setTimeout(() => box.querySelector('#tqs-email').focus(), 50);
    return new Promise((resolve) => { pending = resolve; });
  }

  window.TexQuickSignup = { require };
})();
