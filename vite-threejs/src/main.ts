import { GUI } from 'dat.gui'
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 1.5


const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

new OrbitControls(camera, renderer.domElement)
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshNormalMaterial({ wireframe: true })

const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
const cubeFolder = gui.addFolder('Cube')
cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2).name('Rotate X')
cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2).name('Rotate Y')
cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2).name('Rotate Z')

const scaleFolder = gui.addFolder('Scale')
scaleFolder.add(cube.scale, 'x', 0, 2).name('Scale X')
scaleFolder.add(cube.scale, 'y', 0, 2).name('Scale Y')
scaleFolder.add(cube.scale, 'z', 0, 2).name('Scale Z')

const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 5).name('Camera Z')

function animate() {
  requestAnimationFrame(animate)

  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
  
  renderer.render(scene, camera)

  stats.update()
}

animate()

