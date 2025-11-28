/**
 * Audio engine for Web Harmonium
 */

import { CONFIG, OCTAVE_MAP } from './constants.js';
import { getJustIntonationCents } from './shruti.js';

// Audio context and nodes
let context = null;
let audioBuffer = null;
let gainNode = null;
let reverbNode = null;
let useReverb = false;

// Source nodes for each key
let sourceNodes = new Array();
let sourceNodeState = new Array();

// Key mapping
let keyMap = new Array();
let baseKeyMap = new Array();

// Current state
let currentOctave = CONFIG.DEFAULT_OCTAVE;
let stackCount = 0;
let globalCentsOffset = 0;

/**
 * Initialize audio context
 * @returns {AudioContext}
 */
export function initAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    context = new AudioContextClass();
    return context;
}

/**
 * Get the audio context
 * @returns {AudioContext|null}
 */
export function getAudioContext() {
    return context;
}

/**
 * Create and initialize gain node
 * @param {number} initialGain - Initial gain value (0-1)
 * @returns {GainNode}
 */
export function initGainNode(initialGain = CONFIG.DEFAULT_VOLUME) {
    gainNode = context.createGain();
    gainNode.gain.value = initialGain;
    gainNode.connect(context.destination);
    return gainNode;
}

/**
 * Set gain value
 * @param {number} value - Gain value (0-1)
 */
export function setGain(value) {
    if (gainNode !== null) {
        gainNode.gain.value = value;
    }
}

/**
 * Load audio sample
 * @param {string} url - Sample URL
 * @returns {Promise<AudioBuffer>}
 */
export function loadAudioSample(url) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.addEventListener('load', function () {
            context.decodeAudioData(
                request.response,
                function (buffer) {
                    if (CONFIG.DEBUG) console.log("Got sample. Size", buffer.length);
                    audioBuffer = buffer;
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
}

/**
 * Initialize reverb node
 * @param {string} reverbUrl - Reverb impulse response URL
 * @returns {Promise<ConvolverNode>}
 */
export function initReverbNode(reverbUrl = 'reverb.wav') {
    return new Promise((resolve, reject) => {
        reverbNode = context.createConvolver();

        const request = new XMLHttpRequest();
        request.open('GET', reverbUrl, true);
        request.responseType = 'arraybuffer';

        request.addEventListener('load', function () {
            context.decodeAudioData(
                request.response,
                function (buffer) {
                    if (CONFIG.DEBUG) console.log("Got reverb. Size", buffer.length);
                    reverbNode.buffer = buffer;
                    reverbNode.connect(context.destination);
                    resolve(reverbNode);
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
}

/**
 * Update reverb state
 * @param {boolean} enabled - Enable or disable reverb
 */
export function updateReverbState(enabled) {
    useReverb = enabled;
    if (useReverb && gainNode && reverbNode) {
        gainNode.connect(reverbNode);
    } else if (gainNode && reverbNode) {
        try {
            gainNode.disconnect(reverbNode);
        } catch (err) {
            // Already disconnected
        }
    }
}

/**
 * Get reverb state
 * @returns {boolean}
 */
export function getReverbState() {
    return useReverb;
}

/**
 * Initialize key mapping
 * @param {number} transpose - Transpose value
 */
export function initKeyMap(transpose) {
    const startKey = (CONFIG.MIDDLE_C - 124) + (CONFIG.ROOT_KEY - CONFIG.MIDDLE_C);

    for (let i = 0; i < 128; ++i) {
        baseKeyMap[i] = startKey + i;
        keyMap[i] = getJustIntonationCents(i, transpose);
    }

    if (CONFIG.DEBUG) {
        console.log("baseKeyMap:", baseKeyMap);
        console.log("keyMap:", keyMap);
    }

    for (let i = 0; i < keyMap.length; ++i) {
        if (CONFIG.DEBUG) console.log("Building keySound", i, "keyMap", keyMap[i]);
        sourceNodes[i] = null;
        setSourceNode(i);
    }
}

/**
 * Set source node for a specific key
 * @param {number} index - Key index
 */
function setSourceNode(index) {
    if (sourceNodes[index] != null && sourceNodeState[index] == 1) {
        sourceNodes[index].stop(0);
    }

    sourceNodeState[index] = 0;
    sourceNodes[index] = null;
    sourceNodes[index] = context.createBufferSource();
    sourceNodes[index].connect(gainNode).connect(context.destination);
    sourceNodes[index].buffer = audioBuffer;
    sourceNodes[index].loop = CONFIG.LOOP;
    sourceNodes[index].loopStart = CONFIG.LOOP_START;

    if (keyMap[index] != 0) {
        sourceNodes[index].detune.value = keyMap[index] + globalCentsOffset;
    } else {
        sourceNodes[index].detune.value = globalCentsOffset;
    }
}

/**
 * Play a note
 * @param {number} note - MIDI note number
 */
export function noteOn(note) {
    let i = note + OCTAVE_MAP[currentOctave];
    if (CONFIG.DEBUG) console.log("noteOn", note, "currentOctave", currentOctave, "i", i);

    if (i < sourceNodes.length && sourceNodeState[i] == 0) {
        sourceNodes[i].start(0);
        sourceNodeState[i] = 1;
    }

    for (let c = 1; c <= stackCount; ++c) {
        i = note + OCTAVE_MAP[currentOctave + c];
        if (i < sourceNodes.length && sourceNodeState[i] == 0) {
            sourceNodes[i].start(0);
            sourceNodeState[i] = 1;
        }
    }
}

/**
 * Stop a note
 * @param {number} note - MIDI note number
 */
export function noteOff(note) {
    let i = note + OCTAVE_MAP[currentOctave];
    if (CONFIG.DEBUG) console.log("noteOff", note, "currentOctave", currentOctave, "i", i);

    if (i < sourceNodes.length) {
        setSourceNode(i);
    }

    for (let c = 1; c <= stackCount; ++c) {
        i = note + OCTAVE_MAP[currentOctave + c];
        if (i < sourceNodes.length) {
            setSourceNode(i);
        }
    }
}

/**
 * Set current octave
 * @param {number} octave - Octave value (0-6)
 */
export function setOctave(octave) {
    if (octave >= 0 && octave <= 6) {
        currentOctave = octave;
    }
}

/**
 * Get current octave
 * @returns {number}
 */
export function getOctave() {
    return currentOctave;
}

/**
 * Set stack count (additional reeds)
 * @param {number} count - Stack count
 */
export function setStack(count) {
    if (count < 0) {
        stackCount = 0;
    } else if (currentOctave + count > 6) {
        stackCount = 6 - currentOctave;
    } else {
        stackCount = count;
    }
}

/**
 * Get stack count
 * @returns {number}
 */
export function getStack() {
    return stackCount;
}

/**
 * Get audio buffer
 * @returns {AudioBuffer|null}
 */
export function getAudioBuffer() {
    return audioBuffer;
}

/**
 * Set global cents offset (fine tuning)
 * @param {number} cents - Cents offset value
 */
export function setGlobalCents(cents) {
    globalCentsOffset = cents;
    // Update all active source nodes
    for (let i = 0; i < sourceNodes.length; ++i) {
        if (sourceNodes[i] && sourceNodeState[i] === 1) {
            if (keyMap[i] != 0) {
                sourceNodes[i].detune.value = keyMap[i] + globalCentsOffset;
            } else {
                sourceNodes[i].detune.value = globalCentsOffset;
            }
        }
    }
}

/**
 * Get global cents offset
 * @returns {number}
 */
export function getGlobalCents() {
    return globalCentsOffset;
}
