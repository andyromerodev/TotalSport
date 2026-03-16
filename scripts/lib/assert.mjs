export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
