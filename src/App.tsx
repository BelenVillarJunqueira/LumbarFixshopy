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
      const [prodsRes, bundlesRes, contentRes, ordersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/bundles"),
        fetch("/api/site-content"),
        fetch("/api/orders")
      ]);

      const [prodsData, bundlesData, contentData, ordersData] = await Promise.all([
        prodsRes.json(),
        bundlesRes.json(),
        contentRes.json(),
        ordersRes.json()
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

  // Backend mutations from Admin Modal
  const handleUpdateProduct = async (updatedProduct: Product) => {
    const res = await fetch(`/api/products/${updatedProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct)
    });
    const data = await res.json();
    if (data.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? data.product : p))
      );
    }
  };

  const handleUpdateBundles = async (updatedBundles: BundleOption[]) => {
    const res = await fetch("/api/bundles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBundles)
    });
    const data = await res.json();
    if (data.success) {
      setBundles(data.bundles);
    }
  };

  const handleUpdateSiteContent = async (updatedContent: SiteContent) => {
    const res = await fetch("/api/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedContent)
    });
    const data = await res.json();
    if (data.success) {
      setSiteContent(data.siteContent);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order["estado"]) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: status })
    });
    const data = await res.json();
    if (data.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data.order : o))
      );
    }
  };

  const handleCreateProduct = async (newProd: Partial<Product>) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProd)
    });
    const data = await res.json();
    if (data.success) {
      setProducts((prev) => [...prev, data.product]);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    const res = await fetch(`/api/products/${prodId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (data.success) {
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
    }
  };

  const handleResetDefaults = async () => {
    const res = await fetch("/api/reset-demo-data", { method: "POST" });
    const data = await res.json();
    if (data.success) {
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
        onOpenAdmin={() => setIsAdminOpen(true)}
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
        onOpenAdmin={() => setIsAdminOpen(true)}
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
        onOrderPlaced={handleOrderPlaced}
      />

      {/* 15. Order Confirmation & Tracking Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

      {/* 16. Admin CMS & Store Manager Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        product={mainProduct}
        bundles={bundles}
        products={products}
        siteContent={siteContent}
        orders={orders}
        onUpdateProduct={handleUpdateProduct}
        onUpdateBundles={handleUpdateBundles}
        onUpdateSiteContent={handleUpdateSiteContent}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onCreateProduct={handleCreateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
