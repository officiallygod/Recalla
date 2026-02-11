/**
 * Haptic Feedback Utility
 * Provides vibration feedback for user interactions
 */

/**
 * Triggers haptic feedback using the Vibration API
 * @param {number} duration - Duration of vibration in milliseconds (default: 10ms for light tap)
 */
export const triggerHaptic = (duration = 10) => {
  // Check if the Vibration API is supported
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      // Silently fail if vibration is not supported or blocked
      console.debug('Haptic feedback not available:', error);
    }
  }
};

/**
 * Predefined haptic patterns for different interactions
 * 
 * Single number: Duration of vibration in milliseconds
 * Array: Alternating pattern of vibration and pause durations
 *        Example: [10, 50, 10] = vibrate 10ms, pause 50ms, vibrate 10ms
 */
export const HapticPatterns = {
  LIGHT: 10,      // Light tap for button presses
  MEDIUM: 20,     // Medium feedback for selections
  SUCCESS: 50,    // Success feedback for matches
  ERROR: [10, 50, 10], // Error pattern: short vibration, pause, short vibration
};

/**
 * Trigger a light haptic feedback (for button clicks)
 */
export const hapticLight = () => triggerHaptic(HapticPatterns.LIGHT);

/**
 * Trigger a medium haptic feedback (for card selections)
 */
export const hapticMedium = () => triggerHaptic(HapticPatterns.MEDIUM);

/**
 * Trigger a success haptic feedback (for correct matches)
 */
export const hapticSuccess = () => triggerHaptic(HapticPatterns.SUCCESS);

/**
 * Trigger an error haptic feedback (for wrong matches)
 */
export const hapticError = () => triggerHaptic(HapticPatterns.ERROR);
