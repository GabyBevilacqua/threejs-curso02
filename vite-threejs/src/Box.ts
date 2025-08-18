import { Scene, Object3D, Mesh, BoxGeometry, MeshStandardMaterial } from 'three'
import { World, RigidBody, RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat'

export default class Box {
  dynamicBody: [Object3D, RigidBody]

  constructor(scene: Scene, world: World, position: [number, number, number]) {
    const boxMesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial())
    boxMesh.castShadow = true
    scene.add(boxMesh)

    const boxBody = world.createRigidBody(RigidBodyDesc.dynamic().setTranslation(...position))

    const boxShape = ColliderDesc.cuboid(0.5, 0.5, 0.5).setRestitution(0.5).setMass(0.1)
    world.createCollider(boxShape, boxBody)

    this.dynamicBody = [boxMesh, boxBody]
  }

  update() {
    this.dynamicBody[0].position.copy(this.dynamicBody[1].translation())
    this.dynamicBody[0].quaternion.copy(this.dynamicBody[1].rotation())
  }
}