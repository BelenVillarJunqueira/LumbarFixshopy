import React, { useState, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { Product, BundleOption } from "../types";

interface StickyBuyBarProps {
  product: Product;
  selectedBundle: BundleOption;
  onDirectBuy: () => void;
}

export const StickyBuyBar: React.FC<StickyBuyBarProps> = ({
  product,
  selectedBundle,
  onDirectBuy
}) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // If user dismissed it manually, do not show
      if (dismissed) return;

      const footer = document.getElementById("site-footer");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        // Hide well before reaching footer (180px before) so it NEVER covers footer or admin access
        if (rect.top <= window.innerHeight + 180) {
          setNearFooter(true);
          return;
        } else {
          setNearFooter(false);
        }
      }

      // Show sticky bar once scrolled down 450px
      if (window.scrollY > 450) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(price);
  };

  if (dismissed || !visible || nearFooter) return null;

  return (
    <div
      id="sticky-buy-bar"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-3 sm:px-4 shadow-2xl transition-all duration-300 transform translate-y-0"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Product preview */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={selectedBundle.imagen || product.img}
              alt={product.nombre}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {product.nombre}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-black text-cyan-700">
                {formatPrice(selectedBundle.precio)}
              </span>
              {selectedBundle.precioAnterior && (
                <span className="text-slate-400 line-through text-[11px] hidden sm:inline">
                  {formatPrice(selectedBundle.precioAnterior)}
                </span>
              )}
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 hidden sm:inline-block">
                Envío Gratis
              </span>
            </div>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-sticky-comprar"
            onClick={onDirectBuy}
            className="px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>COMPRAR AHORA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar barra flotante"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
