// ==========================================
// YAMICODE - Lógica de Navegación e Interacción
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. CONTROL DEL MENÚ MÓVIL
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      // Alternar la clase 'active' que muestra/oculta el menú en CSS
      const isActive = nav.classList.toggle('active');
      
      // Actualizar el atributo de accesibilidad (aria-expanded)
      menuToggle.setAttribute('aria-expanded', isActive);
      
      // Opcional: cambiar el texto del botón cuando está abierto
      if (isActive) {
        menuToggle.textContent = '[X]';
      } else {
        menuToggle.textContent = '[=]';
      }
    });

    // Cerrar el menú automáticamente al hacer clic en un enlace
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '[=]';
      });
    });
  }

  // 2. INTERACCIÓN CON EL AVATAR
  const avatarBox = document.getElementById('avatarBox');
  
  if (avatarBox) {
    avatarBox.addEventListener('click', () => {
      const face = avatarBox.querySelector('.avatar-face');
      const nombre = avatarBox.querySelector('.avatar-name');
      
      // Guardar los textos originales
      const textoOriginal = face.textContent;
      const nombreOriginal = nombre.textContent;
      
      // Efecto visual: simular que Alexander "reacciona"
      face.textContent = '...';
      nombre.textContent = 'Cargando...';
      avatarBox.style.transform = 'scale(1.05)';
      avatarBox.style.boxShadow = '0 0 40px rgba(0, 245, 255, 0.8)';
      
      // Regresar a la normalidad después de 800 milisegundos
      setTimeout(() => {
        face.textContent = textoOriginal;
        nombre.textContent = nombreOriginal;
        avatarBox.style.transform = 'scale(1)';
        avatarBox.style.boxShadow = ''; // Vuelve a la sombra original del CSS
      }, 800);
    });
  }

});
