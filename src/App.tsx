import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ProductHero } from "./components/ProductHero";
import { ProblemAgitation } from "./components/ProblemAgitation";
import { SolutionSection } from "./components/SolutionSection";
import { PackOfferSection } from "./components/PackOfferSection";
import { BeforeAfterSection } from "./components/BeforeAfterSection";
import { ComparisonTable } from "./components/ComparisonTable";
import { OtherProductsGrid } from "./components/OtherProductsGrid";
import { CustomerReviews } from "./components/CustomerReviews";
import { FAQSection } from "./components/FAQSection";
import { Footer } from "./components/Footer";
import { StickyBuyBar } from "./components/StickyBuyBar";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { OrderConfirmationModal } from "./components/OrderConfirmationModal";
import { AdminModal } from "./components/AdminModal";
import { AdminLoginModal } from "./components/AdminLoginModal";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";

import { Product, BundleOption, SiteContent, Order, CartItem } from "./types";

export default function App() {
  // Data states from backend
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<BundleOption[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart & UI modal states
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("lumbarfix_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("lumbarfix_admin_token");
    } catch {
      return null;
    }
  });
  const [adminUsername, setAdminUsername] = useState<string>(() => {
    try {
      return localStorage.getItem("lumbarfix_admin_user") || "admin";
    } catch {
      return "admin";
    }
  });
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem("lumbarfix_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Initial fetch from backend
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("lumbarfix_admin_token") || "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const [prodsRes, bundlesRes, contentRes, ordersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/bundles"),
        fetch("/api/site-content"),
        fetch("/api/orders", { headers })
      ]);

      const [prodsData, bundlesData, contentData, ordersData] = await Promise.all([
        prodsRes.json().catch(() => ({ success: false })),
        bundlesRes.json().catch(() => ({ success: false })),
        contentRes.json().catch(() => ({ success: false })),
        ordersRes.json().catch(() => ({ success: false }))
      ]);

      if (prodsData.success && prodsData.products) setProducts(prodsData.products);
      if (bundlesData.success && bundlesData.bundles) setBundles(bundlesData.bundles);
      if (contentData.success) {
        const content = contentData.siteContent || contentData.data;
        if (content) setSiteContent(content);
      }
      if (ordersData.success && ordersData.orders) setOrders(ordersData.orders);
    } catch (error) {
      console.error("Error fetching initial data from backend:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Main product (default: faja-lumbar)
  const mainProduct = products.find((p) => p.id === "faja-lumbar") || products[0];
  const packBundle = bundles.find((b) => b.id === "bundle-pack") || bundles[2] || bundles[0];

  // Cart actions
  const handleAddToCart = (itemOrBundle: Product | BundleOption) => {
    setCart((prev) => {
      const isBundle = "itemsTexto" in itemOrBundle;
      const itemId = itemOrBundle.id;
      const existing = prev.find((i) => i.id === itemId);

      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }

      const newItem: CartItem = {
        id: itemOrBundle.id,
        nombre: itemOrBundle.nombre,
        precio: itemOrBundle.precio,
        cantidad: 1,
        img: ("imagen" in itemOrBundle && itemOrBundle.imagen) ? itemOrBundle.imagen : (itemOrBundle as Product).img || "/images/fajalumbar.jpg",
        detalle: isBundle ? (itemOrBundle as BundleOption).itemsTexto : (itemOrBundle as Product).descripcion
      };

      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  // Direct buy action (Instant Checkout)
  const handleDirectBuy = (bundle: BundleOption) => {
    // Add to cart and directly show checkout modal
    setCart((prev) => {
      const existing = prev.find((i) => i.id === bundle.id);
      if (existing) {
        return prev;
      }
      return [
        ...prev,
        {
          id: bundle.id,
          nombre: bundle.nombre,
          precio: bundle.precio,
          cantidad: 1,
          img: bundle.imagen || mainProduct?.img || "/images/fajalumbar.jpg",
          detalle: bundle.itemsTexto
        }
      ];
    });

    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order placed
  const handleOrderPlaced = (order: Order) => {
    setConfirmedOrder(order);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCart([]);
    // Refresh orders list
    setOrders((prev) => [order, ...prev]);
  };

  const scrollToProduct = () => {
    const el = document.getElementById("producto");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Authentication & Admin Access Control
  const handleOpenAdmin = () => {
    if (adminToken) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = async (token: string, username: string) => {
    setAdminToken(token);
    setAdminUsername(username);
    setIsAdminLoginOpen(false);
    setIsAdminOpen(true);
    // Refresh orders and store content with admin permissions
    try {
      const res = await fetch("/api/orders", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => null);
      if (data && data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.warn("Could not fetch orders on login:", e);
    }
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem("lumbarfix_admin_token");
      localStorage.removeItem("lumbarfix_admin_user");
    } catch {}
    setAdminToken(null);
    setIsAdminOpen(false);
  };

  const getAdminHeaders = () => {
    const token = adminToken || localStorage.getItem("lumbarfix_admin_token") || "";
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // Safe fetch helper for mutations
  const safeAdminFetch = async (url: string, options: RequestInit) => {
    const res = await fetch(url, options);
    const rawText = await res.text();
    let data: any = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      console.error("Non-JSON response from:", url, rawText);
    }
    return { ok: res.ok, status: res.status, data };
  };

  // Backend mutations from Admin Modal (protected with Admin Token)
  const handleUpdateProduct = async (updatedProduct: Product) => {
    const { data } = await safeAdminFetch(`/api/products/${updatedProduct.id}`, {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify(updatedProduct)
    });
    if (data && data.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? data.product : p))
      );
    }
  };

  const handleUpdateBundles = async (updatedBundles: BundleOption[]) => {
    const { data } = await safeAdminFetch("/api/bundles", {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify(updatedBundles)
    });
    if (data && data.success) {
      setBundles(data.bundles);
    }
  };

  const handleUpdateSiteContent = async (updatedContent: SiteContent) => {
    const { data } = await safeAdminFetch("/api/site-content", {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify(updatedContent)
    });
    if (data && data.success) {
      setSiteContent(data.siteContent);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order["estado"]) => {
    const { data } = await safeAdminFetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify({ estado: status })
    });
    if (data && data.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.order : o))
      );
    }
  };

  const handleCreateProduct = async (newProd: Partial<Product>) => {
    const { data } = await safeAdminFetch("/api/products", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(newProd)
    });
    if (data && data.success) {
      setProducts((prev) => [...prev, data.product]);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    const { data } = await safeAdminFetch(`/api/products/${prodId}`, {
      method: "DELETE",
      headers: getAdminHeaders()
    });
    if (data && data.success) {
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
    }
  };

  const handleResetDefaults = async () => {
    const { data } = await safeAdminFetch("/api/reset-demo-data", {
      method: "POST",
      headers: getAdminHeaders()
    });
    if (data && data.success) {
      await fetchData();
    }
  };

  if (loading || !mainProduct || !siteContent) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-sm tracking-wider font-['Space_Grotesk'] text-slate-300">
          CARGANDO TIENDA LUMBAR FIX...
        </p>
      </div>
    );
  }

  const totalCartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-200 selection:text-cyan-950">
      {/* 1. Header Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        siteContent={siteContent}
      />

      {/* 2. Main Hero Section (Shopify Shrine / Lymphori Dental exact structure) */}
      <main className="flex-1">
        <ProductHero
          product={mainProduct}
          bundles={bundles}
          siteContent={siteContent}
          onDirectBuy={handleDirectBuy}
          onAddToCart={handleAddToCart}
        />

        {/* 3. Problem & Agitation Section (Directly from lumbarfix.vercel.app) */}
        <ProblemAgitation
          siteContent={siteContent}
          onScrollToProduct={scrollToProduct}
        />

        {/* 4. Solution & Ergonomic Decompression Principles */}
        <SolutionSection
          siteContent={siteContent}
          onScrollToProduct={scrollToProduct}
        />

        {/* 5. Recommended Pack Offer (Lumbar Fix + Rodillera + Tobillera + Foam Roller) */}
        {packBundle && (
          <PackOfferSection
            siteContent={siteContent}
            packBundle={packBundle}
            onSelectPack={handleDirectBuy}
          />
        )}

        {/* 6. Real Photographic Evidence: Before & After */}
        <BeforeAfterSection />

        {/* 7. Comparison Table: Lumbar Fix vs Fajas comunes vs Pastillas */}
        <ComparisonTable
          siteContent={siteContent}
          onScrollToProduct={scrollToProduct}
        />

        {/* 8. Additional Accessories / Catalog */}
        <OtherProductsGrid
          products={products}
          onAddToCart={handleAddToCart}
        />

        {/* 9. Verified Customer Reviews */}
        <CustomerReviews siteContent={siteContent} />

        {/* 10. Frequently Asked Questions (Accordion) */}
        <FAQSection siteContent={siteContent} />
      </main>

      {/* 11. Footer */}
      <Footer
        siteContent={siteContent}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 12. Floating Sticky Elements */}
      <StickyBuyBar
        product={mainProduct}
        selectedBundle={bundles[0]}
        onDirectBuy={() => handleDirectBuy(bundles[0])}
      />

      <FloatingWhatsApp siteContent={siteContent} />

      {/* 13. Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* 14. Full Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        siteContent={siteContent}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* 15. Order Confirmation & Tracking Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

      {/* 16. Admin Login Gate Modal (Password Protection) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* 17. Admin CMS & Store Manager Modal (Accessible ONLY when authenticated) */}
      {isAdminOpen && adminToken && (
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          product={mainProduct}
          bundles={bundles}
          products={products}
          siteContent={siteContent}
          orders={orders}
          adminToken={adminToken}
          adminUsername={adminUsername}
          onLogout={handleAdminLogout}
          onUpdateProduct={handleUpdateProduct}
          onUpdateBundles={handleUpdateBundles}
          onUpdateSiteContent={handleUpdateSiteContent}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onCreateProduct={handleCreateProduct}
          onDeleteProduct={handleDeleteProduct}
          onResetDefaults={handleResetDefaults}
        />
      )}
    </div>
  );
}
