export interface Product {
  id: string;
  nombre: string;
  precio: number;
  precioAnterior?: number;
  stock: number;
  img: string;
  galeria?: string[];
  descripcion?: string;
  activo: boolean;
  badge?: string;
  caracteristicas?: string[];
}

export interface BundleOption {
  id: string;
  nombre: string;
  subtitulo: string;
  itemsTexto: string;
  precio: number;
  precioAnterior?: number;
  descuentoTexto?: string;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  imagen: string;
  ahorroMonto?: number;
  cantidadUnidades: number;
}

export interface Testimonio {
  id: string;
  autor: string;
  rating: number;
  ciudad: string;
  comentario: string;
  fecha: string;
  verificado: boolean;
  foto?: string;
}

export interface FAQItem {
  id: string;
  pregunta: string;
  respuesta: string;
}

export interface ComparisonRow {
  caracteristica: string;
  lumbarFix: boolean | string;
  fajaTradicional: boolean | string;
  analgesicos: boolean | string;
}

export interface SiteContent {
  announcementBar: string;
  heroHeadline: string;
  heroSubheadline: string;
  ratingScore: number;
  ratingCount: number;
  stockRestante: number;
  stockTotal: number;
  ofertaExpiraMinutos: number;
  bulletsPromesa: string[];
  problema: {
    badge: string;
    titulo: string;
    items: string[];
    resumen: string;
  };
  agitacion: {
    titulo: string;
    parrafo1: string;
    parrafo2: string;
    alerta: string;
  };
  solucion: {
    badge: string;
    titulo: string;
    descripcion: string;
    pilares: {
      titulo: string;
      desc: string;
      icono: string;
    }[];
  };
  packHero: {
    badge: string;
    titulo: string;
    subtitulo: string;
    items: string[];
    precioAntes: number;
    precioAhora: number;
    ahorro: string;
    imagen: string;
  };
  beneficios: string[];
  comparativa: ComparisonRow[];
  testimonios: Testimonio[];
  faqs: FAQItem[];
  contacto: {
    whatsapp: string;
    mensajeWhatsApp: string;
    instagram: string;
    facebook: string;
    emailSoporte: string;
  };
  datosBancarios: {
    banco: string;
    titular: string;
    cuit: string;
    cbu: string;
    alias: string;
    instrucciones: string;
  };
  mercadopago: {
    activo: boolean;
    accessToken?: string;
    publicKey?: string;
  };
  garantiaDias: number;
}

export interface CartItem {
  id: string;
  productId?: string;
  bundleId?: string;
  nombre: string;
  precio: number;
  precioAnterior?: number;
  cantidad: number;
  img: string;
  detalle?: string;
}

export interface CustomerData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  provincia: string;
  ciudad: string;
  calle: string;
  altura: string;
  piso?: string;
  departamento?: string;
  cp: string;
  entreCalles?: string;
  referencia?: string;
}

export interface Order {
  id: string;
  trackingCode: string;
  items: CartItem[];
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  cliente: CustomerData;
  metodoPago: 'contraentrega' | 'mercadopago' | 'transferencia' | 'whatsapp';
  estado: 'Pendiente' | 'Confirmado' | 'En preparación' | 'Despachado' | 'Entregado' | 'Cancelado';
  fecha: string;
  notasAdmin?: string;
}
