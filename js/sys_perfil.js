import { _secAuth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(_secAuth, (_sysUser) => {
  if (!_sysUser) {
    window.location.replace("login.html"); 
  } else {
    // Priorizar el nombre real (displayName). Si no existe, usar la parte del correo.
    const _alias = _sysUser.displayName || _sysUser.email.split('@')[0];
    
    const _nameEl = document.getElementById('usrName');
    const _initEl = document.getElementById('usrInit');
    
    if (_nameEl) _nameEl.textContent = _alias;
    if (_initEl) _initEl.textContent = _alias.charAt(0).toUpperCase();
    
    const _xp = parseInt(localStorage.getItem('xp_total')) || 0;
    const _xpEl = document.getElementById('usrXP');
    if (_xpEl) _xpEl.textContent = _xp + " XP";
    
    const _barEl = document.getElementById('usrBar');
    if (_barEl) {
      let _pct = (_xp / 100) * 100;
      if (_pct > 100) _pct = 100;
      _barEl.style.width = _pct + "%";
    }
  }
});

document.getElementById('btnLogout')?.addEventListener('click', () => {
  signOut(_secAuth).then(() => {
    window.location.replace("login.html");
  });
});
