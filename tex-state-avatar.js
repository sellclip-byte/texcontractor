(function () {
  'use strict';
  const names = {AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia'};
  const codes = new Map(Object.entries(names).flatMap(([code, name]) => [[code.toLowerCase(),code],[name.toLowerCase(),code]]));
  function stateCode(value) {
    return codes.get(String(value || '').trim().replace(/^US[- ]/i, '').toLowerCase()) || '';
  }

  // Trade icons: half of the listings in each service show a 3D trade picture instead of the state flag.
  // Choice is fixed per listing (hash of its id). A real profile photo always wins.
  const EL=['electrical-f1','f'], PL=['plumbing-m1','m'], AC=['ac-m1','m'], CA=['carpentry-m1','m'], ME=['mechanic-m1','m'],
        RO=['roofing-m1','m'], PA=['painting-m1','m'], HA=['handyman-f1','f'], CL=['cleaning-f1','f'], LA=['landscaping-m1','m'],
        TR=['tree-m1','m'], CO=['concrete-m1','m'], FL=['flooring-f1','f'], JU=['junk-m1','m'], LO=['locksmith-m1','m'], AP=['appliance-m1','m'], DE=['detailing-f1','f'],
        MO=['movers-m1','m'], PE=['pest-f1','f'], PO=['pool-m1','m'],
        PW=['pressure-m1','m'], FE=['fence-m1','m'], NO=['notary-f1','f'], TU=['tutor-f1','f'], DO=['dogtrainer-f1','f'], BA=['babysitter-f1','f'], CP=['computer-m1','m'],
        TV=['tvmount-m1','m'], WI=['window-m1','m'],
        BB=['barber-m1','m'], HS=['stylist-f1','f'], PT=['trainer-f1','f'], IN=['inspector-m1','m'], PH=['photographer-f1','f'], NU=['nurse-f1','f'], EP=['planner-f1','f'], DJ=['dj-m1','m'], MU=['makeup-f1','f'], GR=['groomer-f1','f'];
  const TRADE_ICONS = {
    'Electrical and Wiring Repair': [EL], 'Lighting Installation': [EL],
    'Plumbing Pipe Repair': [PL], 'Plumbing Drain Repair': [PL], 'Bathroom Remodel': [PL, CA],
    'Central Air Conditioning Repair or Maintenance': [AC], 'Heating System Repair or Maintenance': [AC], 'Appliance Repair or Maintenance': [AP],
    'Deck or Porch Remodel or Addition': [CA], 'Concrete Installation': [CO], 'Home Foundation Repair': [CO], 'Metalwork': [CO], 'Junk Removal': [JU], 'Furniture Moving and Heavy Lifting': [MO, JU], 'Local Moving (under 50 miles)': [MO], 'Garage Door Repair': [LO], 'Lock Installation and Repair': [LO], 'Window Repair': [WI], 'Door Installation': [CA, HA, WI], 'Fence and Gate Installation': [FE], 'General Contracting': [CA, HA],
    'Floor Installation or Replacement': [FL, CA], 'Furniture Assembly': [HA, CA, TV], 'Handyman': [HA, CA, TV],
    'Mobile Auto Mechanic': [ME], 'Mobile Auto Detailing': [DE], 'Window Tinting': [DE], 'Pressure Washing': [PW], 'General Automotive Services: Towing, Key Programming, Window Tinting & Tire Services': [ME],
    'Lawn Mower, Water Pump & Outdoor Equipment Repair': [ME, LA],
    'Roof Repair or Maintenance': [RO], 'Gutter Cleaning and Maintenance': [RO],
    'Interior Painting': [PA], 'Drywall Repair and Texturing': [PA, HA],
    'House Cleaning': [CL], 'Carpet Cleaning': [CL], 'Upholstery and Furniture Cleaning': [CL],
    'Outdoor Landscaping and Design': [LA], 'Tree Trimming and Removal': [TR], 'Pest Control Services': [PE], 'Swimming Pool Cleaning & Maintenance': [PO], 'Notarization': [NO], 'Tutoring & Education Services': [TU], 'Dog Training': [DO], 'Dog Training & Horse Riding Lessons': [DO], 'Babysitting & Childcare Services': [BA], 'Computer Repair': [CP], 'Barber & Hair Styling Services': [BB, HS], 'Personal Training': [PT], 'Home Inspection Consulting': [IN], 'Wedding and Event Photography': [PH], 'In-Home Nursing Care': [NU], 'Event Planning': [EP], 'DJ Services': [DJ], 'Wedding and Event Makeup': [MU], 'Dog Grooming': [GR], 'TV Mounting': [TV, HA]
  };
  const MALE = new Set('aaron adam adrian alan albert alberto alex alejandro alfredo andre andres andrew angel anthony antonio arturo ben benjamin bill billy bob bobby brad brandon brian bruce carl carlos cesar charles chris christian chuck cody craig dan daniel danny darren dave david dennis derek diego don donald doug douglas eddie eduardo edward eric ernesto esteban fernando francisco frank fred gabriel gary george gerardo greg gregory guillermo hector henry hugo ivan jack jacob jaime james jared jason javier jay jeff jeffrey jerry jesse jesus jim jimmy joe joel john johnny jon jonathan jorge jose joseph josh joshua juan julio justin keith ken kenneth kevin kyle larry leo leonard leonardo luis manuel marco marcos mario mark martin matt matthew michael miguel mike nathan nick oscar pablo patrick paul pedro pete peter phil rafael ramon randy ray raul ricardo richard rick ricky rob robert roberto roger ron ronald ruben russell ryan salvador sam samuel scott sergio shawn sonny stephen steve steven terry thomas tim timothy todd tom tommy tony travis troy victor vincent walter wayne william willie'.split(' '));
  const FEMALE = new Set('alice alicia amanda amy ana andrea angela angie anna april ashley barbara beatriz becky beverly brenda brittany carmen carol carolina catherine cindy claudia crystal cynthia dana diana donna dora elena elizabeth emily erica erika esther eva gloria guadalupe heather irma jackie janet jennifer jessica jill joanna julia julie karen karina kathy kelly kim kimberly laura leticia linda lisa lori lucia luz margarita maria marie marisol martha mary melissa michelle monica nancy norma olga pam patricia paula rachel rebecca rosa rosario sandra sara sarah sharon sonia stephanie susan teresa tina veronica vicky wendy yolanda'.split(' '));
  function nameGender(name) {
    const first = String(name || '').trim().split(/\s+/)[0].toLowerCase().replace(/['’]s$/, '').replace(/[^a-z]/g, '');
    return MALE.has(first) ? 'm' : FEMALE.has(first) ? 'f' : '';
  }
  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function tradeIcon(options) {
    const list = TRADE_ICONS[options.service];
    if (!list || options.key == null || options.key === '') return '';
    const h = hash(options.service + '|' + options.key);
    if (h % 2) return '';
    const g = nameGender(options.name);
    const fit = list.filter(([, ig]) => !g || ig === g);
    if (!fit.length) return '';
    return 'trade-icons/' + fit[(h >>> 1) % fit.length][0] + '.webp';
  }
  const style = document.createElement('style');
  style.textContent = '.avatar.state-avatar{position:relative;isolation:isolate;overflow:hidden;background:#334155}.avatar.state-avatar>.state-avatar-flag{display:block;width:100%;height:100%;position:absolute;inset:0;object-fit:cover;border-radius:inherit;z-index:0}.avatar.state-avatar>.state-avatar-initials{position:relative;z-index:1;display:grid;place-items:center;width:100%;height:100%;background:rgba(15,23,42,.22);color:#fff;text-shadow:0 1px 3px #000,0 0 5px #000}.avatar.state-avatar>.state-avatar-photo,.avatar.state-avatar>.state-avatar-trade{display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit}';
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
    const trade = options.photoUrl ? '' : tradeIcon(options);
    if (!options.photoUrl && trade) {
      const pic = document.createElement('img');
      pic.className = 'state-avatar-trade';
      pic.alt = '';
      pic.setAttribute('aria-hidden','true');
      pic.decoding = 'async';
      pic.addEventListener('error', fallback, {once:true});
      pic.src = trade;
      element.title = options.service || '';
      element.replaceChildren(pic);
      return;
    }
    if (options.photoUrl) {
      const photo = document.createElement('img');
      photo.className = 'state-avatar-photo';
      photo.alt = String(options.name || 'Contractor') + ' profile photo';
      photo.addEventListener('error', fallback, {once:true});
      photo.src = options.photoUrl;
      element.replaceChildren(photo);
    } else fallback();
  }
  window.TexStateAvatar = Object.freeze({apply, stateCode, tradeIcon, TRADE_ICONS});
}());
