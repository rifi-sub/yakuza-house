import React, { useState } from 'react';
import { ShoppingBag, Crown, Sparkles, Menu, X, Settings } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenLegal, onOpenOrderLookup, itemsInCartCount = 0, onOpenCart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'fetish', label: 'TIENDA (FETISH HOUSE)', icon: Sparkles, isStore: true },
  ];

  return (
    <header className="sticky top-0 z-40 legibility-shield border-b border-gold-500/35 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('fetish')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-bordeaux-700 via-bordeaux-500 to-gold-400 p-0.5 shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-dark-950 rounded-full flex items-center justify-center border border-gold-500/30">
                <Crown className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <div>
              <span className="font-sans font-extrabold text-xl tracking-widest text-white group-hover:text-gold-300 transition-colors">
                YAKUZA <span className="text-bordeaux-300">HOUSE</span>
              </span>
              <p className="text-[9px] tracking-widest text-gold-500/80 uppercase font-sans">Club Privado & Boutique Fetish</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-xs uppercase tracking-widest font-semibold transition-all ${
                    isActive
                      ? 'bg-bordeaux-600/60 text-gold-300 border border-gold-500/50 shadow-md shadow-bordeaux-700/40'
                      : 'text-ivory-400 hover:text-white hover:bg-gold-500/10 hover:border-gold-500/30 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-gold-500/70'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative py-2 px-4 rounded-lg bg-bordeaux-600/50 border border-gold-500/40 text-ivory-300 text-xs font-sans flex items-center gap-2 hover:bg-bordeaux-500/60 hover:border-gold-400 transition-all shadow-md"
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

            <button
              onClick={onOpenOrderLookup}
              className="text-xs font-sans tracking-wider text-ivory-400 hover:text-gold-300 transition-colors px-3.5 py-2 rounded border border-gold-500/30 hover:border-gold-400 bg-dark-950/60"
            >
              Consultar Pedido
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`p-2 rounded-lg border transition-all ${
                activeTab === 'admin'
                  ? 'bg-gold-500/20 border-gold-400 text-gold-300'
                  : 'border-gold-500/20 text-gold-500/70 hover:text-gold-300 hover:border-gold-400 bg-dark-950/60'
              }`}
              title="Panel de Administración"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
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
            const Icon = link.icon;
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
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gold-400" />
                  <span>{link.label}</span>
                </div>
              </button>
            );
          })}

          <div className="pt-4 border-t border-gold-500/20 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenOrderLookup();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2.5 text-xs font-sans tracking-wider text-gold-300 bg-bordeaux-600/40 rounded border border-gold-500/30"
            >
              Consultar Pedido por Número
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-sans text-ivory-400 hover:text-white"
            >
              <Settings className="w-4 h-4 text-gold-400" />
              Panel de Administración
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
