import { WebGLRenderer } from 'three'

export default class UI {
  renderer: WebGLRenderer
  instructions: HTMLDivElement

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer

    this.instructions = document.getElementById('instructions') as HTMLDivElement

    const startButton = document.getElementById('startButton') as HTMLButtonElement
    startButton.addEventListener(
      'click',
      () => {
        renderer.domElement.requestPointerLock()
      },
      false
    )

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.renderer.domElement) {
        this.instructions.style.display = 'none'
      } else {
        this.instructions.style.display = 'block'
      }
    })
  }

  show() {
    ;(document.getElementById('spinner') as HTMLDivElement).style.display = 'none'
    this.instructions.style.display = 'block'
  }
}