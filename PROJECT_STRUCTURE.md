# Web Harmonium & Tanpura - Final Project Structure

## Root Directory (Clean & Organized)

```
rajaramaniyer.github.io/
│
├── 📁 .git/                    # Git version control
├── 📄 .gitignore               # Git ignore rules
├── 📄 README.md                # Project documentation
│
├── 📁 dist/                    # Production build (generated)
│   ├── index.html
│   ├── assets/                 # Bundled JS/CSS
│   ├── audio/                  # Audio files (copied)
│   └── images/                 # Images (copied)
│
├── 📁 public/                  # Static assets (copied to dist)
│   ├── 📁 audio/
│   │   ├── 📁 harmonium/
│   │   │   └── harmonium-kannan-orig.wav (1.9MB)
│   │   ├── 📁 tanpura/
│   │   │   ├── a.wav, as.wav, b.wav, c.wav...      (12 standard)
│   │   │   └── ma.wav, mas.wav, mb.wav, mc.wav...  (12 madhyam)
│   │   └── 📁 effects/
│   │       └── reverb.wav (1MB)
│   ├── 📁 images/icons/        # App icons
│   ├── favicon.ico
│   ├── vite.svg
│   └── webharmonium.png
│
├── 📁 src/                     # React source code
│   ├── 📁 components/
│   │   ├── Harmonium.jsx       # Harmonium component
│   │   ├── Harmonium.css       # Harmonium styles
│   │   ├── HarmoniumLoad.css   # Load screen
│   │   ├── Tanpura.jsx         # Tanpura component
│   │   └── Tanpura.css         # Tanpura styles
│   │
│   ├── 📁 hooks/
│   │   ├── useHarmoniumAudio.js  # Harmonium Web Audio API
│   │   └── useTanpuraAudio.js    # Tanpura Web Audio API
│   │
│   ├── 📁 modules/             # Original modules (reference)
│   │   ├── audio.js
│   │   ├── constants.js
│   │   ├── keyboard.js
│   │   ├── midi.js
│   │   ├── shruti.js
│   │   ├── storage.js
│   │   └── ui.js
│   │
│   ├── App.jsx                 # Main app with routing
│   ├── App.css                 # App styles
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
│
├── 📄 index.html               # Vite entry HTML
├── 📄 package.json             # Project configuration
├── 📄 package-lock.json        # Dependency lock
├── 📄 vite.config.js           # Vite build config
└── 📄 eslint.config.js         # ESLint configuration
```

## Audio Files Breakdown

### Harmonium Audio (1 file)
- `harmonium-kannan-orig.wav` - Base harmonium sample (1.9MB)

### Tanpura Audio (24 files)
**Standard Pitches (12 files):**
- `a.wav`, `as.wav`, `b.wav`, `c.wav`, `cs.wav`, `d.wav`
- `ds.wav`, `e.wav`, `f.wav`, `fs.wav`, `g.wav`, `gs.wav`

**Madhyam Pitches (12 files):**
- `ma.wav`, `mas.wav`, `mb.wav`, `mc.wav`, `mcs.wav`, `md.wav`
- `mds.wav`, `me.wav`, `mf.wav`, `mfs.wav`, `mg.wav`, `mgs.wav`

### Effects (1 file)
- `reverb.wav` - Reverb impulse response (1MB)

**Total:** 26 audio files (~22MB)

## Key Features

### What's Included:
✅ Modern React 19 architecture
✅ React Router for navigation
✅ Custom Web Audio API hooks
✅ Organized file structure
✅ Optimized production build
✅ Clean, maintainable codebase

### What Was Removed:
❌ 40+ old HTML files (religious texts, widgets, etc.)
❌ Encrypted JSON files
❌ Duplicate audio files
❌ Legacy images and icons
❌ Old site configuration files
❌ Unnecessary backup folders

## Build Output

```bash
npm run build
```

Creates:
- `dist/index.html` (0.46 kB)
- `dist/assets/index-[hash].css` (14.52 kB → 3.66 kB gzipped)
- `dist/assets/index-[hash].js` (239 kB → 75.8 kB gzipped)
- `dist/audio/` (all organized audio files)
- `dist/images/` (all icons)

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Navigation

- `/` - Harmonium
- `/tanpura` - Tanpura

Both accessible via navigation bar at the top.
