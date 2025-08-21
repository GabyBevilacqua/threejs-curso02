import { PerspectiveCamera, Scene, WebGLRenderer, Vector3 } from 'three'
import UI from './UI'
import Player from './Player'
import Environment from './Environment'
import RAPIER, { World, EventQueue } from '@dimforge/rapier3d-compat'
import RapierDebugRenderer from './RapierDebugRenderer'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import Start from './Start'
import Platform from './Platform'
import Finish from './Finish'
import Spinner from './Spinner'
import Pendulum from './Pendulum'

export default class Game {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  ui: UI
  player?: Player
  world?: World
  rapierDebugRenderer?: RapierDebugRenderer
  eventQueue?: EventQueue
  finish?: Finish
  spinners: Spinner[] = []
  pendulums: Pendulum[] = []

  constructor(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.ui = new UI(this.renderer)
  }

  async init() {
    await RAPIER.init() // This line is only needed if using the compat version
    const gravity = new Vector3(0.0, -9.81, 0.0)

    this.world = new World(gravity)
    this.eventQueue = new EventQueue(true)

    this.rapierDebugRenderer = new RapierDebugRenderer(this.scene, this.world)
    this.rapierDebugRenderer.enabled = false
    const gui = new GUI()
    gui.add(this.rapierDebugRenderer, 'enabled').name('Rapier Debug Renderer')

        new Start(this.scene, this.world, [0, -0.5, 0])

    new Platform(this.scene, this.world, [2, 0.1, 3], [0, 0, 6])

    new Platform(this.scene, this.world, [2.5, 0.1, 2], [3, 0.25, 6])

    new Platform(this.scene, this.world, [2, 0.1, 2], [6, 1, 6])

    new Platform(this.scene, this.world, [0.5, 0.1, 4.5], [6, 2, 2.25])

    new Platform(this.scene, this.world, [4, 0.1, 5], [6, 2, -3])

   this.spinners.push(new Spinner(this.scene, this.world, [6, 2.8, -3]))

    new Platform(this.scene, this.world, [2, 0.1, 2], [6.25, 2.5, -7.5])

    new Platform(this.scene, this.world, [4, 0.1, 4], [2.5, 3, -8])

    this.spinners.push(new Spinner(this.scene, this.world, [2.5, 3.8, -8]))

    new Platform(this.scene, this.world, [1, 0.1, 3.95], [1.5, 3.75, -3.25], [-Math.PI / 8, 0, 0])

    new Platform(this.scene, this.world, [6, 0.1, 1.6], [-1, 4.5, -0.5])

    this.pendulums.push(new Pendulum(this.scene, this.world, [0, 8, -1]))

    this.pendulums.push(new Pendulum(this.scene, this.world, [-2, 8, -1]))

    new Platform(this.scene, this.world, [3, 0.1, 10], [-5.5, 4.5, 4.5], [0, 0, -Math.PI / 15])

   this.pendulums.push(new Pendulum(this.scene, this.world, [-5, 8, 2.5], Math.PI / 2))

   this.pendulums.push(new Pendulum(this.scene, this.world, [-5, 8, 5], Math.PI / 2))

    this.finish = new Finish(this.scene, this.world, [0, 4.0, 10])

    // the floor (using a cuboid) curso 1
    // const floorMesh = new Mesh(new BoxGeometry(50, 1, 50), new MeshStandardMaterial())
    // floorMesh.receiveShadow = true
    // floorMesh.position.y = -0.5
    // this.scene.add(floorMesh)
    // const floorBody = this.world.createRigidBody(RigidBodyDesc.fixed().setTranslation(0, -0.5, 0))
    // const floorShape = ColliderDesc.cuboid(25, 0.5, 25)
    // this.world.createCollider(floorShape, floorBody)

    this.player = new Player(this.scene, this.camera, this.renderer, this.world, [0, 0.1, 0], this.ui)
    await this.player.init()

    const environment = new Environment(this.scene)
    await environment.init()
    environment.light.target = this.player.followTarget

    this.ui.show()
    
    //curso 1
    // const ui = new UI(this.renderer)
    // ui.show()
  }

  update(delta: number) {
    this.spinners.forEach((s) => {
      s.update(delta)
    })
    ;(this.world as World).timestep = Math.min(delta, 0.1)
    this.world?.step(this.eventQueue)
    this.eventQueue?.drainCollisionEvents((handle1, handle2, started) => {
      if (started) {
        // if we land on the finish platform
        if ([handle1, handle2].includes(this.finish?.handle as number)) {
          this.ui.showLevelCompleted()
        }
      }

      // exclude spinner collisions from player grounded check
      let hitSpinner = false
      this.spinners.forEach((s) => {
        // each spinner tracks a handle for one body only
        if ([handle1, handle2].includes(s.handle)) {
          hitSpinner = true
        }
      })

      // exclude pendulums collisions from player grounded check
      let hitPendulum = false
      this.pendulums.forEach((p) => {
        // each pendulum tracks the handles of the two lowest ball bodies
        if (p.handles.some((h) => [handle1, handle2].includes(h))) {
          hitPendulum = true
        }
      })

      if (!hitSpinner && !hitPendulum) {
        this.player?.setGrounded(started)
      }
    })
    this.player?.update(delta)
    this.finish?.update(delta)
    this.pendulums.forEach((p) => {
      p.update()
    })
    this.rapierDebugRenderer?.update()
  }
}  


//curso 1
  // update(delta: number) {
  //   ;(this.world as World).timestep = Math.min(delta, 0.1)
  //   this.world?.step(this.eventQueue)
  //   this.eventQueue?.drainCollisionEvents((_, __, started) => {
  //     if (started) {
  //       this.player?.setGrounded()
  //     }
  //   })
  //   this.player?.update(delta)
  //   this.rapierDebugRenderer?.update()
  // }