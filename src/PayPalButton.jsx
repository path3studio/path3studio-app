// src/PayPalButton.jsx
import React, { useEffect, useRef } from 'react';
import { PAYPAL_CAPTURE_ENDPOINT } from './paymentsConfig';

/**
 * <PayPalButton
 *    totalMXN={199.00}
 *    items={[{ name:'Logo Pro', quantity: 1 }]}
 *    customer={{ email: 'cliente@correo.com', name: 'Cliente' }}
 * />
 */
export default function PayPalButton({ totalMXN = 0, items = [], customer = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!window.paypal || !ref.current) return;
    // Limpieza previa si se vuelve a montar
    ref.current.innerHTML = '';

    window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'pay' },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: Number(totalMXN).toFixed(2) } }],
        });
      },
      onApprove: async (data) => {
        try {
          const r = await fetch(PAYPAL_CAPTURE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID, customer, items }),
          });
          if (!r.ok) throw new Error('PayPal capture error');
          alert('¡Pago completado!');
        } catch (e) {
          console.error(e);
          alert('Error capturando el pago de PayPal');
        }
      },
      onError: (err) => {
        console.error(err);
        alert('Hubo un problema con PayPal');
      },
    }).render(ref.current);
  }, [totalMXN, JSON.stringify(items), JSON.stringify(customer)]);

  return <div ref={ref} />;
}
