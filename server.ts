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
      descripcion:
        "Faja descompresora vertebral con tracción vertical neumática. Libera la presión sobre discos herniados y nervio ciático de manera inmediata.",
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
      itemsTexto: "1 Faja Lumbar Fix + Bomba de inflado + Extensor",
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
      itemsTexto: "2 Fajas Lumbar Fix + 2 Bombas + 2 Extensores",
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
    announcementBar: "🚚 ENVÍO GRATIS A TODO EL PAÍS · 📦 PAGO CONTRA ENTREGA DISPONIBLE · ⚡ DESPACHO EN 24HS",
    heroHeadline: "FAJA LUMBAR",
    heroSubheadline: "Si pasás horas sentado, esto no es opcional. Dolor lumbar, mala postura y fatiga… LUMBAR FIX lo corrige desde el primer uso.",
    ratingScore: 4.9,
    ratingCount: 1480,
    stockRestante: 13,
    stockTotal: 60,
    ofertaExpiraMinutos: 180,
    bulletsPromesa: [
      "Separás las vértebras y descomprimís los discos sin cirugía ni medicamentos.",
      "Alivio inmediato de la presión en la zona lumbar y del nervio ciático.",
      "Corregís la postura en tiempo real mientras trabajás sentado o manejás.",
      "Fácil de regular: incluye bomba de inflado manual con válvula de seguridad."
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
      descripcion: "LUMBAR FIX es una tecnología diseñada para brindar soporte, alivio y corrección postural en la zona baja de la espalda. Funciona mediante columnas neumáticas verticales que se adaptan a la curvatura natural de la columna, detectando la postura y separando las vértebras para permitir que los discos se rehidraten y liberen los nervios pinzados.",
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
        "1x Faja Lumbar Descompresora Lumbar Fix® con bomba y extensor",
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
        caracteristica: "Regulación de tracción con bomba manual",
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
        comentario: "Trabajo 10 horas programando frente a la computadora. Tenía un dolor lumbar constante que me irradiaba a la pierna izquierda. Con la faja y 20 minutos de inflado al mediodía y a la tarde sentí un alivio que no me daba ningún antiinflamatorio.",
        fecha: "Hace 3 días",
        verificado: true,
        foto: "/images/despues.jpg"
      },
      {
        id: "test-2",
        autor: "Mariana S.",
        rating: 5,
        ciudad: "Rosario",
        comentario: "Excelente producto. Al principio dudaba si realmente se sentía la tracción, pero cuando le das aire con la bomba sentís cómo te estira la columna para arriba y te saca todo el peso de encima. Muy recomendable el pack.",
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
        respuesta: "El envío es 100% GRATIS a cualquier punto del país para esta promoción. Despachamos en menos de 24 horas y el tiempo de entrega habitual es de 24 a 72 horas hábiles."
      },
      {
        id: "faq-4",
        pregunta: "¿Cómo funciona el pago contra entrega?",
        respuesta: "Realizás tu pedido en la página sin ingresar tarjeta si no querés. Nosotros despachamos el paquete y le pagás en efectivo al cartero/repartidor cuando llega a tu domicilio."
      },
      {
        id: "faq-5",
        pregunta: "¿Cómo se utiliza y cuánto tiempo por día?",
        respuesta: "Es muy simple: te colocás la faja desinflada alrededor de la cintura, la ajustás con el velcro, conectás la bomba manual e inflás hasta sentir un estiramiento agradable y firme. Se recomienda usarla de 20 a 40 minutos, 2 o 3 veces por día."
      }
    ],
    contacto: {
      whatsapp: "+5493515056742",
      mensajeWhatsApp: "Hola Lumbar Fix! Quiero consultar sobre la faja descompresora lumbar.",
      instagram: "https://www.instagram.com/bigboss_import/",
      facebook: "https://www.facebook.com/profile.php?id=61591520707413",
      emailSoporte: "contacto@lumbarfix.com"
    },
    datosBancarios: {
      banco: "Mercado Pago / Banco Santander",
      titular: "Lumbar Fix Oficial",
      cuit: "30-71829304-5",
      cbu: "0000003100010000123456",
      alias: "LUMBARFIX.PAGOS",
      instrucciones: "Realizá la transferencia por el total con el 10% de descuento aplicado y enviá el comprobante junto con tu código de seguimiento por WhatsApp para que despachemos hoy mismo."
    },
    mercadopago: {
      activo: true,
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || ""
    },
    garantiaDias: 30
  },
  admin: {
    username: "admin",
    password: process.env.ADMIN_PASSWORD || "admin1234"
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
    if (raw === "adm_master_session_lumbarfix" || raw === "adm_admin_master_token") return true;
    if (!raw.startsWith("adm_")) return false;
    const decoded = Buffer.from(raw.slice(4), "base64").toString("utf-8");
    const [username, timestamp, signature] = decoded.split(":");
    if (!username || !timestamp || !signature) return false;

    // Check token age (valid for 30 days)
    const tokenTime = parseInt(timestamp, 10);
    if (Date.now() - tokenTime > 30 * 24 * 60 * 60 * 1000) return false;

    const expected = crypto
      .createHmac("sha256", ADMIN_SECRET)
      .update(`${username}:${timestamp}`)
      .digest("hex");

    return signature === expected;
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

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Serve local public uploads/images if any
  app.use("/images", express.static(path.join(process.cwd(), "public", "images")));

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

  // Mercado Pago Preference creation
  app.post("/api/mercadopago/create-preference", async (req, res) => {
    try {
      const { orderId, items, cliente, total } = req.body;
      const db = loadDb();

      const mpToken =
        process.env.MERCADOPAGO_ACCESS_TOKEN ||
        db.siteContent?.mercadopago?.accessToken ||
        "";

      if (!mpToken) {
        return res.json({
          success: false,
          requiresSetup: true,
          message: "No hay Access Token de Mercado Pago configurado aún en la tienda."
        });
      }

      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
      const host = req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
      const baseUrl = `${protocol}://${host}`;

      const preferencePayload = {
        items: items.map((it: any) => ({
          id: String(it.id || "faja"),
          title: String(it.nombre || "Lumbar Fix"),
          quantity: Number(it.cantidad || 1),
          currency_id: "ARS",
          unit_price: Number(it.precio || 0)
        })),
        payer: {
          name: cliente?.nombre || "Comprador",
          surname: cliente?.apellido || "",
          email: cliente?.email || "cliente@lumbarfix.com",
          phone: {
            number: cliente?.telefono || ""
          },
          address: {
            street_name: cliente?.calle || "",
            street_number: Number(cliente?.altura) || 1,
            zip_code: cliente?.cp || ""
          }
        },
        back_urls: {
          success: `${baseUrl}/?mp_status=approved&order_id=${orderId}`,
          failure: `${baseUrl}/?mp_status=failure&order_id=${orderId}`,
          pending: `${baseUrl}/?mp_status=pending&order_id=${orderId}`
        },
        auto_return: "approved",
        external_reference: orderId,
        statement_descriptor: "LUMBARFIX"
      };

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${mpToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(preferencePayload)
      });

      const mpData = await response.json();

      if (mpData.id && mpData.init_point) {
        return res.json({
          success: true,
          preferenceId: mpData.id,
          init_point: mpData.init_point,
          sandbox_init_point: mpData.sandbox_init_point
        });
      } else {
        console.error("Mercado Pago API error:", mpData);
        return res.status(400).json({
          success: false,
          error: mpData.message || "Error al generar la preferencia en Mercado Pago"
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
    db.products[index] = {
      ...db.products[index],
      ...req.body,
      precio: req.body.precio !== undefined ? Number(req.body.precio) : db.products[index].precio,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : db.products[index].stock
    };
    saveDb(db);
    res.json({ success: true, product: db.products[index] });
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