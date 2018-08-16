class ConsoleRenderer {
  constructor(options) {
      options = options || {};
    this.pallette = options.pallette || [" ", ".", "#"];
  }
  render(generator) {
    const mask = generator.run();
    for (let y = 0; y < mask.height; y++) {
      let row = "";
      for (let x = 0; x < mask.width; x++) {
        let value = mask.get(x, y);
        row += this.pallette[value % this.pallette.length];
      }
      console.log(row);
    }
    return this;
  }
}

module.exports = ConsoleRenderer;
