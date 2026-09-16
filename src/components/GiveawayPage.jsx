import React, { useEffect, useState } from 'react';
import { Crown, Gift, Clock, Sparkles, ShieldCheck, ChevronLeft, Twitter, Check, ShoppingCart, Dice5, CheckCircle2, X } from 'lucide-react';
import Reveal from './Reveal';
import ItemCard from './ItemCard';
import copy from '../copy';
import { resolveMediaUrl } from '../config';
import grandOpeningHeroImg from '../assets/grand-opening-hero.png';
import RafflePurchaseModal from './RafflePurchaseModal';

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

export default function GiveawayPage({ 
  launch, 
  onBackToStore, 
  onBuyNow, 
  onViewDetails, 
  onAddToCart,
  onOrderComplete,
  onRefreshLaunch,
  currentMember
}) {
  const [numberTab, setNumberTab] = useState('all');
  const [searchRaffleQuery, setSearchRaffleQuery] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [lastPurchased, setLastPurchased] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const config = launch?.config || {};
  const followers = launch?.followers || {};
  const featuredItems = Array.isArray(launch?.featuredItems) ? launch.featuredItems : [];

  const raffle = config.raffleNumbers || { total: 100, assigned: {} };
  const totalRaffle = typeof raffle.total === 'number' ? raffle.total : 100;
  const assignedMap = raffle.assigned || {};
  const assignedCount = Object.keys(assignedMap).length;
  const padLen = totalRaffle > 100 ? 3 : 2;
  const allAvailableNumbers = Array.from({ length: totalRaffle })
    .map((_, idx) => String(idx).padStart(padLen, '0'))
    .filter(numStr => !assignedMap[numStr]);
  const availableCount = allAvailableNumbers.length;

  const handleToggleNumber = (numStr) => {
    if (assignedMap[numStr]) {
      const assignedData = assignedMap[numStr];
      if (assignedData.status === 'PENDING') {
        setToastMessage(`El número #${numStr} tiene una solicitud pendiente de confirmación de pago por ${assignedData.buyer || 'otro participante'}. Si no se completa el abono, quedará libre.`);
      } else {
        setToastMessage(`El número #${numStr} ya pertenece oficialmente a ${assignedData.buyer || 'otro participante'}.`);
      }
      setTimeout(() => setToastMessage(null), 4500);
      return;
    }
    setSelectedNumbers(prev => 
      prev.includes(numStr) ? prev.filter(n => n !== numStr) : [...prev, numStr]
    );
  };

  const handleSelectRandom = (qty) => {
    const unselected = allAvailableNumbers.filter(n => !selectedNumbers.includes(n));
    if (unselected.length === 0) {
      setToastMessage('No quedan más números disponibles en el sorteo.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const shuffled = [...unselected].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, qty);
    setSelectedNumbers(prev => [...prev, ...picked]);
  };

  const handlePurchaseSuccess = (result) => {
    setLastPurchased(result);
    setSelectedNumbers([]);
    if (onRefreshLaunch) onRefreshLaunch();
  };

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
      {/* HERO DEL EVENTO (REFERENCIAS VISUALES ART DÉCO & LUXURY SERIF) */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-dark-950 via-dark-900 to-bordeaux-700/30 film-vignette py-20">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.15),transparent_60%)]" />
        <div className="absolute inset-x-8 top-24 hidden md:block border-t border-gold-500/20" />
        <div className="absolute inset-x-8 bottom-10 hidden md:block border-t border-gold-500/20" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
          
          {/* EMBLEMA Y TÍTULO OFICIAL ART DÉCO / LUXURY EDITORIAL (ALTA RESOLUCIÓN) */}
          <Reveal>
            <div className="relative flex flex-col items-center justify-center pt-2 pb-1">
              <img
                src={grandOpeningHeroImg}
                alt="CLUB PRIVADO - YAKUZA HOUSE - GRAND OPENING 2K GIVEAWAY — la inauguración oficial de la Casa —"
                className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto object-contain drop-shadow-[0_12px_45px_rgba(201,162,39,0.35)] select-none pointer-events-none transition-transform duration-700 hover:scale-[1.01]"
              />
              <h1 className="sr-only">
                CLUB PRIVADO - private membership · editorial luxury - YAKUZA HOUSE GRAND OPENING 2K GIVEAWAY — la inauguración oficial de la Casa —
              </h1>
            </div>
          </Reveal>

          {/* EJE INTERMEDIO DE IDENTIDAD */}
          <Reveal delay={180}>
            <div className="flex flex-col items-center justify-center my-1 opacity-85 select-none">
              <div className="w-[1px] h-3 bg-gold-500/40" />
              <span className="text-[10px] sm:text-xs font-mono tracking-[0.35em] text-gold-400/90 my-1">@spoilyakuza</span>
              <div className="w-[1px] h-3 bg-gold-500/40" />
            </div>
          </Reveal>

          {/* CUADRO DESTACADO CON LA FRASE SOLICITADA */}
          <Reveal delay={340}>
            <div className="glass-panel p-6 sm:p-8 border border-gold-500/35 rounded-2xl max-w-2xl mx-auto shadow-2xl bg-dark-950/80 backdrop-blur-md">
              <p className="font-serif italic text-lg sm:text-2xl text-ivory-300 leading-relaxed">
                “{stateCopy.body}”
              </p>
            </div>
          </Reveal>

          {/* Cuenta atrás */}
          {showCountdown && cd && !cd.done && (
            <Reveal delay={460}>
              <div className="flex items-center justify-center gap-3 md:gap-5 pt-2">
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
                <span>VENTA OFICIAL DE PAPELETAS · 3,00€ POR NÚMERO</span>
              </div>
              <h2 className="font-brand font-black text-3xl sm:text-4xl text-ivory-100">
                Elige tus Números para el Gran Sorteo
              </h2>
              <p className="text-xs sm:text-sm text-ivory-300 max-w-2xl mx-auto font-sans leading-relaxed">
                Cada número tiene un coste de <strong className="text-gold-400">3,00€</strong>. Selecciona tus números en la tabla, introduce tu <strong className="text-gold-300">usuario de X (Twitter)</strong> y tus participaciones quedarán asignadas de inmediato a tu nombre en tiempo real.
              </p>
            </div>

            {/* Notification Toast si clic en número asignado */}
            {toastMessage && (
              <div className="p-3 bg-bordeaux-700/60 border border-gold-500/40 text-gold-200 text-xs rounded-xl text-center shadow-lg animate-fade-in">
                {toastMessage}
              </div>
            )}

            {/* Confirmation Banner if recently purchased */}
            {lastPurchased && (
              <div className="p-6 bg-dark-950 border-2 border-gold-400 rounded-2xl text-center space-y-3 shadow-2xl animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 text-gold-400 border border-gold-400/50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-brand font-bold text-xl text-gold-300">¡Papeletas Reservadas Provisionalmente!</h3>
                <p className="text-xs text-ivory-200 max-w-lg mx-auto leading-relaxed">
                  Tus números <strong className="text-gold-400">{lastPurchased.numbers.map(n => `#${n}`).join(', ')}</strong> han sido registrados para el usuario <strong className="text-gold-300">{lastPurchased.buyer}</strong>.
                </p>
                <p className="text-[11px] text-amber-300/90 font-sans">
                  ⏳ Tus papeletas se encuentran en reserva provisional a la espera de comprobar el pago de {lastPurchased.totalAmount.toFixed(2)}€. Una vez verificado por la administración, quedarán asignadas de forma oficial y definitiva.
                </p>
                <p className="text-[11px] font-mono text-gray-400">
                  Pedido Nº: <span className="text-gold-400 font-bold">{lastPurchased.orderNumber}</span> · Total: {lastPurchased.totalAmount.toFixed(2)}€
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  {onOrderComplete && (
                    <button
                      onClick={() => onOrderComplete(lastPurchased.orderNumber)}
                      className="py-2 px-4 rounded-xl bg-gold-500 text-dark-950 font-sans font-bold text-xs hover:bg-gold-400 transition-all shadow-md"
                    >
                      Ver Justificante del Pedido
                    </button>
                  )}
                  <button
                    onClick={() => setLastPurchased(null)}
                    className="py-2 px-4 rounded-xl border border-gold-500/30 text-gold-400 font-sans text-xs hover:bg-gold-500/10"
                  >
                    Cerrar Aviso
                  </button>
                </div>
              </div>
            )}

            {/* Barra de Estadísticas & Contadores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-center">
              <div className="legibility-shield p-3.5 rounded-xl border border-gold-500/30">
                <span className="block text-2xl md:text-3xl font-mono font-bold text-ivory-100">{totalRaffle}</span>
                <span className="text-[10px] sm:text-xs font-sans tracking-wider uppercase text-gray-400">Total Papeletas</span>
              </div>
              <div className="legibility-shield p-3.5 rounded-xl border border-gold-500/50 bg-gold-500/10 shadow-lg shadow-gold-500/10">
                <span className="block text-2xl md:text-3xl font-mono font-bold text-gold-300">{availableCount}</span>
                <span className="text-[10px] sm:text-xs font-sans tracking-wider uppercase text-gold-400 font-semibold">Disponibles</span>
              </div>
              <div className="legibility-shield p-3.5 rounded-xl border border-bordeaux-500/50 bg-bordeaux-600/30 shadow-lg shadow-bordeaux-700/30">
                <span className="block text-2xl md:text-3xl font-mono font-bold text-bordeaux-300">{assignedCount}</span>
                <span className="text-[10px] sm:text-xs font-sans tracking-wider uppercase text-bordeaux-300 font-semibold">Vendidas</span>
              </div>
              <div className="legibility-shield p-3.5 rounded-xl border border-gold-400 bg-gradient-to-br from-gold-500/20 to-bordeaux-700/30 shadow-lg shadow-gold-500/15">
                <span className="block text-2xl md:text-3xl font-mono font-bold text-gold-300">3,00€</span>
                <span className="text-[10px] sm:text-xs font-sans tracking-wider uppercase text-gold-200 font-bold">Por Número</span>
              </div>
            </div>

            {/* Barra de Selección Rápida y Acciones */}
            <div className="p-4 rounded-2xl bg-dark-950/80 border border-gold-500/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-sans text-gold-400 font-semibold">Selección Rápida:</span>
                <button
                  type="button"
                  onClick={() => handleSelectRandom(1)}
                  className="py-1.5 px-3 rounded-lg bg-dark-900 border border-gold-500/30 hover:border-gold-400 text-gold-300 text-xs font-sans transition-all flex items-center gap-1.5"
                >
                  <Dice5 className="w-3.5 h-3.5 text-gold-400" />
                  +1 al azar (3€)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRandom(3)}
                  className="py-1.5 px-3 rounded-lg bg-dark-900 border border-gold-500/30 hover:border-gold-400 text-gold-300 text-xs font-sans transition-all flex items-center gap-1.5"
                >
                  <Dice5 className="w-3.5 h-3.5 text-gold-400" />
                  +3 al azar (9€)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRandom(5)}
                  className="py-1.5 px-3 rounded-lg bg-dark-900 border border-gold-500/30 hover:border-gold-400 text-gold-300 text-xs font-sans transition-all flex items-center gap-1.5"
                >
                  <Dice5 className="w-3.5 h-3.5 text-gold-400" />
                  +5 al azar (15€)
                </button>
                {selectedNumbers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedNumbers([])}
                    className="py-1.5 px-3 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white text-xs font-sans transition-all"
                  >
                    Deseleccionar todos
                  </button>
                )}
              </div>

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedNumbers.length === 0) {
                      handleSelectRandom(1);
                    }
                    setIsPurchaseModalOpen(true);
                  }}
                  className="btn-royal-bordeaux py-2 px-5 text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4 text-gold-400" />
                  {selectedNumbers.length > 0 ? (
                    <span>Comprar Selección ({selectedNumbers.length} nº = {(selectedNumbers.length * 3).toFixed(2)}€)</span>
                  ) : (
                    <span>Comprar Números (3€ c/u)</span>
                  )}
                </button>
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
                  Vendidas ({assignedCount})
                </button>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={searchRaffleQuery}
                  onChange={e => setSearchRaffleQuery(e.target.value)}
                  placeholder="Buscar nº (ej: 07) o alias de X..."
                  className="w-full bg-dark-950 border border-gold-500/30 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Grid de Números de la Rifa */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5 max-h-[30rem] overflow-y-auto pr-1">
              {Array.from({ length: totalRaffle }).map((_, idx) => {
                const numStr = String(idx).padStart(totalRaffle > 100 ? 3 : 2, '0');
                const assignedData = assignedMap[numStr];
                const isAssigned = !!assignedData;
                const isSelected = selectedNumbers.includes(numStr);

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

                const isPending = isAssigned && assignedData.status === 'PENDING';
                const isConfirmed = isAssigned && (!assignedData.status || assignedData.status === 'CONFIRMED');

                return (
                  <div
                    key={numStr}
                    onClick={() => handleToggleNumber(numStr)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[4.2rem] relative overflow-hidden cursor-pointer select-none ${
                      isSelected
                        ? 'bg-gradient-to-b from-bordeaux-600 to-bordeaux-700 border-2 border-gold-400 text-white shadow-lg shadow-gold-500/30 scale-105 ring-2 ring-gold-400/50'
                        : isPending
                          ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 hover:border-amber-400/80 hover:bg-amber-950/60 shadow-inner'
                          : isConfirmed
                            ? 'bg-bordeaux-950/80 border-bordeaux-800 text-gray-400 cursor-not-allowed opacity-80'
                            : 'bg-dark-950/90 border-gold-500/40 text-gold-300 hover:border-gold-400 hover:bg-gold-500/15 hover:scale-105'
                    }`}
                    title={
                      isSelected
                        ? `Número #${numStr} seleccionado (3€) - Clic para deseleccionar`
                        : isPending
                          ? `Número #${numStr} reservado provisionalmente por ${assignedData?.buyer} (pendiente de confirmación de pago)`
                          : isConfirmed
                            ? `Número #${numStr} asignado oficialmente a ${assignedData?.buyer}`
                            : `Número #${numStr} disponible (3€) - Clic para seleccionar`
                    }
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-gold-400 text-dark-950 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}

                    <span className={`font-mono text-sm font-bold tracking-widest ${
                      isSelected
                        ? 'text-white'
                        : isPending
                          ? 'text-amber-300'
                          : isConfirmed
                            ? 'text-gray-400 line-through'
                            : 'text-gold-300'
                    }`}>
                      #{numStr}
                    </span>

                    {isSelected ? (
                      <span className="text-[8px] font-mono tracking-wider uppercase text-gold-300 font-bold block mt-1 bg-dark-950/80 px-1 py-0.5 rounded">
                        3,00€ ✓
                      </span>
                    ) : isPending ? (
                      <span className="text-[8.5px] font-sans font-medium text-amber-300 truncate max-w-full block mt-1 bg-dark-950/90 px-1 py-0.5 rounded border border-amber-500/30">
                        ⏳ {assignedData.buyer} (Pendiente)
                      </span>
                    ) : isConfirmed ? (
                      <span className="text-[9px] font-sans font-bold text-gold-400/90 truncate max-w-full block mt-1 bg-dark-950/90 px-1 py-0.5 rounded border border-gold-500/20">
                        ✓ {assignedData.buyer}
                      </span>
                    ) : (
                      <span className="text-[8px] font-mono tracking-wider uppercase text-gold-400/80 block mt-1">
                        3,00€
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA para conseguir número */}
            <div className="pt-4 border-t border-gold-500/20 text-center space-y-3">
              <p className="text-xs text-ivory-300 font-sans">
                ¿Quieres asegurar tu número para el sorteo de la Casa? Haz clic sobre cualquier número disponible o pulsa el botón para formalizar tu compra directa por 3€ indicando tu usuario de X.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    if (selectedNumbers.length === 0) {
                      handleSelectRandom(1);
                    }
                    setIsPurchaseModalOpen(true);
                  }}
                  className="btn-royal-bordeaux"
                >
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Comprar Papeleta Oficial (3€ / número)</span>
                </button>
                <button
                  onClick={onBackToStore}
                  className="py-3 px-6 rounded-xl border border-gold-500/40 text-gold-300 hover:bg-gold-500/10 font-sans text-xs uppercase tracking-wider font-semibold transition-all"
                >
                  Explorar la Tienda
                </button>
              </div>
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

      {/* BARRA FLOTANTE DE PAPELETAS SELECCIONADAS */}
      {selectedNumbers.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-2xl mx-auto z-40 animate-slide-up">
          <div className="p-4 sm:p-5 rounded-2xl bg-dark-950/95 border-2 border-gold-500/60 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono font-bold text-gold-300 uppercase tracking-wider">
                  {selectedNumbers.length} {selectedNumbers.length === 1 ? 'número seleccionado' : 'números seleccionados'} (3,00€ / ud.)
                </p>
                <p className="text-xs text-ivory-200 truncate font-mono">
                  {selectedNumbers.map(n => `#${n}`).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setSelectedNumbers([])}
                className="p-2 text-gray-400 hover:text-gold-400 transition-colors"
                title="Deseleccionar todo"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPurchaseModalOpen(true)}
                className="btn-royal-bordeaux py-2.5 px-5 text-xs shadow-lg shadow-gold-500/20 whitespace-nowrap flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Comprar por {(selectedNumbers.length * 3).toFixed(2)}€</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE COMPRA DE NÚMEROS */}
      <RafflePurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        selectedNumbers={selectedNumbers}
        availableNumbers={allAvailableNumbers}
        onToggleNumber={handleToggleNumber}
        onClearNumbers={() => setSelectedNumbers([])}
        onPurchaseSuccess={handlePurchaseSuccess}
        currentMember={currentMember}
      />
    </main>
  );
}
