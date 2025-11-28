/**
 * Local storage management for Web Harmonium
 */

const STORAGE_KEYS = {
    VOLUME: 'webharmonium.volume',
    USE_REVERB: 'webharmonium.useReverb',
    OCTAVE: 'webharmonium.octave',
    TRANSPOSE: 'webharmonium.transpose',
    STACK: 'webharmonium.stack',
    SHRUTI_SELECTION: 'webharmonium.shrutiSelection',
    CENTS: 'webharmonium.cents'
};

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
export function isStorageAvailable() {
    return typeof Storage !== "undefined";
}

/**
 * Get a value from localStorage
 * @param {string} key - Storage key
 * @returns {string|null}
 */
export function getItem(key) {
    if (!isStorageAvailable()) return null;
    return localStorage.getItem(key);
}

/**
 * Set a value in localStorage
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 */
export function setItem(key, value) {
    if (isStorageAvailable()) {
        localStorage.setItem(key, value);
    }
}

/**
 * Remove a value from localStorage
 * @param {string} key - Storage key
 */
export function removeItem(key) {
    if (isStorageAvailable()) {
        localStorage.removeItem(key);
    }
}

/**
 * Get volume setting
 * @returns {number|null}
 */
export function getVolume() {
    const volume = getItem(STORAGE_KEYS.VOLUME);
    return volume !== null ? parseFloat(volume) : null;
}

/**
 * Set volume setting
 * @param {number} value - Volume value
 */
export function setVolume(value) {
    setItem(STORAGE_KEYS.VOLUME, value.toString());
}

/**
 * Get reverb setting
 * @returns {boolean}
 */
export function getUseReverb() {
    const useReverb = getItem(STORAGE_KEYS.USE_REVERB);
    return useReverb === "true";
}

/**
 * Set reverb setting
 * @param {boolean} value - Use reverb
 */
export function setUseReverb(value) {
    setItem(STORAGE_KEYS.USE_REVERB, value ? "true" : "false");
}

/**
 * Get octave setting
 * @returns {number}
 */
export function getOctave() {
    const octave = getItem(STORAGE_KEYS.OCTAVE);
    if (octave !== null) {
        try {
            return parseInt(octave, 10);
        } catch (err) {
            return 0;
        }
    }
    return 0;
}

/**
 * Set octave setting
 * @param {number} value - Octave value
 */
export function setOctave(value) {
    setItem(STORAGE_KEYS.OCTAVE, value.toString());
}

/**
 * Get transpose setting
 * @returns {number|null}
 */
export function getTranspose() {
    const transpose = getItem(STORAGE_KEYS.TRANSPOSE);
    return transpose !== null ? parseInt(transpose, 10) : null;
}

/**
 * Set transpose setting
 * @param {number} value - Transpose value
 */
export function setTranspose(value) {
    setItem(STORAGE_KEYS.TRANSPOSE, value.toString());
}

/**
 * Get stack setting
 * @returns {number}
 */
export function getStack() {
    const stack = getItem(STORAGE_KEYS.STACK);
    if (stack !== null) {
        try {
            return parseInt(stack, 10);
        } catch (err) {
            return 0;
        }
    }
    return 0;
}

/**
 * Set stack setting
 * @param {number} value - Stack value
 */
export function setStack(value) {
    setItem(STORAGE_KEYS.STACK, value.toString());
}

/**
 * Get shruti selection
 * @returns {Object|null}
 */
export function getShrutiSelection() {
    const stored = getItem(STORAGE_KEYS.SHRUTI_SELECTION);
    if (!stored) return null;

    try {
        const parsed = JSON.parse(stored);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch (err) {
        console.warn("Unable to load stored shruti selections", err);
        removeItem(STORAGE_KEYS.SHRUTI_SELECTION);
        return null;
    }
}

/**
 * Set shruti selection
 * @param {Object} selection - Shruti selection object
 */
export function setShrutiSelection(selection) {
    setItem(STORAGE_KEYS.SHRUTI_SELECTION, JSON.stringify(selection));
}

/**
 * Clear shruti selection
 */
export function clearShrutiSelection() {
    removeItem(STORAGE_KEYS.SHRUTI_SELECTION);
}

/**
 * Get cents setting
 * @returns {number}
 */
export function getCents() {
    const cents = getItem(STORAGE_KEYS.CENTS);
    if (cents !== null) {
        try {
            return parseFloat(cents);
        } catch (err) {
            return 0;
        }
    }
    return 0;
}

/**
 * Set cents setting
 * @param {number} value - Cents value
 */
export function setCents(value) {
    setItem(STORAGE_KEYS.CENTS, value.toString());
}

export { STORAGE_KEYS };
