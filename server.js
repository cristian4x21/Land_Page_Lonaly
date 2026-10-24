import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Determinar directorio de producción (dist) o desarrollo raíz
const staticDir = fs.existsSync(path.join(__dirname, 'dist', 'index.html'))
  ? path.join(__dirname, 'dist')
  : __dirname;

// Servir archivos estáticos (sin servir automáticamente index.html en '/' para permitir inyección dinámica de OpenGraph)
app.use(express.static(staticDir, { index: false }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Rutas dedicadas para el banner de vista previa al compartir en WhatsApp / Redes Sociales
app.get(['/banner.jpg', '/banner-og.jpg', '/assets/branding/banner-og.jpg'], (req, res) => {
  const possiblePaths = [
    path.join(__dirname, 'dist', 'assets', 'branding', 'banner-og.jpg'),
    path.join(__dirname, 'public', 'assets', 'branding', 'banner-og.jpg'),
    path.join(__dirname, 'public', 'banner-og.jpg'),
    path.join(__dirname, 'assets', 'branding', 'banner-og.jpg'),
    path.join(__dirname, 'Banner.jpg')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(p);
    }
  }
  res.status(404).send('Banner no encontrado');
});

// Manejo dinámico de index.html con inyección de URL absoluta para OpenGraph / WhatsApp preview
app.get('*', (req, res) => {
  const indexPath = path.join(staticDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Página no encontrada');
  }

  fs.readFile(indexPath, 'utf8', (err, html) => {
    if (err) {
      return res.status(500).send('Error interno del servidor');
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
    const baseUrl = `${protocol}://${host}`;
    const pageUrl = `${baseUrl}${req.originalUrl || '/'}`;

    // Inyectar URL absoluta en las etiquetas Open Graph y Twitter Cards para asegurar preview en WhatsApp
    let dynamicHtml = html
      .replace(/(<meta\s+property="og:image(?::secure_url)?"\s+content=")([^"]+)(")/gi, (m, p1, p2, p3) => {
        const fullUrl = p2.startsWith('http') ? p2 : `${baseUrl}${p2.startsWith('/') ? '' : '/'}${p2}`;
        return `${p1}${fullUrl}${p3}`;
      })
      .replace(/(<meta\s+name="twitter:image"\s+content=")([^"]+)(")/gi, (m, p1, p2, p3) => {
        const fullUrl = p2.startsWith('http') ? p2 : `${baseUrl}${p2.startsWith('/') ? '' : '/'}${p2}`;
        return `${p1}${fullUrl}${p3}`;
      })
      .replace(/(<link\s+rel="image_src"\s+href=")([^"]+)(")/gi, (m, p1, p2, p3) => {
        const fullUrl = p2.startsWith('http') ? p2 : `${baseUrl}${p2.startsWith('/') ? '' : '/'}${p2}`;
        return `${p1}${fullUrl}${p3}`;
      })
      .replace(/content="https:\/\/loanydetalles\.com\/"/g, `content="${pageUrl}"`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(dynamicHtml);
  });
});

app.listen(PORT, () => {
  console.log('----------------------------------------------------');
  console.log('LOANY DETALLES - SERVIDOR WEB DE PRODUCCION');
  console.log(`Entorno: Node.js / Express`);
  console.log(`Directorio estatico: ${staticDir}`);
  console.log(`Acceso local: http://localhost:${PORT}`);
  console.log('----------------------------------------------------');
});
