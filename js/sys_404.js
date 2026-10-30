window.addEventListener('load', () => {
  const _ttl = document.getElementById('errorTitle');
  const _dsc = document.getElementById('errorDesc');
  const _cde = document.getElementById('errorCode');

  // Diccionario de errores oficiales de YamiCode
  const ERRORES = {
    // ERRORES CRÍTICOS
    "OFF": {
      titulo: "SIN CONEXIÓN",
      codigo: "ERROR-CRITICO-28N8N534-[ SIN CONEXIÓN ]",
      color: "#888"
    },
    "GOOGLE": {
      titulo: "BLOQUEO DE GOOGLE",
      codigo: "ERROR-CRITICO-B99173933599593-[BLOQUEO DE GOOGLE]",
      color: "var(--magenta)"
    },
    "DESCARGA": {
      titulo: "INTERRUPCIÓN DE DATOS",
      codigo: "ERROR-CRITICO-8N53447BC890-[HUBO UNA INTERRUPCION EN DESCARGA ALGO O HACER ALGO Y TE FUISTE O SETE CORTO LA SEÑAL]",
      color: "var(--magenta)"
    },
    
    // ERRORES BÁSICOS
    "PERMISO": {
      titulo: "PERMISO DENEGADO",
      codigo: "ERROR-BASICO-28N034M829-[LE HAS BLOQUEADO UN PERMISO NECESARIO PARA PODER FUNCIONAR LA PAGINA PERFECTAMENTE]",
      color: "var(--cian)"
    },
    "SEÑAL": {
      titulo: "FALLO DE CONECTIVIDAD",
      codigo: "ERROR-BASICO-M19123019-[MALA SEÑAL]",
      color: "var(--cian)"
    },

    // ERRORES EXTRAÑOS
    "DESCONOCIDO": {
      titulo: "COLAPSO DEL SISTEMA",
      codigo: "ERROR-EXTRAÑO-67-[SI HAY UN ERROR DESCONOCIDO QUE SE LE TRABE LA PÁGINA O SELE QUEDE CONGELADA]",
      color: "var(--violeta)"
    }
  };

  // 1. Revisar si el usuario no tiene internet (Fuerza el error OFF)
  if (!navigator.onLine) {
    _mostrarError(ERRORES["OFF"]);
    return;
  }

  // 2. Revisar si venimos con un parámetro en la URL (ej: 404.html?err=DESCARGA)
  const urlParams = new URLSearchParams(window.location.search);
  const paramError = urlParams.get('err');

  if (paramError && ERRORES[paramError]) {
    _mostrarError(ERRORES[paramError]);
  } else {
    // Error por defecto si no se especifica nada (o si escriben mal la URL)
    _mostrarError({
      titulo: "RUTA NO ENCONTRADA",
      codigo: "ERROR-404-[LA RUTA O EL ARCHIVO NO EXISTE EN EL SERVIDOR]",
      color: "var(--texto-dim)"
    });
  }

  function _mostrarError(er) {
    _ttl.textContent = er.titulo;
    _ttl.style.color = er.color;
    _cde.style.color = er.color;
    _cde.style.textShadow = "0 0 20px " + er.color;
    _dsc.textContent = er.codigo;
  }
});
