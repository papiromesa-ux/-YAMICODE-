import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from './libs/three-vrm.module.js';

document.addEventListener('DOMContentLoaded', () => {
  
  // /// 1. LÓGICA DEL MENÚ HAMBURGUESA CSS \\\
  const _nav = document.getElementById('nav');
  const _menuToggle = document.getElementById('menuToggle');

  _menuToggle.addEventListener('click', () => {
    _nav.classList.toggle('active');
    _menuToggle.classList.toggle('active');
  });

  // Cerrar menú al hacer clic en un enlace
  _nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      _nav.classList.remove('active');
      _menuToggle.classList.remove('active');
    });
  });

  // /// 2. MODAL DE DESCARGAS \\\
  const _modalDescargas = document.getElementById('modal-descargas');
  const _btnAbrirDescargas = document.getElementById('btnAbrirDescargas');
  const _btnCerrarDescargas = document.getElementById('btnCerrarDescargas');

  _btnAbrirDescargas.addEventListener('click', () => {
    _nav.classList.remove('active');
    _menuToggle.classList.remove('active');
    _modalDescargas.style.display = 'flex';
  });
  _btnCerrarDescargas.addEventListener('click', () => _modalDescargas.style.display = 'none');

  // /// 3. MODAL DE REPORTES (Envío a WhatsApp) \\\
  const _modalReportes = document.getElementById('modal-reportes');
  const _btnAbrirReportes = document.getElementById('btnAbrirReportes');
  const _btnCerrarReportes = document.getElementById('btnCerrarReportes');
  const _btnEnviarWhatsApp = document.getElementById('btnEnviarWhatsApp');
  const _txtReporte = document.getElementById('txtReporte');

  _btnAbrirReportes.addEventListener('click', () => {
    _nav.classList.remove('active');
    _menuToggle.classList.remove('active');
    _modalReportes.style.display = 'flex';
  });
  _btnCerrarReportes.addEventListener('click', () => _modalReportes.style.display = 'none');

  _btnEnviarWhatsApp.addEventListener('click', () => {
    const mensaje = _txtReporte.value.trim();
    const numero = "50368405099"; // Código de país + número
    const texto = mensaje ? `Hola, vengo de YamiCode. Reporte: ${mensaje}` : "Hola, vengo de YamiCode. Quiero reportar un error.";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  });

  // /// 4. CARGAR MODELO 3D (Alexander o Andrea) \\\
  const _vrmContainer = document.getElementById('vrm-container');
  const _textoAvatar = document.getElementById('texto-avatar');
  const _nombreAvatarActual = document.getElementById('nombre-avatar-actual');
  const _barraFondo = document.getElementById('barra-progreso-3d');
  const _barraFill = document.getElementById('progreso-fill');
  const _textoProgreso = document.getElementById('texto-progreso');

  const _botonesDescargar = document.querySelectorAll('.btn-descargar-modelo');
  const _botonesEliminar = document.querySelectorAll('.btn-eliminar-modelo');

  window.cargarModelo3D = async (nombreModelo, nombreMostrar) => {
    _botonesDescargar.forEach(b => b.style.display = 'none');
    _botonesEliminar.forEach(b => b.style.display = 'none');
    
    _barraFondo.style.display = 'block';
    _textoProgreso.style.display = 'block';
    _textoProgreso.textContent = "Descargando " + nombreMostrar + "...";
    _barraFill.style.width = '0%';

    try {
      const ruta = `Modelos/Modelos%20de%20preterminado/${nombreModelo}.vrm`;
      const response = await fetch(ruta);
      if (!response.ok) throw new Error("No se encontró el archivo .vrm");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const _scene = new THREE.Scene();
      const _camera = new THREE.PerspectiveCamera(30, _vrmContainer.clientWidth / _vrmContainer.clientHeight, 0.1, 20);
      
      _camera.position.set(0, 1.4, 4.5);
      _camera.lookAt(0, 1.2, 0);

      const _renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      _renderer.setPixelRatio(window.devicePixelRatio);
      
      const _loader = new GLTFLoader();
      _loader.register((parser) => new VRMLoaderPlugin(parser));

      _loader.load(
        url, 
        (gltf) => {
          _modalDescargas.style.display = 'none';
          _textoAvatar.style.display = 'block';
          _nombreAvatarActual.textContent = nombreMostrar;
          _vrmContainer.innerHTML = '';
          
          _renderer.setSize(_vrmContainer.clientWidth, _vrmContainer.clientHeight);
          _vrmContainer.appendChild(_renderer.domElement);

          const _vrm = gltf.userData.vrm;
          VRMUtils.rotateVRM0(_vrm);
          _vrm.scene.position.set(0, 0, 0);
          _scene.add(_vrm.scene);

          const _ambient = new THREE.AmbientLight(0xffffff, 1.2);
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
              _vrm.scene.position.y = Math.sin(_clock.elapsedTime) * 0.05;
            }
            _renderer.render(_scene, _camera);
          };
          _animate();

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

          document.querySelector(`.btn-eliminar-modelo[data-modelo="${nombreModelo}"]`).style.display = 'flex';
        },
        (xhr) => {
          if (xhr.total > 0) {
            const _porcentaje = Math.round((xhr.loaded / xhr.total) * 100);
            _barraFill.style.width = _porcentaje + '%';
            _textoProgreso.textContent = _porcentaje + '%';
          }
        },
        (error) => {
          console.error("Error al dibujar:", error);
          alert("Error al dibujar el modelo.");
        }
      );
    } catch (error) {
      console.error("Error crítico:", error);
      alert("🚨 No se pudo descargar el modelo. Revisa tu conexión.");
    }
  };

  _botonesDescargar.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modelo = e.currentTarget.getAttribute('data-modelo');
      const nombre = e.currentTarget.getAttribute('data-nombre');
      cargarModelo3D(modelo, nombre);
    });
  });

  _botonesEliminar.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modelo = e.currentTarget.getAttribute('data-modelo');
      if (confirm("¿Seguro que quieres eliminar " + modelo + "? Se tendrá que volver a descargar.")) {
        location.reload();
      }
    });
  });

});
