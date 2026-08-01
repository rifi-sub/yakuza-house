import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ItemCard from './components/ItemCard';
import ItemDetailModal from './components/ItemDetailModal';
import CheckoutModal from './components/CheckoutModal';
import OrderConfirmation from './components/OrderConfirmation';
import AdminPanel from './components/AdminPanel';
import LegalModal from './components/LegalModal';
import { Sparkles, Crown, ShieldCheck, ShoppingBag, Eye, Lock, ArrowRight, Heart, Flame, MessageCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('fetish'); // fetish, princess, findreamland, howtoorder, admin
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Selected item modals
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [selectedCheckoutItem, setSelectedCheckoutItem] = useState(null);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState('');
  
  // Legal modal
  const [legalModalType, setLegalModalType] = useState(null); // terms, privacy, refund

  // Lookup modal
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [showLookupModal, setShowLookupModal] = useState(false);

  // Flip cards state for Reino & Games
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (cardId) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // Fetch Items from backend
  const fetchItems = () => {
    setLoadingItems(true);
    fetch('/api/store/items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        }
        setLoadingItems(false);
      })
      .catch(() => setLoadingItems(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
        <Header activeTab={activeTab} setActiveTab={setActiveTab} onOpenOrderLookup={() => setShowLookupModal(true)} />
        <AdminPanel onBackToStore={() => setActiveTab('fetish')} />
        <Footer onOpenLegal={(type) => setLegalModalType(type)} />
      </div>
    );
  }

  if (confirmedOrderNumber) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} onOpenOrderLookup={() => setShowLookupModal(true)} />
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
      />

      <main className="flex-1">
        
        {/* HERO PORTADA */}
        <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-900 border-b border-crimson-600/20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-crimson-900/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-gold border border-gold-500/30 text-gold-400 text-xs font-mono tracking-widest uppercase mb-2 animate-bounce">
              <Crown className="w-4 h-4 text-gold-400" />
              Boutique Findom & Fetish Exclusiva
            </div>

            <h1 className="font-sans font-black text-4xl sm:text-6xl lg:text-7xl tracking-wider text-white">
              YAKUZA <span className="text-crimson-gradient">HOUSE</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              Descubre lencería usada, fluidos exclusivos y piezas únicas con compra directa sin formularios largos. Envío discreto garantizado o gestión directa por Vinted.
            </p>

            {/* Direct Quick Action */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={() => setActiveTab('fetish')}
                className="py-3.5 px-8 rounded-xl bg-gradient-to-r from-crimson-700 via-crimson-600 to-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-widest shadow-xl shadow-crimson-600/30 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-gold-400" />
                Explorar Catálogo de la Tienda
              </button>
            </div>

          </div>
        </section>

        {/* TAB 1: FETISH HOUSE */}
        {activeTab === 'fetish' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
            
            {/* Intro Quote */}
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-crimson-500 max-w-4xl mx-auto space-y-4">
              <p className="text-sm sm:text-base text-gray-200 italic font-serif leading-relaxed">
                “Mi saliva, las marcas en mis suelas, mis calcetines sudados tras una dura sesión o incluso mi repostería fina es un manjar reservado para alguien inferior como tú. Me encanta complacerme a tu costa y otorgarte el honor de poseer mi esencia.”
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-400 pt-2 border-t border-gray-800">
                <span className="flex items-center gap-1.5 text-gold-400">
                  <Lock className="w-3.5 h-3.5" /> Envíos discretos y sellados al vacío
                </span>
                <span className="flex items-center gap-1.5 text-crimson-400">
                  <ShoppingBag className="w-3.5 h-3.5" /> Opción de gestión por Vinted integrada
                </span>
              </div>
            </div>

            {/* CATÁLOGOS GALERÍAS */}
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-gray-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-crimson-400 uppercase tracking-widest block">Catálogo Fetish House</span>
                  <h2 className="font-sans font-extrabold text-2xl text-white">Ropa Íntima y Accesorios (RIA)</h2>
                </div>
                <p className="text-xs text-gray-400 font-mono">Selecciona un artículo para configurar modal y extras</p>
              </div>

              {loadingItems ? (
                <div className="py-12 text-center text-xs font-mono text-gray-500">Cargando catálogo...</div>
              ) : riaItems.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Fallback Sample RIA cards if db empty before seed */}
                  {[1, 2, 3, 4].map(idx => (
                    <ItemCard
                      key={idx}
                      item={{
                        id: `sample-ria-${idx}`,
                        code: `RIA${idx}`,
                        name: `Lencería Exclusiva RIA${idx}`,
                        description: 'Prenda de seda usada en sesión especial de entrenamiento.',
                        basePrice: 50 + idx * 10,
                        status: 'AVAILABLE'
                      }}
                      onBuyNow={handleBuyNow}
                      onViewDetails={setSelectedDetailItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {riaItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onBuyNow={handleBuyNow}
                      onViewDetails={setSelectedDetailItem}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* FLUIDOS Y PRODUCTOS */}
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-gray-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-gold-400 uppercase tracking-widest block">Esencias & Delicias</span>
                  <h2 className="font-sans font-extrabold text-2xl text-white">Fluidos y Productos (FR)</h2>
                </div>
              </div>

              {loadingItems ? (
                <div className="py-12 text-center text-xs font-mono text-gray-500">Cargando catálogo...</div>
              ) : frItems.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(idx => (
                    <ItemCard
                      key={idx}
                      item={{
                        id: `sample-fr-${idx}`,
                        code: `FR${idx}`,
                        name: `Producto Especial FR${idx}`,
                        description: 'Esencia artesanal empaquetada bajo protocolo exclusivo.',
                        basePrice: 40 + idx * 15,
                        status: 'AVAILABLE'
                      }}
                      onBuyNow={handleBuyNow}
                      onViewDetails={setSelectedDetailItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {frItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onBuyNow={handleBuyNow}
                      onViewDetails={setSelectedDetailItem}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* OTROS ARTÍCULOS */}
            {otherItems.length > 0 && (
              <div>
                <h2 className="font-sans font-extrabold text-2xl text-white mb-6 border-b border-gray-800 pb-4">Otros Artículos del Catálogo</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {otherItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onBuyNow={handleBuyNow}
                      onViewDetails={setSelectedDetailItem}
                    />
                  ))}
                </div>
              </div>
            )}

          </section>
        )}

        {/* SECCIÓN EN CONSTRUCCIÓN PARA OTRAS PESTAÑAS */}
        {activeTab !== 'fetish' && activeTab !== 'admin' && (
          <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Crown className="w-8 h-8 animate-pulse" />
            </div>

            <div className="inline-block">
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
                🚧 Sección En Construcción
              </span>
            </div>

            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-white">
              Próximamente Disponible
            </h2>

            <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed font-light">
              Esta sección se encuentra en desarrollo. Por el momento, la <strong className="text-white">Tienda Yakuza Store</strong> está 100% activa para consultar el catálogo y realizar compras directas.
            </p>

            <div className="pt-4">
              <button
                onClick={() => setActiveTab('fetish')}
                className="py-3.5 px-8 rounded-xl bg-gradient-to-r from-crimson-700 via-crimson-600 to-crimson-500 text-white font-sans font-bold text-xs uppercase tracking-widest shadow-xl shadow-crimson-600/30 hover:scale-105 transition-all"
              >
                Ir a la Tienda Oficial
              </button>
            </div>
          </section>
        )}


      </main>

      {/* Item Detail Modal */}
      {selectedDetailItem && (
        <ItemDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          onBuyNow={handleBuyNow}
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

      {/* Footer */}
      <Footer onOpenLegal={(type) => setLegalModalType(type)} />

    </div>
  );
}
