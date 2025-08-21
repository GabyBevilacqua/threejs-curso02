import { Scene, Mesh, MeshStandardMaterial } from 'three'
import { World, RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class Start {
  material = new MeshStandardMaterial()

  constructor(scene: Scene, world: World, position: [number, number, number]) {
    new GLTFLoader().load('models/start.glb', (gltf) => {
      const mesh = gltf.scene.getObjectByName('Cylinder') as Mesh
      mesh.receiveShadow = true
      scene.add(mesh)

      this.material = mesh.material as MeshStandardMaterial
      this.material.map?.center.set(0.1034, 0) // fixes slightly offset texture

      const body = world.createRigidBody(RigidBodyDesc.fixed().setTranslation(...position))

      //const shape = ColliderDesc.cylinder(0.15, 3.7)

      const points = new Float32Array(mesh.geometry.attributes.position.array)
      const shape = ColliderDesc.convexHull(points) as ColliderDesc

      world.createCollider(shape, body)

      mesh.position.copy(body.translation())
      mesh.quaternion.copy(body.rotation())

      // esto hace que rote y parezca discoteca
    //   setInterval(() => {
    //     ;(this.material.map as Texture).rotation += Math.PI
    //   }, 500)
    })
  }
}