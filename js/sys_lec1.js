import { _secAuth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(_secAuth, (_u) => {
  if (!_u) {
    alert("ACCESO RESTRINGIDO: Debes iniciar sesión.");
    window.location.replace("login.html"); 
  }
});

const _btn = document.getElementById("btnProbar");
const _txtArea = document.getElementById("codigoEstudiante");
const _fb = document.getElementById("feedback");

_btn.addEventListener("click", () => {
  const _in = _txtArea.value.trim();
  const _correct = ['console.log("Hola YamiCode");', "console.log('Hola YamiCode');"];

  _fb.className = "feedback";

  if (_correct.includes(_in)) {
    const _isDone = localStorage.getItem("js_leccion1") === "true";
    if (!_isDone) {
      const _xp = parseInt(localStorage.getItem("xp_total"), 10) || 0;
      localStorage.setItem("xp_total", String(_xp + 50));
      localStorage.setItem("js_leccion1", "true");
    }

    _fb.innerHTML = `¡SISTEMA RESTAURADO! Has completado la misión.<br><span>Recompensa: 50 XP</span><br><br><a href="leccion2.html" class="btn btn-primary">Siguiente lección →</a>`;
    _fb.classList.add("exito");
    _btn.disabled = true;
    _txtArea.disabled = true;
  } else {
    _fb.textContent = "El comando no coincide. Revisa console.log, las comillas, el mensaje y el punto y coma.";
    _fb.classList.add("error");
  }
});
