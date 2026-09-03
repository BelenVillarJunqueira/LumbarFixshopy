import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { SiteContent } from "../types";

interface FloatingWhatsAppProps {
  siteContent: SiteContent;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ siteContent }) => {
  const [showTooltip, setShowTooltip] = useState(true);

  const phone = siteContent.contacto.whatsapp.replace(/\+/g, "");
  const message = encodeURIComponent(siteContent.contacto.mensajeWhatsApp);

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {showTooltip && (
        <div className="mb-2 bg-white text-slate-800 text-xs font-semibold px-3 py-2 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-2 max-w-[220px] animate-fade-in">
          <span>¿Dudas con tu talle o el envío? ¡Escribinos!</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <a
        href={`https://wa.me/${phone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
        title="Consultar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
      </a>
    </div>
  );
};
