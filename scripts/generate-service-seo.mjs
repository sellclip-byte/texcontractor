// Generate SEO landing pages from real service links in the existing homepage.
// Run: node scripts/generate-service-seo.mjs
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const html = readFileSync(join(root, 'index.html'), 'utf8');
const found = new Map();
// Read the actual catalog card titles; most cards use onclick handlers, not href links.
for (const m of html.matchAll(/<h[234][^>]*class=["'][^"']*service-title[^"']*["'][^>]*>([\s\S]*?)<\/h[234]>/gi)) {
  const service = m[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
  if (service && service.length < 110 && !/[<>]/.test(service)) found.set(service.toLowerCase(), service);
}
// The homepage also uses div.service-title cards, not just heading tags.
for (const m of html.matchAll(/<[^>]+class=["'][^"']*service-title[^"']*["'][^>]*>([^<]{2,110})</gi)) {
  const service = m[1].replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
  if (service && !/[<>]/.test(service)) found.set(service.toLowerCase(), service);
}
for (const m of html.matchAll(/(?:href|data-href)\s*=\s*["']([^"']*contractor\.html\?[^"']+)["']/gi)) {
  const raw = m[1].replaceAll('&amp;', '&');
  let u;
  try { u = new URL(raw, 'https://texcontractor.com/'); } catch { continue; }
  const service = (u.searchParams.get('service') || '').trim();
  if (service && service.length < 110 && !/[<>]/.test(service)) found.set(service.toLowerCase(), service);
}
const services = [...found.values()].sort((a,b)=>a.localeCompare(b));
if (services.length !== 62) throw Error('Expected 62 verified catalog names in the current homepage, found '+services.length+'. Review catalog source before publishing.');
if (!services.length) throw Error('No real service links found in index.html; no SEO pages generated. Check the homepage catalog markup first.');
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,85);
const googleAdsTag = `  <!-- Google Ads tag: AW-18516159223 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18516159223"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-18516159223');
  </script>`;
const dir = join(root,'services'); mkdirSync(dir,{recursive:true});
// Keep generated landing pages noindex until substantive, unique content and live-domain verification are complete.
// Reviewed, service-specific editorial copy. Other categories remain noindex until reviewed.
const reviewed = {
  'babysitting & childcare services': {
    intro: "Browse providers offering occasional babysitting, nanny placement, newborn care, after-school care or care in the provider's home or childcare center. Each profile describes the services that provider advertises.",
    heading: "Discuss your family's care needs",
    details: "Share your city, children's ages, schedule and whether care is needed in your home or at a childcare location. Ask about availability, fees and emergency arrangements before booking.",
    safetyHeading: "Check care arrangements before booking",
    safety: "Listings are not a TexContractor background-check or licensing endorsement. Confirm caregiver qualifications, references and any required licensing directly with the provider."
  },
  'garage door repair': {
    intro: 'Find contractors for garage door problems such as a door that will not open or close, noisy operation, broken springs, damaged cables, misaligned tracks, or opener and remote-control issues.',
    heading: 'Describe your garage door problem',
    details: 'When contacting a contractor, mention whether the door is stuck open or closed, whether the opener motor runs, and any unusual sounds or visible damage. Share your city or ZIP code and ask about inspection fees, parts, availability, and a written estimate before scheduling.',
    safetyHeading: 'Garage door safety',
    safety: 'Garage door springs and cables are under high tension. Do not attempt to loosen or remove them yourself. If a spring or cable appears damaged, stop operating the door and ask a qualified technician to assess it.'
  },
  'roof repair or maintenance': {
    intro: 'Roof repair requests may involve missing shingles, damaged flashing, leaks around vents, or storm-related wear. Describe where and when you noticed the issue.',
    heading: 'Information to share before a roof inspection',
    details: 'Tell the contractor the approximate roof age, roofing material if known, whether water enters during rain, and whether you see damage from the ground. Ask about inspection scope, repair options, written estimates, and cleanup.',
    safetyHeading: 'Roof access safety',
    safety: 'Avoid climbing onto a wet, steep, or damaged roof. If water is entering near electrical fixtures, keep clear of the affected area and seek appropriate professional help.'
  },
  'electrical and wiring repair': {
    intro: 'Electrical repair can include outlets that stop working, tripping breakers, flickering lights, damaged switches, and wiring faults. A qualified electrician can evaluate the cause.',
    heading: 'Describe the electrical symptoms',
    details: 'Explain which rooms or circuits are affected, when the problem began, and whether you noticed heat, buzzing, or a burning smell. Ask about licensing, diagnosis charges, permits where applicable, and a written repair estimate.',
    safetyHeading: 'Electrical safety',
    safety: 'Do not touch exposed wires or repeatedly reset a breaker that keeps tripping. If you notice smoke or signs of fire, move to safety and contact emergency services.'
  },
  'central air conditioning repair or maintenance': {
    intro: 'Air-conditioning service may involve weak airflow, warm air from vents, unusual noises, thermostat problems, or routine filter and equipment checks.',
    heading: 'Prepare for an AC service request',
    details: 'Provide the system type if known, whether the outdoor unit runs, any error codes, and the rooms affected. Ask whether diagnostic fees, replacement parts, and maintenance work are quoted separately.',
    safetyHeading: 'AC system precautions',
    safety: 'Switch off equipment that is leaking heavily, sparking, or making severe mechanical noises. Refrigerant handling and electrical repairs should be performed by qualified professionals.'
  },
  'home foundation repair': {
    intro: 'Foundation concerns can include new wall cracks, sticking doors, uneven floors, or visible movement around a slab or pier-and-beam structure.',
    heading: 'Document foundation movement',
    details: 'Share photos of cracks and note when they appeared, whether they are widening, and any drainage or soil problems around the property. Ask about inspection methods, engineering evaluation, repair proposals, and warranty terms.',
    safetyHeading: 'Structural safety',
    safety: 'If you see sudden major movement, severe structural cracking, or a risk of collapse, avoid the affected area and seek urgent professional assessment.'
  },
  'plumbing pipe repair': {
    intro: 'Pipe repair work may address dripping joints, leaking supply lines, low water pressure, corrosion, or damaged drain and water pipes.',
    heading: 'Details that help a plumber estimate the job',
    details: 'Identify the leak location, whether it occurs constantly, the visible pipe material if known, and whether water service has been shut off. Ask about leak detection, access repairs, replacement materials, and a written estimate.',
    safetyHeading: 'Water leak precautions',
    safety: 'If a pipe is actively flooding the property, use the main water shutoff when safe. Keep away from electrical equipment exposed to water.'
  },
  'tree trimming and removal': {
    intro: 'Tree services can involve pruning overgrown limbs, removing dead branches, storm cleanup, or assessing trees that lean toward buildings and power lines.',
    heading: 'Describe the tree and access conditions',
    details: 'Tell the provider the approximate tree size, proximity to structures, access for equipment, and whether debris removal or stump work is needed. Ask about insurance, permits where required, and cleanup.',
    safetyHeading: 'Tree work safety',
    safety: 'Do not approach fallen power lines or attempt to cut suspended limbs. Large-tree removal and work near utility lines require appropriately equipped professionals.'
  },
  'lawn mower water pump and outdoor equipment repair': {
    intro: 'Outdoor equipment repair can cover lawn mowers, water pumps, and small-engine machines that will not start, run unevenly, leak, or stop under load.',
    heading: 'Identify the equipment and failure',
    details: 'Share the make, model, engine type if known, and whether the unit starts, stalls, or has visible leaks. Ask about mobile service availability, diagnostic fees, parts, and repair-versus-replacement costs.',
    safetyHeading: 'Equipment safety',
    safety: 'Shut down equipment and disconnect its power source before inspection. Do not run fuel-powered engines indoors or touch moving blades and belts.'
  },
  'fence and gate installation': {
    intro: 'Fence and gate projects include replacing damaged panels, installing posts, repairing latches, and planning new wood, metal, or other boundary fencing.',
    heading: 'Plan your fence or gate project',
    details: 'Describe the approximate length, desired height and material, gate width, terrain, and whether old fencing must be removed. Ask about property-line checks, local requirements, materials, and a written quote.',
    safetyHeading: 'Before digging',
    safety: 'Have underground utilities located before excavation. Confirm property boundaries and applicable permits before installation.'
  },
  'appliance repair or maintenance': {
    intro: 'Find providers for Refrigerators that do not cool, washing machines that leak, dryers that do not heat, and ovens with uneven temperatures.',
    heading: 'Details to include in your request',
    details: 'Share the appliance brand, model, age, symptoms, and any error code. Ask about diagnosis charges, parts availability, and repair warranties.',
    safetyHeading: 'Planning and safety',
    safety: 'Disconnect an appliance showing smoke, sparking, or a burning smell if it is safe to do so.'
  },
  'architectural services': {
    intro: 'Find providers for Residential additions, layout changes, remodeling plans, and permit drawing needs.',
    heading: 'Details to include in your request',
    details: 'Explain the property type, project size, goals, budget range, and whether stamped plans or permit submissions are needed.',
    safetyHeading: 'Planning and safety',
    safety: 'Confirm licensing and permit requirements for the project\'s location.'
  },
  'bathroom remodel': {
    intro: 'Find providers for Shower replacement, tile installation, vanities, ventilation, and bathroom layout updates.',
    heading: 'Details to include in your request',
    details: 'Describe dimensions, fixtures to keep, waterproofing concerns, materials, and whether plumbing must move.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask how waterproofing and hidden water damage will be handled.'
  },
  'carpet cleaning': {
    intro: 'Find providers for Stains, pet odors, high-traffic areas, and scheduled carpet maintenance.',
    heading: 'Details to include in your request',
    details: 'Give room sizes, carpet fiber if known, stain types, parking access, and preferred drying time.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about cleaning-product suitability for children, pets, and delicate fibers.'
  },
  'computer repair': {
    intro: 'Find providers for Slow computers, startup failures, hardware upgrades, malware concerns, and broken laptop screens.',
    heading: 'Details to include in your request',
    details: 'Share the device model, operating system, symptoms, recent changes, and whether data recovery matters.',
    safetyHeading: 'Planning and safety',
    safety: 'Back up important files where possible and avoid sharing passwords unnecessarily.'
  },
  'concrete installation': {
    intro: 'Find providers for Driveways, walkways, patios, slabs, and concrete replacement projects.',
    heading: 'Details to include in your request',
    details: 'Provide approximate dimensions, intended use, drainage concerns, access, and desired finish.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about site preparation, reinforcement, curing time, and local requirements.'
  },
  'deck or porch remodel or addition': {
    intro: 'Find providers for Loose deck boards, damaged railings, aging stairs, and new porch or deck construction.',
    heading: 'Details to include in your request',
    details: 'Share dimensions, deck height, materials, existing structural issues, and access.',
    safetyHeading: 'Planning and safety',
    safety: 'Avoid using decks with unstable supports or unsafe railings.'
  },
  'dj services': {
    intro: 'Find providers for Music and sound support for weddings, parties, corporate events, and private celebrations.',
    heading: 'Details to include in your request',
    details: 'Provide the date, venue, guest count, event duration, music preferences, and sound equipment needs.',
    safetyHeading: 'Planning and safety',
    safety: 'Confirm venue noise rules, setup access, and backup equipment arrangements.'
  },
  'dog grooming': {
    intro: 'Find providers for Bathing, brushing, nail trimming, coat care, and grooming for different dog sizes.',
    heading: 'Details to include in your request',
    details: 'Share your dog\'s breed, weight, coat condition, behavior, and any sensitivities.',
    safetyHeading: 'Planning and safety',
    safety: 'Tell the groomer about medical or behavioral concerns before the appointment.'
  },
  'dog training': {
    intro: 'Find providers for Basic obedience, leash manners, puppy socialization, and behavior coaching.',
    heading: 'Details to include in your request',
    details: 'Explain your dog\'s age, breed, training goals, and behaviors that concern you.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about training methods and avoid providers promising guaranteed behavioral outcomes.'
  },
  'door installation': {
    intro: 'Find providers for Interior and exterior door replacement, sticking doors, hardware alignment, and weather sealing.',
    heading: 'Details to include in your request',
    details: 'Share door measurements, material, frame condition, lock needs, and whether an old door must be removed.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about proper fit, security hardware, and weatherproofing for exterior doors.'
  },
  'drywall repair and texturing': {
    intro: 'Find providers for Wall holes, ceiling cracks, water-damaged drywall, and texture matching.',
    heading: 'Details to include in your request',
    details: 'Describe the damage size, location, texture, paint finish, and any past moisture issues.',
    safetyHeading: 'Planning and safety',
    safety: 'Fix active leaks before covering water-damaged surfaces.'
  },
  'event planning': {
    intro: 'Find providers for Event schedules, vendor coordination, decorations, and venue logistics.',
    heading: 'Details to include in your request',
    details: 'Share the event type, date, guest count, budget range, venue, and planning priorities.',
    safetyHeading: 'Planning and safety',
    safety: 'Confirm cancellation terms and vendor responsibilities in writing.'
  },
  'floor installation or replacement': {
    intro: 'Find providers for Hardwood, laminate, tile, vinyl, and damaged flooring replacement.',
    heading: 'Details to include in your request',
    details: 'Provide room measurements, existing floor type, subfloor concerns, and material preference.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about moisture testing, leveling, transitions, and disposal of old flooring.'
  },
  'furniture assembly': {
    intro: 'Find providers for Flat-pack desks, cabinets, beds, shelving, and other household furniture.',
    heading: 'Details to include in your request',
    details: 'Share product brand, model, number of items, assembly instructions, and space available.',
    safetyHeading: 'Planning and safety',
    safety: 'Anchor tall furniture where required to reduce tip-over risk.'
  },
  'furniture moving and heavy lifting': {
    intro: 'Find providers for Moving sofas, appliances, safes, and oversized furniture within a property or nearby.',
    heading: 'Details to include in your request',
    details: 'Describe item dimensions, weight estimate, stairs, doorways, and pickup and drop-off locations.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about equipment, floor protection, and damage coverage.'
  },
  'general contracting': {
    intro: 'Find providers for Multi-trade renovations, room additions, repair coordination, and larger home projects.',
    heading: 'Details to include in your request',
    details: 'Describe project scope, timeline, plans, budget range, and trades involved.',
    safetyHeading: 'Planning and safety',
    safety: 'Confirm permits, insurance, contract milestones, and change-order procedures.'
  },
  'gutter cleaning and maintenance': {
    intro: 'Find providers for Clogged gutters, overflowing downspouts, loose brackets, and drainage problems.',
    heading: 'Details to include in your request',
    details: 'Share home height, gutter length, access limitations, and where overflow occurs.',
    safetyHeading: 'Planning and safety',
    safety: 'Avoid ladder work near power lines or on unstable ground.'
  },
  'handyman': {
    intro: 'Find providers for Small household repairs, fixture replacement, minor carpentry, and routine maintenance.',
    heading: 'Details to include in your request',
    details: 'List tasks separately, include photos and measurements, and ask which work requires a licensed specialist.',
    safetyHeading: 'Planning and safety',
    safety: 'Electrical, plumbing, and structural jobs may require appropriately licensed trades.'
  },
  'heating system repair or maintenance': {
    intro: 'Find providers for Furnaces that will not start, uneven heating, noisy blowers, and thermostat problems.',
    heading: 'Details to include in your request',
    details: 'Share heating system type, error codes, symptoms, and when maintenance was last performed.',
    safetyHeading: 'Planning and safety',
    safety: 'If you smell gas, leave the area and contact the gas utility or emergency services.'
  },
  'home inspection consulting': {
    intro: 'Find providers for Pre-purchase home assessments, maintenance reviews, and property condition questions.',
    heading: 'Details to include in your request',
    details: 'Provide property age, size, inspection purpose, access arrangements, and areas of concern.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about the inspection scope, limitations, and written report.'
  },
  'house cleaning': {
    intro: 'Find providers for Recurring housekeeping, move-out cleaning, kitchens, bathrooms, and deep cleaning.',
    heading: 'Details to include in your request',
    details: 'Share property size, room count, cleaning priorities, pets, and supply preferences.',
    safetyHeading: 'Planning and safety',
    safety: 'Identify delicate surfaces and confirm access and cleaning-product requirements.'
  },
  'in home nursing care': {
    intro: 'Find providers for In-home nursing support, medication-related care coordination, and recovery assistance.',
    heading: 'Details to include in your request',
    details: 'Explain the required care tasks, schedule, location, and whether licensed nursing services are needed.',
    safetyHeading: 'Planning and safety',
    safety: 'Verify credentials and discuss medical care requirements with the treating clinician.'
  },
  'interior design': {
    intro: 'Find providers for Room layouts, furniture selection, color palettes, lighting plans, and finish coordination.',
    heading: 'Details to include in your request',
    details: 'Share room dimensions, photos, style preferences, budget range, and renovation limits.',
    safetyHeading: 'Planning and safety',
    safety: 'Confirm deliverables, product purchasing terms, and any contractor coordination.'
  },
  'interior painting': {
    intro: 'Find providers for Wall and ceiling painting, trim updates, surface preparation, and color changes.',
    heading: 'Details to include in your request',
    details: 'Provide room sizes, ceiling heights, wall condition, preferred paint finish, and furniture access.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about ventilation, lead-paint precautions for older homes, and cleanup.'
  },
  'junk removal': {
    intro: 'Find providers for Removal of unwanted furniture, household clutter, yard debris, and renovation waste.',
    heading: 'Details to include in your request',
    details: 'List the items, approximate volume, location, stairs, and whether heavy objects are included.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask which materials cannot be collected and how disposal fees are calculated.'
  },
  'lighting installation': {
    intro: 'Find providers for Ceiling fixtures, recessed lights, outdoor lighting, and replacement of existing fixtures.',
    heading: 'Details to include in your request',
    details: 'Share fixture types, mounting heights, wiring availability, and whether new circuits are needed.',
    safetyHeading: 'Planning and safety',
    safety: 'Electrical connections should be handled by qualified personnel when required.'
  },
  'local moving under 50 miles': {
    intro: 'Find providers for Apartment moves, small household relocations, loading, and unloading nearby.',
    heading: 'Details to include in your request',
    details: 'Share both locations, stairs, elevators, item volume, date, and parking arrangements.',
    safetyHeading: 'Planning and safety',
    safety: 'Confirm insurance, hourly minimums, travel charges, and item protection.'
  },
  'lock installation and repair': {
    intro: 'Find providers for Door lock replacement, rekeying, sticking locks, and security hardware upgrades.',
    heading: 'Details to include in your request',
    details: 'Explain lock type, door material, number of locks, and whether access is urgent.',
    safetyHeading: 'Planning and safety',
    safety: 'Confirm authorization to work on the property and ask about hardware options.'
  },
  'metalwork': {
    intro: 'Find providers for Metal gates, brackets, railings, fabrication repairs, and custom steel or aluminum pieces.',
    heading: 'Details to include in your request',
    details: 'Provide drawings or measurements, material preferences, finish, installation location, and load requirements.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about corrosion protection and structural requirements for load-bearing work.'
  },
  'mobile auto detailing': {
    intro: 'Find providers for Interior cleaning, exterior washing, stain treatment, and vehicle detailing at your location.',
    heading: 'Details to include in your request',
    details: 'Share vehicle type, condition, requested services, water or power availability, and parking.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about product compatibility with paint, trim, and upholstery.'
  },
  'mobile auto mechanic': {
    intro: 'Find providers for On-site vehicle diagnostics, battery issues, no-start problems, and minor mechanical repairs.',
    heading: 'Details to include in your request',
    details: 'Provide vehicle year, make, model, symptoms, warning lights, and parking location.',
    safetyHeading: 'Planning and safety',
    safety: 'Do not drive a vehicle with serious brake, steering, or overheating problems.'
  },
  'notarization': {
    intro: 'Find providers for Acknowledgments, jurats, and other documents requiring notarization where permitted.',
    heading: 'Details to include in your request',
    details: 'Explain the document type, number of signers, location, and whether mobile service is needed.',
    safetyHeading: 'Planning and safety',
    safety: 'Confirm acceptable identification and whether witnesses are required.'
  },
  'outdoor landscaping and design': {
    intro: 'Find providers for Garden layouts, planting beds, irrigation planning, drainage, and yard redesign.',
    heading: 'Details to include in your request',
    details: 'Share yard dimensions, sunlight, drainage issues, plant preferences, and maintenance goals.',
    safetyHeading: 'Planning and safety',
    safety: 'Check buried utilities and local watering or landscape restrictions.'
  },
  'personal training': {
    intro: 'Find providers for Strength training, general fitness coaching, mobility work, and exercise programming.',
    heading: 'Details to include in your request',
    details: 'Describe goals, experience, preferred location, equipment access, and schedule.',
    safetyHeading: 'Planning and safety',
    safety: 'Discuss relevant health limitations with a qualified clinician before starting demanding exercise.'
  },
  'pest control services': {
    intro: 'Find providers for Ants, roaches, rodents, termites, and other common property pest concerns.',
    heading: 'Details to include in your request',
    details: 'Describe pest signs, affected rooms, frequency, pets, and previous treatments.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about licensing, treatment instructions, and precautions for people and animals.'
  },
  'pressure washing': {
    intro: 'Find providers for Driveways, siding, patios, walkways, and exterior surface cleaning.',
    heading: 'Details to include in your request',
    details: 'Share surface material, approximate area, stains, water access, and nearby landscaping.',
    safetyHeading: 'Planning and safety',
    safety: 'High-pressure water can damage delicate surfaces; ask about suitable methods.'
  },
  'private taxi and transportation services': {
    intro: 'Find providers for Scheduled local rides, airport transfers, and transportation for appointments or events.',
    heading: 'Details to include in your request',
    details: 'Provide pickup and destination, passenger count, luggage, date, and accessibility needs.',
    safetyHeading: 'Planning and safety',
    safety: 'Confirm driver credentials, insurance, total fare, and pickup details.'
  },
  'swimming pool cleaning and maintenance': {
    intro: 'Find providers for Pool debris removal, water testing, filter maintenance, and recurring cleaning.',
    heading: 'Details to include in your request',
    details: 'Share pool size, equipment type, water condition, and maintenance frequency.',
    safetyHeading: 'Planning and safety',
    safety: 'Pool chemicals must be handled and stored safely; never mix them.'
  },
  'tv mounting': {
    intro: 'Find providers for Wall-mounted televisions, bracket installation, cable routing, and viewing-height setup.',
    heading: 'Details to include in your request',
    details: 'Provide TV size and weight, bracket type, wall material, and desired location.',
    safetyHeading: 'Planning and safety',
    safety: 'Mounting hardware must suit the wall structure and TV weight.'
  },
  'upholstery and furniture cleaning': {
    intro: 'Find providers for Sofa, chair, cushion, and fabric upholstery stain removal and refresh.',
    heading: 'Details to include in your request',
    details: 'Share fabric tags, stain types, item count, pet exposure, and access.',
    safetyHeading: 'Planning and safety',
    safety: 'Test cleaning methods for fabric compatibility and colorfastness.'
  },
  'wedding and event makeup': {
    intro: 'Find providers for Bridal makeup, party looks, trial sessions, and on-site event preparation.',
    heading: 'Details to include in your request',
    details: 'Share event date, location, number of clients, skin sensitivities, and desired style.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about hygiene practices, product sensitivities, and trial arrangements.'
  },
  'wedding and event photography': {
    intro: 'Find providers for Wedding coverage, portraits, ceremony photography, and event photo packages.',
    heading: 'Details to include in your request',
    details: 'Provide date, venue, event timeline, coverage hours, and delivery preferences.',
    safetyHeading: 'Planning and safety',
    safety: 'Confirm image rights, turnaround times, backup plans, and package inclusions.'
  },
  'wedding officiant': {
    intro: 'Find providers for Wedding ceremony officiating, personalized vows, and rehearsal coordination.',
    heading: 'Details to include in your request',
    details: 'Share date, location, ceremony style, guest count, and legal paperwork questions.',
    safetyHeading: 'Planning and safety',
    safety: 'Verify officiant eligibility and marriage-license requirements locally.'
  },
  'window repair': {
    intro: 'Find providers for Broken glass, damaged frames, sticking sashes, and failed window seals.',
    heading: 'Details to include in your request',
    details: 'Share window dimensions, frame material, glass type if known, and photos of damage.',
    safetyHeading: 'Planning and safety',
    safety: 'Keep people away from broken glass and secure openings safely.'
  },
  'window tinting': {
    intro: 'Find providers for Residential or vehicle window film for glare reduction, privacy, and heat control.',
    heading: 'Details to include in your request',
    details: 'Share glass or vehicle type, window measurements, desired film, and installation location.',
    safetyHeading: 'Planning and safety',
    safety: 'Check applicable vehicle tint limits and glass manufacturer restrictions.'
  },
  'tutoring and education services': {
    intro: 'Find providers for Subject tutoring, homework support, exam preparation, and study-skills coaching.',
    heading: 'Details to include in your request',
    details: 'Share learner grade or level, subject, goals, schedule, and preferred teaching format.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about tutor qualifications, lesson structure, and safeguarding arrangements.'
  },
  'specialty meal preparation and dietary cooking': {
    intro: 'Find providers for Prepared meals for dietary preferences, food allergies, and scheduled meal planning.',
    heading: 'Details to include in your request',
    details: 'Share dietary requirements, allergies, portions, delivery needs, and kitchen arrangements.',
    safetyHeading: 'Planning and safety',
    safety: 'Verify allergen handling and do not substitute meal services for prescribed medical nutrition care.'
  },
  'dog training and horse riding lessons': {
    intro: 'Find providers for Dog obedience instruction and introductory or ongoing horseback riding lessons.',
    heading: 'Details to include in your request',
    details: 'Specify which activity you need, learner or animal experience, age, location, and schedule.',
    safetyHeading: 'Planning and safety',
    safety: 'Ask about instructor experience, supervision, and suitable safety equipment.'
  },
  'barber and hair styling services': {
    intro: 'Find providers for Haircuts, fades, beard trims, styling, and event hair preparation.',
    heading: 'Details to include in your request',
    details: 'Share desired cut or style, hair length, appointment location, and reference photos.',
    safetyHeading: 'Planning and safety',
    safety: 'Discuss product sensitivities and sanitation practices before service.'
  },
  'general automotive services towing key programming window tinting and tire services': {
    intro: 'Find providers for Vehicle towing, key programming, tire service, window tinting, and related automotive requests.',
    heading: 'Details to include in your request',
    details: 'State the exact service, vehicle year and model, location, symptoms, and urgency.',
    safetyHeading: 'Planning and safety',
    safety: 'Verify vehicle ownership requirements, towing coverage, and applicable tint rules.'
  },
  'plumbing drain repair': {
    intro: 'Find contractors who work on slow-draining sinks, clogged tubs, backed-up toilets, and blocked household drain lines. Describe the symptoms before arranging a visit.',
    heading: 'What to tell a drain repair contractor',
    details: 'Explain which fixtures are affected, whether the problem is recurring, and whether water is backing up in more than one drain. Share your city or ZIP code, and ask whether diagnostic work, drain clearing, and any follow-up repairs are priced separately.',
    safetyHeading: 'Drain and sewage precautions',
    safety: 'If wastewater is backing up, avoid using affected plumbing fixtures until the problem is assessed. Do not mix chemical drain cleaners, and tell the contractor if any cleaning products were already poured into the drain.'
  }
};
const used = new Set(); const urls = [];
for (const service of services) {
  let id = slug(service);
  if (!id) continue;
  if (used.has(id)) throw Error('SEO slug collision: '+id);
  used.add(id);
  const target = 'https://texcontractor.com/contractor.html?service='+encodeURIComponent(service);
  const canonical = 'https://texcontractor.com/services/'+id+'.html';
  const editorial = reviewed[service.toLowerCase()];
  const serviceCopy = editorial
    ? '<p>'+esc(editorial.intro)+'</p><h2>'+esc(editorial.heading)+'</h2><p>'+esc(editorial.details)+'</p><h2>'+esc(editorial.safetyHeading)+'</h2><p>'+esc(editorial.safety)+'</p><p>Browse available TexContractor profiles below. Listings and availability vary by location; review each contractor’s information and contact them directly by text message.</p>'
    : '<p>Looking for '+esc(service)+' services? Browse available contractor profiles on TexContractor and send a text message directly to a contractor about your project.</p><p>Contractor availability depends on your location and current listings. Check each profile for service details and contact information.</p>';
  const title = service+' Contractors | TexContractor';
  const desc = 'Explore '+service+' contractors on TexContractor. Compare service profiles and contact contractors directly by text message.';
  const page = `<!doctype html>
<html lang="en"><head>${googleAdsTag}<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}">
<style>body{font:16px/1.6 system-ui,sans-serif;margin:auto;max-width:800px;padding:24px;color:#192b38}a{color:#0769a3}header,footer{padding:14px 0}main{padding:35px 0}a.cta{display:inline-block;padding:12px 20px;background:#075c80;color:white;border-radius:8px;text-decoration:none}</style>
</head><body><header><a href="/">TexContractor</a> / Services</header><main><h1>${esc(service)} Contractors</h1>
${serviceCopy}
<a class="cta" href="${esc(target)}">Browse ${esc(service)} contractors</a>
</main><footer><a href="/services/">Browse all services</a></footer></body></html>`;
  writeFileSync(join(dir,id+'.html'),page);
  urls.push(canonical);
}
const directoryLinks = services.map(service => '<li><a href="/services/'+slug(service)+'.html">'+esc(service)+'</a></li>').join('\n');
const directoryPage = '<!doctype html><html lang="en"><head>'+googleAdsTag+'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Browse Services | TexContractor</title><meta name="description" content="Browse TexContractor service categories and find contractors you can contact by text."><link rel="canonical" href="https://texcontractor.com/services/"></head><body><main><h1>Browse Contractor Services</h1><p>Choose a service category to browse contractor listings and contact providers directly by text message.</p><ul>'+directoryLinks+'</ul><p><a href="/">TexContractor home</a></p></main></body></html>';
writeFileSync(join(dir,'index.html'),directoryPage);
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
 ['https://texcontractor.com/','https://texcontractor.com/contractor.html','https://texcontractor.com/services/',...urls].map(u=>'  <url><loc>'+u.replaceAll('&','&amp;')+'</loc></url>').join('\n')+'\n</urlset>\n';
writeFileSync(join(root,'sitemap.xml'),xml);
console.log('Generated '+urls.length+' SEO service pages from existing homepage links.');
