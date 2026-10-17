(function () {
  'use strict';

  const translations = {
    'Language': 'Idioma',
    'English (US)': 'English (US)',
    'Español': 'Español',
    'Search': 'Buscar',
    'Sign in': 'Iniciar sesión',
    'Account': 'Cuenta',
    'Share': 'Compartir',
    'Media': 'Redes',
    'Copy link': 'Copiar enlace',
    'More apps': 'Más aplicaciones',
    'Find a local service, view the work, and text a contractor directly for a quote.': 'Encuentra un servicio local, mira el trabajo y envía un mensaje directo para recibir un presupuesto.',
    'A faster way to connect': 'Una forma más rápida de conectar',
    'Find help fast. Get a first price by text.': 'Encuentra ayuda rápido. Recibe un primer precio por mensaje.',
    'TexContractor helps customers reach the right local professional quickly—and helps professionals earn more by adding the work they already do.': 'TexContractor ayuda a los clientes a encontrar rápidamente al profesional local adecuado y ayuda a los profesionales a ganar más ofreciendo sus servicios.',
    'Find a service': 'Buscar un servicio',
    'Post your service': 'Publicar tu servicio',
    'Find help faster': 'Encuentra ayuda más rápido',
    'Choose a service and text the right local professional directly.': 'Elige un servicio y escribe directamente al profesional local adecuado.',
    'Ask for a first price': 'Pide un primer precio',
    'Send the problem and photos to ask for a quick repair-cost estimate.': 'Envía el problema y fotos para pedir un cálculo rápido del costo.',
    'Add work. Earn more.': 'Añade trabajo. Gana más.',
    'Add your services and receive direct customer requests.': 'Añade tus servicios y recibe solicitudes directas de clientes.',
    'Choose a city or ZIP code': 'Elige una ciudad o código postal',
    'All Services (62 Categories)': 'Todos los servicios (62 categorías)',
    'All Services (59 Categories)': 'Todos los servicios (59 categorías)',
    'About TexContractor': 'Acerca de TexContractor',
    'About Us': 'Sobre nosotros',
    'For Contractors': 'Para contratistas',
    'How to Register as a Contractor': 'Cómo registrarse como contratista',
    'Contractor Guidelines': 'Guía para contratistas',
    'Help Center': 'Centro de ayuda',
    'Safety Guidelines': 'Guía de seguridad',
    'Contact Support': 'Contactar soporte',
    'Privacy Policy': 'Política de privacidad',
    'Terms of Service': 'Términos de servicio',
    'Cookie Policy': 'Política de cookies',
    'Close': 'Cerrar',
    '← All services': '← Todos los servicios',
    'Contractors near you': 'Contratistas cerca de ti',
    'Local contractors who can help': 'Contratistas locales que pueden ayudar',
    'Local service': 'Servicio local',
    'No calls or long forms. Tap “Text this contractor” and send the details from your phone.': 'Sin llamadas ni formularios largos. Toca “Enviar mensaje a este contratista” y envía los detalles desde tu teléfono.',
    'Review the provider profiles.': 'Revisa los perfiles de los proveedores.',
    'Send a direct text describing the problem.': 'Envía un mensaje directo describiendo el problema.',
    'No published contractor profiles yet': 'Aún no hay perfiles de contratistas publicados',
    'Published profiles from professionals who offer this service.': 'Perfiles publicados de profesionales que ofrecen este servicio.',
    'Contractor Profile · TexContractor': 'Perfil del contratista · TexContractor',
    'Contractor profile': 'Perfil del contratista',
    'Back to contractors': 'Volver a contratistas',
    'Back to results': 'Volver a resultados',
    'Profile details': 'Detalles del perfil',
    'About this contractor': 'Sobre este contratista',
    'Experience': 'Experiencia',
    'Location': 'Ubicación',
    'Rating': 'Calificación',
    'Work photos': 'Fotos del trabajo',
    'Photos shared by this contractor to show completed work.': 'Fotos compartidas por este contratista para mostrar trabajos terminados.',
    '✓ Verified contractor': '✓ Contratista verificado',
    'Block this contractor': 'Bloquear este contratista',
    'Sign in · TexContractor': 'Iniciar sesión · TexContractor',
    'Sign in to continue': 'Inicia sesión para continuar',
    'Use your email or Google account to sign in securely. No password is needed.': 'Usa tu correo electrónico o cuenta de Google para iniciar sesión de forma segura. No necesitas contraseña.',
    'Email address': 'Correo electrónico',
    'Continue with Google': 'Continuar con Google',
    'Send me a sign-in link': 'Enviarme un enlace de acceso',
    'By continuing, you confirm that you control this email address.': 'Al continuar, confirmas que controlas esta dirección de correo electrónico.',
    '← Back to TexContractor': '← Volver a TexContractor',
    'Post a Service · TexContractor': 'Publicar un servicio · TexContractor',
    'Contact details': 'Datos de contacto',
    'Display name or company': 'Nombre público o empresa',
    'City': 'Ciudad',
    'State': 'Estado',
    'Service catalog': 'Catálogo de servicios',
    'Choose a service': 'Elige un servicio',
    'Choose years': 'Elige los años',
    'Years in business': 'Años de experiencia',
    'About you and your work': 'Sobre ti y tu trabajo',
    'Public profile': 'Perfil público',
    'Real name': 'Nombre real',
    'Phone number': 'Número de teléfono',
    'Profile photo': 'Foto de perfil',
    'Work photos for customers': 'Fotos del trabajo para clientes',
    'Submit service for review': 'Enviar servicio para revisión',
    'Used for customer contact.': 'Se usa para que los clientes puedan contactarte.',
    'Kept private from the public listing.': 'Se mantiene privado y no aparece en el anuncio público.',
    'Upload up to four photos of completed work. These four images appear in your public profile.': 'Sube hasta cuatro fotos de trabajos terminados. Estas imágenes aparecerán en tu perfil público.',
    'Messages': 'Mensajes',
    'Conversations': 'Conversaciones',
    'New message': 'Nuevo mensaje',
    'Private conversation': 'Conversación privada',
    'Refresh': 'Actualizar',
    'Send': 'Enviar',
    'Sign out': 'Cerrar sesión',
    'View site': 'Ver sitio',
    'Choose a conversation to read or send a message.': 'Elige una conversación para leer o enviar un mensaje.',
    'Loading conversations…': 'Cargando conversaciones…',
    'Babysitting & Childcare Services': 'Servicios de niñera y cuidado infantil',
    'Tutoring & Education Services': 'Servicios de tutoría y educación',
    'Specialty Meal Preparation & Dietary Cooking': 'Preparación de comidas especiales y cocina dietética',
    'Dog Training & Horse Riding Lessons': 'Adiestramiento de perros y clases de equitación',
    'Barber & Hair Styling Services': 'Servicios de barbería y peinado'
  };

  const serviceTranslations = {
    'Central Air Conditioning Repair or Maintenance': 'Reparación o mantenimiento de aire acondicionado central',
    'Electrical and Wiring Repair': 'Reparación eléctrica y de cableado',
    'TV Mounting': 'Instalación de televisores',
    'Tree Trimming and Removal': 'Poda y eliminación de árboles',
    'Furniture Assembly': 'Montaje de muebles',
    'Furniture Moving and Heavy Lifting': 'Mudanza de muebles y carga pesada',
    'Mobile Auto Mechanic': 'Mecánico de autos móvil',
    'Handyman': 'Mantenimiento general del hogar',
    'Outdoor Landscaping and Design': 'Paisajismo y diseño exterior',
    'Interior Painting': 'Pintura interior',
    'Junk Removal': 'Retiro de objetos y basura',
    'Roof Repair or Maintenance': 'Reparación o mantenimiento de techos',
    'Appliance Repair or Maintenance': 'Reparación o mantenimiento de electrodomésticos',
    'Floor Installation or Replacement': 'Instalación o reemplazo de pisos',
    'Lock Installation and Repair': 'Instalación y reparación de cerraduras',
    'Garage Door Repair': 'Reparación de puertas de garaje',
    'Concrete Installation': 'Instalación de concreto',
    'Bathroom Remodel': 'Remodelación de baños',
    'Metalwork': 'Trabajo de metal',
    'Window Repair': 'Reparación de ventanas',
    'Plumbing Drain Repair': 'Reparación de desagües',
    'Plumbing Pipe Repair': 'Reparación de tuberías',
    'Heating System Repair or Maintenance': 'Reparación o mantenimiento de calefacción',
    'House Cleaning': 'Limpieza del hogar',
    'Carpet Cleaning': 'Limpieza de alfombras',
    'Pressure Washing': 'Lavado a presión',
    'Upholstery and Furniture Cleaning': 'Limpieza de tapicería y muebles',
    'Mobile Auto Detailing': 'Detallado móvil de autos',
    'Local Moving (under 50 miles)': 'Mudanza local (menos de 50 millas)',
    'Computer Repair': 'Reparación de computadoras',
    'Notarization': 'Servicios notariales',
    'Dog Grooming': 'Peluquería canina',
    'DJ Services': 'Servicios de DJ',
    'Wedding and Event Makeup': 'Maquillaje para bodas y eventos',
    'Dog Training': 'Adiestramiento de perros',
    'Personal Training': 'Entrenamiento personal',
    'Wedding and Event Photography': 'Fotografía de bodas y eventos',
    'Pest Control Services': 'Control de plagas',
    'Fence and Gate Installation': 'Instalación de cercas y portones',
    'Drywall Repair and Texturing': 'Reparación y texturizado de paneles de yeso',
    'Deck or Porch Remodel or Addition': 'Remodelación o ampliación de terraza o porche',
    'Swimming Pool Cleaning & Maintenance': 'Limpieza y mantenimiento de piscinas',
    'Lighting Installation': 'Instalación de iluminación',
    'General Contracting': 'Contratación general',
    'Gutter Cleaning and Maintenance': 'Limpieza y mantenimiento de canaletas',
    'Door Installation': 'Instalación de puertas',
    'Window Tinting': 'Polarizado de ventanas',
    'Wedding Officiant': 'Oficiante de bodas',
    'Event Planning': 'Organización de eventos',
    'Interior Design': 'Diseño de interiores',
    'Architectural Services': 'Servicios de arquitectura',
    'Home Inspection Consulting': 'Consultoría de inspección del hogar',
    'Home Foundation Repair': 'Reparación de cimientos',
    'In-Home Nursing Care': 'Cuidados de enfermería en el hogar',
    'Private Taxi & Transportation Services': 'Taxi privado y transporte',
    'Lawn Mower, Water Pump & Outdoor Equipment Repair': 'Reparación de cortadoras, bombas de agua y equipos exteriores',
    ...Object.fromEntries([
      ['Babysitting & Childcare Services', 'Servicios de niñera y cuidado infantil'],
      ['Tutoring & Education Services', 'Servicios de tutoría y educación'],
      ['Specialty Meal Preparation & Dietary Cooking', 'Preparación de comidas especiales y cocina dietética'],
      ['Dog Training & Horse Riding Lessons', 'Adiestramiento de perros y clases de equitación']
      ,['Barber & Hair Styling Services', 'Servicios de barbería y peinado']
    ])
  };

  // Keep catalog identifiers in English independently of the visible language.
  const englishServices = new Map(Object.entries(serviceTranslations).map(([en, es]) => [es, en]));
  const canonicalService = value => englishServices.get(value) || value;
  const pageUrl = new URL(window.location.href);
  const requestedService = pageUrl.searchParams.get('service');
  if (requestedService && canonicalService(requestedService) !== requestedService) {
    pageUrl.searchParams.set('service', canonicalService(requestedService));
    window.location.replace(pageUrl.href);
    return;
  }

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  let currentLanguage = localStorage.getItem('texcontractor-language') || 'en';
  let applying = false;

  function remember(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName) && !originalText.has(node)) {
        originalText.set(node, node.nodeValue);
      }
    }
    root.querySelectorAll?.('[placeholder],[title],[aria-label]').forEach((el) => {
      if (!originalAttrs.has(el)) originalAttrs.set(el, { placeholder: el.getAttribute('placeholder'), title: el.getAttribute('title'), 'aria-label': el.getAttribute('aria-label') });
    });
  }

  function translateText(value) {
    const clean = value.trim();
    if (currentLanguage === 'en') return value;
    const translated = serviceTranslations[clean] || translations[clean];
    return translated ? value.replace(clean, translated) : value;
  }

  function applyLanguage() {
    if (applying) return;
    applying = true;
    document.documentElement.lang = currentLanguage === 'es' ? 'es-US' : 'en-US';
    document.querySelectorAll('body *').forEach((el) => {
      if (el.tagName === 'OPTION') {
        const base = canonicalService(el.dataset.texOriginal || el.textContent.trim());
        if (serviceTranslations[base]) {
          el.dataset.texOriginal = base;
          // Without an explicit value, translating an option also changes its value.
          if (!el.hasAttribute('value')) el.value = base;
          const next = currentLanguage === 'es' ? serviceTranslations[base] : base;
          if (el.textContent !== next) el.textContent = next;
        }
      }
    });
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.tagName === 'OPTION' && node.parentElement.dataset.texOriginal) continue;
      const base = originalText.get(node);
      if (base !== undefined) {
        const next = translateText(base);
        if (node.nodeValue !== next) node.nodeValue = next;
      }
    }
    document.querySelectorAll('[placeholder],[title],[aria-label]').forEach((el) => {
      const base = originalAttrs.get(el);
      if (!base) return;
      for (const key of ['placeholder', 'title', 'aria-label']) {
        if (base[key] != null) {
          const next = currentLanguage === 'es' ? translateText(base[key]) : base[key];
          if (el.getAttribute(key) !== next) el.setAttribute(key, next);
        }
      }
    });
    document.querySelectorAll('a[href]').forEach((link) => {
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const service = url.searchParams.get('service');
      if (service && canonicalService(service) !== service) {
        url.searchParams.set('service', canonicalService(service));
        link.href = url.href;
      }
    });
    const picker = document.getElementById('tex-language-picker');
    if (picker) picker.value = currentLanguage;
    applying = false;
  }

  function mountPicker() {
    if (document.getElementById('tex-language-picker')) return;
    const style = document.createElement('style');
    style.textContent = `.tex-language-wrap{display:flex;align-items:center;gap:6px;margin-right:8px;white-space:nowrap}.tex-language-label{font-size:.78rem;font-weight:800;color:#52606d}.tex-language-select{min-height:38px;padding:7px 28px 7px 9px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#1f2937;font:inherit;font-size:.82rem;font-weight:700;cursor:pointer}.tex-language-select:focus{outline:3px solid rgba(7,92,75,.18);border-color:#075c4b}@media(max-width:720px){.tex-language-label{display:none}.tex-language-wrap{margin-right:2px}.tex-language-select{min-height:36px;padding-left:7px;padding-right:22px;font-size:.76rem}}`;
    document.head.appendChild(style);
    const wrap = document.createElement('label');
    wrap.className = 'tex-language-wrap';
    wrap.title = 'Language / Idioma';
    wrap.innerHTML = '<span class="tex-language-label">Language</span><select class="tex-language-select" id="tex-language-picker" aria-label="Language"><option value="en">English (US)</option><option value="es">Español</option></select>';
    const host = document.querySelector('.header-actions') || document.querySelector('header') || document.querySelector('main');
    if (host) host.insertBefore(wrap, host.firstChild);
    else { wrap.style.position = 'fixed'; wrap.style.top = '12px'; wrap.style.right = '16px'; wrap.style.zIndex = '20'; document.body.appendChild(wrap); }
    wrap.querySelector('select').addEventListener('change', (event) => {
      currentLanguage = event.target.value;
      localStorage.setItem('texcontractor-language', currentLanguage);
      remember(document.body);
      applyLanguage();
    });
  }

  function start() {
    // The homepage rebuilds result links from translated card text. Normalize the
    // destination at click time as well, after its search handler has run.
    document.addEventListener('click', (event) => {
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const service = url.searchParams.get('service');
      if (service && canonicalService(service) !== service) {
        url.searchParams.set('service', canonicalService(service));
        link.href = url.href;
      }
    }, true);
    mountPicker();
    remember(document.body);
    applyLanguage();
    const observer = new MutationObserver((mutations) => {
      if (applying) return;
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => { if (node.nodeType === 1) remember(node); });
      }
      applyLanguage();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  // Persist dismissal of the homepage welcome panel across browser sessions.
  // The homepage's legacy handler uses sessionStorage; this adds persistent memory.
  function persistWelcomeDismissal() {
    const panel = document.getElementById('welcome-screen');
    const close = document.getElementById('welcome-close');
    if (!panel || !close) return;
    try {
      if (localStorage.getItem('texcontractor-welcome-closed') === '1') panel.hidden = true;
    } catch (_) { /* Storage may be blocked; keep close button functional. */ }
    close.addEventListener('click', () => {
      panel.hidden = true;
      try { localStorage.setItem('texcontractor-welcome-closed', '1'); } catch (_) {}
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', persistWelcomeDismissal, { once: true });
  } else {
    persistWelcomeDismissal();
  }

})();
