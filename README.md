# Proyecto Three.js con Vite y TypeScript

Este proyecto integra varios ejercicios y prácticas realizadas con **Three.js**, empleando **Vite** como *bundler* y **TypeScript** para un desarrollo tipado y escalable.  
Incluye diferentes escenarios 3D con navegación entre páginas, control de personajes, animaciones y carga optimizada de modelos GLTF.

## 🚀 Características

- **Three.js**: escenas, luces, sombras, materiales y cámaras.
- **OrbitControls**: navegación e interacción fluida con la escena.
- **GLTFLoader y DRACOLoader**: carga eficiente de modelos 3D comprimidos.
- **RGBELoader**: uso de texturas HDRI para iluminación ambiental realista.
- **JEASINGS**: curvas de animación personalizadas.
- **Raycaster**: detección de clics y colisiones.
- **Stats**: panel de rendimiento en tiempo real.
- **Animación de personajes** con `AnimationMixer`, múltiples acciones (`idle`, `walk`, `run`, `jump`, `pose`).
- **Control por teclado** para mover y animar el personaje.
- **Grid dinámico** con interpolación (*lerp*).


## 🛠 Tecnologías utilizadas

- [Three.js](https://threejs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [JEASINGS](https://www.npmjs.com/package/jeasings)
- [GSAP](https://greensock.com/gsap/) 

## 📦 Instalación y ejecución

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/nombre-del-proyecto.git
   cd nombre-del-proyecto

npm install

npm run dev
