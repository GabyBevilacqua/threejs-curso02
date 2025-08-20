import { BoxGeometry, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer, Vector3 } from 'three'
import UI from './UI'
import Player from './Player'
import Environment from './Environment'
//import RAPIER, { World, EventQueue, RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat'
//import RapierDebugRenderer from './RapierDebugRenderer'
//import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

export default class Game {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  player?: Player
  //world?: World
  //rapierDebugRenderer?: RapierDebugRenderer
  //eventQueue?: EventQueue

  constructor(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
  }

  async init() {
    // await RAPIER.init() // This line is only needed if using the compat version
    // const gravity = new Vector3(0.0, -9.81, 0.0)

    // this.world = new World(gravity)
    // this.eventQueue = new EventQueue(true)

    // this.rapierDebugRenderer = new RapierDebugRenderer(this.scene, this.world)
    // const gui = new GUI()
    // gui.add(this.rapierDebugRenderer, 'enabled').name('Rapier Degug Renderer')

    // // the floor (using a cuboid)
    // const floorMesh = new Mesh(new BoxGeometry(50, 1, 50), new MeshStandardMaterial())
    // floorMesh.receiveShadow = true
    // floorMesh.position.y = -0.5
    // this.scene.add(floorMesh)
    //const floorBody = this.world.createRigidBody(RigidBodyDesc.fixed().setTranslation(0, -0.5, 0))
    //const floorShape = ColliderDesc.cuboid(25, 0.5, 25)
    //this.world.createCollider(floorShape, floorBody)

    this.player = new Player(this.scene, this.camera, this.renderer) //, this.world, [0, 0.1, 0])
    await this.player.init()

    const environment = new Environment(this.scene)
    await environment.init()
    // environment.light.target = this.player.followTarget

    const ui = new UI(this.renderer)
    ui.show()
  }

  update(delta: number) {
    // ;(this.world as World).timestep = Math.min(delta, 0.1)
    // this.world?.step() // this.eventQueue)
    // this.eventQueue?.drainCollisionEvents((_, __, started) => {
    //   if (started) {
    //     this.player?.setGrounded()
    //   }
    // })
    this.player?.update(delta)
    // this.rapierDebugRenderer?.update()
  }
}