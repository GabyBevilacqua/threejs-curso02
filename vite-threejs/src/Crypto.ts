import { AnimationAction, AnimationMixer, Group, Mesh, AnimationUtils } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

export default class Crypto extends Group {
  mixer?: AnimationMixer
  glTFLoader: GLTFLoader

  constructor() {
    super()

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('jsm/libs/draco/')

    this.glTFLoader = new GLTFLoader()
    this.glTFLoader.setDRACOLoader(dracoLoader)
  }

  async init(animationActions: { [key: string]: AnimationAction }) {
    const [crypto, idle, run, jump, pose] = await Promise.all([
      this.glTFLoader.loadAsync('models/crypto$@walk_compressed.glb'),
      this.glTFLoader.loadAsync('models/crypto@idle.glb'),
      this.glTFLoader.loadAsync('models/crypto@run.glb'),
      this.glTFLoader.loadAsync('models/crypto@jump.glb'),
      this.glTFLoader.loadAsync('models/crypto@pose.glb'),
    ])

    crypto.scene.traverse((m) => {
      if ((m as Mesh).isMesh) {
        m.castShadow = true
      }
    })

    this.mixer = new AnimationMixer(crypto.scene)
    animationActions['idle'] = this.mixer.clipAction(idle.animations[0])
    //animationActions['walk'] = this.mixer.clipAction(crypto.animations[0])
    animationActions['walk'] = this.mixer.clipAction(AnimationUtils.subclip(crypto.animations[0], 'walk', 0, 42))
    //animationActions['run'] = this.mixer.clipAction(run.animations[0])
    animationActions['run'] = this.mixer.clipAction(AnimationUtils.subclip(run.animations[0], 'run', 0, 22))
    // jump.animations[0].tracks = jump.animations[0].tracks.filter(function (e) {
    //   return !e.name.endsWith('.position')
    // })
    // console.log(jump.animations[0].tracks)
    animationActions['jump'] = this.mixer.clipAction(jump.animations[0])
    // animationActions['jump'] = this.mixer.clipAction(AnimationUtils.subclip(jump.animations[0], 'jump', 0, 60))
    animationActions['pose'] = this.mixer.clipAction(pose.animations[0])

    animationActions['idle'].play()

    this.add(crypto.scene)
    crypto.scene.scale.set(0.75, 0.75, 0.75) // Cambiar 0.5 por el factor necesario para adaptar el tamano
  }

  update(delta: number) {
    this.mixer?.update(delta)
  }
}