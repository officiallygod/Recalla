/**
 * Format large numbers with K, M, B suffixes
 * Examples:
 *   999 → 999
 *   1000 → 1K
 *   1100 → 1.1K
 *   1500000 → 1.5M
 *   1000000000 → 1B
 * 
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number with suffix
 */
export const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  // Convert to absolute value for comparison
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  // Less than 1000, show as is
  if (absNum < 1000) {
    return sign + absNum.toString();
  }

  // Define suffixes and their thresholds
  const suffixes = [
    { value: 1e12, suffix: 'T' }, // Trillion
    { value: 1e9, suffix: 'B' },  // Billion
    { value: 1e6, suffix: 'M' },  // Million
    { value: 1e3, suffix: 'K' },  // Thousand
  ];

  // Find the appropriate suffix
  for (const { value, suffix } of suffixes) {
    if (absNum >= value) {
      const formatted = absNum / value;
      // Round to specified decimals
      const rounded = Math.floor(formatted * Math.pow(10, decimals)) / Math.pow(10, decimals);
      // Remove trailing zeros and decimal point if not needed
      const str = rounded.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
      return sign + str + suffix;
    }
  }

  return sign + absNum.toString();
};

/**
 * Format number for compact display (removes decimal places when showing K/M/B)
 * @param {number} num - The number to format
 * @returns {string} Formatted number
 */
export const formatNumberCompact = (num) => {
  return formatNumber(num, 1);
};
