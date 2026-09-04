import React from "react";
import { CheckCircle, Truck, Package, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Order } from "../types";

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose
}) => {
  if (!order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(price);
  };

  const whatsappText = `Hola Lumbar Fix! Acabo de registrar mi pedido #${order.trackingCode} a nombre de ${order.cliente.nombre} ${order.cliente.apellido}. Quería confirmar los detalles del despacho. ¡Muchas gracias!`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8 space-y-5">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
            ¡Pedido Registrado con Éxito!
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
            Gracias por tu compra, {order.cliente.nombre}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Tu faja descompresora está reservada y en proceso de empaquetado para despacho prioritario.
          </p>
        </div>

        {/* Tracking Code Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Código de Seguimiento:</span>
            <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {order.trackingCode}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Método de Pago:</span>
            <span className="font-bold text-slate-800 capitalize">
              {order.metodoPago === "contraentrega"
                ? "Pago en efectivo al recibir"
                : order.metodoPago === "transferencia"
                ? "Transferencia bancaria (-10%)"
                : order.metodoPago === "mercadopago"
                ? "Mercado Pago"
                : "Pedido por WhatsApp"}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Dirección de Entrega:</span>
            <span className="font-medium text-slate-800 text-right truncate max-w-50">
              {order.cliente.calle} {order.cliente.altura}, {order.cliente.ciudad}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
            <span>Total:</span>
            <span className="text-cyan-700">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Delivery estimation timeline */}
        <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-950 flex items-center gap-3 text-left">
          <Truck className="w-5 h-5 text-cyan-600 shrink-0" />
          <div>
            <span className="font-bold block">Despacho en 24 horas</span>
            <span className="text-[11px] text-cyan-800">Recibirás un SMS o mensaje de WhatsApp cuando el correo retire tu paquete.</span>
          </div>
        </div>

        {/* WhatsApp follow-up action */}
        <div className="space-y-2.5 pt-2">
          <a
            href={`https://wa.me/5493515056742?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Notificar mi pedido por WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-wide transition-all"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
};
