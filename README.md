# Loany Detalles | Floristería de Autor & Arreglos de Selección

Plataforma web profesional y landing page de alta conversión para la floristería **Loany Detalles** (Galerías Qori Wasi • Stand 218 – 2do piso), especializada en ramos naturales selectos, ramos buchones de gala, flores eternas tejidas y obsequios temáticos en tendencia.

---

## Características Principales

- **Hero Interactivo & Showcase de Autor:** Rotación fluida de arreglos insignia con cotización dinámica y selección directa.
- **Sección de Fechas Especiales & Tendencias:** Vitrina para ediciones virales y alta demanda (Colección Sanrio Hello Kitty & My Melody Beauty).
- **Catálogo Dinámico con Filtros:** Clasificación por floristería natural, ramos buchones de 25 rosas, flores permanentes y opciones con envío gratuito incluido.
- **Búsqueda en Tiempo Real:** Filtrado instantáneo por nombre, variedad floral o características del detalle.
- **Carrito de Compras con Doble Modalidad:**
  - **Delivery a Domicilio:** Validación de destinatario, dirección, referencia, fecha y rango horario.
  - **Recojo en Tienda:** Datos de retiro en Galerías Qori Wasi Stand 218 y horario estimado.
  - **Tarjeta de Dedicatoria Sin Costo:** Espacio para mensaje personalizado.
- **Checkout Formal por WhatsApp:** Generación automática de resumen estructurado hacia la línea oficial **+51 904 156 666**.
- **Social Proof Dinámico:** Notificaciones flotantes de arreglos con alta demanda y cupos limitados.
- **Gaveta de Navegación Móvil (Drawer):** Experiencia táctil optimizada para celulares y tablets.
- **Metadatos Open Graph & Twitter Cards:** Vista previa profesional tipo banner al compartir el enlace en WhatsApp, Facebook y Telegram.
- **Estándar Visual Profesional:** Iconografía limpia Font Awesome 6.5.1 (cero emojis informales).

---

## Tecnologías Utilizadas

- **Frontend:** HTML5 semántico, CSS3 moderno (Variables CSS, Flexbox, CSS Grid, `clamp()`), JavaScript Vanilla (ES Modules).
- **Bundler & Build Tool:** [Vite](https://vitejs.dev/) para empaquetado ultra-rápido de producción.
- **Backend / Servidor:** [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) para entrega estática e inyección dinámica de OpenGraph.
- **Iconografía:** [Font Awesome 6.5.1](https://fontawesome.com/).

---

## Estructura del Proyecto

```text
├── assets/                  # Recursos multimedia originales
│   ├── branding/            # Logo, mascota y banners
│   ├── populares/           # Imágenes de productos en tendencia
│   └── products/            # Fotografías del catálogo
├── css/
│   └── styles.css           # Hoja de estilos principal y responsive design
├── data/
│   └── products.js          # Base de datos local de productos y colecciones
├── js/
│   └── app.js               # Lógica del catálogo, carrito, filtros y WhatsApp
├── public/                  # Archivos estáticos servidos directamente por Vite
├── index.html               # Estructura principal de la landing page
├── server.js                # Servidor Express de producción
├── vite.config.js           # Configuración de Vite
└── package.json             # Dependencias y scripts de ejecución
```

---

## Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/cristian4x21/Land_Page_Lonaly.git
cd Land_Page_Lonaly
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Modo desarrollo (Vite)
```bash
npm run dev
```

### 4. Compilar para producción
```bash
npm run build
```

### 5. Iniciar servidor Express de producción
```bash
npm start
```
Acceso en el navegador: `http://localhost:3000`

---

## Contacto & Atención

- **Marca:** Loany Detalles
- **WhatsApp Oficial:** [+51 904 156 666](https://wa.me/51904156666)
- **Punto de Atención:** Galerías Qori Wasi • Stand 218 (2do piso)
