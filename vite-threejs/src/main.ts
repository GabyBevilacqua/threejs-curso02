import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import Stats from 'three/addons/libs/stats.module.js'
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'

const scene = new THREE.Scene()

const light = new THREE.SpotLight(undefined, Math.PI * 1000)
light.position.set(5, 5, 5)
light.angle = Math.PI / 16
light.castShadow = true
scene.add(light)

const helper = new THREE.SpotLightHelper(light)
scene.add(helper)

new RGBELoader().load('img/venice_sunset_1k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
})

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(1.5, 0.75, 2)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.1
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const textureLoader = new THREE.TextureLoader()
const textureFlare0 = textureLoader.load('https://cdn.jsdelivr.net/gh/Sean-Bradley/First-Car-Shooter@main/dist/client/img/lensflare0.png')

const lensflare = new Lensflare()
lensflare.addElement(new LensflareElement(textureFlare0, 1000, 0))
light.add(lensflare)

new GLTFLoader().load('models/suzanne_scene.glb', (gltf) => {
  console.log(gltf)

  const suzanne = gltf.scene.getObjectByName('Suzanne') as THREE.Mesh
  suzanne.castShadow = true

  const plane = gltf.scene.getObjectByName('Plane') as THREE.Mesh
  plane.receiveShadow = true

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