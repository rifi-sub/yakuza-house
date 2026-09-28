import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE } from '../../config';

export function KingdomRequestsView({ token, onMemberCreated }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleApprove = async (id) => {
    if (!confirm('¿Aprobar esta solicitud y convertir al solicitante en miembro oficial del Reino?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/requests/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error aprobando');
      alert(`¡Solicitud aprobada! Creado devoto ${data.member?.memberNumber} (${data.member?.alias}).`);
      fetchRequests();
      if (onMemberCreated) onMemberCreated();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Motivo de rechazo:', 'No cumple con el perfil o protocolo requerido');
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
      if (!res.ok) throw new Error('Error rechazando');
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/80 p-5 rounded-xl border border-gold-500/30">
        <div>
          <h3 className="font-brand font-bold text-lg text-white flex items-center gap-2">
            📬 Solicitudes de Entrada & Onboarding
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Revisión de peticiones y formularios de nuevos aspirantes que desean ingresar al Reino.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-2 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gold-400 font-mono text-xs">
            Cargando solicitudes...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-xl border border-gray-800 text-gray-500 font-mono text-xs">
            No hay solicitudes pendientes en este momento.
          </div>
        ) : (
          requests.map(req => {
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

            const SKILL_NAMES = {
              VIDEO_EDITING: 'Edición de Vídeo',
              PROGRAMMING: 'Programación & Web',
              DESIGN: 'Diseño Gráfico',
              MARKETING: 'Marketing Digital',
              LANGUAGES: 'Idiomas & Traducción',
              PHOTOGRAPHY: 'Fotografía',
              MODERATION: 'Moderación'
            };

            return (
              <div key={req.id} className="glass-panel p-5 rounded-xl border border-gray-800 space-y-3 hover:border-gold-500/40 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-brand font-bold text-white text-base">{req.alias}</h4>
                    <span className="text-xs text-gray-400 font-mono">({req.email})</span>
                    
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
                      <span className="px-2 py-0.5 rounded bg-dark-900 border border-gray-700 text-gray-300 text-[11px] font-sans">
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

                  <div className="flex gap-2">
                    {req.status === 'PENDING_REVIEW' && (
                      <>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="py-1.5 px-3 rounded-lg bg-dark-900 border border-red-500/40 text-red-300 hover:bg-red-950/40 text-xs font-mono flex items-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5" /> Rechazar
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1 shadow-md shadow-emerald-900/30"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Aprobar & Crear Miembro
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Info adicional del formulario */}
                <div className="space-y-2 pt-1 border-t border-gray-800/80 text-xs">
                  {skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono text-gold-400 font-bold uppercase mr-1">Habilidades:</span>
                      {skills.map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-gold-500/10 border border-gold-500/20 text-gold-300 text-[10px] font-mono font-semibold">
                          ✦ {SKILL_NAMES[sk] || sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {motivation && (
                    <div className="p-2.5 rounded-lg bg-dark-950/80 border border-gray-800/60 font-serif italic text-gray-300">
                      <span className="font-mono text-gold-400 text-[10px] uppercase font-bold not-italic mr-2">Motivación:</span>
                      "{motivation}"
                    </div>
                  )}

                  {preferences && (
                    <div className="p-2.5 rounded-lg bg-dark-950/80 border border-gray-800/60 font-sans text-gray-300">
                      <span className="font-mono text-rose-400 text-[10px] uppercase font-bold mr-2">Preferencias / Límites:</span>
                      {preferences}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-gray-500 pt-1">
                    <span>Sociedad destino: <strong className="text-gold-400">{req.targetGroup?.name || 'Plebeyos (General)'}</strong></span>
                    <span>Recibida: {new Date(req.submittedAt).toLocaleString('es-ES')}</span>
                  </div>

                  {req.decisionNotes && (
                    <p className="text-xs text-gray-400 italic pt-1 border-t border-gray-800/40">Notas administrativas: {req.decisionNotes}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
