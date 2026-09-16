import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ItemCard from './components/ItemCard';
import ItemDetailModal from './components/ItemDetailModal';
import CheckoutModal from './components/CheckoutModal';
import OrderConfirmation from './components/OrderConfirmation';
import AdminPanel from './components/AdminPanel';
import LegalModal from './components/LegalModal';
import CartModal from './components/CartModal';
import YakuzaPrincessPage from './components/YakuzaPrincessPage';
import HowToOrderPage from './components/HowToOrderPage';
import GiveawayPage from './components/GiveawayPage';
import { KingdomAuthModal } from './components/kingdom/KingdomAuthModal';
import { Sparkles, Crown, Lock, ShoppingBag, HelpCircle, Search, ArrowRight, Castle, Gift } from 'lucide-react';

import { API_BASE, resolveMediaUrl } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, fetish, princess, giveaway, howtoorder, admin
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [banner, setBanner] = useState(null);
  const [launch, setLaunch] = useState(null);
  const [princessConfig, setPrincessConfig] = useState(null);
  const [loadingItems, setLoadingItems] = useState(true);

  // Kingdom Auth & Member Profile state
  const [showKingdomAuth, setShowKingdomAuth] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('yakuza_member_token');
    if (token) {
      fetch(`${API_BASE}/api/kingdom/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          if (data && data.member) setCurrentMember(data.member);
        })
        .catch(() => {
          localStorage.removeItem('yakuza_member_token');
          setCurrentMember(null);
        });
    }
  }, []);

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Selected item modals
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [selectedCheckoutItem, setSelectedCheckoutItem] = useState(null);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState('');
  
  // Legal modal
  const [legalModalType, setLegalModalType] = useState(null);

  // Lookup modal
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [showLookupModal, setShowLookupModal] = useState(false);

  // Fetch Items, Categories, Banner, Launch and Princess Config from backend
  const fetchStoreData = () => {
    setLoadingItems(true);
    const catQuery = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : '';
    
    Promise.all([
      fetch(`${API_BASE}/api/store/items${catQuery}`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/store/categories`).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/store/banner`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/store/launch`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/store/princess`).then(r => r.json()).catch(() => null)
    ])
      .then(([itemsData, categoriesData, bannerData, launchData, princessData]) => {
        if (Array.isArray(itemsData)) setItems(itemsData);
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
        if (bannerData && typeof bannerData === 'object') setBanner(bannerData);
        if (launchData && typeof launchData === 'object') setLaunch(launchData);
        if (princessData && typeof princessData === 'object') setPrincessConfig(princessData);
        setLoadingItems(false);
      })
      .catch(() => setLoadingItems(false));
  };

  useEffect(() => {
    fetchStoreData();

    // Comprobar retorno de Stripe Checkout
    const urlParams = new URLSearchParams(window.location.search);
    const orderSuccess = urlParams.get('orderSuccess');
    if (orderSuccess) {
      setConfirmedOrderNumber(orderSuccess);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [selectedCategory]);

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
    setShowCartModal(true);
  };

  const handleUpdateCartQuantity = (itemId, quantity) => {
    setCartItems(prev => prev.map(i => i.item.id === itemId ? { ...i, quantity } : i));
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.item.id !== itemId));
  };


  // Filter items by category/code prefix if needed
  const riaItems = items.filter(i => i.code && i.code.startsWith('RIA'));
  const frItems = items.filter(i => i.code && i.code.startsWith('FR'));
  const otherItems = items.filter(i => !i.code?.startsWith('RIA') && !i.code?.startsWith('FR'));

  const handleBuyNow = (item) => {
    setSelectedDetailItem(null);
    setSelectedCheckoutItem(item);
  };

  const handleOrderComplete = (orderNumber) => {
    setSelectedCheckoutItem(null);
    setConfirmedOrderNumber(orderNumber);
    window.scrollTo(0, 0);
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    if (lookupOrderNumber.trim()) {
      setShowLookupModal(false);
      setConfirmedOrderNumber(lookupOrderNumber.trim());
      setLookupOrderNumber('');
    }
  };

  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenOrderLookup={() => setShowLookupModal(true)} 
          onOpenKingdomAuth={() => setShowKingdomAuth(true)}
          currentMember={currentMember}
        />
        <AdminPanel onBackToStore={() => setActiveTab('fetish')} />
        <Footer onOpenLegal={(type) => setLegalModalType(type)} />
      </div>
    );
  }

  if (confirmedOrderNumber) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenOrderLookup={() => setShowLookupModal(true)} 
          onOpenKingdomAuth={() => setShowKingdomAuth(true)}
          currentMember={currentMember}
        />
        <OrderConfirmation orderNumber={confirmedOrderNumber} onBackToStore={() => setConfirmedOrderNumber('')} />
        <Footer onOpenLegal={(type) => setLegalModalType(type)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 flex flex-col justify-between">
      
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLegal={(type) => setLegalModalType(type)}
        onOpenOrderLookup={() => setShowLookupModal(true)}
        onOpenKingdomAuth={() => setShowKingdomAuth(true)}
        currentMember={currentMember}
        itemsInCartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setShowCartModal(true)}
      />

      <main className="flex-1">
        
        {/* PÁGINA DE INICIO (HOME): El banner de boutique findom & fetish solo aparece aquí */}
        {activeTab === 'home' && (
          <div>
            {/* DYNAMIC HERO BANNER PORTADA (CLUB ART DÉCO - MATTE ELEGANCE) */}
            <section
              className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-cover bg-center border-b border-gold-500/35 overflow-hidden bg-dark-950"
              style={{ backgroundImage: banner?.bgImageUrl ? `url(${banner.bgImageUrl})` : undefined }}
            >
              {/* Dark Matte Solid Overlay - Completely Gradient-Free */}
              <div className="absolute inset-0 bg-dark-950/85 backdrop-brightness-95 pointer-events-none" />
              
              <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full legibility-shield border border-gold-500/40 text-gold-300 text-xs font-sans tracking-widest uppercase mb-2 shadow-xl">
                  <Crown className="w-4 h-4 text-gold-400" />
                  {banner?.badge || '✦ CLUB PRIVADO & BOUTIQUE FETISH EXCLUSIVA ✦'}
                </div>

                <div className="flex flex-col items-center justify-center my-3">
                  <h1 className="sr-only">{banner?.title || 'YAKUZA HOUSE'}</h1>
                  {(!banner?.title || banner.title === 'YAKUZA HOUSE' || banner.title === 'YAKUZA HOUSE ') ? (
                    <img 
                      src="/yakuza-house-banner-title.png" 
                      alt="YAKUZA HOUSE" 
                      className="h-14 sm:h-20 md:h-24 lg:h-28 max-w-[90vw] w-auto object-contain mx-auto drop-shadow-[0_4px_30px_rgba(201,162,39,0.45)] hover:scale-[1.01] transition-transform duration-300"
                    />
                  ) : (
                    <h1 className="font-luxury font-normal text-4xl sm:text-6xl lg:text-7xl tracking-[0.2em] uppercase text-ivory-100 display-shadow">
                      {banner.title}
                    </h1>
                  )}
                </div>

                {/* Art Déco Divider */}
                <div className="artdeco-divider max-w-md mx-auto">
                  <div className="ad-center" />
                </div>

                <p className="text-sm sm:text-base text-ivory-300 max-w-2xl mx-auto font-sans font-normal leading-relaxed legibility-shield p-5 rounded-xl border border-gold-500/25">
                  {banner?.subtitle || 'Bienvenido a la Casa de la Princesa. Explora lencería de autor, esencias privadas y piezas exclusivas de culto con compra directa y total discreción.'}
                </p>

                {/* Direct Quick Action */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={() => setActiveTab('fetish')}
                    className="btn-royal-bordeaux"
                  >
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    {banner?.buttonText || 'Explorar la Colección'}
                  </button>
                  <button
                    onClick={() => setActiveTab('giveaway')}
                    className="py-3 px-6 rounded-xl font-sans text-xs uppercase tracking-widest font-bold border border-gold-500/40 text-gold-300 hover:bg-gold-500/15 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4 text-gold-400" />
                    Grand Opening 2K
                  </button>
                </div>

              </div>
            </section>

            {/* SECCIÓN HOME: Accesos del Club y Módulos Principales */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
              
              {/* 4 Luxury Gateway Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Tienda / Boutique */}
                <div 
                  onClick={() => setActiveTab('fetish')}
                  className="legibility-shield p-6 rounded-2xl border border-gold-500/30 hover:border-gold-400 transition-all cursor-pointer group hover:scale-[1.02] shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-bordeaux-700/60 border border-gold-500/40 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <h3 className="font-brand font-bold text-lg text-white group-hover:text-gold-300">Boutique Fetish</h3>
                    <p className="text-xs text-ivory-300 font-sans leading-relaxed">
                      Lencería exclusiva, prendas usadas de culto, aromas y calcetines sudados con envío sellado y 100% hermético.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gold-500/20 flex items-center justify-between text-xs text-gold-400 font-sans font-semibold">
                    <span>Entrar a la Tienda</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 2. Yakuza Princess */}
                <div 
                  onClick={() => setActiveTab('princess')}
                  className="legibility-shield p-6 rounded-2xl border border-gold-500/30 hover:border-gold-400 transition-all cursor-pointer group hover:scale-[1.02] shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-bordeaux-700/60 border border-gold-500/40 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                      <Crown className="w-5 h-5" />
                    </div>
                    <h3 className="font-brand font-bold text-lg text-white group-hover:text-gold-300">Yakuza Princess</h3>
                    <p className="text-xs text-ivory-300 font-sans leading-relaxed">
                      Manifiesto de sumisión, tributos directos de adoración, normas del templo y devoción a la soberana.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gold-500/20 flex items-center justify-between text-xs text-gold-400 font-sans font-semibold">
                    <span>Ver a la Princesa</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 3. Grand Opening 2K */}
                <div 
                  onClick={() => setActiveTab('giveaway')}
                  className="legibility-shield p-6 rounded-2xl border border-gold-500/30 hover:border-gold-400 transition-all cursor-pointer group hover:scale-[1.02] shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-bordeaux-700/60 border border-gold-500/40 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                      <Gift className="w-5 h-5" />
                    </div>
                    <h3 className="font-brand font-bold text-lg text-white group-hover:text-gold-300">Grand Opening 2K</h3>
                    <p className="text-xs text-ivory-300 font-sans leading-relaxed">
                      La apertura oficial de la Casa. Sorteo especial 2.000 seguidores con premios reales y selección de números.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gold-500/20 flex items-center justify-between text-xs text-gold-400 font-sans font-semibold">
                    <span>Ver Sorteo 2K</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 4. Acceso Reino */}
                <div 
                  onClick={() => setShowKingdomAuth(true)}
                  className="legibility-shield p-6 rounded-2xl border border-gold-500/30 hover:border-gold-400 transition-all cursor-pointer group hover:scale-[1.02] shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-bordeaux-700/60 border border-gold-500/40 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                      <Castle className="w-5 h-5" />
                    </div>
                    <h3 className="font-brand font-bold text-lg text-white group-hover:text-gold-300">Acceso al Reino</h3>
                    <p className="text-xs text-ivory-300 font-sans leading-relaxed">
                      Club privado exclusivo. Solicita tu admisión formal o accede con tu número de expediente y alias.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gold-500/20 flex items-center justify-between text-xs text-gold-400 font-sans font-semibold">
                    <span>{currentMember ? 'Mi Expediente' : 'Solicitar Entrada'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>

              {/* Princess Decree */}
              <div className="legibility-bordeaux p-8 rounded-2xl border border-gold-500/40 max-w-4xl mx-auto space-y-5 shadow-2xl">
                <span className="text-[11px] font-sans font-semibold text-gold-400 tracking-widest uppercase block">
                  ✦ DECRETO DE LA PRINCESA
                </span>
                <p className="text-sm sm:text-base text-ivory-200 italic font-serif leading-relaxed">
                  “Mi saliva, las marcas en mis suelas, mis calcetines sudados tras una dura sesión o incluso mi repostería fina es un manjar reservado para alguien inferior como tú. Me encanta complacerme a tu costa y otorgarte el honor de poseer mi esencia.”
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-sans text-ivory-300 pt-4 border-t border-gold-500/20">
                  <span className="flex items-center gap-2 text-gold-300 font-medium">
                    <Lock className="w-3.5 h-3.5 text-gold-400" /> Envíos 100% discretos, herméticos y sellados al vacío
                  </span>
                  <span className="flex items-center gap-2 text-bordeaux-300 font-medium">
                    <ShoppingBag className="w-3.5 h-3.5 text-gold-400" /> Opción de gestión directa y protegida por Vinted
                  </span>
                </div>
              </div>

              {/* Featured items preview */}
              {items.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-gold-500/20 pb-4">
                    <div>
                      <span className="text-xs font-sans text-gold-400 font-semibold uppercase tracking-widest block">✦ Colección Destacada</span>
                      <h2 className="font-brand font-extrabold text-2xl text-ivory-100">Piezas de la Boutique</h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('fetish')}
                      className="text-xs font-sans font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1.5 transition-colors"
                    >
                      <span>Ver toda la tienda</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.slice(0, 4).map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onBuyNow={handleBuyNow}
                        onViewDetails={setSelectedDetailItem}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                </div>
              )}

            </section>
          </div>
        )}

        {/* TAB 1: FETISH HOUSE (LA TIENDA - Sin banner hero) */}
        {activeTab === 'fetish' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
            
            {/* Action Bar de la Tienda: Botones ¿Cómo pedir? y Consultar Pedido */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-5 rounded-2xl legibility-shield border border-gold-500/30 shadow-2xl">
              <div>
                <span className="text-[11px] font-sans font-bold text-gold-400 tracking-widest uppercase block">
                  ✦ BOUTIQUE FETISH EXCLUSIVA
                </span>
                <h1 className="font-brand font-black text-xl sm:text-2xl text-white">Catálogo & Adquisiciones</h1>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('howtoorder')}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-gradient-to-r from-bordeaux-700 to-bordeaux-600 hover:from-bordeaux-600 hover:to-bordeaux-500 border border-gold-500/40 text-gold-200 text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
                  title="Ver protocolo paso a paso para realizar un pedido"
                >
                  <HelpCircle className="w-4 h-4 text-gold-400" />
                  <span>¿Cómo pedir?</span>
                </button>
                <button
                  onClick={() => setShowLookupModal(true)}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-dark-950/80 hover:bg-dark-900 border border-gold-500/30 hover:border-gold-400 text-ivory-300 hover:text-white text-xs font-sans font-medium flex items-center justify-center gap-2 transition-all shadow-md"
                  title="Consultar estado de tu pedido existente"
                >
                  <Search className="w-4 h-4 text-gold-400" />
                  <span>Consultar Pedido</span>
                </button>
              </div>
            </div>

            {/* Intro Quote (Legibility Shield & Bordeaux Panel) */}
            <div className="legibility-bordeaux p-8 rounded-2xl border border-gold-500/40 max-w-4xl mx-auto space-y-5 shadow-2xl">
              <span className="text-[11px] font-sans font-semibold text-gold-400 tracking-widest uppercase block">
                ✦ DECRETO DE LA PRINCESA
              </span>
              <p className="text-sm sm:text-base text-ivory-200 italic font-serif leading-relaxed">
                “Mi saliva, las marcas en mis suelas, mis calcetines sudados tras una dura sesión o incluso mi repostería fina es un manjar reservado para alguien inferior como tú. Me encanta complacerme a tu costa y otorgarte el honor de poseer mi esencia.”
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-sans text-ivory-300 pt-4 border-t border-gold-500/20">
                <span className="flex items-center gap-2 text-gold-300 font-medium">
                  <Lock className="w-3.5 h-3.5 text-gold-400" /> Envíos 100% discretos, herméticos y sellados al vacío
                </span>
                <span className="flex items-center gap-2 text-bordeaux-300 font-medium">
                  <ShoppingBag className="w-3.5 h-3.5 text-gold-400" /> Opción de gestión directa y protegida por Vinted
                </span>
              </div>
            </div>

            {/* BARRA DE NAVEGACIÓN POR CATEGORÍAS */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-gold-500/20">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`py-2 px-5 rounded-full font-sans text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                    selectedCategory === ''
                      ? 'bg-bordeaux-600/80 text-gold-300 font-bold border border-gold-500/60 shadow-lg shadow-bordeaux-700/50'
                      : 'bg-dark-950/80 border border-gold-500/20 text-ivory-400 hover:text-white hover:border-gold-500/40'
                  }`}
                >
                  Todas las categorías ({items.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`py-2 px-5 rounded-full font-sans text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                      selectedCategory === cat.slug
                        ? 'bg-bordeaux-600/80 text-gold-300 font-bold border border-gold-500/60 shadow-lg shadow-bordeaux-700/50'
                        : 'bg-dark-950/80 border border-gold-500/20 text-ivory-400 hover:text-white hover:border-gold-500/40'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* GRIDA DE ARTÍCULOS DE LA TIENDA */}
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-gold-500/20 pb-4">
                <div>
                  <span className="text-xs font-sans text-gold-400 font-semibold uppercase tracking-widest block">✦ Catálogo Exclusivo</span>
                  <h2 className="font-brand font-extrabold text-2xl text-ivory-100">
                    {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Artículos' : 'Piezas y Artículos del Club'}
                  </h2>
                </div>
                <p className="text-xs text-ivory-400 font-sans">Haz clic en un artículo para ver su galería multimedia, valoraciones y extras</p>
              </div>

              {loadingItems ? (
                <div className="py-12 text-center text-xs font-mono text-gray-500">Cargando catálogo de la tienda...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-mono text-sm bg-dark-950/50 p-8 rounded-2xl border border-gray-800">
                  No hay artículos disponibles en esta categoría actualmente.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {items.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onBuyNow={handleBuyNow}
                      onViewDetails={setSelectedDetailItem}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </div>

          </section>
        )}

        {/* TAB 2: YAKUZA PRINCESS */}
        {activeTab === 'princess' && (
          <YakuzaPrincessPage princessConfig={princessConfig} onNavigateToStore={() => setActiveTab('fetish')} />
        )}

        {/* TAB 3: GRAND OPENING / SORTEO 2K */}
        {activeTab === 'giveaway' && (
          <GiveawayPage
            launch={launch}
            onBackToStore={() => setActiveTab('fetish')}
            onBuyNow={handleBuyNow}
            onViewDetails={setSelectedDetailItem}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* TAB 4: HOW TO ORDER */}
        {activeTab === 'howtoorder' && (
          <HowToOrderPage onNavigateToStore={() => setActiveTab('fetish')} />
        )}

      </main>

      {/* Cart Drawer / Modal */}
      {showCartModal && (
        <CartModal
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClose={() => setShowCartModal(false)}
          onCheckout={(item) => {
            setShowCartModal(false);
            setSelectedCheckoutItem(item);
          }}
        />
      )}

      {/* Item Detail Modal */}
      {selectedDetailItem && (
        <ItemDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          onBuyNow={handleBuyNow}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Direct Checkout Modal */}
      {selectedCheckoutItem && (
        <CheckoutModal
          item={selectedCheckoutItem}
          onClose={() => setSelectedCheckoutItem(null)}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {/* Order Lookup Modal */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-modal p-6 rounded-2xl max-w-md w-full text-gray-100">
            <h3 className="font-sans font-bold text-lg text-white mb-2">Consultar Estado de Pedido</h3>
            <p className="text-xs text-gray-400 mb-4">Introduce tu número de pedido (ej: YAK-2026-XXXX) para ver la confirmación.</p>

            <form onSubmit={handleLookupSubmit} className="space-y-4">
              <input
                type="text"
                value={lookupOrderNumber}
                onChange={(e) => setLookupOrderNumber(e.target.value)}
                placeholder="YAK-2026-XXXX"
                className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
                required
              />

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowLookupModal(false)}
                  className="py-2 px-4 rounded-lg border border-gray-800 text-xs text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 rounded-lg bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal Modal */}
      {legalModalType && (
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}

      {/* Kingdom Auth & Admission Modal */}
      <KingdomAuthModal
        isOpen={showKingdomAuth}
        onClose={() => setShowKingdomAuth(false)}
        currentMember={currentMember}
        onAuthSuccess={(member) => {
          setCurrentMember(member);
        }}
        onLogout={() => {
          setCurrentMember(null);
        }}
      />

      {/* Footer */}
      <Footer onOpenLegal={(type) => setLegalModalType(type)} />

    </div>
  );
}
