import React, { useState, useEffect } from 'react';
import { 
  Castle, Crown, CheckCircle, ShieldAlert, Key, LogIn, Sparkles, Send, 
  Lock, BookOpen, Clock, Award, Check, RefreshCw, AlertCircle, ChevronRight, 
  User, Shield, Calendar, ArrowRight, ArrowLeft, ExternalLink, ScrollText,
  FileText, MessageSquare, AlertTriangle, Star, Zap, MessageCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE, safeFetchJson } from '../../config';
import { KingdomChatBox } from './KingdomChatBox';

const JOURNAL_CATEGORIES = [
  { id: 'ACUERDO', label: 'Acuerdo & Límites', icon: '📜', color: 'border-amber-500/50 text-amber-300 bg-amber-950/40' },
  { id: 'OBSERVACION', label: 'Observación de Conducta', icon: '👁️', color: 'border-blue-500/50 text-blue-300 bg-blue-950/40' },
  { id: 'AVANCE', label: 'Avance & Logro', icon: '⚡', color: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/40' },
  { id: 'INCIDENCIA', label: 'Incidencia / Fricción', icon: '⚠️', color: 'border-red-500/50 text-red-300 bg-red-950/40' },
  { id: 'SENSACION', label: 'Sensación & Emocional', icon: '🕯️', color: 'border-purple-500/50 text-purple-300 bg-purple-950/40' },
  { id: 'DECISION', label: 'Decisión / Estatus', icon: '🎯', color: 'border-gold-500/50 text-gold-300 bg-gold-950/40' },
  { id: 'CONTEXTO', label: 'Contexto de Tarea', icon: '📌', color: 'border-pink-500/50 text-pink-300 bg-pink-950/40' },
  { id: 'GENERAL', label: 'Nota General', icon: '📝', color: 'border-gray-500/50 text-gray-300 bg-gray-900/50' }
];

export function MemberProfilePage({ currentMember, onAuthSuccess, onLogout }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile'); // 'profile', 'login', 'request'
  const [member, setMember] = useState(currentMember);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Tareas states
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [taskEvidence, setTaskEvidence] = useState('');
  const [taskFilter, setTaskFilter] = useState('pending'); // 'pending', 'completed', 'all'
  const [submittingTask, setSubmittingTask] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState('');

  // Perfil view sections: 'tasks' | 'journal' | 'rules'
  const [activeSection, setActiveSection] = useState('tasks');
  const [journalEntries, setJournalEntries] = useState([]);
  const [loadingJournal, setLoadingJournal] = useState(false);
  const [journalCategoryFilter, setJournalCategoryFilter] = useState('ALL');
  const [showNewJournalModal, setShowNewJournalModal] = useState(false);
  const [newJournalCategory, setNewJournalCategory] = useState('SENSACION');
  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalContent, setNewJournalContent] = useState('');
  const [submittingJournal, setSubmittingJournal] = useState(false);

  // Form states - Solicitud de acceso
  const [reqAlias, setReqAlias] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPassword, setReqPassword] = useState('');
  const [reqTelegram, setReqTelegram] = useState('');
  const [reqAgeStatus, setReqAgeStatus] = useState('');
  const [reqTargetGroupId, setReqTargetGroupId] = useState('');
  const [reqSkills, setReqSkills] = useState([]);
  const [reqPreferences, setReqPreferences] = useState('');
  const [reqMotivation, setReqMotivation] = useState('');

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sincronizar prop currentMember
  useEffect(() => {
    if (currentMember) {
      setMember(currentMember);
      if (Array.isArray(currentMember.journalEntries)) {
        setJournalEntries(currentMember.journalEntries);
      }
      setTab('profile');
    } else {
      const token = localStorage.getItem('yakuza_member_token');
      if (token) {
        fetchMe();
      } else {
        setTab('login');
      }
    }
  }, [currentMember]);

  // Cargar grupos para formulario de admisión
  useEffect(() => {
    fetch(`${API_BASE}/api/kingdom/groups`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setGroups(data);
      })
      .catch(() => {});
  }, []);

  // Refrescar expediente del miembro
  const fetchMe = async () => {
    const token = localStorage.getItem('yakuza_member_token');
    if (!token) return;
    setRefreshing(true);
    try {
      const data = await safeFetchJson(`${API_BASE}/api/kingdom/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data && data.member) {
        setMember(data.member);
        if (Array.isArray(data.member.journalEntries)) {
          setJournalEntries(data.member.journalEntries);
        }
        onAuthSuccess?.(data.member);
        setTab('profile');
      }
    } catch (e) {
      console.error(e);
      if (e.message && e.message.includes('403')) {
        handleLogout();
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Cargar diario de la dinámica
  const fetchJournal = async () => {
    const token = localStorage.getItem('yakuza_member_token');
    if (!token) return;
    setLoadingJournal(true);
    try {
      const data = await safeFetchJson(`${API_BASE}/api/kingdom/me/journal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(data)) {
        setJournalEntries(data);
      } else if (data && Array.isArray(data.entries)) {
        setJournalEntries(data.entries);
      }
    } catch (e) {
      console.error('Error cargando diario:', e);
      if (member && Array.isArray(member.journalEntries) && member.journalEntries.length > 0) {
        setJournalEntries(member.journalEntries);
      }
    } finally {
      setLoadingJournal(false);
    }
  };

  useEffect(() => {
    if (member && member.status !== 'PENDING_REVIEW') {
      fetchJournal();
    }
  }, [member?.id]);

  const handleLogout = () => {
    localStorage.removeItem('yakuza_member_token');
    setMember(null);
    onLogout?.();
    setTab('login');
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data = null;
      try {
        data = await safeFetchJson(`${API_BASE}/api/kingdom/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
        });
      } catch (loginErr) {
        if (loginErr.message && loginErr.message.includes('404')) {
          data = await safeFetchJson(`${API_BASE}/api/kingdom/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
          });
        } else {
          throw loginErr;
        }
      }

      if (data.token && data.member) {
        localStorage.setItem('yakuza_member_token', data.token);
        setMember(data.member);
        if (Array.isArray(data.member.journalEntries)) {
          setJournalEntries(data.member.journalEntries);
        }
        onAuthSuccess?.(data.member);
        setTab('profile');
        setLoginPassword('');
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      setError(err.message || 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  // Admission request handler
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const payload = {
        alias: reqAlias.trim(),
        email: reqEmail.trim(),
        password: reqPassword,
        telegram: reqTelegram.trim(),
        ageStatus: reqAgeStatus.trim(),
        targetGroupId: reqTargetGroupId || null,
        skills: reqSkills,
        preferences: reqPreferences.trim(),
        motivation: reqMotivation.trim()
      };

      const data = await safeFetchJson(`${API_BASE}/api/kingdom/access-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSuccessMsg(data.message || '¡Tu solicitud ha sido entregada a la Princesa con éxito!');
      if (data.token && data.member) {
        localStorage.setItem('yakuza_member_token', data.token);
        setMember(data.member);
        onAuthSuccess?.(data.member);
        setTab('profile');
      } else {
        setTab('login');
      }
    } catch (err) {
      setError(err.message || 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Completar tarea (soporta PUT y fallback a POST para compatibilidad con cualquier versión del backend)
  const handleCompleteTask = async (taskId) => {
    const token = localStorage.getItem('yakuza_member_token');
    if (!token) return;
    setSubmittingTask(true);
    setError('');
    const evidenceContent = taskEvidence.trim();

    try {
      let resData = null;
      try {
        // Intento 1: PUT (método esperado en producción actual)
        resData = await safeFetchJson(`${API_BASE}/api/kingdom/me/assignments/${taskId}/complete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ evidence: evidenceContent, memberEvidence: evidenceContent })
        });
      } catch (putErr) {
        // Si PUT da 404, reintentar con POST
        if (putErr.message && (putErr.message.includes('404') || putErr.message.includes('405'))) {
          resData = await safeFetchJson(`${API_BASE}/api/kingdom/me/assignments/${taskId}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ evidence: evidenceContent, memberEvidence: evidenceContent })
          });
        } else {
          throw putErr;
        }
      }

      setTaskFeedback('✓ Tarea completada y entregada solemnemente a la Princesa.');
      setCompletingTaskId(null);
      setTaskEvidence('');
      
      // Actualización optimista inmediata en memoria para que no se quede en 0% ni un segundo
      setMember(prev => {
        if (!prev) return prev;
        const updatedAssignments = (prev.assignments || []).map(a => 
          a.id === taskId ? { ...a, status: 'COMPLETED_ON_TIME', completedAt: new Date().toISOString(), memberEvidence: evidenceContent } : a
        );
        const compCount = updatedAssignments.filter(a => ['COMPLETED_ON_TIME', 'COMPLETED_LATE', 'COMPLETED'].includes(a.status)).length;
        const newProg = updatedAssignments.length > 0 ? Math.round((compCount / updatedAssignments.length) * 100) : prev.overallProgress;
        return {
          ...prev,
          assignments: updatedAssignments,
          overallProgress: Math.max(prev.overallProgress || 0, newProg)
        };
      });

      fetchMe();
      setTimeout(() => setTaskFeedback(''), 5000);
    } catch (err) {
      alert(err.message || 'Error al marcar tarea como completada');
    } finally {
      setSubmittingTask(false);
    }
  };

  // Crear entrada en diario
  const handleCreateJournalEntry = async (e) => {
    e.preventDefault();
    if (!newJournalContent.trim()) return;
    const token = localStorage.getItem('yakuza_member_token');
    if (!token) return;
    setSubmittingJournal(true);
    try {
      const createdEntry = await safeFetchJson(`${API_BASE}/api/kingdom/me/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category: newJournalCategory,
          title: newJournalTitle.trim() || 'Reflexión de servicio',
          content: newJournalContent.trim(),
          date: new Date().toISOString()
        })
      });

      setNewJournalTitle('');
      setNewJournalContent('');
      setShowNewJournalModal(false);
      if (createdEntry && createdEntry.id) {
        setJournalEntries(prev => [createdEntry, ...prev.filter(e => e.id !== createdEntry.id)]);
      }
      fetchJournal();
    } catch (err) {
      alert(err.message || 'Error al registrar entrada en el diario');
    } finally {
      setSubmittingJournal(false);
    }
  };

  // Tareas filtradas y cálculo dinámico de progreso
  const assignments = member?.assignments || [];
  const completedTasksCount = assignments.filter(task => 
    ['COMPLETED_ON_TIME', 'COMPLETED_LATE', 'COMPLETED'].includes(task.status)
  ).length;
  const taskProgressPercent = assignments.length > 0 
    ? Math.round((completedTasksCount / assignments.length) * 100) 
    : 0;
  // El progreso efectivo nunca se queda en 0% si hay tareas completadas
  const effectiveProgress = Math.max(Math.round(member?.overallProgress || 0), taskProgressPercent);

  const filteredAssignments = assignments.filter(task => {
    const isCompleted = ['COMPLETED_ON_TIME', 'COMPLETED_LATE', 'COMPLETED'].includes(task.status);
    if (taskFilter === 'pending') return !isCompleted;
    if (taskFilter === 'completed') return isCompleted;
    return true;
  });

  // Entradas de diario filtradas
  const filteredJournal = journalEntries.filter(entry => {
    if (journalCategoryFilter === 'ALL') return true;
    return entry.category === journalCategoryFilter;
  });

  // =========================================================================
  // RENDER: PÁGINA COMPLETA
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-[#070305] text-[#f4ebd9] flex flex-col font-sans select-none selection:bg-gold-500 selection:text-dark-950">
      
      {/* 1. TOP BAR SOLEMNE DEL REINO */}
      <header className="w-full bg-[#0d0509]/95 backdrop-blur-md border-b border-gold-500/30 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-2xl">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group cursor-pointer"
            title="Ir a Yakuza House"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-bordeaux-800 to-gold-500/80 p-0.5 shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <Crown className="w-4 h-4 text-gold-400" />
              </div>
            </div>
            <div>
              <span className="font-brand font-black text-sm tracking-[0.2em] text-white group-hover:text-gold-300 transition-colors uppercase block leading-tight">
                DOMINIUM <span className="text-gold-400">· REINO</span>
              </span>
              <span className="text-[9px] tracking-[0.25em] text-gold-500/80 uppercase font-mono block">
                Casa de la Princesa Yakuza
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tienda"
            className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gold-500/30 bg-dark-950/70 hover:bg-gold-500/10 text-xs font-mono text-gold-300 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gold-400" />
            <span>Volver a la Tienda</span>
          </Link>

          {member && (
            <button
              onClick={fetchMe}
              disabled={refreshing}
              title="Actualizar expediente"
              className="p-2 rounded-lg bg-dark-950 border border-gold-500/30 text-gold-400 hover:text-gold-200 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {member ? (
            <button
              onClick={handleLogout}
              className="py-1.5 px-3 rounded-lg border border-crimson-500/40 bg-crimson-950/30 hover:bg-crimson-900/50 text-crimson-300 text-xs font-mono transition-all"
            >
              Cerrar Sesión
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTab('login')}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono transition-all ${
                  tab === 'login'
                    ? 'bg-gold-500 text-dark-950 font-bold'
                    : 'text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                Acceso Miembros
              </button>
              <button
                onClick={() => setTab('request')}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono transition-all ${
                  tab === 'request'
                    ? 'bg-gold-500 text-dark-950 font-bold'
                    : 'text-gold-400 hover:text-gold-300 border border-gold-500/30'
                }`}
              >
                Solicitar Admisión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. CUERPO PRINCIPAL (PANTALLA COMPLETA) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* FEEDBACK Y ALERTAS */}
        {error && (
          <div className="p-4 rounded-xl bg-crimson-600/20 border border-crimson-500/40 text-crimson-300 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-crimson-400" />
            <span className="text-xs font-medium">{error}</span>
          </div>
        )}

        {taskFeedback && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <span className="text-xs font-semibold">{taskFeedback}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 1: MIEMBRO AUTENTICADO - PANTALLA COMPLETA                          */}
        {/* ========================================================================= */}
        {tab === 'profile' && member && (
          <div className="space-y-6">
            
            {/* CASO A: EXPEDIENTE EN EVALUACIÓN */}
            {member.status === 'PENDING_REVIEW' && (
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#1c1017] via-dark-950 to-[#12070e] border border-amber-500/40 text-center space-y-6 shadow-2xl max-w-2xl mx-auto my-8">
                <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
                  <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono tracking-[0.3em] uppercase text-amber-400 font-bold block">
                    ✦ EXPEDIENTE EN EVALUACIÓN SOLEMNE ✦
                  </span>
                  <h2 className="font-serif font-bold text-2xl text-white">
                    Solicitud en manos de la Administración
                  </h2>
                  <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                    Saludos, <strong className="text-gold-300">{member.alias}</strong> ({member.memberNumber || '#---'}). Tu expediente y formulario de admisión han sido recibidos solemnemente.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-dark-950/80 border border-amber-500/20 text-left font-mono text-xs space-y-2.5 max-w-md mx-auto">
                  <div className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-2">
                    <span>Estado:</span>
                    <span className="text-amber-400 font-bold uppercase">Pendiente de Aprobación</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-2">
                    <span>Email:</span>
                    <span className="text-white">{member.email}</span>
                  </div>
                  {member.telegram && (
                    <div className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-2">
                      <span>Telegram:</span>
                      <span className="text-gold-300">{member.telegram}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-gray-400 pt-1">
                    <span>Estamento pretendido:</span>
                    <span className="text-white font-bold">{member.group?.name || 'PLEBEYOS'}</span>
                  </div>
                </div>

                <div className="p-4 bg-dark-900/60 rounded-xl border border-gray-800 text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                  🔒 Por mandato de la Princesa, el acceso a las tareas remuneradas, rituales privados y actividades del Reino permanecerá sellado hasta que se confirme tu admisión formal.
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={fetchMe}
                    disabled={refreshing}
                    className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 text-dark-950 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>{refreshing ? 'Comprobando...' : 'Comprobar si he sido admitido'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-3 px-4 rounded-xl bg-dark-950 border border-gray-800 hover:bg-gray-800 text-gray-400 text-xs font-mono"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}

            {/* CASO B: MIEMBRO ACTIVO / CONSAGRADO - PANTALLA COMPLETA */}
            {member.status !== 'PENDING_REVIEW' && (
              <div className="space-y-6">

                {/* TARJETA DE IDENTIDAD HERO (DOMINIUM) */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1f0a14] via-dark-950 to-[#14080e] border border-gold-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center gap-5 z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-bordeaux-800 to-gold-500/30 border border-gold-400 flex items-center justify-center text-gold-300 font-mono font-bold text-xl sm:text-2xl shadow-xl shadow-gold-500/10 shrink-0">
                      {member.memberNumber || '#'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
                          {member.alias}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          {member.status === 'ACTIVE' ? '✓ Activo' : member.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-gold-400 text-xs font-mono mt-1.5">
                        <span className="flex items-center gap-1 font-bold">
                          <Crown className="w-3.5 h-3.5 text-gold-400" />
                          {member.group?.name || 'PLEBEYOS'}
                        </span>
                        <span>·</span>
                        <span className="text-gray-300">{member.position?.name || 'Devoto Consagrado'}</span>
                        {member.internalName && (
                          <>
                            <span>·</span>
                            <span className="text-gold-300/80 italic">“{member.internalName}”</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STATS RÁPIDOS */}
                  <div className="flex items-center gap-4 z-10">
                    <div className="bg-dark-950/80 border border-gold-500/20 rounded-2xl p-4 text-center min-w-[100px]">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Nivel Exp.</span>
                      <span className="font-serif font-black text-xl text-gold-400">{member.experiencePoints || 0} XP</span>
                    </div>

                    <div className="bg-dark-950/80 border border-gold-500/20 rounded-2xl p-4 text-center min-w-[100px]">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Progreso</span>
                      <span className="font-serif font-black text-xl text-emerald-400">{effectiveProgress}%</span>
                      {assignments.length > 0 && (
                        <span className="text-[9px] font-mono text-gray-400 block mt-0.5">{completedTasksCount}/{assignments.length} tareas</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BARRA DE PROGRESO DE NIVEL */}
                <div className="p-5 rounded-2xl bg-dark-950/80 border border-gold-500/25 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-gray-300 font-mono">
                      <Sparkles className="w-4 h-4 text-gold-400" />
                      <span>Evolución en el Reino:</span>
                      <strong className="text-gold-300">{member.experiencePoints || 0} XP Acumulados</strong>
                    </div>
                    <span className="font-mono text-gold-400 font-bold">{effectiveProgress}% hacia ascenso</span>
                  </div>
                  <div className="w-full bg-dark-900 rounded-full h-2.5 overflow-hidden border border-gray-800">
                    <div 
                      className="bg-gradient-to-r from-bordeaux-600 via-gold-500 to-gold-400 h-full rounded-full transition-all duration-700 shadow-sm shadow-gold-500/50"
                      style={{ width: `${Math.min(100, Math.max(effectiveProgress > 0 ? 5 : 0, effectiveProgress))}%` }}
                    />
                  </div>
                </div>

                {/* SELECTOR DE SECCIONES (TABS DE PANTALLA COMPLETA) */}
                <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                  <button
                    onClick={() => setActiveSection('tasks')}
                    className={`py-2.5 px-5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
                      activeSection === 'tasks'
                        ? 'bg-gold-500 text-dark-950 shadow-lg shadow-gold-500/20'
                        : 'bg-dark-950 text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Mis Tareas y Mandatos ({assignments.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('journal')}
                    className={`py-2.5 px-5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
                      activeSection === 'journal'
                        ? 'bg-gold-500 text-dark-950 shadow-lg shadow-gold-500/20'
                        : 'bg-dark-950 text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Diario de la Dinámica ({journalEntries.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('rules')}
                    className={`py-2.5 px-5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
                      activeSection === 'rules'
                        ? 'bg-gold-500 text-dark-950 shadow-lg shadow-gold-500/20'
                        : 'bg-dark-950 text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    <ScrollText className="w-4 h-4" />
                    <span>Normas y Privilegios</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('chat')}
                    className={`py-2.5 px-5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 relative ${
                      activeSection === 'chat'
                        ? 'bg-gold-500 text-dark-950 shadow-lg shadow-gold-500/20'
                        : 'bg-dark-950 text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 text-gold-400" />
                    <span>Línea Directa / Chat</span>
                  </button>
                </div>

                {/* ========================================================================= */}
                {/* SECCIÓN A: TAREAS Y MANDATOS                                              */}
                {/* ========================================================================= */}
                {activeSection === 'tasks' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-dark-950/60 p-4 rounded-2xl border border-gray-800/80">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-white">Objetivos y Tareas Encomendadas</h3>
                        <p className="text-xs text-gray-400">Cumple cada tarea dentro del plazo establecido para ganar experiencia y ascender en el Reino.</p>
                      </div>

                      <div className="flex items-center gap-1.5 bg-dark-900 p-1 rounded-xl border border-gray-800">
                        <button
                          onClick={() => setTaskFilter('pending')}
                          className={`py-1 px-3 rounded-lg text-xs font-mono ${
                            taskFilter === 'pending' ? 'bg-gold-500 text-dark-950 font-bold' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Pendientes
                        </button>
                        <button
                          onClick={() => setTaskFilter('completed')}
                          className={`py-1 px-3 rounded-lg text-xs font-mono ${
                            taskFilter === 'completed' ? 'bg-gold-500 text-dark-950 font-bold' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Completadas
                        </button>
                        <button
                          onClick={() => setTaskFilter('all')}
                          className={`py-1 px-3 rounded-lg text-xs font-mono ${
                            taskFilter === 'all' ? 'bg-gold-500 text-dark-950 font-bold' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Todas
                        </button>
                      </div>
                    </div>

                    {filteredAssignments.length === 0 ? (
                      <div className="p-12 text-center bg-dark-950/40 rounded-2xl border border-gray-800 text-gray-400 space-y-2">
                        <Award className="w-8 h-8 text-gold-500/40 mx-auto" />
                        <p className="text-sm">No hay tareas {taskFilter === 'pending' ? 'pendientes' : taskFilter === 'completed' ? 'completadas' : ''} en este momento.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAssignments.map((task) => {
                          const isCompleted = ['COMPLETED_ON_TIME', 'COMPLETED_LATE', 'COMPLETED'].includes(task.status);
                          return (
                            <div 
                              key={task.id}
                              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                                isCompleted 
                                  ? 'bg-dark-950/60 border-emerald-500/30' 
                                  : 'bg-dark-950/90 border-gold-500/30 shadow-lg'
                              }`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                                      {task.type || 'TASK'}
                                    </span>
                                    {isCompleted ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Completada
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Pendiente
                                      </span>
                                    )}
                                  </div>

                                  <span className="font-serif font-black text-sm text-gold-400">
                                    +{task.pointsAwarded || task.template?.pointsValue || 20} XP
                                  </span>
                                </div>

                                <h4 className="font-serif font-bold text-base text-white">{task.title}</h4>

                                <div className="p-3.5 rounded-xl bg-dark-900/80 border border-gray-800 text-xs text-gray-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                                  {task.customInstructions || task.template?.instructions || 'Cumple con devoción este mandato de la Casa.'}
                                </div>

                                {task.adminFeedback && (
                                  <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300 space-y-1">
                                    <span className="text-[10px] font-mono uppercase font-bold text-gold-400 block">👑 Feedback de la Princesa:</span>
                                    <p className="italic">{task.adminFeedback}</p>
                                  </div>
                                )}
                              </div>

                              {!isCompleted && (
                                <div className="pt-2 border-t border-gray-800/80">
                                  {completingTaskId === task.id ? (
                                    <div className="space-y-2 bg-dark-900/90 p-3 rounded-xl border border-gold-500/30">
                                      <label className="block text-[11px] font-mono text-gold-400">
                                        Comprobante / Mensaje de entrega (texto, enlace o confirmación):
                                      </label>
                                      <textarea
                                        rows={3}
                                        value={taskEvidence}
                                        onChange={e => setTaskEvidence(e.target.value)}
                                        placeholder="Escribe aquí los detalles de la entrega, enlace de audio/captura o confirmación..."
                                        className="w-full bg-dark-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white"
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <button
                                          type="button"
                                          onClick={() => setCompletingTaskId(null)}
                                          className="py-1.5 px-3 rounded text-xs text-gray-400 border border-gray-800"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          type="button"
                                          disabled={submittingTask}
                                          onClick={() => handleCompleteTask(task.id)}
                                          className="py-1.5 px-4 rounded bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs uppercase"
                                        >
                                          {submittingTask ? 'Entregando...' : 'Confirmar Entrega'}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCompletingTaskId(task.id);
                                        setTaskEvidence('');
                                      }}
                                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 text-dark-950 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-md"
                                    >
                                      <Check className="w-4 h-4" />
                                      <span>Marcar como Realizada / Entregar</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SECCIÓN B: DIARIO DE LA DINÁMICA                                         */}
                {/* ========================================================================= */}
                {activeSection === 'journal' && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-950/60 p-5 rounded-2xl border border-gold-500/20">
                      <div>
                        <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2">
                          <span>📖</span> Diario de la Dinámica
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-xl">
                          Registro narrativo sobre la evolución de la relación: acuerdos, sensaciones, avances, notas de conducta y reflexiones compartidas entre la Princesa y tú.
                        </p>
                      </div>

                      {member.journalAccess !== false && (
                        <button
                          onClick={() => setShowNewJournalModal(true)}
                          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 text-dark-950 font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg shadow-gold-500/20 shrink-0"
                        >
                          <span>+</span>
                          <span>Escribir en el Diario</span>
                        </button>
                      )}
                    </div>

                    {/* Filtros por Categoría */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setJournalCategoryFilter('ALL')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-mono transition-all ${
                          journalCategoryFilter === 'ALL'
                            ? 'bg-gold-500 text-dark-950 font-bold'
                            : 'bg-dark-950 text-gray-400 hover:text-white border border-gray-800'
                        }`}
                      >
                        Todas ({journalEntries.length})
                      </button>
                      {JOURNAL_CATEGORIES.map(cat => {
                        const count = journalEntries.filter(e => e.category === cat.id).length;
                        if (count === 0) return null;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setJournalCategoryFilter(cat.id)}
                            className={`py-1.5 px-3 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                              journalCategoryFilter === cat.id
                                ? 'bg-gold-500 text-dark-950 font-bold'
                                : 'bg-dark-950 text-gray-400 hover:text-white border border-gray-800'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.label} ({count})</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Modal para Redactar Entrada */}
                    {showNewJournalModal && (
                      <div className="p-6 rounded-2xl bg-dark-950 border border-gold-500/40 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                          <h4 className="font-serif font-bold text-lg text-gold-300">Nueva Entrada en el Diario</h4>
                          <button
                            onClick={() => setShowNewJournalModal(false)}
                            className="p-1 rounded text-gray-400 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>

                        <form onSubmit={handleCreateJournalEntry} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-mono text-gold-400 mb-1">Categoría</label>
                              <select
                                value={newJournalCategory}
                                onChange={e => setNewJournalCategory(e.target.value)}
                                className="w-full bg-dark-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                              >
                                {JOURNAL_CATEGORIES.map(c => (
                                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-mono text-gold-400 mb-1">Título de la Entrada</label>
                              <input
                                type="text"
                                placeholder="Ej: Sensación tras el ritual matutino..."
                                value={newJournalTitle}
                                onChange={e => setNewJournalTitle(e.target.value)}
                                className="w-full bg-dark-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-gold-400 mb-1">Contenido de la Reflexión *</label>
                            <textarea
                              rows={5}
                              required
                              value={newJournalContent}
                              onChange={e => setNewJournalContent(e.target.value)}
                              placeholder="Describe tus sensaciones, reflexiones, avances o detalles sobre la dinámica..."
                              className="w-full bg-dark-900 border border-gray-800 rounded-xl p-3 text-xs text-white leading-relaxed"
                            />
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowNewJournalModal(false)}
                              className="py-2 px-4 rounded-xl border border-gray-800 text-xs text-gray-400"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={submittingJournal}
                              className="py-2 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase shadow-lg shadow-gold-500/20"
                            >
                              {submittingJournal ? 'Guardando...' : 'Guardar en mi Diario'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Timeline de Entradas */}
                    {loadingJournal ? (
                      <div className="p-12 text-center text-xs font-mono text-gold-400 animate-pulse">Cargando diario...</div>
                    ) : filteredJournal.length === 0 ? (
                      <div className="p-12 text-center bg-dark-950/40 rounded-2xl border border-gray-800 text-gray-400 space-y-2">
                        <BookOpen className="w-8 h-8 text-gold-500/40 mx-auto" />
                        <p className="text-sm">No hay entradas en el diario todavía.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredJournal.map((entry) => {
                          const catInfo = JOURNAL_CATEGORIES.find(c => c.id === entry.category) || JOURNAL_CATEGORIES[7];
                          const isPrincess = entry.authorRole === 'PRINCESA' || entry.authorRole === 'ADMIN' || entry.author === 'PRINCESA' || entry.author === 'ADMIN';
                          const authorDisplay = isPrincess
                            ? '👑 Princesa Yakuza'
                            : `👤 ${entry.authorName || entry.author || member.alias || 'Sumiso'}`;
                          const entryDate = entry.createdAt || entry.date;
                          return (
                            <div 
                              key={entry.id}
                              className={`p-6 rounded-2xl border transition-all ${
                                isPrincess 
                                  ? 'bg-gradient-to-r from-bordeaux-950/40 via-dark-950 to-dark-950 border-gold-500/40 shadow-xl'
                                  : 'bg-dark-950/80 border-gray-800'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                                <div className="flex items-center gap-2.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${catInfo.color}`}>
                                    {catInfo.icon} {catInfo.label}
                                  </span>
                                  <span className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
                                    isPrincess ? 'text-gold-400 flex items-center gap-1' : 'text-gray-400'
                                  }`}>
                                    {authorDisplay}
                                  </span>
                                </div>

                                <span className="text-[11px] font-mono text-gray-500">
                                  {entryDate ? new Date(entryDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                                </span>
                              </div>

                              {entry.title && (
                                <h4 className="font-serif font-bold text-base text-white mb-2">{entry.title}</h4>
                              )}

                              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-body">
                                {entry.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SECCIÓN C: NORMAS Y PRIVILEGIOS                                           */}
                {/* ========================================================================= */}
                {activeSection === 'rules' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-dark-950/80 border border-gold-500/30 space-y-4">
                      <div className="flex items-center gap-3">
                        <Castle className="w-6 h-6 text-gold-400" />
                        <div>
                          <h3 className="font-serif font-bold text-lg text-white">Estamento Actual: {member.group?.name || 'PLEBEYOS'}</h3>
                          <p className="text-xs text-gray-400">{member.group?.subtitle || 'Club Privado & Jerarquía Solemne'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-xl bg-dark-900 border border-gray-800 space-y-2">
                          <span className="text-xs font-mono text-gold-400 uppercase font-bold block">✦ Qué se espera de ti:</span>
                          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                            {member.group?.expectations || 'Obediencia, reverencia y constancia en el servicio.'}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-dark-900 border border-gray-800 space-y-2">
                          <span className="text-xs font-mono text-emerald-400 uppercase font-bold block">✦ Beneficios y Privilegios:</span>
                          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                            {member.group?.benefits || 'Acceso al canal privado, biblioteca de rituales y audiencia.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SECCIÓN D: LÍNEA DIRECTA / CHAT CON LA PRINCESA                          */}
                {/* ========================================================================= */}
                {activeSection === 'chat' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-dark-950/60 p-4 rounded-2xl border border-gold-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                          <span>Línea Directa con el Trono</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/30 uppercase tracking-widest">
                            Encriptado 1 a 1
                          </span>
                        </h3>
                        <p className="text-xs text-gray-400">Canal exclusivo con la Princesa. Consulta dudas sobre tus mandatos, envía reportes solemnes o atiende sus órdenes directas.</p>
                      </div>
                    </div>

                    <KingdomChatBox
                      memberId={member.id}
                      token={localStorage.getItem('yakuza_member_token')}
                      userRole="MEMBER"
                      memberInfo={member}
                      heightClass="h-[600px] md:h-[680px]"
                      showQuickReplies={true}
                    />
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 2: FORMULARIO DE INICIO DE SESIÓN (LOGIN)                           */}
        {/* ========================================================================= */}
        {tab === 'login' && !member && (
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-dark-950 border border-gold-500/40 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center mx-auto text-gold-400 shadow-xl shadow-gold-500/10 mb-2">
                <Key className="w-8 h-8 text-gold-400" />
              </div>
              <span className="text-xs font-mono tracking-[0.25em] text-gold-400 uppercase font-bold">Portal del Reino</span>
              <h2 className="font-serif font-bold text-2xl text-white">Acceso a Mi Perfil</h2>
              <p className="text-xs text-gray-400">Introduce tus credenciales de expediente para acceder a tu panel de devoto.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gold-400 uppercase mb-1">Email de contacto</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-dark-900 border border-gray-800 focus:border-gold-500/50 rounded-xl p-3 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gold-400 uppercase mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Tu contraseña de acceso"
                  className="w-full bg-dark-900 border border-gray-800 focus:border-gold-500/50 rounded-xl p-3 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 text-dark-950 font-bold uppercase tracking-wider text-xs shadow-lg shadow-gold-500/20"
              >
                {loading ? 'Accediendo al Reino...' : 'Conectar al Reino'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-gray-800/80">
              <button
                type="button"
                onClick={() => setTab('request')}
                className="text-gray-400 hover:text-gold-300 text-xs font-mono"
              >
                ¿Aún no tienes expediente? <span className="text-gold-400 font-bold underline">Solicita tu admisión aquí</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 3: FORMULARIO DE SOLICITUD DE ADMISIÓN                             */}
        {/* ========================================================================= */}
        {tab === 'request' && !member && (
          <div className="max-w-2xl mx-auto my-8 p-8 rounded-3xl bg-dark-950 border border-gold-500/40 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center mx-auto text-gold-400 shadow-xl shadow-gold-500/10 mb-2">
                <Crown className="w-8 h-8 text-gold-400" />
              </div>
              <span className="text-xs font-mono tracking-[0.25em] text-gold-400 uppercase font-bold">Iniciación y Consagración</span>
              <h2 className="font-serif font-bold text-2xl text-white">Solicitud de Entrada al Reino</h2>
              <p className="text-xs text-gray-300 italic font-serif leading-relaxed max-w-lg mx-auto">
                “El acceso a mi energía no se compra: se conquista, se honra y se tributa con devoción. Completa este formulario e indica tu contraseña de acceso para que Administración evalúe tu idoneidad.”
              </p>
            </div>

            {successMsg ? (
              <div className="p-8 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-gold-400 mx-auto" />
                <p className="font-serif text-base font-semibold">{successMsg}</p>
                <button
                  onClick={() => { setTab('login'); setSuccessMsg(''); }}
                  className="mt-3 py-2.5 px-6 rounded-xl bg-gold-500 text-dark-950 font-bold uppercase tracking-wider text-xs"
                >
                  Acceder a mi cuenta
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gold-400 uppercase mb-1">Alias / Nombre deseado *</label>
                    <input
                      type="text"
                      required
                      value={reqAlias}
                      onChange={e => setReqAlias(e.target.value)}
                      placeholder="Ej: Devoto_Kael"
                      className="w-full bg-dark-900 border border-gray-800 focus:border-gold-500/50 rounded-xl p-3 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gold-400 uppercase mb-1">Email de contacto *</label>
                    <input
                      type="email"
                      required
                      value={reqEmail}
                      onChange={e => setReqEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full bg-dark-900 border border-gray-800 focus:border-gold-500/50 rounded-xl p-3 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gold-400 uppercase mb-1">Contraseña de acceso *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={reqPassword}
                    onChange={e => setReqPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres (podrás usarla para entrar a ver tu perfil)"
                    className="w-full bg-dark-900 border border-gray-800 focus:border-gold-500/50 rounded-xl p-3 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gold-400 uppercase mb-1">Telegram / X *</label>
                    <input
                      type="text"
                      required
                      value={reqTelegram}
                      onChange={e => setReqTelegram(e.target.value)}
                      placeholder="@usuario"
                      className="w-full bg-dark-900 border border-gray-800 focus:border-gold-500/50 rounded-xl p-3 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gold-400 uppercase mb-1">Estamento pretendido</label>
                    <select
                      value={reqTargetGroupId}
                      onChange={e => setReqTargetGroupId(e.target.value)}
                      className="w-full bg-dark-900 border border-gray-800 focus:border-gold-500/50 rounded-xl p-3 text-white text-xs"
                    >
                      <option value="">-- Elige un estamento --</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name} ({g.badge || 'Nivel'})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gold-400 uppercase mb-1">Motivación personal para servir en el Reino *</label>
                  <textarea
                    rows={4}
                    required
                    value={reqMotivation}
                    onChange={e => setReqMotivation(e.target.value)}
                    placeholder="¿Por qué quieres servir a la Princesa? ¿Qué te atrae de esta Casa?"
                    className="w-full bg-dark-900 border border-gray-800 focus:border-gold-500/50 rounded-xl p-3 text-white text-xs leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 text-dark-950 font-bold uppercase tracking-wider text-xs shadow-xl shadow-gold-500/25"
                >
                  {loading ? 'Entregando solicitud...' : 'Enviar Solicitud a la Princesa'}
                </button>
              </form>
            )}

            <div className="text-center pt-2 border-t border-gray-800/80">
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-gray-400 hover:text-gold-300 text-xs font-mono"
              >
                ¿Ya tienes expediente? <span className="text-gold-400 font-bold underline">Inicia sesión aquí</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER DISCRETO */}
      <footer className="w-full bg-[#090306] border-t border-gray-800/80 py-6 text-center text-xs font-mono text-gray-500">
        <p>DOMINIUM · YAKUZA HOUSE © 2026 · ENTORNO CIFRADO Y PROTOCOLO D/S</p>
      </footer>

    </div>
  );
}
