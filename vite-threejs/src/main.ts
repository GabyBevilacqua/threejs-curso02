import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import Stats from "three/addons/libs/stats.module.js";
import JEASINGS from "jeasings";

const scene = new THREE.Scene();

const gridHelper = new THREE.GridHelper();
gridHelper.position.y = -1;
scene.add(gridHelper);

await new RGBELoader().loadAsync("img/venice_sunset_1k.hdr").then((texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  //render() //this line is unnecessary if you are re-rendering within the animation loop
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
//controls.addEventListener('change', render) //this line is unnecessary if you are re-rendering within the animation loop

let suzanne: THREE.Mesh, plane: THREE.Mesh;
let bounceCount = 0;

new GLTFLoader().load("models/suzanne_scene.glb", (gltf) => {
  suzanne = gltf.scene.getObjectByName("Suzanne") as THREE.Mesh;
  suzanne.castShadow = true;
  (
    (suzanne.material as THREE.MeshStandardMaterial).map as THREE.Texture
  ).colorSpace = THREE.LinearSRGBColorSpace;

  plane = gltf.scene.getObjectByName("Plane") as THREE.Mesh;
  plane.scale.set(50, 1, 50);
  (plane.material as THREE.MeshStandardMaterial).envMap = scene.environment; // since three@163, we need to set `envMap` before changing `envMapIntensity` has any effect.
  (plane.material as THREE.MeshStandardMaterial).envMapIntensity = 0.05;
  plane.receiveShadow = true;

  const spotLight = gltf.scene.getObjectByName("Spot") as THREE.SpotLight;
  spotLight.intensity /= 500;
  spotLight.castShadow = true;
  spotLight.target = suzanne;

  scene.add(gltf.scene);

  //render()
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener("dblclick", (e) => {
  mouse.set(
    (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([suzanne, plane], false);

  if (intersects.length) {
    const p = intersects[0].point;
    bounceTo(p);

  }
});

const bounceTo = (p: THREE.Vector3) => {

      // slding x,z
    new JEASINGS.JEasing(suzanne.position)
      .to(
        {
          x: p.x,
          z: p.z
        },
        500
      )
      .start()

    // going up
    new JEASINGS.JEasing(suzanne.position)
      .to(
        {
          y: p.y + 3
        },
        250
      )
      .easing(JEASINGS.Cubic.Out)
      .start()
     .onComplete(() => {
      bounceCount++;
      if (bounceCount >= 6) {
        window.location.href = "pagina2.html";
        return;
      }

    // going down
    new JEASINGS.JEasing(suzanne.position)
      .to(
        {
          y: p.y + 1
        },
        250
      )
      //.delay(250)
      .easing(JEASINGS.Bounce.Out)
      .start()
    })
}

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  JEASINGS.update();

   render()

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();


    //controls.target.set(p.x, p.y, p.z)

    // JEasing the controls.target
    // new JEASINGS.JEasing(controls.target)
    //   .to(
    //     {
    //       x: p.x,
    //       y: p.y,
    //       z: p.z,
    //     },
    //     500
    //   )
    //      //.delay (1000)
    //      //.easing(JEASINGS.Cubic.Out)
    //   //.onUpdate(() => render())
    //   .start();