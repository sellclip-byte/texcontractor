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
    for (const key of ['full_name', 'contact_phone']) form.elements.namedItem(key).value = user.user_metadata?.[key] || '';
    // State and city dropdowns (cities come from the site's city list; "Other city" lets people type their own).
    const stateSel = form.elements.namedItem('state'), citySel = form.elements.namedItem('city');
    const otherWrap = document.getElementById('account-other-city'), otherInput = form.elements.namedItem('city_other');
    let cityData = null;
    const loadCityData = () => cityData || (cityData = fetch('city-coordinates-2025.json', { cache: 'force-cache' }).then(r => r.json()).then(d => {
      const by = {}; for (const k of Object.keys(d)) { const [st, c] = k.split('|'); (by[st] ||= []).push(c.replace(/\b\w/g, x => x.toUpperCase())); }
      for (const st in by) by[st].sort(); return by;
    }).catch(() => ({})));
    const syncOther = () => { otherWrap.hidden = citySel.value !== '__other'; if (otherWrap.hidden) otherInput.value = ''; };
    const fillCities = async (selected) => {
      const st = stateSel.value;
      citySel.replaceChildren(new Option(st ? 'Loading cities…' : 'Choose a state first', ''));
      citySel.disabled = true;
      if (!st) { syncOther(); return; }
      const list = (await loadCityData())[st] || [];
      if (stateSel.value !== st) return;
      citySel.replaceChildren(new Option('Choose a city', ''), ...list.map(c => new Option(c, c)), new Option('Other city…', '__other'));
      citySel.disabled = false;
      if (selected) {
        const match = list.find(c => c.toLowerCase() === selected.toLowerCase());
        if (match) citySel.value = match; else { citySel.value = '__other'; otherInput.value = selected; }
      }
      syncOther();
    };
    stateSel.addEventListener('change', () => fillCities(''));
    citySel.addEventListener('change', syncOther);
    const savedState = String(user.user_metadata?.state || '').trim();
    const stateCode = [...stateSel.options].find(o => o.value && (o.value.toLowerCase() === savedState.toLowerCase() || o.text.toLowerCase() === savedState.toLowerCase()))?.value || '';
    stateSel.value = stateCode;
    fillCities(String(user.user_metadata?.city || '').trim());
    form.addEventListener('submit', async event => {
      event.preventDefault(); const button = form.querySelector('button'); button.disabled = true;
      try {
        const data = {};
        for (const key of ['full_name', 'contact_phone', 'state']) data[key] = form.elements.namedItem(key).value.trim();
        const cityChoice = form.elements.namedItem('city').value;
        data.city = (cityChoice === '__other' ? form.elements.namedItem('city_other').value : cityChoice).trim();
        if (!data.state) throw new Error('Choose your state.');
        if (!data.city) throw new Error('Choose your city.');
        const digits = data.contact_phone.replace(/\D/g, '');
        if (!/^(1)?[2-9][0-9]{2}[2-9][0-9]{6}$/.test(digits)) throw new Error('Enter a valid US mobile phone number.');
        await TexAuth.updateProfile(data); status.textContent = 'Your details are saved.';
      } catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    });
  } catch (error) { status.textContent = error.message; }
  document.getElementById('sign-out').addEventListener('click', async () => { await TexAuth.signOut(); location.assign('index.html'); });
})();