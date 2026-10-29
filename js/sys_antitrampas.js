export const GRACIA_MS = 2500;
export const MAX_AVISOS = 3;

export function crearMotor(opts = {}) {
  const gracia = opts.gracia ?? GRACIA_MS;
  const maxAvisos = opts.maxAvisos ?? MAX_AVISOS;
  const ahora = opts.ahora ?? (() => Date.now());
  const setT = opts.setT ?? ((f, ms) => setTimeout(f, ms));
  const clearT = opts.clearT ?? ((id) => clearTimeout(id));
  const alAviso = opts.alAviso ?? (() => {});
  const alPerdon = opts.alPerdon ?? (() => {});
  const alLimpiar = opts.alLimpiar ?? (() => {});
  const alExpulsar = opts.alExpulsar ?? (() => {});

  let activo = false, expulsado = false, avisos = 0, sospecha = null, silencioHasta = 0, pausadoHasta = 0, pistaMotivo = "", pistaHasta = 0, ultimoCierre = -1e9;

  function motivoPista() { return ahora() < pistaHasta ? pistaMotivo : ""; }

  function expulsar(motivo) {
    if (expulsado) return;
    expulsado = true;
    if (sospecha) { clearT(sospecha.timer); sospecha = null; }
    activo = false;
    alLimpiar();
    alExpulsar({ motivo, avisos });
  }

  function abrir(motivo, duro) {
    if (sospecha) {
      if (duro && !sospecha.duro) { sospecha.duro = true; sospecha.motivo = motivo; }
      return;
    }
    const rebote = ahora() - ultimoCierre < 1000;
    if (!rebote) avisos++;
    if (avisos > maxAvisos) { expulsar(motivo + "-reincidente"); return; }
    const s = { motivo, duro, inicio: ahora(), timer: null };
    s.timer = setT(() => expulsar(s.motivo), gracia);
    sospecha = s;
    alAviso({ motivo, graciaMs: gracia, avisos, max: maxAvisos });
  }

  function cerrar() {
    if (!sospecha) return;
    const s = sospecha;
    sospecha = null;
    clearT(s.timer);
    ultimoCierre = ahora();
    const transcurrido = ahora() - s.inicio;
    if (transcurrido >= gracia) { expulsar(s.motivo); return; }
    alPerdon({ motivo: s.motivo, avisos, max: maxAvisos, ms: transcurrido });
  }

  return {
    ahora,
    estaActivo: () => activo,
    estado: () => ({ activo, avisos, sospecha: sospecha ? sospecha.motivo : null, expulsado }),
    activar() { activo = true; expulsado = false; if (sospecha) { clearT(sospecha.timer); sospecha = null; } alLimpiar(); },
    desactivar() { activo = false; if (sospecha) { clearT(sospecha.timer); sospecha = null; } alLimpiar(); },
    nuevaSesion() { avisos = 0; ultimoCierre = -1e9; },
    silenciar(ms) { silencioHasta = Math.max(silencioHasta, ahora() + ms); },
    pausar(ms) { pausadoHasta = Math.max(pausadoHasta, ahora() + ms); },
    reanudar() { pausadoHasta = 0; },
    pista(motivo, ms) { pistaMotivo = motivo; pistaHasta = ahora() + ms; },
    expulsarYa(motivo) { if (activo) expulsar(motivo); },
    evaluar(p) {
      if (!activo || expulsado) return;
      const t = ahora();
      if (t < pausadoHasta) return;
      const silenciado = t < silencioHasta || !!p.teclado;
      if (!p.visible) { abrir(motivoPista() || "multitarea", true); return; }
      if (p.reducido && !silenciado) { abrir("ventana-dividida", false); return; }
      if (!p.enfocado) {
        if (silenciado) return;
        abrir(motivoPista() || "ventana", false);
        return;
      }
      cerrar();
    }
  };
}

const SELECTOR_CAMPO = "input, textarea, select, [contenteditable=''], [contenteditable='true'], .ace_editor";
function comoElemento(nodo) { if (!nodo) return null; return nodo.nodeType === 1 ? nodo : nodo.parentElement || null; }

export function conectarDOM(motor, cfg = {}) {
  const doc = cfg.doc ?? document;
  const win = cfg.win ?? window;
  const selectorSilencio = cfg.selectorSilencio ?? "#floating-music-btn, audio, select, .dc-musica";
  const intervaloMs = cfg.intervaloMs ?? 400;
  const limpiar = [];
  const on = (obj, ev, fn, opt) => { obj.addEventListener(ev, fn, opt); limpiar.push(() => obj.removeEventListener(ev, fn, opt)); };
  const esCampo = (nodo) => { const el = comoElemento(nodo); return !!(el && el.closest && el.closest(SELECTOR_CAMPO)); };
  let tecladoHasta = 0, baseAlto = 0, baseAncho = 0, girando = 0;

  function medirBase() {
    const r = doc.documentElement;
    baseAlto = r.clientHeight || win.innerHeight;
    baseAncho = r.clientWidth || win.innerWidth;
  }

  function presencia() {
    const r = doc.documentElement;
    const t = motor.ahora();
    const alto = r.clientHeight || win.innerHeight;
    const ancho = r.clientWidth || win.innerWidth;
    const reducido = baseAlto > 0 && t > girando && (alto < baseAlto * 0.72 || ancho < baseAncho * 0.8);
    return {
      visible: doc.visibilityState !== "hidden",
      enfocado: typeof doc.hasFocus === "function" ? doc.hasFocus() : true,
      reducido,
      teclado: esCampo(doc.activeElement) || t < tecladoHasta
    };
  }

  const evaluar = () => motor.evaluar(presencia());

  on(doc, "visibilitychange", evaluar);
  on(win, "blur", (e) => { if (e.target === win) evaluar(); });
  on(win, "focus", (e) => { if (e.target === win) evaluar(); });
  on(win, "pagehide", () => motor.evaluar({ visible: false, enfocado: false, reducido: false, teclado: false }));
  on(win, "resize", evaluar);
  if (win.visualViewport) on(win.visualViewport, "resize", evaluar);
  on(win, "orientationchange", () => { girando = motor.ahora() + 900; setTimeout(medirBase, 600); });

  const sondeo = setInterval(evaluar, intervaloMs);
  limpiar.push(() => clearInterval(sondeo));

  on(doc, "focusin", (e) => { if (esCampo(e.target)) tecladoHasta = motor.ahora() + 1e9; });
  on(doc, "focusout", (e) => { if (esCampo(e.target)) tecladoHasta = motor.ahora() + 900; });
  on(doc, "pointerdown", (e) => {
    const el = comoElemento(e.target);
    if (el && el.closest && el.closest(selectorSilencio)) motor.silenciar(4000);
  }, true);

  let toque = null;
  on(doc, "touchstart", (e) => {
    if (!motor.estaActivo()) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const W = win.innerWidth, H = win.innerHeight;
    const borde = t.clientY >= H - 26 ? "abajo" : t.clientY <= 14 ? "arriba" : t.clientX <= 10 ? "izq" : t.clientX >= W - 10 ? "der" : "";
    toque = { x: t.clientX, y: t.clientY, t0: Date.now(), borde, dx: 0, dy: 0, W };
  }, { passive: true, capture: true });
  on(doc, "touchmove", (e) => {
    if (!toque) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    toque.dx = t.clientX - toque.x;
    toque.dy = t.clientY - toque.y;
  }, { passive: true, capture: true });
  on(doc, "touchend", () => { toque = null; }, { passive: true, capture: true });
  on(doc, "touchcancel", () => {
    if (!motor.estaActivo() || !toque || !toque.borde) { toque = null; return; }
    const dur = Date.now() - toque.t0;
    let motivo = "gesto-sistema";
    if (toque.borde === "abajo") {
      const esquina = toque.x < toque.W * 0.25 || toque.x > toque.W * 0.75;
      const mantenido = dur > 450 && Math.abs(toque.dy) < 20;
      motivo = esquina || mantenido ? "asistente" : "multitarea";
    } else if (toque.borde === "arriba") {
      motivo = "barra-estado";
    }
    toque = null;
    motor.pista(motivo, 2000);
    [80, 220, 450, 800, 1300].forEach((ms) => setTimeout(evaluar, ms));
  }, { passive: true, capture: true });

  on(doc, "keydown", (e) => {
    if (!motor.estaActivo()) return;
    const k = String(e.key || "").toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const inspector = k === "f12" || (ctrl && e.shiftKey && (k === "i" || k === "j" || k === "c")) || (ctrl && !e.shiftKey && k === "u") || (e.metaKey && e.altKey && (k === "i" || k === "j" || k === "c" || k === "u"));
    if (inspector) { e.preventDefault(); motor.expulsarYa("inspector"); }
  }, true);

  const protegido = (e) => motor.estaActivo() && !esCampo(e.target);
  on(doc, "selectstart", (e) => { if (protegido(e)) e.preventDefault(); });
  on(doc, "copy", (e) => { if (protegido(e)) e.preventDefault(); });
  on(doc, "cut", (e) => { if (protegido(e)) e.preventDefault(); });
  on(doc, "dragstart", (e) => { if (protegido(e)) e.preventDefault(); });
  on(doc, "contextmenu", (e) => { if (!motor.estaActivo() || esCampo(e.target)) return; e.preventDefault(); motor.expulsarYa("menu-contextual"); });
  on(doc, "dblclick", (e) => { if (!motor.estaActivo() || esCampo(e.target)) return; e.preventDefault(); motor.expulsarYa("doble-toque"); });

  return { medirBase, evaluar, desconectar() { limpiar.splice(0).forEach((f) => f()); } };
}

const TEXTOS_MOTIVO = { multitarea: "Saliste de la lección", ventana: "Otra ventana tiene el foco", asistente: "Se abrió el asistente", "barra-estado": "Se abrió la barra del sistema", "gesto-sistema": "Gesto del sistema detectado", "ventana-dividida": "La ventana se redujo" };

export function crearUIAviso({ doc = document, vibrar = null } = {}) {
  let el = doc.getElementById("alerta-trampa");
  if (!el) {
    el = doc.createElement("div");
    el.id = "alerta-trampa";
    el.className = "dc-alerta-trampa";
    el.hidden = true;
    el.setAttribute("role", "alert");
    doc.body.appendChild(el);
  }
  let cierre = 0;
  return {
    mostrar({ motivo, graciaMs, avisos, max }) {
      clearTimeout(cierre);
      el.hidden = false;
      el.dataset.estado = "aviso";
      el.innerHTML = `<div class="dc-alerta-cuerpo"><strong>[!] ${TEXTOS_MOTIVO[motivo] || "Movimiento sospechoso"}</strong><span>Vuelve a la lección. Aviso ${avisos} de ${max}.</span></div><div class="dc-alerta-barra"><i></i></div>`;
      const barra = el.querySelector("i");
      barra.style.animationDuration = graciaMs + "ms";
      void barra.offsetWidth;
      barra.classList.add("corre");
      if (vibrar) vibrar([60, 40, 60]);
    },
    perdonar({ avisos, max }) {
      clearTimeout(cierre);
      el.dataset.estado = "ok";
      el.hidden = false;
      el.innerHTML = `<div class="dc-alerta-cuerpo"><strong>[OK] Todo en orden</strong><span>Sigue con la lección. Avisos usados: ${avisos} de ${max}.</span></div>`;
      cierre = setTimeout(() => { if (el.dataset.estado === "ok") el.hidden = true; }, 1800);
    },
    limpiar() { clearTimeout(cierre); el.hidden = true; el.dataset.estado = ""; }
  };
}

export function crearAntiTrampas(opts = {}) {
  const ui = opts.ui ?? crearUIAviso({ vibrar: opts.vibrar });
  const motor = crearMotor({
    gracia: opts.graciaMs,
    maxAvisos: opts.maxAvisos,
    alAviso: ui.mostrar,
    alPerdon: ui.perdonar,
    alLimpiar: ui.limpiar,
    alExpulsar: opts.alExpulsar ?? (({ motivo, avisos }) => { location.href = `bloqueo.html?motivo=${encodeURIComponent(motivo)}&avisos=${avisos}`; })
  });
  const dom = conectarDOM(motor, { selectorSilencio: opts.selectorSilencio });
  return {
    motor,
    activar() { dom.medirBase(); motor.activar(); },
    desactivar() { motor.desactivar(); },
    nuevaSesion() { motor.nuevaSesion(); },
    pausar(ms) { motor.pausar(ms); },
    reanudar() { motor.reanudar(); },
    silenciar(ms) { motor.silenciar(ms); },
    expulsarYa(m) { motor.expulsarYa(m); },
    estado() { return motor.estado(); },
    desconectar() { dom.desconectar(); }
  };
}
