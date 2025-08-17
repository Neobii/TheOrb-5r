export class RetroSoundGenerator {
  private audioContext: AudioContext | null = null
  private masterVolume = 0.3

  constructor() {
    // Initialize AudioContext on first user interaction
    this.initAudioContext()
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn("Web Audio API not supported")
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext()
    }

    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume()
    }
  }

  // Generate cartridge insertion sound
  async playInsertionSound() {
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const duration = 0.4
    const now = this.audioContext.currentTime

    // Create oscillator for the "click" sound
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Sharp click sound with frequency sweep
    oscillator.frequency.setValueAtTime(800, now)
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1)
    oscillator.frequency.setValueAtTime(150, now + 0.1)

    oscillator.type = "square"

    // Sharp attack, quick decay
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.8, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)
  }

  // Generate power-on sound
  async playPowerOnSound() {
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const duration = 1.2
    const now = this.audioContext.currentTime

    // Main power-on tone
    const oscillator1 = this.audioContext.createOscillator()
    const gainNode1 = this.audioContext.createGain()

    oscillator1.connect(gainNode1)
    gainNode1.connect(this.audioContext.destination)

    // Classic NES power-on frequency sweep
    oscillator1.frequency.setValueAtTime(60, now)
    oscillator1.frequency.exponentialRampToValueAtTime(220, now + 0.3)
    oscillator1.frequency.setValueAtTime(220, now + 0.3)
    oscillator1.frequency.exponentialRampToValueAtTime(440, now + 0.8)

    oscillator1.type = "square"

    gainNode1.gain.setValueAtTime(0, now)
    gainNode1.gain.linearRampToValueAtTime(this.masterVolume * 0.6, now + 0.1)
    gainNode1.gain.setValueAtTime(this.masterVolume * 0.6, now + 0.8)
    gainNode1.gain.exponentialRampToValueAtTime(0.01, now + duration)

    // Add harmonic for richer sound
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode2 = this.audioContext.createGain()

    oscillator2.connect(gainNode2)
    gainNode2.connect(this.audioContext.destination)

    oscillator2.frequency.setValueAtTime(120, now)
    oscillator2.frequency.exponentialRampToValueAtTime(440, now + 0.3)
    oscillator2.frequency.setValueAtTime(440, now + 0.3)
    oscillator2.frequency.exponentialRampToValueAtTime(880, now + 0.8)

    oscillator2.type = "triangle"

    gainNode2.gain.setValueAtTime(0, now)
    gainNode2.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + 0.1)
    gainNode2.gain.setValueAtTime(this.masterVolume * 0.3, now + 0.8)
    gainNode2.gain.exponentialRampToValueAtTime(0.01, now + duration)

    oscillator1.start(now)
    oscillator1.stop(now + duration)
    oscillator2.start(now)
    oscillator2.stop(now + duration)
  }

  // Generate cartridge ejection sound
  async playEjectionSound() {
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const duration = 0.3
    const now = this.audioContext.currentTime

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Reverse of insertion - higher to lower frequency
    oscillator.frequency.setValueAtTime(400, now)
    oscillator.frequency.exponentialRampToValueAtTime(100, now + duration)

    oscillator.type = "square"

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.6, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)
  }

  // Generate button press sound
  async playButtonSound() {
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const duration = 0.15
    const now = this.audioContext.currentTime

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(1000, now)
    oscillator.frequency.exponentialRampToValueAtTime(500, now + duration)

    oscillator.type = "square"

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)
  }
}
