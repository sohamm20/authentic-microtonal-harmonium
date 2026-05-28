import { useRef, useCallback } from 'react';

const OCTAVE_MAP = [-36, -24, -12, 0, 12, 24, 36];
const SAMPLE_URL = '/audio/harmonium/harmonium-kannan-orig.wav';
const REVERB_URL = '/audio/effects/reverb.wav';
const LOOP_START = 0.5;

const useHarmoniumAudio = () => {
  const contextRef = useRef(null);
  const audioBufferRef = useRef(null);
  const gainNodeRef = useRef(null);
  const compressorNodeRef = useRef(null);
  const reverbNodeRef = useRef(null);
  const sourceNodesRef = useRef([]); // Stores `{ source, gainNode }`
  const sourceNodeStateRef = useRef([]); // Stores 0/1 status
  const keyMapRef = useRef([]);
  const baseKeyMapRef = useRef([]);
  const currentOctaveRef = useRef(3); // Default octave 3 (matching original)
  const stackCountRef = useRef(0);
  const globalCentsOffsetRef = useRef(0);
  const useReverbRef = useRef(false);

  const initAudioContext = useCallback(() => {
    if (contextRef.current) return contextRef.current;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    contextRef.current = new AudioContextClass({ latencyHint: 'interactive' });
    return contextRef.current;
  }, []);

  const initGainNode = useCallback((initialGain = 0.3) => {
    if (!contextRef.current) return null;
    if (gainNodeRef.current) return gainNodeRef.current;
    
    gainNodeRef.current = contextRef.current.createGain();
    gainNodeRef.current.gain.value = initialGain;
    
    // Create master compressor to prevent sound cracking/clipping
    compressorNodeRef.current = contextRef.current.createDynamicsCompressor();
    compressorNodeRef.current.threshold.value = -3.0; // dB
    compressorNodeRef.current.knee.value = 10.0; // dB
    compressorNodeRef.current.ratio.value = 12.0;
    compressorNodeRef.current.attack.value = 0.003; // seconds
    compressorNodeRef.current.release.value = 0.1; // seconds

    gainNodeRef.current.connect(compressorNodeRef.current);
    compressorNodeRef.current.connect(contextRef.current.destination);

    return gainNodeRef.current;
  }, []);

  const loadAudioSample = useCallback((url) => {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.addEventListener('load', function () {
        contextRef.current.decodeAudioData(
          request.response,
          function (buffer) {
            audioBufferRef.current = buffer;
            resolve(buffer);
          },
          function (e) {
            console.error('ERROR: context.decodeAudioData:', e);
            reject(e);
          }
        );
      });

      request.addEventListener('error', reject);
      request.send();
    });
  }, []);

  const initReverbNode = useCallback((reverbUrl = REVERB_URL) => {
    return new Promise((resolve, reject) => {
      if (!contextRef.current) {
        reject(new Error('Audio context not initialized'));
        return;
      }
      if (reverbNodeRef.current) {
        resolve(reverbNodeRef.current);
        return;
      }

      reverbNodeRef.current = contextRef.current.createConvolver();

      const request = new XMLHttpRequest();
      request.open('GET', reverbUrl, true);
      request.responseType = 'arraybuffer';

      request.addEventListener('load', function () {
        contextRef.current.decodeAudioData(
          request.response,
          function (buffer) {
            reverbNodeRef.current.buffer = buffer;
            // Connect reverb to compressor instead of direct destination
            reverbNodeRef.current.connect(compressorNodeRef.current);
            resolve(reverbNodeRef.current);
          },
          function (e) {
            console.error('ERROR: reverb context.decodeAudioData:', e);
            reject(e);
          }
        );
      });

      request.addEventListener('error', reject);
      request.send();
    });
  }, []);

  const updateReverbState = useCallback((enabled) => {
    useReverbRef.current = enabled;
    if (enabled && gainNodeRef.current && reverbNodeRef.current) {
      gainNodeRef.current.connect(reverbNodeRef.current);
    } else if (gainNodeRef.current && reverbNodeRef.current) {
      try {
        gainNodeRef.current.disconnect(reverbNodeRef.current);
      } catch (err) {
        // Already disconnected
      }
    }
  }, []);

  const getJustIntonationCents = useCallback((noteNumber, transpose, justIntonationRatios) => {
    const tonic = 60 + transpose;
    const semitoneOffsetFromTonic = noteNumber - tonic;
    const octaveOffset = Math.floor(semitoneOffsetFromTonic / 12);
    const scaleIndex = ((semitoneOffsetFromTonic % 12) + 12) % 12;
    const ratioFromTonic = justIntonationRatios[scaleIndex] * Math.pow(2, octaveOffset);

    const sampleOffset = 62 - tonic; // ROOT_KEY (62) - tonic
    const sampleOctaveOffset = Math.floor(sampleOffset / 12);
    const sampleScaleIndex = ((sampleOffset % 12) + 12) % 12;

    // Default ratios for the sample
    const defaultRatios = [1, 256/243, 9/8, 32/27, 5/4, 4/3, 45/32, 3/2, 128/81, 5/3, 16/9, 15/8];
    let defaultRatioSample = defaultRatios[sampleScaleIndex];

    if (typeof defaultRatioSample !== "number" || isNaN(defaultRatioSample) || defaultRatioSample <= 0) {
      defaultRatioSample = 1;
    }

    const ratioSample = defaultRatioSample * Math.pow(2, sampleOctaveOffset);
    const finalRatio = ratioFromTonic / ratioSample;
    const log2 = Math.log2 || function (value) {
      return Math.log(value) / Math.LN2;
    };

    return 1200 * log2(finalRatio);
  }, []);

  const initKeyMap = useCallback((transpose = 0, justIntonationRatios = null) => {
    const startKey = (60 - 124) + (62 - 60); // MIDDLE_C - 124 + (ROOT_KEY - MIDDLE_C)

    // Default just intonation ratios if not provided
    const ratios = justIntonationRatios || [1, 256/243, 9/8, 32/27, 5/4, 4/3, 45/32, 3/2, 128/81, 5/3, 16/9, 15/8];

    for (let i = 0; i < 128; ++i) {
      baseKeyMapRef.current[i] = startKey + i;
      keyMapRef.current[i] = getJustIntonationCents(i, transpose, ratios);
    }

    const sourceNodesLength = sourceNodesRef.current.length;
    for (let i = 0; i < 128; ++i) {
      if (i < sourceNodesLength && sourceNodesRef.current[i]) {
        try {
          sourceNodesRef.current[i].source.stop(0);
        } catch (e) {}
      }
      sourceNodesRef.current[i] = null;
      sourceNodeStateRef.current[i] = 0;
    }
  }, [getJustIntonationCents]);

  const stopNoteAtIdx = useCallback((index) => {
    const activeNode = sourceNodesRef.current[index];
    if (activeNode) {
      const { source, gainNode } = activeNode;
      try {
        const now = contextRef.current.currentTime;
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.015);
        source.stop(now + 0.015);
      } catch (err) {
        try {
          source.stop(0);
        } catch (e) {}
      }
      sourceNodesRef.current[index] = null;
    }
    sourceNodeStateRef.current[index] = 0;
  }, []);

  const startNoteAtIdx = useCallback((index) => {
    stopNoteAtIdx(index);

    if (contextRef.current && contextRef.current.state === 'suspended') {
      contextRef.current.resume();
    }

    const source = contextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.loop = true;
    source.loopStart = LOOP_START;

    if (keyMapRef.current[index] != 0) {
      source.detune.value = keyMapRef.current[index] + globalCentsOffsetRef.current;
    } else {
      source.detune.value = globalCentsOffsetRef.current;
    }

    const noteGain = contextRef.current.createGain();
    noteGain.gain.setValueAtTime(0, contextRef.current.currentTime);
    noteGain.gain.linearRampToValueAtTime(1, contextRef.current.currentTime + 0.002);

    source.connect(noteGain);
    noteGain.connect(gainNodeRef.current);

    source.start(0);

    sourceNodesRef.current[index] = { source, gainNode: noteGain };
    sourceNodeStateRef.current[index] = 1;
  }, [stopNoteAtIdx]);

  const noteOn = useCallback((note) => {
    let i = note + OCTAVE_MAP[currentOctaveRef.current];

    if (i < sourceNodeStateRef.current.length && sourceNodeStateRef.current[i] == 0) {
      startNoteAtIdx(i);
    }

    for (let c = 1; c <= stackCountRef.current; ++c) {
      i = note + OCTAVE_MAP[currentOctaveRef.current + c];
      if (i < sourceNodeStateRef.current.length && sourceNodeStateRef.current[i] == 0) {
        startNoteAtIdx(i);
      }
    }
  }, [startNoteAtIdx]);

  const noteOff = useCallback((note) => {
    let i = note + OCTAVE_MAP[currentOctaveRef.current];

    if (i < sourceNodeStateRef.current.length) {
      stopNoteAtIdx(i);
    }

    for (let c = 1; c <= stackCountRef.current; ++c) {
      i = note + OCTAVE_MAP[currentOctaveRef.current + c];
      if (i < sourceNodeStateRef.current.length) {
        stopNoteAtIdx(i);
      }
    }
  }, [stopNoteAtIdx]);

  const setGain = useCallback((value) => {
    if (gainNodeRef.current !== null) {
      gainNodeRef.current.gain.value = value;
    }
  }, []);

  const setOctave = useCallback((octave) => {
    if (octave >= 0 && octave <= 6) {
      currentOctaveRef.current = octave;
    }
  }, []);

  const setStack = useCallback((count) => {
    if (count < 0) {
      stackCountRef.current = 0;
    } else if (currentOctaveRef.current + count > 6) {
      stackCountRef.current = 6 - currentOctaveRef.current;
    } else {
      stackCountRef.current = count;
    }
  }, []);

  const setGlobalCents = useCallback((cents) => {
    globalCentsOffsetRef.current = cents;
    for (let i = 0; i < sourceNodesRef.current.length; ++i) {
      const activeNode = sourceNodesRef.current[i];
      if (activeNode && sourceNodeStateRef.current[i] === 1) {
        const source = activeNode.source;
        if (keyMapRef.current[i] != 0) {
          source.detune.value = keyMapRef.current[i] + globalCentsOffsetRef.current;
        } else {
          source.detune.value = globalCentsOffsetRef.current;
        }
      }
    }
  }, []);

  const load = useCallback(async (justIntonationRatios = null) => {
    try {
      initAudioContext();
      initGainNode(0.3);
      initKeyMap(0, justIntonationRatios);
      await initReverbNode();
      await loadAudioSample(SAMPLE_URL);
    } catch (error) {
      console.error('Error loading harmonium:', error);
      throw error;
    }
  }, [initAudioContext, initGainNode, initKeyMap, initReverbNode, loadAudioSample]);

  const updateShrutiRatios = useCallback((transpose, justIntonationRatios) => {
    initKeyMap(transpose, justIntonationRatios);
  }, [initKeyMap]);

  return {
    load,
    noteOn,
    noteOff,
    setGain,
    setOctave,
    setStack,
    setGlobalCents,
    updateReverbState,
    updateShrutiRatios
  };
};

export default useHarmoniumAudio;
