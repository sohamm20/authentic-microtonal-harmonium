# Web Harmonium & Tanpura

A modern React-based web application for playing virtual Harmonium and Tanpura instruments.

## Features

### Harmonium
- Virtual keyboard with mouse/touch and computer keyboard support
- MIDI keyboard support
- Volume control
- Reverb effects
- Transpose functionality
- Fine tuning (cents adjustment)
- Octave selection
- Additional reeds (stack) control
- 22 Shruti selection support

### Tanpura
- Continuous drone playback
- Pitch selection (B to A#)
- Madhyam Shruthi option
- Volume control
- Fine tuning (cents adjustment)

## Technology Stack

- React 19
- Vite
- React Router
- Web Audio API

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The app is configured for GitHub Pages deployment:

```bash
npm run build
```

Then commit the dist folder to deploy.

## Credits

Developed by Rajaraman Iyer

Original features maintained from the classic Web Harmonium and Web Tanpura applications, now migrated to a modern React architecture.
