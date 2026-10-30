document.addEventListener('DOMContentLoaded', () => {
  
  // /// 1. HACER QUE LAS PESTAÑAS REACCIONEN \\\
  const _pestañas = document.querySelectorAll('.tab-descarga');
  _pestañas.forEach(_tab => {
    _tab.addEventListener('click', () => {
      if (_tab.textContent === 'Modelos') return;
      alert("La sección " + _tab.textContent + " estará disponible en la próxima actualización.");
    });
  });

  const _btnDescargar = document.getElementById('btnDescargarModelo');
  if (!_btnDescargar) return;

  // /// 2. LÓGICA DE DESCARGA CON CARGA DINÁMICA \\\
  _btnDescargar.addEventListener('click', async () => {
    
    // Cambiamos el color para saber que el clic funcionó
    _btnDescargar.style.background = "var(--magenta)";
    alert("Botón presionado. Iniciando descarga de librerías 3D... (Espera)");

    try {
      // Cargamos las librerías EN EL MOMENTO usando esm.sh (otro CDN)
      const THREE = await import('https://esm.sh/three@0.160.0');
      const { GLTFLoader } = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');
      const { VRMLoaderPlugin, VRMUtils } = await import('https://esm.sh/@pixiv/three-vrm@3.0.0');

      const _vrmContainer = document.getElementById('vrm-container');
      const _panelDescargas = document.getElementById('panel-descargas');
      const _barraFondo = document.getElementById('barra-progreso-3d');
      const _barraFill = document.getElementById('progreso-fill');
      const _textoProgreso = document.getElementById('texto-progreso');
      const _textoAvatar = document.getElementById('texto-avatar');

      _btnDescargar.style.display = 'none';
      _barraFondo.style.display = 'block';
      _textoProgreso.style.display = 'block';
      _textoProgreso.textContent = "Descargando modelo...";

      const _scene = new THREE.Scene();
      const _camera = new THREE.PerspectiveCamera(30, _vrmContainer.clientWidth / _vrmContainer.clientHeight, 0.1, 20);
      _camera.position.set(0, 1.3, 2.5);

      const _renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
      _renderer.setPixelRatio(window.devicePixelRatio);
      
      const _loader = new GLTFLoader();
      _loader.register((parser) => new VRMLoaderPlugin(parser));

      const _path = 'Modelos/Modelos%20de%20preterminado/alexander.vrm';

      _loader.load(
        _path, 
        (gltf) => {
          _panelDescargas.style.display = 'none';
          _textoAvatar.style.display = 'block';
          
          _vrmContainer.innerHTML = '';
          _vrmContainer.appendChild(_renderer.domElement);

          const _vrm = gltf.userData.vrm;
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          VRMUtils.combineSkeletons(gltf.scene);
          
          _vrm.scene.rotation.y = Math.PI; 
          _scene.add(_vrm.scene);

          const _ambient = new THREE.AmbientLight(0xffffff, 0.6);
          _scene.add(_ambient);
          const _lightCyan = new THREE.DirectionalLight(0x00f5ff, 2);
          _lightCyan.position.set(2, 3, 2);
          _scene.add(_lightCyan);
          const _lightMagenta = new THREE.DirectionalLight(0xff2e97, 2);
          _lightMagenta.position.set(-2, 3, 1);
          _scene.add(_lightMagenta);

          const _clock = new THREE.Clock();
          const _animate = () => {
            requestAnimationFrame(_animate);
            const _delta = _clock.getDelta();
            if (_vrm) {
              _vrm.update(_delta);
              _vrm.scene.position.y = Math.sin(_clock.elapsedTime) * 0.05;
            }
            _renderer.render(_scene, _camera);
          };
          _animate();
        },
        (xhr) => {
          if (xhr.total > 0) {
            const _porcentaje = Math.round((xhr.loaded / xhr.total) * 100);
            _barraFill.style.width = _porcentaje + '%';
            _textoProgreso.textContent = _porcentaje + '%';
          }
        },
        (error) => {
          console.error('Error al cargar el VRM:', error);
          alert("La red cortó la descarga del modelo de Alexander.");
        }
      );
    } catch (error) {
      // SI EL CDN ESTÁ BLOQUEADO, SALTARÁ ESTO
      console.error("Error al cargar librerías:", error);
      alert("🚨 ERROR: Tu red está bloqueando las librerías 3D de internet. Intenta con otro WiFi o datos móviles.");
      _btnDescargar.style.display = 'block';
      _btnDescargar.style.background = "";
    }
  });
});
