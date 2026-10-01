import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, RefreshCw, Award, Clock, Tag, X, Check, Save } from 'lucide-react';
import { API_BASE } from '../../config';

export function KingdomActivitiesView({ token }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  const defaultForm = {
    title: '',
    type: 'TASK',
    instructions: '',
    pointsValue: 15,
    defaultDurationDays: 3,
    tags: '',
    recommendedGroupId: ''
  };

  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/library`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setActivities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleOpenEdit = (act) => {
    setEditingId(act.id);
    let tagsStr = '';
    try {
      const parsed = typeof act.tags === 'string' ? JSON.parse(act.tags) : act.tags;
      tagsStr = Array.isArray(parsed) ? parsed.join(', ') : (act.tags || '');
    } catch {
      tagsStr = act.tags || '';
    }

    setForm({
      title: act.title || '',
      type: act.type || 'TASK',
      instructions: act.instructions || '',
      pointsValue: act.pointsValue !== undefined ? act.pointsValue : 15,
      defaultDurationDays: act.defaultDurationDays !== undefined ? act.defaultDurationDays : 3,
      tags: tagsStr,
      recommendedGroupId: act.recommendedGroupId || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const url = editingId
        ? `${API_BASE}/api/kingdom/admin/activities/library/${editingId}`
        : `${API_BASE}/api/kingdom/admin/activities/library`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          tags: tagsArray
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al guardar actividad');

      setShowModal(false);
      setEditingId(null);
      fetchActivities();
      alert(editingId ? '¡Actividad modificada con éxito!' : '¡Actividad creada en la biblioteca con éxito!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`¿Eliminar o archivar la actividad "${title}" de la biblioteca?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/library/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchActivities();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = activities.filter(act => {
    if (selectedType && act.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/80 p-5 rounded-xl border border-gold-500/30">
        <div>
          <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
            📚 Biblioteca Central de Actividades & Objetivos
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Catálogo reutilizable de tareas, entrenamientos, rituales, privilegios y castigos. Puedes editar cualquier plantilla en cualquier momento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="py-2 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-sans font-bold text-xs uppercase flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> Nueva Plantilla
          </button>
          <button
            onClick={fetchActivities}
            className="p-2 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 hover:text-white"
            title="Recargar biblioteca"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter by Type */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {['', 'TASK', 'TRAINING', 'RITUAL', 'PRIVILEGE', 'PUNISHMENT', 'GOAL'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`py-1.5 px-3 rounded-lg border transition-all whitespace-nowrap ${
              selectedType === type
                ? 'bg-gold-500 text-dark-950 font-bold border-gold-400'
                : 'bg-dark-950 border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {type === '' ? 'Todas' : type}
          </button>
        ))}
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gold-400 font-mono text-xs">
            Cargando biblioteca...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center glass-panel rounded-xl border border-gray-800 text-gray-500 font-mono text-xs">
            No hay actividades en esta categoría. Pulsa en "Nueva Plantilla".
          </div>
        ) : (
          filtered.map(act => {
            let tags = [];
            try {
              tags = typeof act.tags === 'string' ? JSON.parse(act.tags) : (act.tags || []);
            } catch {
              tags = [];
            }

            return (
              <div key={act.id} className="glass-panel p-5 rounded-xl border border-gray-800 space-y-3 flex flex-col justify-between hover:border-gold-500/40 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-dark-950 border border-gray-800 text-gold-400">
                      {act.type}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      +{act.pointsValue || 0} pts
                    </span>
                  </div>

                  <h4 className="font-brand font-bold text-white text-base leading-snug">
                    {act.title}
                  </h4>

                  <p className="text-xs text-gray-300 font-body mt-2 leading-relaxed line-clamp-3">
                    {act.instructions || 'Sin instrucciones adicionales registradas.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-800/80">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {act.defaultDurationDays || 3} días de vigencia
                    </span>
                  </div>

                  {Array.isArray(tags) && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-dark-950 border border-gray-800 text-[10px] font-mono text-gray-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Botones Editar y Borrar */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800/40">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(act)}
                      className="py-1 px-2.5 rounded bg-gold-500/15 hover:bg-gold-500/30 border border-gold-500/40 text-gold-300 font-mono text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Editar plantilla"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(act.id, act.title)}
                      className="p-1.5 rounded bg-dark-900 border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 transition-colors"
                      title="Eliminar plantilla"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear / Editar Plantilla */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-modal rounded-2xl p-6 max-w-lg w-full border border-gold-500/40 text-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h4 className="font-brand font-bold text-base text-gold-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold-400" />
                {editingId ? 'Editar Actividad de la Biblioteca' : 'Nueva Plantilla de Actividad'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-gray-300 mb-1">Título de la Actividad *</label>
                <input
                  type="text"
                  placeholder="Ej: Ritual Matutino de Devoción"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Tipo de Actividad</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="TASK">Tarea (TASK)</option>
                    <option value="TRAINING">Entrenamiento (TRAINING)</option>
                    <option value="RITUAL">Ritual (RITUAL)</option>
                    <option value="PRIVILEGE">Privilegio (PRIVILEGE)</option>
                    <option value="PUNISHMENT">Castigo (PUNISHMENT)</option>
                    <option value="GOAL">Objetivo (GOAL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Puntos de Exp. (XP)</label>
                  <input
                    type="number"
                    value={form.pointsValue}
                    onChange={e => setForm({ ...form, pointsValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Instrucciones / Mandato de la Princesa</label>
                <textarea
                  rows="4"
                  placeholder="Describe con precisión qué debe hacer el sumiso..."
                  value={form.instructions}
                  onChange={e => setForm({ ...form, instructions: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Días límite por defecto</label>
                  <input
                    type="number"
                    value={form.defaultDurationDays}
                    onChange={e => setForm({ ...form, defaultDurationDays: parseInt(e.target.value, 10) || 3 })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Etiquetas (separadas por comas)</label>
                  <input
                    type="text"
                    placeholder="Devoción, Físico, Digital"
                    value={form.tags}
                    onChange={e => setForm({ ...form, tags: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-3 rounded bg-dark-900 border border-gray-700 text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2 px-5 rounded bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold uppercase text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
