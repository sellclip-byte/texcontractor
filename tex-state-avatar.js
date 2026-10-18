(function () {
  'use strict';
  const names = {AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia'};
  const codes = new Map(Object.entries(names).flatMap(([code, name]) => [[code.toLowerCase(),code],[name.toLowerCase(),code]]));
  function stateCode(value) {
    return codes.get(String(value || '').trim().replace(/^US[- ]/i, '').toLowerCase()) || '';
  }
  const style = document.createElement('style');
  style.textContent = '.avatar.state-avatar{position:relative;isolation:isolate;overflow:hidden;background:#334155}.avatar.state-avatar>.state-avatar-flag{display:block;width:100%;height:100%;position:absolute;inset:0;object-fit:cover;border-radius:inherit;z-index:0}.avatar.state-avatar>.state-avatar-initials{position:relative;z-index:1;display:grid;place-items:center;width:100%;height:100%;background:rgba(15,23,42,.22);color:#fff;text-shadow:0 1px 3px #000,0 0 5px #000}.avatar.state-avatar>.state-avatar-photo{display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit}';
  document.head.appendChild(style);
  function apply(element, options) {
    const code = stateCode(options.state);
    const letters = String(options.name || 'T').trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase();
    element.classList.add('state-avatar');
    const fallback = () => {
      element.replaceChildren();
      if (code) {
        const flag = document.createElement('img');
        flag.className = 'state-avatar-flag';
        flag.alt = '';
        flag.setAttribute('aria-hidden','true');
        flag.decoding = 'async';
        flag.addEventListener('error', () => flag.remove(), {once:true});
        flag.src = 'state-flags/' + code.toLowerCase() + '.svg';
        element.appendChild(flag);
        element.title = names[code] + ' flag';
      }
      const label = document.createElement('span');
      label.className = 'state-avatar-initials';
      label.textContent = letters;
      element.appendChild(label);
    };
    if (options.photoUrl) {
      const photo = document.createElement('img');
      photo.className = 'state-avatar-photo';
      photo.alt = String(options.name || 'Contractor') + ' profile photo';
      photo.addEventListener('error', fallback, {once:true});
      photo.src = options.photoUrl;
      element.replaceChildren(photo);
    } else fallback();
  }
  window.TexStateAvatar = Object.freeze({apply, stateCode});
}());
