import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from './libs/three-vrm.module.js';

document.addEventListener('DOMContentLoaded', () => {
  const _pestañas = document.querySelectorAll('.tab-descarga');
  _pestañas.forEach(_tab => {
    _tab.addEventListener('click', () => {
      if (_tab.textContent === 'Modelos') return;
      alert("La sección " + _tab.textContent + " estará disponible pronto.");
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
      const response = await fetch('Modelos/Modelos%20de%20preterminado/alexander.vrm');
      if (!response.ok) throw new Error("No se encontró el archivo .vrm");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const _scene = new THREE.Scene();
      const _camera = new THREE.PerspectiveCamera(30, _vrmContainer.clientWidth / _vrmContainer.clientHeight, 0.1, 20);
      
      // Ajuste de cámara: Apuntamos al centro del pecho de Alexander
      _camera.position.set(0, 1.3, 2.5);
      _camera.lookAt(0, 1.2, 0);

      const _renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
      _renderer.setPixelRatio(window.devicePixelRatio);
      
      // Agregamos un fondo de prueba para saber si el lienzo está dibujando
      _renderer.setClearColor(0x000000, 0); // Fondo transparente
      
      const _loader = new GLTFLoader();
      _loader.register((parser) => new VRMLoaderPlugin(parser));

      _loader.load(
        url, 
        (gltf) => {
          _panelDescargas.style.display = 'none';
          _textoAvatar.style.display = 'block';
          _vrmContainer.innerHTML = '';
          
          _vrmContainer.appendChild(_renderer.domElement);

          const _vrm = gltf.userData.vrm;
          
          // Arreglamos la orientación si es un VRM versión 0
          VRMUtils.rotateVRM0(_vrm);
          
          // Limpieza y añadido a la escena
          _vrm.scene.position.set(0, 0, 0);
          _scene.add(_vrm.scene);

          // Luces más potentes para que resalte
          const _ambient = new THREE.AmbientLight(0xffffff, 1.5);
          _scene.add(_ambient);
          
          const _lightCyan = new THREE.DirectionalLight(0x00f5ff, 3);
          _lightCyan.position.set(2, 3, 2);
          _scene.add(_lightCyan);
          
          const _lightMagenta = new THREE.DirectionalLight(0xff2e97, 3);
          _lightMagenta.position.set(-2, 3, 1);
          _scene.add(_lightMagenta);

          const _clock = new THREE.Clock();
          const _animate = () => {
            requestAnimationFrame(_animate);
            const _delta = _clock.getDelta();
            if (_vrm) {
              _vrm.update(_delta);
              _vrm.scene.position.y = Math.sin(_clock.elapsedTime) * 0.05; // Flotación
            }
            _renderer.render(_scene, _camera);
          };
          _animate();

          // Forzamos el tamaño por si el contenedor cambió al ocultar el panel
          setTimeout(() => {
            _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
            _camera.aspect = _vrmContainer.clientWidth / _vrmContainer.clientHeight;
            _camera.updateProjectionMatrix();
          }, 100);

          window.addEventListener('resize', () => {
            _camera.aspect = _vrmContainer.clientWidth / _vrmContainer.clientHeight;
            _camera.updateProjectionMatrix();
            _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
          });
        },
        undefined,
        (error) => {
          console.error("Error al dibujar:", error);
          alert("El archivo se descargó pero falló al dibujarse.");
        }
      );
    } catch (error) {
      console.error("Error crítico:", error);
      alert("🚨 Error de conexión. Asegúrate de que el archivo .vrm esté en su lugar.");
    }
  });
});
