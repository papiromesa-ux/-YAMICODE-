import { _secAuth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(_secAuth, (_sysUser) => {
  if (!_sysUser) {
    window.location.replace("login.html"); 
  } else {
    const _alias = _sysUser.email.split('@')[0];
    document.getElementById('usrName').textContent = _alias;
    document.getElementById('usrInit').textContent = _alias.charAt(0).toUpperCase();
    
    const _xp = parseInt(localStorage.getItem('xp_total')) || 0;
    document.getElementById('usrXP').textContent = _xp + " XP";
    
    let _pct = (_xp / 100) * 100;
    if (_pct > 100) _pct = 100;
    document.getElementById('usrBar').style.width = _pct + "%";
  }
});

document.getElementById('btnLogout').addEventListener('click', () => {
  signOut(_secAuth).then(() => {
    window.location.replace("login.html");
  });
});
