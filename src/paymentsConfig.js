// src/paymentsConfig.js
export const STRIPE_CHECKOUT_ENDPOINT = '/api/checkout';
export const STRIPE_CONFIRM_ENDPOINT  = '/api/stripe-confirm';
export const BRIEF_ENDPOINT           = '/api/brief';
export const PAYPAL_CAPTURE_ENDPOINT  = '/api/paypal/capture';

/** Enviar brief y obtener { ok: true } */
export async function submitBrief(formData) {
  const r = await fetch(BRIEF_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!r.ok) throw new Error('No se pudo enviar el brief');
  return await r.json();
}

/** Crear sesión de Stripe Checkout y redirigir */
export async function payWithStripe({ items, customer }) {
  const r = await fetch(STRIPE_CHECKOUT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, customer }),
  });
  if (!r.ok) throw new Error('Stripe init error');
  const { url } = await r.json();
  window.location.href = url;
}

/** Llamar en App.jsx (useEffect) para confirmar pago y disparar emails */
export function registerStripeConfirm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const success = params.get('success');
    if (success && sessionId) {
      fetch(`${STRIPE_CONFIRM_ENDPOINT}?session_id=${sessionId}`).catch(console.error);
    }
  } catch (e) {
    console.error(e);
  }
}
