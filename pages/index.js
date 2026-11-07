import React, { useState, useCallback, useMemo } from "react";
import Head from "next/head";
import VideoPlayer from "../components/VideoPlayer";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("hls");
  const [isPlaying, setIsPlaying] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const handlePlay = useCallback((url, type) => {
    setVideoUrl(url);
    setVideoType(type);
    setIsPlaying(true);
  }, []);

  // Memoized video type detection - stable reference
  const detectVideoType = useCallback((url) => {
    const lowerUrl = url.toLowerCase();

    // Google Drive (check first as it may contain other patterns)
    if (lowerUrl.includes("drive.google.com")) {
      return "drive";
    }

    // HLS streams
    if (
      lowerUrl.includes(".m3u8") ||
      lowerUrl.includes(".m3u") ||
      lowerUrl.includes("hls") ||
      lowerUrl.includes("manifest") ||
      lowerUrl.includes(".ism/") ||
      lowerUrl.includes("/master.m3u8")
    ) {
      return "hls";
    }

    // Common video extensions
    if (
      lowerUrl.includes(".mp4") ||
      lowerUrl.includes(".webm") ||
      lowerUrl.includes(".ogg") ||
      lowerUrl.includes(".mov") ||
      lowerUrl.includes(".mkv") ||
      lowerUrl.includes(".avi")
    ) {
      return "mp4";
    }

    // Blob URLs
    if (lowerUrl.startsWith("blob:")) {
      return "mp4";
    }

    // Default to mp4 for unknown
    return "mp4";
  }, []);

  const handleCustomPlay = useCallback(() => {
    if (!customUrl.trim()) return;

    const type = detectVideoType(customUrl);

    setVideoUrl(customUrl.trim());
    setVideoType(type);
    setIsPlaying(true);
  }, [customUrl, detectVideoType]);

  // Demo videos - memoized to prevent re-renders
  const demoVideos = useMemo(() => [
    {
      id: "hls-test",
      label: "HLS Test Stream",
      subtitle: ".m3u8 format • Adaptive bitrate streaming",
      icon: "📺",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      type: "hls",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: "big-buck-bunny",
      label: "Big Buck Bunny",
      subtitle: "MP4 format • Classic open source film",
      icon: "🎥",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "mp4",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: "w3schools",
      label: "W3Schools Sample",
      subtitle: "MP4 format • Educational content",
      icon: "🎞️",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      type: "mp4",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      id: "tears-of-steel",
      label: "Tears of Steel",
      subtitle: "HLS format • Open movie project",
      icon: "🌊",
      url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
      type: "hls",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
  ], []);

  return (
    <>
      <Head>
        <title>🎬 Ultimate Video Player - Drive, CDN & m3u8 Support</title>
        <meta name="description" content="Multi-format Video Player supporting Google Drive, CDN, and HLS streams" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎬</text></svg>" />
      </Head>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "#fff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}>
        {/* Header */}
        <header style={{
          padding: "3rem 2rem",
          textAlign: "center",
          background: "rgba(0,0,0,0.2)",
          backdropFilter: "blur(10px)",
        }}>
          <h1 style={{
            fontSize: "3rem",
            margin: "0 0 1rem 0",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            🎬 Ultimate Video Player
          </h1>
          <p style={{ fontSize: "1.2rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto" }}>
            Play videos from Google Drive, CDN, or HLS streams in one beautiful player
          </p>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>

          {/* Custom URL Input */}
          <div style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "3rem",
            backdropFilter: "blur(10px)",
          }}>
            <h3 style={{ marginBottom: "1rem" }}>🔗 Play Custom Video URL</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomPlay()}
                placeholder="Paste video URL here (MP4, m3u8, or Google Drive)"
                style={{
                  flex: 1,
                  minWidth: "300px",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "none",
                  background: "#1a1a2e",
                  color: "#fff",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
              <button
                onClick={handleCustomPlay}
                disabled={!customUrl.trim()}
                style={{
                  padding: "1rem 2rem",
                  borderRadius: "12px",
                  border: "none",
                  background: customUrl.trim()
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#ccc",
                  color: customUrl.trim() ? "#fff" : "#666",
                  fontWeight: "bold",
                  cursor: customUrl.trim() ? "pointer" : "not-allowed",
                  transition: "transform 0.2s",
                }}
              >
                ▶ Play Now
              </button>
            </div>
            <p style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.7 }}>
              💡 Supports: .m3u8 (HLS), MP4, WebM, Google Drive direct links, blob URLs
            </p>
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", opacity: 0.6, color: "#ffa7a7" }}>
              ⚠️ Note: Google Drive streaming may be blocked by CORS in some browsers. For best results, use direct MP4 or HLS (.m3u8) links.
            </p>
          </div>

          {/* Demo Videos Section */}
          {!isPlaying && (
            <div style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "2rem",
              backdropFilter: "blur(10px)",
            }}>
              <h3 style={{ marginBottom: "1.5rem" }}>📺 Try Demo Videos</h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                {demoVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handlePlay(video.url, video.type)}
                    style={{
                      padding: "1.5rem",
                      borderRadius: "12px",
                      border: "none",
                      background: video.gradient,
                      color: "#fff",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{video.icon}</div>
                    <div>{video.label}</div>
                    <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
                      {video.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video Player Section */}
          {isPlaying && (
            <div style={{
              animation: "fadeIn 0.5s ease-in",
            }}>
              <VideoPlayer url={videoUrl} type={videoType} />

              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button
                  onClick={() => setIsPlaying(false)}
                  style={{
                    padding: "1rem 2rem",
                    borderRadius: "12px",
                    border: "none",
                    background: "#ff4757",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  ❌ Close Player
                </button>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div style={{
            marginTop: "4rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "2rem",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📺</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Google Drive Support</h3>
              <p style={{ opacity: 0.8 }}>Direct playback from Google Drive links (all URL formats)</p>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "2rem",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>☁️</div>
              <h3 style={{ marginBottom: "0.5rem" }}>CDN Integration</h3>
              <p style={{ opacity: 0.8 }}>Stream from any CDN or hosting platform</p>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "2rem",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎬</div>
              <h3 style={{ marginBottom: "0.5rem" }}>HLS Streaming</h3>
              <p style={{ opacity: 0.8 }}>Adaptive bitrate streaming with .m3u8 files</p>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "2rem",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Fast & Smooth</h3>
              <p style={{ opacity: 0.8 }}>Optimized for performance and smooth playback</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          textAlign: "center",
          padding: "3rem 2rem",
          marginTop: "4rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          opacity: 0.7,
        }}>
          <p>Built with Next.js + HLS.js • Deployed on Vercel</p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        input:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}