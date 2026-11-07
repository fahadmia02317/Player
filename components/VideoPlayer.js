import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  const [isLive, setIsLive] = useState(false);

  // Memoized helper functions - stable references
  const extractDriveId = useCallback((driveUrl) => {
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /\/open\?id=([a-zA-Z0-9_-]+)/,
      /\/uc\?id=([a-zA-Z0-9_-]+)/,
    ];
    for (const pattern of patterns) {
      const match = driveUrl.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  }, []);

  const buildDriveUrl = useCallback((driveId) => {
    return `https://drive.google.com/uc?export=view&id=${driveId}`;
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = "";
      video.load();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsLoading(true);
    setIsLive(false);

    // Cleanup previous instance
    cleanup();

    // Handle different video types
    if (type === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Check if live stream
          const isLiveStream = hls.liveSyncPosition !== undefined;
          setIsLive(isLiveStream);
          
          video.play().catch((err) => {
            console.log("Auto-play prevented:", err);
            setIsLoading(false);
          });
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
                setError("HLS streaming failed. The stream may be offline or blocked.");
                setIsLoading(false);
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = url;
        video.play().catch((err) => console.log("Auto-play prevented:", err));
      } else {
        setError("HLS streaming is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.");
        setIsLoading(false);
      }
    } else if (type === "drive") {
      const driveId = extractDriveId(url);
      if (driveId) {
        const driveUrl = buildDriveUrl(driveId);
        video.src = driveUrl;
        video.play().catch((err) => console.log("Auto-play prevented:", err));
      } else {
        setError("Invalid Google Drive URL format.");
        setIsLoading(false);
      }
    } else {
      // Standard MP4/WebM/OGG
      video.src = url;
      video.play().catch((err) => console.log("Auto-play prevented:", err));
    }

    // Event listeners
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      const dur = video.duration;
      setDuration(dur);
      setIsLive(!isFinite(dur) || dur === Infinity);
      setIsLoading(false);
    };
    const onVolumeChange = () => setVolume(video.volume);
    const onEnded = () => setIsPlaying(false);
    const onError = (e) => {
      console.error("Video error:", e);
      if (type === "drive") {
        setError("Failed to load Google Drive video. The file may be private, deleted, or blocked by CORS. Try a direct MP4 link instead.");
      } else if (type === "hls") {
        setError("HLS stream failed to load. Check if the stream is online.");
      } else {
        setError("Video failed to load. Unsupported format or network error.");
      }
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

    // Keyboard controls
    const handleKeyDown = (e) => {
      if (!video) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
        case "j":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowRight":
        case "l":
          e.preventDefault();
          video.currentTime = Math.min(video.duration || video.currentTime + 10, video.currentTime + 10);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case "m":
          video.muted = !video.muted;
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "0":
          video.currentTime = 0;
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          if (video.duration && isFinite(video.duration)) {
            video.currentTime = (video.duration * parseInt(e.key)) / 10;
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Fullscreen change listener
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);

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

      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);

      cleanup();
    };
  }, [url, type, cleanup, extractDriveId, buildDriveUrl]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, []);

  const handleSeek = useCallback((e) => {
    const video = videoRef.current;
    const time = parseFloat(e.target.value);
    if (video && !isNaN(time)) {
      video.currentTime = time;
    }
  }, []);

  const handleVolume = useCallback((e) => {
    const video = videoRef.current;
    const vol = parseFloat(e.target.value);
    if (video) {
      video.volume = vol;
      setVolume(vol);
    }
  }, []);

  const handlePlaybackRate = useCallback((e) => {
    const video = videoRef.current;
    const rate = parseFloat(e.target.value);
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "LIVE";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Progress bar max value
  const progressMax = useMemo(() => (duration > 0 && isFinite(duration) ? duration : 100), [duration]);

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
          color: "#fff",
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
        <h2 style={{ marginBottom: "1rem", color: "#ff6b6b" }}>Playback Error</h2>
        <p style={{ color: "#aaa", marginBottom: "2rem", maxWidth: "500px", margin: "0 auto 2rem" }}>
          {error}
        </p>
        <button
          onClick={() => setError(null)}
          style={{
            padding: "1rem 2rem",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
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
              color: "#fff",
              fontSize: "1.2rem",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #333",
                  borderTopColor: "#667eea",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span>Loading video...</span>
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

        {/* Live Badge */}
        {isLive && !isLoading && (
          <div
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              background: "#ff4757",
              color: "white",
              padding: "0.3rem 0.8rem",
              borderRadius: "4px",
              fontSize: "0.8rem",
              fontWeight: "bold",
              animation: "pulse 1.5s infinite",
            }}
          >
            🔴 LIVE
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
            max={progressMax}
            value={currentTime}
            onChange={handleSeek}
            disabled={duration <= 0 || isLoading || isLive}
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              appearance: "none",
              background: duration > 0 && isFinite(duration)
                ? `linear-gradient(to right, #667eea ${(currentTime / progressMax) * 100}%, #333 ${(currentTime / progressMax) * 100}%)`
                : "#333",
              outline: "none",
              opacity: (duration > 0 && isFinite(duration)) ? 1 : 0.5,
              cursor: (duration > 0 && isFinite(duration)) ? "pointer" : "not-allowed",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", color: "#aaa", fontSize: "14px" }}>
            <span>{formatTime(currentTime)}</span>
            <span>{isLive ? "LIVE" : duration > 0 && isFinite(duration) ? formatTime(duration) : "--:--"}</span>
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
              background: isLoading ? "#333" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "transform 0.2s",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}</span>
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

        {/* Keyboard Shortcuts Hint */}
        <details style={{ marginTop: "1rem" }}>
          <summary style={{ color: "#888", cursor: "pointer", fontSize: "13px" }}>
            ⌨️ Keyboard Shortcuts
          </summary>
          <div style={{ marginTop: "0.5rem", fontSize: "12px", color: "#666", lineHeight: "1.8" }}>
            <kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px", margin: "0 2px" }}>Space/K</kbd> Play/Pause &nbsp;
            <kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px", margin: "0 2px" }}>←/J</kbd> -10s &nbsp;
            <kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px", margin: "0 2px" }}>→/L</kbd> +10s &nbsp;
            <kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px", margin: "0 2px" }}>↑/↓</kbd> Volume &nbsp;
            <kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px", margin: "0 2px" }}>M</kbd> Mute &nbsp;
            <kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px", margin: "0 2px" }}>F</kbd> Fullscreen &nbsp;
            <kbd style={{ background: "#0f3460", padding: "2px 6px", borderRadius: "4px", margin: "0 2px" }}>0-9</kbd> Seek %
          </div>
        </details>

        {/* Video Info */}
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #0f3460", color: "#888", fontSize: "14px" }}>
          <strong>Type:</strong> {type.toUpperCase()} | <strong>Status:</strong> {isPlaying ? "Playing" : isLoading ? "Loading..." : isLive ? "Live" : "Paused"}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
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
        details summary::-webkit-details-marker {
          color: #888;
        }
      `}</style>
    </div>
  );
}