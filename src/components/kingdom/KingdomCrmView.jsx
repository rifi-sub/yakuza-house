import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, RefreshCw, User, Snowflake, Award, Briefcase, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { API_BASE } from '../../config';
import { MemberCrmModal } from './MemberCrmModal';
import { KingdomMassAssignModal } from './KingdomMassAssignModal';

export function KingdomCrmView({ token }) {
  const [members, setMembers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('');

  // Modals
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showMassAssign, setShowMassAssign] = useState(false);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);

  // New member form
  const [newMemberForm, setNewMemberForm] = useState({
    memberNumber: '',
    alias: '',
    internalName: '',
    groupId: '',
    status: 'ACTIVE',
    internalNotes: ''
  });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedGroup) params.append('groupId', selectedGroup);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedSkillCategory) params.append('skillCategory', selectedSkillCategory);

      const res = await fetch(`${API_BASE}/api/kingdom/admin/members?${params.toString()}`, {
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

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/groups`);
      const data = await res.json();
      if (Array.isArray(data)) setAllGroups(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [selectedGroup, selectedStatus, selectedSkillCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newMemberForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear miembro');
      setShowNewMemberModal(false);
      setNewMemberForm({ memberNumber: '', alias: '', internalName: '', groupId: '', status: 'ACTIVE', internalNotes: '' });
      fetchMembers();
      setSelectedMemberId(data.id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/80 p-5 rounded-xl border border-gold-500/30">
        <div>
          <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
            👑 CRM del Reino: Miembros & Identidades
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Gestión integral de expedientes, habilidades laborales, suscripciones, requisitos y progresión de devotos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowMassAssign(true)}
            className="py-2 px-3.5 rounded-lg bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase flex items-center gap-1.5 shadow-md"
          >
            <Award className="w-3.5 h-3.5" />
            Asignación Masiva
          </button>
          <button
            onClick={() => setShowNewMemberModal(true)}
            className="py-2 px-3.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-sans font-bold text-xs uppercase flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Devoto
          </button>
          <button
            onClick={fetchMembers}
            className="p-2 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 hover:text-white"
            title="Refrescar lista"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por Alias, Nombre, Número (#017) o Email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-dark-950 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-4 rounded-lg bg-gold-500/20 border border-gold-500/40 text-gold-300 hover:bg-gold-500/30 text-xs font-mono font-bold"
          >
            Buscar
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Grupo */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Sociedad / Grupo</label>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="w-full bg-dark-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="">Todas las Sociedades</option>
              {allGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.badge})</option>
              ))}
            </select>
          </div>

          {/* Estado de Cuenta */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Estado de Cuenta</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-dark-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="">Todos los Estados</option>
              <option value="ACTIVE">Activos</option>
              <option value="PENDING_RENEWAL">Pendiente de Renovación</option>
              <option value="FROZEN">Congelados</option>
              <option value="SUSPENDED">Suspendidos</option>
              <option value="INACTIVE">Inactivos</option>
              <option value="ARCHIVED">Archivados</option>
            </select>
          </div>

          {/* Habilidades Laborales */}
          <div>
            <label className="block text-[11px] font-mono text-gold-400 mb-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Filtro por Habilidad Laboral
            </label>
            <select
              value={selectedSkillCategory}
              onChange={e => setSelectedSkillCategory(e.target.value)}
              className="w-full bg-dark-950 border border-gold-500/40 rounded-lg px-2.5 py-1.5 text-xs text-gold-300 font-semibold"
            >
              <option value="">Cualquier Capacidad</option>
              <option value="VIDEO_EDITING">🎬 Edición de Vídeo (Premiere, CapCut...)</option>
              <option value="PROGRAMMING">💻 Programación / Soporte Web</option>
              <option value="DESIGN">🎨 Diseño Gráfico / Ilustración</option>
              <option value="PHOTOGRAPHY">📷 Fotografía & Retoque</option>
              <option value="MARKETING">📈 Marketing & Difusión</option>
              <option value="SOCIAL_MEDIA">📱 Gestión de Redes Sociales</option>
              <option value="LANGUAGES">🌐 Idiomas (Inglés, etc.)</option>
              <option value="COPYWRITING">✍️ Redacción & Textos</option>
              <option value="OTHER">⚡ Otras Habilidades</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid / Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gold-400 font-mono text-xs">
            Cargando miembros del Reino...
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-xl border border-gray-800 text-gray-500 font-mono text-xs">
            No se encontraron miembros con los filtros seleccionados.
          </div>
        ) : (
          members.map(m => {
            const activeSub = m.subscriptions?.[0];
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMemberId(m.id)}
                className="glass-panel p-4 rounded-xl border border-gray-800 hover:border-gold-500/40 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-bordeaux-700 to-gold-500 p-0.5 flex-shrink-0">
                    <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center font-brand font-black text-xs text-gold-300">
                      {m.memberNumber}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-brand font-bold text-white text-base group-hover:text-gold-300 transition-colors">
                        {m.alias}
                      </h4>
                      {m.internalName && (
                        <span className="text-xs font-serif italic text-gold-300/80">
                          ({m.internalName})
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        m.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                        m.status === 'FROZEN' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400 font-mono">
                      <span className="text-gold-400 font-semibold">{m.group?.name || 'Sin Grupo'}</span>
                      {m.position && <span>· {m.position.name}</span>}
                      {activeSub && (
                        <span className="text-[10px] bg-dark-950 px-1.5 py-0.5 rounded border border-gray-800 text-gray-300">
                          Suscripción: {activeSub.status} ({activeSub.activationMethod})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Habilidades y Progreso */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {(m.skills || []).slice(0, 3).map(sk => (
                      <span key={sk.id} className="text-[10px] font-mono bg-gold-500/10 text-gold-300 border border-gold-500/30 px-2 py-0.5 rounded">
                        {sk.skillName}
                      </span>
                    ))}
                    {(m.skills || []).length > 3 && (
                      <span className="text-[10px] font-mono text-gray-500">
                        +{m.skills.length - 3} más
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-24 text-right flex-shrink-0">
                    <span className="text-[10px] font-mono text-gold-400 font-bold block mb-0.5">
                      {m.overallProgress}% Progreso
                    </span>
                    <div className="w-full bg-dark-900 rounded-full h-1.5 overflow-hidden border border-gray-800">
                      <div className="bg-gradient-to-r from-bordeaux-500 to-gold-400 h-full rounded-full" style={{ width: `${Math.min(100, m.overallProgress)}%` }} />
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gold-400 transition-colors flex-shrink-0" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Ficha CRM Individual */}
      {selectedMemberId && (
        <MemberCrmModal
          memberId={selectedMemberId}
          token={token}
          allGroups={allGroups}
          onClose={() => setSelectedMemberId(null)}
          onRefreshList={fetchMembers}
        />
      )}

      {/* Modal Asignación Masiva */}
      {showMassAssign && (
        <KingdomMassAssignModal
          token={token}
          members={members}
          allGroups={allGroups}
          onClose={() => setShowMassAssign(false)}
          onSuccess={() => {
            setShowMassAssign(false);
            fetchMembers();
          }}
        />
      )}

      {/* Modal Nuevo Miembro */}
      {showNewMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-modal rounded-2xl p-6 max-w-md w-full border border-gold-500/40 text-gray-100 space-y-4">
            <h3 className="font-brand font-bold text-lg text-gold-300">
              Alta Manual de Devoto en el Reino
            </h3>
            <form onSubmit={handleCreateMember} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Número de Reino (Opcional, autogenerado)</label>
                <input
                  type="text"
                  placeholder="Ej: #018 (dejar vacío para auto)"
                  value={newMemberForm.memberNumber}
                  onChange={e => setNewMemberForm({ ...newMemberForm, memberNumber: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Alias del Devoto *</label>
                <input
                  type="text"
                  placeholder="Ej: Devoto_Sergio"
                  value={newMemberForm.alias}
                  onChange={e => setNewMemberForm({ ...newMemberForm, alias: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Nombre Ceremonial (Princesa)</label>
                <input
                  type="text"
                  placeholder="Ej: Siervo fiel"
                  value={newMemberForm.internalName}
                  onChange={e => setNewMemberForm({ ...newMemberForm, internalName: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Grupo Inicial</label>
                <select
                  value={newMemberForm.groupId}
                  onChange={e => setNewMemberForm({ ...newMemberForm, groupId: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                >
                  <option value="">-- Sin Grupo --</option>
                  {allGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.badge})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewMemberModal(false)}
                  className="py-2 px-3 rounded bg-dark-900 border border-gray-700 text-xs text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase"
                >
                  Crear Miembro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
