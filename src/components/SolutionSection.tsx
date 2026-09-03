import React from "react";
import { Flame, Wind, Activity, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { SiteContent } from "../types";

interface SolutionSectionProps {
  siteContent: SiteContent;
  onScrollToProduct: () => void;
}

export const SolutionSection: React.FC<SolutionSectionProps> = ({
  siteContent,
  onScrollToProduct
}) => {
  const { solucion } = siteContent;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "flame":
        return <Flame className="w-6 h-6 text-amber-500" />;
      case "compress":
        return <Wind className="w-6 h-6 text-cyan-500" />;
      default:
        return <Activity className="w-6 h-6 text-emerald-500" />;
    }
  };

  return (
    <section id="como-funciona" className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold tracking-widest uppercase border border-cyan-200">
            {solucion.badge}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
            {solucion.titulo}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            {solucion.descripcion}
          </p>
        </div>

        {/* 3 Interactive Pillars */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {solucion.pilares.map((pilar, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-cyan-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {getIcon(pilar.icono)}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {pilar.titulo}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pilar.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center text-xs font-bold text-cyan-700">
                <span>Efecto clínico comprobado</span>
                <Check className="w-4 h-4 ml-1.5 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Technical Banner / How Decompression Works visually */}
        <div className="mt-12 p-6 sm:p-10 rounded-3xl bg-linear-to-r from-slate-900 to-slate-950 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Principio Fisiológico de Tracción
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight font-['Space_Grotesk'] leading-snug">
              ¿Por qué las fajas comunes no sirven y Lumbar Fix sí?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Las fajas elásticas tradicionales solo aprietan el estómago y pueden debilitar los músculos. 
              <strong> Lumbar Fix no aprieta: empuja verticalmente</strong>, creando una separación física entre las vértebras L4-L5 y L5-S1 que elimina la presión sobre los nervios pinzados.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="bg-slate-800/80 text-cyan-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700">
                ✔ Descompresión de hasta 20% de carga
              </span>
              <span className="bg-slate-800/80 text-cyan-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700">
                ✔ Permite caminar o trabajar sentado
              </span>
            </div>
          </div>

          <button
            onClick={onScrollToProduct}
            className="w-full lg:w-auto px-7 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>PEDIR MI LUMBAR FIX</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
