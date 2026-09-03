import React, { useState } from "react";
import { X, Check, ShieldCheck, Truck, Lock, CreditCard, Banknote, Building, MessageCircle, Copy, CheckCheck, ExternalLink } from "lucide-react";
import { CartItem, CustomerData, Order, SiteContent } from "../types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  siteContent?: SiteContent | null;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  siteContent,
  onOrderPlaced
}) => {
  const [formData, setFormData] = useState<CustomerData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    provincia: "",
    ciudad: "",
    calle: "",
    altura: "",
    piso: "",
    departamento: "",
    cp: "",
    entreCalles: "",
    referencia: ""
  });

  const [metodoPago, setMetodoPago] = useState<"contraentrega" | "mercadopago" | "transferencia" | "whatsapp">("contraentrega");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const datosBancarios = siteContent?.datosBancarios || {
    banco: "Mercado Pago / Banco Galicia",
    titular: "LUMBAR FIX OFICIAL",
    cuit: "20-38492819-4",
    cbu: "0000003100012345678901",
    alias: "LUMBARFIX.PAGOS",
    instrucciones: "Transferí el monto exacto con el 10% de descuento y enviá el comprobante con tu número de pedido por WhatsApp."
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const descuento = metodoPago === "transferencia" ? Math.round(subtotal * 0.10) : 0;
  const envio = 0;
  const total = Math.max(0, subtotal - descuento + envio);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      setErrorMsg("Por favor completá al menos tu Nombre y Teléfono.");
      return;
    }

    if (metodoPago !== "whatsapp" && (!formData.calle.trim() || !formData.provincia.trim() || !formData.ciudad.trim())) {
      setErrorMsg("Por favor completá la Provincia, Ciudad y Calle de entrega.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          cliente: formData,
          metodoPago
        })
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        console.error("Order response parse error:", rawText);
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Error al procesar el pedido. Intentá nuevamente.");
      }

      // If user chose WhatsApp, we also open WhatsApp with order summary
      if (metodoPago === "whatsapp") {
        const text = `Hola Lumbar Fix! Acabo de registrar mi pedido #${data.order.trackingCode}.\n` +
          `Cliente: ${formData.nombre} ${formData.apellido}\n` +
          `Tel: ${formData.telefono}\n` +
          `Entrega en: ${formData.calle} ${formData.altura}, ${formData.ciudad} (${formData.provincia})\n` +
          `Total: ${formatPrice(total)}\n` +
          `¿Me confirman los pasos para recibirlo? Gracias!`;
        window.open(`https://wa.me/5493515056742?text=${encodeURIComponent(text)}`, "_blank");
      }

      // If user chose Mercado Pago, attempt to redirect to real checkout preference
      if (metodoPago === "mercadopago") {
        try {
          const mpRes = await fetch("/api/mercadopago/create-preference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.order.id,
              items: cartItems,
              payer: {
                name: formData.nombre,
                surname: formData.apellido,
                email: formData.email || "comprador@lumbarfix.com",
                phone: { number: formData.telefono }
              }
            })
          });
          const mpData = await mpRes.json();
          if (mpData.success && mpData.initPoint) {
            onOrderPlaced(data.order);
            window.location.href = mpData.initPoint;
            return;
          }
        } catch (mpErr) {
          console.warn("Mercado Pago preference creation skipped or not configured yet:", mpErr);
        }
      }

      onOrderPlaced(data.order);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "No se pudo conectar con el servidor de pedidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
              Finalizar tu Compra
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Completá tus datos de entrega para coordinar el despacho seguro en 24hs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* Order preview snippet */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Resumen del Pedido ({cartItems.reduce((acc, i) => acc + i.cantidad, 0)} productos):
            </span>
            <div className="divide-y divide-slate-200/60 max-h-32 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="py-1.5 flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-medium truncate max-w-[70%]">
                    {item.cantidad}x {item.nombre}
                  </span>
                  <span className="font-bold text-slate-950">
                    {formatPrice(item.precio * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-xs sm:text-sm font-black text-slate-900">
              <span>Total a Pagar:</span>
              <span className="text-cyan-700 text-base">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              1. Elegí cómo preferís pagar:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Contra entrega */}
              <div
                onClick={() => setMetodoPago("contraentrega")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  metodoPago === "contraentrega"
                    ? "border-cyan-600 bg-cyan-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Pago Contra Entrega</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pagas en efectivo al cartero cuando recibís el paquete en tu puerta.
                  </p>
                </div>
              </div>

              {/* Option 2: Mercado Pago */}
              <div
                onClick={() => setMetodoPago("mercadopago")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  metodoPago === "mercadopago"
                    ? "border-cyan-600 bg-cyan-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <CreditCard className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Mercado Pago / Tarjetas</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Débito, crédito o dinero en cuenta con acreditación instantánea.
                  </p>
                </div>
              </div>

              {/* Option 3: Transferencia Bancaria */}
              <div
                onClick={() => setMetodoPago("transferencia")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  metodoPago === "transferencia"
                    ? "border-cyan-600 bg-cyan-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Building className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Transferencia Bancaria</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                      10% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Obtené 10% de descuento abonando por CBU o Alias bancario.
                  </p>
                </div>
              </div>

              {/* Option 4: WhatsApp */}
              <div
                onClick={() => setMetodoPago("whatsapp")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  metodoPago === "whatsapp"
                    ? "border-cyan-600 bg-cyan-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Pedir por WhatsApp</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Coordinás directamente con un asesor de ventas por chat.
                  </p>
                </div>
              </div>
            </div>

            {/* Contextual Payment Details for Bank Transfer */}
            {metodoPago === "transferencia" && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-700" />
                    <span className="font-bold text-xs uppercase tracking-wide text-purple-900">
                      Datos para tu Transferencia (-10% OFF Aplicado)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                    Abonás {formatPrice(total)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                    <span className="text-[10px] uppercase font-bold text-purple-600 block">Banco o Billetera</span>
                    <span className="font-bold text-slate-900">{datosBancarios.banco}</span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100">
                    <span className="text-[10px] uppercase font-bold text-purple-600 block">Titular de la Cuenta</span>
                    <span className="font-bold text-slate-900">{datosBancarios.titular}</span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-600 block">Alias</span>
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{datosBancarios.alias}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(datosBancarios.alias, "alias")}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedField === "alias" ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === "alias" ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-600 block">CBU / CVU</span>
                      <span className="font-mono font-bold text-slate-900 text-[11px] sm:text-xs truncate max-w-[140px] sm:max-w-[180px] block">
                        {datosBancarios.cbu}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(datosBancarios.cbu, "cbu")}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedField === "cbu" ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === "cbu" ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>
                </div>

                {datosBancarios.cuit && (
                  <div className="text-[11px] text-purple-800 font-medium">
                    <b>CUIT/CUIL:</b> {datosBancarios.cuit}
                  </div>
                )}

                {datosBancarios.instrucciones && (
                  <p className="text-[11px] text-purple-900/90 italic bg-purple-100/60 p-2 rounded-lg">
                    📌 {datosBancarios.instrucciones}
                  </p>
                )}
              </div>
            )}

            {/* Contextual Payment Details for Mercado Pago */}
            {metodoPago === "mercadopago" && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2 animate-fadeIn text-xs">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-600" />
                  <span className="font-bold uppercase tracking-wide text-sky-900 text-xs">
                    Pago Online Seguro con Mercado Pago
                  </span>
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  Podrás pagar con tarjetas de crédito (en cuotas), tarjeta de débito o con tu dinero disponible en cuenta de Mercado Pago. Al confirmar tu pedido, te redirigiremos a la pasarela oficial protegida de Mercado Pago.
                </p>
              </div>
            )}
          </div>

          {/* Customer Address Form */}
          <form id="checkoutForm" onSubmit={handleSubmit} className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              2. Datos del Destinatario y Domicilio:
            </label>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">Nombre *</label>
                <input
                  id="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Apellido *</label>
                <input
                  id="apellido"
                  required
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="Ej: Pérez"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Teléfono Celular *</label>
                <input
                  id="telefono"
                  required
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 11 3456 7890"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Email (para el seguimiento)</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juanperez@email.com"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Provincia *</label>
                <input
                  id="provincia"
                  required
                  value={formData.provincia}
                  onChange={handleChange}
                  placeholder="Ej: Córdoba / Buenos Aires"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600">Ciudad / Localidad *</label>
                <input
                  id="ciudad"
                  required
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Ej: Ciudad Autónoma / Villa Carlos Paz"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600">Calle *</label>
                  <input
                    id="calle"
                    required
                    value={formData.calle}
                    onChange={handleChange}
                    placeholder="Ej: Av. San Martín"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Altura / N° *</label>
                  <input
                    id="altura"
                    required
                    value={formData.altura}
                    onChange={handleChange}
                    placeholder="1234"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Piso (opcional)</label>
                  <input
                    id="piso"
                    value={formData.piso}
                    onChange={handleChange}
                    placeholder="3"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Depto (opcional)</label>
                  <input
                    id="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    placeholder="B"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Código Postal</label>
                  <input
                    id="cp"
                    value={formData.cp}
                    onChange={handleChange}
                    placeholder="5000"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-600">Entre Calles o Referencias para el repartidor</label>
                <input
                  id="entreCalles"
                  value={formData.entreCalles}
                  onChange={handleChange}
                  placeholder="Ej: Entre Belgrano y Mitre. Portón blanco."
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tus datos están protegidos y sólo se usan para el envío.</span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="checkoutForm"
              disabled={loading}
              className="flex-1 sm:flex-initial px-7 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-slate-950 font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Procesando...</span>
              ) : (
                <span>CONFIRMAR PEDIDO — {formatPrice(total)}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
