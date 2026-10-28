import { _secAuth } from "./firebase.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(_secAuth, (_sysUser) => {
  if (_sysUser) window.location.replace("../index.html"); 
});

let _isLog = true;
const _frm = document.getElementById('authForm');
const _btn = document.getElementById('btnSubmit');
const _msg = document.getElementById('mensaje');
const _tgl = document.getElementById('toggleTextContainer');
const _grpName = document.getElementById('groupName');
const _grpConf = document.getElementById('groupConfirm');
const _ttl = document.getElementById('formTitle');
const _sub = document.getElementById('formSub');

_tgl.addEventListener('click', (e) => {
  if (e.target.id === 'toggleMode') {
    _isLog = !_isLog;
    _msg.className = "mensaje";

    if (_isLog) {
      _ttl.innerHTML = "Iniciar <span class='neon'>Sesión</span>";
      _sub.textContent = "Bienvenido de vuelta, hacker.";
      _btn.textContent = "Entrar al Sistema";
      _grpName.style.display = "none";
      _grpConf.style.display = "none";
      _tgl.innerHTML = '¿No tienes cuenta? <span id="toggleMode">Regístrate aquí</span>';
    } else {
      _ttl.innerHTML = "Crear <span class='neon'>Cuenta</span>";
      _sub.textContent = "Únete a la academia.";
      _btn.textContent = "Registrarme";
      _grpName.style.display = "block";
      _grpConf.style.display = "block";
      _tgl.innerHTML = '¿Ya tienes cuenta? <span id="toggleMode">Inicia sesión aquí</span>';
    }
  }
});

_frm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const _eml = document.getElementById('email').value;
  const _pwd = document.getElementById('password').value;
  _btn.textContent = "Cargando...";
  _btn.disabled = true;

  try {
    if (_isLog) {
      await signInWithEmailAndPassword(_secAuth, _eml, _pwd);
    } else {
      const _cnf = document.getElementById('confirmPassword').value;
      if (_pwd !== _cnf) throw new Error("Las contraseñas no coinciden.");
      const _nm = document.getElementById('name').value;
      const _crd = await createUserWithEmailAndPassword(_secAuth, _eml, _pwd);
      await updateProfile(_crd.user, { displayName: _nm });
    }
  } catch (_err) {
    let _m = _err.message || "Error: Revisa tus datos.";
    if (_err.code === 'auth/invalid-credential') _m = "Credenciales inválidas.";
    if (_err.code === 'auth/email-already-in-use') _m = "Este correo ya está registrado.";
    if (_err.code === 'auth/weak-password') _m = "La contraseña debe tener al menos 6 caracteres.";
    _msg.textContent = _m;
    _msg.className = "mensaje error";
    _btn.textContent = _isLog ? "Entrar al Sistema" : "Registrarme";
    _btn.disabled = false;
  }
});

document.getElementById('btnGoogle').addEventListener('click', async () => {
  const _prv = new GoogleAuthProvider();
  try {
    await signInWithPopup(_secAuth, _prv);
  } catch (_err) {
    _msg.textContent = "Error al conectar con Google.";
    _msg.className = "mensaje error";
  }
});
