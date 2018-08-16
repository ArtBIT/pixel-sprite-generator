const stringHashCode = require('./stringHashCode');
const Random = require('random-js');
const engine = Random.engines.mt19937().autoSeed();

const randomInt = (min, max) => Random.integer(min, max)(engine);
const setSeed = seed => {
  engine.seed(stringHashCode(String(seed)));
};

module.exports = {
  randomInt,
  setSeed,
};
