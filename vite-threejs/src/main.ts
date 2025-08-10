import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import Stats from "three/addons/libs/stats.module.js";

const scene = new THREE.Scene();

new RGBELoader().load("img/venice_sunset_1k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
  scene.backgroundBlurriness = 0.15;
});

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 3);

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
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const raycaster = new THREE.Raycaster();
const pickables: THREE.Mesh[] = [];
const mouse = new THREE.Vector2();

const arrowHelper = new THREE.ArrowHelper();
arrowHelper.setLength(1);
scene.add(arrowHelper);

renderer.domElement.addEventListener("mousemove", (e) => {
  mouse.set(
    (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
  );

  //console.log(mouse);

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(pickables, false);

  if (intersects.length) {
    console.log(intersects.length);
    //     //console.log(intersects[0].point)
    //    console.log(intersects[0].object.name + ' ' + intersects[0].distance)
    //     //console.log((intersects[0].face as THREE.Face).normal)

    const n = new THREE.Vector3();
    n.copy((intersects[0].face as THREE.Face).normal);
    //     //n.transformDirection(intersects[0].object.matrixWorld)

    arrowHelper.setDirection(n);
    arrowHelper.position.copy(intersects[0].point);
  }
});

renderer.domElement.addEventListener("dblclick", (e) => {
  mouse.set(
    (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(pickables, false)

     if (intersects.length) {
      const n = new THREE.Vector3()
      n.copy((intersects[0].face as THREE.Face).normal)
      n.transformDirection(intersects[0].object.matrixWorld)

       const cube = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshStandardMaterial())
       cube.lookAt(n)
      cube.position.copy(intersects[0].point)
      cube.position.addScaledVector(n, 0.101)
      cube.castShadow = true

      scene.add(cube)
      pickables.push(cube)
     }
});

new GLTFLoader().load("models/suzanne_scene.glb", (gltf) => {
  const suzanne = gltf.scene.getObjectByName("Suzanne") as THREE.Mesh;
  suzanne.castShadow = true;
  // @ts-ignore
  suzanne.material.map.colorSpace = THREE.LinearSRGBColorSpace;
  pickables.push(suzanne);

  const plane = gltf.scene.getObjectByName("Plane") as THREE.Mesh;
  plane.receiveShadow = true;
  pickables.push(plane);

  const spotLight = gltf.scene.getObjectByName("Spot") as THREE.SpotLight;
  spotLight.intensity /= 500;
  spotLight.castShadow = true;

  scene.add(gltf.scene);
});

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);

  stats.update();
}

animate();
