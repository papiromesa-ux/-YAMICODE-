import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from 'https://unpkg.com/@pixiv/three-vrm@3.0.0/lib/three-vrm.module.js';

const _initAvatar3D = () => {
  const _container = document.getElementById('vrm-container');
  if (!_container) return;

  // Creamos la interfaz de "Descarga"
  _container.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; padding: 1rem; text-align: center;">
      <p style="font-family: monospace; color: var(--cian); margin-bottom: 0.5rem; font-size: 0.9rem;">SYS.AVATAR</p>
      <p style="color: var(--texto-dim); font-size: 0.8rem; margin-bottom: 1.5rem;">Modelo 3D: 7.75 MB</p>
      <button id="btnDownload3D" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem; margin-bottom: 0.5rem; width: 100%;">Descargar Avatar</button>
      <button id="btnSkip3D" class="btn btn-ghost" style="padding: 0.5rem 1rem; font-size: 0.8rem; width: 100%; border-color: var(--texto-dim); color: var(--texto-dim);">Omitir</button>
    </div>
  `;

  document.getElementById('btnSkip3D').addEventListener('click', () => {
    _container.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><span style="font-size: 4rem; font-family: 'Orbitron', sans-serif; color: var(--cian);">[A]</span></div>`;
  });

  document.getElementById('btnDownload3D').addEventListener('click', () => {
    _container.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><p style="color: var(--cian); font-family: monospace;">Cargando 3D...</p></div>`;
    
    // Iniciar carga real
    const _scene = new THREE.Scene();
    const _camera = new THREE.PerspectiveCamera(30, _container.clientWidth / _container.clientHeight, 0.1, 20);
    _camera.position.set(0, 1.3, 2.5);

    const _renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    _renderer.setSize(_container.clientWidth, _container.clientHeight);
    _renderer.setPixelRatio(window.devicePixelRatio);
    _container.innerHTML = '';
    _container.appendChild(_renderer.domElement);

    const _ambient = new THREE.AmbientLight(0xffffff, 0.4);
    _scene.add(_ambient);

    const _lightCyan = new THREE.DirectionalLight(0x00f5ff, 2);
    _lightCyan.position.set(2, 3, 2);
    _scene.add(_lightCyan);

    const _lightMagenta = new THREE.DirectionalLight(0xff2e97, 2);
    _lightMagenta.position.set(-2, 3, 1);
    _scene.add(_lightMagenta);

    const _loader = new GLTFLoader();
    _loader.register((parser) => new VRMLoaderPlugin(parser));

    // Usamos %20 para los espacios en la ruta
    const _path = 'Modelos/Modelos%20de%20preterminado/alexander.vrm';

    _loader.load(
      _path, 
      (gltf) => {
        const _vrm = gltf.userData.vrm;
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);
        _vrm.scene.rotation.y = Math.PI; 
        _scene.add(_vrm.scene);

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
        _container.innerHTML = `<p style="color: var(--magenta); text-align: center; font-size: 0.8rem;">Error al cargar el 3D. Verifica tu conexión.</p>`;
      }
    );

    window.addEventListener('resize', () => {
      _camera.aspect = _container.clientWidth / _container.clientHeight;
      _camera.updateProjectionMatrix();
      _renderer.setSize(_container.clientWidth, _container.clientHeight);
    });
  });
};

document.addEventListener('DOMContentLoaded', _initAvatar3D);
