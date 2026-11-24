import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Medal, Sparkles, Shield, Eye, EyeOff, CheckCircle2, Lock, UserCheck, Save, Award } from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../../config';

const CRITERIA_LABELS = {
  COMBINED: 'Fórmula Combinada (XP, Tributos, Tareas y Progreso)',
  EXPERIENCE: 'Experiencia acumulada (XP)',
  REVENUE: 'Tributos y aportaciones confirmadas',
  TASKS: 'Tareas y mandatos completados',
  PROGRESS: 'Progreso general en el Reino'
};

export function KingdomRankingSection({ memberToken = null, onOpenMemberPortal = null, compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado de preferencias de privacidad del miembro autenticado
  const [optIn, setOptIn] = useState(false);
  const [rankingAlias, setRankingAlias] = useState('');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsFeedback, setPrefsFeedback] = useState('');

  const token = memberToken || (typeof window !== 'undefined' ? (localStorage.getItem('yakuza_member_token') || localStorage.getItem('yakuza_kingdom_token')) : null);

  const fetchRanking = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/kingdom/ranking`, { headers });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.myStatus) {
          setOptIn(Boolean(json.myStatus.rankingOptIn));
          setRankingAlias(json.myStatus.rankingAlias || '');
        }
      }
    } catch (e) {
      console.error('Error cargando Ranking del Reino:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [token]);

  const handleSavePrefs = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSavingPrefs(true);
    setPrefsFeedback('');
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/me/ranking-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rankingOptIn: optIn,
          rankingAlias: rankingAlias.trim()
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al guardar preferencias');
      if (json.ranking) setData(json.ranking);
      setPrefsFeedback('Preferencias de privacidad guardadas correctamente.');
      setTimeout(() => setPrefsFeedback(''), 3500);
    } catch (err) {
      setPrefsFeedback(`Error: ${err.message}`);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-xs font-mono text-gold-400 animate-pulse tracking-widest uppercase">
          Cargando Ranking del Reino...
        </p>
      </div>
    );
  }

  if (!data || !data.config || data.config.enabled === false) return null;

  const { config, podiumPerks, leaderboard = [], totalParticipants = 0, myStatus } = data;
  const top1 = leaderboard[0] || null;
  const top2 = leaderboard[1] || null;
  const top3 = leaderboard[2] || null;
  const restOfList = leaderboard.slice(3);

  const podiumSlots = [
    {
      pos: 2,
      orderClass: 'order-2 lg:order-1 lg:mt-8',
      holder: top2,
      perkInfo: podiumPerks?.second || {},
      label: '2º Puesto',
      medalText: 'PLATA',
      borderClass: 'border-slate-300/50 hover:border-slate-200',
      glowClass: 'shadow-[0_14px_45px_rgba(203,213,225,0.16)]',
      bgClass: 'from-slate-800/40 via-dark-950/95 to-[#11080c]',
      badgeClass: 'bg-slate-200/15 text-slate-200 border-slate-300/40',
      accentText: 'text-slate-200',
      icon: Medal
    },
    {
      pos: 1,
      orderClass: 'order-1 lg:order-2 lg:-mt-2',
      holder: top1,
      perkInfo: podiumPerks?.first || {},
      label: '1º Puesto',
      medalText: 'ORO',
      borderClass: 'border-gold-400/80 hover:border-gold-300 ring-1 ring-gold-500/30',
      glowClass: 'shadow-[0_20px_65px_rgba(212,175,55,0.28)]',
      bgClass: 'from-gold-600/25 via-[#220a12]/95 to-dark-950',
      badgeClass: 'bg-gradient-to-r from-gold-500/30 to-amber-500/20 text-gold-300 border-gold-400/70',
      accentText: 'text-gold-300',
      icon: Crown
    },
    {
      pos: 3,
      orderClass: 'order-3 lg:order-3 lg:mt-12',
      holder: top3,
      perkInfo: podiumPerks?.third || {},
      label: '3º Puesto',
      medalText: 'BRONCE',
      borderClass: 'border-amber-600/50 hover:border-amber-400',
      glowClass: 'shadow-[0_14px_45px_rgba(217,119,6,0.16)]',
      bgClass: 'from-amber-900/30 via-dark-950/95 to-[#12080b]',
      badgeClass: 'bg-amber-700/20 text-amber-300 border-amber-500/50',
      accentText: 'text-amber-300',
      icon: Award
    }
  ];

  const formatScore = (val) => {
    if (val === null || val === undefined) return null;
    if (config.criteriaMode === 'REVENUE') return `${Number(val).toFixed(0)}€`;
    if (config.criteriaMode === 'EXPERIENCE') return `${Number(val).toLocaleString('es-ES')} XP`;
    if (config.criteriaMode === 'TASKS') return `${val} tareas`;
    if (config.criteriaMode === 'PROGRESS') return `${val}%`;
    return `${Number(val).toLocaleString('es-ES')} pts`;
  };

  return (
    <section className={`relative rounded-3xl border border-gold-500/40 bg-gradient-to-b from-[#1a070e]/95 via-dark-950/95 to-[#0c0408]/95 shadow-2xl overflow-hidden ${compact ? 'p-5 sm:p-7' : 'p-6 sm:p-10'} space-y-8`}>
      {/* Resplandores decorativos */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[220px] bg-gold-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-bordeaux-700/15 blur-[80px] pointer-events-none" />

      {/* Cabecera Hero del Ranking */}
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-950/80 border border-gold-400/50 text-gold-300 text-[11px] font-mono uppercase tracking-[0.2em] shadow-lg">
          <Trophy className="w-3.5 h-3.5 text-gold-400" />
          <span>✦ {config.periodLabel || 'Temporada Activa'} · Clasificación Oficial ✦</span>
        </div>

        <h2 className="font-brand font-black text-3xl sm:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-amber-200 tracking-wide">
          {config.title || 'Ranking del Reino'}
        </h2>

        {config.subtitle && (
          <p className="text-sm sm:text-base text-ivory-300 font-body leading-relaxed">
            {config.subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono">
          <span className="px-3 py-1 rounded-full bg-dark-900/90 border border-gold-500/25 text-gold-300">
            Criterio: {CRITERIA_LABELS[config.criteriaMode] || 'Clasificación oficial'}
          </span>
          <span className="px-3 py-1 rounded-full bg-dark-900/90 border border-gray-800 text-ivory-300">
            {totalParticipants} {totalParticipants === 1 ? 'participante visible' : 'participantes visibles'}
          </span>
        </div>
      </div>

      {/* PODIO TOP 3 CON PROTAGONISMO Y VENTAJAS CLARAS */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {podiumSlots.map((slot) => {
          const IconComp = slot.icon;
          const perksList = Array.isArray(slot.perkInfo?.perks) ? slot.perkInfo.perks : [];
          const holder = slot.holder;

          return (
            <div
              key={slot.pos}
              className={`${slot.orderClass} relative rounded-2xl border bg-gradient-to-b ${slot.bgClass} ${slot.borderClass} ${slot.glowClass} p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Cinta de puesto */}
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${slot.badgeClass}`}>
                  <IconComp className="w-3.5 h-3.5" />
                  {slot.label} · {slot.medalText}
                </span>
                {slot.perkInfo?.badge && (
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider truncate max-w-[150px]" title={slot.perkInfo.badge}>
                    {slot.perkInfo.badge}
                  </span>
                )}
              </div>

              {/* Ocupante actual del puesto */}
              <div className="py-5 text-center space-y-2">
                <div className={`mx-auto rounded-full border-2 flex items-center justify-center overflow-hidden bg-dark-950 shadow-xl ${
                  slot.pos === 1 ? 'w-20 h-20 border-gold-400' : 'w-16 h-16 border-white/25'
                }`}>
                  {holder?.avatarUrl ? (
                    <img
                      src={resolveMediaUrl(holder.avatarUrl)}
                      alt={holder.displayAlias}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IconComp className={`${slot.pos === 1 ? 'w-9 h-9 text-gold-400' : 'w-7 h-7 ' + slot.accentText}`} />
                  )}
                </div>

                {holder ? (
                  <>
                    <div className="flex items-center justify-center gap-1.5">
                      <h3 className={`font-brand font-extrabold ${slot.pos === 1 ? 'text-2xl text-white' : 'text-xl text-ivory-100'}`}>
                        {holder.displayAlias}
                      </h3>
                      {holder.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Tú
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-gold-400/90 uppercase tracking-wider">
                      {holder.groupName} {holder.positionName ? `· ${holder.positionName}` : ''}
                    </p>
                    {config.showScores && holder.score !== null && (
                      <div className="inline-block mt-1 px-3.5 py-1 rounded-full bg-dark-950/80 border border-gold-500/30 font-mono font-bold text-sm text-gold-300">
                        {formatScore(holder.score)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-2">
                    <p className="font-sans font-bold text-base text-gray-300">Puesto disponible</p>
                    <p className="text-xs text-gray-500 font-mono">Activa tu participación para optar a este trono</p>
                  </div>
                )}
              </div>

              {/* Ventajas exclusivas de esta posición */}
              <div className="mt-2 pt-4 border-t border-white/10 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className={`w-4 h-4 shrink-0 ${slot.accentText}`} />
                  <h4 className={`font-sans font-bold text-xs uppercase tracking-wider ${slot.accentText}`}>
                    {slot.perkInfo?.title || `Ventajas del ${slot.label}`}
                  </h4>
                </div>
                {slot.perkInfo?.summary && (
                  <p className="text-xs text-ivory-300/90 leading-relaxed">
                    {slot.perkInfo.summary}
                  </p>
                )}
                {perksList.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {perksList.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-ivory-200 leading-snug">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${slot.accentText}`} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RESTO DE LA CLASIFICACIÓN (#4 en adelante) */}
      {restOfList.length > 0 && (
        <div className="relative z-10 rounded-2xl bg-dark-950/75 border border-gold-500/20 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gold-500/15 flex items-center justify-between bg-dark-900/60">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold-400" />
              Clasificación General
            </span>
            <span className="text-[11px] font-mono text-gray-400">
              Puestos #4 – #{leaderboard.length}
            </span>
          </div>
          <div className="divide-y divide-gray-800/70">
            {restOfList.map((row) => (
              <div
                key={row.memberId}
                className={`px-5 py-3.5 flex items-center justify-between gap-4 transition-colors ${
                  row.isCurrentUser ? 'bg-gold-500/10' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-dark-900 border border-gold-500/25 flex items-center justify-center font-mono font-bold text-xs text-gold-400 shrink-0">
                    #{row.position}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-sm text-white truncate">
                        {row.displayAlias}
                      </span>
                      {row.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Tú
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 uppercase">
                      {row.groupName} {row.positionName ? `· ${row.positionName}` : ''}
                    </span>
                  </div>
                </div>
                {config.showScores && row.score !== null && (
                  <span className="font-mono font-bold text-sm text-gold-300 shrink-0">
                    {formatScore(row.score)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRIVACIDAD Y PARTICIPACIÓN VOLUNTARIA */}
      <div className="relative z-10 rounded-2xl bg-dark-950/90 border border-gold-500/30 p-5 sm:p-6">
        {myStatus?.isMember ? (
          <form onSubmit={handleSavePrefs} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-sans font-bold text-sm text-gold-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-400" />
                  Tu Privacidad y Participación en el Ranking
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  La participación es totalmente voluntaria. Puedes aparecer con un alias distinto para proteger tu identidad o mantenerte oculto.
                </p>
              </div>
              {myStatus.myPosition ? (
                <span className="px-3 py-1.5 rounded-xl bg-gold-500/15 border border-gold-400/40 text-gold-300 font-mono text-xs font-bold whitespace-nowrap">
                  Tu posición actual: #{myStatus.myPosition}
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-dark-900 border border-gray-700 text-gray-400 font-mono text-xs whitespace-nowrap">
                  Actualmente oculto del ranking
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-dark-900 border border-gray-800 cursor-pointer hover:border-gold-500/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={optIn}
                    onChange={(e) => setOptIn(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-gold-500 focus:ring-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      {optIn ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                      {optIn ? 'Participar y mostrarme en el Ranking' : 'Mantener mi perfil oculto del Ranking'}
                    </span>
                    <span className="text-[11px] text-gray-400 block">
                      Puedes activarlo o desactivarlo cuando quieras
                    </span>
                  </div>
                </label>
              </div>

              <div className="md:col-span-5">
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">
                  Alias público para el Ranking (Privacidad)
                </label>
                <input
                  type="text"
                  value={rankingAlias}
                  onChange={(e) => setRankingAlias(e.target.value)}
                  maxLength={40}
                  placeholder={`Opcional (por defecto: ${myStatus.defaultAlias})`}
                  className="w-full bg-dark-900 border border-gray-700 focus:border-gold-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="w-full py-2.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingPrefs ? '...' : 'Guardar'}</span>
                </button>
              </div>
            </div>

            {prefsFeedback && (
              <p className={`text-xs font-mono ${prefsFeedback.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {prefsFeedback}
              </p>
            )}
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-white">
                  Participación 100% Voluntaria y Privada
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                  Solo aparecen los miembros del Reino que deciden participar activamente. Además, cada usuario puede usar un <strong className="text-gold-300">alias público exclusivo</strong> para proteger su privacidad.
                </p>
              </div>
            </div>
            {onOpenMemberPortal && (
              <button
                type="button"
                onClick={onOpenMemberPortal}
                className="py-2.5 px-4 rounded-xl bg-bordeaux-800 hover:bg-bordeaux-700 border border-gold-500/50 text-gold-300 hover:text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Acceder a Mi Perfil</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
