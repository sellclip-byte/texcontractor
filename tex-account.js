(async function () {
  const form = document.getElementById('account-form');
  const status = document.getElementById('account-message');
  try {
    const user = await TexAuth.requireUser('account.html');
    if (!user) return;
    const avatar = document.getElementById('account-avatar');
    const showPhoto = url => {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:') return;
        avatar.src = parsed.href; avatar.hidden = false;
      } catch (_) {}
    };
    showPhoto(user.user_metadata?.avatar_url);
    const photo = document.getElementById('account-photo');
    photo.addEventListener('change', async () => {
      const file = photo.files?.[0]; if (!file) return;
      photo.disabled = true; status.textContent = 'Saving your photo…';
      try { showPhoto(await TexAuth.uploadAccountPhoto(file)); status.textContent = 'Your profile photo is saved.'; }
      catch (error) { status.textContent = error.message; }
      finally { photo.disabled = false; photo.value = ''; }
    });
    for (const key of ['full_name', 'contact_phone', 'city', 'state']) form.elements.namedItem(key).value = user.user_metadata?.[key] || '';
    form.addEventListener('submit', async event => {
      event.preventDefault(); const button = form.querySelector('button'); button.disabled = true;
      try {
        const data = {};
        for (const key of ['full_name', 'contact_phone', 'city', 'state']) data[key] = form.elements.namedItem(key).value.trim();
        const digits = data.contact_phone.replace(/\D/g, '');
        if (!/^(1)?[2-9][0-9]{2}[2-9][0-9]{6}$/.test(digits)) throw new Error('Enter a valid US mobile phone number.');
        await TexAuth.updateProfile(data); status.textContent = 'Your details are saved.';
      } catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    });
  } catch (error) { status.textContent = error.message; }
  document.getElementById('sign-out').addEventListener('click', async () => { await TexAuth.signOut(); location.assign('index.html'); });
})();