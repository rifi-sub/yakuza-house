import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Crown, Search, Bell, Edit3, Calendar, Gift, Target, Award,
  Sparkles, CheckCircle2, Clock, AlertTriangle, ChevronRight,
  TrendingUp, Trash2, Plus, Star, ShieldCheck, Heart, Zap,
  Flame, Lock, Layers, Settings, Eye, Check, RefreshCw
} from 'lucide-react';
import { API_BASE } from '../../config';

export function MemberCrmModal({ 
  memberId, 
  token, 
  onClose, 
  onRefreshList, 
  allGroups = [], 
  allMembers = [],
  onSelectMember 
}) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activitiesLibrary, setActivitiesLibrary] = useState([]);
  const [notesFilter, setNotesFilter] = useState('internal'); // 'internal' | 'next_steps'
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Modals for editing / actions
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // Training designer state (dropdown selections)
  const [selectedTrainingItems, setSelectedTrainingItems] = useState({
    task: '',
    ritual: '',
    punishment: '',
    reward: '',
    privilege: '',
    goal: '',
    special: ''
  });
  const [assigningTraining, setAssigningTraining] = useState(false);

  // Edit Profile Form
  const [profileForm, setProfileForm] = useState({
    alias: '',
    internalName: '',
    memberNumber: '',
    status: 'ACTIVE',
    overallProgress: 68,
    experiencePoints: 680,
    servedSince: '14 Feb 2024',
    initialTribute: '€500',
    currentRank: 'Aprendiz',
    targetRank: 'Servidor Elite',
    quote: 'Para servirte, existo.',
    preferences: 'Sumisión, disciplina, humillación...',
    fetishes: 'Pies, lencería, control mental...',
    triggers: 'Desobediencia, tono duro...',
    limits: 'Sangre, daño permanente...',
    aftercare: 'Validación, palabras suaves...',
    personalGoals: 'Alcanzar nivel Elite...'
  });

  // Add Skill Form
  const [skillForm, setSkillForm] = useState({
    skillCategory: 'VIDEO_EDITING',
    skillName: '',
    level: 'ADVANCED',
    notes: ''
  });

  // New Activity Form
  const [newActivityForm, setNewActivityForm] = useState({
    title: '',
    type: 'TASK',
    status: 'ACTIVE',
    dueDate: '2025-04-20',
    priority: 'Alta',
    pointsAwarded: 25,
    customInstructions: ''
  });

  // Add Note Form
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState('internal');

  // Checklists states (Requirements)
  const [specialReqs, setSpecialReqs] = useState({
    tributo_minimo: true,
    informe_semanal: true,
    rituales_asignados: false,
    comunicacion_activa: true
  });

  const [generalReqs, setGeneralReqs] = useState({
    perfil_verificado: true,
    aceptacion_normas: true,
    tributo_inicial: true,
    respeto_absoluto: true,
    discrecion_confidencialidad: true
  });

  // Fetch Member Details
  const fetchMemberDetail = async (idToFetch = memberId) => {
    if (!idToFetch) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${idToFetch}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMember(data);
        
        let parsedPrefs = {};
        if (data.preferences) {
          try {
            parsedPrefs = typeof data.preferences === 'string' ? JSON.parse(data.preferences) : data.preferences;
          } catch (err) {
            parsedPrefs = { preferences: data.preferences };
          }
        }

        setProfileForm({
          alias: data.alias || 'predevoto',
          internalName: data.internalName || 'Reino de la Devoción',
          memberNumber: data.memberNumber || '#017',
          status: data.status || 'ACTIVE',
          overallProgress: data.overallProgress !== undefined ? data.overallProgress : 68,
          experiencePoints: data.experiencePoints || 680,
          servedSince: parsedPrefs.servedSince || '14 Feb 2024',
          initialTribute: parsedPrefs.initialTribute || '€500',
          currentRank: parsedPrefs.currentRank || data.position?.name || 'Aprendiz',
          targetRank: parsedPrefs.targetRank || 'Servidor Elite',
          quote: parsedPrefs.quote || 'Para servirte, existo.',
          preferences: parsedPrefs.preferences || 'Sumisión, disciplina, humillación...',
          fetishes: parsedPrefs.fetishes || 'Pies, lencería, control mental...',
          triggers: parsedPrefs.triggers || 'Desobediencia, tono duro...',
          limits: parsedPrefs.limits || 'Sangre, daño permanente...',
          aftercare: parsedPrefs.aftercare || 'Validación, palabras suaves...',
          personalGoals: parsedPrefs.personalGoals || data.personalGoals || 'Alcanzar nivel Elite...'
        });
      }
    } catch (e) {
      console.error('Error fetching member details:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Central Activity Library
  const fetchActivityLibrary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/library`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setActivitiesLibrary(data);
      }
    } catch (e) {
      console.error('Error fetching library:', e);
    }
  };

  useEffect(() => {
    fetchMemberDetail();
    fetchActivityLibrary();
  }, [memberId]);

  // Derived parsed preferences
  const currentPrefs = useMemo(() => {
    if (!member) return profileForm;
    try {
      if (typeof member.preferences === 'string') {
        return { ...profileForm, ...JSON.parse(member.preferences) };
      }
      return { ...profileForm, ...(member.preferences || {}) };
    } catch (e) {
      return profileForm;
    }
  }, [member, profileForm]);

  // Filter library by type
  const libraryByType = useMemo(() => {
    const map = {
      TASK: [],
      RITUAL: [],
      PUNISHMENT: [],
      REWARD: [],
      PRIVILEGE: [],
      GOAL: [],
      SPECIAL_EVENT: []
    };
    activitiesLibrary.forEach(item => {
      const type = (item.type || '').toUpperCase();
      if (map[type]) {
        map[type].push(item);
      } else if (type === 'TRAINING') {
        map.TASK.push(item);
      } else if (type === 'SPECIAL_ACTIVITY') {
        map.SPECIAL_EVENT.push(item);
      }
    });
    return map;
  }, [activitiesLibrary]);

  // Handle Training Designer Assignment from Dropdowns
  const handleAddSelectedTraining = async () => {
    const selectedKey = Object.keys(selectedTrainingItems).find(k => selectedTrainingItems[k]);
    if (!selectedKey) {
      alert('Por favor selecciona al menos una actividad de uno de los desplegables para añadir al entrenamiento.');
      return;
    }

    const templateId = selectedTrainingItems[selectedKey];
    const template = activitiesLibrary.find(t => t.id === templateId);
    if (!template) return;

    setAssigningTraining(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          memberIds: [member.id],
          templateId: template.id,
          title: template.title,
          type: template.type,
          dueDays: template.defaultDurationDays || 3,
          pointsAwarded: template.pointsValue || 15,
          customInstructions: 'PRIORITY:HIGH'
        })
      });

      if (!res.ok) throw new Error('Error al asignar actividad');
      
      setSelectedTrainingItems({
        task: '',
        ritual: '',
        punishment: '',
        reward: '',
        privilege: '',
        goal: '',
        special: ''
      });

      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigningTraining(false);
    }
  };

  // Handle deleting assigned activity
  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('¿Eliminar esta actividad asignada?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle completing assigned activity
  const handleCompleteAssignment = async (assignmentId) => {
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'COMPLETED_ON_TIME',
          adminFeedback: 'Completado con éxito'
        })
      });
      if (!res.ok) throw new Error('Error al completar');
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle adding new custom activity
  const handleCreateCustomActivity = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          memberIds: [member.id],
          title: newActivityForm.title,
          type: newActivityForm.type,
          status: newActivityForm.status,
          dueDate: newActivityForm.dueDate,
          pointsAwarded: newActivityForm.pointsAwarded,
          customInstructions: `PRIORITY:${newActivityForm.priority === 'Alta' ? 'HIGH' : newActivityForm.priority === 'Media' ? 'MEDIUM' : 'LOW'}`
        })
      });
      if (!res.ok) throw new Error('Error al crear actividad');
      setShowNewActivityModal(false);
      setNewActivityForm({
        title: '',
        type: 'TASK',
        status: 'ACTIVE',
        dueDate: '2025-04-20',
        priority: 'Alta',
        pointsAwarded: 25,
        customInstructions: ''
      });
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle adding new skill
  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${member.id}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(skillForm)
      });
      if (!res.ok) throw new Error('Error al añadir habilidad');
      setShowAddSkill(false);
      setSkillForm({ skillCategory: 'VIDEO_EDITING', skillName: '', level: 'ADVANCED', notes: '' });
      fetchMemberDetail();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle deleting skill
  const handleDeleteSkill = async (skillId) => {
    if (!confirm('¿Eliminar esta habilidad laboral?')) return;
    try {
      await fetch(`${API_BASE}/api/kingdom/admin/members/${member.id}/skills/${skillId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMemberDetail();
    } catch (err) {
      alert('Error al eliminar habilidad');
    }
  };

  // Handle adding note
  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    try {
      const notePrefix = newNoteType === 'next_steps' ? '[PRÓXIMOS PASOS] ' : '';
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${member.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ note: `${notePrefix}${newNoteText.trim()}` })
      });
      if (!res.ok) throw new Error('Error al guardar nota');
      setNewNoteText('');
      setShowAddNoteModal(false);
      fetchMemberDetail();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle deleting note
  const handleDeleteNote = async (noteId) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    try {
      await fetch(`${API_BASE}/api/kingdom/admin/members/${member.id}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMemberDetail();
    } catch (err) {
      alert('Error al eliminar nota');
    }
  };

  // Handle profile update submit
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const prefsPayload = {
        servedSince: profileForm.servedSince,
        initialTribute: profileForm.initialTribute,
        currentRank: profileForm.currentRank,
        targetRank: profileForm.targetRank,
        quote: profileForm.quote,
        preferences: profileForm.preferences,
        fetishes: profileForm.fetishes,
        triggers: profileForm.triggers,
        limits: profileForm.limits,
        aftercare: profileForm.aftercare,
        personalGoals: profileForm.personalGoals
      };

      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          alias: profileForm.alias,
          internalName: profileForm.internalName,
          memberNumber: profileForm.memberNumber,
          status: profileForm.status,
          overallProgress: parseFloat(profileForm.overallProgress || 68),
          experiencePoints: parseInt(profileForm.experiencePoints || 680, 10),
          personalGoals: profileForm.personalGoals,
          preferences: JSON.stringify(prefsPayload)
        })
      });

      if (!res.ok) throw new Error('Error actualizando perfil');
      setShowEditProfile(false);
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      alert(err.message);
    }
  };

  // Search filter members
  const filteredSearchMembers = useMemo(() => {
    if (!searchMemberQuery.trim()) return [];
    return allMembers.filter(m => 
      (m.alias || '').toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      (m.memberNumber || '').toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      (m.internalName || '').toLowerCase().includes(searchMemberQuery.toLowerCase())
    ).slice(0, 5);
  }, [allMembers, searchMemberQuery]);

  // Skill dot render helper
  const renderSkillDots = (level) => {
    let count = 3;
    if (level === 'BASIC') count = 2;
    if (level === 'INTERMEDIATE') count = 3;
    if (level === 'ADVANCED') count = 4;
    if (level === 'EXPERT') count = 5;

    return (
      <div className="flex items-center gap-1 text-[13px]">
        {[1, 2, 3, 4, 5].map(i => (
          <span 
            key={i} 
            className={`inline-block w-2.5 h-2.5 rounded-full ${i <= count ? 'bg-[#c5a059]' : 'bg-[#3a282f]'}`}
          />
        ))}
      </div>
    );
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Filter notes by category
  const displayedNotes = useMemo(() => {
    const rawNotes = member?.notes || [];
    if (notesFilter === 'next_steps') {
      return rawNotes.filter(n => (n.note || '').includes('[PRÓXIMOS PASOS]'));
    }
    return rawNotes.filter(n => !(n.note || '').includes('[PRÓXIMOS PASOS]'));
  }, [member?.notes, notesFilter]);

  // Sorted assignments matching exact reference table
  const sortedAssignments = useMemo(() => {
    if (!member?.assignments) return [];
    return [...member.assignments].sort((a, b) => {
      // Prioritize the 5 mockup items in order
      const order = [
        'Enviar tributo semanal',
        'Ritual de humildad',
        'Informe diario de obediencia',
        'Castigo: Sin privilegios',
        'Sesión de servicio virtual'
      ];
      const idxA = order.indexOf(a.title);
      const idxB = order.indexOf(b.title);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }, [member?.assignments]);

  if (!memberId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#050304]/95 backdrop-blur-xl p-2 sm:p-4 md:p-6 transition-all duration-300">
      
      {/* Container simulating high density editorial single canvas */}
      <div className="relative w-full max-w-[1380px] bg-[#0a0709] border border-[#3e1b24] shadow-2xl rounded-2xl text-[#f3e8d9] overflow-hidden my-auto">
        
        {/* Atmospheric ambient glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-[#6a1528]/20 via-[#4a0e1b]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-[#6a1528]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

        {/* ========================================================================= */}
        {/* TOP BANNER: DOMINIUM HEADER & PHILOSOPHY ("Referencia funcional · Perfil del sumiso") */}
        {/* ========================================================================= */}
        <div className="relative px-6 py-4 border-b border-[#2d141b] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0d090c]">
          
          {/* Brand Seal */}
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-[#c9a227]" />
            <div>
              <h1 className="font-brand font-bold text-base tracking-[0.25em] text-[#e5c158] uppercase">
                DOMINIUM
              </h1>
              <p className="text-[9px] font-mono tracking-[0.3em] text-[#9a8677] uppercase -mt-0.5">
                DISCIPLINA · BELLEZA · LEALTAD
              </p>
            </div>
          </div>

          {/* Central Title */}
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-brand font-bold text-[#faf3e8] tracking-wide">
              Referencia funcional · Perfil del sumiso
            </h2>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="h-px w-8 bg-[#5f4717]/60" />
              <p className="text-[11px] font-serif italic text-[#c5a059] tracking-wider">
                Vista única sin pestañas · todo visible por apartados
              </p>
              <span className="h-px w-8 bg-[#5f4717]/60" />
            </div>
          </div>

          {/* Luxury Quote + Close Button */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:block text-right">
              <p className="font-serif italic text-xs text-[#d9cdaf]">
                “Un buen diseño también es una forma de Dominio.”
              </p>
              <p className="text-[10px] font-mono text-[#8c6a2f] tracking-widest uppercase mt-0.5">
                — DOMINIUM
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1c1116] border border-[#44222b] text-[#c5a059] hover:text-white hover:bg-[#341620] hover:border-[#c9a227] transition-all"
              title="Cerrar vista"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INNER CONTAINER HEADER: "Perfil del sumiso" / Tools / Admin Avatar */}
        {/* ========================================================================= */}
        <div className="px-6 py-3.5 bg-[#0e0a0d] border-b border-[#2d141b] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-brand font-bold text-white tracking-wide">
              Perfil del sumiso
            </h3>
            <p className="text-[10px] font-mono tracking-widest text-[#8e8073] uppercase">
              GESTIÓN COMPLETA DEL SUMISO
            </p>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Search Input */}
            <div className="relative">
              <div className="flex items-center bg-[#130d11] border border-[#3e1e27] focus-within:border-[#c5a059] rounded-full px-3 py-1.5 text-xs text-[#e5c158] transition-all w-52 sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#8e8073] mr-2" />
                <input
                  type="text"
                  placeholder="Buscar sumiso..."
                  value={searchMemberQuery}
                  onChange={(e) => {
                    setSearchMemberQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="bg-transparent border-none text-xs text-[#f3e8d9] focus:outline-none placeholder-[#6b5e54] w-full"
                />
              </div>

              {/* Search dropdown results */}
              {showSearchDropdown && filteredSearchMembers.length > 0 && (
                <div className="absolute top-full mt-1 right-0 w-72 bg-[#140c11] border border-[#5a2735] rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
                  {filteredSearchMembers.map(sm => (
                    <button
                      key={sm.id}
                      onClick={() => {
                        if (onSelectMember) onSelectMember(sm.id);
                        fetchMemberDetail(sm.id);
                        setShowSearchDropdown(false);
                        setSearchMemberQuery('');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#2c131c] flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-mono text-[#c5a059] font-bold mr-2">{sm.memberNumber}</span>
                        <span className="font-brand text-white">{sm.alias}</span>
                      </div>
                      <span className="text-[10px] text-[#8e8073] font-mono">{sm.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button className="p-2 rounded-full bg-[#130d11] border border-[#3e1e27] text-[#c5a059] hover:text-white hover:bg-[#2a131b] transition-all">
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* Admin Avatar Chip */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#2e171f]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6a1528] to-[#c9a227] p-0.5">
                <div className="w-full h-full rounded-full bg-[#0d090c] flex items-center justify-center overflow-hidden">
                  <span className="font-brand font-bold text-xs text-[#e5c158]">D</span>
                </div>
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <span className="text-xs font-brand font-bold text-white block">Dominatrix</span>
                <span className="text-[10px] font-mono text-[#c5a059] block">Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: VISTA ÚNICA SIN PESTAÑAS (SCROLLABLE HIGH DENSITY GRID) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto custom-scrollbar">

          {/* --------------------------------------------------------------------- */}
          {/* ROW 1: BOCADILLOS 2 & 3 - CABECERA RÁPIDA & RESUMEN FINANCIERO */}
          {/* --------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* BOCADILLO 2: CABECERA RÁPIDA (col-span-7) */}
            <div className="lg:col-span-7 bg-[#110b0e] border border-[#3c1b24] rounded-xl p-4 sm:p-5 relative flex flex-col sm:flex-row gap-5 shadow-lg">
              
              {/* Edit Profile Button */}
              <button
                onClick={() => setShowEditProfile(true)}
                className="absolute top-4 right-4 py-1.5 px-3 rounded-lg bg-[#1a0f14] border border-[#5c2a38] text-[#e5c158] hover:bg-[#2c131d] hover:border-[#c5a059] text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar perfil
              </button>

              {/* Submissive Portrait */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-[#5a2735] flex-shrink-0 bg-[#090507] shadow-inner relative group">
                <img 
                  src="/dominium_sub_avatar.jpg" 
                  alt={currentPrefs.alias || 'Submisive'} 
                  className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Info & Metrics Details */}
              <div className="flex-1 space-y-3 pt-1">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-brand font-bold text-[#faf3e8]">
                      {currentPrefs.memberNumber} / {currentPrefs.internalName}
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-[#c5a059] mt-0.5 flex items-center gap-1">
                    <span>👤</span> @{currentPrefs.alias}
                  </p>
                  <p className="text-xs font-serif italic text-[#c2b29f] mt-1">
                    "{currentPrefs.quote}"
                  </p>
                </div>

                {/* 2-Column Metadata Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-[#2d141b] text-xs">
                  {/* Col 1 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[#8e8073]">
                      <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="text-[11px] font-mono">Sirve desde</span>
                    </div>
                    <p className="font-brand font-semibold text-white pl-5 text-[13px]">
                      {currentPrefs.servedSince}
                    </p>

                    <div className="flex items-center gap-2 text-[#8e8073] pt-1">
                      <Gift className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="text-[11px] font-mono">Tributo inicial</span>
                    </div>
                    <p className="font-brand font-semibold text-white pl-5 text-[13px]">
                      {currentPrefs.initialTribute}
                    </p>
                  </div>

                  {/* Col 2 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[#8e8073]">
                      <Crown className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="text-[11px] font-mono">Puesto actual</span>
                    </div>
                    <p className="font-brand font-semibold text-[#e5c158] pl-5 text-[13px]">
                      {currentPrefs.currentRank}
                    </p>

                    <div className="flex items-center gap-2 text-[#8e8073] pt-1">
                      <Target className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="text-[11px] font-mono">Puesto objetivo</span>
                    </div>
                    <p className="font-brand font-semibold text-white pl-5 text-[13px]">
                      {currentPrefs.targetRank}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BOCADILLO 3: RESUMEN FINANCIERO (col-span-5) */}
            <div className="lg:col-span-5 bg-[#110b0e] border border-[#3c1b24] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
              
              {/* 3 Metric Cards in a Row */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Metric 1 */}
                <div className="bg-[#180f14] border border-[#3a1922] rounded-lg p-2.5 text-center">
                  <span className="text-[10px] font-mono text-[#9e8f82] block truncate">
                    Ingresado este mes
                  </span>
                  <span className="text-base sm:text-lg font-sans font-bold text-white mt-1 block">
                    €1,250
                  </span>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#180f14] border border-[#3a1922] rounded-lg p-2.5 text-center">
                  <span className="text-[10px] font-mono text-[#9e8f82] block truncate">
                    Ingresado mes pasado
                  </span>
                  <span className="text-base sm:text-lg font-sans font-bold text-white mt-1 block">
                    €980
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="bg-[#180f14] border border-[#3a1922] rounded-lg p-2.5 text-center">
                  <span className="text-[10px] font-mono text-[#9e8f82] block truncate">
                    Regalos / compras
                  </span>
                  <span className="text-base sm:text-lg font-sans font-bold text-white mt-1 block">
                    €340
                  </span>
                </div>
              </div>

              {/* Bottom Row with 3 Status Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#2d141b] mt-3">
                {/* Subscripción Activa */}
                <div>
                  <span className="text-[10px] font-mono text-[#9e8f82] block">Suscripción activa</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Crown className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span className="text-xs font-brand font-bold text-[#e5c158]">
                      Oro Mensual
                    </span>
                  </div>
                </div>

                {/* Estado del Perfil */}
                <div>
                  <span className="text-[10px] font-mono text-[#9e8f82] block">Estado del perfil</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      Activo
                    </span>
                  </div>
                </div>

                {/* Progreso General */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-[#9e8f82]">Progreso general</span>
                    <span className="text-[#c5a059] font-bold">{currentPrefs.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-[#1b1016] rounded-full h-1.5 overflow-hidden border border-[#3a1922]">
                    <div 
                      className="bg-gradient-to-r from-[#9c2b3e] to-[#e8c96a] h-full rounded-full" 
                      style={{ width: `${currentPrefs.overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* ROW 2: BOCADILLO 4 - TIRA DE ETIQUETAS HORIZONTAL (FULL WIDTH) */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-[#110b0e] border border-[#3c1b24] rounded-xl p-3.5 shadow-md flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-2 sm:gap-3 text-xs flex-nowrap w-full">
              
              {/* Pill 1: Preferencias */}
              <div className="flex items-center gap-2 bg-[#180f14] border border-[#3c1b24] px-3 py-1.5 rounded-full whitespace-nowrap">
                <Heart className="w-3.5 h-3.5 text-crimson-400" />
                <span className="font-mono font-bold text-[#c5a059]">Preferencias:</span>
                <span className="text-[#dcd3c8] truncate max-w-[160px]">{currentPrefs.preferences}</span>
              </div>

              {/* Pill 2: Fetiches */}
              <div className="flex items-center gap-2 bg-[#180f14] border border-[#3c1b24] px-3 py-1.5 rounded-full whitespace-nowrap">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono font-bold text-[#c5a059]">Fetiches:</span>
                <span className="text-[#dcd3c8] truncate max-w-[160px]">{currentPrefs.fetishes}</span>
              </div>

              {/* Pill 3: Triggers */}
              <div className="flex items-center gap-2 bg-[#180f14] border border-[#3c1b24] px-3 py-1.5 rounded-full whitespace-nowrap">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="font-mono font-bold text-[#c5a059]">Triggers:</span>
                <span className="text-[#dcd3c8] truncate max-w-[160px]">{currentPrefs.triggers}</span>
              </div>

              {/* Pill 4: Límites */}
              <div className="flex items-center gap-2 bg-[#180f14] border border-[#3c1b24] px-3 py-1.5 rounded-full whitespace-nowrap">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-mono font-bold text-[#c5a059]">Límites:</span>
                <span className="text-[#dcd3c8] truncate max-w-[160px]">{currentPrefs.limits}</span>
              </div>

              {/* Pill 5: Aftercare */}
              <div className="flex items-center gap-2 bg-[#180f14] border border-[#3c1b24] px-3 py-1.5 rounded-full whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span className="font-mono font-bold text-[#c5a059]">Aftercare:</span>
                <span className="text-[#dcd3c8] truncate max-w-[160px]">{currentPrefs.aftercare}</span>
              </div>

              {/* Pill 6: Objetivos personales */}
              <div className="flex items-center gap-2 bg-[#180f14] border border-[#3c1b24] px-3 py-1.5 rounded-full whitespace-nowrap">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono font-bold text-[#c5a059]">Objetivos personales:</span>
                <span className="text-[#dcd3c8] truncate max-w-[160px]">{currentPrefs.personalGoals}</span>
              </div>
            </div>

            <button 
              onClick={() => setShowEditProfile(true)}
              className="text-[11px] font-mono text-[#c5a059] hover:underline whitespace-nowrap pl-2"
            >
              Editar
            </button>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* ROW 3: BOCADILLO 5 - PROGRESO Y MÉRITOS + ÚLTIMA ACTIVIDAD + CITA */}
          {/* --------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: Progreso y méritos (col-span-6) */}
            <div className="lg:col-span-6 bg-[#110b0e] border border-[#3c1b24] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#2d141b]">
                  <h4 className="font-brand font-bold text-sm text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#c5a059]" />
                    Progreso y méritos
                  </h4>
                  <button 
                    onClick={() => alert('Abriendo diario de evolución...')}
                    className="text-xs font-mono text-[#c5a059] hover:underline flex items-center gap-1"
                  >
                    Ver diario completo →
                  </button>
                </div>

                {/* Progress Arc & Goal Info */}
                <div className="flex items-center gap-5 py-4">
                  {/* Circular Gauge */}
                  <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="#25141c"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="url(#progressGrad)"
                        strokeWidth="6"
                        strokeDasharray={213}
                        strokeDashoffset={213 - (213 * (currentPrefs.overallProgress || 68)) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                      <defs>
                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#9c2b3e" />
                          <stop offset="100%" stopColor="#e8c96a" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute font-sans font-bold text-sm text-[#faf3e8]">
                      {currentPrefs.overallProgress || 68}%
                    </span>
                  </div>

                  {/* Goal details */}
                  <div className="flex-1 space-y-1">
                    <h5 className="font-brand font-bold text-base text-white">
                      Camino a {currentPrefs.targetRank}
                    </h5>
                    <p className="text-xs font-serif italic text-[#a39485]">
                      Disciplina. Constancia. Evolución.
                    </p>
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] font-mono text-[#8e8073] mb-1">
                        <span>Progreso hacia ascenso</span>
                        <span className="text-[#c5a059] font-bold">680 / 1,000 puntos</span>
                      </div>
                      <div className="w-full bg-[#1c1016] rounded-full h-2 overflow-hidden border border-[#3e1e27]">
                        <div 
                          className="bg-gradient-to-r from-[#7a1225] via-[#c9a227] to-[#f7e08b] h-full rounded-full" 
                          style={{ width: '68%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Metric Boxes in Grid */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#2d141b]">
                <div className="bg-[#180f14] border border-[#381921] rounded-lg p-2 text-center">
                  <Crown className="w-3.5 h-3.5 text-[#c5a059] mx-auto mb-1" />
                  <span className="text-[9px] font-mono text-[#8e8073] block truncate">Méritos totales</span>
                  <span className="text-xs sm:text-sm font-sans font-bold text-white">{currentPrefs.experiencePoints || 680}</span>
                </div>

                <div className="bg-[#180f14] border border-[#381921] rounded-lg p-2 text-center">
                  <Star className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                  <span className="text-[9px] font-mono text-[#8e8073] block truncate">Rituales</span>
                  <span className="text-xs sm:text-sm font-sans font-bold text-white">12</span>
                </div>

                <div className="bg-[#180f14] border border-[#381921] rounded-lg p-2 text-center">
                  <Award className="w-3.5 h-3.5 text-rose-400 mx-auto mb-1" />
                  <span className="text-[9px] font-mono text-[#8e8073] block truncate">Entrenamientos</span>
                  <span className="text-xs sm:text-sm font-sans font-bold text-white">8</span>
                </div>

                <div className="bg-[#180f14] border border-[#381921] rounded-lg p-2 text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[9px] font-mono text-[#8e8073] block truncate">Ascensos</span>
                  <span className="text-xs sm:text-sm font-sans font-bold text-white">2</span>
                </div>
              </div>
            </div>

            {/* Right: Última actividad + Cita Decorativa (col-span-6) */}
            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Timeline Card */}
              <div className="bg-[#110b0e] border border-[#3c1b24] rounded-xl p-4 shadow-lg flex flex-col justify-between">
                <h4 className="font-brand font-bold text-sm text-white flex items-center gap-2 pb-2.5 border-b border-[#2d141b]">
                  <Clock className="w-4 h-4 text-[#c5a059]" />
                  Última actividad
                </h4>

                <div className="space-y-3 pt-2 text-xs font-mono relative before:absolute before:left-2 before:top-3 before:bottom-3 before:w-px before:bg-[#3d1c25]">
                  {/* Timeline 1 */}
                  <div className="flex items-start gap-3 pl-1 relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] border-2 border-[#110b0e] mt-1 flex-shrink-0 z-10" />
                    <div>
                      <span className="text-[10px] text-[#8e8073] block">15 Abr 2025</span>
                      <p className="font-sans font-bold text-white text-[11px]">Ritual completado</p>
                      <p className="text-[10px] text-[#c2b29f]">Ritual de silencio - Nivel II</p>
                    </div>
                  </div>

                  {/* Timeline 2 */}
                  <div className="flex items-start gap-3 pl-1 relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-crimson-400 border-2 border-[#110b0e] mt-1 flex-shrink-0 z-10" />
                    <div>
                      <span className="text-[10px] text-[#8e8073] block">10 Abr 2025</span>
                      <p className="font-sans font-bold text-white text-[11px]">Entrenamiento activado</p>
                      <p className="text-[10px] text-[#c2b29f]">Programa de obediencia mental</p>
                    </div>
                  </div>

                  {/* Timeline 3 */}
                  <div className="flex items-start gap-3 pl-1 relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[#110b0e] mt-1 flex-shrink-0 z-10" />
                    <div>
                      <span className="text-[10px] text-[#8e8073] block">02 Abr 2025</span>
                      <p className="font-sans font-bold text-white text-[11px]">Ascenso a nivel Aprendiz</p>
                      <p className="text-[10px] text-[#c2b29f]">Por constancia y entrega</p>
                    </div>
                  </div>

                  {/* Timeline 4 */}
                  <div className="flex items-start gap-3 pl-1 relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#110b0e] mt-1 flex-shrink-0 z-10" />
                    <div>
                      <span className="text-[10px] text-[#8e8073] block">14 Feb 2024</span>
                      <p className="font-sans font-bold text-white text-[11px]">Tributo inicial completado</p>
                      <p className="text-[10px] text-[#c2b29f]">Bienvenido al Reino</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Quote Card with Dark Roses Wallpaper */}
              <div className="relative rounded-xl overflow-hidden border border-[#5a2735] p-5 flex flex-col justify-between shadow-lg bg-[#140a10]">
                <img 
                  src="/dominium_dark_roses.jpg" 
                  alt="Velvet Roses" 
                  className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity filter contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e060a] via-[#1a070f]/70 to-[#0e060a]/90" />
                
                <div className="relative z-10">
                  <Crown className="w-5 h-5 text-[#c5a059] mb-2" />
                </div>

                <div className="relative z-10 my-auto text-center py-4">
                  <p className="font-serif italic text-base sm:text-lg text-[#faf3e8] leading-relaxed drop-shadow-md">
                    “Un sumiso disciplinado es un tesoro eterno.”
                  </p>
                  <p className="text-[10px] font-mono text-[#c5a059] tracking-[0.3em] uppercase mt-2">
                    — DOMINIUM
                  </p>
                </div>

                <div className="relative z-10 flex justify-end">
                  <span className="text-[9px] font-mono text-[#8c6a2f] uppercase tracking-widest">
                    DECRETO SUPREMO
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* ROW 4: BOCADILLOS 6, 7 & 12 - DISEÑO DE ENTRENAMIENTO & ACTIVIDADES */}
          {/* --------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* BOCADILLO 6: DISEÑO DE ENTRENAMIENTO DESDE DESPLEGABLES (col-span-5) */}
            <div className="lg:col-span-5 bg-[#110b0e] border border-[#3c1b24] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-[#2d141b]">
                  <h4 className="font-brand font-bold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c5a059]" />
                    Diseño de entrenamiento
                  </h4>
                  <p className="text-[11px] font-mono text-[#8e8073] mt-0.5">
                    Selecciona actividades del sistema para asignar al sumiso.
                  </p>
                </div>

                {/* Dropdowns Grid (7 categories from library) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3">
                  
                  {/* Tareas */}
                  <div>
                    <label className="block text-[10px] font-mono text-[#c5a059] mb-1">Tareas</label>
                    <select
                      value={selectedTrainingItems.task}
                      onChange={e => setSelectedTrainingItems({ ...selectedTrainingItems, task: e.target.value })}
                      className="w-full bg-[#160e13] border border-[#381921] rounded-lg px-2.5 py-1.5 text-xs text-[#f3e8d9] focus:border-[#c5a059]"
                    >
                      <option value="">Seleccionar...</option>
                      {libraryByType.TASK.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rituales */}
                  <div>
                    <label className="block text-[10px] font-mono text-[#c5a059] mb-1">Rituales</label>
                    <select
                      value={selectedTrainingItems.ritual}
                      onChange={e => setSelectedTrainingItems({ ...selectedTrainingItems, ritual: e.target.value })}
                      className="w-full bg-[#160e13] border border-[#381921] rounded-lg px-2.5 py-1.5 text-xs text-[#f3e8d9] focus:border-[#c5a059]"
                    >
                      <option value="">Seleccionar...</option>
                      {libraryByType.RITUAL.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Castigos */}
                  <div>
                    <label className="block text-[10px] font-mono text-[#c5a059] mb-1">Castigos</label>
                    <select
                      value={selectedTrainingItems.punishment}
                      onChange={e => setSelectedTrainingItems({ ...selectedTrainingItems, punishment: e.target.value })}
                      className="w-full bg-[#160e13] border border-[#381921] rounded-lg px-2.5 py-1.5 text-xs text-[#f3e8d9] focus:border-[#c5a059]"
                    >
                      <option value="">Seleccionar...</option>
                      {libraryByType.PUNISHMENT.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Recompensas */}
                  <div>
                    <label className="block text-[10px] font-mono text-[#c5a059] mb-1">Recompensas</label>
                    <select
                      value={selectedTrainingItems.reward}
                      onChange={e => setSelectedTrainingItems({ ...selectedTrainingItems, reward: e.target.value })}
                      className="w-full bg-[#160e13] border border-[#381921] rounded-lg px-2.5 py-1.5 text-xs text-[#f3e8d9] focus:border-[#c5a059]"
                    >
                      <option value="">Seleccionar...</option>
                      {libraryByType.REWARD.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Privilegios */}
                  <div>
                    <label className="block text-[10px] font-mono text-[#c5a059] mb-1">Privilegios</label>
                    <select
                      value={selectedTrainingItems.privilege}
                      onChange={e => setSelectedTrainingItems({ ...selectedTrainingItems, privilege: e.target.value })}
                      className="w-full bg-[#160e13] border border-[#381921] rounded-lg px-2.5 py-1.5 text-xs text-[#f3e8d9] focus:border-[#c5a059]"
                    >
                      <option value="">Seleccionar...</option>
                      {libraryByType.PRIVILEGE.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Objetivos */}
                  <div>
                    <label className="block text-[10px] font-mono text-[#c5a059] mb-1">Objetivos</label>
                    <select
                      value={selectedTrainingItems.goal}
                      onChange={e => setSelectedTrainingItems({ ...selectedTrainingItems, goal: e.target.value })}
                      className="w-full bg-[#160e13] border border-[#381921] rounded-lg px-2.5 py-1.5 text-xs text-[#f3e8d9] focus:border-[#c5a059]"
                    >
                      <option value="">Seleccionar...</option>
                      {libraryByType.GOAL.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Actividades especiales (col-span-2) */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono text-[#c5a059] mb-1">Actividades especiales</label>
                    <select
                      value={selectedTrainingItems.special}
                      onChange={e => setSelectedTrainingItems({ ...selectedTrainingItems, special: e.target.value })}
                      className="w-full bg-[#160e13] border border-[#381921] rounded-lg px-2.5 py-1.5 text-xs text-[#f3e8d9] focus:border-[#c5a059]"
                    >
                      <option value="">Seleccionar...</option>
                      {libraryByType.SPECIAL_EVENT.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button: Añadir al entrenamiento */}
              <div className="pt-4 mt-3 border-t border-[#2d141b]">
                <button
                  disabled={assigningTraining}
                  onClick={handleAddSelectedTraining}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6a1528] to-[#4a0e1b] hover:from-[#7d1930] hover:to-[#5e1323] border border-[#c5a059]/40 text-[#f7e08b] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4" />
                  {assigningTraining ? 'Asignando...' : 'Añadir al entrenamiento'}
                </button>
              </div>
            </div>

            {/* BOCADILLO 7 & 12: ACTIVIDADES ASIGNADAS (col-span-7) */}
            <div className="lg:col-span-7 bg-[#110b0e] border border-[#3c1b24] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#2d141b]">
                  <h4 className="font-brand font-bold text-sm text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#c5a059]" />
                    Actividades asignadas
                  </h4>
                  <button
                    onClick={() => setShowNewActivityModal(true)}
                    className="py-1 px-3 rounded-lg bg-[#1a0f14] border border-[#5c2a38] text-[#e5c158] hover:bg-[#2c131d] text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nueva actividad
                  </button>
                </div>

                {/* Assigned Activities Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-[#8e8073] border-b border-[#2d141b] text-[10px]">
                        <th className="pb-2 font-normal">Actividad</th>
                        <th className="pb-2 font-normal">Tipo</th>
                        <th className="pb-2 font-normal">Estado</th>
                        <th className="pb-2 font-normal">Fecha límite</th>
                        <th className="pb-2 font-normal">Prioridad</th>
                        <th className="pb-2 font-normal text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#201118]">
                      {sortedAssignments.length > 0 ? (
                        sortedAssignments.map(a => {
                          const isCompleted = a.status.startsWith('COMPLETED');
                          const isOverdue = a.status === 'OVERDUE';
                          const isPending = a.status === 'PENDING' || a.status === 'ASSIGNED';
                          const isActive = a.status === 'ACTIVE' || (!isCompleted && !isOverdue && !isPending);

                          const isHigh = (a.customInstructions || '').includes('HIGH');
                          const isMed = (a.customInstructions || '').includes('MEDIUM');

                          return (
                            <tr key={a.id} className="hover:bg-[#180f14]/60 transition-colors">
                              <td className="py-2.5 pr-2 font-sans font-medium text-white text-[11px]">
                                {a.title}
                              </td>
                              <td className="py-2.5 pr-2 text-[#a39485] text-[10px]">
                                {a.type === 'TASK' ? 'Tarea' : a.type === 'RITUAL' ? 'Ritual' : a.type === 'PUNISHMENT' ? 'Castigo' : a.type === 'SPECIAL_EVENT' ? 'Actividad especial' : a.type}
                              </td>
                              <td className="py-2.5 pr-2">
                                {isCompleted ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-700/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    Completada
                                  </span>
                                ) : isOverdue ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-950/60 text-rose-300 border border-rose-700/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    Vencida
                                  </span>
                                ) : isPending ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/60 text-amber-300 border border-amber-700/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    Pendiente
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-700/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Activa
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 pr-2 text-[#c2b29f] text-[10px]">
                                {formatDate(a.dueDate)}
                              </td>
                              <td className="py-2.5 pr-2">
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  isHigh ? 'bg-[#3e131d] text-rose-300 border border-rose-800/40' :
                                  isMed ? 'bg-[#352511] text-amber-300 border border-amber-800/40' :
                                  'bg-[#1a202c] text-gray-300'
                                }`}>
                                  ★ {isHigh ? 'Alta' : isMed ? 'Media' : 'Baja'}
                                </span>
                              </td>
                              <td className="py-2.5 text-right space-x-1 whitespace-nowrap">
                                {!isCompleted && (
                                  <button
                                    onClick={() => handleCompleteAssignment(a.id)}
                                    title="Marcar completada"
                                    className="p-1 rounded text-emerald-400 hover:bg-emerald-950/40"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteAssignment(a.id)}
                                  title="Eliminar asignación"
                                  className="p-1 rounded text-[#8e8073] hover:text-rose-400 hover:bg-rose-950/40"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-6 text-center text-[#8e8073]">
                            No hay actividades asignadas. Utiliza los desplegables de la izquierda o pulsa "Nueva actividad".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* ROW 5: BOCADILLOS 8 & 9 - REQUISITOS/SUSCRIPCIONES & HABILIDADES */}
          {/* --------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* BOCADILLO 8: REQUISITOS Y SUSCRIPCIONES (col-span-6) */}
            <div className="lg:col-span-6 bg-[#110b0e] border border-[#3c1b24] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="font-brand font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-[#2d141b]">
                  <Crown className="w-4 h-4 text-[#c5a059]" />
                  Requisitos y suscripciones
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  
                  {/* Card 1: Suscripción activa */}
                  <div className="bg-[#180f14] border border-[#3a1922] rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <Crown className="w-5 h-5 text-[#c5a059] mb-1.5" />
                      <span className="text-[10px] font-mono text-[#8e8073] block">Suscripción activa</span>
                      <h5 className="font-brand font-bold text-sm text-white mt-0.5">
                        Oro Mensual
                      </h5>
                      <p className="text-xs font-mono text-[#c5a059] font-bold mt-1">
                        €100 / mes
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#29131a] mt-3">
                      <span className="text-[9px] font-mono text-[#8e8073] block">Renueva: 14 May 2025</span>
                    </div>
                  </div>

                  {/* Card 2: Requisitos especiales */}
                  <div className="bg-[#180f14] border border-[#3a1922] rounded-xl p-3">
                    <span className="text-[10px] font-mono text-[#c5a059] font-bold block mb-2">
                      Requisitos especiales
                    </span>
                    <div className="space-y-1.5 text-[11px] font-mono text-[#dcd3c8]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={specialReqs.tributo_minimo}
                          onChange={e => setSpecialReqs({ ...specialReqs, tributo_minimo: e.target.checked })}
                          className="rounded border-[#5a2735] text-[#c5a059] focus:ring-0"
                        />
                        <span>Tributo mensual mín.</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={specialReqs.informe_semanal}
                          onChange={e => setSpecialReqs({ ...specialReqs, informe_semanal: e.target.checked })}
                          className="rounded border-[#5a2735] text-[#c5a059] focus:ring-0"
                        />
                        <span>Informe semanal</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={specialReqs.rituales_asignados}
                          onChange={e => setSpecialReqs({ ...specialReqs, rituales_asignados: e.target.checked })}
                          className="rounded border-[#5a2735] text-[#c5a059] focus:ring-0"
                        />
                        <span>Participar rituales</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={specialReqs.comunicacion_activa}
                          onChange={e => setSpecialReqs({ ...specialReqs, comunicacion_activa: e.target.checked })}
                          className="rounded border-[#5a2735] text-[#c5a059] focus:ring-0"
                        />
                        <span>Comunicación activa</span>
                      </label>
                    </div>
                  </div>

                  {/* Card 3: Requisitos generales */}
                  <div className="bg-[#180f14] border border-[#3a1922] rounded-xl p-3">
                    <span className="text-[10px] font-mono text-[#c5a059] font-bold block mb-2">
                      Requisitos generales
                    </span>
                    <div className="space-y-1.5 text-[11px] font-mono text-[#dcd3c8]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={generalReqs.perfil_verificado}
                          onChange={e => setGeneralReqs({ ...generalReqs, perfil_verificado: e.target.checked })}
                          className="rounded border-[#5a2735] text-[#c5a059] focus:ring-0"
                        />
                        <span>Perfil verificado</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={generalReqs.aceptacion_normas}
                          onChange={e => setGeneralReqs({ ...generalReqs, aceptacion_normas: e.target.checked })}
                          className="rounded border-[#5a2735] text-[#c5a059] focus:ring-0"
                        />
                        <span>Normas aceptadas</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={generalReqs.tributo_inicial}
                          onChange={e => setGeneralReqs({ ...generalReqs, tributo_inicial: e.target.checked })}
                          className="rounded border-[#5a2735] text-[#c5a059] focus:ring-0"
                        />
                        <span>Tributo inicial</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={generalReqs.respeto_absoluto}
                          onChange={e => setGeneralReqs({ ...generalReqs, respeto_absoluto: e.target.checked })}
                          className="rounded border-[#5a2735] text-[#c5a059] focus:ring-0"
                        />
                        <span>Respeto absoluto</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={generalReqs.discrecion_confidencialidad}
                          onChange={e => setGeneralReqs({ ...generalReqs, discrecion_confidencialidad: e.target.checked })}
                          className="rounded border-[#5a2735] text-[#c5a059] focus:ring-0"
                        />
                        <span>Discreción total</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOCADILLO 9: HABILIDADES LABORALES / PUESTOS ÚTILES (col-span-6) */}
            <div className="lg:col-span-6 bg-[#110b0e] border border-[#3c1b24] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#2d141b]">
                  <h4 className="font-brand font-bold text-sm text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#c5a059]" />
                    Habilidades laborales / Puestos útiles
                  </h4>
                  <button
                    onClick={() => setShowAddSkill(true)}
                    className="py-1 px-3 rounded-lg bg-[#1a0f14] border border-[#5c2a38] text-[#e5c158] hover:bg-[#2c131d] text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir habilidad
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  {/* Column 1: Habilidades de este sumiso */}
                  <div>
                    <span className="text-[10px] font-mono text-[#c5a059] font-bold block mb-2">
                      Habilidades de este sumiso
                    </span>
                    <div className="space-y-2.5">
                      {(member?.skills && member.skills.length > 0) ? (
                        member.skills.map(sk => (
                          <div key={sk.id} className="flex items-center justify-between text-xs bg-[#160e13] p-2 rounded-lg border border-[#2e151e] group">
                            <div>
                              <span className="font-medium text-white block text-[11px]">{sk.skillName}</span>
                              <span className="text-[9px] font-mono text-[#8e8073]">
                                {sk.level === 'ADVANCED' ? 'Avanzado' : sk.level === 'EXPERT' ? 'Experto' : sk.level === 'INTERMEDIATE' ? 'Intermedio' : 'Básico'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {renderSkillDots(sk.level)}
                              <button 
                                onClick={() => handleDeleteSkill(sk.id)}
                                className="opacity-0 group-hover:opacity-100 text-[#8e8073] hover:text-rose-400 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-xs font-mono text-[#8e8073]">
                          Sin habilidades registradas.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Oportunidades / Necesidades del Reino */}
                  <div>
                    <span className="text-[10px] font-mono text-[#c5a059] font-bold block mb-2">
                      Oportunidades / Necesidades
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs bg-[#160e13] p-2 rounded-lg border border-[#2e151e]">
                        <span className="font-medium text-white text-[11px]">Gestión de redes sociales</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#3e131d] text-rose-300 border border-rose-800/40">
                          ★ Alta
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-[#160e13] p-2 rounded-lg border border-[#2e151e]">
                        <span className="font-medium text-white text-[11px]">Edición de contenido</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#352511] text-amber-300 border border-amber-800/40">
                          ★ Media
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-[#160e13] p-2 rounded-lg border border-[#2e151e]">
                        <span className="font-medium text-white text-[11px]">Soporte técnico</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#352511] text-amber-300 border border-amber-800/40">
                          ★ Media
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-[#160e13] p-2 rounded-lg border border-[#2e151e]">
                        <span className="font-medium text-white text-[11px]">Moderación de comunidad</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#14232c] text-cyan-300 border border-cyan-800/40">
                          ★ Baja
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* ROW 6: BOCADILLO 10 & FINANZAS - FINANZAS Y REGALOS & NOTAS */}
          {/* --------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* FINANZAS Y REGALOS (col-span-6) */}
            <div className="lg:col-span-6 bg-[#110b0e] border border-[#3c1b24] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#2d141b]">
                  <h4 className="font-brand font-bold text-sm text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#c5a059]" />
                    Finanzas y regalos
                  </h4>
                  <button 
                    onClick={() => alert('Abriendo historial financiero completo...')}
                    className="text-xs font-mono text-[#c5a059] hover:underline flex items-center gap-1"
                  >
                    Ver historial completo →
                  </button>
                </div>

                {/* Mini Summary Strip */}
                <div className="grid grid-cols-4 gap-2 pt-3 text-center">
                  <div className="bg-[#180f14] p-1.5 rounded-lg border border-[#2e151e]">
                    <span className="text-[9px] font-mono text-[#8e8073] block truncate">Total aportado</span>
                    <span className="text-xs font-sans font-bold text-[#e5c158]">€5,870</span>
                  </div>
                  <div className="bg-[#180f14] p-1.5 rounded-lg border border-[#2e151e]">
                    <span className="text-[9px] font-mono text-[#8e8073] block truncate">Este mes</span>
                    <span className="text-xs font-sans font-bold text-white">€1,250</span>
                  </div>
                  <div className="bg-[#180f14] p-1.5 rounded-lg border border-[#2e151e]">
                    <span className="text-[9px] font-mono text-[#8e8073] block truncate">Mes pasado</span>
                    <span className="text-xs font-sans font-bold text-white">€980</span>
                  </div>
                  <div className="bg-[#180f14] p-1.5 rounded-lg border border-[#2e151e]">
                    <span className="text-[9px] font-mono text-[#8e8073] block truncate">Regalos</span>
                    <span className="text-xs font-sans font-bold text-white">€340</span>
                  </div>
                </div>

                {/* Finance Table */}
                <div className="overflow-x-auto pt-3">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-[#8e8073] border-b border-[#2d141b] text-[10px]">
                        <th className="pb-2 font-normal">Fecha</th>
                        <th className="pb-2 font-normal">Concepto</th>
                        <th className="pb-2 font-normal">Tipo</th>
                        <th className="pb-2 font-normal">Importe</th>
                        <th className="pb-2 font-normal">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#201118] text-[11px]">
                      <tr className="hover:bg-[#180f14]/60">
                        <td className="py-2 text-[#c2b29f]">15 Abr 2025</td>
                        <td className="py-2 text-white font-medium">Tributo mensual</td>
                        <td className="py-2 text-[#a39485]">Tributo</td>
                        <td className="py-2 text-[#e5c158] font-bold">€250</td>
                        <td className="py-2 text-[#8e8073]">—</td>
                      </tr>
                      <tr className="hover:bg-[#180f14]/60">
                        <td className="py-2 text-[#c2b29f]">10 Abr 2025</td>
                        <td className="py-2 text-white font-medium">Regalo: Lencería</td>
                        <td className="py-2 text-[#a39485]">Regalo</td>
                        <td className="py-2 text-[#e5c158] font-bold">€340</td>
                        <td className="py-2 text-crimson-400 italic">Desde nuestra wishlist ♡</td>
                      </tr>
                      <tr className="hover:bg-[#180f14]/60">
                        <td className="py-2 text-[#c2b29f]">01 Abr 2025</td>
                        <td className="py-2 text-white font-medium">Tributo semanal</td>
                        <td className="py-2 text-[#a39485]">Tributo</td>
                        <td className="py-2 text-[#e5c158] font-bold">€250</td>
                        <td className="py-2 text-[#8e8073]">—</td>
                      </tr>
                      <tr className="hover:bg-[#180f14]/60">
                        <td className="py-2 text-[#c2b29f]">14 Mar 2025</td>
                        <td className="py-2 text-white font-medium">Suscripción</td>
                        <td className="py-2 text-[#a39485]">Suscripción</td>
                        <td className="py-2 text-[#e5c158] font-bold">€100</td>
                        <td className="py-2 text-[#8e8073]">Renovación mensual</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* BOCADILLO 10: NOTAS Y OBSERVACIONES (col-span-6) */}
            <div className="lg:col-span-6 bg-[#110b0e] border border-[#3c1b24] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#2d141b]">
                  <h4 className="font-brand font-bold text-sm text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#c5a059]" />
                    Notas y observaciones
                  </h4>
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="py-1 px-3 rounded-lg bg-[#1a0f14] border border-[#5c2a38] text-[#e5c158] hover:bg-[#2c131d] text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir nota
                  </button>
                </div>

                {/* Sub-Tabs / View Selector */}
                <div className="flex items-center gap-2 pt-3 pb-2 text-xs font-mono">
                  <button
                    onClick={() => setNotesFilter('internal')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      notesFilter === 'internal'
                        ? 'bg-[#3e131d] text-[#e5c158] border border-[#6a1528] font-bold'
                        : 'text-[#8e8073] hover:text-white'
                    }`}
                  >
                    📝 Notas internas (solo admin)
                  </button>
                  <button
                    onClick={() => setNotesFilter('next_steps')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      notesFilter === 'next_steps'
                        ? 'bg-[#3e131d] text-[#e5c158] border border-[#6a1528] font-bold'
                        : 'text-[#8e8073] hover:text-white'
                    }`}
                  >
                    🧭 Próximos pasos
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-2 pt-1 max-h-52 overflow-y-auto custom-scrollbar">
                  {displayedNotes.length > 0 ? (
                    displayedNotes.map(n => (
                      <div 
                        key={n.id} 
                        className="bg-[#160e13] border border-[#2e151e] p-2.5 rounded-lg flex items-start justify-between gap-3 text-xs group"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-[#c5a059] block">
                            {formatDate(n.createdAt)}
                          </span>
                          <p className="font-sans text-[#f3e8d9] text-[11px] leading-relaxed">
                            {n.note.replace('[PRÓXIMOS PASOS] ', '')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          title="Eliminar nota"
                          className="opacity-0 group-hover:opacity-100 text-[#8e8073] hover:text-rose-400 p-1 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs font-mono text-[#8e8073]">
                      No hay notas en esta sección.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* ROW 7: BOCADILLO 11 & SYSTEM FOOTER HINTS & LUXURY SIGNATURE */}
          {/* --------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Hint 1: Biblioteca y desplegables (Bocadillo 11) */}
            <div className="bg-[#110b0e] border border-[#3c1b24] rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#251017] border border-[#521c27] text-[#c5a059] flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <p className="text-xs font-mono text-[#c2b29f] leading-relaxed">
                La biblioteca de actividades debe alimentar los desplegables de esta página.
              </p>
            </div>

            {/* Hint 2: Tablero interactivo y automatizaciones */}
            <div className="bg-[#110b0e] border border-[#3c1b24] rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#251017] border border-[#521c27] text-[#c5a059] flex-shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <p className="text-xs font-mono text-[#c2b29f] leading-relaxed">
                Preparar la estructura para futuro tablero interactivo y automatizaciones.
              </p>
            </div>
          </div>

          {/* Luxury Watermark Signature */}
          <div className="pt-6 pb-2 border-t border-[#2d141b] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#6f6053]">
            <div className="flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-[#8c6a2f]" />
              <span className="tracking-[0.25em] text-[#9a8677] uppercase font-bold">
                DISCIPLINA TAMBIÉN ES CLARIDAD.
              </span>
            </div>

            <div className="text-[10px] tracking-widest text-[#8c6a2f] uppercase">
              VERSIÓN 1.0 · UX REFERENCE · DOMINIUM
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDITAR PERFIL COMPLETO */}
      {/* ========================================================================= */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#120c10] border border-[#5a2735] rounded-2xl p-6 max-w-2xl w-full text-[#f3e8d9] space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#3c1b24]">
              <h3 className="font-brand font-bold text-lg text-[#e5c158] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#c5a059]" />
                Editar Perfil del Sumiso ({currentPrefs.memberNumber})
              </h3>
              <button onClick={() => setShowEditProfile(false)} className="text-[#8e8073] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c5a059] mb-1">Alias público</label>
                  <input
                    type="text"
                    value={profileForm.alias}
                    onChange={e => setProfileForm({ ...profileForm, alias: e.target.value })}
                    className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#c5a059] mb-1">Reino / Nombre ceremonial</label>
                  <input
                    type="text"
                    value={profileForm.internalName}
                    onChange={e => setProfileForm({ ...profileForm, internalName: e.target.value })}
                    className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c5a059] mb-1">Puesto Actual</label>
                  <input
                    type="text"
                    value={profileForm.currentRank}
                    onChange={e => setProfileForm({ ...profileForm, currentRank: e.target.value })}
                    className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#c5a059] mb-1">Puesto Objetivo</label>
                  <input
                    type="text"
                    value={profileForm.targetRank}
                    onChange={e => setProfileForm({ ...profileForm, targetRank: e.target.value })}
                    className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c5a059] mb-1">Sirve desde</label>
                  <input
                    type="text"
                    value={profileForm.servedSince}
                    onChange={e => setProfileForm({ ...profileForm, servedSince: e.target.value })}
                    className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#c5a059] mb-1">Tributo inicial</label>
                  <input
                    type="text"
                    value={profileForm.initialTribute}
                    onChange={e => setProfileForm({ ...profileForm, initialTribute: e.target.value })}
                    className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#c5a059] mb-1">Cita del sumiso</label>
                <input
                  type="text"
                  value={profileForm.quote}
                  onChange={e => setProfileForm({ ...profileForm, quote: e.target.value })}
                  className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white font-serif italic"
                />
              </div>

              {/* Tags and Sensitive Dossier */}
              <div className="pt-2 border-t border-[#2d141b] space-y-3">
                <h5 className="font-brand font-bold text-sm text-[#e5c158]">Etiquetas del Perfil</h5>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#c5a059] mb-1">Preferencias</label>
                    <input
                      type="text"
                      value={profileForm.preferences}
                      onChange={e => setProfileForm({ ...profileForm, preferences: e.target.value })}
                      className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#c5a059] mb-1">Fetiches</label>
                    <input
                      type="text"
                      value={profileForm.fetishes}
                      onChange={e => setProfileForm({ ...profileForm, fetishes: e.target.value })}
                      className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#c5a059] mb-1">Triggers</label>
                    <input
                      type="text"
                      value={profileForm.triggers}
                      onChange={e => setProfileForm({ ...profileForm, triggers: e.target.value })}
                      className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#c5a059] mb-1">Límites</label>
                    <input
                      type="text"
                      value={profileForm.limits}
                      onChange={e => setProfileForm({ ...profileForm, limits: e.target.value })}
                      className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#c5a059] mb-1">Aftercare</label>
                    <input
                      type="text"
                      value={profileForm.aftercare}
                      onChange={e => setProfileForm({ ...profileForm, aftercare: e.target.value })}
                      className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#c5a059] mb-1">Objetivos personales</label>
                    <input
                      type="text"
                      value={profileForm.personalGoals}
                      onChange={e => setProfileForm({ ...profileForm, personalGoals: e.target.value })}
                      className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 rounded-xl bg-[#201118] text-[#8e8073] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6a1528] to-[#4a0e1b] border border-[#c5a059] text-[#f7e08b] font-bold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AÑADIR HABILIDAD LABORAL */}
      {/* ========================================================================= */}
      {showAddSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#120c10] border border-[#5a2735] rounded-2xl p-6 max-w-md w-full text-[#f3e8d9] space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#3c1b24]">
              <h3 className="font-brand font-bold text-base text-[#e5c158]">
                Añadir Habilidad Laboral
              </h3>
              <button onClick={() => setShowAddSkill(false)} className="text-[#8e8073] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkillSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#c5a059] mb-1">Nombre de Habilidad</label>
                <input
                  type="text"
                  placeholder="Ej: Edición de video, Diseño gráfico..."
                  value={skillForm.skillName}
                  onChange={e => setSkillForm({ ...skillForm, skillName: e.target.value })}
                  required
                  className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[#c5a059] mb-1">Categoría</label>
                <select
                  value={skillForm.skillCategory}
                  onChange={e => setSkillForm({ ...skillForm, skillCategory: e.target.value })}
                  className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                >
                  <option value="VIDEO_EDITING">Edición de video</option>
                  <option value="DESIGN">Diseño gráfico</option>
                  <option value="LANGUAGES">Traducción / Idiomas</option>
                  <option value="PROGRAMMING">Soporte web / Programación</option>
                  <option value="SOCIAL_MEDIA">Redes Sociales</option>
                  <option value="OTHER">Otras Habilidades</option>
                </select>
              </div>

              <div>
                <label className="block text-[#c5a059] mb-1">Nivel de Maestría</label>
                <select
                  value={skillForm.level}
                  onChange={e => setSkillForm({ ...skillForm, level: e.target.value })}
                  className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                >
                  <option value="BASIC">Básico (●●○○○)</option>
                  <option value="INTERMEDIATE">Intermedio (●●●○○)</option>
                  <option value="ADVANCED">Avanzado (●●●●○)</option>
                  <option value="EXPERT">Experto (●●●●●)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="px-4 py-2 rounded-xl bg-[#201118] text-[#8e8073]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6a1528] to-[#4a0e1b] border border-[#c5a059] text-[#f7e08b] font-bold"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVA ACTIVIDAD ASIGNADA */}
      {/* ========================================================================= */}
      {showNewActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#120c10] border border-[#5a2735] rounded-2xl p-6 max-w-md w-full text-[#f3e8d9] space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#3c1b24]">
              <h3 className="font-brand font-bold text-base text-[#e5c158]">
                Asignar Nueva Actividad
              </h3>
              <button onClick={() => setShowNewActivityModal(false)} className="text-[#8e8073] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomActivity} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#c5a059] mb-1">Título de Actividad</label>
                <input
                  type="text"
                  placeholder="Ej: Enviar tributo semanal, Sesión virtual..."
                  value={newActivityForm.title}
                  onChange={e => setNewActivityForm({ ...newActivityForm, title: e.target.value })}
                  required
                  className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c5a059] mb-1">Tipo</label>
                  <select
                    value={newActivityForm.type}
                    onChange={e => setNewActivityForm({ ...newActivityForm, type: e.target.value })}
                    className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                  >
                    <option value="TASK">Tarea</option>
                    <option value="RITUAL">Ritual</option>
                    <option value="PUNISHMENT">Castigo</option>
                    <option value="SPECIAL_EVENT">Actividad especial</option>
                    <option value="GOAL">Objetivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#c5a059] mb-1">Prioridad</label>
                  <select
                    value={newActivityForm.priority}
                    onChange={e => setNewActivityForm({ ...newActivityForm, priority: e.target.value })}
                    className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                  >
                    <option value="Alta">★ Alta</option>
                    <option value="Media">★ Media</option>
                    <option value="Baja">★ Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c5a059] mb-1">Estado</label>
                  <select
                    value={newActivityForm.status}
                    onChange={e => setNewActivityForm({ ...newActivityForm, status: e.target.value })}
                    className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                  >
                    <option value="ACTIVE">Activa</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="COMPLETED_ON_TIME">Completada</option>
                    <option value="OVERDUE">Vencida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#c5a059] mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={newActivityForm.dueDate}
                    onChange={e => setNewActivityForm({ ...newActivityForm, dueDate: e.target.value })}
                    className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewActivityModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#201118] text-[#8e8073]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6a1528] to-[#4a0e1b] border border-[#c5a059] text-[#f7e08b] font-bold"
                >
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AÑADIR NOTA INTERNA */}
      {/* ========================================================================= */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#120c10] border border-[#5a2735] rounded-2xl p-6 max-w-md w-full text-[#f3e8d9] space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#3c1b24]">
              <h3 className="font-brand font-bold text-base text-[#e5c158]">
                Añadir Nota u Observación
              </h3>
              <button onClick={() => setShowAddNoteModal(false)} className="text-[#8e8073] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#c5a059] mb-1">Tipo de Nota</label>
                <select
                  value={newNoteType}
                  onChange={e => setNewNoteType(e.target.value)}
                  className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2 text-white"
                >
                  <option value="internal">Nota interna (solo admin)</option>
                  <option value="next_steps">Próximos pasos</option>
                </select>
              </div>

              <div>
                <label className="block text-[#c5a059] mb-1">Contenido de la Observación</label>
                <textarea
                  rows={4}
                  placeholder="Escribe la observación sobre disciplina, acuerdos, próximos pasos o evolución..."
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  required
                  className="w-full bg-[#180f14] border border-[#3e1e27] rounded-lg p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#201118] text-[#8e8073]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6a1528] to-[#4a0e1b] border border-[#c5a059] text-[#f7e08b] font-bold"
                >
                  Guardar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
