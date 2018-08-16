const PixelData = require("./PixelData");
const transformers = require('./transformers');

class Generator {
  constructor(template, seed) {
    template = template || {};
    this.pixelData = template.pixelData;
    this.recipes = template.transforms || [];
  }
  run() {
    const pixelData = this.pixelData.clone();
    this.recipes.forEach(recipe => {
        pixelData.transform((function(options){return function() { return transformers[recipe.name].call(this, options);};})(recipe.options));
    });
    return pixelData;
  }
}

Generator.templates = {
    "robot": {
        pixelData: new PixelData(4, 11, [
          0, 0, 0, 0,
          0, 1, 1, 1,
          0, 1, 2, 2,
          0, 0, 1, 2,
          0, 0, 0, 2,
          1, 1, 1, 2,
          0, 1, 1, 2,
          0, 0, 0, 2,
          0, 0, 0, 2,
          0, 1, 2, 2,
          1, 1, 0, 0
        ]),
        options: {
            outline: false,
            mirrorX: true,
            mirrorY: false
        },
    },
    "alien alphabet": {
        pixelData: new PixelData(6, 7, [
          0, 0, 0, 0, 0, 0,
          0,-1, 1, 1, 1, 0,
          0, 0, 0, 0, 1, 0,
          0, 1, 1, 1,-1, 0,
          0, 0, 0, 0, 0, 0,
          0,-1, 1, 1, 1, 0,
          0, 0, 0, 0, 0, 0,
        ]),
        options: {
            outline: false,
            mirrorX: false,
            mirrorY: false
        },
    },
    "spaceship": {
        pixelData: new PixelData(6, 12, [
          0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 1, 1,
          0, 0, 0, 0, 1,-1,
          0, 0, 0, 1, 1,-1,
          0, 0, 0, 1, 1,-1,
          0, 0, 1, 1, 1,-1,
          0, 1, 1, 1, 2, 2,
          0, 1, 1, 1, 2, 2,
          0, 1, 1, 1, 2, 2,
          0, 1, 1, 1, 1,-1,
          0, 0, 0, 1, 1, 1,
          0, 0, 0, 0, 0, 0
        ]),
        options: {
            outline: true,
            mirrorX: true,
            mirrorY: false
        },
    },
    "humanoid": {
        pixelData: new PixelData(8, 13, [
          0, 0, 0, 0, 1, 1, 1, 1,
          0, 0, 0, 0, 1, 1, 2,-1,
          0, 0, 0, 0, 1, 1, 2,-1,
          0, 0, 0, 0, 0, 0, 2,-1,
          0, 0, 1, 1, 1, 1, 2,-1,
          0, 1, 1, 2, 2, 1, 2,-1,
          0, 0, 1, 1, 0, 1, 1, 2,
          0, 0, 0, 0, 1, 1, 1, 2,
          0, 0, 0, 0, 1, 1, 1, 2,
          0, 0, 0, 0, 1, 1, 0, 0,
          0, 0, 0, 1, 1, 1, 0, 0,
          0, 0, 0, 1, 2, 1, 0, 0,
          0, 0, 0, 1, 2, 1, 0, 0,
          0, 0, 0, 1, 2, 2, 0, 0
        ]),
        options: {
            outline: true,
            mirrorX: true,
            mirrorY: false
        },
    }
};

module.exports = Generator;