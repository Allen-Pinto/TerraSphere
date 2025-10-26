/**
 * Animation utilities for smooth zoom transitions
 */

/**
 * Easing function for smooth animations
 * @param {number} t - Progress from 0 to 1
 * @returns {number} Eased value
 */
export function easeInOutCubic(t) {
  return t < 0.5 
    ? 4 * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Easing function for zoom in
 */
export function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Easing function for zoom out
 */
export function easeInExpo(t) {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

/**
 * Interpolate between two values
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Interpolate between two colors
 */
export function lerpColor(color1, color2, t) {
  // Convert hex to RGB
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(lerp(c1.r, c2.r, t));
  const g = Math.round(lerp(c1.g, c2.g, t));
  const b = Math.round(lerp(c1.b, c2.b, t));
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}