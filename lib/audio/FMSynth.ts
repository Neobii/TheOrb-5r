export class FMSynth {
  private audioContext: AudioContext | null = null
  private masterVolume = 0.3
  private activeNotes: Map<string, { oscillators: OscillatorNode[]; gainNodes: GainNode[]; stopCallback: () => void }> =
    new Map()
  private noteCallback: ((frequency: number, isPlaying: boolean) => void) | null = null

  // FM Synth parameters
  private carrierWaveform: OscillatorType = "sine"
  private modulatorWaveform: OscillatorType = "sine"
  private modulationIndex = 100 // How much the modulator affects the carrier
  private modulatorRatio = 2 // Frequency ratio between modulator and carrier
  private attack = 0.1
  private decay = 0.3
  private sustain = 0.7
  private release = 0.5

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
      try {
        await this.audioContext.resume()
        console.log("Audio context resumed")
      } catch (e) {
        console.warn("Failed to resume audio context:", e)
      }
    }
  }

  // Convert key to frequency - ALL ALPHABETICAL KEYS!
  private keyToFrequency(key: string): number {
    const keyMap: { [key: string]: number } = {
      // Bottom row - C2 octave (very low)
      z: 65.41, // C2
      x: 69.3, // C#2
      c: 73.42, // D2
      v: 77.78, // D#2
      b: 82.41, // E2
      n: 87.31, // F2
      m: 92.5, // F#2

      // Middle row - C3 octave (low)
      a: 98.0, // G2
      s: 103.83, // G#2
      d: 110.0, // A2
      f: 116.54, // A#2
      g: 123.47, // B2
      h: 130.81, // C3
      j: 138.59, // C#3
      k: 146.83, // D3
      l: 155.56, // D#3

      // Top row - C4 octave (middle)
      q: 164.81, // E3
      w: 174.61, // F3
      e: 185.0, // F#3
      r: 196.0, // G3
      t: 207.65, // G#3
      y: 220.0, // A3
      u: 233.08, // A#3
      i: 246.94, // B3
      o: 261.63, // C4 (Middle C)
      p: 277.18, // C#4
    }
    return keyMap[key.toLowerCase()] || 440
  }

  async playNote(key: string) {
    await this.ensureAudioContext()
    if (!this.audioContext) {
      console.warn("No audio context available")
      return
    }

    // Don't play if note is already playing
    if (this.activeNotes.has(key)) {
      console.log(`Note ${key} already playing`)
      return
    }

    console.log(`Playing note: ${key}`)

    const now = this.audioContext.currentTime
    const baseFrequency = this.keyToFrequency(key)

    // Calculate second frequency a half-step (semitone) higher
    const semitoneFactor = Math.pow(2, 1 / 12) // 12th root of 2
    const secondFrequency = baseFrequency * semitoneFactor

    // Arrays to store all oscillators and gain nodes for cleanup
    const oscillators: OscillatorNode[] = []
    const gainNodes: GainNode[] = []

    // Create master gain for this note
    const masterGain = this.audioContext.createGain()
    masterGain.connect(this.audioContext.destination)
    masterGain.gain.setValueAtTime(0, now)
    gainNodes.push(masterGain)

    try {
      // Create first FM pair (base frequency)
      const carrier1 = this.audioContext.createOscillator()
      const modulator1 = this.audioContext.createOscillator()
      const modulationGain1 = this.audioContext.createGain()
      const carrierGain1 = this.audioContext.createGain()

      carrier1.type = this.carrierWaveform
      carrier1.frequency.setValueAtTime(baseFrequency, now)

      modulator1.type = this.modulatorWaveform
      modulator1.frequency.setValueAtTime(baseFrequency * this.modulatorRatio, now)

      // Set modulation depth
      modulationGain1.gain.setValueAtTime(this.modulationIndex, now)

      // Connect first FM pair
      modulator1.connect(modulationGain1)
      modulationGain1.connect(carrier1.frequency)
      carrier1.connect(carrierGain1)
      carrierGain1.connect(masterGain)

      // Set carrier gain (half volume since we have two carriers)
      carrierGain1.gain.setValueAtTime(0.5, now)

      oscillators.push(carrier1, modulator1)
      gainNodes.push(modulationGain1, carrierGain1)

      // Create second FM pair (half-step higher)
      const carrier2 = this.audioContext.createOscillator()
      const modulator2 = this.audioContext.createOscillator()
      const modulationGain2 = this.audioContext.createGain()
      const carrierGain2 = this.audioContext.createGain()

      carrier2.type = this.carrierWaveform
      carrier2.frequency.setValueAtTime(secondFrequency, now)

      modulator2.type = this.modulatorWaveform
      modulator2.frequency.setValueAtTime(secondFrequency * this.modulatorRatio, now)

      // Set modulation depth
      modulationGain2.gain.setValueAtTime(this.modulationIndex, now)

      // Connect second FM pair
      modulator2.connect(modulationGain2)
      modulationGain2.connect(carrier2.frequency)
      carrier2.connect(carrierGain2)
      carrierGain2.connect(masterGain)

      // Set carrier gain (half volume since we have two carriers)
      carrierGain2.gain.setValueAtTime(0.5, now)

      oscillators.push(carrier2, modulator2)
      gainNodes.push(modulationGain2, carrierGain2)

      // ADSR Envelope - Attack
      const targetVolume = this.masterVolume
      masterGain.gain.linearRampToValueAtTime(targetVolume, now + this.attack)

      // Start all oscillators
      oscillators.forEach((osc) => {
        osc.start(now)
      })

      // Create stop callback
      const stopCallback = () => {
        if (!this.audioContext) return

        const stopTime = this.audioContext.currentTime

        // ADSR Envelope - Release
        masterGain.gain.cancelScheduledValues(stopTime)
        masterGain.gain.setValueAtTime(masterGain.gain.value, stopTime)
        masterGain.gain.exponentialRampToValueAtTime(0.001, stopTime + this.release)

        // Stop all oscillators after release
        oscillators.forEach((osc) => {
          try {
            osc.stop(stopTime + this.release)
          } catch (e) {
            // Oscillator might already be stopped
          }
        })

        console.log(`Stopped note: ${key}`)
      }

      // Store active note
      this.activeNotes.set(key, {
        oscillators,
        gainNodes,
        stopCallback,
      })

      // Trigger note callback with base frequency
      if (this.noteCallback) {
        this.noteCallback(baseFrequency, true)
      }

      console.log(`Successfully started note ${key} at ${baseFrequency}Hz and ${secondFrequency}Hz`)
    } catch (error) {
      console.error(`Error creating note ${key}:`, error)

      // Cleanup on error
      oscillators.forEach((osc) => {
        try {
          osc.stop()
        } catch (e) {
          // Ignore cleanup errors
        }
      })
    }
  }

  async stopNote(key: string) {
    await this.ensureAudioContext()
    if (!this.audioContext) return

    const note = this.activeNotes.get(key)
    if (!note) {
      console.log(`Note ${key} not found in active notes`)
      return
    }

    console.log(`Stopping note: ${key}`)

    // Execute stop callback
    note.stopCallback()

    // Remove from active notes
    this.activeNotes.delete(key)

    // Trigger note callback
    if (this.noteCallback) {
      this.noteCallback(this.keyToFrequency(key), false)
    }
  }

  // Test function to play a simple tone
  async playTestTone() {
    await this.ensureAudioContext()
    if (!this.audioContext) {
      console.warn("No audio context for test tone")
      return
    }

    console.log("Playing test tone...")

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(440, now) // A4
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1)

    oscillator.start(now)
    oscillator.stop(now + 1)

    console.log("Test tone should be playing...")
  }

  // Setters for real-time parameter control
  setModulationIndex(value: number) {
    this.modulationIndex = value
  }

  setModulatorRatio(value: number) {
    this.modulatorRatio = value
  }

  setCarrierWaveform(waveform: OscillatorType) {
    this.carrierWaveform = waveform
  }

  setModulatorWaveform(waveform: OscillatorType) {
    this.modulatorWaveform = waveform
  }

  setAttack(value: number) {
    this.attack = value
  }

  setDecay(value: number) {
    this.decay = value
  }

  setSustain(value: number) {
    this.sustain = value
  }

  setRelease(value: number) {
    this.release = value
  }

  setMasterVolume(value: number) {
    this.masterVolume = value
  }

  setNoteCallback(callback: (frequency: number, isPlaying: boolean) => void) {
    this.noteCallback = callback
  }

  // Debug function
  getAudioContextState() {
    return {
      state: this.audioContext?.state,
      sampleRate: this.audioContext?.sampleRate,
      activeNotes: this.activeNotes.size,
    }
  }
}
