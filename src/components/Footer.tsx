import React from "react";
import { ShieldCheck, Truck, Lock, Heart, Settings } from "lucide-react";
import { SiteContent } from "../types";

interface FooterProps {
  siteContent: SiteContent;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ siteContent, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 pt-16 pb-24 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-xl font-black tracking-tight font-['Space_Grotesk'] text-white">
                LUMBAR<span className="text-cyan-400">FIX</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tecnología de descompresión lumbar para el alivio de pinzamientos, lumbalgia y ciática en la comodidad de tu hogar.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteContent.contacto.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-xs text-slate-300 hover:text-white transition-colors"
                title="Instagram"
              >
                📸
              </a>
              <a
                href={siteContent.contacto.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-xs text-slate-300 hover:text-white transition-colors"
                title="Facebook"
              >
                📘
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Navegación
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#producto" className="hover:text-cyan-400 transition-colors">Faja Lumbar Descompresora</a></li>
              <li><a href="#pack-recomendado" className="hover:text-cyan-400 transition-colors">Pack Completo 4 en 1</a></li>
              <li><a href="#problema" className="hover:text-cyan-400 transition-colors">¿Por qué duele la espalda?</a></li>
              <li><a href="#testimonios" className="hover:text-cyan-400 transition-colors">Opiniones verificadas</a></li>
              <li><a href="#faq" className="hover:text-cyan-400 transition-colors">Preguntas frecuentes</a></li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Atención y Garantías
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>30 días de prueba sin riesgo</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Envío express a todo el país</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pago contra entrega o Mercado Pago</span>
              </li>
              <li>
                <span className="text-slate-500">Soporte: </span>
                <span className="text-slate-300">{siteContent.contacto.emailSoporte}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Admin */}
          <div className="space-y-3 text-xs bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>Administración de Tienda</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Podés modificar imágenes, precios, stock, textos y revisar los pedidos entrantes del backend.
            </p>
            <button
              onClick={onOpenAdmin}
              className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Panel de Control</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Lumbar Fix®. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Términos de Servicio</span>
            <span className="hover:text-slate-400 cursor-pointer">Políticas de Privacidad</span>
            <span className="hover:text-slate-400 cursor-pointer">Defensa del Consumidor</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
