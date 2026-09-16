import React, { useState, useEffect } from 'react';
import { X, Gift, Crown, CreditCard, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Twitter, Plus, Trash2 } from 'lucide-react';
import { API_BASE } from '../config';

export default function RafflePurchaseModal({
  isOpen,
  onClose,
  selectedNumbers = [],
  availableNumbers = [],
  onToggleNumber,
  onClearNumbers,
  onPurchaseSuccess,
  currentMember
}) {
  const [twitterHandle, setTwitterHandle] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BIZUM');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill if member has alias
  useEffect(() => {
    if (currentMember && !twitterHandle) {
      if (currentMember.alias) {
        setTwitterHandle(currentMember.alias.startsWith('@') ? currentMember.alias : `@${currentMember.alias}`);
      }
    }
  }, [currentMember, isOpen]);

  if (!isOpen) return null;

  const pricePerNumber = 3.0;
  const count = selectedNumbers.length;
  const totalAmount = count * pricePerNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanTwitter = twitterHandle.trim();
    if (!cleanTwitter || cleanTwitter === '@') {
      setErrorMessage('Debes indicar tu usuario de X (Twitter) para registrar tus números del sorteo.');
      return;
    }

    if (count === 0) {
      setErrorMessage('Debes seleccionar al menos un número para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/store/raffle/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: selectedNumbers,
          twitterHandle: cleanTwitter,
          email: email.trim() || undefined,
          alias: currentMember?.alias || cleanTwitter,
          paymentMethod,
          buyerNotes: buyerNotes.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la compra de papeletas');
      }

      onPurchaseSuccess(data);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRandomNumber = () => {
    const unselected = availableNumbers.filter(n => !selectedNumbers.includes(n));
    if (unselected.length > 0) {
      const randomNum = unselected[Math.floor(Math.random() * unselected.length)];
      onToggleNumber(randomNum);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-dark-900 border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-ivory-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gold-400 transition-colors p-1"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-sans tracking-widest uppercase">
            <Gift className="w-4 h-4 text-gold-400" />
            <span>GRAND OPENING 2K GIVEAWAY</span>
          </div>
          <h2 className="font-brand font-black text-2xl sm:text-3xl text-white">
            Adquisición de Números
          </h2>
          <p className="text-xs text-ivory-300 font-sans">
            Precio oficial: <strong className="text-gold-400 font-bold">3,00€ por número</strong>. Asignación inmediata en el tablero.
          </p>
        </div>

        {/* Selected Numbers Tray */}
        <div className="bg-dark-950/80 p-4 rounded-2xl border border-gold-500/30 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-sans font-semibold text-gold-400 uppercase tracking-wider">
              Tus Números Seleccionados ({count}):
            </span>
            {count > 0 && (
              <button
                type="button"
                onClick={onClearNumbers}
                className="text-[11px] font-sans text-gray-400 hover:text-bordeaux-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Limpiar
              </button>
            )}
          </div>

          {count === 0 ? (
            <div className="text-center py-4 text-xs font-sans text-gray-400 space-y-2">
              <p>No tienes ningún número seleccionado aún.</p>
              <button
                type="button"
                onClick={handleAddRandomNumber}
                className="py-1.5 px-3 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-sans hover:bg-gold-500/20 transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir un número al azar (3€)
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
              {selectedNumbers.map(num => (
                <span
                  key={num}
                  className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-bordeaux-600/40 border border-gold-500/50 text-gold-300 font-mono text-xs font-bold shadow-sm"
                >
                  #{num}
                  <button
                    type="button"
                    onClick={() => onToggleNumber(num)}
                    className="hover:text-white transition-colors"
                    title="Quitar número"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {availableNumbers.length > selectedNumbers.length && (
                <button
                  type="button"
                  onClick={handleAddRandomNumber}
                  className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-dark-900 border border-gold-500/30 text-gold-400 text-xs font-sans hover:bg-gold-500/10 hover:border-gold-400 transition-all"
                  title="Añadir otro número al azar"
                >
                  <Plus className="w-3 h-3" />
                  +1 nº
                </button>
              )}
            </div>
          )}

          {/* Pricing Calculation */}
          <div className="pt-3 border-t border-gold-500/20 flex justify-between items-center text-xs">
            <span className="text-ivory-300 font-sans">
              {count} papeleta{count !== 1 ? 's' : ''} × 3,00€:
            </span>
            <span className="font-mono text-lg font-bold text-gold-300">
              {totalAmount.toFixed(2)}€
            </span>
          </div>
        </div>

        {/* Purchase Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          {/* User X Handle (OBLIGATORIO) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gold-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5 text-gold-400" />
                Tu Usuario de X (Twitter) *
              </span>
              <span className="text-[10px] text-bordeaux-300 font-mono normal-case tracking-normal">Obligatorio</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@tu_usuario_x"
                required
                className="w-full bg-dark-950 border border-gold-500/40 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 shadow-inner"
              />
            </div>
            <p className="text-[11px] text-ivory-400 font-sans leading-relaxed">
              Tus números quedarán registrados públicamente con este usuario en el tablero. Si ganas, la Princesa te contactará por mensaje directo en X.
            </p>
          </div>

          {/* Email (Opcional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ivory-300 uppercase tracking-wider">
              Email para Justificante (Opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu_email@ejemplo.com"
              className="w-full bg-dark-950 border border-gold-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-400"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'BIZUM', label: 'Bizum (Recomendado)', desc: 'Envío instantáneo' },
                { id: 'STRIPE_CARD', label: 'Tarjeta Bancaria', desc: 'Stripe / Apple / Google' },
                { id: 'PAYPAL', label: 'PayPal', desc: 'Pago seguro' },
                { id: 'BANK_TRANSFER', label: 'Transferencia', desc: 'Cuenta SEPA' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    paymentMethod === m.id
                      ? 'bg-bordeaux-600/40 border-gold-400 text-gold-200 shadow-md'
                      : 'bg-dark-950/80 border-gold-500/20 text-gray-400 hover:text-ivory-200'
                  }`}
                >
                  <span className="block font-semibold text-xs text-white">{m.label}</span>
                  <span className="block text-[10px] text-gray-400">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buyer Notes (Opcional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ivory-300 uppercase tracking-wider">
              Nota o Mensaje (Opcional)
            </label>
            <input
              type="text"
              value={buyerNotes}
              onChange={(e) => setBuyerNotes(e.target.value)}
              placeholder="Mensaje de devoción o nota adicional..."
              className="w-full bg-dark-950 border border-gold-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-400"
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-crimson-600/20 border border-crimson-500/60 text-crimson-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-crimson-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Security & Terms note */}
          <div className="pt-2 flex items-start gap-2 text-[11px] text-ivory-400 font-sans">
            <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
            <span>
              Tus números quedarán en reserva provisional. Una vez verificado el abono (Bizum, tarjeta o transferencia) por administración, se confirmarán oficialmente a tu nombre de X.
            </span>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || count === 0}
              className={`w-full py-3 px-6 rounded-xl font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-xl transition-all ${
                submitting || count === 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'btn-royal-bordeaux'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                  <span>Procesando solicitud...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Solicitar Papeletas ({totalAmount.toFixed(2)}€)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
