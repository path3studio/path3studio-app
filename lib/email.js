import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail({ to, subject, html, replyTo }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Falta RESEND_API_KEY');
  }
  const from = process.env.CONTACT_FROM || process.env.EMAIL_FROM || 'no-reply@example.com';
  const toList = Array.isArray(to) ? to : [to];

  return await resend.emails.send({
    from,
    to: toList,
    subject,
    html,
    reply_to: replyTo,
  });
}

export function kvTable(obj = {}) {
  const esc = (v) => String(v ?? '').toString().trim();
  const rows = Object.entries(obj)
    .map(([k, v]) => `<tr><td style="padding:6px 8px;border:1px solid #eee"><b>${k}</b></td><td style="padding:6px 8px;border:1px solid #eee">${esc(v)}</td></tr>`)
    .join('');
  return `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #eee">${rows}</table>`;
}
