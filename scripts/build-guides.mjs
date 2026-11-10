// Builds cost guides in English (/guides/) and Spanish (/es/guias/) + sitemap-guides.xml.
// Run: node scripts/build-guides.mjs
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const SITE = 'https://texcontractor.com';
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const adsTag = `  <!-- Google Ads tag: AW-18516159223 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18516159223"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-18516159223');
  </script>`;
const css = 'body{font:17px/1.65 system-ui,sans-serif;margin:auto;max-width:780px;padding:24px;color:#192b38}a{color:#0769a3}header,footer{padding:14px 0}main{padding:24px 0}h1{line-height:1.2}table{border-collapse:collapse;width:100%;margin:12px 0 20px}th,td{border:1px solid #d6e0e6;padding:8px 10px;text-align:left;vertical-align:top}th{background:#eef4f7}.note{background:#f4f8fa;border-left:4px solid #075c80;padding:10px 14px}.upd{color:#5b6b76;font-size:.9rem}.ctas{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0}.ctas a{display:inline-block;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;color:#fff;background:#075c80}.ctas a.req{background:#b45309}.src{font-size:.9rem}.tc-lang{float:right}';

const SRC = {
  inchRoof: ['Inch Calculator – Cost to Replace Roof', 'https://www.inchcalculator.com/roof-replacement-cost/'],
  nerdRoof: ['NerdWallet – Roof Replacement Cost (data from Angi)', 'https://www.nerdwallet.com/home-ownership/home-improvement/learn/roof-replacement-cost'],
  haPlumb: ['HomeAdvisor – Cost to Hire a Plumber', 'https://www.homeadvisor.com/cost/plumbing/hire-a-plumber/'],
  inchPlumb: ['Inch Calculator – Cost to Hire a Plumber', 'https://www.inchcalculator.com/plumbing-cost-guide/'],
  fixrAc: ['Fixr – How Much Does AC Repair Cost?', 'https://www.fixr.com/costs/air-conditioner-repair'],
  tohAc: ['This Old House – Air Conditioner Repair Cost', 'https://www.thisoldhouse.com/heating-cooling/air-conditioner-repair-cost'],
  tohGarage: ['This Old House – Garage Door Repair Cost', 'https://www.thisoldhouse.com/garages/garage-door-repair-cost/'],
  inchGarage: ['Inch Calculator – Cost to Repair a Garage Door', 'https://www.inchcalculator.com/cost-to-repair-garage-door/'],
  ttClean: ['Thumbtack – How much will your house cleaning cost?', 'https://www.thumbtack.com/p/house-cleaning-prices'],
  hcpClean: ['Housecall Pro – House Cleaning Prices', 'https://www.housecallpro.com/resources/pricing/house-cleaning-prices/'],
  fixrWh: ['Fixr – How Much Does It Cost to Install a Water Heater?', 'https://www.fixr.com/costs/install-water-heater'],
  nerdWh: ['NerdWallet – Water Heater Cost', 'https://www.nerdwallet.com/article/mortgages/water-heater-cost'],
};

const table = (head, rows) => `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const ul = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

const guides = [
  {
    slugEn: 'roof-replacement-cost', slugEs: 'costo-cambiar-techo',
    service: 'Roof Repair or Maintenance', svcSlug: 'roof-repair-or-maintenance',
    en: {
      title: 'How Much Does a Roof Replacement Cost?',
      desc: 'Typical roof replacement prices per square and for a whole home, what changes the price, and what to ask roofers before you get quotes.',
      body: `<p>A new roof is one of the biggest repairs a homeowner pays for. Prices depend on the size of the roof, the material, how steep it is and how many old layers must be removed. These national figures help you know what to expect before you ask roofers near you for quotes.</p>
<h2>Typical total cost</h2>
<p>Published cost guides put most full roof replacements between about <strong>$6,700 and $25,000</strong>, with large or premium roofs costing much more. One guide reports an average of about <strong>$9,500</strong>.</p>
<h2>Price per square (100 sq ft), installed</h2>
<p>Roofers usually quote by the <em>square</em>, which is 100 square feet of roof.</p>
${table(['Material', 'Price per square'], [['3-tab asphalt shingles', '$425 – $825'], ['Architectural asphalt shingles', '$450 – $1,250'], ['Metal (steel)', '$450 – $1,700'], ['Tile', '$500 – $1,800']])}
<p>Removing the old shingles (tear-off) usually adds about <strong>$100 – $150 per square</strong>.</p>
<p class="note"><strong>Example:</strong> a 30-square roof with architectural shingles at $450 – $1,250 per square comes to roughly $13,500 – $37,500, plus about $3,000 – $4,500 for tear-off. Your real price depends on your home and your area — always get written quotes.</p>
<h2>What changes the price</h2>
${ul(['Roof size and number of squares', 'Material (asphalt, metal, tile)', 'Steep pitch or a complex roof with many valleys', 'Tear-off of one or more old layers', 'Rotten or damaged decking that must be replaced', 'Chimneys and skylights (extra flashing)', 'Permits, disposal and local labor rates'])}
<h2>What to ask before you hire</h2>
${ul(['Is the quote written and itemized (materials, tear-off, decking, disposal)?', 'What shingle brand and line will you use?', 'How is damaged decking priced if you find it?', 'Who handles the permit and cleanup?', 'What warranty covers the work?'])}
<p>Get more than one quote and compare the same items in each one.</p>`,
      ctaBrowse: 'Find roofers near you', ctaReq: 'Post a roof request',
      upd: 'Updated October 2026. Prices are national estimates from the sources below and change by location and over time.',
      srcTitle: 'Sources', sources: [SRC.inchRoof, SRC.nerdRoof],
    },
    es: {
      title: '¿Cuánto cuesta cambiar el techo de una casa?',
      desc: 'Precios típicos para cambiar un techo por “square” y para toda la casa, qué cambia el precio y qué preguntarle al techero antes de pedir presupuestos.',
      body: `<p>Un techo nuevo es una de las reparaciones más grandes que paga un dueño de casa. El precio depende del tamaño del techo, el material, qué tan inclinado está y cuántas capas viejas hay que quitar. Estas cifras nacionales te ayudan a saber qué esperar antes de pedir presupuestos a techeros cerca de ti.</p>
<h2>Costo total típico</h2>
<p>Las guías de precios publicadas indican que la mayoría de los cambios de techo completos cuestan entre <strong>$6,700 y $25,000</strong>, y los techos grandes o con materiales de alta gama cuestan bastante más. Una guía reporta un promedio de unos <strong>$9,500</strong>.</p>
<h2>Precio por “square” (100 pies cuadrados), instalado</h2>
<p>Los techeros normalmente cotizan por <em>square</em>, que equivale a 100 pies cuadrados de techo.</p>
${table(['Material', 'Precio por square'], [['Tejas de asfalto 3-tab', '$425 – $825'], ['Tejas de asfalto arquitectónicas', '$450 – $1,250'], ['Metal (acero)', '$450 – $1,700'], ['Teja', '$500 – $1,800']])}
<p>Quitar las tejas viejas (tear-off) normalmente suma unos <strong>$100 – $150 por square</strong>.</p>
<p class="note"><strong>Ejemplo:</strong> un techo de 30 squares con tejas arquitectónicas, a $450 – $1,250 por square, sale aproximadamente entre $13,500 y $37,500, más unos $3,000 – $4,500 por quitar el techo viejo. El precio real depende de tu casa y tu zona; pide siempre presupuestos por escrito.</p>
<h2>Qué cambia el precio</h2>
${ul(['El tamaño del techo y el número de squares', 'El material (asfalto, metal, teja)', 'Mucha inclinación o un techo complicado con muchos valles', 'Quitar una o más capas viejas', 'Madera (decking) podrida o dañada que hay que cambiar', 'Chimeneas y tragaluces (más tapajuntas)', 'Permisos, retiro de escombros y el costo de mano de obra en tu zona'])}
<h2>Qué preguntar antes de contratar</h2>
${ul(['¿El presupuesto es por escrito y detallado (materiales, tear-off, decking, retiro de escombros)?', '¿Qué marca y línea de tejas va a usar?', '¿Cuánto cobra si encuentra madera dañada?', '¿Quién se encarga del permiso y la limpieza?', '¿Qué garantía cubre el trabajo?'])}
<p>Pide más de un presupuesto y compara los mismos puntos en cada uno.</p>`,
      ctaBrowse: 'Encontrar techeros cerca de ti', ctaReq: 'Publicar una solicitud de techo',
      upd: 'Actualizado en octubre de 2026. Los precios son estimados nacionales de las fuentes de abajo y cambian según la zona y con el tiempo.',
      srcTitle: 'Fuentes', sources: [SRC.inchRoof, SRC.nerdRoof],
    },
  },
  {
    slugEn: 'plumber-cost', slugEs: 'costo-plomero',
    service: 'Plumbing Pipe Repair', svcSlug: 'plumbing-pipe-repair',
    en: {
      title: 'How Much Does a Plumber Cost?',
      desc: 'Typical plumber hourly rates, service call fees, emergency pricing and common repair costs, plus tips to get a clear quote.',
      body: `<p>Most plumbing jobs are priced by the hour or as a flat rate per job, often with a service call or trip fee. Knowing the usual ranges helps you compare quotes from plumbers near you.</p>
<h2>Typical rates</h2>
${table(['Item', 'Typical range'], [['Average plumbing visit', 'About $336 (most pay $180 – $494)'], ['Hourly rate', 'Usually $70 – $120 per hour (full range $45 – $200)'], ['Service call fee', '$100 – $250, often including the first hour'], ['Evenings, weekends, holidays', 'About 1.5× to 3× the normal hourly rate']])}
<h2>Common repairs</h2>
${table(['Job', 'Typical range'], [['Clearing a clogged drain', '$95 – $500'], ['Toilet repair', '$100 – $300'], ['Faucet or fixture replacement', '$150 – $600'], ['Main water shut-off valve replacement', '$150 – $600'], ['Water heater repair', '$150 – $750'], ['Water heater installation', '$800 – $2,000'], ['Burst pipe repair', '$200 – $3,000']])}
<h2>How to get a clear price</h2>
${ul(['Describe the problem and send photos before the visit.', 'Ask if the service call fee is applied to the repair.', 'Ask for the price in writing before work starts.', 'Ask whether parts are included and what warranty applies.', 'For a leak, shut off the water at the main valve if it is safe to do so.'])}`,
      ctaBrowse: 'Find plumbers near you', ctaReq: 'Post a plumbing request',
      upd: 'Updated October 2026. Prices are national estimates from the sources below and change by location and over time.',
      srcTitle: 'Sources', sources: [SRC.haPlumb, SRC.inchPlumb],
    },
    es: {
      title: '¿Cuánto cobra un plomero?',
      desc: 'Tarifas típicas por hora de un plomero, cargo por visita, precios de emergencia y costos de reparaciones comunes, con consejos para pedir un presupuesto claro.',
      body: `<p>La mayoría de los trabajos de plomería se cobran por hora o con un precio fijo por trabajo, muchas veces con un cargo por visita. Conocer los rangos normales te ayuda a comparar presupuestos de plomeros cerca de ti.</p>
<h2>Tarifas típicas</h2>
${table(['Concepto', 'Rango típico'], [['Visita promedio de plomería', 'Unos $336 (la mayoría paga $180 – $494)'], ['Tarifa por hora', 'Normalmente $70 – $120 por hora (rango completo $45 – $200)'], ['Cargo por visita', '$100 – $250, muchas veces incluye la primera hora'], ['Noches, fines de semana y días festivos', 'Aproximadamente 1.5 a 3 veces la tarifa normal']])}
<h2>Reparaciones comunes</h2>
${table(['Trabajo', 'Rango típico'], [['Destapar un desagüe', '$95 – $500'], ['Reparar un inodoro', '$100 – $300'], ['Cambiar una llave o accesorio', '$150 – $600'], ['Cambiar la llave de paso principal del agua', '$150 – $600'], ['Reparar el calentador de agua', '$150 – $750'], ['Instalar un calentador de agua', '$800 – $2,000'], ['Reparar una tubería rota', '$200 – $3,000']])}
<h2>Cómo conseguir un precio claro</h2>
${ul(['Describe el problema y envía fotos antes de la visita.', 'Pregunta si el cargo por visita se descuenta de la reparación.', 'Pide el precio por escrito antes de empezar el trabajo.', 'Pregunta si incluye las piezas y qué garantía tiene.', 'Si hay una fuga, cierra el agua en la llave principal si es seguro hacerlo.'])}`,
      ctaBrowse: 'Encontrar plomeros cerca de ti', ctaReq: 'Publicar una solicitud de plomería',
      upd: 'Actualizado en octubre de 2026. Los precios son estimados nacionales de las fuentes de abajo y cambian según la zona y con el tiempo.',
      srcTitle: 'Fuentes', sources: [SRC.haPlumb, SRC.inchPlumb],
    },
  },
  {
    slugEn: 'ac-repair-cost', slugEs: 'costo-reparar-aire-acondicionado',
    service: 'Central Air Conditioning Repair or Maintenance', svcSlug: 'central-air-conditioning-repair-or-maintenance',
    en: {
      title: 'How Much Does AC Repair Cost?',
      desc: 'Typical air conditioner repair prices, common part costs, service call and hourly rates, and when replacing the unit makes more sense.',
      body: `<p>When the air conditioner stops cooling, the price of the fix depends on which part failed, how old the system is and when you need the technician. These national figures help you know what to expect before you call AC technicians near you.</p>
<h2>Typical total cost</h2>
<p>One guide puts the national average AC repair at about <strong>$375</strong>, with most homeowners paying <strong>$250 – $700</strong>. Another reports that common fixes usually run <strong>$150 – $650</strong>. Small jobs can be close to $100, while a major part like the compressor can reach <strong>$3,000</strong> or more.</p>
<h2>Service call and labor</h2>
${table(['Item', 'Typical range'], [['Diagnostic / service call fee', '$75 – $150 (some companies apply it to the repair)'], ['Hourly labor', '$75 – $175 per hour'], ['Nights, weekends, holidays', 'About 2 – 3 times the normal hourly rate, or $150 – $300 per hour']])}
<h2>Common repairs</h2>
${table(['Repair', 'Typical range'], [['Clogged condensate drain line', '$75 – $250'], ['Capacitor replacement', '$100 – $400'], ['Contactor (relay) repair', '$100 – $450'], ['Thermostat replacement', '$100 – $500'], ['Refrigerant recharge', '$100 – $600'], ['Refrigerant leak repair', '$200 – $1,500'], ['Blower motor repair', '$200 – $900'], ['Fan motor', '$300 – $800'], ['Evaporator coil replacement', '$400 – $2,700'], ['Condenser coil replacement', '$600 – $2,700'], ['Compressor replacement', '$600 – $3,000+']])}
<h2>Repair or replace?</h2>
<p>One guide suggests a simple rule: multiply the age of the unit in years by the repair cost. If the result is more than <strong>$5,000</strong>, replacing the system may make more sense. Other signs: the repair costs more than half the price of a new unit, the system is more than about 12 years old, it uses old R-22 refrigerant, or it keeps breaking down.</p>
<p class="note"><strong>Example:</strong> a $400 repair on a 15-year-old unit gives 15 × $400 = $6,000, which is over $5,000 — worth asking for a replacement quote too. Your real price depends on your system and your area — always get a written quote.</p>
<h2>What to ask before you hire</h2>
${ul(['What is the service call fee, and is it applied to the repair?', 'What exactly failed, and can you show me the part?', 'Is the price in writing, with parts and labor separated?', 'Is there an extra charge for nights or weekends?', 'What warranty covers the part and the labor?'])}
<p>For big repairs like a compressor or coil, get more than one quote and compare the same items in each one.</p>`,
      ctaBrowse: 'Find AC technicians near you', ctaReq: 'Post an AC repair request',
      upd: 'Updated November 2026. Prices are national estimates from the sources below and change by location and over time.',
      srcTitle: 'Sources', sources: [SRC.fixrAc, SRC.tohAc],
    },
    es: {
      title: '¿Cuánto cuesta reparar el aire acondicionado?',
      desc: 'Precios típicos para reparar el aire acondicionado, costo de las piezas más comunes, cargo por visita y tarifa por hora, y cuándo conviene más cambiar el equipo.',
      body: `<p>Cuando el aire acondicionado deja de enfriar, el precio de la reparación depende de la pieza que falló, la edad del equipo y cuándo necesitas al técnico. Estas cifras nacionales te ayudan a saber qué esperar antes de llamar a técnicos de aire acondicionado cerca de ti.</p>
<h2>Costo total típico</h2>
<p>Una guía indica que el promedio nacional para reparar el aire acondicionado es de unos <strong>$375</strong>, y la mayoría de los dueños de casa paga entre <strong>$250 y $700</strong>. Otra guía reporta que las reparaciones comunes normalmente cuestan entre <strong>$150 y $650</strong>. Los trabajos pequeños pueden costar cerca de $100, mientras que una pieza grande como el compresor puede llegar a <strong>$3,000</strong> o más.</p>
<h2>Cargo por visita y mano de obra</h2>
${table(['Concepto', 'Rango típico'], [['Diagnóstico / cargo por visita', '$75 – $150 (algunas compañías lo descuentan de la reparación)'], ['Mano de obra por hora', '$75 – $175 por hora'], ['Noches, fines de semana, días festivos', 'Unas 2 – 3 veces la tarifa normal, o $150 – $300 por hora']])}
<h2>Reparaciones comunes</h2>
${table(['Reparación', 'Rango típico'], [['Destapar la línea de drenaje', '$75 – $250'], ['Cambiar el capacitor', '$100 – $400'], ['Reparar el contactor (relé)', '$100 – $450'], ['Cambiar el termostato', '$100 – $500'], ['Recargar refrigerante', '$100 – $600'], ['Reparar una fuga de refrigerante', '$200 – $1,500'], ['Reparar el motor del soplador', '$200 – $900'], ['Motor del ventilador', '$300 – $800'], ['Cambiar el serpentín evaporador', '$400 – $2,700'], ['Cambiar el serpentín condensador', '$600 – $2,700'], ['Cambiar el compresor', '$600 – $3,000+']])}
<h2>¿Reparar o cambiar el equipo?</h2>
<p>Una guía sugiere una regla sencilla: multiplica la edad del equipo en años por el costo de la reparación. Si el resultado pasa de <strong>$5,000</strong>, puede convenir más cambiar el sistema. Otras señales: la reparación cuesta más de la mitad del precio de un equipo nuevo, el sistema tiene más de unos 12 años, usa el refrigerante viejo R-22 o se descompone seguido.</p>
<p class="note"><strong>Ejemplo:</strong> una reparación de $400 en un equipo de 15 años da 15 × $400 = $6,000, que pasa de $5,000 — vale la pena pedir también un presupuesto para cambiarlo. El precio real depende de tu equipo y de tu zona — pide siempre un presupuesto por escrito.</p>
<h2>Qué preguntar antes de contratar</h2>
${ul(['¿Cuánto es el cargo por visita y se descuenta de la reparación?', '¿Qué falló exactamente y me puede mostrar la pieza?', '¿El precio es por escrito, con piezas y mano de obra por separado?', '¿Cobra más por noches o fines de semana?', '¿Qué garantía tienen la pieza y el trabajo?'])}
<p>Para reparaciones grandes, como el compresor o el serpentín, pide más de un presupuesto y compara los mismos puntos en cada uno.</p>`,
      ctaBrowse: 'Encontrar técnicos de aire acondicionado cerca de ti', ctaReq: 'Publicar una solicitud de reparación de aire',
      upd: 'Actualizado en noviembre de 2026. Los precios son estimados nacionales de las fuentes de abajo y cambian según la zona y con el tiempo.',
      srcTitle: 'Fuentes', sources: [SRC.fixrAc, SRC.tohAc],
    },
  },
  {
    slugEn: 'garage-door-repair-cost', slugEs: 'costo-reparar-puerta-de-garaje',
    service: 'Garage Door Repair', svcSlug: 'garage-door-repair',
    en: {
      title: 'How Much Does Garage Door Repair Cost?',
      desc: 'Typical garage door repair prices for springs, cables, tracks, sensors, panels and openers, plus service call fees and what to ask before you hire.',
      body: `<p>A garage door that will not open is usually caused by a broken spring, a loose cable, a bent track or an opener problem. The price depends on which part failed and how fast you need it fixed. These national figures help you compare quotes from garage door technicians near you.</p>
<h2>Typical total cost</h2>
<p>One guide reports an average garage door repair of about <strong>$479</strong>, with a typical range of <strong>$98 – $860</strong>. Another puts the average at about <strong>$300</strong>, with most repairs between <strong>$100 and $600</strong>.</p>
<h2>Common repairs</h2>
${table(['Repair', 'Typical range'], [['Spring repair (torsion or extension)', '$150 – $375'], ['Cable repair', '$100 – $375'], ['Track repair or realignment', '$125 – $400'], ['Safety sensor (photo-eye) repair', '$110 – $200'], ['Opener repair', '$180 – $360'], ['Door panel replacement', '$400 – $900']])}
<p class="note"><strong>Example:</strong> one guide breaks down a basic spring replacement at about $360: $108 in parts, $192 in labor and a $60 service call. Your real price depends on your door and your area — always get a written quote.</p>
<h2>Service call, labor and emergencies</h2>
${ul(['Service call fee: about $50 – $75, often waived if you approve the repair.', 'Labor: about $60 per hour on average, and $150 or more per hour with some companies.', 'Emergency or weekend work costs more — one guide notes a $300 spring job can double on an emergency weekend call.'])}
<h2>Safety first</h2>
<p>Garage door springs hold a lot of tension and can cause serious injury. If a spring or cable is broken, keep the door closed, do not try to lift it by hand, and let a technician do the repair.</p>
<h2>What to ask before you hire</h2>
${ul(['What is the service call fee, and is it waived if I approve the repair?', 'Is the price in writing, with parts and labor separated?', 'If one spring broke, should both springs be replaced?', 'Is there an extra charge for same-day or weekend service?', 'What warranty covers the parts and the labor?'])}
<p>If the repair is close to the price of a new door (about $700 – $2,500 according to one guide), ask for a replacement quote too.</p>`,
      ctaBrowse: 'Find garage door technicians near you', ctaReq: 'Post a garage door request',
      upd: 'Updated November 2026. Prices are national estimates from the sources below and change by location and over time.',
      srcTitle: 'Sources', sources: [SRC.tohGarage, SRC.inchGarage],
    },
    es: {
      title: '¿Cuánto cuesta reparar una puerta de garaje?',
      desc: 'Precios típicos para reparar una puerta de garaje: resortes, cables, rieles, sensores, paneles y abridor, más el cargo por visita y qué preguntar antes de contratar.',
      body: `<p>Una puerta de garaje que no abre normalmente tiene un resorte roto, un cable suelto, un riel doblado o un problema con el abridor. El precio depende de la pieza que falló y de qué tan rápido la necesitas arreglada. Estas cifras nacionales te ayudan a comparar presupuestos de técnicos de puertas de garaje cerca de ti.</p>
<h2>Costo total típico</h2>
<p>Una guía reporta un promedio de unos <strong>$479</strong> para reparar una puerta de garaje, con un rango típico de <strong>$98 a $860</strong>. Otra indica un promedio de unos <strong>$300</strong>, y la mayoría de las reparaciones entre <strong>$100 y $600</strong>.</p>
<h2>Reparaciones comunes</h2>
${table(['Reparación', 'Rango típico'], [['Reparar resortes (de torsión o de extensión)', '$150 – $375'], ['Reparar cables', '$100 – $375'], ['Reparar o alinear el riel', '$125 – $400'], ['Reparar el sensor de seguridad (fotocelda)', '$110 – $200'], ['Reparar el abridor', '$180 – $360'], ['Cambiar un panel de la puerta', '$400 – $900']])}
<p class="note"><strong>Ejemplo:</strong> una guía desglosa el cambio básico de un resorte en unos $360: $108 de piezas, $192 de mano de obra y $60 de cargo por visita. El precio real depende de tu puerta y de tu zona — pide siempre un presupuesto por escrito.</p>
<h2>Cargo por visita, mano de obra y emergencias</h2>
${ul(['Cargo por visita: unos $50 – $75, muchas veces no se cobra si apruebas la reparación.', 'Mano de obra: unos $60 por hora en promedio, y $150 o más por hora con algunas compañías.', 'Los trabajos de emergencia o de fin de semana cuestan más — una guía indica que un cambio de resorte de $300 puede costar el doble en una llamada de emergencia en fin de semana.'])}
<h2>Primero la seguridad</h2>
<p>Los resortes de la puerta de garaje tienen mucha tensión y pueden causar lesiones graves. Si un resorte o un cable está roto, deja la puerta cerrada, no intentes levantarla a mano y deja que un técnico haga la reparación.</p>
<h2>Qué preguntar antes de contratar</h2>
${ul(['¿Cuánto es el cargo por visita y se elimina si apruebo la reparación?', '¿El precio es por escrito, con piezas y mano de obra por separado?', 'Si se rompió un resorte, ¿conviene cambiar los dos?', '¿Cobra más por servicio el mismo día o en fin de semana?', '¿Qué garantía tienen las piezas y el trabajo?'])}
<p>Si la reparación cuesta casi lo mismo que una puerta nueva (unos $700 – $2,500 según una guía), pide también un presupuesto para cambiarla.</p>`,
      ctaBrowse: 'Encontrar técnicos de puertas de garaje cerca de ti', ctaReq: 'Publicar una solicitud de puerta de garaje',
      upd: 'Actualizado en noviembre de 2026. Los precios son estimados nacionales de las fuentes de abajo y cambian según la zona y con el tiempo.',
      srcTitle: 'Fuentes', sources: [SRC.tohGarage, SRC.inchGarage],
    },
  },
  {
    slugEn: 'house-cleaning-cost', slugEs: 'costo-limpieza-de-casa',
    service: 'House Cleaning', svcSlug: 'house-cleaning',
    en: {
      title: 'How Much Does House Cleaning Cost?',
      desc: 'Typical house cleaning prices per visit, by number of bedrooms and square feet, deep and move-out cleaning, recurring visits and add-ons.',
      body: `<p>House cleaners usually charge a flat price per visit, based on the size of the home and the type of cleaning, and some charge by the hour. These national figures help you compare quotes from house cleaners near you.</p>
<h2>Typical price per visit</h2>
<p>One guide puts the national average at <strong>$185 – $324</strong> per cleaning, with low-end jobs around $124 and high-end jobs around $493. Another reports that a standard one-time cleaning usually costs <strong>$140 – $220</strong>, and that cleaners often charge <strong>$30 – $80 per hour</strong> per cleaner.</p>
<h2>By type of cleaning</h2>
${table(['Type', 'Typical range per visit'], [['Standard / regular cleaning', '$146 – $202'], ['Deep cleaning', '$190 – $265'], ['Move-out cleaning', '$200 – $286'], ['Move-in or move-out deep clean (second guide)', '$220 – $400'], ['Post-construction cleaning', '$203 – $285']])}
<h2>By number of bedrooms</h2>
${table(['Bedrooms', 'Typical range per visit'], [['1 bedroom', '$133 – $174'], ['2 bedrooms', '$136 – $217'], ['3 bedrooms', '$166 – $250'], ['4 bedrooms', '$191 – $286'], ['5 bedrooms', '$217 – $327']])}
<h2>By square feet (standard vs. deep)</h2>
${table(['Home size', 'Standard', 'Deep'], [['1,000 sq ft or less', '$100 – $200', '$120 – $300'], ['1,500 sq ft', '$150 – $300', '$180 – $450'], ['2,000 sq ft', '$200 – $400', '$240 – $600'], ['3,000 sq ft', '$300 – $600', '$360 – $900']])}
<h2>One-time vs. recurring</h2>
${table(['How often', 'Average per visit'], [['One-time', '$174 – $256'], ['Monthly', '$162 – $228'], ['Every 2 weeks', '$160 – $220']])}
<p>Regular visits usually cost a little less per visit, because the home stays cleaner between visits.</p>
<h2>Common add-ons</h2>
${table(['Add-on', 'Typical range'], [['Inside the oven', '$30 – $50'], ['Inside the refrigerator', '$31 – $100'], ['Inside the cabinets', '$75 – $230'], ['Each extra bedroom or bathroom', '$30 – $60']])}
<h2>How to get a clear price</h2>
${ul(['Tell the cleaner the number of bedrooms, bathrooms and the square feet.', 'Say if it is a standard, deep or move-out cleaning.', 'List any extras (oven, fridge, cabinets, windows) before the visit.', 'Ask what is included and whether they bring their own supplies.', 'Ask for a lower price if you book every week or every 2 weeks.'])}`,
      ctaBrowse: 'Find house cleaners near you', ctaReq: 'Post a cleaning request',
      upd: 'Updated November 2026. Prices are national estimates from the sources below and change by location and over time.',
      srcTitle: 'Sources', sources: [SRC.ttClean, SRC.hcpClean],
    },
    es: {
      title: '¿Cuánto cuesta la limpieza de casa?',
      desc: 'Precios típicos de limpieza de casa por visita, según el número de recámaras y los pies cuadrados, limpieza profunda y de mudanza, visitas regulares y extras.',
      body: `<p>Las personas que limpian casas normalmente cobran un precio fijo por visita, según el tamaño de la casa y el tipo de limpieza, y algunas cobran por hora. Estas cifras nacionales te ayudan a comparar presupuestos de limpieza cerca de ti.</p>
<h2>Precio típico por visita</h2>
<p>Una guía indica que el promedio nacional es de <strong>$185 – $324</strong> por limpieza; los trabajos más baratos rondan los $124 y los más caros unos $493. Otra guía reporta que una limpieza normal de una sola vez suele costar <strong>$140 – $220</strong>, y que muchas veces se cobra <strong>$30 – $80 por hora</strong> por persona.</p>
<h2>Según el tipo de limpieza</h2>
${table(['Tipo', 'Rango típico por visita'], [['Limpieza normal / regular', '$146 – $202'], ['Limpieza profunda', '$190 – $265'], ['Limpieza al mudarte (salida)', '$200 – $286'], ['Limpieza profunda de entrada o salida (segunda guía)', '$220 – $400'], ['Limpieza después de obra', '$203 – $285']])}
<h2>Según el número de recámaras</h2>
${table(['Recámaras', 'Rango típico por visita'], [['1 recámara', '$133 – $174'], ['2 recámaras', '$136 – $217'], ['3 recámaras', '$166 – $250'], ['4 recámaras', '$191 – $286'], ['5 recámaras', '$217 – $327']])}
<h2>Según los pies cuadrados (normal vs. profunda)</h2>
${table(['Tamaño de la casa', 'Normal', 'Profunda'], [['1,000 pies² o menos', '$100 – $200', '$120 – $300'], ['1,500 pies²', '$150 – $300', '$180 – $450'], ['2,000 pies²', '$200 – $400', '$240 – $600'], ['3,000 pies²', '$300 – $600', '$360 – $900']])}
<h2>Una sola vez vs. visitas regulares</h2>
${table(['Frecuencia', 'Promedio por visita'], [['Una sola vez', '$174 – $256'], ['Cada mes', '$162 – $228'], ['Cada 2 semanas', '$160 – $220']])}
<p>Las visitas regulares suelen costar un poco menos por visita, porque la casa se mantiene más limpia entre una y otra.</p>
<h2>Extras comunes</h2>
${table(['Extra', 'Rango típico'], [['Dentro del horno', '$30 – $50'], ['Dentro del refrigerador', '$31 – $100'], ['Dentro de los gabinetes', '$75 – $230'], ['Cada recámara o baño adicional', '$30 – $60']])}
<h2>Cómo conseguir un precio claro</h2>
${ul(['Dile el número de recámaras, baños y los pies cuadrados.', 'Aclara si es limpieza normal, profunda o de mudanza.', 'Menciona los extras (horno, refrigerador, gabinetes, ventanas) antes de la visita.', 'Pregunta qué incluye y si traen sus propios productos.', 'Pide un mejor precio si reservas cada semana o cada 2 semanas.'])}`,
      ctaBrowse: 'Encontrar servicios de limpieza cerca de ti', ctaReq: 'Publicar una solicitud de limpieza',
      upd: 'Actualizado en noviembre de 2026. Los precios son estimados nacionales de las fuentes de abajo y cambian según la zona y con el tiempo.',
      srcTitle: 'Fuentes', sources: [SRC.ttClean, SRC.hcpClean],
    },
  },
  {
    slugEn: 'water-heater-replacement-cost', slugEs: 'costo-cambiar-calentador-de-agua',
    service: 'Plumbing Pipe Repair', svcSlug: 'plumbing-pipe-repair',
    en: {
      title: 'How Much Does It Cost to Replace a Water Heater?',
      desc: 'Typical water heater replacement prices for tank, tankless and heat pump models, by tank size and fuel, plus labor, disposal and permit costs.',
      body: `<p>The price to replace a water heater depends mostly on the type of unit, its size and fuel, and how much work the installation needs. These national figures help you know what to expect before you call plumbers near you.</p>
<h2>Typical total cost (unit + installation)</h2>
<p>One guide puts the average installed cost at about <strong>$1,400</strong>, with most jobs between <strong>$900 and $3,000</strong>. Another reports that a new traditional tank usually costs <strong>$600 – $2,500</strong> installed, and a tankless unit <strong>$1,400 – $3,900</strong>.</p>
<h2>By type (installed)</h2>
${table(['Type', 'Typical range'], [['Tank', '$600 – $2,500'], ['Tankless', '$1,000 – $4,000'], ['Heat pump (hybrid)', '$1,200 – $4,600'], ['Indirect (connected to a boiler)', '$1,200 – $4,500'], ['Solar', '$1,700 – $5,500']])}
<h2>By tank size (installed)</h2>
${table(['Size', 'Typical range'], [['30 gallons', '$550 – $2,100'], ['40 gallons', '$550 – $2,300'], ['50 gallons', '$700 – $2,500'], ['75 gallons', '$1,100 – $3,400'], ['80 gallons', '$1,200 – $3,600']])}
<h2>By fuel (installed)</h2>
${table(['Fuel', 'Typical range'], [['Electric', '$500 – $3,500'], ['Natural gas', '$700 – $2,700'], ['Propane', '$700 – $2,500']])}
<h2>Labor and other costs</h2>
${table(['Item', 'Typical range'], [['Labor for a tank', '$150 – $450'], ['Labor for a tankless', '$600 – $1,900'], ['Switching from tank to tankless (labor)', '$150 – $2,500'], ['Plumber hourly rate', '$45 – $200 per hour'], ['Removing and hauling the old unit', '$75 – $500 (if charged separately)'], ['Permit', '$25 – $300 for most jobs; more when gas lines or electrical work are needed'], ['Power venting (fan + electrical)', '$300 – $1,000']])}
<h2>How long does a water heater last?</h2>
<p>A tank water heater usually lasts about <strong>10 – 15 years</strong>, and a tankless unit about <strong>20 years</strong>. If your tank is near that age, leaks, or makes rusty water, ask for a replacement quote along with the repair quote.</p>
<h2>What to ask before you hire</h2>
${ul(['Is the price for the unit and installation together, in writing?', 'Is removing the old water heater included?', 'Is a permit needed, and who gets it?', 'Will the new unit need new venting, a gas line or electrical work?', 'What warranty covers the unit and the labor?'])}`,
      ctaBrowse: 'Find plumbers near you', ctaReq: 'Post a water heater request',
      upd: 'Updated November 2026. Prices are national estimates from the sources below and change by location and over time.',
      srcTitle: 'Sources', sources: [SRC.fixrWh, SRC.nerdWh],
    },
    es: {
      title: '¿Cuánto cuesta cambiar el calentador de agua?',
      desc: 'Precios típicos para cambiar el calentador de agua de tanque, sin tanque (tankless) y de bomba de calor, según el tamaño y el combustible, más mano de obra, retiro y permisos.',
      body: `<p>El precio para cambiar el calentador de agua depende sobre todo del tipo de equipo, su tamaño y combustible, y de cuánto trabajo necesita la instalación. Estas cifras nacionales te ayudan a saber qué esperar antes de llamar a plomeros cerca de ti.</p>
<h2>Costo total típico (equipo + instalación)</h2>
<p>Una guía indica que el costo promedio ya instalado es de unos <strong>$1,400</strong>, y la mayoría de los trabajos cuesta entre <strong>$900 y $3,000</strong>. Otra guía reporta que un calentador de tanque nuevo normalmente cuesta <strong>$600 – $2,500</strong> instalado, y uno sin tanque <strong>$1,400 – $3,900</strong>.</p>
<h2>Según el tipo (instalado)</h2>
${table(['Tipo', 'Rango típico'], [['De tanque', '$600 – $2,500'], ['Sin tanque (tankless)', '$1,000 – $4,000'], ['Bomba de calor (híbrido)', '$1,200 – $4,600'], ['Indirecto (conectado a una caldera)', '$1,200 – $4,500'], ['Solar', '$1,700 – $5,500']])}
<h2>Según el tamaño del tanque (instalado)</h2>
${table(['Tamaño', 'Rango típico'], [['30 galones', '$550 – $2,100'], ['40 galones', '$550 – $2,300'], ['50 galones', '$700 – $2,500'], ['75 galones', '$1,100 – $3,400'], ['80 galones', '$1,200 – $3,600']])}
<h2>Según el combustible (instalado)</h2>
${table(['Combustible', 'Rango típico'], [['Eléctrico', '$500 – $3,500'], ['Gas natural', '$700 – $2,700'], ['Propano', '$700 – $2,500']])}
<h2>Mano de obra y otros costos</h2>
${table(['Concepto', 'Rango típico'], [['Mano de obra para uno de tanque', '$150 – $450'], ['Mano de obra para uno sin tanque', '$600 – $1,900'], ['Cambiar de tanque a sin tanque (mano de obra)', '$150 – $2,500'], ['Tarifa por hora del plomero', '$45 – $200 por hora'], ['Quitar y llevarse el calentador viejo', '$75 – $500 (si se cobra aparte)'], ['Permiso', '$25 – $300 en la mayoría de los casos; más si hay trabajo de gas o electricidad'], ['Ventilación forzada (ventilador + electricidad)', '$300 – $1,000']])}
<h2>¿Cuánto dura un calentador de agua?</h2>
<p>Un calentador de tanque normalmente dura unos <strong>10 – 15 años</strong>, y uno sin tanque unos <strong>20 años</strong>. Si el tuyo ya tiene esa edad, tiene fugas o sale agua oxidada, pide también un presupuesto para cambiarlo, además del de la reparación.</p>
<h2>Qué preguntar antes de contratar</h2>
${ul(['¿El precio incluye el equipo y la instalación, por escrito?', '¿Incluye quitar el calentador viejo?', '¿Se necesita permiso y quién lo saca?', '¿El equipo nuevo necesita ventilación, línea de gas o trabajo eléctrico nuevo?', '¿Qué garantía tienen el equipo y el trabajo?'])}`,
      ctaBrowse: 'Encontrar plomeros cerca de ti', ctaReq: 'Publicar una solicitud de calentador de agua',
      upd: 'Actualizado en noviembre de 2026. Los precios son estimados nacionales de las fuentes de abajo y cambian según la zona y con el tiempo.',
      srcTitle: 'Fuentes', sources: [SRC.fixrWh, SRC.nerdWh],
    },
  },
];

mkdirSync(join(root, 'guides'), { recursive: true });
mkdirSync(join(root, 'es', 'guias'), { recursive: true });
const urls = [];
const indexItems = { en: [], es: [] };

for (const g of guides) {
  const enUrl = `${SITE}/guides/${g.slugEn}.html`;
  const esUrl = `${SITE}/es/guias/${g.slugEs}.html`;
  const alt = `<link rel="alternate" hreflang="en" href="${enUrl}"><link rel="alternate" hreflang="es" href="${esUrl}"><link rel="alternate" hreflang="x-default" href="${enUrl}">`;
  for (const lang of ['en', 'es']) {
    const c = g[lang];
    const isEs = lang === 'es';
    const url = isEs ? esUrl : enUrl;
    const browse = isEs ? `/contractor.html?service=${encodeURIComponent(g.service)}&lang=es` : `/contractor.html?service=${encodeURIComponent(g.service)}`;
    const req = `/requests.html?post=1&service=${encodeURIComponent(g.service)}${isEs ? '&lang=es' : ''}`;
    const svcPage = isEs ? `/es/servicios/${g.svcSlug}.html` : `/services/${g.svcSlug}.html`;
    const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: c.title, description: c.desc, inLanguage: lang, dateModified: '2026-10-30', publisher: { '@type': 'Organization', name: 'TexContractor', url: SITE }, mainEntityOfPage: url };
    const html = `<!doctype html>
<html lang="${lang}"><head>${adsTag}<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.title)} | TexContractor</title><meta name="description" content="${esc(c.desc)}">
<meta name="robots" content="index,follow"><link rel="canonical" href="${url}">${alt}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${css}</style></head><body>
<header>${isEs ? `<a class="tc-lang" href="/guides/${g.slugEn}.html" hreflang="en" lang="en">English</a>` : `<a class="tc-lang" href="/es/guias/${g.slugEs}.html" hreflang="es" lang="es">Español</a>`}<a href="/">TexContractor</a> / <a href="${isEs ? '/es/guias/' : '/guides/'}">${isEs ? 'Guías' : 'Guides'}</a></header>
<main><h1>${esc(c.title)}</h1>
<p class="upd">${esc(c.upd)}</p>
${c.body}
<div class="ctas"><a href="${esc(browse)}">${esc(c.ctaBrowse)}</a><a class="req" href="${esc(req)}">${esc(c.ctaReq)}</a></div>
<p><a href="${svcPage}">${isEs ? 'Más sobre este servicio' : 'More about this service'}</a></p>
<h2>${esc(c.srcTitle)}</h2>
<ul class="src">${c.sources.map(([t, u]) => `<li><a href="${u}" rel="nofollow noopener" target="_blank">${esc(t)}</a></li>`).join('')}</ul>
</main><footer><a href="${isEs ? '/es/servicios/' : '/services/'}">${isEs ? 'Ver todos los servicios' : 'Browse all services'}</a></footer></body></html>`;
    writeFileSync(join(root, isEs ? 'es/guias' : 'guides', `${isEs ? g.slugEs : g.slugEn}.html`), html);
    urls.push(url);
    indexItems[lang].push(`<li><a href="/${isEs ? 'es/guias' : 'guides'}/${isEs ? g.slugEs : g.slugEn}.html">${esc(c.title)}</a> — ${esc(c.desc)}</li>`);
  }
}

const indexPage = (lang) => {
  const isEs = lang === 'es';
  const t = isEs ? 'Guías de precios para tu casa' : 'Home Service Cost Guides';
  const d = isEs ? 'Precios típicos de servicios para el hogar y qué preguntar antes de contratar.' : 'Typical prices for home services and what to ask before you hire.';
  return `<!doctype html><html lang="${lang}"><head>${adsTag}<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t} | TexContractor</title><meta name="description" content="${d}"><link rel="canonical" href="${SITE}/${isEs ? 'es/guias' : 'guides'}/"><link rel="alternate" hreflang="en" href="${SITE}/guides/"><link rel="alternate" hreflang="es" href="${SITE}/es/guias/"><style>${css}</style></head><body><header>${isEs ? '<a class="tc-lang" href="/guides/" hreflang="en" lang="en">English</a>' : '<a class="tc-lang" href="/es/guias/" hreflang="es" lang="es">Español</a>'}<a href="/">TexContractor</a></header><main><h1>${t}</h1><p>${d}</p><ul>${indexItems[lang].join('')}</ul></main></body></html>`;
};
writeFileSync(join(root, 'guides', 'index.html'), indexPage('en'));
writeFileSync(join(root, 'es', 'guias', 'index.html'), indexPage('es'));
urls.unshift(`${SITE}/guides/`, `${SITE}/es/guias/`);
writeFileSync(join(root, 'sitemap-guides.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') + '\n</urlset>\n');
// Link each guide from its service pages (run after build-es-and-request-cta.mjs).
for (const g of guides) {
  for (const [file, href, label] of [[join(root, 'services', g.svcSlug + '.html'), `/guides/${g.slugEn}.html`, g.en.title], [join(root, 'es', 'servicios', g.svcSlug + '.html'), `/es/guias/${g.slugEs}.html`, g.es.title]]) {
    let h = readFileSync(file, 'utf8').replace(/<!--tc-guide-->[\s\S]*?<!--\/tc-guide-->/g, '');
    h = h.replace('</main>', `<!--tc-guide--><p>📘 <a href="${href}">${esc(label)}</a></p><!--/tc-guide--></main>`);
    writeFileSync(file, h);
  }
}
const robots = readFileSync(join(root, 'robots.txt'), 'utf8');
if (!robots.includes('sitemap-guides.xml')) writeFileSync(join(root, 'robots.txt'), robots.trimEnd() + '\nSitemap: https://texcontractor.com/sitemap-guides.xml\n');
console.log('Guides built:', urls.length);

// Re-apply the shared logo header/footer to all service pages and guides.
import('node:child_process').then(({ execSync }) => execSync('node scripts/brand-pages.mjs', { stdio: 'inherit' }));
