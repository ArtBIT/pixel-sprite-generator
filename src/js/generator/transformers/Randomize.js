const {randomInt} = require('../../random');
module.exports = function(options) {
  this.data = this.data.map(
    value =>
      value < 0
        ? (value *= -1)
        : value == 1 ? randomInt(0, 1) : value > 1 ? randomInt(1, value) : 0,
  );
};
