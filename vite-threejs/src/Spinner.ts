import { ColliderDesc, RigidBody, RigidBodyDesc, World } from '@dimforge/rapier3d-compat'
import { CylinderGeometry, Euler, Group, Mesh, MeshStandardMaterial, Quaternion, Scene } from 'three'

export default class Spinner {
  group: Group
  body: RigidBody
  handle = -1

  constructor(scene: Scene, world: World, position: [number, number, number]) {
    this.group = new Group()
    this.group.position.set(...position)
    scene.add(this.group)

  const verticleBarMaterial = new MeshStandardMaterial({ color: 0x264653 }) // azul petroleo
  const horizontalBarMaterial = new MeshStandardMaterial({ color: 0x013220 }) // Verde bosque oscuro

  const verticleBar = new Mesh(new CylinderGeometry(0.25, 0.25, 1.5), verticleBarMaterial)
  verticleBar.castShadow = true
  this.group.add(verticleBar)

  const horizontalBar = new Mesh(new CylinderGeometry(0.25, 0.25, 4), horizontalBarMaterial)
  horizontalBar.rotateX(-Math.PI / 2)
  horizontalBar.castShadow = true
  this.group.add(horizontalBar)

    this.body = world.createRigidBody(RigidBodyDesc.kinematicPositionBased().setTranslation(...position))
    this.handle = this.body.handle

    const shape = ColliderDesc.cylinder(2, 0.25).setRotation(new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0)))

    world.createCollider(shape, this.body)
  }

  update(delta: number) {
    this.group.rotation.y += delta

    // with a kinematicPositionBased body, we can just copy the Threejs transform
    this.body.setNextKinematicRotation(this.group.quaternion)
  }
}