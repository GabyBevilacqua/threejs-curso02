import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'

const scene = new THREE.Scene()

const gridHelper = new THREE.GridHelper()
gridHelper.position.y = -0.5
scene.add(gridHelper)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// const info = document.createElement('div')
// info.style.cssText = 'position:absolute;bottom:10px;left:10px;color:white;font-family:monospace;font-size: 17px;filter: drop-shadow(1px 1px 1px #000000);'
// document.body.appendChild(info)

const controls = new OrbitControls(camera, renderer.domElement)

// camera.lookAt(0.5, 0.5, 0.5)
// controls.target.set(.5, .5, .5)
// controls.update()

// controls.addEventListener('change', () => console.log("Controls Change"))
// controls.addEventListener('start', () => console.log("Controls Start Event"))
// controls.addEventListener('end', () => console.log("Controls End Event"))
// controls.autoRotate = true
//  controls.autoRotateSpeed = 10
// controls.enableDamping = true
//  controls.dampingFactor = .01
// controls.listenToKeyEvents(window)
// controls.keys = {
//     LEFT: 'KeyA', // default 'ArrowLeft'
//     UP: 'KeyW', // default 'ArrowUp'
//     RIGHT: 'KeyD', // default 'ArrowRight'
//     BOTTOM: 'KeyS' // default 'ArrowDown'
// }
// controls.mouseButtons = {
//     LEFT: THREE.MOUSE.ROTATE,
//     MIDDLE: THREE.MOUSE.DOLLY,
//     RIGHT: THREE.MOUSE.PAN
// }
// controls.touches = {
//     ONE: THREE.TOUCH.ROTATE,
//     TWO: THREE.TOUCH.DOLLY_PAN
// }
// controls.screenSpacePanning = true
// controls.minAzimuthAngle = 0
// controls.maxAzimuthAngle = Math.PI / 2
// controls.minPolarAngle = 0
// controls.maxPolarAngle = Math.PI
// controls.maxDistance = 4
// controls.minDistance = 1.5
// controls.enabled = false
// controls.enablePan = false
// controls.enableRotate = false
// controls.enableZoom = false

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshNormalMaterial({ wireframe: true })

const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
  requestAnimationFrame(animate)

   controls.update()

  // info.innerText =
  //   'Polar Angle : ' +
  //   ((controls.getPolarAngle() / -Math.PI) * 180 + 90).toFixed(2) +
  //   '°\nAzimuth Angle : ' +
  //   ((controls.getAzimuthalAngle() / Math.PI) * 180).toFixed(2) +
  //   '°'

  renderer.render(scene, camera)

  stats.update()
}

animate()