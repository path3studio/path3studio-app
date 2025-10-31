// src/StripePayButton.jsx
import React from 'react';
import { payWithStripe } from './paymentsConfig';

/**
 * <StripePayButton
 *    items={[{ name:'Logo Pro', unit_amount: 199000, quantity: 1 }]}
 *    customer={{ email: 'cliente@correo.com', name: 'Cliente' }}
 *    label="Pagar con tarjeta"
 * />
 */
export default function StripePayButton({ items = [], customer = {}, label = 'Pagar con tarjeta' }) {
  const onClick = async () => {
    try {
      await payWithStripe({ items, customer });
    } catch (e) {
      console.error(e);
      alert('No se pudo iniciar el pago con Stripe');
    }
  };
  return (
    <button onClick={onClick} style={styles.btn}>{label}</button>
  );
}

const styles = {
  btn: {
    display: 'inline-block',
    padding: '12px 18px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Helvetica, Arial, sans-serif',
    boxShadow: '0 6px 14px rgba(0,0,0,.08)'
  }
};
