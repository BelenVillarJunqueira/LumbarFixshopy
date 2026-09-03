import React from "react";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { Product } from "../types";

interface OtherProductsGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const OtherProductsGrid: React.FC<OtherProductsGridProps> = ({
  products,
  onAddToCart
}) => {
  // Filter out the main faja and pack so it shows additional accessories like lumbarfix.vercel.app did
  const accessoryProducts = products.filter(
    (p) => !p.nombre.toLowerCase().includes("pack") && p.id !== "faja-lumbar"
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(price);
  };

  if (accessoryProducts.length === 0) return null;

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            Complementos Ortopédicos
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Completá tu Recuperación Articular
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Productos certificados para sumar a tu pedido con envío gratis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessoryProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-slate-50/70 rounded-2xl border border-slate-200 overflow-hidden hover:border-cyan-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-square bg-white p-6 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                  <img
                    src={prod.img}
                    alt={prod.nombre}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {prod.nombre}
                    </h3>
                    {prod.badge && (
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  {prod.descripcion && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {prod.descripcion}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-200/60 mt-4">
                <div>
                  <span className="text-lg font-black text-slate-900 font-['Space_Grotesk']">
                    {formatPrice(prod.precio)}
                  </span>
                  {prod.precioAnterior && (
                    <span className="block text-xs text-slate-400 line-through">
                      {formatPrice(prod.precioAnterior)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onAddToCart(prod)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
