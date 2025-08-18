import { Group, Mesh, Object3D, Quaternion, Scene, SpotLight, TextureLoader, Vector3 } from 'three'
import { RigidBody, ImpulseJoint, World, RigidBodyDesc, ColliderDesc, JointData, MotorModel, PrismaticImpulseJoint } from '@dimforge/rapier3d-compat'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'

// collision groups
// floorShape = 0
// carShape = 1
// wheelShape = 2
// axelShape = 3

export default class Car {
  dynamicBodies: [Object3D, RigidBody][] = []
  followTarget = new Object3D()
  lightLeftTarget = new Object3D()
  lightRightTarget = new Object3D()
  carBody?: RigidBody
  wheelBLMotor?: ImpulseJoint
  wheelBRMotor?: ImpulseJoint
  wheelFLAxel?: ImpulseJoint
  wheelFRAxel?: ImpulseJoint
  v = new Vector3()
  keyMap: { [key: string]: boolean }
  pivot: Object3D

  constructor(keyMap: { [key: string]: boolean }, pivot: Object3D) {
    this.followTarget.position.set(0, 1, 0)
    this.lightLeftTarget.position.set(-0.35, 1, -10)
    this.lightRightTarget.position.set(0.35, 1, -10)
    this.keyMap = keyMap
    this.pivot = pivot
  }

  async init(scene: Scene, world: World, position: [number, number, number]) {
    await new GLTFLoader().loadAsync('models/sedanSports.glb').then((gltf) => {
      const carMesh = gltf.scene.getObjectByName('body') as Group
      carMesh.position.set(0, 0, 0)
      carMesh.traverse((o) => {
        o.castShadow = true
      })

      carMesh.add(this.followTarget)

      const textureLoader = new TextureLoader()
      const textureFlare0 = textureLoader.load('img/lensflare0.png')
      const textureFlare3 = textureLoader.load('img/lensflare3.png')

      const lensflareLeft = new Lensflare()
      lensflareLeft.addElement(new LensflareElement(textureFlare0, 1000, 0))
      lensflareLeft.addElement(new LensflareElement(textureFlare3, 500, 0.2))
      lensflareLeft.addElement(new LensflareElement(textureFlare3, 250, 0.8))
      lensflareLeft.addElement(new LensflareElement(textureFlare3, 125, 0.6))
      lensflareLeft.addElement(new LensflareElement(textureFlare3, 62.5, 0.4))

      const lensflareRight = new Lensflare()
      lensflareRight.addElement(new LensflareElement(textureFlare0, 1000, 0))
      lensflareRight.addElement(new LensflareElement(textureFlare3, 500, 0.2))
      lensflareRight.addElement(new LensflareElement(textureFlare3, 250, 0.8))
      lensflareRight.addElement(new LensflareElement(textureFlare3, 125, 0.6))
      lensflareRight.addElement(new LensflareElement(textureFlare3, 62.5, 0.4))

      const headLightLeft = new SpotLight(undefined, Math.PI * 20)
      headLightLeft.position.set(-0.4, 0.5, -1.01)
      headLightLeft.angle = Math.PI / 4
      headLightLeft.penumbra = 0.5
      headLightLeft.castShadow = true
      headLightLeft.shadow.blurSamples = 10
      headLightLeft.shadow.radius = 5

      const headLightRight = headLightLeft.clone()
      headLightRight.position.set(0.4, 0.5, -1.01)

      carMesh.add(headLightLeft)
      headLightLeft.target = this.lightLeftTarget
      headLightLeft.add(lensflareLeft)
      carMesh.add(this.lightLeftTarget)

      carMesh.add(headLightRight)
      headLightRight.target = this.lightRightTarget
      headLightRight.add(lensflareRight)
      carMesh.add(this.lightRightTarget)

      const wheelBLMesh = gltf.scene.getObjectByName('wheel_backLeft') as Group
      const wheelBRMesh = gltf.scene.getObjectByName('wheel_backRight') as Group
      const wheelFLMesh = gltf.scene.getObjectByName('wheel_frontLeft') as Group
      const wheelFRMesh = gltf.scene.getObjectByName('wheel_frontRight') as Group

      scene.add(carMesh, wheelBLMesh, wheelBRMesh, wheelFLMesh, wheelFRMesh)

      // create bodies for car, wheels and axels
      this.carBody = world.createRigidBody(
        RigidBodyDesc.dynamic()
          .setTranslation(...position)
          .setCanSleep(false)
      )

      const wheelBLBody = world.createRigidBody(
        RigidBodyDesc.dynamic()
          .setTranslation(position[0] - 0.55, position[1], position[2] + 0.63)
          .setCanSleep(false)
      )
      const wheelBRBody = world.createRigidBody(
        RigidBodyDesc.dynamic()
          .setTranslation(position[0] + 0.55, position[1], position[2] + 0.63)
          .setCanSleep(false)
      )

      const wheelFLBody = world.createRigidBody(
        RigidBodyDesc.dynamic()
          .setTranslation(position[0] - 0.55, position[1], position[2] - 0.63)
          .setCanSleep(false)
      )
      const wheelFRBody = world.createRigidBody(
        RigidBodyDesc.dynamic()
          .setTranslation(position[0] + 0.55, position[1], position[2] - 0.63)
          .setCanSleep(false)
      )

      //   const axelFLBody = world.createRigidBody(
      //     RigidBodyDesc.dynamic()
      //       .setTranslation(position[0] - 0.55, position[1], position[2] - 0.63)
      //       .setCanSleep(false)
      //   )
      //   const axelFRBody = world.createRigidBody(
      //     RigidBodyDesc.dynamic()
      //       .setTranslation(position[0] + 0.55, position[1], position[2] - 0.63)
      //       .setCanSleep(false)
      //   )

      // create a convexhull from all meshes in the carMesh group
      const v = new Vector3()
      let positions: number[] = []
      carMesh.updateMatrixWorld(true) // ensure world matrix is up to date
      carMesh.traverse((o) => {
        if (o.type === 'Mesh') {
          const positionAttribute = (o as Mesh).geometry.getAttribute('position')
          for (let i = 0, l = positionAttribute.count; i < l; i++) {
            v.fromBufferAttribute(positionAttribute, i)
            v.applyMatrix4((o.parent as Object3D).matrixWorld)
            positions.push(...v)
          }
        }
      })

      // create shapes for carBody, wheelBodies and axelBodies
      const carShape = (ColliderDesc.convexMesh(new Float32Array(positions)) as ColliderDesc).setMass(1).setRestitution(0.5).setFriction(3)
      //.setCollisionGroups(131073)
      const wheelBLShape = ColliderDesc.cylinder(0.1, 0.3)
        .setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2))
        .setTranslation(-0.2, 0, 0)
        .setRestitution(0.5)
        .setFriction(2)
      //.setCollisionGroups(262145)
      const wheelBRShape = ColliderDesc.cylinder(0.1, 0.3)
        .setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))
        .setTranslation(0.2, 0, 0)
        .setRestitution(0.5)
        .setFriction(2)
      //.setCollisionGroups(262145)
      const wheelFLShape = ColliderDesc.cylinder(0.1, 0.3)
        .setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))
        .setTranslation(-0.2, 0, 0)
        .setRestitution(0.5)
        .setFriction(2.5)
      //.setCollisionGroups(262145)
      const wheelFRShape = ColliderDesc.cylinder(0.1, 0.3)
        .setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))
        .setTranslation(0.2, 0, 0)
        .setRestitution(0.5)
        .setFriction(2.5)
      //.setCollisionGroups(262145)
      //   const axelFLShape = ColliderDesc.cuboid(0.1, 0.1, 0.1)
      //     .setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))
      //     .setMass(0.1)
      //  //   .setCollisionGroups(589823)
      //   const axelFRShape = ColliderDesc.cuboid(0.1, 0.1, 0.1)
      //     .setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))
      //     .setMass(0.1)
      //  //   .setCollisionGroups(589823)

      //joins wheels to car body
      world.createImpulseJoint(JointData.revolute(new Vector3(-0.55, 0, 0.63), new Vector3(0, 0, 0), new Vector3(-1, 0, 0)), this.carBody, wheelBLBody, true)
      world.createImpulseJoint(JointData.revolute(new Vector3(0.55, 0, 0.63), new Vector3(0, 0, 0), new Vector3(-1, 0, 0)), this.carBody, wheelBRBody, true)
      world.createImpulseJoint(JointData.revolute(new Vector3(-0.55, 0, -0.63), new Vector3(0, 0, 0), new Vector3(1, 0, 0)), this.carBody, wheelFLBody, true)
      world.createImpulseJoint(JointData.revolute(new Vector3(0.55, 0, -0.63), new Vector3(0, 0, 0), new Vector3(1, 0, 0)), this.carBody, wheelFRBody, true)

      //   // attach back wheel to cars. These will be configurable motors.
      //   this.wheelBLMotor = world.createImpulseJoint(JointData.revolute(new Vector3(-0.55, 0, 0.63), new Vector3(0, 0, 0), new Vector3(-1, 0, 0)), this.carBody, wheelBLBody, true)
      //   this.wheelBRMotor = world.createImpulseJoint(JointData.revolute(new Vector3(0.55, 0, 0.63), new Vector3(0, 0, 0), new Vector3(-1, 0, 0)), this.carBody, wheelBRBody, true)

      //   // attach steering axels to car. These will be configurable motors.
      //   this.wheelFLAxel = world.createImpulseJoint(JointData.revolute(new Vector3(-0.55, 0, -0.63), new Vector3(0, 0, 0), new Vector3(0, 1, 0)), this.carBody, axelFLBody, true)
      //   ;(this.wheelFLAxel as PrismaticImpulseJoint).configureMotorModel(MotorModel.ForceBased)
      //   this.wheelFRAxel = world.createImpulseJoint(JointData.revolute(new Vector3(0.55, 0, -0.63), new Vector3(0, 0, 0), new Vector3(0, 1, 0)), this.carBody, axelFRBody, true)
      //   ;(this.wheelFRAxel as PrismaticImpulseJoint).configureMotorModel(MotorModel.ForceBased)

      //   // // attach front wheel to steering axels
      //   world.createImpulseJoint(JointData.revolute(new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(1, 0, 0)), axelFLBody, wheelFLBody, true)
      //   world.createImpulseJoint(JointData.revolute(new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(1, 0, 0)), axelFRBody, wheelFRBody, true)

      // create world collider
      world.createCollider(carShape, this.carBody)
      world.createCollider(wheelBLShape, wheelBLBody)
      world.createCollider(wheelBRShape, wheelBRBody)
      world.createCollider(wheelFLShape, wheelFLBody)
      world.createCollider(wheelFRShape, wheelFRBody)
      //world.createCollider(axelFLShape, axelFLBody)
      //world.createCollider(axelFRShape, axelFRBody)

      // update local dynamicBodies so mesh positions and quaternions are updated with the physics world info
      this.dynamicBodies.push([carMesh, this.carBody])
      this.dynamicBodies.push([wheelBLMesh, wheelBLBody])
      this.dynamicBodies.push([wheelBRMesh, wheelBRBody])
      this.dynamicBodies.push([wheelFLMesh, wheelFLBody])
      this.dynamicBodies.push([wheelFRMesh, wheelFRBody])
      //this.dynamicBodies.push([new Object3D(), axelFRBody])
      //this.dynamicBodies.push([new Object3D(), axelFLBody])
    })
  }

  update(delta: number) {
    for (let i = 0, n = this.dynamicBodies.length; i < n; i++) {
      this.dynamicBodies[i][0].position.copy(this.dynamicBodies[i][1].translation())
      this.dynamicBodies[i][0].quaternion.copy(this.dynamicBodies[i][1].rotation())
    }

    this.followTarget.getWorldPosition(this.v)
    this.pivot.position.lerp(this.v, delta * 5) // frame rate independent
    //this.pivot.position.copy(this.v)

    // let targetVelocity = 0
    // if (this.keyMap['KeyW']) {
    //   targetVelocity = 500
    // }
    // if (this.keyMap['KeyS']) {
    //   targetVelocity = -200
    // }
    // ;(this.wheelBLMotor as PrismaticImpulseJoint).configureMotorVelocity(targetVelocity, 2.0)
    // ;(this.wheelBRMotor as PrismaticImpulseJoint).configureMotorVelocity(targetVelocity, 2.0)

    // let targetSteer = 0
    // if (this.keyMap['KeyA']) {
    //   targetSteer += 0.6
    // }
    // if (this.keyMap['KeyD']) {
    //   targetSteer -= 0.6
    // }

    // ;(this.wheelFLAxel as PrismaticImpulseJoint).configureMotorPosition(targetSteer, 100, 10)
    // ;(this.wheelFRAxel as PrismaticImpulseJoint).configureMotorPosition(targetSteer, 100, 10)
  }
}