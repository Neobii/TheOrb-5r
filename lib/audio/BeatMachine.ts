export class BeatMachine {
  private audioContext: AudioContext | null = null
  private masterVolume = 0.7
  private isPlaying = false
  private currentStep = 0
  private intervalId: number | null = null
  private bpm = 120
  private stepCallback: ((step: number) => void) | null = null

  constructor() {
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

  setStepCallback(callback: (step: number) => void) {
    this.stepCallback = callback
  }

  setBPM(bpm: number) {
    this.bpm = bpm
    if (this.isPlaying) {
      this.stop()
      this.play()
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = volume
  }

  // Kick drum sound
  async playKick(volume = 1) {
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const duration = 0.5

    // Low frequency oscillator for the kick
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Kick drum characteristics
    oscillator.frequency.setValueAtTime(60, now)
    oscillator.frequency.exponentialRampToValueAtTime(20, now + 0.1)
    oscillator.type = "sine"

    // Low-pass filter for thump
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(100, now)
    filter.Q.setValueAtTime(1, now)

    // Sharp attack, quick decay
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * volume, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    oscillator.start(now)
    oscillator.stop(now + duration)
  }

  // Snare drum sound
  async playSnare(volume = 1) {
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const duration = 0.2

    // White noise for snare
    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const output = buffer.getChannelData(0)

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const noise = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    noise.buffer = buffer
    noise.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // High-pass filter for snare snap
    filter.type = "highpass"
    filter.frequency.setValueAtTime(1000, now)
    filter.Q.setValueAtTime(1, now)

    // Sharp attack, quick decay
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * volume * 0.8, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    noise.start(now)
    noise.stop(now + duration)
  }

  // Hi-hat sound
  async playHiHat(volume = 1) {
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const duration = 0.1

    // High frequency oscillators for hi-hat
    const oscillator1 = this.audioContext.createOscillator()
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    oscillator1.connect(filter)
    oscillator2.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // High frequency metallic sound
    oscillator1.frequency.setValueAtTime(8000, now)
    oscillator2.frequency.setValueAtTime(12000, now)
    oscillator1.type = "square"
    oscillator2.type = "square"

    // High-pass filter
    filter.type = "highpass"
    filter.frequency.setValueAtTime(7000, now)
    filter.Q.setValueAtTime(1, now)

    // Very sharp attack, very quick decay
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * volume * 0.3, now + 0.005)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    oscillator1.start(now)
    oscillator1.stop(now + duration)
    oscillator2.start(now)
    oscillator2.stop(now + duration)
  }

  // Open hi-hat sound
  async playOpenHat(volume = 1) {
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const duration = 0.3

    // Similar to hi-hat but longer decay
    const oscillator1 = this.audioContext.createOscillator()
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    oscillator1.connect(filter)
    oscillator2.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator1.frequency.setValueAtTime(9000, now)
    oscillator2.frequency.setValueAtTime(11000, now)
    oscillator1.type = "square"
    oscillator2.type = "square"

    filter.type = "highpass"
    filter.frequency.setValueAtTime(6000, now)
    filter.Q.setValueAtTime(1, now)

    // Sharp attack, longer decay
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * volume * 0.4, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    oscillator1.start(now)
    oscillator1.stop(now + duration)
    oscillator2.start(now)
    oscillator2.stop(now + duration)
  }

  // Clap sound
  async playClap(volume = 1) {
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const now = this.audioContext.currentTime
    const duration = 0.15

    // Multiple short bursts for clap
    for (let i = 0; i < 3; i++) {
      const startTime = now + i * 0.01
      const bufferSize = this.audioContext.sampleRate * 0.05
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
      const output = buffer.getChannelData(0)

      // Generate filtered noise
      for (let j = 0; j < bufferSize; j++) {
        output[j] = Math.random() * 2 - 1
      }

      const noise = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      const filter = this.audioContext.createBiquadFilter()

      noise.buffer = buffer
      noise.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      filter.type = "bandpass"
      filter.frequency.setValueAtTime(2000, startTime)
      filter.Q.setValueAtTime(2, startTime)

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * volume * 0.6, startTime + 0.005)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05)

      noise.start(startTime)
      noise.stop(startTime + 0.05)
    }
  }

  play() {
    if (this.isPlaying) return

    this.isPlaying = true
    const stepDuration = (60 / this.bpm / 4) * 1000 // 16th notes

    this.intervalId = window.setInterval(() => {
      if (this.stepCallback) {
        this.stepCallback(this.currentStep)
      }
      this.currentStep = (this.currentStep + 1) % 16
    }, stepDuration)
  }

  stop() {
    this.isPlaying = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.currentStep = 0
    // Trigger callback one more time to update UI
    if (this.stepCallback) {
      this.stepCallback(0)
    }
  }

  isRunning() {
    return this.isPlaying
  }

  getCurrentStep() {
    return this.currentStep
  }
}
