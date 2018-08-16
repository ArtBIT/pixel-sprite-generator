const OUTLINE_COLOR = 3;
module.exports = function(options) {
  options = options || {};
  const color = options.color || OUTLINE_COLOR;
  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      if (this.get(x, y) > 0 && this.get(x, y) !== color) {
        if (y - 1 >= 0 && this.get(x, y - 1) === 0) {
          this.set(x, y - 1, color);
        }
        if (y + 1 < this.height && this.get(x, y + 1) === 0) {
          this.set(x, y + 1, color);
        }
        if (x - 1 >= 0 && this.get(x - 1, y) === 0) {
          this.set(x - 1, y, color);
        }
        if (x + 1 < this.width && this.get(x + 1, y) === 0) {
          this.set(x + 1, y, color);
        }
      }
    }
  }
};
