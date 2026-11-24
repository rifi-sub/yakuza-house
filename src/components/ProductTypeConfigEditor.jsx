import React from 'react';
import { Plus, Trash2, Eye, EyeOff, Sliders } from 'lucide-react';

const PRODUCT_TYPES = [
  { id: 'PHYSICAL', label: 'Producto Físico (variantes, cantidad, envío)' },
  { id: 'CUSTOM_VIDEO', label: 'Vídeo Personalizado (precio/min + duración mínima)' },
  { id: 'CUSTOM_AUDIO', label: 'Audio Personalizado (precio/min + duración mínima)' },
  { id: 'LIBRARY_VIDEO', label: 'Biblioteca · Vídeo ya disponible (digital)' },
  { id: 'LIBRARY_AUDIO', label: 'Biblioteca · Audio ya disponible (digital)' },
  { id: 'SUBSCRIPTION', label: 'Suscripción Telegram / Instagram (sin envío físico)' },
  { id: 'BILL', label: 'Factura / Adopt a Bill (financiación 1 / 3 / 6 / 12 meses)' },
  { id: 'AUDIENCE', label: 'Audiencia Privada (cita digital)' },
  { id: 'TRIBUTE', label: 'Tributo / Regalo Directo' }
];

export function parsePurchaseConfig(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return {}; }
}

export function ProductTypeConfigEditor({ productType = 'PHYSICAL', purchaseConfig = {}, basePrice = 50, onChangeType, onChangeConfig }) {
  const cfg = parsePurchaseConfig(purchaseConfig);

  const updateCfg = (patch) => {
    onChangeConfig({ ...cfg, ...patch });
  };

  const variants = Array.isArray(cfg.variants) ? cfg.variants : [];
  const addVariant = () => {
    const next = [
      ...variants,
      { id: `var-${Date.now()}`, group: 'Variedad', label: 'Nueva opción', price: Number(basePrice) || 50, available: true }
    ];
    updateCfg({ variants: next });
  };
  const updateVariant = (idx, patch) => {
    const next = variants.map((v, i) => (i === idx ? { ...v, ...patch } : v));
    updateCfg({ variants: next });
  };
  const removeVariant = (idx) => {
    updateCfg({ variants: variants.filter((_, i) => i !== idx) });
  };

  const toggleAllowedMonth = (m) => {
    const current = Array.isArray(cfg.allowedMonths) && cfg.allowedMonths.length > 0 ? cfg.allowedMonths.map(Number) : [1, 3, 6, 12];
    const exists = current.includes(m);
    const next = exists ? current.filter(x => x !== m) : [...current, m].sort((a, b) => a - b);
    updateCfg({ allowedMonths: next.length > 0 ? next : [1] });
  };

  return (
    <div className="p-4 rounded-xl bg-dark-950 border border-gold-500/30 space-y-4">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-gold-300 uppercase">
        <Sliders className="w-4 h-4 text-gold-400" />
        Tipo de Producto y Opciones de Compra
      </div>

      <div>
        <label className="block text-xs font-mono text-gray-300 mb-1">Tipo de Producto</label>
        <select
          value={productType || 'PHYSICAL'}
          onChange={(e) => onChangeType(e.target.value)}
          className="w-full bg-dark-900 border border-gold-500/40 rounded-lg px-3 py-2 text-xs text-white"
        >
          {PRODUCT_TYPES.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* CONFIGURACIÓN PRODUCTO FÍSICO */}
      {productType === 'PHYSICAL' && (
        <div className="space-y-3 pt-2 border-t border-gray-800 text-xs font-mono">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-dark-900 border border-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={cfg.allowQuantity !== false}
                onChange={e => updateCfg({ allowQuantity: e.target.checked })}
              />
              <span className="text-gray-200">Permitir elegir cantidad</span>
            </label>
            <div>
              <label className="block text-gray-400 mb-1 text-[11px]">Cantidad máxima</label>
              <input
                type="number"
                min="1"
                max="50"
                value={cfg.maxQuantity ?? 10}
                onChange={e => updateCfg({ maxQuantity: parseInt(e.target.value, 10) || 10 })}
                className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gold-300 font-bold text-[11px] uppercase">
                Tamaños / Capacidades / Variedades / Cantidades (con precio propio)
              </span>
              <button
                type="button"
                onClick={addVariant}
                className="py-1 px-2.5 rounded bg-gold-500/20 border border-gold-500/50 text-gold-300 hover:bg-gold-500 hover:text-dark-950 font-bold flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3 h-3" /> Añadir Opción
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic">
                Sin variantes específicas (se usará el precio inicial y las modalidades estándar).
              </p>
            ) : (
              <div className="space-y-2">
                {variants.map((v, idx) => (
                  <div key={v.id || idx} className="grid grid-cols-12 gap-2 items-center bg-dark-900 p-2 rounded-lg border border-gray-800">
                    <select
                      value={v.group || 'Variedad'}
                      onChange={e => updateVariant(idx, { group: e.target.value })}
                      className="col-span-3 bg-dark-950 border border-gray-700 rounded px-2 py-1 text-[11px] text-white"
                    >
                      <option value="Variedad">Variedad</option>
                      <option value="Tamaño">Tamaño</option>
                      <option value="Capacidad">Capacidad</option>
                      <option value="Cantidad">Cantidad</option>
                    </select>
                    <input
                      type="text"
                      value={v.label}
                      onChange={e => updateVariant(idx, { label: e.target.value })}
                      placeholder="Nombre opción"
                      className="col-span-4 bg-dark-950 border border-gray-700 rounded px-2 py-1 text-[11px] text-white"
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={v.price}
                      onChange={e => updateVariant(idx, { price: parseFloat(e.target.value) || 0 })}
                      placeholder="€"
                      className="col-span-2 bg-dark-950 border border-gray-700 rounded px-2 py-1 text-[11px] text-gold-300 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => updateVariant(idx, { available: v.available === false ? true : false })}
                      className={`col-span-2 py-1 px-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 ${
                        v.available !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}
                      title="Activar / Desactivar disponibilidad"
                    >
                      {v.available !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {v.available !== false ? 'Disp.' : 'Agot.'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="col-span-1 text-gray-500 hover:text-red-400 flex justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN VÍDEO / AUDIO PERSONALIZADO */}
      {(productType === 'CUSTOM_VIDEO' || productType === 'CUSTOM_AUDIO') && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-800 text-xs font-mono">
          <div>
            <label className="block text-gray-400 mb-1">Precio por minuto (€/min)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={cfg.pricePerMinute ?? basePrice ?? 20}
              onChange={e => updateCfg({ pricePerMinute: parseFloat(e.target.value) || 0 })}
              className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-gold-300 font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Duración mínima (min)</label>
            <input
              type="number"
              min="1"
              value={cfg.minMinutes ?? 1}
              onChange={e => updateCfg({ minMinutes: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Duración máxima (min)</label>
            <input
              type="number"
              min="1"
              value={cfg.maxMinutes ?? 30}
              onChange={e => updateCfg({ maxMinutes: Math.max(1, parseInt(e.target.value, 10) || 30) })}
              className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
            />
          </div>
          <div className="col-span-2 sm:col-span-3">
            <label className="block text-gray-400 mb-1">Nota informativa de tarifa (opcional)</label>
            <input
              type="text"
              value={cfg.durationNote || ''}
              onChange={e => updateCfg({ durationNote: e.target.value })}
              placeholder="Ej: 3 min mínimo · precio variable según la propuesta"
              className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
            />
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN FACTURA (BILL) */}
      {productType === 'BILL' && (
        <div className="space-y-3 pt-2 border-t border-gray-800 text-xs font-mono">
          <div>
            <label className="block text-gray-400 mb-1">Importe mensual de la factura (€/mes)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={cfg.monthlyAmount ?? basePrice ?? 30}
              onChange={e => updateCfg({ monthlyAmount: parseFloat(e.target.value) || 0 })}
              className="w-full bg-dark-900 border border-gray-700 rounded px-3 py-2 text-gold-300 font-bold"
            />
          </div>
          <div>
            <span className="block text-gray-400 mb-1.5">Plazos de financiación habilitados:</span>
            <div className="flex flex-wrap gap-2">
              {[1, 3, 6, 12].map(m => {
                const list = Array.isArray(cfg.allowedMonths) && cfg.allowedMonths.length > 0 ? cfg.allowedMonths.map(Number) : [1, 3, 6, 12];
                const active = list.includes(m);
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => toggleAllowedMonth(m)}
                    className={`px-3 py-1.5 rounded-lg border font-bold ${
                      active ? 'bg-gold-500 text-dark-950 border-gold-400' : 'bg-dark-900 text-gray-400 border-gray-700'
                    }`}
                  >
                    {m} {m === 1 ? 'mes' : 'meses'} ({((cfg.monthlyAmount ?? basePrice ?? 0) * m).toFixed(0)}€)
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN SUSCRIPCIÓN */}
      {productType === 'SUBSCRIPTION' && (
        <div className="space-y-3 pt-2 border-t border-gray-800 text-xs font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Plataforma</label>
              <select
                value={cfg.platform || 'TELEGRAM'}
                onChange={e => updateCfg({ platform: e.target.value })}
                className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
              >
                <option value="TELEGRAM">Telegram</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="OTHER">Otra Plataforma</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Precio mensual (€/mes)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={cfg.monthlyPrice ?? basePrice ?? 30}
                onChange={e => updateCfg({ monthlyPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-gold-300 font-bold"
              />
            </div>
          </div>
          <div>
            <span className="block text-gray-400 mb-1.5">Duraciones disponibles:</span>
            <div className="flex flex-wrap gap-2">
              {[1, 3, 6, 12].map(m => {
                const list = Array.isArray(cfg.allowedMonths) && cfg.allowedMonths.length > 0 ? cfg.allowedMonths.map(Number) : [1];
                const active = list.includes(m);
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => toggleAllowedMonth(m)}
                    className={`px-3 py-1.5 rounded-lg border font-bold ${
                      active ? 'bg-gold-500 text-dark-950 border-gold-400' : 'bg-dark-900 text-gray-400 border-gray-700'
                    }`}
                  >
                    {m} {m === 1 ? 'mes' : 'meses'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN BIBLIOTECA / AUDIENCIA / TRIBUTO */}
      {['LIBRARY_VIDEO', 'LIBRARY_AUDIO', 'AUDIENCE', 'TRIBUTE'].includes(productType) && (
        <div className="space-y-2.5 pt-2 border-t border-gray-800 text-xs font-mono">
          <div>
            <label className="block text-gray-400 mb-1">Nota de entrega digital / instrucciones</label>
            <input
              type="text"
              value={cfg.deliveryNote || ''}
              onChange={e => updateCfg({ deliveryNote: e.target.value })}
              placeholder="Ej: Entrega digital directa tras confirmar el pago"
              className="w-full bg-dark-900 border border-gray-700 rounded px-2.5 py-1.5 text-white"
            />
          </div>
          {productType === 'TRIBUTE' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(cfg.allowCustomAmount)}
                onChange={e => updateCfg({ allowCustomAmount: e.target.checked })}
              />
              <span className="text-gray-200">Permitir que el usuario elija un importe libre</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
