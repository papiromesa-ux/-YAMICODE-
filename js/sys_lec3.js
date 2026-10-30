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
    if (localStorage.getItem("js_leccion2") !== "true") {
      alert("MISIÓN BLOQUEADA: Debes completar la Lección 2.");
      window.location.replace("leccion2.html");
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
    const _reglas = [
      { fuente: "const\\s+estado\\s*=\\s*200", etiqueta: "Declaración de estado" },
      { fuente: "if\\s*\\(\\s*estado\\s*===\\s*200\\s*\\)", etiqueta: "Condición if" },
      { fuente: "console\\.log\\s*\\(\\s*[\\"']Respuesta recibida[\\"']\\s*\\)", etiqueta: "console.log" }
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
      _anti.desactivar(); 
    } else {
      _fb.textContent = "El código no es correcto. Revisa const, estado, el número 200, la condición if, las llaves y console.log.";
      _fb.className = "feedback error";
      _btn.disabled = false;
      _btn.textContent = "Ejecutar Código";
    }
  } catch (error) {
    _fb.textContent = "Error de sintaxis. Revisa que no haya bucles infinitos.";
    _fb.className = "feedback error";
    _btn.disabled = false;
    _btn.textContent = "Ejecutar Código";
  }
});
