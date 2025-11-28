import { useState, useEffect } from 'react';
import useHarmoniumAudio from '../hooks/useHarmoniumAudio';
import useShruti from '../hooks/useShruti';
import './Harmonium.css';
import './HarmoniumLoad.css';

const KEYBOARD_MAP = {
  '`': 55, '1': 56, 'q': 57, '2': 58, 'w': 59, 'e': 60, '4': 61, 'r': 62,
  '5': 63, 't': 64, 'y': 65, '7': 66, 'u': 67, '8': 68, 'i': 69,
  '9': 70, 'o': 71, 'p': 72, '-': 73, '[': 74, '=': 75, ']': 76, '\\': 77
};

const Harmonium = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [volume, setVolume] = useState(30);
  const [transpose, setTranspose] = useState(0);
  const [octave, setOctave] = useState(3);
  const [cents, setCents] = useState(0);
  const [stack, setStack] = useState(0);
  const [useReverb, setUseReverb] = useState(false);
  const [activeKeys, setActiveKeys] = useState(new Set());

  const {
    load,
    noteOn,
    noteOff,
    setGain,
    setOctave: setAudioOctave,
    setStack: setAudioStack,
    setGlobalCents,
    updateReverbState,
    updateShrutiRatios
  } = useHarmoniumAudio();

  const {
    toggleShruti,
    resetShruti,
    getSelectedOption,
    getJustIntonationRatios,
    SHRUTI_DEFINITIONS
  } = useShruti();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.repeat && KEYBOARD_MAP[e.key] !== undefined) {
        setActiveKeys(prev => new Set(prev).add(e.key));
        noteOn(KEYBOARD_MAP[e.key]);
      }
    };

    const handleKeyUp = (e) => {
      if (KEYBOARD_MAP[e.key] !== undefined) {
        setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(e.key);
          return newSet;
        });
        noteOff(KEYBOARD_MAP[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [noteOn, noteOff]);

  useEffect(() => {
    if (isLoaded) {
      const ratios = getJustIntonationRatios();
      updateShrutiRatios(transpose, ratios);
    }
  }, [transpose, isLoaded, getJustIntonationRatios, updateShrutiRatios]);

  const handleLoad = async () => {
    const ratios = getJustIntonationRatios();
    await load(ratios);
    setIsLoaded(true);
  };

  const handleShrutiToggle = (scaleIndex) => {
    toggleShruti(scaleIndex);
    // Need to wait for state update, use setTimeout
    setTimeout(() => {
      const ratios = getJustIntonationRatios();
      updateShrutiRatios(transpose, ratios);
    }, 0);
  };

  const handleShrutiReset = () => {
    resetShruti();
    // Need to wait for state update, use setTimeout
    setTimeout(() => {
      const ratios = getJustIntonationRatios();
      updateShrutiRatios(transpose, ratios);
    }, 0);
  };

  const handleVolumeChange = (e) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    setGain(vol / 100);
  };

  const handleCentsChange = (e) => {
    const c = parseInt(e.target.value);
    setCents(c);
    setGlobalCents(c);
  };

  const handleTranspose = (delta) => {
    setTranspose(prev => Math.max(-12, Math.min(12, prev + delta)));
  };

  const handleOctaveChange = (delta) => {
    const newOctave = Math.max(0, Math.min(6, octave + delta));
    setOctave(newOctave);
    setAudioOctave(newOctave);
  };

  const handleStackChange = (delta) => {
    const newStack = Math.max(0, Math.min(3, stack + delta));
    setStack(newStack);
    setAudioStack(newStack);
  };

  const handleReverbChange = (e) => {
    const checked = e.target.checked;
    setUseReverb(checked);
    updateReverbState(checked);
  };

  const getRootNote = () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[(transpose + 12) % 12];
  };

  const handleKeyPress = (key, isDown) => {
    if (isDown) {
      noteOn(KEYBOARD_MAP[key]);
    } else {
      noteOff(KEYBOARD_MAP[key]);
    }
  };

  if (!isLoaded) {
    return (
      <div className="harmonium-container">
        <div className="load-module">
          <button className="load-button" onClick={handleLoad}>
            Load Harmonium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="harmonium-container">
      <div className="app-header">
        <h2>Web Harmonium</h2>
      </div>

      <div className="main-shell">
        <div className="harmonium-stage">
          <div className="harmonium-shell">
            <div className="top-deck">
              <div className="brand-plaque">
                <span>Rajaraman Harmonium Co.</span>
                <small>Web Edition</small>
              </div>
              <div className="sound-grill"></div>
              <div className="stop-strip">
                <span className="stop-knob"></span>
                <span className="stop-knob"></span>
                <span className="stop-knob"></span>
              </div>
            </div>
            <div className="keyboard-panel">
              <div className="keybed">
                <svg viewBox="0 0 294 110" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="whiteKeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fefcf4" />
                      <stop offset="40%" stopColor="#f6ecd4" />
                      <stop offset="100%" stopColor="#d9c9a8" />
                    </linearGradient>
                    <linearGradient id="whiteKeyHover" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fff7da" />
                      <stop offset="45%" stopColor="#f1e1b4" />
                      <stop offset="100%" stopColor="#cdb485" />
                    </linearGradient>
                    <linearGradient id="blackKeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3c3c40" />
                      <stop offset="50%" stopColor="#151517" />
                      <stop offset="100%" stopColor="#050506" />
                    </linearGradient>
                    <linearGradient id="blackKeyHover" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4d4d52" />
                      <stop offset="50%" stopColor="#1f1f21" />
                      <stop offset="100%" stopColor="#070708" />
                    </linearGradient>
                  </defs>

                  {/* White keys */}
                  {['`', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'].map((key, index) => {
                    const xPositions = [0, 21, 42, 63, 84, 105, 126, 147, 168, 189, 210, 231, 252, 273];
                    return (
                      <polygon
                        key={key}
                        points={`${xPositions[index]},0 ${xPositions[index] + 21},0 ${xPositions[index] + 21},100 ${xPositions[index]},100`}
                        className={`white ${activeKeys.has(key) ? 'active' : ''}`}
                        onMouseDown={() => handleKeyPress(key, true)}
                        onMouseUp={() => handleKeyPress(key, false)}
                        onTouchStart={() => handleKeyPress(key, true)}
                        onTouchEnd={() => handleKeyPress(key, false)}
                      />
                    );
                  })}

                  {/* Key labels */}
                  <text x="70" y="90" fill="blue" fontFamily="courier new" fontWeight="bold" fontSize="14">C</text>
                  <text x="91" y="90" fill="blue" fontFamily="courier new" fontWeight="bold" fontSize="14">D</text>
                  <text x="112" y="90" fill="blue" fontFamily="courier new" fontWeight="bold" fontSize="14">E</text>
                  <text x="133" y="90" fill="blue" fontFamily="courier new" fontWeight="bold" fontSize="14">F</text>
                  <text x="154" y="90" fill="blue" fontFamily="courier new" fontWeight="bold" fontSize="14">G</text>
                  <text x="175" y="90" fill="blue" fontFamily="courier new" fontSize="14">A</text>
                  <text x="196" y="90" fill="blue" fontFamily="courier new" fontWeight="bold" fontSize="14">B</text>
                </svg>
              </div>
            </div>
            <div className="bellows"></div>
          </div>
        </div>

        <div className="control-deck">
          <div className="control-card">
            <div className="control-card__title">
              <h3>Volume</h3>
              <span className="value-pill">{volume}%</span>
            </div>
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

          <div className="control-card">
            <div className="control-card__title">
              <h3>Reverb</h3>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={useReverb}
                  onChange={handleReverbChange}
                />
                <span className="toggle"></span>
              </label>
            </div>
          </div>

          <div className="control-card">
            <div className="control-card__title">
              <h3>Transpose</h3>
              <span className="value-pill">{getRootNote()}</span>
            </div>
            <div className="control-stepper">
              <button className="stepper-button" onClick={() => handleTranspose(-1)}>-</button>
              <span className="stepper-value">{transpose}</span>
              <button className="stepper-button" onClick={() => handleTranspose(1)}>+</button>
            </div>
          </div>

          <div className="control-card">
            <div className="control-card__title">
              <h3>Fine Tune (Cents)</h3>
              <span className="value-pill">{cents}</span>
            </div>
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

          <div className="control-card">
            <div className="control-card__title">
              <h3>22 Shruti Selection</h3>
            </div>
            <p className="card-subtext">Tap any swara to cycle between the available shruti ratios. Sa and Pa remain fixed.</p>
            <div id="justIntonationControls" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
              {SHRUTI_DEFINITIONS.map(definition => {
                const selectedOption = getSelectedOption(definition.scaleIndex);
                return (
                  <button
                    key={definition.scaleIndex}
                    className="shruti-button"
                    onClick={() => handleShrutiToggle(definition.scaleIndex)}
                    title={`Toggle shruti for ${definition.swara}`}
                  >
                    {definition.swara} - {selectedOption?.label || ''}
                  </button>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '18px' }}>
              <button className="reset-shruti" onClick={handleShrutiReset}>Reset to Defaults</button>
            </div>
          </div>

          <div className="control-card">
            <div className="control-card__title">
              <h3>Current Octave</h3>
            </div>
            <div className="control-stepper">
              <button className="stepper-button" onClick={() => handleOctaveChange(-1)}>-</button>
              <span className="stepper-value">{octave}</span>
              <button className="stepper-button" onClick={() => handleOctaveChange(1)}>+</button>
            </div>
          </div>

          <div className="control-card">
            <div className="control-card__title">
              <h3>Additional Reeds</h3>
            </div>
            <div className="control-stepper">
              <button className="stepper-button" onClick={() => handleStackChange(-1)}>-</button>
              <span className="stepper-value">{stack}</span>
              <button className="stepper-button" onClick={() => handleStackChange(1)}>+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Harmonium;
