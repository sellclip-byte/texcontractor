/* "Share with friends & family" box (owner 11-06). Shown after a customer joins and after a pro publishes a service.
   TexShareFriends.render(el, {kind:'customer'|'pro', url, lang:'en'|'es', service}) */
(function () {
  var T = {
    en: {
      customerH: 'Share with friends & family',
      customerP: 'Know someone who needs a plumber, a DJ or a handyman? Send them TexContractor. It’s free.',
      customerMsg: 'I use TexContractor to find local pros. You text them directly, free: ',
      proH: 'Share your profile with friends & family',
      thanks: function (n) { return 'Thank you, ' + n + ', for joining TexContractor free! 🙌'; },
      wish: 'We hope to hear you\u2019re busy with new jobs soon. Share your profile with friends and family: every friend who shares it sends your name to more people, and more customers text you.',
      proP: 'The more people see your profile, the more customers text you. One message to your friends can bring your next job.',
      proMsg: function (s) { return 'I’m on TexContractor' + (s ? ' for ' + s : '') + '. Need something done? Text me directly here: '; },
      copy: 'Copy link', copied: 'Link copied ✓', more: 'More…', sms: 'Text message'
    },
    es: {
      customerH: 'Compártelo con familia y amigos',
      customerP: '¿Conoces a alguien que necesite un plomero, un DJ o un handyman? Mándale TexContractor. Es gratis.',
      customerMsg: 'Uso TexContractor para encontrar técnicos de mi zona. Les escribes directo, gratis: ',
      proH: 'Comparte tu perfil con familia y amigos',
      thanks: function (n) { return '\u00a1Gracias, ' + n + ', por unirte gratis a TexContractor! 🙌'; },
      wish: 'Esperamos verte muy ocupado con trabajos nuevos. Comparte tu perfil con familia y amigos: cada amigo que lo comparte lleva tu nombre a m\u00e1s gente, y m\u00e1s clientes te escriben.',
      proP: 'Entre más gente vea tu perfil, más clientes te escriben. Un mensaje a tus amigos puede traerte tu próximo trabajo.',
      proMsg: function (s) { return 'Ya estoy en TexContractor' + (s ? ' (' + s + ')' : '') + '. ¿Necesitas algo? Escríbeme directo aquí: '; },
      copy: 'Copiar enlace', copied: 'Enlace copiado ✓', more: 'Más…', sms: 'Mensaje de texto'
    }
  };
  function css() {
    if (document.getElementById('tsf-css')) return;
    var s = document.createElement('style'); s.id = 'tsf-css';
    s.textContent = '.tsf{margin:16px 0;padding:16px;border:2px solid #e8c766;border-radius:16px;background:#fffaf0;text-align:center}' +
      '.tsf h3{margin:0 0 6px;font-size:1.15rem;color:#111827}.tsf p{margin:0 0 12px;color:#374151;font-size:.95rem;line-height:1.35}' +
      '.tsf-g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}' +
      '.tsf-g a,.tsf-g button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:62px;padding:6px;border-radius:12px;border:1px solid #e5e7eb;background:#fff;color:#111827;font:700 .8rem system-ui,sans-serif;text-decoration:none;cursor:pointer}' +
      '.tsf-g svg{width:24px;height:24px}.tsf-ok{margin-top:8px;color:#0b7a63;font-weight:700;min-height:1em}';
    document.head.appendChild(s);
  }
  var ICON = {
    wa: '<svg viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"/></svg>',
    ms: '<svg viewBox="0 0 24 24" fill="#0084FF"><path d="M12 2C6.4 2 2 6.1 2 11.7c0 2.9 1.2 5.5 3.2 7.3V22l3-1.6c.9.2 1.8.4 2.8.4 5.6 0 10-4.1 10-9.7S17.6 2 12 2zm1 13l-2.5-2.7L5.6 15l5.4-5.7 2.6 2.7 4.8-2.7L13 15z"/></svg>',
    sms: '<svg viewBox="0 0 24 24" fill="none" stroke="#0b7a63" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.3A8 8 0 1 1 21 12z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2"><path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>'
  };
  function render(el, o) {
    if (!el) return; css();
    var t = T[o.lang === 'es' ? 'es' : 'en'], pro = o.kind === 'pro';
    var url = o.url, msg = (pro ? t.proMsg(o.service) : t.customerMsg) + url, e = encodeURIComponent;
    var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    var smsHref = 'sms:' + (ios ? '&' : '?') + 'body=' + e(msg);
    var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    var nm = String(o.name || '').trim().split(/\s+/)[0].replace(/[<>&"]/g, '');
    var head = pro && nm ? t.thanks(nm) : (pro ? t.proH : t.customerH), body = pro && nm ? t.wish : (pro ? t.proP : t.customerP);
    var h = '<div class="tsf"><h3>' + head + '</h3><p>' + body + '</p><div class="tsf-g">' +
      '<a data-ch="whatsapp" target="_blank" rel="noopener" href="https://wa.me/?text=' + e(msg) + '">' + ICON.wa + 'WhatsApp</a>' +
      '<a data-ch="facebook" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + e(url) + '">' + ICON.fb + 'Facebook</a>' +
      (mobile ? '<a data-ch="messenger" href="fb-messenger://share?link=' + e(url) + '">' + ICON.ms + 'Messenger</a>' : '') +
      '<a data-ch="sms" href="' + smsHref + '">' + ICON.sms + t.sms + '</a>' +
      '<button type="button" data-ch="copy">' + ICON.copy + t.copy + '</button>' +
      (navigator.share ? '<button type="button" data-ch="more">' + ICON.more + t.more + '</button>' : '') +
      '</div><div class="tsf-ok" aria-live="polite"></div></div>';
    el.innerHTML = h;
    el.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-ch]'); if (!b) return;
      var ch = b.getAttribute('data-ch');
      try { window.gtag && gtag('event', 'share_friends', { channel: ch, kind: o.kind }); } catch (_) {}
      if (ch === 'copy') {
        ev.preventDefault();
        (navigator.clipboard ? navigator.clipboard.writeText(msg) : Promise.reject()).then(function () { el.querySelector('.tsf-ok').textContent = t.copied; })
          .catch(function () { window.prompt(t.copy, url); });
      } else if (ch === 'more') {
        ev.preventDefault(); navigator.share({ title: 'TexContractor', text: msg.replace(url, '').trim(), url: url }).catch(function () {});
      }
    });
  }
  window.TexShareFriends = { render: render };
})();
