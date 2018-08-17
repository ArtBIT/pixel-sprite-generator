const transformers = require('./transformers');
const {templates} = require('./templates');
const PixelData = require('./PixelData');

class Generator {
  constructor(template, recipes) {
    this.pixelData = new PixelData(
      template.width || 1,
      template.height || 1,
      template.data,
    );
    this.recipes = recipes || [];
  }
  run() {
    const pixelData = this.pixelData.clone();
    this.recipes.forEach(recipe => {
      pixelData.transform(
        (function(options) {
          return function() {
            return transformers[recipe.name].call(this, options);
          };
        })(recipe.options),
      );
    });
    return pixelData;
  }
}

Generator.templates = templates;
module.exports = Generator;
