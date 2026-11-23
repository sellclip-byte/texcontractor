/* 11-23 owner: "See how it works" — the AC request video (customer posts → system sends to 10 nearby pros → they text him).
   Adds a small button above the Post-a-request buttons (requests page) and under the hero (home). Opens the video in a window. */
(function () {
  var SRC = '/media/texcontractor-how-it-works-ac.mp4', POSTER = '/media/texcontractor-how-it-works-ac.jpg';
  function es() { try { return (localStorage.getItem('texcontractor-language') || '') === 'es' || /^es/i.test(document.documentElement.lang || ''); } catch (e) { return false; } }
  function label() { return es() ? '▶ Mira cómo funciona' : '▶ See how it works'; }
  var css = '.hv-btn{display:inline-flex;align-items:center;gap:8px;margin:10px 0 12px;padding:9px 16px 9px 9px;border:2px solid #1d4ed8;border-radius:999px;background:#fff;color:#1e3a8a;font:800 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(29,78,216,.15)}' +
    '.hv-btn img{width:34px;height:34px;border-radius:50%;object-fit:cover}.hv-btn:hover{background:#eff6ff}' +
    '.hv-ov{position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,.82);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.hv-box{position:relative;width:min(400px,100%);max-height:92vh}.hv-box video{width:100%;max-height:86vh;border-radius:14px;background:#000;display:block}' +
    '.hv-x{position:absolute;top:-14px;right:-10px;width:38px;height:38px;border-radius:50%;border:0;background:#fff;color:#111;font:900 22px system-ui;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)}' +
    '.hv-go{display:block;margin:10px auto 0;text-align:center;padding:12px 18px;border-radius:11px;background:#1d4ed8;color:#fff;font:800 16px system-ui,sans-serif;text-decoration:none}';
  function open() {
    try { if (window.texVisit) window.texVisit('how_video'); } catch (e) { }
    var ov = document.createElement('div'); ov.className = 'hv-ov';
    ov.innerHTML = '<div class="hv-box"><button class="hv-x" aria-label="Close">×</button><video controls autoplay playsinline preload="auto" poster="' + POSTER + '" src="' + SRC + '"></video>' +
      '<a class="hv-go" href="/requests.html?post=1&utm_source=how_video">' + (es() ? '📋 Publica tu solicitud gratis' : '📋 Post my request free') + '</a></div>';
    function close() { var v = ov.querySelector('video'); if (v) v.pause(); ov.remove(); }
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.classList.contains('hv-x')) close(); });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', k); } });
    document.body.appendChild(ov);
  }
  function make() {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'hv-btn';
    b.innerHTML = '<img src="' + POSTER + '" alt=""><span class="hv-t"></span>';
    b.querySelector('.hv-t').textContent = label();
    b.addEventListener('click', open); return b;
  }
  function init() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    // spots: requests page steps row, home hero (desktop), phone home hero (#mh-q is built later by tex-mobile-home.js)
    function place() {
      [document.querySelector('.steps'), document.querySelector('#cust-hero .ch-trust'), document.getElementById('mh-q')].filter(Boolean).forEach(function (s) {
        var n = s.nextElementSibling; if (n && n.classList && n.classList.contains('hv-btn')) return;
        var b = make(); if (s.id === 'mh-q') b.style.cssText = 'margin:12px 0 0;display:flex'; s.insertAdjacentElement('afterend', b);
      });
      document.querySelectorAll('.hv-btn .hv-t').forEach(function (t) { var l = label(); if (t.textContent !== l) t.textContent = l; });
    }
    place(); setInterval(place, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
