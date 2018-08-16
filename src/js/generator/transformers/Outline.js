module.exports = function(options) {
  options = options || {};
  const whichCharacters = options.whichCharacters || [1];
  const transparentCharacters = options.transparentCharacters || [0];
  const outlineCharacter = options.outlineCharacteri || 2;
  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      if (whichCharacters.includes(this.get(x, y))) {
        if (y - 1 >= 0 && transparentCharacters.includes(this.get(x, y - 1))) {
          this.set(x, y - 1, outlineCharacter);
        }
        if (
          y + 1 < this.height &&
          transparentCharacters.includes(this.get(x, y + 1))
        ) {
          this.set(x, y + 1, outlineCharacter);
        }
        if (x - 1 >= 0 && transparentCharacters.includes(this.get(x - 1, y))) {
          this.set(x - 1, y, outlineCharacter);
        }
        if (
          x + 1 < this.width &&
          transparentCharacters.includes(this.get(x + 1, y))
        ) {
          this.set(x + 1, y, outlineCharacter);
        }
      }
    }
  }
};
