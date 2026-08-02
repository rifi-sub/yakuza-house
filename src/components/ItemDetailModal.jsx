import React, { useState } from 'react';
import { X, ShoppingCart, ShieldAlert, CheckCircle2, Lock, Sparkles, Clock, Package } from 'lucide-react';
import { resolveMediaUrl } from '../config';

export default function ItemDetailModal({ item, onClose, onBuyNow }) {
  if (!item) return null;

  let imageList = [];
  try {
    imageList = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
  } catch {
    imageList = [];
  }
  // Resolver URLs relativas al backend
  imageList = imageList.map(resolveMediaUrl);
  if (imageList.length === 0) {
    imageList = ['https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1000&q=80'];
  }

  const [selectedImage, setSelectedImage] = useState(imageList[0]);
  const [acceptedConditions, setAcceptedConditions] = useState(false);

  const isAvailable = item.status === 'AVAILABLE' || !item.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl glass-modal rounded-2xl overflow-hidden text-gray-100 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-dark-900/80 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          
          {/* Left Column: Gallery */}
          <div className="p-6 bg-dark-900/60 border-b md:border-b-0 md:border-r border-gray-800/80 flex flex-col">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-dark-800 border border-gray-800 mb-4">
              <img
                src={selectedImage}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-crimson-600/90 text-white font-mono text-xs font-bold px-3 py-1 rounded shadow">
                {item.code}
              </div>
            </div>

            {/* Thumbnail Row */}
            {imageList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === img ? 'border-crimson-500 scale-105' : 'border-gray-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-800 text-xs text-gray-400 space-y-2 font-mono">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold-400" />
                <span>Envío discreto y sellado al vacío opcional</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-crimson-400" />
                <span>Preparación estimada: 24 - 48h</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Conditions */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-xs font-mono text-crimson-400 uppercase tracking-widest block mb-1">Ficha de Artículo</span>
                  <h2 className="font-sans font-extrabold text-2xl text-white">{item.name}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 font-mono block">Precio inicial</span>
                  <span className="font-sans font-black text-2xl text-gold-400">{item.basePrice}€</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Disponible para pedido inmediato
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs font-mono px-3 py-1 rounded-full border border-amber-500/30">
                    {item.status === 'RESERVED' ? 'Reservado' : 'Agotado'}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Descripción General</h4>
                <p className="text-sm text-gray-300 leading-relaxed bg-dark-900/50 p-4 rounded-xl border border-gray-800/80">
                  {item.description}
                </p>
              </div>

              {/* Specific Conditions Section (Rich Editor Content) */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gold-400 mb-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Condiciones Específicas del Artículo</span>
                </div>
                <div className="bg-dark-900/80 p-4 rounded-xl border border-gold-500/20 text-xs text-gray-300 leading-relaxed max-h-48 overflow-y-auto prose prose-invert prose-sm">
                  {item.conditionsHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: item.conditionsHtml }} />
                  ) : (
                    <p>
                      Este artículo se prepara siguiendo estándares estrictos de discreción y personalización. Todos los envíos se empaquetan en caja o sobre neutro sin distintivos exteriores. La gestión se puede realizar directamente o mediante Vinted según tu preferencia en el checkout.
                    </p>
                  )}
                </div>
              </div>

              {/* Mandatory acceptance checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-lg bg-crimson-600/10 border border-crimson-500/20 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={acceptedConditions}
                  onChange={(e) => setAcceptedConditions(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-dark-900 text-crimson-600 focus:ring-crimson-500"
                />
                <span className="text-xs text-gray-300">
                  He leído y acepto expresamente las condiciones específicas de este artículo y la política de compra discreta.
                </span>
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-800 flex gap-3">
              <button
                onClick={onClose}
                className="py-3 px-5 rounded-xl border border-gray-800 text-xs font-sans font-semibold uppercase tracking-wider hover:bg-white/5 transition-colors"
              >
                Volver
              </button>
              
              <button
                onClick={() => {
                  if (!acceptedConditions) {
                    alert('Debes marcar la casilla para aceptar las condiciones antes de comprar.');
                    return;
                  }
                  onBuyNow(item);
                }}
                disabled={!isAvailable}
                className={`flex-1 py-3 px-6 rounded-xl font-sans font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isAvailable
                    ? 'bg-gradient-to-r from-crimson-700 via-crimson-600 to-crimson-500 text-white shadow-crimson-600/30 hover:shadow-crimson-600/50 cursor-pointer active:scale-95'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Comprar ahora ({item.basePrice}€)
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
