import React from 'react';
import { Shield, Lock, Truck, HelpCircle, Crown } from 'lucide-react';

export default function Footer({ onOpenLegal }) {
  return (
    <footer className="legibility-shield border-t border-gold-500/35 text-ivory-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      
      {/* Decorative Gold Line */}
      <div className="artdeco-divider max-w-7xl mx-auto mb-10">
        <div className="ad-center" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-gold-400" />
            <h3 className="font-sans font-extrabold text-ivory-100 tracking-widest text-lg">YAKUZA HOUSE</h3>
          </div>
          <p className="text-xs text-ivory-400 leading-relaxed mb-4 font-body">
            Club privado y boutique exclusiva de lencería de autor, objetos de culto y experiencias Findom. Compra discreta y gestión directa.
          </p>
          <div className="wax-seal px-4 py-1.5 text-[10px] shadow-lg">
            ✦ DISCRECIÓN ABSOLUTA ✦
          </div>
        </div>

        <div>
          <h4 className="font-sans font-semibold text-gold-300 text-xs uppercase tracking-widest mb-4">Garantías & Privacidad</h4>
          <ul className="space-y-2 text-xs font-body">
            <li className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-bordeaux-300" />
              Mínima información requerida
            </li>
            <li className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-bordeaux-300" />
              Embalaje discreto y sellado hermético
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-bordeaux-300" />
              Pago seguro por pasarela cifrada SSL
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans font-semibold text-gold-300 text-xs uppercase tracking-widest mb-4">Información Legal</h4>
          <ul className="space-y-2 text-xs font-body">
            <li>
              <button onClick={() => onOpenLegal('terms')} className="hover:text-gold-300 transition-colors">
                Condiciones de Compra
              </button>
            </li>
            <li>
              <button onClick={() => onOpenLegal('privacy')} className="hover:text-gold-300 transition-colors">
                Política de Privacidad y Discreción
              </button>
            </li>
            <li>
              <button onClick={() => onOpenLegal('refund')} className="hover:text-gold-300 transition-colors">
                Política de Cancelación y Reembolsos
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans font-semibold text-gold-300 text-xs uppercase tracking-widest mb-4">Gestión por Vinted</h4>
          <p className="text-xs leading-relaxed text-ivory-400 mb-3 font-body">
            Puedes seleccionar la opción de gestionar tu pedido a través de Vinted al finalizar tu compra para disfrutar de sus puntos de recogida y protección.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gold-400 font-sans">
            <HelpCircle className="w-3.5 h-3.5 text-gold-400" />
            Integrable en el checkout directo
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gold-500/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-ivory-500 font-sans gap-4">
        <p>© 2026 YAKUZA HOUSE. Todos los derechos reservados.</p>
        <p className="text-[11px]">Diseño Club Art Déco • Entorno Seguro Cifrado</p>
      </div>
    </footer>
  );
}
