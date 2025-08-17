import './style.css'
import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 5, 2) // x, y, z

const light = new THREE.DirectionalLight(0xebfeff, Math.PI)
light.castShadow = true
light.shadow.camera.far = 250
light.shadow.camera.left = -50
light.shadow.camera.right = 50
light.shadow.camera.top = 50
light.shadow.camera.bottom = -50
light.shadow.blurSamples = 10
light.shadow.radius = 5
light.target = camera
scene.add(light)

const lightOffset = new THREE.Vector3(100, 30, 70)

const lightHelper = new THREE.CameraHelper(light.shadow.camera)
lightHelper.visible = false
scene.add(lightHelper)

const textureLoader = new THREE.TextureLoader()
const textureFlare0 = textureLoader.load('img/lensflare0.png')
const textureFlare3 = textureLoader.load('img/lensflare3.png')

const lensflare = new Lensflare()
lensflare.addElement(new LensflareElement(textureFlare0, 1000, 0))
lensflare.addElement(new LensflareElement(textureFlare3, 500, 0.2))
lensflare.addElement(new LensflareElement(textureFlare3, 250, 0.8))
lensflare.addElement(new LensflareElement(textureFlare3, 125, 0.6))
lensflare.addElement(new LensflareElement(textureFlare3, 62.5, 0.4))
light.add(lensflare)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.7
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap
document.body.appendChild(renderer.domElement)

await new RGBELoader().loadAsync('img/venice_sunset_1k.hdr').then((texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
  scene.environmentIntensity = 0.1
  scene.background = scene.environment
  scene.backgroundIntensity = 0.25
  scene.backgroundBlurriness = 0.1
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
})

const menuPanel = document.getElementById('menuPanel') as HTMLDivElement

const startButton = document.getElementById('startButton') as HTMLButtonElement
startButton.addEventListener(
  'click',
  () => {
    controls.lock()
  },
  false
)

const controls = new PointerLockControls(camera, renderer.domElement)
controls.addEventListener('change', () => {
  console.log('pointerlock change')
})
controls.addEventListener('lock', () => (menuPanel.style.display = 'none'))
controls.addEventListener('unlock', () => (menuPanel.style.display = 'block'))

const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1)
const material = new THREE.MeshStandardMaterial()
const plane = new THREE.Mesh(planeGeometry, material)
plane.rotateX(-Math.PI / 2)
plane.receiveShadow = true
scene.add(plane)

let geometries: THREE.BufferGeometry[] = []
for (let i = 0; i < 1000; i++) {
  const g = new THREE.BoxGeometry(Math.random() * 4 + 1, Math.random() * 29 + 1, Math.random() * 4 + 1)
  g.computeBoundingBox()
  g.translate(Math.random() * 500 - 250, ((g as any).boundingBox.max.y - (g as any).boundingBox.min.y) / 2, Math.random() * 500 - 250)
  geometries.push(g)
}

// merge geometries
const mergedGeometries = BufferGeometryUtils.mergeGeometries(geometries)

const cubeMaterial = new THREE.MeshStandardMaterial({ roughness: 0.12, metalness: 0.9 })
const buildings = new THREE.Mesh(mergedGeometries, cubeMaterial)
buildings.castShadow = true
buildings.receiveShadow = true
scene.add(buildings)

const keyMap: { [key: string]: boolean } = {}
const onDocumentKey = (e: KeyboardEvent) => {
  keyMap[e.code] = e.type === 'keydown'
}
document.addEventListener('keydown', onDocumentKey, false)
document.addEventListener('keyup', onDocumentKey, false)

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI({ width: 400 }).close()

const rendererFolder = gui.addFolder('Renderer')
rendererFolder.add(renderer, 'toneMappingExposure', 0, 2, 0.01)

const backgroundFolder = gui.addFolder('Background')
backgroundFolder.add(scene, 'backgroundIntensity', 0, 2, 0.01)
backgroundFolder.add(scene, 'backgroundBlurriness', 0, 2, 0.01)

const environmentFolder = gui.addFolder('Environnment')
environmentFolder.add(scene, 'environmentIntensity', 0, 2, 0.01)

const materialFolder = gui.addFolder('cubeMaterial')
materialFolder.add(cubeMaterial, 'roughness', 0, 1.0, 0.01)
materialFolder.add(cubeMaterial, 'metalness', 0, 1.0, 0.01)

const lightFolder = gui.addFolder('Light Helper')
lightFolder.add(lightHelper, 'visible')

const clock = new THREE.Clock()
let delta

function animate() {
  requestAnimationFrame(animate)

  delta = clock.getDelta()

  //controls.update() // PointerLockControls doesn't have an update method, unlike OrbitControls.

  if (keyMap['KeyW'] || keyMap['ArrowUp']) {
    controls.moveForward(delta * 25)
  }
  if (keyMap['KeyS'] || keyMap['ArrowDown']) {
    controls.moveForward(-delta * 25)
  }
  if (keyMap['KeyA'] || keyMap['ArrowLeft']) {
    controls.moveRight(-delta * 25)
  }
  if (keyMap['KeyD'] || keyMap['ArrowRight']) {
    controls.moveRight(delta * 25)
  }

  light.position.copy(camera.position).add(lightOffset)

  render()
  //console.log( renderer.info.render.calls );

  stats.update()
}

function render() {
  renderer.render(scene, camera)
}

animate()