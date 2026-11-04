// Small "watch videos" button on the home page; the videos themselves live on /videos/.
(function () {
  const TEXT = {
    en: { label: 'Watch how it works', sub: 'Short videos · English & Español' },
    es: { label: 'Mira cómo funciona', sub: 'Videos cortos · Español e inglés' }
  };

  function lang() {
    try { return localStorage.getItem('texcontractor-language') === 'es' ? 'es' : 'en'; } catch (e) { return 'en'; }
  }

  function render() {
    const box = document.getElementById('tex-videos');
    if (!box) return;
    const l = lang();
    if (box.dataset.lang === l) return;
    box.dataset.lang = l;
    const t = TEXT[l];
    const a = document.createElement('a');
    a.className = 'tex-videos-btn';
    a.href = 'videos/';
    const icon = document.createElement('span');
    icon.className = 'tex-videos-play';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '▶';
    const txt = document.createElement('span');
    const b = document.createElement('b');
    b.textContent = t.label;
    const s = document.createElement('small');
    s.textContent = t.sub;
    txt.append(b, s);
    a.append(icon, txt);
    box.replaceChildren(a);
  }

  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'tex-language-picker') setTimeout(render, 0);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
