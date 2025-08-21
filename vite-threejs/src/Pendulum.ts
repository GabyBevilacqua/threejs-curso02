import {
  ColliderDesc,
  JointData,
  RigidBody,
  RigidBodyDesc,
  RigidBodyType,
  Vector3,
  World,
} from "@dimforge/rapier3d-compat";
import {
  Euler,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Scene,
  SphereGeometry,
} from "three";

export default class Pendulum {
  dynamicBodies: [Object3D, RigidBody][] = [];
  handles = [-1, -1];

  constructor(
    scene: Scene,
    world: World,
    position: [number, number, number],
    rotationY: number = 0
  ) {
    const parents = [];

    for (let i = 0; i < 4; i++) {
      const mesh = new Mesh(
        new SphereGeometry(0.4),
        new MeshStandardMaterial({ color: 0x1a1a1a }) // Gris oscuro
      );
      mesh.position.set(position[0], position[1], i + position[2]);
      mesh.castShadow = true;
      scene.add(mesh);

      let rigidBodyType;

      if (i == 0) {
        rigidBodyType = RigidBodyType.Fixed;
      } else {
        rigidBodyType = RigidBodyType.Dynamic;
      }

      const body = world.createRigidBody(
        new RigidBodyDesc(rigidBodyType)
          .setTranslation(position[0], position[1], i + position[2])
          .setRotation(
            new Quaternion().setFromEuler(new Euler(0, rotationY, 0))
          )
      );
      let colliderDesc = ColliderDesc.ball(0.4).setMass(1);

      if (i >= 2) {
        // will check for collisions with lowest 2 hanging balls in game.ts update loop
        this.handles.push(body.handle);
      }

      world.createCollider(colliderDesc, body);

      if (i > 0) {
        let parent = parents[parents.length - 1];
        let params = JointData.spherical(
          new Vector3(0.0, 0.0, 0.0),
          new Vector3(0.0, 0.0, -1)
        );
        world.createImpulseJoint(params, parent, body, true);
      }

      parents.push(body);

      this.dynamicBodies.push([mesh, body]);
    }
  }

  update() {
    for (let i = 0, n = this.dynamicBodies.length; i < n; i++) {
      this.dynamicBodies[i][0].position.copy(
        this.dynamicBodies[i][1].translation()
      );
      this.dynamicBodies[i][0].quaternion.copy(
        this.dynamicBodies[i][1].rotation()
      );
    }
  }
}
