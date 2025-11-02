import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PACKAGE_PRICES = {
  esencial: 'price_esencial_id',
  premium: 'price_premium_id',
  pro: 'price_pro_id'
};

const ADDON_PRICES = {
  mascota: 'price_mascota_id',
  stickers: 'price_stickers_id',
  guia_redes: 'price_guia_redes_id',
  guia_inpi: 'price_guia_inpi_id',
  tarjeta: 'price_tarjeta_id',
  firma: 'price_firma_id',
  express_72h: 'price_express_id',
  ronda_cambios: 'price_ronda_cambios_id',
  asesoria_ceo: 'price_asesoria_id',
  disenador_senior: 'price_senior_id'
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pkg, addons } = req.query;
  
  if (!pkg || !PACKAGE_PRICES[pkg]) {
    return res.status(400).json({ error: 'Invalid package selected' });
  }

  try {
    const line_items = [{
      price: PACKAGE_PRICES[pkg],
      quantity: 1
    }];

    if (addons) {
      const addonList = addons.split(',');
      for (const addon of addonList) {
        if (ADDON_PRICES[addon]) {
          line_items.push({
            price: ADDON_PRICES[addon],
            quantity: 1
          });
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      automatic_tax: { enabled: true }
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
}