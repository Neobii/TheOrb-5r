"use client"

import type React from "react"
import type { BeatMachine } from "@/lib/audio/BeatMachine"

interface ControlButtonsProps {
  setShowVideoInput: (show: boolean) => void
  isSpherical: boolean
  setIsSpherical: (spherical: boolean) => void
  soundEnabled: boolean
  toggleSound: () => void
  setShowBeatMachine: (show: boolean) => void
  beatMachineRef: React.RefObject<BeatMachine | null>
  setShowSynth: (show: boolean) => void
  setShowAudioTest?: (show: boolean) => void
}

export default function ControlButtons({
  setShowVideoInput,
  isSpherical,
  setIsSpherical,
  soundEnabled,
  toggleSound,
  setShowBeatMachine,
  beatMachineRef,
  setShowSynth,
  setShowAudioTest,
}: ControlButtonsProps) {
  return (
    <div className="absolute top-4 left-4 z-30 space-y-2">
      <button
        onClick={() => setShowVideoInput(true)}
        className="block bg-magenta-500 hover:bg-magenta-400 text-black px-4 py-2 rounded transition-colors shadow-lg font-bold font-mono shadow-magenta-500/50 border-2 border-magenta-400"
      >
        🎥 PLAY VIDEOS
      </button>
      <button
        onClick={() => setIsSpherical(!isSpherical)}
        className="block bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded transition-colors shadow-lg font-bold font-mono shadow-cyan-500/50 border-2 border-cyan-400"
      >
        {isSpherical ? "🔲 CUBE" : "🔵 SPHERE"}
      </button>
      <button
        onClick={toggleSound}
        className={`block px-4 py-2 rounded transition-colors shadow-lg font-bold font-mono border-2 ${
          soundEnabled
            ? "bg-green-500 hover:bg-green-400 text-black shadow-green-500/50 border-green-400"
            : "bg-red-500 hover:bg-red-400 text-white shadow-red-500/50 border-red-400"
        }`}
      >
        {soundEnabled ? "🔊 SOUND ON" : "🔇 SOUND OFF"}
      </button>
      <button
        onClick={() => setShowBeatMachine(true)}
        className={`block px-4 py-2 rounded transition-colors shadow-lg font-bold font-mono border-2 ${
          beatMachineRef.current?.isRunning()
            ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/50 border-yellow-400 animate-pulse"
            : "bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/50 border-yellow-400"
        }`}
      >
        🎵 BEAT MACHINE {beatMachineRef.current?.isRunning() ? "●" : ""}
      </button>
      <button
        onClick={() => setShowSynth(true)}
        className="block bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded transition-colors shadow-lg font-bold font-mono shadow-purple-500/50 border-2 border-purple-400"
      >
        🎹 FM SYNTH
      </button>
      {setShowAudioTest && (
        <button
          onClick={() => setShowAudioTest(true)}
          className="block bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded transition-colors shadow-lg font-bold font-mono shadow-green-500/50 border-2 border-green-400"
        >
          🔧 AUDIO TEST
        </button>
      )}
    </div>
  )
}
