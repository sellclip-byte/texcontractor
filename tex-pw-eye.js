/* Show / hide password eye (owner 11-09): every password box gets an eye button so you can see what you typed. */
(function () {
  const EYE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const OFF = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  const add = (inp) => {
    if (inp.dataset.eye || inp.closest('.fld')) return; // admin-login.html has its own
    inp.dataset.eye = '1';
    const wrap = document.createElement('span'); wrap.style.cssText = 'position:relative;display:block';
    inp.parentNode.insertBefore(wrap, inp); wrap.appendChild(inp);
    inp.style.paddingRight = '44px';
    const b = document.createElement('button'); b.type = 'button'; b.innerHTML = EYE; b.setAttribute('aria-label', 'Show password'); b.title = 'Show password';
    b.style.cssText = 'position:absolute;right:6px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:0;background:transparent;cursor:pointer;color:#475569;display:grid;place-items:center;padding:0';
    b.addEventListener('click', () => { const s = inp.type === 'password'; inp.type = s ? 'text' : 'password'; b.innerHTML = s ? OFF : EYE; b.setAttribute('aria-label', s ? 'Hide password' : 'Show password'); b.title = b.getAttribute('aria-label'); inp.focus(); });
    wrap.appendChild(b);
  };
  const scan = () => document.querySelectorAll('input[type=password]').forEach(add);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true }); else scan();
  let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 300); }).observe(document.documentElement, { childList: true, subtree: true });
})();
