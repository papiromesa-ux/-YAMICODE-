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

  if (!_btnDescargar) return;

  _btnDescargar.addEventListener('click', () => {
    // 1. Desaparecemos el botón y mostramos la barra
    _btnDescargar.style.display = 'none';
    _barraFondo.style.display = 'block';
    _textoProgreso.style.display = 'block';

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
          // 2. Cuando termina, ocultamos el panel y mostramos el 3D
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
          // 3. Actualizamos la barra de progreso
          if (xhr.total > 0) {
            const _porcentaje = Math.round((xhr.loaded / xhr.total) * 100);
            _barraFill.style.width = _porcentaje + '%';
            _textoProgreso.textContent = _porcentaje + '%';
          } else {
            // Si no hay total (a veces pasa en GitHub), mostramos los MB descargados
            _textoProgreso.textContent = Math.round(xhr.loaded / 1048576) + " MB...";
          }
        },
        (error) => {
          // 4. SI HAY UN ERROR, LO MOSTRAMOS EN PANTALLA PARA SABER QUÉ PASA
          console.error('Error al cargar el VRM:', error);
          _textoProgreso.textContent = "Error de descarga";
          _textoProgreso.style.color = "var(--magenta)";
          alert("Error técnico: No se pudo descargar el modelo 3D. Revisa tu conexión a internet o si el archivo está dañado.");
        }
      );

      window.addEventListener('resize', () => {
        _camera.aspect = _vrmContainer.clientWidth / _vrmContainer.clientHeight;
        _camera.updateProjectionMatrix();
        _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
      });

    } catch (error) {
      console.error('Error crítico 3D:', error);
      alert("Fallo del sistema: Las librerías 3D no pudieron cargar. Es posible que tu red las esté bloqueando.");
    }
  });
};

document.addEventListener('DOMContentLoaded', _initAvatar3D);
