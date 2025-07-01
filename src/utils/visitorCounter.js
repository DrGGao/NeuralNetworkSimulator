/**
 * Simple visitor counter using localStorage
 * Note: This only tracks visits per browser, not unique users across devices
 */

// Get the current visit count
export const getVisitCount = () => {
  try {
    return parseInt(localStorage.getItem('visitCount') || '0', 10);
  } catch (error) {
    console.error('Error reading visit count:', error);
    return 0;
  }
};

// Increment the visit count
export const incrementVisitCount = () => {
  try {
    const currentCount = getVisitCount();
    localStorage.setItem('visitCount', (currentCount + 1).toString());
    return currentCount + 1;
  } catch (error) {
    console.error('Error incrementing visit count:', error);
    return 0;
  }
};

// Reset the visit count (for testing)
export const resetVisitCount = () => {
  try {
    localStorage.removeItem('visitCount');
    return 0;
  } catch (error) {
    console.error('Error resetting visit count:', error);
    return 0;
  }
}; 