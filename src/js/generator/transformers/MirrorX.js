module.exports = function() {
  const w = this.width;
  const wHalf = w >> 1;
  const h = this.height;
  for (let j = 0; j < h; j++) {
    let rowIndex = j * w;
    for (let i = 0; i < wHalf; i++) {
      this.data[rowIndex + i] = this.data[rowIndex + i];
      this.data[rowIndex + w - 1 - i] = this.data[rowIndex + i];
    }
  }
};
