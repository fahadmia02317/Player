import React, { useState } from "react";
import Head from "next/head";
import VideoPlayer from "../components/VideoPlayer";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("hls");
  const [isPlaying, setIsPlaying] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const handlePlay = (url, type) => {
    setVideoUrl(url);
    setVideoType(type);
    setIsPlaying(true);
  };

  const handleCustomPlay = () => {
    if (!customUrl.trim()) return;
    
    // Auto-detect type based on URL
    let type = "mp4";
    if (customUrl.includes(".m3u8") || customUrl.includes("hls")) {
      type = "hls";
    } else if (customUrl.includes("drive.google.com")) {
      type = "drive";
    }
    
    setVideoUrl(customUrl);
    setVideoType(type);
    setIsPlaying(true);
  };

  return (
    <>
      <Head>
        <title>🎬 Ultimate Video Player - Drive, CDN & m3u8 Support</title>
        <meta name="description" content="Multi-format Video Player supporting Google Drive, CDN, and HLS streams" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
              💡 Supports: .m3u8 (HLS), MP4, WebM, Google Drive direct links
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
                {/* HLS Stream */}
                <button
                  onClick={() => handlePlay("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", "hls")}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📺</div>
                  <div>HLS Test Stream</div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
                    .m3u8 format • Adaptive bitrate streaming
                  </div>
                </button>

                {/* MP4 Sample */}
                <button
                  onClick={() => handlePlay("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "mp4")}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎥</div>
                  <div>Big Buck Bunny</div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
                    MP4 format • Classic open source film
                  </div>
                </button>

                {/* W3Schools Video */}
                <button
                  onClick={() => handlePlay("https://www.w3schools.com/html/mov_bbb.mp4", "mp4")}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎞️</div>
                  <div>W3Schools Sample</div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
                    MP4 format • Educational content
                  </div>
                </button>

                {/* Another HLS Stream */}
                <button
                  onClick={() => handlePlay("https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8", "hls")}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌊</div>
                  <div>Tears of Steel</div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
                    HLS format • Open movie project
                  </div>
                </button>
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
              <p style={{ opacity: 0.8 }}>Direct playback from Google Drive links</p>
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
      `}</style>
    </>
  );
}
