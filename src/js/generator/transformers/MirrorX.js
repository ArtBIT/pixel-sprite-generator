module.exports = function() {
  const newWidth = this.width << 1;
  const newHeight = this.height;
  const newData = new Array(newWidth * newHeight);
  for (let j = 0; j < this.height; j++) {
    let srcIndex = j * this.width;
    let destIndex = srcIndex << 1;
    for (let i = 0; i < this.width; i++) {
      newData[destIndex + i] = this.data[srcIndex + i];
      newData[destIndex + newWidth - 1 - i] = this.data[srcIndex + i];
    }
  }
  this.data = newData;
  this.width = newWidth;
  this.height = newHeight;
};
