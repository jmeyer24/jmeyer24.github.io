export const mod = (value, n) => (((value) % n) + n) % n;
export const roundingTo = (value, decimals) => Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));