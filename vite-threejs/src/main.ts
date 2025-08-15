import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import Stats from 'three/addons/libs/stats.module.js'

class CharacterController {
  keyMap: { [key: string]: boolean } = {}
  wait = false
  animationActions: { [key: string]: THREE.AnimationAction }
  activeAction = ''
  speed = 0

  constructor(animationActions: { [key: string]: THREE.AnimationAction }) {
    this.animationActions = animationActions
    document.addEventListener('keydown', this.onDocumentKey)
    document.addEventListener('keyup', this.onDocumentKey)
  }

  onDocumentKey = (e: KeyboardEvent) => {
    this.keyMap[e.code] = e.type === 'keydown'
  }

  dispose() {
    document.removeEventListener('keydown', this.onDocumentKey)
    document.removeEventListener('keyup', this.onDocumentKey)
  }

  setAction(action: string) {
    if (this.activeAction != action) {
      this.animationActions[this.activeAction].fadeOut(0.25)
      this.animationActions[action].reset().fadeIn(0.25).play()
      this.activeAction = action

      switch (action) {
        case 'walk':
          this.speed = 1
          break
        case 'run':
        case 'jump':
          this.speed = 4
          break
        case 'pose':
        case 'idle':
          this.speed = 0
          break
      }
    }
  }

  update() {
    if (!this.wait) {
      let actionAssigned = false

      if (this.keyMap['Space']) {
        this.setAction('jump')
        actionAssigned = true
        this.wait = true // blocks further actions until jump is finished
        setTimeout(() => (this.wait = false), 1000)
      }

      if (!actionAssigned && this.keyMap['KeyW'] && this.keyMap['ShiftLeft']) {
        this.setAction('run')
        actionAssigned = true
      }

      if (!actionAssigned && this.keyMap['KeyW']) {
        this.setAction('walk')
        actionAssigned = true
      }

      if (!actionAssigned && this.keyMap['KeyQ']) {
        this.setAction('pose')
        actionAssigned = true
      }

      !actionAssigned && this.setAction('idle')
    }
  }
}

class Grid {
  gridHelper = new THREE.GridHelper(100, 100)
  speed = 0

  constructor(scene: THREE.Scene) {
    scene.add(this.gridHelper)
  }

  lerp(from: number, to: number, speed: number) {
    const amount = (1 - speed) * from + speed * to
    return Math.abs(from - to) < 0.001 ? to : amount
  }

  update(delta: number, toSpeed: number) {
    this.speed = this.lerp(this.speed, toSpeed, delta * 10)
    this.gridHelper.position.z -= this.speed * delta
    this.gridHelper.position.z = this.gridHelper.position.z % 10
  }
}

const scene = new THREE.Scene()

new RGBELoader().load('img/venice_sunset_1k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
  scene.background = texture
  scene.backgroundBlurriness = 1
})

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0.1, 1.2, 1.8)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0.75, 0)

const stats = new Stats()
document.body.appendChild(stats.dom)

let mixer: THREE.AnimationMixer
let animationActions: { [key: string]: THREE.AnimationAction } = {}

const characterController = new CharacterController(animationActions)
const grid = new Grid(scene)

const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/') // loading from a CDN
dracoLoader.setDecoderPath('jsm/libs/draco/') // loading from own webserver

const glTFLoader = new GLTFLoader()
glTFLoader.setDRACOLoader(dracoLoader)

// glTFLoader.load('models/crypto$@walk_compressed.glb', (gltf) => {
//   mixer = new THREE.AnimationMixer(gltf.scene)

//   mixer.clipAction(gltf.animations[0]).play()

//   scene.add(gltf.scene)
// })

async function loadCrypto() {
  const [crypto, idle, run, jump, pose] = await Promise.all([
    glTFLoader.loadAsync('models/crypto$@walk_compressed.glb'),
    glTFLoader.loadAsync('models/crypto@idle.glb'),
    glTFLoader.loadAsync('models/crypto@run.glb'),
    glTFLoader.loadAsync('models/crypto@jump2.glb'),
    glTFLoader.loadAsync('models/crypto@pose.glb')
  ])

  mixer = new THREE.AnimationMixer(crypto.scene)

  animationActions['idle'] = mixer.clipAction(idle.animations[0])
  animationActions['walk'] = mixer.clipAction(crypto.animations[0])
  animationActions['run'] = mixer.clipAction(run.animations[0])
  animationActions['jump'] = mixer.clipAction(jump.animations[0])
  animationActions['pose'] = mixer.clipAction(pose.animations[0])

  animationActions['idle'].play()
  characterController.activeAction = 'idle'

  scene.add(crypto.scene)
}
await loadCrypto()

const clock = new THREE.Clock()
let delta = 0

function animate() {
  requestAnimationFrame(animate)

  delta = clock.getDelta()

  controls.update()

  characterController.update()

  mixer && mixer.update(delta)

  grid.update(delta, characterController.speed)

  renderer.render(scene, camera)

  stats.update()
}

animate()
