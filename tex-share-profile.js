/* Share a technician profile link (native share sheet on phones, copy-link fallback). */
(function () {
  const SITE = 'https://texcontractor.com/';
  const SUPABASE_URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';

  const profileUrl = (id, service) => {
    const url = new URL('profile.html', SITE);
    url.searchParams.set('contractor', id);
    if (service) url.searchParams.set('service', service);
    return url.href;
  };

  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (_) {}
    try {
      const area = document.createElement('textarea');
      area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
      document.body.appendChild(area); area.select();
      const ok = document.execCommand('copy'); area.remove(); return ok;
    } catch (_) { return false; }
  };

  // Returns 'shared', 'copied' or 'failed'.
  const share = async ({ url, title, text }) => {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return 'shared'; }
      catch (error) { if (error && error.name === 'AbortError') return 'cancelled'; }
    }
    return (await copyText(`${text} ${url}`)) ? 'copied' : 'failed';
  };

  const feedback = (el, result) => {
    if (!el) return;
    el.textContent = result === 'copied' ? 'Link copied. Paste it in a text, WhatsApp or Facebook.'
      : result === 'failed' ? 'Could not share automatically. Copy the link from the address bar.' : '';
  };

  window.TexShareProfile = { profileUrl, share, copyText, feedback };

  /* Public profile page: "Share this profile" button for verified technician profiles. */
  const publicButton = document.getElementById('share-profile-button');
  if (publicButton) {
    const params = new URLSearchParams(location.search);
    const id = params.get('contractor');
    if (id) {
      publicButton.hidden = false;
      publicButton.addEventListener('click', async () => {
        const name = (document.getElementById('contractor-name')?.textContent || 'this technician').trim();
        const result = await share({
          url: profileUrl(id, params.get('service')),
          title: `${name} · TexContractor`,
          text: `${name} on TexContractor — text them directly for a quote:`
        });
        feedback(document.getElementById('share-profile-status'), result);
      });
    }
  }

  /* Account page: "Share my profile" for the signed-in technician's approved profiles. */
  const accountBox = document.getElementById('share-my-profile');
  if (accountBox && window.TexAuth) {
    (async () => {
      try {
        const user = await TexAuth.getUser();
        const token = await TexAuth.getAccessToken();
        if (!user || !token) return;
        const query = new URLSearchParams({ select: 'id,display_name,service', owner_id: `eq.${user.id}`, status: 'eq.approved', order: 'created_at.asc' });
        const response = await fetch(`${SUPABASE_URL}/rest/v1/texcontractor_submissions?${query.toString()}`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return;
        const rows = await response.json();
        if (!Array.isArray(rows) || !rows.length) return;
        const list = accountBox.querySelector('[data-share-list]');
        const status = accountBox.querySelector('[data-share-status]');
        rows.forEach((row) => {
          const url = profileUrl(row.id, row.service);
          const item = document.createElement('div');
          item.className = 'share-item';
          const label = document.createElement('p');
          label.className = 'share-service';
          label.textContent = row.service || 'My service profile';
          const shareButton = document.createElement('button');
          shareButton.type = 'button'; shareButton.className = 'join-submit share-main';
          shareButton.textContent = 'Share my profile';
          shareButton.addEventListener('click', async () => {
            feedback(status, await share({ url, title: `${row.display_name || 'My profile'} · TexContractor`, text: 'Text me directly for a quote:' }));
          });
          const copyButton = document.createElement('button');
          copyButton.type = 'button'; copyButton.className = 'share-copy';
          copyButton.textContent = 'Copy link';
          copyButton.addEventListener('click', async () => {
            feedback(status, (await copyText(url)) ? 'copied' : 'failed');
          });
          const view = document.createElement('a');
          view.href = url; view.textContent = 'View my public profile';
          item.append(label, shareButton, copyButton, view);
          list.appendChild(item);
        });
        accountBox.hidden = false;
      } catch (_) { /* Sharing is optional and must never break the account page. */ }
    })();
  }
})();
