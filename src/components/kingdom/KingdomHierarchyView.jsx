import React, { useState, useEffect } from 'react';
import { Crown, Edit, Save, RefreshCw, Eye, EyeOff, Shield, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE } from '../../config';

export function KingdomHierarchyView({ token }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupForm, setGroupForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setGroups(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleStartEdit = (group) => {
    setEditingGroupId(group.id);
    setGroupForm({
      name: group.name || '',
      badge: group.badge || '',
      subtitle: group.subtitle || '',
      description: group.description || '',
      expectations: group.expectations || '',
      contributions: group.contributions || '',
      entryRequirements: group.entryRequirements || '',
      retentionRequirements: group.retentionRequirements || '',
      benefits: group.benefits || '',
      limitations: group.limitations || '',
      unlocks: group.unlocks || '',
      progressionInfo: group.progressionInfo || '',
      visibility: group.visibility || 'MEMBERS_ONLY',
      order: group.order || 0
    });
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/groups/${editingGroupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(groupForm)
      });
      if (!res.ok) throw new Error('Error al guardar grupo');
      setEditingGroupId(null);
      fetchGroups();
      alert('Grupo jerárquico actualizado con éxito');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/80 p-5 rounded-xl border border-gold-500/30">
        <div>
          <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
            🏛️ Jerarquía del Reino: Sociedades & Rango
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Configuración editable de los 4 estamentos del Reino: expectativas, requisitos de permanencia, beneficios, desbloqueos y visibilidad.
          </p>
        </div>
        <button
          onClick={fetchGroups}
          className="p-2 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 hover:text-white text-xs font-mono flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gold-400 font-mono text-xs">
            Cargando jerarquía del Reino...
          </div>
        ) : (
          groups.map(group => {
            const isEditing = editingGroupId === group.id;

            return (
              <div key={group.id} className="glass-panel rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/70 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold bg-gold-500/10 text-gold-400 border border-gold-500/30 px-2.5 py-1 rounded">
                      {group.badge || `NIVEL ${group.order}`}
                    </span>
                    <div>
                      <h4 className="font-brand font-bold text-lg text-white">
                        {group.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-serif italic">{group.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">
                      {group._count?.members || 0} devoto(s) activos
                    </span>
                    <button
                      onClick={() => isEditing ? setEditingGroupId(null) : handleStartEdit(group)}
                      className="py-1.5 px-3 rounded-lg bg-dark-900 border border-gray-700 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-gold-400" />
                      {isEditing ? 'Cerrar Edición' : 'Editar Estamento'}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveGroup} className="p-6 space-y-4 bg-dark-950/90">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">Nombre del Grupo</label>
                        <input
                          type="text"
                          value={groupForm.name}
                          onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-white font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">Badge de Nivel</label>
                        <input
                          type="text"
                          value={groupForm.badge}
                          onChange={e => setGroupForm({ ...groupForm, badge: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gold-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">Visibilidad</label>
                        <select
                          value={groupForm.visibility}
                          onChange={e => setGroupForm({ ...groupForm, visibility: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                        >
                          <option value="PUBLIC_SUMMARY">Pública Resumida (Visitantes)</option>
                          <option value="MEMBERS_ONLY">Solo Miembros Registrados</option>
                          <option value="ADMIN_ONLY">Privada / Solo Administración</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1">Subtítulo / Lema</label>
                      <input
                        type="text"
                        value={groupForm.subtitle}
                        onChange={e => setGroupForm({ ...groupForm, subtitle: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1">Qué Representa / Descripción</label>
                      <textarea
                        rows="2"
                        value={groupForm.description}
                        onChange={e => setGroupForm({ ...groupForm, description: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gold-400 mb-1">Qué se espera del Devoto</label>
                        <textarea
                          rows="3"
                          value={groupForm.expectations}
                          onChange={e => setGroupForm({ ...groupForm, expectations: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gold-400 mb-1">Qué puede Aportar al Reino</label>
                        <textarea
                          rows="3"
                          value={groupForm.contributions}
                          onChange={e => setGroupForm({ ...groupForm, contributions: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">Requisitos de Entrada</label>
                        <textarea
                          rows="2"
                          value={groupForm.entryRequirements}
                          onChange={e => setGroupForm({ ...groupForm, entryRequirements: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">Requisitos de Permanencia</label>
                        <textarea
                          rows="2"
                          value={groupForm.retentionRequirements}
                          onChange={e => setGroupForm({ ...groupForm, retentionRequirements: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-emerald-400 mb-1">Beneficios Otorgados</label>
                        <textarea
                          rows="2"
                          value={groupForm.benefits}
                          onChange={e => setGroupForm({ ...groupForm, benefits: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-crimson-400 mb-1">Limitaciones</label>
                        <textarea
                          rows="2"
                          value={groupForm.limitations}
                          onChange={e => setGroupForm({ ...groupForm, limitations: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gold-300 mb-1">Desbloqueos / Vías de Ascenso</label>
                        <textarea
                          rows="2"
                          value={groupForm.progressionInfo}
                          onChange={e => setGroupForm({ ...groupForm, progressionInfo: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={() => setEditingGroupId(null)}
                        className="py-2 px-4 rounded bg-dark-900 border border-gray-700 text-xs text-gray-400"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="py-2 px-6 rounded bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase font-sans tracking-wider"
                      >
                        {saving ? 'Guardando...' : 'Guardar Configuración'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-5 space-y-3 text-xs">
                    <p className="text-gray-300">{group.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-[11px]">
                      <div className="p-2.5 rounded bg-dark-950 border border-gray-800">
                        <span className="font-mono text-gold-400 block mb-0.5 font-bold">Expectativas:</span>
                        <p className="text-gray-400">{group.expectations || '—'}</p>
                      </div>
                      <div className="p-2.5 rounded bg-dark-950 border border-gray-800">
                        <span className="font-mono text-gold-400 block mb-0.5 font-bold">Aportaciones:</span>
                        <p className="text-gray-400">{group.contributions || '—'}</p>
                      </div>
                      <div className="p-2.5 rounded bg-dark-950 border border-gray-800">
                        <span className="font-mono text-emerald-400 block mb-0.5 font-bold">Beneficios:</span>
                        <p className="text-gray-400">{group.benefits || '—'}</p>
                      </div>
                      <div className="p-2.5 rounded bg-dark-950 border border-gray-800">
                        <span className="font-mono text-crimson-400 block mb-0.5 font-bold">Limitaciones:</span>
                        <p className="text-gray-400">{group.limitations || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
