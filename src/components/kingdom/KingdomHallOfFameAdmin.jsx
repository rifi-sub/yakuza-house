import React, { useState, useEffect } from 'react';
import { Crown, Plus, Edit, Trash2, Save, X, Eye, EyeOff, RefreshCw, User, CheckCircle2, Upload, Image as ImageIcon } from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../../config';

export function KingdomHallOfFameAdmin({ token }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const defaultForm = {
    alias: '',
    rank: 'Esclavos',
    role: '',
    avatarUrl: '',
    servedSince: '',
    quote: '',
    order: 0,
    active: true
  };

  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch(`${API_BASE}/api/store/admin/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`El servidor respondió con un error no JSON (${res.status}): ${text.slice(0, 120)}`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen');

      const uploadedUrl = (data.urls && data.urls[0]) || data.url;
      if (uploadedUrl) {
        setForm(prev => ({ ...prev, avatarUrl: uploadedUrl }));
      }
    } catch (err) {
      alert(`Error subiendo foto: ${err.message}`);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/hall-of-fame`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...defaultForm, order: members.length + 1 });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      alias: item.alias || '',
      rank: item.rank || 'Esclavos',
      role: item.role || '',
      avatarUrl: item.avatarUrl || '',
      servedSince: item.servedSince || '',
      quote: item.quote || '',
      order: item.order || 0,
      active: item.active !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.alias.trim()) {
      alert('El alias es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `${API_BASE}/api/kingdom/admin/hall-of-fame/${editingId}`
        : `${API_BASE}/api/kingdom/admin/hall-of-fame`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      setShowModal(false);
      setEditingId(null);
      fetchMembers();
      alert('¡Ficha del Muro del Reino guardada con éxito!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta ficha del Muro de la Fama?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/hall-of-fame/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchMembers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/hall-of-fame/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ active: !item.active })
      });
      if (res.ok) fetchMembers();
    } catch (err) {
      alert('Error al cambiar visibilidad');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/80 p-5 rounded-xl border border-gold-500/30">
        <div>
          <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
            👑 Muro del Reino · Muro de la Fama
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Administra los miembros que aparecen públicamente en el Muro de la Fama (foto/avatar, alias, rango, función y antigüedad).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="py-2 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-sans font-bold text-xs uppercase flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir Miembro al Muro
          </button>
          <button
            onClick={fetchMembers}
            className="p-2 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid de fichas del muro */}
      {loading ? (
        <div className="text-center py-12 text-gold-400 font-mono text-xs">
          Cargando Muro del Reino...
        </div>
      ) : members.length === 0 ? (
        <div className="p-8 text-center glass-panel rounded-xl border border-gray-800 text-gray-500 font-mono text-xs">
          No hay miembros registrados en el Muro de la Fama. Pulsa en "Añadir Miembro al Muro".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(item => (
            <div
              key={item.id}
              className={`glass-panel p-5 rounded-xl border transition-all flex flex-col justify-between ${
                item.active ? 'border-gray-800 hover:border-gold-500/40' : 'border-red-900/40 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-950 border border-gold-500/40 flex items-center justify-center shrink-0">
                      {item.avatarUrl ? (
                        <img src={resolveMediaUrl(item.avatarUrl)} alt={item.alias} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gold-400/60" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{item.alias}</h4>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-dark-900 border border-gold-500/30 text-gold-300">
                        {item.rank}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    item.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {item.active ? 'PUBLICADO' : 'RETIRADO'}
                  </span>
                </div>

                {item.role && (
                  <p className="text-xs text-gray-300 font-sans">
                    <strong className="text-gold-400 text-[10px] uppercase font-mono block">Función:</strong>
                    {item.role}
                  </p>
                )}

                {item.servedSince && (
                  <p className="text-[11px] text-gray-400 font-mono">
                    ⏳ {item.servedSince}
                  </p>
                )}

                {item.quote && (
                  <p className="text-xs text-gold-200/90 italic font-serif border-l border-gold-500/40 pl-2">
                    {item.quote}
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`text-xs font-mono flex items-center gap-1 ${
                    item.active ? 'text-gray-400 hover:text-amber-400' : 'text-emerald-400 hover:text-white'
                  }`}
                  title={item.active ? 'Retirar temporalmente del muro público' : 'Publicar en el muro'}
                >
                  {item.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{item.active ? 'Retirar' : 'Publicar'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded bg-dark-900 border border-gray-700 hover:border-gold-500 text-gray-300 hover:text-gold-300"
                    title="Editar ficha"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded bg-dark-900 border border-gray-700 hover:border-red-500 text-gray-300 hover:text-red-400"
                    title="Eliminar del muro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-modal rounded-2xl p-6 max-w-lg w-full border border-gold-500/40 text-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h4 className="font-brand font-bold text-base text-gold-300 flex items-center gap-2">
                <Crown className="w-4 h-4 text-gold-400" />
                {editingId ? 'Editar Ficha del Muro de la Fama' : 'Añadir Nuevo Miembro al Muro'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Alias del Devoto *</label>
                  <input
                    type="text"
                    value={form.alias}
                    onChange={e => setForm({ ...form, alias: e.target.value })}
                    placeholder="Ej: Kenshi #001"
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Rango dentro del Reino</label>
                  <select
                    value={form.rank}
                    onChange={e => setForm({ ...form, rank: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option value="Esclavos">Esclavos (Nivel Máximo)</option>
                    <option value="Caballeros">Caballeros (Nivel 3)</option>
                    <option value="Sirvientes">Sirvientes (Nivel 2)</option>
                    <option value="Plebeyos">Plebeyos (Nivel 1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Función o Puesto Actual / Objetivo</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  placeholder="Ej: Propiedad Exclusiva · Asistente Personal & Logística"
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Fotografía / Retrato del Miembro (Portada completa)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.avatarUrl}
                    onChange={e => setForm({ ...form, avatarUrl: e.target.value })}
                    placeholder="https://... o ruta interna (/uploads/... o /portraits/...)"
                    className="flex-1 bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white text-xs"
                  />
                  <label className="cursor-pointer py-2 px-3 rounded bg-bordeaux-900/80 hover:bg-bordeaux-800 border border-gold-500/40 text-gold-300 text-xs font-sans font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors shadow">
                    <Upload className="w-3.5 h-3.5 text-gold-400" />
                    {uploadingPhoto ? 'Subiendo...' : 'Subir Foto (PC)'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </label>
                </div>
                {form.avatarUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-lg bg-dark-950 border border-gold-500/20">
                    <img
                      src={resolveMediaUrl(form.avatarUrl)}
                      alt="Vista previa"
                      className="w-12 h-16 object-cover rounded border border-gold-500/40"
                    />
                    <div className="text-[11px] text-gray-400">
                      <p className="text-gold-300 font-semibold">Vista previa de la foto</p>
                      <p className="truncate max-w-[280px] text-gray-500">{form.avatarUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Desde cuándo sirve a la Princesa</label>
                  <input
                    type="text"
                    value={form.servedSince}
                    onChange={e => setForm({ ...form, servedSince: e.target.value })}
                    placeholder="Ej: Sirviendo desde Noviembre 2024"
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Orden de Visualización</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={e => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Cita / Sentencia personal de devoción (Opcional)</label>
                <textarea
                  rows="2"
                  value={form.quote}
                  onChange={e => setForm({ ...form, quote: e.target.value })}
                  placeholder="«Pertenecerle por completo es la mayor libertad que he conocido.»"
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hallOfFameActiveCheck"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="rounded border-gray-700 text-gold-500 focus:ring-0"
                />
                <label htmlFor="hallOfFameActiveCheck" className="text-gray-300 text-xs cursor-pointer">
                  Ficha visible públicamente en el Muro de la Fama
                </label>
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
                  className="py-2 px-5 rounded bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold uppercase text-xs"
                >
                  {saving ? 'Guardando...' : 'Guardar Ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
