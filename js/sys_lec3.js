import { _secAuth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const _btn = document.getElementById("btnProbar");
const _txtArea = document.getElementById("codigoEstudiante");
const _fb = document.getElementById("feedback");

_btn.addEventListener("click", () => {
  const _in = _txtArea.value.trim().replace(/\r?\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  const _correct = ["const estado = 200;", "if (estado === 200) {", '  console.log("Respuesta recibida");', "}"].join("\n");

  if (_in === _correct) {
    const _isDone = localStorage.getItem("js_modulo1_completado") === "true";
    if (!_isDone) {
      const _xp = parseInt(localStorage.getItem("xp_total"), 10) || 0;
      localStorage.setItem("xp_total", String(_xp + 100));
      localStorage.setItem("js_modulo1_completado", "true");
    }

    _fb.innerHTML = `¡Conexión establecida con Andrea!<br><span>Recompensa: 100 XP</span><br><br><a href="js.html" class="btn btn-primary">Volver al Aula →</a>`;
    _fb.className = "feedback exito";
    _btn.disabled = true;
    _txtArea.disabled = true;
  } else {
    _fb.textContent = "El código no coincide. Revisa const, estado, el número 200, la condición if, las llaves y console.log.";
    _fb.className = "feedback error";
  }
});
