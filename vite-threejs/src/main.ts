import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'dat.gui'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(4, 4, 4)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(8, 0, 0)
controls.update()

const light = new THREE.PointLight(0xffffff, 400)
light.position.set(10, 10, 10)
scene.add(light)

const object1 = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshPhongMaterial({ color: 0xff0000 }))
object1.position.set(4, 0, 0)
scene.add(object1)
object1.add(new THREE.AxesHelper(5))

const object2 = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshPhongMaterial({ color: 0x00ff00 }))
object2.position.set(4, 0, 0)
object1.add(object2)
object2.add(new THREE.AxesHelper(5))

const object3 = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshPhongMaterial({ color: 0x0000ff }))
object3.position.set(4, 0, 0)
object2.add(object3)
object3.add(new THREE.AxesHelper(5))

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

const gui = new GUI()
const object1Folder = gui.addFolder('Object1 (Red Ball)')
object1Folder.add(object1.position, 'x', 0, 10, 0.01).name('X Position')
object1Folder.add(object1.rotation, 'x', 0, Math.PI * 2, 0.01).name('X Rotation')
object1Folder.add(object1.scale, 'x', 0, 2, 0.01).name('X Scale')
object1Folder.add(object1, 'visible', 0, 2, 0.01).name('Visible')
object1Folder.open()
const object2Folder = gui.addFolder('Object2 (Green Ball)')
object2Folder.add(object2.position, 'x', 0, 10, 0.01).name('X Position')
object2Folder.add(object2.rotation, 'x', 0, Math.PI * 2, 0.01).name('X Rotation')
object2Folder.add(object2.scale, 'x', 0, 2, 0.01).name('X Scale')
object2Folder.add(object2, 'visible', 0, 2, 0.01).name('Visible')
object2Folder.open()
const object3Folder = gui.addFolder('Object3 (Blue Ball)')
object3Folder.add(object3.position, 'x', 0, 10, 0.01).name('X Position')
object3Folder.add(object3.rotation, 'x', 0, Math.PI * 2, 0.01).name('X Rotation')
object3Folder.add(object3.scale, 'x', 0, 2, 0.01).name('X Scale')
object3Folder.add(object3, 'visible', 0, 2, 0.01).name('Visible')
object3Folder.open()

const stats = new Stats()
document.body.appendChild(stats.dom)

const debug = document.getElementById('debug') as HTMLDivElement

function animate() {
    requestAnimationFrame(animate)

    renderer.render(scene, camera)

    const object1WorldPosition = new THREE.Vector3()
    object1.getWorldPosition(object1WorldPosition)
    const object2WorldPosition = new THREE.Vector3()
    object2.getWorldPosition(object2WorldPosition)
    const object3WorldPosition = new THREE.Vector3()
    object3.getWorldPosition(object3WorldPosition)

    debug.innerText =
        'Red\n' +
        'Local Pos X : ' +
        object1.position.x.toFixed(2) +
        '\n' +
        'World Pos X : ' +
        object1WorldPosition.x.toFixed(2) +
        '\n' +
        '\nGreen\n' +
        'Local Pos X : ' +
        object2.position.x.toFixed(2) +
        '\n' +
        'World Pos X : ' +
        object2WorldPosition.x.toFixed(2) +
        '\n' +
        '\nBlue\n' +
        'Local Pos X : ' +
        object3.position.x.toFixed(2) +
        '\n' +
        'World Pos X : ' +
        object3WorldPosition.x.toFixed(2) +
        '\n'

    stats.update()
}

animate()

/*


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