// Builds the pre-filled text message a customer sends to a technician.
// Language follows the site language (English or Spanish).
(function () {
  'use strict';
  function lang() {
    try { if (window.TexLanguage) return window.TexLanguage.lang(); } catch (_) {}
    try { return localStorage.getItem('texcontractor-language') === 'es' ? 'es' : 'en'; } catch (_) { return 'en'; }
  }
  function serviceName(service, es) {
    const s = String(service || '').trim();
    if (!s) return '';
    if (!es) return s;
    let t = s;
    try { if (window.TexLanguage) t = window.TexLanguage.service(s); } catch (_) {}
    return t === s ? s : t.charAt(0).toLowerCase() + t.slice(1);
  }
  function greetName(name, person) {
    const n = String(name || '').trim().replace(/\s+/g, ' ');
    if (!n) return '';
    // People: first name only. Businesses: full name.
    return person ? n.split(' ')[0] : n;
  }
  window.TexSmsMessage = function ({ name, service, person, profileUrl }) {
    const es = lang() === 'es';
    const who = greetName(name, person);
    const svc = serviceName(service, es);
    const link = profileUrl || 'https://texcontractor.com';
    if (es) {
      return [
        (who ? 'Hola ' + who : 'Hola') + ' \u{1F44B}',
        (svc ? 'Encontré tu servicio de ' + svc : 'Encontré tu servicio') + ' en TexContractor:',
        link,
        '',
        'Necesito un presupuesto.',
        '\u{1F4CD} Mi código postal: ',
        '\u{1F527} Problema: ',
        '',
        'Puedo enviar fotos o video. ¡Gracias!'
      ].join('\n');
    }
    return [
      (who ? 'Hi ' + who : 'Hi') + ' \u{1F44B}',
      (svc ? 'I found your ' + svc + ' service' : 'I found your service') + ' on TexContractor:',
      link,
      '',
      'I need an estimate.',
      '\u{1F4CD} My ZIP: ',
      '\u{1F527} Problem: ',
      '',
      'I can send photos or a video. Thanks!'
    ].join('\n');
  };
})();
