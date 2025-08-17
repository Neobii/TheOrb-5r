"use client"

import { useState, useRef, useEffect } from "react"
import { SimpleAudioEngine } from "@/lib/audio/SimpleAudioEngine"

interface AudioTestPanelProps {
  showPanel: boolean
  setShowPanel: (show: boolean) => void
}

export default function AudioTestPanel({ showPanel, setShowPanel }: AudioTestPanelProps) {
  const [audioStatus, setAudioStatus] = useState({ initialized: false, contextState: "none", activeNotes: 0 })
  const [testResults, setTestResults] = useState<string[]>([])
  const audioEngineRef = useRef<SimpleAudioEngine | null>(null)

  useEffect(() => {
    audioEngineRef.current = new SimpleAudioEngine()
  }, [])

  const addTestResult = (message: string) => {
    setTestResults((prev) => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const updateStatus = () => {
    if (audioEngineRef.current) {
      setAudioStatus(audioEngineRef.current.getStatus())
    }
  }

  const handleInitialize = async () => {
    if (!audioEngineRef.current) return

    addTestResult("Initializing audio...")
    const success = await audioEngineRef.current.initialize()

    if (success) {
      addTestResult("✅ Audio initialized successfully!")
    } else {
      addTestResult("❌ Audio initialization failed")
    }

    updateStatus()
  }

  const handleTestBeep = async () => {
    if (!audioEngineRef.current) return

    addTestResult("Playing test beep...")
    const success = await audioEngineRef.current.playTestBeep()

    if (success) {
      addTestResult("✅ Test beep played!")
    } else {
      addTestResult("❌ Test beep failed")
    }

    updateStatus()
  }

  const handleTestNote = async (key: string) => {
    if (!audioEngineRef.current) return

    addTestResult(`Playing note ${key}...`)
    const success = await audioEngineRef.current.playNote(key)

    if (success) {
      addTestResult(`✅ Note ${key} playing`)
      // Stop after 1 second
      setTimeout(() => {
        audioEngineRef.current?.stopNote(key)
        addTestResult(`🔇 Note ${key} stopped`)
        updateStatus()
      }, 1000)
    } else {
      addTestResult(`❌ Note ${key} failed`)
    }

    updateStatus()
  }

  const handleTestDrum = async (drum: string) => {
    if (!audioEngineRef.current) return

    addTestResult(`Playing ${drum}...`)

    try {
      if (drum === "kick") await audioEngineRef.current.playKick()
      else if (drum === "snare") await audioEngineRef.current.playSnare()
      else if (drum === "hihat") await audioEngineRef.current.playHiHat()

      addTestResult(`✅ ${drum} played!`)
    } catch (error) {
      addTestResult(`❌ ${drum} failed`)
    }

    updateStatus()
  }

  const handleStopAll = () => {
    if (!audioEngineRef.current) return

    audioEngineRef.current.stopAllNotes()
    addTestResult("🔇 All notes stopped")
    updateStatus()
  }

  useEffect(() => {
    const interval = setInterval(updateStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!showPanel) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90">
      <div className="bg-gray-900 rounded-lg p-6 shadow-2xl max-w-4xl w-full mx-4 border-2 border-green-400 shadow-green-400/50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-green-400 text-2xl font-bold font-mono">🔧 AUDIO DIAGNOSTIC PANEL</h2>
          <button
            onClick={() => setShowPanel(false)}
            className="bg-red-500 hover:bg-red-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors shadow-lg shadow-red-500/50"
          >
            ×
          </button>
        </div>

        {/* Status Display */}
        <div className="mb-6 p-4 bg-black rounded border border-cyan-400">
          <h3 className="text-cyan-400 font-mono font-bold mb-3">📊 AUDIO STATUS</h3>
          <div className="grid grid-cols-3 gap-4 text-sm font-mono">
            <div>
              <span className="text-gray-400">Initialized:</span>
              <span className={`ml-2 ${audioStatus.initialized ? "text-green-400" : "text-red-400"}`}>
                {audioStatus.initialized ? "✅ YES" : "❌ NO"}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Context State:</span>
              <span className={`ml-2 ${audioStatus.contextState === "running" ? "text-green-400" : "text-yellow-400"}`}>
                {audioStatus.contextState.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Active Notes:</span>
              <span className="ml-2 text-cyan-400">{audioStatus.activeNotes}</span>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="mb-6 p-4 bg-black rounded border border-purple-400">
          <h3 className="text-purple-400 font-mono font-bold mb-3">📝 TEST RESULTS</h3>
          <div className="h-24 overflow-y-auto bg-gray-800 p-2 rounded text-xs font-mono">
            {testResults.length === 0 ? (
              <div className="text-gray-500">No tests run yet...</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-cyan-400 mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Basic Tests */}
        <div className="mb-6 p-4 bg-black rounded border border-yellow-400">
          <h3 className="text-yellow-400 font-mono font-bold mb-3">🧪 BASIC TESTS</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleInitialize}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded font-mono text-sm border border-blue-400 transition-colors"
            >
              1️⃣ INITIALIZE AUDIO
            </button>
            <button
              onClick={handleTestBeep}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black rounded font-mono text-sm border border-green-400 transition-colors"
            >
              2️⃣ TEST BEEP (440Hz)
            </button>
            <button
              onClick={handleStopAll}
              className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded font-mono text-sm border border-red-400 transition-colors"
            >
              🔇 STOP ALL
            </button>
          </div>
        </div>

        {/* Note Tests */}
        <div className="mb-6 p-4 bg-black rounded border border-magenta-400">
          <h3 className="text-magenta-400 font-mono font-bold mb-3">🎹 NOTE TESTS</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-400 text-sm font-mono mb-2 block">Bottom Row (C3-F#3):</span>
              <div className="flex gap-1 flex-wrap">
                {["z", "x", "c", "v", "b", "n", "m"].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleTestNote(key)}
                    className="px-3 py-1 bg-green-500 hover:bg-green-400 text-black rounded font-mono text-xs border border-green-400 transition-colors"
                  >
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-sm font-mono mb-2 block">Middle Row (G3-D#4):</span>
              <div className="flex gap-1 flex-wrap">
                {["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleTestNote(key)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded font-mono text-xs border border-blue-400 transition-colors"
                  >
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-sm font-mono mb-2 block">Top Row (E4-C#5):</span>
              <div className="flex gap-1 flex-wrap">
                {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleTestNote(key)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white rounded font-mono text-xs border border-red-400 transition-colors"
                  >
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Drum Tests */}
        <div className="p-4 bg-black rounded border border-orange-400">
          <h3 className="text-orange-400 font-mono font-bold mb-3">🥁 DRUM TESTS</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleTestDrum("kick")}
              className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded font-mono text-sm border border-red-400 transition-colors"
            >
              KICK
            </button>
            <button
              onClick={() => handleTestDrum("snare")}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded font-mono text-sm border border-blue-400 transition-colors"
            >
              SNARE
            </button>
            <button
              onClick={() => handleTestDrum("hihat")}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded font-mono text-sm border border-yellow-400 transition-colors"
            >
              HI-HAT
            </button>
          </div>
        </div>

        <div className="text-center text-cyan-400 text-sm mt-4 font-mono">
          🔧 Use this panel to diagnose audio issues step by step! 🔧
        </div>
      </div>
    </div>
  )
}
