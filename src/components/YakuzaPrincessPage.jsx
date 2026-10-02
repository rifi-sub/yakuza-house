import React, { useState } from 'react';
import {
  ShieldAlert, Crown, Lock, CheckCircle2, XCircle, Send, Sparkles,
  MessageCircle, AlertTriangle, RefreshCw, Shield, ArrowRight
} from 'lucide-react';
import { resolveMediaUrl } from '../config';
import princessVisionBanner from '../assets/princess-vision-banner.png';
import { KingdomHallOfFame } from './kingdom/KingdomHallOfFame';

export default function YakuzaPrincessPage({ princessConfig, onNavigateToStore, onOpenKingdomRequest }) {
  const [activeTab, setActiveTab] = useState('normas'); // normas, presentate, reino
  const [flippedCards, setFlippedCards] = useState({});

  const config = princessConfig || {};

  const badge = config.badge || '✦ SECCIÓN EXCLUSIVA D/S & PROTOCOLO DE LA PRINCESA ✦';
  const titleTop = config.titleTop || 'YAKUZA';
  const titleAccent = config.titleAccent || 'PRINCESS';
  const headerQuote = config.headerQuote || '“La sensación es la de entrar en un club privado extremadamente exclusivo. El acceso a mi energía no se compra: se conquista, se honra y se tributa con absoluta devoción.”';

  const visionTitle = config.visionTitle || 'Mi Visión en la Relación D/s';
  const visionText1 = config.visionText1 || 'Quiero a alguien que pueda ser desarmado completamente, reconstruido por mis manos a mi imagen y para mi placer. Tu vida dejará de ser tuya; existirás solo para orbitarme. Tu único límite será no fallarme. El miedo inicial es natural, pero conmigo se convierte en adicción. Sé lo que deseas, y lo voy a tomar todo. Cada resistencia es solo un paso más hacia tu total entrega. No acepto a sumisos brat o sigma, no me apetece estar peleando constantemente por hacer algo que ambos queremos.';
  const visionPoint1 = config.visionPoint1 || 'Tu propósito es claro: servirme, enriquecerme y ser moldeado para satisfacerme.';
  const visionPoint2 = config.visionPoint2 || 'Olvídate de lo demás, solo importo yo. Tu vida será reconfigurada para contribuir en mi visión del BDSM.';
  const visionQuote = config.visionQuote || 'Quienes han sido lo suficientemente valientes como para entregarse lo saben: el miedo se pasa, pero la adicción a mí es para siempre.';
  const visionBanner = config.visionBannerUrl ? resolveMediaUrl(config.visionBannerUrl) : princessVisionBanner;

  const requirementsTitle = config.requirementsTitle || 'Requisitos para Servirme';
  const requirementsList = config.requirementsList || [
    'Debes ser mayor de edad, tener trabajo estable y mentalidad de crecimiento.',
    'Debe gustarte el Findom, Finfet o tributar tratamiento de Princesa para optar a una relación D/s a largo plazo.',
    'Respeta mi tiempo y mi vida; aquí no hay sitio para la necesidad constante de atención sin tributar.',
    'Si decides comprometerte a SERVIRME, hazlo con seriedad, dedicación y reverencia.'
  ];

  const noResponseTitle = config.noResponseTitle || 'No respondo a:';
  const noResponseList = config.noResponseList || [
    'Mensajes sin educación o sin un motivo claro.',
    'Propuestas básicas de conversación sin tributo previo.',
    'Mensajes cargados de necesidad. Enviar insistentes mensajes solo aumentará mi desgana de contestarte.',
    'Si no has leído esta información antes de escribir.'
  ];
  const unblockNote = config.unblockNote || '* Desbloqueo tras falta grave: 666€ (Que te resulte un infierno volver a mí si estuviste a mis pies y no me valoraste).';

  const protocolBadge = config.protocolBadge || 'PROTOCOLO OBLIGATORIO';
  const protocolTitle = config.protocolTitle || 'Cómo Dirigirte a la Princesa';
  const protocolSteps = config.protocolSteps || [
    { title: '1. Tributo Inicial', text: 'Haz un tributo inicial de 50€ (mínimo) como muestra de sumisión y respeto hacia mi tiempo.' },
    { title: '2. Comprobante', text: 'Envía la captura de pantalla del tributo inmediatamente por X / Telegram.' },
    { title: '3. Mensaje Plantilla', text: '“Hola buenas, soy [Nombre] de [Ciudad], tengo X años. Me gustaría saber si le complacería usarme para...”' }
  ];

  const ratesTitle = config.ratesTitle || 'Tarifas de Interacción Privada:';
  const ratesList = config.ratesList || [
    { label: 'Por mensaje privado', price: '25€' },
    { label: 'Aspirante diario', price: '100€ / día' },
    { label: 'Aspirante semanal', price: '700€ / sem' },
    { label: 'Plaza en el Reino', price: '1.000€ / mes' }
  ];

  const kingdomHeaderBadge = config.kingdomHeaderBadge || 'JERARQUÍA DEL REINO';
  const kingdomHeaderTitle = config.kingdomHeaderTitle || 'Haz clic en cada tarjeta para girarla y leer sus privilegios';

  const defaultGradients = {
    plebeyos: 'from-dark-950 via-bordeaux-800 to-dark-950',
    sirvientes: 'from-bordeaux-800 via-bordeaux-600 to-dark-950',
    caballeros: 'from-dark-950 via-bordeaux-700 to-gold-700/30',
    elegidos: 'from-bordeaux-700 via-gold-600/30 to-dark-950'
  };

  const rawKingdomTiers = config.kingdomTiers || [
    {
      id: 'plebeyos',
      badge: 'NIVEL 1',
      title: 'PLEBEYOS',
      subtitle: 'Sumisos humildes de primer nivel',
      frontText: 'Sirve con tiempo, habilidades y constancia.\nTu valor está en ser útil, resolutivo y profesional aunque no puedas aportar económicamente.\nAquí empiezas a demostrar si mereces avanzar.',
      backTitle: 'Órdenes & Grupo Telegram',
      backText: `DEBERES\n- Cumplir órdenes y tareas en el canal oficial.\n- Mantener respeto estricto al protocolo y tiempos.\n- Aportar habilidades técnicas, promoción o logística.\n\nPRIVILEGIOS\n- Servir a la Princesa de forma gratuita.\n- Tareas adaptadas a tus conocimientos.\n- Oportunidad de ascenso por méritos y constancia.`
    },
    {
      id: 'sirvientes',
      badge: 'NIVEL 2',
      title: 'SIRVIENTES',
      subtitle: 'Trato directo & Contratos',
      frontText: 'Tu servicio empieza a tener peso real.\nCombinas utilidad, constancia y pequeñas aportaciones para facilitarme la vida.\nAquí demuestras que no solo quieres estar: quieres avanzar.',
      backTitle: 'Contacto Directo & Club 1k',
      backText: `DEBERES\n- Mantener lealtad y continuidad demostrada.\n- Tributos o soporte en compras de wishlist.\n- Iniciativa, discreción y respuesta prioritaria.\n\nPRIVILEGIOS\n- Trato y comunicación directa con la Princesa.\n- Acceso al Club 1k y contratos de servidumbre.\n- Opción preferente de evaluación para Caballero.`
    },
    {
      id: 'caballeros',
      badge: 'NIVEL 3',
      title: 'CABALLEROS',
      subtitle: 'Aspirantes a Propiedad',
      frontText: 'Has entrado en entrenamiento.\nYa no solo demuestras utilidad: demuestras si tienes disciplina, compatibilidad y entrega suficientes para pertenecerme.\nAquí se construye la confianza de verdad.',
      backTitle: 'Cashmeets & Citas Presenciales',
      backText: `DEBERES\n- Seguir entrenamiento personalizado y rituales.\n- Disponibilidad alta y aceptación de corrección.\n- Aportación regular y soporte logístico/financiero.\n\nPRIVILEGIOS\n- Seguimiento cercano y dinámicas D/s continuadas.\n- Acceso a experiencias presenciales (cashmeets / entregas).\n- Candidatura formal a consagración como sumiso en propiedad.`
    },
    {
      id: 'elegidos',
      badge: 'NIVEL MÁXIMO',
      title: 'ESCLAVOS',
      subtitle: 'Pertenencia Absoluta (D/s)',
      frontText: 'Has demostrado que mereces un lugar estable a mis pies.\nYa no estás intentando entrar: formas parte de mi vida, mi Reino y mi estructura.\nTu función es mantener y superar todo aquello que te hizo merecerme.',
      backTitle: 'Propiedad de la Diosa',
      backText: `DEBERES\n- Mantener y mejorar todo lo aprendido.\n- Cumplir las funciones de tu puesto.\n- Cuidar la confianza conseguida.\n- Mantener atención, iniciativa y disciplina.\n- Facilitar mi vida y contribuir activamente a mi bienestar.\n- Seguir mereciendo los privilegios obtenidos.\n\nPRIVILEGIOS\n- Reconocimiento oficial dentro del Reino.\n- Nombre y puesto propios.\n- Acceso directo a mí sin reservar audiencia.\n- Máximo nivel de confianza y personalización.\n- Prioridad en dinámicas, sesiones y encuentros.\n- Participación cercana en mi vida y proyectos.\n- El privilegio de haber sido elegido para pertenecerme.`
    }
  ];

  const kingdomTiers = rawKingdomTiers.map(t => ({
    ...t,
    gradient: t.gradient || defaultGradients[t.id] || 'from-dark-950 via-bordeaux-800 to-dark-950'
  }));

  const buttonStoreText = config.buttonStoreText || 'Explorar el Catálogo de la Tienda';

  const toggleCardFlip = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const parseBackContent = (tier, def) => {
    const rawBack = (tier.backText && tier.backText.trim()) ? tier.backText.trim() : '';

    if (!rawBack) {
      return {
        mode: 'sections',
        duties: def.duties || [],
        privileges: def.privileges || []
      };
    }

    const lines = rawBack.split('\n').map(l => l.trim()).filter(Boolean);
    let currentSection = null;
    const duties = [];
    const privileges = [];
    const otherLines = [];

    for (const line of lines) {
      const cleanHeader = line.replace(/[\*\_#:\-]/g, '').trim().toLowerCase();
      const isDutiesHeader = ['deberes', 'obligaciones', 'compromisos', 'deberes principales', 'deberes del rango'].includes(cleanHeader);
      const isPrivilegesHeader = ['privilegios', 'beneficios', 'recompensas', 'privilegios clave', 'privilegios del rango'].includes(cleanHeader);

      if (isDutiesHeader) {
        currentSection = 'duties';
        continue;
      }
      if (isPrivilegesHeader) {
        currentSection = 'privileges';
        continue;
      }

      const clean = line.replace(/^[\s\*•–—\-\d\.\)]+/, '').trim();
      if (!clean) continue;

      if (currentSection === 'duties') {
        duties.push(clean);
      } else if (currentSection === 'privileges') {
        privileges.push(clean);
      } else {
        otherLines.push(clean);
      }
    }

    if (duties.length > 0 || privileges.length > 0) {
      return {
        mode: 'sections',
        duties: duties.length > 0 ? duties : (def.duties || []),
        privileges: privileges.length > 0 ? privileges : (def.privileges || [])
      };
    }

    if (otherLines.length >= 2) {
      return {
        mode: 'bullets',
        items: otherLines
      };
    }

    return {
      mode: 'text',
      text: rawBack
    };
  };

  const getTierDisplay = (tier) => {
    const defaults = {
      plebeyos: {
        id: 'plebeyos',
        badge: 'NIVEL 1',
        title: 'PLEBEYOS',
        subtitle: 'Sumisión Inicial & Utilidad',
        summary: 'Espacio de entrada para demostrar respeto, disponibilidad y utilidad práctica sin aportación económica obligatoria.',
        duties: [
          'Cumplir órdenes y tareas en el canal oficial.',
          'Mantener respeto estricto al protocolo y tiempos.',
          'Aportar habilidades técnicas, promoción o logística.'
        ],
        privileges: [
          'Servir a la Princesa de forma gratuita.',
          'Tareas adaptadas a tus conocimientos.',
          'Oportunidad de ascenso por méritos y constancia.'
        ],
        ctaText: 'Solicitar entrada al Reino'
      },
      sirvientes: {
        id: 'sirvientes',
        badge: 'NIVEL 2',
        title: 'SIRVIENTES',
        subtitle: 'Trato Directo & Contratos',
        summary: 'Servicio con peso real. Combina constancia, tareas prioritarias y gestos puntuales para facilitar la vida de la Princesa.',
        duties: [
          'Mantener lealtad y continuidad demostrada.',
          'Tributos o soporte en compras de wishlist.',
          'Iniciativa, discreción y respuesta prioritaria.'
        ],
        privileges: [
          'Trato y comunicación directa con la Princesa.',
          'Acceso al Club 1k y contratos de servidumbre.',
          'Opción preferente de evaluación para Caballero.'
        ],
        ctaText: 'Aplicar a esta posición'
      },
      caballeros: {
        id: 'caballeros',
        badge: 'NIVEL 3',
        title: 'CABALLEROS',
        subtitle: 'Aspirantes a Propiedad',
        summary: 'Entrenamiento riguroso para sumisos con la disciplina, compatibilidad y entrega requeridas para pertenecer a la Princesa.',
        duties: [
          'Seguir entrenamiento personalizado y rituales.',
          'Disponibilidad alta y aceptación de corrección.',
          'Aportación regular y soporte logístico/financiero.'
        ],
        privileges: [
          'Seguimiento cercano y dinámicas D/s continuadas.',
          'Acceso a experiencias presenciales (cashmeets / entregas).',
          'Candidatura formal a consagración como sumiso en propiedad.'
        ],
        ctaText: 'Aplicar a esta posición'
      },
      elegidos: {
        id: 'elegidos',
        badge: 'NIVEL MÁXIMO',
        title: 'ESCLAVOS',
        subtitle: 'Pertenencia Absoluta (D/s)',
        summary: 'Has demostrado que mereces un lugar estable a mis pies. Ya no estás intentando entrar: formas parte de mi vida, mi Reino y mi estructura. Tu función es mantener y superar todo aquello que te hizo merecerme.',
        duties: [
          'Mantener y mejorar todo lo aprendido.',
          'Cumplir las funciones de tu puesto.',
          'Cuidar la confianza conseguida.',
          'Mantener atención, iniciativa y disciplina.',
          'Facilitar mi vida y contribuir activamente a mi bienestar.',
          'Seguir mereciendo los privilegios obtenidos.'
        ],
        privileges: [
          'Reconocimiento oficial dentro del Reino.',
          'Nombre y puesto propios.',
          'Acceso directo a mí sin reservar audiencia.',
          'Máximo nivel de confianza y personalización.',
          'Prioridad en dinámicas, sesiones y encuentros.',
          'Participación cercana en mi vida y proyectos.',
          'El privilegio de haber sido elegido para pertenecerme.'
        ],
        ctaText: 'Aplicar a esta posición'
      }
    };

    const def = defaults[tier.id] || defaults.plebeyos;
    const backContent = parseBackContent(tier, def);

    return {
      id: tier.id,
      badge: tier.badge || def.badge,
      title: tier.title || def.title,
      subtitle: tier.subtitle || def.subtitle,
      frontText: (tier.frontText && tier.frontText.trim()) ? tier.frontText.trim() : def.summary,
      backTitle: (tier.backTitle && tier.backTitle.trim()) ? tier.backTitle.trim() : 'Normativa',
      backContent,
      ctaText: tier.id === 'plebeyos' ? 'Solicitar entrada al Reino' : 'Aplicar a esta posición',
      gradient: tier.gradient || defaultGradients[tier.id] || 'from-dark-950 via-bordeaux-800 to-dark-950'
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

      {/* Header Banner */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full legibility-shield border border-gold-500/50 text-gold-300 text-xs font-sans tracking-widest uppercase shadow-lg">
          <Crown className="w-4 h-4 text-gold-400" />
          {badge}
        </div>

        <h1 className="font-sans font-black text-4xl sm:text-6xl text-ivory-100 display-shadow tracking-widest">
          {titleTop} <span className="text-bordeaux-gradient">{titleAccent}</span>
        </h1>

        <div className="artdeco-divider max-w-sm mx-auto">
          <div className="ad-center" />
        </div>

        <p className="text-sm sm:text-base text-ivory-300 font-body leading-relaxed legibility-shield p-4 rounded-xl border border-gold-500/20">
          {headerQuote}
        </p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex justify-center gap-2 border-b border-gold-500/30 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('normas')}
          className={`py-2.5 px-6 rounded-full font-sans text-xs uppercase tracking-widest transition-all ${activeTab === 'normas'
              ? 'bg-bordeaux-600/80 text-gold-300 font-bold border border-gold-500/60 shadow-lg shadow-bordeaux-700/50'
              : 'bg-dark-950/80 border border-gold-500/20 text-ivory-400 hover:text-white'
            }`}
        >
          📜 1. Mis Normas D/s
        </button>
        <button
          onClick={() => setActiveTab('presentate')}
          className={`py-2.5 px-6 rounded-full font-sans text-xs uppercase tracking-widest transition-all ${activeTab === 'presentate'
              ? 'bg-bordeaux-600/80 text-gold-300 font-bold border border-gold-500/60 shadow-lg shadow-bordeaux-700/50'
              : 'bg-dark-950/80 border border-gold-500/20 text-ivory-400 hover:text-white'
            }`}
        >
          👑 2. Protocolo "Preséntate"
        </button>
        <button
          onClick={() => setActiveTab('reino')}
          className={`py-2.5 px-6 rounded-full font-sans text-xs uppercase tracking-widest transition-all ${activeTab === 'reino'
              ? 'bg-bordeaux-600/80 text-gold-300 font-bold border border-gold-500/60 shadow-lg shadow-bordeaux-700/50'
              : 'bg-dark-950/80 border border-gold-500/20 text-ivory-400 hover:text-white'
            }`}
        >
          🗡️ 3. Mi Reino (Jerarquía)
        </button>
      </div>

      {/* TAB 1: MIS NORMAS D/S */}
      {activeTab === 'normas' && (
        <div className="max-w-5xl mx-auto space-y-8">

          {/* BANNER VISUAL DE LA PRINCESA YAKUZA (HORIZONTAL) */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-gold-500/40 shadow-2xl group">
            <div className="aspect-[16/9] sm:aspect-[21/9] w-full max-h-[460px] overflow-hidden relative">
              <img
                src={visionBanner || princessVisionBanner}
                alt="La Princesa Yakuza"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-dark-950/70 via-transparent to-dark-950/70" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full legibility-shield border border-gold-500/40 text-gold-300 text-xs font-sans tracking-widest uppercase">
                <Crown className="w-3.5 h-3.5 text-gold-400" />
                <span>La Princesa Yakuza · Autoridad & Dominio</span>
              </div>
            </div>
          </div>

          {/* BLOQUE: MI VISIÓN EN LA RELACIÓN D/S (ENCIMA DE LOS DOS BLOQUES) */}
          <div className="legibility-bordeaux p-6 sm:p-8 rounded-2xl border border-gold-500/40 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gold-500/30 pb-3">
              <Sparkles className="w-6 h-6 text-gold-400 shrink-0" />
              <h2 className="font-sans font-bold text-2xl sm:text-3xl text-ivory-100 tracking-wide">
                {visionTitle}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-ivory-200 font-body leading-relaxed">
              {visionText1}
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-dark-950/80 border border-gold-500/30 flex items-start gap-3">
                <span className="text-base leading-none mt-0.5">🔹</span>
                <p className="text-xs sm:text-sm font-sans text-gold-200 font-semibold leading-relaxed">
                  {visionPoint1}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-950/80 border border-gold-500/30 flex items-start gap-3">
                <span className="text-base leading-none mt-0.5">🔹</span>
                <p className="text-xs sm:text-sm font-sans text-gold-200 font-semibold leading-relaxed">
                  {visionPoint2}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-bordeaux-950/90 via-dark-950 to-bordeaux-950/90 border border-gold-500/30 text-center">
              <p className="text-xs sm:text-sm text-gold-300 font-sans italic font-medium leading-relaxed">
                “{visionQuote}”
              </p>
            </div>
          </div>

          {/* DOS BLOQUES EXISTENTES: REQUISITOS Y NO RESPONDO */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Requisitos */}
            <div className="legibility-bordeaux p-8 rounded-2xl border border-gold-500/40 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-gold-500/30 pb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <h3 className="font-sans font-bold text-xl text-ivory-100">{requirementsTitle}</h3>
              </div>

              <ul className="space-y-3 text-xs text-ivory-300 font-body leading-relaxed">
                {requirementsList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-gold-400">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lo que NO respondo */}
            <div className="legibility-shield p-8 rounded-2xl border border-bordeaux-500/50 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-bordeaux-500/30 pb-3">
                <XCircle className="w-6 h-6 text-bordeaux-400" />
                <h3 className="font-sans font-bold text-xl text-ivory-100">{noResponseTitle}</h3>
              </div>

              <ul className="space-y-3 text-xs text-ivory-400 font-body leading-relaxed">
                {noResponseList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-bordeaux-400">✖</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-bordeaux-500/20 text-[11px] text-gold-300 font-sans italic">
                {unblockNote}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: PROTOCOLO DE PRESENTACIÓN */}
      {activeTab === 'presentate' && (
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="legibility-bordeaux p-8 rounded-2xl border border-gold-500/50 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <span className="text-xs font-sans text-gold-400 uppercase tracking-widest block">{protocolBadge}</span>
              <h3 className="font-sans font-extrabold text-2xl text-ivory-100">{protocolTitle}</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs font-sans">
              {protocolSteps.map((step, idx) => (
                <div key={idx} className="bg-dark-950/80 p-5 rounded-xl border border-gold-500/30 space-y-2">
                  <span className="text-gold-400 font-bold text-sm block">{step.title}</span>
                  <p className="text-ivory-300 font-body">{step.text}</p>
                </div>
              ))}
            </div>

            {/* Tarifas de Continuidad */}
            <div className="bg-dark-950 p-6 rounded-xl border border-gold-500/20 space-y-3">
              <h4 className="font-sans font-bold text-sm text-gold-300 uppercase tracking-wider">{ratesTitle}</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-ivory-300 font-sans">
                {ratesList.map((rate, idx) => (
                  <div key={idx} className="p-3 bg-bordeaux-950/60 rounded border border-gold-500/20 text-center">
                    <span className="block font-bold text-gold-400 text-sm">{rate.price}</span>
                    <span className="text-[10px] text-ivory-400">{rate.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: MI REINO (JERARQUÍA Y CARTAS FLIP 3D) */}
      {activeTab === 'reino' && (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-sans text-gold-400 uppercase tracking-widest block">{kingdomHeaderBadge}</span>
            <h3 className="font-sans font-bold text-2xl text-ivory-100">{kingdomHeaderTitle}</h3>
            <p className="text-xs text-ivory-300 font-sans">
              Haz clic sobre cualquier tarjeta para girarla y consultar sus deberes y privilegios principales.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {kingdomTiers.map(rawTier => {
              const tier = getTierDisplay(rawTier);
              const isFlipped = flippedCards[tier.id];
              return (
                <div key={tier.id} className="flex flex-col space-y-3">

                  {/* Tarjeta Giratoria 3D */}
                  <div
                    onClick={() => toggleCardFlip(tier.id)}
                    className="cursor-pointer h-[520px] perspective-1000 group relative w-full select-none"
                    title="Haz clic para girar la tarjeta"
                  >
                    <div
                      className={`relative w-full h-full duration-700 transition-transform transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
                        }`}
                    >
                      {/* Cara Frontal: Nombre, lema y resumen breve */}
                      <div className={`absolute inset-0 w-full h-full backface-hidden legibility-shield bg-dark-950 p-6 rounded-2xl border border-gold-500/40 flex flex-col justify-between bg-gradient-to-b ${tier.gradient} shadow-2xl hover:border-gold-400 transition-all duration-300 ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between border-b border-gold-500/30 pb-2">
                            <span className="text-[10px] font-sans text-gold-400 font-bold uppercase tracking-widest">
                              ✦ {tier.badge}
                            </span>
                            <span className="text-[9px] font-mono text-gold-500/70 uppercase">
                              Estamento
                            </span>
                          </div>

                          <div>
                            <h4 className="font-brand font-black text-2xl text-ivory-100 tracking-wide mb-1">
                              {tier.title}
                            </h4>
                            <p className="text-xs text-gold-300 font-sans font-semibold tracking-wide italic">
                              “{tier.subtitle}”
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gold-500/20">
                            <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1 tracking-wider">
                              Representa
                            </span>
                            <p className="text-xs text-ivory-200 font-sans leading-relaxed whitespace-pre-line">
                              {tier.frontText}
                            </p>
                          </div>
                        </div>

                        {/* Pie cara frontal: Indicador interactivo para girar */}
                        <div className="pt-3 border-t border-gold-500/20 flex items-center justify-between text-[11px] font-mono text-gold-400 group-hover:text-gold-300 transition-colors">
                          <span className="flex items-center gap-1.5 font-bold">
                            <RefreshCw className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-500" />
                            Ver deberes & privilegios
                          </span>
                          <span className="text-[10px] text-gray-400 font-sans">↻</span>
                        </div>
                      </div>

                      {/* Cara Posterior: Deberes y privilegios principales */}
                      <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-[#160609] legibility-bordeaux p-6 rounded-2xl border border-gold-400 flex flex-col justify-between shadow-2xl transition-all duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="space-y-2.5 overflow-y-auto pr-1.5 flex-1 custom-scrollbar max-h-[420px]">
                          <div className="flex items-center justify-between border-b border-gold-500/30 pb-2">
                            <span className="text-[10px] font-sans text-gold-300 font-bold uppercase tracking-widest truncate max-w-[55%]">
                              ✦ {tier.title}
                            </span>
                            <span className="text-[10px] font-mono text-gold-400 font-bold uppercase tracking-wider truncate max-w-[45%] text-right" title={tier.backTitle}>
                              {tier.backTitle}
                            </span>
                          </div>

                          {/* Modo 1: Secciones de Deberes y Privilegios */}
                          {tier.backContent.mode === 'sections' && (
                            <div className="space-y-2.5">
                              {tier.backContent.duties && tier.backContent.duties.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-gold-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                                    <Shield className="w-3 h-3 text-gold-400 shrink-0" />
                                    <span>Deberes Principales</span>
                                  </div>
                                  <ul className="space-y-1 text-[11px] font-sans text-ivory-200 leading-tight">
                                    {tier.backContent.duties.map((duty, idx) => (
                                      <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-gold-400 text-xs leading-none mt-0.5 shrink-0">•</span>
                                        <span>{duty}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {tier.backContent.privileges && tier.backContent.privileges.length > 0 && (
                                <div className="space-y-1 pt-2 border-t border-gold-500/25">
                                  <div className="flex items-center gap-1.5 text-gold-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                                    <Crown className="w-3 h-3 text-gold-400 shrink-0" />
                                    <span>Privilegios Clave</span>
                                  </div>
                                  <ul className="space-y-1 text-[11px] font-sans text-ivory-200 leading-tight">
                                    {tier.backContent.privileges.map((priv, idx) => (
                                      <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-gold-300 text-xs leading-none mt-0.5 shrink-0">✦</span>
                                        <span>{priv}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Modo 2: Lista con Viñetas */}
                          {tier.backContent.mode === 'bullets' && (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-gold-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                                <Shield className="w-3 h-3 text-gold-400 shrink-0" />
                                <span>Normativa & Privilegios</span>
                              </div>
                              <ul className="space-y-1 text-[11px] font-sans text-ivory-200 leading-tight">
                                {tier.backContent.items.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-gold-400 text-xs leading-none mt-0.5 shrink-0">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Modo 3: Texto Libre */}
                          {tier.backContent.mode === 'text' && (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-gold-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                                <Shield className="w-3 h-3 text-gold-400 shrink-0" />
                                <span>Normativa del Rango</span>
                              </div>
                              <p className="text-[11px] font-sans text-ivory-200 leading-relaxed whitespace-pre-line">
                                {tier.backContent.text}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Pie cara posterior: Volver */}
                        <div className="pt-3 border-t border-gold-500/30 flex items-center justify-between text-[11px] font-mono text-gold-300 hover:text-white transition-colors">
                          <span className="flex items-center gap-1.5 font-bold">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Volver al anverso
                          </span>
                          <span className="text-[10px] text-gray-300 font-sans">↻</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón claro debajo de cada rango: Solicitar entrada / Aplicar a una posición */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenKingdomRequest) {
                        onOpenKingdomRequest(tier.id);
                      }
                    }}
                    className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-bordeaux-800 via-dark-900 to-bordeaux-800 hover:from-bordeaux-700 hover:to-bordeaux-600 border border-gold-500/50 hover:border-gold-400 text-gold-300 hover:text-white text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group/btn hover:scale-[1.02]"
                  >
                    <Crown className="w-3.5 h-3.5 text-gold-400 group-hover/btn:scale-110 transition-transform" />
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold-400 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Muro del Reino / Muro de la Fama al pie de la sección */}
      <div className="pt-10 border-t border-gold-500/25 space-y-6">
        <KingdomHallOfFame onApplyClick={(rank) => onOpenKingdomRequest?.(rank)} />

        {/* Enlace secundario hacia la Boutique Fetish */}
        <div className="text-center pt-2">
          <button
            onClick={onNavigateToStore}
            className="text-xs font-sans text-gold-400 hover:text-white uppercase tracking-widest transition-colors inline-flex items-center gap-2 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>O visita la {buttonStoreText} de la Princesa →</span>
          </button>
        </div>
      </div>

    </div>
  );
}
