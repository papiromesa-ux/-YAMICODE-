export const MODULOS_CON_DOM = ["html", "css", "js", "formularios", "a11y"];

export function reglaBasica(codigo) {
  const r = String(codigo || "").trim();
  return r.length > 20 && r.includes("<") && r.includes(">");
}

export function textoPlano(html) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

export function GUARDIA_JS(ms = 1200) {
  return "var __dcT=0,__dcC=0;function __dcG(){if(!__dcT){__dcT=Date.now();__dcC=0;setTimeout(function(){__dcT=0},0);return;}" +
    "if((++__dcC&63)===0&&Date.now()-__dcT>" + ms + "){window.__dcBucle=true;throw new Error('Bucle infinito detenido por DARKCODE');}}";
}

function finCadena(s, i) {
  const q = s[i]; let j = i + 1;
  if (q === "`") {
    let prof = 0;
    while (j < s.length) {
      const c = s[j];
      if (c === "\\") { j += 2; continue; }
      if (c === "$" && s[j + 1] === "{") { prof++; j += 2; continue; }
      if (c === "}" && prof > 0) { prof--; j++; continue; }
      if (c === "`" && prof === 0) return j + 1;
      j++;
    }
    return s.length;
  }
  while (j < s.length) {
    const c = s[j];
    if (c === "\\") { j += 2; continue; }
    if (c === q) return j + 1;
    if (c === "\n") return j;
    j++;
  }
  return s.length;
}

function parentesisCierre(s, k) {
  let prof = 0;
  for (let j = k; j < s.length; j++) {
    const c = s[j];
    if (c === '"' || c === "'" || c === "`") { j = finCadena(s, j) - 1; continue; }
    if (c === "/" && s[j + 1] === "/") { const f = s.indexOf("\n", j); j = f === -1 ? s.length : f; continue; }
    if (c === "/" && s[j + 1] === "*") { const f = s.indexOf("*/", j + 2); j = f === -1 ? s.length : f + 1; continue; }
    if (c === "(") prof++;
    else if (c === ")") { prof--; if (prof === 0) return j; }
  }
  return -1;
}

function finSentenciaSimple(s, m) {
  let prof = 0;
  for (let j = m; j < s.length; j++) {
    const c = s[j];
    if (c === "\n" && prof === 0) return -1;
    if (c === '"' || c === "'" || c === "`") { j = finCadena(s, j) - 1; continue; }
    if (c === "(" || c === "[" || c === "{") prof++;
    else if (c === ")" || c === "]" || c === "}") { prof--; if (prof < 0) return -1; }
    else if (c === ";" && prof === 0) return j;
  }
  return -1;
}

export function protegerBucles(js) {
  const s = String(js);
  const n = s.length;
  const esId = (c) => /[A-Za-z0-9_$]/.test(c);
  const espacios = (k) => { while (k < n && /\s/.test(s[k])) k++; return k; };
  let out = ""; let i = 0;
  const pila = []; let cierreDo = -1; let proximaEsDo = false;
  while (i < n) {
    const c = s[i], d = s[i + 1];
    if (c === "/" && d === "/") { const j = s.indexOf("\n", i); const f = j === -1 ? n : j; out += s.slice(i, f); i = f; continue; }
    if (c === "/" && d === "*") { const j = s.indexOf("*/", i + 2); const f = j === -1 ? n : j + 2; out += s.slice(i, f); i = f; continue; }
    if (c === '"' || c === "'" || c === "`") { const f = finCadena(s, i); out += s.slice(i, f); i = f; continue; }
    if (c === "{") { pila.push(proximaEsDo); proximaEsDo = false; out += c; i++; continue; }
    if (c === "}") { const eraDo = pila.length ? pila.pop() : false; if (eraDo) cierreDo = i; out += c; i++; continue; }
    if (esId(c) && (i === 0 || (!esId(s[i - 1]) && s[i - 1] !== "."))) {
      let j = i; while (j < n && esId(s[j])) j++;
      const palabra = s.slice(i, j);
      if (palabra === "do") {
        const k = espacios(j);
        if (s[k] === "{") { out += s.slice(i, k + 1) + "__dcG();"; pila.push(true); i = k + 1; continue; }
      } else if (palabra === "while" || palabra === "for") {
        const esCola = palabra === "while" && cierreDo >= 0 && /^\s*$/.test(s.slice(cierreDo + 1, i));
        if (esCola) { cierreDo = -1; out += palabra; i = j; continue; }
        let k = espacios(j);
        if (palabra === "for" && s.startsWith("await", k)) k = espacios(k + 5);
        if (s[k] === "(") {
          const cierre = parentesisCierre(s, k);
          if (cierre !== -1) {
            const m = espacios(cierre + 1);
            if (s[m] === "{") { out += s.slice(i, m + 1) + "__dcG();"; pila.push(false); i = m + 1; continue; }
            if (s[m] === ";") { out += s.slice(i, cierre + 1) + "{__dcG();}"; i = m + 1; continue; }
            const sig = /^[A-Za-z_$][\w$]*/.exec(s.slice(m));
            const compuesta = sig && /^(if|for|while|do|else|try|switch|with)$/.test(sig[0]);
            if (!compuesta) {
              const f = finSentenciaSimple(s, m);
              if (f !== -1) { out += s.slice(i, cierre + 1) + "{__dcG();" + s.slice(m, f + 1) + "}"; i = f + 1; continue; }
            }
          }
        }
      }
      out += palabra; i = j; continue;
    }
    out += c; i++;
  }
  return out;
}

export function protegerHTML(html) {
  return String(html || "")
    .replace(/(<script\b)([^>]*)(>)([\s\S]*?)(<\/script\s*>)/gi, (m, a, attrs, b, js, c) => {
      if (/\bsrc\s*=/i.test(attrs)) return m;
      const tipo = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs);
      if (tipo && !/javascript|ecmascript|module/i.test(tipo[1])) return m;
      return a + attrs + b + protegerBucles(js) + c;
    })
    .replace(/(\son[a-z]+\s*=\s*)("([^"]*)"|'([^']*)')/gi, (m, pre, valor, dq, sq) => {
      const q = valor[0]; const dentro = dq !== undefined ? dq : sq;
      return pre + q + protegerBucles(dentro) + q;
    });
}

const ETIQUETAS_HTML = new Set(("html head body title meta link style script noscript base h1 h2 h3 h4 h5 h6 p br hr div span a img ul ol li dl dt dd table thead tbody tfoot tr th td caption colgroup col form input button select option optgroup textarea label fieldset legend datalist output progress meter header footer nav main section article aside figure figcaption details summary dialog strong em b i u s small mark code pre kbd samp var sub sup blockquote q cite abbr address time data audio video source track picture iframe canvas svg embed object map area template slot bdi bdo wbr ruby rt rp del ins menu center font").split(" "));

const CON_CONTENIDO = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "button", "a", "label", "title", "legend", "figcaption", "summary", "th"]);
const ATRIBUTOS_NUCLEO = { img: ["src"], a: ["href"], link: ["href"], iframe: ["src"], source: ["src"] };
const ESTRUCTURALES = { html: "<html[\\s>]", head: "<head[\\s>]", body: "<body[\\s>]" };
const NEGACION = /(no\s+(uses?|utilices?|incluyas?|escribas?|agregues?)|sin(\s+usar)?|evit[ae]r?|en\s+lugar\s+de|en\s+vez\s+de|nunca|prohibid[oa]s?)[^.\n]{0,40}$/i;

function etiquetaDe(tag, attrs, contenido) {
  return "<" + tag + (attrs && attrs.length ? " " + attrs.join(" ") : "") + ">" + (contenido ? " con texto" : "");
}

export function normalizarReglas(reglas) {
  if (!Array.isArray(reglas)) return [];
  const salida = [];
  reglas.forEach((r, i) => {
    if (typeof r === "string") {
      const m = r.match(/^(.*?)\s+x(\d+)$/i);
      const selector = (m ? m[1] : r).trim();
      if (!selector) return;
      salida.push({ id: "r" + (i + 1), selector, min: m ? parseInt(m[2], 10) : 1, etiqueta: selector + (m ? " (mín. " + m[2] + ")" : "") });
    } else if (r && typeof r === "object") {
      const base = { id: "r" + (i + 1), ...r };
      if (!base.etiqueta) base.etiqueta = base.fuente ? String(base.fuente) : String(base.selector || "regla");
      salida.push(base);
    }
  });
  return salida;
}

export function inferirReglas(enunciado) {
  const t = textoPlano(enunciado);
  const reglas = [];
  const vistos = new Set();
  const agregar = (r) => { const k = r.selector || r.fuente; if (!vistos.has(k) && reglas.length < 8) { vistos.add(k); reglas.push({ id: "i" + (reglas.length + 1), ...r }); } };
  const dt = /<!doctype\s+html\s*>/i.exec(t);
  if (dt && !NEGACION.test(t.slice(Math.max(0, dt.index - 60), dt.index))) agregar({ fuente: "<!doctype\\s+html", etiqueta: "<!DOCTYPE html>" });
  const re = /<\/?\s*([a-z][a-z0-9]*)((?:\s+[^<>]*?)?)\s*\/?>/gi;
  let m;
  while ((m = re.exec(t))) {
    const tag = m[1].toLowerCase();
    if (!ETIQUETAS_HTML.has(tag)) continue;
    if (NEGACION.test(t.slice(Math.max(0, m.index - 60), m.index))) continue;
    if (ESTRUCTURALES[tag]) { agregar({ fuente: ESTRUCTURALES[tag], etiqueta: "<" + tag + ">" }); continue; }
    const nucleo = ATRIBUTOS_NUCLEO[tag] || [];
    const nombres = [];
    String(m[2] || "").replace(/([a-zA-Z][\w:-]*)\s*=/g, (_, n) => { nombres.push(n.toLowerCase()); return ""; });
    const attrs = nucleo.filter((n) => nombres.includes(n));
    const r = { selector: tag, min: 1, etiqueta: etiquetaDe(tag, attrs, CON_CONTENIDO.has(tag)) };
    if (attrs.length) r.attrs = Object.fromEntries(attrs.map((n) => [n, true]));
    if (CON_CONTENIDO.has(tag)) r.contenido = true;
    agregar(r);
  }
  if (reglas.length) return reglas;
  if (!/\b(crea|escribe|agrega|añade|anade|inserta|incluye|haz|construye|usa|utiliza|coloca|pon|genera)\b/i.test(t)) return reglas;
  const s = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const claves = [
    [/\b(titulo|encabezado)s?\s+principal(es)?\b/, { selector: "h1", contenido: true, etiqueta: "<h1> con texto" }],
    [/\b(un|el)\s+(titulo|encabezado)\b/, { selector: "h1, h2, h3, h4, h5, h6", contenido: true, etiqueta: "un título (<h1>-<h6>) con texto" }],
    [/\bparrafos?\b/, { selector: "p", contenido: true, etiqueta: "<p> con texto" }],
    [/\b(imagen|imagenes|foto|fotografia)s?\b/, { selector: "img", attrs: { src: true }, etiqueta: "<img> con src" }],
    [/\b(enlace|enlaces|link|vinculo|hipervinculo)s?\b/, { selector: "a", attrs: { href: true }, contenido: true, etiqueta: "<a> con href" }],
    [/\blistas?\b/, { selector: "ul > li, ol > li", etiqueta: "una lista con <li>" }],
    [/\bbotones?\b/, { selector: "button, input[type=button], input[type=submit]", etiqueta: "un botón" }],
    [/\btablas?\b/, { selector: "table", etiqueta: "<table>" }],
    [/\bformularios?\b/, { selector: "form", etiqueta: "<form>" }]
  ];
  for (const [rx, regla] of claves) {
    const k = rx.exec(s);
    if (!k) continue;
    if (NEGACION.test(s.slice(Math.max(0, k.index - 60), k.index))) continue;
    if (regla.selector.startsWith("h1,") && vistos.has("h1")) continue;
    agregar({ min: 1, ...regla });
  }
  return reglas;
}

export function evaluarReglas(doc, reglas, fuente) {
  var salida = []; var vista = doc.defaultView;
  function textoDe(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function camel(p) { return String(p).replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
  function normalizar(prop, valor) {
    try {
      var s = doc.createElement("span"); s.style[prop] = valor; doc.body.appendChild(s);
      var v = vista.getComputedStyle(s)[prop]; s.parentNode.removeChild(s); return v;
    } catch (e) { return String(valor); }
  }
  for (var i = 0; i < reglas.length; i++) {
    var r = reglas[i];
    var item = { ok: false, etiqueta: r.etiqueta || r.selector || "regla", encontrados: 0 };
    try {
      if (r.fuente) {
        var ok = new RegExp(r.fuente, r.flags || "i").test(String(fuente || ""));
        item.ok = ok; item.encontrados = ok ? 1 : 0;
      } else {
        var els = Array.prototype.slice.call(doc.querySelectorAll(r.selector));
        if (r.contenido) els = els.filter(function (e) { return textoDe(e).length > 0 || !!e.querySelector("img,svg,input,video,audio,canvas"); });
        if (r.texto === true) els = els.filter(function (e) { return textoDe(e).length > 0; });
        if (typeof r.texto === "string") els = els.filter(function (e) { return textoDe(e).toLowerCase().indexOf(r.texto.toLowerCase()) !== -1; });
        if (r.attrs) {
          Object.keys(r.attrs).forEach(function (k) {
            var v = r.attrs[k];
            els = els.filter(function (e) {
              var a = e.getAttribute(k);
              if (v === true) return a !== null && a.trim() !== "";
              if (v === "*") return a !== null;
              if (v === false) return a === null;
              return a !== null && a.toLowerCase().indexOf(String(v).toLowerCase()) !== -1;
            });
          });
        }
        if (r.estilo) {
          if (!vista) { item.detalle = "no verificable sin ejecutar"; }
          else {
            els = els.filter(function (e) {
              var cs = vista.getComputedStyle(e);
              return Object.keys(r.estilo).every(function (p) { return cs[camel(p)] === normalizar(camel(p), r.estilo[p]); });
            });
          }
        }
        item.encontrados = els.length;
        var min = r.min == null ? 1 : r.min;
        item.ok = els.length >= min && (r.max == null || els.length <= r.max);
      }
    } catch (e) { item.ok = false; item.detalle = "regla inválida"; }
    salida.push(item);
  }
  return salida;
}

function seguro(json) { return json.replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, " "); }

function scriptInspector(reglas, token, fuente) {
  const datos = seguro(JSON.stringify({ reglas, token, fuente }));
  return "<script data-dc>" + GUARDIA_JS() + "<\/script>" +
    "<script>(function(){" +
    "var post=window.parent.postMessage.bind(window.parent);" +
    "var D=" + datos + ";" +
    "var evaluar=" + evaluarReglas.toString() + ";" +
    "try{document.currentScript.parentNode.removeChild(document.currentScript);}catch(e){}" +
    "var hecho=false;" +
    "function correr(){if(hecho)return;hecho=true;var items;" +
    "try{items=evaluar(document,D.reglas,D.fuente);}catch(e){items=[{ok:false,etiqueta:'error',encontrados:0,detalle:String(e)}];}" +
    "post({dcToken:D.token,items:items,bucle:!!window.__dcBucle},'*');}" +
    "document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){if(!document.querySelector('script:not([data-dc])'))correr();},80);});" +
    "window.addEventListener('load',function(){setTimeout(correr,250);});" +
    "setTimeout(correr,1500);" +
    "})();<\/script>";
}

export function construirSrcdoc(codigo, reglas, token) {
  const insp = scriptInspector(reglas, token, codigo);
  const c = protegerHTML(String(codigo || ""));
  if (/<html[\s>]/i.test(c)) {
    if (/<head[^>]*>/i.test(c)) return c.replace(/<head[^>]*>/i, (m) => m + insp);
    return c.replace(/<html[^>]*>/i, (m) => m + "<head>" + insp + "</head>");
  }
  return '<!DOCTYPE html><html><head><meta charset="utf-8">' + insp + "</head><body>" + c + "</body></html>";
}

export function validarEnIframe(codigo, reglas, { timeoutMs = 3500, doc = document, win = window } = {}) {
  return new Promise((resolve) => {
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const iframe = doc.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    iframe.title = "Validación de código (oculto)";
    iframe.style.cssText = "position:fixed;left:-10000px;top:0;width:360px;height:640px;border:0;opacity:0;pointer-events:none;";
    let terminado = false; let timer = 0;
    const alMensaje = (ev) => {
      if (ev.source !== iframe.contentWindow) return;
      const d = ev.data;
      if (!d || d.dcToken !== token || !Array.isArray(d.items)) return;
      fin({ ok: !d.bucle && d.items.length > 0 && d.items.every((i) => i.ok), items: d.items, modo: "iframe", bucle: !!d.bucle, motivo: d.bucle ? "bucle" : undefined });
    };
    const fin = (res) => {
      if (terminado) return;
      terminado = true;
      win.removeEventListener("message", alMensaje);
      clearTimeout(timer); iframe.remove(); resolve(res);
    };
    win.addEventListener("message", alMensaje);
    timer = setTimeout(() => fin({ ok: false, items: [], modo: "iframe", motivo: "tiempo" }), timeoutMs);
    try { iframe.srcdoc = construirSrcdoc(codigo, reglas, token); doc.body.appendChild(iframe); }
    catch (e) { fin({ ok: false, items: [], modo: "iframe", motivo: "error" }); }
  });
}

export function validarEstatico(codigo, reglas) {
  const doc = new DOMParser().parseFromString(String(codigo || ""), "text/html");
  const items = evaluarReglas(doc, reglas, codigo);
  return { ok: items.length > 0 && items.every((i) => i.ok), items, modo: "estatico" };
}

export async function validarFase3(codigo, pregunta = {}, { modulo = "", modulosDOM = MODULOS_CON_DOM } = {}) {
  const limpio = String(codigo || "").trim();
  const basica = reglaBasica(limpio);
  const declaradas = pregunta && Array.isArray(pregunta.reglas) ? normalizarReglas(pregunta.reglas) : [];
  const aplicaDOM = declaradas.length > 0 || modulosDOM.includes(modulo);
  if (!aplicaDOM) return { ok: basica, modo: "basico", items: [], mensaje: basica ? "" : "Escribe tu código completo, usando etiquetas < >." };
  const reglas = declaradas.length ? declaradas : inferirReglas(pregunta.instrucciones || pregunta.pregunta || "");
  if (!reglas.length) return { ok: basica, modo: "basico", items: [], mensaje: basica ? "" : "Escribe tu código completo, usando etiquetas < >." };
  if (!limpio) return { ok: false, modo: "vacio", items: reglas.map((r) => ({ ok: false, etiqueta: r.etiqueta, encontrados: 0 })), mensaje: "Escribe tu código en el editor." };
  let res = null;
  try { res = await validarEnIframe(limpio, reglas); } catch (e) { res = null; }
  if (res && res.motivo === "bucle") return { ok: false, modo: "bucle", items: res.items || [], mensaje: "Tu código tiene un bucle infinito: se detuvo para proteger la app. Revisa la condición del while/for." };
  if (res && res.motivo === "tiempo") return { ok: false, modo: "tiempo", items: [], mensaje: "Tu código tardó demasiado en ejecutarse. Revisa que no tenga un bucle infinito." };
  if (!res || res.motivo === "error") {
    try { res = validarEstatico(limpio, reglas); } catch (e) { return { ok: basica, modo: "basico", items: [], mensaje: "" }; }
  }
  const faltan = res.items.filter((i) => !i.ok);
  res.mensaje = res.ok
    ? "Estructura correcta: cumples " + res.items.length + " de " + res.items.length + " requisitos."
    : "Te falta: " + faltan.slice(0, 2).map((i) => i.etiqueta).join(" y ") + (faltan.length > 2 ? " y " + (faltan.length - 2) + " más" : "") + ".";
  return res;
}
