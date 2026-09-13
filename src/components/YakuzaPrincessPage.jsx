import React, { useState } from 'react';
import { ShieldAlert, Crown, Lock, CheckCircle2, XCircle, Send, Sparkles, MessageCircle, AlertTriangle } from 'lucide-react';

export default function YakuzaPrincessPage({ onNavigateToStore }) {
  const [activeTab, setActiveTab] = useState('normas'); // normas, presentate, reino
  const [flippedCards, setFlippedCards] = useState({});

  const toggleCardFlip = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const kingdomTiers = [
    {
      id: 'plebeyos',
      badge: 'NIVEL 1',
      title: 'PLEBEYOS',
      subtitle: 'Sumisos humildes de primer nivel',
      frontText: 'Sumisos que desean servir y ser útiles de alguna forma desde el respeto y la devoción.',
      backTitle: 'Órdenes & Grupo Telegram',
      backText: 'Recibes órdenes y tareas gratuitas en el grupo oficial de Telegram. El único requisito es la disponibilidad, eficacia y la satisfacción de haberme complacido.',
      gradient: 'from-dark-950 via-bordeaux-800 to-dark-950'
    },
    {
      id: 'sirvientes',
      badge: 'NIVEL 2',
      title: 'SIRVIENTES',
      subtitle: 'Trato directo & Contratos',
      frontText: 'Sumisos entregados que se encargan de hacer la vida de la Princesa más fácil.',
      backTitle: 'Contacto Directo & Club 1k',
      backText: 'Contacto directo con la Princesa, tareas personalizadas y recompensas directas al entrar en el club 1k. Contratos desbloqueados y opción de ascenso a Caballeros.',
      gradient: 'from-bordeaux-800 via-bordeaux-600 to-dark-950'
    },
    {
      id: 'caballeros',
      badge: 'NIVEL 3',
      title: 'CABALLEROS',
      subtitle: 'Aspirantes a Propiedad',
      frontText: 'Sumisos que aspiran a ser propiedad exclusiva de la Princesa. ¿Conseguirás ser uno de ellos?',
      backTitle: 'Cashmeets & Citas Presenciales',
      backText: 'Exploraremos la dinámica juntos. Evaluaciones de sumisión, aftercare exclusivo, cashmeets, cashdrops y entregas de productos en mano.',
      gradient: 'from-dark-950 via-bordeaux-700 to-gold-700/30'
    },
    {
      id: 'elegidos',
      badge: 'NIVEL MÁXIMO',
      title: 'LOS ELEGIDOS',
      subtitle: 'Pertenencia Absoluta (D/s)',
      frontText: 'Pertenece en mente, cuerpo y espíritu a la Princesa de manera presencial y online.',
      backTitle: 'Propiedad de la Diosa',
      backText: 'Tu cuerpo, tu voluntad, tu mente y tu alma son míos. Soy tu propósito, tu guía y Dueña de todo tu ser. Citas presenciales exclusivas y tributo de vida.',
      gradient: 'from-bordeaux-700 via-gold-600/30 to-dark-950'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full legibility-shield border border-gold-500/50 text-gold-300 text-xs font-sans tracking-widest uppercase shadow-lg">
          <Crown className="w-4 h-4 text-gold-400" />
          ✦ SECCIÓN EXCLUSIVA D/S & PROTOCOLO DE LA PRINCESA ✦
        </div>

        <h1 className="font-sans font-black text-4xl sm:text-6xl text-ivory-100 display-shadow tracking-widest">
          YAKUZA <span className="text-bordeaux-gradient">PRINCESS</span>
        </h1>

        <div className="artdeco-divider max-w-sm mx-auto">
          <div className="ad-center" />
        </div>

        <p className="text-sm sm:text-base text-ivory-300 font-body leading-relaxed legibility-shield p-4 rounded-xl border border-gold-500/20">
          “La sensación es la de entrar en un club privado extremadamente exclusivo. El acceso a mi energía no se compra: se conquista, se honra y se tributa con absoluta devoción.”
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
              <h3 className="font-sans font-bold text-xl text-ivory-100">Requisitos para Servirme</h3>
            </div>
            
            <ul className="space-y-3 text-xs text-ivory-300 font-body leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-gold-400">✦</span>
                <span>Debes ser <strong>mayor de edad</strong>, tener trabajo estable y mentalidad de crecimiento.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400">✦</span>
                <span>Debe gustarte el <strong>Findom, Finfet</strong> o tributar tratamiento de Princesa para optar a una relación D/s a largo plazo.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400">✦</span>
                <span><strong>Respeta mi tiempo y mi vida</strong>; aquí no hay sitio para la necesidad constante de atención sin tributar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400">✦</span>
                <span>Si decides comprometerte a <strong>SERVIRME</strong>, hazlo con seriedad, dedicación y reverencia.</span>
              </li>
            </ul>
          </div>

          {/* Lo que NO respondo */}
          <div className="legibility-shield p-8 rounded-2xl border border-bordeaux-500/50 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-bordeaux-500/30 pb-3">
              <XCircle className="w-6 h-6 text-bordeaux-400" />
              <h3 className="font-sans font-bold text-xl text-ivory-100">No respondo a:</h3>
            </div>

            <ul className="space-y-3 text-xs text-ivory-400 font-body leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-bordeaux-400">✖</span>
                <span>Mensajes sin educación o sin un motivo claro.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-bordeaux-400">✖</span>
                <span>Propuestas básicas de conversación sin tributo previo.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-bordeaux-400">✖</span>
                <span>Mensajes cargados de necesidad. Enviar insistentes mensajes solo aumentará mi desgana de contestarte.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-bordeaux-400">✖</span>
                <span>Si no has leído esta información antes de escribir.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-bordeaux-500/20 text-[11px] text-gold-300 font-sans italic">
              * Desbloqueo tras falta grave: 666€ (Que te resulte un infierno volver a mí si estuviste a mis pies y no me valoraste).
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PROTOCOLO DE PRESENTACIÓN */}
      {activeTab === 'presentate' && (
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="legibility-bordeaux p-8 rounded-2xl border border-gold-500/50 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <span className="text-xs font-sans text-gold-400 uppercase tracking-widest block">PROTOCOLO OBLIGATORIO</span>
              <h3 className="font-sans font-extrabold text-2xl text-ivory-100">Cómo Dirigirte a la Princesa</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs font-sans">
              <div className="bg-dark-950/80 p-5 rounded-xl border border-gold-500/30 space-y-2">
                <span className="text-gold-400 font-bold text-sm block">1. Tributo Inicial</span>
                <p className="text-ivory-300 font-body">Haz un tributo inicial de <strong>50€ (mínimo)</strong> como muestra de sumisión y respeto hacia mi tiempo.</p>
              </div>

              <div className="bg-dark-950/80 p-5 rounded-xl border border-gold-500/30 space-y-2">
                <span className="text-gold-400 font-bold text-sm block">2. Comprobante</span>
                <p className="text-ivory-300 font-body">Envía la captura de pantalla del tributo inmediatamente por <strong>X / Telegram</strong>.</p>
              </div>

              <div className="bg-dark-950/80 p-5 rounded-xl border border-gold-500/30 space-y-2">
                <span className="text-gold-400 font-bold text-sm block">3. Mensaje Plantilla</span>
                <p className="text-ivory-300 font-body font-mono text-[11px]">“Hola buenas, soy [Nombre] de [Ciudad], tengo X años. Me gustaría saber si le complacería usarme para...”</p>
              </div>
            </div>

            {/* Tarifas de Continuidad */}
            <div className="bg-dark-950 p-6 rounded-xl border border-gold-500/20 space-y-3">
              <h4 className="font-sans font-bold text-sm text-gold-300 uppercase tracking-wider">Tarifas de Interacción Privada:</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-ivory-300 font-sans">
                <div className="p-3 bg-bordeaux-950/60 rounded border border-gold-500/20 text-center">
                  <span className="block font-bold text-gold-400 text-sm">25€</span>
                  <span className="text-[10px] text-ivory-400">Por mensaje privado</span>
                </div>
                <div className="p-3 bg-bordeaux-950/60 rounded border border-gold-500/20 text-center">
                  <span className="block font-bold text-gold-400 text-sm">100€ / día</span>
                  <span className="text-[10px] text-ivory-400">Aspirante diario</span>
                </div>
                <div className="p-3 bg-bordeaux-950/60 rounded border border-gold-500/20 text-center">
                  <span className="block font-bold text-gold-400 text-sm">700€ / sem</span>
                  <span className="text-[10px] text-ivory-400">Aspirante semanal</span>
                </div>
                <div className="p-3 bg-bordeaux-950/60 rounded border border-gold-500/20 text-center">
                  <span className="block font-bold text-gold-400 text-sm">1.000€ / mes</span>
                  <span className="text-[10px] text-ivory-400">Plaza en el Reino</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: MI REINO (JERARQUÍA Y CARTAS FLIP 3D) */}
      {activeTab === 'reino' && (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-sans text-gold-400 uppercase tracking-widest block">JERARQUÍA DEL REINO</span>
            <h3 className="font-sans font-bold text-2xl text-ivory-100">Haz clic en cada tarjeta para girarla y leer sus privilegios</h3>
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
          <span>Explorar el Catálogo de la Tienda</span>
        </button>
      </div>

    </div>
  );
}
