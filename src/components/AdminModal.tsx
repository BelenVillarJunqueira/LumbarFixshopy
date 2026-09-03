import React, { useState } from "react";
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
  EyeOff
} from "lucide-react";
import { Product, SiteContent, Order, BundleOption } from "../types";

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
  const [activeTab, setActiveTab] = useState<"producto" | "landing" | "catalogo" | "pedidos" | "pagos" | "ajustes">("producto");

  // Local editing states
  const [prodForm, setProdForm] = useState<Product>({ ...product });
  const [bundlesForm, setBundlesForm] = useState<BundleOption[]>([...bundles]);
  const [contentForm, setContentForm] = useState<SiteContent>({
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
    }
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      setTimeout(() => setSaveSuccess(false), 3000);
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
      await onUpdateSiteContent(contentForm);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
      const res = await fetch("/api/admin/change-credentials", {
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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[92vh]">
        {/* Top Navbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Space_Grotesk'] flex items-center gap-2">
                Panel de Control & CMS Lumbar Fix
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                  SESIÓN: {adminUsername || "admin"}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Modificá productos, precios, cobros de Mercado Pago, CBU bancario y administrá tus ventas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-100 overflow-x-auto px-4 gap-2 pt-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("producto")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "producto"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Producto & Packs</span>
          </button>

          <button
            onClick={() => setActiveTab("pagos")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "pagos"
                ? "bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Pagos, Mercado Pago & CBU</span>
          </button>

          <button
            onClick={() => setActiveTab("pedidos")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "pedidos"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs"
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
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "landing"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Textos, FAQs & Opiniones</span>
          </button>

          <button
            onClick={() => setActiveTab("catalogo")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "catalogo"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Catálogo ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ajustes")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === "ajustes"
                ? "bg-white text-cyan-700 border-t-2 border-cyan-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Ajustes & Contraseña</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¡Cambios guardados con éxito en la base de datos del backend!</span>
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
                  <label className="text-xs font-bold text-slate-700">URL Imagen Principal</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      value={prodForm.img}
                      onChange={(e) => setProdForm({ ...prodForm, img: e.target.value })}
                      placeholder="/images/fajalumbar.jpg o https://..."
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={prodForm.img} alt="preview" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="text-slate-500">Imágenes rápidas disponibles:</span>
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
                    <label className="font-semibold text-slate-700">URL Imagen</label>
                    <input
                      value={newProd.img}
                      onChange={(e) => setNewProd({ ...newProd, img: e.target.value })}
                      placeholder="/images/rodillera.jpg"
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white"
                    />
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

                <div className="space-y-3">
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
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      El Access Token comienza con <code className="bg-slate-100 px-1 rounded text-slate-800 font-bold">APP_USR-</code>. Es la llave que le permite a Mercado Pago acreditarte el dinero en tu cuenta bancaria.
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

                  {/* Step by step guide */}
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2">
                    <span className="font-bold flex items-center gap-1.5 text-xs text-sky-900">
                      <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                      ¿Cómo obtener tu Access Token para cobrar el dinero real?
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-sky-900 leading-relaxed">
                      <li>
                        Ingresá a tu cuenta en{" "}
                        <a
                          href="https://www.mercadopago.com/developers"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline hover:text-sky-700"
                        >
                          mercadopago.com/developers
                        </a>
                      </li>
                      <li>Hacé clic en <b>"Tus integraciones"</b> (arriba a la derecha) y seleccioná o creá tu aplicación (ej: <i>Lumbar Fix</i>).</li>
                      <li>En el menú lateral, seleccioná <b>"Credenciales de producción"</b>.</li>
                      <li>Copiá el <b>Access Token</b> (comienza con <code>APP_USR-</code>) y pegalo en el casillero de arriba.</li>
                      <li>Hacé clic en el botón <b>"Guardar Configuración de Mercado Pago"</b> aquí abajo.</li>
                    </ol>
                  </div>

                  <button
                    onClick={handleSaveContent}
                    disabled={saving}
                    className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Configuración de Mercado Pago</span>
                  </button>
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
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Guardar Canales
                </button>
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
      </div>
    </div>
  );
};
