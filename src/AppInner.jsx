// src/App.jsx — Wrapper seguro para cablear Stripe sin tocar tu App grande.
// Renderiza tu App real (AppInner) y añade un efecto que arma la URL
// /api/checkout?pkg=…&addons=… y la inyecta en los botones “Pagar con tarjeta (Stripe)”.

import React, { useEffect } from 'react';
import AppInner from './AppInner.jsx'; // <-- TU App original, renombrada

// Utilidades de normalización
function canon(s) {
  return String(s || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Mapeo de etiquetas visibles -> IDs estables de add-on usados por el backend
// Mapeo de etiquetas visibles -> claves de add-on que espera el backend
const LABEL_MAP = new Map([
  ['mascota/personaje 2 poses',        'mascota'],
  ['mascota personaje 2 poses',        'mascota'],
  ['stickers de whatsapp hasta 15',    'stickers_whatsapp_15'],
  ['stickers de whatsapp',             'stickers_whatsapp_15'],
  ['guia de redes pdf',                'guia_redes_pdf'],
  ['guía de redes pdf',                'guia_redes_pdf'],
  ['guia registro impi pdf',           'guia_registro_impi_pdf'],
  ['guía registro impi pdf',           'guia_registro_impi_pdf'],
  ['tarjeta de presentacion',          'tarjeta_presentacion'],
  ['tarjeta de presentación',          'tarjeta_presentacion'],
  ['firma de correo',                  'firma_correo'],
  ['entrega express 72 h',             'entrega_express_72h'],
  ['ronda de cambios extra',           'ronda_cambios_extra'],
  ['asesoria con ceo 30 min',          'asesoria_ceo_30m'],
  ['asesoría con ceo 30 min',          'asesoria_ceo_30m'],
  ['disenador jefe senior',            'disenador_senior'],
  ['diseñador jefe senior',            'disenador_senior'],
]);
const VALID_ADDONS = new Set([...LABEL_MAP.values()]);
const VALID_PKGS   = new Set(['esencial', 'premium', 'pro']);

function labelFromInput(el) {
  if (!el) return '';
  if (el.id) {
    const lab = document.querySelector(`label[for="${el.id}"]`);
    if (lab) return lab.textContent || '';
  }
  const parent = el.closest('label, .addon, .card, .item, .checkbox, .input, .field') || el.parentElement;
  return parent ? (parent.textContent || '') : '';
}

function readPackage() {
  const r = document.querySelector('input[type="radio"][name="package"]:checked');
  if (r && VALID_PKGS.has(r.value?.toLowerCase())) return r.value.toLowerCase();

  const card =
    document.querySelector('[data-package-id].is-selected, [data-pkg].is-selected, [data-package="true"].selected');
  const cand = (card?.dataset?.packageId || card?.dataset?.pkg || '').toLowerCase();
  if (VALID_PKGS.has(cand)) return cand;

  return 'premium';
}

function readAddons() {
  const nodes = document.querySelectorAll([
    'input[type="checkbox"][data-addon-id]:checked',
    'input[type="checkbox"][data-addon]:checked',
    'input[type="checkbox"][value][data-addon]:checked',
    'input[type="checkbox"][name*="addon"]:checked',
    'input[type="checkbox"][value]:checked',
  ].join(','));

  const set = new Set();

  nodes.forEach((el) => {
    const cands = [
      el.dataset?.addonId,
      el.dataset?.addon,
      el.value,
      el.id,
      el.name,
    ].map(v => (v || '').toString().toLowerCase());

    let code = cands.find(v => VALID_ADDONS.has(v)) || null;

    if (!code) {
      const txt = canon(labelFromInput(el)).replace(/\s*\(.*?\)\s*/g, '').replace(/\s+/g, ' ').trim();
      if (LABEL_MAP.has(txt)) code = LABEL_MAP.get(txt);
    }

    if (code && VALID_ADDONS.has(code)) set.add(code);
  });

  return Array.from(set);
}

function buildCheckoutUrl() {
  const pkg = readPackage();
  const addons = readAddons();
  const qs = new URLSearchParams();
  qs.set('pkg', pkg);
  if (addons.length) qs.set('addons', addons.join(','));
  return `/api/checkout?${qs.toString()}`;
}

function wireButtons() {
  const sel = ['a[href^="/api/checkout"]','a.btn-stripe','button.btn-stripe'].join(',');
  const btns = new Set(Array.from(document.querySelectorAll(sel)));
  document.querySelectorAll('a,button').forEach((el) => {
    const t = canon(el.textContent || '');
    if (t.includes('pagar con tarjeta') || t.includes('stripe')) btns.add(el);
  });

  const onClick = (ev) => {
    try {
      const url = buildCheckoutUrl();
      if (ev.currentTarget.tagName === 'A') {
        ev.currentTarget.setAttribute('href', url);
      } else {
        ev.preventDefault();
        window.location.href = url;
      }
    } catch (e) {
      console.error(e);
      ev.preventDefault?.();
      alert('No pude abrir Stripe: ' + (e?.message || e));
    }
  };

  btns.forEach((b) => {
    b.removeEventListener('click', onClick);
    b.addEventListener('click', onClick);
  });

  return () => btns.forEach((b) => b.removeEventListener('click', onClick));
}

function StripeWire() {
  useEffect(() => {
    const detach = wireButtons();
    const rewire = () => wireButtons();
    window.addEventListener('hashchange', rewire);
    document.addEventListener('path3:rewire', rewire);
    return () => {
      detach?.();
      window.removeEventListener('hashchange', rewire);
      document.removeEventListener('path3:rewire', rewire);
    };
  }, []);
  return null;
}

export default function App() {
  return (
    <>
      <AppInner />
      <StripeWire />
    </>
  );
}
