export const preconfiguredTemplates = [
  {
    id: 'template_lead_capture',
    name: 'Captura de Leads y Calificación',
    description: 'Automatiza la prospección de nuevos clientes preguntándoles su nombre, correo e interés comercial con retrasos humanos simulados.',
    tierRequirement: 'FREE',
    icon: '👤',
    nodes: [
      {
        id: 'node-trigger',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { label: 'Mensaje Entrante' },
      },
      {
        id: 'node-welcome',
        type: 'message',
        position: { x: 250, y: 180 },
        data: { message: '¡Hola! Gracias por escribirnos a RedWire System. 🚀\n\n¿Con quién tengo el gusto de hablar hoy?' },
      },
      {
        id: 'node-delay1',
        type: 'delay',
        position: { x: 250, y: 340 },
        data: { delay: 3 },
      },
      {
        id: 'node-ask-details',
        type: 'message',
        position: { x: 250, y: 460 },
        data: { message: '¡Mucho gusto! 😊\n\nPara poder ayudarte mejor, por favor escribe tu correo electrónico y descríbeme brevemente tu tipo de negocio.' },
      },
      {
        id: 'node-delay2',
        type: 'delay',
        position: { x: 250, y: 620 },
        data: { delay: 4 },
      },
      {
        id: 'node-confirmation',
        type: 'message',
        position: { x: 250, y: 740 },
        data: { message: '¡Excelente, información capturada con éxito! ✅\n\nHe enviado estos detalles a nuestro equipo comercial. Se pondrán en contacto contigo por este mismo canal en unos minutos. ¡Ten un excelente día!' },
      }
    ],
    edges: [
      { id: 'edge-1', source: 'node-trigger', target: 'node-welcome', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-2', source: 'node-welcome', target: 'node-delay1', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-3', source: 'node-delay1', target: 'node-ask-details', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-4', source: 'node-ask-details', target: 'node-delay2', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-5', source: 'node-delay2', target: 'node-confirmation', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } }
    ]
  },
  {
    id: 'template_restaurant_menu',
    name: 'Auto-servicio Comercial & Soporte',
    description: 'Muestra un catálogo con imágenes, horarios o deriva clientes a un asesor humano según el botón que presionen.',
    tierRequirement: 'STANDARD',
    icon: '🍔',
    nodes: [
      {
        id: 'node-trigger',
        type: 'trigger',
        position: { x: 350, y: 50 },
        data: { label: 'Mensaje Entrante' },
      },
      {
        id: 'node-menu',
        type: 'interactive',
        position: { x: 350, y: 180 },
        data: { 
          message: '¡Hola! Bienvenido al asistente inteligente de RedWire System. 🍔🍕\n\nPor favor selecciona una opción del menú para comenzar:', 
          buttons: [
            { id: 'btn-catalogo', text: 'Ver Catálogo 📂' }, 
            { id: 'btn-horario', text: 'Horarios y Ubicación ⏰' }, 
            { id: 'btn-asesor', text: 'Asesor Humano 👤' }
          ] 
        },
      },
      {
        id: 'node-catalog',
        type: 'media',
        position: { x: 50, y: 450 },
        data: { 
          caption: '¡Este es nuestro catálogo de especialidades! 🍕🍔\n\nPuedes indicarnos qué platos deseas ordenar para tomártelo.', 
          mediaUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600' 
        },
      },
      {
        id: 'node-hours',
        type: 'message',
        position: { x: 370, y: 450 },
        data: { message: '📍 Ubicación: Av. Central 123, Frankfurt.\n⏰ Horarios: Lunes a Domingo de 12:00 PM a 11:00 PM.\n\n¡Te esperamos con el mejor sabor!' },
      },
      {
        id: 'node-human',
        type: 'message',
        position: { x: 690, y: 450 },
        data: { message: 'Entendido. Un asesor de carne y hueso se unirá a este chat de inmediato. 👤\n\nPor favor, aguarda un instante...' },
      }
    ],
    edges: [
      { id: 'edge-1', source: 'node-trigger', target: 'node-menu', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-btn1', source: 'node-menu', sourceHandle: 'btn-catalogo', target: 'node-catalog', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-btn2', source: 'node-menu', sourceHandle: 'btn-horario', target: 'node-hours', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-btn3', source: 'node-menu', sourceHandle: 'btn-asesor', target: 'node-human', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } }
    ]
  },
  {
    id: 'template_vip_campaign',
    name: 'Fidelización VIP & Filtros Inteligentes',
    description: 'Combina menús interactivos, soporte multimedia en HD e inteligencia condicional (If/Else) para autorizar accesos exclusivos.',
    tierRequirement: 'VIP',
    icon: '💎',
    nodes: [
      {
        id: 'node-trigger',
        type: 'trigger',
        position: { x: 350, y: 50 },
        data: { label: 'Mensaje Entrante' },
      },
      {
        id: 'node-vip-welcome',
        type: 'interactive',
        position: { x: 350, y: 180 },
        data: { 
          message: '💎 ¡Hola! Bienvenido al Club VIP de RedWire.\n\nTenemos beneficios exclusivos para ti hoy. ¿Qué deseas realizar?', 
          buttons: [
            { id: 'btn-promo', text: 'Mis Beneficios 🎁' }, 
            { id: 'btn-valida', text: 'Validar Membresía 🔑' }
          ] 
        },
      },
      {
        id: 'node-card-media',
        type: 'media',
        position: { x: 100, y: 450 },
        data: { 
          caption: 'Aquí tienes tu tarjeta de beneficios virtuales VIP de RedWire. 💎\n\nDisfruta de un 20% de descuento automático en tus suscripciones.', 
          mediaUrl: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?q=80&w=600' 
        },
      },
      {
        id: 'node-prompt-code',
        type: 'message',
        position: { x: 450, y: 450 },
        data: { message: 'Para validar tu membresía VIP, por favor escribe tu CÓDIGO de acceso secreto de 8 dígitos en tu próximo mensaje:' },
      },
      {
        id: 'node-check-code',
        type: 'condition',
        position: { x: 450, y: 600 },
        data: { keyword: 'GOLD-2026' },
      },
      {
        id: 'node-authorized',
        type: 'message',
        position: { x: 300, y: 780 },
        data: { message: '¡Acceso Autorizado! 🟢 Has sido conectado al canal de soporte prioritario 24/7. En breve te atenderemos.' },
      },
      {
        id: 'node-unauthorized',
        type: 'message',
        position: { x: 600, y: 780 },
        data: { message: 'Código de acceso inválido o caducado. 🔴 Por favor, contacta a facturación para renovar tu membresía VIP.' },
      }
    ],
    edges: [
      { id: 'edge-1', source: 'node-trigger', target: 'node-vip-welcome', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-btn-p', source: 'node-vip-welcome', sourceHandle: 'btn-promo', target: 'node-card-media', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-btn-v', source: 'node-vip-welcome', sourceHandle: 'btn-valida', target: 'node-prompt-code', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-to-check', source: 'node-prompt-code', target: 'node-check-code', animated: true, style: { stroke: '#FF0033', strokeWidth: 2 } },
      { id: 'edge-match', source: 'node-check-code', sourceHandle: 'match', target: 'node-authorized', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
      { id: 'edge-unmatch', source: 'node-check-code', sourceHandle: 'unmatch', target: 'node-unauthorized', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } }
    ]
  }
];
