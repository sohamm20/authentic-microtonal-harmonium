import { useRef, useCallback } from 'react';

const OCTAVE_MAP = [-36, -24, -12, 0, 12, 24, 36];
const SAMPLE_URL = '/audio/harmonium/harmonium-kannan-orig.wav';
const REVERB_URL = '/audio/effects/reverb.wav';
const LOOP_START = 0.5;

const useHarmoniumAudio = () => {
  const contextRef = useRef(null);
  const audioBufferRef = useRef(null);
  const gainNodeRef = useRef(null);
  const reverbNodeRef = useRef(null);
  const sourceNodesRef = useRef([]);
  const sourceNodeStateRef = useRef([]);
  const keyMapRef = useRef([]);
  const baseKeyMapRef = useRef([]);
  const currentOctaveRef = useRef(3); // Default octave 3 (matching original)
  const stackCountRef = useRef(0);
  const globalCentsOffsetRef = useRef(0);
  const useReverbRef = useRef(false);

  const initAudioContext = useCallback(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    contextRef.current = new AudioContextClass();
    return contextRef.current;
  }, []);

  const initGainNode = useCallback((initialGain = 0.3) => {
    if (!contextRef.current) return null;
    gainNodeRef.current = contextRef.current.createGain();
    gainNodeRef.current.gain.value = initialGain;
    gainNodeRef.current.connect(contextRef.current.destination);
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

      reverbNodeRef.current = contextRef.current.createConvolver();

      const request = new XMLHttpRequest();
      request.open('GET', reverbUrl, true);
      request.responseType = 'arraybuffer';

      request.addEventListener('load', function () {
        contextRef.current.decodeAudioData(
          request.response,
          function (buffer) {
            reverbNodeRef.current.buffer = buffer;
            reverbNodeRef.current.connect(contextRef.current.destination);
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

    for (let i = 0; i < keyMapRef.current.length; ++i) {
      sourceNodesRef.current[i] = null;
      sourceNodeStateRef.current[i] = 0;
    }
  }, [getJustIntonationCents]);

  const setSourceNode = useCallback((index) => {
    if (sourceNodesRef.current[index] != null && sourceNodeStateRef.current[index] == 1) {
      sourceNodesRef.current[index].stop(0);
    }

    sourceNodeStateRef.current[index] = 0;
    sourceNodesRef.current[index] = null;
    sourceNodesRef.current[index] = contextRef.current.createBufferSource();
    sourceNodesRef.current[index].connect(gainNodeRef.current).connect(contextRef.current.destination);
    sourceNodesRef.current[index].buffer = audioBufferRef.current;
    sourceNodesRef.current[index].loop = true;
    sourceNodesRef.current[index].loopStart = LOOP_START;

    if (keyMapRef.current[index] != 0) {
      sourceNodesRef.current[index].detune.value = keyMapRef.current[index] + globalCentsOffsetRef.current;
    } else {
      sourceNodesRef.current[index].detune.value = globalCentsOffsetRef.current;
    }
  }, []);

  const noteOn = useCallback((note) => {
    let i = note + OCTAVE_MAP[currentOctaveRef.current];

    if (i < sourceNodesRef.current.length && sourceNodeStateRef.current[i] == 0) {
      setSourceNode(i);
      sourceNodesRef.current[i].start(0);
      sourceNodeStateRef.current[i] = 1;
    }

    for (let c = 1; c <= stackCountRef.current; ++c) {
      i = note + OCTAVE_MAP[currentOctaveRef.current + c];
      if (i < sourceNodesRef.current.length && sourceNodeStateRef.current[i] == 0) {
        setSourceNode(i);
        sourceNodesRef.current[i].start(0);
        sourceNodeStateRef.current[i] = 1;
      }
    }
  }, [setSourceNode]);

  const noteOff = useCallback((note) => {
    let i = note + OCTAVE_MAP[currentOctaveRef.current];

    if (i < sourceNodesRef.current.length) {
      setSourceNode(i);
    }

    for (let c = 1; c <= stackCountRef.current; ++c) {
      i = note + OCTAVE_MAP[currentOctaveRef.current + c];
      if (i < sourceNodesRef.current.length) {
        setSourceNode(i);
      }
    }
  }, [setSourceNode]);

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
      if (sourceNodesRef.current[i] && sourceNodeStateRef.current[i] === 1) {
        if (keyMapRef.current[i] != 0) {
          sourceNodesRef.current[i].detune.value = keyMapRef.current[i] + globalCentsOffsetRef.current;
        } else {
          sourceNodesRef.current[i].detune.value = globalCentsOffsetRef.current;
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
