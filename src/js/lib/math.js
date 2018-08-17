const Random = require('random-js');
const stringHashCode = require('./stringHashCode');

const engine = Random.engines.mt19937().autoSeed();
export const randomInt = (min, max) => Random.integer(min, max)(engine);
export const setSeed = seed => {
  engine.seed(stringHashCode(String(seed)));
};

export const isMinusZero = value => {
  if (value === 0) {
    return 1 / value === -Infinity;
  }
  return false;
};

/**
 * To be able to distinguish between -0 and +0
 */
export const isNegative = value => {
  return value < 0 || isMinusZero(value);
};
