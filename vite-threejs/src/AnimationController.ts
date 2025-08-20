import { AnimationAction, Scene } from 'three/src/Three.js'
import Keyboard from './Keyboard'
import Crypto from './Crypto'

export default class AnimationController {
  scene: Scene
  wait = false
  animationActions: { [key: string]: AnimationAction } = {}
  activeAction?: AnimationAction
  speed = 0
  keyboard: Keyboard
  model?: Crypto

  constructor(scene: Scene, keyboard: Keyboard) {
    this.scene = scene
    this.keyboard = keyboard
  }

  async init() {
    this.model = new Crypto()
    await this.model.init(this.animationActions)
    this.activeAction = this.animationActions['idle']
    this.scene.add(this.model)
  }

  setAction(action: AnimationAction) {
    if (this.activeAction != action) {
      this.activeAction?.fadeOut(0.1)
      action.reset().fadeIn(0.1).play()
      this.activeAction = action

      switch (action) {
        case this.animationActions['walk']:
          this.speed = 5.25
          break
        case this.animationActions['run']:
        case this.animationActions['jump']:
          this.speed = 16
          break
        case this.animationActions['pose']:
        case this.animationActions['idle']:
          this.speed = 0
          break
      }
    }
  }

  update(delta: number) {
    if (!this.wait) {
      let actionAssigned = false

      if (this.keyboard.keyMap['Space']) {
        this.setAction(this.animationActions['jump'])
        actionAssigned = true
        this.wait = true // blocks further actions until jump is finished
        setTimeout(() => (this.wait = false), 1200)
      }

      if (!actionAssigned && this.keyboard.keyMap['KeyW'] && this.keyboard.keyMap['ShiftLeft']) {
        this.setAction(this.animationActions['run'])
        actionAssigned = true
      }

      if (!actionAssigned && this.keyboard.keyMap['KeyW']) {
        this.setAction(this.animationActions['walk'])
        actionAssigned = true
      }

      // if (
      //   !actionAssigned &&
      //   (this.keyboard.keyMap['KeyW'] ||
      //     this.keyboard.keyMap['KeyA'] ||
      //     this.keyboard.keyMap['KeyS'] ||
      //     this.keyboard.keyMap['KeyD']) &&
      //   this.keyboard.keyMap['ShiftLeft']
      // ) {
      //   this.setAction(this.animationActions['run'])
      //   actionAssigned = true
      // }

      // if (
      //   !actionAssigned &&
      //   (this.keyboard.keyMap['KeyW'] ||
      //     this.keyboard.keyMap['KeyA'] ||
      //     this.keyboard.keyMap['KeyS'] ||
      //     this.keyboard.keyMap['KeyD'])
      // ) {
      //   this.setAction(this.animationActions['walk'])
      //   actionAssigned = true
      // }

      if (!actionAssigned && this.keyboard.keyMap['KeyQ']) {
        this.setAction(this.animationActions['pose'])
        actionAssigned = true
      }

      !actionAssigned && this.setAction(this.animationActions['idle'])
    }

    // update the Eve models animation mixer
    this.model?.update(delta)
  }
}