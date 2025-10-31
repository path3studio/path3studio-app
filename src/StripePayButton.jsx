// src/StripePayButton.jsx
// Componente "drop-in" para crear el checkout con paquete + add-ons seleccionados.
// Úsalo sustituyendo tu <a> actual por: <StripePayButton label="Pagar con tarjeta (Stripe)" />
import React from 'react';

// Mapea textos visibles -> claves de add-on (si tus inputs no tienen value con la clave)
const LABEL_TO_KEY = new Map([
  ['Mascota/Personaje', 'mascota'],
  ['Stickers de WhatsApp', 'stickers_whatsapp_15'],
  ['Guía registro IMPI', 'guia_registro_impi_pdf'],
  ['Guía de Redes', 'guia_redes_pdf'],
  ['Tarjeta de presentación', 'tarjeta_presentacion'],
  ['Firma de correo', 'firma_correo'],
  ['Entrega Express', 'entrega_express_72h'],
  ['Ronda de cambios extra', 'ronda_cambios_extra'],
  ['Asesoría con CEO', 'asesoria_ceo_30m'],
  ['Diseñador jefe', 'disenador_senior'],
]);

function getPkgKeyFromDOM() {
  // 1) intenta leer radio/select con name="pkg"
  const pkgInput = document.querySelector('input[name="pkg"]:checked, select[name="pkg"]');
  if (pkgInput && pkgInput.value) return pkgInput.value;

  // 2) intenta inferir desde el texto del resumen ("Logo Premium", etc.)
  const summary = document.querySelector('#resumen, [data-order-summary], .order-summary, .tu-pedido, #tu-pedido');
  if (summary) {
    const txt = summary.textContent.toLowerCase();
    if (txt.includes('logo pro')) return 'pro';
    if (txt.includes('logo premium')) return 'premium';
    if (txt.includes('logo esencial')) return 'esencial';
  }

  // 3) fallback razonable
  return 'premium';
}

function getSelectedAddons() {
  const keys = new Set();

  // a) checkboxes con value = clave
  document.querySelectorAll('input[type="checkbox"]:checked').forEach((el) => {
    const val = (el.value || '').trim();
    if (val && /^[a-z0-9_]+$/i.test(val)) keys.add(val);
  });

  // b) si no tenían value con clave, intenta mapear por el label cercano
  if (keys.size === 0) {
    document.querySelectorAll('input[type="checkbox"]:checked').forEach((el) => {
      // busca etiqueta texto
      let labelText = '';
      const lab = el.closest('label') || el.parentElement;
      if (lab) labelText = lab.textContent || '';
      for (const [needle, key] of LABEL_TO_KEY.entries()) {
        if (labelText.includes(needle)) keys.add(key);
      }
    });
  }

  return Array.from(keys);
}

export default function StripePayButton({ label = 'Pagar con tarjeta (Stripe)', className = 'btn btn-primary' }) {
  async function handleClick(e) {
    e.preventDefault();
    const pkg = getPkgKeyFromDOM();
    const addons = getSelectedAddons();

    try {
      // Llama por POST (más robusto) y redirige con la URL devuelta
      const resp = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pkg, addons }),
      });
      const data = await resp.json();
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        alert('No se pudo crear el Checkout. Revisa los logs.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creando el Checkout.');
    }
  }

  return (
    <a href="#" className={className} onClick={handleClick}>
      {label}
    </a>
  );
}
