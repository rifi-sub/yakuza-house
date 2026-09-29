import React, { useState, useEffect } from 'react';
import { 
  Castle, Crown, X, CheckCircle, ShieldAlert, Key, LogIn, Sparkles, Send, 
  Lock, BookOpen, Clock, Award, Check, RefreshCw, AlertCircle, ChevronRight, 
  User, Shield, Calendar, ArrowRight
} from 'lucide-react';
import { API_BASE, safeFetchJson } from '../../config';

export function KingdomAuthModal({ 
  isOpen, 
  onClose, 
  currentMember, 
  onAuthSuccess, 
  onLogout,
  initialTargetGroupId
}) {
  const [tab, setTab] = useState('request'); // 'request', 'login', 'profile'
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [taskFeedback, setTaskFeedback] = useState('');
  const [taskFilter, setTaskFilter] = useState('pending'); // 'pending', 'completed', 'all'

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

  // Abrir en 'request' si se especifica initialTargetGroupId, o en 'profile' si ya está autenticado
  useEffect(() => {
    if (initialTargetGroupId) {
      setTab('request');
    } else if (currentMember) {
      setTab('profile');
    } else {
      setTab('request');
    }
  }, [currentMember, initialTargetGroupId, isOpen]);

  // Preseleccionar estamento solicitado cuando los grupos estén listos
  useEffect(() => {
    if (initialTargetGroupId && groups.length > 0) {
      const match = groups.find(g => 
        g.id === initialTargetGroupId || 
        g.slug === initialTargetGroupId || 
        (g.name && g.name.toLowerCase() === initialTargetGroupId.toLowerCase())
      );
      if (match) {
        setReqTargetGroupId(match.id);
      }
    }
  }, [initialTargetGroupId, groups]);

  // Refrescar expediente del miembro desde el servidor
  const fetchMe = async () => {
    const token = localStorage.getItem('yakuza_member_token');
    if (!token) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.member) {
          onAuthSuccess?.(data.member, token);
        }
      }
    } catch (err) {
      console.error('Error al actualizar expediente:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Cargar grupos y refrescar expediente al abrir modal
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      setTaskFeedback('');
      safeFetchJson(`${API_BASE}/api/kingdom/groups`)
        .then(data => {
          if (Array.isArray(data)) setGroups(data);
        })
        .catch(console.error);

      if (currentMember) {
        fetchMe();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const skillOptions = [
    { id: 'VIDEO_EDITING', label: 'Edición de Vídeo (Premiere, CapCut, DaVinci)' },
    { id: 'PROGRAMMING', label: 'Programación & Desarrollo Web' },
    { id: 'DESIGN', label: 'Diseño Gráfico & Arte Visual' },
    { id: 'MARKETING', label: 'Marketing Digital & Crecimiento' },
    { id: 'LANGUAGES', label: 'Idiomas & Traducción' },
    { id: 'PHOTOGRAPHY', label: 'Fotografía & Retoque' },
    { id: 'MODERATION', label: 'Moderación de Canales & Gestión' }
  ];

  const handleToggleSkill = (id) => {
    setReqSkills(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Enviar Solicitud de Admisión (con contraseña incluida)
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (!reqPassword || reqPassword.length < 6) {
      setError('Debes elegir una contraseña de al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        alias: reqAlias.trim(),
        email: reqEmail.trim(),
        password: reqPassword,
        targetGroupId: reqTargetGroupId || null,
        formData: {
          telegram: reqTelegram.trim(),
          ageStatus: reqAgeStatus.trim(),
          skills: reqSkills,
          preferences: reqPreferences.trim(),
          motivation: reqMotivation.trim(),
          submittedAt: new Date().toISOString()
        }
      };

      const res = await fetch(`${API_BASE}/api/kingdom/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar la solicitud');

      if (data.token && data.member) {
        localStorage.setItem('yakuza_member_token', data.token);
        onAuthSuccess?.(data.member, data.token);
        setTab('profile');
      } else {
        setLoginEmail(reqEmail.trim());
        setSuccessMsg('Tu solicitud ha sido entregada y tu cuenta ha sido creada. Puedes conectarte para ver el estado de tu expediente.');
        setTab('login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar Sesión de Miembro
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/kingdom/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');

      localStorage.setItem('yakuza_member_token', data.token);
      onAuthSuccess?.(data.member, data.token);
      setTab('profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Completar Tarea Asignada (Acción del cliente)
  const handleCompleteTask = async (assignmentId) => {
    const token = localStorage.getItem('yakuza_member_token');
    if (!token) return;
    setCompletingTaskId(assignmentId);
    setTaskFeedback('');
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/me/assignments/${assignmentId}/complete`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo completar la tarea');

      setTaskFeedback('✓ ¡Tarea completada solemnemente! Puntos de devoción acumulados.');
      await fetchMe();
      setTimeout(() => setTaskFeedback(''), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setCompletingTaskId(null);
    }
  };

  // Filtrado de tareas del miembro activo
  const assignments = currentMember?.assignments || [];
  const pendingAssignments = assignments.filter(a => ['ASSIGNED', 'ACTIVE', 'DUE_SOON', 'OVERDUE'].includes(a.status));
  const completedAssignments = assignments.filter(a => ['COMPLETED_ON_TIME', 'COMPLETED_LATE'].includes(a.status));

  const displayedAssignments = taskFilter === 'pending'
    ? pendingAssignments
    : taskFilter === 'completed'
    ? completedAssignments
    : assignments;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-dark-900 border border-gold-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera Modal */}
        <div className="p-5 sm:p-6 border-b border-gold-500/30 bg-gradient-to-r from-bordeaux-700/40 via-dark-950 to-dark-900 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-center shadow-lg shadow-gold-500/10">
              <Castle className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-gold-400">
                ✦ ACCESO A LA JERARQUÍA ✦
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                Portal del Reino
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de navegación interna (Solo 2 pestañas cuando no está logueado) */}
        {!currentMember && (
          <div className="flex border-b border-gray-800 bg-dark-950/50 px-4 pt-2 gap-2 text-xs font-mono">
            <button
              onClick={() => { setTab('request'); setError(''); setSuccessMsg(''); }}
              className={`py-2 px-4 border-b-2 font-bold transition-all ${
                tab === 'request'
                  ? 'border-gold-400 text-gold-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              1. Solicitar Admisión
            </button>
            <button
              onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
              className={`py-2 px-4 border-b-2 font-bold transition-all ${
                tab === 'login'
                  ? 'border-gold-400 text-gold-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              2. Acceso Miembros
            </button>
          </div>
        )}

        {/* Contenido scrolleable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs font-sans">
          
          {error && (
            <div className="p-3 rounded-lg bg-crimson-600/20 border border-crimson-500/30 text-crimson-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-crimson-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && !currentMember && (
            <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-gold-400 mx-auto" />
              <p className="font-serif text-sm font-semibold">{successMsg}</p>
              <button
                onClick={() => { setTab('login'); setSuccessMsg(''); }}
                className="mt-2 py-1.5 px-5 rounded-lg bg-gold-500 text-dark-950 font-bold uppercase tracking-wider text-[11px]"
              >
                Acceder a mi cuenta
              </button>
            </div>
          )}

          {/* TAB 1: FORMULARIO DE ADMISIÓN (CON CONTRASEÑA INCLUIDA) */}
          {tab === 'request' && !currentMember && (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <p className="text-gray-300 italic font-serif leading-relaxed">
                “El acceso a mi energía no se compra: se conquista, se honra y se tributa con devoción. Completa este formulario e indica tu contraseña de acceso para que Administración evalúe tu idoneidad.”
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">
                    Alias / Nombre deseado *
                  </label>
                  <input
                    type="text"
                    required
                    value={reqAlias}
                    onChange={e => setReqAlias(e.target.value)}
                    placeholder="Ej: Devoto_Kael"
                    className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">
                    Email de contacto *
                  </label>
                  <input
                    type="email"
                    required
                    value={reqEmail}
                    onChange={e => setReqEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white font-sans text-xs"
                  />
                </div>
              </div>

              {/* Contraseña elegida por el usuario */}
              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">
                  Contraseña de acceso *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={reqPassword}
                    onChange={e => setReqPassword(e.target.value)}
                    placeholder="Crea tu contraseña (mínimo 6 caracteres)"
                    className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white font-sans text-xs pr-10"
                  />
                  <Lock className="w-4 h-4 text-gold-400/60 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Podrás conectarte con este email y contraseña para seguir el estado de tu admisión y tus tareas asignadas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">
                    Usuario Telegram / X (Obligatorio para órdenes) *
                  </label>
                  <input
                    type="text"
                    required
                    value={reqTelegram}
                    onChange={e => setReqTelegram(e.target.value)}
                    placeholder="@tu_usuario"
                    className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">
                    Edad & Situación laboral *
                  </label>
                  <input
                    type="text"
                    required
                    value={reqAgeStatus}
                    onChange={e => setReqAgeStatus(e.target.value)}
                    placeholder="Ej: 28 años, Ingeniero con ingresos estables"
                    className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white font-sans text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">
                  Estamento / Nivel al que aspiras
                </label>
                <select
                  value={reqTargetGroupId}
                  onChange={e => setReqTargetGroupId(e.target.value)}
                  className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white font-sans text-xs"
                >
                  <option value="">Selecciona un estamento de aspiración...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} — {g.subtitle || g.badge}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">
                  Habilidades laborales con las que puedes ser útil
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-dark-950 rounded-lg border border-gray-800">
                  {skillOptions.map(sk => (
                    <label key={sk.id} className="flex items-center gap-2 text-[11px] text-gray-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={reqSkills.includes(sk.id)}
                        onChange={() => handleToggleSkill(sk.id)}
                        className="rounded accent-gold-500 border-gray-700"
                      />
                      <span>{sk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">
                  Preferencias, fetiches y límites infranqueables
                </label>
                <input
                  type="text"
                  value={reqPreferences}
                  onChange={e => setReqPreferences(e.target.value)}
                  placeholder="Ej: Findom, Servidumbre, Footworship / Límite: Sin humillación pública degradante"
                  className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">
                  Mensaje solemne a la Princesa (¿Por qué mereces entrar?) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reqMotivation}
                  onChange={e => setReqMotivation(e.target.value)}
                  placeholder="Expresa con claridad y respeto qué puedes aportar y por qué deseas formar parte del Reino..."
                  className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white font-sans text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-gray-400 hover:text-gold-300 text-xs font-mono underline"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-bordeaux-600 to-bordeaux-500 hover:from-bordeaux-500 hover:to-bordeaux-400 text-gold-200 border border-gold-500/50 font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-bordeaux-700/40"
                >
                  <Send className="w-4 h-4 text-gold-400" />
                  <span>{loading ? 'Enviando petición...' : 'Enviar Solicitud al Reino'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: INICIAR SESIÓN MIEMBROS */}
          {tab === 'login' && !currentMember && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto py-4">
              <div className="text-center space-y-1 mb-6">
                <Crown className="w-8 h-8 text-gold-400 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-white">Acceso a tu Expediente</h3>
                <p className="text-gray-400 text-xs">Introduce el email y la contraseña con los que te registraste.</p>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Verificando credenciales...' : 'Entrar al Reino'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setTab('request')}
                  className="text-gray-400 hover:text-gold-300 text-xs font-mono"
                >
                  ¿No tienes expediente aún? <span className="underline text-gold-400 font-bold">Solicita admisión aquí</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PERFIL DE MIEMBRO AUTENTICADO (DASHBOARD DEL CLIENTE) */}
          {tab === 'profile' && currentMember && (
            <div className="space-y-5 py-1">
              
              {/* Notificación de feedback al completar tarea */}
              {taskFeedback && (
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="font-semibold text-xs">{taskFeedback}</span>
                </div>
              )}

              {/* CASO A: EXPEDIENTE EN EVALUACIÓN (EL CLIENTE AÚN NO HA SIDO ACEPTADO) */}
              {currentMember.status === 'PENDING_REVIEW' && (
                <div className="space-y-4">
                  {/* Tarjeta de estado de evaluación */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#1c1219] to-dark-950 border border-amber-500/40 text-center space-y-4 shadow-xl">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                      <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-amber-400 font-bold">
                        ✦ EXPEDIENTE EN EVALUACIÓN SOLEMNE ✦
                      </span>
                      <h3 className="font-serif font-bold text-lg text-white">
                        Solicitud en manos de la Administración
                      </h3>
                      <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                        Hola, <strong className="text-gold-300">{currentMember.alias}</strong> ({currentMember.memberNumber || '#---'}). Tu cuenta y tu solicitud han sido registradas formalmente.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-dark-950/80 border border-amber-500/20 text-left font-mono text-xs space-y-2 max-w-md mx-auto">
                      <div className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-1.5">
                        <span>Estado:</span>
                        <span className="text-amber-400 font-bold uppercase">Pendiente de Aprobación</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-1.5">
                        <span>Email:</span>
                        <span className="text-white">{currentMember.email}</span>
                      </div>
                      {currentMember.telegram && (
                        <div className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-1.5">
                          <span>Telegram:</span>
                          <span className="text-gold-300">{currentMember.telegram}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-gray-400 pt-0.5">
                        <span>Estamento pretendido:</span>
                        <span className="text-white font-bold">{currentMember.group?.name || 'Plebeyos'}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-dark-900/60 rounded-xl border border-gray-800 text-[11px] text-gray-400 leading-relaxed max-w-md mx-auto">
                      🔒 Por decreto de la Casa, el acceso a las tareas remuneradas, rituales privados y actividades del Reino permanecerá sellado hasta que la Princesa confirme tu consagración.
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2 max-w-md mx-auto">
                      <button
                        type="button"
                        onClick={fetchMe}
                        disabled={refreshing}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 text-dark-950 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg"
                      >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>{refreshing ? 'Comprobando...' : 'Comprobar si he sido aceptado'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('yakuza_member_token');
                          onLogout?.();
                          setTab('request');
                        }}
                        className="py-2.5 px-4 rounded-xl bg-dark-950 border border-gray-800 hover:bg-gray-800 text-gray-400 text-xs font-mono"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CASO B: MIEMBRO ACTIVO / ACEPTADO (DASHBOARD COMPLETO CON TAREAS) */}
              {currentMember.status !== 'PENDING_REVIEW' && (
                <div className="space-y-4">
                  
                  {/* Tarjeta de Identidad del Miembro */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-bordeaux-800/40 via-dark-950 to-dark-900 border border-gold-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/50 flex items-center justify-center text-gold-400 font-mono font-bold text-base shadow-lg shadow-gold-500/10">
                        {currentMember.memberNumber || '#'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                            {currentMember.alias}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            {currentMember.status === 'ACTIVE' ? '✓ Activo' : currentMember.status}
                          </span>
                        </div>
                        <p className="text-gold-400 text-xs font-mono flex items-center gap-1.5 mt-0.5">
                          <Crown className="w-3.5 h-3.5 text-gold-400" />
                          <span>{currentMember.group?.name || 'PLEBEYOS'}</span>
                          <span>·</span>
                          <span className="text-gray-300">{currentMember.position?.name || 'Devoto Consagrado'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={fetchMe}
                        disabled={refreshing}
                        title="Actualizar datos"
                        className="p-2 rounded-lg bg-dark-950 border border-gray-800 hover:border-gold-500/40 text-gray-400 hover:text-gold-400 transition-all"
                      >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem('yakuza_member_token');
                          onLogout?.();
                          setTab('request');
                        }}
                        className="py-1.5 px-3 rounded-lg border border-crimson-500/40 text-crimson-400 hover:bg-crimson-600/10 text-[11px] font-mono transition-all"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>

                  {/* Barra de Progreso y Puntos de Experiencia (XP) */}
                  <div className="p-4 rounded-xl bg-dark-950 border border-gold-500/25 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 text-gray-300 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                        <span>Progreso de Consagración</span>
                      </div>
                      <div className="font-mono font-bold text-gold-400">
                        {currentMember.experiencePoints || 0} XP <span className="text-gray-500">({currentMember.overallProgress || 0}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-bordeaux-500 via-gold-500 to-gold-300 rounded-full transition-all duration-700 shadow-sm shadow-gold-500/50"
                        style={{ width: `${Math.min(100, Math.max(5, currentMember.overallProgress || 0))}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                      <span>Rango actual: {currentMember.position?.name || 'Aspirante'}</span>
                      <span>Tareas: {completedAssignments.length} completadas de {assignments.length}</span>
                    </div>
                  </div>

                  {/* PANEL DE TAREAS Y RITUALES DEL CLIENTE */}
                  <div className="p-4 rounded-xl bg-dark-950 border border-gray-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gold-400" />
                        <h4 className="font-serif font-bold text-sm text-white">
                          Órdenes y Rituales Asignados
                        </h4>
                      </div>

                      {/* Filtros de tareas */}
                      <div className="flex gap-1 text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() => setTaskFilter('pending')}
                          className={`px-2 py-1 rounded transition-all ${
                            taskFilter === 'pending'
                              ? 'bg-gold-500 text-dark-950 font-bold'
                              : 'bg-dark-900 text-gray-400 hover:text-white'
                          }`}
                        >
                          Pendientes ({pendingAssignments.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskFilter('completed')}
                          className={`px-2 py-1 rounded transition-all ${
                            taskFilter === 'completed'
                              ? 'bg-gold-500 text-dark-950 font-bold'
                              : 'bg-dark-900 text-gray-400 hover:text-white'
                          }`}
                        >
                          Completadas ({completedAssignments.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskFilter('all')}
                          className={`px-2 py-1 rounded transition-all ${
                            taskFilter === 'all'
                              ? 'bg-gold-500 text-dark-950 font-bold'
                              : 'bg-dark-900 text-gray-400 hover:text-white'
                          }`}
                        >
                          Todas ({assignments.length})
                        </button>
                      </div>
                    </div>

                    {/* Listado de tareas */}
                    {displayedAssignments.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 text-xs font-mono space-y-1">
                        <BookOpen className="w-6 h-6 text-gray-600 mx-auto" />
                        <p>No hay órdenes en esta categoría.</p>
                        {assignments.length === 0 && (
                          <p className="text-[11px] text-gray-400 italic">
                            La Princesa o la Administración emitirán tus primeras tareas muy pronto.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {displayedAssignments.map(task => {
                          const isDone = ['COMPLETED_ON_TIME', 'COMPLETED_LATE'].includes(task.status);
                          return (
                            <div 
                              key={task.id}
                              className={`p-3 rounded-xl border transition-all ${
                                isDone 
                                  ? 'bg-dark-900/40 border-gray-800/80 opacity-75'
                                  : 'bg-dark-900 border-gold-500/30 hover:border-gold-500/50 shadow-md'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className={`font-serif font-bold text-xs ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                                      {task.title}
                                    </h5>
                                    {task.pointsAwarded && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-gold-500/10 text-gold-400 border border-gold-500/30">
                                        +{task.pointsAwarded} XP
                                      </span>
                                    )}
                                  </div>
                                  {(task.customInstructions || task.description) && (
                                    <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                                      {task.customInstructions || task.description}
                                    </p>
                                  )}
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono pt-0.5">
                                      <Calendar className="w-3 h-3 text-gold-400/70" />
                                      <span>Límite: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="shrink-0 flex items-center">
                                  {isDone ? (
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Completada
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={completingTaskId === task.id}
                                      onClick={() => handleCompleteTask(task.id)}
                                      className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 text-dark-950 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
                                    >
                                      {completingTaskId === task.id ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      <span>Marcar Hecha</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Habilidades Reconocidas */}
                  {currentMember.skills && currentMember.skills.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-dark-950 border border-gray-800 space-y-2">
                      <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider block">
                        Habilidades Reconocidas por la Casa
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentMember.skills.map((sk, i) => (
                          <span 
                            key={sk.id || i}
                            className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-dark-900 border border-gold-500/30 text-gray-200 flex items-center gap-1"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-gold-400" />
                            {sk.skillName || sk.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Normas del Estamento */}
                  <div className="p-3.5 rounded-xl bg-dark-950 border border-gray-800/80 text-[11px] text-gray-400 space-y-1 font-mono">
                    <span className="text-gold-400/80 font-bold uppercase tracking-wider block text-[10px]">
                      Mandamientos del Estamento ({currentMember.group?.name || 'PLEBEYOS'})
                    </span>
                    <p className="leading-relaxed text-gray-300">
                      {currentMember.group?.description || 'Devoción irrestricta, discreción absoluta y reverencia ante las directrices emitidas por la Princesa.'}
                    </p>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
