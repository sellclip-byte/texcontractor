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
    return user;
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
      return finalizeUser(user, session.access_token, current);
    } catch (error) {
      const refreshed = await refreshSession(session);
      if (!refreshed?.access_token) return null;
      try {
        const user = await requestJson(`${SUPABASE_URL}/auth/v1/user`, {
          headers: authHeaders(refreshed.access_token)
        });
        return finalizeUser(user, refreshed.access_token, refreshed);
      } catch (retryError) {
        clearSession();
        return null;
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

  window.TexAuth = {
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
