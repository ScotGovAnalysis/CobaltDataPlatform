// Custom mode calculation that only returns mode if there's a clear single mode
export const calculateMode = (values) => {
    const frequencyMap = {};
    values.forEach(val => {
      frequencyMap[val] = (frequencyMap[val] || 0) + 1;
    });
  
    const maxFrequency = Math.max(...Object.values(frequencyMap));
  
    // Only return mode if it appears more than once and is the only value with max frequency
    const modes = Object.entries(frequencyMap)
      .filter(([_, count]) => count === maxFrequency)
      .map(([val, _]) => val);
  
    return modes.length === 1 ? Number(modes[0]) : null;
  };
  