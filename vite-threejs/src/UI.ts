import { WebGLRenderer } from "three";

export default class UI {
  renderer: WebGLRenderer;
  instructions: HTMLDivElement;
  timeDisplay: HTMLDivElement;
  levelCompleted: HTMLDivElement;
  interval = -1;
  time = 0;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;

    this.instructions = document.getElementById(
      "instructions"
    ) as HTMLDivElement;

    this.timeDisplay = document.getElementById("timeDisplay") as HTMLDivElement;

    this.levelCompleted = document.getElementById(
      "levelCompleted"
    ) as HTMLDivElement;

    const startButton = document.getElementById(
      "startButton"
    ) as HTMLButtonElement;
    startButton.addEventListener(
      "click",
      () => {
        renderer.domElement.requestPointerLock();
      },
      false
    );

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === this.renderer.domElement) {
        this.levelCompleted.style.display = "none";

        this.instructions.style.display = "none";

        this.timeDisplay.style.display = "block";

        this.interval = setInterval(() => {
          this.time += 1;
          this.timeDisplay.innerText = this.time.toString();
        }, 1000);
      } else {
        this.instructions.style.display = "block";

        this.timeDisplay.style.display = "none";
        clearInterval(this.interval);
      }
    });
  }

  show() {
    (document.getElementById("spinner") as HTMLDivElement).style.display =
      "none";
    this.instructions.style.display = "block";
  }

  reset() {
    clearInterval(this.interval);

    this.levelCompleted.style.display = "none";

    this.time = 0;
    this.timeDisplay.innerText = this.time.toString();

    this.interval = setInterval(() => {
      this.time += 1;
      this.timeDisplay.innerText = this.time.toString();
    }, 1000);
  }

  showLevelCompleted() {
    clearInterval(this.interval);

    this.levelCompleted.style.display = "block";
  }
}
