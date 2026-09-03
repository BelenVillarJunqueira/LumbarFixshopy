import React from "react";
import { AlertTriangle, Clock, Zap, ArrowDownCircle } from "lucide-react";
import { SiteContent } from "../types";

interface ProblemAgitationProps {
  siteContent: SiteContent;
  onScrollToProduct: () => void;
}

export const ProblemAgitation: React.FC<ProblemAgitationProps> = ({
  siteContent,
  onScrollToProduct
}) => {
  const { problema, agitacion } = siteContent;

  return (
    <section id="problema" className="py-16 sm:py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black tracking-widest uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            {problema.badge}
          </span>
        </div>

        {/* Big Problem Headline */}
        <h2 className="text-2xl sm:text-4xl font-extrabold text-center tracking-tight leading-tight text-slate-100 font-['Space_Grotesk'] max-w-3xl mx-auto">
          {problema.titulo}
        </h2>

        <p className="mt-4 text-center text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {problema.resumen}
        </p>

        {/* 4 Acute Symptom Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {problema.items.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3.5 group shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-950 border border-rose-800/50 flex items-center justify-center shrink-0 text-rose-400 text-sm font-bold group-hover:scale-105 transition-transform">
                0{idx + 1}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {item}
              </p>
            </div>
          ))}
        </div>

        {/* AGITATION SECTION */}
        <div className="mt-14 sm:mt-18 p-6 sm:p-8 rounded-3xl bg-linear-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-rose-900/40 shadow-xl relative">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4 text-rose-500" />
            El costo del sedentarismo
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Space_Grotesk']">
            {agitacion.titulo}
          </h3>

          <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>{agitacion.parrafo1}</p>
            <p className="font-semibold text-slate-200">{agitacion.parrafo2}</p>
          </div>

          {/* Alert Callout */}
          <div className="mt-5 p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center gap-3">
            <Zap className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-xs text-rose-200 font-medium">
              {agitacion.alerta}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-center">
            <button
              onClick={onScrollToProduct}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <span>Ver cómo Lumbar Fix frena la compresión</span>
              <ArrowDownCircle className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
