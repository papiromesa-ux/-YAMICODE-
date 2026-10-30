document.addEventListener('DOMContentLoaded', () => {
  // /// 1. LÓGICA DEL MENÚ HAMBURGUESA \\\
  const _nav = document.getElementById('nav');
  const _menuToggle = document.getElementById('menuToggle');

  if (_menuToggle && _nav) {
    _menuToggle.addEventListener('click', () => {
      _nav.classList.toggle('active');
      _menuToggle.classList.toggle('active');
    });
  }

  if (_nav) {
    _nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        _nav.classList.remove('active');
        if (_menuToggle) _menuToggle.classList.remove('active');
      });
    });
  }

  // /// 2. LÓGICA DE INTERACCIÓN CON EL AVATAR \\\
  const _uiAvatar = document.getElementById('avatarBox');
  if (_uiAvatar) {
    _uiAvatar.addEventListener('click', () => {
      const _fce = _uiAvatar.querySelector('.avatar-face');
      const _nme = _uiAvatar.querySelector('.avatar-name');
      
      if (_fce && _nme) {
        const _origFce = _fce.textContent;
        const _origNme = _nme.textContent;

        _fce.textContent = '...';
        _nme.textContent = 'Cargando...';
        
        setTimeout(() => {
          _fce.textContent = _origFce;
          _nme.textContent = _origNme;
        }, 800);
      }
    });
  }
});
