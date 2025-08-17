export class SimpleAudioEngine {
  private audioContext: AudioContext | null = null
  private isInitialized = false
  private masterVolume = 0.3
  private activeNotes: Map<string, { oscillator: OscillatorNode; gainNode: GainNode }> = new Map()

  constructor() {
    // Don't initialize immediately - wait for user interaction
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized && this.audioContext) {
      return true
    }

    try {
      // Create new audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      console.log("Audio context created:", this.audioContext.state)

      // Resume if suspended
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume()
        console.log("Audio context resumed:", this.audioContext.state)
      }

      this.isInitialized = true
      console.log("Audio engine initialized successfully!")
      return true
    } catch (error) {
      console.error("Failed to initialize audio:", error)
      return false
    }
  }

  async playTestBeep(): Promise<boolean> {
    const success = await this.initialize()
    if (!success || !this.audioContext) {
      console.error("Audio not initialized")
      return false
    }

    try {
      const now = this.audioContext.currentTime
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(440, now) // A4
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(this.masterVolume, now + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1)

      oscillator.start(now)
      oscillator.stop(now + 1)

      console.log("Test beep played!")
      return true
    } catch (error) {
      console.error("Failed to play test beep:", error)
      return false
    }
  }

  // Key to frequency mapping
  private keyToFrequency(key: string): number {
    const keyMap: { [key: string]: number } = {
      // Bottom row
      z: 130.81, // C3
      x: 138.59, // C#3
      c: 146.83, // D3
      v: 155.56, // D#3
      b: 164.81, // E3
      n: 174.61, // F3
      m: 185.0, // F#3

      // Middle row
      a: 196.0, // G3
      s: 207.65, // G#3
      d: 220.0, // A3
      f: 233.08, // A#3
      g: 246.94, // B3
      h: 261.63, // C4
      j: 277.18, // C#4
      k: 293.66, // D4
      l: 311.13, // D#4

      // Top row
      q: 329.63, // E4
      w: 349.23, // F4
      e: 369.99, // F#4
      r: 392.0, // G4
      t: 415.3, // G#4
      y: 440.0, // A4
      u: 466.16, // A#4
      i: 493.88, // B4
      o: 523.25, // C5
      p: 554.37, // C#5
    }
    return keyMap[key.toLowerCase()] || 440
  }

  async playNote(key: string): Promise<boolean> {
    const success = await this.initialize()
    if (!success || !this.audioContext) {
      console.error("Audio not initialized for note:", key)
      return false
    }

    // Stop existing note if playing
    if (this.activeNotes.has(key)) {
      this.stopNote(key)
    }

    try {
      const now = this.audioContext.currentTime
      const frequency = this.keyToFrequency(key)

      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, now)
      oscillator.type = "sawtooth" // Rich harmonic content

      // Quick attack
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(this.masterVolume, now + 0.05)

      oscillator.start(now)

      // Store active note
      this.activeNotes.set(key, { oscillator, gainNode })

      console.log(`Playing note ${key} at ${frequency}Hz`)
      return true
    } catch (error) {
      console.error(`Failed to play note ${key}:`, error)
      return false
    }
  }

  stopNote(key: string): void {
    const note = this.activeNotes.get(key)
    if (!note || !this.audioContext) return

    try {
      const now = this.audioContext.currentTime

      // Quick release
      note.gainNode.gain.cancelScheduledValues(now)
      note.gainNode.gain.setValueAtTime(note.gainNode.gain.value, now)
      note.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

      // Stop oscillator
      note.oscillator.stop(now + 0.1)

      this.activeNotes.delete(key)
      console.log(`Stopped note ${key}`)
    } catch (error) {
      console.error(`Failed to stop note ${key}:`, error)
    }
  }

  stopAllNotes(): void {
    for (const key of this.activeNotes.keys()) {
      this.stopNote(key)
    }
  }

  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }

  getStatus(): { initialized: boolean; contextState: string; activeNotes: number } {
    return {
      initialized: this.isInitialized,
      contextState: this.audioContext?.state || "none",
      activeNotes: this.activeNotes.size,
    }
  }

  // Simple drum sounds
  async playKick(): Promise<void> {
    const success = await this.initialize()
    if (!success || !this.audioContext) return

    try {
      const now = this.audioContext.currentTime
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(60, now)
      oscillator.frequency.exponentialRampToValueAtTime(20, now + 0.1)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.8, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      oscillator.start(now)
      oscillator.stop(now + 0.3)
    } catch (error) {
      console.error("Failed to play kick:", error)
    }
  }

  async playSnare(): Promise<void> {
    const success = await this.initialize()
    if (!success || !this.audioContext) return

    try {
      const now = this.audioContext.currentTime

      // Create noise buffer
      const bufferSize = this.audioContext.sampleRate * 0.1
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
      const output = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const noise = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      noise.buffer = buffer
      noise.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.5, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

      noise.start(now)
      noise.stop(now + 0.1)
    } catch (error) {
      console.error("Failed to play snare:", error)
    }
  }

  async playHiHat(): Promise<void> {
    const success = await this.initialize()
    if (!success || !this.audioContext) return

    try {
      const now = this.audioContext.currentTime
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(8000, now)
      oscillator.type = "square"

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + 0.005)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

      oscillator.start(now)
      oscillator.stop(now + 0.05)
    } catch (error) {
      console.error("Failed to play hihat:", error)
    }
  }
}
