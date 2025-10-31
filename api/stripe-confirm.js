import Stripe from 'stripe';
import { sendMail } from '../lib/email.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getQuery(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const q = {}; url.searchParams.forEach((v,k)=>q[k]=v);
  return q;
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

export default async function handler(req, res) {
  try {
    const { session_id } = getQuery(req);
    if (!session_id) { res.statusCode = 400; return res.end('Missing session_id'); }

    const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ['line_items'] });
    const items = (session.line_items?.data || []).map((li) => ({ name: li.description, quantity: li.quantity }));
    const totalMXN = (session.amount_total || 0) / 100;
    const customer = { name: session.customer_details?.name, email: session.customer_details?.email };
    const html = paymentHtml({ provider: 'Stripe', totalMXN, customer, items, idRef: session.id });

    const owner = process.env.EMAIL_TO || process.env.CONTACT_TO;
    if (owner) await sendMail({ to: owner, subject: 'Pago confirmado (Stripe) — Path3 Studio', html });
    if (customer.email) await sendMail({ to: customer.email, subject: '¡Gracias por tu pago! (Stripe)', html });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (e) {
    console.error(e);
    res.statusCode = 500; res.end('Error');
  }
}
