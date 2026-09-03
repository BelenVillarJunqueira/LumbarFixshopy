import React, { useState, useEffect } from "react";
import { ArrowRight, Flame } from "lucide-react";
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

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar once scrolled down 500px
      if (window.scrollY > 450) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-4 shadow-xl transition-all duration-300 transform translate-y-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Product preview */}
        <div className="flex items-center gap-3 min-w-0">
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

        {/* Action Button */}
        <button
          onClick={onDirectBuy}
          className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer animate-pulse-glow"
        >
          <span>COMPRAR AHORA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
