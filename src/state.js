import { DEFAULT_LINE_WIDTH, METHODS } from './constants.js';

// Module-level UI state (single source of truth for the currently selected
// method and width). Kept private to this module — callers must go through
// the getters/setters below so invalid values are rejected consistently.
let state = {
  selectedMethod: METHODS[0],
  selectedWidth: DEFAULT_LINE_WIDTH,
};

/** @returns {object} Shallow copy of the current state (safe to inspect without mutating). */
export function getState() {
  return { ...state };
}

/**
 * Merges the given updates into state. Does not validate individual
 * fields — prefer setSelectedMethod/setSelectedWidth for validated writes.
 * @param {object} updates - Partial state to merge in.
 * @returns {object} The new state (not a copy).
 */
export function setState(updates) {
  state = { ...state, ...updates };
  return state;
}

/** @returns {string} The currently selected cut-up method. */
export function getSelectedMethod() {
  return state.selectedMethod;
}

/**
 * @param {string} method - Must be one of the values in METHODS.
 * @returns {string} The method that was set.
 * @throws {Error} If method is not in METHODS.
 */
export function setSelectedMethod(method) {
  if (!METHODS.includes(method)) {
    throw new Error(`Unknown method: ${method}`);
  }
  state.selectedMethod = method;
  return method;
}

/** @returns {number} The currently selected line width. */
export function getSelectedWidth() {
  return state.selectedWidth;
}

/**
 * @param {number} width - Must be a number >= 1.
 * @returns {number} The width that was set.
 * @throws {Error} If width is not a number or is less than 1.
 */
export function setSelectedWidth(width) {
  if (typeof width !== 'number' || width < 1) {
    throw new Error(`Invalid width: ${width}`);
  }
  state.selectedWidth = width;
  return width;
}
