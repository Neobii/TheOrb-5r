"use client"

import type React from "react"

interface VideoInputFormProps {
  showVideoInput: boolean
  setShowVideoInput: (show: boolean) => void
  handleVideoSubmit: (e: React.FormEvent) => void
}

export default function VideoInputForm({ showVideoInput, setShowVideoInput, handleVideoSubmit }: VideoInputFormProps) {
  if (!showVideoInput) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black bg-opacity-90">
      <div className="bg-gray-900 p-6 rounded-lg shadow-2xl max-w-md w-full mx-4 border-2 border-magenta-400 shadow-magenta-400/50">
        <h3 className="text-magenta-400 text-lg font-bold mb-4 text-center font-mono">ADD TWO VIDEO URLS</h3>
        <form onSubmit={handleVideoSubmit} className="space-y-4">
          <div>
            <label className="block text-cyan-400 text-sm mb-1 font-mono">VIDEO 1 URL:</label>
            <input
              type="url"
              name="videoUrl1"
              placeholder="https://example.com/video1"
              className="w-full px-3 py-2 bg-black text-cyan-400 rounded border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-cyan-400 text-sm mb-1 font-mono">VIDEO 2 URL:</label>
            <input
              type="url"
              name="videoUrl2"
              placeholder="https://example.com/video2"
              className="w-full px-3 py-2 bg-black text-cyan-400 rounded border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-mono"
              required
            />
          </div>
          <div className="text-xs text-gray-400 font-mono">Enter any video URLs (YouTube, Vimeo, etc.)</div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 px-4 rounded transition-colors font-bold font-mono shadow-lg shadow-cyan-500/50 border-2 border-cyan-400"
            >
              PLAY VIDEOS
            </button>
            <button
              type="button"
              onClick={() => setShowVideoInput(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-cyan-400 py-2 px-4 rounded transition-colors font-bold font-mono border border-cyan-400"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
