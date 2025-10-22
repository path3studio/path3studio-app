// === GA4: utilidades + listeners genéricos (PROD únicamente) ===
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

const IS_PROD = import.meta?.env?.PROD && import.meta?.env?.VITE_ENABLE_ANALYTICS === 'true';
const DEBUG = /\bga_debug=1\b/.test(window.location.search);

function send(eventName, params = {}) {
  if (!IS_PROD) return;
  try {
    window.gtag('event', eventName, { ...params, debug_mode: DEBUG });
  } catch (e) {/* noop */}
}

send('ga_ping', { path: location.pathname, title: document.title });

document.addEventListener('click', (e) => {
  const el = e.target.closest('button, a, input[type="submit"], [role="button"]');
  if (!el) return;

  const text = (el.textContent || el.value || '').trim().toLowerCase();
  const href = (el.getAttribute && el.getAttribute('href')) || '';
  const isPay = /paypal\.com|checkout\.stripe\.com/.test(href);

  if (isPay) {
    send('begin_checkout', {
      method: /paypal/.test(href) ? 'paypal' : (/stripe/.test(href) ? 'stripe' : 'other'),
      location: location.pathname,
      button_text: text || '(sin-texto)',
    });
    return;
  }

  send('ui_click', {
    tag: el.tagName.toLowerCase(),
    button_text: text || '(sin-texto)',
    href: href || null,
    location: location.pathname,
  });
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('form');
  if (!form) return;
  send('generate_lead', {
    form_id: form.id || '(sin-id)',
    action: form.getAttribute('action') || '(sin-action)',
    location: location.pathname,
  });
});

(() => {
  const pushState = history.pushState;
  const replaceState = history.replaceState;
  function onChange(){ send('spa_navigate', { path: location.pathname }); }
  history.pushState = function(){ pushState.apply(this, arguments); onChange(); };
  history.replaceState = function(){ replaceState.apply(this, arguments); onChange(); };
  window.addEventListener('popstate', onChange);
})();
