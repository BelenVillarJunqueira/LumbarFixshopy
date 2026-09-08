/**
 * Configuración de URL base de la API para conectar Vercel con Render
    * Toma la variable de entorno VITE_API_URL configurada en Vercel o en.env
        * (por ejemplo: https://lumbarfix-backend.onrender.com).
 * Si no está definida(entorno local o proxy), queda vacía "" para rutas relativas.
 */

export const getApiBaseUrl = (): string => {
    const envUrl = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.trim();
    if (envUrl) return envUrl.replace(/\/$/, "");

    if (typeof window !== "undefined") {
        if ((window as any).__API_URL) {
            return String((window as any).__API_URL).trim().replace(/\/$/, "");
        }
        try {
            const saved =
                localStorage.getItem("lumbarfix_render_url") ||
                localStorage.getItem("lumbarfix_backend_url");
            if (saved && saved.trim()) {
                const trimmed = saved.trim().replace(/\/$/, "");
                // isamerbblumbar.onrender.com es exclusivamente el servidor de webhook de ISAMER OS,
                // no contiene la API de productos ni subida de archivos de Lumbar Fix.
                if (trimmed.includes("isamerbblumbar.onrender.com")) {
                    console.warn("[apiConfig] isamerbblumbar.onrender.com es el endpoint de webhooks de ISAMER OS, no el backend de la tienda. Usando rutas locales / proxy.");
                    return "";
                }
                return trimmed;
            }
        } catch { }
    }

    return "";
};

export const API_URL: string = getApiBaseUrl();

export const apiUrl = (endpoint: string): string => {
    const base = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
};

export const setCustomBackendUrl = (url: string): void => {
    const clean = url.trim().replace(/\/$/, "");
    try {
        if (clean) {
            localStorage.setItem("lumbarfix_backend_url", clean);
            localStorage.setItem("lumbarfix_render_url", clean);
        } else {
            localStorage.removeItem("lumbarfix_backend_url");
            localStorage.removeItem("lumbarfix_render_url");
        }
    } catch { }
};

if (typeof window !== "undefined") {
    (window as any).setBackendUrl = (url: string) => {
        setCustomBackendUrl(url);
        console.log("Backend URL establecido a:", url);
        window.location.reload();
    };
}

