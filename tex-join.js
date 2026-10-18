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
  let intent = params.get('intent') === 'customer' ? 'customer' : 'provider';
  let login = onAuth ? params.get('mode') !== 'signup' : false;
  const form = box.querySelector('form');
  const status = box.querySelector('.join-status');
  const submit = form.querySelector('[type=submit]');
  const message = (text, error = false) => { status.textContent = text; status.dataset.error = String(error); };
  const destination = () => TexAuth.safeReturnTo(params.get('return_to') || 'index.html');
  function render() {
    
    box.querySelector('[data-join-copy]').textContent = login ? 'Sign in to your saved account.' : 'A mobile phone is required to receive requests and communicate with others.';
    box.querySelectorAll('[data-intent]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.intent === intent)));
    form.elements.namedItem('password').autocomplete = login ? 'current-password' : 'new-password';
    form.elements.namedItem('password').minLength = login ? 1 : 6;
    box.querySelector('#join-password-help').hidden = login;
    submit.textContent = login ? 'Sign in' : 'Create account & continue';
    const link = box.querySelector('[data-join-login]');
    link.textContent = login ? 'Create an account' : 'Sign in';
    link.parentElement.firstChild.textContent = login ? 'New here? ' : 'Already have an account? ';
    link.href = 'auth.html?mode=' + (login ? 'signup' : 'login') + '&intent=' + intent + '&return_to=' + encodeURIComponent(destination());
  }
  box.querySelectorAll('[data-intent]').forEach(button => button.addEventListener('click', () => { intent = button.dataset.intent; render(); }));
  box.querySelector('[data-join-login]').addEventListener('click', event => {
    event.preventDefault();
    login = !login;
    message('');
    render();
  });
  render();
  form.addEventListener('submit', async event => {
    event.preventDefault(); submit.disabled = true; message('Please wait…');
    try {
      const result = await TexAuth.passwordRequest(form.elements.namedItem('email').value, form.elements.namedItem('password').value, login ? null : intent, login ? destination() : 'account.html');
      form.elements.namedItem('password').value = '';
      if (result.signedIn) location.assign(await TexAuth.postLoginDestination(login ? destination() : null, !login));
      else message('Instant sign-in is unavailable. Please try signing in with your email and password.', true);
    } catch (error) { message(error.message, true); }
    finally { submit.disabled = false; }
  });
  document.getElementById('google-submit')?.addEventListener('click', () => TexAuth.signInWithGoogle(destination()));
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
      else if (isDialog && sessionStorage.getItem('texcontractor-join-dismissed') !== '1') box.showModal();
    } catch (_) {}
    finally { document.documentElement.classList.remove('tex-member-pending'); }
  }
})();
