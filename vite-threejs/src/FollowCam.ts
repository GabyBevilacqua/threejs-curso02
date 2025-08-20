import { Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

export default class FollowCam {
  camera: PerspectiveCamera
  pivot = new Object3D()
  yaw = new Object3D()
  pitch = new Object3D()

  constructor(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer) {
    this.camera = camera

    this.yaw.position.y = 0.75

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === renderer.domElement) {
        renderer.domElement.addEventListener('mousemove', this.onDocumentMouseMove)
        renderer.domElement.addEventListener('wheel', this.onDocumentMouseWheel)
      } else {
        renderer.domElement.removeEventListener('mousemove', this.onDocumentMouseMove)
        renderer.domElement.removeEventListener('wheel', this.onDocumentMouseWheel)
      }
    })

    scene.add(this.pivot)
    this.pivot.add(this.yaw)
    this.yaw.add(this.pitch)
    this.pitch.add(camera) // adding the perspective camera to the hierarchy
  }

  onDocumentMouseMove = (e: MouseEvent) => {
    this.yaw.rotation.y -= e.movementX * 0.002
    const v = this.pitch.rotation.x - e.movementY * 0.002

    // limit range
    if (v > -1 && v < 1) {
      this.pitch.rotation.x = v
    }
  }

  onDocumentMouseWheel = (e: WheelEvent) => {
    e.preventDefault()
    const v = this.camera.position.z + e.deltaY * 0.005

    // limit range
    if (v >= 0.5 && v <= 10) {
      this.camera.position.z = v
    }
  }
}