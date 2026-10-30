import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from 'https://unpkg.com/@pixiv/three-vrm@3.0.0/lib/three-vrm.module.js';

const _initAvatar3D = () => {
  const _container = document.getElementById('vrm-container');
  const _uiCarga = document.getElementById('ui-carga-3d');
  const _btnDescargar = document.getElementById('btnDescargarModelo');
  const _btnOmitir = document.getElementById('btnOmitirModelo');
  const _statusTexto = document.getElementById('texto-status-3d');

  if (!_container || !_btnDescargar) return;

  // BOTÓN OMITIR: Muestra un ícono en lugar del modelo
  _btnOmitir.addEventListener('click', () => {
    _uiCarga.style.display = 'none';
    _statusTexto.textContent = "Modo Ligero";
    _statusTexto.style.color = "var(--texto-dim)";
    _container.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><span style="font-size: 4rem; font-family: 'Orbitron', sans-serif; color: var(--cian);">[A]</span></div>`;
  });

  // BOTÓN DESCARGAR: Inicia el motor 3D
  _btnDescargar.addEventListener('click', () => {
    _uiCarga.style.display = 'none'; // Ocultamos los botones
    _statusTexto.textContent = "Descargando...";
    
    try {
      // 1. Configuramos la escena
      const _scene = new THREE.Scene();
      const _camera = new THREE.PerspectiveCamera(30, _container.clientWidth / _container.clientHeight, 0.1, 20);
      _camera.position.set(0, 1.3, 2.5);

      const _renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      _renderer.setSize(_container.clientWidth, _container.clientHeight);
      _renderer.setPixelRatio(window.devicePixelRatio);
      
      _container.innerHTML = '';
      _container.appendChild(_renderer.domElement);

      // 2. Luces Neón
      const _ambient = new THREE.AmbientLight(0xffffff, 0.6);
      _scene.add(_ambient);

      const _lightCyan = new THREE.DirectionalLight(0x00f5ff, 2);
      _lightCyan.position.set(2, 3, 2);
      _scene.add(_lightCyan);

      const _lightMagenta = new THREE.DirectionalLight(0xff2e97, 2);
      _lightMagenta.position.set(-2, 3, 1);
      _scene.add(_lightMagenta);

      // 3. Cargar el modelo VRM
      const _loader = new GLTFLoader();
      _loader.register((parser) => new VRMLoaderPlugin(parser));

      const _path = 'Modelos/Modelos%20de%20preterminado/alexander.vrm';

      _loader.load(
        _path, 
        (gltf) => {
          const _vrm = gltf.userData.vrm;
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          VRMUtils.combineSkeletons(gltf.scene);
          
          _vrm.scene.rotation.y = Math.PI; 
          _scene.add(_vrm.scene);

          _statusTexto.textContent = "Hacker en línea";
          _statusTexto.style.color = "#00ff88";

          // Animación
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
        undefined,
        (error) => {
          console.error('Error al cargar el VRM:', error);
          _statusTexto.textContent = "Error al cargar";
          _statusTexto.style.color = "var(--magenta)";
          _container.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><p style="color: var(--magenta); font-family: monospace; font-size: 0.8rem;">Fallo de red 3D</p></div>`;
        }
      );

      window.addEventListener('resize', () => {
        _camera.aspect = _container.clientWidth / _container.clientHeight;
        _camera.updateProjectionMatrix();
        _renderer.setSize(_container.clientWidth, _container.clientHeight);
      });

    } catch (error) {
      console.error('Error crítico 3D:', error);
      _statusTexto.textContent = "Fallo del sistema";
    }
  });
};

document.addEventListener('DOMContentLoaded', _initAvatar3D);
