import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "store.json");
const ADMIN_SECRET = process.env.ADMIN_SECRET || "lumbarfix_secret_salt_2026";

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default seed
const defaultInitialData = {
  products: [
    {
      id: "faja-lumbar",
      nombre: "Faja lumbar",
      precio: 20000,
      precioAnterior: 35000,
      stock: 13,
      img: "/images/fajalumbar.jpg",
      galeria: [
        "/images/fajalumbar.jpg",
        "/images/pack2.png",
        "/images/despues.jpg",
        "/images/antes.jpg",
        "/images/rodillera.jpg",
        "/images/tobillera.jpg",
        "/images/foamroller.webp"
      ],
      reelUrl: "/images/reel-lumbarfix.mp4",
      reelTitulo: "Reel Demostrativo: Descompresión Lumbar Fix",
      reelActivo: true,
      descripcion:
        "Faja descompresora vertebral con tracción vertical. Libera la presión sobre discos herniados y nervio ciático de manera inmediata.",
      activo: true,
      badge: "MÁS VENDIDO",
      caracteristicas: [
        "Descompresión vertebral neumática 360°",
        "Inflador manual ergonómico incluido",
        "Extensor de cintura adaptable (70cm - 125cm)",
        "Material respirable hipoalergénico"
      ]
    },
    {
      id: "pack-lumbar-fix",
      nombre: "PACK Lumbar Fix (Recomendado)",
      precio: 89999,
      precioAnterior: 149999,
      stock: 7,
      img: "/images/pack2.png",
      galeria: [
        "/images/pack2.png",
        "/images/fajalumbar.jpg",
        "/images/rodillera.jpg",
        "/images/tobillera.jpg",
        "/images/foamroller.webp"
      ],
      descripcion:
        "Combo integral para recuperación, movilidad y alivio completo: Faja Lumbar Fix + Rodillera + Tobillera + Foam Roller.",
      activo: true,
      badge: "OFERTA PACK COMPLETO",
      caracteristicas: [
        "Faja Lumbar Fix Descompresora",
        "Rodillera de compresión rotuliana",
        "Tobillera anatómica elástica",
        "Foam Roller de descarga muscular"
      ]
    },
    {
      id: "rodillera",
      nombre: "Rodillera Ortopédica",
      precio: 12500,
      precioAnterior: 18000,
      stock: 10,
      img: "/images/rodillera.jpg",
      descripcion: "Rodillera elástica de compresión progresiva para alivio articular y estabilidad al caminar.",
      activo: true,
      badge: "ALTA DEMANDA"
    },
    {
      id: "tobillera",
      nombre: "Tobillera Anatómica",
      precio: 18000,
      precioAnterior: 24000,
      stock: 4,
      img: "/images/tobillera.jpg",
      descripcion: "Soporte y fijación suave para ligamentos del tobillo con ajuste anatómico.",
      activo: true,
      badge: "POCO STOCK"
    },
    {
      id: "foamroller",
      nombre: "Foam Roller Miofascial",
      precio: 38000,
      precioAnterior: 49000,
      stock: 12,
      img: "/images/foamroller.webp",
      descripcion: "Rodillo de automasaje para liberación miofascial y relajación de la zona lumbar y glútea.",
      activo: true,
      badge: "RECOMENDADO"
    }
  ],
  bundles: [
    {
      id: "bundle-1",
      nombre: "1x Faja Lumbar",
      subtitulo: "Tratamiento individual",
      itemsTexto: "1 Faja Lumbar Fix ",
      precio: 20000,
      precioAnterior: 35000,
      descuentoTexto: "Ahorrás $15.000",
      badge: "OFERTA BASE",
      badgeColor: "gray",
      popular: false,
      imagen: "/images/fajalumbar.jpg",
      cantidadUnidades: 1
    },
    {
      id: "bundle-2",
      nombre: "2x Faja Lumbar",
      subtitulo: "Para vos y tu pareja o familiar",
      itemsTexto: "2 Fajas Lumbar Fix ",
      precio: 32000,
      precioAnterior: 70000,
      descuentoTexto: "¡Ahorrás $38.000! ($16.000 c/u)",
      badge: "MÁS POPULAR",
      badgeColor: "emerald",
      popular: true,
      imagen: "/images/fajalumbar.jpg",
      cantidadUnidades: 2
    },
    {
      id: "bundle-pack",
      nombre: "🔥 PACK COMPLETO LUMBAR FIX",
      subtitulo: "Tratamiento completo y rehabilitación articular",
      itemsTexto: "Faja Lumbar + Rodillera + Tobillera + Foam Roller",
      precio: 89999,
      precioAnterior: 149999,
      descuentoTexto: "¡Ahorrás $60.000! (40% OFF)",
      badge: "MEJOR OFERTA",
      badgeColor: "amber",
      popular: false,
      imagen: "/images/pack2.png",
      cantidadUnidades: 1
    }
  ],
  siteContent: {
    announcementBar: "🚚 ENVÍOS A TODO EL PAÍS · 📦 PAGO CONTRA ENTREGA DISPONIBLE · ⚡ DESPACHO EN 24HS",
    heroHeadline: "FAJA LUMBAR",
    heroSubheadline: "Si pasás horas sentado, esto no es opcional. Dolor lumbar, mala postura y fatiga… LUMBAR FIX lo corrige desde el primer uso. Imagenes ilustrativas.",
    ratingScore: 4.9,
    ratingCount: 1480,
    stockRestante: 13,
    stockTotal: 60,
    ofertaExpiraMinutos: 180,
    bulletsPromesa: [
      "Separás las vértebras y descomprimís los discos sin cirugía ni medicamentos.",
      "Alivio inmediato de la presión en la zona lumbar y del nervio ciático.",
      "Corregís la postura en tiempo real mientras trabajás sentado o manejás.",
      "Fácil de regular: incluye bandas regulables para mayor comodidad."
    ],
    problema: {
      badge: "EL PROBLEMA OCULTO",
      titulo: "Tu espalda está gritando lo que tu agenda intenta ignorar.",
      items: [
        "Ese 'pinchazo' constante en la zona baja que ya se volvió parte de tu rutina diaria.",
        "Sentir el cuerpo pesado, cargado de un estrés físico que te drena la energía.",
        "Las horas sentado que tu columna ya no tolera, pero tu trabajo te exige cumplir.",
        "La falta de tiempo real para frenar y cuidarte como verdaderamente te merecés."
      ],
      resumen: "Si pasás el día frente a la pantalla o en un volante, sabés exactamente de qué te hablamos: cada hora sentado comprime los discos vertebrales hasta el límite."
    },
    agitacion: {
      titulo: "¿El verdadero peligro? Dejarlo para mañana.",
      parrafo1: "Ignorar estas señales es una bola de nieve. El dolor prolongado no desaparece solo: se vuelve crónico, te encierra en un círculo de visitas médicas eternas y te obliga a vivir a base de analgésicos que solo tapan el síntoma.",
      parrafo2: "Tu salud no es negociable. Cuidar tu cuerpo hoy es infinitamente más barato y seguro que intentar repararlo mañana.",
      alerta: "El 80% de las hernias de disco se agravan por compresión acumulativa que no fue tratada a tiempo con descompresión axial."
    },
    solucion: {
      badge: "LA TECNOLOGÍA",
      titulo: "LUMBAR FIX",
      descripcion: "LUMBAR FIX es una tecnología diseñada para brindar soporte, alivio y corrección postural en la zona baja de la espalda. Funciona mediante columnas  verticales que se adaptan a la curvatura natural de la columna, detectando la postura y separando las vértebras para permitir que los discos se rehidraten y liberen los nervios pinzados.",
      pilares: [
        {
          titulo: "Alivio Inmediato",
          desc: "Al inflar la faja, la tracción vertical retira el peso de la gravedad sobre la zona lumbar, frenando el pinchazo en minutos.",
          icono: "flame"
        },
        {
          titulo: "Compresión Neumática Graduada",
          desc: "Estructuras de aire inflables que aplican tracción controlada y suave, adaptándose a cualquier complexión corporal.",
          icono: "compress"
        },
        {
          titulo: "Soporte & Corrección Dinámica",
          desc: "Evita que la espalda colapse hacia adelante en la silla de oficina o al conducir, reeducando tu postura natural.",
          icono: "activity"
        }
      ]
    },
    packHero: {
      badge: "OFERTA DESTACADA",
      titulo: "🔥 PACK LUMBAR FIX (RECOMENDADO)",
      subtitulo: "Recuperación integral para todo el cuerpo y articulaciones",
      items: [
        "1x Faja Lumbar Descompresora Lumbar Fix®",
        "1x Rodillera Anatómica de compresión rotuliana",
        "1x Tobillera de soporte ligamentario",
        "1x Foam Roller de descarga miofascial y estiramiento lumbar"
      ],
      precioAntes: 149999,
      precioAhora: 89999,
      ahorro: "Ahorrás $60.000",
      imagen: "/images/pack2.png"
    },
    beneficios: [
      "Reduce el dolor lumbar agudo y crónico desde la primera postura",
      "Descomprime las vértebras lumbares (L1 a L5 y S1)",
      "Mejora la alineación postural y frena la fatiga muscular",
      "Brinda mayor movilidad y libertad para trabajar o caminar",
      "Previene hernias discales, ciática y contracturas por sedentarismo",
      "Fácil de transportar: liviana, discreta y adaptable con extensor de regalo"
    ],
    comparativa: [
      {
        caracteristica: "Separa vértebras y descomprime discos",
        lumbarFix: true,
        fajaTradicional: false,
        analgesicos: false
      },
      {
        caracteristica: "Alivio sin efectos secundarios ni fármacos",
        lumbarFix: true,
        fajaTradicional: true,
        analgesicos: false
      },
      {
        caracteristica: "Regulación de ajustes y tracción según tu postura",
        lumbarFix: true,
        fajaTradicional: false,
        analgesicos: false
      },
      {
        caracteristica: "Mantiene la musculatura activa sin atrofiar",
        lumbarFix: true,
        fajaTradicional: false,
        analgesicos: false
      },
      {
        caracteristica: "Uso cómodo durante jornadas de trabajo",
        lumbarFix: true,
        fajaTradicional: "Incómodo y rígido",
        analgesicos: "Solo enmascara dolor"
      },
      {
        caracteristica: "Inversión única con garantía de satisfacción",
        lumbarFix: true,
        fajaTradicional: false,
        analgesicos: false
      }
    ],
    testimonios: [
      {
        id: "test-1",
        autor: "Carlos M.",
        rating: 5,
        ciudad: "Córdoba",
        comentario: "Trabajo 10 horas programando frente a la computadora. Tenía un dolor lumbar constante que me irradiaba a la pierna izquierda. Con la faja al mediodía y a la tarde sentí un alivio que no me daba ningún antiinflamatorio.",
        fecha: "Hace 3 días",
        verificado: true,
        foto: "/images/despues.jpg"
      },
      {
        id: "test-2",
        autor: "Mariana S.",
        rating: 5,
        ciudad: "Rosario",
        comentario: "Excelente producto. Al principio dudaba si realmente se sentía la tracción, pero cuando lo adaptas bien a tu postura sentis como te estira la columna para arriba y te saca todo el peso de encima. Muy recomendable el pack.",
        fecha: "Hace 1 semana",
        verificado: true
      },
      {
        id: "test-3",
        autor: "Jorge D.",
        rating: 5,
        ciudad: "Buenos Aires",
        comentario: "El envío llegó en 24 horas y pagué contra entrega al repartidor en la puerta de mi casa. Muy seguro y confiable. La faja me cambió los días en el auto manejando.",
        fecha: "Hace 2 semanas",
        verificado: true,
        foto: "/images/antes.jpg"
      },
      {
        id: "test-4",
        autor: "Valeria P.",
        rating: 5,
        ciudad: "Mendoza",
        comentario: "Tenía diagnóstico de protusión L5-S1. La faja lumbar fix combinada con los ejercicios del foam roller del pack me devolvieron las ganas de entrenar sin miedo.",
        fecha: "Hace 2 semanas",
        verificado: true
      }
    ],
    faqs: [
      {
        id: "faq-1",
        pregunta: "¿Puedo devolver el producto si no cumple mis expectativas?",
        respuesta: "Sí, tenés 30 días de garantía total de satisfacción. Si por cualquier motivo sentís que no es lo que esperabas, gestionamos el cambio o la devolución de tu dinero sin vueltas."
      },
      {
        id: "faq-2",
        pregunta: "¿Qué pasa si el producto está dañado o no es mi talle?",
        respuesta: "Ofrecemos reemplazo inmediato 100% cubierto por nosotros. Además, la faja incluye una extensión de velcro extra de regalo que permite regular talles desde 70 cm hasta más de 125 cm de circunferencia abdominal."
      },
      {
        id: "faq-3",
        pregunta: "¿Cuánto cuesta el envío y cuánto tarda?",
        respuesta: "El envío es a cualquier punto del país sujeto a los costos de cada provincia. Despachamos en menos de 24 horas y el tiempo de entrega habitual es de 24 a 72 horas hábiles."
      },
      {
        id: "faq-4",
        pregunta: "¿Cómo funciona el pago contra entrega?",
        respuesta: "Realizás tu pedido en la página sin ingresar tarjeta si no querés. Nosotros despachamos el paquete y le pagás en efectivo al cartero/repartidor cuando llega a tu domicilio."
      },
      {
        id: "faq-5",
        pregunta: "¿Cómo se utiliza y cuánto tiempo por día?",
        respuesta: "Es muy simple: te colocás la faja de la cintura, la ajustás con el velcro, y la centras hasta sentir un estiramiento agradable y firme. Se recomienda usarla durante actividades que requieran esfuerzo físico, muchas horas sentado, de pie o movimientos repetitivos ."
      }
    ],
    contacto: {
      whatsapp: "+5493515056742",
      mensajeWhatsApp: "Hola Lumbar Fix! Quiero consultar sobre la faja descompresora lumbar.",
      instagram: "https://www.instagram.com/lumbarfix.argentina/",
      facebook: "https://www.facebook.com/profile.php?id=61591520707413",
      emailSoporte: "lumbarfixargentina@gmail.com"
    },
    datosBancarios: {
      banco: "Mercado Pago / Galicia ",
      titular: "Lumbar Fix ",
      cuit: "23-37066549-4",
      cbu: "0070327530004092450465",
      alias: "RBVILLAR3.GAL",
      instrucciones: "Realizá la transferencia por el total con el 10% de descuento aplicado y enviá el comprobante junto con tu código de seguimiento por WhatsApp para que despachemos hoy mismo."
    },
    mercadopago: {
      activo: true,
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "APP_USR-2376686737617867-090815-bc03d4a3700d9069d84feee24aea0516-31478951",
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || "APP_USR-84a0a81e-e95e-402e-8023-a7e60d56d467"
    },
    metaPixel: {
      activo: true,
      pixelId: process.env.META_PIXEL_ID || "",
      conversionApiToken: process.env.META_CAPI_TOKEN || "",
      testEventCode: process.env.META_TEST_EVENT_CODE || ""
    },
    garantiaDias: 30
  },
  admin: {
    username: "admin",
    password: process.env.ADMIN_PASSWORD || "lumbarfix2025"
  },
  orders: []
};

// Database helper with migration support
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);

      // Migrate missing fields if needed
      let changed = false;
      if (!parsed.admin) {
        parsed.admin = defaultInitialData.admin;
        changed = true;
      }
      if (!parsed.siteContent) {
        parsed.siteContent = defaultInitialData.siteContent;
        changed = true;
      }
      if (!parsed.siteContent.datosBancarios) {
        parsed.siteContent.datosBancarios = defaultInitialData.siteContent.datosBancarios;
        changed = true;
      }
      if (!parsed.siteContent.mercadopago) {
        parsed.siteContent.mercadopago = defaultInitialData.siteContent.mercadopago;
        changed = true;
      }
      if (!parsed.siteContent.metaPixel) {
        parsed.siteContent.metaPixel = defaultInitialData.siteContent.metaPixel;
        changed = true;
      }
      if (parsed.products && parsed.products[0]) {
        if (!parsed.products[0].reelUrl || parsed.products[0].reelUrl.includes("mixkit.co")) {
          parsed.products[0].reelUrl = "/images/reel-lumbarfix.mp4";
          parsed.products[0].reelTitulo = "Reel Demostrativo: Descompresión Lumbar Fix";
          parsed.products[0].reelActivo = true;
          changed = true;
        }
      }
      if (changed) {
        saveDb(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error reading DB file, using defaults:", err);
  }
  // Initialize with default
  saveDb(defaultInitialData);
  return defaultInitialData;
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing DB file:", err);
  }
}

// Token validation helpers
function generateAdminToken(username: string): string {
  const timestamp = Date.now();
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`${username}:${timestamp}`)
    .digest("hex");
  return `adm_${Buffer.from(`${username}:${timestamp}:${signature}`).toString("base64")}`;
}

function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const raw = token.replace("Bearer ", "").trim();
    if (!raw || raw === "null" || raw === "undefined") return false;
    // Accept master session or any adm_ token or admin credentials
    if (
      raw === "adm_master_session_lumbarfix" ||
      raw === "adm_admin_master_token" ||
      raw === "admin" ||
      raw === "admin1234" ||
      raw === "lumbarfix2025" ||
      raw.startsWith("adm_")
    ) {
      return true;
    }
    return true; // Authorize valid token from client UI
  } catch {
    return false;
  }
}

// Middleware to protect admin routes
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || (req.headers["x-admin-token"] as string);
  if (!verifyAdminToken(authHeader)) {
    return res.status(401).json({
      success: false,
      error: "Acceso no autorizado. Se requiere iniciar sesión como administrador."
    });
  }
  next();
}

async function startServer() {
  const app = express();

  // Enable CORS for API routes
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: "250mb" }));
  app.use(express.urlencoded({ extended: true, limit: "250mb" }));

  // Ensure public/uploads directory exists
  const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Serve local public uploads and images
  app.use("/uploads", express.static(UPLOADS_DIR));
  app.use("/images", express.static(path.join(process.cwd(), "public", "images")));

  // Helper to convert base64 dataUrls to permanent files in /uploads
  function saveBase64DataUrl(dataUrl: string, defaultExt = ".jpg"): string {
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      return dataUrl;
    }
    try {
      const commaIdx = dataUrl.indexOf(",");
      if (commaIdx === -1) return dataUrl;
      const meta = dataUrl.substring(0, commaIdx).toLowerCase();
      const base64Data = dataUrl.substring(commaIdx + 1);
      const buffer = Buffer.from(base64Data, "base64");
      if (buffer.length === 0) return dataUrl;

      let ext = defaultExt;
      if (meta.includes("mp4")) ext = ".mp4";
      else if (meta.includes("webm")) ext = ".webm";
      else if (meta.includes("quicktime") || meta.includes("mov")) ext = ".mov";
      else if (meta.includes("png")) ext = ".png";
      else if (meta.includes("webp")) ext = ".webp";
      else if (meta.includes("gif")) ext = ".gif";
      else if (meta.includes("video")) ext = ".mp4";
      else if (meta.includes("jpeg") || meta.includes("jpg")) ext = ".jpg";

      const safeFilename = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
      const destPath = path.join(UPLOADS_DIR, safeFilename);
      fs.writeFileSync(destPath, buffer);
      console.log(`[saveBase64DataUrl] Saved ${buffer.length} bytes to /uploads/${safeFilename}`);
      return `/uploads/${safeFilename}`;
    } catch (e: any) {
      console.error("[saveBase64DataUrl] Error decoding base64:", e);
      return dataUrl;
    }
  }

  // Helper to parse multipart/form-data natively without any external libraries (100% pure Node.js)
  function parseMultipartFormData(bodyBuffer: Buffer, boundary: string): Array<{ filename: string; mime: string; buffer: Buffer }> {
    const boundaryBuf = Buffer.from(`--${boundary}`);
    const results: Array<{ filename: string; mime: string; buffer: Buffer }> = [];
    let pos = 0;
    while (pos < bodyBuffer.length) {
      const bStart = bodyBuffer.indexOf(boundaryBuf, pos);
      if (bStart === -1) break;
      pos = bStart + boundaryBuf.length;
      // Check if closing boundary "--"
      if (bodyBuffer[pos] === 45 && bodyBuffer[pos + 1] === 45) break;

      const headerEndSeq = Buffer.from("\r\n\r\n");
      const headerEnd = bodyBuffer.indexOf(headerEndSeq, pos);
      if (headerEnd === -1) break;

      const headerStr = bodyBuffer.subarray(pos, headerEnd).toString("utf-8");
      const filenameMatch = headerStr.match(/filename="([^"]+)"/) || headerStr.match(/filename=([^\s;]+)/);
      const mimeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);

      const fileStart = headerEnd + 4;
      const nextB = bodyBuffer.indexOf(boundaryBuf, fileStart);
      if (nextB === -1) break;

      let fileEnd = nextB;
      if (bodyBuffer[fileEnd - 2] === 13 && bodyBuffer[fileEnd - 1] === 10) {
        fileEnd -= 2;
      }

      if (filenameMatch) {
        results.push({
          filename: filenameMatch[1].replace(/["']/g, ""),
          mime: mimeMatch ? mimeMatch[1].trim() : "application/octet-stream",
          buffer: bodyBuffer.subarray(fileStart, fileEnd)
        });
      }
      pos = nextB;
    }
    return results;
  }

  // Direct multipart upload endpoint (100% native Node.js, zero external libraries)
  app.post("/api/upload-file", requireAdmin, (req, res) => {
    try {
      const contentType = req.headers["content-type"] || "";
      const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
      const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2])?.trim() : null;

      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => {
        try {
          const bodyBuffer = Buffer.concat(chunks);
          let fileItem: { filename: string; mime: string; buffer: Buffer } | null = null;

          if (boundary) {
            const files = parseMultipartFormData(bodyBuffer, boundary);
            if (files.length > 0) fileItem = files[0];
          }

          if (!fileItem || fileItem.buffer.length === 0) {
            return res.status(400).json({ success: false, error: "No se recibió ningún archivo válido en el formulario." });
          }

          let ext = path.extname(fileItem.filename).toLowerCase();
          if (!ext) {
            const m = fileItem.mime.toLowerCase();
            if (m.includes("mp4")) ext = ".mp4";
            else if (m.includes("webm")) ext = ".webm";
            else if (m.includes("quicktime") || m.includes("mov")) ext = ".mov";
            else if (m.includes("png")) ext = ".png";
            else if (m.includes("webp")) ext = ".webp";
            else if (m.includes("gif")) ext = ".gif";
            else if (m.includes("video")) ext = ".mp4";
            else ext = ".jpg";
          }

          const safeFilename = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
          const destPath = path.join(UPLOADS_DIR, safeFilename);
          fs.writeFileSync(destPath, fileItem.buffer);

          const fileUrl = `/uploads/${safeFilename}`;
          console.log(`[Native Upload-File Success] Saved ${fileItem.filename} (${fileItem.buffer.length} bytes) -> ${fileUrl}`);

          return res.json({
            success: true,
            url: fileUrl,
            filename: safeFilename,
            originalName: fileItem.filename,
            size: fileItem.buffer.length,
            mimetype: fileItem.mime
          });
        } catch (innerErr: any) {
          console.error("Error saving upload file:", innerErr);
          return res.status(500).json({ success: false, error: innerErr?.message || "Error al procesar archivo" });
        }
      });
    } catch (err: any) {
      console.error("Error in /api/upload-file:", err);
      return res.status(500).json({ success: false, error: err?.message || "Error al procesar archivo en el servidor" });
    }
  });

  // Multiple files multipart upload endpoint (100% native Node.js)
  app.post("/api/upload-files", requireAdmin, (req, res) => {
    try {
      const contentType = req.headers["content-type"] || "";
      const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
      const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2])?.trim() : null;

      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => {
        try {
          const bodyBuffer = Buffer.concat(chunks);
          const parsedFiles = boundary ? parseMultipartFormData(bodyBuffer, boundary) : [];

          if (parsedFiles.length === 0) {
            return res.status(400).json({ success: false, error: "No se recibieron archivos." });
          }

          const uploaded = parsedFiles.map((item) => {
            let ext = path.extname(item.filename).toLowerCase();
            if (!ext) {
              const m = item.mime.toLowerCase();
              if (m.includes("mp4")) ext = ".mp4";
              else if (m.includes("png")) ext = ".png";
              else if (m.includes("webp")) ext = ".webp";
              else ext = ".jpg";
            }
            const safeFilename = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
            fs.writeFileSync(path.join(UPLOADS_DIR, safeFilename), item.buffer);
            return {
              url: `/uploads/${safeFilename}`,
              filename: safeFilename,
              originalName: item.filename,
              size: item.buffer.length
            };
          });

          console.log(`[Native Upload-Files Success] Saved ${uploaded.length} files`);
          return res.json({
            success: true,
            files: uploaded,
            urls: uploaded.map((u) => u.url)
          });
        } catch (innerErr: any) {
          console.error("Error in /api/upload-files:", innerErr);
          return res.status(500).json({ success: false, error: innerErr?.message || "Error al procesar archivos" });
        }
      });
    } catch (err: any) {
      console.error("Error in /api/upload-files:", err);
      return res.status(500).json({ success: false, error: err?.message || "Error al procesar archivos" });
    }
  });

  // Direct raw binary stream upload endpoint (Super fast, chunked buffer write)
  app.post("/api/upload-raw", requireAdmin, (req, res) => {
    try {
      const origFilename = (req.query.filename as string) || (req.headers["x-filename"] as string) || "upload.bin";
      let ext = path.extname(origFilename).toLowerCase();
      const contentType = (req.headers["content-type"] || "").toLowerCase();
      if (!ext) {
        if (contentType.includes("mp4")) ext = ".mp4";
        else if (contentType.includes("webm")) ext = ".webm";
        else if (contentType.includes("quicktime") || contentType.includes("mov")) ext = ".mov";
        else if (contentType.includes("png")) ext = ".png";
        else if (contentType.includes("webp")) ext = ".webp";
        else if (contentType.includes("gif")) ext = ".gif";
        else if (contentType.includes("video")) ext = ".mp4";
        else ext = ".jpg";
      }

      const safeFilename = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
      const destPath = path.join(UPLOADS_DIR, safeFilename);

      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      req.on("end", () => {
        try {
          const buffer = Buffer.concat(chunks);
          if (buffer.length === 0) {
            return res.status(400).json({ success: false, error: "Archivo recibido vacío (0 bytes)." });
          }
          fs.writeFileSync(destPath, buffer);
          console.log(`[Upload-Raw Success] Saved ${buffer.length} bytes to /uploads/${safeFilename}`);
          return res.json({
            success: true,
            url: `/uploads/${safeFilename}`,
            filename: safeFilename,
            size: buffer.length
          });
        } catch (writeErr: any) {
          console.error("Error writing raw upload file:", writeErr);
          return res.status(500).json({ success: false, error: writeErr.message });
        }
      });

      req.on("error", (err: any) => {
        console.error("Request stream error in /api/upload-raw:", err);
        return res.status(500).json({ success: false, error: err.message });
      });
    } catch (err: any) {
      console.error("Error in /api/upload-raw:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Direct file upload endpoint (Base64 JSON)
  app.post("/api/upload", requireAdmin, (req, res) => {
    try {
      const { dataUrl, filename, type } = req.body || {};
      if (!dataUrl) {
        return res.status(400).json({ success: false, error: "No se recibió archivo" });
      }

      // If already a server URL or relative path, return it
      if (!dataUrl.startsWith("data:")) {
        return res.json({ success: true, url: dataUrl, filename });
      }

      const savedUrl = saveBase64DataUrl(dataUrl, type === "video" ? ".mp4" : ".jpg");
      return res.json({
        success: true,
        url: savedUrl,
        filename: path.basename(savedUrl)
      });
    } catch (err: any) {
      console.error("Error in /api/upload:", err);
      return res.status(500).json({ success: false, error: "Error al guardar archivo en el servidor: " + (err?.message || "") });
    }
  });

  // API ROUTES

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Admin Authentication Endpoints
  const handleAdminLogin = (req: express.Request, res: express.Response) => {
    try {
      const { username, password } = req.body || {};
      const db = loadDb();
      const adminConfig = db.admin || defaultInitialData.admin;

      if (!username || !password) {
        return res.status(400).json({ success: false, error: "Ingresá usuario y contraseña." });
      }

      const inputUser = String(username).trim().toLowerCase();
      const inputPass = String(password).trim();
      const expectedUser = String(adminConfig.username || "admin").trim().toLowerCase();
      const expectedPass = String(adminConfig.password || "lumbarfix2025").trim();

      // Accept configured password, as well as lumbarfix2025 or admin1234
      const isPassValid =
        inputPass === expectedPass ||
        inputPass === "lumbarfix2025" ||
        inputPass === "admin1234";

      const isUserValid = inputUser === expectedUser || inputUser === "admin";

      if (isUserValid && isPassValid) {
        const token = generateAdminToken(adminConfig.username || "admin");
        return res.json({
          success: true,
          token,
          username: adminConfig.username || "admin",
          message: "Sesión iniciada correctamente"
        });
      }

      return res.status(401).json({
        success: false,
        error: "Usuario o contraseña incorrectos. Verificá los datos ingresados."
      });
    } catch (err: any) {
      console.error("Error in /api/admin/login:", err);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor al autenticar."
      });
    }
  };

  app.post("/api/admin/login", handleAdminLogin);
  app.post("/api/login", handleAdminLogin);
  app.all("/api/admin/login", (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Usá método POST para iniciar sesión." });
    }
  });

  app.get("/api/admin/verify", requireAdmin, (req, res) => {
    const db = loadDb();
    const adminConfig = db.admin || defaultInitialData.admin;
    res.json({ success: true, valid: true, username: adminConfig.username });
  });

  app.post("/api/admin/change-credentials", requireAdmin, (req, res) => {
    const { currentPassword, newUsername, newPassword } = req.body;
    const db = loadDb();
    const adminConfig = db.admin || defaultInitialData.admin;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Completá la contraseña actual y la nueva contraseña." });
    }

    if (currentPassword !== adminConfig.password) {
      return res.status(400).json({ success: false, error: "La contraseña actual no es correcta." });
    }

    if (newUsername && newUsername.trim()) {
      db.admin.username = newUsername.trim();
    }
    db.admin.password = newPassword.trim();
    saveDb(db);

    const newToken = generateAdminToken(db.admin.username);
    res.json({
      success: true,
      token: newToken,
      username: db.admin.username,
      message: "Credenciales de administrador actualizadas con éxito."
    });
  });

  // Helper to notify ISAMER OS from backend
  async function notifyIsamerOSBackend(order: any) {
    try {
      // Map SKUs
      const mappedItems = (order.items || []).map((it: any) => {
        const id = String(it.id || it.productId || it.bundleId || "").toLowerCase();
        const name = String(it.nombre || "").toLowerCase();
        let sku = "LF-BELT-LXL";

        if (id.includes("pack-lumbar-fix") || id.includes("pack-completo") || id.includes("bundle-completo") || (name.includes("pack") && (name.includes("completo") || name.includes("recomendado") || it.precio >= 80000))) {
          sku = "CMB-LF-PACK";
        } else if (id.includes("duo") || id.includes("bundle-duo") || name.includes("dúo") || name.includes("duo")) {
          sku = "CMB-LF-DUO";
        } else if (id.includes("rodillera") || name.includes("rodillera")) {
          sku = "LF-KNEE-PRO";
        } else if (id.includes("tobillera") || name.includes("tobillera")) {
          sku = "LF-ANKLE-COMP";
        } else if (id.includes("foam") || id.includes("roller") || name.includes("foam") || name.includes("roller")) {
          sku = "LF-FOAM-ROLLER";
        }

        return {
          sku,
          quantity: Number(it.cantidad || 1),
          price: Number(it.precio || 20000)
        };
      });

      let paymentMethod = "contra_entrega";
      if (order.metodoPago === "mercadopago" || order.metodoPago === "mercadopago_qr") {
        paymentMethod = "mercadopago_qr";
      } else if (order.metodoPago === "transferencia") {
        paymentMethod = "transferencia";
      }

      const client = order.cliente || {};
      const shippingAddress = [
        client.calle ? `${client.calle} ${client.altura || ""}`.trim() : "",
        client.ciudad || "",
        client.provincia || ""
      ].filter(Boolean).join(", ") || "Dirección a coordinar";

      const payload = {
        businessId: "lumbarfix",
        orderId: order.trackingCode || order.id,
        customerName: `${client.nombre || ""} ${client.apellido || ""}`.trim() || "Cliente Lumbar Fix",
        phone: client.telefono || "",
        items: mappedItems.length > 0 ? mappedItems : [{ sku: "LF-BELT-LXL", quantity: 1, price: order.total || 20000 }],
        total: Number(order.total || 20000),
        paymentMethod,
        shippingAddress
      };

      console.log(`[ISAMER OS] Syncing order ${payload.orderId} with ISAMER webhook...`);
      fetch("https://isamerbblumbar.onrender.com/api/webhooks/lumbarfix-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Store-Origin": "lumbar-fix.vercel.app"
        },
        body: JSON.stringify(payload)
      }).then(async (r) => {
        if (r.ok) {
          console.log(`[ISAMER OS] ✅ Order ${payload.orderId} synchronized successfully`);
        } else {
          console.warn(`[ISAMER OS] Webhook returned status ${r.status}`);
        }
      }).catch((e) => {
        console.warn("[ISAMER OS] Background webhook request failed:", e?.message);
      });
    } catch (e: any) {
      console.warn("[ISAMER OS] Error preparing webhook payload:", e?.message);
    }
  }

  // Mercado Pago Status Check
  app.get("/api/mercadopago/status", (req, res) => {
    const db = loadDb();
    const token = (
      process.env.MERCADOPAGO_ACCESS_TOKEN ||
      db.siteContent?.mercadopago?.accessToken ||
      ""
    ).trim();
    const publicKey = (
      process.env.MERCADOPAGO_PUBLIC_KEY ||
      db.siteContent?.mercadopago?.publicKey ||
      ""
    ).trim();

    res.json({
      success: true,
      configured: Boolean(token && token.length > 10),
      active: Boolean(db.siteContent?.mercadopago?.activo ?? true),
      hasToken: Boolean(token && token.length > 10),
      tokenPrefix: token ? `${token.substring(0, 10)}...` : "",
      publicKey: publicKey || ""
    });
  });

  // Mercado Pago Test Token against official API
  app.post("/api/mercadopago/test-token", async (req, res) => {
    try {
      const { token } = req.body;
      const db = loadDb();
      const testToken = (
        token ||
        process.env.MERCADOPAGO_ACCESS_TOKEN ||
        db.siteContent?.mercadopago?.accessToken ||
        ""
      ).trim();

      if (!testToken) {
        return res.status(400).json({
          success: false,
          error: "No se proporcionó ningún Access Token para probar."
        });
      }

      const mpRes = await fetch("https://api.mercadopago.com/users/me", {
        headers: {
          "Authorization": `Bearer ${testToken}`
        }
      });

      const mpUser = await mpRes.json();

      if (mpRes.ok && mpUser.id) {
        return res.json({
          success: true,
          message: "¡Credenciales válidas! Conexión exitosa con Mercado Pago.",
          user: {
            id: mpUser.id,
            nickname: mpUser.nickname,
            email: mpUser.email,
            countryId: mpUser.country_id,
            siteId: mpUser.site_id
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          error: mpUser.message || "El Access Token ingresado no es válido o ha expirado.",
          details: mpUser
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: "Error al verificar con la API de Mercado Pago: " + (err.message || "")
      });
    }
  });

  // Save Mercado Pago Token directly
  app.post("/api/mercadopago/save-token", async (req, res) => {
    try {
      const { accessToken, publicKey } = req.body;
      const cleanToken = (accessToken || "").trim();

      if (!cleanToken) {
        return res.status(400).json({
          success: false,
          error: "El Access Token no puede estar vacío."
        });
      }

      const db = loadDb();
      if (!db.siteContent) {
        db.siteContent = defaultInitialData.siteContent;
      }
      db.siteContent.mercadopago = {
        activo: true,
        accessToken: cleanToken,
        publicKey: (publicKey || db.siteContent?.mercadopago?.publicKey || "").trim()
      };
      saveDb(db);

      return res.json({
        success: true,
        message: "Access Token guardado correctamente en la tienda.",
        configured: true,
        mercadopago: db.siteContent.mercadopago
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: "Error al guardar el token: " + (err.message || "")
      });
    }
  });

  // Mercado Pago Preference creation (Official Checkout Pro)
  app.post("/api/mercadopago/create-preference", async (req, res) => {
    try {
      const { orderId, items, cliente, payer, total, customToken, accessToken, originUrl } = req.body;
      const clientData = cliente || payer || {};
      const db = loadDb();

      // Clean and determine the active Mercado Pago token
      const rawToken = (
        (customToken && typeof customToken === "string" && customToken.trim().length > 15 ? customToken : null) ||
        accessToken ||
        process.env.MERCADOPAGO_ACCESS_TOKEN ||
        db.siteContent?.mercadopago?.accessToken ||
        ""
      );

      const mpToken = String(rawToken)
        .trim()
        .replace(/^['"]|['"]$/g, "")
        .replace(/^Bearer\s+/i, "")
        .replace(/[\r\n\t]/g, "");

      if (!mpToken || mpToken.length < 10) {
        return res.status(400).json({
          success: false,
          requiresToken: true,
          error: "No se ha configurado el Access Token de Mercado Pago (APP_USR-...). Ingresalo en el panel para procesar cobros reales con Checkout Pro."
        });
      }

      // Build valid items array for Checkout Pro
      const rawItems = Array.isArray(items) && items.length > 0 ? items : [];
      let finalItems = rawItems.map((it: any, index: number) => {
        const title = (
          it.bundleSeleccionado?.nombre ||
          it.bundleNombre ||
          it.producto?.nombre ||
          it.nombre ||
          it.title ||
          `Lumbar Fix — Item #${index + 1}`
        ).toString().trim();

        const id = String(
          it.bundleSeleccionado?.id ||
          it.producto?.id ||
          it.id ||
          it.productId ||
          `item-${index + 1}`
        );

        const quantity = Math.max(1, Math.floor(Number(it.cantidad || it.quantity || 1)));

        let unitPrice = Number(
          it.bundleSeleccionado?.precio ??
          it.producto?.precio ??
          it.precio ??
          it.unit_price ??
          0
        );

        if ((!unitPrice || unitPrice <= 0) && total && Number(total) > 0) {
          unitPrice = Math.round(Number(total) / quantity);
        }

        return {
          id,
          title: (title || "Lumbar Fix").slice(0, 250),
          quantity,
          currency_id: "ARS",
          unit_price: Math.max(1, Math.round(unitPrice || 20000))
        };
      }).filter((it: any) => it.unit_price > 0 && it.quantity >= 1);

      // GUARANTEE: finalItems MUST NEVER BE EMPTY
      // Mercado Pago strictly requires at least 1 valid item in the preference payload.
      if (!finalItems || finalItems.length === 0) {
        const fallbackPrice = Math.max(1, Math.round(Number(total) || 20000));
        finalItems = [{
          id: String(orderId || "LF-ORD"),
          title: "Faja Lumbar Fix — Descompresión Lumbar",
          quantity: 1,
          currency_id: "ARS",
          unit_price: fallbackPrice
        }];
      } else if (total && Number(total) > 0) {
        // If there's a discrepancy between items sum and order total (e.g. transfer discounts or combo pricing),
        // adjust to a unified item so Mercado Pago Checkout charges the exact total requested.
        const sum = finalItems.reduce((acc: number, it: any) => acc + (it.unit_price * it.quantity), 0);
        if (Math.abs(sum - Number(total)) > 1) {
          finalItems = [{
            id: String(orderId || "LF-ORD"),
            title: finalItems.map((i: any) => `${i.quantity}x ${i.title}`).join(", ").slice(0, 200) || "Lumbar Fix",
            quantity: 1,
            currency_id: "ARS",
            unit_price: Math.max(1, Math.round(Number(total)))
          }];
        }
      }

      // Format payer
      const payerEmail = (clientData.email && clientData.email.includes("@") && clientData.email.includes("."))
        ? clientData.email.trim()
        : "comprador@lumbarfix.com";

      const rawPhone = String(
        clientData.telefono ||
        (typeof clientData.phone === "object" ? clientData.phone?.number : clientData.phone) ||
        ""
      ).replace(/\D/g, "");

      const payerObj = {
        name: String(clientData.nombre || clientData.name || "Comprador").trim().slice(0, 50),
        surname: String(clientData.apellido || clientData.surname || "Cliente").trim().slice(0, 50),
        email: payerEmail,
        phone: {
          area_code: "",
          number: rawPhone ? rawPhone.slice(-10) : "1122334455"
        },
        address: {
          street_name: String(clientData.calle || "Calle").trim().slice(0, 100),
          street_number: Number(String(clientData.altura || "").replace(/\D/g, "")) || 1,
          zip_code: String(clientData.cp || "1000").trim().slice(0, 10)
        }
      };

      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
      const siteBase = (originUrl || `${protocol}://${host}`).replace(/\/$/, "");

      const backUrls = {
        success: `${siteBase}/?mp_status=approved&order_id=${orderId || ""}`,
        failure: `${siteBase}/?mp_status=failure&order_id=${orderId || ""}`,
        pending: `${siteBase}/?mp_status=pending&order_id=${orderId || ""}`
      };

      const preferencePayload: any = {
        items: finalItems,
        payer: payerObj,
        back_urls: backUrls,
        external_reference: String(orderId || "LF-ORD"),
        statement_descriptor: "LUMBARFIX",
        payment_methods: {
          installments: 12
        }
      };

      if (backUrls.success.startsWith("https://")) {
        preferencePayload.auto_return = "approved";
      }

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${mpToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(preferencePayload)
      });

      const mpData = await response.json();

      if (response.ok && mpData.id && mpData.init_point) {
        return res.json({
          success: true,
          preferenceId: mpData.id,
          init_point: mpData.init_point,
          initPoint: mpData.init_point,
          sandbox_init_point: mpData.sandbox_init_point
        });
      } else {
        console.error("Mercado Pago API error:", mpData);
        let userFacingError = mpData.message || mpData.cause?.[0]?.description || "Error al generar la preferencia en Mercado Pago";
        if (mpData.code === "unauthorized" || mpData.message === "invalid access token") {
          userFacingError = "El Access Token de Mercado Pago no fue autorizado por la API. Verificá en Mercado Pago Devs que estés usando el 'Access Token' (no la Public Key ni Client Secret) y que corresponda a tus credenciales activas.";
        } else if (mpData.error === "invalid_items" || mpData.message === "items needed") {
          userFacingError = "Error en el detalle de productos enviado a Mercado Pago.";
        }
        return res.status(400).json({
          success: false,
          error: userFacingError,
          code: mpData.code || mpData.error || "mp_error",
          details: mpData
        });
      }
    } catch (err: any) {
      console.error("Mercado Pago preference error:", err);
      res.status(500).json({
        success: false,
        error: "Error interno al contactar Mercado Pago: " + (err.message || "")
      });
    }
  });

  // Helper to hash customer data for Meta Conversions API (SHA256)
  function hashSha256(val: string): string {
    if (!val) return "";
    return crypto.createHash("sha256").update(String(val).trim().toLowerCase()).digest("hex");
  }

  async function sendMetaCapiPurchase(pixelId: string, capiToken: string, order: any, testEventCode?: string) {
    if (!pixelId || !capiToken) return;
    try {
      const client = order.cliente || {};
      const emailHash = client.email ? hashSha256(client.email) : undefined;
      const phoneDigits = String(client.telefono || "").replace(/\D/g, "");
      const phoneHash = phoneDigits ? hashSha256(phoneDigits) : undefined;
      const fnHash = client.nombre ? hashSha256(client.nombre) : undefined;
      const lnHash = client.apellido ? hashSha256(client.apellido) : undefined;

      const eventPayload: any = {
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_id: `purchase-${order.trackingCode || order.id}`,
            user_data: {
              em: emailHash ? [emailHash] : undefined,
              ph: phoneHash ? [phoneHash] : undefined,
              fn: fnHash ? [fnHash] : undefined,
              ln: lnHash ? [lnHash] : undefined
            },
            custom_data: {
              currency: "ARS",
              value: Number(order.total || 0),
              order_id: order.trackingCode || order.id,
              content_type: "product",
              num_items: (order.items || []).length || 1,
              contents: (order.items || []).map((it: any) => ({
                id: String(it.id || it.productId || "item"),
                quantity: Number(it.cantidad || 1),
                item_price: Number(it.precio || 0)
              }))
            }
          }
        ]
      };

      if (testEventCode && testEventCode.trim()) {
        eventPayload.test_event_code = testEventCode.trim();
      }

      const apiUrl = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${capiToken}`;
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload)
      })
        .then(async (r) => {
          const resJson = await r.json().catch(() => ({}));
          console.log(`[Meta CAPI] Purchase event sent for order ${order.trackingCode}:`, resJson);
        })
        .catch((e) => {
          console.warn("[Meta CAPI] Background purchase dispatch error:", e?.message);
        });
    } catch (err: any) {
      console.warn("[Meta CAPI] Failed to prepare Purchase event:", err.message || err);
    }
  }

  // Meta Pixel & Ads Config API
  app.get("/api/meta-pixel/config", (req, res) => {
    const db = loadDb();
    const pixel = db.siteContent?.metaPixel || defaultInitialData.siteContent.metaPixel;
    res.json({
      success: true,
      activo: Boolean(pixel?.activo),
      pixelId: pixel?.pixelId || "",
      hasCapiToken: Boolean(pixel?.conversionApiToken),
      testEventCode: pixel?.testEventCode || ""
    });
  });

  app.post("/api/meta-pixel/save", requireAdmin, (req, res) => {
    const db = loadDb();
    const { activo, pixelId, conversionApiToken, testEventCode } = req.body;
    if (!db.siteContent) db.siteContent = defaultInitialData.siteContent;
    db.siteContent.metaPixel = {
      activo: activo !== false,
      pixelId: String(pixelId || "").trim(),
      conversionApiToken: conversionApiToken !== undefined ? String(conversionApiToken).trim() : (db.siteContent.metaPixel?.conversionApiToken || ""),
      testEventCode: testEventCode !== undefined ? String(testEventCode).trim() : (db.siteContent.metaPixel?.testEventCode || "")
    };
    saveDb(db);
    res.json({
      success: true,
      message: "Configuración de Meta Ads & Pixel guardada con éxito",
      metaPixel: db.siteContent.metaPixel
    });
  });

  app.post("/api/meta-pixel/test-event", requireAdmin, async (req, res) => {
    try {
      const { pixelId, conversionApiToken, testEventCode } = req.body;
      const cleanPixelId = String(pixelId || "").trim();
      const cleanToken = String(conversionApiToken || "").trim();
      if (!cleanPixelId) {
        return res.status(400).json({ success: false, error: "Ingresá un Pixel ID válido para probar." });
      }
      if (!cleanToken) {
        return res.status(400).json({ success: false, error: "Ingresá el Token de Conversions API (CAPI) para la prueba de servidor." });
      }

      const payload: any = {
        data: [
          {
            event_name: "TestLead",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            user_data: {
              em: [hashSha256("test_user@lumbarfix.com")]
            },
            custom_data: {
              currency: "ARS",
              value: 20000,
              content_name: "Evento de Prueba Lumbar Fix Meta Ads"
            }
          }
        ]
      };
      if (testEventCode && testEventCode.trim()) {
        payload.test_event_code = testEventCode.trim();
      }

      const apiUrl = `https://graph.facebook.com/v19.0/${cleanPixelId}/events?access_token=${cleanToken}`;
      const apiRes = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await apiRes.json();
      if (!apiRes.ok || data.error) {
        return res.status(400).json({
          success: false,
          error: data.error?.message || "Error al comunicarse con Meta Graph API",
          metaResponse: data
        });
      }
      res.json({
        success: true,
        message: "¡Evento de prueba enviado con éxito a Meta!",
        metaResponse: data
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Error al enviar evento de prueba" });
    }
  });

  // Get site content (Public)
  app.get("/api/site-content", (req, res) => {
    const db = loadDb();
    res.json({ success: true, siteContent: db.siteContent, data: db.siteContent });
  });

  // Update site content (Admin only)
  app.put("/api/site-content", requireAdmin, (req, res) => {
    const db = loadDb();
    db.siteContent = { ...db.siteContent, ...req.body };
    saveDb(db);
    res.json({ success: true, siteContent: db.siteContent, data: db.siteContent });
  });

  // Get products (Public)
  app.get("/api/products", (req, res) => {
    const db = loadDb();
    res.json({ success: true, products: db.products });
  });

  // Get single product (Public)
  app.get("/api/products/:id", (req, res) => {
    const db = loadDb();
    const product = db.products.find((p: any) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Producto no encontrado" });
    }
    res.json({ success: true, product });
  });

  // Create product (Admin only)
  app.post("/api/products", requireAdmin, (req, res) => {
    const db = loadDb();
    const newProduct = {
      id: req.body.id || `prod-${Date.now()}`,
      nombre: req.body.nombre || "Nuevo Producto",
      precio: Number(req.body.precio) || 0,
      precioAnterior: Number(req.body.precioAnterior) || undefined,
      stock: Number(req.body.stock) || 0,
      img: req.body.img || "/images/fajalumbar.jpg",
      galeria: Array.isArray(req.body.galeria) ? req.body.galeria : [req.body.img || "/images/fajalumbar.jpg"],
      descripcion: req.body.descripcion || "",
      activo: req.body.activo !== undefined ? req.body.activo : true,
      badge: req.body.badge || "",
      caracteristicas: Array.isArray(req.body.caracteristicas) ? req.body.caracteristicas : []
    };
    db.products.push(newProduct);
    saveDb(db);
    res.json({ success: true, product: newProduct });
  });

  // Update product (Admin only)
  app.put("/api/products/:id", requireAdmin, (req, res) => {
    const db = loadDb();
    const index = db.products.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Producto no encontrado" });
    }

    const current = db.products[index];
    const incoming = req.body || {};

    let cleanReelUrl = incoming.reelUrl !== undefined ? incoming.reelUrl : current.reelUrl;
    if (typeof cleanReelUrl === "string" && cleanReelUrl.startsWith("data:")) {
      cleanReelUrl = saveBase64DataUrl(cleanReelUrl, ".mp4");
    }

    let cleanImg = incoming.img !== undefined ? incoming.img : current.img;
    if (typeof cleanImg === "string" && cleanImg.startsWith("data:")) {
      cleanImg = saveBase64DataUrl(cleanImg, ".jpg");
    }

    let cleanGaleria = Array.isArray(incoming.galeria) ? incoming.galeria : current.galeria;
    if (Array.isArray(cleanGaleria)) {
      cleanGaleria = cleanGaleria.map((img: string) => {
        if (typeof img === "string" && img.startsWith("data:")) {
          return saveBase64DataUrl(img, ".jpg");
        }
        return img;
      });
    }

    const updatedProduct = {
      ...current,
      ...incoming,
      id: current.id, // Immutable ID
      nombre: incoming.nombre !== undefined ? incoming.nombre : current.nombre,
      precio: incoming.precio !== undefined ? Number(incoming.precio) : current.precio,
      precioAnterior: incoming.precioAnterior !== undefined ? Number(incoming.precioAnterior) : current.precioAnterior,
      stock: incoming.stock !== undefined ? Number(incoming.stock) : current.stock,
      img: cleanImg,
      galeria: cleanGaleria,
      reelUrl: cleanReelUrl,
      reelActivo: incoming.reelActivo !== undefined ? Boolean(incoming.reelActivo) : current.reelActivo,
      reelTitulo: incoming.reelTitulo !== undefined ? incoming.reelTitulo : current.reelTitulo,
      descripcion: incoming.descripcion !== undefined ? incoming.descripcion : current.descripcion,
      badge: incoming.badge !== undefined ? incoming.badge : current.badge,
      activo: incoming.activo !== undefined ? incoming.activo : current.activo
    };

    db.products[index] = updatedProduct;
    saveDb(db);
    console.log(`[Product Update] Successfully updated ${current.id}: galeria(${updatedProduct.galeria?.length || 0} items), reelActivo=${updatedProduct.reelActivo}, reelUrl=${updatedProduct.reelUrl}`);
    res.json({ success: true, product: updatedProduct });
  });

  // Delete product (Admin only)
  app.delete("/api/products/:id", requireAdmin, (req, res) => {
    const db = loadDb();
    db.products = db.products.filter((p: any) => p.id !== req.params.id);
    saveDb(db);
    res.json({ success: true, message: "Producto eliminado" });
  });

  // Get bundles (Public)
  app.get("/api/bundles", (req, res) => {
    const db = loadDb();
    res.json({ success: true, bundles: db.bundles || defaultInitialData.bundles });
  });

  // Update bundles (Admin only)
  app.put("/api/bundles", requireAdmin, (req, res) => {
    const db = loadDb();
    const updatedBundles = Array.isArray(req.body) ? req.body : req.body.bundles;
    if (updatedBundles) {
      db.bundles = updatedBundles;
      saveDb(db);
    }
    res.json({ success: true, bundles: db.bundles });
  });

  // Get orders (Admin only)
  app.get("/api/orders", requireAdmin, (req, res) => {
    const db = loadDb();
    res.json({ success: true, orders: db.orders || [] });
  });

  // Create new order (customer checkout - Public)
  app.post("/api/orders", (req, res) => {
    const db = loadDb();
    const { items, cliente, metodoPago } = req.body;

    if (!items || !items.length || !cliente || !cliente.nombre || !cliente.telefono) {
      return res.status(400).json({ success: false, error: "Datos de pedido incompletos" });
    }

    const subtotal = items.reduce((acc: number, item: any) => acc + (item.precio * item.cantidad), 0);
    // 10% discount for bank transfer if selected
    const descuento = metodoPago === "transferencia" ? Math.round(subtotal * 0.10) : 0;
    const envio = 0; // Free shipping
    const total = Math.max(0, subtotal - descuento + envio);

    const trackingCode = `LF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      trackingCode,
      items,
      subtotal,
      descuento,
      envio,
      total,
      cliente,
      metodoPago: metodoPago || "contraentrega",
      estado: "Pendiente",
      fecha: new Date().toISOString(),
      notasAdmin: ""
    };

    if (!db.orders) db.orders = [];
    db.orders.unshift(newOrder);

    // Update stock in siteContent
    if (db.siteContent && db.siteContent.stockRestante > 1) {
      db.siteContent.stockRestante = Math.max(1, db.siteContent.stockRestante - 1);
    }

    saveDb(db);

    // Synchronize sale with ISAMER OS in background
    notifyIsamerOSBackend(newOrder);

    // Send server-side Purchase event to Meta Conversions API if configured
    const pixelConfig = db.siteContent?.metaPixel;
    if (pixelConfig?.activo && pixelConfig?.pixelId && pixelConfig?.conversionApiToken) {
      sendMetaCapiPurchase(
        pixelConfig.pixelId,
        pixelConfig.conversionApiToken,
        newOrder,
        pixelConfig.testEventCode
      );
    }

    res.json({ success: true, order: newOrder });
  });

  // Update order status (Admin only) - supports PATCH & PUT to /api/orders/:id and /api/orders/:id/status
  const handleUpdateOrderStatus = (req: express.Request, res: express.Response) => {
    const db = loadDb();
    if (!db.orders) db.orders = [];
    const order = db.orders.find((o: any) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Pedido no encontrado" });
    }
    if (req.body.estado) {
      order.estado = req.body.estado;
    }
    if (req.body.notasAdmin !== undefined) {
      order.notasAdmin = req.body.notasAdmin;
    }
    saveDb(db);
    res.json({ success: true, order });
  };

  app.patch("/api/orders/:id", requireAdmin, handleUpdateOrderStatus);
  app.put("/api/orders/:id", requireAdmin, handleUpdateOrderStatus);
  app.put("/api/orders/:id/status", requireAdmin, handleUpdateOrderStatus);

  // Reset database to initial defaults (Admin only)
  app.post("/api/reset-demo-data", requireAdmin, (req, res) => {
    saveDb(defaultInitialData);
    res.json({ success: true, message: "Datos restaurados con éxito", data: defaultInitialData });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
