// /// 1. IMPORTACIONES \\\
import { _secAuth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// /// 2. LÓGICA DE SESIÓN (solo botón del header) \\\
onAuthStateChanged(_secAuth, (_sysUser) => {
  const _uiBtn = document.getElementById('navAuthBtn');

  if (_sysUser && _uiBtn) {
    _uiBtn.textContent = "Mi Perfil";
    _uiBtn.href = "pages/perfil.html";
  }
});
