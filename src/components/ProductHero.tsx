import React, { useState, useEffect } from "react";
import {
  Star,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowRight,
  Maximize2,
  Sparkles,
  Layers,
  HeartHandshake
} from "lucide-react";
import { Product, BundleOption, SiteContent } from "../types";

interface ProductHeroProps {
  product: Product;
  bundles: BundleOption[];
  siteContent: SiteContent;
  onDirectBuy: (bundle: BundleOption) => void;
  onAddToCart: (bundle: BundleOption) => void;
}

export const ProductHero: React.FC<ProductHeroProps> = ({
  product,
  bundles,
  siteContent,
  onDirectBuy,
  onAddToCart
}) => {
  // Gallery states
  const galleryImages = product.galeria && product.galeria.length > 0 ? product.galeria : [product.img];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedBundleId, setSelectedBundleId] = useState<string>(bundles[1]?.id || bundles[0]?.id || "bundle-1");
  const [openAccordion, setOpenAccordion] = useState<string | null>("descripcion");

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 44, seconds: 53 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedBundle = bundles.find((b) => b.id === selectedBundleId) || bundles[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(price);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <section id="producto" className="py-6 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ========================================================= */}
          {/* LEFT: MEDIA GALLERY (Shopify Shrine / Lymphori style) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 sticky top-28 space-y-4">
            {/* Main Image Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-sm aspect-square flex items-center justify-center group">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                <span className="bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" /> OFERTA LIMITADA
                </span>
                <span className="bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> ENVÍO GRATIS
                </span>
              </div>

              {/* Main Image */}
              <img
                src={galleryImages[activeImageIndex] || product.img}
                alt={product.nombre}
                className="w-full h-full object-contain p-4 transition-all duration-300 group-hover:scale-105"
              />

              {/* Lightbox / Zoom hint */}
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1.5 opacity-90">
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Toque para ver</span>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50 ${
                      activeImageIndex === idx
                        ? "border-cyan-600 ring-2 ring-cyan-600/30 scale-102"
                        : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Vista ${idx + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Micro Benefits Banner Under Gallery */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-base">👌</span>
                <span className="text-[11px] font-bold text-slate-800 block">Talle Universal</span>
                <span className="text-[10px] text-slate-500">Con extensor gratis</span>
              </div>
              <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-base">💨</span>
                <span className="text-[11px] font-bold text-slate-800 block">Bomba Manual</span>
                <span className="text-[10px] text-slate-500">Tracción regulable</span>
              </div>
              <div className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-base">🛡️</span>
                <span className="text-[11px] font-bold text-slate-800 block">Garantía 30 Días</span>
                <span className="text-[10px] text-slate-500">Satisfacción total</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: BUY BOX & PRODUCT INFO (Lymphori / Shopify Shrine) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-5">
            {/* Reviews Rating Pill */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Excelente 4.9 de 5 · <span className="underline decoration-slate-300 font-bold">{siteContent.ratingCount} opiniones verificadas</span>
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight font-['Space_Grotesk']">
                {siteContent.heroHeadline}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {siteContent.heroSubheadline}
              </p>
            </div>

            {/* Bullet Points Transformation (Direct from Lymphori Dental style) */}
            <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
              {siteContent.bulletsPromesa.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {/* SCARCITY & STOCK URGENCY BOX (Signature Lymphori / Shrine PRO feature) */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-black text-rose-950">
                    Quedan {siteContent.stockRestante} unidades de esta tanda
                  </span>
                </div>

                {/* Countdown pill */}
                <div className="text-[11px] font-bold text-rose-800 bg-white/90 px-2.5 py-1 rounded-md border border-rose-200/80 shrink-0">
                  Termina en {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-rose-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-linear-to-r from-rose-500 to-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(15, (siteContent.stockRestante / siteContent.stockTotal) * 100)}%` }}
                ></div>
              </div>

              <p className="text-[11px] text-rose-800/90 leading-tight">
                Cuando se agota esta tanda, <strong>el extensor gratis y el descuento del 40% dejan de estar</strong> y volvés a la lista de espera normal.
              </p>
            </div>

            {/* ========================================================= */}
            {/* QUANTITY BREAKS / BUNDLE SELECTION CARDS (Shopify Shrine) */}
            {/* ========================================================= */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Seleccioná tu opción preferida:
              </label>

              {bundles.map((bundle) => {
                const isSelected = selectedBundleId === bundle.id;
                return (
                  <div
                    key={bundle.id}
                    onClick={() => setSelectedBundleId(bundle.id)}
                    className={`relative p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-cyan-600 bg-cyan-50/40 shadow-md ring-2 ring-cyan-600/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Badge top right */}
                    {bundle.badge && (
                      <span
                        className={`absolute -top-2.5 right-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs ${
                          bundle.popular
                            ? "bg-cyan-600 text-white"
                            : bundle.id === "bundle-pack"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-800 text-white"
                        }`}
                      >
                        {bundle.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Radio + Title */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? "border-cyan-600 bg-cyan-600" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-slate-900">
                              {bundle.nombre}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {bundle.itemsTexto}
                          </p>
                          {bundle.descuentoTexto && (
                            <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {bundle.descuentoTexto}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Pricing */}
                      <div className="text-right shrink-0">
                        <div className="text-base sm:text-lg font-black text-slate-900">
                          {formatPrice(bundle.precio)}
                        </div>
                        {bundle.precioAnterior && (
                          <div className="text-xs text-slate-400 line-through">
                            {formatPrice(bundle.precioAnterior)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ========================================================= */}
            {/* PRIMARY CALL TO ACTION BUTTONS */}
            {/* ========================================================= */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onDirectBuy(selectedBundle)}
                className="w-full py-4 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-slate-950 font-black text-base sm:text-lg tracking-wide shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer animate-pulse-glow"
              >
                <span>COMPRAR AHORA — {formatPrice(selectedBundle.precio)}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onAddToCart(selectedBundle)}
                className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>AGREGAR AL CARRITO</span>
              </button>
            </div>

            {/* Trust check marks and Payment badges */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Envío Gratis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Garantía 30 días</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Pago 100% Seguro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Pago Contra Entrega</span>
                </div>
              </div>

              {/* Payment Methods Pill */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Medios de pago aceptados:</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-sky-600">Mercado Pago</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Efectivo en Entrega</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-emerald-600">Transferencia (-10%)</span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* COLLAPSIBLE ACCORDIONS (Shopify Collapsible Content) */}
            {/* ========================================================= */}
            <div className="divide-y divide-slate-200 border-y border-slate-200 pt-1">
              {/* Accordion 1: Description */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion("descripcion")}
                  className="w-full flex items-center justify-between text-left text-sm font-bold text-slate-900 hover:text-cyan-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-600" />
                    ¿Cómo funciona la descompresión lumbar?
                  </span>
                  {openAccordion === "descripcion" ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {openAccordion === "descripcion" && (
                  <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
                    <p>
                      La faja <strong>Lumbar Fix®</strong> utiliza tecnología de tracción neumática vertical. Al inflarse con la bomba manual, las cámaras internas se expanden verticalmente, transfiriendo el peso de la parte superior del cuerpo hacia la pelvis.
                    </p>
                    <p>
                      Este estiramiento controlado abre el espacio entre las vértebras lumbares (L1 a L5), creando una presión negativa que alivia la compresión sobre los discos herniados y libera los nervios pinzados, permitiendo el retorno de nutrientes y agua a los tejidos.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Modo de uso */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion("uso")}
                  className="w-full flex items-center justify-between text-left text-sm font-bold text-slate-900 hover:text-cyan-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    Modo de uso recomendado
                  </span>
                  {openAccordion === "uso" ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {openAccordion === "uso" && (
                  <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
                    <ol className="list-decimal pl-5 space-y-1.5">
                      <li><strong>Colocá</strong> la faja desinflada a la altura de la cintura (entre la última costilla y la pelvis).</li>
                      <li><strong>Ajustá</strong> el velcro de manera firme pero cómoda (usá el extensor si tu cintura supera los 95cm).</li>
                      <li><strong>Conectá</strong> la boquilla de la bomba manual e inflá suavemente hasta sentir una tracción placentera y descompresora.</li>
                      <li><strong>Utilizala</strong> durante 20 a 40 minutos mientras trabajás, manejás o descansás, 2 o 3 veces al día.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Accordion 3: Qué incluye la caja */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion("caja")}
                  className="w-full flex items-center justify-between text-left text-sm font-bold text-slate-900 hover:text-cyan-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-600" />
                    ¿Qué incluye el paquete?
                  </span>
                  {openAccordion === "caja" ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {openAccordion === "caja" && (
                  <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>1x Faja Descompresora Lumbar Fix® con cámaras de tracción vertical.</li>
                      <li>1x Bomba de inflado manual con válvula de liberación rápida.</li>
                      <li>1x Cinturón extensor de velcro de REGALO (amplía hasta 125cm).</li>
                      <li>1x Manual ilustrado de uso y recomendaciones en español.</li>
                      <li><em>(Si elegís el Pack Completo: incluye además Rodillera + Tobillera + Foam Roller).</em></li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 4: Garantía y Envíos */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion("envios")}
                  className="w-full flex items-center justify-between text-left text-sm font-bold text-slate-900 hover:text-cyan-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                    Garantía y Plazos de Entrega
                  </span>
                  {openAccordion === "envios" ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {openAccordion === "envios" && (
                  <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
                    <p>
                      Despachamos todas las órdenes dentro de las 24 horas hábiles posteriores a la confirmación. El tiempo habitual de entrega por correo certificado es de <strong>24 a 72 horas</strong> a todo el país.
                    </p>
                    <p>
                      Tenés <strong>30 días de prueba sin riesgo</strong>. Si no experimentás alivio en tu espalda o no estás 100% satisfecho, podés devolverla y te reintegramos el total de tu dinero.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
