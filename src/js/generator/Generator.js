const transformers = require('./transformers');
const {templates} = require('./templates');

class Generator {
  constructor(template, seed) {
    template = template || {};
    this.pixelData = template.pixelData;
    this.recipes = template.recipes || [];
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
