import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Shield, User, Award, Heart, CheckCircle2 } from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../../config';

export function KingdomHallOfFame({ title = "Muro del Reino · Muro de la Fama", subtitle = "Miembros consagrados que ocupan activamente su lugar en la estructura de la Princesa Yakuza" }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      return 'bg-gradient-to-r from-gold-500/25 to-bordeaux-700/40 text-gold-300 border-gold-400/60 shadow-gold-500/10';
    }
    if (r.includes('caballer')) {
      return 'bg-gradient-to-r from-bordeaux-800/40 to-dark-900 text-gold-200 border-gold-500/40';
    }
    if (r.includes('sirvient')) {
      return 'bg-bordeaux-950/60 text-ivory-200 border-bordeaux-500/30';
    }
    return 'bg-dark-950/80 text-gray-300 border-gray-700/40';
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

      {/* Grid visual de Miembros Consagrados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {members.map((m) => {
          const avatar = m.avatarUrl ? resolveMediaUrl(m.avatarUrl) : null;

          return (
            <div
              key={m.id}
              className="legibility-bordeaux rounded-2xl p-5 border border-gold-500/30 hover:border-gold-400/60 transition-all duration-300 shadow-2xl flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Resplandor decorativo de fondo */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-gold-500/5 rounded-full blur-2xl group-hover:bg-gold-500/10 transition-colors pointer-events-none" />

              <div className="space-y-4">
                {/* Avatar o Retrato del Miembro */}
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-gold-500 via-bordeaux-600 to-gold-400 shadow-lg shrink-0">
                    <div className="w-full h-full rounded-full bg-dark-950 overflow-hidden flex items-center justify-center border border-gold-500/30">
                      {avatar ? (
                        <img src={avatar} alt={m.alias} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gold-400/70" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-sans font-bold text-base text-white truncate group-hover:text-gold-200 transition-colors">
                      {m.alias}
                    </h4>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold tracking-wider uppercase border mt-0.5 ${getRankBadgeStyle(m.rank)}`}>
                      {m.rank}
                    </span>
                  </div>
                </div>

                {/* Función o Puesto Actual / Objetivo */}
                {m.role && (
                  <div className="p-2.5 rounded-xl bg-dark-950/70 border border-gold-500/20 text-xs">
                    <span className="text-[10px] font-sans font-semibold text-gold-400 uppercase tracking-widest block mb-0.5">
                      Puesto / Función:
                    </span>
                    <p className="text-ivory-200 font-body leading-snug line-clamp-2">
                      {m.role}
                    </p>
                  </div>
                )}

                {/* Cita / Lema personal de devoción */}
                {m.quote && (
                  <p className="text-xs text-gold-300/90 font-serif italic border-l-2 border-gold-500/50 pl-2.5 py-0.5 leading-relaxed">
                    {m.quote}
                  </p>
                )}
              </div>

              {/* Antigüedad al pie */}
              <div className="pt-3 mt-4 border-t border-gold-500/20 flex items-center justify-between text-[11px] font-mono text-ivory-400">
                <span className="flex items-center gap-1.5 text-gold-400/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Miembro Activo</span>
                </span>
                <span className="truncate max-w-[150px] text-right text-[10px] text-gray-400">
                  {m.servedSince || 'En servicio'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
