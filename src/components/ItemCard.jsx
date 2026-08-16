import React from 'react';
import { ShoppingCart, Eye, Star, Video, ShoppingBag } from 'lucide-react';
import { resolveMediaUrl } from '../config';

export default function ItemCard({ item, onBuyNow, onViewDetails, onAddToCart }) {
  // Parsear imágenes si es JSON string
  let imageList = [];
  try {
    imageList = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
  } catch {
    imageList = [];
  }

  const coverMedia = item.media?.find(m => m.isCover) || item.media?.[0];
  const mainImage = coverMedia ? resolveMediaUrl(coverMedia.url) : (resolveMediaUrl(imageList[0]) || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80');

  const hasVideos = item.media?.some(m => m.type === 'VIDEO');
  const isAvailable = item.status === 'AVAILABLE' || !item.status;

  return (
    <div className="glass-panel rounded-xl overflow-hidden hover:border-crimson-500/50 transition-all duration-300 flex flex-col group hover:shadow-xl hover:shadow-crimson-600/10">
      
      {/* Media & Badges */}
      <div className="relative aspect-square bg-dark-800 overflow-hidden cursor-pointer" onClick={() => onViewDetails(item)}>
        <img
          src={mainImage}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-80" />

        {/* Code & Video Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div className="bg-crimson-600/90 backdrop-blur-md text-white font-mono text-xs font-bold px-2.5 py-1 rounded shadow-md border border-crimson-400/30">
            {item.code}
          </div>
          {hasVideos && (
            <span className="bg-dark-900/90 text-gold-400 px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 border border-gold-500/30" title="Contiene vídeos demostrativos">
              <Video className="w-3 h-3" /> Vídeo
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Disponible
            </span>
          ) : item.status === 'RESERVED' ? (
            <span className="bg-amber-500/20 backdrop-blur-md text-amber-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-amber-500/30">
              Reservado
            </span>
          ) : (
            <span className="bg-gray-500/20 backdrop-blur-md text-gray-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-gray-500/30">
              Agotado
            </span>
          )}
        </div>

        {/* Price Floating Tag */}
        <div className="absolute bottom-3 right-3 bg-dark-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-gold-500/40">
          <span className="font-sans font-black text-lg text-gold-400">
            {item.basePrice}€
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {item.category && (
            <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block mb-1">
              {item.category.name}
            </span>
          )}
          <h3 
            onClick={() => onViewDetails(item)}
            className="font-sans font-bold text-lg text-white group-hover:text-gold-400 transition-colors cursor-pointer mb-1 line-clamp-1"
          >
            {item.name}
          </h3>

          {/* Rating Summary */}
          {item.reviewCount > 0 ? (
            <div className="flex items-center gap-1 mb-2 text-xs font-mono">
              <div className="flex items-center text-gold-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${star <= Math.round(item.averageRating) ? 'fill-gold-400 text-gold-400' : 'text-gray-600'}`}
                  />
                ))}
              </div>
              <span className="text-gray-300 font-bold ml-1">{item.averageRating.toFixed(1)}</span>
              <span className="text-gray-500 text-[10px]">({item.reviewCount})</span>
            </div>
          ) : (
            <p className="text-[10px] text-gray-500 font-mono mb-2">Sin valoraciones aún</p>
          )}

          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-4">
            {item.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
          <button
            onClick={() => onViewDetails(item)}
            className="p-2.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
            title="Ver Ficha y Galería"
          >
            <Eye className="w-4 h-4" />
          </button>

          {onAddToCart && (
            <button
              onClick={() => onAddToCart(item)}
              disabled={!isAvailable}
              className={`p-2.5 rounded-lg border transition-colors ${
                isAvailable
                  ? 'border-gold-500/40 text-gold-400 hover:bg-gold-500/20 cursor-pointer'
                  : 'border-gray-800 text-gray-600 cursor-not-allowed'
              }`}
              title="Añadir a la Cesta"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onBuyNow(item)}
            disabled={!isAvailable}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
              isAvailable
                ? 'bg-crimson-600 hover:bg-crimson-500 text-white shadow-crimson-600/30 hover:shadow-crimson-600/50 cursor-pointer active:scale-95'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Comprar
          </button>
        </div>
      </div>

    </div>
  );
}
