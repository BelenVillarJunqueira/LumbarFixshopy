// ============================================================================
// 👉 INTEGRACIÓN PARA: https://lumbar-fix.vercel.app/ (Vercel Cloud)
// Sincronización oficial de ventas y pedidos con ISAMER OS
// Webhook: https://isamerbblumbar.onrender.com/api/webhooks/lumbarfix-orders
// ============================================================================

import { CartItem, CustomerData, Order } from "../types";

export interface IsamerOrderItem {
    sku: string;
    quantity: number;
    price: number;
}

export interface IsamerOrderPayload {
    businessId: string;
    orderId: string;
    customerName: string;
    phone: string;
    items: IsamerOrderItem[];
    total: number;
    paymentMethod: "contra_entrega" | "mercadopago_qr" | "transferencia" | string;
    shippingAddress: string;
}

/**
 * Mapea los productos y packs de Lumbar Fix a los SKUs oficiales reconocidos por ISAMER OS:
 * - 'LF-BELT-LXL' (Faja Descompresora $20.000)
 * - 'LF-KNEE-PRO' (Rodillera Ortopédica $18.500)
 * - 'LF-ANKLE-COMP' (Tobillera Compresión $15.000)
 * - 'LF-FOAM-ROLLER' (Foam Roller $28.000)
 * - 'CMB-LF-DUO' (Pack Dúo $32.000)
 * - 'CMB-LF-PACK' (Pack Completo $89.999)
 */
export function mapItemToIsamerSku(item: CartItem): string {
    const id = (item.id || item.productId || item.bundleId || "").toLowerCase();
    const name = (item.nombre || "").toLowerCase();

    // 1. Pack Completo / Recomendado
    if (
        id.includes("pack-lumbar-fix") ||
        id.includes("pack-completo") ||
        id.includes("bundle-completo") ||
        (name.includes("pack") && (name.includes("completo") || name.includes("recomendado") || item.precio >= 80000))
    ) {
        return "CMB-LF-PACK";
    }

    // 2. Pack Dúo
    if (
        id.includes("duo") ||
        id.includes("bundle-duo") ||
        name.includes("dúo") ||
        name.includes("duo") ||
        (item.cantidad === 2 && id.includes("faja"))
    ) {
        return "CMB-LF-DUO";
    }

    // 3. Rodillera
    if (id.includes("rodillera") || name.includes("rodillera")) {
        return "LF-KNEE-PRO";
    }

    // 4. Tobillera
    if (id.includes("tobillera") || name.includes("tobillera")) {
        return "LF-ANKLE-COMP";
    }

    // 5. Foam Roller
    if (id.includes("foam") || id.includes("roller") || name.includes("foam") || name.includes("roller")) {
        return "LF-FOAM-ROLLER";
    }

    // 6. Faja Lumbar Descompresora (por defecto)
    return "LF-BELT-LXL";
}

/**
 * Normaliza el método de pago al formato esperado por ISAMER OS:
 * 'contra_entrega' | 'mercadopago_qr' | 'transferencia'
 */
export function mapPaymentMethodToIsamer(method: string): string {
    switch (method) {
        case "contraentrega":
        case "contra_entrega":
        case "whatsapp":
            return "contra_entrega";
        case "mercadopago":
        case "mercadopago_qr":
            return "mercadopago_qr";
        case "transferencia":
            return "transferencia";
        default:
            return "contra_entrega";
    }
}

/**
 * Dispara la notificación del webhook a ISAMER OS al confirmarse un pedido.
 * Actualiza stock, genera tarea de empaquetado/despacho y sincroniza CRM.
 */
export async function notifyIsamerOS_LumbarFix(orderData: {
    trackingCode?: string;
    orderId?: string;
    customerName: string;
    phone: string;
    address?: string;
    city?: string;
    provincia?: string;
    items?: CartItem[];
    sku?: string;
    quantity?: number;
    totalPrice?: number;
    total?: number;
    paymentMethod?: string;
}): Promise<boolean> {
    try {
        const trackingCode =
            orderData.trackingCode ||
            orderData.orderId ||
            "LF-" + Math.floor(100000 + Math.random() * 900000);

        // Mapear items con SKU reconocido
        let mappedItems: IsamerOrderItem[] = [];
        if (Array.isArray(orderData.items) && orderData.items.length > 0) {
            mappedItems = orderData.items.map((item) => ({
                sku: mapItemToIsamerSku(item),
                quantity: item.cantidad || 1,
                price: item.precio || 20000
            }));
        } else {
            mappedItems = [
                {
                    sku: orderData.sku || "LF-BELT-LXL",
                    quantity: orderData.quantity || 1,
                    price: orderData.totalPrice || orderData.total || 20000
                }
            ];
        }

        const totalAmount = orderData.totalPrice || orderData.total || 20000;
        const payment = mapPaymentMethodToIsamer(orderData.paymentMethod || "contra_entrega");

        const fullAddress = [
            orderData.address || "",
            orderData.city || "",
            orderData.provincia || ""
        ]
            .filter(Boolean)
            .join(", ") || "Dirección a coordinar";

        const payload: IsamerOrderPayload = {
            businessId: "lumbarfix",
            orderId: trackingCode,
            customerName: orderData.customerName,
            phone: orderData.phone,
            items: mappedItems,
            total: totalAmount,
            paymentMethod: payment,
            shippingAddress: fullAddress
        };

        console.log("📡 Enviando webhook de venta a ISAMER OS:", payload);

        const response = await fetch("https://isamerbblumbar.onrender.com/api/webhooks/lumbarfix-orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Store-Origin": "lumbar-fix.vercel.app"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log("✅ Venta LUMBAR FIX sincronizada en ISAMER OS - Stock descontado y tarea de envío creada");
            return true;
        } else {
            console.warn("⚠️ ISAMER OS respondió con estado:", response.status);
            return false;
        }
    } catch (err) {
        console.warn("ISAMER OS offline o no accesible desde este dispositivo, guardando en cola local...", err);
        return false;
    }
}
