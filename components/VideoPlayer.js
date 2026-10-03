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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state
    setIsPlaying(false);
    setCurrentTime(0);

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
              break;
          }
        }
      });
      
      hlsRef.current = hls;
    } else if (type === "drive") {
      // Google Drive direct link conversion
      const driveId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      if (driveId) {
        const driveUrl = `https://drive.google.com/uc?export=view&id=${driveId}`;
        video.src = driveUrl;
        video.play().catch((err) => console.log("Auto-play prevented:", err));
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
    const onLoadedMetadata = () => setDuration(video.duration);
    const onVolumeChange = () => setVolume(video.volume);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("ended", onEnded);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
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
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
        
        {/* Play/Pause Overlay */}
        {!isPlaying && (
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
                <path d="M8 5v14l11-7z"/>
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
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              appearance: "none",
              background: "linear-gradient(to right, #667eea 0%, #764ba2 100%)",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", color: "#aaa", fontSize: "14px" }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            style={{
              padding: "0.8rem 1.5rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🔊</span>
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
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #0f3460", color: "#888", fontSize: "14px" }}>
          <strong>Type:</strong> {type.toUpperCase()} | <strong>Status:</strong> {isPlaying ? "Playing" : "Paused"}
        </div>
      </div>
    </div>
  );
}
