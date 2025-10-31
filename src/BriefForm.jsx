// src/BriefForm.jsx
import React, { useState } from 'react';
import { submitBrief } from './paymentsConfig';

export default function BriefForm() {
  const [form, setForm] = useState({ nombre:'', email:'', telefono:'', empresa:'', mensaje:'' });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    try {
      await submitBrief(form);
      setOk(true);
      setForm({ nombre:'', email:'', telefono:'', empresa:'', mensaje:'' });
    } catch (e) {
      console.error(e);
      alert('No se pudo enviar el brief');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={styles.form} autoComplete="on">
      <h3 style={styles.h3}>Brief</h3>
      <div style={styles.row}>
        <input name="nombre"   placeholder="Nombre"   value={form.nombre}   onChange={onChange} required style={styles.input}/>
        <input name="email"    placeholder="Email"    value={form.email}    onChange={onChange} required style={styles.input}/>
      </div>
      <div style={styles.row}>
        <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={onChange} style={styles.input}/>
        <input name="empresa"  placeholder="Empresa"  value={form.empresa}  onChange={onChange} style={styles.input}/>
      </div>
      <textarea name="mensaje" placeholder="Cuéntanos lo que necesitas" value={form.mensaje} onChange={onChange} rows={4} style={styles.textarea}/>
      <button type="submit" disabled={loading} style={styles.btn}>{loading ? 'Enviando…' : 'Enviar brief'}</button>
      {ok && <p style={styles.ok}>¡Listo! Te mandamos un correo de confirmación.</p>}
      {/* honeypot contra bots */}
      <input type="text" name="company" style={{display:'none'}} tabIndex={-1} autoComplete="off" />
    </form>
  );
}

const styles = {
  form: { maxWidth: 600, margin: '16px auto', padding: 16, borderRadius: 12, border: '1px solid #eee' },
  h3: { margin: '0 0 12px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Helvetica, Arial, sans-serif' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  input: { padding: 10, borderRadius: 8, border: '1px solid #ddd' },
  textarea: { padding: 10, borderRadius: 8, border: '1px solid #ddd', width: '100%', marginBottom: 12 },
  btn: { padding: '10px 16px', borderRadius: 10, border: 'none', background: '#111', color: '#fff', cursor: 'pointer' },
  ok: { color: 'green', marginTop: 8 }
};
