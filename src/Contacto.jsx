import { useState } from "react";

export default function Contacto() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    company: "" // honeypot
  });
  const [status, setStatus] = useState("idle"); // idle|sending|ok|error

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("sending");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          // honeypot: si un bot lo rellena, el backend lo detecta y responde 204
          company: form.company || ""
        })
      });

      if (r.ok) {
        setStatus("ok");
        setForm({ name: "", email: "", message: "", company: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} style={{maxWidth: 520, margin: "2rem auto", display:"grid", gap:"12px"}}>
      <h2>Contáctanos</h2>

      {/* Honeypot: bots lo rellenan; humanos no lo ven */}
      <div style={{position:"absolute", left:"-10000px", top:"auto", width:1, height:1, overflow:"hidden"}}>
        <label>Company</label>
        <input
          name="company"
          autoComplete="off"
          tabIndex={-1}
          value={form.company}
          onChange={(e)=>setForm(f=>({...f, company: e.target.value}))}
        />
      </div>

      <label>Nombre</label>
      <input
        name="name"
        type="text"
        required
        minLength={2}
        value={form.name}
        onChange={(e)=>setForm(f=>({...f, name: e.target.value}))}
      />

      <label>Email</label>
      <input
        name="email"
        type="email"
        required
        value={form.email}
        onChange={(e)=>setForm(f=>({...f, email: e.target.value}))}
      />

      <label>Mensaje</label>
      <textarea
        name="message"
        required
        minLength={5}
        rows={5}
        value={form.message}
        onChange={(e)=>setForm(f=>({...f, message: e.target.value}))}
      />

      <button disabled={status==="sending"}>{status==="sending" ? "Enviando…" : "Enviar"}</button>

      {status==="ok" && <p style={{color:"green"}}>¡Gracias! Mensaje enviado.</p>}
      {status==="error" && <p style={{color:"crimson"}}>Ups, hubo un problema. Intenta de nuevo.</p>}
    </form>
  );
}
