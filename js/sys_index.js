// /// 1. IMPORTACIONES \\\
import { _secAuth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// /// 2. LÓGICA DE SESIÓN \\\
onAuthStateChanged(_secAuth, (_sysUser) => {
  const _uiBtn = document.getElementById('navAuthBtn');
  const _uiName = document.getElementById('userName');
  const _uiInit = document.getElementById('userInitial');
  const _uiStat = document.getElementById('userStatus');

  if (_sysUser) {
    const _alias = _sysUser.email.split('@')[0];
    
    if (_uiName) _uiName.textContent = _alias;
    if (_uiInit) _uiInit.textContent = _alias.charAt(0).toUpperCase();
    if (_uiStat) _uiStat.textContent = "Hacker en línea";
    
    if (_uiBtn) {
      _uiBtn.textContent = "Mi Perfil";
      _uiBtn.href = "pages/perfil.html";
    }
  }
});
