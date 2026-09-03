import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout
}) => {
  if (!isOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-base text-slate-900 font-['Space_Grotesk']">
                Tu Carrito ({cartItems.reduce((sum, item) => sum + item.cantidad, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free shipping banner */}
          <div className="bg-cyan-50 p-3 border-b border-cyan-100 flex items-center gap-2 text-xs font-semibold text-cyan-900">
            <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>¡Tu pedido califica para <strong>ENVÍO GRATIS</strong> a todo el país!</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-16 h-16 stroke-1 mb-3 text-slate-300" />
                <p className="text-base font-bold text-slate-700">Tu carrito está vacío</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Seleccioná tu faja o pack para comenzar a disfrutar de una espalda sin dolor.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-cyan-600 transition-colors"
                >
                  Ver ofertas
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <div className="w-18 h-18 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={item.img}
                      alt={item.nombre}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.nombre}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.detalle && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {item.detalle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-black text-slate-900 font-['Space_Grotesk']">
                          {formatPrice(item.precio * item.cantidad)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout button */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Envío:</span>
                  <span>¡GRATIS!</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span>Total estimado:</span>
                  <span className="font-['Space_Grotesk'] text-cyan-700">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClearCart}
                  className="px-3 py-3 rounded-xl border border-slate-200 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
                >
                  Vaciar
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCheckout();
                  }}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-slate-950 font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>FINALIZAR COMPRA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                🔒 Compra 100% protegida y cifrada con garantía de satisfacción
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
