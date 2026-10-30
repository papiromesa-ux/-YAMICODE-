// 1. Primero intentamos importar las librerías. Si esto falla, el botón no hará nada.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from 'https://unpkg.com/@pixiv/three-vrm@3.0.0/lib/three-vrm.module.js';

const _initAvatar3D = () => {
  const _vrmContainer = document.getElementById('vrm-container');
  const _panelDescargas = document.getElementById('panel-descargas');
  const _btnDescargar = document.getElementById('btnDescargarModelo');
  const _barraFondo = document.getElementById('barra-progreso-3d');
  const _barraFill = document.getElementById('progreso-fill');
  const _textoProgreso = document.getElementById('texto-progreso');
  const _textoAvatar = document.getElementById('texto-avatar');

  if (!_btnDescargar) {
    alert("Error grave: No se encontró el botón de descarga en el HTML.");
    return;
  }

  _btnDescargar.addEventListener('click', () => {
    // PRUEBA DE VIDA: Cambiamos el color del botón para saber si el clic funciona
    _btnDescargar.style.background = "var(--magenta)"; 
    
    // Ocultamos el botón y mostramos la barra
    _btnDescargar.style.display = 'none';
    _barraFondo.style.display = 'block';
    _textoProgreso.style.display = 'block';
    _textoProgreso.textContent = "Iniciando motor 3D...";

    try {
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
          // Si llega aquí, el modelo cargó
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
          // Barra de progreso
          if (xhr.total > 0) {
            const _porcentaje = Math.round((xhr.loaded / xhr.total) * 100);
            _barraFill.style.width = _porcentaje + '%';
            _textoProgreso.textContent = _porcentaje + '%';
          } else {
            _textoProgreso.textContent = Math.round(xhr.loaded / 1048576) + " MB...";
          }
        },
        (error) => {
          // SI FALLA LA DESCARGA
          console.error('Error al cargar el VRM:', error);
          _textoProgreso.textContent = "Error al descargar";
          _textoProgreso.style.color = "var(--magenta)";
          alert("No se pudo descargar el modelo. Revisa tu conexión.");
        }
      );

      window.addEventListener('resize', () => {
        _camera.aspect = _vrmContainer.clientWidth / _vrmContainer.clientHeight;
        _camera.updateProjectionMatrix();
        _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
      });

    } catch (error) {
      // SI FALLA EL MOTOR 3D (WEBGL)
      console.error('Error crítico 3D:', error);
      _textoProgreso.textContent = "Fallo del sistema 3D";
      _textoProgreso.style.color = "var(--magenta)";
      alert("Tu navegador o red bloquearon las librerías 3D (Three.js). Intenta con otro navegador o red WiFi.");
    }
  });
};

// Nos aseguramos de que el script corra solo cuando el HTML esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initAvatar3D);
} else {
  _initAvatar3D();
}
