import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, Crown, Sparkles, Menu, X, Settings } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenLegal, onOpenOrderLookup, itemsInCartCount = 0 }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'fetish', label: 'TIENDA (FETISH HOUSE)', icon: Sparkles, isStore: true },
  ];



  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-crimson-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('fetish')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-crimson-700 via-crimson-600 to-gold-500 p-0.5 shadow-lg shadow-crimson-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-dark-900 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <div>
              <span className="font-sans font-extrabold text-xl tracking-widest text-white group-hover:text-gold-400 transition-colors">
                YAKUZA <span className="text-crimson-500">HOUSE</span>
              </span>
              <p className="text-[10px] tracking-widest text-gray-400 uppercase font-mono">Findom & Fetish Boutique</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs uppercase tracking-wider font-semibold transition-all ${
                    isActive
                      ? 'bg-crimson-600/20 text-crimson-500 border border-crimson-500/40 shadow-sm shadow-crimson-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-crimson-500' : 'text-gray-400'}`} />
                  <span>{link.label}</span>
                  {link.inConstruction && (
                    <span className="text-[9px] font-mono text-amber-400/90 lowercase tracking-normal bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      (en construcción)
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenOrderLookup}
              className="text-xs font-mono text-gray-400 hover:text-gold-400 transition-colors px-3 py-1.5 rounded border border-gray-800 hover:border-gold-500/30"
            >
              Consultar Pedido
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`p-2 rounded-lg border transition-all ${
                activeTab === 'admin'
                  ? 'bg-gold-500/20 border-gold-500 text-gold-400'
                  : 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              }`}
              title="Panel de Administración"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white rounded-lg border border-gray-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-crimson-600/30 px-4 pt-2 pb-6 space-y-2">
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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-sans text-sm tracking-wider ${
                  isActive
                    ? 'bg-crimson-600/20 text-crimson-500 font-bold border border-crimson-500/30'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </div>
                {link.inConstruction && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-normal">
                    (en construcción)
                  </span>
                )}
              </button>
            );
          })}


          <div className="pt-4 border-t border-gray-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenOrderLookup();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2 text-xs font-mono text-gold-400 bg-gold-500/10 rounded border border-gold-500/20"
            >
              Consultar Pedido por Número
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-sans text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
              Panel de Administración
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
