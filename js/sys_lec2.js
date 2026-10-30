// /// 1. IMPORTACIONES \\\
import { _secAuth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { validarFase3 } from "./sys_validador.js";
import { crearAntiTrampas } from "./sys_antitrampas.js";

// /// 2. SEGURIDAD DE SESIÓN Y PROGRESO \\\
onAuthStateChanged(_secAuth, (_u) => {
  if (!_u) {
    alert("ACCESO RESTRINGIDO: Debes iniciar sesión.");
    window.location.replace("login.html"); 
  } else {
    if (localStorage.getItem("js_leccion1") !== "true") {
      alert("MISIÓN BLOQUEADA: Debes completar la Lección 1.");
      window.location.replace("leccion1.html");
    }
  }
});

// /// 3. ANTI-TRAMPAS \\\
const _anti = crearAntiTrampas({
  alExpulsar: ({ motivo }) => {
    window.location.href = `bloqueo.html?motivo=${motivo}`;
  }
});
document.body.classList.add('en-examen');
_anti.activar();

// /// 4. LÓGICA DE VALIDACIÓN \\\
const _btn = document.getElementById("btnProbar");
const _txtArea = document.getElementById("codigoEstudiante");
const _fb = document.getElementById("feedback");

_btn.addEventListener("click", async () => {
  const _in = _txtArea.value.trim();

  _btn.disabled = true;
  _btn.textContent = "Analizando código...";
  _fb.className = "feedback";
  _fb.style.display = "none";

  try {
    const _reglas = [{ fuente: "^const\\s+direccion\\s*=\\s*[\\"']https:\\/\\/yamicode\\.web[\\"'];?$", etiqueta: "Constante direccion correcta" }];
    const _res = await validarFase3(_in, { reglas: _reglas }, { modulo: "js" });

    if (_res.ok) {
      const _isDone = localStorage.getItem("js_leccion2") === "true";
      if (!_isDone) {
        const _xp = parseInt(localStorage.getItem("xp_total"), 10) || 0;
        localStorage.setItem("xp_total", String(_xp + 50));
        localStorage.setItem("js_leccion2", "true");
      }

      _fb.innerHTML = `¡Mensaje enviado a la torre de Andrea!<br><span>Recompensa: 50 XP</span><br><br><a href="leccion3.html" class="btn btn-primary">Siguiente lección →</a>`;
      _fb.className = "feedback exito";
      _btn.style.display = "none"; 
      _txtArea.disabled = true;
      _anti.desactivar(); 
    } else {
      _fb.textContent = "La dirección no coincide. Revisa const, el nombre direccion, el signo =, las comillas y el punto y coma.";
      _fb.className = "feedback error";
      _btn.disabled = false;
      _btn.textContent = "Enviar Mensaje";
    }
  } catch (error) {
    _fb.textContent = "Error de sintaxis.";
    _fb.className = "feedback error";
    _btn.disabled = false;
    _btn.textContent = "Enviar Mensaje";
  }
});
