import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import contactRouter from './routes/contact.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
// In dev, a shared launch harness may inject a generic PORT matching the Vite
// port — never honor it here, or the API server collides with the Vite dev
// server. In prod (no Vite process), hosting platforms set PORT, so honor it.
const PORT = isProd ? process.env.PORT || process.env.API_PORT || 3110 : process.env.API_PORT || 3110;
const distDir = join(__dirname, '..', 'dist');

const app = express();

if (isProd) {
  // Behind Hostinger's proxy/CDN, so trust its X-Forwarded-* headers.
  app.set('trust proxy', true);

  // Canonical host is non-www — this is the Node-app equivalent of the
  // .htaccess www/HTTPS rewrite (no Apache/.htaccess in front of this
  // process, so the redirect has to live here instead).
  app.use((req, res, next) => {
    const host = req.headers.host || '';
    const isWww = host.startsWith('www.');
    const isHttp = req.headers['x-forwarded-proto'] === 'http';
    if (isWww || isHttp) {
      const targetHost = isWww ? host.slice(4) : host;
      return res.redirect(301, `https://${targetHost}${req.originalUrl}`);
    }
    next();
  });
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // 'sha256-...' allowlists only the exact GTM bootstrap snippet below
        // (not arbitrary inline scripts) -- see server/index.js git history
        // for how it's derived if the snippet ever changes.
        scriptSrc: [
          "'self'",
          "'sha256-4ywE0jgnzgUVqIWXWhDzXoIHTYxmKhwxSq27aTLCaus='",
          'https://www.googletagmanager.com',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
        connectSrc: [
          "'self'",
          'https://www.googletagmanager.com',
          'https://www.google-analytics.com',
          'https://*.google-analytics.com',
          'https://*.analytics.google.com',
        ],
        frameSrc: ["'self'", 'https://www.googletagmanager.com'],
      },
    },
  })
);
app.use(compression());
app.use(express.json({ limit: '20kb' }));

app.use('/api/contact', contactRouter);

if (isProd) {
  app.use(
    express.static(distDir, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    })
  );

  const pages = {
    '/': 'index.html',
    '/about-the-book': 'about-the-book.html',
    '/about-the-author': 'about-the-author.html',
    '/contact-us': 'contact-us.html',
  };

  Object.entries(pages).forEach(([route, file]) => {
    app.get(route, (req, res) => res.sendFile(join(distDir, file)));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: isProd ? 'Something went wrong. Please try again.' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT} (${isProd ? 'production' : 'development'})`);
});
