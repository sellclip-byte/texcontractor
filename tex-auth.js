(function () {
  const SUPABASE_URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const SESSION_KEY = 'texcontractor-auth-session';
  const DEFAULT_RETURN = 'index.html';

  const readSession = () => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch (error) {
      return null;
    }
  };

  const saveSession = (session) => {
    if (!session?.access_token || !session?.refresh_token) return;
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at || Math.floor(Date.now() / 1000) + (session.expires_in || 3600),
      user: session.user || null
    }));
  };

  const clearSession = () => localStorage.removeItem(SESSION_KEY);

  // --- Where new members come from (first visit only) and the Google Ads "Sign-up" conversion. ---
  const FIRST_TOUCH_KEY = 'texcontractor-first-touch';
  const SIGNUP_CONVERSION = 'AW-18516159223/6QEpCLq_pqUdEPfVmP1E';
  const LAST_TOUCH_KEY = 'texcontractor-last-touch';
  try {
    const q = new URLSearchParams(window.location.search);
    let ref = '';
    try { ref = document.referrer && new URL(document.referrer).hostname !== window.location.hostname ? new URL(document.referrer).hostname : ''; } catch (_) {}
    // Facebook / Instagram / TikTok apps open links in their own browser and often hide the referrer.
    const ua = navigator.userAgent || '';
    const inApp = /Instagram/i.test(ua) ? 'instagram-app' : /FBAN|FBAV|FB_IAB/i.test(ua) ? 'facebook-app' : /musical_ly|TikTok|BytedanceWebview/i.test(ua) ? 'tiktok-app' : '';
    const source = q.get('utm_source') || (q.get('gclid') ? 'google-ads' : q.get('fbclid') ? 'facebook' : '') || inApp || ref || 'direct';
    const touch = {
      source: source.slice(0, 60), medium: (q.get('utm_medium') || (q.get('gclid') ? 'cpc' : '')).slice(0, 40),
      campaign: (q.get('utm_campaign') || '').slice(0, 80), ref: ref.slice(0, 80), landing: window.location.pathname.slice(0, 120), at: new Date().toISOString()
    };
    if (!localStorage.getItem(FIRST_TOUCH_KEY)) localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch));
    if (touch.source !== 'direct') localStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(touch));
  } catch (_) { /* tracking must never break the page */ }
  const readFirstTouch = () => {
    try {
      const first = JSON.parse(localStorage.getItem(FIRST_TOUCH_KEY) || 'null');
      const last = JSON.parse(localStorage.getItem(LAST_TOUCH_KEY) || 'null');
      if (!first && !last) return null;
      return { ...(first || last), ...(last && first && last.at !== first.at ? { last } : {}) };
    } catch (_) { return null; }
  };
  const recordNewSignup = async (user, accessToken) => {
    try {
      if (!user?.id || !user.created_at || Date.now() - Date.parse(user.created_at) > 30 * 60 * 1000) return;
      const doneKey = 'texcontractor-signup-tracked-' + user.id;
      if (localStorage.getItem(doneKey)) return;
      localStorage.setItem(doneKey, '1');
      if (typeof window.gtag === 'function') window.gtag('event', 'conversion', { send_to: SIGNUP_CONVERSION, value: 1.0, currency: 'USD', transport_type: 'beacon' });
      const touch = readFirstTouch();
      if (touch && !user.user_metadata?.signup_source) {
        await fetch(`${SUPABASE_URL}/auth/v1/user`, { method: 'PUT', headers: authHeaders(accessToken), body: JSON.stringify({ data: { signup_source: touch } }) });
      }
    } catch (_) { /* never block sign-in */ }
  };

  const safeReturnTo = (value) => {
    if (!value) return DEFAULT_RETURN;
    try {
      const url = new URL(value, window.location.href);
      if (url.origin !== window.location.origin) return DEFAULT_RETURN;
      return `${url.pathname.replace(/^\//, '')}${url.search}${url.hash}` || DEFAULT_RETURN;
    } catch (error) {
      return DEFAULT_RETURN;
    }
  };

  const authHref = (returnTo) => `auth.html?return_to=${encodeURIComponent(safeReturnTo(returnTo))}`;

  const authHeaders = (accessToken) => ({
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  });

  const requestJson = async (url, options) => {
    const response = await fetch(url, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = body.msg || body.message || body.error_description || body.error || 'Authentication request failed.';
      const err = new Error(message); err.status = response.status; throw err;
    }
    return body;
  };

  const syncTexContractorMember = async (user, accessToken) => {
    if (!user?.id || !accessToken) return;
    const metadata = user.user_metadata || {};
    const provider = user.app_metadata?.provider || user.identities?.[0]?.provider || 'email';
    await fetch(`${SUPABASE_URL}/rest/v1/texcontractor_members?on_conflict=user_id`, {
      method: 'POST',
      headers: {
        ...authHeaders(accessToken),
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        user_id: user.id,
        email: user.email || '',
        display_name: metadata.full_name || metadata.name || null,
        avatar_url: metadata.avatar_url || null,
        provider,
        last_sign_in_at: user.last_sign_in_at || null,
        updated_at: new Date().toISOString()
      })
    }).catch(() => {});
  };

  const readTexContractorAccess = async (user, accessToken) => {
    if (!user?.id || !accessToken) return { status: null, isAdmin: false };
    try {
      const userId = encodeURIComponent(user.id);
      const memberResponse = await fetch(`${SUPABASE_URL}/rest/v1/texcontractor_members?select=status&user_id=eq.${userId}&limit=1`, { headers: authHeaders(accessToken) });
      if (!memberResponse.ok) return { status: null, isAdmin: false };
      const members = await memberResponse.json().catch(() => []);
      const adminResponse = await fetch(`${SUPABASE_URL}/rest/v1/texcontractor_admins?select=user_id&user_id=eq.${userId}&limit=1`, { headers: authHeaders(accessToken) });
      const admins = adminResponse.ok ? await adminResponse.json().catch(() => []) : [];
      return { status: members?.[0]?.status || null, isAdmin: admins.length > 0 };
    } catch (error) {
      return { status: null, isAdmin: false };
    }
  };

  const finalizeUser = async (user, accessToken, session) => {
    saveSession({ ...session, user });
    await syncTexContractorMember(user, accessToken);
    const access = await readTexContractorAccess(user, accessToken);
    if (access.status === 'blocked' && !access.isAdmin) {
      localStorage.setItem('texcontractor-access-blocked', '1');
      clearSession();
      return null;
    }
    localStorage.removeItem('texcontractor-access-blocked');
    localStorage.setItem('texcontractor-account-created', '1');
    await recordNewSignup(user, accessToken);
    return user;
  };

  // Resolve navigation from server-checked admin membership, never editable metadata.
  const postLoginDestination = async (returnTo, newAccount = false) => {
    const user = await getUser();
    if (!user) return authHref(returnTo || DEFAULT_RETURN);
    const session = readSession();
    const access = await readTexContractorAccess(user, session.access_token);
    const target = safeReturnTo(returnTo || DEFAULT_RETURN);
    const path = target.split(/[?#]/)[0];
    if (access.isAdmin && ['index.html', 'account.html', 'auth.html', ''].includes(path)) return 'contractor-admin.html';
    if (path === 'auth.html') return DEFAULT_RETURN;
    return target;
  };

  // Owner 11-06: stay signed in until the member signs out.
  // - one refresh at a time (several scripts ask at once; a used refresh token must not log the member out)
  // - if another tab already refreshed, use its new session
  // - a network hiccup never signs anyone out; only a refresh token the server truly rejects does
  let refreshing = null;
  const refreshSession = (session) => {
    if (!session?.refresh_token) return Promise.resolve(null);
    if (refreshing) return refreshing;
    refreshing = (async () => {
      try {
        const refreshed = await requestJson(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ refresh_token: session.refresh_token })
        });
        saveSession(refreshed);
        return refreshed;
      } catch (error) {
        const latest = readSession();
        if (latest?.refresh_token && latest.refresh_token !== session.refresh_token) return latest; // another tab won
        if (error && (error.status === 400 || error.status === 401 || error.status === 403)) { clearSession(); return null; }
        return session; // offline or server busy: keep the member signed in and try again later
      } finally { setTimeout(() => { refreshing = null; }, 0); }
    })();
    return refreshing;
  };

  // user from the saved token while offline (so the member is not shown as signed out)
  const cachedUser = (session) => {
    try {
      const p = JSON.parse(atob(String(session.access_token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return p && p.sub ? { id: p.sub, email: p.email || '', phone: p.phone || '', app_metadata: p.app_metadata || {}, user_metadata: p.user_metadata || {} } : null;
    } catch (_) { return null; }
  };

  const getUser = async () => {
    let session = readSession();
    if (!session?.access_token) return null;
    if (session.expires_at && session.expires_at * 1000 < Date.now() + 30000) {
      session = await refreshSession(session);
      if (!session) return null;
    }
    try {
      const user = await requestJson(`${SUPABASE_URL}/auth/v1/user`, {
        headers: authHeaders(session.access_token)
      });
      const current = readSession() || {};
      return finalizeUser(user, session.access_token, current);
    } catch (error) {
      if (error && !error.status) return cachedUser(session); // offline: stay signed in
      const refreshed = await refreshSession(session);
      if (!refreshed?.access_token) return null;
      try {
        const user = await requestJson(`${SUPABASE_URL}/auth/v1/user`, {
          headers: authHeaders(refreshed.access_token)
        });
        return finalizeUser(user, refreshed.access_token, refreshed);
      } catch (retryError) {
        if (retryError && (retryError.status === 401 || retryError.status === 403)) { clearSession(); return null; }
        return cachedUser(refreshed);
      }
    }
  };

  const getAccessToken = async () => {
    const user = await getUser();
    if (!user) return null;
    return readSession()?.access_token || null;
  };

  const captureMagicLinkSession = () => {
    if (!window.location.hash || !window.location.hash.includes('access_token=')) return false;
    const values = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = values.get('access_token');
    const refreshToken = values.get('refresh_token');
    if (!accessToken || !refreshToken) return false;
    saveSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: Number(values.get('expires_at') || 0) || undefined
    });
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
    return true;
  };

  const sendMagicLink = async (email, returnTo) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) throw new Error('Enter a valid email address.');
    const redirectOrigin = ['texcontractor.com', 'www.texcontractor.com'].includes(window.location.hostname)
      ? 'https://texcontractor.com/'
      : window.location.href;
    const redirectTo = new URL(authHref(returnTo), redirectOrigin).href;
    // Supabase may send the link back to the home page; remember where this person wanted to go.
    try { localStorage.setItem('tex_magic_return', safeReturnTo(returnTo)); } catch (_) {}
    await requestJson(`${SUPABASE_URL}/auth/v1/otp`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        email: cleanEmail,
        create_user: true,
        redirect_to: redirectTo
      })
    });
  };


  // Phone sign-in (Supabase Auth phone provider via Twilio Verify): no email or password needed.
  const normalizeUsPhone = (phone) => {
    const d = String(phone || '').replace(/\D/g, '');
    if (d.length === 10) return '+1' + d;
    if (d.length === 11 && d.startsWith('1')) return '+' + d;
    throw new Error('Enter a 10-digit U.S. mobile number.');
  };
  const sendPhoneCode = async (phone, intent) => {
    const e164 = normalizeUsPhone(phone);
    await requestJson(`${SUPABASE_URL}/auth/v1/otp`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ phone: e164, create_user: true, channel: 'sms', ...(intent ? { data: { account_intent: intent } } : {}) })
    });
    return e164;
  };
  const verifyPhoneCode = async (phone, code) => {
    const e164 = normalizeUsPhone(phone);
    const token = String(code || '').replace(/\D/g, '');
    if (token.length < 4) throw new Error('Enter the code we texted you.');
    const result = await requestJson(`${SUPABASE_URL}/auth/v1/verify`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ type: 'sms', phone: e164, token })
    });
    if (!result.access_token) throw new Error('That code did not work. Try again.');
    const user = await finalizeUser(result.user, result.access_token, result);
    if (!user) throw new Error('Access to this account is blocked.');
    // The number is now proven: any directory listing with this number becomes this person's own listing.
    try {
      const claim = await requestJson(`${SUPABASE_URL}/rest/v1/rpc/texcontractor_claim_my_phone_listings`, {
        method: 'POST', headers: authHeaders(result.access_token), body: '{}'
      });
      if (claim && (claim.moved || claim.created)) { try { sessionStorage.setItem('tex_claimed', JSON.stringify(claim)); } catch (_) {} }
    } catch (_) {}
    return user;
  };

  const passwordRequest = async (email, password, intent, returnTo) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const parts = cleanEmail.split('@');
    const local = parts[0] || '', domain = parts[1] || '';
    const validLocal = /^[a-z0-9_+.-]+$/i.test(local) && local.length <= 64 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..');
    const validDomain = domain.length <= 253 && domain.split('.').length >= 2 && domain.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)) && /^[a-z]{2,63}$/i.test(domain.split('.').pop());
    if (parts.length !== 2 || !validLocal || !validDomain || cleanEmail.length > 254) throw new Error('Enter a valid email address, such as name@gmail.com.');
    const typos = { 'gmial.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmail.con': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'outlok.com': 'outlook.com' };
    if (typos[domain]) throw new Error('Check your email address. Did you mean ' + local + '@' + typos[domain] + '?');
    if (intent && (password.length < 6 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))) {
      throw new Error('Use at least 6 characters, including a letter and a number.');
    }
    if (intent) {
      const settings = await requestJson(`${SUPABASE_URL}/auth/v1/settings`, { headers: authHeaders() });
      if (!settings.mailer_autoconfirm) throw new Error('Instant registration is being configured. Please use Google sign-in for now.');
    }
    const redirectTo = new URL(authHref(returnTo), window.location.href).href;
    const result = await requestJson(`${SUPABASE_URL}/auth/v1/${intent ? 'signup?redirect_to=' + encodeURIComponent(redirectTo) : 'token?grant_type=password'}`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ email: cleanEmail, password, ...(intent ? { data: { account_intent: intent } } : {}) })
    });
    if (result.access_token) {
      const user = await finalizeUser(result.user, result.access_token, result);
      if (!user) throw new Error('Access to this account is blocked.');
    }
    return { signedIn: !!result.access_token };
  };

  const updateProfile = async (data) => {
    const token = await getAccessToken();
    if (!token) throw new Error('Please sign in again.');
    if (Object.prototype.hasOwnProperty.call(data, 'contact_phone')) {
      const available = await requestJson(`${SUPABASE_URL}/rest/v1/rpc/texcontractor_account_phone_available`, {
        method: 'POST', headers: authHeaders(token), body: JSON.stringify({ p_phone: data.contact_phone })
      });
      if (!available) throw new Error('This phone number is already linked to another account. Sign in to that account to add more services.');
    }
    const user = await requestJson(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ data })
    });
    await finalizeUser(user, token, readSession());
    return user;
  };

  const uploadAccountPhoto = async (file) => {
    const types = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    if (!file || !types[file.type] || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPG, PNG or WebP image under 5 MB.');
    const user = await getUser();
    const session = readSession();
    if (!user || !session?.access_token) throw new Error('Please sign in again.');
    const path = user.id + '/account/' + crypto.randomUUID() + '.' + types[file.type];
    const response = await fetch(SUPABASE_URL + '/storage/v1/object/texcontractor-media/' + path, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + session.access_token, 'Content-Type': file.type },
      body: file
    });
    if (!response.ok) throw new Error('Your photo could not be uploaded. Please try again.');
    const url = SUPABASE_URL + '/storage/v1/object/public/texcontractor-media/' + path;
    await updateProfile({ avatar_url: url });
    return url;
  };

  const signInWithGoogle = (returnTo) => {
    const redirectOrigin = ['texcontractor.com', 'www.texcontractor.com'].includes(window.location.hostname)
      ? 'https://texcontractor.com/'
      : window.location.href;
    const redirectTo = new URL(authHref(returnTo), redirectOrigin).href;
    const authorizeUrl = new URL(SUPABASE_URL + '/auth/v1/authorize');
    authorizeUrl.searchParams.set('provider', 'google');
    authorizeUrl.searchParams.set('redirect_to', redirectTo);
    window.location.assign(authorizeUrl.href);
  };

  const signOut = async () => {
    const session = readSession();
    if (session?.access_token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: authHeaders(session.access_token)
      }).catch(() => {});
    }
    clearSession();
  };

  const requireUser = async (returnTo) => {
    const user = await getUser();
    if (user) return user;
    window.location.assign(authHref(returnTo || `${window.location.pathname.replace(/^\//, '')}${window.location.search}`));
    return null;
  };

  // Owner 11-09: an email sign-in link can land on ANY page (Supabase sends it to the home page).
  // Pick up the sign-in right here and take the person where they wanted to go, instead of losing it.
  (() => {
    const h = window.location.hash || '';
    if (/error_description=/.test(h)) {
      const msg = decodeURIComponent((h.match(/error_description=([^&]*)/) || [])[1] || '').replace(/\+/g, ' ');
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      const show = () => { const d = document.createElement('div'); d.setAttribute('role', 'alert');
        d.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99999;max-width:92vw;background:#b91c1c;color:#fff;padding:12px 16px;border-radius:12px;font:700 15px system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25)';
        d.textContent = (/expired|invalid|not found/i.test(msg) ? 'This sign-in link expired or was already used. Please ask for a new one.' : (msg || 'Sign-in failed. Please try again.'));
        document.body.appendChild(d); setTimeout(() => d.remove(), 9000); };
      if (document.body) show(); else document.addEventListener('DOMContentLoaded', show, { once: true });
      return;
    }
    if (!/access_token=/.test(h) || !/refresh_token=/.test(h)) return;
    if (/\/auth\.html$/.test(window.location.pathname)) return; // auth.html handles it itself
    captureMagicLinkSession();
    (async () => {
      let want = '';
      try { want = localStorage.getItem('tex_magic_return') || ''; localStorage.removeItem('tex_magic_return'); } catch (_) {}
      try {
        const dest = await postLoginDestination(want || DEFAULT_RETURN);
        const here = window.location.pathname.replace(/^\//, '') || 'index.html';
        if (dest && dest.split(/[?#]/)[0] !== here) window.location.replace(dest);
        else if (dest) window.location.reload();
      } catch (_) {}
    })();
  })();

  window.TexAuth = {
    passwordRequest,
    sendPhoneCode,
    verifyPhoneCode,
    postLoginDestination,
    updateProfile,
    uploadAccountPhoto,
    authHref,
    captureMagicLinkSession,
    getAccessToken,
    getUser,
    requireUser,
    sendMagicLink,
    signInWithGoogle,
    signOut,
    safeReturnTo
  };
})();
