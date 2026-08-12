import React, { useState, useEffect, useRef } from 'react';
import { Package, Plus, Edit, Trash2, Eye, EyeOff, ShieldAlert, Sparkles, RefreshCw, CheckCircle, Clock, Filter, Lock, Save, Copy, Upload, Image as ImageIcon, X, Heart } from 'lucide-react';
import { API_BASE, resolveMediaUrl } from '../config';
import princessVideo from '../princess-yakuza.mp4';
import { MediaPickerModal } from './MediaPickerModal';

export default function AdminPanel({ onBackToStore }) {

  const [token, setToken] = useState(localStorage.getItem('yakuza_admin_token') || '');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('orders'); // orders, items, categories, reviews, banner, extras, packaging

  // Data states
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banner, setBanner] = useState({ badge: '', title: '', subtitle: '', bgImageUrl: '', buttonText: '' });
  const [extras, setExtras] = useState([]);
  const [packaging, setPackaging] = useState([]);
  const [loading, setLoading] = useState(false);

  // Media Picker Modal State
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState('item_images');

  // Drag & drop state
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState(null);

  // Edit Category Modal State
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', active: true, order: 0 });

  // Edit Review Modal State
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ itemId: '', author: '', rating: 5, text: '', active: true, mediaUrls: [] });

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    code: '',
    name: '',
    description: '',
    conditionsHtml: '',
    basePrice: 50,
    status: 'AVAILABLE',
    stock: 1,
    categoryId: '',
    featured: false,
    images: []
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit Extra Modal State
  const [editingExtra, setEditingExtra] = useState(null);
  const [extraForm, setExtraForm] = useState({
    name: '',
    description: '',
    price: 15,
    unitType: 'UNITS',
    maxQuantity: 10,
    available: true
  });

  // Edit Packaging Modal State
  const [editingPackaging, setEditingPackaging] = useState(null);
  const [packagingForm, setPackagingForm] = useState({
    name: '',
    description: '',
    price: 0,
    optionType: 'STANDARD',
    active: true
  });

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [internalNotesInput, setInternalNotesInput] = useState('');

  // Easter Egg state
  const [easterEggOpen, setEasterEggOpen] = useState(false);
  const videoRef = useRef(null);

  const orderStatuses = [
    'PAGO_PENDIENTE',
    'PAGADO',
    'PENDIENTE_VERIFICACION',
    'VERIFICADO',
    'EN_PREPARACION',
    'CONTACTADO',
    'PENDIENTE_ENVIO',
    'ENVIADO',
    'COMPLETADO',
    'CANCELADO',
    'REEMBOLSADO'
  ];

  // Auto Login or verify token
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/portfolio/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas');

      localStorage.setItem('yakuza_admin_token', data.token);
      setToken(data.token);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('yakuza_admin_token');
    setToken('');
  };

  // Fetch all admin datasets
  const fetchAllData = () => {
    if (!token) return;
    setLoading(true);

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE}/api/store/admin/orders`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/store/admin/items`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/store/admin/categories`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/store/admin/item-reviews`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/store/banner`).then(r => r.json()),
      fetch(`${API_BASE}/api/store/admin/extras`, { headers }).then(r => r.json()),
      fetch(`${API_BASE}/api/store/admin/packaging`, { headers }).then(r => r.json())
    ])
      .then(([ordersData, itemsData, categoriesData, reviewsData, bannerData, extrasData, packagingData]) => {
        if (ordersData?.error || itemsData?.error || categoriesData?.error) {
          console.warn('[AdminPanel] Token de sesión expirado o inválido. Cerrando sesión...');
          handleLogout();
          setLoginError('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión para ver los artículos.');
          setLoading(false);
          return;
        }
        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(itemsData)) setItems(itemsData);
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
        if (Array.isArray(reviewsData)) setReviews(reviewsData);
        if (bannerData && typeof bannerData === 'object') setBanner(bannerData);
        if (Array.isArray(extrasData)) setExtras(extrasData);
        if (Array.isArray(packagingData)) setPackaging(packagingData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) fetchAllData();
  }, [token]);

  // Seed default demo data if needed
  const handleSeedDefault = async () => {
    if (!confirm('¿Deseas inicializar los datos por defecto (artículos, extras y embalajes)?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/store/admin/seed-default`, {
        method: 'POST',

        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      alert(data.message || 'Datos inicializados');
      fetchAllData();
    } catch (err) {
      alert('Error inicializando datos');
    }
  };

  // Image Upload handler
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch(`${API_BASE}/api/store/admin/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir imagen');

      if (data.urls && Array.isArray(data.urls)) {
        setItemForm(prev => ({
          ...prev,
          images: [...prev.images, ...data.urls]
        }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setItemForm(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (idx) => {
    setItemForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/store/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderStatus: newStatus,
          internalNotes: internalNotesInput
        })
      });
      const updated = await res.json();
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      alert('Error actualizando pedido');
    }
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem?.id ? `${API_BASE}/api/store/admin/items/${editingItem.id}` : `${API_BASE}/api/store/admin/items`;
      const method = editingItem?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(itemForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error guardando artículo');

      setEditingItem(null);
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este artículo?')) return;
    try {
      await fetch(`${API_BASE}/api/store/admin/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllData();
    } catch (err) {
      alert('Error al eliminar artículo');
    }
  };

  const handleToggleItemActive = async (item) => {
    try {
      const nextActive = item.active === false ? true : false;
      const res = await fetch(`${API_BASE}/api/store/admin/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ active: nextActive })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error cambiando visibilidad');
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Save Extra
  const handleSaveExtra = async (e) => {
    e.preventDefault();
    try {
      const url = editingExtra?.id ? `${API_BASE}/api/store/admin/extras/${editingExtra.id}` : `${API_BASE}/api/store/admin/extras`;
      const method = editingExtra?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(extraForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error guardando extra');

      setEditingExtra(null);
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteExtra = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este extra?')) return;
    try {
      await fetch(`${API_BASE}/api/store/admin/extras/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllData();
    } catch (err) {
      alert('Error al eliminar extra');
    }
  };

  // Save Packaging
  const handleSavePackaging = async (e) => {
    e.preventDefault();
    try {
      const url = editingPackaging?.id ? `${API_BASE}/api/store/admin/packaging/${editingPackaging.id}` : `${API_BASE}/api/store/admin/packaging`;
      const method = editingPackaging?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(packagingForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error guardando opción de embalaje');

      setEditingPackaging(null);
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Category Save / Delete / Reorder
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategory?.id ? `${API_BASE}/api/store/admin/categories/${editingCategory.id}` : `${API_BASE}/api/store/admin/categories`;
      const method = editingCategory?.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error guardando categoría');
      setEditingCategory(null);
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
      await fetch(`${API_BASE}/api/store/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllData();
    } catch (err) {
      alert('Error al eliminar categoría');
    }
  };

  const handleCategoryDrop = async (dropIndex) => {
    if (draggedCategoryIndex === null || draggedCategoryIndex === dropIndex) return;
    const next = [...categories];
    const [moved] = next.splice(draggedCategoryIndex, 1);
    next.splice(dropIndex, 0, moved);
    setCategories(next);
    setDraggedCategoryIndex(null);
    try {
      await fetch(`${API_BASE}/api/store/admin/categories/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: next.map((cat, order) => ({ id: cat.id, order })) })
      });
    } catch (e) {
      alert('Error reordenando categorías');
    }
  };

  // Item Drop Reorder
  const handleItemDrop = async (dropIndex) => {
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;
    const next = [...items];
    const [moved] = next.splice(draggedItemIndex, 1);
    next.splice(dropIndex, 0, moved);
    setItems(next);
    setDraggedItemIndex(null);
    try {
      await fetch(`${API_BASE}/api/store/admin/items/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: next.map((it, order) => ({ id: it.id, order })) })
      });
    } catch (e) {
      alert('Error reordenando artículos');
    }
  };

  // Item Media Upload (Photos & Videos up to 200MB)
  const handleItemMediaUpload = async (itemId, files) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    try {
      const res = await fetch(`${API_BASE}/api/store/admin/items/${itemId}/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error subiendo multimedia');
      alert('Multimedia subida correctamente');
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteItemMedia = async (itemId, mediaId) => {
    if (!confirm('¿Eliminar este elemento multimedia?')) return;
    try {
      await fetch(`${API_BASE}/api/store/admin/items/${itemId}/media/${mediaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllData();
    } catch (err) {
      alert('Error al eliminar multimedia');
    }
  };

  // Reviews Save / Delete
  const handleSaveReview = async (e) => {
    e.preventDefault();
    try {
      const url = editingReview?.id ? `${API_BASE}/api/store/admin/item-reviews/${editingReview.id}` : `${API_BASE}/api/store/admin/items/${reviewForm.itemId}/reviews`;
      const method = editingReview?.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(reviewForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error guardando reseña');
      setEditingReview(null);
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta reseña?')) return;
    try {
      await fetch(`${API_BASE}/api/store/admin/item-reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllData();
    } catch (err) {
      alert('Error al eliminar reseña');
    }
  };

  // Banner Save
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/store/admin/banner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(banner)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error guardando portada');
      alert('Portada / Banner del Hero actualizado correctamente.');
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };


  // Login Form View if unauthenticated
  if (!token) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-modal rounded-2xl text-gray-100 shadow-2xl">
        <div className="text-center mb-6">
          <Lock className="w-10 h-10 text-crimson-500 mx-auto mb-2" />
          <h2 className="font-sans font-bold text-xl text-white">Panel de Administración Yakuza</h2>
          <p className="text-xs text-gray-400">Introduce tus credenciales para acceder a la gestión.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1">Email de Admin</label>
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="admin@yakuza.com"
              className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-400"
              required
            />
          </div>

          {loginError && (
            <p className="text-xs text-crimson-400 bg-crimson-600/10 p-2 rounded border border-crimson-500/20">{loginError}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onBackToStore}
              className="py-2.5 px-4 rounded-xl border border-gray-800 text-xs text-gray-400"
            >
              Volver
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase"
            >
              Acceder
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-gray-100">
      
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-800">
        <div>
          <span className="text-xs font-mono text-gold-400 uppercase tracking-widest block">Panel Privado</span>
          <h1 className="font-sans font-extrabold text-2xl text-white">Gestión de Yakuza Store</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDefault}
            className="py-2 px-3 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 text-xs font-mono flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Cargar Datos por Defecto
          </button>
          <button
            onClick={handleLogout}
            className="py-2 px-3 rounded-lg bg-dark-900 border border-gray-800 text-gray-400 hover:text-white text-xs font-mono"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-800 overflow-x-auto pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-4 rounded-t-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-crimson-600 text-white border-b-2 border-crimson-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Pedidos ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`py-2 px-4 rounded-t-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'items' ? 'bg-crimson-600 text-white border-b-2 border-crimson-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Artículos & Drag/Drop ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`py-2 px-4 rounded-t-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'categories' ? 'bg-crimson-600 text-white border-b-2 border-crimson-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Categorías ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-2 px-4 rounded-t-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'reviews' ? 'bg-crimson-600 text-white border-b-2 border-crimson-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Reseñas & Fotos ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('banner')}
          className={`py-2 px-4 rounded-t-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'banner' ? 'bg-crimson-600 text-white border-b-2 border-crimson-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Portada / Hero
        </button>

        <button
          onClick={() => setActiveTab('extras')}
          className={`py-2 px-4 rounded-t-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'extras' ? 'bg-crimson-600 text-white border-b-2 border-crimson-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Extras ({extras.length})
        </button>

        <button
          onClick={() => setActiveTab('packaging')}
          className={`py-2 px-4 rounded-t-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'packaging' ? 'bg-crimson-600 text-white border-b-2 border-crimson-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Embalaje ({packaging.length})
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Mostrando todos los pedidos en tiempo real</span>
            <button onClick={fetchAllData} className="text-gold-400 hover:underline flex items-center gap-1 font-mono">
              <RefreshCw className="w-3.5 h-3.5" /> Actualizar
            </button>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden border border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-dark-950 text-gray-400 uppercase border-b border-gray-800">
                  <tr>
                    <th className="p-3.5">Pedido</th>
                    <th className="p-3.5">Artículo / Modalidad</th>
                    <th className="p-3.5">Comprador (Alias)</th>
                    <th className="p-3.5">Canal de Contacto</th>
                    <th className="p-3.5">Gestión Vinted</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Estado Pago</th>
                    <th className="p-3.5">Estado Pedido</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-gray-500 font-mono">
                        No hay pedidos registrados.
                      </td>
                    </tr>
                  ) : (
                    orders.map(ord => (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-gold-400">{ord.orderNumber}</td>
                        <td className="p-3.5">
                          <span className="text-white block font-sans font-semibold">{ord.itemName}</span>
                          <span className="text-[10px] text-gray-400">{ord.tierName}</span>
                        </td>
                        <td className="p-3.5 font-sans font-medium text-white">{ord.alias}</td>
                        <td className="p-3.5">
                          <span className="text-crimson-400 font-bold block">{ord.contactChannel}</span>
                          <span className="text-[10px] text-gray-300">{ord.contactHandle}</span>
                        </td>
                        <td className="p-3.5 text-gray-300">
                          {ord.vintedPreference === 'VINTED' ? 'Vinted 🛒' : ord.vintedPreference === 'DECIDE_LATER' ? 'Decidir luego' : 'Directa'}
                        </td>
                        <td className="p-3.5 font-sans font-bold text-white text-sm">{ord.totalAmount.toFixed(2)}€</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ord.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-dark-950 border border-gray-700 rounded px-2 py-1 text-[11px] text-white focus:border-crimson-500"
                          >
                            {orderStatuses.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setInternalNotesInput(ord.internalNotes || '');
                            }}
                            className="p-1.5 rounded bg-dark-900 border border-gray-700 text-gray-300 hover:text-white"
                            title="Ver Detalle Pedido"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ITEMS & CONDITIONS EDITOR WITH DRAG & DROP */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-sans font-bold text-lg text-white">Artículos y Drag & Drop</h3>
              <p className="text-xs text-gray-400">Arrastra y suelta las tarjetas para reordenar los productos en la tienda en tiempo real.</p>
            </div>
            <button
              onClick={() => {
                setEditingItem({});
                setItemForm({
                  code: `RIA${items.length + 1}`,
                  name: '',
                  description: '',
                  conditionsHtml: '<h3>Condiciones Específicas</h3><p>Escribe aquí las condiciones del artículo, plazos y empaquetado libremente...</p>',
                  basePrice: 60,
                  status: 'AVAILABLE',
                  stock: 1,
                  categoryId: '',
                  featured: false,
                  active: true,
                  images: []
                });
              }}
              className="py-2 px-4 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Artículo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => {
              let imageList = [];
              try {
                imageList = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
              } catch {
                imageList = [];
              }
              const coverMedia = item.media?.find(m => m.isCover) || item.media?.[0];
              const cover = coverMedia ? resolveMediaUrl(coverMedia.url) : (resolveMediaUrl(imageList[0]) || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80');

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggedItemIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleItemDrop(index)}
                  className="glass-panel p-5 rounded-xl border border-gray-800 space-y-3 flex flex-col justify-between cursor-grab active:cursor-grabbing hover:border-crimson-500/40 transition-all"
                >
                  <div>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-950 mb-3 border border-gray-800">
                      <img src={cover} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-crimson-600/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                        #{index + 1} | {item.code}
                      </div>
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${item.active !== false ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'}`}>
                        {item.active !== false ? 'Publicado' : 'Oculto'}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-dark-900/90 px-2 py-0.5 rounded text-gold-400 font-bold font-mono text-xs">
                        {item.basePrice}€
                      </div>
                    </div>

                    {item.category && (
                      <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block mb-1">
                        {item.category.name}
                      </span>
                    )}
                    <h4 className="font-sans font-bold text-base text-white">{item.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-gray-500">Stock: {item.stock}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleItemActive(item)}
                        className={`py-1.5 px-2.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors ${item.active !== false ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/60' : 'bg-red-950/40 border-red-700/50 text-red-300 hover:bg-red-900/60'}`}
                        title={item.active !== false ? 'Ocultar producto de la tienda' : 'Mostrar producto en la tienda'}
                      >
                        {item.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{item.active !== false ? 'Ocultar' : 'Mostrar'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg bg-dark-900 border border-gray-800 text-gray-400 hover:text-red-400"
                        title="Eliminar Artículo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setItemForm({
                            code: item.code,
                            name: item.name,
                            description: item.description,
                            conditionsHtml: item.conditionsHtml || '',
                            basePrice: item.basePrice,
                            status: item.status,
                            stock: item.stock || 1,
                            categoryId: item.categoryId || '',
                            featured: Boolean(item.featured),
                            active: item.active !== false,
                            images: imageList
                          });
                        }}
                        className="py-1.5 px-3 rounded-lg bg-dark-900 border border-gray-700 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5 text-gold-400" />
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: CATEGORÍAS */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-sans font-bold text-lg text-white">Categorías de la Tienda</h3>
              <p className="text-xs text-gray-400">Organiza tus productos por categorías temáticas (Prints, Marcapáginas, Stickers, RIA, etc.).</p>
            </div>
            <button
              onClick={() => {
                setEditingCategory({});
                setCategoryForm({ name: '', slug: '', description: '', active: true, order: categories.length });
              }}
              className="py-2 px-4 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                draggable
                onDragStart={() => setDraggedCategoryIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleCategoryDrop(index)}
                className="glass-panel p-5 rounded-xl border border-gray-800 space-y-3 flex flex-col justify-between cursor-grab active:cursor-grabbing hover:border-gold-500/40"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                      Orden #{index + 1}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${cat.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                      {cat.active ? 'Activa' : 'Oculta'}
                    </span>
                  </div>
                  <h4 className="font-sans font-bold text-base text-white">{cat.name}</h4>
                  <p className="text-xs text-gray-400 font-mono mt-1">Slug: /{cat.slug}</p>
                  {cat.description && <p className="text-xs text-gray-300 mt-2">{cat.description}</p>}
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-gray-500">{cat._count?.items ?? 0} artículos</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg bg-dark-900 border border-gray-800 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryForm({
                          name: cat.name,
                          slug: cat.slug,
                          description: cat.description || '',
                          active: cat.active,
                          order: cat.order || 0
                        });
                      }}
                      className="py-1.5 px-3 rounded-lg bg-dark-900 border border-gray-700 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-gold-400" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: RESEÑAS Y VALORACIONES */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-sans font-bold text-lg text-white">Reseñas y Valoraciones de Clientes</h3>
              <p className="text-xs text-gray-400">Gestiona las valoraciones con estrellas (1-5), testimonios y fotos/vídeos demostrativos.</p>
            </div>
            <button
              onClick={() => {
                setEditingReview({});
                setReviewForm({ itemId: items[0]?.id || '', author: '', rating: 5, text: '', active: true, mediaUrls: [] });
              }}
              className="py-2 px-4 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Reseña
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(rev => (
              <div key={rev.id} className="glass-panel p-5 rounded-xl border border-gray-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-sans font-bold text-sm text-white">{rev.author}</h4>
                    <span className="text-[10px] font-mono text-gold-400 block">{rev.item?.name || 'Artículo'}</span>
                  </div>
                  <div className="flex items-center text-gold-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className={s <= rev.rating ? 'text-gold-400 font-bold' : 'text-gray-700'}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{rev.text}</p>
                <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${rev.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                    {rev.active ? 'Visible' : 'Oculta'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="p-1.5 rounded-lg bg-dark-900 border border-gray-800 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingReview(rev);
                        setReviewForm({
                          itemId: rev.itemId,
                          author: rev.author,
                          rating: rev.rating,
                          text: rev.text,
                          active: rev.active,
                          mediaUrls: rev.media?.map(m => m.url) || []
                        });
                      }}
                      className="py-1.5 px-3 rounded-lg bg-dark-900 border border-gray-700 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-gold-400" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: PORTADA / HERO BANNER */}
      {activeTab === 'banner' && (
        <div className="max-w-2xl glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="font-sans font-bold text-lg text-white">Configuración del Banner de Portada</h3>
          <p className="text-xs text-gray-400">Personaliza la insignia, título, subtítulo e imagen de fondo de la portada de la tienda.</p>

          <form onSubmit={handleSaveBanner} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">Insignia Superior (Badge)</label>
              <input
                type="text"
                value={banner.badge || ''}
                onChange={e => setBanner({ ...banner, badge: e.target.value })}
                className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">Título Principal</label>
              <input
                type="text"
                value={banner.title || ''}
                onChange={e => setBanner({ ...banner, title: e.target.value })}
                className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">Subtítulo / Mensaje Promocional</label>
              <textarea
                rows={3}
                value={banner.subtitle || ''}
                onChange={e => setBanner({ ...banner, subtitle: e.target.value })}
                className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">URL de Imagen de Fondo (opcional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={banner.bgImageUrl || ''}
                  onChange={e => setBanner({ ...banner, bgImageUrl: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaPickerTarget('banner_bg');
                    setMediaPickerOpen(true);
                  }}
                  className="py-2 px-3 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/40 text-gold-300 font-mono text-xs font-bold flex items-center gap-1.5"
                >
                  <ImageIcon className="w-4 h-4" />
                  Elegir / Subir
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">Texto del Botón Acción</label>
              <input
                type="text"
                value={banner.buttonText || ''}
                onChange={e => setBanner({ ...banner, buttonText: e.target.value })}
                className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-wider"
            >
              Guardar Banner de Portada
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: EXTRAS CONFIGURABLES */}
      {activeTab === 'extras' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-sans font-bold text-lg text-white">Extras Configurables por Unidades</h3>
              <p className="text-xs text-gray-400">Añade o edita los complementos seleccionables por el comprador en el checkout.</p>
            </div>
            <button
              onClick={() => {
                setEditingExtra({});
                setExtraForm({
                  name: '',
                  description: '',
                  price: 15,
                  unitType: 'UNITS',
                  maxQuantity: 10,
                  available: true
                });
              }}
              className="py-2 px-4 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Añadir Nuevo Extra
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {extras.map(ex => (
              <div key={ex.id} className="glass-panel p-5 rounded-xl border border-gray-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-sans font-bold text-base text-white">{ex.name}</h4>
                    <span className="font-mono font-bold text-gold-400 text-sm">+{ex.price}€</span>
                  </div>
                  <span className="text-[10px] font-mono text-crimson-400 uppercase bg-crimson-600/10 px-2 py-0.5 rounded border border-crimson-500/20 inline-block mb-2">
                    Tipo: {ex.unitType} (Máx: {ex.maxQuantity})
                  </span>
                  <p className="text-xs text-gray-400">{ex.description || 'Sin descripción'}</p>
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                  <span className={`text-[10px] font-mono font-bold ${ex.available ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {ex.available ? '● Activo' : '○ Inactivo'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteExtra(ex.id)}
                      className="p-1.5 rounded-lg bg-dark-900 border border-gray-800 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingExtra(ex);
                        setExtraForm({
                          name: ex.name,
                          description: ex.description || '',
                          price: ex.price,
                          unitType: ex.unitType || 'UNITS',
                          maxQuantity: ex.maxQuantity || 10,
                          available: ex.available !== false
                        });
                      }}
                      className="py-1.5 px-3 rounded-lg bg-dark-900 border border-gray-700 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-gold-400" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PACKAGING / EMBALAJE Y ENTREGA */}
      {activeTab === 'packaging' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-sans font-bold text-lg text-white">Opciones de Embalaje y Entrega</h3>
              <p className="text-xs text-gray-400">Configura modalidades como Embalaje Discreto, Vinted, Entrega Digital, etc.</p>
            </div>
            <button
              onClick={() => {
                setEditingPackaging({});
                setPackagingForm({
                  name: '',
                  description: '',
                  price: 0,
                  optionType: 'STANDARD',
                  active: true
                });
              }}
              className="py-2 px-4 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Añadir Opción de Entrega
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packaging.map(pack => (
              <div key={pack.id} className="glass-panel p-5 rounded-xl border border-gray-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-sans font-bold text-base text-white">{pack.name}</h4>
                    <span className="font-mono font-bold text-gold-400 text-sm">
                      {pack.price > 0 ? `+${pack.price}€` : 'Gratis'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gold-400 uppercase bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20 inline-block mb-2">
                    {pack.optionType}
                  </span>
                  <p className="text-xs text-gray-400">{pack.description || 'Sin descripción'}</p>
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                  <span className={`text-[10px] font-mono font-bold ${pack.active ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {pack.active ? '● Activa' : '○ Inactiva'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeletePackaging(pack.id)}
                      className="p-1.5 rounded-lg bg-dark-900 border border-gray-800 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingPackaging(pack);
                        setPackagingForm({
                          name: pack.name,
                          description: pack.description || '',
                          price: pack.price || 0,
                          optionType: pack.optionType || 'STANDARD',
                          active: pack.active !== false
                        });
                      }}
                      className="py-1.5 px-3 rounded-lg bg-dark-900 border border-gray-700 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-gold-400" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT ITEM MODAL WITH PHOTO UPLOAD & URL */}
      {editingItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-2xl p-6 w-full max-w-2xl text-gray-100 my-8">
            <h3 className="font-sans font-bold text-lg text-white mb-4">
              {editingItem?.id ? 'Editar Artículo y Fotos' : 'Crear Nuevo Artículo'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Código Único (ej: RIA1)</label>
                  <input
                    type="text"
                    value={itemForm.code}
                    onChange={e => setItemForm({ ...itemForm, code: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Nombre del Artículo</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Precio Inicial (€)</label>
                  <input
                    type="number"
                    value={itemForm.basePrice}
                    onChange={e => setItemForm({ ...itemForm, basePrice: parseFloat(e.target.value) })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Categoría</label>
                  <select
                    value={itemForm.categoryId || ''}
                    onChange={e => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="">-- Sin Categoría --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Estado / Disponibilidad</label>
                  <select
                    value={itemForm.status}
                    onChange={e => setItemForm({ ...itemForm, status: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="AVAILABLE">Disponible</option>
                    <option value="RESERVED">Reservado</option>
                    <option value="OUT_OF_STOCK">Agotado</option>
                  </select>
                </div>
              </div>

              {/* Visibilidad & Ocultar / Mostrar */}
              <div className="flex items-center gap-3 p-3 bg-dark-950 rounded-lg border border-gray-800">
                <input
                  type="checkbox"
                  id="itemActiveCheck"
                  checked={itemForm.active !== false}
                  onChange={e => setItemForm({ ...itemForm, active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-700 text-crimson-600 focus:ring-crimson-500 bg-dark-900 cursor-pointer"
                />
                <label htmlFor="itemActiveCheck" className="text-xs font-mono text-gray-200 cursor-pointer flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${itemForm.active !== false ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {itemForm.active !== false ? 'PUBLICADO' : 'OCULTO'}
                  </span>
                  <span>Visible públicamente en la Tienda Yakuza (los clientes podrán verlo y comprarlo)</span>
                </label>
              </div>

              {/* SECCIÓN DE FOTOGRAFÍAS */}
              <div className="bg-dark-950 p-4 rounded-xl border border-gray-800 space-y-3">
                <label className="block text-xs font-mono text-gold-400 font-bold">
                  Fotografías del Artículo ({itemForm.images.length})
                </label>

                {/* Opciones de Selección / Subida de fotos */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerTarget('item_images');
                      setMediaPickerOpen(true);
                    }}
                    className="py-2 px-4 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/50 text-gold-300 font-mono text-xs font-bold flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Elegir de Biblioteca o Subir Nuevo
                  </button>

                  <label className="py-2 px-3 rounded-lg bg-dark-900 border border-gray-700 hover:text-white text-gray-300 font-mono text-xs font-bold cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage ? 'Subiendo...' : 'Subida rápida desde PC'}
                    <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Añadir URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1 bg-dark-900 border border-gray-700 rounded px-3 py-1.5 text-xs text-white placeholder-gray-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="py-1.5 px-3 rounded bg-dark-800 border border-gray-700 text-xs font-mono text-gold-400 hover:text-white"
                  >
                    Añadir URL
                  </button>
                </div>

                {/* Vista previa de imágenes */}
                {itemForm.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pt-2">
                    {itemForm.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded border border-gray-700 overflow-hidden flex-shrink-0 group">
                        <img src={resolveMediaUrl(img)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Descripción Breve</label>
                <textarea
                  rows="2"
                  value={itemForm.description}
                  onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                />
              </div>

              {/* AMPLE RICH TEXT CONDITIONS EDITOR */}
              <div>
                <label className="block text-xs font-mono text-gold-400 font-bold mb-1">
                  Editor de Condiciones Específicas del Artículo
                </label>
                <textarea
                  rows="5"
                  value={itemForm.conditionsHtml}
                  onChange={e => setItemForm({ ...itemForm, conditionsHtml: e.target.value })}
                  placeholder="Puedes escribir libremente en formato HTML o texto amplio: Plazos, embalajes, discreción, contenido exacto incluido, etc."
                  className="w-full bg-dark-950 border border-gold-500/40 rounded px-3 py-2 text-xs font-mono text-white focus:border-gold-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="py-2 px-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase"
                >
                  Guardar Artículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-2xl p-6 w-full max-w-md text-gray-100 my-8">
            <h3 className="font-sans font-bold text-lg text-white mb-4">
              {editingCategory?.id ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Nombre de Categoría *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ej: Prints, Stickers, Libros, RIA..."
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Slug URL (opcional)</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="ej: prints-fine-art"
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={categoryForm.active}
                  onChange={e => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                  className="rounded border-gray-700 bg-dark-950 text-crimson-600"
                />
                <label htmlFor="catActive" className="text-xs text-gray-300">Categoría activa en la tienda</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="py-2 px-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REVIEW MODAL */}
      {editingReview !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-2xl p-6 w-full max-w-lg text-gray-100 my-8">
            <h3 className="font-sans font-bold text-lg text-white mb-4">
              {editingReview?.id ? 'Editar Reseña' : 'Crear Reseña de Cliente'}
            </h3>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Artículo Asociado *</label>
                <select
                  value={reviewForm.itemId}
                  onChange={e => setReviewForm({ ...reviewForm, itemId: e.target.value })}
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                  required
                >
                  <option value="">-- Seleccionar Artículo --</option>
                  {items.map(it => (
                    <option key={it.id} value={it.id}>{it.code} - {it.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Autor (Cliente) *</label>
                  <input
                    type="text"
                    value={reviewForm.author}
                    onChange={e => setReviewForm({ ...reviewForm, author: e.target.value })}
                    placeholder="ej: Alexander M."
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Valoración (1 a 5 Estrellas) *</label>
                  <select
                    value={reviewForm.rating}
                    onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value={5}>★★★★★ (5/5 Excelente)</option>
                    <option value={4}>★★★★☆ (4/5 Muy Bueno)</option>
                    <option value={3}>★★★☆☆ (3/5 Bueno)</option>
                    <option value={2}>★★☆☆☆ (2/5 Regular)</option>
                    <option value={1}>★☆☆☆☆ (1/5 Malo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Comentario / Testimonio *</label>
                <textarea
                  rows={3}
                  value={reviewForm.text}
                  onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })}
                  placeholder="Opinión sobre el envío, empaquetado, acabados o discreción..."
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="revActive"
                  checked={reviewForm.active}
                  onChange={e => setReviewForm({ ...reviewForm, active: e.target.checked })}
                  className="rounded border-gray-700 bg-dark-950 text-crimson-600"
                />
                <label htmlFor="revActive" className="text-xs text-gray-300">Reseña visible públicamente en la ficha</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="py-2 px-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase"
                >
                  Guardar Reseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingExtra !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-2xl p-6 w-full max-w-lg text-gray-100 my-8">
            <h3 className="font-sans font-bold text-lg text-white mb-4">
              {editingExtra?.id ? 'Editar Extra' : 'Crear Nuevo Extra'}
            </h3>

            <form onSubmit={handleSaveExtra} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Nombre del Extra *</label>
                <input
                  type="text"
                  value={extraForm.name}
                  onChange={e => setExtraForm({ ...extraForm, name: e.target.value })}
                  placeholder="Ej: Vídeo personalizado (1-2 min)"
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Precio (€) *</label>
                  <input
                    type="number"
                    value={extraForm.price}
                    onChange={e => setExtraForm({ ...extraForm, price: parseFloat(e.target.value) })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Tipo de Unidad</label>
                  <select
                    value={extraForm.unitType}
                    onChange={e => setExtraForm({ ...extraForm, unitType: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                  >
                    <option value="UNITS">Unidades estándar</option>
                    <option value="DAYS">Días</option>
                    <option value="PHOTOS">Fotografías</option>
                    <option value="VIDEOS">Vídeos</option>
                    <option value="AUDIOS">Audios</option>
                    <option value="CUSTOM">Personalizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Cantidad Máxima Seleccionable</label>
                  <input
                    type="number"
                    value={extraForm.maxQuantity}
                    onChange={e => setExtraForm({ ...extraForm, maxQuantity: parseInt(e.target.value, 10) })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Disponibilidad</label>
                  <select
                    value={extraForm.available ? 'true' : 'false'}
                    onChange={e => setExtraForm({ ...extraForm, available: e.target.value === 'true' })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                  >
                    <option value="true">Activo / Disponible</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Descripción Breve</label>
                <textarea
                  rows="2"
                  value={extraForm.description}
                  onChange={e => setExtraForm({ ...extraForm, description: e.target.value })}
                  placeholder="Detalles sobre lo que incluye este extra..."
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingExtra(null)}
                  className="py-2 px-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase"
                >
                  Guardar Extra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PACKAGING MODAL */}
      {editingPackaging !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-2xl p-6 w-full max-w-lg text-gray-100 my-8">
            <h3 className="font-sans font-bold text-lg text-white mb-4">
              {editingPackaging?.id ? 'Editar Opción de Embalaje/Entrega' : 'Crear Nueva Opción de Entrega'}
            </h3>

            <form onSubmit={handleSavePackaging} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Nombre de la Opción *</label>
                <input
                  type="text"
                  value={packagingForm.name}
                  onChange={e => setPackagingForm({ ...packagingForm, name: e.target.value })}
                  placeholder="Ej: Embalaje Discreto 🔒"
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Precio Adicional (€)</label>
                  <input
                    type="number"
                    value={packagingForm.price}
                    onChange={e => setPackagingForm({ ...packagingForm, price: parseFloat(e.target.value) })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Tipo de Modalidad</label>
                  <select
                    value={packagingForm.optionType}
                    onChange={e => setPackagingForm({ ...packagingForm, optionType: e.target.value })}
                    className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                  >
                    <option value="STANDARD">Estándar</option>
                    <option value="DISCREET">Discreto</option>
                    <option value="RECYCLED">Reciclado</option>
                    <option value="VINTED">Gestión Vinted</option>
                    <option value="DIGITAL">Entrega Digital</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Descripción Breve</label>
                <textarea
                  rows="2"
                  value={packagingForm.description}
                  onChange={e => setPackagingForm({ ...packagingForm, description: e.target.value })}
                  placeholder="Descripción de la entrega o paquete..."
                  className="w-full bg-dark-950 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingPackaging(null)}
                  className="py-2 px-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase"
                >
                  Guardar Embalaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-modal rounded-2xl p-6 w-full max-w-xl text-gray-100 my-8 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div>
                <span className="text-xs font-mono text-gold-400 uppercase">Detalle Completo</span>
                <h3 className="font-sans font-bold text-lg text-white">Pedido {selectedOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded bg-dark-800 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-dark-950 p-4 rounded-xl text-xs space-y-2 font-mono">
              <p><strong className="text-gray-400">Artículo:</strong> {selectedOrder.itemName} ({selectedOrder.itemCode || '-'})</p>
              <p><strong className="text-gray-400">Modalidad:</strong> {selectedOrder.tierName} ({selectedOrder.tierPrice}€)</p>
              <p><strong className="text-gray-400">Alias Comprador:</strong> {selectedOrder.alias}</p>
              <p><strong className="text-gray-400">Canal Contacto:</strong> {selectedOrder.contactChannel} → <span className="text-gold-400 font-bold">{selectedOrder.contactHandle}</span></p>
              <p><strong className="text-gray-400">Gestión Vinted:</strong> {selectedOrder.vintedPreference}</p>
              <p><strong className="text-gray-400">Embalaje:</strong> {selectedOrder.packagingOptionName}</p>
              <p><strong className="text-gray-400">Máxima Discreción:</strong> {selectedOrder.discretionPreference ? 'Sí 🔒' : 'No'}</p>
              <p><strong className="text-gray-400">Importe Total:</strong> <span className="text-gold-400 font-bold text-sm">{selectedOrder.totalAmount.toFixed(2)}€</span></p>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">Notas Internas para este Pedido</label>
              <textarea
                rows="3"
                value={internalNotesInput}
                onChange={e => setInternalNotesInput(e.target.value)}
                placeholder="Añade notas de seguimiento o enlace de Vinted generado..."
                className="w-full bg-dark-950 border border-gray-700 rounded p-2 text-xs text-white font-mono placeholder-gray-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleUpdateOrderStatus(selectedOrder.id, selectedOrder.orderStatus)}
                className="py-2 px-4 rounded-xl bg-crimson-600 text-white font-sans font-bold text-xs uppercase"
              >
                Guardar Notas y Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PRINCESA YAKUZA EASTER EGG ═══ */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(easterEggOpen
            ? {
                width: '320px',
                borderRadius: '16px',
                background: 'rgba(11, 11, 16, 0.97)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(212, 175, 55, 0.15), 0 0 80px rgba(230, 57, 70, 0.08)',
                overflow: 'hidden',
              }
            : {
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(11, 11, 16, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 15px rgba(212, 175, 55, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }),
        }}
        onClick={() => {
          if (!easterEggOpen) {
            setEasterEggOpen(true);
            setTimeout(() => {
              if (videoRef.current) videoRef.current.play();
            }, 600);
          }
        }}
        title={!easterEggOpen ? '👑' : undefined}
      >
        {!easterEggOpen ? (
          <span
            style={{
              fontSize: '18px',
              opacity: 0.6,
              transition: 'opacity 0.3s, transform 0.3s',
              display: 'block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.6';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            👑
          </span>
        ) : (
          <div style={{ padding: '0' }}>
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEasterEggOpen(false);
                if (videoRef.current) {
                  videoRef.current.pause();
                  videoRef.current.currentTime = 0;
                }
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                zIndex: 10,
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = 'rgba(230, 57, 70, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
              }}
            >
              <X style={{ width: '12px', height: '12px' }} />
            </button>

            {/* Video */}
            <video
              ref={videoRef}
              src={princessVideo}
              loop
              muted
              playsInline
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                objectFit: 'cover',
                display: 'block',
                borderRadius: '16px 16px 0 0',
              }}
            />

            {/* Dedication text */}
            <div
              style={{
                padding: '12px 16px 14px',
                textAlign: 'center',
                borderTop: '1px solid rgba(212, 175, 55, 0.15)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginBottom: '6px',
                }}
              >
                <Heart
                  style={{
                    width: '12px',
                    height: '12px',
                    color: '#e63946',
                    fill: '#e63946',
                    animation: 'princess-heartbeat 1.5s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'serif',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'rgba(212, 175, 55, 0.5)',
                  }}
                >
                  dedicado con amor
                </span>
                <Heart
                  style={{
                    width: '12px',
                    height: '12px',
                    color: '#e63946',
                    fill: '#e63946',
                    animation: 'princess-heartbeat 1.5s ease-in-out infinite',
                    animationDelay: '0.3s',
                  }}
                />
              </div>
              <p
                style={{
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  background: 'linear-gradient(135deg, #f4d068 0%, #d4af37 50%, #aa8c2c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                }}
              >
                Para la maravillosa, increíble y perfecta Princesa Yakuza
              </p>
              <span style={{ fontSize: '14px', marginTop: '4px', display: 'block' }}>👑</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes princess-heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.3); }
          30% { transform: scale(1); }
          45% { transform: scale(1.2); }
        }
      `}</style>

      {/* Selector de Biblioteca de Medios */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        token={token}
        multiple={mediaPickerTarget === 'item_images'}
        title={mediaPickerTarget === 'banner_bg' ? 'Elegir Imagen de Fondo del Banner' : 'Añadir Multimedia a la Galería del Artículo'}
        onSelectUrl={(url) => {
          if (mediaPickerTarget === 'banner_bg') {
            setBanner(prev => ({ ...prev, bgImageUrl: url }));
          }
        }}
        onSelectUrls={async (urls) => {
          if (mediaPickerTarget === 'item_images') {
            setItemForm(prev => ({
              ...prev,
              images: [...prev.images, ...urls]
            }));

            if (editingItem?.id) {
              try {
                await fetch(`${API_BASE}/api/store/admin/items/${editingItem.id}/media-from-library`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({ urls })
                });
              } catch (e) {
                console.error('Error guardando media en backend:', e);
              }
            }
          }
        }}
      />

    </div>
  );
}
