/* Owner 11-23: a customer on a COMPUTER pressed "Text" 3 times and nothing happened (sms: links only work on phones).
   On phones: open the text app as before. On computers: show the number + the ready message to copy, and the on-site chat if the pro has it. */
(function () {
  var isPhone = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent || '') || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent || ''));
  function fmt(p) { var d = String(p).replace(/\D/g, '').replace(/^1(?=\d{10}$)/, ''); return d.length === 10 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6) : p; }
  function copy(t, btn, done) { var ok = function () { var o = btn.textContent; btn.textContent = done; setTimeout(function () { btn.textContent = o; }, 1800); }; try { navigator.clipboard.writeText(t).then(ok, function () { fallback(); }); } catch (_) { fallback(); } function fallback() { var a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (_) {} a.remove(); ok(); } }
  window.texOpenSms = function (phone, body, opts) {
    if (isPhone) { window.location.href = 'sms:' + phone + '?body=' + encodeURIComponent(body || ''); return; }
    try { window.texVisit && texVisit('desktop_text_box'); } catch (_) {}
    var es = (document.documentElement.lang || '').indexOf('es') === 0 || /[?&]lang=es/.test(location.search);
    var old = document.getElementById('tso-back'); if (old) old.remove();
    var back = document.createElement('div'); back.id = 'tso-back';
    back.style.cssText = 'position:fixed;inset:0;z-index:2000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px';
    var chatBtn = document.getElementById('chat-profile-button'); var hasChat = chatBtn && !chatBtn.hidden;
    back.innerHTML = '<div role="dialog" aria-modal="true" style="background:#fff;color:#0f172a;max-width:440px;width:100%;border-radius:18px;padding:22px;box-shadow:0 20px 50px rgba(0,0,0,.3);font:16px/1.45 system-ui,sans-serif;position:relative">' +
      '<button type="button" id="tso-x" aria-label="Close" style="position:absolute;top:8px;right:10px;border:0;background:none;font-size:26px;cursor:pointer;color:#475569">×</button>' +
      '<h3 style="margin:0 0 6px;font-size:1.25rem">' + (es ? 'Escríbele desde tu teléfono' : 'Text this pro from your phone') + '</h3>' +
      '<p style="margin:0 0 12px;color:#475569">' + (es ? 'Estás en una computadora. Envía un mensaje de texto a este número:' : "You're on a computer. Send a text from your phone to:") + '</p>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px"><a href="tel:' + phone + '" style="font-size:1.6rem;font-weight:900;color:#075c4b;text-decoration:none">' + fmt(phone) + '</a><button type="button" id="tso-cn" style="margin-left:auto;border:1px solid #cbd5e1;background:#f8fafc;border-radius:10px;padding:8px 12px;font-weight:700;cursor:pointer">' + (es ? 'Copiar número' : 'Copy number') + '</button></div>' +
      '<div id="tso-qrw" style="display:flex;gap:12px;align-items:center;background:#f1f5f9;border-radius:12px;padding:10px;margin-bottom:12px"><div id="tso-qr" style="width:132px;height:132px;flex:none;background:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:.8rem">QR…</div><div style="font-weight:700;font-size:.95rem">📱 ' + (es ? 'Escanea con la cámara de tu teléfono: se abre tu app de mensajes con el número y el mensaje listos. Solo toca Enviar.' : 'Scan with your phone camera: your texting app opens with the number and message ready. Just tap Send.') + '</div></div>' +
      '<label style="font-weight:700;font-size:.92rem">' + (es ? 'Tu mensaje (puedes cambiarlo):' : 'Your message (you can change it):') + '</label>' +
      '<textarea id="tso-msg" rows="4" style="width:100%;box-sizing:border-box;margin:6px 0 8px;border:1px solid #cbd5e1;border-radius:10px;padding:10px;font:15px system-ui,sans-serif"></textarea>' +
      '<button type="button" id="tso-cm" style="width:100%;min-height:46px;border:0;border-radius:12px;background:#075c4b;color:#fff;font-weight:900;font-size:1rem;cursor:pointer">' + (es ? 'Copiar mensaje' : 'Copy message') + '</button>' +
      (hasChat ? '<button type="button" id="tso-chat" style="width:100%;min-height:46px;margin-top:8px;border:2px solid #1d4ed8;border-radius:12px;background:#fff;color:#1d4ed8;font-weight:900;font-size:1rem;cursor:pointer">💬 ' + (es ? 'O chatea aquí en TexContractor' : 'Or chat here on TexContractor') + '</button>' : '') +
      '</div>';
    document.body.appendChild(back);
    back.querySelector('#tso-msg').value = body || '';
    var close = function () { back.remove(); if (opts && opts.onClose) opts.onClose(); };
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    back.querySelector('#tso-x').addEventListener('click', close);
    back.querySelector('#tso-cn').addEventListener('click', function () { copy(fmt(phone), this, es ? 'Copiado ✓' : 'Copied ✓'); });
    back.querySelector('#tso-cm').addEventListener('click', function () { copy(back.querySelector('#tso-msg').value, this, es ? 'Copiado ✓' : 'Copied ✓'); });
    // Owner 11-23: QR code (only here, so only signed-in members ever see it — the box opens after sign-in).
    var drawQr = function () {
      var box = back.querySelector('#tso-qr'); if (!box || !window.qrcode) return;
      var d = String(phone).replace(/[^\d+]/g, ''); if (!/^\+/.test(d)) d = '+1' + d.replace(/^1(?=\d{10}$)/, '');
      var txt = 'SMSTO:' + d + ':' + (back.querySelector('#tso-msg').value || '').slice(0, 300);
      try { var q = qrcode(0, 'L'); q.addData(unescape(encodeURIComponent(txt))); q.make(); box.innerHTML = q.createImgTag(3, 4); var im = box.querySelector('img'); if (im) { im.style.width = '132px'; im.style.height = '132px'; im.alt = 'QR code to text this pro'; } } catch (_) { back.querySelector('#tso-qrw').hidden = true; }
    };
    if (window.qrcode) drawQr(); else { var sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'; sc.onload = drawQr; sc.onerror = function () { var w = back.querySelector('#tso-qrw'); if (w) w.hidden = true; }; document.head.appendChild(sc); }
    var qt; back.querySelector('#tso-msg').addEventListener('input', function () { clearTimeout(qt); qt = setTimeout(drawQr, 400); });
    var c = back.querySelector('#tso-chat'); if (c) c.addEventListener('click', function () { close(); chatBtn.click(); });
  };
})();
