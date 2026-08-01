import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, Download, Copy, ArrowLeft, MessageSquare, Clock, Sparkles } from 'lucide-react';

export default function OrderConfirmation({ orderNumber, onBackToStore }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetch(`/api/store/orders/${orderNumber}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setOrder(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [orderNumber]);

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      alert('¡Número de pedido copiado al portapapeles!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto my-16 p-8 glass-panel rounded-2xl text-center">
        <div className="animate-spin w-10 h-10 border-4 border-crimson-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm font-mono text-gray-400">Cargando confirmación del pedido...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-12 px-4">
      <div className="glass-modal rounded-2xl p-8 border border-crimson-500/30 text-gray-100 shadow-2xl">
        
        {/* Header Success Badge */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">Pago y Registrado Exitoso</span>
          <h1 className="font-sans font-extrabold text-3xl text-white mb-2">¡Pedido Confirmado!</h1>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Tu compra ha sido procesada de forma segura y directa sin intermediarios.
          </p>
        </div>

        {/* Order Number Box */}
        <div className="bg-dark-950 p-4 rounded-xl border border-gold-500/30 flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Número de Pedido</span>
            <span className="font-mono font-bold text-xl text-gold-400">{orderNumber}</span>
          </div>
          <button
            onClick={copyOrderNumber}
            className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-400 font-mono text-xs transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copiar
          </button>
        </div>

        {/* Confirmation Banner */}
        <div className="bg-crimson-950/40 border border-crimson-600/30 p-5 rounded-xl text-xs text-gray-300 leading-relaxed mb-8 space-y-2">
          <p className="font-semibold text-white">
            “Tu pedido se ha registrado correctamente. Revisaré el pago y las opciones seleccionadas y me pondré en contacto contigo mediante el canal que has indicado. Guarda el número de pedido para cualquier consulta.”
          </p>
          {order?.email && (
            <p className="text-gray-400 text-[11px]">
              Se ha enviado un resumen automático a tu correo: <strong>{order.email}</strong>.
            </p>
          )}
        </div>

        {/* Order Details Breakdown */}
        {order && (
          <div className="bg-dark-900/80 rounded-xl p-6 border border-gray-800 space-y-4 mb-8 text-xs">
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              Resumen del Pedido
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block">Artículo:</span>
                <span className="font-bold text-white text-sm">{order.itemName} {order.itemCode ? `(${order.itemCode})` : ''}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Modalidad seleccionada:</span>
                <span className="font-bold text-gold-400">{order.tierName} ({order.tierPrice}€)</span>
              </div>
            </div>

            {order.extras && order.extras.length > 0 && (
              <div>
                <span className="text-gray-400 block mb-1">Extras Añadidos:</span>
                <div className="bg-dark-950 p-3 rounded-lg border border-gray-800 space-y-1">
                  {order.extras.map(ex => (
                    <div key={ex.id} className="flex justify-between text-gray-300">
                      <span>• {ex.extraName} (x{ex.quantity})</span>
                      <span className="font-mono text-gold-400">{ex.totalPrice}€</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-800">
              <div>
                <span className="text-gray-400 block">Canal de Contacto Elegido:</span>
                <span className="font-bold text-white">{order.contactChannel}: <span className="text-gold-400">{order.contactHandle}</span></span>
              </div>
              <div>
                <span className="text-gray-400 block">Preferencia de Gestión:</span>
                <span className="font-bold text-white">
                  {order.vintedPreference === 'VINTED' ? 'Gestión mediante Vinted' : order.vintedPreference === 'DECIDE_LATER' ? 'Decidir posteriormente' : 'Gestión directa'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <div>
                <span className="text-gray-400 text-[11px] block">Estado del Pago:</span>
                <span className="font-mono font-bold text-emerald-400 uppercase">{order.paymentStatus}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-[11px] block">Importe Pagado:</span>
                <span className="font-sans font-black text-2xl text-gold-400">{order.totalAmount.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBackToStore}
            className="flex-1 py-3 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Catálogo
          </button>
        </div>

      </div>
    </div>
  );
}
