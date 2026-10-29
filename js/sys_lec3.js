import { _secAuth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { validarFase3 } from "./sys_validador.js";
import { crearAntiTrampas } from "./sys_antitrampas.js";

// 1. GUARDIÁN DE SEGURIDAD (Login y Progreso)
onAuthStateChanged(_secAuth, (_u) => {
  if (!_u) {
    alert("ACCESO RESTRINGIDO: Debes iniciar sesión.");
    window.location.replace("login.html"); 
  } else {
    if (localStorage.getItem("js_leccion2") !== "true") {
      alert("MISIÓN BLOQUEADA: Debes completar la Lección 2.");
      window.location.replace("leccion2.html");
    }
  }
});

// 2. ACTIVAR EL ANTI-TRAMPAS
// Lo activamos apenas carga la página para que vigile si se salen de la ventana.
const _anti = crearAntiTrampas({
  alExpulsar: ({ motivo }) => {
    // Si lo expulsan, lo mandamos a la pantalla de bloqueo (que está en la misma carpeta)
    window.location.href = `bloqueo.html?motivo=${motivo}`;
  }
});
_anti.activar();

// 3. LÓGICA DEL BOTÓN PROBAR (Con el Validador Real)
const _btn = document.getElementById("btnProbar");
const _txtArea = document.getElementById("codigoEstudiante");
const _fb = document.getElementById("feedback");

_btn.addEventListener("click", async () => {
  const _in = _txtArea.value.trim();
  const _correct = ["const estado = 200;", "if (estado === 200) {", '  console.log("Respuesta recibida");', "}"].join("\n");

  // Bloqueamos el botón para que no le den doble clic mientras valida
  _btn.disabled = true;
  _btn.textContent = "Analizando código...";
  _fb.className = "feedback";
  _fb.style.display = "none";

  // Llamamos al validador de Karleotty
  try {
    const _reglas = [
      "const estado = 200;",
      "if (estado === 200) {",
      'console.log("Respuesta recibida");',
      "}"
    ];
    
    const _res = await validarFase3(_in, { reglas: _reglas }, { modulo: "js" });

    if (_res.ok) {
      const _isDone = localStorage.getItem("js_modulo1_completado") === "true";
      if (!_isDone) {
        const _xp = parseInt(localStorage.getItem("xp_total"), 10) || 0;
        localStorage.setItem("xp_total", String(_xp + 100));
        localStorage.setItem("js_modulo1_completado", "true");
      }

      _fb.innerHTML = `¡Conexión establecida con Andrea!<br><span>Recompensa: 100 XP</span><br><br><a href="js.html" class="btn btn-primary">Volver al Aula →</a>`;
      _fb.className = "feedback exito";
      _btn.style.display = "none"; 
      _txtArea.disabled = true;
      _anti.desactivar(); // Apagamos el anti-trampas porque ya terminó
    } else {
      // Si está mal:
      _fb.textContent = "El código no es correcto. Revisa const, estado, el número 200, la condición if, las llaves y console.log. (El sistema detectó un error en la estructura).";
      _fb.className = "feedback error";
      _btn.disabled = false;
      _btn.textContent = "Ejecutar Código";
    }
  } catch (error) {
    // Si el código choca o da error el iframe
    _fb.textContent = "Error de sintaxis. Revisa que no haya bucles infinitos o errores graves.";
    _fb.className = "feedback error";
    _btn.disabled = false;
    _btn.textContent = "Ejecutar Código";
  }
});
