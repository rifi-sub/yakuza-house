import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ArrowRight, ArrowLeft, CreditCard, Send, Sparkles, AlertCircle, Package, Truck, Clock, Calendar, Video, Headphones, Crown, Minus, Plus } from 'lucide-react';
import { API_BASE } from '../config';

function parseItemConfig(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function CheckoutModal({ item, onClose, onOrderComplete }) {
  if (!item) return null;

  const productType = (item.productType || 'PHYSICAL').toUpperCase();
  const itemConfig = useMemo(() => parseItemConfig(item.purchaseConfig), [item.purchaseConfig]);

  const isPhysical = productType === 'PHYSICAL';
  const isCustomMedia = productType === 'CUSTOM_VIDEO' || productType === 'CUSTOM_AUDIO';
  const isBill = productType === 'BILL';
  const isSubscription = productType === 'SUBSCRIPTION';
  const isDigitalDirect = ['LIBRARY_VIDEO', 'LIBRARY_AUDIO', 'AUDIENCE', 'TRIBUTE'].includes(productType);

  // Pasos dinámicos: productos físicos tienen 3 pasos (Configurar -> Extras y Envío -> Contacto y Pago);
  // digitales/suscripciones/facturas/custom tienen 2 pasos limpios (Configurar -> Contacto y Pago)
  const totalSteps = isPhysical ? 3 : 2;
  const [step, setStep] = useState(1);

  // Tiers (solo para productos físicos sin variantes obligatorias o como complemento)
  const defaultTiers = [
    {
      id: 'tier-basic',
      tierType: 'BASIC',
      name: 'Opción básica',
      description: 'Incluye solamente el artículo y lo especificado en su descripción.',
      price: item.basePrice,
      includesText: 'Artículo y embalaje estándar',
      isHighlighted: false
    },
    {
      id: 'tier-extras',
      tierType: 'EXTRAS',
      name: 'Opción con extras',
      description: 'Incluye el artículo y determinados complementos seleccionables a tu medida.',
      price: item.basePrice + 15,
      includesText: 'Artículo + Complementos personalizados',
      isHighlighted: true,
      savingsText: 'Mejor relación contenido/precio'
    },
    {
      id: 'tier-full',
      tierType: 'FULL_PACK',
      name: 'Pack completo',
      description: 'Incluye el artículo junto con un conjunto de todos los extras a un precio cerrado rebajado.',
      price: item.basePrice + 30,
      includesText: 'Artículo + Todos los extras + Descuento cerrado del 25%',
      isHighlighted: true,
      savingsText: '¡Ahorras 20€ respecto a comprar extras por separado!'
    }
  ];

  const tiers = (item.tiers && item.tiers.length > 0) ? item.tiers : defaultTiers;
  const availableVariants = useMemo(() => {
    const raw = Array.isArray(itemConfig.variants) ? itemConfig.variants : [];
    return raw.filter(v => v.available !== false);
  }, [itemConfig]);

  // Estado adaptado por tipo
  const [selectedTier, setSelectedTier] = useState(isPhysical ? (tiers[0]) : tiers[0]);
  const [selectedVariant, setSelectedVariant] = useState(availableVariants[0] || null);
  const [quantity, setQuantity] = useState(1);

  // Custom Video / Audio
  const minMinutes = Math.max(1, Number(itemConfig.minMinutes || 1));
  const maxMinutes = Math.max(minMinutes, Number(itemConfig.maxMinutes || 30));
  const pricePerMinute = Number(itemConfig.pricePerMinute ?? item.basePrice ?? 15);
  const baseFee = Number(itemConfig.baseFee || 0);
  const [durationMinutes, setDurationMinutes] = useState(minMinutes);

  // Bill / Subscription months
  const allowedMonths = useMemo(() => {
    if (Array.isArray(itemConfig.allowedMonths) && itemConfig.allowedMonths.length > 0) {
      return itemConfig.allowedMonths.map(Number).filter(n => n > 0);
    }
    return isBill ? [1, 3, 6, 12] : [1];
  }, [itemConfig, isBill]);
  const [selectedMonths, setSelectedMonths] = useState(allowedMonths[0] || 1);

  // Tribute custom amount
  const [customAmount, setCustomAmount] = useState(String(item.basePrice || 20));

  // Extras, Embalaje y Métodos de Envío (Físicos)
  const [availableExtras, setAvailableExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState({});
  const [packagingOptions, setPackagingOptions] = useState([]);
  const [selectedPackaging, setSelectedPackaging] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  // Contacto y Pago
  const defaultChannel = isSubscription && itemConfig.platform
    ? (itemConfig.platform.toUpperCase() === 'INSTAGRAM' ? 'INSTAGRAM' : 'TELEGRAM')
    : 'TELEGRAM';
  const [alias, setAlias] = useState('');
  const [contactChannel, setContactChannel] = useState(defaultChannel);
  const [contactHandle, setContactHandle] = useState('');
  const [email, setEmail] = useState('');
  const [discretionPreference, setDiscretionPreference] = useState(true);
  const [vintedPreference, setVintedPreference] = useState('DIRECT');
  const [paymentMethod, setPaymentMethod] = useState('STRIPE_CARD');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isPhysical) {
      fetch(`${API_BASE}/api/store/extras?itemId=${item.id}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setAvailableExtras(data); })
        .catch(() => {});

      fetch(`${API_BASE}/api/store/packaging`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPackagingOptions(data);
            if (data.length > 0) setSelectedPackaging(data[0]);
          }
        })
        .catch(() => {});

      fetch(`${API_BASE}/api/store/shipping-methods`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setShippingMethods(data);
            if (data.length > 0) setSelectedShipping(data[0]);
          }
        })
        .catch(() => {});
    }
  }, [item.id, isPhysical]);

  // Cálculo de precios en tiempo real
  let mainPrice = item.basePrice || 0;
  let mainSummaryLabel = selectedTier?.name || 'Básica';

  if (isPhysical) {
    const tierDelta = selectedTier ? Math.max(0, selectedTier.price - item.basePrice) : 0;
    const unitBase = selectedVariant ? Number(selectedVariant.price) : item.basePrice;
    mainPrice = (unitBase + tierDelta) * quantity;
    mainSummaryLabel = selectedVariant
      ? `${selectedVariant.label}${quantity > 1 ? ` ×${quantity}` : ''}`
      : `${selectedTier?.name || 'Básica'}${quantity > 1 ? ` ×${quantity}` : ''}`;
  } else if (isCustomMedia) {
    mainPrice = Math.round((baseFee + durationMinutes * pricePerMinute) * 100) / 100;
    mainSummaryLabel = `${durationMinutes} min × ${pricePerMinute}€/min`;
  } else if (isBill) {
    const monthly = Number(itemConfig.monthlyAmount ?? item.basePrice ?? 0);
    mainPrice = Math.round((monthly * selectedMonths) * 100) / 100;
    mainSummaryLabel = `${selectedMonths} ${selectedMonths === 1 ? 'mes' : 'meses'} × ${monthly}€/mes`;
  } else if (isSubscription) {
    const monthly = Number(itemConfig.monthlyPrice ?? item.basePrice ?? 0);
    mainPrice = Math.round((monthly * selectedMonths) * 100) / 100;
    mainSummaryLabel = `Suscripción ${selectedMonths} ${selectedMonths === 1 ? 'mes' : 'meses'}`;
  } else if (productType === 'TRIBUTE' && itemConfig.allowCustomAmount) {
    mainPrice = Math.max(1, parseFloat(customAmount) || item.basePrice || 0);
    mainSummaryLabel = 'Aportación directa';
  }

  let extrasPrice = 0;
  if (isPhysical) {
    Object.entries(selectedExtras).forEach(([extraId, qty]) => {
      const ex = availableExtras.find(e => e.id === extraId);
      if (ex && qty > 0) extrasPrice += ex.price * qty;
    });
  }

  const packagingPrice = isPhysical && selectedPackaging ? selectedPackaging.price : 0;
  const shippingPrice = isPhysical && selectedShipping ? selectedShipping.price : 0;
  const totalPrice = Math.round((mainPrice + extrasPrice + packagingPrice + shippingPrice) * 100) / 100;

  const handleExtraQuantityChange = (extraId, delta, maxQty = 10) => {
    setSelectedExtras(prev => {
      const current = prev[extraId] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[extraId];
        return copy;
      }
      return { ...prev, [extraId]: next };
    });
  };

  const handleSubmitOrder = async () => {
    if (!alias.trim()) {
      setErrorMessage('Por favor, indica tu nombre o alias para el pedido.');
      return;
    }
    if (!contactHandle.trim()) {
      setErrorMessage(`Por favor, indica tu usuario o contacto de ${contactChannel}.`);
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage('Debes aceptar los términos y condiciones para proceder con el pago.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const extrasArray = isPhysical
        ? Object.entries(selectedExtras).map(([extraId, qty]) => {
            const ex = availableExtras.find(e => e.id === extraId);
            return {
              extraId,
              extraName: ex ? ex.name : 'Extra',
              unitPrice: ex ? ex.price : 0,
              quantity: qty
            };
          })
        : [];

      const payload = {
        itemId: item.id,
        tierId: isPhysical ? selectedTier?.id : null,
        extras: extrasArray,
        packagingOptionId: isPhysical ? selectedPackaging?.id : null,
        shippingMethodId: isPhysical ? selectedShipping?.id : null,
        quantity: isPhysical ? quantity : 1,
        selectedVariant: isPhysical && selectedVariant ? selectedVariant : null,
        selectedDurationMinutes: isCustomMedia ? durationMinutes : null,
        selectedMonths: (isBill || isSubscription) ? selectedMonths : null,
        customAmount: productType === 'TRIBUTE' && itemConfig.allowCustomAmount ? parseFloat(customAmount) : null,
        purchaseDetails: {
          productType,
          summary: mainSummaryLabel,
          platform: itemConfig.platform || null
        },
        alias: alias.trim(),
        contactChannel,
        contactHandle: contactHandle.trim(),
        email: email.trim() || null,
        discretionPreference: isPhysical ? discretionPreference : false,
        vintedPreference: isPhysical ? vintedPreference : 'DIGITAL',
        paymentMethod,
        buyerNotes: buyerNotes.trim(),
        acceptedTerms
      };

      const memberToken = typeof window !== 'undefined' ? localStorage.getItem('yakuza_member_token') : null;
      const res = await fetch(`${API_BASE}/api/store/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(memberToken ? { Authorization: `Bearer ${memberToken}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar el pedido.');

      if (paymentMethod === 'STRIPE_CARD') {
        const stripeRes = await fetch(`${API_BASE}/api/store/orders/${data.orderNumber}/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin: window.location.href })
        });
        const stripeData = await stripeRes.json();
        if (stripeRes.ok && stripeData.url) {
          window.location.href = stripeData.url;
          return;
        }
      }

      onOrderComplete(data.orderNumber);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Ocurrió un error al enviar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactChannels = [
    { id: 'TELEGRAM', name: 'Telegram', placeholder: '@tu_usuario' },
    { id: 'INSTAGRAM', name: 'Instagram', placeholder: '@tu_usuario' },
    { id: 'EMAIL', name: 'Correo Electrónico', placeholder: 'tu@email.com' },
    { id: 'WHATSAPP', name: 'WhatsApp', placeholder: '+34 600 000 000' },
    { id: 'X', name: 'X (Twitter)', placeholder: '@tu_usuario' },
    { id: 'DISCORD', name: 'Discord', placeholder: 'usuario#0000' },
    { id: 'OTHER', name: 'Otro canal', placeholder: 'Contacto o instrucciones' }
  ];

  const currentChannelObj = contactChannels.find(c => c.id === contactChannel) || contactChannels[0];
  const isFinalStep = step === totalSteps;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-lg">
      <div className="relative w-full max-w-3xl glass-modal rounded-2xl overflow-hidden text-gray-100 shadow-2xl my-6">

        {/* Header */}
        <div className="bg-dark-900/90 p-5 border-b border-crimson-600/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-crimson-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-gold-400" />
              {isBill ? 'Financiación de Factura' :
               isSubscription ? 'Suscripción VIP' :
               isCustomMedia ? 'Contenido Personalizado' :
               isDigitalDirect ? 'Entrega Digital / Directa' :
               'Configurador de Pedido'} • {item.code}
            </div>
            <h2 className="font-sans font-bold text-lg text-white">{item.name}</h2>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-dark-800 text-gray-400 hover:text-white border border-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-dark-950 px-6 py-3 border-b border-gray-800 flex items-center justify-between text-xs font-mono">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-gold-400 font-bold' : 'text-gray-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-gold-500 text-dark-900' : 'bg-gray-800'}`}>1</span>
            <span>{isBill ? 'Duración (Meses)' : isCustomMedia ? 'Duración (Minutos)' : isSubscription ? 'Plan' : 'Configuración'}</span>
          </div>
          {isPhysical && (
            <>
              <div className="h-0.5 w-8 bg-gray-800" />
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-gold-400 font-bold' : 'text-gray-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-gold-500 text-dark-900' : 'bg-gray-800'}`}>2</span>
                <span>Extras y Envío</span>
              </div>
            </>
          )}
          <div className="h-0.5 w-8 bg-gray-800" />
          <div className={`flex items-center gap-2 ${isFinalStep ? 'text-gold-400 font-bold' : 'text-gray-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isFinalStep ? 'bg-gold-500 text-dark-900' : 'bg-gray-800'}`}>{totalSteps}</span>
            <span>Contacto y Pago</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">

          {/* =============================================================== */}
          {/* PASO 1: ADAPTADO AL TIPO DE PRODUCTO                            */}
          {/* =============================================================== */}
          {step === 1 && (
            <div className="space-y-6">

              {/* A) PRODUCTO FÍSICO: Variantes + Cantidad + Modalidad */}
              {isPhysical && (
                <>
                  {availableVariants.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-sans font-bold text-sm text-gold-300 uppercase tracking-wider">
                        Elige variedad / tamaño / capacidad
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableVariants.map((v, idx) => {
                          const active = selectedVariant?.id ? selectedVariant.id === v.id : selectedVariant?.label === v.label;
                          return (
                            <button
                              type="button"
                              key={v.id || idx}
                              onClick={() => setSelectedVariant(v)}
                              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                                active
                                  ? 'bg-crimson-900/30 border-gold-400 text-white shadow'
                                  : 'bg-dark-900/70 border-gray-800 text-gray-300 hover:border-gray-600'
                              }`}
                            >
                              <div>
                                {v.group && <span className="text-[10px] font-mono uppercase text-gold-400 block">{v.group}</span>}
                                <span className="font-sans font-bold text-sm">{v.label}</span>
                              </div>
                              <span className="font-mono font-bold text-base text-gold-300">{Number(v.price).toFixed(2)}€</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cantidad */}
                  {itemConfig.allowQuantity !== false && (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-dark-900/70 border border-gray-800">
                      <div>
                        <span className="font-sans font-bold text-sm text-white block">Cantidad</span>
                        <span className="text-xs text-gray-400">Selecciona cuántas unidades deseas adquirir</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded-lg bg-dark-950 border border-gray-700 flex items-center justify-center hover:border-gold-400"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-bold text-base w-6 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.min(Number(itemConfig.maxQuantity || 10), q + 1))}
                          className="w-8 h-8 rounded-lg bg-dark-950 border border-gray-700 flex items-center justify-center hover:border-gold-400"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Modalidades / Tiers */}
                  <div className="space-y-3">
                    <h3 className="font-sans font-bold text-sm text-white">Modalidad del pedido</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {tiers.map((tier) => {
                        const isSelected = selectedTier?.id === tier.id;
                        return (
                          <div
                            key={tier.id}
                            onClick={() => setSelectedTier(tier)}
                            className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-crimson-900/30 border-crimson-500 shadow-lg ring-1 ring-crimson-500'
                                : 'bg-dark-900/60 border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-1.5">
                                <h4 className="font-sans font-bold text-sm text-white">{tier.name}</h4>
                                <span className="font-sans font-black text-base text-gold-400">
                                  {selectedVariant
                                    ? `+${Math.max(0, tier.price - item.basePrice)}€`
                                    : `${tier.price}€`}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">{tier.description}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                              <span className="text-gray-400">Seleccionar</span>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-crimson-500 text-white' : 'border border-gray-700'}`}>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* B) VÍDEO / AUDIO PERSONALIZADO: Selector de duración en minutos */}
              {isCustomMedia && (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-bordeaux-950/60 to-dark-950 border border-gold-500/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {productType === 'CUSTOM_VIDEO' ? <Video className="w-5 h-5 text-gold-400" /> : <Headphones className="w-5 h-5 text-gold-400" />}
                        <div>
                          <h3 className="font-brand font-bold text-base text-white">
                            Selecciona la duración en minutos
                          </h3>
                          <p className="text-xs text-gray-400">
                            Tarifa: <strong className="text-gold-300">{pricePerMinute}€ / minuto</strong> · Mínimo {minMinutes} {minMinutes === 1 ? 'minuto' : 'minutos'}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-black text-2xl text-gold-300">
                        {mainPrice.toFixed(2)}€
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setDurationMinutes(m => Math.max(minMinutes, m - 1))}
                        className="w-10 h-10 rounded-xl bg-dark-900 border border-gold-500/40 flex items-center justify-center text-gold-300 hover:bg-gold-500 hover:text-dark-950"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1">
                        <input
                          type="range"
                          min={minMinutes}
                          max={maxMinutes}
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                          className="w-full accent-gold-500"
                        />
                        <div className="flex justify-between text-[11px] font-mono text-gray-400 mt-1">
                          <span>{minMinutes} min</span>
                          <span className="text-gold-300 font-bold text-sm">{durationMinutes} minutos</span>
                          <span>{maxMinutes} min</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDurationMinutes(m => Math.min(maxMinutes, m + 1))}
                        className="w-10 h-10 rounded-xl bg-dark-900 border border-gold-500/40 flex items-center justify-center text-gold-300 hover:bg-gold-500 hover:text-dark-950"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {itemConfig.durationNote && (
                      <p className="text-xs font-mono text-amber-300/90 bg-dark-950/70 p-2.5 rounded-lg border border-amber-500/25">
                        ✦ {itemConfig.durationNote}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gold-300 uppercase mb-1.5">
                      Describe tu propuesta / guion / personalización
                    </label>
                    <textarea
                      rows="3"
                      value={buyerNotes}
                      onChange={e => setBuyerNotes(e.target.value)}
                      placeholder="Explica los detalles de tu vídeo o audio personalizado (temática, nombre, tono...)"
                      className="w-full bg-dark-950 border border-gray-700 focus:border-gold-400 rounded-xl p-3 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* C) FACTURA (BILL): Selector 1, 3, 6, 12 meses */}
              {isBill && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-dark-900/80 border border-gold-500/30">
                    <h3 className="font-brand font-bold text-base text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold-400" />
                      ¿Cuántos meses quieres financiar?
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Importe mensual configurado: <strong className="text-gold-300">{Number(itemConfig.monthlyAmount ?? item.basePrice).toFixed(2)}€ / mes</strong>. El total se calcula automáticamente.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {allowedMonths.map((months) => {
                      const monthly = Number(itemConfig.monthlyAmount ?? item.basePrice);
                      const subtotal = Math.round(monthly * months * 100) / 100;
                      const active = selectedMonths === months;
                      return (
                        <button
                          type="button"
                          key={months}
                          onClick={() => setSelectedMonths(months)}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            active
                              ? 'bg-gradient-to-b from-gold-500/25 to-bordeaux-900/40 border-gold-400 text-white shadow-lg scale-[1.02]'
                              : 'bg-dark-950 border-gray-800 text-gray-300 hover:border-gold-500/40'
                          }`}
                        >
                          <span className="font-brand font-extrabold text-xl block">
                            {months} {months === 1 ? 'mes' : 'meses'}
                          </span>
                          <span className="font-mono font-bold text-base text-gold-300 block mt-1">
                            {subtotal.toFixed(2)}€
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                            ({monthly}€/mes)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* D) SUSCRIPCIONES TELEGRAM / INSTAGRAM */}
              {isSubscription && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-bordeaux-950/60 to-dark-950 border border-gold-500/35 space-y-2">
                    <div className="flex items-center gap-2 text-gold-300 font-mono text-xs uppercase font-bold">
                      <Crown className="w-4 h-4" />
                      Suscripción Digital {itemConfig.platform ? `· ${itemConfig.platform}` : ''}
                    </div>
                    <p className="text-xs text-ivory-200 leading-relaxed">
                      Acceso digital directo sin envíos físicos. En el siguiente paso solo te pediremos tu usuario de {itemConfig.platform || 'contacto'} para darte acceso inmediato tras confirmar el pago.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {allowedMonths.map((months) => {
                      const monthly = Number(itemConfig.monthlyPrice ?? item.basePrice);
                      const subtotal = Math.round(monthly * months * 100) / 100;
                      const active = selectedMonths === months;
                      return (
                        <button
                          type="button"
                          key={months}
                          onClick={() => setSelectedMonths(months)}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            active
                              ? 'bg-gold-500/20 border-gold-400 text-white font-bold shadow'
                              : 'bg-dark-950 border-gray-800 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          <span className="block text-base font-brand font-bold">{months} {months === 1 ? 'mes' : 'meses'}</span>
                          <span className="block text-sm font-mono text-gold-300 mt-1">{subtotal.toFixed(2)}€</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* E) BIBLIOTECA DE CONTENIDO / AUDIENCIAS / TRIBUTOS */}
              {isDigitalDirect && (
                <div className="p-5 rounded-2xl bg-dark-900/80 border border-gold-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-gold-400 uppercase block">Entrega Digital / Directa</span>
                      <h3 className="font-brand font-bold text-lg text-white">{item.name}</h3>
                    </div>
                    <span className="font-mono font-black text-2xl text-gold-300">{mainPrice.toFixed(2)}€</span>
                  </div>
                  {itemConfig.deliveryNote && (
                    <p className="text-xs text-gray-300">{itemConfig.deliveryNote}</p>
                  )}
                  {productType === 'TRIBUTE' && itemConfig.allowCustomAmount && (
                    <div>
                      <label className="block text-xs font-mono text-gold-300 mb-1">Importe de tu tributo (€)</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={customAmount}
                        onChange={e => setCustomAmount(e.target.value)}
                        className="w-full bg-dark-950 border border-gold-500/40 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-gold-300"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* PASO 2 (SOLO PRODUCTOS FÍSICOS): EXTRAS, EMBALAJE Y ENVÍO       */}
          {/* =============================================================== */}
          {isPhysical && step === 2 && (
            <div className="space-y-6">
              {/* Métodos de envío activos */}
              {shippingMethods.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-sans font-bold text-sm text-gold-300 uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Método de Envío Disponible
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shippingMethods.map((sm) => {
                      const active = selectedShipping?.id === sm.id;
                      return (
                        <button
                          type="button"
                          key={sm.id}
                          onClick={() => setSelectedShipping(sm)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex justify-between items-start gap-2 ${
                            active
                              ? 'bg-gold-500/15 border-gold-400 text-white'
                              : 'bg-dark-950 border-gray-800 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-xs block">{sm.name}</span>
                            {sm.estimatedTime && <span className="text-[10px] font-mono text-gray-400 block">Plazo: {sm.estimatedTime}</span>}
                            {sm.description && <span className="text-[11px] text-gray-400 block mt-0.5">{sm.description}</span>}
                          </div>
                          <span className="font-mono font-bold text-sm text-gold-300 whitespace-nowrap">
                            {sm.price > 0 ? `+${Number(sm.price).toFixed(2)}€` : 'Gratis'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Extras */}
              {availableExtras.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-sans font-bold text-sm text-white">Extras opcionales</h3>
                  <div className="space-y-2">
                    {availableExtras.map(ex => {
                      const qty = selectedExtras[ex.id] || 0;
                      return (
                        <div key={ex.id} className="p-3 rounded-xl bg-dark-900/70 border border-gray-800 flex items-center justify-between gap-3">
                          <div>
                            <span className="font-bold text-xs text-white block">{ex.name}</span>
                            {ex.description && <span className="text-[11px] text-gray-400">{ex.description}</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-gold-300 font-bold">+{ex.price}€</span>
                            <div className="flex items-center gap-1.5">
                              <button type="button" onClick={() => handleExtraQuantityChange(ex.id, -1, ex.maxQuantity)} className="w-7 h-7 rounded bg-dark-950 border border-gray-700">-</button>
                              <span className="w-5 text-center font-mono text-xs">{qty}</span>
                              <button type="button" onClick={() => handleExtraQuantityChange(ex.id, 1, ex.maxQuantity)} className="w-7 h-7 rounded bg-dark-950 border border-gray-700">+</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Embalaje */}
              {packagingOptions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-gold-400" />
                    Embalaje
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {packagingOptions.map(pk => {
                      const active = selectedPackaging?.id === pk.id;
                      return (
                        <button
                          type="button"
                          key={pk.id}
                          onClick={() => setSelectedPackaging(pk)}
                          className={`p-3 rounded-xl border text-left flex justify-between items-center ${
                            active ? 'bg-crimson-600/20 border-crimson-500 text-white' : 'bg-dark-950 border-gray-800 text-gray-400'
                          }`}
                        >
                          <span className="text-xs font-bold">{pk.name}</span>
                          <span className="font-mono text-xs text-gold-300">{pk.price > 0 ? `+${pk.price}€` : 'Incluido'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* PASO FINAL: CONTACTO Y PAGO                                     */}
          {/* =============================================================== */}
          {isFinalStep && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-mono text-gold-400 mb-1">Tu Alias / Nombre *</label>
                  <input
                    type="text"
                    value={alias}
                    onChange={e => setAlias(e.target.value)}
                    placeholder="Ej: Kenshi"
                    className="w-full bg-dark-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-gold-400 mb-1">Email (para vincular historial)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-dark-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-mono text-gold-400 mb-1">Canal de Contacto *</label>
                  <select
                    value={contactChannel}
                    onChange={e => setContactChannel(e.target.value)}
                    className="w-full bg-dark-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    {contactChannels.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-gold-400 mb-1">
                    {isSubscription && itemConfig.handleLabel ? `${itemConfig.handleLabel} *` : `Tu usuario en ${currentChannelObj.name} *`}
                  </label>
                  <input
                    type="text"
                    value={contactHandle}
                    onChange={e => setContactHandle(e.target.value)}
                    placeholder={currentChannelObj.placeholder}
                    className="w-full bg-dark-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              {!isCustomMedia && (
                <div className="text-xs">
                  <label className="block font-mono text-gray-400 mb-1">
                    {itemConfig.customNoteLabel || 'Notas o personalización (opcional)'}
                  </label>
                  <textarea
                    rows="2"
                    value={buyerNotes}
                    onChange={e => setBuyerNotes(e.target.value)}
                    placeholder="Indicaciones adicionales..."
                    className="w-full bg-dark-950 border border-gray-700 rounded-xl p-3 text-white"
                  />
                </div>
              )}

              {/* Opciones físicas SOLO para productos físicos */}
              {isPhysical && (
                <div className="space-y-3 pt-2 border-t border-gray-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={discretionPreference}
                      onChange={e => setDiscretionPreference(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-700 bg-dark-950 text-crimson-600"
                    />
                    <span className="text-xs text-gray-300 font-mono">Prefiero mantener la máxima discreción posible en el envío.</span>
                  </label>

                  <div>
                    <label className="block text-xs font-mono text-gold-400 mb-2">Opción de gestión por Vinted</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'DIRECT', label: 'Gestión directa' },
                        { id: 'VINTED', label: 'Gestión por Vinted' },
                        { id: 'DECIDE_LATER', label: 'Decidir después' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setVintedPreference(opt.id)}
                          className={`p-2 rounded-lg text-xs font-sans border transition-all ${
                            vintedPreference === opt.id ? 'bg-crimson-600/20 border-crimson-500 text-white' : 'bg-dark-950 border-gray-800 text-gray-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Métodos de Pago */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-gold-400 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Método de Pago Seguro
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'STRIPE_CARD', label: 'Tarjeta (Stripe / Apple / Google)' },
                    { id: 'BIZUM', label: 'Bizum' },
                    { id: 'PAYPAL', label: 'PayPal' },
                    { id: 'BANK_TRANSFER', label: 'Transferencia Bancaria' }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-xl border text-xs font-sans text-center transition-all ${
                        paymentMethod === method.id
                          ? 'bg-gold-500/20 border-gold-500 text-gold-300 font-bold'
                          : 'bg-dark-900 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-crimson-600/20 border border-crimson-500 text-crimson-300 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="bg-dark-950 p-5 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <span className="text-[10px] font-mono text-gray-400 block uppercase">Total Estimado</span>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-sans font-black text-2xl text-gold-400">{totalPrice.toFixed(2)}€</span>
              <span className="text-xs text-gray-400">
                ({mainSummaryLabel}
                {extrasPrice > 0 ? ` + ${extrasPrice}€ extras` : ''}
                {shippingPrice > 0 ? ` + ${shippingPrice}€ envío` : ''})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="py-2.5 px-4 rounded-xl border border-gray-800 text-xs font-sans font-semibold uppercase hover:bg-white/5 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
            )}

            {!isFinalStep ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="flex-1 sm:flex-initial py-3 px-8 rounded-xl bg-gradient-to-r from-crimson-700 via-crimson-600 to-crimson-500 text-white font-sans font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Procesando...' : `Pagar ${totalPrice.toFixed(2)}€`}
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
