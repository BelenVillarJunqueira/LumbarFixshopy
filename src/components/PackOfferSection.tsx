import React from "react";
import { Flame, Check, ArrowRight, Sparkles, Tag, ShieldCheck } from "lucide-react";
import { SiteContent, BundleOption } from "../types";

interface PackOfferSectionProps {
  siteContent: SiteContent;
  packBundle: BundleOption;
  onSelectPack: (bundle: BundleOption) => void;
}

export const PackOfferSection: React.FC<PackOfferSectionProps> = ({
  siteContent,
  packBundle,
  onSelectPack
}) => {
  const { packHero } = siteContent;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <section id="pack-recomendado" className="py-16 sm:py-24 bg-linear-to-b from-slate-50 to-cyan-50/40 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border-2 border-cyan-500/80 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left: Pack Image */}
            <div className="lg:col-span-6 bg-slate-900/5 p-6 sm:p-10 flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-slate-200">
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-amber-500 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" /> {packHero.badge}
                </span>
              </div>

              <img
                src={packHero.imagen || "/images/pack2.png"}
                alt="Pack Lumbar Fix Completo"
                className="w-full max-w-md max-h-95 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Right: Content & Pricing */}
            <div className="lg:col-span-6 p-6 sm:p-10 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Tratamiento Integral 4 en 1
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Space_Grotesk']">
                  {packHero.titulo}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  {packHero.subtitulo}
                </p>
              </div>

              {/* Items included list */}
              <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  El kit incluye:
                </span>
                {packHero.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-3" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>

              {/* Price & Savings */}
              <div className="flex items-baseline justify-between border-t border-slate-100 pt-4">
                <div>
                  <div className="text-xs text-slate-400 line-through">
                    Antes: {formatPrice(packHero.precioAntes)}
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-slate-950 font-['Space_Grotesk']">
                    Ahora: {formatPrice(packHero.precioAhora)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
                    <Tag className="w-3.5 h-3.5" /> {packHero.ahorro}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-1">Envío Gratis Incluido</span>
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => onSelectPack(packBundle)}
                className="w-full py-4 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-slate-950 font-black text-base sm:text-lg tracking-wide shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>QUIERO EL PACK COMPLETO</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" /> Garantía de 30 días
                </span>
                <span>•</span>
                <span>Pago contra entrega disponible</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
