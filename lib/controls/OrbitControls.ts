import type * as THREE from "three"

export class OrbitControls {
  object: THREE.Camera
  domElement: HTMLElement
  enabled = true
  enableDamping = false
  dampingFactor = 0.05
  rotateSpeed = 1.0
  enableZoom = true

  private isMouseDown = false
  private mouseX = 0
  private mouseY = 0
  private targetRotationX = 0
  private targetRotationY = 0
  private rotationX = 0
  private rotationY = 0

  constructor(object: THREE.Camera, domElement: HTMLElement) {
    this.object = object
    this.domElement = domElement
    this.addEventListeners()
  }

  private addEventListeners() {
    this.domElement.addEventListener("mousedown", this.onMouseDown.bind(this))
    this.domElement.addEventListener("mousemove", this.onMouseMove.bind(this))
    this.domElement.addEventListener("mouseup", this.onMouseUp.bind(this))
    this.domElement.addEventListener("wheel", this.onWheel.bind(this))
  }

  private onMouseDown(event: MouseEvent) {
    this.isMouseDown = true
    this.mouseX = event.clientX
    this.mouseY = event.clientY
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isMouseDown) return

    const deltaX = event.clientX - this.mouseX
    const deltaY = event.clientY - this.mouseY

    this.targetRotationY += deltaX * 0.01 * this.rotateSpeed
    this.targetRotationX += deltaY * 0.01 * this.rotateSpeed

    this.mouseX = event.clientX
    this.mouseY = event.clientY
  }

  private onMouseUp() {
    this.isMouseDown = false
  }

  private onWheel(event: WheelEvent) {
    if (!this.enableZoom) return
    event.preventDefault()

    const scale = event.deltaY > 0 ? 1.1 : 0.9
    this.object.position.multiplyScalar(scale)
  }

  update() {
    if (this.enableDamping) {
      this.rotationX += (this.targetRotationX - this.rotationX) * this.dampingFactor
      this.rotationY += (this.targetRotationY - this.rotationY) * this.dampingFactor
    } else {
      this.rotationX = this.targetRotationX
      this.rotationY = this.targetRotationY
    }

    // Apply rotation to camera
    const radius = this.object.position.length()
    this.object.position.x = radius * Math.sin(this.rotationY) * Math.cos(this.rotationX)
    this.object.position.y = radius * Math.sin(this.rotationX)
    this.object.position.z = radius * Math.cos(this.rotationY) * Math.cos(this.rotationX)
    this.object.lookAt(0, 0, 0)
  }

  dispose() {
    this.domElement.removeEventListener("mousedown", this.onMouseDown.bind(this))
    this.domElement.removeEventListener("mousemove", this.onMouseMove.bind(this))
    this.domElement.removeEventListener("mouseup", this.onMouseUp.bind(this))
    this.domElement.removeEventListener("wheel", this.onWheel.bind(this))
  }
}
