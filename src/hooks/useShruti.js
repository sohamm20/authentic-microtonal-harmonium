import { useState, useCallback, useEffect } from 'react';

const SHRUTI_DEFINITIONS = [
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

const useShruti = () => {
  const [shrutiSelection, setShrutiSelection] = useState(() => {
    // Initialize from localStorage if available
    const stored = localStorage.getItem('harmonium.shrutiSelection');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing shruti selection:', e);
      }
    }
    // Default: first option for each swara
    const defaults = {};
    SHRUTI_DEFINITIONS.forEach(def => {
      defaults[def.scaleIndex] = 0;
    });
    return defaults;
  });

  const toggleShruti = useCallback((scaleIndex) => {
    setShrutiSelection(prev => {
      const definition = SHRUTI_DEFINITIONS.find(d => d.scaleIndex === scaleIndex);
      if (!definition) return prev;

      const currentIndex = prev[scaleIndex] || 0;
      const nextIndex = (currentIndex + 1) % definition.options.length;

      const newSelection = { ...prev, [scaleIndex]: nextIndex };

      // Save to localStorage
      localStorage.setItem('harmonium.shrutiSelection', JSON.stringify(newSelection));

      return newSelection;
    });
  }, []);

  const resetShruti = useCallback(() => {
    const defaults = {};
    SHRUTI_DEFINITIONS.forEach(def => {
      defaults[def.scaleIndex] = 0;
    });
    setShrutiSelection(defaults);
    localStorage.setItem('harmonium.shrutiSelection', JSON.stringify(defaults));
  }, []);

  const getJustIntonationRatios = useCallback(() => {
    const ratios = new Array(12).fill(1);
    ratios[0] = 1; // Sa
    ratios[7] = 3 / 2; // Pa

    SHRUTI_DEFINITIONS.forEach(definition => {
      const selectionIndex = shrutiSelection[definition.scaleIndex] || 0;
      const option = definition.options[selectionIndex];
      ratios[definition.scaleIndex] = option.numerator / option.denominator;
    });

    return ratios;
  }, [shrutiSelection]);

  const getSelectedOption = useCallback((scaleIndex) => {
    const definition = SHRUTI_DEFINITIONS.find(d => d.scaleIndex === scaleIndex);
    if (!definition) return null;

    const selectionIndex = shrutiSelection[scaleIndex] || 0;
    return definition.options[selectionIndex];
  }, [shrutiSelection]);

  return {
    shrutiSelection,
    toggleShruti,
    resetShruti,
    getJustIntonationRatios,
    getSelectedOption,
    SHRUTI_DEFINITIONS
  };
};

export default useShruti;
