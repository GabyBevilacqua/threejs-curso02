import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import Stats from 'three/addons/libs/stats.module.js'
// import hdr from './img/venice_sunset_1k.hdr'
// import image from './img/grid.png'
// import model from './models/suzanne_no_material.glb'

const scene = new THREE.Scene()

const hdr = 'https://sbcode.net/img/venice_sunset_1k.hdr'
const image = 'https://sbcode.net/img/grid.png'
const model = 'https://sbcode.net/models/suzanne_no_material.glb'

// const hdr = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/equirectangular/venice_sunset_1k.hdr'
// const image = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/uv_grid_opengl.jpg'
// const model = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Xbot.glb'

// const hdr = 'img/venice_sunset_1k.hdr'
// const image = 'img/grid.png'
// const model = 'models/suzanne_no_material.glb'

new RGBELoader().load(hdr, (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
  scene.background = texture
})

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(-2, 0.5, 2)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const material = new THREE.MeshStandardMaterial()
material.map = new THREE.TextureLoader().load(image)
//material.map.colorSpace = THREE.SRGBColorSpace

const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material)
plane.rotation.x = -Math.PI / 2
plane.position.y = -1
scene.add(plane)

new GLTFLoader().load(model, (gltf) => {
  gltf.scene.traverse((child) => {
    ;(child as THREE.Mesh).material = material
  })
  scene.add(gltf.scene)
})

const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
  requestAnimationFrame(animate)

  controls.update()

  renderer.render(scene, camera)

  stats.update()
}

animate()