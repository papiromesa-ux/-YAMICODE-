window.addEventListener('load', () => {
  const _ttl = document.getElementById('errorTitle');
  const _dsc = document.getElementById('errorDesc');
  const _cde = document.getElementById('errorCode');

  if (!navigator.onLine) {
    _cde.textContent = "OFF";
    _cde.style.color = "#888";
    _ttl.textContent = "CONEXIÓN PERDIDA";
    _ttl.style.color = "#888";
    _dsc.textContent = "No se ha detectado conexión a la red. Verifica tu Wi-Fi o datos móviles para reconectar con el núcleo de YamiCode.";
  } else {
    _cde.textContent = "403";
    _cde.style.color = "var(--magenta)";
    _ttl.textContent = "ACCESO DENEGADO";
    _ttl.style.color = "var(--magenta)";
    _dsc.textContent = "El sistema anti-trampas ha bloqueado este acceso. La ruta solicitada no existe o no tienes los permisos necesarios para hackear este sector.";
  }
});
