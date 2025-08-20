import './style.css'
import { Scene, PerspectiveCamera, WebGLRenderer, Clock } from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import Game from './Game'

const scene = new Scene()

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 0, 2)

const renderer = new WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const stats = new Stats()
document.body.appendChild(stats.dom)

const game = new Game(scene, camera, renderer)
await game.init()

const clock = new Clock()
let delta = 0

function animate() {
  requestAnimationFrame(animate)

  delta = clock.getDelta()

  game.update(delta)

  renderer.render(scene, camera)

  stats.update()
}

animate()