import React, { useState } from "react";
import { Check, X, ShieldAlert, Sparkles } from "lucide-react";

export const BeforeAfterSection: React.FC = () => {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold tracking-widest uppercase border border-cyan-200">
            <Sparkles className="w-3.5 h-3.5" /> Evidencia Fotográfica Real
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
            RESULTADOS VISIBLES EN POCOS DÍAS
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600">
            Deslizá el cursor para comparar la curvatura y descompresión de la columna antes y después de utilizar Lumbar Fix®.
          </p>
        </div>

        {/* Interactive Comparison Slider or Side by Side Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* LADO ANTES */}
          <div className="bg-rose-50/50 rounded-2xl border-2 border-rose-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-300">
                <X className="w-3.5 h-3.5 text-rose-600" /> ANTES (Columna comprimida)
              </span>
              <span className="text-xs text-rose-700 font-semibold">Sin Lumbar Fix</span>
            </div>

            <div className="rounded-xl overflow-hidden bg-white aspect-4/3 flex items-center justify-center border border-rose-100 shadow-inner">
              <img
                src="/images/antes.jpg"
                alt="Postura antes"
                className="w-full h-full object-contain p-2"
              />
            </div>

            <ul className="text-xs text-slate-700 space-y-1.5 pt-1">
              <li className="flex items-center gap-2 text-rose-900">
                <span className="text-rose-500 font-bold">✕</span> Discos L4-L5 colapsados por peso
              </li>
              <li className="flex items-center gap-2 text-rose-900">
                <span className="text-rose-500 font-bold">✕</span> Pinzamiento del nervio ciático
              </li>
              <li className="flex items-center gap-2 text-rose-900">
                <span className="text-rose-500 font-bold">✕</span> Curvatura lumbar forzada hacia adelante
              </li>
            </ul>
          </div>

          {/* LADO DESPUÉS */}
          <div className="bg-cyan-50/50 rounded-2xl border-2 border-cyan-400 p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 bg-cyan-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-xs">
                <Check className="w-3.5 h-3.5" /> DESPUÉS (Tracción neumática)
              </span>
              <span className="text-xs text-cyan-800 font-bold">Con Lumbar Fix</span>
            </div>

            <div className="rounded-xl overflow-hidden bg-white aspect-4/3 flex items-center justify-center border border-cyan-200 shadow-inner">
              <img
                src="/images/despues.jpg"
                alt="Postura después"
                className="w-full h-full object-contain p-2"
              />
            </div>

            <ul className="text-xs text-slate-700 space-y-1.5 pt-1">
              <li className="flex items-center gap-2 text-cyan-950 font-medium">
                <span className="text-emerald-600 font-bold">✔</span> Apertura de 3 a 5 mm entre vértebras
              </li>
              <li className="flex items-center gap-2 text-cyan-950 font-medium">
                <span className="text-emerald-600 font-bold">✔</span> Alivio inmediato de pinchazo y adormecimiento
              </li>
              <li className="flex items-center gap-2 text-cyan-950 font-medium">
                <span className="text-emerald-600 font-bold">✔</span> Postura ergonómica erguida sin esfuerzo
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
