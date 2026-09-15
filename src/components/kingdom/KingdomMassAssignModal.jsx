import React, { useState, useEffect } from 'react';
import { X, Award, CheckSquare, Square, Calendar, Filter } from 'lucide-react';
import { API_BASE } from '../../config';

export function KingdomMassAssignModal({ token, members = [], allGroups = [], onClose, onSuccess }) {
  const [library, setLibrary] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [dueDays, setDueDays] = useState(3);
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtros locales para selección
  const [filterGroup, setFilterGroup] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  useEffect(() => {
    fetchLibrary();
    // Por defecto seleccionar todos los miembros mostrados
    setSelectedMemberIds(members.map(m => m.id));
  }, [members]);

  const fetchLibrary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/library`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setLibrary(data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMembers = members.filter(m => {
    if (filterGroup && m.groupId !== filterGroup) return false;
    if (filterSkill && !m.skills?.some(s => s.skillCategory === filterSkill)) return false;
    return true;
  });

  const toggleSelectMember = (id) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMemberIds.length === filteredMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map(m => m.id));
    }
  };

  const handleMassAssign = async (e) => {
    e.preventDefault();
    if (selectedMemberIds.length === 0) {
      alert('Debes seleccionar al menos un miembro.');
      return;
    }

    const template = library.find(l => l.id === selectedTemplateId);
    if (!template) {
      alert('Por favor selecciona una actividad de la biblioteca.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          memberIds: selectedMemberIds,
          templateId: template.id,
          title: template.title,
          type: template.type,
          customInstructions: customInstructions.trim() || template.instructions,
          dueDays,
          pointsAwarded: template.pointsValue
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al asignar');
      alert(`¡Actividad asignada con éxito a ${selectedMemberIds.length} devoto(s)!`);
      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-modal rounded-2xl w-full max-w-2xl text-gray-100 p-6 border border-gold-500/40 space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-gray-800">
          <div>
            <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-400" />
              Asignación Masiva de Actividades
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Selecciona una plantilla de la biblioteca y asígnala simultáneamente a un grupo filtrado de devotos.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleMassAssign} className="space-y-4">
          {/* Selector de plantilla */}
          <div>
            <label className="block text-xs font-mono text-gold-300 mb-1">
              1. Selecciona Actividad de la Biblioteca *
            </label>
            <select
              value={selectedTemplateId}
              onChange={e => {
                setSelectedTemplateId(e.target.value);
                const t = library.find(item => item.id === e.target.value);
                if (t?.defaultDurationDays) setDueDays(t.defaultDurationDays);
              }}
              className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              required
            >
              <option value="">-- Elige una actividad --</option>
              {library.map(item => (
                <option key={item.id} value={item.id}>
                  [{item.type}] {item.title} (+{item.pointsValue} pts)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Plazo de Entrega (Días)</label>
              <input
                type="number"
                min="1"
                value={dueDays}
                onChange={e => setDueDays(e.target.value)}
                className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Instrucciones Especiales Comunes</label>
              <input
                type="text"
                placeholder="Opcional: nota para este lote"
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Filtros rápidos de selección de miembros */}
          <div className="pt-2 border-t border-gray-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-gold-400 font-bold">
                2. Miembros Seleccionados ({selectedMemberIds.length} de {filteredMembers.length})
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-gold-300 hover:underline font-mono text-[11px]"
              >
                {selectedMemberIds.length === filteredMembers.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={filterGroup}
                onChange={e => setFilterGroup(e.target.value)}
                className="bg-dark-950 border border-gray-700 rounded px-2 py-1 text-[11px] text-white"
              >
                <option value="">Cualquier Grupo</option>
                {allGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>

              <select
                value={filterSkill}
                onChange={e => setFilterSkill(e.target.value)}
                className="bg-dark-950 border border-gray-700 rounded px-2 py-1 text-[11px] text-white"
              >
                <option value="">Cualquier Habilidad</option>
                <option value="VIDEO_EDITING">Edición de Vídeo</option>
                <option value="PROGRAMMING">Programación</option>
                <option value="DESIGN">Diseño Gráfico</option>
                <option value="MARKETING">Marketing</option>
              </select>
            </div>

            {/* Checklist de miembros */}
            <div className="max-h-48 overflow-y-auto border border-gray-800 rounded-lg p-2 space-y-1 bg-dark-950/70">
              {filteredMembers.map(m => {
                const isSelected = selectedMemberIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleSelectMember(m.id)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-gold-500/15 border border-gold-500/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-gold-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="font-mono text-gold-300 font-bold">{m.memberNumber}</span>
                      <span className="text-white font-medium">{m.alias}</span>
                      <span className="text-[10px] text-gray-400">({m.group?.name || 'Sin grupo'})</span>
                    </div>

                    {m.skills?.length > 0 && (
                      <span className="text-[10px] font-mono text-gray-400">
                        {m.skills[0].skillName}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-dark-900 border border-gray-700 text-xs text-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs uppercase font-sans tracking-wider disabled:opacity-50"
            >
              {loading ? 'Asignando...' : `Confirmar Asignación (${selectedMemberIds.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
