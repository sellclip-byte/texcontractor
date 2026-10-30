// Compact "How it works" strip on the home page: English and Spanish side by side,
// with a link to every video on the About & Media page.
(function () {
  const ITEMS = [
    ['entrevista-fundadores-es', 'Español', 'Así nació TexContractor: entrevista'],
    ['kitchen-drain-plumber-en', 'English', "Sink backed up before dinner?"],
    ['techo-goteando-es', 'Español', "¿Se gotea el techo?"],
    ['math-tutor-en', 'English', "Need a math tutor?"],
    ['limpieza-casas-es', 'Español', "¿Limpias casas? Regístrate"],
    ['pest-control-en', 'English', "Roaches? Text an exterminator"],
    ['detallado-autos-es', 'Español', "¿Detallado a domicilio?"],
    ['movers-couple-en', 'English', "Moving? Text local movers"],
    ['home-nurse-en', 'English', "In-home care for a parent"],
    ['computer-repair-tech-en', 'English', "Computer techs: get local customers"],
    ['tree-crew-en', 'English', "Tree crews: let neighbors text you"],
    ['barking-dog-en', 'English', 'Dog barking all night?'],
    ['local-jobs-en', 'English', 'Get more local jobs'],
    ['jefe-es', 'Español', 'Aquí tú eres el jefe'],
    ['babysitter-en', 'English', 'Need a babysitter tonight?'],
    ['babysitter-es', 'Español', '¿Necesitas niñera hoy?'],
    ['ac-en', 'English', 'AC quit in the Texas heat?'],
    ['ac-es', 'Español', '¿Se descompuso el aire?'],
    ['owner-technician-en', 'English', 'How to list your service free'],
    ['owner-customer-es', 'Español', 'Cómo encontrar un técnico'],
    ['car-breakdown-en', 'English', "Car won't start? Text a mechanic"],
    ['car-breakdown-es', 'Español', '¿No arranca la troca?'],
    ['tech-leads-en', 'English', 'Tired of paying for leads?'],
    ['tech-leads-es', 'Español', '¿Cansado de pagar por clientes?'],
    ['home-en', 'English', 'No app needed: add it to your Home Screen'],
    ['home-es', 'Español', 'Sin descargar apps: agrégalo a tu pantalla de inicio'],
    ['tech-en', 'English', 'Technicians: build customer trust'],
    ['tech-es', 'Español', 'Técnicos: gánense la confianza del cliente']
  ];
  const TEXT = {
    en: { title: 'Watch how it works', more: 'See all videos' },
    es: { title: 'Mira cómo funciona', more: 'Ver todos los videos' }
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
    const wrap = document.createElement('div');
    wrap.className = 'tex-videos-inner';
    const head = document.createElement('div');
    head.className = 'tex-videos-head';
    const h = document.createElement('h2');
    h.textContent = t.title;
    const more = document.createElement('a');
    more.href = 'videos/';
    more.textContent = t.more + ' →';
    head.append(h, more);
    const row = document.createElement('div');
    row.className = 'tex-videos-row';
    ITEMS.forEach(([file, tag, label]) => {
      const fig = document.createElement('figure');
      const v = document.createElement('video');
      v.src = 'videos/' + file + '.mp4';
      v.poster = 'videos/' + file + '.jpg';
      v.preload = 'none';
      v.controls = true;
      v.playsInline = true;
      v.setAttribute('aria-label', label);
      const cap = document.createElement('figcaption');
      const badge = document.createElement('span');
      badge.className = 'tex-videos-lang';
      badge.textContent = tag;
      const link = document.createElement('a');
      link.href = 'videos/' + file + '.html';
      link.textContent = label;
      cap.append(badge, link);
      fig.append(v, cap);
      row.append(fig);
    });
    wrap.append(head, row);
    box.replaceChildren(wrap);
  }

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
