import React, { useState, useEffect } from 'react';
import { Gift, Plus, Edit, Trash2, RefreshCw, Eye, EyeOff, Upload, CheckCircle2, X, DollarSign, Clock } from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../config';

export function CrowdfundingAdmin({ token }) {
  const [subTab, setSubTab] = useState('goals'); // goals | contributions
  const [goals, setGoals] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const defaultForm = {
    title: '',
    description: '',
    imageUrl: '',
    targetAmount: 100,
    manualAdjustment: 0,
    minContribution: 5,
    suggestedAmountsText: '10, 25, 50, 100',
    featured: false,
    active: true,
    order: 0
  };
  const [form, setForm] = useState(defaultForm);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/api/store/admin/crowdfunding/goals`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/store/admin/crowdfunding/contributions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const gData = await gRes.json();
      const cData = await cRes.json();
      if (Array.isArray(gData)) setGoals(gData);
      if (Array.isArray(cData)) setContributions(cData);
    } catch (e) {
      console.error('Error cargando admin crowdfunding:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await fetch(`${API_BASE}/api/store/admin/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error subiendo imagen');
      const url = (data.urls && data.urls[0]) || data.url;
      if (url) setForm(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingImg(false);
      e.target.value = '';
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...defaultForm, order: goals.length + 1 });
    setShowModal(true);
  };

  const openEdit = (g) => {
    setEditingId(g.id);
    setForm({
      title: g.title || '',
      description: g.description || '',
      imageUrl: g.imageUrl || '',
      targetAmount: g.targetAmount || 100,
      manualAdjustment: g.manualAdjustment || 0,
      minContribution: g.minContribution || 5,
      suggestedAmountsText: Array.isArray(g.suggestedAmounts) ? g.suggestedAmounts.join(', ') : '10, 25, 50, 100',
      featured: Boolean(g.featured),
      active: g.active !== false,
      order: g.order || 0
    });
    setShowModal(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const suggestedAmounts = form.suggestedAmountsText
        .split(',')
        .map(s => parseFloat(s.trim()))
        .filter(n => Number.isFinite(n) && n > 0);

      const url = editingId
        ? `${API_BASE}/api/store/admin/crowdfunding/goals/${editingId}`
        : `${API_BASE}/api/store/admin/crowdfunding/goals`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          imageUrl: form.imageUrl,
          targetAmount: parseFloat(form.targetAmount),
          manualAdjustment: parseFloat(form.manualAdjustment) || 0,
          minContribution: parseFloat(form.minContribution) || 5,
          suggestedAmounts: suggestedAmounts.length > 0 ? suggestedAmounts : [10, 25, 50, 100],
          featured: form.featured,
          active: form.active,
          order: parseInt(form.order, 10) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error guardando objetivo');
      setShowModal(false);
      fetchAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleGoalActive = async (g) => {
    await fetch(`${API_BASE}/api/store/admin/crowdfunding/goals/${g.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !g.active })
    });
    fetchAll();
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm('¿Eliminar este objetivo de crowdfunding?')) return;
    await fetch(`${API_BASE}/api/store/admin/crowdfunding/goals/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAll();
  };

  const handleContributionStatus = async (c, paymentStatus) => {
    const res = await fetch(`${API_BASE}/api/store/admin/crowdfunding/contributions/${c.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ paymentStatus })
    });
    if (res.ok) fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/80 p-5 rounded-xl border border-gold-500/30">
        <div>
          <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-gold-400" />
            Crowdfunding de Regalos (Estilo Throne Directo)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Crea objetivos de regalo, actualiza cantidades recibidas manualmente y confirma aportaciones para sumarlas al progreso y al historial del usuario.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="py-2 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-sans font-bold text-xs uppercase flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo Objetivo
          </button>
          <button onClick={fetchAll} className="p-2 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 hover:text-white">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setSubTab('goals')}
          className={`py-2 px-4 rounded-lg text-xs font-mono font-bold ${
            subTab === 'goals' ? 'bg-gold-500 text-dark-950' : 'bg-dark-900 text-gray-400 border border-gray-800'
          }`}
        >
          Objetivos ({goals.length})
        </button>
        <button
          onClick={() => setSubTab('contributions')}
          className={`py-2 px-4 rounded-lg text-xs font-mono font-bold ${
            subTab === 'contributions' ? 'bg-gold-500 text-dark-950' : 'bg-dark-900 text-gray-400 border border-gray-800'
          }`}
        >
          Aportaciones Recibidas ({contributions.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-gold-400">Cargando crowdfunding...</div>
      ) : subTab === 'goals' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(g => (
            <div key={g.id} className={`glass-panel p-4 rounded-xl border flex flex-col justify-between space-y-4 ${g.active ? 'border-gray-800' : 'border-red-900/40 opacity-60'}`}>
              <div className="space-y-3">
                {g.imageUrl && (
                  <img src={resolveMediaUrl(g.imageUrl)} alt={g.title} className="w-full h-36 object-cover rounded-lg border border-gray-800" />
                )}
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-white text-base">{g.title}</h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${g.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                    {g.active ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
                {g.description && <p className="text-xs text-gray-400 line-clamp-2">{g.description}</p>}
                <div className="w-full h-2 rounded-full bg-dark-950 overflow-hidden border border-gray-800">
                  <div className="h-full bg-gold-500" style={{ width: `${g.progressPercent}%` }} />
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">{g.raisedAmount}€ conseguidos</span>
                  <span className="text-gold-300">Meta: {g.targetAmount}€</span>
                </div>
                {g.manualAdjustment !== 0 && (
                  <p className="text-[10px] font-mono text-amber-300">Ajuste manual incluido: {g.manualAdjustment > 0 ? `+${g.manualAdjustment}` : g.manualAdjustment}€</p>
                )}
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleGoalActive(g)}
                  className="text-xs font-mono text-gray-400 hover:text-gold-300 flex items-center gap-1"
                >
                  {g.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {g.active ? 'Desactivar' : 'Activar'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(g)} className="p-1.5 rounded bg-dark-900 border border-gray-700 text-gray-300 hover:text-gold-300">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteGoal(g.id)} className="p-1.5 rounded bg-dark-900 border border-gray-700 text-gray-300 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-dark-950/80">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-dark-900 text-gray-400 uppercase text-[10px] border-b border-gray-800">
              <tr>
                <th className="p-3">Ref / Fecha</th>
                <th className="p-3">Objetivo</th>
                <th className="p-3">Usuario</th>
                <th className="p-3">Importe / Método</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {contributions.map(c => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="p-3">
                    <span className="text-gold-300 font-bold block">{c.orderNumber}</span>
                    <span className="text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleString('es-ES')}</span>
                  </td>
                  <td className="p-3 text-white font-sans font-bold">{c.goal?.title || '—'}</td>
                  <td className="p-3">
                    <span className="text-white block">{c.alias}</span>
                    <span className="text-[10px] text-gray-400">{c.email || c.contactHandle || '—'}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-emerald-400 font-bold block">{Number(c.amount).toFixed(2)}€</span>
                    <span className="text-[10px] text-gray-400">{c.paymentMethod}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                      c.paymentStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {c.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    {c.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => handleContributionStatus(c, 'PAID')}
                        className="py-1 px-2.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500 hover:text-dark-950 font-bold text-[10px]"
                      >
                        Confirmar Pago
                      </button>
                    )}
                    {c.paymentStatus === 'PAID' && (
                      <button
                        onClick={() => handleContributionStatus(c, 'REFUNDED')}
                        className="py-1 px-2.5 rounded bg-red-500/15 border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white text-[10px]"
                      >
                        Revertir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR / EDITAR OBJETIVO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-modal rounded-2xl p-6 max-w-lg w-full border border-gold-500/40 text-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h4 className="font-brand font-bold text-base text-gold-300">
                {editingId ? 'Editar Objetivo de Crowdfunding' : 'Nuevo Objetivo de Crowdfunding'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-gray-300 mb-1">Nombre del Objetivo / Regalo *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Bolso Yves Saint Laurent / Viaje a Tokio"
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Descripción</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Imagen del Objetivo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://... o subir desde PC"
                    className="flex-1 bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <label className="cursor-pointer py-2 px-3 rounded bg-bordeaux-800 border border-gold-500/40 text-gold-300 font-bold flex items-center gap-1 whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImg ? '...' : 'Subir'}
                    <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Objetivo (€) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={form.targetAmount}
                    onChange={e => setForm({ ...form, targetAmount: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Ajuste manual (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.manualAdjustment}
                    onChange={e => setForm({ ...form, manualAdjustment: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Mín. aportación (€)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.minContribution}
                    onChange={e => setForm({ ...form, minContribution: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Cantidades sugeridas (separadas por coma)</label>
                <input
                  type="text"
                  value={form.suggestedAmountsText}
                  onChange={e => setForm({ ...form, suggestedAmountsText: e.target.value })}
                  placeholder="10, 25, 50, 100"
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                  <span>Activo y visible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  <span>Destacado</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} className="py-2 px-3 rounded bg-dark-900 border border-gray-700 text-gray-400">Cancelar</button>
                <button type="submit" disabled={saving} className="py-2 px-5 rounded bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold uppercase">
                  {saving ? 'Guardando...' : 'Guardar Objetivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
