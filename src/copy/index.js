// ============================================================
// YAKUZA HOUSE — Todos los textos de la web en un solo lugar.
// Voz de marca: autoridad, lujo, misterio, solemnidad.
// Lo configurable desde admin (hero, sorteo) tiene aquí sus fallbacks.
// ============================================================

export const copy = {
  brand: {
    name: 'YAKUZA HOUSE',
    short: 'YH',
    tagline: 'Findom & Fetish Boutique',
    taglineFormal: 'La Casa de la Princesa',
  },

  nav: {
    home: 'Inicio',
    store: 'La Tienda',
    giveaway: 'Grand Opening',
    contact: 'Contacto',
    cart: 'Cesta',
    orderLookup: 'Consultar Pedido',
    admin: 'Panel de la Casa',
  },

  hero: {
    // Fallbacks si el admin no rellena el banner
    badge: 'Boutique Findom & Fetish Exclusiva',
    titleTop: 'YAKUZA',
    titleBottom: 'HOUSE',
    subtitle: 'Una Casa. Una Dueña. Un trono esperándote al final de la escalera.',
    cta: 'Entrar en la Casa',
    scrollHint: 'Desciende',
  },

  intro: {
    kicker: 'Atravesar esta puerta es una elección',
    title: 'La Casa',
    quote:
      'Mi saliva, las marcas en mis suelas, mis calcetines sudados tras una dura sesión o incluso mi repostería fina es un manjar reservado para alguien inferior como tú. Me encanta complacerme a tu costa y otorgarte el honor de poseer mi esencia.',
    quoteSignature: '— La Princesa',
    seals: [
      { label: 'Sellado al vacío', icon: 'lock' },
      { label: 'Embalaje discreto', icon: 'truck' },
      { label: 'Gestión por Vinted', icon: 'bag' },
    ],
  },

  catalog: {
    kicker: 'El Catálogo Oficial',
    title: 'La Colección de la Casa',
    sub: 'Piezas únicas con su propio código. Clic para ver galería, valoraciones y extras.',
    allCategories: 'Todo el Reino',
    empty: 'La Casa está reponiendo sus vitrinas. Vuelve pronto.',
    loading: 'Abriendo las vitrinas de la Casa…',
  },

  teaser: {
    kicker: 'El evento del año de la Casa',
    title: 'GRAND OPENING',
    titleAccent: '2K GIVEAWAY',
    body: 'Cuando el Reino alcance 2.000 seguidores, la Casa abrirá oficialmente sus puertas… y una devoción será coronada con un premio que no se puede comprar.',
    cta: 'Entrar al Gran Salón del Sorteo',
    live: 'El sorteo está en marcha',
    soon: 'Próximamente',
    open: 'Yakuza House is officially open',
  },

  giveaway: {
    defaults: {
      title: 'YAKUZA HOUSE',
      subtitle: 'GRAND OPENING 2K GIVEAWAY — la inauguración oficial de la Casa',
      prizeTitle: 'El Premio',
      prizeName: 'Devoción Coronada',
      prizeDescription: 'Un cofre sellado a mano, elegido pieza a pieza por la Princesa para el ganador del sorteo.',
      howTitle: 'Cómo se entra en el sorteo',
      howBody: 'La mecánica completa se desvela cuando la Princesa la anuncie en X (Twitter). Síguela y mantén la atención.',
      termsTitle: 'Condiciones',
      terms: 'Reservado a mayores de edad. Un resguardo, un vencedor. La Casa decide y su palabra es final.',
    },
    states: {
      soon: {
        badge: '✦ CLUB PRIVADO · PRIVATE MEMBERSHIP ✦',
        headline: 'Próximamente',
        body: 'La puerta está abierta. Sigue las órdenes para cimentar tu nombre en el sorteo.',
        cta: 'Pasar a la tienda mientras tanto',
      },
      live: {
        badge: '✦ CLUB PRIVADO · PRIVATE MEMBERSHIP ✦',
        headline: 'Participa ahora',
        body: 'La puerta está abierta. Sigue las órdenes para cimentar tu nombre en el sorteo.',
        cta: 'Ir al sorteo en Twitter',
      },
      open: {
        badge: 'Coronado',
        headline: 'Yakuza House is officially open',
        body: 'La Casa ha abierto oficialmente. El sorteo ha concluido. El Reino continúa.',
        cta: 'Explorar la Colección',
      },
    },
    counting: {
      title: 'El Camino a los 2.000',
      of: 'de',
      followers: 'devotos',
      targetLabel: 'umbral del sorteo',
      updated: 'Última lectura del escriba',
      officialUntil: 'Oficial a partir de',
    },
  },

  footer: {
    statement: 'Una Casa, no una tienda cualquiera. Todo lo que sale de aquí ha pasado por sus manos y sellado bajo su lacre.',
    columns: {
      house: { title: 'La Casa', links: ['Sellado al vacío en cada envío', 'Embalaje discreto y neutro', 'Pagos orquestados y seguros'] },
      legal: { title: 'Pergaminos Legales', terms: 'Condiciones de Compra', privacy: 'Privacidad y Discreción', refund: 'Cancelaciones y Reembolsos' },
      vinted: { title: 'Gestión por Vinted', body: 'Puedes enviar tu pedido a través de Vinted al finalizar la compra: sus puntos de recogida y su protección, bajo la insignia de la Casa.' },
    },
    bottom: '© 2026 YAKUZA HOUSE. Todos los derechos reservados.',
    sealNote: 'Lacre oficial de la Casa',
  },

  lookup: {
    title: 'Consultar Estado de Pedido',
    body: 'Escribe tu número de pedido (ej: YAK-2026-XXXX) para leer su pergamino.',
    placeholder: 'YAK-2026-XXXX',
    cancel: 'Cancelar',
    search: 'Buscar',
  },
};

export default copy;
