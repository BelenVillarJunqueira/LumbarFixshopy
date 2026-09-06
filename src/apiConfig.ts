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
                return saved.trim().replace(/\/$/, "");
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

