import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit, Trash2, Eye, EyeOff, RefreshCw, X } from 'lucide-react';
import { API_BASE } from '../config';

export function ShippingMethodsAdmin({ token }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: 6, estimatedTime: '24-48h', active: true, order: 0 });

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/store/admin/shipping-methods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMethods(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '', price: 6, estimatedTime: '24-48h', active: true, order: methods.length + 1 });
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({
      name: m.name || '',
      description: m.description || '',
      price: m.price ?? 0,
      estimatedTime: m.estimatedTime || '',
      active: m.active !== false,
      order: m.order || 0
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId
        ? `${API_BASE}/api/store/admin/shipping-methods/${editingId}`
        : `${API_BASE}/api/store/admin/shipping-methods`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Error guardando método de envío');
      setShowModal(false);
      fetchMethods();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (m) => {
    await fetch(`${API_BASE}/api/store/admin/shipping-methods/${m.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !m.active })
    });
    fetchMethods();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este método de envío?')) return;
    await fetch(`${API_BASE}/api/store/admin/shipping-methods/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchMethods();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/80 p-5 rounded-xl border border-gold-500/30">
        <div>
          <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-gold-400" />
            Métodos de Envío (Productos Físicos)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Configura las tarifas de envío disponibles para productos físicos y actívalas o desactívalas según disponibilidad.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={openCreate} className="py-2 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-sans font-bold text-xs uppercase flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Nuevo Método
          </button>
          <button onClick={fetchMethods} className="p-2 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 hover:text-white">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-xs font-mono text-gold-400">Cargando métodos de envío...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map(m => (
            <div key={m.id} className={`glass-panel p-5 rounded-xl border flex flex-col justify-between space-y-4 ${m.active ? 'border-gray-800' : 'border-red-900/40 opacity-60'}`}>
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-white text-base">{m.name}</h4>
                  <span className="font-mono font-bold text-gold-400 text-base">
                    {m.price > 0 ? `${Number(m.price).toFixed(2)}€` : 'Gratis'}
                  </span>
                </div>
                {m.estimatedTime && <p className="text-[11px] font-mono text-gray-400 mt-1">Plazo: {m.estimatedTime}</p>}
                {m.description && <p className="text-xs text-gray-300 mt-2">{m.description}</p>}
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                <button onClick={() => handleToggle(m)} className="text-xs font-mono text-gray-400 hover:text-gold-300 flex items-center gap-1">
                  {m.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {m.active ? 'Desactivar' : 'Activar'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(m)} className="p-1.5 rounded bg-dark-900 border border-gray-700 text-gray-300 hover:text-gold-300"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded bg-dark-900 border border-gray-700 text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-modal rounded-2xl p-6 max-w-md w-full border border-gold-500/40 text-gray-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h4 className="font-brand font-bold text-base text-gold-300">{editingId ? 'Editar Método de Envío' : 'Nuevo Método de Envío'}</h4>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-gray-300 mb-1">Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Precio (€)</label>
                  <input type="number" step="0.5" min="0" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Plazo estimado</label>
                  <input type="text" value={form.estimatedTime} onChange={e => setForm({ ...form, estimatedTime: e.target.value })} placeholder="24-48h" className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Descripción</label>
                <textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                <span>Disponible actualmente</span>
              </label>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="py-2 px-3 rounded bg-dark-900 border border-gray-700 text-gray-400">Cancelar</button>
                <button type="submit" disabled={saving} className="py-2 px-4 rounded bg-gold-500 text-dark-950 font-bold uppercase">{saving ? '...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
