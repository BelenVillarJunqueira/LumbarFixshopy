import React from "react";
import { ShoppingBag, ShieldCheck, Truck, Clock, Settings } from "lucide-react";
import { SiteContent } from "../types";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  siteContent: SiteContent;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  siteContent
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Announcement Bar - Shopify Style */}
      <div className="bg-slate-950 text-white text-xs sm:text-[13px] font-medium py-2 px-4 overflow-hidden relative border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold tracking-wide shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>OFERTA LIMITADA</span>
          </div>
          
          <div className="truncate text-center text-slate-200 font-normal">
            {siteContent.announcementBar}
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-slate-300 shrink-0">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-cyan-400" /> Despacho 24hs
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Garantía 30 días
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 group">
            <img
              src="/images/muleta.png"
              alt="Lumbar Fix Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform"
              onError={(e) => {
                // Fallback icon if needed
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-['Space_Grotesk']">
                  LUMBAR<span className="text-cyan-600">FIX</span>
                </span>
                <span className="text-[10px] font-semibold bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded border border-cyan-200 uppercase tracking-widest hidden sm:inline-block">
                  
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Navigation Quick Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#producto" className="hover:text-cyan-600 transition-colors">
            El Producto
          </a>
          <a href="#problema" className="hover:text-cyan-600 transition-colors">
            ¿Por qué duele?
          </a>
          <a href="#como-funciona" className="hover:text-cyan-600 transition-colors">
            Cómo Funciona
          </a>
          <a href="#pack-recomendado" className="hover:text-cyan-600 transition-colors flex items-center gap-1 text-cyan-600 font-semibold">
            Pack Completo <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-bold">40% OFF</span>
          </a>
          <a href="#testimonios" className="hover:text-cyan-600 transition-colors">
            Opiniones
          </a>
          <a href="#faq" className="hover:text-cyan-600 transition-colors">
            Preguntas
          </a>
        </nav>

        {/* Right Actions: Social, Admin & Cart */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Social icons */}
          <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-3">
            <a
              href={siteContent.contacto.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1"
            >
              <span>📸</span> Instagram
            </a>
            <a
              href={siteContent.contacto.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1"
            >
              <span>📘</span> Facebook
            </a>
          </div>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            title="Panel de Configuración y Administración"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-cyan-700 bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 px-3 py-1.5 rounded-lg transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">Modo Admin</span>
          </button>

          {/* Cart Icon & Counter */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white transition-all shadow-sm active:scale-95"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-slate-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
