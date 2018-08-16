class PixelData {
  constructor(width, height, data) {
    this.width = width;
    this.height = height;
    this.data = data || new Array(this.width * this.height).fill(0);
  }
  get(x, y) {
    return this.data[(y * this.width + x) % this.data.length];
  }
  set(x, y, value) {
    this.data[(y * this.width + x) % this.data.length] = value;
  }
  transform(transformer) {
    return transformer.call(this);
  }
  reset(value) {
    this.data.fill(value || 0, 0);
  }
  clone() {
    return new PixelData(this.width, this.height, [...this.data]);
  }
}

module.exports = PixelData;
