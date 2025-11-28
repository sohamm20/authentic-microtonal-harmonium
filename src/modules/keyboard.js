/**
 * Computer keyboard and notation handling for Web Harmonium
 */

import { KEYBOARD_MAP, SWARAM_MAP } from './constants.js';
import { noteOn, noteOff } from './audio.js';
import { getCharLength } from './shruti.js';

let notation = "";
let notePlaying = 0;

/**
 * Handle keyboard key down event
 * @param {KeyboardEvent} event - Keyboard event
 */
export function handleKeyDown(event) {
    if (!event.repeat && typeof KEYBOARD_MAP[event.key] !== "undefined") {
        noteOn(KEYBOARD_MAP[event.key]);
    }
}

/**
 * Handle keyboard key up event
 * @param {KeyboardEvent} event - Keyboard event
 */
export function handleKeyUp(event) {
    const key = event.key;

    if (typeof KEYBOARD_MAP[key] !== "undefined") {
        noteOff(KEYBOARD_MAP[key]);
    }

    // Handle notation keys
    if (key === "Backspace" && getCharLength(notation) > 0) {
        notation = notation.substring(0, getCharLength(notation) - 1);
    } else if (key === "Delete") {
        notation = "";
    } else if (key === "Enter") {
        console.log(notation);
        notation = "";
    } else if (key === "Tab") {
        notation += ",";
    } else if (typeof SWARAM_MAP[key] !== "undefined") {
        notation += SWARAM_MAP[key];
    }
}

/**
 * Handle SVG key mouse/touch down
 * @param {SVGElement} element - SVG polygon element
 */
export function handleSVGKeyDown(element) {
    const key = element.getAttribute('key');
    if (key && typeof KEYBOARD_MAP[key] !== "undefined") {
        notePlaying = KEYBOARD_MAP[key];
        noteOn(notePlaying);
    }
}

/**
 * Handle SVG key mouse/touch up
 * @param {SVGElement} element - SVG polygon element
 */
export function handleSVGKeyUp(element) {
    noteOff(notePlaying);
    notePlaying = 0;
}

/**
 * Get current notation
 * @returns {string}
 */
export function getNotation() {
    return notation;
}

/**
 * Clear notation
 */
export function clearNotation() {
    notation = "";
}

/**
 * Initialize keyboard event listeners
 */
export function initKeyboardListeners() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

/**
 * Remove keyboard event listeners
 */
export function removeKeyboardListeners() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
}
