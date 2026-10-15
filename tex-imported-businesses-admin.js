(function () {
  const host = document.getElementById('dashboard');
  if (!host) return;
  const section = document.createElement('section');
  section.style.cssText = 'margin:24px 0;padding:20px;border:1px solid #d0d5dd;border-radius:14px;background:#fff';
  section.innerHTML = '<h2 style="margin:0 0 8px">Imported Mobile Auto Detailing businesses</h2><p>Public business listings (not contractor applications). Existing contractor records are unchanged.</p><p id="imported-business-count">Loading imported listings…</p><div id="imported-business-list" style="display:grid;gap:10px;max-height:480px;overflow:auto"></div>';
  host.appendChild(section);
  const load = async () => {
    const label = document.getElementById('imported-business-count');
    const list = document.getElementById('imported-business-list');
    try {
      const token = await TexAuth.getAccessToken();
      if (!token) return;
      const response = await fetch('https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_public_business_imports?select=business_name,city,state,phone,website&service=eq.Mobile%20Auto%20Detailing&order=business_name.asc&limit=100', {headers:{apikey:'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r',Authorization:'Bearer '+token}});
      if (!response.ok) throw new Error('Unable to load imported listings ('+response.status+').');
      const rows = await response.json();
      label.textContent = rows.length + ' imported businesses';
      list.replaceChildren();
      rows.forEach(row => {
        const item = document.createElement('div');
        item.style.cssText = 'border:1px solid #e4e7ec;padding:12px;border-radius:9px';
        const name = document.createElement('strong'); name.textContent = row.business_name;
        const detail = document.createElement('div'); detail.textContent = [row.city, row.state, row.phone].filter(Boolean).join(' · ');
        const link = document.createElement('a'); link.textContent = 'Business website'; link.href = row.website; link.target='_blank'; link.rel='noopener noreferrer';
        item.append(name,detail,link); list.appendChild(item);
      });
    } catch (error) {label.textContent = error.message;}
  };
  const observer = new MutationObserver(() => {if (!host.hidden) {observer.disconnect();load();}});
  observer.observe(host,{attributes:true,attributeFilter:['hidden']});
  if (!host.hidden) {observer.disconnect();load();}
})();