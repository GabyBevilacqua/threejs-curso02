import { DirectionalLight, EquirectangularReflectionMapping, GridHelper, Scene, TextureLoader } from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'

export default class Environment {
  scene: Scene
  light: DirectionalLight

  constructor(scene: Scene) {
    this.scene = scene

    this.scene.add(new GridHelper(50, 50))

    this.light = new DirectionalLight(0xffffff, Math.PI)
    this.light.position.set(65.7, 19.2, 50.2)
    this.light.castShadow = true
    this.scene.add(this.light)

    // const directionalLightHelper = new CameraHelper(this.light.shadow.camera)
    // this.scene.add(directionalLightHelper)

    const textureLoader = new TextureLoader()
    const textureFlare0 = textureLoader.load('img/lensflare0.png')
    const textureFlare3 = textureLoader.load('img/lensflare3.png')

    const lensflare = new Lensflare()
    lensflare.addElement(new LensflareElement(textureFlare0, 1000, 0))
    lensflare.addElement(new LensflareElement(textureFlare3, 500, 0.2))
    lensflare.addElement(new LensflareElement(textureFlare3, 250, 0.8))
    lensflare.addElement(new LensflareElement(textureFlare3, 125, 0.6))
    lensflare.addElement(new LensflareElement(textureFlare3, 62.5, 0.4))
    this.light.add(lensflare)
  }

  async init() {
    await new RGBELoader().loadAsync('img/venice_sunset_1k.hdr').then((texture) => {
      texture.mapping = EquirectangularReflectionMapping
      this.scene.environment = texture
      this.scene.background = texture
      this.scene.backgroundBlurriness = 0.4
    })
  }
}