import {isNegative, randomInt} from '../../lib/math';
module.exports = function(options) {
  this.data = this.data.map(value => {
    if (isNegative(value)) {
      if (value === 0) {
        return value;
      }
      return (value *= -1);
    }
    return value == 1 ? randomInt(0, 1) : value > 1 ? randomInt(1, value) : 0;
  });
};
