import {isNegative} from '../../lib/math';
const OUTLINE_COLOR = 3;
const isPositiveZero = value => value === 0 && !isNegative(value);
module.exports = function(options) {
  options = options || {};
  const color = options.color || OUTLINE_COLOR;
  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      let currentValue = this.get(x, y);
      if (currentValue > 0 && currentValue !== color) {
        if (y - 1 >= 0 && isPositiveZero(this.get(x, y - 1))) {
          this.set(x, y - 1, color);
        }
        if (y + 1 < this.height && isPositiveZero(this.get(x, y + 1))) {
          this.set(x, y + 1, color);
        }
        if (x - 1 >= 0 && isPositiveZero(this.get(x - 1, y))) {
          this.set(x - 1, y, color);
        }
        if (x + 1 < this.width && isPositiveZero(this.get(x + 1, y))) {
          this.set(x + 1, y, color);
        }
      }
    }
  }
};
