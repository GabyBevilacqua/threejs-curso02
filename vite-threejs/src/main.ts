import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Stats from "three/addons/libs/stats.module.js";

const scene = new THREE.Scene();

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

new RGBELoader().load("img/venice_sunset_1k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
  scene.backgroundBlurriness = 1;
});

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0.1, 1.2, 1.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.75, 0);

const stats = new Stats();
document.body.appendChild(stats.dom);

function lerp(from: number, to: number, speed: number) {
  const amount = (1 - speed) * from + speed * to
  return Math.abs(from - to) < 0.001 ? to : amount
}

let mixer: THREE.AnimationMixer;
let animationActions: { [key: string]: THREE.AnimationAction } = {}
let activeAction: THREE.AnimationAction
let speed = 0,
  toSpeed = 0

// new GLTFLoader().load('models/Crypto$@walk.glb', (gltf) => {
//      mixer = new THREE.AnimationMixer(gltf.scene)
//   //   //console.log(gltf  )

//      mixer.clipAction(gltf.animations[0]).play()

//   scene.add(gltf.scene)
// })

async function loadCrypto() {
  const loader = new GLTFLoader();
  const [crypto, idle, run] = await Promise.all([
    loader.loadAsync("models/crypto$@walk.glb"),
    loader.loadAsync("models/crypto@idle.glb"),
    loader.loadAsync('models/crypto@run.glb')
  ]);

  mixer = new THREE.AnimationMixer(crypto.scene);

// mixer.clipAction(idle.animations[0]).play();
  // activeAction = mixer.clipAction(idle.animations[0]).play();

    animationActions['idle'] = mixer.clipAction(idle.animations[0])
    animationActions['walk'] = mixer.clipAction(crypto.animations[0])
    animationActions['run'] = mixer.clipAction(run.animations[0])

   animationActions['idle'].play()
   activeAction = animationActions['idle']

  scene.add(crypto.scene);
}
await loadCrypto();

const keyMap: { [key: string]: boolean } = {}

const onDocumentKey = (e: KeyboardEvent) => {
  keyMap[e.code] = e.type === 'keydown'
}
document.addEventListener('keydown', onDocumentKey, false)
document.addEventListener('keyup', onDocumentKey, false)

const clock = new THREE.Clock();
let delta = 0;

function animate() {
  requestAnimationFrame(animate);

  delta = clock.getDelta();

  controls.update();

  mixer.update(delta);

  if (keyMap['KeyW']) {
    if (keyMap['ShiftLeft']) {
      //run
      if (activeAction != animationActions['run']) {
        activeAction.fadeOut(0.5)
        animationActions['run'].reset().fadeIn(0.25).play()
        activeAction = animationActions['run']
         toSpeed = 4
      }
    } else {
      //walk
      if (activeAction != animationActions['walk']) {
        activeAction.fadeOut(0.5)
        animationActions['walk'].reset().fadeIn(0.25).play()
        activeAction = animationActions['walk']
         toSpeed = 1
      }
    }
  } else {
    //idle
    if (activeAction != animationActions['idle']) {
      activeAction.fadeOut(0.5)
      animationActions['idle'].reset().fadeIn(0.25).play()
      activeAction = animationActions['idle']
       toSpeed = 0
    }
  }

  speed = lerp(speed, toSpeed, delta * 10)
  gridHelper.position.z -= speed * delta
  gridHelper.position.z = gridHelper.position.z % 10

  renderer.render(scene, camera);

  stats.update();
}

animate();
