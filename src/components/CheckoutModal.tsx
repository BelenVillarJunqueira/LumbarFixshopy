import React, { useState } from "react";
import {
  X,
  Check,
  ShieldCheck,
  Truck,
  Lock,
  CreditCard,
  Banknote,
  Building,
  MessageCircle,
  Copy,
  CheckCheck,
  ExternalLink,
  AlertTriangle,
  Settings,
  Key,
  RefreshCw
} from "lucide-react";
import { CartItem, CustomerData, Order, SiteContent } from "../types";
import { API_URL, apiUrl } from "../apiConfig";
import { notifyIsamerOS_LumbarFix } from "../services/isamerWebhook";
import { trackInitiateCheckout, trackAddPaymentInfo, trackLead, trackPurchase } from "../services/metaPixel";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  siteContent?: SiteContent | null;
  onOrderPlaced: (order: Order) => void;
  onClearCart?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  siteContent,
  onOrderPlaced,
  onClearCart
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
  const [isRedirectingToMp, setIsRedirectingToMp] = useState(false);
  const [mpRedirectTarget, setMpRedirectTarget] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Track InitiateCheckout on open
  React.useEffect(() => {
    if (cartItems.length > 0) {
      const initSubtotal = cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
      trackInitiateCheckout({
        items: cartItems,
        total: initSubtotal,
        currency: "ARS"
      });
    }
  }, []);

  // Helper to select payment method and trigger Meta Ads AddPaymentInfo event
  const handleSelectPaymentMethod = (method: "contraentrega" | "transferencia" | "whatsapp" | "mercadopago") => {
    setMetodoPago(method);
    const desc = method === "transferencia" ? Math.round(subtotal * 0.10) : 0;
    const tot = Math.max(0, subtotal - desc);
    trackAddPaymentInfo({
      paymentType: method,
      value: tot,
      currency: "ARS"
    });
  };

  // Mercado Pago Token Quick Setup
  const [tokenInput, setTokenInput] = useState("");
  const [showTokenInline, setShowTokenInline] = useState(false);
  const [savingToken, setSavingToken] = useState(false);
  const [tokenFeedback, setTokenFeedback] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const activeMpToken = (
    siteContent?.mercadopago?.accessToken?.trim() ||
    (typeof window !== "undefined" ? localStorage.getItem("lumbarfix_mp_token")?.trim() : "") ||
    ""
  );

  const isMpConfigured = Boolean(activeMpToken && activeMpToken.length > 10);

  const handleSaveTokenInline = async () => {
    const clean = tokenInput.trim();
    if (!clean) {
      setTokenFeedback({ success: false, text: "Ingresá un Access Token válido (APP_USR-...)" });
      return;
    }
    setSavingToken(true);
    setTokenFeedback(null);
    try {
      const testRes = await fetch(apiUrl("/api/mercadopago/test-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: clean })
      });
      const testData = await testRes.json();

      if (!testRes.ok || !testData.success) {
        setTokenFeedback({
          success: false,
          text: testData.error || "El Access Token ingresado no es válido para Mercado Pago."
        });
        setSavingToken(false);
        return;
      }

      await fetch(apiUrl("/api/mercadopago/save-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: clean })
      });

      localStorage.setItem("lumbarfix_mp_token", clean);
      if (siteContent?.mercadopago) {
        siteContent.mercadopago.accessToken = clean;
        siteContent.mercadopago.activo = true;
      }

      setTokenFeedback({
        success: true,
        text: `¡Cuenta verificada y guardada! (${testData.user?.nickname || testData.user?.id}).`
      });
      setShowTokenInline(false);
    } catch (err: any) {
      setTokenFeedback({
        success: false,
        text: "Error al guardar token: " + (err.message || "")
      });
    } finally {
      setSavingToken(false);
    }
  };

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

    // Track Meta Ads Lead event with customer submission
    trackLead({
      name: `${formData.nombre} ${formData.apellido}`.trim(),
      origin: "Checkout Formulario",
      value: total
    });

    setLoading(true);

    try {
      let createdOrder: Order | null = null;

      try {
        const res = await fetch(`${API_URL}/api/orders`, {
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
        } catch {}

        if (res.ok && data?.success && data.order) {
          createdOrder = data.order;
        }
      } catch (netErr) {
        console.warn("Server orders endpoint not reachable, saving locally:", netErr);
      }

      // Fallback: create order client-side if server is not available (e.g. static hosting on Vercel)
      if (!createdOrder) {
        const trackingCode = `LF-${Math.floor(100000 + Math.random() * 900000)}`;
        createdOrder = {
          id: `ord-${Date.now()}`,
          trackingCode,
          items: cartItems,
          subtotal,
          descuento: metodoPago === "transferencia" ? Math.round(subtotal * 0.10) : 0,
          envio: 0,
          total,
          cliente: formData,
          metodoPago,
          estado: "Pendiente",
          fecha: new Date().toISOString(),
          notasAdmin: ""
        };

        try {
          const storedOrders = JSON.parse(localStorage.getItem("lumbarfix_orders") || "[]");
          storedOrders.unshift(createdOrder);
          localStorage.setItem("lumbarfix_orders", JSON.stringify(storedOrders));
        } catch {}
      }

      // ======================================================================
      // 🚀 1. SINCRONIZACIÓN AUTOMÁTICA CON ISAMER OS (WEBHOOK OFICIAL)
      // Descuenta stock y crea tarea de envío en tiempo real en la app de Isamer
      // ======================================================================
      try {
        notifyIsamerOS_LumbarFix({
          trackingCode: createdOrder.trackingCode,
          orderId: createdOrder.id,
          customerName: `${formData.nombre} ${formData.apellido}`.trim(),
          phone: formData.telefono,
          address: `${formData.calle} ${formData.altura}`.trim(),
          city: formData.ciudad,
          provincia: formData.provincia,
          items: cartItems,
          total: total,
          totalPrice: total,
          paymentMethod: metodoPago
        });
      } catch (isamerErr) {
        console.warn("ISAMER OS notification caught:", isamerErr);
      }

      // Meta Ads Pixel Purchase Event
      try {
        trackPurchase({
          orderId: createdOrder.trackingCode || createdOrder.id,
          total: createdOrder.total,
          currency: "ARS",
          items: createdOrder.items,
          paymentMethod: createdOrder.metodoPago
        });
      } catch (pxErr) {
        console.warn("Meta Pixel purchase error:", pxErr);
      }

      // If user chose WhatsApp, we also open WhatsApp with order summary
      if (metodoPago === "whatsapp") {
        const text = `Hola Lumbar Fix! Acabo de registrar mi pedido #${createdOrder.trackingCode}.\n` +
          `Cliente: ${formData.nombre} ${formData.apellido}\n` +
          `Tel: ${formData.telefono}\n` +
          `Entrega en: ${formData.calle} ${formData.altura}, ${formData.ciudad} (${formData.provincia})\n` +
          `Total: ${formatPrice(total)}\n` +
          `¿Me confirman los pasos para recibirlo? Gracias!`;
        window.open(`https://wa.me/5493515056742?text=${encodeURIComponent(text)}`, "_blank");
      }

      // ======================================================================
      // 💳 2. REDIRECCIÓN OFICIAL A MERCADO PAGO (Checkout Pro Oficial)
      // ======================================================================
      if (metodoPago === "mercadopago") {
        if (!activeMpToken) {
          setErrorMsg("Para pagar con Mercado Pago Oficial ingresá tu Access Token (APP_USR-...). Ingresalo a continuación:");
          setShowTokenInline(true);
          setLoading(false);
          return;
        }

        let generatedMpUrl: string | null = null;
        let mpErrorMessage = "";

        // Construct solid items payload for Mercado Pago
        const preferenceItems = (cartItems && cartItems.length > 0 ? cartItems : [{
          id: "faja-lumbar",
          nombre: "Faja Lumbar Fix — Descompresión Lumbar",
          precio: total > 0 ? total : 20000,
          cantidad: 1,
          detalle: "Faja Lumbar Fix"
        }]).map((item, idx) => ({
          id: item.id || `prod-${idx + 1}`,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad || 1,
          detalle: item.detalle
        }));

        try {
          const mpRes = await fetch(apiUrl("/api/mercadopago/create-preference"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: createdOrder.trackingCode || createdOrder.id,
              items: preferenceItems,
              cliente: formData,
              total: total,
              payer: {
                name: formData.nombre,
                surname: formData.apellido,
                email: formData.email || "comprador@lumbarfix.com",
                phone: { number: formData.telefono }
              },
              customToken: activeMpToken,
              originUrl: typeof window !== "undefined" ? window.location.origin : undefined
            })
          });

          const mpData = await mpRes.json();
          if (mpRes.ok && mpData.success && (mpData.initPoint || mpData.init_point)) {
            generatedMpUrl = mpData.initPoint || mpData.init_point;
          } else {
            mpErrorMessage = mpData.error || mpData.message || "Mercado Pago no pudo autorizar el pago con este Access Token.";
          }
        } catch (mpErr: any) {
          console.warn("Mercado Pago preference creation call error:", mpErr);
          mpErrorMessage = "No se pudo conectar con el servidor de Mercado Pago: " + (mpErr.message || "");
        }

        if (!generatedMpUrl) {
          setErrorMsg(mpErrorMessage || "Error al conectar con Mercado Pago. Verificá que tu Access Token comience con APP_USR-.");
          setShowTokenInline(true);
          setLoading(false);
          return;
        }

        // Limpiar carrito solo cuando Mercado Pago ya generó la URL de pago con éxito
        try {
          localStorage.removeItem("lumbarfix_cart");
        } catch {}
        if (onClearCart) {
          onClearCart();
        }

        const finalOrder: Order = { ...createdOrder, mpInitPoint: generatedMpUrl };

        try {
          const storedOrders = JSON.parse(localStorage.getItem("lumbarfix_orders") || "[]");
          const idx = storedOrders.findIndex((o: any) => o.id === finalOrder.id);
          if (idx >= 0) storedOrders[idx] = finalOrder;
          else storedOrders.unshift(finalOrder);
          localStorage.setItem("lumbarfix_orders", JSON.stringify(storedOrders));
        } catch {}

        setCompletedOrder(finalOrder);
        setIsRedirectingToMp(true);
        setMpRedirectTarget(generatedMpUrl);

        // Redirección automática segura al Checkout Oficial de Mercado Pago
        setTimeout(() => {
          try {
            if (typeof window !== "undefined") {
              if (window.self !== window.top) {
                // En iframe (preview de AI Studio), abrir en nueva pestaña para que Mercado Pago no sea bloqueado por CSP
                window.open(generatedMpUrl!, "_blank");
              } else {
                window.location.href = generatedMpUrl!;
              }
            }
          } catch {
            window.location.href = generatedMpUrl!;
          }
        }, 1000);

        return;
      }

      // Para el resto de los métodos (contraentrega, transferencia, whatsapp), limpiar el carrito ahora
      try {
        localStorage.removeItem("lumbarfix_cart");
      } catch {}
      if (onClearCart) {
        onClearCart();
      }

      onOrderPlaced(createdOrder);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "No se pudo conectar con el servidor de pedidos.");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de redirección activa a Mercado Pago
  if (isRedirectingToMp && mpRedirectTarget && completedOrder) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8 space-y-6">
          {/* Header icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center animate-pulse">
              <CreditCard className="w-10 h-10" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-[#009ee3] items-center justify-center text-[10px] text-white font-bold">✓</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] font-black text-sky-700 bg-sky-50 px-3.5 py-1 rounded-full border border-sky-200 uppercase tracking-wider inline-block">
              MERCADO PAGO CHECKOUT PRO
            </span>
            <h2 className="mt-2 text-2xl font-black text-slate-900 font-['Space_Grotesk'] tracking-tight">
              Redirigiendo a Mercado Pago...
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              En segundos se abrirá el sitio oficial de Mercado Pago para que abones con tus <b>tarjetas guardadas</b>, dinero en cuenta o cuotas.
            </p>
          </div>

          {/* Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-500">
              <span>Pedido registrado:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                #{completedOrder.trackingCode}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-sm text-slate-900 border-t border-slate-200 pt-2">
              <span>Total a pagar:</span>
              <span className="text-sky-700 font-extrabold text-base">{formatPrice(completedOrder.total)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pago 100% Protegido con Garantía Mercado Pago</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Acepta tarjetas de crédito (con cuotas), débito, dinero en cuenta y Mercado Crédito.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-1">
            <a
              href={mpRedirectTarget}
              target={typeof window !== "undefined" && window.self !== window.top ? "_blank" : "_self"}
              rel="noopener noreferrer"
              onClick={() => {
                try {
                  localStorage.removeItem("lumbarfix_cart");
                } catch {}
                if (onClearCart) onClearCart();
              }}
              className="w-full py-4 px-6 bg-[#009ee3] hover:bg-[#0086c2] text-white font-extrabold uppercase text-sm rounded-xl tracking-wider transition-all shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Continuar a Mercado Pago Ahora ↗</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onOrderPlaced(completedOrder);
                onClose();
              }}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Ver confirmación de pedido y seguimiento
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              {/* Option 1: Contra Entrega */}
              <div
                onClick={() => handleSelectPaymentMethod("contraentrega")}
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
                onClick={() => handleSelectPaymentMethod("mercadopago")}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  metodoPago === "mercadopago"
                    ? "border-sky-500 bg-sky-50/70 shadow-xs ring-2 ring-sky-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Mercado Pago (Sitio Oficial)</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded">
                      Tarjetas Guardadas
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Redirige a Mercado Pago: pagá con tus tarjetas ya guardadas, débito, crédito en cuotas o saldo en cuenta.
                  </p>
                </div>
              </div>

              {/* Option 3: Transferencia Bancaria */}
              <div
                onClick={() => handleSelectPaymentMethod("transferencia")}
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
                onClick={() => handleSelectPaymentMethod("whatsapp")}
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
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-3 animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span className="font-bold uppercase tracking-wide text-sky-900 text-xs">
                      Checkout Oficial Mercado Pago
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                    Dinero en cuenta y tarjetas guardadas
                  </span>
                </div>

                <p className="text-[11px] text-sky-900 leading-relaxed">
                  Serás redirigido a la pasarela oficial de <b>Mercado Pago</b>. Podrás ingresar a tu cuenta para pagar con tu <b>saldo disponible</b>, tus <b>tarjetas ya guardadas en la app</b> o en cuotas.
                </p>

                {isMpConfigured ? (
                  <div className="p-2.5 rounded-xl bg-white/90 border border-sky-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Conexión con Mercado Pago activa (Token APP_USR)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTokenInline(!showTokenInline)}
                        className="text-[10px] font-semibold text-sky-700 hover:text-sky-900 underline flex items-center gap-1 cursor-pointer"
                      >
                        <Settings className="w-3 h-3" />
                        <span>{showTokenInline ? "Ocultar" : "Cambiar Token"}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Al confirmar el pedido abajo se creará la preferencia oficial y abrirá directamente la pantalla de cobro de Mercado Pago.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                    <div className="flex items-start gap-2 text-[11px] font-bold text-amber-900">
                      <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>Falta vincular tu Access Token de Mercado Pago para procesar cobros reales</span>
                    </div>
                    <p className="text-[10px] text-amber-800 leading-relaxed">
                      Si sos el dueño de la tienda y tenés tus credenciales de Mercado Pago, ingresá tu Access Token a continuación para activar los cobros al instante:
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowTokenInline(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Ingresar Access Token (APP_USR-...)</span>
                    </button>
                  </div>
                )}

                {/* Inline Token Configuration Box */}
                {(showTokenInline || (!isMpConfigured && metodoPago === "mercadopago")) && (
                  <div className="p-3.5 rounded-xl bg-white border-2 border-sky-300 space-y-2.5 shadow-sm animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-sky-600" />
                        <span>Pegá tu Access Token de Mercado Pago (Producción):</span>
                      </label>
                      {isMpConfigured && (
                        <button
                          type="button"
                          onClick={() => setShowTokenInline(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="APP_USR-xxxxxxxxxxxxxxxx-xxxxxx..."
                        className="flex-1 p-2 rounded-lg border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSaveTokenInline}
                        disabled={savingToken || !tokenInput.trim()}
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shrink-0"
                      >
                        <RefreshCw className={`w-3 h-3 ${savingToken ? "animate-spin" : ""}`} />
                        <span>{savingToken ? "Verificando..." : "Vincular"}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-tight">
                      Obtenelo en <a href="https://www.mercadopago.com/developers" target="_blank" rel="noopener noreferrer" className="text-sky-600 font-bold underline">mercadopago.com/developers</a> &gt; Tus integraciones &gt; Credenciales de producción.
                    </p>

                    {tokenFeedback && (
                      <div
                        className={`p-2 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 ${
                          tokenFeedback.success
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {tokenFeedback.success ? <CheckCheck className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                        <span>{tokenFeedback.text}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Address Form */}
          <form id="checkoutForm" onSubmit={handleSubmit} className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              2. Datos del Destinatario y Domicilio:
            </label>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{errorMsg}</p>
                </div>
                {metodoPago === "mercadopago" && (
                  <div className="pt-2 border-t border-rose-200 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTokenInline(true)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      🔑 Cambiar Access Token
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectPaymentMethod("transferencia");
                        setErrorMsg("");
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      🏦 Pagar con Transferencia (10% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectPaymentMethod("contraentrega");
                        setErrorMsg("");
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      📦 Pago Contra Entrega
                    </button>
                  </div>
                )}
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
              className={`flex-1 sm:flex-initial px-7 py-3.5 rounded-xl active:scale-98 font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                metodoPago === "mercadopago"
                  ? "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20"
                  : "bg-cyan-600 hover:bg-cyan-500 text-slate-950"
              }`}
            >
              {loading ? (
                <span>Procesando...</span>
              ) : metodoPago === "mercadopago" ? (
                <span className="flex items-center gap-1.5">
                  <span>IR A PAGAR EN MERCADO PAGO — {formatPrice(total)}</span>
                  <ExternalLink className="w-4 h-4" />
                </span>
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
