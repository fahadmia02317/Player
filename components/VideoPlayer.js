import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function VideoPlayer({ url, type }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract Google Drive file ID from various URL formats
  const extractDriveId = (driveUrl) => {
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,           // drive.google.com/file/d/FILE_ID/
      /[?&]id=([a-zA-Z0-9_-]+)/,         // drive.google.com/uc?id=FILE_ID or open?id=FILE_ID
      /\/file\/d\/([a-zA-Z0-9_-]+)/,     // Alternative format
    ];
    for (const pattern of patterns) {
      const match = driveUrl.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsLoading(true);

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Handle different video types
    if (type === "hls" && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => console.log("Auto-play prevented:", err));
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS Error:", data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setError("HLS stream failed to load");
              setIsLoading(false);
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (type === "drive") {
      const driveId = extractDriveId(url);
      if (driveId) {
        const driveUrl = `https://drive.google.com/uc?export=view&id=${driveId}`;
        video.src = driveUrl;
        video.play().catch((err) => console.log("Auto-play prevented:", err));
      } else {
        setError("Invalid Google Drive URL format");
        setIsLoading(false);
      }
    } else {
      // Standard MP4/WebM
      video.src = url;
      video.play().catch((err) => console.log("Auto-play prevented:", err));
    }

    // Event listeners
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const onVolumeChange = () => setVolume(video.volume);
    const onEnded = () => setIsPlaying(false);
    const onError = (e) => {
      console.error("Video error:", e);
      setError("Failed to load video. Check URL or CORS settings.");
      setIsLoading(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, type]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
  };

  const handleVolume = (e) => {
    const video = videoRef.current;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
  };

  const handlePlaybackRate = (e) => {
    const video = videoRef.current;
    const rate = parseFloat(e.target.value);
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current;
      if (!video) return;

      // Only handle keys when video container is focused or video is playing
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          video.muted = !video.muted;
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Show error state
  if (error) {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "2rem auto",
          background: "#1a1a2e",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          padding: "3rem",
          textAlign: "center",
          color: "#ff6b6b",
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
        <h2 style={{ marginBottom: "1rem" }}>Playback Error</h2>
        <p style={{ opacity: 0.8, marginBottom: "2rem" }}>{error}</p>
        <button
          onClick={() => setError(null)}
          style={{
            padding: "1rem 2rem",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "2rem auto",
        background: "#1a1a2e",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        position: "relative",
      }}
      tabIndex={0}
    >
      {/* Video Container */}
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%",
          backgroundColor: "#000",
        }}
      >
        <video
          ref={videoRef}
          controls={false}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
            }}
          >
            <div style={{ textAlign: "center", color: "#fff" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "4px solid #333",
                  borderTopColor: "#667eea",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1rem",
                }}
              />
              <p>Loading video...</p>
            </div>
          </div>
        )}

        {/* Play/Pause Overlay */}
        {!isPlaying && !isLoading && !error && (
          <div
            onClick={togglePlay}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 30px rgba(102,126,234,0.5)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: "1.5rem", background: "#16213e" }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="range"
            min="0"
            max={duration > 0 ? duration : 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={duration <= 0 || isLoading}
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              appearance: "none",
              background: duration > 0
                ? `linear-gradient(to right, #667eea ${(currentTime / duration) * 100}%, #333 ${(currentTime / duration) * 100}%)`
                : "#333",
              outline: "none",
              opacity: duration > 0 ? 1 : 0.5,
              cursor: duration > 0 ? "pointer" : "not-allowed",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.5rem",
              color: "#aaa",
              fontSize: "14px",
            }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            style={{
              padding: "0.8rem 1.5rem",
              background: isLoading
                ? "#555"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "transform 0.2s",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "⏳ Loading..." : isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{volume === 0 ? "🔇" : "🔊"}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolume}
              style={{ width: "100px" }}
            />
          </div>

          {/* Playback Speed */}
          <select
            value={playbackRate}
            onChange={handlePlaybackRate}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: "#0f3460",
              color: "white",
              cursor: "pointer",
            }}
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            style={{
              marginLeft: "auto",
              padding: "0.8rem 1.5rem",
              background: "#0f3460",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
            }}
          >
            {isFullscreen ? "⛶ Exit Fullscreen" : "⛶ Fullscreen"}
          </button>
        </div>

        {/* Video Info */}
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid #0f3460",
            color: "#888",
            fontSize: "14px",
          }}
        >
          <strong>Type:</strong> {type.toUpperCase()} | <strong>Status:</strong>{" "}
          {isLoading ? "Loading" : isPlaying ? "Playing" : "Paused"}
          {duration > 0 && ` | Duration: ${formatTime(duration)}`}
        </div>

        {/* Keyboard Shortcuts Hint */}
        <details
          style={{
            marginTop: "1rem",
            color: "#666",
            fontSize: "12px",
          }}
        >
          <summary style={{ cursor: "pointer" }}>⌨️ Keyboard Shortcuts</summary>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", marginTop: "0.5rem" }}>
            <div><kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px" }}>Space / K</kbd> Play/Pause</div>
            <div><kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px" }}>← / →</kbd> Seek ±10s</div>
            <div><kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px" }}>↑ / ↓</kbd> Volume ±10%</div>
            <div><kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px" }}>F</kbd> Fullscreen</div>
            <div><kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px" }}>M</kbd> Mute</div>
          </div>
        </details>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          transition: transform 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        input[type="range"]:disabled::-webkit-slider-thumb {
          background: #666;
          cursor: not-allowed;
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #667eea;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}