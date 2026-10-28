document.addEventListener('DOMContentLoaded', () => {
  const _uiToggle = document.getElementById('menuToggle');
  const _uiNav = document.getElementById('nav');

  if (_uiToggle && _uiNav) {
    _uiToggle.addEventListener('click', () => {
      const _isAct = _uiNav.classList.toggle('active');
      _uiToggle.textContent = _isAct ? '[X]' : '[=]';
      _uiToggle.setAttribute('aria-expanded', _isAct);
    });

    _uiNav.querySelectorAll('a').forEach(_link => {
      _link.addEventListener('click', () => {
        _uiNav.classList.remove('active');
        _uiToggle.textContent = '[=]';
        _uiToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

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
