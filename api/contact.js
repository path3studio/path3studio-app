import { sendMail, kvTable } from '../lib/email.js';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method Not Allowed'); }

  try {
    const body = await readJson(req);

    // Honeypot anti-bot: si viene "company", ignoramos (tu input oculto)
    if (body.company) { res.statusCode = 204; return res.end(); }

    const owner = process.env.CONTACT_TO || process.env.EMAIL_TO;
    if (!owner) { res.statusCode = 500; return res.end('Missing CONTACT_TO'); }

    const htmlOwner =
      `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif">
        <h2 style="margin:0 0 8px">Nuevo mensaje de contacto</h2>
        ${kvTable({ Nombre: body.name, Email: body.email, Mensaje: body.message })}
        <p style="color:#666;font-size:12px;margin-top:12px">Path3 Studio</p>
      </div>`;

    await sendMail({
      to: owner,
      subject: 'Contacto – Path3 Studio',
      html: htmlOwner,
      replyTo: body.email
    });

    if (body.email) {
      const htmlClient =
        `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif">
          <p>Hola ${body.name || ''}, gracias por escribirnos. Te responderemos muy pronto.</p>
          <hr/>${htmlOwner}
        </div>`;
      await sendMail({
        to: body.email,
        subject: 'Recibimos tu mensaje – Path3 Studio',
        html: htmlClient
      });
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500; res.end('Error');
  }
}
