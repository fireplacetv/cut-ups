import { DEFAULT_LINE_WIDTH, METHODS } from './constants.js';

let state = {
  selectedMethod: METHODS[0],
  selectedWidth: DEFAULT_LINE_WIDTH,
};

export function getState() {
  return { ...state };
}

export function setState(updates) {
  state = { ...state, ...updates };
  return state;
}

export function getSelectedMethod() {
  return state.selectedMethod;
}

export function setSelectedMethod(method) {
  if (!METHODS.includes(method)) {
    throw new Error(`Unknown method: ${method}`);
  }
  state.selectedMethod = method;
  return method;
}

export function getSelectedWidth() {
  return state.selectedWidth;
}

export function setSelectedWidth(width) {
  if (typeof width !== 'number' || width < 1) {
    throw new Error(`Invalid width: ${width}`);
  }
  state.selectedWidth = width;
  return width;
}
