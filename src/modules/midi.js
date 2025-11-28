/**
 * MIDI input handling for Web Harmonium
 */

import { CONFIG } from './constants.js';
import { noteOn, noteOff, setGain } from './audio.js';

let midiAccess = null;

/**
 * Request MIDI access
 * @returns {Promise<void>}
 */
export function requestMIDIAccess() {
    return new Promise((resolve, reject) => {
        try {
            const midiInfo = document.getElementById('midiInputDevicesInfo');

            if (navigator.requestMIDIAccess) {
                if (midiInfo && midiInfo.innerText.indexOf('Supported!') === -1) {
                    midiInfo.innerText += " Supported! ";
                }
                if (CONFIG.DEBUG) console.log('This browser supports WebMIDI!');

                navigator.requestMIDIAccess()
                    .then(access => onMIDISuccess(access, resolve))
                    .catch(error => onMIDIFailure(error, reject));
            } else {
                if (midiInfo && midiInfo.innerText.indexOf('Supported!') === -1) {
                    midiInfo.innerText += " Not Supported! ";
                }
                if (CONFIG.DEBUG) console.log('WebMIDI is not supported in this browser.');
                reject(new Error('WebMIDI not supported'));
            }
        } catch (err) {
            const midiInfo = document.getElementById('midiInputDevicesInfo');
            if (midiInfo) {
                midiInfo.innerText += " Failed! " + err;
            }
            reject(err);
        }
    });
}

/**
 * Handle successful MIDI access
 * @param {MIDIAccess} access - MIDI access object
 * @param {Function} resolve - Promise resolve function
 */
function onMIDISuccess(access, resolve) {
    if (CONFIG.DEBUG) console.log("onMIDISuccess", access);
    midiAccess = access;

    const midiInputDevices = document.getElementById("midiInputDevices");
    if (!midiInputDevices) {
        if (resolve) resolve(access);
        return;
    }

    // Clear existing options
    while (midiInputDevices.options.length > 0) {
        midiInputDevices.remove(0);
    }

    // Add all MIDI inputs
    for (const input of midiAccess.inputs.values()) {
        if (CONFIG.DEBUG) {
            console.log(
                "Input port [type:'" + input.type + "'] " +
                "id:'" + input.id + "' " +
                "manufacturer:'" + input.manufacturer + "' " +
                "name:'" + input.name + "' " +
                "version:'" + input.version + "'"
            );
        }

        const option = document.createElement("option");
        option.id = input.id;
        option.text = input.name + " by " + input.manufacturer;
        midiInputDevices.add(option);

        input.onmidimessage = getMIDIMessage;
    }

    if (resolve) resolve(access);
}

/**
 * Handle MIDI access failure
 * @param {Error} error - Error object
 * @param {Function} reject - Promise reject function
 */
function onMIDIFailure(error, reject) {
    const midiInfo = document.getElementById('midiInputDevicesInfo');
    if (midiInfo) {
        midiInfo.innerText += " Failed! " + error;
    }
    if (CONFIG.DEBUG) console.log('Could not access your MIDI devices.', error);
    if (reject) reject(error);
}

/**
 * Handle incoming MIDI messages
 * @param {MIDIMessageEvent} message - MIDI message event
 */
function getMIDIMessage(message) {
    if (CONFIG.DEBUG) console.log(message);

    const command = message.data[0];
    const note = message.data[1];
    const velocity = (message.data.length > 2) ? message.data[2] : 0;

    const midiInputDevices = document.getElementById("midiInputDevices");
    if (!midiInputDevices || midiInputDevices.selectedIndex < 0) {
        return;
    }

    if (CONFIG.DEBUG) {
        console.log("midiDeviceId", message.target.id);
        console.log("selectedMidi", midiInputDevices.options[midiInputDevices.selectedIndex].id);
    }

    // Only process messages from the selected device
    if (message.target.id === midiInputDevices.options[midiInputDevices.selectedIndex].id) {
        if (CONFIG.DEBUG) console.log("command", command, "note", note, "velocity", velocity);

        switch (command) {
            case 144: // noteOn
                if (velocity > 0) {
                    noteOn(note, velocity);
                } else {
                    noteOff(note);
                }
                break;

            case 128: // noteOff
                noteOff(note);
                break;

            case 176: // control change
                if (note === 7) { // volume control
                    const volumeSlider = document.getElementById("myRange");
                    if (volumeSlider) {
                        const volumePercent = (100 * velocity) / 127;
                        volumeSlider.value = volumePercent;
                        setGain(volumePercent / 100);

                        const volumeLevel = document.getElementById('volumeLevel');
                        if (volumeLevel) {
                            volumeLevel.innerText = Math.round(volumePercent) + "%";
                        }
                    }
                }
                break;
        }
    }
}

/**
 * Get current MIDI access
 * @returns {MIDIAccess|null}
 */
export function getMIDIAccess() {
    return midiAccess;
}
