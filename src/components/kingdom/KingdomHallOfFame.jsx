import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Shield, User, Award, Heart, CheckCircle2 } from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../../config';

export function KingdomHallOfFame({ title = "Muro del Reino · Muro de la Fama", subtitle = "Miembros consagrados que ocupan activamente su lugar en la estructura de la Princesa Yakuza" }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMobileCard, setActiveMobileCard] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/kingdom/hall-of-fame`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(err => {
        console.error('Error cargando Muro del Reino:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getRankBadgeStyle = (rank = '') => {
    const r = rank.toLowerCase();
    if (r.includes('esclavo') || r.includes('elegid')) {
      return 'bg-gradient-to-r from-gold-500/30 to-bordeaux-700/50 text-gold-300 border-gold-400/80 shadow-gold-500/20';
    }
    if (r.includes('caballer')) {
      return 'bg-gradient-to-r from-bordeaux-800/60 to-dark-900 text-gold-200 border-gold-500/50';
    }
    if (r.includes('sirvient')) {
      return 'bg-bordeaux-950/80 text-ivory-200 border-bordeaux-500/40';
    }
    return 'bg-dark-950/90 text-gray-300 border-gray-700/50';
  };

  const getMemberPhoto = (member) => {
    if (member.avatarUrl && !member.avatarUrl.startsWith('file:///')) {
      return resolveMediaUrl(member.avatarUrl);
    }
    const aliasLower = (member.alias || '').toLowerCase();
    if (aliasLower.includes('kenshi')) return '/portraits/kenshi.jpg';
    if (aliasLower.includes('devoto')) return '/portraits/devoto.jpg';
    if (aliasLower.includes('ryotaro')) return '/portraits/ryotaro.jpg';
    if (aliasLower.includes('sombra')) return '/portraits/sombra.jpg';

    const rankLower = (member.rank || '').toLowerCase();
    if (rankLower.includes('esclavo')) return '/portraits/kenshi.jpg';
    if (rankLower.includes('caballer')) return '/portraits/devoto.jpg';
    if (rankLower.includes('sirvient')) return '/portraits/ryotaro.jpg';
    if (rankLower.includes('plebey')) return '/portraits/sombra.jpg';

    return '/dominium_sub_avatar.jpg';
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-xs font-mono text-gold-400/80 animate-pulse tracking-widest uppercase">
          Cargando Muro del Reino...
        </p>
      </div>
    );
  }

  if (members.length === 0) return null;

  return (
    <div className="w-full space-y-6 pt-10 border-t border-gold-500/25">
      
      {/* Cabecera del Muro de la Fama */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full legibility-shield border border-gold-500/40 text-gold-300 text-[11px] font-sans tracking-widest uppercase shadow-lg">
          <Crown className="w-3.5 h-3.5 text-gold-400" />
          <span>✦ CUADRO DE HONOR DEL REINO ✦</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-wide">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-ivory-300 font-body leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Grid visual de Miembros Consagrados: Cada tarjeta muestra su foto completa y textos al hacer hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {members.map((m) => {
          const photo = getMemberPhoto(m);
          const isMobileActive = activeMobileCard === m.id;

          return (
            <div
              key={m.id}
              onClick={() => setActiveMobileCard(isMobileActive ? null : m.id)}
              className="group relative rounded-2xl overflow-hidden border border-gold-500/30 hover:border-gold-400 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_50px_rgba(212,175,55,0.25)] h-[480px] sm:h-[500px] flex flex-col justify-end cursor-pointer bg-dark-950 select-none"
            >
              {/* Fotografía de alta resolución ocupando el 100% de la tarjeta */}
              <img
                src={photo}
                alt={m.alias}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/dominium_sub_avatar.jpg';
                }}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Degradado cinematográfico en reposo */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/20 to-black/30 pointer-events-none group-hover:opacity-0 transition-opacity duration-400" />

              {/* Indicador en reposo al pie: muestra alias y rango de forma limpia y elegante */}
              <div className="relative z-10 p-5 transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-4 group-hover:pointer-events-none">
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-sans font-bold text-lg text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] truncate group-hover:text-gold-200">
                      {m.alias}
                    </h4>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold tracking-wider uppercase border mt-1 shadow-md ${getRankBadgeStyle(m.rank)}`}>
                      {m.rank}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-dark-950/80 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0 shadow-lg backdrop-blur-sm">
                    <Crown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Capa de cristal oscuro al hacer hover: revela todos los textos y detalles */}
              <div
                className={`absolute inset-0 z-20 bg-gradient-to-t from-dark-950/95 via-dark-950/90 to-dark-950/60 backdrop-blur-md p-6 flex flex-col justify-between transition-all duration-400 ease-out border-2 border-gold-400/60 rounded-2xl ${
                  isMobileActive
                    ? 'opacity-100 pointer-events-auto translate-y-0'
                    : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto translate-y-3 group-hover:translate-y-0'
                }`}
              >
                {/* Cabecera del hover: Rango, Corona y Alias */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-gold-500/25 pb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-sans font-bold tracking-widest uppercase border shadow-lg ${getRankBadgeStyle(m.rank)}`}>
                      ✦ {m.rank} ✦
                    </span>
                    <Crown className="w-4 h-4 text-gold-400 animate-pulse" />
                  </div>

                  <div>
                    <h4 className="font-sans font-extrabold text-xl text-white tracking-wide group-hover:text-gold-200 transition-colors">
                      {m.alias}
                    </h4>
                    <p className="text-[11px] font-mono text-gold-400/90 tracking-wider uppercase mt-0.5">
                      Devoto Consagrado
                    </p>
                  </div>

                  {/* Puesto / Función */}
                  {m.role && (
                    <div className="p-3 rounded-xl bg-dark-950/80 border border-gold-500/30 text-xs shadow-inner">
                      <span className="text-[10px] font-sans font-bold text-gold-400 uppercase tracking-widest block mb-1">
                        Puesto / Función:
                      </span>
                      <p className="text-ivory-200 font-body leading-relaxed text-xs">
                        {m.role}
                      </p>
                    </div>
                  )}

                  {/* Cita / Lema de devoción */}
                  {m.quote && (
                    <div className="p-3 rounded-xl bg-bordeaux-950/40 border-l-2 border-gold-500/60 border-y border-r border-gold-500/15">
                      <p className="text-xs text-gold-200 font-serif italic leading-relaxed">
                        {m.quote}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pie del hover: Estado y Antigüedad */}
                <div className="pt-3 border-t border-gold-500/25 flex items-center justify-between text-[11px] font-mono text-ivory-400">
                  <span className="flex items-center gap-1.5 text-gold-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-sans font-semibold">Miembro Activo</span>
                  </span>
                  <span className="text-right text-[10px] text-gray-400 truncate max-w-[130px]">
                    {m.servedSince || 'En servicio'}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
