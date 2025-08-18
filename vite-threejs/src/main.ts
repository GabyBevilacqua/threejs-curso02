import './style.css'
import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import RAPIER from '@dimforge/rapier3d-compat'
import RapierDebugRenderer from './RapierDebugRenderer'
import Car from './Car'
//import Box from './Box'

await RAPIER.init() // This line is only needed if using the compat version
const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0)
const world = new RAPIER.World(gravity)

const scene = new THREE.Scene()

const rapierDebugRenderer = new RapierDebugRenderer(scene, world)

const gridHelper = new THREE.GridHelper(200, 100, 0x222222, 0x222222)
gridHelper.position.y = -0.5
scene.add(gridHelper)

await new RGBELoader().loadAsync('img/venice_sunset_1k.hdr').then((texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
  scene.environmentIntensity = 0.1 // new in Three r163. https://threejs.org/docs/#api/en/scenes/Scene.environmentIntensity
})

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 4)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

/* 
A follow cam implementation. 
A followTarget is added to the car mesh. 
A reference to the pivot is given to the car. 
The cars update method lerps the pivot towards to followTarget.
*/

const pivot = new THREE.Object3D()
const yaw = new THREE.Object3D()
const pitch = new THREE.Object3D()

scene.add(pivot)
pivot.add(yaw)
yaw.add(pitch)
pitch.add(camera) // adding the perspective camera to the hierarchy

function onDocumentMouseMove(e: MouseEvent) {
  yaw.rotation.y -= e.movementX * 0.002
  const v = pitch.rotation.x - e.movementY * 0.002

  // limit range
  if (v > -1 && v < 0.1) {
    pitch.rotation.x = v
  }
}

function onDocumentMouseWheel(e: WheelEvent) {
  e.preventDefault()
  const v = camera.position.z + e.deltaY * 0.005

  // limit range
  if (v >= 1 && v <= 10) {
    camera.position.z = v
  }
}
// end follow cam.

const keyMap: { [key: string]: boolean } = {}

const onDocumentKey = (e: KeyboardEvent) => {
  keyMap[e.code] = e.type === 'keydown'
}

document.addEventListener('click', () => {
  renderer.domElement.requestPointerLock()
})
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === renderer.domElement) {
    document.addEventListener('keydown', onDocumentKey)
    document.addEventListener('keyup', onDocumentKey)

    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove)
    renderer.domElement.addEventListener('wheel', onDocumentMouseWheel)
  } else {
    document.removeEventListener('keydown', onDocumentKey)
    document.removeEventListener('keyup', onDocumentKey)

    renderer.domElement.removeEventListener('mousemove', onDocumentMouseMove)
    renderer.domElement.removeEventListener('wheel', onDocumentMouseWheel)
  }
})

const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(200, 1, 200), new THREE.MeshPhongMaterial())
floorMesh.receiveShadow = true
floorMesh.position.y = -1
scene.add(floorMesh)
const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0))
const floorShape = RAPIER.ColliderDesc.cuboid(100, 0.5, 100) //.setCollisionGroups(65542)
world.createCollider(floorShape, floorBody)

const car = new Car(keyMap, pivot)
await car.init(scene, world, [0, 1, 0])

// const boxes: Box[] = []
// for (let x = 0; x < 8; x += 1) {
//   for (let y = 0; y < 8; y += 1) {
//     boxes.push(new Box(scene, world, [(x - 4) * 1.2, y + 1, -20]))
//   }
// }

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
gui.add(rapierDebugRenderer, 'enabled').name('Rapier Degug Renderer')

const physicsFolder = gui.addFolder('Physics')
physicsFolder.add(world.gravity, 'x', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'y', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'z', -10.0, 10.0, 0.1)

const clock = new THREE.Clock()
let delta

function animate() {
  requestAnimationFrame(animate)

  delta = clock.getDelta()
  world.timestep = Math.min(delta, 0.1)
  world.step()

  car.update(delta)

  //boxes.forEach((b) => b.update())

  rapierDebugRenderer.update()

  renderer.render(scene, camera)

  stats.update()
}

animate()