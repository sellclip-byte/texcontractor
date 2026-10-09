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
      throw new Error(message);
    }
    return body;
  };

  const refreshSession = async (session) => {
    if (!session?.refresh_token) return null;
    try {
      const refreshed = await requestJson(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ refresh_token: session.refresh_token })
      });
      saveSession(refreshed);
      return refreshed;
    } catch (error) {
      clearSession();
      return null;
    }
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
      saveSession({ ...current, user });
      return user;
    } catch (error) {
      const refreshed = await refreshSession(session);
      if (!refreshed?.access_token) return null;
      try {
        const user = await requestJson(`${SUPABASE_URL}/auth/v1/user`, {
          headers: authHeaders(refreshed.access_token)
        });
        saveSession({ ...refreshed, user });
        return user;
      } catch (retryError) {
        clearSession();
        return null;
      }
    }
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

  window.TexAuth = {
    authHref,
    captureMagicLinkSession,
    getUser,
    requireUser,
    sendMagicLink,
    signOut,
    safeReturnTo
  };
})();
