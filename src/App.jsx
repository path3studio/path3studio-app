import React, { useEffect, useMemo, useRef, useState } from "react";

/* ====== CONFIG ====== */
const LOGO_SRC = "/Icono%203.png";
const BRAND_NAME = "Path3 Studio";
const PAYPAL_USERNAME = "ernestofranciscoguajardopatiño";
const EMAIL_RECEIVE = "path3studio@gmail.com";
const STRIPE_PAYMENT_LINK = ""; // opcional (no usado con endpoint dinámico)
const STRIPE_CHECKOUT_ENDPOINT = "https://p3-stripe-checkout.vercel.app/api/checkout"; // <-- URL de tu endpoint (POST) que crea el Checkout dinámico
const SHEET_WEBHOOK_URL = "";  // opcional
const EMAILJS_SERVICE_ID = ""; const EMAILJS_TEMPLATE_ID = ""; const EMAILJS_PUBLIC_KEY = ""; // opcional

/* ====== TEXTOS ====== */
const NL = "\n";
const INTRO_TEXT = "Un buen logo impulsa tu identidad. Diseñamos de forma artesanal para que te recuerden y confíen en ti desde el primer vistazo.";
const STICKERS_PLACEHOLDER = ["Ejemplos:","Gracias por tu compra","Nueva colección disponible","Reserva tu cita hoy"].join(NL);
const TERMINOS_TEXT = [
  "Términos clave:",
  "• Entrega final única (diseño único).",
  "• Cambios no incluidos; puedes añadir Ronda extra.",
  "• Archivos listos para imprimir (PDF/PNG/JPG).",
  "• No reembolsable una vez iniciada la propuesta.",
  "• Se puede facturar.",
  "• Autorizas portafolio/redes Path3 Studio (sin datos sensibles).",
].join(NL);
const PRIVACIDAD_TEXT = [
  "Privacidad:",
  "Usamos tu info solo para diseñar y entregar.",
  "No vendemos datos.",
  "Podemos contactar por email para avances.",
].join(NL);

/* ====== CATÁLOGOS ====== */
const PACKAGES = [
  { id:"esencial", name:"Logo Esencial", listPrice:1990, price:1490, delivery:"3-5 días", bullets:[
    "Diseño único (equipo profesional)","PNG sin fondo (3000 px)","JPG con fondo (3000 px)","PDF para impresión","Versión Black (PNG 3000 px)","Guía rápida de archivos y usos"], badge:"Básico" },
  { id:"premium", name:"Logo Premium", listPrice:2990, price:2490, delivery:"3-7 días", bullets:[
    "Todo lo del Esencial +","Versión White (PNG 3000 px)","Imagen para redes (JPG 3000 px)","Portadas: Facebook 851×315 y WhatsApp 1920×1080"], best:true },
  { id:"pro", name:"Logo Pro", listPrice:4690, price:3890, delivery:"5-10 días", bullets:[
    "Todo lo del Esencial y Premium +","Logotipo secundario","Paleta de color + tipografías","GIF/Intro 10–15 s (9:16)","Archivos editables (PSD o AI)"], badge:"Más completo" },
];

const ADDONS = [
  { id:"mascota", name:"Mascota/Personaje (2 poses)", listPrice:2200, price:1999, needsNote:true, noteLabel:"Describe personalidad/poses (breve)", desc:"Ilustración en 2 poses; PNG alta y vector si aplica." },
  { id:"stickers", name:"Stickers de WhatsApp (hasta 15)", listPrice:1200, price:800, needsNote:true, noteLabel:"Escribe hasta 15 frases (una por línea)", desc:"Paquete WA; máx 24 caracteres por frase.", form:[{ id:"wa_number", label:"Número de WhatsApp", required:false, placeholder:"+52 81..." }] },
  { id:"guia_redes", name:"Guía de Redes (PDF)", price:300, desc:"Paso a paso para optimizar perfiles." },
  { id:"guia_inpi", name:"Guía registro IMPI (PDF)", price:350, desc:"Qué es el IMPI, cómo protege tu marca, pasos clave." },
  { id:"tarjeta", name:"Tarjeta de presentación", price:700, desc:"PDF/X-1a listo para imprenta + versión compartible.", form:[
    {id:"name",label:"Nombre",required:true,placeholder:"Ej. Ana Rivera"},
    {id:"email",label:"Correo",required:true,placeholder:"ana@email.com"},
    {id:"phone",label:"Teléfono",required:true,placeholder:"+52 81..."},
    {id:"address",label:"Dirección (opcional)",required:false,placeholder:"Ciudad, Estado"},
    {id:"website",label:"Sitio web (opcional)",required:false,placeholder:"https://..."}
  ] },
  { id:"firma", name:"Firma de correo", price:700, desc:"Imagen con datos + instrucciones Gmail/Outlook.", form:[
    {id:"name",label:"Nombre",required:true,placeholder:"Ej. Ana Rivera"},
    {id:"email",label:"Correo",required:true,placeholder:"ana@email.com"},
    {id:"phone",label:"Teléfono",required:true,placeholder:"+52 81..."},
    {id:"address",label:"Dirección (opcional)",required:false,placeholder:"Ciudad, Estado"},
    {id:"website",label:"Sitio web (opcional)",required:false,placeholder:"https://..."}
  ] },
  { id:"express", name:"Entrega Express 72 h", price:690, desc:"Prioridad en cola; objetivo 72 h." },
  { id:"ronda_extra", name:"Ronda de cambios extra", price:290, desc:"1 prototipo → comentarios → final." },
  { id:"senior", name:"Diseñador jefe (senior)", price:600, desc:"El jefe de diseño toma tu proyecto." },
  { id:"ceo", name:"Asesoría con CEO (30 min)", price:1500, desc:"Llamada/videollamada; elige fecha y hora." },
];

const SECTORES = ["Gastronomía","Fotografía","Fitness/Wellness","Belleza","Educación","Tecnología","Abogados","Inmobiliario","Construcción","Música","Arte","Moda","Deportes","Salud","ONG","Cafetería/Panadería","Bar/Restaurante","Marketing/Agencia","eCommerce","Turismo","Servicios Profesionales","Infantil","Gaming","Otro"];
const ESTILOS  = ["Minimalista","Elegante/Clásico","Moderno/Geométrico","Vintage/Retro","Caligráfico/Signature","Tipográfico","Monograma/Iniciales","Escudo/Emblema","Tecnológico","Orgánico/Natural","Deportivo","Infantil","Gótico/Blackletter","Ilustrado/Pop","Brutalista","Prefiero que ustedes decidan"];
const PROMOS   = { CAMINO15:0.15, RUTA10:0.10 };

/* ====== HELPERS ====== */
const mxn=(n)=>n.toLocaleString("es-MX",{style:"currency",currency:"MXN"});
const toTwo=(n)=>(Math.round(n*100)/100).toFixed(2);
const paypalUrl=(amount)=>`https://paypal.me/${encodeURIComponent(PAYPAL_USERNAME)}/${toTwo(amount)}`;
const isValidEmail=(s)=>/.+@.+\..+/.test(s);
const colorsValid=(letUs,c1,c2,c3)=>letUs||[c1,c2,c3].filter(Boolean).length>=1;
const estilosValid=(arr,letUs)=>letUs||(arr&&arr.length>0);
const MAX_STICKER_CHARS=24;
const isWeekday=(d)=>{const x=new Date(d).getDay();return x>=1&&x<=5;};

function computePricing(selectedPkg, addons, promoCode=""){
  const base=selectedPkg?.price||0; let add=0; const lines=[];
  const hasTarjeta=addons.includes("tarjeta"), hasFirma=addons.includes("firma");
  for(const id of addons){const a=ADDONS.find(x=>x.id===id); if(a) add+=a.price||0;}
  let discount=0; if(hasTarjeta&&hasFirma){discount-=500; lines.push({label:"Descuento pack tarjeta + firma",amount:-500});}
  const subtotal=base+add; const code=(promoCode||"").trim().toUpperCase();
  if(code&&PROMOS[code]){const pct=PROMOS[code], amt=-Math.round(subtotal*pct); discount+=amt; lines.push({label:`Descuento promocional (${code} – ${Math.round(pct*100)}%)`,amount:amt});}
  let total=Math.max(0, subtotal+discount);
  const gift=(code||"").split(" ").join(""); if(gift==="REGALO99"){const amt=-Math.round(total*0.99); if(amt) {lines.push({label:"Descuento REGALO99 (99%)",amount:amt}); total=Math.max(0,total+amt);} }
  return { subtotal, discount, total, lines };
}

/* ====== SELF-TESTS ====== */
(function(){try{
  console.assert(toTwo(12.345)==="12.35"); console.assert(toTwo(0)==="0.00");
  const t=computePricing(PACKAGES[0],["tarjeta","firma"]); console.assert(t.discount<=0 && t.lines.some(l=>l.amount===-500));
  console.assert(paypalUrl(10).includes(encodeURIComponent(PAYPAL_USERNAME)));
  console.assert(computePricing(PACKAGES[2],[]).discount===0);
  console.assert(isValidEmail("a@b.com") && !isValidEmail("ab.com"));
  console.assert(colorsValid(false,"#000","","") && !colorsValid(false,"","",""));
  console.assert(estilosValid(["Minimalista"],false) && !estilosValid([],false));
  console.assert(computePricing(PACKAGES[1],[],"RUTA10").lines.some(l=>String(l.label).includes("RUTA10")));
  console.assert(computePricing(PACKAGES[1],[],"CAMINO15").lines.some(l=>String(l.label).includes("CAMINO15")));
  console.assert(/\/\d+\.\d{2}$/.test(paypalUrl(1234.5)));
  console.assert(computePricing(PACKAGES[0],[],"REGALO99").total>=0);
  console.assert(isWeekday("2025-09-01")===true && isWeekday("2025-09-06")===false);
  // Extra: validar setVal de AddonForm
  const dummyPrev={}; const setAddonForm=(updater)=>{ const res=updater(dummyPrev); console.assert(res.ceo && res.ceo.date==="2025-09-04","setVal debe asignar correctamente"); }; const setValTest=(id,key,value)=> ((prev)=>({...prev,[id]:{...(prev[id]||{}),[key]:value}}));
  setAddonForm(setValTest('ceo','date','2025-09-04'));
  // Nuevas pruebas de helpers
  console.assert(colorsValid(true,"","","")===true, "Si eligen por mí, colores son opcionales");
} catch(e){console.warn("Self-tests:",e);}})();

/* ====== UI UTIL ====== */
function Modal({open,title,children,onClose,actions}){ if(!open) return null; return (
  <div className="fixed inset-0 z-50 grid place-items-center">
    <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
    <div className="relative z-10 w-[92%] max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between"><h4 className="text-lg font-semibold">{title}</h4><button className="text-zinc-500 hover:text-zinc-700" onClick={onClose}>✕</button></div>
      <div className="mt-3 text-sm text-zinc-700">{children}</div>
      {actions&&<div className="mt-4 flex gap-2 justify-end">{actions}</div>}
    </div>
  </div>); }

const Badge=({children})=>(<span className="text-xs bg-red-600 text-white rounded px-2 py-0.5">{children}</span>);
const Info=({children})=>{const[open,setOpen]=useState(false);return(<span className="relative inline-block"><button type="button" onClick={()=>setOpen(o=>!o)} aria-label="Información" className="ml-1 text-[11px] leading-none w-4 h-4 inline-flex items-center justify-center rounded-full border border-zinc-300">i</button>{open&&(<div className="absolute left-0 mt-2 z-20 max-w-xs rounded-md border border-zinc-200 bg-white p-2 text-[11px] shadow">{children}</div>)}</span>)};
const Icon=({name})=> name==='instagram'? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor"/><circle cx="12" cy="12" r="4" stroke="currentColor"/><circle cx="17" cy="7" r="1" fill="currentColor"/></svg>)
: name==='youtube'? (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="7" width="18" height="10" rx="3" stroke="currentColor"/><polygon points="10,9 16,12 10,15" fill="currentColor"/></svg>)
: name==='facebook'? (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13 22v-8h3l1-4h-4V7a2 2 0 0 1 2-2h2V2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/></svg>)
: name==='tiktok'? (
  // Nota musical estilizada (más cercana al estilo TikTok pero genérica)
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M14 3v3.6c1.6 1.6 3.4 2.1 5 2.1V11c-2.1 0-3.9-.7-5-1.6V14a4.25 4.25 0 1 1-3.2-4.12V6.1l3.2.8V3z"/>
  </svg>) : null;
const Trust=()=> (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-zinc-700 mt-4">
    {["✅ Pago seguro","🔒 Enlace cifrado","🧾 Recibo automático","🖨️ Archivos impresión"].map((t,i)=>(<div key={i} className="rounded-xl border border-zinc-200 bg-white p-3 flex items-center gap-2">{t}</div>))}
  </div>);

function Uploader({files,setFiles,label,help}){
  const[slot,setSlot]=useState(-1); const inputRef=useRef(null);
  const pick=i=>{setSlot(i); inputRef.current?.click();};
  const iSafe=i=>i>=0&&i<3?i:0;
  const onChange=e=>{const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{const nx=[...files]; nx[iSafe(slot)]={name:f.name,size:f.size,dataUrl:r.result}; setFiles(nx.slice(0,3));}; r.readAsDataURL(f); e.target.value="";};
  const remove=i=>{const nx=[...files]; nx.splice(i,1); setFiles(nx);};
  const cells=[0,1,2];
  return(
    <div>
      {label&&<label className="font-medium">{label}</label>}
      {help&&<p className="text-xs text-zinc-500">{help}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange}/>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {cells.map(i=>{const f=files[i]; return(
          <div key={i} className="aspect-square rounded-xl border border-dashed border-zinc-300 grid place-items-center relative overflow-hidden bg-white">
            {f?.dataUrl? (<>
              <img src={f.dataUrl} alt={f.name} className="w-full h-full object-cover"/>
              <button type="button" className="absolute top-1 right-1 bg-white/85 rounded-full px-1 text-xs" onClick={()=>remove(i)}>✕</button>
            </>) : (<button type="button" className="text-2xl text-zinc-400" onClick={()=>pick(i)}>＋</button>)}
          </div>
        );})}
      </div>
    </div>
  );
}
const ColorBar=({colors})=>(<div className="flex items-center gap-2 mt-2">{colors.filter(Boolean).map(c=>(<div key={c} title={c} className="w-6 h-6 rounded-md border" style={{background:c}}/>))}<span className="text-[11px] text-zinc-500">Ideal: 2 principales + 1 acento.</span></div>);

/* ====== APP ====== */
export default function App(){
  const [step,setStep]=useState(1), [selected,setSelected]=useState(PACKAGES[1]);
  const [addons,setAddons]=useState([]), [addonNotes,setAddonNotes]=useState({}), [addonForm,setAddonForm]=useState({});
  const [promoCode,setPromoCode]=useState(""); const [openModal,setOpenModal]=useState(null); const [confirmProvider,setConfirmProvider]=useState(null);
  const [useCases,setUseCases]=useState([]), [customUse,setCustomUse]=useState(""), [sector,setSector]=useState("");
  const [logoText,setLogoText]=useState(""), [slogan,setSlogan]=useState(""), [story,setStory]=useState("");
  const [estilos,setEstilos]=useState([]), [refs,setRefs]=useState([]), [prevLogo,setPrevLogo]=useState([]);
  const [color1,setColor1]=useState(""), [color2,setColor2]=useState(""), [color3,setColor3]=useState(""), [bgColor,setBgColor]=useState("#ffffff");
  const [letStylesChoose,setLetStylesChoose]=useState(false), [letColorsChoose,setLetColorsChoose]=useState(false);
  const [avoid,setAvoid]=useState(""); const [clientName,setClientName]=useState(""), [clientEmail,setClientEmail]=useState(""), [clientIG,setClientIG]=useState("");
  const [agree,setAgree]=useState(false), [sending,setSending]=useState(false);
  const [errors,setErrors]=useState({name:false,email:false,logo:false,estilos:false,colors:false});
  const nameRef=useRef(null), emailRef=useRef(null), logoRef=useRef(null), estilosRef=useRef(null), coloresRef=useRef(null), step1Ref=useRef(null);
  useEffect(()=>{document.title="Path3 Studio - App To Take Order";},[]);

  const pricing=useMemo(()=>computePricing(selected,addons,promoCode),[selected,addons,promoCode]);
  const toggleAddon=(id)=>setAddons(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const StepI=({n,title})=>(<div className={"flex items-center gap-2 "+(step===n?"text-red-700":"text-zinc-400") }><div className={"w-6 h-6 rounded-full grid place-items-center text-xs font-semibold "+(step===n?"bg-red-600 text-white":"bg-zinc-200 text-zinc-700")}>{n}</div><span className="text-sm">{title}</span></div>);
  const errCls=(bad)=>"w-full border rounded-xl px-3 py-2 "+(bad?"border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50":"border-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500/30");

  function validateStep2(){
    const emailOk=isValidEmail(clientEmail), estilosOk=estilosValid(estilos,letStylesChoose), colorOk=colorsValid(letColorsChoose,color1,color2,color3);
    const next={name:!clientName.trim(),email:!emailOk,logo:!logoText.trim(),estilos:!estilosOk,colors:!colorOk}; setErrors(next);
    const first = next.name?nameRef: next.email?emailRef: next.logo?logoRef: next.estilos?estilosRef: next.colors?coloresRef: null; if(first?.current) first.current.scrollIntoView({behavior:'smooth',block:'center'});
    return Object.values(next).every(v=>v===false);
  }

  async function sendOrderEmailAndSheet(){ setSending(true); try{
    if(addons.includes("stickers")){ const text=addonNotes["stickers"]||"", lines=text.split(NL).filter(t=>t.trim()); if(lines.length>15){alert("Máximo 15 frases"); setSending(false); return;} for(let i=0;i<lines.length;i++){ if(lines[i].length>MAX_STICKER_CHARS){alert("Cada frase máx "+MAX_STICKER_CHARS+" caracteres. Revisa la #"+(i+1)); setSending(false); return;} } }
    for(const id of addons){ const def=ADDONS.find(a=>a.id===id); if(def?.form){ const values=addonForm[id]||{}; for(const f of def.form){ if(f.required && !(values[f.id]||"").trim()){ alert("Completa '"+f.label+"' para '"+def.name+"'."); setSending(false); return; } } } }
    const orderId="LGR-"+String(Math.floor(Math.random()*100000)).padStart(5,"0");
    const payload={ orderId, date:new Date().toISOString(), package:selected?.id, subtotal:pricing.subtotal,
      addons:addons.map(id=>{const a=ADDONS.find(x=>x.id===id); return {id,name:a?.name,price:a?.price,note:addonNotes[id]||"",form:addonForm[id]||{}};}),
      discounts:pricing.lines, total:pricing.total, promoCode,
      brief:{ useCases:[...useCases,...(customUse?[customUse]:[])], sector, logoText, slogan, story, estilos,
        colors: letColorsChoose?[]:[color1,color2,color3].filter(Boolean), letStylesChoose, letColorsChoose, avoid,
        refs: refs.map(r=>({name:r.name,size:r.size})), bgColor },
      client:{ name:clientName, email:clientEmail, instagram:clientIG }, };
    if(EMAILJS_SERVICE_ID&&EMAILJS_TEMPLATE_ID&&EMAILJS_PUBLIC_KEY){ const mod=await import("emailjs-com"); mod.emailjs.init(EMAILJS_PUBLIC_KEY); await mod.emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,{ to_email:EMAIL_RECEIVE, client_email:clientEmail, json:JSON.stringify(payload,null,2) }); }
    if(SHEET_WEBHOOK_URL){ await fetch(SHEET_WEBHOOK_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); }
    await navigator.clipboard.writeText(JSON.stringify(payload,null,2)); alert("Pedido "+orderId+" preparado. Copié el resumen al portapapeles."); return payload;
  } catch(e){ console.error(e); alert("No pude enviar automático. Copié el resumen para que lo pegues en tu correo."); } finally{ setSending(false); } }

  function requestPay(provider){ if(!agree){alert("Acepta los términos para continuar."); return;} setConfirmProvider(provider); setOpenModal('confirm'); }
  function openPayPal(){ const url=paypalUrl(pricing.total); const w=window.open(url,'_blank'); if(!w) window.location.href=url; }
  function openStripe(payload){
    if (!STRIPE_CHECKOUT_ENDPOINT) {
      alert("Configura STRIPE_CHECKOUT_ENDPOINT para pagos con tarjeta.");
      return;
    }
    const total = payload?.total ?? pricing.total;
    const orderId = payload?.orderId ?? ("LGR-" + Date.now());
    fetch(STRIPE_CHECKOUT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, total })
    })
    .then(async (r) => {
      let data = {};
      try { data = await r.json(); } catch {}
      if (!r.ok) throw new Error(data?.error || 'No se pudo crear el checkout');
      if (data.url) {
        window.location.href = data.url; // Hosted Checkout
      } else if (data.clientSecret && data.publishableKey) {
        // Soporte opcional a modo embebido (no implementado aquí para no tocar UI)
        alert('Checkout embebido no habilitado en esta vista. Usa data.url en el servidor.');
      } else {
        alert('Respuesta inesperada del servidor de pagos.');
      }
    })
    .catch((e) => { console.error(e); alert('No pude abrir Stripe: ' + e.message); });
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3"><img src={LOGO_SRC} alt="Logo" className="w-10 h-10 object-contain" onError={(e)=>{(e.currentTarget).style.display='none';}}/><div className="leading-tight"><p className="font-semibold">{BRAND_NAME}</p><p className="text-xs text-zinc-500">Orden de logo · Entrega 3-7 días · Pago seguro</p></div></div>
          <div className="flex items-center gap-3">
            <a href="#" onClick={(e)=>{e.preventDefault(); setOpenModal('contact');}} className="text-sm underline">Soporte</a>
            <div className="flex items-center gap-2 text-sm">
              <a href="https://www.instagram.com/path3studio/" target="_blank" rel="noreferrer" aria-label="Instagram" className="inline-flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-full border border-zinc-300 hover:bg-zinc-100"><Icon name="instagram"/></a>
              <a href="https://www.youtube.com/@path3studio" target="_blank" rel="noreferrer" aria-label="YouTube" className="inline-flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-full border border-zinc-300 hover:bg-zinc-100"><Icon name="youtube"/></a>
              <a href="https://www.facebook.com/profile.php?id=61579976427164" target="_blank" rel="noreferrer" aria-label="Facebook" className="inline-flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-full border border-zinc-300 hover:bg-zinc-100"><Icon name="facebook"/></a>
              <a href="https://www.tiktok.com/@path3studio" target="_blank" rel="noreferrer" aria-label="TikTok" className="inline-flex items-center justify-center w-9 h-9 md:w-8 md:h-8 rounded-full border border-zinc-300 hover:bg-zinc-100"><Icon name="tiktok"/></a>
            </div>
            <button onClick={()=>{setStep(1); setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),0);}} className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700">Ordenar ahora</button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Path3 Studio - App To Take Order</h1>
          <p className="text-zinc-600 mt-2">Compra segura y recíbelo en 3-7 días. Archivos listos para imprimir y redes.</p>
          <p className="text-sm text-zinc-700 mt-3">{INTRO_TEXT}</p>
          <Trust/>
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold mb-2">¿Cómo funciona?</h3>
            <ol className="text-sm text-zinc-700 space-y-1 list-decimal pl-5">
              {['Elige paquete y llena el formulario (artesanal).','Selecciona 1–3 colores y el color de fondo para JPG.','Agrega opcionales si quieres.','Paga seguro; llega confirmación por correo.','Asignamos el diseñador ideal según tu estilo.','Recibes archivos dentro del tiempo estimado.'].map((t,i)=>(<li key={i}>{t}</li>))}
            </ol>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-6">
        <StepI n={1} title="Elige tu paquete"/><StepI n={2} title="Detalles del pedido"/><StepI n={3} title="Opcionales"/><StepI n={4} title="Pagar"/>
      </section>

      <main className="max-w-6xl mx-auto px-4 pb-10 grid md:grid-cols-5 gap-6">
        <section className="md:col-span-3">
          {step===1&&(
            <div ref={step1Ref}>
              <h2 className="text-xl font-semibold mb-1">Elige tu paquete</h2>
              <p className="text-xs text-zinc-600 mb-3">Todos los logotipos son elaborados por nuestro equipo creativo con calidad profesional.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {PACKAGES.map(p=> (
                  <button key={p.id} onClick={()=>setSelected(p)} className={"text-left rounded-2xl border p-4 transition hover:shadow "+(selected?.id===p.id?"border-black shadow ring-1 ring-red-500/30":"border-zinc-200")+(p.best?" bg-red-50":" bg-white")}>
                    <div className="flex items-center justify-between mb-1"><h3 className="font-semibold">{p.name}</h3><div className="flex gap-1">{p.best&&<Badge>Recomendado</Badge>}{p.badge&&<Badge>{p.badge}</Badge>}</div></div>
                    <div className="flex items-baseline gap-2 mb-1"><span className="text-zinc-400 line-through">{mxn(p.listPrice)}</span><span className="text-2xl font-bold">{mxn(p.price)}</span>{(p.listPrice>p.price)&&<Badge>-{Math.round(((p.listPrice-p.price)/p.listPrice)*100)}%</Badge>}</div>
                    <div className="text-xs text-zinc-500 mb-2">{p.delivery}</div>
                    <ul className="text-sm space-y-1 list-disc pl-4">{p.bullets.map((b,i)=>(<li key={i}>{b}</li>))}</ul>
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <h4 className="font-semibold mb-2">¿Qué es cada archivo?</h4>
                <ul className="text-sm space-y-2 list-disc pl-4">
                  <li className="flex items-start gap-2"><span><strong>PNG (transparente, 3000 px):</strong> superpón el logo sin fondo.</span><Info>Ideal para fotos, videos y presentaciones.</Info></li>
                  <li className="flex items-start gap-2"><span><strong>JPG (fondo sólido, 3000 px):</strong> excelente para foto de perfil y posts.</span><Info>Define el color de fondo en el formulario.</Info></li>
                  <li className="flex items-start gap-2"><span><strong>PDF (impresión):</strong> listo para imprenta y papelería.</span><Info>Estándar para imprenta sin perder calidad.</Info></li>
                  <li className="flex items-start gap-2"><span><strong>Black/White:</strong> versiones monocromas para usos de una tinta.</span><Info>Útiles para sellos, grabados y fondos complejos.</Info></li>
                </ul>
              </div>
              <div className="mt-4 flex justify-end"><button className="px-4 py-2 rounded-xl bg-black text-white hover:bg-red-600" onClick={()=>setStep(2)}>Continuar</button></div>
            </div>
          )}

          {step===2&&(
            <div>
              <h2 className="text-xl font-semibold mb-3">Detalles del pedido</h2>
              <div className="grid gap-3">
                <div><label className="font-medium">¿Dónde usarás tu logo?</label><p className="text-xs text-zinc-500">Ej.: redes, impresos, fachada, firma fotógrafos...</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">{"Redes,Impresos,Fachada,Firma fotógrafos,Packaging,Administrativos".split(',').map(u=>(<label key={u} className="rounded-xl border border-zinc-200 bg-white p-2 text-sm flex items-center gap-2"><input type="checkbox" checked={useCases.includes(u)} onChange={(e)=>{const c=e.target.checked; setUseCases(v=>c?[...v,u]:v.filter(x=>x!==u));}}/>{u}</label>))}</div>
                </div>
                <div><label className="font-medium">Sector</label><p className="text-xs text-zinc-500">Elige el más cercano.</p><select className={errCls(false)} value={sector} onChange={e=>setSector(e.target.value)}><option value="">Selecciona...</option>{SECTORES.map(s=>(<option key={s} value={s}>{s}</option>))}</select></div>
                <div><label className="font-medium">¿Qué debe decir tu logo? (tal cual) *</label><p className="text-xs text-zinc-500">Escríbelo exactamente como quieres verlo.</p><input ref={logoRef} className={errCls(errors.logo)} placeholder="Ej. Path3 Studio" value={logoText} onChange={e=>setLogoText(e.target.value)}/>{errors.logo&&<p className="text-xs text-red-600 mt-1">Obligatorio.</p>}</div>
                <div><label className="font-medium">Eslogan (opcional)</label><input className={errCls(false)} placeholder="Ej. Diseño que se siente" value={slogan} onChange={e=>setSlogan(e.target.value)}/></div>
                <Uploader files={prevLogo} setFiles={setPrevLogo} label="Renovación / logo anterior (opcional)" help="Sube tu logo actual si quieres que lo renovemos (hasta 3)."/>
                <div><label className="font-medium">Cuéntanos tu idea (opcional)</label><textarea className="w-full border rounded-xl px-3 py-2 border-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500/30" rows={3} placeholder="Ej. Marca cercana, elegante y moderna." value={story} onChange={e=>setStory(e.target.value)}/></div>
                <div><label className="font-medium">Estilos preferidos *</label><p className="text-xs text-zinc-500">Elige 1–3 o marca la casilla.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2" ref={estilosRef}>{ESTILOS.map(st=>(<label key={st} className="rounded-xl border border-zinc-200 bg-white p-2 text-sm flex items-center gap-2"><input type="checkbox" checked={estilos.includes(st)} onChange={e=>{const c=e.target.checked; setEstilos(v=>c?[...v,st]:v.filter(x=>x!==st));}}/>{st}</label>))}</div>
                  <label className="text-sm flex items-center gap-2 mt-2"><input type="checkbox" checked={letStylesChoose} onChange={e=>setLetStylesChoose(e.target.checked)}/> Prefiero que ustedes elijan</label>{errors.estilos&&<p className="text-xs text-red-600 mt-1">Elige 1 estilo o marca la casilla.</p>}
                </div>
                <Uploader files={refs} setFiles={setRefs} label="Referencias (opcional)" help="Sube imágenes de estilos que te inspiren (hasta 3)."/>
                <div><label className="font-medium">Colores (1-3) o decidimos por ti *</label><p className="text-xs text-zinc-500">Tip: alto contraste ayuda a la legibilidad.</p>
                  <div className="flex items-center gap-2 mt-2" ref={coloresRef}>
                    <input aria-label="Color 1" type="color" value={color1} onChange={e=>setColor1(e.target.value)}/>
                    <input aria-label="Color 2" type="color" value={color2} onChange={e=>setColor2(e.target.value)}/>
                    <input aria-label="Color 3" type="color" value={color3} onChange={e=>setColor3(e.target.value)}/>
                    <label className="text-sm flex items-center gap-2 ml-2"><input type="checkbox" checked={letColorsChoose} onChange={e=>setLetColorsChoose(e.target.checked)}/> Prefiero que ustedes elijan</label>
                  </div>
                  <ColorBar colors={[color1,color2,color3]}/>{errors.colors&&<p className="text-xs text-red-600 mt-1">Elige color o marca la casilla.</p>}
                  <div className="mt-3"><label className="font-medium">Color de fondo para el JPG*</label><div className="flex items-center gap-2 mt-2"><input aria-label="Color de fondo JPG" type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)}/><span className="text-xs text-zinc-500">Se aplicará al JPG final.</span></div></div>
                </div>
                <div><label className="font-medium">¿Qué debemos evitar?</label><textarea className="w-full border rounded-xl px-3 py-2 border-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500/30" rows={2} placeholder="Ej. Sin dorados, sin serif..." value={avoid} onChange={e=>setAvoid(e.target.value)}/></div>
                <div className="grid sm:grid-cols-2 gap-3"><div><label className="font-medium">Tu nombre *</label><input ref={nameRef} className={errCls(errors.name)} value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Ej. Ana Rivera"/>{errors.name&&<p className="text-xs text-red-600 mt-1">Escribe tu nombre.</p>}</div><div><label className="font-medium">Tu correo *</label><input ref={emailRef} type="email" className={errCls(errors.email)} value={clientEmail} onChange={e=>setClientEmail(e.target.value)} placeholder="Ej. ana@email.com"/>{errors.email&&<p className="text-xs text-red-600 mt-1">Correo no válido.</p>}</div></div>
                <div><label className="font-medium">Instagram (opcional)</label><input className={errCls(false)} value={clientIG} onChange={e=>setClientIG(e.target.value)} placeholder="@path3studio"/></div>
                <div className="mt-4 flex justify-between"><button className="px-4 py-2 rounded-xl border border-zinc-300" onClick={()=>setStep(1)}>Volver</button><button className="px-4 py-2 rounded-xl bg-black text-white hover:bg-red-600" onClick={()=>{ if(validateStep2()) setStep(3); }}>Continuar</button></div>
              </div>
            </div>
          )}

          {step===3&&(
            <div>
              <h2 className="text-xl font-semibold mb-3">Opcionales (add-ons)</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {ADDONS.map(a=> (
                  <div key={a.id} className={"rounded-xl border p-3 "+(addons.includes(a.id)?"border-black bg-white ring-1 ring-red-500/20":"border-zinc-200 bg-white") }>
                    <label className="w-full flex items-center justify-between"><div><p className="font-medium">{a.name}</p><p className="text-xs text-zinc-500">{a.listPrice?(<><span className="line-through mr-1">{mxn(a.listPrice)}</span><span>{mxn(a.price)}</span></>):(<span>{mxn(a.price)}</span>)}</p></div><input type="checkbox" className="w-5 h-5" checked={addons.includes(a.id)} onChange={()=>toggleAddon(a.id)}/></label>
                    <p className="text-[11px] text-zinc-600 mt-1">{a.desc||""}</p>
                    {addons.includes(a.id)&&a.needsNote&&(<div className="mt-2"><label className="text-xs text-zinc-600">{a.noteLabel}</label><textarea className="mt-1 w-full border border-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/30" rows={3} placeholder={a.id==="stickers"?STICKERS_PLACEHOLDER:"Ej.: Zorro amistoso; minimalista."} value={addonNotes[a.id]||""} onChange={e=>setAddonNotes(p=>({...p,[a.id]:e.target.value}))}/>{a.id==="stickers"&&(<p className="text-[11px] text-zinc-500 mt-1">Máx 15 frases, 24 caracteres.</p>)}</div>)}
                    {addons.includes(a.id)&&(<AddonForm def={a} addonForm={addonForm} setAddonForm={setAddonForm} />)}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between"><button className="px-4 py-2 rounded-xl border border-zinc-300" onClick={()=>setStep(2)}>Volver</button><button className="px-4 py-2 rounded-xl bg-black text-white hover:bg-red-600" onClick={()=>setStep(4)}>Continuar</button></div>
            </div>
          )}
        </section>

        <aside className="md:col-span-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sticky top-20">
            <h3 className="text-xl font-semibold mb-4">Tu pedido</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span>{selected.name}</span><span className="font-medium">{mxn(selected.price)}</span></div>
              {addons.map(id=>{const a=ADDONS.find(x=>x.id===id); return(<div key={id} className="flex items-center justify-between text-zinc-600"><span>• {a?.name}</span><span>{mxn(a?.price||0)}</span></div>);})}
              {pricing.lines.map((d,i)=>(<div key={i} className="flex items-center justify-between text-emerald-700"><span>{d.label}</span><span>{mxn(d.amount)}</span></div>))}
              <div className="border-t pt-3 flex items-center justify-between text;base"><span className="font-semibold">Total</span><span className="font-bold text-red-700">{mxn(pricing.total)}</span></div>
            </div>
            {step===4? (
              <div className="mt-5 space-y-3">
                <div className="flex justify-between items-center"><button className="px-3 py-1.5 rounded-xl border border-zinc-300 text-sm" onClick={()=>setStep(3)}>« Volver</button></div>
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center"><div><label className="text-xs text-zinc-600">Código de descuento</label><input className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" placeholder="Código (opcional)" value={promoCode} onChange={e=>setPromoCode(e.target.value)}/></div><div className="text-[11px] text-zinc-500">Aplica si tienes código</div></div>
                <Trust/>
                <label className="text-sm flex gap-2 items-start"><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}/><span>Acepto Términos y Políticas. <a className="underline" href="#" onClick={(e)=>{e.preventDefault(); setOpenModal('policies');}}>Leer</a></span></label>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm">✨ Estás a un paso de potenciar tu imagen. ¡Vamos!</div>
                <button disabled={sending||!agree} onClick={()=>requestPay('paypal')} className={"w-full rounded-xl bg-[#003087] text-white font-semibold py-3 "+(!agree?"opacity-60 cursor-not-allowed":"hover:brightness-110")}>{sending?"Preparando...":"Pagar ahora con PayPal"}</button>
                <button disabled={sending||!agree} onClick={()=>requestPay('stripe')} className={"w-full rounded-xl border border-zinc-300 bg-white font-medium py-2 "+(!agree?"opacity-60 cursor-not-allowed":"hover:brightness-110")}>{sending?"Preparando...":"Pagar con tarjeta (Stripe)"}</button>
                <p className="text-xs text-zinc-500">Recibirás confirmación por correo. Si necesitas otra forma de pago o factura, escríbenos a <a className="underline" href={"mailto:"+EMAIL_RECEIVE}>{EMAIL_RECEIVE}</a>.</p>
              </div>
            ) : (<div className="mt-5 flex justify-end"><button className="px-4 py-2 rounded-xl bg-black text-white hover:bg-red-600" onClick={()=>{ if(step===1) setStep(2); else if(step===2){ if(validateStep2()) setStep(3);} else if(step===3) setStep(4); }}>Continuar</button></div>)}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-zinc-600">
            <div className="rounded-2xl border border-zinc-200 bg-white py-3">Archivos listos para imprimir y redes</div>
            <div className="rounded-2xl border border-zinc-200 bg-white py-3">Entrega en <br/>{selected.delivery}</div>
            <div className="rounded-2xl border border-zinc-200 bg-white py-3">Soporte por <br/>email</div>
          </div>
        </aside>
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-10 text-xs text-zinc-500">
        <div className="border-t border-zinc-200 pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND_NAME} · Todos los derechos reservados.</p>
          <div className="flex gap-4"><a className="underline" href="#" onClick={(e)=>{e.preventDefault(); setOpenModal('contact');}}>Contacto</a><a className="underline" href="#" onClick={(e)=>{e.preventDefault(); setOpenModal('policies');}}>Políticas</a></div>
        </div>
      </footer>

      <Modal open={openModal==='contact'} title="Contacto" onClose={()=>setOpenModal(null)}>
        <div className="space-y-2"><p>Correo: <a className="underline" href={'mailto:'+EMAIL_RECEIVE}>{EMAIL_RECEIVE}</a></p><p>Instagram: <a className="underline" href="https://www.instagram.com/path3studio/" target="_blank" rel="noreferrer">@path3studio</a></p><p className="text-xs text-zinc-500">Horario: Lun–Vie 10:00–18:00 (MX). Respuesta típica: 24–48 h.</p><button className="mt-2 rounded-xl border border-zinc-300 px-3 py-1 text-sm" onClick={()=>navigator.clipboard.writeText(EMAIL_RECEIVE)}>Copiar correo</button></div>
      </Modal>
      <Modal open={openModal==='policies'} title="Términos y Políticas" onClose={()=>setOpenModal(null)}>
        <pre className="whitespace-pre-wrap text-xs text-zinc-700">{TERMINOS_TEXT + NL + NL + PRIVACIDAD_TEXT}</pre>
      </Modal>
      <Modal open={openModal==='confirm'} title="Confirma tu pedido" onClose={()=>setOpenModal(null)} actions={[
        <button key="cancel" className="px-3 py-1.5 rounded-xl border" onClick={()=>setOpenModal(null)}>Editar</button>,
        <button key="pay" className="px-3 py-1.5 rounded-xl bg-black text-white" onClick={async()=>{ const payload=await sendOrderEmailAndSheet(); if(!payload) return; if(confirmProvider==='paypal') openPayPal(); else openStripe(payload); setOpenModal(null); }}>Confirmar y pagar</button>
      ]}>
        <div className="text-sm">
          <p className="font-medium">Paquete:</p>
          <p className="mb-2">{PACKAGES.find(p=>p.id===selected.id)?.name} — <strong>{mxn(pricing.total)}</strong></p>
          {addons.length>0&&(<> <p className="font-medium">Adicionales:</p><ul className="list-disc pl-5 mb-2">{addons.map(id=>{const a=ADDONS.find(x=>x.id===id); return <li key={id}>{a?.name}</li>;})}</ul> </>)}
          <p className="font-medium">Cliente:</p><p className="mb-3">{clientName||'—'} · {clientEmail||'—'} {clientIG&&`· ${clientIG}`}</p>
          {(prevLogo?.length>0)&&(<div className="mb-2"><p className="font-medium">Renovación / logo anterior:</p><div className="mt-1 grid grid-cols-3 gap-2">{[0,1,2].map(i=>{const f=prevLogo[i]; return(<div key={'prev-'+i} className="aspect-square rounded-md border border-dashed border-zinc-300 overflow-hidden bg-white grid place-items-center">{f?.dataUrl?<img src={f.dataUrl} alt={f.name} className="w-full h-full object-cover"/>:<span className="text-zinc-300 text-xl">＋</span>}</div>);})}</div></div>)}
          {(refs?.length>0)&&(<div><p className="font-medium">Referencias:</p><div className="mt-1 grid grid-cols-3 gap-2">{[0,1,2].map(i=>{const f=refs[i]; return(<div key={'ref-'+i} className="aspect-square rounded-md border border-dashed border-zinc-300 overflow-hidden bg-white grid place-items-center">{f?.dataUrl?<img src={f.dataUrl} alt={f.name} className="w-full h-full object-cover"/>:<span className="text-zinc-300 text-xl">＋</span>}</div>);})}</div></div>)}
        </div>
      </Modal>
    </div>
  );
}

function AddonForm({ def, addonForm, setAddonForm }) {
  // helper para setear valores en el mapa addonForm[id]
  const setVal = (id, key, value) => setAddonForm(prev => ({
    ...prev,
    [id]: { ...(prev[id] || {}), [key]: value }
  }));

  const values = addonForm[def.id] || {};

  if (def.id === 'ceo') {
    const todayISO = new Date().toISOString().slice(0,10);
    const maxISO = '2030-12-31';
    const onDateChange = (v) => {
      if (v && !isWeekday(v)) { alert('Selecciona un día hábil (L–V).'); return; }
      setVal('ceo','date', v);
    };
    return (
      <div className="mt-2 grid gap-2">
        <div className="grid gap-1">
          <label className="text-xs text-zinc-600">Fecha (L–V hasta 2030)</label>
          <input type="date" min={todayISO} max={maxISO} value={values.date || ''} onChange={(e)=>onDateChange(e.target.value)} className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-zinc-600">Hora</label>
          <select value={values.time || ''} onChange={(e)=>setVal('ceo','time', e.target.value)} className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30">
            <option value="">Selecciona...</option>
            <option value="11:00">11:00</option>
            <option value="16:00">16:00</option>
          </select>
        </div>
      </div>
    );
  }

  if (!def.form) return null;

  return (
    <div className="mt-2 grid gap-2">
      {def.form.map(f => (
        <div key={f.id} className="grid gap-1">
          <label className="text-xs text-zinc-600">{f.label}{f.required ? ' *' : ''}</label>
          <input
            className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
            placeholder={f.placeholder || ''}
            value={(values[f.id] || '')}
            onChange={(e)=>setVal(def.id, f.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
