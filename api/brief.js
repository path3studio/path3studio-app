import { sendMail, kvTable } from '../lib/email.js';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method Not Allowed'); }
  try {
    const body = await readJson(req);
    if (body.company) { res.statusCode = 204; return res.end(); } // honeypot

    const owner = process.env.EMAIL_TO || process.env.CONTACT_TO;
    const clientEmail = body.email || body.correo;

    const htmlBrief =
      `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif">
        <h2 style="margin:0 0 8px">Nuevo brief</h2>
        ${kvTable(body)}
        <p style="color:#666;font-size:12px;margin-top:12px">Path3 Studio</p>
      </div>`;

    if (owner) await sendMail({ to: owner, subject: 'Nuevo brief – Path3 Studio', html: htmlBrief, replyTo: clientEmail });

    if (clientEmail) {
      await sendMail({
        to: clientEmail,
        subject: '¡Recibimos tu brief! – Path3 Studio',
        html: `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif">
                 <p>Gracias por tu interés. En breve nos pondremos en contacto.</p>
                 <hr/>${htmlBrief}
               </div>`
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (e) {
    console.error(e);
    res.statusCode = 500; res.end('Error');
  }
}
