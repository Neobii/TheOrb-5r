"use client"

import type React from "react"

interface FMSynthParams {
  modulationIndex: number
  modulatorRatio: number
  carrierWaveform: OscillatorType
  modulatorWaveform: OscillatorType
  attack: number
  decay: number
  sustain: number
  release: number
  volume: number
}

interface FMSynthOverlayProps {
  showSynth: boolean
  setShowSynth: (show: boolean) => void
  synthParams: FMSynthParams
  setSynthParams: React.Dispatch<React.SetStateAction<FMSynthParams>>
  fmSynthRef?: React.RefObject<any>
}

export default function FMSynthOverlay({
  showSynth,
  setShowSynth,
  synthParams,
  setSynthParams,
  fmSynthRef,
}: FMSynthOverlayProps) {
  if (!showSynth) return null

  const handleTestTone = () => {
    if (fmSynthRef?.current) {
      console.log("Testing tone...")
      fmSynthRef.current.playTestTone()
    }
  }

  const handleDebugInfo = () => {
    if (fmSynthRef?.current) {
      const info = fmSynthRef.current.getAudioContextState()
      console.log("Audio Context Debug Info:", info)
      alert(`Audio Context State: ${info.state}\nSample Rate: ${info.sampleRate}\nActive Notes: ${info.activeNotes}`)
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90">
      <div className="bg-gray-900 rounded-lg p-6 shadow-2xl max-w-6xl w-full mx-4 border-2 border-purple-400 shadow-purple-400/50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-purple-400 text-2xl font-bold font-mono">🎹 FM SYNTHESIZER - FULL KEYBOARD</h2>
          <button
            onClick={() => setShowSynth(false)}
            className="bg-red-500 hover:bg-red-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors shadow-lg shadow-red-500/50"
          >
            ×
          </button>
        </div>

        {/* Debug Controls */}
        <div className="mb-4 p-3 bg-black rounded border border-red-400">
          <h3 className="text-red-400 font-mono font-bold mb-2">🔧 DEBUG CONTROLS</h3>
          <div className="flex gap-2">
            <button
              onClick={handleTestTone}
              className="px-3 py-1 bg-green-500 hover:bg-green-400 text-black rounded font-mono text-xs border border-green-400 transition-colors"
            >
              TEST TONE
            </button>
            <button
              onClick={handleDebugInfo}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded font-mono text-xs border border-blue-400 transition-colors"
            >
              DEBUG INFO
            </button>
          </div>
        </div>

        {/* Synth Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Modulation Controls */}
          <div className="p-4 bg-black rounded border border-purple-400">
            <h3 className="text-purple-400 font-mono font-bold mb-3">🌊 MODULATION</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-cyan-400 font-mono text-sm mb-1">Modulation Index:</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={synthParams.modulationIndex}
                  onChange={(e) => setSynthParams((prev) => ({ ...prev, modulationIndex: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-cyan-400 font-mono text-xs">{synthParams.modulationIndex}</span>
              </div>
              <div>
                <label className="block text-cyan-400 font-mono text-sm mb-1">Modulator Ratio:</label>
                <input
                  type="range"
                  min="0.1"
                  max="8"
                  step="0.1"
                  value={synthParams.modulatorRatio}
                  onChange={(e) => setSynthParams((prev) => ({ ...prev, modulatorRatio: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-cyan-400 font-mono text-xs">{synthParams.modulatorRatio.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Waveform Controls */}
          <div className="p-4 bg-black rounded border border-purple-400">
            <h3 className="text-purple-400 font-mono font-bold mb-3">🌊 WAVEFORMS</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-cyan-400 font-mono text-sm mb-1">Carrier Wave:</label>
                <select
                  value={synthParams.carrierWaveform}
                  onChange={(e) =>
                    setSynthParams((prev) => ({ ...prev, carrierWaveform: e.target.value as OscillatorType }))
                  }
                  className="w-full bg-gray-800 text-cyan-400 rounded border border-cyan-400 px-2 py-1 font-mono text-sm"
                >
                  <option value="sine">SINE</option>
                  <option value="square">SQUARE</option>
                  <option value="sawtooth">SAWTOOTH</option>
                  <option value="triangle">TRIANGLE</option>
                </select>
              </div>
              <div>
                <label className="block text-cyan-400 font-mono text-sm mb-1">Modulator Wave:</label>
                <select
                  value={synthParams.modulatorWaveform}
                  onChange={(e) =>
                    setSynthParams((prev) => ({ ...prev, modulatorWaveform: e.target.value as OscillatorType }))
                  }
                  className="w-full bg-gray-800 text-cyan-400 rounded border border-cyan-400 px-2 py-1 font-mono text-sm"
                >
                  <option value="sine">SINE</option>
                  <option value="square">SQUARE</option>
                  <option value="sawtooth">SAWTOOTH</option>
                  <option value="triangle">TRIANGLE</option>
                </select>
              </div>
            </div>
          </div>

          {/* ADSR Envelope */}
          <div className="p-4 bg-black rounded border border-purple-400">
            <h3 className="text-purple-400 font-mono font-bold mb-3">📈 ENVELOPE (ADSR)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-cyan-400 font-mono text-xs mb-1">Attack:</label>
                <input
                  type="range"
                  min="0.01"
                  max="2"
                  step="0.01"
                  value={synthParams.attack}
                  onChange={(e) => setSynthParams((prev) => ({ ...prev, attack: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-cyan-400 font-mono text-xs">{synthParams.attack.toFixed(2)}s</span>
              </div>
              <div>
                <label className="block text-cyan-400 font-mono text-xs mb-1">Decay:</label>
                <input
                  type="range"
                  min="0.01"
                  max="2"
                  step="0.01"
                  value={synthParams.decay}
                  onChange={(e) => setSynthParams((prev) => ({ ...prev, decay: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-cyan-400 font-mono text-xs">{synthParams.decay.toFixed(2)}s</span>
              </div>
              <div>
                <label className="block text-cyan-400 font-mono text-xs mb-1">Sustain:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={synthParams.sustain}
                  onChange={(e) => setSynthParams((prev) => ({ ...prev, sustain: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-cyan-400 font-mono text-xs">{Math.round(synthParams.sustain * 100)}%</span>
              </div>
              <div>
                <label className="block text-cyan-400 font-mono text-xs mb-1">Release:</label>
                <input
                  type="range"
                  min="0.01"
                  max="3"
                  step="0.01"
                  value={synthParams.release}
                  onChange={(e) => setSynthParams((prev) => ({ ...prev, release: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-cyan-400 font-mono text-xs">{synthParams.release.toFixed(2)}s</span>
              </div>
            </div>
          </div>

          {/* Volume Control */}
          <div className="p-4 bg-black rounded border border-purple-400">
            <h3 className="text-purple-400 font-mono font-bold mb-3">🔊 VOLUME</h3>
            <div>
              <label className="block text-cyan-400 font-mono text-sm mb-1">Master Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={synthParams.volume}
                onChange={(e) => setSynthParams((prev) => ({ ...prev, volume: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="text-cyan-400 font-mono text-sm">{Math.round(synthParams.volume * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Full Keyboard Layout - ALL 26 KEYS! */}
        <div className="p-4 bg-black rounded border border-green-400">
          <h3 className="text-green-400 font-mono font-bold mb-3">⌨️ FULL ALPHABET KEYBOARD (26 KEYS)</h3>

          {/* Top Row - QWERTYUIOP */}
          <div className="mb-3">
            <div className="text-green-400 font-mono text-xs mb-1">Top Row (E3-C#4):</div>
            <div className="grid grid-cols-10 gap-1 text-xs font-mono">
              {[
                { key: "Q", note: "E3", freq: "164.81", color: "bg-red-500 text-white" },
                { key: "W", note: "F3", freq: "174.61", color: "bg-red-500 text-white" },
                { key: "E", note: "F#3", freq: "185.00", color: "bg-red-500 text-white" },
                { key: "R", note: "G3", freq: "196.00", color: "bg-red-500 text-white" },
                { key: "T", note: "G#3", freq: "207.65", color: "bg-red-500 text-white" },
                { key: "Y", note: "A3", freq: "220.00", color: "bg-red-500 text-white" },
                { key: "U", note: "A#3", freq: "233.08", color: "bg-red-500 text-white" },
                { key: "I", note: "B3", freq: "246.94", color: "bg-red-500 text-white" },
                { key: "O", note: "C4", freq: "261.63", color: "bg-red-500 text-white" },
                { key: "P", note: "C#4", freq: "277.18", color: "bg-red-500 text-white" },
              ].map(({ key, note, freq, color }) => (
                <div
                  key={key}
                  className={`${color} p-2 rounded text-center border-2 border-red-400 transition-all hover:scale-105`}
                >
                  <div className="font-bold text-sm">{key}</div>
                  <div className="text-xs">{note}</div>
                  <div className="text-xs opacity-75">{freq}Hz</div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Row - ASDFGHJKL */}
          <div className="mb-3">
            <div className="text-cyan-400 font-mono text-xs mb-1">Middle Row (G2-D#3):</div>
            <div className="grid grid-cols-9 gap-1 text-xs font-mono">
              {[
                { key: "A", note: "G2", freq: "98.00", color: "bg-blue-500 text-white" },
                { key: "S", note: "G#2", freq: "103.83", color: "bg-blue-500 text-white" },
                { key: "D", note: "A2", freq: "110.00", color: "bg-blue-500 text-white" },
                { key: "F", note: "A#2", freq: "116.54", color: "bg-blue-500 text-white" },
                { key: "G", note: "B2", freq: "123.47", color: "bg-blue-500 text-white" },
                { key: "H", note: "C3", freq: "130.81", color: "bg-blue-500 text-white" },
                { key: "J", note: "C#3", freq: "138.59", color: "bg-blue-500 text-white" },
                { key: "K", note: "D3", freq: "146.83", color: "bg-blue-500 text-white" },
                { key: "L", note: "D#3", freq: "155.56", color: "bg-blue-500 text-white" },
              ].map(({ key, note, freq, color }) => (
                <div
                  key={key}
                  className={`${color} p-2 rounded text-center border-2 border-blue-400 transition-all hover:scale-105`}
                >
                  <div className="font-bold text-sm">{key}</div>
                  <div className="text-xs">{note}</div>
                  <div className="text-xs opacity-75">{freq}Hz</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row - ZXCVBNM */}
          <div>
            <div className="text-yellow-400 font-mono text-xs mb-1">Bottom Row (C2-F#2):</div>
            <div className="grid grid-cols-7 gap-1 text-xs font-mono">
              {[
                { key: "Z", note: "C2", freq: "65.41", color: "bg-green-500 text-black" },
                { key: "X", note: "C#2", freq: "69.30", color: "bg-green-500 text-black" },
                { key: "C", note: "D2", freq: "73.42", color: "bg-green-500 text-black" },
                { key: "V", note: "D#2", freq: "77.78", color: "bg-green-500 text-black" },
                { key: "B", note: "E2", freq: "82.41", color: "bg-green-500 text-black" },
                { key: "N", note: "F2", freq: "87.31", color: "bg-green-500 text-black" },
                { key: "M", note: "F#2", freq: "92.50", color: "bg-green-500 text-black" },
              ].map(({ key, note, freq, color }) => (
                <div
                  key={key}
                  className={`${color} p-2 rounded text-center border-2 border-green-400 transition-all hover:scale-105`}
                >
                  <div className="font-bold text-sm">{key}</div>
                  <div className="text-xs">{note}</div>
                  <div className="text-xs opacity-75">{freq}Hz</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-green-400 text-sm mt-4 font-mono">
            🎵 ALL 26 ALPHABETICAL KEYS • DUAL-TONE FM SYNTHESIS • HALF-STEP HARMONIES! 🎵
          </div>
          <div className="text-center text-cyan-400 text-xs mt-2 font-mono">
            Each key plays TWO tones: base frequency + semitone higher • Full chromatic range from C2 to C#4!
          </div>
        </div>

        {/* Presets */}
        <div className="mt-6 p-4 bg-black rounded border border-yellow-400">
          <h3 className="text-yellow-400 font-mono font-bold mb-3">🎛️ PRESETS</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() =>
                setSynthParams({
                  modulationIndex: 100,
                  modulatorRatio: 2,
                  carrierWaveform: "sine",
                  modulatorWaveform: "sine",
                  attack: 0.1,
                  decay: 0.3,
                  sustain: 0.7,
                  release: 0.5,
                  volume: 0.3,
                })
              }
              className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white rounded font-mono text-xs border border-blue-400 transition-colors"
            >
              CLASSIC FM
            </button>
            <button
              onClick={() =>
                setSynthParams({
                  modulationIndex: 300,
                  modulatorRatio: 3.5,
                  carrierWaveform: "sine",
                  modulatorWaveform: "square",
                  attack: 0.01,
                  decay: 0.1,
                  sustain: 0.3,
                  release: 0.8,
                  volume: 0.3,
                })
              }
              className="px-3 py-1 bg-purple-500 hover:bg-purple-400 text-white rounded font-mono text-xs border border-purple-400 transition-colors"
            >
              BELL
            </button>
            <button
              onClick={() =>
                setSynthParams({
                  modulationIndex: 50,
                  modulatorRatio: 1,
                  carrierWaveform: "sawtooth",
                  modulatorWaveform: "triangle",
                  attack: 0.05,
                  decay: 0.2,
                  sustain: 0.8,
                  release: 0.3,
                  volume: 0.3,
                })
              }
              className="px-3 py-1 bg-orange-500 hover:bg-orange-400 text-white rounded font-mono text-xs border border-orange-400 transition-colors"
            >
              BASS
            </button>
            <button
              onClick={() =>
                setSynthParams({
                  modulationIndex: 200,
                  modulatorRatio: 7,
                  carrierWaveform: "square",
                  modulatorWaveform: "sine",
                  attack: 0.01,
                  decay: 0.05,
                  sustain: 0.1,
                  release: 1.5,
                  volume: 0.3,
                })
              }
              className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white rounded font-mono text-xs border border-red-400 transition-colors"
            >
              METALLIC
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
