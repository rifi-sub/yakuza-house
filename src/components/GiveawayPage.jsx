import React, { useEffect, useState } from 'react';
import { Crown, Gift, Clock, Sparkles, ShieldCheck, ChevronLeft, Twitter } from 'lucide-react';
import Reveal from './Reveal';
import ItemCard from './ItemCard';
import copy from '../copy';
import { resolveMediaUrl } from '../config';

// --- Cuenta atrás ---
function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!target) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    done: diff === 0,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000)
  };
}

const pad = n => String(n).padStart(2, '0');

export default function GiveawayPage({ launch, onBackToStore, onBuyNow, onViewDetails, onAddToCart }) {
  const [numberTab, setNumberTab] = useState('all');
  const [searchRaffleQuery, setSearchRaffleQuery] = useState('');

  const config = launch?.config || {};
  const followers = launch?.followers || {};
  const featuredItems = Array.isArray(launch?.featuredItems) ? launch.featuredItems : [];

  const raffle = config.raffleNumbers || { total: 100, assigned: {} };
  const totalRaffle = typeof raffle.total === 'number' ? raffle.total : 100;
  const assignedMap = raffle.assigned || {};
  const assignedCount = Object.keys(assignedMap).length;
  const availableCount = Math.max(0, totalRaffle - assignedCount);

  const state = config.state || 'soon';
  const stateCopy = copy.giveaway.states[state] || copy.giveaway.states.soon;
  const defaults = copy.giveaway.defaults;

  const target = config.targetFollowers || 2000;
  const count = typeof followers.count === 'number' ? followers.count : 0;
  const pct = Math.min(100, Math.round((count / Math.max(1, target)) * 100));

  const showCountdown = config.showCountdown && !!config.countdownTarget && state !== 'open';
  const cd = useCountdown(showCountdown ? config.countdownTarget : null);

  const prizeImage = config.prize?.imageUrl ? resolveMediaUrl(config.prize.imageUrl) : null;
  const isOpen = state === 'open';

  return (
    <main className="relative">
      {/* HERO DEL EVENTO */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-dark-950 via-dark-900 to-bordeaux-700/30 film-vignette">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.12),transparent_55%)]" />
        <div className="absolute inset-x-8 top-28 hidden md:block border-t border-gold-500/20" />
        <div className="absolute inset-x-8 bottom-10 hidden md:block border-t border-gold-500/20" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8 py-24">
          <Reveal>
            <div className="wax-seal seal-glow w-24 h-24 mx-auto text-3xl font-black select-none">
              {copy.brand.short}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="text-xs md:text-sm font-sans tracking-widest2 uppercase text-gold-400">
              {stateCopy.badge}
            </p>
          </Reveal>

          <Reveal delay={220}>
            <h1 className="font-display font-black display-shadow leading-none">
              <span className="block text-4xl sm:text-6xl lg:text-7xl text-ivory-300">{defaults.title}</span>
              <span className="block text-2xl sm:text-4xl lg:text-5xl mt-4 text-gold-gradient">{defaults.subtitle}</span>
            </h1>
          </Reveal>

          <Reveal delay={340}>
            <p className="font-serif italic text-lg md:text-xl text-ivory-400 max-w-2xl mx-auto leading-relaxed">
              {stateCopy.body}
            </p>
          </Reveal>

          {/* Cuenta atrás */}
          {showCountdown && cd && !cd.done && (
            <Reveal delay={460}>
              <div className="flex items-center justify-center gap-3 md:gap-5">
                {[
                  { v: cd.days, label: 'días' },
                  { v: cd.hours, label: 'horas' },
                  { v: cd.minutes, label: 'min' },
                  { v: cd.seconds, label: 'seg' }
                ].map((u, i) => (
                  <div key={i} className="baroque-frame glass-panel-gold w-18 md:w-24 py-4 px-3 md:px-5 text-center min-w-[4.5rem] md:min-w-[6rem]">
                    <div className="font-display text-2xl md:text-4xl font-bold text-ivory-300">{pad(u.v)}</div>
                    <div className="text-[10px] md:text-xs font-sans tracking-widest uppercase text-gold-500 mt-1">{u.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-mono text-gray-400 tracking-widest uppercase mt-4">
                <Clock className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-gold-500" />
                {copy.giveaway.counting.officialUntil}: {new Date(config.countdownTarget).toLocaleString()}
              </p>
            </Reveal>
          )}

          {isOpen && (
            <Reveal delay={460}>
              <div className="inline-flex items-center gap-3 px-8 py-4 glass-panel-gold">
                <Crown className="w-6 h-6 text-gold-400" />
                <span className="font-display text-xl md:text-2xl text-gold-gradient font-bold">{copy.teaser.open}</span>
              </div>
            </Reveal>
          )}

          <Reveal delay={560}>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              {state === 'live' && config.twitterUrl ? (
                <a href={config.twitterUrl} target="_blank" rel="noopener noreferrer" className="btn-royal">
                  <Twitter className="w-4 h-4" />
                  {stateCopy.cta}
                </a>
              ) : (
                <button onClick={onBackToStore} className={isOpen ? 'btn-royal' : 'btn-bordeaux'}>
                  <Sparkles className="w-4 h-4" />
                  {stateCopy.cta}
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROGRESO A LOS 2.000 */}
      {!isOpen && (
        <section className="max-w-3xl mx-auto px-6 pt-12 pb-4">
          <Reveal>
            <div className="glass-panel p-8 md:p-10 space-y-6">
              <div className="text-center space-y-1">
                <p className="text-xs font-sans tracking-widest uppercase text-gold-400">{copy.giveaway.counting.title}</p>
                <p className="font-display text-3xl md:text-4xl font-bold text-ivory-300">
                  {count.toLocaleString()}
                  <span className="text-gold-500 text-lg md:text-xl font-sans"> {copy.giveaway.counting.of} {target.toLocaleString()}</span>
                </p>
                <p className="text-xs font-mono text-gray-400">{target.toLocaleString()} {copy.giveaway.counting.followers} · {copy.giveaway.counting.targetLabel}</p>
              </div>

              <div className="progress-shell">
                <div className="progress-fill" style={{ width: `${Math.max(2, pct)}%` }} />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>{pct}% del camino</span>
                <span>
                  {copy.giveaway.counting.updated}: {followers.updatedAt ? new Date(followers.updatedAt).toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* PREMIO */}
      <section className="max-w-4xl mx-auto px-6 pt-4 pb-8">
        <Reveal>
          <div className="ornament-divider mb-6"><span className="om-center" /></div>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <Reveal variant="reveal-left">
            <div className="baroque-frame corner-ornaments bg-gradient-to-b from-dark-800 to-dark-900 aspect-[4/5] flex items-center justify-center overflow-hidden">
              {prizeImage ? (
                <img src={prizeImage} alt={config.prize?.name || 'Premio del sorteo'} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-4 px-8">
                  <Gift className="w-16 h-16 text-gold-500 mx-auto" />
                  <p className="font-serif italic text-ivory-400 text-lg">El cofre se sella con lacre hasta la coronación.</p>
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="space-y-5">
              <p className="text-xs font-sans tracking-widest2 uppercase text-gold-400">{defaults.prizeTitle}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-ivory-300">{config.prize?.name || defaults.prizeName}</h2>
              {config.prize?.valueLabel && (
                <p className="inline-block text-xs font-mono text-gold-300 bg-gold-500/10 border border-gold-500/30 px-3 py-1.5 rounded-full">{config.prize.valueLabel}</p>
              )}
              <p className="font-serif text-lg text-ivory-400 leading-relaxed whitespace-pre-line">
                {config.prize?.description || defaults.prizeDescription}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TABLERO DE PAPELETAS Y NÚMEROS DISPONIBLES / COMPRADOS */}
      <section className="max-w-5xl mx-auto px-6 pt-4 pb-12">
        <Reveal>
          <div className="glass-panel p-8 md:p-10 space-y-8 border border-gold-500/35 rounded-3xl shadow-2xl">
            
            {/* Header del Panel */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-sans tracking-widest uppercase">
                <Gift className="w-4 h-4 text-gold-400" />
                <span>TABLA OFICIAL DE PAPELETAS DEL SORTEO</span>
              </div>
              <h2 className="font-brand font-black text-3xl sm:text-4xl text-ivory-100">
                Estado de Números en Tiempo Real
              </h2>
              <p className="text-xs sm:text-sm text-ivory-300 max-w-2xl mx-auto font-sans leading-relaxed">
                Consulta los números disponibles para la rifa. Cada vez que un devoto o sumi adquiere una papeleta, su número se actualiza y queda registrado en el tablero oficial de la Casa.
              </p>
            </div>

            {/* Barra de Estadísticas & Contadores */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
              <div className="legibility-shield p-4 rounded-xl border border-gold-500/30">
                <span className="block text-2xl md:text-3xl font-mono font-bold text-ivory-100">{totalRaffle}</span>
                <span className="text-[10px] sm:text-xs font-sans tracking-wider uppercase text-gray-400">Total Papeletas</span>
              </div>
              <div className="legibility-shield p-4 rounded-xl border border-gold-500/50 bg-gold-500/10 shadow-lg shadow-gold-500/10">
                <span className="block text-2xl md:text-3xl font-mono font-bold text-gold-300">{availableCount}</span>
                <span className="text-[10px] sm:text-xs font-sans tracking-wider uppercase text-gold-400 font-semibold">Disponibles</span>
              </div>
              <div className="legibility-shield p-4 rounded-xl border border-bordeaux-500/50 bg-bordeaux-600/30 shadow-lg shadow-bordeaux-700/30">
                <span className="block text-2xl md:text-3xl font-mono font-bold text-bordeaux-300">{assignedCount}</span>
                <span className="text-[10px] sm:text-xs font-sans tracking-wider uppercase text-bordeaux-300 font-semibold">Vendidas / Reservadas</span>
              </div>
            </div>

            {/* Filtros de Pestañas & Búsqueda */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-b border-gold-500/20 py-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setNumberTab('all')}
                  className={`px-4 py-2 rounded-lg font-sans text-xs uppercase tracking-wider transition-all ${
                    numberTab === 'all'
                      ? 'bg-gold-500 text-dark-950 font-bold shadow-md'
                      : 'bg-dark-950 border border-gold-500/20 text-ivory-400 hover:text-white'
                  }`}
                >
                  Todas ({totalRaffle})
                </button>
                <button
                  onClick={() => setNumberTab('available')}
                  className={`px-4 py-2 rounded-lg font-sans text-xs uppercase tracking-wider transition-all ${
                    numberTab === 'available'
                      ? 'bg-gold-500 text-dark-950 font-bold shadow-md'
                      : 'bg-dark-950 border border-gold-500/20 text-ivory-400 hover:text-white'
                  }`}
                >
                  Disponibles ({availableCount})
                </button>
                <button
                  onClick={() => setNumberTab('assigned')}
                  className={`px-4 py-2 rounded-lg font-sans text-xs uppercase tracking-wider transition-all ${
                    numberTab === 'assigned'
                      ? 'bg-bordeaux-600 text-gold-300 font-bold border border-gold-500/40 shadow-md'
                      : 'bg-dark-950 border border-gold-500/20 text-ivory-400 hover:text-white'
                  }`}
                >
                  Reservadas ({assignedCount})
                </button>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={searchRaffleQuery}
                  onChange={e => setSearchRaffleQuery(e.target.value)}
                  placeholder="Buscar nº (ej: 07) o alias..."
                  className="w-full bg-dark-950 border border-gold-500/30 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Grid de Números de la Rifa */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5 max-h-[28rem] overflow-y-auto pr-1">
              {Array.from({ length: totalRaffle }).map((_, idx) => {
                const numStr = String(idx).padStart(totalRaffle > 100 ? 3 : 2, '0');
                const assignedData = assignedMap[numStr];
                const isAssigned = !!assignedData;

                // Filtro tab
                if (numberTab === 'available' && isAssigned) return null;
                if (numberTab === 'assigned' && !isAssigned) return null;

                // Filtro busqueda
                if (searchRaffleQuery.trim()) {
                  const q = searchRaffleQuery.toLowerCase();
                  const matchesNum = numStr.includes(q);
                  const matchesBuyer = assignedData?.buyer?.toLowerCase().includes(q);
                  if (!matchesNum && !matchesBuyer) return null;
                }

                return (
                  <div
                    key={numStr}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[4rem] relative overflow-hidden ${
                      isAssigned
                        ? 'bg-bordeaux-700/70 border-bordeaux-500 text-ivory-100 shadow-md shadow-bordeaux-700/40'
                        : 'bg-dark-950/90 border-gold-500/40 text-gold-300 hover:border-gold-400 hover:bg-gold-500/10 hover:scale-105'
                    }`}
                  >
                    <span className={`font-mono text-sm font-bold tracking-widest ${isAssigned ? 'text-ivory-200 line-through opacity-80' : 'text-gold-300'}`}>
                      #{numStr}
                    </span>

                    {isAssigned ? (
                      <span className="text-[9px] font-sans font-bold text-gold-300 truncate max-w-full block mt-1 bg-dark-950/80 px-1.5 py-0.5 rounded border border-gold-500/30">
                        {assignedData.buyer}
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono tracking-wider uppercase text-gold-400/80 block mt-1">
                        DISPONIBLE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA para conseguir número */}
            <div className="pt-4 border-t border-gold-500/20 text-center space-y-3">
              <p className="text-xs text-ivory-300 font-sans">
                ¿Quieres asegurar tu número para el sorteo de la Casa? Adquiere tu participación directa o consulta con la Princesa.
              </p>
              <button
                onClick={onBackToStore}
                className="btn-royal-bordeaux"
              >
                <Sparkles className="w-4 h-4 text-gold-400" />
                Ver Piezas & Conseguir Número
              </button>
            </div>

          </div>
        </Reveal>
      </section>

      {/* CÓMO PARTICIPAR */}
      {!isOpen && (
        <section className="max-w-3xl mx-auto px-6 py-16">
          <Reveal>
            <div className="glass-panel p-8 md:p-10 space-y-6 text-center">
              <div className="wax-seal w-14 h-14 mx-auto text-lg font-bold">№</div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ivory-300">{defaults.howTitle}</h2>
              <p className="font-serif text-lg text-ivory-400 leading-relaxed whitespace-pre-line">
                {config.howToEnterBody || defaults.howBody}
              </p>
              {config.twitterUrl && state === 'live' && (
                <a href={config.twitterUrl} target="_blank" rel="noopener noreferrer" className="btn-royal mt-2">
                  <Twitter className="w-4 h-4" />
                  {copy.giveaway.states.live.cta}
                </a>
              )}
            </div>
          </Reveal>
        </section>
      )}

      {/* PRODUCTOS DESTACADOS */}
      {featuredItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-10">
          <Reveal className="text-center space-y-2">
            <p className="text-xs font-sans tracking-widest2 uppercase text-gold-400">Mientras esperas la coronación</p>
            <h2 className="font-display text-3xl font-bold text-ivory-300">Piezas elegidas de la Casa</h2>
            <div className="ornament-divider max-w-md mx-auto pt-4"><span className="om-center" /></div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map(item => (
              <Reveal key={item.id}>
                <ItemCard item={item} onBuyNow={onBuyNow} onViewDetails={onViewDetails} onAddToCart={onAddToCart} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CONDICIONES */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <Reveal>
          <div className="glass-panel p-6 md:p-8 border-l-2 border-l-gold-500 space-y-3">
            <h3 className="font-sans font-bold text-xs tracking-widest uppercase text-gold-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {defaults.termsTitle}
            </h3>
            <p className="text-xs font-mono text-gray-400 leading-relaxed whitespace-pre-line">
              {config.terms || defaults.terms}
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="pt-10 text-center">
          <button onClick={onBackToStore} className="btn-royal-outline">
            <ChevronLeft className="w-4 h-4" />
            Volver a la Tienda
          </button>
        </Reveal>
      </section>
    </main>
  );
}
