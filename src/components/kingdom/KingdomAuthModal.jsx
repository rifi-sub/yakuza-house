import React, { useState, useEffect } from 'react';
import { Castle, Crown, X, CheckCircle, ShieldAlert, Key, UserPlus, LogIn, Sparkles, Send, Lock, BookOpen, Clock, Award } from 'lucide-react';
import { API_BASE, safeFetchJson } from '../../config';

export function KingdomAuthModal({ isOpen, onClose, currentMember, onAuthSuccess, onLogout }) {
  const [tab, setTab] = useState('request'); // 'request', 'login', 'register', 'profile'
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states - Solicitud de acceso
  const [reqAlias, setReqAlias] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqTelegram, setReqTelegram] = useState('');
  const [reqAgeStatus, setReqAgeStatus] = useState('');
  const [reqTargetGroupId, setReqTargetGroupId] = useState('');
  const [reqSkills, setReqSkills] = useState([]);
  const [reqPreferences, setReqPreferences] = useState('');
  const [reqMotivation, setReqMotivation] = useState('');

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form states - Registro directo
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAlias, setRegAlias] = useState('');
  const [regTargetGroupId, setRegTargetGroupId] = useState('');

  // Si ya está autenticado, abrir en tab 'profile'
  useEffect(() => {
    if (currentMember) {
      setTab('profile');
    } else {
      setTab('request');
    }
  }, [currentMember]);

  // Cargar grupos para los selectores
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      safeFetchJson(`${API_BASE}/api/kingdom/groups`)
        .then(data => {
          if (Array.isArray(data)) setGroups(data);
        })
        .catch(console.error);
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

  // Enviar Solicitud de Acceso
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = {
        alias: reqAlias.trim(),
        email: reqEmail.trim(),
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

      setSuccessMsg('Tu solicitud ha sido entregada a la Casa con reverencia. La Administración evaluará tu expediente y recibirás respuesta formal.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Enviar Login de Miembro
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

  // Enviar Registro Directo
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        email: regEmail.trim(),
        password: regPassword,
        alias: regAlias.trim(),
        targetGroupId: regTargetGroupId || null
      };

      const res = await fetch(`${API_BASE}/api/kingdom/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el registro');

      localStorage.setItem('yakuza_member_token', data.token);
      onAuthSuccess?.(data.member, data.token);
      setTab('profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Pestañas de navegación interna */}
        {!currentMember && (
          <div className="flex border-b border-gray-800 bg-dark-950/50 px-4 pt-2 gap-2 text-xs font-mono">
            <button
              onClick={() => { setTab('request'); setError(''); setSuccessMsg(''); }}
              className={`py-2 px-3 border-b-2 font-bold transition-all ${
                tab === 'request'
                  ? 'border-gold-400 text-gold-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              1. Solicitar Admisión
            </button>
            <button
              onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
              className={`py-2 px-3 border-b-2 font-bold transition-all ${
                tab === 'login'
                  ? 'border-gold-400 text-gold-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              2. Acceso Miembros
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setSuccessMsg(''); }}
              className={`py-2 px-3 border-b-2 font-bold transition-all ${
                tab === 'register'
                  ? 'border-gold-400 text-gold-300'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              3. Registro Directo
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

          {successMsg && (
            <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-gold-400 mx-auto" />
              <p className="font-serif text-sm font-semibold">{successMsg}</p>
              <button
                onClick={onClose}
                className="mt-3 py-1.5 px-5 rounded-lg bg-gold-500 text-dark-950 font-bold uppercase tracking-wider text-[11px]"
              >
                Entendido
              </button>
            </div>
          )}

          {/* TAB 1: FORMULARIO DE ADMISIÓN / SOLICITUD */}
          {tab === 'request' && !successMsg && (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <p className="text-gray-300 italic font-serif leading-relaxed">
                “El acceso a mi energía no se compra: se conquista, se honra y se tributa con absoluta devoción. Completa este formulario formal para que Administración evalúe tu idoneidad.”
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

              <div className="pt-2 flex justify-end">
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
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto py-4">
              <div className="text-center space-y-1 mb-6">
                <Crown className="w-8 h-8 text-gold-400 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-white">Acceso a tu Ficha del Reino</h3>
                <p className="text-gray-400 text-xs">Introduce tus credenciales de súbdito consagrado.</p>
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
                className="w-full py-2.5 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Verificando...' : 'Entrar al Reino'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: REGISTRO DIRECTO */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-md mx-auto py-4">
              <div className="text-center space-y-1 mb-6">
                <UserPlus className="w-8 h-8 text-gold-400 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-white">Crear Cuenta de Devoto</h3>
                <p className="text-gray-400 text-xs">Crea tu identidad interna vinculada al escalafón inicial.</p>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">Alias deseado *</label>
                <input
                  type="text"
                  required
                  value={regAlias}
                  onChange={e => setRegAlias(e.target.value)}
                  placeholder="Ej: Devoto_Kael"
                  className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gold-400 uppercase mb-1">Estamento inicial</label>
                <select
                  value={regTargetGroupId}
                  onChange={e => setRegTargetGroupId(e.target.value)}
                  className="w-full bg-dark-950 border border-gray-800 focus:border-gold-500/50 rounded-lg p-2.5 text-white text-xs"
                >
                  <option value="">Por defecto: Plebeyos (Nivel 1)</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creando identidad...' : 'Registrar Cuenta'}</span>
              </button>
            </form>
          )}

          {/* TAB 4: PERFIL DE MIEMBRO AUTENTICADO */}
          {tab === 'profile' && currentMember && (
            <div className="space-y-5 py-2">
              <div className="p-4 rounded-xl bg-gradient-to-r from-bordeaux-700/30 to-dark-950 border border-gold-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-500/50 flex items-center justify-center text-gold-400 font-mono font-bold text-sm">
                    {currentMember.memberNumber || '#'}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">{currentMember.alias}</h3>
                    <p className="text-gold-400 text-xs font-mono">
                      {currentMember.group?.name || 'PLEBEYOS'} · {currentMember.position?.name || 'Aspirante'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold ${
                    currentMember.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {currentMember.status}
                  </span>
                </div>
              </div>

              {/* Progreso del devoto */}
              <div className="p-4 rounded-xl bg-dark-950 border border-gray-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-mono">Progreso Individual</span>
                  <span className="text-gold-400 font-bold font-mono">{currentMember.overallProgress || 0}% ({currentMember.experiencePoints || 0} XP)</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-bordeaux-500 to-gold-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, currentMember.overallProgress || 0)}%` }}
                  />
                </div>
              </div>

              {/* Botón de cierre de sesión */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    localStorage.removeItem('yakuza_member_token');
                    onLogout?.();
                    setTab('request');
                  }}
                  className="py-2 px-4 rounded-lg border border-crimson-500/30 text-crimson-400 hover:bg-crimson-600/10 text-xs font-mono"
                >
                  Cerrar Sesión de Miembro
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
