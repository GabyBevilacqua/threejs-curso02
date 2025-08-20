//import { ActiveEvents, ColliderDesc, RigidBody, RigidBodyDesc, World } from '@dimforge/rapier3d-compat'
import { Euler, Matrix4, Object3D, PerspectiveCamera, Quaternion, Scene, Vector3, WebGLRenderer } from 'three'
import AnimationController from './AnimationController'
import FollowCam from './FollowCam'
import Keyboard from './Keyboard'

export default class Player {
  scene: Scene
  //world: World
  //body: RigidBody
  animationController?: AnimationController
  vector = new Vector3()
  inputVelocity = new Vector3()
  euler = new Euler()
  quaternion = new Quaternion()
  followTarget = new Object3D() //new Mesh(new SphereGeometry(0.1), new MeshNormalMaterial())
  grounded = true
  rotationMatrix = new Matrix4()
  targetQuaternion = new Quaternion()
  followCam: FollowCam
  keyboard: Keyboard
  wait = false

  constructor(
    scene: Scene,
    camera: PerspectiveCamera,
    renderer: WebGLRenderer
    //world: World,
    //position: [number, number, number] = [0, 0, 0]
  ) {
    this.scene = scene
    //this.world = world
    this.keyboard = new Keyboard(renderer)
    this.followCam = new FollowCam(this.scene, camera, renderer)

    scene.add(this.followTarget) // the followCam will lerp towards this object3Ds world position.

    // this.body = world.createRigidBody(
    //   RigidBodyDesc.dynamic()
    //     .setTranslation(...position)
    //     .enabledRotations(false, false, false)
    //     .setLinearDamping(4)
    //     .setCanSleep(false)
    // )

    // const shape = ColliderDesc.capsule(0.5, 0.15)
    //   .setTranslation(0, 0.645, 0)
    //   .setMass(1)
    //   .setFriction(0)
    //   .setActiveEvents(ActiveEvents.COLLISION_EVENTS)

    // world.createCollider(shape, this.body)
  }

  async init() {
    this.animationController = new AnimationController(this.scene, this.keyboard)
    await this.animationController.init()
  }

  // setGrounded() {
  //   this.body.setLinearDamping(4)
  //   this.grounded = true
  //   setTimeout(() => (this.wait = false), 250)
  // }

  update(delta: number) {
    // this.inputVelocity.set(0, 0, 0)
    // if (this.grounded) {
    //   if (this.keyboard.keyMap['KeyW']) {
    //     this.inputVelocity.z = -1
    //   }
    //   if (this.keyboard.keyMap['KeyS']) {
    //     this.inputVelocity.z = 1
    //   }
    //   if (this.keyboard.keyMap['KeyA']) {
    //     this.inputVelocity.x = -1
    //   }
    //   if (this.keyboard.keyMap['KeyD']) {
    //     this.inputVelocity.x = 1
    //   }

    //   this.inputVelocity.setLength(delta * (this.animationController?.speed || 1)) // limit horizontal movement based on walking or running speed

    //   if (!this.wait && this.keyboard.keyMap['Space']) {
    //     this.wait = true
    //     this.body.setLinearDamping(0)
    //     if (this.keyboard.keyMap['ShiftLeft']) {
    //       this.inputVelocity.multiplyScalar(15) // if running, add more boost
    //     } else {
    //       this.inputVelocity.multiplyScalar(10)
    //     }
    //     this.inputVelocity.y = 5 // give jumping some height
    //     this.grounded = false
    //   }
    // }

    // // apply the followCam yaw to inputVelocity so the capsule moves forward based on cameras forward direction
    // this.euler.y = this.followCam.yaw.rotation.y
    // this.quaternion.setFromEuler(this.euler)
    // this.inputVelocity.applyQuaternion(this.quaternion)

    // // now move the capsule body based on inputVelocity
    // this.body.applyImpulse(this.inputVelocity, true)

    // // The followCam will lerp towards the followTarget position.
    // this.followTarget.position.copy(this.body.translation()) // Copy the capsules position to followTarget
    // this.followTarget.getWorldPosition(this.vector) // Put followTargets new world position into a vector
    // this.followCam.pivot.position.lerp(this.vector, delta * 10) // lerp the followCam pivot towards the vector

    // // Eve model also lerps towards the capsules position, but independently of the followCam
    // this.animationController?.model?.position.lerp(this.vector, delta * 20)

    // // Also turn Eve to face the direction of travel.
    // // First, construct a rotation matrix based on the direction from the followTarget to Eve
    // this.rotationMatrix.lookAt(
    //   this.followTarget.position,
    //   this.animationController?.model?.position as Vector3,
    //   this.animationController?.model?.up as Vector3
    // )
    // this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix) // creating a quaternion to rotate Eve, since eulers can suffer from gimbal lock

    // // Next, get the distance from the Eve model to the followTarget
    //const distance = this.animationController?.model?.position.distanceTo(this.followTarget.position)

    // // If distance is higher than some espilon, and Eves quaternion isn't the same as the targetQuaternion, then rotate towards the targetQuaternion.
    // if ((distance as number) > 0.0001 && !this.animationController?.model?.quaternion.equals(this.targetQuaternion)) {
    //   this.targetQuaternion.z = 0 // so that it rotates around the Y axis
    //   this.targetQuaternion.x = 0 // so that it rotates around the Y axis
    //   this.targetQuaternion.normalize() // always normalise quaternions before use.
    //   this.animationController?.model?.quaternion.rotateTowards(this.targetQuaternion, delta * 20)
    // }

    // update which animationAction Eve should be playing
    this.animationController?.update(delta)
  }
}