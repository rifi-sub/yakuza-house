import React, { useState, useEffect } from 'react';
import { X, User, Crown, Shield, Clock, CheckCircle, AlertTriangle, Snowflake, Sparkles, BookOpen, Lock, Plus, Trash2, Calendar, Award, Briefcase, FileText } from 'lucide-react';
import { API_BASE } from '../../config';

export function MemberCrmModal({ memberId, token, onClose, onRefreshList, allGroups = [] }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // summary, hierarchy, subscription, requirements, skills, activities, private, history, notes

  // Form states
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicForm, setBasicForm] = useState({ alias: '', internalName: '', memberNumber: '', status: '', overallProgress: 0, internalNotes: '' });

  // Grant Subscription Form state
  const [showGrantSub, setShowGrantSub] = useState(false);
  const [grantSubForm, setGrantSubForm] = useState({
    durationDays: 30,
    amount: 50,
    currency: 'EUR',
    activationMethod: 'CONTRIBUTION_EQUIVALENCE',
    grantReason: 'Aportación de regalo valorada en 50€ equivalente al mes actual',
    internalNotes: ''
  });

  // Add Skill Form state
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({
    skillCategory: 'VIDEO_EDITING',
    skillName: '',
    level: 'INTERMEDIATE',
    notes: ''
  });

  // Add Note Form state
  const [newNoteInput, setNewNoteInput] = useState('');

  // Assign Activity state
  const [showAssignActivity, setShowAssignActivity] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: '',
    type: 'TASK',
    customInstructions: '',
    dueDays: 3,
    pointsAwarded: 15
  });

  const fetchMemberDetail = async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMember(data);
        setBasicForm({
          alias: data.alias || '',
          internalName: data.internalName || '',
          memberNumber: data.memberNumber || '',
          status: data.status || 'ACTIVE',
          overallProgress: data.overallProgress || 0,
          internalNotes: data.internalNotes || '',
          groupId: data.groupId || '',
          positionId: data.positionId || ''
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberDetail();
  }, [memberId]);

  const handleUpdateBasic = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(basicForm)
      });
      if (!res.ok) throw new Error('Error al actualizar datos');
      setEditingBasic(false);
      fetchMemberDetail();
      onRefreshList();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleFreeze = async () => {
    const isFrozen = member?.status === 'FROZEN';
    const action = isFrozen ? 'unfreeze' : 'freeze';
    const confirmMsg = isFrozen
      ? '¿Reactivar este perfil del Reino a estado Activo?'
      : '¿Congelar este perfil? Conservará su historial y expediente, pero se pausarán sus privilegios y accesos activos.';
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: isFrozen ? 'Reactivado por administración' : 'Congelación administrativa' })
      });
      if (!res.ok) throw new Error('Error cambiando estado');
      fetchMemberDetail();
      onRefreshList();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGrantSubscription = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/subscriptions/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...grantSubForm,
          groupId: basicForm.groupId || member?.groupId
        })
      });
      if (!res.ok) throw new Error('Error al conceder acceso');
      setShowGrantSub(false);
      fetchMemberDetail();
      onRefreshList();
      alert('¡Acceso concedido y registrado en el historial!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(skillForm)
      });
      if (!res.ok) throw new Error('Error al añadir habilidad');
      setShowAddSkill(false);
      setSkillForm({ skillCategory: 'VIDEO_EDITING', skillName: '', level: 'INTERMEDIATE', notes: '' });
      fetchMemberDetail();
      onRefreshList();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!confirm('¿Eliminar esta habilidad laboral?')) return;
    try {
      await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/skills/${skillId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMemberDetail();
      onRefreshList();
    } catch (err) {
      alert('Error al eliminar habilidad');
    }
  };

  const handleWaiveRequirement = async (definitionId, status = 'WAIVED') => {
    const reason = prompt(`Motivo de validación (${status}):`, 'Validado manualmente por Administración');
    if (!reason) return;

    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/requirements/waive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ definitionId, status, evidenceNotes: reason })
      });
      if (!res.ok) throw new Error('Error al validar requisito');
      fetchMemberDetail();
      onRefreshList();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignActivity = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          memberIds: [memberId],
          title: assignForm.title,
          type: assignForm.type,
          customInstructions: assignForm.customInstructions,
          dueDays: assignForm.dueDays,
          pointsAwarded: assignForm.pointsAwarded
        })
      });
      if (!res.ok) throw new Error('Error al asignar actividad');
      setShowAssignActivity(false);
      setAssignForm({ title: '', type: 'TASK', customInstructions: '', dueDays: 3, pointsAwarded: 15 });
      fetchMemberDetail();
      onRefreshList();
      alert('Actividad asignada y registrada con éxito');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteAssignment = async (assignmentId) => {
    if (!confirm('¿Marcar esta actividad como COMPLETADA? Se otorgarán puntos de progreso al devoto.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'COMPLETED_ON_TIME',
          adminFeedback: 'Completado satisfactoriamente'
        })
      });
      if (!res.ok) throw new Error('Error al completar');
      fetchMemberDetail();
      onRefreshList();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ note: newNoteInput })
      });
      if (!res.ok) throw new Error('Error al guardar nota');
      setNewNoteInput('');
      fetchMemberDetail();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!memberId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-modal rounded-2xl w-full max-w-5xl text-gray-100 my-6 max-h-[92vh] flex flex-col border border-gold-500/40 shadow-2xl">
        
        {/* Modal Top Header */}
        <div className="flex justify-between items-center p-5 border-b border-gold-500/20 bg-dark-950/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-bordeaux-700 to-gold-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center text-gold-400 font-brand font-black text-base">
                {member?.memberNumber || '#---'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-brand font-bold text-xl text-white">
                  {member?.alias || 'Cargando...'}
                </h3>
                {member?.internalName && (
                  <span className="text-xs font-serif italic text-gold-300">
                    ({member.internalName})
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  member?.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  member?.status === 'FROZEN' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  member?.status === 'SUSPENDED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {member?.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {member?.group?.name || 'Sin Grupo'} {member?.position ? `· ${member.position.name}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFreeze}
              className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
                member?.status === 'FROZEN'
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/50'
                  : 'bg-blue-950/40 text-blue-300 border-blue-500/40 hover:bg-blue-900/60'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              {member?.status === 'FROZEN' ? 'Reactivar' : 'Congelar'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Tabs Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-gray-800 bg-dark-900/60 overflow-x-auto text-xs font-mono py-2">
          {[
            { id: 'summary', label: '1. Resumen' },
            { id: 'hierarchy', label: '2. Jerarquía & Rango' },
            { id: 'subscription', label: '3. Suscripción / Acceso' },
            { id: 'requirements', label: '4. Requisitos' },
            { id: 'skills', label: '5. Habilidades Laborales' },
            { id: 'activities', label: '6. Actividades' },
            { id: 'private', label: '7. Perfil Privado' },
            { id: 'history', label: '8. Historial' },
            { id: 'notes', label: '9. Notas' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-1.5 px-3 rounded-md transition-all whitespace-nowrap font-medium ${
                activeTab === t.id
                  ? 'bg-gold-500 text-dark-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-gold-400 font-mono text-xs">
              Cargando expediente del miembro...
            </div>
          ) : (
            <>
              {/* TAB 1: RESUMEN */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-dark-950 border border-gray-800">
                      <span className="text-[11px] font-mono text-gray-400 block mb-1">Identidad Interna</span>
                      <p className="font-brand text-lg text-gold-300 font-bold">{member.memberNumber}</p>
                      <p className="text-xs text-gray-300 mt-1">{member.alias} {member.internalName ? `(${member.internalName})` : ''}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-dark-950 border border-gray-800">
                      <span className="text-[11px] font-mono text-gray-400 block mb-1">Grupo & Posición Actual</span>
                      <p className="font-brand text-base text-white font-bold">{member.group?.name || 'Ninguno'}</p>
                      <p className="text-xs text-crimson-400 mt-1">{member.position?.name || 'Sin rango asignado'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-dark-950 border border-gray-800">
                      <span className="text-[11px] font-mono text-gray-400 block mb-1">Progreso & Méritos</span>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-gold-400 font-bold">{member.overallProgress}%</span>
                        <span className="text-gray-400">{member.experiencePoints} pts</span>
                      </div>
                      <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-gray-800">
                        <div className="bg-gradient-to-r from-bordeaux-500 to-gold-400 h-full rounded-full" style={{ width: `${Math.min(100, member.overallProgress)}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Formulario de Edición de Datos Básicos */}
                  <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                      <h4 className="font-sans font-bold text-sm text-gold-400 uppercase tracking-widest">
                        Datos de la Cuenta & Identidad
                      </h4>
                      <button
                        onClick={() => setEditingBasic(!editingBasic)}
                        className="text-xs font-mono text-gold-300 hover:underline"
                      >
                        {editingBasic ? 'Cancelar' : 'Editar Datos'}
                      </button>
                    </div>

                    {editingBasic ? (
                      <form onSubmit={handleUpdateBasic} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">Número de Reino</label>
                            <input
                              type="text"
                              value={basicForm.memberNumber}
                              onChange={e => setBasicForm({ ...basicForm, memberNumber: e.target.value })}
                              className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">Alias del Miembro</label>
                            <input
                              type="text"
                              value={basicForm.alias}
                              onChange={e => setBasicForm({ ...basicForm, alias: e.target.value })}
                              className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">Nombre Ceremonial (Princesa)</label>
                            <input
                              type="text"
                              value={basicForm.internalName}
                              onChange={e => setBasicForm({ ...basicForm, internalName: e.target.value })}
                              className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gold-300"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">Estado de Cuenta</label>
                            <select
                              value={basicForm.status}
                              onChange={e => setBasicForm({ ...basicForm, status: e.target.value })}
                              className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                            >
                              <option value="ACTIVE">ACTIVO (Mantiene accesos)</option>
                              <option value="PENDING_RENEWAL">PENDIENTE_RENOVACION (Acceso por vencer)</option>
                              <option value="FROZEN">CONGELADO (Pausa temporal de privilegios)</option>
                              <option value="SUSPENDED">SUSPENDIDO (Restricción por sanción)</option>
                              <option value="INACTIVE">INACTIVO (Sin actividad prolongada)</option>
                              <option value="ARCHIVED">ARCHIVADO (Expediente conservado)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">Progreso General (0 a 100%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={basicForm.overallProgress}
                              onChange={e => setBasicForm({ ...basicForm, overallProgress: e.target.value })}
                              className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-gray-400 mb-1">Notas Rápidas de Administración</label>
                          <textarea
                            rows="2"
                            value={basicForm.internalNotes}
                            onChange={e => setBasicForm({ ...basicForm, internalNotes: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingBasic(false)}
                            className="py-1.5 px-3 rounded bg-dark-900 border border-gray-700 text-xs text-gray-400"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="py-1.5 px-4 rounded bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs"
                          >
                            Guardar Cambios
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <p><span className="text-gray-400 font-mono">Fecha de Ingreso:</span> {new Date(member.joinedAt).toLocaleString()}</p>
                        <p><span className="text-gray-400 font-mono">Notas Internas:</span> {member.internalNotes || 'Sin notas registradas'}</p>
                        {member.user && (
                          <p><span className="text-gray-400 font-mono">Cuenta de Acceso:</span> {member.user.email} (ID #{member.user.id})</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: JERARQUÍA & POSICIÓN */}
              {activeTab === 'hierarchy' && (
                <div className="space-y-6">
                  <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
                    <h4 className="font-sans font-bold text-sm text-gold-400 uppercase tracking-widest">
                      Asignación de Grupo y Posición
                    </h4>
                    <p className="text-xs text-gray-400">
                      Asigna a qué sociedad pertenece el devoto dentro del Reino y cuál es su rango actual o su objetivo de ascenso.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">Grupo / Sociedad</label>
                        <select
                          value={basicForm.groupId || ''}
                          onChange={e => setBasicForm({ ...basicForm, groupId: e.target.value })}
                          className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                        >
                          <option value="">-- Sin Grupo Asignado --</option>
                          {allGroups.map(g => (
                            <option key={g.id} value={g.id}>{g.name} ({g.badge})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-gray-300 mb-1">Posición / Rango</label>
                        <select
                          value={basicForm.positionId || ''}
                          onChange={e => setBasicForm({ ...basicForm, positionId: e.target.value })}
                          className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                        >
                          <option value="">-- Sin Rango Específico --</option>
                          {allGroups.find(g => g.id === basicForm.groupId)?.positions?.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.badge})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        onClick={handleUpdateBasic}
                        className="py-2 px-4 rounded bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase font-sans"
                      >
                        Actualizar Posición Jerárquica
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SUSCRIPCIÓN & CONCESIONES MANUALES (EQUIVALENCIAS) */}
              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-sans font-bold text-sm text-gold-400 uppercase tracking-widest">
                        Suscripciones & Accesos Vigentes
                      </h4>
                      <p className="text-xs text-gray-400">
                        El acceso de un devoto puede activarse mediante pago automático, pago manual o convalidación de aportación/regalo.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowGrantSub(true)}
                      className="py-2 px-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-sans font-bold text-xs uppercase flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Conceder Acceso / Equivalencia
                    </button>
                  </div>

                  {showGrantSub && (
                    <form onSubmit={handleGrantSubscription} className="glass-panel p-5 rounded-xl border border-gold-500/40 space-y-4 bg-dark-950/80">
                      <h5 className="font-sans font-bold text-xs text-gold-300 uppercase">
                        Concesión Manual de Acceso (Equivalencia de Suscripción)
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Días de Acceso</label>
                          <input
                            type="number"
                            min="1"
                            value={grantSubForm.durationDays}
                            onChange={e => setGrantSubForm({ ...grantSubForm, durationDays: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Importe Equivalente (€)</label>
                          <input
                            type="number"
                            value={grantSubForm.amount}
                            onChange={e => setGrantSubForm({ ...grantSubForm, amount: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Método de Activación</label>
                          <select
                            value={grantSubForm.activationMethod}
                            onChange={e => setGrantSubForm({ ...grantSubForm, activationMethod: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="CONTRIBUTION_EQUIVALENCE">Equivalencia por Aportación / Regalo</option>
                            <option value="MANUAL_PAYMENT">Pago Manual (Bizum / Transferencia)</option>
                            <option value="INVITATION">Invitación Especial</option>
                            <option value="PROMOTION">Promoción / Ascenso</option>
                            <option value="TRIAL">Periodo de Prueba</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1">Motivo de Concesión (Visible en Historial)</label>
                        <input
                          type="text"
                          value={grantSubForm.grantReason}
                          onChange={e => setGrantSubForm({ ...grantSubForm, grantReason: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowGrantSub(false)}
                          className="py-1 px-3 rounded bg-dark-900 border border-gray-700 text-xs text-gray-400"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="py-1 px-4 rounded bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs font-sans uppercase"
                        >
                          Confirmar y Activar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {(member.subscriptions || []).length === 0 ? (
                      <p className="text-xs text-gray-500 font-mono py-4 text-center">No hay registros de suscripción o acceso manual.</p>
                    ) : (
                      member.subscriptions.map(s => (
                        <div key={s.id} className="p-4 rounded-xl bg-dark-950 border border-gray-800 flex justify-between items-center text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white uppercase">{s.activationMethod}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                                {s.status}
                              </span>
                              {s.amount > 0 && <span className="text-gold-400 font-mono font-bold">({s.amount}€)</span>}
                            </div>
                            <p className="text-gray-300 mt-1">{s.grantReason}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                              Desde {new Date(s.startDate).toLocaleDateString()} hasta {s.endDate ? new Date(s.endDate).toLocaleDateString() : 'Indefinido'} · Resp: {s.adminResponsible}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: REQUISITOS */}
              {activeTab === 'requirements' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                    <div>
                      <h4 className="font-sans font-bold text-sm text-gold-400 uppercase tracking-widest">
                        Requisitos del Reino para el Miembro
                      </h4>
                      <p className="text-xs text-gray-400">
                        Visualiza los requisitos de entrada y permanencia. Administración puede convalidar o dispensar cualquiera manualmente.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {(member.requirements || []).length === 0 ? (
                      <p className="text-xs text-gray-500 font-mono py-4 text-center">No hay requisitos vinculados aún a este perfil.</p>
                    ) : (
                      member.requirements.map(r => (
                        <div key={r.id} className="p-3.5 rounded-xl bg-dark-950 border border-gray-800 flex justify-between items-center text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{r.definition?.title}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                r.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                r.status === 'WAIVED' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {r.status === 'COMPLETED' ? '✓ CUMPLIDO' : r.status === 'WAIVED' ? '✦ DISPENSADO' : '⏳ PENDIENTE'}
                              </span>
                            </div>
                            <p className="text-gray-400 text-[11px] mt-0.5">{r.definition?.description}</p>
                            {r.evidenceNotes && (
                              <p className="text-[10px] text-gold-300/80 italic mt-1 font-mono">Nota: {r.evidenceNotes} (por {r.validatedBy})</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {r.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleWaiveRequirement(r.definitionId, 'COMPLETED')}
                                  className="py-1 px-2.5 rounded bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono"
                                >
                                  Validar
                                </button>
                                <button
                                  onClick={() => handleWaiveRequirement(r.definitionId, 'WAIVED')}
                                  className="py-1 px-2.5 rounded bg-blue-950/40 border border-blue-500/50 text-blue-300 text-xs font-mono"
                                >
                                  Dispensar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: HABILIDADES LABORALES */}
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                    <div>
                      <h4 className="font-sans font-bold text-sm text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-gold-400" />
                        Habilidades y Talentos del Miembro
                      </h4>
                      <p className="text-xs text-gray-400">
                        Capacidades que este devoto puede aportar al Reino (edición de vídeo, programación, marketing, etc.).
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddSkill(true)}
                      className="py-1.5 px-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Añadir Habilidad
                    </button>
                  </div>

                  {showAddSkill && (
                    <form onSubmit={handleAddSkill} className="p-4 rounded-xl bg-dark-950 border border-gold-500/40 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Categoría</label>
                          <select
                            value={skillForm.skillCategory}
                            onChange={e => setSkillForm({ ...skillForm, skillCategory: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="VIDEO_EDITING">Edición de Vídeo</option>
                            <option value="PROGRAMMING">Programación / Código</option>
                            <option value="DESIGN">Diseño Gráfico / Ilustración</option>
                            <option value="PHOTOGRAPHY">Fotografía</option>
                            <option value="MARKETING">Marketing / Ventas</option>
                            <option value="SOCIAL_MEDIA">Gestión de Redes</option>
                            <option value="LANGUAGES">Idiomas</option>
                            <option value="COPYWRITING">Redacción / Copy</option>
                            <option value="OTHER">Otros Talentos</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Nombre / Herramienta</label>
                          <input
                            type="text"
                            placeholder="Ej: Premiere, Python, Inglés C1"
                            value={skillForm.skillName}
                            onChange={e => setSkillForm({ ...skillForm, skillName: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Nivel</label>
                          <select
                            value={skillForm.level}
                            onChange={e => setSkillForm({ ...skillForm, level: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="BASIC">Básico</option>
                            <option value="INTERMEDIATE">Intermedio</option>
                            <option value="ADVANCED">Avanzado</option>
                            <option value="EXPERT">Experto / Profesional</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddSkill(false)}
                          className="py-1 px-3 rounded bg-dark-900 border border-gray-700 text-xs text-gray-400"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="py-1 px-4 rounded bg-gold-500 text-dark-950 font-bold text-xs"
                        >
                          Guardar Habilidad
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(member.skills || []).map(sk => (
                      <div key={sk.id} className="p-3 rounded-xl bg-dark-950 border border-gray-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white block">{sk.skillName}</span>
                          <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider">{sk.skillCategory} · Nivel: {sk.level}</span>
                          {sk.notes && <p className="text-[11px] text-gray-400 mt-1">{sk.notes}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteSkill(sk.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: ACTIVIDADES & ASIGNACIONES */}
              {activeTab === 'activities' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                    <div>
                      <h4 className="font-sans font-bold text-sm text-gold-400 uppercase tracking-widest">
                        Actividades, Rituales & Tareas Asignadas
                      </h4>
                      <p className="text-xs text-gray-400">
                        Monitorea el cumplimiento individual de tareas, entrenamientos o privilegios otorgados.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAssignActivity(true)}
                      className="py-1.5 px-3 rounded-lg bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs uppercase flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Asignar Actividad
                    </button>
                  </div>

                  {showAssignActivity && (
                    <form onSubmit={handleAssignActivity} className="p-4 rounded-xl bg-dark-950 border border-crimson-500/40 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Título de la Actividad</label>
                          <input
                            type="text"
                            placeholder="Ej: Reporte de devoción semanal"
                            value={assignForm.title}
                            onChange={e => setAssignForm({ ...assignForm, title: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Tipo</label>
                          <select
                            value={assignForm.type}
                            onChange={e => setAssignForm({ ...assignForm, type: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="TASK">Tarea</option>
                            <option value="TRAINING">Entrenamiento</option>
                            <option value="RITUAL">Ritual</option>
                            <option value="PRIVILEGE">Privilegio</option>
                            <option value="PUNISHMENT">Castigo / Penitencia</option>
                            <option value="GOAL">Objetivo</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Plazo Límite (Días)</label>
                          <input
                            type="number"
                            min="1"
                            value={assignForm.dueDays}
                            onChange={e => setAssignForm({ ...assignForm, dueDays: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Puntos de Mérito</label>
                          <input
                            type="number"
                            value={assignForm.pointsAwarded}
                            onChange={e => setAssignForm({ ...assignForm, pointsAwarded: e.target.value })}
                            className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1">Instrucciones Particulares para este Devoto</label>
                        <textarea
                          rows="2"
                          value={assignForm.customInstructions}
                          onChange={e => setAssignForm({ ...assignForm, customInstructions: e.target.value })}
                          className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAssignActivity(false)}
                          className="py-1 px-3 rounded bg-dark-900 border border-gray-700 text-xs text-gray-400"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="py-1 px-4 rounded bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs"
                        >
                          Asignar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2.5">
                    {(member.assignments || []).map(act => (
                      <div key={act.id} className="p-3.5 rounded-xl bg-dark-950 border border-gray-800 flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{act.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-gray-800 text-gold-300">
                              {act.type}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              act.status.startsWith('COMPLETED') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {act.status}
                            </span>
                          </div>
                          {act.customInstructions && <p className="text-gray-300 text-[11px] mt-1">{act.customInstructions}</p>}
                          <p className="text-[10px] text-gray-500 font-mono mt-1">
                            Límite: {act.dueDate ? new Date(act.dueDate).toLocaleDateString() : 'Sin plazo'} · Puntos: +{act.pointsAwarded}
                          </p>
                        </div>

                        {!act.status.startsWith('COMPLETED') && (
                          <button
                            onClick={() => handleCompleteAssignment(act.id)}
                            className="py-1 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold"
                          >
                            ✓ Completar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: PERFIL PRIVADO & SENSIBLE */}
              {activeTab === 'private' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-bordeaux-950/40 border border-bordeaux-500/40 text-bordeaux-300 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                    <span>Esta sección contiene información sensible y fetiches del devoto. Acceso estrictamente reservado a Administración.</span>
                  </div>

                  <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-gold-400 mb-1">Preferencias, Fetiches & Triggers</label>
                      <textarea
                        rows="4"
                        value={basicForm.preferences || ''}
                        onChange={e => setBasicForm({ ...basicForm, preferences: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200"
                        placeholder="Ej: Gustos específicos, límites duros, dinámicas permitidas..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gold-400 mb-1">Objetivos Personales de Sumisión</label>
                      <textarea
                        rows="3"
                        value={basicForm.personalGoals || ''}
                        onChange={e => setBasicForm({ ...basicForm, personalGoals: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-xs text-gray-200"
                        placeholder="Ej: Aspiraciones dentro del Reino, metas de entrega..."
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleUpdateBasic}
                        className="py-2 px-4 rounded bg-gold-500 text-dark-950 font-bold text-xs uppercase"
                      >
                        Guardar Perfil Privado
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: HISTORIAL & TRAZABILIDAD (EVENT LOG) */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-sm text-gold-400 uppercase tracking-widest">
                    Línea de Tiempo & Auditoría Inmutable
                  </h4>
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-gray-800">
                    {(member.eventLogs || []).map(ev => (
                      <div key={ev.id} className="relative pl-8 text-xs">
                        <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-gold-500 ring-4 ring-dark-950" />
                        <div className="p-3 rounded-xl bg-dark-950 border border-gray-800/80 space-y-1">
                          <div className="flex justify-between text-gray-400 font-mono text-[10px]">
                            <span className="font-bold text-gold-400 uppercase">{ev.eventType}</span>
                            <span>{new Date(ev.createdAt).toLocaleString()} · {ev.adminResponsible}</span>
                          </div>
                          <p className="text-gray-200">{ev.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: NOTAS INTERNAS */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-sm text-gold-400 uppercase tracking-widest">
                    Bitácora Interna de Administración
                  </h4>

                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Añadir una nota interna sobre este devoto..."
                      value={newNoteInput}
                      onChange={e => setNewNoteInput(e.target.value)}
                      className="flex-1 bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="py-2 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase"
                    >
                      Añadir
                    </button>
                  </form>

                  <div className="space-y-2">
                    {(member.notes || []).map(n => (
                      <div key={n.id} className="p-3 rounded-xl bg-dark-950 border border-gray-800 text-xs">
                        <p className="text-gray-200">{n.note}</p>
                        <span className="text-[10px] font-mono text-gray-500 block mt-1">
                          {new Date(n.createdAt).toLocaleString()} · Por {n.author}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
