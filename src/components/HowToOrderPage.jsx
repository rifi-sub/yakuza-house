import React from 'react';
import { ShoppingCart, CheckCircle2, Send, HelpCircle, ArrowRight, ShieldCheck, Sparkles, FileText } from 'lucide-react';

export default function HowToOrderPage({ onNavigateToStore }) {
  const steps = [
    {
      number: 'PASO 1',
      title: 'Selecciona tu Artículo & Código',
      description: 'Cada artículo de la boutique tiene un código único (ej: RIA12, FR2, RIA25). Apúntalo o cópialo para formalizar tu pedido.',
      icon: FileText
    },
    {
      number: 'PASO 2',
      title: 'Añade a la Cesta o Pago Directo',
      description: 'Haz clic en "Comprar" o "Cesta". En la ventana de pago, añade el código único en el concepto del pago de forma FUNDAMENTAL.',
      icon: ShoppingCart
    },
    {
      number: 'PASO 3',
      title: 'Verificación & Seguimiento',
      description: 'Envía captura de pantalla del pago por Email, X o Telegram. Una vez confirmado, tu paquete será sellado al vacío y enviado con la máxima discreción.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full legibility-shield border border-gold-500/50 text-gold-300 text-xs font-sans tracking-widest uppercase shadow-lg">
          <HelpCircle className="w-4 h-4 text-gold-400" />
          ✦ GUÍA PASO A PASO DE REALIZACIÓN DE PEDIDOS ✦
        </div>

        <h1 className="font-sans font-black text-4xl sm:text-6xl text-ivory-100 display-shadow tracking-widest">
          HOW TO <span className="text-bordeaux-gradient">ORDER</span>
        </h1>

        <div className="artdeco-divider max-w-sm mx-auto">
          <div className="ad-center" />
        </div>

        <p className="text-sm sm:text-base text-ivory-300 font-body leading-relaxed legibility-shield p-4 rounded-xl border border-gold-500/20">
          Proceso rápido, discreto y sin formularios largos. Sigue estos 3 pasos para obtener tu pieza o artículo exclusivo.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {steps.map((stg, idx) => {
          const Icon = stg.icon;
          return (
            <div key={idx} className="legibility-bordeaux p-8 rounded-2xl border border-gold-500/40 space-y-4 flex flex-col justify-between shadow-2xl relative">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gold-500/30 pb-3">
                  <span className="text-xs font-sans font-bold text-gold-400 tracking-widest">{stg.number}</span>
                  <div className="w-8 h-8 rounded-full bg-dark-950 flex items-center justify-center border border-gold-500/30 text-gold-400">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-sans font-bold text-lg text-ivory-100">{stg.title}</h3>
                <p className="text-xs text-ivory-300 font-body leading-relaxed">{stg.description}</p>
              </div>

              <div className="pt-2 text-[10px] font-sans text-gold-400/80 flex items-center gap-1 uppercase tracking-widest">
                <span>Paso {idx + 1} de 3</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vinted & Discreet Shipping Callout */}
      <div className="legibility-shield p-8 rounded-2xl border border-gold-500/35 max-w-4xl mx-auto grid md:grid-cols-2 gap-6 items-center shadow-2xl">
        <div className="space-y-3">
          <span className="text-xs font-sans text-gold-400 uppercase tracking-widest block">EMBALAJE & ENVÍO</span>
          <h3 className="font-sans font-bold text-xl text-ivory-100">Gestión por Vinted o Envío Directo</h3>
          <p className="text-xs text-ivory-300 font-body leading-relaxed">
            Puedes seleccionar la opción de gestionar tu pedido a través de Vinted al finalizar la compra para disfrutar de sus puntos de recogida neutros, o recibir un envío directo sellado al vacío en paquete neutro sin logotipos.
          </p>
        </div>

        <div className="flex flex-col gap-3 justify-center items-center md:items-end">
          <button
            onClick={onNavigateToStore}
            className="btn-royal-gold"
          >
            <Sparkles className="w-4 h-4 text-dark-950" />
            <span>Ir al Catálogo de la Tienda</span>
          </button>
        </div>
      </div>

    </div>
  );
}
