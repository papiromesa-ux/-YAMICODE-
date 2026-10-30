// /// 1. IMPORTACIONES (Cambiamos a jsDelivr que es más difícil de bloquear) \\\
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from 'https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@3.0.0/lib/three-vrm.module.js';

const _initAvatar3D = () => {
  const _vrmContainer = document.getElementById('vrm-container');
  const _panelDescargas = document.getElementById('panel-descargas');
  const _btnDescargar = document.getElementById('btnDescargarModelo');
  const _barraFondo = document.getElementById('barra-progreso-3d');
  const _barraFill = document.getElementById('progreso-fill');
  const _textoProgreso = document.getElementById('texto-progreso');
  const _textoAvatar = document.getElementById('texto-avatar');

  // /// 2. HACER QUE LAS PESTAÑAS REACCIONEN \\\
  const _pestañas = document.querySelectorAll('.tab-descarga');
  _pestañas.forEach(_tab => {
    _tab.addEventListener('click', () => {
      if (_tab.textContent === 'Modelos') return; // Si ya estamos en Modelos, no hacer nada
      alert("La sección " + _tab.textContent + " estará disponible en la próxima actualización.");
    });
  });

  if (!_btnDescargar) return;

  // /// 3. LÓGICA DE DESCARGA \\\
  _btnDescargar.addEventListener('click', () => {
    _btnDescargar.style.display = 'none';
    _barraFondo.style.display = 'block';
    _textoProgreso.style.display = 'block';
    _textoProgreso.textContent = "Conectando...";

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
          // ÉXITO: Ocultamos el panel y mostramos a Alexander
          _panelDescargas.style.display = 'none';
          _textoAvatar.style.display = 'block';
          
          _vrmContainer.innerHTML = '';
          _vrmContainer.appendChild(_renderer.domElement);

          const _vrm = gltf.userData.vrm;
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          VRMUtils.combineSkeletons(gltf.scene);
          
          _vrm.scene.rotation.y = Math.PI; 
          _scene.add(_vrm.scene);

          // Luces neón
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
          // Actualizar barra de progreso
          if (xhr.total > 0) {
            const _porcentaje = Math.round((xhr.loaded / xhr.total) * 100);
            _barraFill.style.width = _porcentaje + '%';
            _textoProgreso.textContent = _porcentaje + '%';
          }
        },
        (error) => {
          // Error al descargar el archivo .vrm
          console.error('Error al cargar el VRM:', error);
          _textoProgreso.textContent = "Error al descargar";
          _textoProgreso.style.color = "var(--magenta)";
          alert("Fallo al descargar el modelo. El archivo está ahí, pero la red cortó la descarga.");
        }
      );

      window.addEventListener('resize', () => {
        _camera.aspect = _vrmContainer.clientWidth / _vrmContainer.clientHeight;
        _camera.updateProjectionMatrix();
        _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
      });

    } catch (error) {
      // Error si las librerías de Three.js no cargan de internet
      console.error('Error crítico 3D:', error);
      _textoProgreso.textContent = "Error del motor 3D";
      _textoProgreso.style.color = "var(--magenta)";
      alert("Tu red o navegador sigue bloqueando las librerías 3D (jsDelivr). Intenta con otra red WiFi.");
    }
  });
};

document.addEventListener('DOMContentLoaded', _initAvatar3D);
