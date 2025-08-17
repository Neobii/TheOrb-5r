"use client"

import type React from "react"
import * as THREE from "three"
import { useEffect, useRef, useState } from "react"

// Import separated components and classes
import { OrbitControls } from "@/lib/controls/OrbitControls"
import { RetroSoundGenerator } from "@/lib/audio/RetroSoundGenerator"
import { FMSynth } from "@/lib/audio/FMSynth"
import { BeatMachine } from "@/lib/audio/BeatMachine"
import { TetrisShapeGenerator, type TetrisShape } from "@/lib/3d/TetrisShapes"
import FMSynthOverlay from "@/components/ui/FMSynthOverlay"
import BeatMachineOverlay from "@/components/ui/BeatMachineOverlay"
import VideoOverlay from "@/components/ui/VideoOverlay"
import VideoInputForm from "@/components/ui/VideoInputForm"
import ControlButtons from "@/components/ui/ControlButtons"
import AudioTestPanel from "@/components/ui/AudioTestPanel"
import { SimpleAudioEngine } from "@/lib/audio/SimpleAudioEngine"

// Import shaders
// import { glowVertexShader, glowFragmentShader } from "@/lib/shaders/glowShader"

export default function Cube() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [showHint, setShowHint] = useState(true)
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [showBeatMachine, setShowBeatMachine] = useState(false)
  const [showSynth, setShowSynth] = useState(false)
  const [videos, setVideos] = useState<string[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isSpherical, setIsSpherical] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [bpm, setBpm] = useState(120)
  const [masterVolume, setMasterVolume] = useState(0.7)
  const [nesVerticalOffset, setNesVerticalOffset] = useState(0)
  const [showAudioTest, setShowAudioTest] = useState(false)

  // FM Synth parameters
  const [synthParams, setSynthParams] = useState({
    modulationIndex: 100,
    modulatorRatio: 2,
    carrierWaveform: "sine" as OscillatorType,
    modulatorWaveform: "sine" as OscillatorType,
    attack: 0.1,
    decay: 0.3,
    sustain: 0.7,
    release: 0.5,
    volume: 0.3,
  })

  // Beat patterns - 16 steps for each drum
  const [patterns, setPatterns] = useState({
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hihat: Array(16).fill(false),
    openhat: Array(16).fill(false),
    clap: Array(16).fill(false),
  })

  const mousePixelsRef = useRef<THREE.Mesh[]>([])
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const soundGeneratorRef = useRef<RetroSoundGenerator | null>(null)
  const beatMachineRef = useRef<BeatMachine | null>(null)
  const fmSynthRef = useRef<FMSynth | null>(null)
  const tetrisShapesRef = useRef<TetrisShape[]>([])
  const tetrisGeneratorRef = useRef<TetrisShapeGenerator | null>(null)
  const simpleAudioRef = useRef<SimpleAudioEngine | null>(null)

  // Initialize sound generators
  useEffect(() => {
    soundGeneratorRef.current = new RetroSoundGenerator()
    beatMachineRef.current = new BeatMachine()
    fmSynthRef.current = new FMSynth()

    // Initialize simple audio engine
    simpleAudioRef.current = new SimpleAudioEngine()

    // Set up NES position callback for FM synth
    if (fmSynthRef.current) {
      fmSynthRef.current.setNoteCallback((frequency, isPlaying) => {
        if (isPlaying) {
          // Move NES up or down based on frequency
          // Higher frequencies move up, lower frequencies move down
          const baseFrequency = 220 // A3 reference (middle of our range)
          const direction = frequency > baseFrequency ? -1 : 1 // Negative = up, positive = down
          setNesVerticalOffset((prev) => {
            const newOffset = prev + direction * 20 // Reduced from 50 to 20
            // Much tighter range to keep NES in view
            return Math.max(-30, Math.min(30, newOffset)) // Changed from -200,200 to -30,30
          })
        }
      })
    }

    if (beatMachineRef.current) {
      beatMachineRef.current.setStepCallback((step) => {
        setCurrentStep(step)

        // Only play sounds if beat machine is actually running
        if (beatMachineRef.current?.isRunning()) {
          // Play sounds based on patterns
          if (patterns.kick[step]) beatMachineRef.current?.playKick()
          if (patterns.snare[step]) beatMachineRef.current?.playSnare()
          if (patterns.hihat[step]) beatMachineRef.current?.playHiHat()
          if (patterns.openhat[step]) beatMachineRef.current?.playOpenHat()
          if (patterns.clap[step]) beatMachineRef.current?.playClap()
        }
      })
    }

    // Cleanup function to stop beat machine when component unmounts
    return () => {
      if (beatMachineRef.current) {
        beatMachineRef.current.stop()
      }
    }
  }, [patterns])

  // Update FM Synth parameters when they change
  useEffect(() => {
    if (fmSynthRef.current) {
      fmSynthRef.current.setModulationIndex(synthParams.modulationIndex)
      fmSynthRef.current.setModulatorRatio(synthParams.modulatorRatio)
      fmSynthRef.current.setCarrierWaveform(synthParams.carrierWaveform)
      fmSynthRef.current.setModulatorWaveform(synthParams.modulatorWaveform)
      fmSynthRef.current.setAttack(synthParams.attack)
      fmSynthRef.current.setDecay(synthParams.decay)
      fmSynthRef.current.setSustain(synthParams.sustain)
      fmSynthRef.current.setRelease(synthParams.release)
      fmSynthRef.current.setMasterVolume(synthParams.volume)
    }
  }, [synthParams])

  const toggleStep = (drum: keyof typeof patterns, step: number) => {
    setPatterns((prev) => ({
      ...prev,
      [drum]: prev[drum].map((active, index) => (index === step ? !active : active)),
    }))
  }

  const clearPattern = (drum: keyof typeof patterns) => {
    setPatterns((prev) => ({
      ...prev,
      [drum]: Array(16).fill(false),
    }))
  }

  const clearAllPatterns = () => {
    setPatterns({
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      openhat: Array(16).fill(false),
      clap: Array(16).fill(false),
    })
  }

  const playPause = () => {
    if (beatMachineRef.current) {
      if (beatMachineRef.current.isRunning()) {
        beatMachineRef.current.stop()
        setCurrentStep(0) // Reset step indicator
      } else {
        beatMachineRef.current.play()
      }
    }
  }

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm)
    if (beatMachineRef.current) {
      beatMachineRef.current.setBPM(newBpm)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setMasterVolume(newVolume)
    if (beatMachineRef.current) {
      beatMachineRef.current.setMasterVolume(newVolume)
    }
  }

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input1 = form.elements.namedItem("videoUrl1") as HTMLInputElement
    const input2 = form.elements.namedItem("videoUrl2") as HTMLInputElement

    const url1 = input1.value.trim()
    const url2 = input2.value.trim()

    if (!url1 || !url2) {
      alert("Please enter both video URLs")
      return
    }

    setVideos([url1, url2])
    setCurrentVideoIndex(0)
    setIsVideoPlaying(true)
    setShowVideoInput(false)
  }

  const closeVideo = () => {
    setIsVideoPlaying(false)
    setVideos([])
    setCurrentVideoIndex(0)
  }

  const nextVideo = () => {
    if (videos.length > 1) {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
    }
  }

  const prevVideo = () => {
    if (videos.length > 1) {
      setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length)
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    // Simple normalized coordinates
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = -(event.clientY / window.innerHeight) * 2 + 1
    setMousePosition({ x, y })
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length > 0) {
      const touch = event.touches[0]
      const x = (touch.clientX / window.innerWidth) * 2 - 1
      const y = -(touch.clientY / window.innerHeight) * 2 + 1
      setMousePosition({ x, y })
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    if (soundGeneratorRef.current && !soundEnabled) {
      soundGeneratorRef.current.playButtonSound()
    }
  }

  const loadPreset = (presetName: string) => {
    const presets = {
      basic: {
        kick: [
          true,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
        ],
        snare: [
          false,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
        ],
        hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        openhat: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
        ],
        clap: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
      },
      house: {
        kick: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        snare: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        openhat: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        clap: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
      },
      breakbeat: {
        kick: [
          true,
          false,
          true,
          false,
          false,
          false,
          true,
          false,
          true,
          false,
          false,
          false,
          true,
          true,
          false,
          false,
        ],
        snare: [
          false,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
        ],
        hihat: [true, false, false, true, true, false, true, false, true, false, false, true, true, false, true, false],
        openhat: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        clap: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
      },
      techno: {
        kick: [
          true,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
        ],
        snare: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        hihat: [
          false,
          false,
          true,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          true,
          false,
        ],
        openhat: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        clap: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
      },
    }

    setPatterns(presets[presetName as keyof typeof presets])
  }

  // Main 3D scene effect
  useEffect(() => {
    if (!mountRef.current) return

    // Create scene, camera, and renderer
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 50, 200)

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create VERY VISIBLE neon line starfield
    const starLines: THREE.Line[] = []
    const starsCount = 500

    for (let i = 0; i < starsCount; i++) {
      const points = []

      // Create lines much closer to the camera
      const startX = (Math.random() - 0.5) * 200
      const startY = (Math.random() - 0.5) * 200
      const startZ = (Math.random() - 0.5) * 200

      // Create much longer, more visible line segments
      const lineLength = Math.random() * 15 + 10 // 10-25 units long
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ).normalize()

      points.push(new THREE.Vector3(startX, startY, startZ))
      points.push(
        new THREE.Vector3(
          startX + direction.x * lineLength,
          startY + direction.y * lineLength,
          startZ + direction.z * lineLength,
        ),
      )

      const geometry = new THREE.BufferGeometry().setFromPoints(points)

      // SUPER BRIGHT neon colors
      const neonColors = [
        new THREE.Color(0x00ffff).multiplyScalar(2), // Super Bright Cyan
        new THREE.Color(0xff00ff).multiplyScalar(2), // Super Bright Magenta
        new THREE.Color(0x00ff00).multiplyScalar(2), // Super Bright Green
        new THREE.Color(0xffff00).multiplyScalar(2), // Super Bright Yellow
        new THREE.Color(0xff0080).multiplyScalar(2), // Super Bright Hot Pink
        new THREE.Color(0x8000ff).multiplyScalar(2), // Super Bright Purple
        new THREE.Color(0xff4000).multiplyScalar(2), // Super Bright Orange
        new THREE.Color(0xffffff), // Pure White
      ]
      const colorChoice = neonColors[Math.floor(Math.random() * neonColors.length)]

      const material = new THREE.LineBasicMaterial({
        color: colorChoice,
        transparent: false, // No transparency for maximum visibility
        opacity: 1.0,
      })

      const line = new THREE.Line(geometry, material)
      starLines.push(line)
      scene.add(line)

      // Add a second glow line for each star line
      const glowMaterial = new THREE.LineBasicMaterial({
        color: colorChoice,
        transparent: true,
        opacity: 0.5,
      })
      const glowLine = new THREE.Line(geometry.clone(), glowMaterial)
      glowLine.scale.setScalar(1.5)
      scene.add(glowLine)
      starLines.push(glowLine)
    }

    // Create flowing parallel neon lines
    const parallelLines: THREE.Line[] = []
    const numLines = 25
    const lineSpacing = 4
    const lineLength = 120

    for (let i = 0; i < numLines; i++) {
      const points = []
      const segments = 300

      // Create straight parallel lines with flowing wave motion
      for (let j = 0; j <= segments; j++) {
        const t = j / segments
        const x = (t - 0.5) * lineLength
        const y = (i - numLines / 2) * lineSpacing

        // Add flowing wave motion along Z axis only
        const z = Math.sin(t * Math.PI * 6 + i * 0.3) * 5 + Math.cos(t * Math.PI * 10 + i * 0.5) * 3

        points.push(new THREE.Vector3(x, y, z))
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points)

      // Create flowing neon material
      const neonColor = new THREE.Color().setHSL(i / numLines, 1.0, 0.6)
      const material = new THREE.LineBasicMaterial({
        color: neonColor,
        transparent: true,
        opacity: 1.0,
      })

      const line = new THREE.Line(geometry, material)
      line.position.z = -15
      parallelLines.push(line)
      scene.add(line)

      // Add glow effect
      const glowMaterial = new THREE.LineBasicMaterial({
        color: neonColor,
        transparent: true,
        opacity: 0.4,
      })
      const glowLine = new THREE.Line(geometry.clone(), glowMaterial)
      glowLine.position.copy(line.position)
      glowLine.scale.setScalar(1.3)
      scene.add(glowLine)
      parallelLines.push(glowLine)
    }

    // Create second set of parallel lines perpendicular to the first
    const perpendicularLines: THREE.Line[] = []

    for (let i = 0; i < numLines; i++) {
      const points = []
      const segments = 300

      // Create perpendicular parallel lines
      for (let j = 0; j <= segments; j++) {
        const t = j / segments
        const x = (i - numLines / 2) * lineSpacing
        const y = (t - 0.5) * lineLength

        // Add flowing wave motion along Z axis only
        const z = Math.sin(t * Math.PI * 7 + i * 0.4) * 4 + Math.cos(t * Math.PI * 11 + i * 0.6) * 2

        points.push(new THREE.Vector3(x, y, z))
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points)

      // Create flowing neon material
      const neonColor = new THREE.Color().setHSL((i + 0.5) / numLines, 1.0, 0.6)
      const material = new THREE.LineBasicMaterial({
        color: neonColor,
        transparent: true,
        opacity: 1.0,
      })

      const line = new THREE.Line(geometry, material)
      line.position.z = -25
      perpendicularLines.push(line)
      scene.add(line)

      // Add glow effect
      const glowMaterial = new THREE.LineBasicMaterial({
        color: neonColor,
        transparent: true,
        opacity: 0.4,
      })
      const glowLine = new THREE.Line(geometry.clone(), glowMaterial)
      glowLine.position.copy(line.position)
      glowLine.scale.setScalar(1.3)
      scene.add(glowLine)
      perpendicularLines.push(glowLine)
    }

    // Create white square pixels that follow the mouse/touch
    const mousePixels: THREE.Mesh[] = []
    const numPixels = 15
    const pixelGeometry = new THREE.PlaneGeometry(0.8, 0.8) // Made bigger for visibility
    const pixelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    })

    for (let i = 0; i < numPixels; i++) {
      const pixel = new THREE.Mesh(pixelGeometry, pixelMaterial.clone())
      pixel.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 10 + 5)
      mousePixels.push(pixel)
      scene.add(pixel)
    }
    mousePixelsRef.current = mousePixels

    // Create NES Console and Cartridge Animation
    const nesGroup = new THREE.Group()

    // NES Console Base - position it more centered
    const consoleGeometry = new THREE.BoxGeometry(12, 3, 8)
    const consoleMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d4, // Light gray
      metalness: 0.1,
      roughness: 0.8,
    })
    const nesConsole = new THREE.Mesh(consoleGeometry, consoleMaterial)
    nesConsole.position.set(0, -5, 0) // Changed from -8 to -5 to be more centered

    // NES Console Front Panel (darker gray) - adjust accordingly
    const frontPanelGeometry = new THREE.BoxGeometry(12.1, 2, 0.5)
    const frontPanelMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a8a8a,
      metalness: 0.1,
      roughness: 0.9,
    })
    const frontPanel = new THREE.Mesh(frontPanelGeometry, frontPanelMaterial)
    frontPanel.position.set(0, -5.5, 4.25) // Changed from -8.5 to -5.5

    // Cartridge Slot (black opening) - adjust accordingly
    const slotGeometry = new THREE.BoxGeometry(8, 0.8, 0.6)
    const slotMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
    })
    const cartridgeSlot = new THREE.Mesh(slotGeometry, slotMaterial)
    cartridgeSlot.position.set(0, -4.5, 4.5) // Changed from -7.5 to -4.5

    // Power Button (red) - adjust accordingly
    const powerButtonGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8)
    const powerButtonMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0x330000,
    })
    const powerButton = new THREE.Mesh(powerButtonGeometry, powerButtonMaterial)
    powerButton.rotation.x = Math.PI / 2
    powerButton.position.set(-3, -5.5, 4.3) // Changed from -8.5 to -5.5

    // Reset Button (red) - adjust accordingly
    const resetButton = new THREE.Mesh(powerButtonGeometry, powerButtonMaterial)
    resetButton.rotation.x = Math.PI / 2
    resetButton.position.set(-1, -5.5, 4.3) // Changed from -8.5 to -5.5

    // NES Cartridge
    const cartridgeGeometry = new THREE.BoxGeometry(7, 1.2, 4)
    const cartridgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666, // Dark gray
      metalness: 0.2,
      roughness: 0.7,
    })
    const nesCartridge = new THREE.Mesh(cartridgeGeometry, cartridgeMaterial)

    // Cartridge Label (white/light gray)
    const labelGeometry = new THREE.BoxGeometry(6, 0.01, 3)
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
    })
    const cartridgeLabel = new THREE.Mesh(labelGeometry, labelMaterial)
    cartridgeLabel.position.set(0, 0.61, 0)

    // Add label text effect (using a simple colored rectangle)
    const textGeometry = new THREE.BoxGeometry(4, 0.02, 1.5)
    const textMaterial = new THREE.MeshStandardMaterial({
      color: 0x0066cc, // Blue text color
      emissive: 0x001122,
    })
    const labelText = new THREE.Mesh(textGeometry, textMaterial)
    labelText.position.set(0, 0.62, 0)

    // Assemble cartridge
    nesCartridge.add(cartridgeLabel)
    nesCartridge.add(labelText)

    // Set initial cartridge position (outside the console) - adjust accordingly
    nesCartridge.position.set(0, -4.5, 10) // Changed from -7.5 to -4.5
    nesCartridge.rotation.y = Math.PI // Face the right direction

    // Assemble NES group
    nesGroup.add(nesConsole)
    nesGroup.add(frontPanel)
    nesGroup.add(cartridgeSlot)
    nesGroup.add(powerButton)
    nesGroup.add(resetButton)
    nesGroup.add(nesCartridge)

    // Position the entire NES setup
    nesGroup.position.set(0, nesVerticalOffset, 0)
    scene.add(nesGroup)

    // Create Tetris Shapes
    tetrisGeneratorRef.current = new TetrisShapeGenerator()
    const tetrisShapes: TetrisShape[] = []
    const numTetrisShapes = 12 // Number of tetris pieces floating around

    for (let i = 0; i < numTetrisShapes; i++) {
      const shape = tetrisGeneratorRef.current.createRandomShape()

      // Position shapes randomly in 3D space
      tetrisGeneratorRef.current.positionShapeRandomly(shape, {
        x: 100, // X bounds
        y: 60, // Y bounds
        z: 80, // Z bounds
      })

      tetrisShapes.push(shape)
      scene.add(shape.mesh)
    }

    tetrisShapesRef.current = tetrisShapes

    // Create EPIC Animated Eye in Center Stage
    const eyeGroup = new THREE.Group()

    // Create eye socket/rim (dark metallic ring)
    const eyeSocketGeometry = new THREE.TorusGeometry(12, 2, 16, 100)
    const eyeSocketMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x111111,
    })
    const eyeSocket = new THREE.Mesh(eyeSocketGeometry, eyeSocketMaterial)
    eyeSocket.rotation.x = Math.PI / 2

    // Main eyeball (larger, more detailed)
    const eyeballGeometry = new THREE.SphereGeometry(10, 64, 64)
    const eyeballMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8f8f8,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.95,
    })
    const eyeball = new THREE.Mesh(eyeballGeometry, eyeballMaterial)

    // Iris with detailed texture-like appearance
    const irisGeometry = new THREE.SphereGeometry(6, 64, 64)
    const irisMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x004444,
      metalness: 0.3,
      roughness: 0.6,
      transparent: true,
      opacity: 0.9,
    })
    const iris = new THREE.Mesh(irisGeometry, irisMaterial)
    iris.position.z = 2

    // Pupil (deep black hole effect)
    const pupilGeometry = new THREE.SphereGeometry(3, 32, 32)
    const pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 1.0,
      roughness: 0.0,
      emissive: 0x000000,
    })
    const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial)
    pupil.position.z = 4

    // Inner pupil glow (creates depth)
    const innerGlowGeometry = new THREE.SphereGeometry(2.5, 32, 32)
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8,
    })
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial)
    innerGlow.position.z = 4.5

    // Iris detail rings (for more realistic look)
    const irisRings = []
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(3 + i * 0.8, 3.2 + i * 0.8, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.5 + i * 0.1, 0.8, 0.3),
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.position.z = 2.5
      irisRings.push(ring)
      iris.add(ring)
    }

    // Cornea reflection (realistic eye shine)
    const corneaGeometry = new THREE.SphereGeometry(10.2, 32, 32)
    const corneaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.9,
      transparent: true,
      opacity: 0.1,
      ior: 1.4, // Index of refraction for realistic glass effect
    })
    const cornea = new THREE.Mesh(corneaGeometry, corneaMaterial)

    // Eye highlight (bright reflection spot)
    const highlightGeometry = new THREE.SphereGeometry(1.5, 16, 16)
    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    })
    const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial)
    highlight.position.set(-3, 3, 8)

    // Outer glow effect (much more dramatic)
    const outerGlowGeometry = new THREE.SphereGeometry(15, 32, 32)
    const outerGlowMaterial = new THREE.ShaderMaterial({
      vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
      fragmentShader: `
    uniform vec3 glowColor;
    uniform float intensity;
    uniform float power;
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    void main() {
      float glow = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
      float fresnel = pow(1.0 - dot(vNormal, vPositionNormal), 2.0);
      float finalGlow = glow * fresnel * intensity;
      gl_FragColor = vec4(glowColor, finalGlow);
    }
  `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      uniforms: {
        glowColor: { value: new THREE.Color(0x00ffff) },
        intensity: { value: 1.2 },
        power: { value: 2.0 },
      },
    })
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial)

    // Eyelids (top and bottom)
    const eyelidTopGeometry = new THREE.SphereGeometry(11, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.3)
    const eyelidBottomGeometry = new THREE.SphereGeometry(11, 32, 16, 0, Math.PI * 2, Math.PI * 0.7, Math.PI * 0.3)
    const eyelidMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.2,
      roughness: 0.8,
      emissive: 0x111111,
    })
    const eyelidTop = new THREE.Mesh(eyelidTopGeometry, eyelidMaterial)
    const eyelidBottom = new THREE.Mesh(eyelidBottomGeometry, eyelidMaterial)

    // Assemble the epic eye
    eyeGroup.add(eyeSocket)
    eyeGroup.add(eyeball)
    eyeGroup.add(iris)
    eyeGroup.add(pupil)
    eyeGroup.add(innerGlow)
    eyeGroup.add(cornea)
    eyeGroup.add(highlight)
    eyeGroup.add(outerGlow)
    eyeGroup.add(eyelidTop)
    eyeGroup.add(eyelidBottom)

    // Position the eye at center stage
    eyeGroup.position.set(0, 0, -5)
    scene.add(eyeGroup)

    // Animation state for cartridge
    let cartridgeAnimationTime = 0
    const cartridgeAnimationDuration = 4 // 4 seconds for full cycle
    let cartridgeDirection = 1 // 1 for inserting, -1 for ejecting
    const lastSoundTrigger = { insertion: false, powerOn: false, ejection: false }

    // Create chrome/metallic shape with environment mapping
    const shapeGeometry = isSpherical ? new THREE.SphereGeometry(7, 32, 32) : new THREE.BoxGeometry(10, 10, 10)

    // Create chrome material
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.1,
      envMapIntensity: 2.0,
    })

    const chromeShape = new THREE.Mesh(shapeGeometry, chromeMaterial)
    chromeShape.castShadow = true
    chromeShape.receiveShadow = true
    chromeShape.position.set(25, 0, 0)
    scene.add(chromeShape)

    // Create neon wireframe overlay
    const wireframeGeometry = isSpherical
      ? new THREE.WireframeGeometry(shapeGeometry)
      : new THREE.EdgesGeometry(shapeGeometry)
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 1.0,
    })
    const wireframeShape = isSpherical
      ? new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
      : new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
    wireframeShape.position.set(25, 0, 0)
    scene.add(wireframeShape)

    // Create neon glow around the shape
    const glowGeometry = isSpherical ? new THREE.SphereGeometry(8.5, 32, 32) : new THREE.BoxGeometry(12, 12, 12)
    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
      fragmentShader: `
    uniform vec3 glowColor;
    uniform float intensity;
    varying vec3 vNormal;
    void main() {
      float glow = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      gl_FragColor = vec4(glowColor, glow * intensity);
    }
  `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      uniforms: {
        glowColor: { value: new THREE.Color(0x00ffff) },
        intensity: { value: 0.8 },
      },
    })
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    glowMesh.position.set(25, 0, 0)
    scene.add(glowMesh)

    // Enhanced lighting for chrome effect
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)

    // Multiple colored lights for neon effect
    const neonLights = []
    const lightColors = [0x00ffff, 0xff00ff, 0x00ff00, 0xffff00, 0xff0080]

    for (let i = 0; i < 5; i++) {
      const light = new THREE.PointLight(lightColors[i], 2, 100)
      const angle = (i / 5) * Math.PI * 2
      light.position.set(Math.cos(angle) * 30, Math.sin(angle) * 30, 20)
      light.castShadow = true
      neonLights.push(light)
      scene.add(light)
    }

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    camera.position.set(0, 0, 50)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.enableZoom = false

    // Neon color palette
    const neonColors = [
      new THREE.Color(0x00ffff), // Bright Cyan
      new THREE.Color(0xff00ff), // Bright Magenta
      new THREE.Color(0x00ff00), // Bright Green
      new THREE.Color(0xffff00), // Bright Yellow
      new THREE.Color(0xff0080), // Bright Hot Pink
      new THREE.Color(0x8000ff), // Bright Purple
      new THREE.Color(0xff4000), // Bright Orange
      new THREE.Color(0xffffff), // Pure White
    ]
    let colorIndex = 0
    let nextColorIndex = 1
    let colorT = 0
    const colorTransitionSpeed = 0.02

    const lerpColor = (a: THREE.Color, b: THREE.Color, t: number) => {
      const color = new THREE.Color()
      color.r = a.r + (b.r - a.r) * t
      color.g = a.g + (b.g - a.g) * t
      color.b = a.b + (b.b - a.b) * t
      return color
    }

    let animationId: number

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const time = Date.now() * 0.001

      // Color transition logic
      colorT += colorTransitionSpeed
      if (colorT >= 1) {
        colorT = 0
        colorIndex = nextColorIndex
        nextColorIndex = (nextColorIndex + 1) % neonColors.length
      }

      const currentColor = lerpColor(neonColors[colorIndex], neonColors[nextColorIndex], colorT)

      // Update wireframe and glow colors
      wireframeMaterial.color = currentColor
      if (glowMesh.material instanceof THREE.ShaderMaterial) {
        glowMesh.material.uniforms.glowColor.value = currentColor
      }

      // Rotate the shape slowly on X axis only
      const rotationSpeed = (Math.PI * 2) / 30 // 30 seconds for full rotation
      chromeShape.rotation.x = time * rotationSpeed
      chromeShape.rotation.y = 0 // Keep Y rotation at 0
      wireframeShape.rotation.copy(chromeShape.rotation)
      glowMesh.rotation.copy(chromeShape.rotation)

      // Animate neon lights
      neonLights.forEach((light, index) => {
        const angle = (index / neonLights.length) * Math.PI * 2 + time * 0.5
        light.position.x = Math.cos(angle) * 35
        light.position.y = Math.sin(angle) * 35
        light.position.z = Math.sin(time + index) * 15 + 10

        // Pulse intensity
        light.intensity = 1.5 + Math.sin(time * 3 + index) * 0.5
      })

      // Animate parallel lines with flowing wave effects
      parallelLines.forEach((line, index) => {
        if (index % 2 === 0) {
          // Main lines
          const lineIndex = index / 2

          // Update flowing wave pattern - keep lines parallel
          const positions = line.geometry.attributes.position.array as Float32Array
          const segments = 300

          for (let j = 0; j <= segments; j++) {
            const t = j / segments
            const waveOffset = time * 2 + lineIndex * 0.3
            const x = (t - 0.5) * lineLength
            const y = (lineIndex - numLines / 2) * lineSpacing

            // Only animate Z axis to keep lines parallel
            const z =
              Math.sin(t * Math.PI * 6 + lineIndex * 0.3 + waveOffset) * 5 +
              Math.cos(t * Math.PI * 10 + lineIndex * 0.5 + waveOffset * 1.2) * 3

            positions[j * 3] = x
            positions[j * 3 + 1] = y
            positions[j * 3 + 2] = z
          }

          line.geometry.attributes.position.needsUpdate = true

          // Animate neon color
          const hue = (time * 0.2 + lineIndex / numLines) % 1
          ;(line.material as THREE.LineBasicMaterial).color.setHSL(hue, 1.0, 0.7)
        } else {
          // Glow lines
          const mainLine = parallelLines[index - 1]
          line.geometry.copy(mainLine.geometry)
          ;(line.material as THREE.LineBasicMaterial).color.copy((mainLine.material as THREE.LineBasicMaterial).color)
        }
      })

      // Animate perpendicular parallel lines
      perpendicularLines.forEach((line, index) => {
        if (index % 2 === 0) {
          // Main lines
          const lineIndex = index / 2

          // Update flowing wave pattern - keep lines parallel
          const positions = line.geometry.attributes.position.array as Float32Array
          const segments = 300

          for (let j = 0; j <= segments; j++) {
            const t = j / segments
            const waveOffset = time * 1.8 + lineIndex * 0.4
            const x = (lineIndex - numLines / 2) * lineSpacing
            const y = (t - 0.5) * lineLength

            // Only animate Z axis to keep lines parallel
            const z =
              Math.sin(t * Math.PI * 7 + lineIndex * 0.4 + waveOffset) * 4 +
              Math.cos(t * Math.PI * 11 + lineIndex * 0.6 + waveOffset * 1.4) * 2

            positions[j * 3] = x
            positions[j * 3 + 1] = y
            positions[j * 3 + 2] = z
          }

          line.geometry.attributes.position.needsUpdate = true

          // Animate neon color
          const hue = (time * 0.15 + (lineIndex + 0.5) / numLines) % 1
          ;(line.material as THREE.LineBasicMaterial).color.setHSL(hue, 1.0, 0.7)
        } else {
          // Glow lines
          const mainLine = perpendicularLines[index - 1]
          line.geometry.copy(mainLine.geometry)
          ;(line.material as THREE.LineBasicMaterial).color.copy((mainLine.material as THREE.LineBasicMaterial).color)
        }
      })

      // Animate neon star lines - MAXIMUM VISIBILITY
      starLines.forEach((line, index) => {
        line.rotation.y += 0.002 + (index % 100) * 0.0001
        line.rotation.x += 0.0015 + (index % 50) * 0.00005
        line.rotation.z += 0.001

        // Super bright pulsing effect
        const material = line.material as THREE.LineBasicMaterial
        if (index % 2 === 0) {
          // Main lines - always bright
          material.opacity = 1.0
        } else {
          // Glow lines - pulsing
          material.opacity = 0.3 + Math.sin(time * 2 + index * 0.1) * 0.2
        }
      })

      // Animate mouse/touch-following pixels
      if (mousePixelsRef.current.length > 0) {
        // Convert mouse position directly to world coordinates with larger scale
        const targetX = mousePosition.x * 25 // Increased scale for more movement
        const targetY = mousePosition.y * 20 // Increased scale for more movement

        mousePixelsRef.current.forEach((pixel, index) => {
          // Create trailing effect with different speeds
          const speed = 0.2 + index * 0.03 // Increased speed for more responsiveness

          // Add some randomness and trailing for each pixel
          const offsetX = Math.sin(time + index) * 2 + (index - numPixels / 2) * 1.2
          const offsetY = Math.cos(time + index * 1.5) * 1.5 + Math.sin(index) * 0.8

          // Direct follow with easing
          pixel.position.x += (targetX + offsetX - pixel.position.x) * speed
          pixel.position.y += (targetY + offsetY - pixel.position.y) * speed

          // Keep pixels visible in front
          pixel.position.z = 25 + Math.sin(time * 2 + index * 0.5) * 3

          // Rotate pixels
          pixel.rotation.z = time + index * 0.3

          // Pulse opacity and make them brighter
          const material = pixel.material as THREE.MeshBasicMaterial
          material.opacity = 0.95 + Math.sin(time * 3 + index * 0.8) * 0.05
        })
      }

      // Animate NES Cartridge insertion/ejection with sound effects
      cartridgeAnimationTime += 0.016 * cartridgeDirection // ~60fps

      if (cartridgeAnimationTime >= cartridgeAnimationDuration) {
        cartridgeDirection = -1 // Start ejecting
        // Play ejection sound
        if (soundEnabled && soundGeneratorRef.current && !lastSoundTrigger.ejection) {
          soundGeneratorRef.current.playEjectionSound()
          lastSoundTrigger.ejection = true
          lastSoundTrigger.insertion = false
          lastSoundTrigger.powerOn = false
        }
      } else if (cartridgeAnimationTime <= 0) {
        cartridgeDirection = 1 // Start inserting
        cartridgeAnimationTime = 0
        lastSoundTrigger.ejection = false
      }

      // Smooth easing animation
      const progress = cartridgeAnimationTime / cartridgeAnimationDuration
      const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

      // Animate cartridge position (Z-axis movement into console)
      const startZ = 10 // Changed from 15
      const endZ = 1.5 // Changed from 6.5
      nesCartridge.position.z = startZ + (endZ - startZ) * easedProgress

      // Add slight bobbing motion
      nesCartridge.position.y = -4.5 + Math.sin(time * 2) * 0.1 // Changed from -7.5 to -4.5

      // Update NES group position based on synth input - keep it centered and visible
      nesGroup.position.set(0, nesVerticalOffset, 0) // Keep X and Z at 0 for center positioning

      // Sound triggers based on animation progress
      if (soundEnabled && soundGeneratorRef.current) {
        // Play insertion sound when cartridge starts moving in
        if (easedProgress > 0.1 && !lastSoundTrigger.insertion && cartridgeDirection === 1) {
          soundGeneratorRef.current.playInsertionSound()
          lastSoundTrigger.insertion = true
        }

        // Play power-on sound when cartridge is fully inserted
        if (easedProgress > 0.95 && !lastSoundTrigger.powerOn && cartridgeDirection === 1) {
          setTimeout(() => {
            if (soundEnabled && soundGeneratorRef.current) {
              soundGeneratorRef.current.playPowerOnSound()
            }
          }, 200) // Slight delay after insertion
          lastSoundTrigger.powerOn = true
        }
      }

      // Pulse the power button when cartridge is fully inserted
      if (easedProgress > 0.9) {
        powerButton.material.emissive.setHex(0x660000)
        resetButton.material.emissive.setHex(0x660000)
      } else {
        powerButton.material.emissive.setHex(0x330000)
        resetButton.material.emissive.setHex(0x330000)
      }

      // Add retro glow effect around NES when cartridge is inserted
      if (easedProgress > 0.8) {
        // Create pulsing neon glow around the console
        const glowIntensity = 0.5 + Math.sin(time * 4) * 0.3
        nesConsole.material.emissive.setRGB(0.1 * glowIntensity, 0.1 * glowIntensity, 0.3 * glowIntensity)
        frontPanel.material.emissive.setRGB(0.05 * glowIntensity, 0.05 * glowIntensity, 0.2 * glowIntensity)
      } else {
        nesConsole.material.emissive.setRGB(0, 0, 0)
        frontPanel.material.emissive.setRGB(0, 0, 0)
      }

      // Animate the EPIC Eye - Advanced realistic movements
      const eyeLookSpeed = 0.4
      const eyeBlinkSpeed = 0.8
      const microMovementSpeed = 2.0

      // Advanced eye tracking with micro-movements
      const primaryLookX = Math.sin(time * eyeLookSpeed) * 2.5
      const primaryLookY = Math.cos(time * eyeLookSpeed * 0.6) * 1.8
      const microLookX = Math.sin(time * microMovementSpeed) * 0.3
      const microLookY = Math.cos(time * microMovementSpeed * 1.3) * 0.2

      const finalLookX = primaryLookX + microLookX
      const finalLookY = primaryLookY + microLookY

      // Move iris, pupil, and inner components together
      iris.position.x = finalLookX
      iris.position.y = finalLookY
      pupil.position.x = finalLookX
      pupil.position.y = finalLookY
      innerGlow.position.x = finalLookX
      innerGlow.position.y = finalLookY

      // Highlight follows eye movement but with offset for realism
      highlight.position.x = -3 + finalLookX * 0.5
      highlight.position.y = 3 + finalLookY * 0.5

      // Advanced blinking with realistic eyelid movement
      const blinkCycle = Math.sin(time * eyeBlinkSpeed)
      const rapidBlink = Math.sin(time * eyeBlinkSpeed * 8) // Occasional rapid blinks
      const shouldBlink = blinkCycle < -0.7 || (rapidBlink < -0.9 && Math.random() < 0.01)

      if (shouldBlink) {
        // Realistic blink - eyelids close
        eyelidTop.rotation.x = -0.8
        eyelidBottom.rotation.x = 0.8
        eyelidTop.position.y = -2
        eyelidBottom.position.y = 2
      } else {
        // Eyes open
        eyelidTop.rotation.x = 0
        eyelidBottom.rotation.x = 0
        eyelidTop.position.y = 0
        eyelidBottom.position.y = 0
      }

      // Dynamic iris color that responds to scene
      const hueShift = (time * 0.3) % 1
      const saturation = 0.8 + Math.sin(time * 2) * 0.2
      const lightness = 0.4 + Math.sin(time * 1.5) * 0.2
      irisMaterial.color.setHSL(hueShift, saturation, lightness)
      irisMaterial.emissive.setHSL(hueShift, saturation * 0.5, lightness * 0.3)

      // Animate iris detail rings
      irisRings.forEach((ring, index) => {
        const ringMaterial = ring.material as THREE.MeshBasicMaterial
        const ringHue = (hueShift + index * 0.1) % 1
        ringMaterial.color.setHSL(ringHue, 0.9, 0.3 + Math.sin(time * 2 + index) * 0.1)
        ring.rotation.z = time * (0.5 + index * 0.2)
      })

      // Pupil dilation based on scene brightness
      const pupilSize = 2.8 + Math.sin(time * 0.8) * 0.4
      pupil.scale.setScalar(pupilSize / 3)
      innerGlow.scale.setScalar((pupilSize - 0.2) / 2.5)

      // Outer glow animation - much more dramatic
      if (outerGlow.material instanceof THREE.ShaderMaterial) {
        outerGlow.material.uniforms.glowColor.value.setHSL(hueShift, 1.0, 0.5)
        outerGlow.material.uniforms.intensity.value = 1.5 + Math.sin(time * 3) * 0.8
        outerGlow.material.uniforms.power.value = 1.5 + Math.sin(time * 2) * 0.5
      }

      // Eye socket glow
      eyeSocket.material.emissive.setHSL(hueShift, 0.8, 0.1 + Math.sin(time * 4) * 0.05)

      // Subtle eye rotation for life-like movement
      eyeGroup.rotation.z = Math.sin(time * 0.3) * 0.05
      eyeGroup.rotation.x = Math.cos(time * 0.25) * 0.03

      // Cornea refraction effect
      cornea.rotation.y = time * 0.1
      cornea.rotation.x = Math.sin(time * 0.4) * 0.1

      // Animate Tetris Shapes
      if (tetrisShapesRef.current.length > 0 && tetrisGeneratorRef.current) {
        tetrisShapesRef.current.forEach((shape) => {
          tetrisGeneratorRef.current!.animateShape(shape, time, {
            x: 100,
            y: 60,
            z: 80,
          })
        })
      }

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    // Add both mouse and touch event listeners
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })

    // Add keyboard event listeners for FM Synth - ALL ALPHABETICAL KEYS!
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!simpleAudioRef.current || !soundEnabled) return

      // Prevent key repeat
      if (event.repeat) return

      const key = event.key.toLowerCase()
      console.log(`Key pressed: ${key}, Sound enabled: ${soundEnabled}`)

      // All alphabetical keys from A-Z
      const synthKeys = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
      ]

      if (synthKeys.includes(key)) {
        simpleAudioRef.current.playNote(key)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!simpleAudioRef.current || !soundEnabled) return

      const key = event.key.toLowerCase()
      console.log(`Key released: ${key}`)

      // All alphabetical keys from A-Z
      const synthKeys = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
      ]

      if (synthKeys.includes(key)) {
        simpleAudioRef.current.stopNote(key)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    const hintTimer = setTimeout(() => {
      setShowHint(false)
    }, 3000)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      cancelAnimationFrame(animationId)
      if (mountRef.current && rendererRef.current && rendererRef.current.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement)
      }
      controls.dispose()
      clearTimeout(hintTimer)
    }
  }, [isSpherical, soundEnabled, nesVerticalOffset])

  useEffect(() => {
    // This will trigger a re-render when isSpherical changes
  }, [isSpherical])

  return (
    <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 bg-black">
      {/* FM Synth Overlay */}
      <FMSynthOverlay
        showSynth={showSynth}
        setShowSynth={setShowSynth}
        synthParams={synthParams}
        setSynthParams={setSynthParams}
        fmSynthRef={fmSynthRef}
      />

      {/* Beat Machine Overlay */}
      <BeatMachineOverlay
        showBeatMachine={showBeatMachine}
        setShowBeatMachine={setShowBeatMachine}
        beatMachineRef={beatMachineRef}
        currentStep={currentStep}
        bpm={bpm}
        masterVolume={masterVolume}
        patterns={patterns}
        toggleStep={toggleStep}
        clearPattern={clearPattern}
        clearAllPatterns={clearAllPatterns}
        playPause={playPause}
        handleBpmChange={handleBpmChange}
        handleVolumeChange={handleVolumeChange}
        loadPreset={loadPreset}
      />

      {/* Video Player Overlay */}
      <VideoOverlay
        isVideoPlaying={isVideoPlaying}
        videos={videos}
        currentVideoIndex={currentVideoIndex}
        closeVideo={closeVideo}
        nextVideo={nextVideo}
        prevVideo={prevVideo}
      />

      {/* Video Input Form */}
      <VideoInputForm
        showVideoInput={showVideoInput}
        setShowVideoInput={setShowVideoInput}
        handleVideoSubmit={handleVideoSubmit}
      />

      {/* Audio Test Panel */}
      <AudioTestPanel showPanel={showAudioTest} setShowPanel={setShowAudioTest} />

      {/* Control Buttons */}
      <ControlButtons
        setShowVideoInput={setShowVideoInput}
        isSpherical={isSpherical}
        setIsSpherical={setIsSpherical}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        setShowBeatMachine={setShowBeatMachine}
        beatMachineRef={beatMachineRef}
        setShowSynth={setShowSynth}
        setShowAudioTest={setShowAudioTest}
      />

      {showHint && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-cyan-400 text-sm px-3 py-1 rounded-full transition-opacity duration-1000 opacity-80 hover:opacity-100 border border-cyan-400 font-mono">
          DRAG TO EXPLORE • MOVE MOUSE/TOUCH • RETRO SOUNDS! • BEAT MACHINE! • FM SYNTH: ALL A-Z KEYS MOVE NES!
        </div>
      )}
    </div>
  )
}
