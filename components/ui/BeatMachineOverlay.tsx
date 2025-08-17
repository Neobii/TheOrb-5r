"use client"

import type React from "react"
import type { BeatMachine } from "@/lib/audio/BeatMachine"
import type { patterns } from "@/lib/audio/patterns" // Declare the patterns variable

interface BeatMachineOverlayProps {
  showBeatMachine: boolean
  setShowBeatMachine: (show: boolean) => void
  beatMachineRef: React.RefObject<BeatMachine | null>
  currentStep: number
  bpm: number
  masterVolume: number
  patterns: {
    kick: boolean[]
    snare: boolean[]
    hihat: boolean[]
    openhat: boolean[]
    clap: boolean[]
  }
  toggleStep: (drum: keyof typeof patterns, step: number) => void
  clearPattern: (drum: keyof typeof patterns) => void
  clearAllPatterns: () => void
  playPause: () => void
  handleBpmChange: (bpm: number) => void
  handleVolumeChange: (volume: number) => void
  loadPreset: (preset: string) => void
}

export default function BeatMachineOverlay({
  showBeatMachine,
  setShowBeatMachine,
  beatMachineRef,
  currentStep,
  bpm,
  masterVolume,
  patterns,
  toggleStep,
  clearPattern,
  clearAllPatterns,
  playPause,
  handleBpmChange,
  handleVolumeChange,
  loadPreset,
}: BeatMachineOverlayProps) {
  if (!showBeatMachine) return null

  function getDrumColor(drumName: string) {
    switch (drumName) {
      case "kick":
        return "bg-red-500 border-red-400 text-white"
      case "snare":
        return "bg-blue-500 border-blue-400 text-white"
      case "hihat":
        return "bg-yellow-500 border-yellow-400 text-black"
      case "openhat":
        return "bg-orange-500 border-orange-400 text-white"
      case "clap":
        return "bg-purple-500 border-purple-400 text-white"
      default:
        return "bg-gray-500 border-gray-400 text-white"
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90">
      <div className="bg-gray-900 rounded-lg p-6 shadow-2xl max-w-6xl w-full mx-4 border-2 border-cyan-400 shadow-cyan-400/50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-cyan-400 text-2xl font-bold font-mono">🎵 NEON BEAT MACHINE</h2>
          <button
            onClick={() => setShowBeatMachine(false)}
            className="bg-red-500 hover:bg-red-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors shadow-lg shadow-red-500/50"
          >
            ×
          </button>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-black rounded border border-cyan-400">
          <button
            onClick={playPause}
            className={`px-6 py-2 rounded font-bold font-mono border-2 transition-colors ${
              beatMachineRef.current?.isRunning()
                ? "bg-red-500 hover:bg-red-400 text-white border-red-400 shadow-red-500/50"
                : "bg-green-500 hover:bg-green-400 text-black border-green-400 shadow-green-500/50"
            } shadow-lg`}
          >
            {beatMachineRef.current?.isRunning() ? "⏸️ STOP" : "▶️ PLAY"}
          </button>

          <div className="flex items-center gap-2">
            <label className="text-cyan-400 font-mono text-sm">BPM:</label>
            <input
              type="range"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => handleBpmChange(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-cyan-400 font-mono text-sm w-8">{bpm}</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-cyan-400 font-mono text-sm">VOL:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={masterVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-cyan-400 font-mono text-sm w-8">{Math.round(masterVolume * 100)}%</span>
          </div>

          <button
            onClick={clearAllPatterns}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded font-bold font-mono border-2 border-yellow-400 shadow-lg shadow-yellow-500/50 transition-colors"
          >
            🗑️ CLEAR ALL
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mb-4">
          <div className="flex gap-1">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-2 rounded ${
                  i === currentStep ? "bg-cyan-400 shadow-cyan-400/50 shadow-lg" : "bg-gray-700"
                } transition-all`}
              />
            ))}
          </div>
        </div>

        {/* Drum Patterns */}
        <div className="space-y-4">
          {Object.entries(patterns).map(([drumName, pattern]) => (
            <div key={drumName} className="p-4 bg-black rounded border border-magenta-400">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2 w-24">
                  <span className="text-magenta-400 font-mono font-bold text-sm uppercase">{drumName}</span>
                  <button
                    onClick={() => clearPattern(drumName as keyof typeof patterns)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-cyan-400 px-2 py-1 rounded font-mono border border-cyan-400 transition-colors"
                  >
                    CLR
                  </button>
                </div>

                {/* Test Sound Button */}
                <button
                  onClick={() => {
                    if (beatMachineRef.current) {
                      switch (drumName) {
                        case "kick":
                          beatMachineRef.current.playKick()
                          break
                        case "snare":
                          beatMachineRef.current.playSnare()
                          break
                        case "hihat":
                          beatMachineRef.current.playHiHat()
                          break
                        case "openhat":
                          beatMachineRef.current.playOpenHat()
                          break
                        case "clap":
                          beatMachineRef.current.playClap()
                          break
                      }
                    }
                  }}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black rounded font-mono font-bold text-xs border border-cyan-400 transition-colors"
                >
                  TEST
                </button>
              </div>

              {/* Step Grid */}
              <div className="flex gap-1">
                {pattern.map((active, stepIndex) => (
                  <button
                    key={stepIndex}
                    onClick={() => toggleStep(drumName as keyof typeof patterns, stepIndex)}
                    className={`w-8 h-8 rounded border-2 font-mono text-xs font-bold transition-all ${
                      active
                        ? `${getDrumColor(drumName)} shadow-lg`
                        : "bg-gray-800 border-gray-600 hover:border-gray-500"
                    } ${stepIndex === currentStep ? "ring-2 ring-white ring-opacity-50" : ""}`}
                  >
                    {stepIndex + 1}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pattern Presets */}
        <div className="mt-6 p-4 bg-black rounded border border-yellow-400">
          <h3 className="text-yellow-400 font-mono font-bold mb-3">🎛️ PATTERN PRESETS</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => loadPreset("basic")}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded font-mono text-xs border border-blue-400 transition-colors"
            >
              BASIC BEAT
            </button>
            <button
              onClick={() => loadPreset("house")}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-400 text-white rounded font-mono text-xs border border-purple-400 transition-colors"
            >
              HOUSE
            </button>
            <button
              onClick={() => loadPreset("breakbeat")}
              className="px-3 py-1 bg-orange-500 hover:bg-orange-400 text-white rounded font-mono text-xs border border-orange-400 transition-colors"
            >
              BREAKBEAT
            </button>
            <button
              onClick={() => loadPreset("techno")}
              className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white rounded font-mono text-xs border border-red-400 transition-colors"
            >
              TECHNO
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
