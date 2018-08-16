module.exports = function() {
  const w = this.width;
  const h = this.height;
  const hHalf = h >> 1;
  for (let j = 0; j < hHalf; j++) {
    let rowIndex = j * w;
    for (let i = 0; i < w; i++) {
      this.data[(h - 1 - j) * w + i] = this.data[rowIndex + i] = this.data[
        rowIndex + i
      ];
    }
  }
};
