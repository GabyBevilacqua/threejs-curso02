import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'dat.gui'

const scene = new THREE.Scene()
 // scene.environment = new THREE.CubeTextureLoader().setPath('https://sbcode.net/img/').load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])

const gridHelper = new THREE.GridHelper()
scene.add(gridHelper)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(-1, 4, 2.5)

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

const light = new THREE.DirectionalLight(undefined, Math.PI)
light.position.set(1, 1, 1)
scene.add(light)

const data = { color: 0x00ff00, labelsVisible: true }

const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: 0x00ff00 }))
plane.rotation.x = -Math.PI / 2
plane.visible = false
scene.add(plane)

const geometry = new THREE.IcosahedronGeometry(1, 1)

const meshes = [
  new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: data.color })),
  new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({ flatShading: true })),
  new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: data.color, flatShading: true })),
  new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: data.color, flatShading: true })),
]

meshes[0].position.set(-3, 1, 0)
meshes[1].position.set(-1, 1, 0)
meshes[2].position.set(1, 1, 0)
meshes[3].position.set(3, 1, 0)

scene.add(...meshes)

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()

const meshBasicMaterialFolder = gui.addFolder('MeshBasicMaterial')
meshBasicMaterialFolder.addColor(data, 'color').onChange(() => {
  ;(meshes[0].material as THREE.MeshBasicMaterial).color.set(data.color)
})
meshBasicMaterialFolder.add(meshes[0].material, 'wireframe')
meshBasicMaterialFolder.open()

const meshNormalMaterialFolder = gui.addFolder('MeshNormalMaterial')
meshNormalMaterialFolder.add(meshes[1].material as THREE.MeshNormalMaterial, 'flatShading').onChange(() => {
  meshes[1].material.needsUpdate = true
})
meshNormalMaterialFolder.add(meshes[1].material, 'wireframe')
meshNormalMaterialFolder.open()

const meshPhongMaterialFolder = gui.addFolder('MeshPhongMaterial')
meshPhongMaterialFolder.addColor(data, 'color').onChange(() => {
  ;(meshes[2].material as THREE.MeshPhongMaterial).color.set(data.color)
})
meshPhongMaterialFolder.add(meshes[2].material as THREE.MeshPhongMaterial, 'flatShading').onChange(() => {
  meshes[2].material.needsUpdate = true
})
meshPhongMaterialFolder.add(meshes[2].material, 'wireframe')
meshPhongMaterialFolder.open()

const meshStandardMaterialFolder = gui.addFolder('MeshStandardMaterial')
meshStandardMaterialFolder.addColor(data, 'color').onChange(() => {
  ;(meshes[3].material as THREE.MeshStandardMaterial).color.set(data.color)
})
meshStandardMaterialFolder.add(meshes[3].material as THREE.MeshStandardMaterial, 'flatShading').onChange(() => {
  meshes[3].material.needsUpdate = true
})
meshStandardMaterialFolder.add(meshes[3].material, 'wireframe')
meshStandardMaterialFolder.open()

const lightFolder = gui.addFolder('Light')
lightFolder.add(light, 'visible')
lightFolder.open()

const gridFolder = gui.addFolder('Grid')
gridFolder.add(gridHelper, 'visible')
gridFolder.open()

const labelsFolder = gui.addFolder('Labels')
labelsFolder.add(data, 'labelsVisible')
labelsFolder.open()

const labels = document.querySelectorAll<HTMLDivElement>('.label')

let x, y
const v = new THREE.Vector3()

function animate() {
  requestAnimationFrame(animate)

  controls.update()

  for (let i = 0; i < 4; i++) {
    v.copy(meshes[i].position)
    v.project(camera)

    x = ((1 + v.x) / 2) * innerWidth - 50
    y = ((1 - v.y) / 2) * innerHeight

    labels[i].style.left = x + 'px'
    labels[i].style.top = y + 'px'
    labels[i].style.display = data.labelsVisible ? 'block' : 'none'
  }

  renderer.render(scene, camera)

  stats.update()
}

animate()

/*
controls.enableDamping = true

//const scene = new THREE.Scene()  // al usar una sola escena y se pueden usar los ejemplos
// scene.background = new THREE.Color(0x123456) // Set a background color
// scene.background = new THREE.TextureLoader().load('https://sbcode.net/img/grid.png') // Set a background texture imagen
//scene.background = new THREE.CubeTextureLoader()
//.setPath('https://sbcode.net/img/')
//.load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']) // es una imagen dividida en las capas de un cubo
//scene.backgroundBlurriness = 0.5 // Set the blurriness of the background texture

const sceneA = new THREE.Scene()
sceneA.background = new THREE.Color(0x123456)

const sceneB = new THREE.Scene()
sceneB.background = new THREE.TextureLoader().load('https://sbcode.net/img/grid.png')

const sceneC = new THREE.Scene()
sceneC.background = new THREE.CubeTextureLoader().setPath('https://sbcode.net/img/').load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])
//sceneC.backgroundBlurriness = 0.5

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
sceneA.add(cube)
//scene.add(cube) // este cuando es una unica escena

const stats = new Stats()
document.body.appendChild(stats.dom)

let activeScene = sceneA
const setScene = {
  sceneA: () => {
    activeScene = sceneA
  },
  sceneB: () => {
    activeScene = sceneB
  },
  sceneC: () => {
    activeScene = sceneC
  },
}

const gui = new GUI()

const sceneFolder = gui.addFolder('Scenes')
sceneFolder.add(setScene, 'sceneA').name('Scene A')
sceneFolder.add(setScene, 'sceneB').name('Scene B')
sceneFolder.add(setScene, 'sceneC').name('Scene C')


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





*/ 