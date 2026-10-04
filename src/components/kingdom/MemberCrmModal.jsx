import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Crown, Search, Bell, Edit3, Calendar, Gift, Target, Award,
  Sparkles, CheckCircle2, Clock, AlertTriangle, ChevronRight,
  TrendingUp, Trash2, Plus, Star, ShieldCheck, Heart, Zap,
  Flame, Lock, Layers, Settings, Eye, Check, RefreshCw, Mail, User,
  DollarSign, ArrowUp, ArrowDown, Save, CreditCard, Send, Shield,
  ChevronDown, ChevronUp, ExternalLink, Filter, CheckCircle,
  BookOpen, ScrollText, MessageSquare, ToggleLeft, ToggleRight, Bookmark, FileText
} from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../../config';

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
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activitiesLibrary, setActivitiesLibrary] = useState([]);
  const [allGroupsState, setAllGroupsState] = useState(allGroups);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState('diario'); // 'diario', 'dashboard', 'finanzas', 'requisitos', 'habilidades', 'notas'
  const [selectedActivityCategory, setSelectedActivityCategory] = useState('ALL');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showMemberSearchDropdown, setShowMemberSearchDropdown] = useState(false);

  // Estados del Diario de la Dinámica
  const [dashboardActivityView, setDashboardActivityView] = useState('journal'); // 'journal' | 'system'
  const [journalCategoryFilter, setJournalCategoryFilter] = useState('ALL');
  const [journalAuthorFilter, setJournalAuthorFilter] = useState('ALL');
  const [newJournalEntry, setNewJournalEntry] = useState({
    category: 'OBSERVACION',
    title: '',
    content: '',
    date: new Date().toISOString().slice(0, 10)
  });
  const [addingJournalEntry, setAddingJournalEntry] = useState(false);
  const [togglingJournalAccess, setTogglingJournalAccess] = useState(false);

  // Formulario principal del miembro
  const [formData, setFormData] = useState({
    alias: '',
    internalName: '',
    memberNumber: '',
    email: '',
    telegram: '',
    age: '',
    profession: '',
    quote: '',
    initialTribute: '',
    servedSince: '',
    status: 'ACTIVE',
    groupId: '',
    targetGroupId: '',
    overallProgress: 22,
    experiencePoints: 135,
    totalRevenue: 0,
    avatarUrl: '',
    internalNotes: '',
    preferences: '',
    motivation: '',
    fetishes: '',
    triggers: '',
    limits: '',
    aftercare: '',
    personalGoals: '',
    activeSubscription: 'Ninguna'
  });

  // Estado para registrar tributo/pago manual
  const [newTribute, setNewTribute] = useState({
    amount: '',
    concept: 'Tributo de devoción',
    paymentMethod: 'BIZUM',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [addingTribute, setAddingTribute] = useState(false);

  // Estado para nuevo objetivo/entrenamiento manual
  const [newObjective, setNewObjective] = useState({
    templateId: '',
    title: '',
    type: 'TASK',
    dueDays: 3,
    pointsAwarded: 20,
    priority: 'MEDIUM',
    customInstructions: ''
  });
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);
  const [addingObjective, setAddingObjective] = useState(false);

  // Estado para nueva habilidad
  const [newSkill, setNewSkill] = useState({
    skillCategory: 'VIDEO_EDITING',
    skillName: '',
    level: 'ADVANCED',
    notes: '3/5 puntos de maestría'
  });
  const [addingSkill, setAddingSkill] = useState(false);

  // Nueva nota interna
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showEditDrawer) setShowEditDrawer(false);
        else if (showNewActivityModal) setShowNewActivityModal(false);
        else if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEditDrawer, showNewActivityModal, onClose]);

  // Cargar grupos si no vinieron por props
  useEffect(() => {
    if (!allGroups || allGroups.length === 0) {
      fetch(`${API_BASE}/api/kingdom/groups`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setAllGroupsState(data);
        })
        .catch(() => {});
    }
  }, [allGroups]);

  // Cargar biblioteca de actividades
  useEffect(() => {
    fetch(`${API_BASE}/api/kingdom/admin/activities/library`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setActivitiesLibrary(data);
      })
      .catch(() => {});
  }, [token]);

  // Cargar detalle completo del miembro
  const fetchMemberDetail = async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener sumiso');
      
      setMember(data);

      let parsedPrefs = {};
      if (data.preferences) {
        try {
          parsedPrefs = typeof data.preferences === 'string' ? JSON.parse(data.preferences) : data.preferences;
        } catch {
          parsedPrefs = { preferences: data.preferences };
        }
      }

      setFormData({
        alias: data.alias || '',
        internalName: data.internalName || data.alias || '',
        memberNumber: data.memberNumber || '#002',
        email: data.email || data.user?.email || 'ilirifi@yahoo.com',
        telegram: parsedPrefs.telegram || data.telegram || '@javi_javi_javi',
        age: parsedPrefs.age || '23',
        profession: parsedPrefs.profession || 'Ingeniero Becario',
        quote: parsedPrefs.quote || data.quote || 'No es como empieza, sino como termina.',
        initialTribute: parsedPrefs.initialTribute || 'Pendiente',
        servedSince: parsedPrefs.servedSince || '28 sept 2026',
        status: data.status || 'ACTIVE',
        groupId: data.groupId || '',
        targetGroupId: data.targetGroupId || '',
        overallProgress: data.overallProgress !== undefined ? data.overallProgress : 22,
        experiencePoints: data.experiencePoints !== undefined ? data.experiencePoints : 135,
        totalRevenue: data.totalRevenue !== undefined ? data.totalRevenue : (data.finances?.total || 0),
        avatarUrl: data.avatarUrl || '',
        internalNotes: data.internalNotes || '',
        preferences: parsedPrefs.preferences || 'Humillación Psicológica y Verbal',
        motivation: parsedPrefs.motivation || 'Mencionar otra motivación al lado de sumisión absoluta',
        fetishes: parsedPrefs.fetishes || 'Pies, humillación, edging, sumisión psicológica',
        triggers: parsedPrefs.triggers || 'Los pies y las palabras sin filtros de la Princesa',
        limits: parsedPrefs.limits || 'Daño físico permanente, contacto no consentido',
        aftercare: parsedPrefs.aftercare || 'Validación tras cumplir tareas, órdenes claras',
        personalGoals: data.personalGoals || parsedPrefs.personalGoals || 'Consagrarme como sumiso útil en la estructura de la Princesa',
        activeSubscription: parsedPrefs.activeSubscription || (data.subscriptions?.[0]?.group?.name ? `Acceso ${data.subscriptions[0].group.name}` : 'Ninguna')
      });
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberDetail();
  }, [memberId]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Guardar cambios del perfil vía PATCH
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    try {
      const prefsPayload = {
        telegram: formData.telegram,
        age: formData.age,
        profession: formData.profession,
        quote: formData.quote,
        initialTribute: formData.initialTribute,
        servedSince: formData.servedSince,
        preferences: formData.preferences,
        motivation: formData.motivation,
        fetishes: formData.fetishes,
        triggers: formData.triggers,
        limits: formData.limits,
        aftercare: formData.aftercare,
        personalGoals: formData.personalGoals,
        activeSubscription: formData.activeSubscription
      };

      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          preferences: JSON.stringify(prefsPayload)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      setIsDirty(false);
      setShowEditDrawer(false);
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
      alert('¡Perfil del sumiso actualizado con éxito!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Guardar ingreso manual directo
  const handleSaveManualRevenue = async (amount) => {
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/revenue`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ totalRevenue: parseFloat(amount) || 0 })
      });
      if (!res.ok) throw new Error('Error guardando ingresos');
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
      alert('Total aportado actualizado');
    } catch (e) {
      alert(e.message);
    }
  };

  // Registrar nuevo pago/tributo
  const handleAddTribute = async (e) => {
    e.preventDefault();
    if (!newTribute.amount || isNaN(newTribute.amount)) {
      alert('Introduce un importe válido');
      return;
    }
    setAddingTribute(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/tributes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTribute)
      });
      if (!res.ok) throw new Error('Error al registrar tributo');
      setNewTribute({
        amount: '',
        concept: 'Tributo de devoción',
        paymentMethod: 'BIZUM',
        reference: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
      alert('¡Tributo registrado e ingresos recalculados!');
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingTribute(false);
    }
  };

  // Eliminar tributo
  const handleDeleteTribute = async (tributeId) => {
    if (!confirm('¿Eliminar este registro financiero?')) return;
    try {
      await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/tributes/${tributeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      alert('Error eliminando tributo');
    }
  };

  // Asignar actividad desde la biblioteca (1-clic)
  const handleAssignTemplate = async (template) => {
    try {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + (template.defaultDurationDays || 3));

      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          memberIds: [memberId],
          templateId: template.id,
          title: template.title,
          type: template.type || 'TASK',
          customInstructions: template.instructions || '',
          pointsAwarded: template.pointsValue || 20,
          status: 'ACTIVE',
          dueDate: defaultDueDate.toISOString()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al asignar actividad');
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
      alert(`Actividad "${template.title}" asignada a ${formData.alias}`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Asignar actividad personalizada
  const handleCreateCustomActivity = async (e) => {
    e.preventDefault();
    if (!newObjective.title.trim()) {
      alert('Introduce un título para la actividad');
      return;
    }
    setAddingObjective(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(newObjective.dueDays || 3, 10));

      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          memberIds: [memberId],
          templateId: newObjective.templateId || null,
          title: newObjective.title,
          type: newObjective.type,
          customInstructions: newObjective.customInstructions,
          pointsAwarded: parseFloat(newObjective.pointsAwarded) || 0,
          status: 'ACTIVE',
          dueDate: dueDate.toISOString(),
          priority: newObjective.priority || 'MEDIUM'
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al crear asignación');
      setShowNewActivityModal(false);
      setNewObjective({
        templateId: '',
        title: '',
        type: 'TASK',
        dueDays: 3,
        pointsAwarded: 20,
        priority: 'MEDIUM',
        customInstructions: ''
      });
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
      alert('¡Actividad asignada con éxito!');
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingObjective(false);
    }
  };

  // Actualizar estado de asignación
  const handleUpdateAssignmentStatus = async (assignmentId, nextStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/activities/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error('Error actualizando estado');
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      alert(err.message);
    }
  };

  // Eliminar asignación
  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('¿Eliminar esta actividad del sumiso?')) return;
    try {
      await fetch(`${API_BASE}/api/kingdom/admin/activities/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMemberDetail();
      if (onRefreshList) onRefreshList();
    } catch (err) {
      alert('Error eliminando actividad');
    }
  };

  // Dispensar / Validar requisito
  const handleToggleRequirement = async (definitionId, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/requirements/waive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          definitionId,
          status: nextStatus,
          evidenceNotes: 'Actualizado directamente desde la ficha'
        })
      });
      fetchMemberDetail();
    } catch (err) {
      alert('Error actualizando requisito');
    }
  };

  // Añadir habilidad
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.skillName.trim()) return;
    setAddingSkill(true);
    try {
      await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSkill)
      });
      setNewSkill({ skillCategory: 'VIDEO_EDITING', skillName: '', level: 'ADVANCED', notes: '3/5 puntos de maestría' });
      fetchMemberDetail();
    } catch (err) {
      alert('Error al añadir habilidad');
    } finally {
      setAddingSkill(false);
    }
  };

  // Eliminar habilidad
  const handleDeleteSkill = async (skillId) => {
    try {
      await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/skills/${skillId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMemberDetail();
    } catch (err) {
      alert('Error al eliminar habilidad');
    }
  };

  // Añadir nota confidencial
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ note: newNote.trim() })
      });
      setNewNote('');
      fetchMemberDetail();
    } catch (err) {
      alert('Error guardando nota');
    } finally {
      setAddingNote(false);
    }
  };

  // Eliminar nota
  const handleDeleteNote = async (noteId) => {
    try {
      await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMemberDetail();
    } catch (err) {
      alert('Error eliminando nota');
    }
  };

  // --- DIARIO DE LA DINÁMICA ---
  const handleAddJournalEntry = async (e) => {
    e.preventDefault();
    if (!newJournalEntry.content.trim()) {
      alert('El contenido del diario no puede estar vacío');
      return;
    }
    setAddingJournalEntry(true);
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newJournalEntry)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar entrada en el diario');

      setNewJournalEntry({
        category: 'OBSERVACION',
        title: '',
        content: '',
        date: new Date().toISOString().slice(0, 10)
      });
      fetchMemberDetail();
    } catch (err) {
      alert(err.message || 'Error guardando entrada');
    } finally {
      setAddingJournalEntry(false);
    }
  };

  const handleDeleteJournalEntry = async (entryId) => {
    if (!confirm('¿Eliminar esta entrada del Diario de la Dinámica?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/journal/${entryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchMemberDetail();
    } catch (err) {
      alert(err.message || 'Error eliminando entrada');
    }
  };

  const handleToggleJournalAccess = async () => {
    setTogglingJournalAccess(true);
    try {
      const currentAccess = member?.journalAccess !== false;
      const res = await fetch(`${API_BASE}/api/kingdom/admin/members/${memberId}/journal-access`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ journalAccess: !currentAccess })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar permiso');
      fetchMemberDetail();
    } catch (err) {
      alert(err.message || 'Error al cambiar permiso');
    } finally {
      setTogglingJournalAccess(false);
    }
  };

  // Filtrado de entradas del diario
  const filteredJournalEntries = useMemo(() => {
    let list = member?.journalEntries || [];
    if (journalCategoryFilter !== 'ALL') {
      list = list.filter(e => e.category === journalCategoryFilter);
    }
    if (journalAuthorFilter !== 'ALL') {
      list = list.filter(e => e.authorRole === journalAuthorFilter);
    }
    return list;
  }, [member?.journalEntries, journalCategoryFilter, journalAuthorFilter]);

  // Filtrado de actividades de la biblioteca
  const filteredTemplates = useMemo(() => {
    return activitiesLibrary.filter(t => {
      const matchCat = selectedActivityCategory === 'ALL' || t.type === selectedActivityCategory;
      const matchSearch = !activitySearchQuery || 
        t.title.toLowerCase().includes(activitySearchQuery.toLowerCase()) || 
        (t.instructions && t.instructions.toLowerCase().includes(activitySearchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activitiesLibrary, selectedActivityCategory, activitySearchQuery]);

  // Filtrado para el buscador rápido de sumisos en cabecera
  const filteredMembersList = useMemo(() => {
    if (!memberSearchQuery.trim()) return allMembers.slice(0, 8);
    const q = memberSearchQuery.toLowerCase();
    return allMembers.filter(m => 
      (m.alias && m.alias.toLowerCase().includes(q)) ||
      (m.memberNumber && m.memberNumber.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [allMembers, memberSearchQuery]);

  // Historial combinado financiero
  const combinedHistory = useMemo(() => {
    return [
      ...(member?.finances?.tributes || []).map(t => ({
        id: t.id,
        type: 'TRIBUTO',
        concept: t.concept || 'Tributo manual',
        amount: t.amount,
        method: t.paymentMethod,
        date: t.date || t.createdAt,
        isTribute: true
      })),
      ...(member?.finances?.orders || []).map(o => ({
        id: o.id,
        type: 'TIENDA',
        concept: o.orderNumber ? `Pedido ${o.orderNumber}` : (o.itemName || 'Compra Tienda'),
        amount: o.totalAmount,
        method: o.paymentMethod || 'Stripe/Bizum',
        date: o.createdAt,
        status: o.paymentStatus
      })),
      ...(member?.subscriptions || []).map(s => ({
        id: s.id,
        type: 'SUSCRIPCIÓN',
        concept: s.grantReason || (s.group?.name ? `Acceso a ${s.group.name}` : 'Suscripción Reino'),
        amount: s.amount || s.price || 0,
        method: s.activationMethod,
        date: s.startDate || s.createdAt,
        status: s.status
      }))
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [member]);

  // Estadísticas calculadas
  const assignments = member?.assignments || [];
  const completedAssignmentsCount = assignments.filter(a => a.status === 'COMPLETED' || a.status === 'COMPLETED_ON_TIME').length;
  const totalAssignmentsCount = assignments.length || 4;
  const ritualsCount = assignments.filter(a => a.type === 'RITUAL').length;
  const ritualsCompleted = assignments.filter(a => a.type === 'RITUAL' && (a.status === 'COMPLETED' || a.status === 'COMPLETED_ON_TIME')).length;
  const trainingsCount = assignments.filter(a => a.type === 'TASK' || a.type === 'GOAL').length;
  const trainingsCompleted = assignments.filter(a => (a.type === 'TASK' || a.type === 'GOAL') && (a.status === 'COMPLETED' || a.status === 'COMPLETED_ON_TIME')).length;

  const currentRankName = member?.group?.name || 'SIRVIENTES';
  const currentRankBadge = member?.group?.badge || 'NIVEL 2';
  const currentRankSubtitle = member?.group?.subtitle || 'Trato directo & Contratos';

  // Timeline de actividad unificado
  const activityTimeline = useMemo(() => {
    const list = [];
    (member?.eventLogs || []).forEach(log => {
      list.push({
        id: log.id,
        date: log.createdAt,
        title: log.eventType === 'TASK_ASSIGNED' ? 'Tarea Asignada' : (log.eventType || 'Evento registrado'),
        description: log.description
      });
    });

    if (list.length === 0) {
      assignments.forEach(a => {
        list.push({
          id: a.id,
          date: a.assignedAt || a.createdAt,
          title: 'Tarea Asignada',
          description: `Actividad asignada: "${a.title}" (${a.type}). ${a.dueDate ? `Límite: ${new Date(a.dueDate).toLocaleDateString('es-ES')}.` : ''}`
        });
      });
    }

    return list.slice(0, 6);
  }, [member, assignments]);

  if (loading && !member) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090305] text-gold-400 font-mono text-xs space-y-3">
        <Crown className="w-8 h-8 text-gold-400 animate-bounce" />
        <span className="tracking-widest uppercase animate-pulse">Cargando expediente del sumiso DOMINIUM...</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#090305] text-[#f5ebe1] w-screen h-screen overflow-y-auto flex flex-col font-sans select-none custom-scrollbar animate-fade-in">
      
      {/* ========================================================================= */}
      {/* 1. TOP BAR LUXURY BRAND (DOMINIUM)                                         */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#0e0508] border-b border-[#2d151e] px-4 sm:px-8 py-3 flex items-center justify-between shrink-0">
        
        {/* Brand izquierda */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#30101a] to-[#5a1b2e] border border-gold-500/40 flex items-center justify-center shadow-lg">
            <Crown className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <span className="font-brand font-black text-sm tracking-[0.2em] text-gold-400 uppercase block leading-tight">
              DOMINIUM
            </span>
            <span className="text-[8px] tracking-[0.25em] text-[#937b85] uppercase font-mono block">
              DISCIPLINA · BELLEZA · LEALTAD
            </span>
          </div>
        </div>

        {/* Centro de la barra */}
        <div className="hidden md:flex flex-col items-center text-center">
          <span className="font-serif italic text-sm text-[#e8d5c4] font-medium tracking-wide">
            Referencia funcional · Perfil del sumiso
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#866675]" />
            <span className="text-[10px] text-[#866675] tracking-wider font-mono">
              Vista única sin pestañas - todo visible por apartados
            </span>
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#866675]" />
          </div>
        </div>

        {/* Lado derecho: Cita & Botón Salir */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden lg:block">
            <p className="text-[11px] font-serif italic text-[#c2a393] leading-none">
              “Un buen diseño también es una forma de Dominio.”
            </p>
            <span className="text-[9px] text-[#937b85] tracking-widest uppercase font-mono block mt-0.5">
              — DOMINIUM
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#190c12] hover:bg-[#2b121d] border border-[#3e1b29] hover:border-gold-500/60 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar ficha de sumiso (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SUB-HEADER / TOOLBAR & BUSCADOR RÁPIDO DE SUMISOS                       */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#0a0406] border-b border-[#241018] px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        
        <div>
          <h1 className="font-brand font-extrabold text-2xl text-ivory-100 tracking-wide leading-tight">
            Perfil del sumiso
          </h1>
          <span className="text-[9px] font-mono tracking-[0.25em] text-[#9a7e8c] uppercase block">
            GESTIÓN COMPLETA DEL SUMISO
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto relative">
          
          {/* Buscador interactivo de sumisos para cambiar instantáneamente */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={memberSearchQuery}
              onChange={(e) => {
                setMemberSearchQuery(e.target.value);
                setShowMemberSearchDropdown(true);
              }}
              onFocus={() => setShowMemberSearchDropdown(true)}
              placeholder="Buscar sumiso..."
              className="w-full bg-[#13080d] border border-[#381a25] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 font-sans focus:outline-none focus:border-gold-500/60"
            />

            {/* Dropdown de cambio rápido de sumiso */}
            {showMemberSearchDropdown && filteredMembersList.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-1 bg-[#15090f] border border-gold-500/40 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-[#2a131c]"
                onMouseLeave={() => setShowMemberSearchDropdown(false)}
              >
                <div className="p-2 text-[10px] font-mono text-gold-400 uppercase tracking-wider bg-[#10060b]">
                  Cambiar de sumiso:
                </div>
                {filteredMembersList.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (onSelectMember) onSelectMember(m.id);
                      setShowMemberSearchDropdown(false);
                      setMemberSearchQuery('');
                    }}
                    className={`w-full p-2.5 text-left flex items-center justify-between hover:bg-gold-500/10 transition-colors text-xs ${
                      m.id === memberId ? 'bg-gold-500/15 text-gold-300' : 'text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gold-400 font-bold text-[11px]">{m.memberNumber || '#—'}</span>
                      <span className="font-semibold text-white">{m.alias}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">{m.group?.name || 'Sirvientes'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notificaciones */}
          <button 
            className="w-9 h-9 rounded-xl bg-[#15090f] border border-[#381a25] flex items-center justify-center text-gray-400 hover:text-gold-300 transition-colors shrink-0 relative"
            title="Notificaciones de sumisión"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-gold-400 absolute top-2 right-2 animate-pulse" />
          </button>

          {/* Dominatrix Admin Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#15090f] border border-[#381a25] shrink-0">
            <div className="w-6 h-6 rounded-full bg-dark-900 border border-gold-500/60 flex items-center justify-center text-gold-400 font-brand font-bold text-xs">
              D
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <span className="text-xs font-sans font-bold text-white block">Dominatrix</span>
              <span className="text-[9px] font-mono text-gold-400/80 block uppercase">Admin</span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONTENIDO PRINCIPAL EN PANTALLA ENTERA                                  */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ----------------------------------------------------------------------- */}
        {/* FILA SUPERIOR: IDENTIDAD (IZQ) & FINANZAS / ESTADO (DER)               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* TARJETA 1: FICHA DE IDENTIDAD DEL SUMISO (Col 7) */}
          <div className="lg:col-span-7 bg-[#12080c] rounded-2xl border border-[#311721] p-5 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              
              {/* Cabecera interna: Avatar + Info */}
              <div className="flex items-start gap-4">
                
                {/* Avatar foto con esquinas redondeadas */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[#4a2432] bg-[#1a0c12] shadow-xl">
                    {formData.avatarUrl ? (
                      <img src={resolveMediaUrl(formData.avatarUrl)} alt={formData.alias} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <User className="w-10 h-10 text-gold-500/50" />
                        <span className="text-[9px] font-mono mt-1 text-gold-400">Sin foto</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Datos principales */}
                <div className="flex-1 min-w-0 space-y-2">
                  
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-brand font-black text-xl sm:text-2xl text-white tracking-wide truncate">
                      {formData.memberNumber || '#002'} / {formData.alias || 'Javi'}
                    </h2>

                    {/* Botón Editar perfil */}
                    <button
                      onClick={() => setShowEditDrawer(true)}
                      className="py-1.5 px-3.5 rounded-lg bg-[#1c0c14] hover:bg-[#2b121f] border border-gold-500/40 hover:border-gold-400 text-gold-300 text-xs font-sans font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar perfil</span>
                    </button>
                  </div>

                  {/* Fila de Insignias / Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-950/70 border border-blue-500/40 text-blue-300 text-xs font-mono font-medium flex items-center gap-1.5">
                      <User className="w-3 h-3 text-blue-400" />
                      @{formData.alias || 'Javi'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5">
                      <Send className="w-3 h-3 text-cyan-400" />
                      {formData.telegram || '@javi_javi_javi'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-[#1b0d15] border border-gray-700/60 text-gray-300 text-xs font-mono flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {formData.email || 'ilirifi@yahoo.com'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-bordeaux-950/70 border border-bordeaux-500/40 text-bordeaux-200 text-xs font-sans font-medium flex items-center gap-1.5">
                      <User className="w-3 h-3 text-bordeaux-400" />
                      {formData.age ? `${formData.age} ` : ''}{formData.profession || 'Ingeniero Becario'}
                    </span>
                  </div>

                  {/* Cita de devoción */}
                  <div className="pt-1">
                    <p className="text-xs font-serif italic text-gold-200/90 pl-2.5 border-l-2 border-bordeaux-600 leading-snug">
                      “{formData.quote || 'No es como empieza, sino como termina.'}”
                    </p>
                  </div>

                </div>
              </div>

              {/* Grid de Metadatos 2x2 */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 pt-3 border-t border-[#24121a]">
                
                {/* Sirve desde */}
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-[#937b85] uppercase tracking-wider block">
                      Sirve desde
                    </span>
                    <span className="text-xs font-sans font-bold text-white">
                      {formData.servedSince || '28 sept 2026'}
                    </span>
                  </div>
                </div>

                {/* Rango actual */}
                <div className="flex items-start gap-2.5">
                  <Crown className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-[#937b85] uppercase tracking-wider block">
                      Rango actual
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-sans font-extrabold text-gold-300 uppercase tracking-wide">
                        {currentRankName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-gold-500/20 text-[9px] font-mono font-bold text-gold-400 border border-gold-500/40">
                        {currentRankBadge}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-sans block">
                      {currentRankSubtitle}
                    </span>
                  </div>
                </div>

                {/* Tributo inicial */}
                <div className="flex items-start gap-2.5">
                  <Gift className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-[#937b85] uppercase tracking-wider block">
                      Tributo inicial
                    </span>
                    <span className="text-xs font-sans font-semibold text-ivory-200">
                      {formData.initialTribute || 'Pendiente'}
                    </span>
                  </div>
                </div>

                {/* Rango objetivo */}
                <div className="flex items-start gap-2.5">
                  <Target className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-[#937b85] uppercase tracking-wider block">
                      Rango objetivo
                    </span>
                    <span className="text-xs font-sans font-bold text-gold-400 uppercase tracking-wide">
                      {member?.targetGroup?.name || currentRankName}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* TARJETA 2: FINANZAS Y ESTADO EN VIVO (Col 5) */}
          <div className="lg:col-span-5 bg-[#12080c] rounded-2xl border border-[#311721] p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              
              {/* 3 Cajas de Estadísticas de Ingresos */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#170a10] border border-[#2e151f] p-3 rounded-xl text-center">
                  <span className="text-[10px] font-mono text-[#937b85] uppercase tracking-wider block mb-1">
                    Ingresado este mes
                  </span>
                  <span className="font-brand font-black text-xl sm:text-2xl text-white">
                    €{member?.finances?.thisMonth !== undefined ? member.finances.thisMonth : 0}
                  </span>
                </div>

                <div className="bg-[#170a10] border border-[#2e151f] p-3 rounded-xl text-center">
                  <span className="text-[10px] font-mono text-[#937b85] uppercase tracking-wider block mb-1">
                    Ingresado mes pasado
                  </span>
                  <span className="font-brand font-black text-xl sm:text-2xl text-white">
                    €{member?.finances?.lastMonth !== undefined ? member.finances.lastMonth : 0}
                  </span>
                </div>

                <div className="bg-[#170a10] border border-[#2e151f] p-3 rounded-xl text-center relative group">
                  <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider block mb-1">
                    Total aportado
                  </span>
                  <span className="font-brand font-black text-xl sm:text-2xl text-gold-400">
                    €{member?.finances?.total !== undefined ? member.finances.total : formData.totalRevenue || 0}
                  </span>
                  <button
                    onClick={() => {
                      const val = prompt('Modificar manualmente el total aportado (€):', formData.totalRevenue || 0);
                      if (val !== null && !isNaN(val)) handleSaveManualRevenue(val);
                    }}
                    className="text-[9px] font-mono text-gray-500 hover:text-gold-300 underline block mt-0.5"
                    title="Modificar manualmente la cantidad"
                  >
                    Modificar
                  </button>
                </div>
              </div>

              {/* Separador fino */}
              <div className="border-t border-[#24121a] pt-4" />

              {/* Fila Inferior de Indicadores de Estado */}
              <div className="grid grid-cols-3 gap-3 items-center">
                
                {/* Suscripción activa */}
                <div>
                  <span className="text-[10px] font-mono text-[#937b85] uppercase tracking-wider block mb-0.5">
                    Suscripción activa
                  </span>
                  <span className="text-xs font-sans font-bold text-gold-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-gold-400" />
                    {formData.activeSubscription || 'Ninguna'}
                  </span>
                </div>

                {/* Estado del perfil */}
                <div>
                  <span className="text-[10px] font-mono text-[#937b85] uppercase tracking-wider block mb-0.5">
                    Estado del perfil
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-500/50" />
                    <span className="text-xs font-sans font-bold text-emerald-400">
                      {formData.status === 'ACTIVE' ? 'Activo' : formData.status}
                    </span>
                  </div>
                </div>

                {/* Progreso % con barra */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-mono text-[#937b85] uppercase tracking-wider">Progreso</span>
                    <span className="font-mono font-bold text-gold-400 text-xs">{formData.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-[#1b0c13] rounded-full h-1.5 overflow-hidden border border-[#301621]">
                    <div 
                      className="bg-gradient-to-r from-bordeaux-600 via-gold-500 to-amber-300 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${Math.min(100, Math.max(5, formData.overallProgress))}%` }} 
                    />
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* BARRA DE ETIQUETAS HORIZONTAL FULL-WIDTH (PREFERENCIAS, MOTIVACIÓN...)  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#12080c] rounded-2xl border border-[#311721] p-3.5 flex flex-wrap items-center gap-3 shadow-xl">
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#170a10] border border-[#2d151e]">
            <Heart className="w-3.5 h-3.5 text-bordeaux-400" />
            <span className="text-xs font-sans text-gold-300 font-bold">Preferencias:</span>
            <span className="text-xs font-sans text-ivory-200">{formData.preferences}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#170a10] border border-[#2d151e]">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-sans text-cyan-300 font-bold">Motivación:</span>
            <span className="text-xs font-sans text-ivory-200">{formData.motivation}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#170a10] border border-[#2d151e]">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-sans text-amber-300 font-bold">Fetiches:</span>
            <span className="text-xs font-sans text-ivory-200">{formData.fetishes}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#170a10] border border-[#2d151e]">
            <Zap className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-sans text-gold-300 font-bold">Triggers:</span>
            <span className="text-xs font-sans text-ivory-200">{formData.triggers}</span>
          </div>

          <button
            onClick={() => setShowEditDrawer(true)}
            className="text-[11px] font-mono text-gray-500 hover:text-gold-300 underline ml-auto"
          >
            Editar etiquetas
          </button>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* FILA MEDIA: PROGRESO Y MÉRITOS (IZQ) & ÚLTIMA ACTIVIDAD (DER)           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* TARJETA 3: PROGRESO Y MÉRITOS (Col 6) */}
          <div className="lg:col-span-6 bg-[#12080c] rounded-2xl border border-[#311721] p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between pb-3 border-b border-[#24121a]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold-400" />
                  <h3 className="font-brand font-bold text-base text-white">Progreso y méritos</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-gold-500/10 text-gold-400 text-xs font-mono font-bold uppercase tracking-wider border border-gold-500/30">
                  {currentRankName}
                </span>
              </div>

              {/* Donut Chart & Escalafón */}
              <div className="flex items-center gap-6">
                
                {/* Donut SVG con gradiente */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" stroke="#1f0c15" strokeWidth="9" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="url(#progressGradientRing)"
                      strokeWidth="9"
                      fill="transparent"
                      strokeDasharray={238.76}
                      strokeDashoffset={238.76 - (238.76 * formData.overallProgress) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="progressGradientRing" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="50%" stopColor="#e0a96d" />
                        <stop offset="100%" stopColor="#800020" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono font-extrabold text-xl text-white">
                      {formData.overallProgress}%
                    </span>
                  </div>
                </div>

                {/* Info escalafón */}
                <div className="flex-1 space-y-1.5">
                  <h4 className="font-brand font-bold text-base text-white">
                    Escalafón: {currentRankName}
                  </h4>
                  <p className="text-xs text-gray-400 font-sans italic">
                    Devoción, constancia y evolución en la Casa.
                  </p>
                  
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[10px] font-mono text-[#937b85] uppercase">Puntos de experiencia acumulados</span>
                      <span className="font-mono font-bold text-gold-400 text-xs">{formData.experiencePoints} XP</span>
                    </div>
                    <div className="w-full bg-[#1b0c13] rounded-full h-1.5 overflow-hidden border border-[#301621]">
                      <div 
                        className="bg-gradient-to-r from-gold-500 to-amber-300 h-full rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(10, (formData.experiencePoints / 1000) * 100))}%` }} 
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* 4 Cajas de Métricas Inferiores */}
              <div className="grid grid-cols-4 gap-3 pt-3 border-t border-[#24121a]">
                
                <div className="bg-[#170a10] border border-[#2e151f] p-3 rounded-xl text-center">
                  <Crown className="w-3.5 h-3.5 text-gold-400 mx-auto mb-1" />
                  <span className="text-[9px] font-mono text-[#937b85] uppercase block">Méritos (XP)</span>
                  <span className="font-mono font-bold text-base text-white">{formData.experiencePoints}</span>
                </div>

                <div className="bg-[#170a10] border border-[#2e151f] p-3 rounded-xl text-center">
                  <Star className="w-3.5 h-3.5 text-gold-400 mx-auto mb-1" />
                  <span className="text-[9px] font-mono text-[#937b85] uppercase block">Rituales</span>
                  <span className="font-mono font-bold text-base text-white">{ritualsCompleted}/{ritualsCount}</span>
                </div>

                <div className="bg-[#170a10] border border-[#2e151f] p-3 rounded-xl text-center">
                  <Target className="w-3.5 h-3.5 text-bordeaux-400 mx-auto mb-1" />
                  <span className="text-[9px] font-mono text-[#937b85] uppercase block">Entrenamientos</span>
                  <span className="font-mono font-bold text-base text-white">{trainingsCompleted}/{trainingsCount}</span>
                </div>

                <div className="bg-[#170a10] border border-[#2e151f] p-3 rounded-xl text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-[9px] font-mono text-[#937b85] uppercase block">Completadas</span>
                  <span className="font-mono font-bold text-base text-white">{completedAssignmentsCount}/{totalAssignmentsCount}</span>
                </div>

              </div>

            </div>
          </div>

          {/* TARJETA 4: DIARIO DE LA DINÁMICA & HISTORIAL (Col 6) */}
          <div className="lg:col-span-6 bg-[#12080c] rounded-2xl border border-[#311721] p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#24121a]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gold-400" />
                  <h3 className="font-brand font-bold text-base text-white">
                    {dashboardActivityView === 'journal' ? 'Diario de la Dinámica' : 'Actividad del Sistema'}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 bg-[#170a10] p-1 rounded-xl border border-[#2d151e]">
                  <button
                    type="button"
                    onClick={() => setDashboardActivityView('journal')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                      dashboardActivityView === 'journal'
                        ? 'bg-gold-500 text-dark-950 shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>📖 Diario</span>
                    <span className="opacity-90">({(member?.journalEntries || []).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashboardActivityView('system')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                      dashboardActivityView === 'system'
                        ? 'bg-gold-500 text-dark-950 shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>⏱️ Sistema</span>
                  </button>
                </div>
              </div>

              {/* VISTA 1: DIARIO DE LA DINÁMICA EN EL DASHBOARD */}
              {dashboardActivityView === 'journal' && (
                <div className="space-y-3">
                  {(member?.journalEntries || []).length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-[#170a10] border border-[#2e151f] space-y-2">
                      <p className="text-xs text-gray-400 font-sans">
                        No hay anotaciones registradas en el Diario de la Dinámica para este sumiso.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTabSection('diario')}
                        className="py-1 px-3 rounded-lg bg-gold-500/20 text-gold-300 border border-gold-500/40 text-[11px] font-mono hover:bg-gold-500/30"
                      >
                        + Crear primera entrada
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {(member?.journalEntries || []).slice(0, 3).map((entry) => {
                        const cat = JOURNAL_CATEGORIES.find(c => c.id === entry.category) || JOURNAL_CATEGORIES[7];
                        const isPrincesa = entry.authorRole === 'PRINCESA';

                        return (
                          <div 
                            key={entry.id} 
                            className="p-3.5 rounded-xl bg-[#170a10] border border-[#2e151f] hover:border-gold-500/30 transition-all space-y-1.5 shadow-sm"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border flex items-center gap-1 ${
                                  isPrincesa 
                                    ? 'bg-gradient-to-r from-gold-500/20 to-bordeaux-700/30 border-gold-500/50 text-gold-300' 
                                    : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                                }`}>
                                  {isPrincesa ? <Crown className="w-2.5 h-2.5 text-gold-400" /> : <User className="w-2.5 h-2.5 text-cyan-400" />}
                                  {entry.authorName || (isPrincesa ? 'Princesa' : 'Sumiso')}
                                </span>

                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${cat.color}`}>
                                  {cat.icon} {cat.label}
                                </span>
                              </div>

                              <span className="text-[10px] font-mono text-gray-400">
                                {new Date(entry.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {entry.title && (
                              <h5 className="font-sans font-bold text-xs text-white">
                                {entry.title}
                              </h5>
                            )}

                            <p className="text-xs text-gray-300 font-sans leading-relaxed line-clamp-2">
                              {entry.content}
                            </p>
                          </div>
                        );
                      })}

                      <div className="pt-2 flex justify-between items-center border-t border-[#24121a]">
                        <span className="text-[10px] font-mono text-gray-500">
                          Total entradas: {(member?.journalEntries || []).length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTabSection('diario')}
                          className="text-xs font-mono text-gold-400 hover:text-gold-300 flex items-center gap-1"
                        >
                          <span>Ver diario completo & redactar</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VISTA 2: TIMELINE AUTOMÁTICO DEL SISTEMA */}
              {dashboardActivityView === 'system' && (
                <div className="space-y-4 relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-gradient-to-b before:from-cyan-500/60 before:via-bordeaux-500/40 before:to-transparent">
                  {activityTimeline.map((item, idx) => (
                    <div key={item.id || idx} className="relative space-y-0.5">
                      <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
                      
                      <span className="text-[10px] font-mono text-gray-400 block">
                        {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h5 className="text-xs font-sans font-bold text-white">
                        {item.title}
                      </h5>
                      <p className="text-xs text-gray-300 font-sans leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* FILA INFERIOR: DISEÑO DE ENTRENAMIENTO (IZQ) & ACTIVIDADES ASIGNADAS (DER) */}
        {/* ----------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* TARJETA 5: DISEÑO DE ENTRENAMIENTO (Col 5) */}
          <div className="lg:col-span-5 bg-[#12080c] rounded-2xl border border-[#311721] p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <h3 className="font-brand font-bold text-base text-white">Diseño de entrenamiento</h3>
                </div>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Selecciona actividades del sistema para asignar al sumiso.
                </p>
              </div>

              {/* Filtros de Categoría */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { id: 'ALL', label: 'Todas' },
                  { id: 'TASK', label: 'Tareas' },
                  { id: 'RITUAL', label: 'Rituales' },
                  { id: 'PUNISHMENT', label: 'Castigos' },
                  { id: 'REWARD', label: 'Recompensas' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedActivityCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                      selectedActivityCategory === cat.id
                        ? 'bg-gold-500 text-dark-950 font-bold border border-gold-400 shadow-md shadow-gold-500/20'
                        : 'bg-[#180a11] text-gray-400 hover:text-white border border-[#2d151e]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Lista scrolleable de plantillas disponibles */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredTemplates.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-gray-500 bg-[#15090f] rounded-xl border border-[#2d151e]">
                    No hay plantillas en esta categoría.
                  </div>
                ) : (
                  filteredTemplates.map(tpl => (
                    <div 
                      key={tpl.id}
                      className="p-3 rounded-xl bg-[#170a10] border border-[#2e151f] hover:border-gold-500/40 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            tpl.type === 'RITUAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            tpl.type === 'PUNISHMENT' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            tpl.type === 'REWARD' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {tpl.type}
                          </span>
                          <h5 className="font-sans font-bold text-xs text-white truncate">
                            {tpl.title}
                          </h5>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-2 font-sans">
                          {tpl.instructions}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono text-gold-400 font-bold">
                          +{tpl.pointsValue || 20} XP
                        </span>
                        <button
                          onClick={() => handleAssignTemplate(tpl)}
                          className="py-1 px-2.5 rounded-lg bg-gold-500/20 hover:bg-gold-500 text-gold-300 hover:text-dark-950 border border-gold-500/50 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Asignar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* TARJETA 6: ACTIVIDADES ASIGNADAS (OBJETIVOS) (Col 7) */}
          <div className="lg:col-span-7 bg-[#12080c] rounded-2xl border border-[#311721] p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#24121a]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <h3 className="font-brand font-bold text-base text-white">Actividades asignadas</h3>
                </div>

                <button
                  onClick={() => setShowNewActivityModal(true)}
                  className="py-1.5 px-3 rounded-lg bg-bordeaux-700/80 hover:bg-bordeaux-600 border border-gold-500/40 text-gold-200 text-xs font-sans font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva actividad</span>
                </button>
              </div>

              {/* Tabla de Actividades Asignadas */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#2d151e] text-[10px] font-mono uppercase text-[#937b85] tracking-wider">
                      <th className="pb-2">Actividad</th>
                      <th className="pb-2">Tipo</th>
                      <th className="pb-2">Estado</th>
                      <th className="pb-2">Fecha límite</th>
                      <th className="pb-2">Prioridad</th>
                      <th className="pb-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#24121a]">
                    {assignments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs font-mono text-gray-500">
                          No hay actividades asignadas actualmente. Utiliza el panel izquierdo para asignar.
                        </td>
                      </tr>
                    ) : (
                      assignments.map(a => {
                        const isDone = a.status === 'COMPLETED' || a.status === 'COMPLETED_ON_TIME';
                        return (
                          <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 font-semibold text-white max-w-[200px] truncate pr-2">
                              {a.title}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                a.type === 'RITUAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                a.type === 'PUNISHMENT' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {a.type}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                isDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {isDone ? 'Completada' : 'Asignada'}
                              </span>
                            </td>
                            <td className="py-3 text-gray-400 font-mono text-[11px]">
                              {a.dueDate ? new Date(a.dueDate).toLocaleDateString('es-ES') : '—'}
                            </td>
                            <td className="py-3">
                              <span className={`text-[10px] font-mono font-bold uppercase ${
                                a.priority === 'HIGH' ? 'text-red-400' : 'text-gray-300'
                              }`}>
                                {a.priority || 'Normal'}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleUpdateAssignmentStatus(a.id, isDone ? 'ASSIGNED' : 'COMPLETED')}
                                  className={`p-1.5 rounded transition-colors ${
                                    isDone 
                                      ? 'text-emerald-400 hover:text-white bg-emerald-500/20' 
                                      : 'text-gray-400 hover:text-emerald-300 bg-[#1b0c13]'
                                  }`}
                                  title={isDone ? 'Marcar pendiente' : 'Marcar completada'}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAssignment(a.id)}
                                  className="p-1.5 rounded text-gray-400 hover:text-red-400 bg-[#1b0c13] transition-colors"
                                  title="Eliminar asignación"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PANELES DE FUNCIONALIDAD COMPLETA ADICIONAL (FINANZAS, REQUISITOS...)     */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#12080c] rounded-2xl border border-[#311721] p-5 shadow-2xl space-y-5">
          
          {/* Navegador de secciones complementarias */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#2d151e] pb-3 gap-2">
            <div className="flex items-center gap-2">
              {[
                { id: 'diario', label: `📖 Diario de la Dinámica (${(member?.journalEntries || []).length})` },
                { id: 'finanzas', label: 'Historial Financiero & Pagos' },
                { id: 'requisitos', label: 'Requisitos & Suscripciones' },
                { id: 'habilidades', label: 'Habilidades Técnicas' },
                { id: 'notas', label: 'Notas Confidenciales' }
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setActiveTabSection(activeTabSection === sec.id ? 'dashboard' : sec.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition-all ${
                    activeTabSection === sec.id
                      ? 'bg-gold-500 text-dark-950 border border-gold-300 shadow-md shadow-gold-500/20'
                      : 'bg-[#180a11] text-gray-300 hover:text-white border border-[#2d151e]'
                  }`}
                >
                  {sec.label} {activeTabSection === sec.id ? '▲' : '▼'}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-mono text-[#937b85] uppercase">
              Controles Avanzados del CRM
            </span>
          </div>

          {/* SECCIÓN 0: DIARIO DE LA DINÁMICA (HISTORIAL NARRATIVO Y CUALITATIVO) */}
          {activeTabSection === 'diario' && (
            <div className="space-y-6 animate-fade-in pt-2">
              
              {/* Cabecera y Switch de Permiso del Sumiso */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#170a10] border border-[#2e151f]">
                <div>
                  <h4 className="font-brand font-bold text-base text-gold-300 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gold-400" />
                    Diario de la Dinámica D/s & Evolución
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Registro cualitativo de la relación: acuerdos, cambios de conducta, sensaciones, avances, incidencias y notas de contexto.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#0e0408] px-4 py-2.5 rounded-xl border border-[#3e1b29] shrink-0">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">Acceso de escritura del sumiso</span>
                    <span className={`text-xs font-mono font-bold ${member?.journalAccess !== false ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {member?.journalAccess !== false ? 'Habilitado (Puede escribir)' : 'Restringido (Solo lectura)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleJournalAccess}
                    disabled={togglingJournalAccess}
                    className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold border transition-all ${
                      member?.journalAccess !== false
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    {togglingJournalAccess ? 'Actualizando...' : (member?.journalAccess !== false ? 'Bloquear Escritura' : 'Permitir Escritura')}
                  </button>
                </div>
              </div>

              {/* FORMULARIO: AÑADIR NUEVA ENTRADA (PRINCESA) */}
              <form onSubmit={handleAddJournalEntry} className="p-5 rounded-xl bg-[#160910] border border-gold-500/30 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#2d151e] pb-2">
                  <span className="text-xs font-mono font-bold text-gold-300 uppercase flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-gold-400" />
                    Nueva Entrada en el Diario (Princesa Yakuza)
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Quedará registrada cronológicamente</span>
                </div>

                {/* Chips de Categorías */}
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1.5">
                    Tipo de Anotación / Categoría *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {JOURNAL_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewJournalEntry({ ...newJournalEntry, category: cat.id })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
                          newJournalEntry.category === cat.id
                            ? `${cat.color} font-bold shadow-md ring-1 ring-gold-400/50`
                            : 'bg-[#10050a] text-gray-400 border-[#2a131c] hover:text-white'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Título opcional y Fecha */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">
                      Título o Resumen Breve (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Acuerdo sobre límites en sesión privada, Cambio de conducta matutina..."
                      value={newJournalEntry.title}
                      onChange={e => setNewJournalEntry({ ...newJournalEntry, title: e.target.value })}
                      className="w-full bg-[#0e0408] border border-[#3e1b29] rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">
                      Fecha del Suceso / Registro
                    </label>
                    <input
                      type="date"
                      value={newJournalEntry.date}
                      onChange={e => setNewJournalEntry({ ...newJournalEntry, date: e.target.value })}
                      className="w-full bg-[#0e0408] border border-[#3e1b29] rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Contenido Narrativo */}
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">
                    Contenido Narrativo de la Dinámica *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe qué ha ocurrido, acuerdos pactados, observaciones sobre su devoción, cambios de actitud, avances logrados, incidencias o sensaciones relevantes..."
                    value={newJournalEntry.content}
                    onChange={e => setNewJournalEntry({ ...newJournalEntry, content: e.target.value })}
                    className="w-full bg-[#0e0408] border border-[#3e1b29] rounded-lg p-3 text-xs text-white leading-relaxed placeholder:text-gray-600"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={addingJournalEntry}
                    className="py-2.5 px-6 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-gold-500/20"
                  >
                    <Save className="w-4 h-4" />
                    {addingJournalEntry ? 'Guardando...' : 'Guardar Entrada en el Diario'}
                  </button>
                </div>
              </form>

              {/* BARRA DE FILTROS & HISTORIAL */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d151e] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">Filtrar por categoría:</span>
                    <select
                      value={journalCategoryFilter}
                      onChange={e => setJournalCategoryFilter(e.target.value)}
                      className="bg-[#0e0408] border border-[#3e1b29] text-gold-300 text-xs rounded-lg px-2.5 py-1 font-mono"
                    >
                      <option value="ALL">Todas las categorías</option>
                      {JOURNAL_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">Autor:</span>
                    <select
                      value={journalAuthorFilter}
                      onChange={e => setJournalAuthorFilter(e.target.value)}
                      className="bg-[#0e0408] border border-[#3e1b29] text-gray-200 text-xs rounded-lg px-2.5 py-1 font-mono"
                    >
                      <option value="ALL">Todos los autores</option>
                      <option value="PRINCESA">👑 Solo Princesa</option>
                      <option value="SUMISO">⛓️ Solo Sumiso</option>
                    </select>
                  </div>

                  <span className="text-xs font-mono text-gray-500">
                    {filteredJournalEntries.length} entradas registradas
                  </span>
                </div>

                {/* LISTADO CRONOLÓGICO DE ENTRADAS DEL DIARIO */}
                <div className="space-y-3">
                  {filteredJournalEntries.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-[#170a10] border border-[#2e151f] text-gray-500 font-mono text-xs">
                      No hay entradas en el diario que coincidan con los filtros seleccionados.
                    </div>
                  ) : (
                    filteredJournalEntries.map((entry) => {
                      const cat = JOURNAL_CATEGORIES.find(c => c.id === entry.category) || JOURNAL_CATEGORIES[7];
                      const isPrincesa = entry.authorRole === 'PRINCESA';

                      return (
                        <div
                          key={entry.id}
                          className="p-5 rounded-xl bg-[#15080f] border border-[#2e151f] hover:border-gold-500/40 transition-all space-y-3 shadow-md relative group"
                        >
                          {/* Cabecera de la entrada */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#26111a] pb-2.5">
                            <div className="flex items-center gap-2.5">
                              {/* Insignia de autor */}
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border flex items-center gap-1.5 shadow-sm ${
                                isPrincesa 
                                  ? 'bg-gradient-to-r from-gold-500/25 to-bordeaux-700/35 border-gold-500/60 text-gold-300' 
                                  : 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300'
                              }`}>
                                {isPrincesa ? <Crown className="w-3 h-3 text-gold-400" /> : <User className="w-3 h-3 text-cyan-400" />}
                                {entry.authorName || (isPrincesa ? 'Princesa Yakuza' : 'Sumiso')}
                              </span>

                              {/* Chip de categoría */}
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${cat.color}`}>
                                {cat.icon} {cat.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-mono text-gray-400">
                                📅 {new Date(entry.createdAt).toLocaleDateString('es-ES', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleDeleteJournalEntry(entry.id)}
                                title="Eliminar entrada del diario"
                                className="p-1 rounded text-gray-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Título de la entrada */}
                          {entry.title && (
                            <h5 className="font-serif font-bold text-sm text-gold-200">
                              {entry.title}
                            </h5>
                          )}

                          {/* Contenido narrativo */}
                          <p className="text-xs text-gray-200 font-sans leading-relaxed whitespace-pre-wrap">
                            {entry.content}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* SECCIÓN 1: FINANZAS COMPLETAS & REGISTRO DE TRIBUTOS */}
          {activeTabSection === 'finanzas' && (
            <div className="space-y-6 animate-fade-in pt-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#170a10] p-4 rounded-xl border border-[#2e151f]">
                <div>
                  <h4 className="font-brand font-bold text-sm text-gold-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gold-400" /> Registro de Tributos & Ajuste de Ingresos
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Modifica manualmente el total aportado o registra ingresos individuales con método de pago y fecha.
                  </p>
                </div>
              </div>

              {/* Formulario Añadir Tributo */}
              <form onSubmit={handleAddTribute} className="bg-[#170a10] p-4 rounded-xl border border-[#2e151f] grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Importe (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newTribute.amount}
                    onChange={e => setNewTribute({ ...newTribute, amount: e.target.value })}
                    placeholder="50"
                    className="w-full bg-[#0e0408] border border-[#3e1b29] rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Concepto</label>
                  <input
                    type="text"
                    required
                    value={newTribute.concept}
                    onChange={e => setNewTribute({ ...newTribute, concept: e.target.value })}
                    className="w-full bg-[#0e0408] border border-[#3e1b29] rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Método de pago</label>
                  <select
                    value={newTribute.paymentMethod}
                    onChange={e => setNewTribute({ ...newTribute, paymentMethod: e.target.value })}
                    className="w-full bg-[#0e0408] border border-[#3e1b29] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="BIZUM">Bizum</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="CRYPTO">Cripto</option>
                    <option value="CASH">Efectivo / Presencial</option>
                    <option value="WISHLIST">Regalo Wishlist</option>
                    <option value="CARD">Tarjeta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Fecha</label>
                  <input
                    type="date"
                    value={newTribute.date}
                    onChange={e => setNewTribute({ ...newTribute, date: e.target.value })}
                    className="w-full bg-[#0e0408] border border-[#3e1b29] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={addingTribute}
                    className="w-full py-2 px-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase transition-colors"
                  >
                    {addingTribute ? 'Guardando...' : '+ Registrar'}
                  </button>
                </div>
              </form>

              {/* Tabla de Historial Financiero */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#2d151e] text-[10px] font-mono uppercase text-[#937b85]">
                      <th className="pb-2">Fecha</th>
                      <th className="pb-2">Tipo</th>
                      <th className="pb-2">Concepto</th>
                      <th className="pb-2">Método</th>
                      <th className="pb-2">Importe</th>
                      <th className="pb-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#24121a]">
                    {combinedHistory.length === 0 ? (
                      <tr><td colSpan={6} className="py-4 text-center text-gray-500 font-mono">Sin transacciones registradas</td></tr>
                    ) : (
                      combinedHistory.map((item, i) => (
                        <tr key={item.id || i} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 font-mono text-[11px] text-gray-400">
                            {new Date(item.date).toLocaleDateString('es-ES')}
                          </td>
                          <td className="py-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-gold-500/20 text-gold-300 border border-gold-500/30">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-2.5 text-white font-medium">{item.concept}</td>
                          <td className="py-2.5 text-gray-400 font-mono">{item.method || '—'}</td>
                          <td className="py-2.5 font-mono font-bold text-emerald-400">€{item.amount}</td>
                          <td className="py-2.5 text-right">
                            {item.isTribute && (
                              <button
                                onClick={() => handleDeleteTribute(item.id)}
                                className="text-gray-500 hover:text-red-400 p-1"
                                title="Eliminar tributo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECCIÓN 2: REQUISITOS DEL REINO */}
          {activeTabSection === 'requisitos' && (
            <div className="space-y-4 animate-fade-in pt-2">
              <h4 className="font-brand font-bold text-sm text-gold-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gold-400" /> Requisitos de Permanencia & Estatus
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(member?.requirements || []).length === 0 ? (
                  <div className="p-4 text-xs font-mono text-gray-500 bg-[#170a10] rounded-xl border border-[#2e151f]">
                    Sin requisitos específicos configurados para este rango.
                  </div>
                ) : (
                  (member.requirements || []).map(req => (
                    <div key={req.id} className="p-3 bg-[#170a10] border border-[#2e151f] rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-white block">{req.definition?.name || 'Requisito'}</span>
                        <span className="text-[10px] text-gray-400 font-sans block">{req.definition?.description || ''}</span>
                      </div>
                      <button
                        onClick={() => handleToggleRequirement(req.definitionId, req.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                          req.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-dark-900 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {req.status === 'COMPLETED' ? 'Cumplido ✓' : 'Pendiente ⏳'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: HABILIDADES TÉCNICAS */}
          {activeTabSection === 'habilidades' && (
            <div className="space-y-4 animate-fade-in pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-brand font-bold text-sm text-gold-300 flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold-400" /> Habilidades Técnicas del Sumiso
                </h4>
              </div>

              {/* Lista de Habilidades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(member?.skills || []).length === 0 ? (
                  <div className="col-span-full p-4 text-xs font-mono text-gray-500 bg-[#170a10] rounded-xl text-center">
                    No se han registrado habilidades para este perfil.
                  </div>
                ) : (
                  (member.skills || []).map(s => (
                    <div key={s.id} className="p-3 bg-[#170a10] border border-[#2e151f] rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-gold-400 font-bold block">{s.skillCategory}</span>
                        <span className="text-xs font-bold text-white block">{s.skillName}</span>
                        <span className="text-[10px] text-gray-400 font-sans">{s.level} · {s.notes}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSkill(s.id)}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Formulario Añadir Habilidad */}
              <form onSubmit={handleAddSkill} className="bg-[#170a10] p-4 rounded-xl border border-[#2e151f] flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Nombre de habilidad (ej: Edición de Video)"
                  value={newSkill.skillName}
                  onChange={e => setNewSkill({ ...newSkill, skillName: e.target.value })}
                  className="flex-1 bg-[#0e0408] border border-[#3e1b29] rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <select
                  value={newSkill.skillCategory}
                  onChange={e => setNewSkill({ ...newSkill, skillCategory: e.target.value })}
                  className="bg-[#0e0408] border border-[#3e1b29] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                >
                  <option value="VIDEO_EDITING">Video Editing</option>
                  <option value="DESIGN">Design</option>
                  <option value="LANGUAGES">Languages</option>
                  <option value="PROGRAMMING">Web / Support</option>
                  <option value="LOGISTICS">Logistics</option>
                </select>
                <button
                  type="submit"
                  disabled={addingSkill}
                  className="py-1.5 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase"
                >
                  + Añadir
                </button>
              </form>
            </div>
          )}

          {/* SECCIÓN 4: NOTAS CONFIDENCIALES */}
          {activeTabSection === 'notas' && (
            <div className="space-y-4 animate-fade-in pt-2">
              <h4 className="font-brand font-bold text-sm text-gold-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold-400" /> Notas Confidenciales de la Princesa
              </h4>

              <div className="space-y-2">
                {(member?.notes || []).length === 0 ? (
                  <p className="text-xs font-mono text-gray-500 bg-[#170a10] p-4 rounded-xl">Sin notas registradas</p>
                ) : (
                  (member.notes || []).map(n => (
                    <div key={n.id} className="p-3 bg-[#170a10] border border-[#2e151f] rounded-xl flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 block mb-1">
                          {new Date(n.createdAt).toLocaleString('es-ES')} · por {n.author || 'Princesa'}
                        </span>
                        <p className="text-xs text-white font-sans whitespace-pre-wrap">{n.note}</p>
                      </div>
                      <button onClick={() => handleDeleteNote(n.id)} className="text-gray-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribir nota confidencial sobre este sumiso..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="flex-1 bg-[#0e0408] border border-[#3e1b29] rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  disabled={addingNote}
                  className="py-2 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase"
                >
                  Guardar Nota
                </button>
              </form>
            </div>
          )}

        </div>

      </main>

      {/* ========================================================================= */}
      {/* 4. MODAL LATERAL EDITAR PERFIL COMPLETO (TOGGLEABLE)                      */}
      {/* ========================================================================= */}
      {showEditDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#12080c] border border-gold-500/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-white custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#2d151e]">
              <div>
                <h3 className="font-brand font-bold text-lg text-gold-300">Editar Perfil del Sumiso</h3>
                <span className="text-[10px] font-mono text-gray-400">Actualiza los datos del dossier #{formData.memberNumber}</span>
              </div>
              <button onClick={() => setShowEditDrawer(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Alias</label>
                  <input
                    type="text"
                    required
                    value={formData.alias}
                    onChange={e => handleFieldChange('alias', e.target.value)}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Nº Miembro</label>
                  <input
                    type="text"
                    value={formData.memberNumber}
                    onChange={e => handleFieldChange('memberNumber', e.target.value)}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Telegram (@usuario)</label>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={e => handleFieldChange('telegram', e.target.value)}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => handleFieldChange('email', e.target.value)}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Edad</label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={e => handleFieldChange('age', e.target.value)}
                    placeholder="23"
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Profesión / Función</label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={e => handleFieldChange('profession', e.target.value)}
                    placeholder="Ingeniero Becario"
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Cita de Devoción</label>
                <input
                  type="text"
                  value={formData.quote}
                  onChange={e => handleFieldChange('quote', e.target.value)}
                  className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-gold-200 font-serif italic"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Sirve desde</label>
                  <input
                    type="text"
                    value={formData.servedSince}
                    onChange={e => handleFieldChange('servedSince', e.target.value)}
                    placeholder="28 sept 2026"
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Tributo inicial</label>
                  <input
                    type="text"
                    value={formData.initialTribute}
                    onChange={e => handleFieldChange('initialTribute', e.target.value)}
                    placeholder="Pendiente / 50€"
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Rango / Estamento Actual</label>
                  <select
                    value={formData.groupId}
                    onChange={e => handleFieldChange('groupId', e.target.value)}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">Sin rango</option>
                    {allGroupsState.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({g.badge})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Rango Objetivo</label>
                  <select
                    value={formData.targetGroupId}
                    onChange={e => handleFieldChange('targetGroupId', e.target.value)}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">Sin objetivo</option>
                    {allGroupsState.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Progreso (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.overallProgress}
                    onChange={e => handleFieldChange('overallProgress', parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Puntos XP</label>
                  <input
                    type="number"
                    value={formData.experiencePoints}
                    onChange={e => handleFieldChange('experiencePoints', parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">URL Avatar / Fotografía</label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={e => handleFieldChange('avatarUrl', e.target.value)}
                  placeholder="https://ejemplo.com/avatar.jpg"
                  className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Preferencias</label>
                <input
                  type="text"
                  value={formData.preferences}
                  onChange={e => handleFieldChange('preferences', e.target.value)}
                  className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Fetiches</label>
                <input
                  type="text"
                  value={formData.fetishes}
                  onChange={e => handleFieldChange('fetishes', e.target.value)}
                  className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Triggers</label>
                <input
                  type="text"
                  value={formData.triggers}
                  onChange={e => handleFieldChange('triggers', e.target.value)}
                  className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#2d151e]">
                <button
                  type="button"
                  onClick={() => setShowEditDrawer(false)}
                  className="py-2 px-4 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2 px-6 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL NUEVA ACTIVIDAD / ENTRENAMIENTO PERSONALIZADO                    */}
      {/* ========================================================================= */}
      {showNewActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#12080c] border border-gold-500/50 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-white">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#2d151e]">
              <div>
                <h3 className="font-brand font-bold text-lg text-gold-300">Asignar Nueva Actividad / Objetivo</h3>
                <span className="text-[10px] font-mono text-gray-400">Para {formData.alias}</span>
              </div>
              <button onClick={() => setShowNewActivityModal(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomActivity} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Título de la Actividad</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Limpieza de calzado y reporte"
                  value={newObjective.title}
                  onChange={e => setNewObjective({ ...newObjective, title: e.target.value })}
                  className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Tipo</label>
                  <select
                    value={newObjective.type}
                    onChange={e => setNewObjective({ ...newObjective, type: e.target.value })}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="TASK">Tarea</option>
                    <option value="RITUAL">Ritual</option>
                    <option value="PUNISHMENT">Castigo</option>
                    <option value="REWARD">Recompensa</option>
                    <option value="GOAL">Meta / Escalafón</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Días límite</label>
                  <input
                    type="number"
                    min="1"
                    value={newObjective.dueDays}
                    onChange={e => setNewObjective({ ...newObjective, dueDays: e.target.value })}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Puntos XP Otorgados</label>
                  <input
                    type="number"
                    value={newObjective.pointsAwarded}
                    onChange={e => setNewObjective({ ...newObjective, pointsAwarded: e.target.value })}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Prioridad</label>
                  <select
                    value={newObjective.priority}
                    onChange={e => setNewObjective({ ...newObjective, priority: e.target.value })}
                    className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Instrucciones Específicas</label>
                <textarea
                  rows="3"
                  placeholder="Detalla cómo debe cumplirse la tarea..."
                  value={newObjective.customInstructions}
                  onChange={e => setNewObjective({ ...newObjective, customInstructions: e.target.value })}
                  className="w-full bg-[#180a11] border border-[#381a25] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewActivityModal(false)}
                  className="py-2 px-4 rounded-lg bg-dark-900 border border-gray-700 text-gray-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addingObjective}
                  className="py-2 px-5 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs uppercase"
                >
                  {addingObjective ? 'Asignando...' : 'Asignar Actividad'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
