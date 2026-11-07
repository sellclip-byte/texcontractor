(function () {
  let currentUser = null;
  let isAdmin = false;
  let conversations = [];
  let members = [];
  let selectedConversation = null;

  const $ = (selector) => document.querySelector(selector);
  const message = $('#message');
  const app = $('#messages-app');
  const conversationList = $('#conversation-list');
  const chatEmpty = $('#chat-empty');
  const chatWindow = $('#chat-window');
  const chatMessages = $('#chat-messages');
  const messageInput = $('#message-input');
  const sendButton = $('.send');
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
  const displayDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-US', { dateStyle:'medium', timeStyle:'short' }); };
  const displayShortDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month:'short', day:'numeric' }); };
  const showMessage = (text, kind = 'error') => { message.textContent = text; message.className = `message show ${kind}`; };
  const memberMap = () => new Map(members.map((member) => [member.user_id, member]));
  // business name + service for members who signed up by phone (owner 11-06)
  const bizNames = new Map();
  const loadBizNames = async () => {
    try {
      const ids = [...new Set(conversations.map((c) => c.member_id).filter(Boolean))].filter((id) => !bizNames.has(id));
      if (!ids.length) return;
      const q = new URLSearchParams({ select: 'owner_id,display_name,service', owner_id: `in.(${ids.join(',')})`, is_published: 'eq.true' });
      const r = await fetch(`https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_public_services?${q}`, { headers: { apikey: 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r' } });
      if (!r.ok) return;
      (await r.json()).forEach((row) => { if (!bizNames.has(row.owner_id)) bizNames.set(row.owner_id, `${row.display_name} · ${row.service}`); });
    } catch (_) {}
  };
  const conversationTitle = (conversation) => {
    if (!isAdmin) return 'TexContractor Support';
    const member = memberMap().get(conversation.member_id);
    return member?.display_name || bizNames.get(conversation.member_id) || member?.email || 'New member (phone)';
  };
  const conversationSubtitle = (conversation) => {
    if (!isAdmin) return 'Private conversation with the administration';
    const member = memberMap().get(conversation.member_id);
    return member?.email || 'Member account';
  };

  const renderConversations = (unreadById = new Map()) => {
    conversationList.innerHTML = '';
    if (!conversations.length) {
      const empty = document.createElement('div');
      empty.className = 'chat-empty';
      empty.textContent = isAdmin ? 'No conversations yet. Open one from the Admin members list.' : 'No messages yet. Start a private conversation.';
      conversationList.appendChild(empty);
      return;
    }
    conversations.forEach((conversation) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `conversation${selectedConversation?.id === conversation.id ? ' active' : ''}`;
      const unread = unreadById.get(conversation.id) || 0;
      button.innerHTML = `<span class="conversation-title">${escapeHtml(conversationTitle(conversation))}</span><span class="conversation-preview">${escapeHtml(conversation.last_message_preview || 'No messages yet')}</span><span class="conversation-meta"><span>${escapeHtml(displayShortDate(conversation.last_message_at || conversation.updated_at))}</span>${unread ? `<span class="unread">${unread} unread</span>` : ''}</span>`;
      button.addEventListener('click', () => selectConversation(conversation));
      conversationList.appendChild(button);
    });
  };

  const renderChat = (rows) => {
    chatMessages.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'chat-empty';
      empty.textContent = 'No messages yet. Write the first message below.';
      chatMessages.appendChild(empty);
      return;
    }
    rows.forEach((row) => {
      const rowElement = document.createElement('div');
      const outgoing = row.sender_id === currentUser.id;
      rowElement.className = `bubble-row ${outgoing ? 'outgoing' : 'incoming'}`;
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const body = document.createElement('p');
      // Links in messages are clickable; a business-card link also shows the card picture (owner 11-06).
      String(row.body || '').split(/(https:\/\/texcontractor\.com\/[^\s]*)/).forEach((part, i) => {
        if (i % 2) { const a = document.createElement('a'); a.href = part; a.textContent = part; a.target = '_blank'; a.rel = 'noopener'; body.appendChild(a); }
        else if (part) body.appendChild(document.createTextNode(part));
      });
      const time = document.createElement('time');
      time.textContent = displayDate(row.created_at);
      bubble.append(body);
      const cardMatch = /https:\/\/texcontractor\.com\/p\/([0-9a-f-]{36})\//i.exec(row.body || '');
      if (cardMatch) {
        const cardLink = document.createElement('a');
        cardLink.href = `profile.html?contractor=${cardMatch[1]}#pro-card`;
        cardLink.className = 'msg-card';
        cardLink.innerHTML = `<img src="/p/${cardMatch[1]}/card.jpg" alt="Business card" loading="lazy"><span>🎁 Open my card &amp; share it</span>`;
        bubble.append(cardLink);
      }
      bubble.append(time);
      rowElement.appendChild(bubble);
      chatMessages.appendChild(rowElement);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const readUnreadCounts = async () => {
    const counts = new Map();
    await Promise.all(conversations.map(async (conversation) => {
      const rows = await TexMessages.listMessages(conversation.id);
      const unread = rows.filter((row) => row.sender_id !== currentUser.id && !row.read_at).length;
      if (unread) counts.set(conversation.id, unread);
    }));
    return counts;
  };

  const loadConversations = async () => {
    conversations = await TexMessages.listConversations();
    if (isAdmin) await loadBizNames();
    const unread = await readUnreadCounts();
    renderConversations(unread);
  };

  // Admin: fill the message box with a thank-you + the member's business card link (owner 11-06).
  const cardButton = (() => {
    const b = document.createElement('button'); b.type = 'button'; b.id = 'send-card'; b.hidden = true;
    b.textContent = '🎁 Send business card'; b.className = 'send card-send';
    const form = document.getElementById('message-form'); form.parentNode.insertBefore(b, form);
    b.addEventListener('click', async () => {
      if (!selectedConversation) return;
      b.disabled = true;
      try {
        const q = new URLSearchParams({ select: 'id,display_name,service', owner_id: `eq.${selectedConversation.member_id}`, is_published: 'eq.true', order: 'created_at.desc', limit: '3' });
        const r = await fetch(`https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_public_services?${q}`, { headers: { apikey: 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r' } });
        const rows = r.ok ? await r.json() : [];
        if (!rows.length) { showMessage('This member has no published service yet, so there is no card to send.'); return; }
        const first = String(rows[0].display_name || '').trim().split(/\s+/)[0] || 'there';
        const links = rows.map((row) => (rows.length > 1 ? `${row.service}: ` : '') + `https://texcontractor.com/p/${row.id}/`).join('\n');
        messageInput.value = `Hi ${first}! 🎁\n\nThis is a gift from TexContractor to you: your own business card, to help you spread everywhere in your city.\n\nShare your card with your friends and family on WhatsApp, Facebook, Instagram or text. Every share brings your name to more people, and customers text you directly.\n\n${links}\n\nThank you for joining us. We'll keep pushing you forward as much as we can. We truly appreciate you!\nTexContractor`;
        let pv = document.getElementById('card-preview');
        if (!pv) { pv = document.createElement('div'); pv.id = 'card-preview'; b.after(pv); }
        pv.innerHTML = '<p style="margin:10px 16px 4px;font-weight:800;color:#075c4b">Preview: this is the card ' + first + ' will see in the message</p>' +
          rows.map((row) => `<img src="/p/${row.id}/card.jpg" alt="Business card" style="display:block;width:min(360px,calc(100% - 32px));margin:0 16px 8px;border-radius:12px;border:1px solid #e8c766">`).join('');
        messageInput.focus();
        showMessage('Card message ready. Check it and press Send.', 'ok');
      } catch (error) { showMessage(error.message); }
      finally { b.disabled = false; }
    });
    return b;
  })();

  const selectConversation = async (conversation) => {
    selectedConversation = conversation;
    cardButton.hidden = !isAdmin;
    if (isAdmin && conversation.member_id) {
      // show who this is: business name + service (phone sign-ups have no name on the account)
      const q = new URLSearchParams({ select: 'display_name,service', owner_id: `eq.${conversation.member_id}`, is_published: 'eq.true', limit: '3' });
      fetch(`https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_public_services?${q}`, { headers: { apikey: 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r' } })
        .then((r) => r.ok ? r.json() : []).then((rows) => {
          if (selectedConversation !== conversation) return;
          if (rows.length) { $('#chat-title').textContent = rows[0].display_name; $('#chat-subtitle').textContent = 'Technician · ' + [...new Set(rows.map((x) => x.service))].join(', '); }
          else { $('#chat-subtitle').textContent = 'Customer (no service listed)'; }
        }).catch(() => {});
    }
    chatEmpty.hidden = true;
    chatWindow.hidden = false;
    $('#chat-title').textContent = conversationTitle(conversation);
    $('#chat-subtitle').textContent = conversationSubtitle(conversation);
    renderConversations();
    try {
      const rows = await TexMessages.listMessages(conversation.id);
      renderChat(rows);
      await TexMessages.markConversationRead(conversation.id, currentUser.id);
      await loadConversations();
    } catch (error) {
      showMessage(`Could not load this conversation: ${error.message}`);
    }
  };

  const createForCurrentMember = async () => {
    const button = $('#new-message');
    button.disabled = true;
    button.textContent = 'Opening…';
    try {
      const conversation = await TexMessages.ensureConversation(currentUser.id);
      await loadConversations();
      if (conversation) await selectConversation(conversation);
    } catch (error) {
      showMessage(error.message);
    } finally {
      button.disabled = false;
      button.textContent = 'New message';
    }
  };

  $('#new-message').addEventListener('click', createForCurrentMember);
  $('#refresh').addEventListener('click', async () => { await loadConversations(); if (selectedConversation) await selectConversation(selectedConversation); });
  $('#signout').addEventListener('click', async () => { await TexAuth.signOut(); window.location.assign('auth.html?return_to=messages.html'); });
  $('#message-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!selectedConversation) return;
    const body = messageInput.value.trim();
    if (!body) return;
    sendButton.disabled = true;
    sendButton.textContent = 'Sending…';
    try {
      await TexMessages.sendMessage(selectedConversation.id, currentUser.id, body);
      messageInput.value = '';
      document.getElementById('card-preview')?.remove();
      await loadConversations();
      const fresh = conversations.find((row) => row.id === selectedConversation.id) || selectedConversation;
      await selectConversation(fresh);
      showMessage('Message sent.', 'ok');
    } catch (error) {
      showMessage(`Could not send the message: ${error.message}`);
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = 'Send';
    }
  });

  (async () => {
    currentUser = await TexAuth.requireUser(`messages.html${window.location.search}`);
    if (!currentUser) return;
    document.body.classList.add('auth-ready');
    app.hidden = false;
    const admin = await TexAdminApi.getAdminRecord(currentUser).catch(() => null);
    isAdmin = Boolean(admin);
    $('#admin-link').hidden = !isAdmin;
    $('#new-message').hidden = isAdmin;
    try {
      if (isAdmin) members = await TexAdminApi.listMembers();
      const memberId = new URLSearchParams(window.location.search).get('member');
      if (isAdmin && memberId) await TexMessages.ensureConversation(memberId);
      await loadConversations();
      if (memberId && isAdmin) {
        const selected = conversations.find((row) => row.member_id === memberId);
        // Owner 11-06: opened from one member's button -> show only that member, no other conversations.
        document.querySelector('.conversations').hidden = true;
        document.querySelector('.messaging-grid').style.gridTemplateColumns = '1fr';
        const back = document.createElement('a'); back.href = 'messages.html'; back.textContent = '← All conversations';
        back.style.cssText = 'display:inline-block;margin:0 0 10px;font-weight:800;color:#075c4b';
        document.getElementById('messages-app').before(back);
        if (selected) await selectConversation(selected);
        if (selected && new URLSearchParams(window.location.search).get('card') === '1') cardButton.click();
      }
    } catch (error) {
      showMessage(`Could not load messages: ${error.message}`);
    }
  })();
})();
