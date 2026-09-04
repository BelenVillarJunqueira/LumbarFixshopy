import React, { useState } from "react";
import { ShoppingBag, ShieldCheck, Truck, Menu, X, ChevronRight, MessageCircle, Lock } from "lucide-react";
import { SiteContent } from "../types";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin?: () => void;
  siteContent: SiteContent;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  siteContent
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-slate-950 text-white text-xs font-medium py-2 px-3 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center sm:text-left">
          <div className="hidden sm:flex items-center gap-2 text-cyan-400 font-semibold tracking-wide shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[11px] uppercase tracking-wider">OFERTA LIMITADA</span>
          </div>

          <div className="flex-1 text-center truncate text-[11px] sm:text-xs text-slate-200 px-2 font-medium">
            {siteContent.announcementBar}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-300 shrink-0">
            <span className="hidden md:flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-cyan-400" /> Despacho 24hs
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Garantía 30 días
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header with generous spacing and zero overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2.5 group">
            <img
              src="/images/muleta.png"
              alt="Lumbar Fix Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-['Space_Grotesk']">
                  LUMBAR<span className="text-cyan-600">FIX</span>
                </span>
                <span className="text-[10px] font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-200 uppercase tracking-widest hidden sm:inline-block">
                  Oficial
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Center: Desktop Navigation Links (Proper spacing, responsive) */}
        <nav className="hidden xl:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-600">
          <a href="#producto" className="hover:text-cyan-600 transition-colors py-2">
            El Producto
          </a>
          <a href="#problema" className="hover:text-cyan-600 transition-colors py-2">
            ¿Por qué duele?
          </a>
          <a href="#como-funciona" className="hover:text-cyan-600 transition-colors py-2">
            Cómo Funciona
          </a>
          <a
            href="#pack-recomendado"
            className="hover:text-cyan-600 transition-colors flex items-center gap-1.5 text-cyan-700 font-extrabold bg-cyan-50/80 px-2.5 py-1 rounded-lg border border-cyan-200"
          >
            <span>Pack 4 en 1</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded font-black">
              40% OFF
            </span>
          </a>
          <a href="#testimonios" className="hover:text-cyan-600 transition-colors py-2">
            Opiniones
          </a>
          <a href="#faq" className="hover:text-cyan-600 transition-colors py-2">
            Preguntas
          </a>
        </nav>

        {/* Right: Social & Cart Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* WhatsApp Direct Help link */}
          <a
            href={`https://wa.me/${siteContent.contacto.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
              siteContent.contacto.mensajeWhatsApp
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition-all"
            title="Asistencia por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Consultas</span>
          </a>

          {/* Cart Icon & Counter */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-cyan-400 text-slate-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            aria-label="Menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Never overlaps, smoothly expands) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-5 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <a
              href="#producto"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 border-b border-slate-100 hover:text-cyan-600"
            >
              <span>El Producto</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#problema"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 border-b border-slate-100 hover:text-cyan-600"
            >
              <span>¿Por qué duele la columna?</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 border-b border-slate-100 hover:text-cyan-600"
            >
              <span>Cómo Funciona la Descompresión</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#pack-recomendado"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 border-b border-slate-100 text-cyan-700 font-bold"
            >
              <span>🔥 Pack Completo Lumbar Fix (40% OFF)</span>
              <ChevronRight className="w-4 h-4 text-cyan-600" />
            </a>
            <a
              href="#testimonios"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 border-b border-slate-100 hover:text-cyan-600"
            >
              <span>Opiniones de Clientes</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 hover:text-cyan-600"
            >
              <span>Preguntas Frecuentes</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
            <a
              href={siteContent.contacto.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-cyan-600 font-medium"
            >
              📸 Instagram
            </a>
            <a
              href={siteContent.contacto.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-cyan-600 font-medium"
            >
              📘 Facebook
            </a>
            <a
              href={`https://wa.me/${siteContent.contacto.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-bold flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
