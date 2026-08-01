import React from 'react';
import { Shield, Lock, Truck, HelpCircle } from 'lucide-react';

export default function Footer({ onOpenLegal }) {
  return (
    <footer className="bg-dark-900 border-t border-crimson-600/20 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h3 className="font-sans font-bold text-white tracking-widest text-lg mb-3">YAKUZA HOUSE</h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Boutique exclusiva de productos fetish, ropa íntima y experiencias Findom. Compra discreta y gestión directa sin intermediarios.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 bg-gold-500/10 px-3 py-1.5 rounded border border-gold-500/20 w-fit">
            <Lock className="w-3.5 h-3.5" />
            Compra Discreta Garantizada
          </div>
        </div>

        <div>
          <h4 className="font-sans font-semibold text-white text-xs uppercase tracking-widest mb-4">Garantías & Privacidad</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-crimson-500" />
              Mínima información requerida
            </li>
            <li className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-crimson-500" />
              Embalaje discreto y sellado hermético
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-crimson-500" />
              Pago seguro por pasarela externa
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans font-semibold text-white text-xs uppercase tracking-widest mb-4">Información Legal</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onOpenLegal('terms')} className="hover:text-gold-400 transition-colors">
                Condiciones de Compra
              </button>
            </li>
            <li>
              <button onClick={() => onOpenLegal('privacy')} className="hover:text-gold-400 transition-colors">
                Política de Privacidad y Discreción
              </button>
            </li>
            <li>
              <button onClick={() => onOpenLegal('refund')} className="hover:text-gold-400 transition-colors">
                Política de Cancelación y Reembolsos
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans font-semibold text-white text-xs uppercase tracking-widest mb-4">Gestión por Vinted</h4>
          <p className="text-xs leading-relaxed text-gray-400 mb-3">
            Puedes seleccionar la opción de gestionar tu pedido a través de Vinted al finalizar tu compra para disfrutar de sus puntos de recogida y protección.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-crimson-400 font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            Integrable en el checkout directo
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800/80 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 font-mono gap-4">
        <p>© 2026 YAKUZA HOUSE. Todos los derechos reservados.</p>
        <p className="text-[11px]">Diseño de alta discreción • Pagos seguros SSL</p>
      </div>
    </footer>
  );
}
