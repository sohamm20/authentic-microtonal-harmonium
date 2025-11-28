import { useState } from 'react';
import useTanpuraAudio from '../hooks/useTanpuraAudio';
import './Tanpura.css';

const PITCHES = [
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
  { value: 'cs', label: 'C#' },
  { value: 'd', label: 'D' },
  { value: 'ds', label: 'D#' },
  { value: 'e', label: 'E' },
  { value: 'f', label: 'F' },
  { value: 'fs', label: 'F#' },
  { value: 'g', label: 'G' },
  { value: 'gs', label: 'G#' },
  { value: 'a', label: 'A' },
  { value: 'as', label: 'A#' },
];

const Tanpura = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPitch, setSelectedPitch] = useState('c');
  const [madhyam, setMadhyam] = useState(false);
  const [volume, setVolume] = useState(30);
  const [cents, setCents] = useState(0);

  const {
    play,
    stop,
    setGain,
    setCentsDetune
  } = useTanpuraAudio();

  const handlePlayStop = async () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      const prefix = madhyam ? 'm' : '';
      const sampleUrl = `/audio/tanpura/${prefix}${selectedPitch}.wav`;
      await play(sampleUrl);
      setIsPlaying(true);
    }
  };

  const handlePitchChange = async (pitch) => {
    setSelectedPitch(pitch);
    if (isPlaying) {
      stop();
      const prefix = madhyam ? 'm' : '';
      const sampleUrl = `/audio/tanpura/${prefix}${pitch}.wav`;
      await play(sampleUrl);
    }
  };

  const handleMadhyamChange = async (e) => {
    const checked = e.target.checked;
    setMadhyam(checked);
    if (isPlaying) {
      stop();
      const prefix = checked ? 'm' : '';
      const sampleUrl = `/audio/tanpura/${prefix}${selectedPitch}.wav`;
      await play(sampleUrl);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    setGain(vol / 100);
  };

  const handleCentsChange = (e) => {
    const c = parseInt(e.target.value);
    setCents(c);
    setCentsDetune(c);
  };

  return (
    <div className="tanpura-container">
      <div className="app-header">
        <h2>Web Tanpura</h2>
      </div>

      <div className="tanpura-main">
        <div className="tanpura-card">
          <h3>Volume: <span className="value-display">{volume}%</span></h3>
          <div className="slidecontainer">
            <input
              type="range"
              min="1"
              max="100"
              value={volume}
              className="slider"
              onChange={handleVolumeChange}
            />
          </div>
        </div>

        <div className="tanpura-card">
          <h3>Fine Tune (Cents): <span className="value-display">{cents}</span></h3>
          <div className="slidecontainer">
            <input
              type="range"
              min="-25"
              max="25"
              value={cents}
              className="slider"
              onChange={handleCentsChange}
            />
          </div>
        </div>

        <div className="tanpura-card">
          <h3>Madhyam Shruthi</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={madhyam}
              onChange={handleMadhyamChange}
            />
            <span className="fancycheckbox round"></span>
          </label>
        </div>

        <div className="tanpura-card">
          <h3>Select Pitch</h3>
          <div className="pitch-grid">
            {PITCHES.map((pitch) => (
              <button
                key={pitch.value}
                className={`pitch-button ${selectedPitch === pitch.value ? 'selected' : ''}`}
                onClick={() => handlePitchChange(pitch.value)}
              >
                {pitch.label}
              </button>
            ))}
          </div>
        </div>

        <div className="tanpura-card center">
          <button
            className={`play-stop-button ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlayStop}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tanpura;
