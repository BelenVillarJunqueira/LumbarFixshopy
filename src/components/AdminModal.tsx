import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Save,
  Package,
  FileText,
  ShoppingBag,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  MessageCircle,
  Download,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Building,
  Lock,
  LogOut,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Video,
  Play,
  ArrowUpDown,
  ArrowRight,
  Truck,
  Flame,
  Check,
  Upload,
  Link2,
  Target,
  Zap,
  Activity
} from "lucide-react";
import { Product, SiteContent, Order, BundleOption } from "../types";
import { API_URL, apiUrl } from "../apiConfig";
import { getPixelDiagnostics, trackLead, initMetaPixel } from "../services/metaPixel";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  bundles: BundleOption[];
  products: Product[];
  siteContent: SiteContent;
  orders: Order[];
  adminToken?: string;
  adminUsername?: string;
  onLogout?: () => void;
  onUpdateProduct: (product: Product) => Promise<void>;
  onUpdateBundles: (bundles: BundleOption[]) => Promise<void>;
  onUpdateSiteContent: (content: SiteContent) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: Order["estado"]) => Promise<void>;
  onCreateProduct: (prod: Partial<Product>) => Promise<void>;
  onDeleteProduct: (prodId: string) => Promise<void>;
  onResetDefaults: () => Promise<void>;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  product,
  bundles,
  products,
  siteContent,
  orders,
  adminToken,
  adminUsername,
  onLogout,
  onUpdateProduct,
  onUpdateBundles,
  onUpdateSiteContent,
  onUpdateOrderStatus,
  onCreateProduct,
  onDeleteProduct,
  onResetDefaults
}) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "producto" | "landing" | "catalogo" | "pedidos" | "pagos" | "meta" | "ajustes">("dashboard");

  // Local editing states
  const defaultGallery = [
    product.img || "/images/fajalumbar.jpg",
    "/images/despues.jpg",
    "/images/antes.jpg",
    "/images/pack2.png",
    "/images/rodillera.jpg",
    "/images/tobillera.jpg",
    "/images/foamroller.webp"
  ];

  const [prodForm, setProdForm] = useState<Product>(() => ({
    ...product,
    galeria: Array.isArray(product?.galeria) && product.galeria.length > 0 ? product.galeria : defaultGallery,
    reelUrl: product?.reelUrl !== undefined ? product.reelUrl : "/images/reel-lumbarfix.mp4",
    reelTitulo: product?.reelTitulo || "Reel Demostrativo: Descompresión Lumbar Fix",
    reelActivo: product?.reelActivo !== false
  }));

  // Synchronize prodForm ONLY when modal opens to avoid overwriting user edits
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current && product) {
      setProdForm({
        ...product,
        galeria: Array.isArray(product.galeria) && product.galeria.length > 0 ? product.galeria : defaultGallery,
        reelUrl: product.reelUrl !== undefined ? product.reelUrl : "/images/reel-lumbarfix.mp4",
        reelTitulo: product.reelTitulo || "Reel Demostrativo: Descompresión Lumbar Fix",
        reelActivo: product.reelActivo !== false
      });
      setBundlesForm([...bundles]);
      setContentForm({
        ...siteContent,
        datosBancarios: siteContent.datosBancarios || {
          banco: "Mercado Pago / Banco Galicia",
          titular: "LUMBAR FIX OFICIAL",
          cuit: "20-38492819-4",
          cbu: "0000003100012345678901",
          alias: "LUMBARFIX.PAGOS",
          instrucciones: "Transferí el monto exacto con el 10% de descuento y enviá el comprobante con tu número de pedido."
        },
        mercadopago: siteContent.mercadopago || {
          activo: false,
          accessToken: "",
          publicKey: ""
        },
        metaPixel: {
          activo: siteContent.metaPixel?.activo !== false,
          pixelId: siteContent.metaPixel?.pixelId || (typeof window !== "undefined" ? localStorage.getItem("lumbarfix_meta_pixel") || "" : ""),
          conversionApiToken: siteContent.metaPixel?.conversionApiToken || "",
          testEventCode: siteContent.metaPixel?.testEventCode || ""
        }
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, product, bundles, siteContent]);

  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [bundlesForm, setBundlesForm] = useState<BundleOption[]>([...bundles]);
  const [contentForm, setContentForm] = useState<SiteContent>({
    ...siteContent,
    datosBancarios: siteContent.datosBancarios || {
      banco: "Mercado Pago / Galicia ",
      titular: "Lumbar Fix ",
      cuit: "23-37066549-4",
      cbu: "0070327530004092450465",
      alias: "RBVILLAR3.GAL",
      instrucciones: "Realizá la transferencia por el total con el 10% de descuento aplicado y enviá el comprobante junto con tu código de seguimiento por WhatsApp para que despachemos hoy mismo."
    },
    mercadopago: siteContent.mercadopago || {
      activo: true,
      accessToken: "",
      publicKey: ""
    },
    metaPixel: {
      activo: siteContent.metaPixel?.activo !== false,
      pixelId: siteContent.metaPixel?.pixelId || (typeof window !== "undefined" ? localStorage.getItem("lumbarfix_meta_pixel") || "" : ""),
      conversionApiToken: siteContent.metaPixel?.conversionApiToken || "",
      testEventCode: siteContent.metaPixel?.testEventCode || ""
    }
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveBannerMsg, setSaveBannerMsg] = useState<string | null>(null);
  const [uploadingStatus, setUploadingStatus] = useState<string | null>(null);

  // Meta Ads / Pixel testing & diagnostics states
  const [testingMetaPixel, setTestingMetaPixel] = useState(false);
  const [metaTestFeedback, setMetaTestFeedback] = useState<{ success: boolean; msg: string; details?: any } | null>(null);
  const [metaDiagnostics, setMetaDiagnostics] = useState(() => getPixelDiagnostics());

  // Backend connection & ISAMER configuration state
  const [customBackendUrl, setCustomBackendUrl] = useState(() => {
    try {
      return (
        localStorage.getItem("lumbarfix_backend_url") ||
        localStorage.getItem("lumbarfix_render_url") ||
        ""
      );
    } catch {
      return "";
    }
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Mercado Pago testing states
  const [testingMpToken, setTestingMpToken] = useState(false);
  const [mpTestResult, setMpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestMpToken = async () => {
    const token = contentForm.mercadopago?.accessToken?.trim();
    if (!token) {
      setMpTestResult({
        success: false,
        message: "Por favor ingresá primero tu Access Token (APP_USR-...) para probar la conexión."
      });
      return;
    }

    setTestingMpToken(true);
    setMpTestResult(null);

    try {
      const res = await fetch(apiUrl("/api/mercadopago/test-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMpTestResult({
          success: true,
          message: `¡Conexión exitosa! Cuenta vinculada: ${data.user?.nickname || data.user?.email || data.user?.id} (${data.user?.countryId || "AR"}). El Checkout Oficial está listo para recibir pagos con tarjetas y dinero en cuenta.`
        });
      } else {
        setMpTestResult({
          success: false,
          message: data.error || "Token inválido o expirado. Verificá que comience con APP_USR-."
        });
      }
    } catch (err: any) {
      setMpTestResult({
        success: false,
        message: "Error de red al verificar con Mercado Pago: " + (err.message || "")
      });
    } finally {
      setTestingMpToken(false);
    }
  };

  const handleTestMetaPixel = async () => {
    const pixelId = contentForm.metaPixel?.pixelId?.trim();
    if (!pixelId) {
      setMetaTestFeedback({
        success: false,
        msg: "Por favor ingresá un Pixel ID de Meta antes de ejecutar la prueba."
      });
      return;
    }

    setTestingMetaPixel(true);
    setMetaTestFeedback(null);

    try {
      // 1. Client-side track lead test event
      trackLead({
        name: "Prueba Administrador Lumbar Fix",
        origin: "Panel Admin (Test Event)",
        value: 20000
      });

      // 2. Server-side CAPI test event
      const res = await fetch(apiUrl("/api/meta-pixel/test-event"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixelId,
          conversionApiToken: contentForm.metaPixel?.conversionApiToken?.trim() || "",
          testEventCode: contentForm.metaPixel?.testEventCode?.trim() || "",
          eventName: "Lead"
        })
      });

      const data = await res.json().catch(() => ({ success: false }));
      if (res.ok && data.success) {
        setMetaTestFeedback({
          success: true,
          msg: "¡Evento de prueba enviado exitosamente! Verificá en el Administrador de Eventos de Meta > pestaña 'Probar eventos'.",
          details: data
        });
      } else {
        setMetaTestFeedback({
          success: false,
          msg: data.error || "El evento del navegador se emitió, pero Meta CAPI devolvió un error. Verificá que el Token de API de Conversiones sea válido.",
          details: data
        });
      }
    } catch (err: any) {
      setMetaTestFeedback({
        success: false,
        msg: `Error al probar Meta Pixel: ${err.message || err}`
      });
    } finally {
      setTestingMetaPixel(false);
      setMetaDiagnostics(getPixelDiagnostics());
    }
  };

  const handleSaveMetaPixel = async () => {
    setSaving(true);
    try {
      const pixelId = contentForm.metaPixel?.pixelId?.trim() || "";
      if (pixelId) {
        localStorage.setItem("lumbarfix_meta_pixel", pixelId);
        initMetaPixel(pixelId, contentForm.metaPixel?.testEventCode);
      }

      await fetch(apiUrl("/api/meta-pixel/save"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaPixel: contentForm.metaPixel
        })
      });

      await onUpdateSiteContent(contentForm);

      setSaveSuccess(true);
      setSaveBannerMsg("¡Configuración de Meta Ads & Pixel guardada con éxito!");
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveBannerMsg(null);
      }, 4000);
    } catch (err: any) {
      alert("Error al guardar configuración de Meta Pixel: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBackendUrl = () => {
    const clean = customBackendUrl.trim().replace(/\/$/, "");
    try {
      if (clean) {
        localStorage.setItem("lumbarfix_backend_url", clean);
        localStorage.setItem("lumbarfix_render_url", clean);
      } else {
        localStorage.removeItem("lumbarfix_backend_url");
        localStorage.removeItem("lumbarfix_render_url");
      }
      setSaveBannerMsg("¡URL del backend guardada! La página se recargará para aplicar los cambios.");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      alert("No se pudo guardar la URL.");
    }
  };

  const handleResetBackendUrl = () => {
    try {
      localStorage.removeItem("lumbarfix_backend_url");
      localStorage.removeItem("lumbarfix_render_url");
      setCustomBackendUrl("");
      setSaveBannerMsg("¡Restablecido a rutas relativas / servidor local! Recargando...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {}
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const urlToTest = customBackendUrl.trim()
        ? `${customBackendUrl.trim().replace(/\/$/, "")}/api/products`
        : apiUrl("/api/products");

      const res = await fetch(urlToTest);
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && (data.success || Array.isArray(data.products))) {
          setConnectionResult({
            ok: true,
            msg: `¡Conexión exitosa! El servidor respondió con HTTP 200 OK (${data.products?.length || 0} productos cargados).`
          });
        } else {
          setConnectionResult({
            ok: true,
            msg: "¡Conexión exitosa con el servidor (HTTP 200 OK)!"
          });
        }
      } else {
        setConnectionResult({
          ok: false,
          msg: `El servidor respondió con código ${res.status} (${res.statusText || "No encontrado"}). Verificá que la URL sea la del backend de la tienda y no del webhook de ISAMER.`
        });
      }
    } catch (err: any) {
      setConnectionResult({
        ok: false,
        msg: `Error al conectar: ${err?.message || "No se pudo contactar al servidor"}.`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Hidden file inputs for direct PC upload
  const reelFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const mainImageFileInputRef = useRef<HTMLInputElement>(null);
  const newProdFileInputRef = useRef<HTMLInputElement>(null);

  // Direct PC Upload Helper with Ultra-Fast Streaming & Permanent Server Storage
  // Direct PC Upload Helper with Native Multipart (Multer) & Permanent Server Storage
  const handleUploadFile = async (
    file: File,
    type: "image" | "video",
    onSuccess: (url: string) => void
  ) => {
    const maxBytes = type === "video" ? 250 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert(`El archivo "${file.name}" supera el límite permitido (${type === "video" ? "250MB" : "50MB"}).`);
      return;
    }

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setUploadingStatus(`Subiendo "${file.name}" (${fileSizeMB} MB) al servidor...`);

    const token = adminToken || localStorage.getItem("lumbarfix_admin_token") || "adm_master_session_lumbarfix";

    // 1. Primary: Standard Multipart FormData with Multer (RFC-compliant, handles any file format & size)
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/upload-file`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success && data.url) {
        const finalUrl = data.url.startsWith("/uploads/") && API_URL ? `${API_URL}${data.url}` : data.url;
        onSuccess(finalUrl);
        setUploadingStatus(null);
        setSaveBannerMsg(`¡"${file.name}" subido con éxito al servidor! Listo para guardar.`);
        return;
      }
      if (data && data.error) {
        console.warn("Upload-file error:", data.error);
      }
    } catch (formErr) {
      console.warn("Multipart upload failed, attempting streaming fallback:", formErr);
    }

    // 2. Secondary: Raw binary stream upload
    try {
      const res = await fetch(`${API_URL}/api/upload-raw?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": file.type || (type === "video" ? "video/mp4" : "image/jpeg"),
          "X-Filename": file.name
        },
        body: file
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success && data.url) {
        const finalUrl = data.url.startsWith("/uploads/") && API_URL ? `${API_URL}${data.url}` : data.url;
        onSuccess(finalUrl);
        setUploadingStatus(null);
        setSaveBannerMsg(`¡"${file.name}" subido con éxito al servidor! Listo para guardar.`);
        return;
      }
    } catch (streamErr) {
      console.warn("Direct stream upload failed:", streamErr);
    }

    // 3. Tertiary fallback: Base64 JSON
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          dataUrl,
          filename: file.name,
          type
        })
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success && data.url) {
        const finalUrl = data.url.startsWith("/uploads/") && API_URL ? `${API_URL}${data.url}` : data.url;
        onSuccess(finalUrl);
        setUploadingStatus(null);
        setSaveBannerMsg(`¡"${file.name}" subido con éxito al servidor! Listo para guardar.`);
        return;
      } else {
        throw new Error(data?.error || "Error al procesar archivo en el servidor");
      }
    } catch (serverErr) {
      console.warn("Server upload failed or backend not reachable, using local file reader:", serverErr);
      // 4. Resilient Fallback: If backend is 404 or sleeping on Render, load image as dataUrl
      // so the user is NEVER blocked from uploading pictures from their PC
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        onSuccess(dataUrl);
        setUploadingStatus(null);
        setSaveBannerMsg(`¡"${file.name}" cargada con éxito! Podés presionar "Guardar Cambios".`);
        return;
      } catch (fallbackErr: any) {
        console.error("Local file read error:", fallbackErr);
        alert(`No se pudo cargar "${file.name}": ${fallbackErr?.message || "Error al leer archivo"}`);
        setUploadingStatus(null);
      }
    }
  };

  const handleUploadMultipleImages = async (files: File[]) => {
    setUploadingStatus(`Subiendo ${files.length} foto(s) al servidor...`);
    const newUrls: string[] = [];
    const token = adminToken || localStorage.getItem("lumbarfix_admin_token") || "adm_master_session_lumbarfix";

    // 1. Try batch upload with /api/upload-files
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await fetch(`${API_URL}/api/upload-files`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success && Array.isArray(data.urls) && data.urls.length > 0) {
        const formattedUrls = data.urls.map((u: string) =>
          u.startsWith("/uploads/") && API_URL ? `${API_URL}${u}` : u
        );
        newUrls.push(...formattedUrls);
      }
    } catch (batchErr) {
      console.warn("Batch upload failed, uploading individually:", batchErr);
    }

    // 2. Individual uploads for any remaining files
    if (newUrls.length < files.length) {
      for (let i = newUrls.length; i < files.length; i++) {
        const file = files[i];
        setUploadingStatus(`Subiendo foto ${i + 1} de ${files.length} ("${file.name}")...`);
        let uploadedUrl: string | null = null;

        try {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch(`${API_URL}/api/upload-file`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            body: formData
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data && data.success && data.url) {
            uploadedUrl = data.url.startsWith("/uploads/") && API_URL ? `${API_URL}${data.url}` : data.url;
          }
        } catch {}

        if (!uploadedUrl) {
          try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const res = await fetch(`${API_URL}/api/upload`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ dataUrl, filename: file.name, type: "image" })
            });
            const data = await res.json().catch(() => null);
            if (res.ok && data && data.success && data.url) {
              uploadedUrl = data.url.startsWith("/uploads/") && API_URL ? `${API_URL}${data.url}` : data.url;
            }
          } catch {}
        }

        // 3. Resilient fallback: read file locally as dataUrl if server returned 404 or offline
        if (!uploadedUrl) {
          try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            uploadedUrl = dataUrl;
          } catch {}
        }

        if (uploadedUrl) {
          newUrls.push(uploadedUrl);
        }
      }
    }

    setUploadingStatus(null);
    if (newUrls.length > 0) {
      const currentList = prodForm.galeria && prodForm.galeria.length > 0 ? prodForm.galeria : defaultGallery;
      setProdForm((prev) => ({
        ...prev,
        galeria: [...currentList, ...newUrls]
      }));
      setSaveBannerMsg(`¡${newUrls.length} foto(s) agregadas al carrusel! Hacé clic en "Guardar y Ver en la Tienda" para confirmar.`);
    } else {
      alert("No se pudo subir las fotos seleccionadas.");
    }
  };

  // Dedicated Save functions with clear visual confirmation
  const handleSaveCarouselAndReel = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveBannerMsg(null);
    try {
      await onUpdateProduct(prodForm);
      setSaveSuccess(true);
      setSaveBannerMsg("¡Carrusel y Reel guardados con éxito en el servidor! Ya están visibles en la tienda.");
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error(err);
      alert("Error al guardar carrusel y reel: " + (err?.message || "Error del servidor."));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveBannerMsg(null);
    try {
      await Promise.all([
        onUpdateProduct(prodForm),
        onUpdateBundles(bundlesForm),
        onUpdateSiteContent(contentForm)
      ]);
      setSaveSuccess(true);
      setSaveBannerMsg("¡Todos los cambios (producto, reel, carrusel, packs y textos) se guardaron con éxito!");
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error(err);
      alert("Error al guardar algunos datos en el servidor: " + (err?.message || "Error desconocido."));
    } finally {
      setSaving(false);
    }
  };

  // Primary action: Save everything and return to the live store view seamlessly
  const handleSaveAndClose = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveBannerMsg(null);
    try {
      await Promise.all([
        onUpdateProduct(prodForm),
        onUpdateBundles(bundlesForm),
        onUpdateSiteContent(contentForm)
      ]);
      setSaveSuccess(true);
      setSaving(false);
      // Close modal and navigate directly to product hero
      onClose();
      setTimeout(() => {
        try {
          const prodElement = document.getElementById("producto") || document.querySelector("main");
          if (prodElement && typeof prodElement.scrollIntoView === "function") {
            prodElement.scrollIntoView({ behavior: "smooth" });
          }
        } catch {}
      }, 150);
    } catch (err: any) {
      console.error(err);
      alert("Error al guardar cambios: " + (err?.message || "Verificá la conexión con el servidor."));
      setSaving(false);
    }
  };

  // Security password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState(adminUsername || "admin");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passStatus, setPassStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [changingPass, setChangingPass] = useState(false);

  // New product form
  const [newProd, setNewProd] = useState({
    nombre: "",
    precio: 20000,
    precioAnterior: 30000,
    stock: 10,
    img: "/images/fajalumbar.jpg",
    descripcion: ""
  });

  // New FAQ form
  const [newFaq, setNewFaq] = useState({ pregunta: "", respuesta: "" });
  // New Review form
  const [newReview, setNewReview] = useState({ autor: "", ciudad: "", comentario: "", rating: 5, foto: "" });

  if (!isOpen) return null;

  const handleSaveProductAndBundles = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateProduct(prodForm);
      await onUpdateBundles(bundlesForm);
      setSaveSuccess(true);
      setSaveBannerMsg("¡Producto y Packs guardados exitosamente!");
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveBannerMsg(null);
      }, 4000);
    } catch (err) {
      alert("Error al guardar producto");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContent = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (contentForm.mercadopago?.accessToken) {
        const cleanToken = contentForm.mercadopago.accessToken.trim();
        localStorage.setItem("lumbarfix_mp_token", cleanToken);
        try {
          await fetch(apiUrl("/api/mercadopago/save-token"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken: cleanToken,
              publicKey: contentForm.mercadopago.publicKey?.trim()
            })
          });
        } catch (saveErr) {
          console.warn("Could not sync with /api/mercadopago/save-token:", saveErr);
        }
      }
      await onUpdateSiteContent(contentForm);
      setSaveSuccess(true);
      setSaveBannerMsg("¡Configuraciones y Mercado Pago guardados exitosamente!");
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveBannerMsg(null);
      }, 4000);
    } catch (err) {
      alert("Error al guardar contenidos");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = () => {
    if (!newFaq.pregunta.trim() || !newFaq.respuesta.trim()) return;
    setContentForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { id: `faq-${Date.now()}`, ...newFaq }]
    }));
    setNewFaq({ pregunta: "", respuesta: "" });
  };

  const handleDeleteFaq = (id: string) => {
    setContentForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id)
    }));
  };

  const handleAddReview = () => {
    if (!newReview.autor.trim() || !newReview.comentario.trim()) return;
    setContentForm((prev) => ({
      ...prev,
      testimonios: [
        {
          id: `test-${Date.now()}`,
          autor: newReview.autor,
          ciudad: newReview.ciudad || "Argentina",
          comentario: newReview.comentario,
          rating: newReview.rating,
          fecha: "Reciente",
          verificado: true,
          foto: newReview.foto || undefined
        },
        ...prev.testimonios
      ]
    }));
    setNewReview({ autor: "", ciudad: "", comentario: "", rating: 5, foto: "" });
  };

  const handleDeleteReview = (id: string) => {
    setContentForm((prev) => ({
      ...prev,
      testimonios: prev.testimonios.filter((t) => t.id !== id)
    }));
  };

  const handleCreateNewProduct = async () => {
    if (!newProd.nombre.trim()) return;
    await onCreateProduct(newProd);
    setNewProd({
      nombre: "",
      precio: 20000,
      precioAnterior: 30000,
      stock: 10,
      img: "/images/fajalumbar.jpg",
      descripcion: ""
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus(null);
    setChangingPass(true);
    try {
      const token = adminToken || localStorage.getItem("lumbarfix_admin_token") || "";
      const res = await fetch(`${API_URL}/api/admin/change-credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newUsername: newUsername.trim(),
          newPassword: newPassword.trim()
        })
      });
      const rawText = await res.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        console.error("Non-JSON response in change-credentials:", rawText);
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "No se pudo cambiar la contraseña.");
      }
      if (data.token) {
        localStorage.setItem("lumbarfix_admin_token", data.token);
        localStorage.setItem("lumbarfix_admin_user", data.username);
      }
      setPassStatus({ type: "success", msg: "¡Contraseña de administrador actualizada con éxito!" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPassStatus({ type: "error", msg: err.message || "Error al actualizar contraseña." });
    } finally {
      setChangingPass(false);
    }
  };

  // Carousel & Reel gallery helper functions
  const handleMoveImageUp = (index: number) => {
    if (index <= 0) return;
    const currentList = [...(prodForm.galeria && prodForm.galeria.length > 0 ? prodForm.galeria : defaultGallery)];
    const temp = currentList[index];
    currentList[index] = currentList[index - 1];
    currentList[index - 1] = temp;
    setProdForm({ ...prodForm, galeria: currentList });
  };

  const handleMoveImageDown = (index: number) => {
    const currentList = [...(prodForm.galeria && prodForm.galeria.length > 0 ? prodForm.galeria : defaultGallery)];
    if (index >= currentList.length - 1) return;
    const temp = currentList[index];
    currentList[index] = currentList[index + 1];
    currentList[index + 1] = temp;
    setProdForm({ ...prodForm, galeria: currentList });
  };

  const handleDeleteImage = (index: number) => {
    const currentList = [...(prodForm.galeria && prodForm.galeria.length > 0 ? prodForm.galeria : defaultGallery)];
    if (currentList.length <= 1) {
      alert("El carrusel debe contener al menos 1 imagen.");
      return;
    }
    const updated = currentList.filter((_, idx) => idx !== index);
    const updatedImg = index === 0 ? updated[0] : prodForm.img;
    setProdForm({ ...prodForm, galeria: updated, img: updatedImg });
    setSaveBannerMsg("Foto eliminada de la lista. Hacé clic en 'Guardar y Ver en la Tienda' para confirmar los cambios.");
  };

  const handleAddGalleryImage = (urlToAdd?: string) => {
    const url = (urlToAdd || newGalleryUrl).trim();
    if (!url) return;
    const currentList = [...(prodForm.galeria && prodForm.galeria.length > 0 ? prodForm.galeria : defaultGallery)];
    if (currentList.includes(url)) {
      alert("Esta imagen ya está en el carrusel.");
      return;
    }
    setProdForm({ ...prodForm, galeria: [...currentList, url] });
    setNewGalleryUrl("");
    setSaveBannerMsg("Foto agregada a la lista. Hacé clic en 'Guardar y Ver en la Tienda' para confirmar los cambios.");
  };

  // Dashboard & Analytics metrics calculations
  const totalRevenue = orders.reduce((sum, o) => {
    if (o.estado === "Cancelado") return sum;
    return sum + (o.total || 0);
  }, 0);

  const pendingOrdersCount = orders.filter((o) => o.estado === "Pendiente").length;
  const confirmedOrdersCount = orders.filter((o) => o.estado === "Confirmado" || o.estado === "En preparación").length;
  const deliveredOrdersCount = orders.filter((o) => o.estado === "Entregado" || o.estado === "Despachado").length;
  const activeOrdersCount = orders.filter((o) => o.estado !== "Cancelado").length;
  const averageTicket = activeOrdersCount > 0 ? Math.round(totalRevenue / activeOrdersCount) : 0;

  // Breakdown by payment method
  const contraEntregaOrders = orders.filter((o) => (o.metodoPago as string) === "contraentrega" || (o.metodoPago as string) === "contra_entrega");
  const mercadoPagoOrders = orders.filter((o) => o.metodoPago === "mercadopago");
  const transferenciaOrders = orders.filter((o) => o.metodoPago === "transferencia");
  const whatsappOrders = orders.filter((o) => o.metodoPago === "whatsapp" || !["contraentrega", "contra_entrega", "mercadopago", "transferencia"].includes(o.metodoPago as string));

  // Top selling products / packs aggregation
  const itemCounts: Record<string, { count: number; revenue: number }> = {};
  orders.forEach((o) => {
    if (o.estado === "Cancelado") return;
    o.items?.forEach((item) => {
      const name = item.nombre || "Faja Lumbar";
      if (!itemCounts[name]) {
        itemCounts[name] = { count: 0, revenue: 0 };
      }
      itemCounts[name].count += item.cantidad || 1;
      itemCounts[name].revenue += (item.precio || 0) * (item.cantidad || 1);
    });
  });

  const sortedTopItems = Object.entries(itemCounts)
    .map(([nombre, data]) => ({ nombre, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const exportOrdersCSV = () => {
    if (orders.length === 0) {
      alert("No hay pedidos para exportar.");
      return;
    }
    const headers = ["ID", "Codigo", "Fecha", "Estado", "Cliente", "Telefono", "Ciudad", "Provincia", "Total", "Metodo Pago"];
    const rows = orders.map((o) => [
      o.id,
      o.trackingCode,
      o.fecha,
      o.estado,
      `"${o.cliente.nombre} ${o.cliente.apellido}"`,
      `"${o.cliente.telefono}"`,
      `"${o.cliente.ciudad}"`,
      `"${o.cliente.provincia}"`,
      o.total,
      o.metodoPago
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pedidos-lumbarfix-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-start sm:items-center justify-center p-0 sm:p-3 md:p-5 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-white w-full sm:max-w-5xl min-h-screen sm:min-h-0 sm:h-[92vh] sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 overflow-hidden flex flex-col min-w-0">
        {/* Hidden native file inputs for PC / Mobile file selection */}
        <input
          type="file"
          ref={reelFileInputRef}
          accept="video/mp4,video/webm,video/quicktime,video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleUploadFile(file, "video", (url) => {
                setProdForm((prev) => ({ ...prev, reelUrl: url, reelActivo: true }));
              });
            }
            e.target.value = "";
          }}
          className="hidden"
        />
        <input
          type="file"
          ref={galleryFileInputRef}
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleUploadMultipleImages(Array.from(files));
            }
            e.target.value = "";
          }}
          className="hidden"
        />
        <input
          type="file"
          ref={mainImageFileInputRef}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleUploadFile(file, "image", (url) => {
                setProdForm((prev) => ({ ...prev, img: url }));
              });
            }
            e.target.value = "";
          }}
          className="hidden"
        />
        <input
          type="file"
          ref={newProdFileInputRef}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleUploadFile(file, "image", (url) => {
                setNewProd((prev) => ({ ...prev, img: url }));
              });
            }
            e.target.value = "";
          }}
          className="hidden"
        />

        {/* Top Navbar */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-400 shrink-0"></span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold font-['Space_Grotesk'] flex items-center gap-2 truncate">
                <span>Panel de Control & CMS</span>
                <span className="hidden sm:inline text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                  {adminUsername || "admin"}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block truncate">
                Modificá fotos, reel, packs, precios, pedidos y guardá todos los cambios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Primary Action: Guardar y Ver en Tienda */}
            <button
              type="button"
              onClick={handleSaveAndClose}
              disabled={saving}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 transition-all"
              title="Guardar todos los cambios y ver el resultado en la tienda"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? "Guardando..." : "Guardar y Ver Tienda"}</span>
            </button>

            {/* Secondary Action: Guardar sin cerrar */}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="hidden md:flex px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-300 font-bold text-xs items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50 transition-all"
              title="Guardar cambios y continuar editando en el panel"
            >
              <span>Guardar sin Salir</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-semibold items-center gap-1.5 transition-all cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Uploading progress notification banner */}
        {uploadingStatus && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-900 text-xs font-bold flex items-center justify-between animate-pulse shrink-0">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>{uploadingStatus}</span>
            </div>
            <span className="text-[10px] text-amber-700">Subiendo a la tienda...</span>
          </div>
        )}

        {/* Save confirmation banner */}
        {saveBannerMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-xs shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-white shrink-0" />
              <span>{saveBannerMsg}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    try {
                      const prodElement = document.getElementById("producto") || document.querySelector("main");
                      if (prodElement && typeof prodElement.scrollIntoView === "function") {
                        prodElement.scrollIntoView({ behavior: "smooth" });
                      }
                    } catch {}
                  }, 150);
                }}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer transition-colors"
              >
                Ver en la Tienda →
              </button>
              <button
                onClick={() => setSaveBannerMsg(null)}
                className="text-white/80 hover:text-white text-xs cursor-pointer ml-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab Selector with horizontal touch scroll */}
        <div className="flex border-b border-slate-200 bg-slate-100 overflow-x-auto px-2.5 sm:px-4 gap-1 sm:gap-2 pt-2 scrollbar-thin touch-pan-x shrink-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "dashboard"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-600" />
            <span>Dashboard & Métricas</span>
          </button>

          <button
            onClick={() => setActiveTab("producto")}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "producto"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="w-4 h-4 text-cyan-600" />
            <span>Producto, Carrusel & Packs</span>
          </button>

          <button
            onClick={() => setActiveTab("pagos")}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "pagos"
                ? "bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Pagos, Mercado Pago & CBU</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("meta");
              setMetaDiagnostics(getPixelDiagnostics());
            }}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "meta"
                ? "bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="w-4 h-4 text-blue-600" />
            <span>Meta Ads & Pixel</span>
            {contentForm.metaPixel?.pixelId ? (
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab("pedidos")}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "pedidos"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ventas y Pedidos ({orders.length})</span>
            {orders.filter((o) => o.estado === "Pendiente").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "landing"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Textos, FAQs & Opiniones</span>
          </button>

          <button
            onClick={() => setActiveTab("catalogo")}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "catalogo"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Catálogo ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ajustes")}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "ajustes"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Ajustes & Contraseña</span>
          </button>
        </div>

        {/* Content Area - Scrollable with safe bounds */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 space-y-6 min-w-0">
          {saveSuccess && !saveBannerMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¡Cambios guardados con éxito en la base de datos del backend!</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 0: DASHBOARD & MÉTRICAS (SOLICITADO POR EL DUEÑO)     */}
          {/* ========================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-3xl shadow-sm border border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    <span>Métricas en Tiempo Real</span>
                  </div>
                  <h3 className="text-xl font-black font-['Space_Grotesk'] text-white mt-1">
                    Dashboard de Rendimiento & Ventas
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Resumen financiero, pedidos despachados, conversión y canales de pago.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportOrdersCSV}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Descargar Reporte (CSV)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("pedidos")}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Ver Pedidos ({orders.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ventas Totales */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ventas Totales</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black font-['Space_Grotesk'] text-slate-900 block">
                      ${totalRevenue.toLocaleString("es-AR")}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      {activeOrdersCount} órdenes generadas
                    </span>
                  </div>
                </div>

                {/* Ticket Promedio */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black font-['Space_Grotesk'] text-slate-900 block">
                      ${averageTicket.toLocaleString("es-AR")}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 block mt-1">
                      Promedio gastado por comprador
                    </span>
                  </div>
                </div>

                {/* Pedidos Pendientes */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Por Despachar</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black font-['Space_Grotesk'] text-slate-900">
                        {pendingOrdersCount}
                      </span>
                      {pendingOrdersCount > 0 && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      {pendingOrdersCount > 0 ? "¡Requieren atención inmediata!" : "Todo al día"}
                    </span>
                  </div>
                </div>

                {/* Despachados & Entregados */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entregas / Envíos</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <Truck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black font-['Space_Grotesk'] text-slate-900 block">
                      {deliveredOrdersCount}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 block mt-1">
                      {orders.length > 0 ? `${Math.round((deliveredOrdersCount / orders.length) * 100)}% de efectividad` : "Sin pedidos"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Métodos de Pago & Top Productos */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Métodos de Pago */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-cyan-600" />
                      <span>Distribución por Método de Pago</span>
                    </h4>
                    <span className="text-xs font-semibold text-slate-500">{orders.length} pedidos</span>
                  </div>

                  <div className="space-y-3">
                    {/* Contra Entrega */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">📦 Pago Contra Entrega (Efectivo)</span>
                        <span className="text-slate-900 font-extrabold">{contraEntregaOrders.length} pedidos</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${orders.length > 0 ? (contraEntregaOrders.length / orders.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                        <span>Mayor volumen de conversión</span>
                        <span>${contraEntregaOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString("es-AR")}</span>
                      </div>
                    </div>

                    {/* Mercado Pago */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-sky-700">💙 Mercado Pago (Tarjetas & Dinero en cuenta)</span>
                        <span className="text-slate-900 font-extrabold">{mercadoPagoOrders.length} pedidos</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className="bg-sky-500 h-2 rounded-full"
                          style={{ width: `${orders.length > 0 ? (mercadoPagoOrders.length / orders.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                        <span>Acreditación automática</span>
                        <span>${mercadoPagoOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString("es-AR")}</span>
                      </div>
                    </div>

                    {/* Transferencia Bancaria */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-emerald-700">🏦 Transferencia Bancaria Directa (-10% OFF)</span>
                        <span className="text-slate-900 font-extrabold">{transferenciaOrders.length} pedidos</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${orders.length > 0 ? (transferenciaOrders.length / orders.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                        <span>CBU / ALIAS oficial</span>
                        <span>${transferenciaOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString("es-AR")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Productos / Packs Más Vendidos */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-600" />
                      <span>Packs & Productos Más Vendidos</span>
                    </h4>
                    <span className="text-xs font-semibold text-slate-500">Ranking por ingresos</span>
                  </div>

                  <div className="space-y-2.5">
                    {sortedTopItems.length > 0 ? (
                      sortedTopItems.slice(0, 5).map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 font-black flex items-center justify-center text-xs shrink-0">
                              #{idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 block truncate max-w-55">
                                {item.nombre}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {item.count} unidades vendidas
                              </span>
                            </div>
                          </div>
                          <span className="font-extrabold text-slate-900 text-xs">
                            ${item.revenue.toLocaleString("es-AR")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
                        Los productos más vendidos se computarán automáticamente a medida que ingresen pedidos.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions & Status */}
              <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">💡</span>
                  <div>
                    <span className="font-bold text-cyan-950 block">Acceso Rápido de Configuración</span>
                    <span className="text-cyan-800 text-[11px]">
                      ¿Querés cambiar el reel, reordenar fotos del carrusel o ajustar precios?
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("producto")}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                >
                  Ir al Gestor de Producto & Carrusel →
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: PRODUCTO PRINCIPAL */}
          {/* ========================================================= */}
          {activeTab === "producto" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Datos del Producto Principal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Editá el título, precio, imágenes y stock que ven los clientes.
                  </p>
                </div>
                <button
                  onClick={handleSaveProductAndBundles}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Guardando..." : "Guardar Producto"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Título del Producto</label>
                  <input
                    value={prodForm.nombre}
                    onChange={(e) => setProdForm({ ...prodForm, nombre: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Precio Actual (ARS)</label>
                  <input
                    type="number"
                    value={prodForm.precio}
                    onChange={(e) => setProdForm({ ...prodForm, precio: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Precio Anterior (Tachado)</label>
                  <input
                    type="number"
                    value={prodForm.precioAnterior || ""}
                    onChange={(e) => setProdForm({ ...prodForm, precioAnterior: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Stock Restante (Urgencia)</label>
                  <input
                    type="number"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Etiqueta / Badge</label>
                  <input
                    value={prodForm.badge || ""}
                    onChange={(e) => setProdForm({ ...prodForm, badge: e.target.value })}
                    placeholder="Ej: MÁS VENDIDO"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Imagen Principal del Producto</label>
                    <button
                      type="button"
                      onClick={() => mainImageFileInputRef.current?.click()}
                      className="text-xs font-bold text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100 px-3 py-1 rounded-lg border border-cyan-200 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Foto desde mi PC</span>
                    </button>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    <input
                      value={prodForm.img}
                      onChange={(e) => setProdForm({ ...prodForm, img: e.target.value })}
                      placeholder="/images/fajalumbar.jpg o https://..."
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => mainImageFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm transition-all active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir desde PC</span>
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={prodForm.img} alt="preview" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="text-slate-500">Imágenes rápidas:</span>
                    <button
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, img: "/images/fajalumbar.jpg" })}
                      className="underline text-cyan-600 hover:text-cyan-800"
                    >
                      Faja
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, img: "/images/pack2.png" })}
                      className="underline text-cyan-600 hover:text-cyan-800"
                    >
                      Pack
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, img: "/images/despues.jpg" })}
                      className="underline text-cyan-600 hover:text-cyan-800"
                    >
                      Resultados
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Descripción del Producto</label>
                  <textarea
                    rows={3}
                    value={prodForm.descripcion || ""}
                    onChange={(e) => setProdForm({ ...prodForm, descripcion: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECCIÓN CARRUSEL Y REEL (SOLICITADO POR EL DUEÑO)         */}
              {/* ========================================================= */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-cyan-600" />
                      <span>Carrusel de Imágenes & Video Reel</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Podés subir fotos y reels directo desde tu PC o celular, reordenarlos y guardarlos para que se publiquen en la tienda.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 self-start sm:self-auto">
                    {(prodForm.galeria?.length || 0) + (prodForm.reelActivo ? 1 : 0)} elementos en carrusel
                  </span>
                </div>

                {/* 1. CONFIGURACIÓN DEL REEL DE VIDEO */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Video Reel Promocional (Aparece primero en el carrusel)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {prodForm.reelActivo ? "✅ Activo: se muestra como slide #1 del carrusel" : "⏸️ Desactivado: solo se muestran imágenes"}
                        </span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodForm.reelActivo ?? true}
                        onChange={(e) => setProdForm({ ...prodForm, reelActivo: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {prodForm.reelActivo && (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      {/* Subida Directa de Video desde PC */}
                      <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center shrink-0">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-purple-950 block">
                              Subir Video Reel desde mi PC o Celular
                            </span>
                            <span className="text-[11px] text-purple-800">
                              Cargá un archivo MP4, WebM o MOV directo desde tu dispositivo sin copiar enlaces.
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => reelFileInputRef.current?.click()}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm transition-all active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Seleccionar Video desde PC</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">O URL del Video (MP4 o Embed)</label>
                          <input
                            value={prodForm.reelUrl || ""}
                            onChange={(e) => setProdForm({ ...prodForm, reelUrl: e.target.value })}
                            placeholder="https://.../video.mp4"
                            className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">Título / Etiqueta del Reel</label>
                          <input
                            value={prodForm.reelTitulo || ""}
                            onChange={(e) => setProdForm({ ...prodForm, reelTitulo: e.target.value })}
                            placeholder="Ej: Reel Demostrativo: Descompresión Lumbar"
                            className="w-full mt-1 p-2 rounded-xl border border-slate-300 text-xs bg-white"
                          />
                        </div>
                      </div>

                      {/* Video Player Preview */}
                      {prodForm.reelUrl && (
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-white text-[11px]">
                            <span className="font-bold flex items-center gap-1.5 text-purple-300">
                              <Play className="w-3.5 h-3.5 fill-current" /> Vista previa del Reel:
                            </span>
                            <span className="text-slate-400 text-[10px] font-mono truncate max-w-55">
                              {prodForm.reelUrl}
                            </span>
                          </div>
                          <div className="w-full max-h-52 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                            {prodForm.reelUrl.includes("youtube.com") || prodForm.reelUrl.includes("youtu.be") ? (
                              <iframe
                                src={prodForm.reelUrl.replace("watch?v=", "embed/")}
                                className="w-full h-44"
                                title="Previsualización Reel"
                              />
                            ) : (
                              <video
                                src={prodForm.reelUrl}
                                controls
                                className="w-full max-h-52 object-contain"
                              />
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-slate-500 font-medium">Preajustes de video:</span>
                          <button
                            type="button"
                            onClick={() => setProdForm({
                              ...prodForm,
                              reelUrl: "/images/reel-lumbarfix.mp4",
                              reelTitulo: "Reel Demostrativo: Descompresión Lumbar Fix"
                            })}
                            className="text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-semibold cursor-pointer"
                          >
                            🎬 Reel Lumbar Fix (Oficial HD)
                          </button>
                        </div>

                        {/* Dedicated Save Button for Reel */}
                        <button
                          type="button"
                          onClick={handleSaveCarouselAndReel}
                          disabled={saving}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{saving ? "Guardando..." : "Guardar Video Reel"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. REORDENAMIENTO Y SUBIDA DE IMÁGENES */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Secuencia y Orden de las Fotos</span>
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Usá las flechas para cambiar el orden de las fotos. La de arriba aparecerá primero.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, galeria: defaultGallery })}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                      Restablecer Orden Inicial
                    </button>
                  </div>

                  {/* Subida Directa de Fotos desde PC */}
                  <div className="p-3.5 bg-cyan-50/80 rounded-xl border border-cyan-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-200 text-cyan-900 flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-cyan-950 block">
                          Subir Fotos Directas desde mi Computadora / Celular
                        </span>
                        <span className="text-[11px] text-cyan-800">
                          Podés seleccionar varias fotos a la vez para agregarlas al carrusel automáticamente.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm transition-all active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Seleccionar Fotos desde PC</span>
                    </button>
                  </div>

                  {/* List of images */}
                  <div className="space-y-2">
                    {prodForm.reelActivo && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                        <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-900 font-black text-xs flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div className="w-12 h-12 rounded-lg bg-purple-900 flex items-center justify-center shrink-0 text-white">
                          <Play className="w-5 h-5 fill-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-purple-900">
                              🎬 REEL DE VIDEO (Fijo en posición #1)
                            </span>
                            <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded font-bold">
                              VIDEO
                            </span>
                          </div>
                          <span className="text-[11px] text-purple-700 block truncate">
                            {prodForm.reelTitulo || prodForm.reelUrl}
                          </span>
                        </div>
                        <span className="text-[11px] text-purple-600 font-semibold italic">
                          Siempre primero
                        </span>
                      </div>
                    )}

                    {(prodForm.galeria && prodForm.galeria.length > 0 ? prodForm.galeria : defaultGallery).map((imgUrl, idx) => {
                      const activeGalleryList = prodForm.galeria && prodForm.galeria.length > 0 ? prodForm.galeria : defaultGallery;
                      const displayIndex = (prodForm.reelActivo ? 2 : 1) + idx;
                      const isFirst = idx === 0;
                      const isLast = idx === activeGalleryList.length - 1;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-cyan-300 transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-black text-xs flex items-center justify-center shrink-0">
                            {displayIndex}
                          </span>

                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={imgUrl}
                              alt={`Imagen ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>

                          {/* URL text */}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-800 block truncate">
                              {imgUrl.split("/").pop() || imgUrl}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">
                              {imgUrl}
                            </span>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveImageUp(idx)}
                              disabled={isFirst}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-100 text-slate-700 hover:text-cyan-800 disabled:opacity-30 disabled:hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed transition-colors"
                              title="Mover imagen antes"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImageDown(idx)}
                              disabled={isLast}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-100 text-slate-700 hover:text-cyan-800 disabled:opacity-30 disabled:hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed transition-colors"
                              title="Mover imagen después"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(idx)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 cursor-pointer transition-colors"
                              title="Eliminar del carrusel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Image Form with PC Upload as Primary */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="p-3.5 bg-linear-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">
                            Subir Fotos Directamente desde tu Computadora
                          </span>
                          <span className="text-[11px] text-slate-600">
                            Hacé clic para seleccionar 1 o varias fotos desde tu PC y agregarlas al carrusel al instante.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md transition-all active:scale-95"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Subir Fotos desde mi PC</span>
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        O si preferís, pegar enlace web / ruta existente:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          placeholder="Pegá un link: https://... o /images/pack2.png"
                          className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddGalleryImage()}
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar Enlace</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => galleryFileInputRef.current?.click()}
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Desde mi PC</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Presets to quickly add */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                      <span className="text-slate-500 font-semibold">Preajustes disponibles:</span>
                      {[
                        { label: "+ Faja Lumbar", url: "/images/fajalumbar.jpg" },
                        { label: "+ Antes", url: "/images/antes.jpg" },
                        { label: "+ Después", url: "/images/despues.jpg" },
                        { label: "+ Pack 2x", url: "/images/pack2.png" },
                        { label: "+ Rodillera", url: "/images/rodillera.jpg" },
                        { label: "+ Tobillera", url: "/images/tobillera.jpg" },
                        { label: "+ Foam Roller", url: "/images/foamroller.webp" },
                      ].map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => handleAddGalleryImage(preset.url)}
                          className="bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-300 hover:border-cyan-400 px-2 py-0.5 rounded-md font-medium cursor-pointer transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dedicated Save Button for Gallery Photos */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-600 font-medium">
                      {(prodForm.galeria || []).length} foto(s) configuradas en el orden indicado.
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveCarouselAndReel}
                      disabled={saving}
                      className="w-full sm:w-auto px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? "Guardando..." : "Guardar Orden de Fotos"}</span>
                    </button>
                  </div>
                </div>

                {/* Big Save Carrusel & Reel Confirmation Banner */}
                <div className="p-4 rounded-2xl bg-cyan-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-cyan-200">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      <span>Confirmar y Guardar Carrusel de Fotos & Video Reel</span>
                    </h5>
                    <p className="text-[11px] text-slate-300">
                      Aplica inmediatamente la nueva secuencia de imágenes y video en la tienda para todos los visitantes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCarouselAndReel}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? "GUARDANDO..." : "GUARDAR CARRUSEL Y REEL"}</span>
                  </button>
                </div>
              </div>

              {/* Bundles / Quantity breaks editor */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Configuración de Packs y Descuentos por Cantidad
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {bundlesForm.map((b, idx) => (
                    <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                      <span className="font-bold text-cyan-700 uppercase tracking-wide block">
                        Opción {idx + 1}
                      </span>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Nombre</label>
                        <input
                          value={b.nombre}
                          onChange={(e) => {
                            const newB = [...bundlesForm];
                            newB[idx].nombre = e.target.value;
                            setBundlesForm(newB);
                          }}
                          className="w-full mt-0.5 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Precio (ARS)</label>
                        <input
                          type="number"
                          value={b.precio}
                          onChange={(e) => {
                            const newB = [...bundlesForm];
                            newB[idx].precio = Number(e.target.value);
                            setBundlesForm(newB);
                          }}
                          className="w-full mt-0.5 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Texto de Ahorro</label>
                        <input
                          value={b.descuentoTexto || ""}
                          onChange={(e) => {
                            const newB = [...bundlesForm];
                            newB[idx].descuentoTexto = e.target.value;
                            setBundlesForm(newB);
                          }}
                          className="w-full mt-0.5 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    Asegurate de guardar para aplicar los nuevos precios y descuentos de packs en la tienda.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveProductAndBundles}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? "Guardando..." : "Guardar Producto y Packs"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: TEXTOS, FAQS & OPINIONES */}
          {/* ========================================================= */}
          {activeTab === "landing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Textos de la Landing Page
                  </h3>
                  <p className="text-xs text-slate-500">
                    Personalizá títulos, argumentos de venta, preguntas frecuentes y testimonios.
                  </p>
                </div>
                <button
                  onClick={handleSaveContent}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Guardando..." : "Guardar Textos"}</span>
                </button>
              </div>

              {/* Announcement & Hero */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cabecera y Hero
                </h4>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Barra de Anuncio Superior</label>
                  <input
                    value={contentForm.announcementBar}
                    onChange={(e) => setContentForm({ ...contentForm, announcementBar: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Subtítulo Hero (Gancho)</label>
                  <textarea
                    rows={2}
                    value={contentForm.heroSubheadline}
                    onChange={(e) => setContentForm({ ...contentForm, heroSubheadline: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              {/* FAQs Management */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Preguntas Frecuentes ({contentForm.faqs.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {contentForm.faqs.map((f) => (
                    <div key={f.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 block">{f.pregunta}</span>
                        <p className="text-slate-600">{f.respuesta}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteFaq(f.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add FAQ */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700">Agregar Nueva Pregunta:</span>
                  <input
                    placeholder="¿Pregunta?"
                    value={newFaq.pregunta}
                    onChange={(e) => setNewFaq({ ...newFaq, pregunta: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                  <textarea
                    placeholder="Respuesta explicativa..."
                    rows={2}
                    value={newFaq.respuesta}
                    onChange={(e) => setNewFaq({ ...newFaq, respuesta: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                  <button
                    onClick={handleAddFaq}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                  >
                    + Añadir Pregunta
                  </button>
                </div>
              </div>

              {/* Testimonials Management */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Testimonios & Reseñas ({contentForm.testimonios.length})
                </h4>

                <div className="space-y-2.5">
                  {contentForm.testimonios.map((t) => (
                    <div key={t.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{t.autor}</span>
                          <span className="text-slate-400">({t.ciudad})</span>
                          <span className="text-amber-500 font-bold">★ {t.rating}</span>
                        </div>
                        <p className="text-slate-600 mt-1 italic">"{t.comentario}"</p>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(t.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Testimonial */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <span className="sm:col-span-2 font-bold text-slate-700">Agregar Testimonio:</span>
                  <input
                    placeholder="Nombre del cliente"
                    value={newReview.autor}
                    onChange={(e) => setNewReview({ ...newReview, autor: e.target.value })}
                    className="p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    placeholder="Ciudad / Provincia"
                    value={newReview.ciudad}
                    onChange={(e) => setNewReview({ ...newReview, ciudad: e.target.value })}
                    className="p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <textarea
                    placeholder="Comentario sobre la faja o el pack..."
                    rows={2}
                    value={newReview.comentario}
                    onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })}
                    className="sm:col-span-2 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <button
                    onClick={handleAddReview}
                    className="sm:col-span-2 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800"
                  >
                    + Añadir Testimonio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CATÁLOGO DE PRODUCTOS */}
          {/* ========================================================= */}
          {activeTab === "catalogo" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Catálogo General de Productos
                </h3>
                <p className="text-xs text-slate-500">
                  Podés añadir otros productos para vender como complementos (rodilleras, tobilleras, etc.).
                </p>
              </div>

              {/* Add product */}
              <div className="p-4 sm:p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-900 block">
                  + Crear Nuevo Producto
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700">Nombre del Producto</label>
                    <input
                      value={newProd.nombre}
                      onChange={(e) => setNewProd({ ...newProd, nombre: e.target.value })}
                      placeholder="Ej: Rodillera Ortopédica Pro"
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700">Precio (ARS)</label>
                    <input
                      type="number"
                      value={newProd.precio}
                      onChange={(e) => setNewProd({ ...newProd, precio: Number(e.target.value) })}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700">Stock Inicial</label>
                    <input
                      type="number"
                      value={newProd.stock}
                      onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700">Imagen del Producto</label>
                      <button
                        type="button"
                        onClick={() => newProdFileInputRef.current?.click()}
                        className="text-xs font-bold text-cyan-700 hover:text-cyan-900 bg-cyan-100/70 hover:bg-cyan-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Subir desde mi PC</span>
                      </button>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <input
                        value={newProd.img}
                        onChange={(e) => setNewProd({ ...newProd, img: e.target.value })}
                        placeholder="/images/rodillera.jpg o https://..."
                        className="flex-1 p-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => newProdFileInputRef.current?.click()}
                        className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Examinar PC</span>
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCreateNewProduct}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                >
                  Publicar en la Tienda
                </button>
              </div>

              {/* Products list */}
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {products.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={p.img} alt={p.nombre} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{p.nombre}</span>
                        <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>${p.precio.toLocaleString()}</span>
                          <span>•</span>
                          <span>Stock: {p.stock}</span>
                          {p.badge && <span className="bg-slate-100 px-1.5 py-0.2 rounded">{p.badge}</span>}
                        </div>
                      </div>
                    </div>

                    {p.id !== "faja-lumbar" && (
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="text-slate-400 hover:text-rose-600 p-2"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: GESTIÓN DE PEDIDOS (CRM) */}
          {/* ========================================================= */}
          {activeTab === "pedidos" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Historial de Pedidos ({orders.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pedidos registrados desde el checkout con datos de contacto y entrega.
                  </p>
                </div>

                <button
                  onClick={exportOrdersCSV}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">Aún no hay pedidos registrados.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Cuando un cliente complete el checkout, aparecerá aquí en tiempo real.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 font-mono text-sm">
                            {ord.trackingCode}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">
                            {new Date(ord.fecha).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-semibold text-slate-500">Estado:</label>
                          <select
                            value={ord.estado}
                            onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as any)}
                            className={`p-1.5 rounded-lg border font-bold text-xs ${
                              ord.estado === "Pendiente"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : ord.estado === "Confirmado"
                                ? "bg-cyan-50 text-cyan-800 border-cyan-300"
                                : ord.estado === "Despachado"
                                ? "bg-indigo-50 text-indigo-800 border-indigo-300"
                                : ord.estado === "Entregado"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="En preparación">En preparación</option>
                            <option value="Despachado">Despachado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer & address details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Destinatario</span>
                          <span className="font-bold text-slate-900">
                            {ord.cliente.nombre} {ord.cliente.apellido}
                          </span>
                          <div className="mt-1 text-slate-600">
                            <span>Tel: {ord.cliente.telefono}</span>
                            {ord.cliente.email && <span className="block">{ord.cliente.email}</span>}
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Dirección de Entrega</span>
                          <span className="font-medium text-slate-800">
                            {ord.cliente.calle} {ord.cliente.altura}
                            {ord.cliente.piso && ` (Piso ${ord.cliente.piso})`}
                            {ord.cliente.departamento && ` Dpto ${ord.cliente.departamento}`}
                          </span>
                          <div className="text-slate-500">
                            {ord.cliente.ciudad}, {ord.cliente.provincia} {ord.cliente.cp && `(CP ${ord.cliente.cp})`}
                          </div>
                          {ord.cliente.entreCalles && (
                            <div className="text-[11px] text-slate-500 italic mt-0.5">
                              Ref: {ord.cliente.entreCalles}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items and total */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                        <div>
                          <span className="text-slate-500 block">
                            Productos ({ord.items.length}):{" "}
                            {ord.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(", ")}
                          </span>
                          <span className="text-emerald-700 font-semibold text-[11px]">
                            Método: {ord.metodoPago.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <span className="text-slate-400 text-[10px] block">Total</span>
                            <span className="text-base font-black text-slate-900 font-['Space_Grotesk']">
                              ${ord.total.toLocaleString()}
                            </span>
                          </div>

                          {/* Direct WhatsApp button */}
                          <a
                            href={`https://wa.me/${ord.cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
                              `Hola ${ord.cliente.nombre}! Te escribimos de Lumbar Fix sobre tu pedido #${ord.trackingCode}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: PAGOS, MERCADO PAGO & CBU BANCARIO */}
          {/* ========================================================= */}
          {activeTab === "pagos" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Configuración de Cobros & Medios de Pago
                </h3>
                <p className="text-xs text-slate-500">
                  Configurá aquí tu cuenta de Mercado Pago para recibir el dinero de las ventas y tu CBU bancario para transferencias.
                </p>
              </div>

              {/* 1. Mercado Pago Configuration */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold text-sm">
                      MP
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Mercado Pago Oficial</h4>
                      <p className="text-slate-500 text-[11px]">
                        Cobrá con tarjetas de crédito, débito y dinero en cuenta directamente a tu bolsillo.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[11px] font-bold text-slate-700">Habilitar Mercado Pago</span>
                    <input
                      type="checkbox"
                      checked={contentForm.mercadopago?.activo ?? false}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          mercadopago: {
                            ...contentForm.mercadopago,
                            activo: e.target.checked,
                            accessToken: contentForm.mercadopago?.accessToken || "",
                            publicKey: contentForm.mercadopago?.publicKey || ""
                          }
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  {/* Status Indicator Banner */}
                  {contentForm.mercadopago?.accessToken ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-emerald-900 block">
                          Checkout Oficial de Mercado Pago Configurado
                        </span>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Tus clientes serán redirigidos a la pasarela oficial de Mercado Pago para pagar con su <b>dinero en cuenta</b> o <b>tarjetas guardadas</b> en su app.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-amber-900 block">
                          Ingresá tus Credenciales de Producción
                        </span>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Pegá tu <b>Access Token de Producción (APP_USR-...)</b> para activar los cobros reales a tu cuenta de Mercado Pago.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Access Token de Mercado Pago (Producción) *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={contentForm.mercadopago?.accessToken || ""}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            mercadopago: {
                              ...contentForm.mercadopago,
                              activo: true,
                              accessToken: e.target.value.trim(),
                              publicKey: contentForm.mercadopago?.publicKey || ""
                            }
                          })
                        }
                        placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? "Ocultar token" : "Mostrar token"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      El Access Token comienza con <code className="bg-slate-100 px-1 rounded text-slate-800 font-bold">APP_USR-</code>. Es la credencial privada que acredita los pagos en tu cuenta de Mercado Pago.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Public Key (Opcional)
                    </label>
                    <input
                      type="text"
                      value={contentForm.mercadopago?.publicKey || ""}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          mercadopago: {
                            ...contentForm.mercadopago,
                            activo: contentForm.mercadopago?.activo ?? true,
                            accessToken: contentForm.mercadopago?.accessToken || "",
                            publicKey: e.target.value.trim()
                          }
                        })
                      }
                      placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Test Connection Button & Feedback */}
                  <div className="pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestMpToken}
                        disabled={testingMpToken || !contentForm.mercadopago?.accessToken}
                        className="py-2 px-3.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testingMpToken ? "animate-spin" : ""}`} />
                        <span>{testingMpToken ? "Verificando con Mercado Pago..." : "Probar Credenciales con Mercado Pago"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveContent}
                        disabled={saving}
                        className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Configuración de Mercado Pago</span>
                      </button>
                    </div>

                    {mpTestResult && (
                      <div
                        className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                          mpTestResult.success
                            ? "bg-emerald-50 border-emerald-200 text-emerald-950 font-medium"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}
                      >
                        {mpTestResult.success ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <span>{mpTestResult.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Step by step guide */}
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2">
                    <span className="font-bold flex items-center gap-1.5 text-xs text-sky-900">
                      <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                      ¿Dónde encontrar tu Access Token en Mercado Pago?
                    </span>
                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-sky-900 leading-relaxed">
                      <li>
                        Iniciá sesión en{" "}
                        <a
                          href="https://www.mercadopago.com/developers"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline hover:text-sky-700"
                        >
                          mercadopago.com/developers
                        </a>
                      </li>
                      <li>Hacé clic en <b>"Tus integraciones"</b> (o "Mis aplicaciones") y seleccioná tu aplicación de venta.</li>
                      <li>En el menú de la izquierda, hacé clic en <b>"Credenciales de producción"</b>.</li>
                      <li>Copiá el <b>Access Token</b> (comienza con <code>APP_USR-</code>) y pegalo en el casillero de arriba.</li>
                      <li>Hacé clic en <b>"Probar Credenciales"</b> para comprobar la cuenta y luego en <b>"Guardar"</b>.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* 2. Bank Transfer / Deposit Details */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold text-sm">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Datos Bancarios para Transferencias (CBU / CVU / Alias)</h4>
                    <p className="text-slate-500 text-[11px]">
                      Estos datos se le muestran al comprador en pantalla y se le envían por WhatsApp para que te deposite con 10% OFF.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nombre del Banco o Billetera</label>
                    <input
                      type="text"
                      value={contentForm.datosBancarios?.banco || ""}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          datosBancarios: {
                            ...contentForm.datosBancarios!,
                            banco: e.target.value
                          }
                        })
                      }
                      placeholder="Ej: Mercado Pago / Banco Santander / BBVA / Galicia / Ualá"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nombre del Titular de la Cuenta</label>
                    <input
                      type="text"
                      value={contentForm.datosBancarios?.titular || ""}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          datosBancarios: {
                            ...contentForm.datosBancarios!,
                            titular: e.target.value
                          }
                        })
                      }
                      placeholder="Ej: JUAN PEREZ o TU EMPRESA S.A."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">CBU o CVU (22 dígitos)</label>
                    <input
                      type="text"
                      value={contentForm.datosBancarios?.cbu || ""}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          datosBancarios: {
                            ...contentForm.datosBancarios!,
                            cbu: e.target.value.trim()
                          }
                        })
                      }
                      placeholder="0000003100012345678901"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Alias Bancario</label>
                    <input
                      type="text"
                      value={contentForm.datosBancarios?.alias || ""}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          datosBancarios: {
                            ...contentForm.datosBancarios!,
                            alias: e.target.value.trim().toUpperCase()
                          }
                        })
                      }
                      placeholder="LUMBARFIX.PAGOS"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-cyan-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">CUIT / CUIL del Titular</label>
                    <input
                      type="text"
                      value={contentForm.datosBancarios?.cuit || ""}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          datosBancarios: {
                            ...contentForm.datosBancarios!,
                            cuit: e.target.value.trim()
                          }
                        })
                      }
                      placeholder="20-38492819-4"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Instrucciones Adicionales para el Cliente</label>
                    <textarea
                      rows={2}
                      value={contentForm.datosBancarios?.instrucciones || ""}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          datosBancarios: {
                            ...contentForm.datosBancarios!,
                            instrucciones: e.target.value
                          }
                        })
                      }
                      placeholder="Ej: Transferí el monto exacto con el 10% de descuento y enviá el comprobante con tu número de pedido por WhatsApp."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveContent}
                  disabled={saving}
                  className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Datos Bancarios</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: META ADS, FACEBOOK PIXEL & CAPI */}
          {/* ========================================================= */}
          {activeTab === "meta" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Meta Ads, Pixel de Facebook & Conversiones CAPI
                </h3>
                <p className="text-xs text-slate-500">
                  Rastrea en tiempo real el comportamiento de tus visitantes para crear públicos personalizados y medir el ROI de tus campañas en Instagram y Facebook.
                </p>
              </div>

              {/* Status Banner */}
              {contentForm.metaPixel?.pixelId ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-emerald-950">
                        Meta Pixel Activo: ID {contentForm.metaPixel.pixelId}
                      </span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                        Rastreando en vivo
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      El pixel y los eventos de comercio electrónico (PageView, ViewContent, AddToCart, InitiateCheckout, Lead, Purchase y Contact) están activos en toda la tienda.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-blue-950 block">
                      Vinculá tu Pixel de Facebook / Meta Ads
                    </span>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Ingresá tu <b>Pixel ID</b> a continuación para habilitar automáticamente el seguimiento de campañas y ventas para Meta Ads.
                    </p>
                  </div>
                </div>
              )}

              {/* Configuration Form Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Configuración del Pixel y CAPI</h4>
                      <p className="text-slate-500 text-[11px]">
                        Conecta el navegador de tus clientes y el servidor de Lumbar Fix con Meta.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-[11px] font-semibold text-slate-600">Rastreo Habilitado</span>
                    <input
                      type="checkbox"
                      checked={contentForm.metaPixel?.activo !== false}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          metaPixel: {
                            activo: e.target.checked,
                            pixelId: contentForm.metaPixel?.pixelId || "",
                            conversionApiToken: contentForm.metaPixel?.conversionApiToken || "",
                            testEventCode: contentForm.metaPixel?.testEventCode || ""
                          }
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  {/* Pixel ID */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Meta Pixel ID (Identificador del Pixel) *
                    </label>
                    <input
                      type="text"
                      value={contentForm.metaPixel?.pixelId || ""}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          metaPixel: {
                            activo: contentForm.metaPixel?.activo !== false,
                            pixelId: e.target.value.trim(),
                            conversionApiToken: contentForm.metaPixel?.conversionApiToken || "",
                            testEventCode: contentForm.metaPixel?.testEventCode || ""
                          }
                        })
                      }
                      placeholder="Ej: 123456789012345"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Código numérico de 15 a 16 dígitos obtenido en tu <b>Administrador de Eventos de Meta</b>.
                    </p>
                  </div>

                  {/* Conversions API (CAPI) Token */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 block">
                        Token de API de Conversiones (CAPI) (Recomendado)
                      </label>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                        Anti Ad-Blocker
                      </span>
                    </div>
                    <input
                      type="password"
                      value={contentForm.metaPixel?.conversionApiToken || ""}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          metaPixel: {
                            activo: contentForm.metaPixel?.activo !== false,
                            conversionApiToken: e.target.value.trim(),
                            pixelId: contentForm.metaPixel?.pixelId || "",
                            testEventCode: contentForm.metaPixel?.testEventCode || ""
                          }
                        })
                      }
                      placeholder="EAAG... (Token de acceso generado en Meta)"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Permite enviar los eventos de <b>Purchase (Compra)</b> y <b>Lead</b> directamente desde el servidor backend. Esto garantiza 100% de precisión de medición incluso si el comprador usa Safari con bloqueo de cookies o AdBlock.
                    </p>
                  </div>

                  {/* Test Event Code */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Código de Evento de Prueba (Test Event Code - Opcional)
                    </label>
                    <input
                      type="text"
                      value={contentForm.metaPixel?.testEventCode || ""}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          metaPixel: {
                            activo: contentForm.metaPixel?.activo !== false,
                            testEventCode: e.target.value.trim(),
                            pixelId: contentForm.metaPixel?.pixelId || "",
                            conversionApiToken: contentForm.metaPixel?.conversionApiToken || ""
                          }
                        })
                      }
                      placeholder="Ej: TEST12345"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Se encuentra en el Administrador de Eventos de Meta &gt; pestaña <b>"Probar eventos"</b>. Sirve para ver los eventos reflejados de inmediato en pantalla.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestMetaPixel}
                      disabled={testingMetaPixel || !contentForm.metaPixel?.pixelId}
                      className="py-2.5 px-4 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingMetaPixel ? "animate-spin" : ""}`} />
                      <span>{testingMetaPixel ? "Enviando evento de prueba..." : "Enviar Evento de Prueba (Test Lead / PageView)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveMetaPixel}
                      disabled={saving}
                      className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Configuración de Meta Ads</span>
                    </button>
                  </div>

                  {/* Test Feedback Notice */}
                  {metaTestFeedback && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 animate-fadeIn ${
                        metaTestFeedback.success
                          ? "bg-emerald-50 border-emerald-200 text-emerald-950 font-medium"
                          : "bg-rose-50 border-rose-200 text-rose-800"
                      }`}
                    >
                      {metaTestFeedback.success ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p>{metaTestFeedback.msg}</p>
                        {metaTestFeedback.details?.capiResult && (
                          <pre className="mt-2 p-2 bg-slate-900 text-slate-200 rounded text-[10px] overflow-x-auto">
                            {JSON.stringify(metaTestFeedback.details.capiResult, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Coverage Map */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Eventos Estándar Mapeados e Integrados en Lumbar Fix
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Todos estos eventos se disparan automáticamente en las interacciones clave de la tienda:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-700">PageView</span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Navegación</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Se emite al ingresar a cualquier página o recargar la tienda.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-700">ViewContent</span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Producto</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Se emite cuando el usuario visualiza el producto Faja Lumbar y sus detalles.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-700">AddToCart</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Intención</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Se emite al hacer clic en "Añadir al Carrito" o seleccionar cualquier pack promocional.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-700">InitiateCheckout</span>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Checkout</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Se emite cuando el usuario abre el modal de finalizar compra con sus productos.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-700">AddPaymentInfo</span>
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Método Pago</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Se emite cuando el usuario escoge entre Mercado Pago, Contra Entrega o Transferencia.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-700">Lead</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Contacto</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Se emite cuando el cliente envía el formulario con sus datos de contacto y entrega.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-800">Purchase (Compra)</span>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">Pixel + CAPI</span>
                    </div>
                    <p className="text-emerald-900 text-[11px]">
                      Se emite al confirmar la orden. Incluye valor monetario exacto en ARS, moneda y código de pedido.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-700">Contact</span>
                      <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">WhatsApp</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Se emite cuando el visitante abre una consulta por el botón flotante de WhatsApp.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-2.5 text-xs">
                <span className="font-bold flex items-center gap-1.5 text-xs text-blue-900">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  Guía rápida para vincular y verificar tu Pixel en Meta Ads
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-blue-900 leading-relaxed">
                  <li>
                    Ingresá a tu{" "}
                    <a
                      href="https://business.facebook.com/events_manager2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline hover:text-blue-700"
                    >
                      Administrador de Eventos de Meta (Events Manager)
                    </a>.
                  </li>
                  <li>
                    En el menú lateral hacé clic en <b>"Orígenes de datos"</b> y seleccioná o creá tu Pixel / Conjunto de datos.
                  </li>
                  <li>
                    Copiá el <b>Identificador (Pixel ID)</b> numérico y pegalo en el campo <i>Meta Pixel ID</i> arriba.
                  </li>
                  <li>
                    Para habilitar la <b>API de Conversiones</b> (servidor): Ve a <b>Configuración &gt; API de Conversiones &gt; Generar token de acceso</b>, cópialo y pégalo en el campo <i>Token CAPI</i>.
                  </li>
                  <li>
                    Hacé clic en <b>"Guardar Configuración de Meta Ads"</b> y luego en <b>"Enviar Evento de Prueba"</b> para comprobar la recepción instantánea.
                  </li>
                  <li>
                    <i>Tip:</i> Podés instalar la extensión gratuita <b>Meta Pixel Helper</b> para Google Chrome para ver cómo se activan los eventos mientras navegás por tu tienda.
                  </li>
                </ol>
              </div>

              {/* Live Session Event Log */}
              <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold font-mono text-xs">Monitor de Eventos Disparados en esta Sesión</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMetaDiagnostics(getPixelDiagnostics())}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Actualizar</span>
                  </button>
                </div>

                {metaDiagnostics.recentEvents.length === 0 ? (
                  <p className="text-slate-400 text-[11px] py-2">
                    No se han registrado eventos en esta pestaña aún. Navega por la tienda o pulsa "Enviar Evento de Prueba".
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                    {metaDiagnostics.recentEvents.map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-bold">{ev.eventName}</span>
                          {ev.params?.orderId && (
                            <span className="text-emerald-400 text-[10px]">#{ev.params.orderId}</span>
                          )}
                          {ev.params?.value !== undefined && (
                            <span className="text-amber-300 text-[10px]">${ev.params.value} {ev.params.currency || "ARS"}</span>
                          )}
                        </div>
                        <span className="text-slate-500 text-[10px]">{ev.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: AJUSTES & SEGURIDAD */}
          {/* ========================================================= */}
          {activeTab === "ajustes" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-600" />
                  Seguridad y Ajustes de la Tienda
                </h3>
                <p className="text-xs text-slate-500">
                  Cambiá tu contraseña de administrador y configurá tus canales de atención.
                </p>
              </div>

              {/* Password & Security Change */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Cambiar Usuario y Contraseña de Administrador</h4>
                    <p className="text-slate-500 text-[11px]">
                      Asegurá tu tienda para que solo vos puedas modificar precios, productos y configuraciones.
                    </p>
                  </div>
                </div>

                {passStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      passStatus.type === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                  >
                    {passStatus.type === "success" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{passStatus.msg}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Contraseña Actual *
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Nombre de Usuario de Administrador
                      </label>
                      <input
                        type="text"
                        required
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Nueva Contraseña *
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingresá tu nueva contraseña segura"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={changingPass}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    <span>{changingPass ? "Actualizando..." : "Guardar Nueva Contraseña"}</span>
                  </button>
                </form>
              </div>

              {/* Channels & WhatsApp */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider">
                  Canales de Contacto
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600">Teléfono WhatsApp de la Tienda</label>
                    <input
                      value={contentForm.contacto.whatsapp}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          contacto: { ...contentForm.contacto, whatsapp: e.target.value }
                        })
                      }
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600">Email de Soporte</label>
                    <input
                      value={contentForm.contacto.emailSoporte}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          contacto: { ...contentForm.contacto, emailSoporte: e.target.value }
                        })
                      }
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600">Instagram URL</label>
                    <input
                      value={contentForm.contacto.instagram}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          contacto: { ...contentForm.contacto, instagram: e.target.value }
                        })
                      }
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600">Facebook URL</label>
                    <input
                      value={contentForm.contacto.facebook}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          contacto: { ...contentForm.contacto, facebook: e.target.value }
                        })
                      }
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveContent}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Guardar Canales
                </button>
              </div>

              {/* Backend Server Configuration (Render & ISAMER OS) */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Conexión con Servidor Backend & ISAMER OS</h4>
                    <p className="text-slate-500 text-[11px]">
                      Configuración de la URL de tu API en la nube (Render) y sincronización de pedidos con ISAMER OS.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      URL Personalizada del Backend (Render / Producción)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={customBackendUrl}
                        onChange={(e) => setCustomBackendUrl(e.target.value)}
                        placeholder="Dejá vacío para usar rutas locales automáticas o pegá tu URL de Render"
                        className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSaveBackendUrl}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                      >
                        Guardar URL
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      URL actualmente en uso: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono font-bold">{API_URL || "(Rutas relativas automáticas / local)"}</code>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={testingConnection}
                      onClick={handleTestConnection}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? "animate-spin" : ""}`} />
                      <span>{testingConnection ? "Probando..." : "Comprobar Conexión con Servidor"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetBackendUrl}
                      className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Restablecer a Modo Local
                    </button>
                  </div>

                  {connectionResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        connectionResult.ok
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                      }`}
                    >
                      {connectionResult.ok ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <span>{connectionResult.msg}</span>
                    </div>
                  )}

                  {/* ISAMER Webhook Info Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-cyan-600" />
                        Webhook ISAMER OS (Lumbar Fix Orders):
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Activo</span>
                    </div>
                    <code className="text-[10px] block font-mono text-cyan-800 break-all bg-white p-2 rounded border border-slate-200">
                      https://isamerbblumbar.onrender.com/api/webhooks/lumbarfix-orders
                    </code>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Cada vez que un cliente confirma un pedido, se envía automáticamente al sistema ISAMER OS con cabeceras <code className="bg-slate-100 px-1 py-0.2 rounded font-mono">X-Store-Origin: lumbarfix-web</code> para sincronizar stock y despachos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reset Defaults */}
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
                <h4 className="font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Restaurar Datos de Fábrica
                </h4>
                <p className="text-rose-700 leading-relaxed">
                  Si hiciste cambios y querés volver a la configuración original de Lumbar Fix, podés restaurar la base de datos por defecto.
                </p>
                <button
                  onClick={async () => {
                    if (confirm("¿Estás seguro de restaurar los datos por defecto?")) {
                      await onResetDefaults();
                      onClose();
                    }
                  }}
                  className="mt-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                >
                  Restaurar a Valores Iniciales
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Persistent Bottom Action Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-start">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sincronización en tiempo real</span>
            </span>
            {saving && (
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded animate-pulse">
                Guardando en base de datos...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
            >
              Cerrar Panel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-bold text-xs items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all hidden sm:inline-flex"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar sin Salir</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "GUARDANDO..." : "GUARDAR Y VER EN LA TIENDA"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
