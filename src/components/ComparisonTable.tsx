import React from "react";
import { Check, X, ShieldCheck } from "lucide-react";
import { SiteContent } from "../types";

interface ComparisonTableProps {
  siteContent: SiteContent;
  onScrollToProduct: () => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  siteContent,
  onScrollToProduct
}) => {
  const { comparativa } = siteContent;

  const renderCell = (val: boolean | string, isLumbarFix = false) => {
    if (typeof val === "boolean") {
      return val ? (
        <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto ${isLumbarFix ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"}`}>
          <Check className="w-3.5 h-3.5 stroke-3" />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto">
          <X className="w-3.5 h-3.5 stroke-3" />
        </div>
      );
    }
    return <span className="text-xs text-slate-500 font-medium text-center block">{val}</span>;
  };

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100/70 text-cyan-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" /> Comparativa Definitiva
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Lumbar Fix® vs Otras Soluciones
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Descubrí por qué miles de personas abandonaron las fajas rígidas y los analgésicos para frenar el problema de raíz.
          </p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-150">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5 w-1/2">Beneficio / Característica</th>
                  <th className="p-4 sm:p-5 w-1/4 text-center bg-cyan-50/80 border-x border-cyan-200 text-cyan-900 font-black">
                    <span className="block text-sm">LUMBAR FIX®</span>
                    <span className="text-[10px] text-cyan-700 font-normal">Tracción neumática</span>
                  </th>
                  <th className="p-4 sm:p-5 text-center">Fajas Tradicionales</th>
                  <th className="p-4 sm:p-5 text-center">Pastillas / Analgésicos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {comparativa.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 sm:p-5 font-semibold text-slate-800">
                      {row.caracteristica}
                    </td>
                    <td className="p-4 sm:p-5 bg-cyan-50/50 border-x border-cyan-200 text-center">
                      {renderCell(row.lumbarFix, true)}
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      {renderCell(row.fajaTradicional)}
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      {renderCell(row.analgesicos)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA under comparison */}
        <div className="mt-8 text-center">
          <button
            onClick={onScrollToProduct}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all cursor-pointer"
          >
            <span>Elegir mi Lumbar Fix con Descuento</span>
          </button>
        </div>
      </div>
    </section>
  );
};
