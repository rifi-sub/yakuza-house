import React from 'react';
import { X, ShieldCheck, Lock, FileText, RefreshCw } from 'lucide-react';

export default function LegalModal({ type, onClose }) {
  if (!type) return null;

  const contentMap = {
    terms: {
      title: 'Condiciones Generales de Compra',
      icon: FileText,
      body: (
        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
          <p><strong>1. Objeto y Alcance:</strong> Las presentes condiciones regulan las compras directas efectuadas a través de la plataforma YAKUZA HOUSE.</p>
          <p><strong>2. Precios y Pagos:</strong> Todos los precios indicados incluyen el contenido y la modalidad seleccionada. Los pagos se completan automáticamente mediante pasarela segura (tarjeta, Bizum, PayPal o transferencia).</p>
          <p><strong>3. Plazos de Preparación:</strong> Cada producto cuenta con un plazo estimado de preparación de entre 24 y 72 horas. La confirmación del estado del pedido se actualizará en tiempo real.</p>
          <p><strong>4. Aceptación de Condiciones:</strong> El comprador debe aceptar expresamente las condiciones específicas de cada artículo antes de finalizar la transacción.</p>
        </div>
      )
    },
    privacy: {
      title: 'Política de Privacidad y Discreción',
      icon: Lock,
      body: (
        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
          <p><strong>1. Principio de Mínima Información:</strong> Solicitamos únicamente los datos imprescindibles (alias, medio de contacto preferido e información básica de pago o entrega).</p>
          <p><strong>2. Embalaje Discreto:</strong> Todos los envíos físicos se realizan en envoltorios neutros, sellados herméticamente y sin marcas exteriores ni remitente identificable.</p>
          <p><strong>3. Transparencia sobre Privacidad:</strong> No empleamos promesas engañosas de "anonimato absoluto". Ofrecemos una experiencia de compra discreta, respetuosa con la privacidad del comprador y adaptada al canal elegido (Telegram, Vinted, Email, etc.).</p>
          <p><strong>4. Derechos de Datos:</strong> El usuario puede solicitar la eliminación o anonimización de sus datos de contacto una vez completada la transacción.</p>
        </div>
      )
    },
    refund: {
      title: 'Política de Cancelación y Reembolso',
      icon: RefreshCw,
      body: (
        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
          <p><strong>1. Cancelación de Pedidos:</strong> Se permite la cancelación de un pedido y reembolso completo mientras el estado no haya pasado a "En preparación" o "Enviado".</p>
          <p><strong>2. Artículos Personalizados:</strong> Los productos personalizados o con extras a medida no admiten devolución una vez confeccionados o enviados, salvo defecto del producto.</p>
          <p><strong>3. Gestión de Incidencias:</strong> Ante cualquier eventualidad, el comprador será contactado directamente a través de su canal preferido para resolver la incidencia de forma inmediata.</p>
        </div>
      )
    }
  };

  const activeContent = contentMap[type] || contentMap.terms;
  const Icon = activeContent.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-modal rounded-2xl p-6 w-full max-w-xl text-gray-100 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-dark-900 text-gray-400 hover:text-white border border-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-800">
          <div className="p-2.5 rounded-xl bg-crimson-600/20 text-crimson-500 border border-crimson-500/30">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-lg text-white">{activeContent.title}</h3>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {activeContent.body}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 text-right">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-sans font-bold text-xs uppercase"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
