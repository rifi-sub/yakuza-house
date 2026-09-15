import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, RefreshCw, Award, Clock, Tag } from 'lucide-react';
import { API_BASE } from '../../config';

export function KingdomActivitiesView({ token }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const [form, setForm] = useState({
    title: '',
    type: 'TASK',
    instructions: '',
    pointsValue: 15,
    defaultDurationDays: 3,
    tags: ''
  });

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

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/library`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          tags: tagsArray
        })
      });
      if (!res.ok) throw new Error('Error al crear actividad');
      setShowCreateModal(false);
      setForm({ title: '', type: 'TASK', instructions: '', pointsValue: 15, defaultDurationDays: 3, tags: '' });
      fetchActivities();
      alert('Actividad agregada a la biblioteca con éxito');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/80 p-5 rounded-xl border border-gold-500/30">
        <div>
          <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
            📚 Biblioteca Central de Actividades
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Catálogo reutilizable de tareas, entrenamientos, rituales, privilegios y castigos. Asignables masiva o individualmente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="py-2 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-sans font-bold text-xs uppercase flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> Nueva Plantilla
          </button>
          <button
            onClick={fetchActivities}
            className="p-2 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 hover:text-white"
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
            No hay actividades en esta categoría.
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
                      +{act.pointsValue} pts
                    </span>
                  </div>
                  <h4 className="font-brand font-bold text-base text-white">{act.title}</h4>
                  <p className="text-xs text-gray-300 mt-2 line-clamp-3">{act.instructions}</p>
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-[11px] font-mono text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold-500" /> {act.defaultDurationDays ? `${act.defaultDurationDays} días` : 'Sin plazo'}
                  </span>
                  <div className="flex gap-1">
                    {tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="text-[9px] bg-dark-900 px-1.5 py-0.5 rounded text-gray-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear Actividad */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-modal rounded-2xl p-6 max-w-lg w-full border border-gold-500/40 text-gray-100 space-y-4">
            <h3 className="font-brand font-bold text-lg text-gold-300">
              Nueva Plantilla de Actividad
            </h3>
            <form onSubmit={handleCreateActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Título de la Actividad *</label>
                <input
                  type="text"
                  placeholder="Ej: Ritual Matutino de Sumisión"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Tipo</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-2 py-2 text-xs text-white"
                  >
                    <option value="TASK">Tarea</option>
                    <option value="TRAINING">Entrenamiento</option>
                    <option value="RITUAL">Ritual</option>
                    <option value="PRIVILEGE">Privilegio</option>
                    <option value="PUNISHMENT">Castigo</option>
                    <option value="GOAL">Objetivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Puntos de Mérito</label>
                  <input
                    type="number"
                    value={form.pointsValue}
                    onChange={e => setForm({ ...form, pointsValue: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Días por Defecto</label>
                  <input
                    type="number"
                    min="1"
                    value={form.defaultDurationDays}
                    onChange={e => setForm({ ...form, defaultDurationDays: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Instrucciones Detalladas</label>
                <textarea
                  rows="3"
                  placeholder="Describe los pasos y condiciones para cumplir esta actividad..."
                  value={form.instructions}
                  onChange={e => setForm({ ...form, instructions: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Etiquetas (separadas por comas)</label>
                <input
                  type="text"
                  placeholder="Ej: Diario, Devoción, Online"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2 px-4 rounded bg-dark-900 border border-gray-700 text-xs text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase"
                >
                  Guardar Plantilla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
