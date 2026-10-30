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
    'Quote': 'Presupuesto',
    'List your service': 'Publica tu servicio',
    'Share this profile': 'Compartir este perfil',
    'Share my profile': 'Compartir mi perfil',
    'View my public profile': 'Ver mi perfil público',
    'Send your profile to customers so they can text you directly for a quote.': 'Envía tu perfil a tus clientes para que te escriban directamente y pidan un presupuesto.',
    'Link copied. Paste it in a text, WhatsApp or Facebook.': 'Enlace copiado. Pégalo en un mensaje, WhatsApp o Facebook.',
    'Sign up to text technicians directly.': 'Regístrate para enviar mensajes directos a los técnicos.',
    'Sign up to receive customer requests by text message.': 'Regístrate para recibir solicitudes de clientes por mensaje de texto.',
    'Sign up to text technicians directly or receive customer requests': 'Regístrate para enviar mensajes a técnicos o recibir solicitudes de clientes',
    'Local provider': 'Proveedor local',
    'Profile': 'Perfil',
    'Text directly — no middleman': 'Envía un mensaje directo, sin intermediarios',
    'Text for a quote': 'Envía un mensaje para presupuesto',
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
    'Barber & Hair Styling Services': 'Servicios de barbería y peinado',
    'Requests': 'Solicitudes',
    'Customer requests': 'Solicitudes de clientes',
    'Sign in to post a service or contact a contractor.': 'Inicia sesión para publicar un servicio o contactar a un contratista.',
    'Share TexContractor': 'Compartir TexContractor',
    'Choose a platform to share the site.': 'Elige una plataforma para compartir el sitio.',
    'Message': 'Mensaje',
    'Post or share': 'Publicar o compartir',
    'Post': 'Publicar',
    'Email': 'Correo',
    'Send link': 'Enviar enlace',
    'Copy address': 'Copiar dirección',
    'Phone sharing': 'Compartir por teléfono',
    '📋 NEW': '📋 NUEVO',
    'NEW': 'NUEVO',
    'Need a job done? Post a request with photos and get offers from local technicians.': '¿Necesitas un trabajo? Publica una solicitud con fotos y recibe ofertas de técnicos locales.',
    'Post a request': 'Publicar una solicitud',
    'See requests': 'Ver solicitudes',
    'Add my service': 'Publicar mi servicio',
    'For technicians': 'Para técnicos',
    'Get local customers by text': 'Recibe clientes locales por mensaje',
    'Add your service and customers in your area text you directly. No fees per lead.': 'Publica tu servicio y los clientes de tu zona te escriben directo. Sin pagar por cada cliente.',
    'Add my service →': 'Publicar mi servicio →',
    'For customers': 'Para clientes',
    'Find a local pro near you': 'Encuentra un profesional cerca de ti',
    'Search by service and city, then text the technician directly.': 'Busca por servicio y ciudad, y escríbele directo al técnico.',
    'Find a service →': 'Buscar un servicio →',
    'Password': 'Contraseña',
    'At least 6 characters, including a letter and a number.': 'Al menos 6 caracteres, con una letra y un número.',
    'Create account & continue': 'Crear cuenta y continuar',
    'Already have an account?': '¿Ya tienes una cuenta?',
    'Browse services': 'Ver servicios',
    'Create account': 'Crear cuenta',
    'Create an account': 'Crear una cuenta',
    'New here?': '¿Eres nuevo?',
    'or': 'o',
    '📍 Choose a city or ZIP code': '📍 Elige una ciudad o código postal',
    '↗ Share This Card': '↗ Compartir esta tarjeta',
    'Share This Card': 'Compartir esta tarjeta',
    '↗ Share This Card ': '↗ Compartir esta tarjeta',
    'General Automotive Services: Towing, Key Programming, Window Tinting & Tire Services': 'Servicios automotrices: grúa, programación de llaves, polarizado y llantas',
    'Childcare & In-Home Safety': 'Cuidado infantil y seguridad en casa',
    'Need a babysitter tonight?': '¿Necesitas niñera esta noche?',
    'AC quit in the Texas heat?': '¿Se descompuso el aire con este calor?',
    'How to list your service free': 'Cómo publicar tu servicio gratis',
    'Car won\'t start? Text a mechanic': '¿No arranca el carro? Escríbele a un mecánico',
    'Tired of paying for leads?': '¿Cansado de pagar por clientes?',
    'No app needed: add it to your Home Screen': 'Sin app: agrégalo a tu pantalla de inicio',
    'Watch our videos, explore photos and updates, and discover how TexContractor works through community experiences.': 'Mira nuestros videos, fotos y novedades, y descubre cómo funciona TexContractor con experiencias de la comunidad.',
    'Browse services by city': 'Ver servicios por ciudad',
    'Add to Your Phone': 'Agrégalo a tu teléfono',
    '© 2026 TexContractor. All rights reserved.': '© 2026 TexContractor. Todos los derechos reservados.',
    'Enter city, state, or ZIP code...': 'Escribe ciudad, estado o código postal...',
    'Enter city, state, or ZIP code': 'Escribe ciudad, estado o código postal',
    'Sign in or sign out': 'Iniciar o cerrar sesión',
    'Share on media': 'Compartir en redes',
    'Create your TexContractor account': 'Crea tu cuenta de TexContractor',
    'Close registration window': 'Cerrar ventana de registro',
    'Choose how to get started': 'Elige cómo empezar',
    'List your service (for technicians)': 'Publica tu servicio (para técnicos)',
    'My profile': 'Mi perfil',
    'Technicians: build customer trust': 'Técnicos: generen confianza con sus clientes',
    'Discover TexContractor →': 'Descubre TexContractor →',
    'Discover TexContractor': 'Descubre TexContractor',
    'Website Features': 'Funciones del sitio',
    'Videos': 'Videos',
    'Support & Help': 'Soporte y ayuda',
    'Legal & Privacy': 'Legal y privacidad',
    'Copyright Complaints': 'Reclamos de derechos de autor',
    'Accessibility': 'Accesibilidad',
    'About & Media': 'Acerca de y redes',
    'How it works videos': 'Videos de cómo funciona',
    'TexContractor home': 'Inicio de TexContractor',
    'Text Contractor home': 'Inicio de TexContractor',
    'Contractors in your state': 'Contratistas en tu estado',
    'Review provider profiles, then text the contractor directly with a short description of your problem.': 'Revisa los perfiles y luego escríbele directo al contratista con una breve descripción de tu problema.',
    'Know someone who needs reliable local help?': '¿Conoces a alguien que necesite ayuda local confiable?',
    'Share the TexContractor card with any person.': 'Comparte la tarjeta de TexContractor con quien quieras.',
    'Call': 'Llamar',
    'Text': 'Mensaje',
    'Chat': 'Chat',
    'View profile': 'Ver perfil',
    'Text this contractor': 'Enviar mensaje a este contratista',
    'Report this contractor': 'Reportar este contratista',
    'How it works': 'Cómo funciona',
    'Choose the service you need.': 'Elige el servicio que necesitas.',
    'TexContractor · Local help by text': 'TexContractor · Ayuda local por mensaje',
    'Reason': 'Motivo',
    'Choose a reason': 'Elige un motivo',
    'Fake or not a real professional': 'Falso o no es un profesional real',
    'Does not reply to messages': 'No responde los mensajes',
    'Misleading profile or photos': 'Perfil o fotos engañosos',
    'Unsafe, abusive, or inappropriate behavior': 'Comportamiento inseguro, abusivo o inapropiado',
    'Offers services unrelated to this site': 'Ofrece servicios que no tienen que ver con este sitio',
    'This is my phone number – I never signed up': 'Este es mi número y nunca me registré',
    'Other': 'Otro',
    'Additional details (optional)': 'Detalles adicionales (opcional)',
    'Tell us what happened.': 'Cuéntanos qué pasó.',
    'Block this contractor on this device': 'Bloquear este contratista en este dispositivo',
    'To remove your number from every listing right away, use': 'Para quitar tu número de todos los anuncios de inmediato, usa',
    'Remove my phone number': 'Quitar mi número de teléfono',
    'Send report': 'Enviar reporte',
    'Cancel': 'Cancelar',
    'Call this contractor': 'Llamar a este contratista',
    'Chat with this contractor on TexContractor': 'Chatear con este contratista en TexContractor',
    'Texas flag': 'Bandera de Texas',
    '← Back to results': '← Volver a resultados',
    'Chat on TexContractor': 'Chatear en TexContractor',
    'Photos of the contractor’s work or illustrative images representing the services they offer.': 'Fotos del trabajo del contratista o imágenes ilustrativas de los servicios que ofrece.',
    'These photos may represent the services offered. For more information, text the contractor directly.': 'Estas fotos pueden representar los servicios ofrecidos. Para más información, escríbele directo al contratista.',
    'Text Contractor': 'Enviar mensaje',
    'This contractor will no longer appear in your results on this device.': 'Este contratista ya no aparecerá en tus resultados en este dispositivo.',
    '← Back to services': '← Volver a servicios',
    'Sign in with your email first, then add your service so customers can find your profile and text you about the work they need.': 'Primero inicia sesión con tu correo y luego añade tu servicio para que los clientes encuentren tu perfil y te escriban sobre el trabajo que necesitan.',
    'Your services': 'Tus servicios',
    'Each technician can list up to 2 services. You can change or delete a service at any time.': 'Cada técnico puede publicar hasta 2 servicios. Puedes cambiar o borrar un servicio cuando quieras.',
    'You already have 2 services — the maximum. To offer something else, change or delete one of your services above.': 'Ya tienes 2 servicios, el máximo. Para ofrecer otra cosa, cambia o borra uno de tus servicios arriba.',
    'Adding another service? Your name, phone and city are filled in from your first listing. Just choose the new service below and publish.': '¿Añades otro servicio? Tu nombre, teléfono y ciudad se llenan desde tu primer anuncio. Solo elige el nuevo servicio abajo y publica.',
    'Your name or nickname': 'Tu nombre o apodo',
    'Shown on your listing. Use your real name or a nickname. Individual technicians only.': 'Se muestra en tu anuncio. Usa tu nombre real o un apodo. Solo técnicos individuales.',
    'Mobile number': 'Número de celular',
    'A mobile number that can receive texts — not a landline.': 'Un celular que reciba mensajes de texto, no un teléfono fijo.',
    'Years of experience': 'Años de experiencia',
    'Optional': 'Opcional',
    '(optional)': '(opcional)',
    'Choose years (optional)': 'Elige los años (opcional)',
    'Choose a state': 'Elige un estado',
    'Choose a city after selecting the state.': 'Elige una ciudad después de elegir el estado.',
    'Choose a state first': 'Primero elige un estado',
    'Other city': 'Otra ciudad',
    'Type your city if it is not listed.': 'Escribe tu ciudad si no aparece.',
    'City name': 'Nombre de la ciudad',
    'Your service': 'Tu servicio',
    'Type a word to narrow the list, then choose.': 'Escribe una palabra para filtrar la lista y luego elige.',
    'e.g. plumb, AC, clean, lock': 'ej. plomería, aire, limpieza, cerradura',
    'Optional. If you leave it empty, your listing will say: "Contact [your name] directly for [service] in [city]. Send a text to get a quote."': 'Opcional. Si lo dejas vacío, tu anuncio dirá: "Contacta a [tu nombre] directamente para [servicio] en [ciudad]. Envía un mensaje para pedir un presupuesto."',
    'Upload one clear photo of yourself. This is the photo customers see beside your name; it is separate from your work photos.': 'Sube una foto clara tuya. Es la foto que los clientes ven junto a tu nombre; es distinta de las fotos de tu trabajo.',
    'Choose your profile picture': 'Elige tu foto de perfil',
    'Colored initials (first two letters of your name)': 'Iniciales de color (primeras dos letras de tu nombre)',
    'Upload from my device or phone': 'Subir desde mi dispositivo o teléfono',
    'Choose from saved TexContractor images': 'Elegir entre imágenes guardadas de TexContractor',
    'No saved profile images are available for this service yet. Upload your own image or use colored initials.': 'Todavía no hay imágenes guardadas para este servicio. Sube tu propia imagen o usa iniciales de color.',
    'Upload up to 10 photos of completed work. These images appear in your public profile.': 'Sube hasta 10 fotos de trabajos terminados. Estas imágenes aparecen en tu perfil público.',
    'Publish my service': 'Publicar mi servicio',
    'e.g. Mike Johnson or Mike J.': 'ej. Mike Johnson o Mike J.',
    'Enter a phone number only, not a website or other text': 'Escribe solo un número de teléfono, no una página web u otro texto',
    'Optional — e.g. 10 years of experience, licensed and insured, free estimates.': 'Opcional — ej. 10 años de experiencia, con licencia y seguro, presupuestos gratis.',
    'and': 'y',
    ', and have read the': ', y he leído la',
    'US mobile number': 'Celular de EE. UU.',
    'Contact phone': 'Teléfono de contacto',
    'Show cities': 'Mostrar ciudades',
    'Free account — no fees, no middleman': 'Cuenta gratis, sin comisiones ni intermediarios',
    'Text or call local technicians directly': 'Escribe o llama directo a técnicos locales',
    'Technicians: get customer requests by text message': 'Técnicos: reciban solicitudes de clientes por mensaje de texto',
    'Email me a sign-in link': 'Envíame un enlace de acceso',
    'For an existing account without a password, use Google or a sign-in link.': 'Si tu cuenta no tiene contraseña, usa Google o un enlace de acceso.',
    'Create account or sign in': 'Crear cuenta o iniciar sesión',
    'Sign in to your saved account.': 'Inicia sesión en tu cuenta guardada.',
    'Manage your photo and personal information.': 'Administra tu foto y tu información personal.',
    'Change profile photo': 'Cambiar foto de perfil',
    'JPG, PNG or WebP, up to 5 MB. Your profile photo may be visible on your public service profile.': 'JPG, PNG o WebP, hasta 5 MB. Tu foto de perfil puede verse en tu perfil público de servicio.',
    'Your name': 'Tu nombre',
    'Save my details': 'Guardar mis datos',
    'Find a local service': 'Buscar un servicio local',
    'Add or complete my service profile': 'Añadir o completar mi perfil de servicio',
    'Choose or type your city': 'Elige o escribe tu ciudad',
    'Private messages stay inside TexContractor. Members can contact the administration, and the administration can reply from the protected dashboard.': 'Los mensajes privados se quedan dentro de TexContractor. Los miembros pueden contactar a la administración y la administración puede responder desde el panel protegido.',
    'No messages yet. Start a private conversation.': 'Aún no hay mensajes. Empieza una conversación privada.',
    'Write your message…': 'Escribe tu mensaje…',
    'TexContractor Support': 'Soporte de TexContractor',
    'Find a technician': 'Buscar un técnico',
    '📋 CUSTOMER REQUESTS': '📋 SOLICITUDES DE CLIENTES',
    'Tell local technicians what you need': 'Cuéntales a los técnicos locales lo que necesitas',
    'Post your job with up to 4 photos. Technicians in your area send you offers on TexContractor. You choose how they contact you: chat, text, or call.': 'Publica tu trabajo con hasta 4 fotos. Los técnicos de tu zona te envían ofertas en TexContractor. Tú eliges cómo te contactan: chat, mensaje de texto o llamada.',
    '1 · Post your request': '1 · Publica tu solicitud',
    '2 · Get up to 5 offers': '2 · Recibe hasta 5 ofertas',
    '3 · Reply to the one you like': '3 · Responde a la que te guste',
    '4 · Close the request': '4 · Cierra la solicitud',
    '＋ Post your request': '＋ Publica tu solicitud',
    'Post your request': 'Publica tu solicitud',
    'All services': 'Todos los servicios',
    'All states': 'Todos los estados',
    'All cities': 'Todas las ciudades',
    'My requests': 'Mis solicitudes',
    'Need something done?': '¿Necesitas un trabajo?',
    'Describe the job, add photos, and get up to 5 offers from local technicians.': 'Describe el trabajo, agrega fotos y recibe hasta 5 ofertas de técnicos locales.',
    'No open requests match these filters right now.': 'Ahora no hay solicitudes abiertas con estos filtros.',
    'Load more': 'Ver más',
    'TexContractor ·': 'TexContractor ·',
    'Takes about one minute.': 'Toma como un minuto.',
    'Service': 'Servicio',
    'Title': 'Título',
    'What do you need?': '¿Qué necesitas?',
    'Photos (up to 4)': 'Fotos (hasta 4)',
    'Photos help technicians give you an accurate offer.': 'Las fotos ayudan a los técnicos a darte una oferta precisa.',
    'How can technicians contact you?': '¿Cómo pueden contactarte los técnicos?',
    '💬 Chat on TexContractor': '💬 Chat en TexContractor',
    'phone stays private': 'tu teléfono queda privado',
    '✉ Text message': '✉ Mensaje de texto',
    'shows your number': 'muestra tu número',
    '📞 Phone call': '📞 Llamada',
    'Your mobile number': 'Tu número de celular',
    '🔒 With Chat, your number stays private. If you choose Text or Call, your number is shown only to signed-in technicians, never to visitors or search engines, and it is hidden as soon as you close your request. Your title, description, city and photos are public.': '🔒 Con el chat, tu número queda privado. Si eliges mensaje de texto o llamada, tu número solo lo ven técnicos con sesión iniciada, nunca visitantes ni buscadores, y se oculta en cuanto cierras tu solicitud. Tu título, descripción, ciudad y fotos son públicos.',
    '💬 Offers arrive in your Messages.': '💬 Las ofertas llegan a tus Mensajes.',
    '✓ Close your request when you find the right technician.': '✓ Cierra tu solicitud cuando encuentres al técnico indicado.',
    'Post request': 'Publicar solicitud',
    'Send an offer': 'Enviar una oferta',
    'Your offer arrives in the customer\'s Messages.': 'Tu oferta llega a los Mensajes del cliente.',
    'Your offer': 'Tu oferta',
    'Send offer': 'Enviar oferta',
    'Type your city': 'Escribe tu ciudad',
    'e.g. Leak under the kitchen sink': 'ej. Fuga debajo del fregadero',
    'Describe the job, size, and when you need it…': 'Describe el trabajo, el tamaño y para cuándo lo necesitas…',
    'Add photos': 'Agregar fotos',
    'When you can do it, an estimated price, and anything you need to know…': 'Cuándo puedes hacerlo, un precio aproximado y lo que necesites saber…',
    'View': 'Ver',
    'Edit': 'Editar',
    'Close request': 'Cerrar solicitud',
    'Remove': 'Quitar',
    'closed': 'cerrada',
    'Offers': 'Ofertas',
    'Send an offer ': 'Enviar una oferta',
    'Remove this closed request from your list?': '¿Quitar esta solicitud cerrada de tu lista?'
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
  let currentLanguage = 'en';
  try { currentLanguage = localStorage.getItem('texcontractor-language') || 'en'; } catch (_) {}
  // Spanish landing pages link here with ?lang=es so the directory opens in Spanish.
  const requestedLang = pageUrl.searchParams.get('lang');
  if (requestedLang === 'es' || requestedLang === 'en') {
    currentLanguage = requestedLang;
    try { localStorage.setItem('texcontractor-language', currentLanguage); } catch (_) {}
  }
  let applying = false;
  let observer = null;

  function remember(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName) && !originalText.has(node)) {
        originalText.set(node, node.nodeValue);
      }
    }
    const withAttrs = [...(root.querySelectorAll?.('[placeholder],[title],[aria-label]') || [])];
    if (root.matches?.('[placeholder],[title],[aria-label]')) withAttrs.push(root);
    withAttrs.forEach((el) => {
      if (!originalAttrs.has(el)) originalAttrs.set(el, { placeholder: el.getAttribute('placeholder'), title: el.getAttribute('title'), 'aria-label': el.getAttribute('aria-label') });
    });
  }

  const svcEs = (s) => serviceTranslations[s] || s;
  const yearsEs = (n) => n + (n === '1' ? ' año' : ' años');
  const patterns = [
    [/^(\d+) years?$/, (m) => yearsEs(m[1])],
    [/^(.+), ([A-Z]{2}) · (\d+) years?$/, (m) => `${m[1]}, ${m[2]} · ${yearsEs(m[3])}`],
    [/^(.+) contractors near you$/, (m) => `${svcEs(m[1])}: contratistas cerca de ti`],
    [/^(.+), ([A-Z]{2}) · (.+)$/, (m) => serviceTranslations[m[3]] ? `${m[1]}, ${m[2]} · ${svcEs(m[3])}` : null],
    [/^· Contractor profile$/, () => '· Perfil del contratista'],
    [/^(.+) · Contractor profile$/, (m) => `${svcEs(m[1])} · Perfil del contratista`],
    [/^Showing (\d+) matching contractors? in ([A-Z]{2})\. (.+?) listings appear first; other cities are ordered by available Census \d+ straight-line city distances \(otherwise alphabetically\)\. Confirm travel availability and fees directly\.$/,
      (m) => `Mostrando ${m[1]} contratista${m[1] === '1' ? '' : 's'} en ${m[2]}. Primero aparecen los de ${m[3]}; las demás ciudades se ordenan por distancia. Confirma directamente si viajan a tu zona y sus tarifas.`],
    [/^· (\d+) open requests?$/, (m) => `· ${m[1]} solicitud${m[1] === '1' ? '' : 'es'} abierta${m[1] === '1' ? '' : 's'}`],
    [/^\((\d+) of (\d+)\)$/, (m) => `(${m[1]} de ${m[2]})`],
    [/^(\d+) of (\d+) work photos selected$/, (m) => `${m[1]} de ${m[2]} fotos de trabajo seleccionadas`],
    [/^(.+) · (.+), ([A-Z]{2}) · (\d+) offers? · (.+)$/, (m) => `${svcEs(m[1])} · ${m[2]}, ${m[3]} · ${m[4]} oferta${m[4] === '1' ? '' : 's'} · ${m[5] === 'closed' ? 'cerrada' : m[5].replace(/^closes in (\d+) days?$/, (x, d) => `cierra en ${d} día${d === '1' ? '' : 's'}`)}`],
    [/^Signed in as (.+)$/, (m) => `Sesión iniciada como ${m[1]}`],
    [/^Call ([A-Z][\w.'’-]*(?: [A-Z][\w.'’-]*)*)$/, (m) => `Llamar a ${m[1]}`],
    [/^Text ([A-Z][\w.'’-]*(?: [A-Z][\w.'’-]*)*)$/, (m) => `Enviar mensaje a ${m[1]}`],
    [/^Chat with ([A-Z][\w.'’-]*(?: [A-Z][\w.'’-]*)*)$/, (m) => `Chatear con ${m[1]}`],
    [/^Your name, city, state, service, description and photos are shown on your public listing\./, () => 'Tu nombre, ciudad, estado, servicio, descripción y fotos se muestran en tu anuncio público. Tu número de teléfono no aparece en la página: los clientes con sesión iniciada te contactan con los botones de contacto.'],
    [/^This is my mobile number and I can reply to customer texts\./, () => 'Este es mi celular y puedo responder los mensajes de los clientes. Acepto recibir un código de verificación único por mensaje de texto a este número (pueden aplicar tarifas de mensajes y datos), acepto los']
  ];
  function translateText(value) {
    const clean = value.trim();
    if (currentLanguage === 'en') return value;
    const translated = serviceTranslations[clean] || translations[clean];
    if (translated) return value.replace(clean, translated);
    for (const [re, fn] of patterns) {
      const m = clean.match(re);
      if (m) { const out = fn(m); if (out) return value.replace(clean, out); }
    }
    return value;
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
    // Drop the mutation records caused by our own translation writes.
    if (observer) observer.takeRecords();
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
    observer = new MutationObserver((mutations) => {
      if (applying) return;
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          // The page changed this text itself (e.g. after loading data): use it as the new original.
          const node = mutation.target;
          if (node.parentElement && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName)) originalText.set(node, node.nodeValue);
        } else if (mutation.type === 'attributes') {
          const el = mutation.target, key = mutation.attributeName, saved = originalAttrs.get(el) || {};
          saved[key] = el.getAttribute(key);
          originalAttrs.set(el, saved);
        } else {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) remember(node);
            else if (node.nodeType === 3 && node.parentElement) originalText.set(node, node.nodeValue);
          });
        }
      }
      applyLanguage();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] });
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
