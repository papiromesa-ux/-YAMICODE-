document.addEventListener('DOMContentLoaded', () => {
  // 1. CONTROL DEL MENÚ MÓVIL (Verificando que exista)
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isActive = nav.classList.toggle('active');
      menuToggle.textContent = isActive ? '[X]' : '[=]';
      menuToggle.setAttribute('aria-expanded', isActive);
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.textContent = '[=]';
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. INTERACCIÓN CON EL AVATAR (Verificando que exista)
  const avatarBox = document.getElementById('avatarBox');
  if (avatarBox) {
    avatarBox.addEventListener('click', () => {
      const face = avatarBox.querySelector('.avatar-face');
      const nombre = avatarBox.querySelector('.avatar-name');
      
      if (face && nombre) {
        const originalFace = face.textContent;
        const originalName = nombre.textContent;

        face.textContent = '...';
        nombre.textContent = 'Cargando...';
        
        setTimeout(() => {
          face.textContent = originalFace;
          nombre.textContent = originalName;
        }, 800);
      }
    });
  }
});
