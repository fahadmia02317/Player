# 🎬 Ultimate Video Player

A modern, multi-format video player built with **Next.js 14** and **HLS.js** that supports Google Drive, CDN, and HLS (.m3u8) streaming.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Google Drive** | Play videos directly from Google Drive links (all URL formats) |
| **HLS Streaming** | Adaptive bitrate streaming with .m3u8 files via HLS.js |
| **CDN/MP4/WebM** | Native HTML5 playback for standard video formats |
| **Live Stream Detection** | Automatic detection of live HLS streams with 🔴 LIVE badge |
| **Keyboard Shortcuts** | Full keyboard control (Space, Arrows, Numbers, F, M, etc.) |
| **Playback Controls** | Speed (0.5x–2x), Volume, Progress bar, Fullscreen |
| **Error Handling** | User-friendly error messages with retry option |
| **Responsive Design** | Works on desktop and mobile |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

Open http://localhost:3000 in your browser.

## 📁 Project Structure

```
Player/
├── components/
│   └── VideoPlayer.js      # Main video player component
├── pages/
│   ├── _app.js             # Next.js App wrapper
│   └── index.js            # Home page with demo videos
├── styles/
│   └── globals.css         # Global styles
├── next.config.js          # Next.js configuration
├── vercel.json             # Vercel deployment config
├── package.json
└── README.md
```

## 🎮 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space / K | Play / Pause |
| ← / J | Rewind 10 seconds |
| → / L | Forward 10 seconds |
| ↑ / ↓ | Volume up / down |
| M | Mute / Unmute |
| F | Toggle fullscreen |
| 0 | Jump to start |
| 1–9 | Seek to 10%–90% |

## 🔗 Supported URL Formats

### Google Drive
- https://drive.google.com/file/d/FILE_ID/view
- https://drive.google.com/open?id=FILE_ID
- https://drive.google.com/uc?id=FILE_ID
- https://drive.google.com/d/FILE_ID

### HLS Streams
- .m3u8 files
- .m3u playlists
- HLS manifest URLs

### Standard Video
- .mp4, .webm, .ogg, .mov, .mkv, .avi
- Blob URLs

## ⚠️ Known Limitations

1. **Google Drive CORS**: Some browsers block Google Drive streaming due to CORS policy. For best results, use direct MP4 or HLS links.
2. **Private Drive Files**: Videos must be publicly accessible or shared with "Anyone with the link".
3. **Safari HLS**: Uses native HLS support (no HLS.js needed).

## 🛠 Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **React**: 18.2.0
- **HLS.js**: 1.5.17 (HLS streaming)
- **Styling**: CSS-in-JS (styled-jsx) + Global CSS
- **Deployment**: Vercel

## 📦 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

```bash
# Or use Vercel CLI
npx vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Bug Fixes (Latest)

- ✅ Fixed HLS live stream detection
- ✅ Fixed progress bar for live streams (disabled seeking)
- ✅ Fixed memory leaks with proper cleanup
- ✅ Fixed keyboard shortcuts (added contentEditable check)
- ✅ Fixed Safari native HLS support
- ✅ Fixed duration display for infinite/live streams
- ✅ Fixed event listener cleanup on unmount
- ✅ Added useCallback/useMemo for performance
- ✅ Added proper error boundaries and retry mechanism

## 📄 License

MIT License - feel free to use in your projects!

---

**Built with ❤️ using Next.js + HLS.js**