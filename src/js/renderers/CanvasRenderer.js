class CanvasRenderer {
  constructor(options) {
    options = options || {};
    this.pallette = options.pallette;
    this.pixelSize = options.pixelSize || 10;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }
  render(generator) {
    const mask = generator.run();
    this.canvas.width = mask.width * this.pixelSize;
    this.canvas.height = mask.height * this.pixelSize;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    console.log(this.pallette);
    for (let y = 0; y < mask.height; y++) {
      for (let x = 0; x < mask.width; x++) {
        let value = mask.get(x, y);
        let color = this.pallette[value];
        if (color) {
          this.ctx.fillStyle = color;
          this.ctx.fillRect(
            x * this.pixelSize,
            y * this.pixelSize,
            this.pixelSize,
            this.pixelSize,
          );
        }
      }
    }
    return this;
  }
}

module.exports = CanvasRenderer;
