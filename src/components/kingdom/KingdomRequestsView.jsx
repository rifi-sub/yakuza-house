import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, RefreshCw, Clock, CheckCircle, XCircle, Table, LayoutGrid, Search, Filter, ExternalLink, ArrowRight, Shield } from 'lucide-react';
import { API_BASE } from '../../config';

export function KingdomRequestsView({ token, onMemberCreated }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'cards'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id, alias) => {
    if (!confirm(`¿Aprobar la solicitud de "${alias}" y convertirlo oficialmente en miembro del Reino?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/requests/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al aprobar');
      alert(`¡Solicitud aprobada! Miembro creado: ${data.member?.memberNumber} (${data.member?.alias}).`);
      fetchRequests();
      if (onMemberCreated) onMemberCreated();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id, alias) => {
    const reason = prompt(`Motivo de rechazo para "${alias}":`, 'No cumple con el protocolo o perfil requerido');
    if (reason === null) return;

    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/requests/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decisionNotes: reason })
      });
      if (!res.ok) throw new Error('Error al rechazar');
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const SKILL_NAMES = {
    VIDEO_EDITING: 'Edición Vídeo',
    PROGRAMMING: 'Programación',
    DESIGN: 'Diseño',
    MARKETING: 'Marketing',
    LANGUAGES: 'Idiomas',
    PHOTOGRAPHY: 'Foto',
    MODERATION: 'Moderación'
  };

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (groupFilter !== 'ALL') {
      const targetName = req.targetGroup?.name || req.targetGroupId || '';
      if (!targetName.toLowerCase().includes(groupFilter.toLowerCase())) return false;
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchAlias = (req.alias || '').toLowerCase().includes(s);
      const matchEmail = (req.email || '').toLowerCase().includes(s);
      let matchForm = false;
      try {
        matchForm = typeof req.formData === 'string' && req.formData.toLowerCase().includes(s);
      } catch {}
      if (!matchAlias && !matchEmail && !matchForm) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/80 p-5 rounded-xl border border-gold-500/30">
        <div>
          <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
            📊 Comparativa de Candidatos & Solicitudes de Entrada
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Analiza y compara simultáneamente las respuestas de los aspirantes al Reino antes de aprobar o rechazar su incorporación.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Vista */}
          <div className="flex bg-dark-900 p-0.5 rounded-lg border border-gray-700">
            <button
              onClick={() => setViewMode('table')}
              className={`py-1.5 px-3 rounded text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-gold-500 text-dark-950 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabla Comparativa</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`py-1.5 px-3 rounded text-xs font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'cards' ? 'bg-gold-500 text-dark-950 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Fichas</span>
            </button>
          </div>

          <button
            onClick={fetchRequests}
            className="p-2 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 hover:text-white"
            title="Recargar solicitudes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Barra de Filtros & Búsqueda */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-dark-950 p-4 rounded-xl border border-gray-800 text-xs font-mono">
        <div>
          <label className="block text-gray-400 mb-1">Buscar por Alias o Email</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-dark-900 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Estado de Solicitud</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white"
          >
            <option value="ALL">Todos los Estados ({requests.length})</option>
            <option value="PENDING_REVIEW">⏳ Pendientes de Revisión</option>
            <option value="CONVERTED">✓ Aprobados / Miembros</option>
            <option value="REJECTED">✕ Rechazados</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-400 mb-1">Rango Solicitado</label>
          <select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white"
          >
            <option value="ALL">Todos los Rangos</option>
            <option value="plebeyo">Plebeyos (Nivel 1)</option>
            <option value="sirviente">Sirvientes (Nivel 2)</option>
            <option value="caballero">Caballeros (Nivel 3)</option>
            <option value="esclavo">Esclavos (Nivel Máximo)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gold-400 font-mono text-xs">
          Cargando datos de candidatos...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-xl border border-gray-800 text-gray-500 font-mono text-xs">
          No se encontraron solicitudes con los filtros aplicados.
        </div>
      ) : viewMode === 'table' ? (

        /* ========================================================================= */
        /* TABLA COMPARATIVA DE CANDIDATOS */
        /* ========================================================================= */
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-dark-950 shadow-2xl">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-dark-900/90 text-gold-400 border-b border-gray-800 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Candidato / Contacto</th>
                <th className="py-3 px-3">Rango Solicitado</th>
                <th className="py-3 px-3">Perfil / Edad</th>
                <th className="py-3 px-3 min-w-[200px]">Motivación / Devoción</th>
                <th className="py-3 px-3 min-w-[180px]">Preferencias / Fetiches</th>
                <th className="py-3 px-3">Habilidades</th>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {filteredRequests.map(req => {
                let formFields = {};
                try {
                  formFields = typeof req.formData === 'string' ? JSON.parse(req.formData) : (req.formData || {});
                } catch {
                  formFields = {};
                }

                const telegram = formFields.telegram?.trim();
                const ageStatus = formFields.ageStatus?.trim();
                const motivation = formFields.motivation?.trim();
                const preferences = formFields.preferences?.trim();
                const skills = Array.isArray(formFields.skills) ? formFields.skills : [];

                const isPending = req.status === 'PENDING_REVIEW' || req.status === 'SUBMITTED';

                return (
                  <tr key={req.id} className="hover:bg-dark-900/50 transition-colors">
                    {/* Candidato / Alias */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm font-sans">{req.alias}</div>
                      <div className="text-[10px] text-gray-400">{req.email}</div>
                      {telegram && (
                        <a
                          href={`https://t.me/${telegram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-white mt-1"
                        >
                          <span>✈️ {telegram.startsWith('@') ? telegram : `@${telegram}`}</span>
                        </a>
                      )}
                    </td>

                    {/* Rango solicitado */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-bordeaux-950/70 border border-gold-500/40 text-gold-300 font-sans font-bold text-[10px] uppercase">
                        {req.targetGroup?.name || 'PLEBEYOS'}
                      </span>
                    </td>

                    {/* Perfil / Edad */}
                    <td className="py-3 px-3 text-gray-300 whitespace-nowrap">
                      {ageStatus || 'No especificada'}
                    </td>

                    {/* Motivación */}
                    <td className="py-3 px-3 text-gray-200 font-sans text-xs">
                      <p className="line-clamp-3 leading-snug">
                        {motivation || 'Sin motivación registrada'}
                      </p>
                    </td>

                    {/* Preferencias / Fetiches */}
                    <td className="py-3 px-3 text-gray-300 font-sans text-xs">
                      <p className="line-clamp-3 leading-snug">
                        {preferences || 'Sin fetiches/límites detallados'}
                      </p>
                    </td>

                    {/* Habilidades */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {skills.length > 0 ? (
                          skills.map((s, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-dark-900 border border-gray-700 text-gray-300 text-[9px]">
                              {SKILL_NAMES[s] || s}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-[10px]">—</span>
                        )}
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-3 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                      {new Date(req.submittedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        req.status === 'CONVERTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        req.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {req.status === 'CONVERTED' ? '✓ Aprobado' : req.status === 'REJECTED' ? '✕ Rechazado' : '⏳ Pendiente'}
                      </span>
                    </td>

                    {/* Acciones Rápidas */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isPending ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApprove(req.id, req.alias)}
                            className="py-1 px-2.5 rounded bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/50 text-emerald-300 hover:text-white font-bold text-[11px] transition-colors"
                            title="Aprobar e incorporar al Reino"
                          >
                            ✓ Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(req.id, req.alias)}
                            className="py-1 px-2 rounded bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white text-[11px] transition-colors"
                            title="Rechazar solicitud"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-500 italic font-mono">
                          Procesada
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (

        /* ========================================================================= */
        /* VISTA EN FICHAS DETALLADAS */
        /* ========================================================================= */
        <div className="space-y-4">
          {filteredRequests.map(req => {
            let formFields = {};
            try {
              formFields = typeof req.formData === 'string' ? JSON.parse(req.formData) : (req.formData || {});
            } catch {
              formFields = {};
            }

            const telegram = formFields.telegram?.trim();
            const ageStatus = formFields.ageStatus?.trim();
            const motivation = formFields.motivation?.trim();
            const preferences = formFields.preferences?.trim();
            const skills = Array.isArray(formFields.skills) ? formFields.skills : [];
            const isPending = req.status === 'PENDING_REVIEW' || req.status === 'SUBMITTED';

            return (
              <div key={req.id} className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4 hover:border-gold-500/40 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-brand font-bold text-white text-base">{req.alias}</h4>
                    <span className="text-xs text-gray-400 font-mono">({req.email})</span>

                    <span className="px-2.5 py-0.5 rounded-full bg-bordeaux-950/70 border border-gold-500/40 text-gold-300 font-sans font-bold text-[10px] uppercase">
                      Rango: {req.targetGroup?.name || 'PLEBEYOS'}
                    </span>

                    {telegram && (
                      <a
                        href={`https://t.me/${telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#16222f] border border-[#2b4c6f] text-cyan-300 hover:text-white text-[11px] font-mono"
                      >
                        <span>✈️</span> {telegram.startsWith('@') ? telegram : `@${telegram}`}
                      </a>
                    )}

                    {ageStatus && (
                      <span className="px-2 py-0.5 rounded bg-dark-900 border border-gray-700 text-gray-300 text-[11px]">
                        👤 {ageStatus}
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      req.status === 'CONVERTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      req.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {req.status === 'CONVERTED' ? '✓ Aprobado / Miembro' : req.status === 'REJECTED' ? '✕ Rechazado' : '⏳ Pendiente'}
                    </span>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(req.id, req.alias)}
                        className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs uppercase flex items-center gap-1 shadow-md"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Aprobar y Crear Miembro
                      </button>
                      <button
                        onClick={() => handleReject(req.id, req.alias)}
                        className="py-1.5 px-3 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-300 hover:text-white font-sans text-xs flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {motivation && (
                    <div className="p-3 rounded-lg bg-dark-950/70 border border-gray-800 space-y-1">
                      <span className="font-mono text-[10px] text-gold-400 uppercase tracking-wider block">
                        Motivación & Disposición:
                      </span>
                      <p className="text-gray-300 font-sans leading-relaxed">{motivation}</p>
                    </div>
                  )}

                  {preferences && (
                    <div className="p-3 rounded-lg bg-dark-950/70 border border-gray-800 space-y-1">
                      <span className="font-mono text-[10px] text-crimson-400 uppercase tracking-wider block">
                        Fetiches & Preferencias:
                      </span>
                      <p className="text-gray-300 font-sans leading-relaxed">{preferences}</p>
                    </div>
                  )}
                </div>

                {skills.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                      Habilidades ofrecidas para servir:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-dark-900 border border-gray-700 text-gold-300 text-xs font-mono">
                          ✦ {SKILL_NAMES[s] || s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
