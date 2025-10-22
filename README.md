# 🎨 Path3Studio — Sitio oficial

**Diseño, tecnología y experiencias digitales.**
Frontend en **Vite + React**, deploy en **Vercel**, optimizado en **SEO, rendimiento y seguridad**.

## 🚀 En producción
**URL:** [https://path3studio.app](https://path3studio.app)
**Hosting:** [Vercel](https://vercel.com)
**Framework:** Vite + React
**Estado:** 🟢 En producción estable

## 🏗 Arquitectura
**Cliente:** React (Vite)
**Hosting/CDN:** Vercel
**Dominio:** path3studio.app (Cloudflare DNS)
**Rendimiento:** caché larga para assets, HTML no-cache (fresh content)
**Rutas:** SPA con rewrites → todas las rutas sirven index.html (200)

## ⚙️ Optimización técnica
**Caché**
- public/assets/*: Cache-Control: public, max-age=31536000, immutable
- HTML (todas las rutas): Cache-Control: no-cache, no-store, must-revalidate

**Headers (Vercel)**
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- Referrer-Policy: no-referrer-when-downgrade
- X-Content-Type-Options: nosniff

## 🔎 SEO & Analítica
- Sitemap: https://path3studio.app/sitemap.xml
- robots.txt accesible
- Google Search Console: propiedad verificada
- GA4: activado y midiendo eventos

## 🔒 Seguridad
- HTTPS forzado (Cloudflare + Vercel)
- HSTS, nosniff, Referrer-Policy activos

## 🗂 Estructura
path3studio/
 ├── public/
 │   ├── robots.txt
 │   ├── sitemap.xml
 │   └── assets/
 ├── src/
 │   ├── App.jsx
 │   ├── main.jsx
 │   └── assets/
 ├── docs/
 │   ├── PATH3STUDIO-Checklist.md
 │   ├── lighthouse-report.report.html
 │   └── lighthouse-report.report.json
 ├── vercel.json
 ├── package.json
 └── vite.config.js

## 🎯 Siguientes pasos
1. Endpoint /api/contact (serverless en Vercel)
2. Formulario de contacto con evento GA4 lead_submit
3. Página de portfolio indexable
4. Reportes trimestrales de Lighthouse y Core Web Vitals

## 👥 Créditos
**Path3 Studio** — Ciudad de México  
https://path3studio.app

