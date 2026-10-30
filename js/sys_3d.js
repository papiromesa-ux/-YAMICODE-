document.addEventListener('DOMContentLoaded', () => {
  const boton = document.getElementById('btnDescargarModelo');
  
  if (!boton) {
    alert("Error 1: El HTML no encuentra el botón. Revisa el index.html.");
    return;
  }

  boton.addEventListener('click', () => {
    // Si ves esta alerta, el botón funciona perfecto.
    alert("¡Prueba de vida exitosa! El botón responde. El problema son las librerías 3D.");
    boton.style.background = "magenta";
  });
});
