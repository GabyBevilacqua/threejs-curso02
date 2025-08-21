import { ColliderDesc, RigidBodyDesc, World } from "@dimforge/rapier3d-compat";
import {
  BoxGeometry,
  Euler,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Scene,
} from "three";

export default class Platform {
  constructor(
    scene: Scene,
    world: World,
    size: [number, number, number],
    position: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0]
  ) {
  const mesh = new Mesh(new BoxGeometry(...size), new MeshStandardMaterial({ color: 0xCCCCCC  })); // Gris oscuro
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const body = world.createRigidBody(
      RigidBodyDesc.fixed()
        .setTranslation(...position)
        .setRotation(new Quaternion().setFromEuler(new Euler(...rotation)))
    );

    const shape = ColliderDesc.cuboid(size[0] / 2, size[1] / 2, size[2] / 2);

    world.createCollider(shape, body);

    mesh.position.copy(body.translation());
    mesh.quaternion.copy(body.rotation());
  }
}
