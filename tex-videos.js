// "How it works" videos on the home page. English by default, Spanish when the visitor picks Español.
(function () {
  const VIDEOS = {
    en: {
      title: 'See how it works',
      sub: 'Short videos: save the site to your phone, find a pro, and list your service.',
      items: [
        ['home-en', 'No app needed: add it to your Home Screen'],
        ['tech-en', 'Technicians: build customer trust'],
        ['dishwasher-en', 'Text a local pro and get it done'],
        ['top-en', 'What Texans call for most']
      ]
    },
    es: {
      title: 'Mira cómo funciona',
      sub: 'Videos cortos: guarda el sitio en tu teléfono, encuentra un profesional y publica tu servicio.',
      items: [
        ['home-es', 'Sin descargar apps: agrégalo a tu pantalla de inicio'],
        ['tech-es', 'Técnicos: gánense la confianza del cliente'],
        ['dishwasher-es', 'Escríbele a un profesional local, ¡y listo!'],
        ['top-es', '¿Para qué llaman más los texanos?']
      ]
    }
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
    const data = VIDEOS[l];
    const wrap = document.createElement('div');
    wrap.className = 'tex-videos-inner';
    const head = document.createElement('div');
    head.className = 'tex-videos-head';
    const h = document.createElement('h2');
    h.className = 'section-title';
    h.textContent = data.title;
    const p = document.createElement('p');
    p.textContent = data.sub;
    head.append(h, p);
    const row = document.createElement('div');
    row.className = 'tex-videos-row';
    data.items.forEach(([file, label]) => {
      const fig = document.createElement('figure');
      const v = document.createElement('video');
      v.src = 'videos/' + file + '.mp4';
      v.poster = 'videos/' + file + '.jpg';
      v.preload = 'none';
      v.controls = true;
      v.playsInline = true;
      v.setAttribute('aria-label', label);
      const cap = document.createElement('figcaption');
      cap.textContent = label;
      fig.append(v, cap);
      row.append(fig);
    });
    wrap.append(head, row);
    box.replaceChildren(wrap);
  }

  // Only one video plays at a time.
  document.addEventListener('play', (e) => {
    if (!e.target.closest || !e.target.closest('#tex-videos')) return;
    document.querySelectorAll('#tex-videos video').forEach((v) => { if (v !== e.target) v.pause(); });
  }, true);
  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'tex-language-picker') setTimeout(render, 0);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
