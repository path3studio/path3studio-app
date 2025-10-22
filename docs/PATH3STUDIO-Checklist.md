✅ Path3Studio — Checklist de Publicación

1. Hosting y despliegue
- [x] Dominio activo: path3studio.app
- [x] SSL (https) forzado en Cloudflare
- [x] Redirección www → raíz
- [x] Build automatizado vía Vercel

2. SEO técnico
- [x] robots.txt correcto
- [x] sitemap.xml activo
- [x] <link rel="canonical"> en <head>
- [x] OG + Twitter meta tags validados
- [x] GA4 activo y midiendo eventos (ga-events.js)

3. Performance
- [x] HTML: no-cache, no-store
- [x] Assets: 31536000 + immutable
- [x] Worker opcional para Cloudflare configurado
- [x] Lazy loading en imágenes secundarias
- [x] Preload de hero (LCP)
- [x] font-display: swap
- [x] Speed Insights: 100
- [x] Lighthouse: SEO 100, Performance >75 (móvil)

4. Seguridad
- [x] HSTS activo (max-age=63072000; preload)
- [x] Referrer Policy: no-referrer-when-downgrade
- [x] X-Content-Type-Options: nosniff

5. Verificación final
- [x] curl -I → headers correctos
- [x] robots.txt accesible
- [x] sitemap.xml válido en Search Console
- [x] Speed Insights y Lighthouse verdes
- [x] GA4 recibe eventos en tiempo real

Resultado: Path3Studio.app — listo para producción 🟢

