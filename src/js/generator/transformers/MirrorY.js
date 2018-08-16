module.exports = function() {
  const newWidth = this.width;
  const newHeight = this.height << 1;
  const newData = new Array(newWidth * newHeight);
  for (let j = 0; j < this.height; j++) {
    let srcRow = j * this.width;
    let destRow = (newHeight - j - 1) * this.width;
    for (let i = 0; i < this.width; i++) {
      newData[srcRow + i] = this.data[srcRow + i];
      newData[destRow + i] = this.data[srcRow + i];
    }
  }
  this.data = newData;
  this.width = newWidth;
  this.height = newHeight;
};
