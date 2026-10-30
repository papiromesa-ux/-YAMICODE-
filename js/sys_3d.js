import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from './libs/three-vrm.module.js';

document.addEventListener('DOMContentLoaded', () => {
  
  const _pestañas = document.querySelectorAll('.tab-descarga');
  _pestañas.forEach(_tab => {
    _tab.addEventListener('click', () => {
      if (_tab.textContent === 'Modelos') return;
      alert("La sección " + _tab.textContent + " estará disponible en la próxima actualización.");
    });
  });

  const _btnDescargar = document.getElementById('btnDescargarModelo');
  if (!_btnDescargar) return;

  _btnDescargar.addEventListener('click', async () => {
    _btnDescargar.style.display = 'none';
    const _barraFondo = document.getElementById('barra-progreso-3d');
    const _barraFill = document.getElementById('progreso-fill');
    const _textoProgreso = document.getElementById('texto-progreso');
    const _panelDescargas = document.getElementById('panel-descargas');
    const _textoAvatar = document.getElementById('texto-avatar');
    const _vrmContainer = document.getElementById('vrm-container');

    _barraFondo.style.display = 'block';
    _textoProgreso.style.display = 'block';
    _textoProgreso.textContent = "Descargando Alexander...";

    try {
      // Usamos fetch para descargar el archivo del modelo
      const _path = 'Modelos/Modelos%20de%20preterminado/alexander.vrm';
      const response = await fetch(_path);
      if (!response.ok) throw new Error("Error de red al descargar VRM");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Configuramos la escena 3D
      const _scene = new THREE.Scene();
      const _camera = new THREE.PerspectiveCamera(30, _vrmContainer.clientWidth / _vrmContainer.clientHeight, 0.1, 20);
      _camera.position.set(0, 1.3, 2.5);

      const _renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      _renderer.setPixelRatio(window.devicePixelRatio);
      
      const _loader = new GLTFLoader();
      _loader.register((parser) => new VRMLoaderPlugin(parser));

      _loader.load(
        url, 
        (gltf) => {
          _panelDescargas.style.display = 'none';
          _textoAvatar.style.display = 'block';
          
          _vrmContainer.innerHTML = '';
          
          // Delay para asegurar que el contenedor tenga su tamaño
          setTimeout(() => {
            _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
            _vrmContainer.appendChild(_renderer.domElement);

            const _vrm = gltf.userData.vrm;
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.combineSkeletons(gltf.scene);
            
            _vrm.scene.rotation.y = Math.PI; 
            _scene.add(_vrm.scene);

            // Luces Neón
            const _ambient = new THREE.AmbientLight(0xffffff, 0.8);
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

            window.addEventListener('resize', () => {
              _camera.aspect = _vrmContainer.clientWidth / _vrmContainer.clientHeight;
              _camera.updateProjectionMatrix();
              _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
            });
          }, 100);
        },
        undefined,
        (error) => {
          console.error('Error al cargar el VRM:', error);
          _textoProgreso.textContent = "Error al dibujar";
          _textoProgreso.style.color = "var(--magenta)";
        }
      );
    } catch (error) {
      console.error("Error al descargar:", error);
      _textoProgreso.textContent = "Error de red";
      _textoProgreso.style.color = "var(--magenta)";
      alert("No se pudo conectar con el modelo.");
    }
  });
});
