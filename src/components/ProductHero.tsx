import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
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
  HeartHandshake,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { Product, BundleOption, SiteContent } from "../types";

interface ProductHeroProps {
  product: Product;
  bundles: BundleOption[];
  siteContent: SiteContent;
  onDirectBuy: (bundle: BundleOption) => void;
  onAddToCart: (bundle: BundleOption) => void;
}

interface CarouselItem {
  id: string;
  type: "reel" | "image";
  url: string;
  title: string;
  poster?: string;
}

export const ProductHero: React.FC<ProductHeroProps> = ({
  product,
  bundles,
  siteContent,
  onDirectBuy,
  onAddToCart
}) => {
  // Build items array with Reel first if available
  const carouselItems = useMemo<CarouselItem[]>(() => {
    const items: CarouselItem[] = [];

    // 1. Reel video item (Appears FIRST if present and active)
    let effectiveReelUrl = "";
    if (typeof product?.reelUrl === "string") {
      effectiveReelUrl = product.reelUrl.trim();
    } else if (product?.reelUrl && typeof (product.reelUrl as any).url === "string") {
      effectiveReelUrl = (product.reelUrl as any).url.trim();
    }

    const isReelEnabled = product?.reelActivo !== false && effectiveReelUrl.length > 0;
    if (isReelEnabled) {
      items.push({
        id: "reel-main-video-item",
        type: "reel",
        url: effectiveReelUrl,
        title: (typeof product?.reelTitulo === "string" && product.reelTitulo.trim())
          ? product.reelTitulo.trim()
          : "Reel Demostrativo: Descompresión Lumbar Fix",
        poster: (typeof product?.img === "string" && product.img.trim())
          ? product.img.trim()
          : "/images/fajalumbar.jpg"
      });
    }

    // 2. Images gallery - thoroughly normalize any format
    const rawList: any[] = Array.isArray(product?.galeria) && product.galeria.length > 0
      ? product.galeria
      : [product?.img || "/images/fajalumbar.jpg"];

    const cleanImages: string[] = [];
    rawList.forEach((item) => {
      let url = "";
      if (typeof item === "string") {
        url = item.trim();
      } else if (item && typeof item === "object") {
        url = (item.url || item.src || item.img || "").toString().trim();
      }
      if (url && !cleanImages.includes(url)) {
        cleanImages.push(url);
      }
    });

    if (cleanImages.length === 0) {
      cleanImages.push(
        typeof product?.img === "string" && product.img.trim()
          ? product.img.trim()
          : "/images/fajalumbar.jpg"
      );
    }

    cleanImages.forEach((imgUrl, idx) => {
      items.push({
        id: `img-item-${idx}`,
        type: "image",
        url: imgUrl,
        title: `Vista ${idx + 1} de ${product?.nombre || "Lumbar Fix"}`
      });
    });

    return items;
  }, [
    product?.galeria,
    product?.reelUrl,
    product?.reelActivo,
    product?.reelTitulo,
    product?.img,
    product?.nombre
  ]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Safe clamped index to completely prevent out-of-bounds errors
  const safeActiveIndex = activeIndex >= 0 && activeIndex < carouselItems.length ? activeIndex : 0;
  const currentItem = carouselItems[safeActiveIndex] || carouselItems[0] || {
    id: "fallback-item",
    type: "image" as const,
    url: "/images/fajalumbar.jpg",
    title: product?.nombre || "Lumbar Fix"
  };

  useEffect(() => {
    setVideoError(false);
    if (currentItem.type === "reel") {
      setVideoSrc(currentItem.url);
    }
  }, [carouselItems, safeActiveIndex, currentItem.url, currentItem.type]);

  const handleMediaImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const currentSrc = target.src || "";
    if (currentSrc.includes("/uploads/") && !currentSrc.includes("lumbarfix.onrender.com")) {
      const parts = currentSrc.split("/uploads/");
      if (parts[1]) {
        target.src = `https://lumbarfix.onrender.com/uploads/${parts[1]}`;
        return;
      }
    }
    target.src = "/images/fajalumbar.jpg";
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (carouselItems.length <= 1) return;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : carouselItems.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (carouselItems.length <= 1) return;
    setActiveIndex((prev) => (prev < carouselItems.length - 1 ? prev + 1 : 0));
  };

  const scrollThumbnails = (direction: "left" | "right") => {
    try {
      if (thumbnailContainerRef.current) {
        const scrollAmount = direction === "left" ? -200 : 200;
        thumbnailContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } catch {}
  };

  // Safe thumbnail container scroll without DOM node querying
  useEffect(() => {
    try {
      if (thumbnailContainerRef.current) {
        const targetScroll = Math.max(0, safeActiveIndex * 82 - 120);
        thumbnailContainerRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
      }
    } catch {}
  }, [safeActiveIndex]);

  // Try auto-play video safely if active item is reel, and pause when switching away
  useEffect(() => {
    try {
      if (currentItem.type === "reel" && videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          });
        }
      } else if (currentItem.type !== "reel" && videoRef.current) {
        videoRef.current.pause();
      }
    } catch {}
  }, [safeActiveIndex, currentItem.type]);

  // Clean up video on unmount
  useEffect(() => {
    return () => {
      try {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      } catch {}
    };
  }, []);

  // Touch swipe support for mobile/tablet gallery
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches.length > 0) {
      setTouchStartX(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    if (e.changedTouches.length > 0) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (diff > 45) {
        handleNext();
      } else if (diff < -45) {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (!videoRef.current) return;
    try {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } catch {}
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (!videoRef.current) return;
    try {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } catch {}
  };

  // Fullscreen Lightbox handlers
  const openLightbox = (idx?: number) => {
    setLightboxIndex(typeof idx === "number" ? idx : safeActiveIndex);
    setIsLightboxOpen(true);
  };

  const handleLightboxPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (carouselItems.length <= 1) return;
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : carouselItems.length - 1));
  };

  const handleLightboxNext = (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (carouselItems.length <= 1) return;
    setLightboxIndex((prev) => (prev < carouselItems.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev < carouselItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : carouselItems.length - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, carouselItems.length]);

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

  const safeLightboxIndex = lightboxIndex >= 0 && lightboxIndex < carouselItems.length ? lightboxIndex : 0;
  const currentLightboxItem = carouselItems[safeLightboxIndex] || currentItem;

  return (
    <section id="producto" className="py-6 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ========================================================= */}
          {/* LEFT: MEDIA GALLERY (Shopify Shrine / Lymphori style) */}
          {/* FIXED MOBILE OVERLAP: lg:sticky so it only sticks on desktop, never on mobile/tablet */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 relative space-y-4">
            {/* Main Media Frame */}
            <div 
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-sm aspect-square flex items-center justify-center group select-none"
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
                {currentItem?.type === "reel" ? (
                  <span key="badge-reel" className="bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white inline-block"></span> REEL EN VIVO
                  </span>
                ) : (
                  <span key="badge-offer" className="bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" /> OFERTA LIMITADA
                  </span>
                )}
                <span className="bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> ENVÍO GRATIS
                </span>
              </div>

              {/* Item Counter Badge */}
              <div className="absolute top-4 right-4 z-20 pointer-events-none">
                <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-xs flex items-center gap-1">
                  <span>{`${safeActiveIndex + 1} / ${carouselItems.length}`}</span>
                </span>
              </div>

              {/* Main Media Item Content Container */}
              <div className="w-full h-full flex items-center justify-center">
                {currentItem?.type === "reel" ? (
                  <div key="main-media-reel-frame" className="relative w-full h-full bg-black flex items-center justify-center">
                    {currentItem.url.includes("youtube.com") || currentItem.url.includes("youtu.be") ? (
                      <iframe
                        src={currentItem.url.replace("watch?v=", "embed/") + "?autoplay=1&mute=1&loop=1"}
                        title="Reel Demostrativo"
                        className="w-full h-full object-cover"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <video
                          ref={videoRef}
                          src={videoSrc || currentItem.url}
                          poster={currentItem.poster}
                          autoPlay
                          muted={isMuted}
                          loop
                          playsInline
                          preload="auto"
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onError={() => {
                            if (videoSrc && videoSrc.startsWith("/uploads/") && !videoSrc.startsWith("http")) {
                              setVideoSrc(`https://lumbarfix.onrender.com${videoSrc}`);
                              setVideoError(false);
                            } else {
                              setVideoError(true);
                            }
                          }}
                          onClick={togglePlayPause}
                          className="w-full h-full object-contain cursor-pointer"
                        />
                        {videoError && (
                          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center text-white z-10">
                            <Video className="w-10 h-10 text-purple-400 mb-2 opacity-80" />
                            <p className="text-xs font-bold mb-1">Video Demostrativo Lumbar Fix</p>
                            <p className="text-[11px] text-slate-300 max-w-xs mb-3">
                              Este archivo de video no puede reproducirse directamente en el navegador. Podés actualizar el video o usar el Reel oficial en MP4 desde el panel administrador.
                            </p>
                            <button
                              type="button"
                              onClick={handleNext}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                            >
                              Ver Fotos del Producto →
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
                      <button
                        type="button"
                        onClick={togglePlayPause}
                        className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                        <span className="text-[11px]">{isPlaying ? "Pausar" : "Reproducir"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        {isMuted ? (
                          <>
                            <VolumeX className="w-4 h-4 text-rose-400" />
                            <span className="text-[11px]">Activar Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-[11px]">Silenciar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key="main-media-image-frame"
                    onClick={() => openLightbox(safeActiveIndex)}
                    className="relative w-full h-full bg-slate-50 flex items-center justify-center cursor-zoom-in group"
                    title="Hacé clic para ampliar y ver todas las fotos una por una"
                  >
                    <img
                      key={`gallery-img-${safeActiveIndex}`}
                      src={currentItem?.url || product?.img || "/images/fajalumbar.jpg"}
                      alt={currentItem?.title || product?.nombre || "Foto del producto"}
                      className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                      onError={handleMediaImageError}
                    />

                    {/* Lightbox / Zoom hint */}
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1.5 opacity-90 transition-transform group-hover:scale-105 pointer-events-none">
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-800">
                        {`Ampliar foto (${safeActiveIndex + 1}/${carouselItems.length})`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Previous & Next Floating Chevrons on Main Media */}
              {carouselItems.length > 1 && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between p-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Elemento anterior del carrusel"
                    className="pointer-events-auto w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border border-slate-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-900" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Siguiente elemento del carrusel"
                    className="pointer-events-auto ml-auto w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 border border-slate-200"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-900" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation with Scroll Arrows (Never cuts off) */}
            {carouselItems.length > 1 && (
              <div className="relative flex items-center group/thumbs">
                <button
                  type="button"
                  onClick={() => scrollThumbnails("left")}
                  aria-label="Desplazar galería a la izquierda"
                  className="hidden sm:flex absolute -left-3 z-10 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  ref={thumbnailContainerRef}
                  className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 w-full scroll-smooth touch-pan-x scrollbar-thin px-1"
                >
                  {carouselItems.map((item, idx) => {
                    const isActive = safeActiveIndex === idx;
                    return (
                      <button
                        key={`thumb-btn-${idx}`}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveIndex(idx);
                        }}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? "border-cyan-600 ring-2 ring-cyan-600/30 scale-102 shadow-md"
                            : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                        } ${item.type === "reel" ? "bg-slate-900" : "bg-slate-50"}`}
                        title={item.title}
                      >
                        {item.type === "reel" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center relative p-1">
                            <img
                              src={item.poster || product?.img || "/images/fajalumbar.jpg"}
                              alt="Reel poster"
                              className="w-full h-full object-cover rounded-lg opacity-60"
                              onError={handleMediaImageError}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                              <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                                <Play className="w-3 h-3 fill-white ml-0.5" />
                              </div>
                              <span className="text-[9px] font-black text-white mt-1 uppercase tracking-wider bg-rose-700/90 px-1 py-0.2 rounded">
                                REEL
                              </span>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-contain p-1"
                            onError={handleMediaImageError}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => scrollThumbnails("right")}
                  aria-label="Desplazar galería a la derecha"
                  className="hidden sm:flex absolute -right-3 z-10 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-200 items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Fullscreen Lightbox Modal (Allows viewing images one by one in high res via Portal) */}
            {isLightboxOpen && typeof document !== "undefined" && createPortal(
              <div 
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
                onClick={() => setIsLightboxOpen(false)}
              >
                {/* Lightbox Header */}
                <div 
                  className="w-full max-w-5xl flex items-center justify-between text-white z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold font-mono">
                      {`${safeLightboxIndex + 1} / ${carouselItems.length}`}
                    </span>
                    <span className="text-sm font-semibold truncate hidden sm:inline">
                      {currentLightboxItem.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <span className="hidden sm:inline">Cerrar (ESC)</span>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Lightbox Center Media */}
                <div 
                  className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {carouselItems.length > 1 && (
                    <button
                      type="button"
                      onClick={handleLightboxPrev}
                      className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-xl"
                      title="Foto anterior (←)"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}

                  <div className="w-full h-full max-h-[75vh] flex items-center justify-center">
                    {currentLightboxItem.type === "reel" ? (
                      <div key="lightbox-reel-view" className="w-full h-full flex items-center justify-center">
                        {currentLightboxItem.url.includes("youtube.com") || currentLightboxItem.url.includes("youtu.be") ? (
                          <iframe
                            src={currentLightboxItem.url.replace("watch?v=", "embed/") + "?autoplay=1"}
                            title="Reel Demostrativo"
                            className="w-full max-w-md aspect-9/16 rounded-2xl shadow-2xl"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={currentLightboxItem.url}
                            autoPlay
                            controls
                            playsInline
                            className="w-full max-w-md max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                          />
                        )}
                      </div>
                    ) : (
                      <div key="lightbox-img-view" className="w-full h-full flex items-center justify-center">
                        <img
                          key={`lightbox-img-${safeLightboxIndex}`}
                          src={currentLightboxItem.url || "/images/fajalumbar.jpg"}
                          alt={currentLightboxItem.title}
                          className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl transition-all duration-200"
                          onError={handleMediaImageError}
                        />
                      </div>
                    )}
                  </div>

                  {carouselItems.length > 1 && (
                    <button
                      type="button"
                      onClick={handleLightboxNext}
                      className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-xl"
                      title="Siguiente foto (→)"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {/* Lightbox Bottom Thumbnails Strip */}
                <div 
                  className="w-full max-w-4xl flex items-center justify-center gap-2 overflow-x-auto py-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {carouselItems.map((item, idx) => (
                    <button
                      key={`lightbox-thumb-${idx}`}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        safeLightboxIndex === idx
                          ? "border-cyan-400 ring-2 ring-cyan-400/40 scale-105"
                          : "border-white/20 opacity-50 hover:opacity-100"
                      } bg-slate-900`}
                    >
                      {item.type === "reel" ? (
                        <div className="w-full h-full flex items-center justify-center bg-rose-900/60 text-white font-bold text-[9px]">
                          REEL
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/fajalumbar.jpg";
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>,
              document.body
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
