(async function () {
  const box = document.querySelector('[data-join]');
  if (!box) return;
  const isDialog = box.tagName === 'DIALOG';
  if (isDialog) {
    box.querySelector('.join-dismiss').addEventListener('click', () => box.close());
    box.addEventListener('close', () => sessionStorage.setItem('texcontractor-join-dismissed', '1'));
  }
  const params = new URLSearchParams(location.search);
  const onAuth = location.pathname.endsWith('/auth.html');
  const requestedIntent = params.get('intent');
  // Homepage dialog defaults to customers (most visitors are looking for a service).
  let intent = requestedIntent === 'customer' || requestedIntent === 'provider' ? requestedIntent : (isDialog ? 'customer' : 'provider');
  let login = onAuth ? params.get('mode') !== 'signup' : false;
  const form = box.querySelector('form');
  const status = box.querySelector('.join-status');
  const submit = form.querySelector('[type=submit]');
  const message = (text, error = false) => { status.textContent = text; status.dataset.error = String(error); };
  const destination = () => TexAuth.safeReturnTo(params.get('return_to') || 'index.html');
  function render() {
    
    box.querySelector('[data-join-copy]').textContent = login ? 'Sign in to your saved account.' : (intent === 'customer' ? 'Sign up to text technicians directly.' : 'Sign up to receive customer requests by text message.');
    box.querySelectorAll('[data-intent]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.intent === intent)));
    box.classList.toggle('is-login', login);
    box.querySelectorAll('[data-join-mode]').forEach(tab => tab.setAttribute('aria-selected', String((tab.dataset.joinMode === 'login') === login)));
    form.elements.namedItem('password').autocomplete = login ? 'current-password' : 'new-password';
    form.elements.namedItem('password').minLength = login ? 1 : 6;
    box.querySelector('#join-password-help').hidden = login;
    submit.textContent = login ? 'Sign in' : 'Create account & continue';
    const link = box.querySelector('[data-join-login]');
    link.textContent = login ? 'Create an account' : 'Sign in';
    // Replace the text node (not edit it) so the language script keeps the new wording.
    const prefix = box.querySelector('[data-join-prefix]');
    if (prefix) prefix.textContent = login ? 'New here? ' : 'Already have an account? ';
    else link.parentElement.firstChild.textContent = login ? 'New here? ' : 'Already have an account? ';
    link.href = 'auth.html?mode=' + (login ? 'signup' : 'login') + '&intent=' + intent + '&return_to=' + encodeURIComponent(destination());
  }
  box.querySelectorAll('[data-intent]').forEach(button => button.addEventListener('click', () => { intent = button.dataset.intent; render(); }));
  box.querySelector('[data-join-login]').addEventListener('click', event => {
    event.preventDefault();
    login = !login;
    message('');
    render();
  });
  box.querySelectorAll('[data-join-mode]').forEach(tab => tab.addEventListener('click', () => { login = tab.dataset.joinMode === 'login'; message(''); render(); }));
  render();
  form.addEventListener('submit', async event => {
    event.preventDefault(); submit.disabled = true; message('Please wait…');
    try {
      const result = await TexAuth.passwordRequest(form.elements.namedItem('email').value, form.elements.namedItem('password').value, login ? null : intent, login ? destination() : (intent === 'provider' ? 'contractor-register.html' : destination()));
      form.elements.namedItem('password').value = '';
      // New technicians go straight to the one form that takes all their details and photos.
      // New customers go back to where they were (or the homepage).
      const afterSignup = intent === 'provider' ? 'contractor-register.html' : destination();
      if (result.signedIn) location.assign(await TexAuth.postLoginDestination(login ? destination() : afterSignup, !login));
      else message('Instant sign-in is unavailable. Please try signing in with your email and password.', true);
    } catch (error) { message(error.message, true); }
    finally { submit.disabled = false; }
  });
  // Google blocks sign-in inside app browsers (Facebook, Instagram, TikTok...). Explain instead of failing.
  const inAppBrowser = /FBAN|FBAV|FB_IAB|Instagram|Line\/|TikTok|musical_ly|Snapchat|Twitter|LinkedInApp/i.test(navigator.userAgent || '');
  const googleButton = document.getElementById('google-submit');
  if (googleButton && inAppBrowser) {
    const note = document.createElement('p');
    note.className = 'join-note';
    note.textContent = 'Google sign-in does not work inside the Facebook or Instagram app. Use your email and a password above, or open this page in Safari or Chrome to use Google.';
    googleButton.replaceWith(note);
  }
  googleButton?.addEventListener('click', () => TexAuth.signInWithGoogle(destination()));
  document.getElementById('magic-submit')?.addEventListener('click', async () => {
    try { await TexAuth.sendMagicLink(form.elements.namedItem('email').value, destination()); message('Check your email for your sign-in link.'); }
    catch (error) { message(error.message, true); }
  });
  if (onAuth) {
    try {
      const error = new URLSearchParams(location.hash.slice(1)).get('error_description') || params.get('error_description');
      TexAuth.captureMagicLinkSession();
      if (await TexAuth.getUser()) location.replace(await TexAuth.postLoginDestination(destination()));
      else if (error) message(error, true);
    } catch (error) { message(error.message, true); }
  } else {
    try {
      if (await TexAuth.getUser()) {
        box.hidden = true;
        const profile = document.getElementById('account-login');
        if (profile) { profile.href = 'account.html'; profile.textContent = 'My profile'; profile.hidden = false; }
      }
      else if (isDialog && sessionStorage.getItem('texcontractor-join-dismissed') !== '1') {
        // Let visitors browse first: open after 30 seconds or after scrolling about 1.5 screens.
        let shown = false;
        const open = () => {
          if (shown || box.open || document.querySelector('dialog[open]')) return;
          shown = true;
          window.removeEventListener('scroll', onScroll);
          clearTimeout(timer);
          if (sessionStorage.getItem('texcontractor-join-dismissed') !== '1') {
            box.showModal();
            // Focus the dialog itself so the close button doesn't show a focus ring until the visitor uses Tab.
            box.setAttribute('tabindex', '-1');
            box.style.outline = 'none';
            box.focus({ preventScroll: true });
          }
        };
        const onScroll = () => { if (window.scrollY > window.innerHeight * 1.5) open(); };
        const timer = setTimeout(open, 30000);
        window.addEventListener('scroll', onScroll, { passive: true });
      }
    } catch (_) {}
    finally { document.documentElement.classList.remove('tex-member-pending'); }
  }
})();
