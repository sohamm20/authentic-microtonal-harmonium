/**
 * Shruti (microtonal tuning) management for Web Harmonium
 */

import { SHRUTI_DEFINITIONS, CONFIG } from './constants.js';
import { getShrutiSelection, setShrutiSelection, clearShrutiSelection } from './storage.js';

let shrutiSelection = {};
let justIntonationRatios = new Array(12);
let defaultJustIntonationRatios = new Array(12);

/**
 * Get character length (handles Unicode properly)
 * @param {string} str - Input string
 * @returns {number}
 */
export function getCharLength(str) {
    return [...str].length;
}

/**
 * Initialize default just intonation ratios
 */
function initializeDefaultJustIntonationRatios() {
    for (let i = 0; i < defaultJustIntonationRatios.length; ++i) {
        defaultJustIntonationRatios[i] = 1;
    }
    defaultJustIntonationRatios[0] = 1;
    defaultJustIntonationRatios[7] = 3 / 2;

    for (let j = 0; j < SHRUTI_DEFINITIONS.length; ++j) {
        const definition = SHRUTI_DEFINITIONS[j];
        if (definition.options && definition.options.length > 0) {
            const option = definition.options[0];
            defaultJustIntonationRatios[definition.scaleIndex] = option.numerator / option.denominator;
        }
    }
}

/**
 * Calculate just intonation cents for a given note
 * @param {number} noteNumber - MIDI note number
 * @param {number} transpose - Transpose value
 * @returns {number} Cents offset
 */
export function getJustIntonationCents(noteNumber, transpose) {
    const tonic = 60 + transpose;
    const semitoneOffsetFromTonic = noteNumber - tonic;
    const octaveOffset = Math.floor(semitoneOffsetFromTonic / 12);
    const scaleIndex = ((semitoneOffsetFromTonic % 12) + 12) % 12;
    const ratioFromTonic = justIntonationRatios[scaleIndex] * Math.pow(2, octaveOffset);

    const sampleOffset = CONFIG.ROOT_KEY - tonic;
    const sampleOctaveOffset = Math.floor(sampleOffset / 12);
    const sampleScaleIndex = ((sampleOffset % 12) + 12) % 12;
    let defaultRatioSample = defaultJustIntonationRatios[sampleScaleIndex];

    if (typeof defaultRatioSample !== "number" || isNaN(defaultRatioSample) || defaultRatioSample <= 0) {
        defaultRatioSample = 1;
    }

    const ratioSample = defaultRatioSample * Math.pow(2, sampleOctaveOffset);
    const finalRatio = ratioFromTonic / ratioSample;
    const log2 = Math.log2 || function (value) {
        return Math.log(value) / Math.LN2;
    };

    return 1200 * log2(finalRatio);
}

/**
 * Get shruti definition by scale index
 * @param {number} scaleIndex - Scale index
 * @returns {Object|null}
 */
export function getShrutiDefinition(scaleIndex) {
    for (let i = 0; i < SHRUTI_DEFINITIONS.length; ++i) {
        if (SHRUTI_DEFINITIONS[i].scaleIndex === scaleIndex) {
            return SHRUTI_DEFINITIONS[i];
        }
    }
    return null;
}

/**
 * Initialize shruti defaults
 */
function initializeShrutiDefaults() {
    shrutiSelection = {};
    for (let i = 0; i < SHRUTI_DEFINITIONS.length; ++i) {
        shrutiSelection[SHRUTI_DEFINITIONS[i].scaleIndex] = 0;
    }
    computeJustIntonationRatiosFromSelection();
}

/**
 * Compute just intonation ratios from current selection
 */
export function computeJustIntonationRatiosFromSelection() {
    for (let i = 0; i < justIntonationRatios.length; ++i) {
        justIntonationRatios[i] = 1;
    }
    justIntonationRatios[0] = 1;
    justIntonationRatios[7] = 3 / 2;

    for (let j = 0; j < SHRUTI_DEFINITIONS.length; ++j) {
        const definition = SHRUTI_DEFINITIONS[j];
        let selectionIndex = shrutiSelection[definition.scaleIndex];

        if (typeof selectionIndex !== "number" || selectionIndex < 0 || selectionIndex >= definition.options.length) {
            selectionIndex = 0;
            shrutiSelection[definition.scaleIndex] = selectionIndex;
        }

        const option = definition.options[selectionIndex];
        justIntonationRatios[definition.scaleIndex] = option.numerator / option.denominator;
    }
}

/**
 * Load stored shruti selection from local storage
 */
export function loadStoredShrutiSelection() {
    initializeShrutiDefaults();

    const stored = getShrutiSelection();
    if (!stored) {
        computeJustIntonationRatiosFromSelection();
        return;
    }

    for (let i = 0; i < SHRUTI_DEFINITIONS.length; ++i) {
        const definition = SHRUTI_DEFINITIONS[i];
        const value = stored[definition.scaleIndex];
        const index = parseInt(value, 10);

        if (!isNaN(index) && index >= 0 && index < definition.options.length) {
            shrutiSelection[definition.scaleIndex] = index;
        }
    }

    computeJustIntonationRatiosFromSelection();
}

/**
 * Persist shruti selection to local storage
 */
export function persistShrutiSelection() {
    setShrutiSelection(shrutiSelection);
}

/**
 * Update shruti button label in UI
 * @param {number} scaleIndex - Scale index
 */
export function updateShrutiButtonLabel(scaleIndex) {
    const button = document.getElementById('shruti-button-' + scaleIndex);
    const definition = getShrutiDefinition(scaleIndex);

    if (!button || !definition) {
        return;
    }

    let selectionIndex = shrutiSelection[scaleIndex];
    if (typeof selectionIndex !== "number" || selectionIndex < 0 || selectionIndex >= definition.options.length) {
        selectionIndex = 0;
    }

    const option = definition.options[selectionIndex];
    button.innerText = definition.swara + ' - ' + option.label;
    button.title = 'Toggle shruti for ' + definition.swara;
}

/**
 * Update all shruti buttons in UI
 */
export function updateAllShrutiButtons() {
    for (let i = 0; i < SHRUTI_DEFINITIONS.length; ++i) {
        updateShrutiButtonLabel(SHRUTI_DEFINITIONS[i].scaleIndex);
    }
}

/**
 * Render just intonation controls in UI
 * @param {Function} toggleCallback - Callback for button click
 */
export function renderJustIntonationControls(toggleCallback) {
    const container = document.getElementById('justIntonationControls');
    if (!container) {
        return;
    }

    if (container.dataset.initialized === "true") {
        updateAllShrutiButtons();
        return;
    }

    for (let i = 0; i < SHRUTI_DEFINITIONS.length; ++i) {
        const definition = SHRUTI_DEFINITIONS[i];
        const button = document.createElement('button');
        button.id = 'shruti-button-' + definition.scaleIndex;
        button.className = 'w3-button w3-blue-grey w3-round w3-margin-small';
        button.style.minWidth = '180px';
        button.type = 'button';

        (function (scaleIndex) {
            button.addEventListener('click', function () {
                toggleCallback(scaleIndex);
            });
        })(definition.scaleIndex);

        container.appendChild(button);
    }

    container.dataset.initialized = "true";
    updateAllShrutiButtons();
}

/**
 * Toggle shruti selection for a given scale index
 * @param {number} scaleIndex - Scale index
 * @returns {Object} Current selection state
 */
export function toggleShruti(scaleIndex) {
    const definition = getShrutiDefinition(scaleIndex);
    if (!definition) {
        return null;
    }

    let selectionIndex = shrutiSelection[scaleIndex];
    if (typeof selectionIndex !== "number" || selectionIndex < 0 || selectionIndex >= definition.options.length) {
        selectionIndex = 0;
    }

    selectionIndex = (selectionIndex + 1) % definition.options.length;
    shrutiSelection[scaleIndex] = selectionIndex;
    computeJustIntonationRatiosFromSelection();
    persistShrutiSelection();
    updateShrutiButtonLabel(scaleIndex);

    return { scaleIndex, selectionIndex };
}

/**
 * Reset just intonation ratios to defaults
 */
export function resetJustIntonationRatios() {
    initializeShrutiDefaults();
    clearShrutiSelection();
    updateAllShrutiButtons();
}

/**
 * Get current shruti selection
 * @returns {Object}
 */
export function getShrutiSelectionState() {
    return { ...shrutiSelection };
}

// Initialize on module load
initializeDefaultJustIntonationRatios();
initializeShrutiDefaults();

export { justIntonationRatios, defaultJustIntonationRatios };
