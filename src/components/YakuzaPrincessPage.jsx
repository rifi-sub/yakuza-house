import React, { useState } from 'react';
import { ShieldAlert, Crown, Lock, CheckCircle2, XCircle, Send, Sparkles, MessageCircle, AlertTriangle } from 'lucide-react';

export default function YakuzaPrincessPage({ princessConfig, onNavigateToStore }) {
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
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kingdomTiers.map(tier => {
              const isFlipped = flippedCards[tier.id];
              return (
                <div
                  key={tier.id}
                  onClick={() => toggleCardFlip(tier.id)}
                  className="cursor-pointer h-96 perspective-1000 group"
                >
                  <div
                    className={`relative w-full h-full duration-700 transition-all transform-style-3d ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Front Face */}
                    <div className={`absolute inset-0 w-full h-full backface-hidden legibility-shield p-6 rounded-2xl border border-gold-500/40 flex flex-col justify-between bg-gradient-to-b ${tier.gradient} shadow-2xl`}>
                      <div>
                        <span className="text-[10px] font-sans text-gold-400 font-bold uppercase tracking-widest block mb-2 border-b border-gold-500/30 pb-1">
                          ✦ {tier.badge}
                        </span>
                        <h4 className="font-sans font-black text-2xl text-ivory-100 mb-2">{tier.title}</h4>
                        <p className="text-xs text-gold-300 font-sans font-semibold mb-4">{tier.subtitle}</p>
                        <p className="text-xs text-ivory-300 font-body leading-relaxed">{tier.frontText}</p>
                      </div>

                      <div className="text-center pt-4 border-t border-gold-500/20 text-[10px] font-sans text-gold-400 uppercase tracking-widest flex items-center justify-center gap-1">
                        <span>Haz clic para girar</span> ↻
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 legibility-bordeaux p-6 rounded-2xl border border-gold-400 flex flex-col justify-between shadow-2xl`}>
                      <div>
                        <span className="text-[10px] font-sans text-gold-300 font-bold uppercase tracking-widest block mb-2 border-b border-gold-500/30 pb-1">
                          REVERSIÓN DE PRIVILEGIOS
                        </span>
                        <h4 className="font-sans font-bold text-lg text-ivory-100 mb-3">{tier.backTitle}</h4>
                        <p className="text-xs text-ivory-200 font-body leading-relaxed">{tier.backText}</p>
                      </div>

                      <div className="text-center pt-4 border-t border-gold-500/30 text-[10px] font-sans text-ivory-300 uppercase tracking-widest">
                        Volver a la portada ↻
                      </div>
                    </div>
                  </div>
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
