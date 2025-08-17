"use client"

interface VideoOverlayProps {
  isVideoPlaying: boolean
  videos: string[]
  currentVideoIndex: number
  closeVideo: () => void
  nextVideo: () => void
  prevVideo: () => void
}

export default function VideoOverlay({
  isVideoPlaying,
  videos,
  currentVideoIndex,
  closeVideo,
  nextVideo,
  prevVideo,
}: VideoOverlayProps) {
  if (!isVideoPlaying || videos.length === 0) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90">
      <div className="relative bg-gray-900 rounded-lg p-4 shadow-2xl max-w-4xl w-full mx-4 border-2 border-cyan-400 shadow-cyan-400/50">
        {/* Close Button */}
        <button
          onClick={closeVideo}
          className="absolute top-2 right-2 z-20 bg-red-500 hover:bg-red-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors shadow-lg shadow-red-500/50"
        >
          ×
        </button>

        {/* Video Counter */}
        <div className="absolute top-2 left-2 z-20 bg-black bg-opacity-80 text-cyan-400 px-2 py-1 rounded text-sm font-semibold border border-cyan-400">
          {currentVideoIndex + 1} / {videos.length}
        </div>

        {/* Navigation Buttons */}
        {videos.length > 1 && (
          <>
            <button
              onClick={prevVideo}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors shadow-lg shadow-cyan-500/50"
            >
              ←
            </button>
            <button
              onClick={nextVideo}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold transition-colors shadow-lg shadow-cyan-500/50"
            >
              →
            </button>
          </>
        )}

        {/* Simple iframe embed */}
        <div className="w-full" style={{ paddingBottom: "56.25%", position: "relative" }}>
          <iframe
            key={`video-${currentVideoIndex}`}
            src={videos[currentVideoIndex]}
            className="absolute top-0 left-0 w-full h-full rounded border-2 border-cyan-400"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={`Video ${currentVideoIndex + 1}`}
          />
        </div>

        {/* Instructions */}
        {videos.length > 1 && (
          <div className="text-center text-cyan-400 text-sm mt-2 font-mono">Click arrows to switch between videos</div>
        )}
      </div>
    </div>
  )
}
