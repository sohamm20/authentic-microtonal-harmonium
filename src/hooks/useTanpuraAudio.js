import { useRef, useCallback } from 'react';

const useTanpuraAudio = () => {
  const contextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const audioBufferRef = useRef(null);

  const initAudioContext = useCallback(() => {
    if (!contextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      contextRef.current = new AudioContextClass();
      gainNodeRef.current = contextRef.current.createGain();
      gainNodeRef.current.gain.value = 0.3;
      gainNodeRef.current.connect(contextRef.current.destination);
    }
    return contextRef.current;
  }, []);

  const resetSound = useCallback(() => {
    if (sourceNodeRef.current != null) {
      try {
        sourceNodeRef.current.stop(0);
      } catch (e) {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }

    if (!contextRef.current || !audioBufferRef.current) return;

    sourceNodeRef.current = contextRef.current.createBufferSource();
    sourceNodeRef.current.connect(gainNodeRef.current);
    sourceNodeRef.current.buffer = audioBufferRef.current;
    sourceNodeRef.current.loop = true;
    sourceNodeRef.current.start(0);
  }, []);

  const play = useCallback(async (sampleUrl) => {
    initAudioContext();

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', sampleUrl, true);
      request.responseType = 'arraybuffer';

      request.addEventListener('load', function () {
        contextRef.current.decodeAudioData(
          request.response,
          function (buffer) {
            audioBufferRef.current = buffer;
            resetSound();
            resolve();
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
  }, [initAudioContext, resetSound]);

  const stop = useCallback(() => {
    if (sourceNodeRef.current != null) {
      try {
        sourceNodeRef.current.stop(0);
      } catch (e) {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }
  }, []);

  const setGain = useCallback((value) => {
    if (gainNodeRef.current != null) {
      gainNodeRef.current.gain.value = value;
    }
  }, []);

  const setCentsDetune = useCallback((cents) => {
    if (sourceNodeRef.current != null) {
      sourceNodeRef.current.detune.value = cents;
    }
  }, []);

  return {
    play,
    stop,
    setGain,
    setCentsDetune
  };
};

export default useTanpuraAudio;
