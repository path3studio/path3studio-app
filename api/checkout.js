import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer || {};
    const origin = req.headers.origin || `https://${req.headers.host}`;

    const line_items = items.map((it) => ({
      quantity: Number(it.quantity) || 1,
      price_data: {
        currency: 'mxn',
        product_data: { name: it.name || 'Servicio' },
        unit_amount: Number(it.unit_amount), // centavos
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customer.email,
      line_items,
      success_url: `${origin}/?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
    });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ url: session.url }));
  } catch (e) {
    console.error(e);
    res.statusCode = 500; res.end('Error');
  }
}
