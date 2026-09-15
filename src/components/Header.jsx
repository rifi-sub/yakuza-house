import React, { useState } from 'react';
import { ShoppingBag, Crown, Menu, X, Settings, Castle } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  itemsInCartCount = 0, 
  onOpenCart,
  onOpenKingdomAuth,
  currentMember
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'fetish', label: 'Tienda' },
    { id: 'princess', label: 'Yakuza Princess' },
    { id: 'giveaway', label: 'Grand Opening' }
  ];

  return (
    <header className="sticky top-0 z-40 legibility-shield border-b border-gold-500/35 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand (Izquierda) */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3.5 cursor-pointer group shrink-0"
            title="Ir a Inicio"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-bordeaux-700 via-bordeaux-500 to-gold-400 p-0.5 shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-dark-950 rounded-full flex items-center justify-center border border-gold-500/30">
                <Crown className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <div>
              <span className="font-sans font-extrabold text-xl tracking-widest text-white group-hover:text-gold-300 transition-colors">
                YAKUZA <span className="text-gold-400">HOUSE</span>
              </span>
              <p className="text-[9px] tracking-widest text-gold-500/80 uppercase font-sans">Club Privado & Boutique Fetish</p>
            </div>
          </div>

          {/* (Padding Medio) Navegación Central: (Tienda | Yakuza Princess | Grand Opening) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 px-6 lg:px-10 mx-auto">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-4 py-2 rounded-lg font-sans text-xs uppercase tracking-widest font-semibold transition-all ${
                    isActive
                      ? 'bg-bordeaux-600/60 text-gold-300 border border-gold-500/50 shadow-md shadow-bordeaux-700/40'
                      : 'text-ivory-400 hover:text-white hover:bg-gold-500/10 hover:border-gold-500/30 border border-transparent'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* (Padding Medio) Derecha: Acceso Reino | Cesta | Config */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Acceso Reino */}
            <button
              onClick={onOpenKingdomAuth}
              className={`py-2 px-3.5 rounded-lg border text-xs font-sans flex items-center gap-2 transition-all shadow-md ${
                currentMember
                  ? 'bg-gold-500/15 border-gold-400 text-gold-300 font-bold'
                  : 'bg-gradient-to-r from-bordeaux-700/80 to-bordeaux-600/80 hover:from-bordeaux-600 hover:to-bordeaux-500 border-gold-500/50 hover:border-gold-400 text-gold-200 font-semibold'
              }`}
              title={currentMember ? 'Ver mi ficha del Reino' : 'Solicitar entrada o entrar al Reino'}
            >
              <Castle className="w-4 h-4 text-gold-400" />
              <span className="tracking-wider">{currentMember ? `${currentMember.memberNumber || '#'} ${currentMember.alias}` : 'Acceso Reino'}</span>
            </button>

            {/* Cesta */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative py-2 px-3.5 rounded-lg bg-bordeaux-600/50 border border-gold-500/40 text-ivory-300 text-xs font-sans flex items-center gap-2 hover:bg-bordeaux-500/60 hover:border-gold-400 transition-all shadow-md"
                title="Ver Cesta"
              >
                <ShoppingBag className="w-4 h-4 text-gold-400" />
                <span className="font-bold tracking-wider">Cesta</span>
                {itemsInCartCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gold-500 text-dark-950 font-bold text-[10px] flex items-center justify-center animate-pulse shadow-sm">
                    {itemsInCartCount}
                  </span>
                )}
              </button>
            )}

            {/* Config (Admin) */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-2 px-3 rounded-lg border text-xs font-sans flex items-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-gold-500/20 border-gold-400 text-gold-300'
                  : 'border-gold-500/20 text-gold-500/70 hover:text-gold-300 hover:border-gold-400 bg-dark-950/60'
              }`}
              title="Panel de Administración"
            >
              <Settings className="w-4 h-4" />
              <span className="tracking-wider text-[11px] font-medium hidden lg:inline">Config</span>
            </button>
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenKingdomAuth}
              className="p-2 text-gold-400 hover:text-white rounded-lg border border-gold-500/30 bg-dark-950"
              title="Acceso al Reino"
            >
              <Castle className="w-4 h-4" />
            </button>

            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2 text-gold-400 hover:text-white rounded-lg border border-gold-500/30 bg-dark-950"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemsInCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500 text-dark-950 font-bold text-[9px] flex items-center justify-center">
                    {itemsInCartCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-ivory-300 hover:text-white rounded-lg border border-gold-500/30 bg-dark-950"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden legibility-shield border-b border-gold-500/40 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-sans text-xs tracking-widest ${
                  isActive
                    ? 'bg-bordeaux-600/50 text-gold-300 font-bold border border-gold-500/40'
                    : 'text-ivory-400 hover:bg-gold-500/10'
                }`}
              >
                <span>{link.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-gold-500/20 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenKingdomAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2.5 text-xs font-sans tracking-wider text-gold-200 bg-gradient-to-r from-bordeaux-700 to-bordeaux-600 rounded border border-gold-500/40 flex items-center justify-center gap-2"
            >
              <Castle className="w-4 h-4 text-gold-400" />
              {currentMember ? `Expediente: ${currentMember.memberNumber} ${currentMember.alias}` : 'Acceso al Reino / Solicitud'}
            </button>

            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-sans text-ivory-400 hover:text-white"
            >
              <Settings className="w-4 h-4 text-gold-400" />
              Configuración (Admin)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
