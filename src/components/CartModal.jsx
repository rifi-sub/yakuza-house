import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { resolveMediaUrl } from '../config';

export default function CartModal({ cartItems, onUpdateQuantity, onRemoveItem, onClose, onCheckout }) {
  const total = cartItems.reduce((sum, item) => sum + (item.item.basePrice * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-modal p-6 rounded-2xl max-w-xl w-full text-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold-400" />
            <h3 className="font-sans font-bold text-lg text-white">Tu Cesta de la Compra</h3>
            <span className="bg-crimson-600/30 text-crimson-400 text-xs font-mono px-2 py-0.5 rounded-full border border-crimson-500/20">
              {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-sm text-gray-400 font-mono">Tu cesta está vacía</p>
              <button
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            cartItems.map(({ item, quantity }) => {
              let imageList = [];
              try {
                imageList = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
              } catch {
                imageList = [];
              }
              const coverMedia = item.media?.find(m => m.isCover) || item.media?.[0];
              const coverUrl = coverMedia ? resolveMediaUrl(coverMedia.url) : (resolveMediaUrl(imageList[0]) || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80');

              return (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-dark-950/80 border border-gray-800">
                  <img
                    src={coverUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-sans font-bold text-sm text-white truncate">{item.name}</h4>
                    <p className="text-xs text-gold-400 font-mono font-bold">{item.basePrice.toFixed(2)}€</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, quantity - 1))}
                      className="p-1 rounded bg-dark-900 border border-gray-700 text-gray-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs text-white font-bold w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                      className="p-1 rounded bg-dark-900 border border-gray-700 text-gray-300 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-white/5"
                    title="Eliminar de la cesta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Total */}
        {cartItems.length > 0 && (
          <div className="pt-4 border-t border-gray-800 space-y-4">
            <div className="flex justify-between items-center text-sm font-mono">
              <span className="text-gray-400">Total estimado:</span>
              <span className="text-lg font-bold text-gold-400">{total.toFixed(2)}€</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-400 hover:text-white"
              >
                Seguir Comprando
              </button>
              <button
                onClick={() => {
                  onClose();
                  onCheckout(cartItems[0]?.item);
                }}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-crimson-700 via-crimson-600 to-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-102 transition-all"
              >
                <span>Procesar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
