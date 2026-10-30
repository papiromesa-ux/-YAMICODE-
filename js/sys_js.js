import { _secAuth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(_secAuth, (_sysUser) => {
  if (!_sysUser) {
    window.location.replace("login.html"); 
  } else {
    const _mods = ["js_leccion1", "js_leccion2", "js_leccion3"];
    const _cmp = _mods.filter(_l => localStorage.getItem(_l) === "true").length;
    
    const _prgTxt = document.getElementById("progresoModulo1");
    if (_prgTxt) _prgTxt.textContent = `${_cmp}/${_mods.length} Lecciones`;

    const _pct = Math.round((_cmp / _mods.length) * 100);
    const _pctTxt = document.getElementById("progresoGeneral");
    const _bar = document.getElementById("barraProgreso");

    if (_pctTxt) _pctTxt.textContent = `${_pct}%`;
    if (_bar) _bar.style.width = `${_pct}%`;

    const _isMod1Done = localStorage.getItem("js_modulo1_completado") === "true";
    const _mod2 = document.getElementById("modulo2");

    if (_isMod1Done && _mod2) {
      _mod2.classList.remove("locked-module");
      _mod2.style.borderLeft = "4px solid var(--cian)"; 
      
      const _bdg = _mod2.querySelector(".card-badge");
      _bdg.textContent = "Módulo 02";
      _bdg.style.background = "rgba(0, 245, 255, 0.2)";
      _bdg.style.color = "var(--texto)";

      const _txtBlq = _mod2.querySelector(".texto-bloqueo");
      _txtBlq.textContent = "0/5 Lecciones";
      _txtBlq.style.color = "var(--texto-dim)";

      const _btnOld = _mod2.querySelector("button");
      const _newLink = document.createElement("a");
      _newLink.href = "#"; 
      _newLink.className = "btn btn-primary";
      _newLink.style.padding = "0.5rem 1rem";
      _newLink.style.fontSize = "0.9rem";
      _newLink.textContent = "Iniciar";
      
      _btnOld.replaceWith(_newLink);
    }
  }
});
