import React, { useState, useEffect } from 'react';
import { Gift, Heart, Sparkles, CheckCircle2, CreditCard, X, ShieldCheck, ArrowRight, Users } from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../config';

export function CrowdfundingSection({ currentMember = null }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Formulario de aportación
  const [amount, setAmount] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [contactChannel, setContactChannel] = useState('TELEGRAM');
  const [contactHandle, setContactHandle] = useState('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('STRIPE_CARD');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/store/crowdfunding/goals`);
      const data = await res.json();
      if (Array.isArray(data)) setGoals(data);
    } catch (e) {
      console.error('Error cargando objetivos de crowdfunding:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const openContribute = (goal) => {
    setSelectedGoal(goal);
    const defaultAmt = goal.suggestedAmounts?.[1] || goal.suggestedAmounts?.[0] || goal.minContribution || 20;
    setAmount(String(defaultAmt));
    setAlias(currentMember?.alias || '');
    setEmail(currentMember?.email || '');
    setContactHandle(currentMember?.telegram || '');
    setMessage('');
    setPaymentMethod('STRIPE_CARD');
    setIsAnonymous(false);
    setErrorMsg('');
    setCreatedOrder(null);
  };

  const handleSubmitContribution = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setErrorMsg('');

    const numAmt = parseFloat(amount);
    if (!numAmt || numAmt < (selectedGoal.minContribution || 1)) {
      setErrorMsg(`El importe mínimo para este objetivo es de ${selectedGoal.minContribution || 1}€.`);
      return;
    }
    if (!alias.trim()) {
      setErrorMsg('Indica tu alias o nombre para registrar la aportación.');
      return;
    }

    setSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('yakuza_member_token') || localStorage.getItem('yakuza_kingdom_token')) : null;
      const res = await fetch(`${API_BASE}/api/store/crowdfunding/goals/${selectedGoal.id}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: numAmt,
          alias: alias.trim(),
          email: email.trim() || null,
          contactChannel,
          contactHandle: contactHandle.trim() || null,
          message: message.trim() || null,
          paymentMethod,
          isAnonymous
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error registrando aportación');

      const contribution = data.contribution;

      // Si eligió Stripe, redirigir a Stripe Checkout automáticamente
      if (paymentMethod === 'STRIPE_CARD') {
        const stripeRes = await fetch(
          `${API_BASE}/api/store/crowdfunding/contributions/${contribution.orderNumber}/create-checkout-session`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin: window.location.origin })
          }
        );
        const stripeData = await stripeRes.json();
        if (stripeRes.ok && stripeData.url) {
          window.location.href = stripeData.url;
          return;
        }
        // Si Stripe no está disponible, mostrar instrucciones alternativas
        setErrorMsg(stripeData.error || 'Stripe no disponible; puedes completar el pago por Bizum o Transferencia.');
      }

      setCreatedOrder(contribution);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-xs font-mono text-gold-400 animate-pulse">
        Cargando objetivos de regalos y crowdfunding...
      </div>
    );
  }

  if (goals.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gold-500/25 pb-4">
        <div>
          <span className="text-xs font-mono text-gold-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" />
            Wishlist & Crowdfunding Directo · Sin Comisiones
          </span>
          <h2 className="font-brand font-extrabold text-2xl sm:text-3xl text-ivory-100 mt-1">
            Objetivos de Regalo de la Princesa
          </h2>
          <p className="text-xs sm:text-sm text-ivory-300 mt-1 max-w-2xl">
            Contribuye con la cantidad que desees para financiar cada capricho u objetivo. Los pagos confirmados se suman al progreso y a tu historial personal del Reino.
          </p>
        </div>
      </div>

      {/* Grid de Objetivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="group rounded-2xl overflow-hidden border border-gold-500/30 hover:border-gold-400/70 bg-gradient-to-b from-dark-900/95 to-dark-950 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              {/* Imagen del objetivo */}
              <div className="relative h-56 w-full bg-dark-950 overflow-hidden border-b border-gold-500/20">
                {goal.imageUrl ? (
                  <img
                    src={resolveMediaUrl(goal.imageUrl)}
                    alt={goal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bordeaux-950 to-dark-950">
                    <Gift className="w-12 h-12 text-gold-500/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {goal.isCompleted ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-dark-950 font-mono text-[10px] font-bold uppercase flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3 h-3" /> ¡Objetivo Conseguido!
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-dark-950/85 border border-gold-400/50 text-gold-300 font-mono text-[10px] font-bold uppercase shadow">
                      {goal.progressPercent}% financiado
                    </span>
                  )}
                </div>

                {goal.featured && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gold-500 text-dark-950 font-mono text-[10px] font-bold uppercase shadow">
                    ★ Destacado
                  </span>
                )}
              </div>

              {/* Contenido y métricas */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-brand font-bold text-xl text-white group-hover:text-gold-200 transition-colors">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-xs text-ivory-300/90 leading-relaxed mt-1.5 line-clamp-3">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Barra de progreso */}
                <div className="space-y-2">
                  <div className="w-full h-3 rounded-full bg-dark-950 border border-gold-500/25 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        goal.isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-300'
                          : 'bg-gradient-to-r from-bordeaux-600 via-gold-500 to-amber-300'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(goal.progressPercent > 0 ? 4 : 0, goal.progressPercent))}%` }}
                    />
                  </div>

                  {/* Importe objetivo / conseguido / restante */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-dark-950/90 border border-gray-800">
                      <span className="block text-[9px] font-mono uppercase text-gray-400">Conseguido</span>
                      <span className="font-mono font-bold text-sm text-emerald-400">
                        {Number(goal.raisedAmount || 0).toFixed(0)}€
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-dark-950/90 border border-gray-800">
                      <span className="block text-[9px] font-mono uppercase text-gray-400">Restante</span>
                      <span className="font-mono font-bold text-sm text-amber-300">
                        {Number(goal.remainingAmount || 0).toFixed(0)}€
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-dark-950/90 border border-gold-500/20">
                      <span className="block text-[9px] font-mono uppercase text-gray-400">Objetivo</span>
                      <span className="font-mono font-bold text-sm text-gold-300">
                        {Number(goal.targetAmount || 0).toFixed(0)}€
                      </span>
                    </div>
                  </div>
                </div>

                {/* Últimos contribuyentes */}
                {goal.recentContributors && goal.recentContributors.length > 0 && (
                  <div className="pt-2 border-t border-gray-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                      <Users className="w-3 h-3 text-gold-400" /> Últimas aportaciones:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {goal.recentContributors.slice(0, 4).map((c) => (
                        <span key={c.id} className="px-2 py-0.5 rounded-md bg-dark-950 border border-gold-500/20 text-[10px] font-mono text-ivory-200">
                          {c.alias} · <strong className="text-gold-300">{c.amount}€</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón Aportar */}
            <div className="p-5 pt-0">
              <button
                type="button"
                onClick={() => openContribute(goal)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-bordeaux-700 via-bordeaux-600 to-gold-600 hover:from-bordeaux-600 hover:to-gold-500 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01]"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>{goal.isCompleted ? 'Enviar Aportación Extra' : 'Realizar Aportación Voluntaria'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE APORTACIÓN VOLUNTARIA */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-2xl p-6 max-w-lg w-full border border-gold-500/40 text-gray-100 space-y-5 my-8">
            <div className="flex justify-between items-start gap-3 pb-3 border-b border-gray-800">
              <div>
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest">Aportación Crowdfunding</span>
                <h3 className="font-brand font-bold text-xl text-white mt-0.5">{selectedGoal.title}</h3>
              </div>
              <button onClick={() => setSelectedGoal(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdOrder ? (
              <div className="space-y-4 text-center py-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-brand font-bold text-xl text-white">¡Aportación Registrada!</h4>
                  <p className="text-xs font-mono text-gold-300 mt-1">Referencia: {createdOrder.orderNumber}</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-950 border border-gold-500/30 text-left text-xs space-y-2">
                  <p className="text-ivory-200">
                    Importe: <strong className="text-gold-300">{Number(createdOrder.amount).toFixed(2)}€</strong> · Método: <strong className="text-white">{createdOrder.paymentMethod}</strong>
                  </p>
                  <p className="text-gray-400 leading-relaxed">
                    Envía tu pago indicando la referencia <strong className="text-gold-300">{createdOrder.orderNumber}</strong>. En cuanto la Princesa confirme la recepción, el progreso del objetivo y tu historial personal se actualizarán automáticamente.
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedGoal(null); fetchGoals(); }}
                  className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitContribution} className="space-y-4 text-xs">
                {/* Importes sugeridos */}
                <div>
                  <label className="block font-mono text-gold-300 uppercase mb-2">Elige o escribe tu aportación (€)</label>
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {(selectedGoal.suggestedAmounts || [10, 25, 50, 100]).map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setAmount(String(val))}
                        className={`px-3.5 py-2 rounded-xl font-mono font-bold border transition-all ${
                          Number(amount) === val
                            ? 'bg-gold-500 text-dark-950 border-gold-400 shadow'
                            : 'bg-dark-950 text-ivory-200 border-gray-700 hover:border-gold-500/50'
                        }`}
                      >
                        {val}€
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={selectedGoal.minContribution || 1}
                    step="0.5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Mínimo ${selectedGoal.minContribution || 5}€`}
                    className="w-full bg-dark-950 border border-gold-500/40 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-gold-300 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-gray-400 mb-1">Tu Alias / Nombre *</label>
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      placeholder="Ej: Kenshi"
                      className="w-full bg-dark-950 border border-gray-700 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-gray-400 mb-1">Email (para vincular a tu perfil)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full bg-dark-950 border border-gray-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-gray-400 mb-1">Canal de contacto</label>
                    <select
                      value={contactChannel}
                      onChange={(e) => setContactChannel(e.target.value)}
                      className="w-full bg-dark-950 border border-gray-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="TELEGRAM">Telegram</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="X">X / Twitter</option>
                      <option value="EMAIL">Email</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-gray-400 mb-1">Usuario / Contacto</label>
                    <input
                      type="text"
                      value={contactHandle}
                      onChange={(e) => setContactHandle(e.target.value)}
                      placeholder="@usuario"
                      className="w-full bg-dark-950 border border-gray-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Método de pago propio */}
                <div>
                  <label className="block font-mono text-gold-300 uppercase mb-1.5">Método de Pago Directo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'STRIPE_CARD', label: 'Tarjeta (Stripe · Automático)' },
                      { id: 'BIZUM', label: 'Bizum Directo' },
                      { id: 'PAYPAL', label: 'PayPal' },
                      { id: 'BANK_TRANSFER', label: 'Transferencia Bancaria' }
                    ].map((pm) => (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-2.5 rounded-xl border text-left font-mono text-[11px] transition-all flex items-center gap-2 ${
                          paymentMethod === pm.id
                            ? 'bg-gold-500/20 border-gold-400 text-gold-200 font-bold'
                            : 'bg-dark-950 border-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span>{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-gray-400 mb-1">Nota o dedicatoria (opcional)</label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Un mensaje breve para la Princesa..."
                    className="w-full bg-dark-950 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span>Mostrarme como "Devoto Anónimo" en la lista pública del objetivo</span>
                </label>

                {errorMsg && (
                  <p className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 font-mono">
                    {errorMsg}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setSelectedGoal(null)}
                    className="py-2.5 px-4 rounded-xl bg-dark-900 border border-gray-700 text-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2.5 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {submitting ? 'Procesando...' : `Aportar ${amount || 0}€`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
