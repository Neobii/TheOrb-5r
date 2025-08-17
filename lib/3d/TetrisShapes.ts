import * as THREE from "three"

export interface TetrisShape {
  mesh: THREE.Group
  type: string
  rotationSpeed: THREE.Vector3
  fallSpeed: number
  color: THREE.Color
}

export class TetrisShapeGenerator {
  private neonColors = [
    new THREE.Color(0x00ffff), // Cyan - I piece
    new THREE.Color(0x0000ff), // Blue - J piece
    new THREE.Color(0xff8000), // Orange - L piece
    new THREE.Color(0xffff00), // Yellow - O piece
    new THREE.Color(0x00ff00), // Green - S piece
    new THREE.Color(0x800080), // Purple - T piece
    new THREE.Color(0xff0000), // Red - Z piece
  ]

  private createBlock(color: THREE.Color): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.3),
      metalness: 0.3,
      roughness: 0.4,
    })

    const block = new THREE.Mesh(geometry, material)
    block.castShadow = true
    block.receiveShadow = true

    // Add wireframe outline
    const wireframeGeometry = new THREE.EdgesGeometry(geometry)
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: color.clone().multiplyScalar(1.5),
      transparent: true,
      opacity: 0.8,
    })
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
    block.add(wireframe)

    return block
  }

  createIShape(): TetrisShape {
    const group = new THREE.Group()
    const color = this.neonColors[0] // Cyan

    // I-piece: 4 blocks in a line
    for (let i = 0; i < 4; i++) {
      const block = this.createBlock(color)
      block.position.set(i * 2 - 3, 0, 0) // Center the piece
      group.add(block)
    }

    return {
      mesh: group,
      type: "I",
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ),
      fallSpeed: Math.random() * 0.1 + 0.05,
      color: color,
    }
  }

  createOShape(): TetrisShape {
    const group = new THREE.Group()
    const color = this.neonColors[3] // Yellow

    // O-piece: 2x2 square
    const positions = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]

    positions.forEach(([x, y]) => {
      const block = this.createBlock(color)
      block.position.set(x * 2 - 1, y * 2 - 1, 0)
      group.add(block)
    })

    return {
      mesh: group,
      type: "O",
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ),
      fallSpeed: Math.random() * 0.1 + 0.05,
      color: color,
    }
  }

  createTShape(): TetrisShape {
    const group = new THREE.Group()
    const color = this.neonColors[5] // Purple

    // T-piece
    const positions = [
      [1, 0], // Top center
      [0, 1],
      [1, 1],
      [2, 1], // Bottom row
    ]

    positions.forEach(([x, y]) => {
      const block = this.createBlock(color)
      block.position.set(x * 2 - 2, y * 2 - 1, 0)
      group.add(block)
    })

    return {
      mesh: group,
      type: "T",
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ),
      fallSpeed: Math.random() * 0.1 + 0.05,
      color: color,
    }
  }

  createSShape(): TetrisShape {
    const group = new THREE.Group()
    const color = this.neonColors[4] // Green

    // S-piece
    const positions = [
      [1, 0],
      [2, 0], // Top row (right side)
      [0, 1],
      [1, 1], // Bottom row (left side)
    ]

    positions.forEach(([x, y]) => {
      const block = this.createBlock(color)
      block.position.set(x * 2 - 2, y * 2 - 1, 0)
      group.add(block)
    })

    return {
      mesh: group,
      type: "S",
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ),
      fallSpeed: Math.random() * 0.1 + 0.05,
      color: color,
    }
  }

  createZShape(): TetrisShape {
    const group = new THREE.Group()
    const color = this.neonColors[6] // Red

    // Z-piece
    const positions = [
      [0, 0],
      [1, 0], // Top row (left side)
      [1, 1],
      [2, 1], // Bottom row (right side)
    ]

    positions.forEach(([x, y]) => {
      const block = this.createBlock(color)
      block.position.set(x * 2 - 2, y * 2 - 1, 0)
      group.add(block)
    })

    return {
      mesh: group,
      type: "Z",
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ),
      fallSpeed: Math.random() * 0.1 + 0.05,
      color: color,
    }
  }

  createJShape(): TetrisShape {
    const group = new THREE.Group()
    const color = this.neonColors[1] // Blue

    // J-piece
    const positions = [
      [0, 0], // Top left
      [0, 1],
      [1, 1],
      [2, 1], // Bottom row
    ]

    positions.forEach(([x, y]) => {
      const block = this.createBlock(color)
      block.position.set(x * 2 - 2, y * 2 - 1, 0)
      group.add(block)
    })

    return {
      mesh: group,
      type: "J",
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ),
      fallSpeed: Math.random() * 0.1 + 0.05,
      color: color,
    }
  }

  createLShape(): TetrisShape {
    const group = new THREE.Group()
    const color = this.neonColors[2] // Orange

    // L-piece
    const positions = [
      [2, 0], // Top right
      [0, 1],
      [1, 1],
      [2, 1], // Bottom row
    ]

    positions.forEach(([x, y]) => {
      const block = this.createBlock(color)
      block.position.set(x * 2 - 2, y * 2 - 1, 0)
      group.add(block)
    })

    return {
      mesh: group,
      type: "L",
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ),
      fallSpeed: Math.random() * 0.1 + 0.05,
      color: color,
    }
  }

  createRandomShape(): TetrisShape {
    const shapeTypes = ["I", "O", "T", "S", "Z", "J", "L"]
    const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]

    switch (randomType) {
      case "I":
        return this.createIShape()
      case "O":
        return this.createOShape()
      case "T":
        return this.createTShape()
      case "S":
        return this.createSShape()
      case "Z":
        return this.createZShape()
      case "J":
        return this.createJShape()
      case "L":
        return this.createLShape()
      default:
        return this.createIShape()
    }
  }

  positionShapeRandomly(shape: TetrisShape, bounds: { x: number; y: number; z: number }) {
    // Random position within bounds
    shape.mesh.position.set(
      (Math.random() - 0.5) * bounds.x,
      Math.random() * bounds.y + bounds.y / 2, // Start from top
      (Math.random() - 0.5) * bounds.z,
    )

    // Random initial rotation
    shape.mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)

    // Random scale variation
    const scale = 0.8 + Math.random() * 0.6 // 0.8 to 1.4
    shape.mesh.scale.setScalar(scale)
  }

  animateShape(shape: TetrisShape, time: number, bounds: { x: number; y: number; z: number }) {
    // Continuous rotation
    shape.mesh.rotation.x += shape.rotationSpeed.x
    shape.mesh.rotation.y += shape.rotationSpeed.y
    shape.mesh.rotation.z += shape.rotationSpeed.z

    // Falling motion
    shape.mesh.position.y -= shape.fallSpeed

    // Add some floating/drifting motion
    shape.mesh.position.x += Math.sin(time * 0.5 + shape.mesh.position.y * 0.1) * 0.02
    shape.mesh.position.z += Math.cos(time * 0.3 + shape.mesh.position.x * 0.1) * 0.015

    // Reset position when it falls too low
    if (shape.mesh.position.y < -bounds.y) {
      shape.mesh.position.y = bounds.y
      shape.mesh.position.x = (Math.random() - 0.5) * bounds.x
      shape.mesh.position.z = (Math.random() - 0.5) * bounds.z

      // Randomize properties when respawning
      shape.fallSpeed = Math.random() * 0.1 + 0.05
      shape.rotationSpeed.set((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02)
    }

    // Pulse the emissive color
    const pulseFactor = 0.3 + Math.sin(time * 2 + shape.mesh.position.x * 0.1) * 0.2
    shape.mesh.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive = shape.color.clone().multiplyScalar(pulseFactor)
      }
    })
  }
}
