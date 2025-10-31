import { sendMail } from '../../lib/email.js';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function paymentHtml({ provider, totalMXN, customer, items, idRef }) {
  const li = (items || []).map((it) => `<li>${it.name || 'Artículo'} × ${it.quantity || 1}</li>`).join('');
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif">
    <h2 style="margin:0 0 8px">Pago confirmado (${provider})</h2>
    <p><b>Referencia:</b> ${idRef || '—'}</p>
    <p><b>Total:</b> $${(Number(totalMXN)||0).toFixed(2)} MXN</p>
    <p><b>Cliente:</b> ${customer?.name || ''} &lt;${customer?.email || ''}&gt;</p>
    <ul>${li}</ul>
    <p style="color:#666;font-size:13px;margin-top:12px">¡Gracias por tu compra!</p>
  </div>`;
}

async function getPayPalToken() {
  const base = process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
  const creds = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
  const r = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error('PayPal token error');
  const j = await r.json();
  return { base, token: j.access_token };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method Not Allowed'); }
  try {
    const { orderID, customer, items } = await readJson(req);
    if (!orderID) { res.statusCode = 400; return res.end('Missing orderID'); }

    const { base, token } = await getPayPalToken();
    const cap = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const capJson = await cap.json();

    if (cap.status !== 201 && cap.status !== 200) {
      console.error('PayPal capture error', cap.status, capJson);
      res.statusCode = 400; return res.end('Capture failed');
    }

    const purchaseUnit = capJson.purchase_units?.[0];
    const amount = purchaseUnit?.payments?.captures?.[0]?.amount;
    const totalMXN = Number(amount?.value || '0');

    const html = paymentHtml({ provider: 'PayPal', totalMXN, customer, items, idRef: capJson.id || orderID });

    const owner = process.env.EMAIL_TO || process.env.CONTACT_TO;
    if (owner) await sendMail({ to: owner, subject: 'Pago confirmado (PayPal) — Path3 Studio', html });
    if (customer?.email) await sendMail({ to: customer.email, subject: '¡Gracias por tu pago! (PayPal)', html });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, id: capJson.id }));
  } catch (e) {
    console.error(e);
    res.statusCode = 500; res.end('Error');
  }
}
