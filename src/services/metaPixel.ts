// Meta Ads & Facebook Pixel Tracking Service
// Compliant with standard Meta E-Commerce events (PageView, ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase, Lead, Contact)

declare global {
    interface Window {
        fbq?: any;
        _fbq?: any;
    }
}

export interface MetaPixelEventLog {
    id: string;
    eventName: string;
    params?: Record<string, any>;
    timestamp: string;
}

// In-memory event diagnostic log for Admin preview & debugging
const eventLogs: MetaPixelEventLog[] = [];
let activePixelId: string | null = null;
let initialized = false;

function addEventLog(eventName: string, params?: Record<string, any>) {
    const log: MetaPixelEventLog = {
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        eventName,
        params,
        timestamp: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };
    eventLogs.unshift(log);
    if (eventLogs.length > 30) {
        eventLogs.pop();
    }
    if (process.env.NODE_ENV !== "production") {
        console.log(`[Meta Pixel Event] 👉 ${eventName}:`, params || {});
    }
}

/**
 * Injects Meta Pixel script into the DOM and initializes standard tracking
 */
export function initMetaPixel(pixelId: string, testEventCode?: string): boolean {
    if (typeof window === "undefined") return false;
    const cleanId = String(pixelId || "").trim();
    if (!cleanId) return false;

    activePixelId = cleanId;

    // Initialize fbq stub if not already present
    if (!window.fbq) {
        const fbq: any = function () {
            if (fbq.callMethod) {
                fbq.callMethod.apply(fbq, arguments);
            } else {
                fbq.queue.push(arguments);
            }
        };
        window.fbq = fbq;
        window._fbq = fbq;
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = "2.0";
        fbq.queue = [];

        // Inject remote script
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        const firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript);
        } else {
            document.head.appendChild(script);
        }
    }

    try {
        window.fbq("init", cleanId);
        if (testEventCode) {
            window.fbq("dataProcessingOptions", []);
        }
        initialized = true;
        addEventLog("Pixel Initialized", { pixelId: cleanId });

        // Track default PageView on initialization
        trackPageView();
        return true;
    } catch (err) {
        console.warn("[Meta Pixel] Initialization error:", err);
        return false;
    }
}

/**
 * Track PageView event
 */
export function trackPageView(pageTitle?: string) {
    if (typeof window === "undefined" || !window.fbq) return;
    try {
        window.fbq("track", "PageView");
        addEventLog("PageView", { title: pageTitle || (typeof document !== "undefined" ? document.title : "") });
    } catch (err) {
        console.warn("[Meta Pixel] PageView tracking failed:", err);
    }
}

/**
 * Track ViewContent event (Product or Pack details viewed)
 */
export function trackViewContent(params: {
    id?: string;
    name: string;
    category?: string;
    value?: number;
    currency?: string;
}) {
    if (typeof window === "undefined" || !window.fbq) return;
    const payload = {
        content_name: params.name,
        content_category: params.category || "Salud y Bienestar / Fajas Lumbares",
        content_ids: params.id ? [String(params.id)] : ["lumbar-fix-belt"],
        content_type: "product",
        value: params.value || 20000,
        currency: params.currency || "ARS"
    };

    try {
        window.fbq("track", "ViewContent", payload);
        addEventLog("ViewContent", payload);
    } catch (err) {
        console.warn("[Meta Pixel] ViewContent error:", err);
    }
}

/**
 * Track AddToCart event
 */
export function trackAddToCart(params: {
    id?: string;
    name: string;
    value: number;
    currency?: string;
    quantity?: number;
}) {
    if (typeof window === "undefined" || !window.fbq) return;
    const payload = {
        content_name: params.name,
        content_ids: params.id ? [String(params.id)] : ["item-cart"],
        content_type: "product",
        value: params.value,
        currency: params.currency || "ARS",
        num_items: params.quantity || 1
    };

    try {
        window.fbq("track", "AddToCart", payload);
        addEventLog("AddToCart", payload);
    } catch (err) {
        console.warn("[Meta Pixel] AddToCart error:", err);
    }
}

/**
 * Track InitiateCheckout event
 */
export function trackInitiateCheckout(params: {
    items: Array<{ id?: string; nombre?: string; precio?: number; cantidad?: number }>;
    total: number;
    currency?: string;
}) {
    if (typeof window === "undefined" || !window.fbq) return;
    const contentIds = (params.items || []).map((i) => String(i.id || "prod"));
    const numItems = (params.items || []).reduce((acc, i) => acc + (i.cantidad || 1), 0);

    const payload = {
        content_ids: contentIds.length > 0 ? contentIds : ["lumbar-fix-checkout"],
        content_type: "product",
        value: params.total,
        currency: params.currency || "ARS",
        num_items: numItems
    };

    try {
        window.fbq("track", "InitiateCheckout", payload);
        addEventLog("InitiateCheckout", payload);
    } catch (err) {
        console.warn("[Meta Pixel] InitiateCheckout error:", err);
    }
}

/**
 * Track AddPaymentInfo event
 */
export function trackAddPaymentInfo(params: {
    paymentType: string;
    value: number;
    currency?: string;
}) {
    if (typeof window === "undefined" || !window.fbq) return;
    const payload = {
        payment_type: params.paymentType,
        value: params.value,
        currency: params.currency || "ARS"
    };

    try {
        window.fbq("track", "AddPaymentInfo", payload);
        addEventLog("AddPaymentInfo", payload);
    } catch (err) {
        console.warn("[Meta Pixel] AddPaymentInfo error:", err);
    }
}

/**
 * Track Purchase event (High Priority Conversion)
 */
export function trackPurchase(params: {
    orderId: string;
    total: number;
    currency?: string;
    items?: Array<{ id?: string; nombre?: string; precio?: number; cantidad?: number }>;
    paymentMethod?: string;
}) {
    if (typeof window === "undefined" || !window.fbq) return;
    const contentIds = (params.items || []).map((i) => String(i.id || "item"));
    const numItems = (params.items || []).reduce((acc, i) => acc + (i.cantidad || 1), 0);

    const payload = {
        content_name: "Lumbar Fix — Orden #" + params.orderId,
        content_ids: contentIds.length > 0 ? contentIds : ["LF-ORDER"],
        content_type: "product",
        value: params.total,
        currency: params.currency || "ARS",
        num_items: numItems || 1,
        order_id: params.orderId,
        payment_method: params.paymentMethod || "contraentrega"
    };

    try {
        window.fbq("track", "Purchase", payload);
        addEventLog("Purchase", payload);
    } catch (err) {
        console.warn("[Meta Pixel] Purchase error:", err);
    }
}

/**
 * Track Lead event (Form input or contact registration)
 */
export function trackLead(params?: {
    name?: string;
    origin?: string;
    value?: number;
}) {
    if (typeof window === "undefined" || !window.fbq) return;
    const payload = {
        content_name: params?.name || "Registro de Cliente Potencial",
        content_category: params?.origin || "Checkout",
        value: params?.value || 0,
        currency: "ARS"
    };

    try {
        window.fbq("track", "Lead", payload);
        addEventLog("Lead", payload);
    } catch (err) {
        console.warn("[Meta Pixel] Lead error:", err);
    }
}

/**
 * Track Contact event (WhatsApp button clicks)
 */
export function trackContact(params?: {
    channel?: string;
    origin?: string;
}) {
    if (typeof window === "undefined" || !window.fbq) return;
    const payload = {
        content_name: `Contacto por ${params?.channel || "WhatsApp"}`,
        content_category: params?.origin || "Boton Flotante"
    };

    try {
        window.fbq("track", "Contact", payload);
        addEventLog("Contact", payload);
    } catch (err) {
        console.warn("[Meta Pixel] Contact error:", err);
    }
}

/**
 * Track custom event
 */
export function trackCustomEvent(eventName: string, params?: Record<string, any>) {
    if (typeof window === "undefined" || !window.fbq) return;
    try {
        window.fbq("trackCustom", eventName, params || {});
        addEventLog(eventName, params);
    } catch (err) {
        console.warn(`[Meta Pixel] Custom event ${eventName} error:`, err);
    }
}

/**
 * Get active pixel configuration status & recent logs
 */
export function getPixelDiagnostics() {
    return {
        isInitialized: initialized,
        activePixelId,
        hasFbqGlobal: typeof window !== "undefined" && Boolean(window.fbq),
        recentEvents: [...eventLogs]
    };
}
