import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import RAPIER from '@dimforge/rapier3d-compat'

class RapierDebugRenderer {
  mesh
  world
  enabled = true

  constructor(scene: THREE.Scene, world: RAPIER.World) {
    this.world = world
    this.mesh = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true }))
    this.mesh.frustumCulled = false
    scene.add(this.mesh)
  }

  update() {
    if (this.enabled) {
      const { vertices, colors } = this.world.debugRender()
      this.mesh.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      this.mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4))
      this.mesh.visible = true
    } else {
      this.mesh.visible = false
    }
  }
}

class Car {
  dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = []

  constructor() {
    // now calling `loadCar` outside of constructor, since async await won't wait if called in a constructor.
  }

  async loadCar(scene: THREE.Scene, position: [number, number, number]) {
    await new GLTFLoader().loadAsync('models/sedanSports.glb').then((gltf) => {
      const carMesh = gltf.scene.getObjectByName('body') as THREE.Group
      carMesh.position.set(0, 0, 0)
      carMesh.traverse((o) => {
        o.castShadow = true
      })

      // carMesh.rotation.set(Math.PI, 0, 0) // Rota 180° en el eje X para que el carrito no caiga bocaabajo

      const wheelBLMesh = gltf.scene.getObjectByName('wheel_backLeft') as THREE.Group
      const wheelBRMesh = gltf.scene.getObjectByName('wheel_backRight') as THREE.Group
      const wheelFLMesh = gltf.scene.getObjectByName('wheel_frontLeft') as THREE.Group
      const wheelFRMesh = gltf.scene.getObjectByName('wheel_frontRight') as THREE.Group
      wheelBLMesh.position.set(0, 0, 0)
      wheelBRMesh.position.set(0, 0, 0)
      wheelFLMesh.position.set(0, 0, 0)
      wheelFRMesh.position.set(0, 0, 0)

      //scene.add(gltf.scene)
      scene.add(carMesh, wheelBLMesh, wheelBRMesh, wheelFLMesh, wheelFRMesh)

      const carBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(...position)
          .setCanSleep(false)
      )
      const wheelBLBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(-1 + position[0], 1 + position[1], 1 + position[2])
          .setCanSleep(false)
      )
      const wheelBRBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(1 + position[0], 1 + position[1], 1 + position[2])
          .setCanSleep(false)
      )
      const wheelFLBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(-1 + position[0], 1 + position[1], -1 + position[2])
          .setCanSleep(false)
      )
      const wheelFRBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(1 + position[0], 1 + position[1], -1 + position[2])
          .setCanSleep(false)
      )

      // create a convexhull from all meshes in the carMesh group
      const v = new THREE.Vector3()
      let positions: number[] = []
      carMesh.updateMatrixWorld(true) // ensure world matrix is up to date
      carMesh.traverse((o) => {
        if (o.type === 'Mesh') {
          const positionAttribute = (o as THREE.Mesh).geometry.getAttribute('position')
          for (let i = 0, l = positionAttribute.count; i < l; i++) {
            v.fromBufferAttribute(positionAttribute, i)
            v.applyMatrix4((o.parent as THREE.Object3D).matrixWorld)
            positions.push(...v)
          }
        }
      })

      // create shapes for carBody and wheelBodies
      const carShape = (RAPIER.ColliderDesc.convexHull(new Float32Array(positions)) as RAPIER.ColliderDesc).setMass(1).setRestitution(0.5)
      const wheelBLShape = RAPIER.ColliderDesc.cylinder(0.1, 0.3)
        .setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2))
        .setTranslation(-0.2, 0, 0)
        .setRestitution(0.5)
      const wheelBRShape = RAPIER.ColliderDesc.cylinder(0.1, 0.3)
        .setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2))
        .setTranslation(0.2, 0, 0)
        .setRestitution(0.5)
      const wheelFLShape = RAPIER.ColliderDesc.cylinder(0.1, 0.3)
        .setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2))
        .setTranslation(-0.2, 0, 0)
        .setRestitution(0.5)
      const wheelFRShape = RAPIER.ColliderDesc.cylinder(0.1, 0.3)
        .setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2))
        .setTranslation(0.2, 0, 0)
        .setRestitution(0.5)

      // create world collider
      world.createCollider(carShape, carBody)
      world.createCollider(wheelBLShape, wheelBLBody)
      world.createCollider(wheelBRShape, wheelBRBody)
      world.createCollider(wheelFLShape, wheelFLBody)
      world.createCollider(wheelFRShape, wheelFRBody)

      // attach wheels to car using Rapier revolute joints
      world.createImpulseJoint(
        RAPIER.JointData.revolute(new RAPIER.Vector3(-0.55, 0, 0.63), new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(-1, 0, 0)),
        carBody,
        wheelBLBody,
        true
      )
      world.createImpulseJoint(
        RAPIER.JointData.revolute(new RAPIER.Vector3(0.55, 0, 0.63), new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(1, 0, 0)),
        carBody,
        wheelBRBody,
        true
      )
      world.createImpulseJoint(
        RAPIER.JointData.revolute(new RAPIER.Vector3(-0.55, 0, -0.63), new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(-1, 0, 0)),
        carBody,
        wheelFLBody,
        true
      )
      world.createImpulseJoint(
        RAPIER.JointData.revolute(new RAPIER.Vector3(0.55, 0, -0.63), new RAPIER.Vector3(0, 0, 0), new RAPIER.Vector3(1, 0, 0)),
        carBody,
        wheelFRBody,
        true
      )

      // update local dynamicBodies so mesh positions and quaternions are updated with the physics world info
      this.dynamicBodies.push([carMesh, carBody])
      this.dynamicBodies.push([wheelBLMesh, wheelBLBody])
      this.dynamicBodies.push([wheelBRMesh, wheelBRBody])
      this.dynamicBodies.push([wheelFLMesh, wheelFLBody])
      this.dynamicBodies.push([wheelFRMesh, wheelFRBody])
    })
  }

  update() {
    for (let i = 0, n = this.dynamicBodies.length; i < n; i++) {
      this.dynamicBodies[i][0].position.copy(this.dynamicBodies[i][1].translation())
      this.dynamicBodies[i][0].quaternion.copy(this.dynamicBodies[i][1].rotation())
    }
  }
}

await RAPIER.init() // This line is only needed if using the compat version
const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0)
const world = new RAPIER.World(gravity)
const dynamicBodies: [THREE.Object3D, RAPIER.RigidBody][] = []

const scene = new THREE.Scene()

const rapierDebugRenderer = new RapierDebugRenderer(scene, world)

const light1 = new THREE.SpotLight(undefined, Math.PI * 10)
light1.position.set(2.5, 5, 5)
light1.angle = Math.PI / 1.8
light1.penumbra = 0.5
light1.castShadow = true
light1.shadow.blurSamples = 10
light1.shadow.radius = 5
scene.add(light1)

const light2 = light1.clone()
light2.position.set(-2.5, 5, 5)
scene.add(light2)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 2, 5)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.y = 1

// Cuboid Collider
const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial())
cubeMesh.castShadow = true
scene.add(cubeMesh)
const cubeBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(-5, 5, 0).setCanSleep(false))
const cubeShape = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setMass(1).setRestitution(0.5)
world.createCollider(cubeShape, cubeBody)
dynamicBodies.push([cubeMesh, cubeBody])

// Ball Collider
const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshNormalMaterial())
sphereMesh.castShadow = true
scene.add(sphereMesh)
const sphereBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(-2.5, 5, 0).setCanSleep(false))
const sphereShape = RAPIER.ColliderDesc.ball(1).setMass(1).setRestitution(0.5)
world.createCollider(sphereShape, sphereBody)
dynamicBodies.push([sphereMesh, sphereBody])

// Cylinder Collider
const cylinderMesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2, 16), new THREE.MeshNormalMaterial())
cylinderMesh.castShadow = true
scene.add(cylinderMesh)
const cylinderBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 5, -2).setCanSleep(false))
const cylinderShape = RAPIER.ColliderDesc.cylinder(1, 1).setMass(1).setRestitution(0.5)
world.createCollider(cylinderShape, cylinderBody)
dynamicBodies.push([cylinderMesh, cylinderBody])

// ConvexHull Collider
const icosahedronMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshNormalMaterial())
icosahedronMesh.castShadow = true
scene.add(icosahedronMesh)
const icosahedronBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(2.5, 5, 0).setCanSleep(false))
const points = new Float32Array(icosahedronMesh.geometry.attributes.position.array)
const icosahedronShape = (RAPIER.ColliderDesc.convexHull(points) as RAPIER.ColliderDesc).setMass(1).setRestitution(0.5)
world.createCollider(icosahedronShape, icosahedronBody)
dynamicBodies.push([icosahedronMesh, icosahedronBody])

// Trimesh Collider
const torusKnotMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(), new THREE.MeshNormalMaterial())
torusKnotMesh.castShadow = true
scene.add(torusKnotMesh)
const torusKnotBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(5, 5, 0))
const vertices = new Float32Array(torusKnotMesh.geometry.attributes.position.array)
let indices = new Uint32Array((torusKnotMesh.geometry.index as THREE.BufferAttribute).array)
const torusKnotShape = (RAPIER.ColliderDesc.trimesh(vertices, indices) as RAPIER.ColliderDesc).setMass(1).setRestitution(0.5)
world.createCollider(torusKnotShape, torusKnotBody)
dynamicBodies.push([torusKnotMesh, torusKnotBody])

// the floor (using a cuboid)
const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(50, 1, 50), new THREE.MeshPhongMaterial())
floorMesh.receiveShadow = true
floorMesh.position.y = -1
scene.add(floorMesh)
const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0))
const floorShape = RAPIER.ColliderDesc.cuboid(25, 0.5, 25)
world.createCollider(floorShape, floorBody)

// creating a shape from a loaded geometry. (Using OBJLoader)
new OBJLoader().loadAsync('models/suzanne.obj').then((object) => {
  //console.log(object)
  scene.add(object)
  const suzanneMesh = object.getObjectByName('Suzanne') as THREE.Mesh
  suzanneMesh.material = new THREE.MeshNormalMaterial()
  suzanneMesh.castShadow = true

  const suzanneBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(-3, 10, -2).setCanSleep(false))
  const points = new Float32Array(suzanneMesh.geometry.attributes.position.array)
  const suzanneShape = (RAPIER.ColliderDesc.convexHull(points) as RAPIER.ColliderDesc).setMass(1).setRestitution(0.5)
  world.createCollider(suzanneShape, suzanneBody)
  dynamicBodies.push([suzanneMesh, suzanneBody])
})

const car = new Car()
await car.loadCar(scene, [0, 2, 0]) // now calling `loadCar` outside of constructor, since async await won't wait if called in a constructor

 const car2 = new Car()
 await car2.loadCar(scene, [-3, 2, 0])

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

renderer.domElement.addEventListener('click', (e) => {
  mouse.set((e.clientX / renderer.domElement.clientWidth) * 2 - 1, -(e.clientY / renderer.domElement.clientHeight) * 2 + 1)

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(
    dynamicBodies.flatMap((a) => a[0]),
    false
  )

  if (intersects.length) {
    dynamicBodies.forEach((b) => {
      b[0] === intersects[0].object && b[1].applyImpulse(new RAPIER.Vector3(0, 10, 0), true)
    })
  }
})

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

  for (let i = 0, n = dynamicBodies.length; i < n; i++) {
    dynamicBodies[i][0].position.copy(dynamicBodies[i][1].translation())
    dynamicBodies[i][0].quaternion.copy(dynamicBodies[i][1].rotation())
  }

  car.update()
  car2.update()

  rapierDebugRenderer.update()

  controls.update()

  renderer.render(scene, camera)

  stats.update()
}

animate()
