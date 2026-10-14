(function () {
  const SUPABASE_URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const apiHeaders = (token) => ({
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${token || SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  });
  const readBody = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch (error) { return { message: text }; }
  };
  const request = async (path, options = {}, token) => {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...options,
      headers: { ...apiHeaders(token), ...(options.headers || {}) }
    });
    const body = await readBody(response);
    if (!response.ok) throw new Error(body?.message || body?.msg || body?.error || 'Messaging request failed.');
    return body;
  };
  const encode = (value) => encodeURIComponent(value);

  const listConversations = async () => {
    const token = await TexAuth.getAccessToken();
    if (!token) throw new Error('Your sign-in session expired. Please sign in again.');
    const params = new URLSearchParams({ select: '*', order: 'updated_at.desc' });
    return request(`/rest/v1/texcontractor_conversations?${params.toString()}`, { method:'GET' }, token) || [];
  };

  const ensureConversation = async (memberId) => {
    const token = await TexAuth.getAccessToken();
    if (!token || !memberId) throw new Error('A member account is required to start a conversation.');
    const rows = await request('/rest/v1/texcontractor_conversations?on_conflict=member_id', {
      method:'POST',
      headers:{ Prefer:'resolution=merge-duplicates,return=representation' },
      body:JSON.stringify({ member_id:memberId, subject:'TexContractor Support' })
    }, token);
    return rows?.[0] || null;
  };

  const listMessages = async (conversationId) => {
    const token = await TexAuth.getAccessToken();
    if (!token || !conversationId) return [];
    const params = new URLSearchParams({ select:'id,conversation_id,sender_id,body,created_at,read_at', conversation_id:`eq.${conversationId}`, order:'created_at.asc' });
    return request(`/rest/v1/texcontractor_messages?${params.toString()}`, { method:'GET' }, token) || [];
  };

  const sendMessage = async (conversationId, senderId, body) => {
    const token = await TexAuth.getAccessToken();
    const cleanBody = String(body || '').trim();
    if (!token || !conversationId || !senderId || !cleanBody) throw new Error('Write a message first.');
    if (cleanBody.length > 4000) throw new Error('Messages are limited to 4,000 characters.');
    const rows = await request('/rest/v1/texcontractor_messages?select=*', {
      method:'POST',
      headers:{ Prefer:'return=representation' },
      body:JSON.stringify({ conversation_id:conversationId, sender_id:senderId, body:cleanBody })
    }, token);
    await request(`/rest/v1/texcontractor_conversations?id=eq.${encode(conversationId)}`, {
      method:'PATCH',
      headers:{ Prefer:'return=minimal' },
      body:JSON.stringify({ last_message_preview:cleanBody.slice(0, 160), last_message_at:new Date().toISOString(), updated_at:new Date().toISOString() })
    }, token);
    return rows?.[0] || null;
  };

  const markConversationRead = async (conversationId, userId) => {
    const token = await TexAuth.getAccessToken();
    if (!token || !conversationId || !userId) return;
    await request(`/rest/v1/texcontractor_messages?conversation_id=eq.${encode(conversationId)}&sender_id=neq.${encode(userId)}&read_at=is.null`, {
      method:'PATCH',
      headers:{ Prefer:'return=minimal' },
      body:JSON.stringify({ read_at:new Date().toISOString() })
    }, token);
  };

  window.TexMessages = { ensureConversation, listConversations, listMessages, markConversationRead, sendMessage };
})();
