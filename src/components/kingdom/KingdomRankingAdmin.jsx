import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Award, Save, RefreshCw, Sliders, Users, Plus, Trash2, Edit, RotateCcw, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';
import { API_BASE } from '../../config';

const CRITERIA_OPTIONS = [
  { id: 'COMBINED', name: 'Fórmula Combinada (Ponderada)', desc: 'Combina XP, Tributos (€), Tareas completadas y Progreso según pesos configurables.' },
  { id: 'EXPERIENCE', name: 'Experiencia (XP)', desc: 'Clasifica por puntos de experiencia acumulados.' },
  { id: 'REVENUE', name: 'Tributos / Aportaciones (€)', desc: 'Clasifica por importe total confirmado.' },
  { id: 'TASKS', name: 'Tareas Completadas', desc: 'Clasifica por número de mandatos y tareas cumplidas.' },
  { id: 'PROGRESS', name: 'Progreso General (%)', desc: 'Clasifica por porcentaje de avance hacia ascenso.' }
];

export function KingdomRankingAdmin({ token }) {
  const [subTab, setSubTab] = useState('criteria'); // criteria | perks | members
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState(null);
  const [podiumPerks, setPodiumPerks] = useState({
    first: { title: '', badge: '', summary: '', perks: [] },
    second: { title: '', badge: '', summary: '', perks: [] },
    third: { title: '', badge: '', summary: '', perks: [] }
  });
  const [allMembers, setAllMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/ranking`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setConfig(json.config);
        setPodiumPerks(json.podiumPerks);
        setAllMembers(json.allMembers || []);
      }
    } catch (e) {
      console.error('Error cargando admin ranking:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfigAndPerks = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/ranking/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...config,
          podiumPerks
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error guardando configuración');
      setConfig(json.config);
      setPodiumPerks(json.podiumPerks);
      setAllMembers(json.allMembers || []);
      alert('¡Configuración y ventajas del Ranking guardadas correctamente!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updatePerkSlot = (slotKey, field, value) => {
    setPodiumPerks(prev => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], [field]: value }
    }));
  };

  const handleAddPerkItem = (slotKey) => {
    setPodiumPerks(prev => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        perks: [...(prev[slotKey].perks || []), 'Nueva ventaja exclusiva']
      }
    }));
  };

  const handleUpdatePerkItem = (slotKey, idx, value) => {
    setPodiumPerks(prev => {
      const next = [...(prev[slotKey].perks || [])];
      next[idx] = value;
      return { ...prev, [slotKey]: { ...prev[slotKey], perks: next } };
    });
  };

  const handleRemovePerkItem = (slotKey, idx) => {
    setPodiumPerks(prev => {
      const next = (prev[slotKey].perks || []).filter((_, i) => i !== idx);
      return { ...prev, [slotKey]: { ...prev[slotKey], perks: next } };
    });
  };

  const openEditMember = (m) => {
    setEditingMember(m);
    setMemberForm({
      rankingOptIn: Boolean(m.rankingOptIn),
      rankingAlias: m.rankingAlias || '',
      rankingScoreAdjustment: m.rankingScoreAdjustment || 0,
      rankingManualPosition: m.rankingManualPosition || '',
      experiencePoints: m.experiencePoints || 0,
      rankingAdminNote: m.rankingAdminNote || ''
    });
  };

  const handleSaveMemberAdjustment = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/ranking/members/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(memberForm)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error guardando ajuste');
      setAllMembers(json.allMembers || []);
      setEditingMember(null);
      alert('Corrección aplicada al ranking correctamente.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetAdjustments = async () => {
    if (!confirm('¿Restablecer todos los ajustes manuales y puestos forzados del ranking? Los datos base (XP, tributos, tareas) NO se borran.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/ranking/reset-adjustments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setAllMembers(json.allMembers || []);
        alert('Todos los ajustes manuales han sido restablecidos.');
      }
    } catch (e) {
      alert('Error restableciendo ajustes');
    }
  };

  if (loading || !config) {
    return <div className="py-12 text-center text-xs font-mono text-gold-400">Cargando administración del Ranking...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/80 p-5 rounded-xl border border-gold-500/30">
        <div>
          <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-400" />
            Ranking del Reino · Criterios, Ventajas y Correcciones
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Configura cómo se calcula la clasificación, edita las ventajas del 1º, 2º y 3º puesto y corrige cualquier error manualmente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveConfigAndPerks}
            disabled={saving}
            className="py-2 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-sans font-bold text-xs uppercase flex items-center gap-1.5 shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-pestañas */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
        {[
          { id: 'criteria', label: '1. Criterios y Configuración', icon: Sliders },
          { id: 'perks', label: '2. Ventajas Top 3 (1º, 2º, 3º)', icon: Crown },
          { id: 'members', label: `3. Clasificación y Correcciones (${allMembers.length})`, icon: Users }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`py-2 px-4 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                subTab === t.id
                  ? 'bg-gold-500 text-dark-950 shadow'
                  : 'bg-dark-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CRITERIOS Y CONFIGURACIÓN */}
      {subTab === 'criteria' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
            <h4 className="font-sans font-bold text-sm text-gold-300 uppercase tracking-wider">Ajustes Generales</h4>

            <label className="flex items-center gap-2.5 p-3 rounded-lg bg-dark-950 border border-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled !== false}
                onChange={e => setConfig({ ...config, enabled: e.target.checked })}
              />
              <span className="text-xs text-white font-semibold">Mostrar Ranking públicamente en el apartado del Reino</span>
            </label>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Título del Ranking</label>
              <input
                type="text"
                value={config.title || ''}
                onChange={e => setConfig({ ...config, title: e.target.value })}
                className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Subtítulo descriptivo</label>
              <textarea
                rows="2"
                value={config.subtitle || ''}
                onChange={e => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Etiqueta de Temporada / Mes</label>
                <input
                  type="text"
                  value={config.periodLabel || ''}
                  onChange={e => setConfig({ ...config, periodLabel: e.target.value })}
                  placeholder="Ej: Noviembre 2026"
                  className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Máx. puestos visibles</label>
                <input
                  type="number"
                  min="3"
                  max="100"
                  value={config.maxVisible || 20}
                  onChange={e => setConfig({ ...config, maxVisible: parseInt(e.target.value, 10) || 20 })}
                  className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-lg bg-dark-950 border border-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showScores !== false}
                onChange={e => setConfig({ ...config, showScores: e.target.checked })}
              />
              <span className="text-xs text-gray-200">Mostrar puntuación numérica junto a cada puesto</span>
            </label>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
            <h4 className="font-sans font-bold text-sm text-gold-300 uppercase tracking-wider">Criterio de Clasificación</h4>

            <div className="space-y-2">
              {CRITERIA_OPTIONS.map(opt => (
                <label
                  key={opt.id}
                  className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                    config.criteriaMode === opt.id
                      ? 'bg-gold-500/15 border-gold-400 text-white'
                      : 'bg-dark-950 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="criteriaMode"
                      checked={config.criteriaMode === opt.id}
                      onChange={() => setConfig({ ...config, criteriaMode: opt.id })}
                    />
                    <span className="text-xs font-bold">{opt.name}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 ml-5">{opt.desc}</p>
                </label>
              ))}
            </div>

            {config.criteriaMode === 'COMBINED' && (
              <div className="p-4 rounded-xl bg-dark-950 border border-gold-500/30 space-y-3">
                <p className="text-[11px] font-mono text-gold-300 uppercase font-bold">
                  Pesos de la Fórmula Combinada:
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="block text-gray-400 mb-1">Puntos por 1 XP</label>
                    <input
                      type="number"
                      step="0.5"
                      value={config.weightXp ?? 1}
                      onChange={e => setConfig({ ...config, weightXp: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Puntos por 1€ Tributo</label>
                    <input
                      type="number"
                      step="1"
                      value={config.weightRevenue ?? 10}
                      onChange={e => setConfig({ ...config, weightRevenue: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Puntos por Tarea</label>
                    <input
                      type="number"
                      step="5"
                      value={config.weightTasks ?? 100}
                      onChange={e => setConfig({ ...config, weightTasks: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Puntos por 1% Progreso</label>
                    <input
                      type="number"
                      step="1"
                      value={config.weightProgress ?? 5}
                      onChange={e => setConfig({ ...config, weightProgress: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VENTAJAS DEL PODIO (1º, 2º Y 3º PUESTO) */}
      {subTab === 'perks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { key: 'first', label: '1º Puesto · Oro', border: 'border-gold-400/60', icon: Crown, accent: 'text-gold-400' },
            { key: 'second', label: '2º Puesto · Plata', border: 'border-slate-400/50', icon: Medal, accent: 'text-slate-300' },
            { key: 'third', label: '3º Puesto · Bronce', border: 'border-amber-500/50', icon: Award, accent: 'text-amber-400' }
          ].map(slot => {
            const Icon = slot.icon;
            const info = podiumPerks[slot.key] || { title: '', badge: '', summary: '', perks: [] };
            return (
              <div key={slot.key} className={`glass-panel p-5 rounded-xl border ${slot.border} space-y-3`}>
                <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                  <Icon className={`w-5 h-5 ${slot.accent}`} />
                  <h4 className={`font-brand font-bold text-base ${slot.accent}`}>{slot.label}</h4>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Título del Puesto</label>
                  <input
                    type="text"
                    value={info.title || ''}
                    onChange={e => updatePerkSlot(slot.key, 'title', e.target.value)}
                    className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Insignia / Etiqueta</label>
                  <input
                    type="text"
                    value={info.badge || ''}
                    onChange={e => updatePerkSlot(slot.key, 'badge', e.target.value)}
                    className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Resumen</label>
                  <textarea
                    rows="2"
                    value={info.summary || ''}
                    onChange={e => updatePerkSlot(slot.key, 'summary', e.target.value)}
                    className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gold-300 uppercase font-bold">Ventajas incluidas</span>
                    <button
                      type="button"
                      onClick={() => handleAddPerkItem(slot.key)}
                      className="text-[11px] font-mono text-gold-400 hover:text-white flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Añadir
                    </button>
                  </div>

                  {(info.perks || []).map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={p}
                        onChange={e => handleUpdatePerkItem(slot.key, idx, e.target.value)}
                        className="flex-1 bg-dark-950 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePerkItem(slot.key, idx)}
                        className="p-1.5 text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: CLASIFICACIÓN EN VIVO Y CORRECCIÓN DE ERRORES */}
      {subTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-xl bg-dark-950/70 border border-gray-800">
            <p className="text-xs text-gray-300">
              Aquí puedes ver a todos los miembros, comprobar quién participa voluntariamente, editar su alias público, sumar/restar puntos de corrección o forzar un puesto si hubo un error.
            </p>
            <button
              type="button"
              onClick={handleResetAdjustments}
              className="py-2 px-3 rounded-lg bg-dark-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs font-mono flex items-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer ajustes
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-dark-950/80">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-dark-900 text-gray-400 uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="p-3">Puesto</th>
                  <th className="p-3">Miembro / Alias Público</th>
                  <th className="p-3">Visibilidad</th>
                  <th className="p-3">Métricas Base</th>
                  <th className="p-3">Ajuste Admin</th>
                  <th className="p-3">Total</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {allMembers.map(m => (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-gold-400">
                      {m.currentPosition ? `#${m.currentPosition}` : '—'}
                      {m.rankingManualPosition && (
                        <span className="block text-[9px] text-amber-400">Forzado #{m.rankingManualPosition}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-sans font-bold text-white block">{m.alias}</span>
                      {m.rankingAlias && (
                        <span className="text-[10px] text-emerald-400">Alias público: {m.rankingAlias}</span>
                      )}
                      {m.rankingAdminNote && (
                        <span className="block text-[10px] text-amber-300/80 italic">Nota: {m.rankingAdminNote}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {m.rankingOptIn ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                          <Eye className="w-3 h-3" /> Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px]">
                          <EyeOff className="w-3 h-3" /> Oculto
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-gray-300">
                      {m.experiencePoints} XP · {Number(m.totalRevenue || 0).toFixed(0)}€ · {m.completedTasks} tareas
                    </td>
                    <td className="p-3">
                      <span className={m.rankingScoreAdjustment > 0 ? 'text-emerald-400' : m.rankingScoreAdjustment < 0 ? 'text-red-400' : 'text-gray-500'}>
                        {m.rankingScoreAdjustment > 0 ? `+${m.rankingScoreAdjustment}` : m.rankingScoreAdjustment || 0}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{m.score}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openEditMember(m)}
                        className="py-1.5 px-3 rounded-lg bg-dark-900 border border-gold-500/40 text-gold-300 hover:bg-gold-500 hover:text-dark-950 text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                      >
                        <Edit className="w-3 h-3" /> Corregir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE CORRECCIÓN DE MIEMBRO */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-modal rounded-2xl p-6 max-w-md w-full border border-gold-500/40 text-gray-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h4 className="font-brand font-bold text-base text-gold-300">
                Corregir Ranking · {editingMember.alias}
              </h4>
              <button onClick={() => setEditingMember(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberAdjustment} className="space-y-3 text-xs font-mono">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-dark-950 border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={memberForm.rankingOptIn}
                  onChange={e => setMemberForm({ ...memberForm, rankingOptIn: e.target.checked })}
                />
                <span className="text-white">Visible / Participando en el Ranking</span>
              </label>

              <div>
                <label className="block text-gray-400 mb-1">Alias público en Ranking (privacidad)</label>
                <input
                  type="text"
                  value={memberForm.rankingAlias}
                  onChange={e => setMemberForm({ ...memberForm, rankingAlias: e.target.value })}
                  placeholder={`Vacío = usar "${editingMember.alias}"`}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Ajuste manual (+/- pts)</label>
                  <input
                    type="number"
                    step="1"
                    value={memberForm.rankingScoreAdjustment}
                    onChange={e => setMemberForm({ ...memberForm, rankingScoreAdjustment: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Forzar puesto (opcional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Automático"
                    value={memberForm.rankingManualPosition}
                    onChange={e => setMemberForm({ ...memberForm, rankingManualPosition: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Corregir Experiencia (XP) directamente</label>
                <input
                  type="number"
                  min="0"
                  value={memberForm.experiencePoints}
                  onChange={e => setMemberForm({ ...memberForm, experiencePoints: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Nota interna de la corrección</label>
                <input
                  type="text"
                  value={memberForm.rankingAdminNote}
                  onChange={e => setMemberForm({ ...memberForm, rankingAdminNote: e.target.value })}
                  placeholder="Ej: Compensación por error de registro"
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="py-2 px-3 rounded bg-dark-900 border border-gray-700 text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2 px-4 rounded bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold uppercase flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {saving ? 'Guardando...' : 'Aplicar Corrección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
