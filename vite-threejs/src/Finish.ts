import { Scene, Object3D, Mesh, MeshStandardMaterial, Texture, TextureLoader, RepeatWrapping, CylinderGeometry, MeshPhongMaterial, DoubleSide } from 'three'
import { World, RigidBody, RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class Finish {
  dynamicBody?: [Object3D, RigidBody]
  material = new MeshStandardMaterial()
  texture: Texture
  handle = -1

  constructor(scene: Scene, world: World, position: [number, number, number]) {
    this.texture = new TextureLoader().load('img/finish.png', (texture) => {
      texture.repeat.x = 2
      texture.wrapS = RepeatWrapping
      texture.flipY = true
    })

    const banner = new Mesh(new CylinderGeometry(3.4, 3.4, 2, 12, 1, true), new MeshPhongMaterial({ transparent: true, opacity: 0.75, map: this.texture, side: DoubleSide }))
    banner.position.set(...position)
    banner.position.y += 3
    scene.add(banner)

    new GLTFLoader().load('models/finish.glb', (gltf) => {
      const mesh = gltf.scene.getObjectByName('Cylinder') as Mesh
      mesh.receiveShadow = true
      scene.add(mesh)

      this.material = mesh.material as MeshStandardMaterial

      const body = world.createRigidBody(RigidBodyDesc.fixed().setTranslation(...position))
      this.handle = body.handle

      const points = new Float32Array(mesh.geometry.attributes.position.array)
      const shape = ColliderDesc.convexHull(points) as ColliderDesc

      world.createCollider(shape, body)

      mesh.position.copy(body.translation())
      mesh.quaternion.copy(body.rotation())

      setInterval(() => {
        ;(this.material.map as Texture).rotation += Math.PI
      }, 1000)
    })
  }

  update(delta: number) {
    this.texture.offset.x += delta / 3
  }
}