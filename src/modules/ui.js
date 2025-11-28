/**
 * UI control handlers for Web Harmonium
 */

import { BASE_KEY_NAMES } from './constants.js';
import { setGain, setOctave, getOctave, setStack, getStack, setGlobalCents } from './audio.js';
import { setVolume, setOctave as saveOctave, setTranspose as saveTranspose, setStack as saveStack, setCents as saveCents } from './storage.js';

/**
 * Handle volume/gain change
 */
export function onGainChange() {
    const volumeSlider = document.getElementById("myRange");
    const volumeLevel = document.getElementById('volumeLevel');

    if (!volumeSlider) return;

    const volume = volumeSlider.value;
    setVolume(volume);

    if (volumeLevel) {
        volumeLevel.innerText = volume + "%";
    }

    setGain(volume / 100);
}

/**
 * Shift octave up or down
 * @param {number} delta - Amount to shift (-1 or +1)
 */
export function shiftOctave(delta) {
    const currentOctave = getOctave();

    if (currentOctave + delta >= 0 && currentOctave + delta <= 6) {
        const newOctave = currentOctave + delta;
        setOctave(newOctave);
        saveOctave(newOctave);

        const octaveDisplay = document.getElementById('octave');
        if (octaveDisplay) {
            octaveDisplay.innerText = newOctave;
        }
    }
}

/**
 * Change stack count (additional reeds)
 * @param {number} delta - Amount to change (-1 or +1)
 */
export function changeStack(delta) {
    const currentOctave = getOctave();
    let stackCount = getStack();
    stackCount += delta;

    if (stackCount < 0) {
        stackCount = 0;
    } else if (currentOctave + stackCount > 6) {
        stackCount = 6 - currentOctave;
    }

    setStack(stackCount);
    saveStack(stackCount);

    const stackDisplay = document.getElementById('stack');
    if (stackDisplay) {
        stackDisplay.innerText = stackCount;
    }
}

/**
 * Shift semitone (transpose) up or down
 * @param {number} delta - Amount to shift (-1 or +1)
 * @param {Function} reinitCallback - Callback to reinitialize audio
 */
export function shiftSemitone(delta, reinitCallback) {
    const transposeDisplay = document.getElementById('transpose');
    const rootNoteDisplay = document.getElementById('rootNote');

    if (!transposeDisplay) return;

    let currentSemitone = parseInt(transposeDisplay.innerText);

    if (currentSemitone + delta >= -11 && currentSemitone + delta <= 11) {
        currentSemitone += delta;
        transposeDisplay.innerText = currentSemitone;

        if (rootNoteDisplay) {
            const noteIndex = (currentSemitone >= 0) ? currentSemitone % 12 : currentSemitone + 12;
            rootNoteDisplay.innerText = BASE_KEY_NAMES[noteIndex];
        }

        saveTranspose(currentSemitone);

        if (typeof reinitCallback === 'function') {
            reinitCallback();
        }
    }
}

/**
 * Initialize UI with stored values
 * @param {Object} values - Object containing volume, octave, transpose, stack, cents
 */
export function initializeUI(values) {
    const { volume, octave, transpose, stack, cents } = values;

    // Volume
    const volumeSlider = document.getElementById("myRange");
    const volumeLevel = document.getElementById('volumeLevel');
    if (volumeSlider && volume !== null) {
        volumeSlider.value = volume;
        if (volumeLevel) {
            volumeLevel.innerText = volume + "%";
        }
    }

    // Octave
    const octaveDisplay = document.getElementById('octave');
    if (octaveDisplay && octave !== null && octave !== undefined) {
        octaveDisplay.innerText = octave;
        setOctave(octave);
    }

    // Transpose
    const transposeDisplay = document.getElementById('transpose');
    const rootNoteDisplay = document.getElementById('rootNote');
    if (transposeDisplay && transpose !== null) {
        transposeDisplay.innerText = transpose;
        if (rootNoteDisplay) {
            const noteIndex = (transpose >= 0) ? transpose % 12 : transpose + 12;
            rootNoteDisplay.innerText = BASE_KEY_NAMES[noteIndex];
        }
    }

    // Stack
    const stackDisplay = document.getElementById('stack');
    if (stackDisplay && stack !== null && stack !== undefined) {
        stackDisplay.innerText = stack;
        setStack(stack);
    }

    // Cents
    const centsSlider = document.getElementById("centsRange");
    const centsLevel = document.getElementById('centsLevel');
    if (centsSlider && cents !== null && cents !== undefined) {
        centsSlider.value = cents;
        if (centsLevel) {
            centsLevel.innerText = cents;
        }
    }
}

/**
 * Show main screen and hide loading screen
 */
export function showMainScreen() {
    const loadScreen = document.getElementById('load');
    const mainScreen = document.getElementById('mainScreen');

    if (loadScreen) {
        loadScreen.style.display = 'none';
    }

    if (mainScreen) {
        mainScreen.style.display = 'block';
    }
}

/**
 * Get current transpose value from UI
 * @returns {number}
 */
export function getTransposeValue() {
    const transposeDisplay = document.getElementById('transpose');
    return transposeDisplay ? parseInt(transposeDisplay.innerText) : 0;
}

/**
 * Handle cents change (fine tuning)
 */
export function onCentsChange() {
    const centsSlider = document.getElementById("centsRange");
    const centsLevel = document.getElementById('centsLevel');

    if (!centsSlider) return;

    const cents = parseFloat(centsSlider.value);
    saveCents(cents);

    if (centsLevel) {
        centsLevel.innerText = cents;
    }

    setGlobalCents(cents);
}
