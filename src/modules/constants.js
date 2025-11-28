/**
 * Constants and configuration for Web Harmonium
 */

export const CONFIG = {
    SAMPLE_URL: 'harmonium-kannan-orig.wav',
    DEBUG: false,
    LOOP_START: 0.5,
    LOOP_END: 7.5,
    LOOP: true,
    MIDDLE_C: 60,
    ROOT_KEY: 62,
    DEFAULT_OCTAVE: 3,
    DEFAULT_VOLUME: 0.3
};

export const KEYBOARD_MAP = {
    "s": 53,   "S": 53,
    "a": 54,   "A": 54,
    "`": 55,
    "1": 56,
    "q": 57,   "Q": 57,
    "2": 58,
    "w": 59,   "W": 59,
    "e": 60,   "E": 60,
    "4": 61,
    "r": 62,   "R": 62,
    "5": 63,
    "t": 64,   "T": 64,
    "y": 65,   "Y": 65,
    "7": 66,
    "u": 67,   "U": 67,
    "8": 68,
    "i": 69,   "I": 69,
    "9": 70,
    "o": 71,   "O": 71,
    "p": 72,   "P": 72,
    "-": 73,
    "[": 74,
    "=": 75,
    "]": 76,
    "\\": 77,
    "'": 78,
    ";": 79
};

export const SWARAM_MAP = {
    "s": "Ṃ",  "S": "Ṃ",
    "a": "Ṃ",  "A": "Ṃ",
    "`": "P̣",
    "1": "Ḍ",
    "q": "Ḍ",  "Q": "Ḍ",
    "2": "Ṇ",
    "w": "Ṇ",  "W": "Ṇ",
    "e": "S",  "E": "S",
    "4": "R",
    "r": "R",  "R": "R",
    "5": "G",
    "t": "G",  "T": "G",
    "y": "M",  "Y": "M",
    "7": "M",  "7": "M",
    "u": "P",  "U": "P",
    "8": "D",
    "i": "D",  "I": "D",
    "9": "N",
    "o": "N",  "O": "N",
    "p": "Ṡ",  "P": "Ṡ",
    "-": "Ṙ",
    "[": "Ṙ",
    "=": "Ġ",
    "]": "Ġ",
    "\\": "Ṁ",
    "'": "Ṁ",
    ";": "Ṗ",
    ",": ","
};

export const OCTAVE_MAP = [-36, -24, -12, 0, 12, 24, 36];

export const BASE_KEY_NAMES = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

/**
 * Shruti ratio definitions adapted from Vidyadhar Oke's 22-shruti table
 */
export const SHRUTI_DEFINITIONS = [
    {
        scaleIndex: 1,
        swara: "Komal Re",
        options: [
            { id: "r1", label: "r1 256/243", numerator: 256, denominator: 243 },
            { id: "r2", label: "r2 16/15", numerator: 16, denominator: 15 }
        ]
    },
    {
        scaleIndex: 2,
        swara: "Shuddha Re",
        options: [
            { id: "R1", label: "R1 10/9", numerator: 10, denominator: 9 },
            { id: "R2", label: "R2 9/8", numerator: 9, denominator: 8 }
        ]
    },
    {
        scaleIndex: 3,
        swara: "Komal Ga",
        options: [
            { id: "g1", label: "g1 32/27", numerator: 32, denominator: 27 },
            { id: "g2", label: "g2 6/5", numerator: 6, denominator: 5 }
        ]
    },
    {
        scaleIndex: 4,
        swara: "Shuddha Ga",
        options: [
            { id: "G1", label: "G1 5/4", numerator: 5, denominator: 4 },
            { id: "G2", label: "G2 81/64", numerator: 81, denominator: 64 }
        ]
    },
    {
        scaleIndex: 5,
        swara: "Shuddha Ma",
        options: [
            { id: "M1", label: "M1 4/3", numerator: 4, denominator: 3 },
            { id: "M2", label: "M2 27/20", numerator: 27, denominator: 20 }
        ]
    },
    {
        scaleIndex: 6,
        swara: "Tivra Ma",
        options: [
            { id: "M3", label: "M3 45/32", numerator: 45, denominator: 32 },
            { id: "M4", label: "M4 729/512", numerator: 729, denominator: 512 }
        ]
    },
    {
        scaleIndex: 8,
        swara: "Komal Dha",
        options: [
            { id: "d1", label: "d1 128/81", numerator: 128, denominator: 81 },
            { id: "d2", label: "d2 8/5", numerator: 8, denominator: 5 }
        ]
    },
    {
        scaleIndex: 9,
        swara: "Shuddha Dha",
        options: [
            { id: "D1", label: "D1 5/3", numerator: 5, denominator: 3 },
            { id: "D2", label: "D2 27/16", numerator: 27, denominator: 16 }
        ]
    },
    {
        scaleIndex: 10,
        swara: "Komal Ni",
        options: [
            { id: "n1", label: "n1 16/9", numerator: 16, denominator: 9 },
            { id: "n2", label: "n2 9/5", numerator: 9, denominator: 5 }
        ]
    },
    {
        scaleIndex: 11,
        swara: "Shuddha Ni",
        options: [
            { id: "N1", label: "N1 15/8", numerator: 15, denominator: 8 },
            { id: "N2", label: "N2 243/128", numerator: 243, denominator: 128 }
        ]
    }
];
