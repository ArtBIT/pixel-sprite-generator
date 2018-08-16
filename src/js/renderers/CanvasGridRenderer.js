const CanvasRenderer = require('./CanvasRenderer');
class CanvasGridRenderer {
  constructor(options) {
    options = options || {};
    this.rows = options.rows || 1;
    this.cols = options.cols || 1;
    this.padding = options.padding || 10;
    this.backgroundColor = options.backgroundColor || 'gray';
    this.renderer = new CanvasRenderer(options);
    this.canvas = document.createElement('canvas');
  }
  render(generator) {
    const rows = this.rows;
    const cols = this.cols;
    let initializeCanvas = true;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        this.renderer.render(generator);
        if (initializeCanvas) {
          initializeCanvas = false;
          this.canvas.width =
            cols * (this.renderer.canvas.width + 2 * this.padding);
          this.canvas.height =
            rows * (this.renderer.canvas.height + 2 * this.padding);
          this.ctx = this.canvas.getContext('2d');
          this.ctx.fillStyle = this.backgroundColor;
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.ctx.drawImage(
          this.renderer.canvas,
          x * (this.renderer.canvas.width + 2 * this.padding) + this.padding,
          y * (this.renderer.canvas.height + 2 * this.padding) + this.padding,
          this.renderer.canvas.width,
          this.renderer.canvas.height,
        );
      }
    }
    return this;
  }
}

module.exports = CanvasGridRenderer;
