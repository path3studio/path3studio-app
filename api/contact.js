/**
 * /api/contact — Path3 Studio (Vercel Serverless)
 * - Acepta solo POST (JSON)
 * - Honeypot: campo "company" debe venir vacío
 * - Rate limit suave: máx 5 solicitudes por IP / minuto
 * - Envío de email opcional con Resend (si hay RESEND_API_KEY)
 */

const MAX_PER_MINUTE = 5;

// Memoria en caliente por instancia (suficiente para suavizar bots básicos)
globalThis.__RATE__ = globalThis.__RATE__ || new Map();

export default async function handler(req, res) {
  // Manejo opcional de preflight (si algún día haces cross-origin)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://path3studio.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  // CORS same-origin
  res.setHeader('Access-Control-Allow-Origin', 'https://path3studio.app');

  try {
    const { name, email, message, company = '' } = req.body || {};

    // ---- Honeypot: bots suelen rellenar campos ocultos
    if (company && String(company).trim() !== '') {
      // Respondemos 204 (silencioso) para no dar pistas
      return res.status(204).end();
    }

    // ---- Rate Limit por IP
    const ip =
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '0.0.0.0';

    const now = Date.now();
    const win = 60 * 1000; // 1 minuto
    const arr = (globalThis.__RATE__.get(ip) || []).filter(t => now - t < win);
    if (arr.length >= MAX_PER_MINUTE) {
      return res.status(429).json({ ok: false, error: 'Too Many Requests' });
    }
    arr.push(now);
    globalThis.__RATE__.set(ip, arr);

    // ---- Validación básica
    if (
      typeof name !== 'string' || name.trim().length < 2 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof message !== 'string' || message.trim().length < 5
    ) {
      return res.status(400).json({ ok: false, error: 'Invalid payload' });
    }

    // ---- Envío de correo (Resend opcional)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO_EMAIL = process.env.CONTACT_TO || 'contacto@path3studio.app';
    const FROM_EMAIL = process.env.CONTACT_FROM || 'no-reply@path3studio.app';

    if (RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [TO_EMAIL],
          subject: `Nuevo lead: ${name} <${email}>`,
          html: `
            <h2>Nuevo contacto</h2>
            <p><strong>Nombre:</strong> ${escapeHTML(name)}</p>
            <p><strong>Email:</strong> ${escapeHTML(email)}</p>
            <p><strong>Mensaje:</strong><br/>${escapeHTML(message).replace(/\n/g,'<br/>')}</p>
          `
        })
      });
      if (!r.ok) {
        const t = await r.text().catch(()=>'');
        console.error('Resend error:', t);
      }
    } else {
      console.log('Lead (sin email):', { ip, name, email, message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}

// Utilidad para sanitizar HTML
function escapeHTML(s='') {
  return s
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}
