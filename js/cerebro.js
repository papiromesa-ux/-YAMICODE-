document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isActive = nav.classList.toggle('active');
      menuToggle.textContent = isActive ? '[X]' : '[=]';
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.textContent = '[=]';
      });
    });
  }

  const avatarBox = document.getElementById('avatarBox');
  if (avatarBox) {
    avatarBox.addEventListener('click', () => {
      const face = avatarBox.querySelector('.avatar-face');
      const nombre = avatarBox.querySelector('.avatar-name');
      const originalFace = face.textContent;
      const originalName = nombre.textContent;

      face.textContent = '...';
      nombre.textContent = 'Cargando...';
      
      setTimeout(() => {
        face.textContent = originalFace;
        nombre.textContent = originalName;
      }, 800);
    });
  }
});
