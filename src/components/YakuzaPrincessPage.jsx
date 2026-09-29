import React, { useState } from 'react';
import { 
  ShieldAlert, Crown, Lock, CheckCircle2, XCircle, Send, Sparkles, 
  MessageCircle, AlertTriangle, RefreshCw, Shield, ArrowRight 
} from 'lucide-react';

export default function YakuzaPrincessPage({ princessConfig, onNavigateToStore, onOpenKingdomRequest }) {
  const [activeTab, setActiveTab] = useState('normas'); // normas, presentate, reino
  const [flippedCards, setFlippedCards] = useState({});

  const config = princessConfig || {};

  const badge = config.badge || '✦ SECCIÓN EXCLUSIVA D/S & PROTOCOLO DE LA PRINCESA ✦';
  const titleTop = config.titleTop || 'YAKUZA';
  const titleAccent = config.titleAccent || 'PRINCESS';
  const headerQuote = config.headerQuote || '“La sensación es la de entrar en un club privado extremadamente exclusivo. El acceso a mi energía no se compra: se conquista, se honra y se tributa con absoluta devoción.”';

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
      frontText: 'Sumisos que desean servir y ser útiles de alguna forma desde el respeto y la devoción.',
      backTitle: 'Órdenes & Grupo Telegram',
      backText: 'Recibes órdenes y tareas gratuitas en el grupo oficial de Telegram. El único requisito es la disponibilidad, eficacia y la satisfacción de haberme complacido.'
    },
    {
      id: 'sirvientes',
      badge: 'NIVEL 2',
      title: 'SIRVIENTES',
      subtitle: 'Trato directo & Contratos',
      frontText: 'Sumisos entregados que se encargan de hacer la vida de la Princesa más fácil.',
      backTitle: 'Contacto Directo & Club 1k',
      backText: 'Contacto directo con la Princesa, tareas personalizadas y recompensas directas al entrar en el club 1k. Contratos desbloqueados y opción de ascenso a Caballeros.'
    },
    {
      id: 'caballeros',
      badge: 'NIVEL 3',
      title: 'CABALLEROS',
      subtitle: 'Aspirantes a Propiedad',
      frontText: 'Sumisos que aspiran a ser propiedad exclusiva de la Princesa. ¿Conseguirás ser uno de ellos?',
      backTitle: 'Cashmeets & Citas Presenciales',
      backText: 'Exploraremos la dinámica juntos. Evaluaciones de sumisión, aftercare exclusivo, cashmeets, cashdrops y entregas de productos en mano.'
    },
    {
      id: 'elegidos',
      badge: 'NIVEL MÁXIMO',
      title: 'LOS ELEGIDOS',
      subtitle: 'Pertenencia Absoluta (D/s)',
      frontText: 'Pertenece en mente, cuerpo y espíritu a la Princesa de manera presencial y online.',
      backTitle: 'Propiedad de la Diosa',
      backText: 'Tu cuerpo, tu voluntad, tu mente y tu alma son míos. Soy tu propósito, tu guía y Dueña de todo tu ser. Citas presenciales exclusivas y tributo de vida.'
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
        summary: 'Cúspide del Reino. Pertenencia plena e íntima dentro de la vida, acuerdos y proyectos de la Princesa.',
        duties: [
          'Lealtad absoluta, devoción y excelencia.',
          'Cuidar la máxima confianza depositada.',
          'Priorizar siempre el bienestar de la Princesa.'
        ],
        privileges: [
          'Nombre ceremonial, puesto y reconocimiento oficial.',
          'Acceso directo sin necesidad de reservar audiencia.',
          'Prioridad absoluta en dinámicas, citas y vida personal.'
        ],
        ctaText: 'Aplicar a esta posición'
      }
    };

    const def = defaults[tier.id] || defaults.plebeyos;

    let duties = def.duties;
    let privileges = def.privileges;

    if (tier.backText && (tier.backText.includes('DEBERES') || tier.backText.includes('PRIVILEGIOS'))) {
      const parts = tier.backText.split(/PRIVILEGIOS/i);
      const dutiesPart = parts[0] ? parts[0].replace(/DEBERES/i, '').trim() : '';
      const privPart = parts[1] ? parts[1].trim() : '';

      const cleanLines = (txt) => txt.split('\n')
        .map(l => l.replace(/^[-•*]\s*/, '').trim())
        .filter(l => l.length > 0 && !l.toLowerCase().startsWith('deberes') && !l.toLowerCase().startsWith('privilegios'));

      const dParsed = cleanLines(dutiesPart);
      const pParsed = cleanLines(privPart);

      if (dParsed.length > 0) duties = dParsed.slice(0, 3);
      if (pParsed.length > 0) privileges = pParsed.slice(0, 3);
    } else if (tier.backText && tier.backText.trim()) {
      const lines = tier.backText.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
      if (lines.length >= 2) {
        duties = lines.slice(0, Math.ceil(lines.length / 2)).slice(0, 3);
        privileges = lines.slice(Math.ceil(lines.length / 2)).slice(0, 3);
      }
    }

    return {
      id: tier.id,
      badge: tier.badge || def.badge,
      title: tier.title || def.title,
      subtitle: tier.subtitle || def.subtitle,
      summary: (tier.frontText && tier.frontText.trim()) 
        ? tier.frontText.split('\n').filter(Boolean).slice(0, 3).join(' ') 
        : def.summary,
      duties,
      privileges,
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
          className={`py-2.5 px-6 rounded-full font-sans text-xs uppercase tracking-widest transition-all ${
            activeTab === 'normas'
              ? 'bg-bordeaux-600/80 text-gold-300 font-bold border border-gold-500/60 shadow-lg shadow-bordeaux-700/50'
              : 'bg-dark-950/80 border border-gold-500/20 text-ivory-400 hover:text-white'
          }`}
        >
          📜 1. Mis Normas D/s
        </button>
        <button
          onClick={() => setActiveTab('presentate')}
          className={`py-2.5 px-6 rounded-full font-sans text-xs uppercase tracking-widest transition-all ${
            activeTab === 'presentate'
              ? 'bg-bordeaux-600/80 text-gold-300 font-bold border border-gold-500/60 shadow-lg shadow-bordeaux-700/50'
              : 'bg-dark-950/80 border border-gold-500/20 text-ivory-400 hover:text-white'
          }`}
        >
          👑 2. Protocolo "Preséntate"
        </button>
        <button
          onClick={() => setActiveTab('reino')}
          className={`py-2.5 px-6 rounded-full font-sans text-xs uppercase tracking-widest transition-all ${
            activeTab === 'reino'
              ? 'bg-bordeaux-600/80 text-gold-300 font-bold border border-gold-500/60 shadow-lg shadow-bordeaux-700/50'
              : 'bg-dark-950/80 border border-gold-500/20 text-ivory-400 hover:text-white'
          }`}
        >
          🗡️ 3. Mi Reino (Jerarquía)
        </button>
      </div>

      {/* TAB 1: MIS NORMAS D/S */}
      {activeTab === 'normas' && (
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
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
                    className="cursor-pointer h-[460px] perspective-1000 group relative w-full select-none"
                    title="Haz clic para girar la tarjeta"
                  >
                    <div
                      className={`relative w-full h-full duration-700 transition-transform transform-style-3d ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Cara Frontal: Nombre, lema y resumen breve */}
                      <div className={`absolute inset-0 w-full h-full backface-hidden legibility-shield p-6 rounded-2xl border border-gold-500/40 flex flex-col justify-between bg-gradient-to-b ${tier.gradient} shadow-2xl hover:border-gold-400 transition-colors`}>
                        <div className="space-y-4">
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
                            <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1.5 tracking-wider">
                              Representa
                            </span>
                            <p className="text-xs text-ivory-200 font-sans leading-relaxed">
                              {tier.summary}
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
                      <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 legibility-bordeaux p-6 rounded-2xl border border-gold-400 flex flex-col justify-between shadow-2xl">
                        <div className="space-y-3.5 overflow-hidden">
                          <div className="flex items-center justify-between border-b border-gold-500/30 pb-2">
                            <span className="text-[10px] font-sans text-gold-300 font-bold uppercase tracking-widest">
                              ✦ {tier.title}
                            </span>
                            <span className="text-[9px] font-mono text-gold-400/80 uppercase">
                              Normativa
                            </span>
                          </div>

                          {/* Bloque Deberes Principales */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-gold-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                              <Shield className="w-3 h-3 text-gold-400" />
                              <span>Deberes Principales</span>
                            </div>
                            <ul className="space-y-1 text-[11px] font-sans text-ivory-200 leading-tight">
                              {tier.duties.map((duty, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-gold-400 text-xs leading-none mt-0.5">•</span>
                                  <span>{duty}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Bloque Privilegios Principales */}
                          <div className="space-y-1.5 pt-2 border-t border-gold-500/25">
                            <div className="flex items-center gap-1.5 text-gold-300 text-[11px] font-mono font-bold uppercase tracking-wider">
                              <Crown className="w-3 h-3 text-gold-400" />
                              <span>Privilegios Clave</span>
                            </div>
                            <ul className="space-y-1 text-[11px] font-sans text-ivory-200 leading-tight">
                              {tier.privileges.map((priv, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-gold-300 text-xs leading-none mt-0.5">✦</span>
                                  <span>{priv}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
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

      {/* Bottom CTA to Store */}
      <div className="text-center pt-8 border-t border-gold-500/20">
        <button
          onClick={onNavigateToStore}
          className="btn-royal-bordeaux"
        >
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>{buttonStoreText}</span>
        </button>
      </div>

    </div>
  );
}
