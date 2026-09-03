import React, { useState } from "react";
import { Star, CheckCircle2, ThumbsUp, MessageSquarePlus } from "lucide-react";
import { SiteContent, Testimonio } from "../types";

interface CustomerReviewsProps {
  siteContent: SiteContent;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ siteContent }) => {
  const { testimonios, ratingScore, ratingCount } = siteContent;
  const [filter, setFilter] = useState<number | "all">("all");

  const filteredReviews = filter === "all"
    ? testimonios
    : testimonios.filter((t) => t.rating === filter);

  return (
    <section id="testimonios" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            Experiencias Reales
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Personas como vos que recuperaron su bienestar
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Opiniones de clientes que usan Lumbar Fix a diario en sus casas y trabajos.
          </p>
        </div>

        {/* Rating Summary Bar */}
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="text-4xl sm:text-5xl font-black text-slate-900 font-['Space_Grotesk']">
              {ratingScore}
            </div>
            <div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-600 font-semibold block mt-1">
                Basado en {ratingCount} compras verificadas
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Todas las opiniones
            </button>
            <button
              onClick={() => setFilter(5)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                filter === 5
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>5 Estrellas</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{rev.autor}</span>
                      {rev.ciudad && (
                        <span className="text-xs text-slate-400">({rev.ciudad})</span>
                      )}
                    </div>
                    {rev.verificado && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Comprador verificado</span>
                      </div>
                    )}
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  "{rev.comentario}"
                </p>

                {rev.foto && (
                  <div className="mt-3 w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={rev.foto} alt="Foto cliente" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{rev.fecha}</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <ThumbsUp className="w-3 h-3" /> Recomienda este producto
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
