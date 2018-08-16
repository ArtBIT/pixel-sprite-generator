const PixelData = require('../PixelData');
const DEMO_TEMPLATES = require('./demo');

const TEMPLATES_STORAGE_KEY = 'pixel-sprite-generator-templates';
class TemplateManager {
  constructor() {
    this.templates = {};
    this.reset();
    this.deserialize(localStorage.getItem(TEMPLATES_STORAGE_KEY));
  }
  reset() {
    // clear do not destroy
    for (let key in this.templates) delete this.templates[key];
    for (let key in DEMO_TEMPLATES) this.templates[key] = DEMO_TEMPLATES[key];
  }
  add(name, template) {
    this.templates[name] = this.denormalizeTemplate(
      this.normalizeTemplate(name, template),
    );
    localStorage.setItem(TEMPLATES_STORAGE_KEY, this.serialize());
  }
  remove(name) {
    delete this.templates[name];
    localStorage.setItem(TEMPLATES_STORAGE_KEY, this.serialize());
  }
  serialize() {
    const t = this.templates;
    return JSON.stringify(
      Object.keys(t).map(templateName =>
        this.normalizeTemplate(templateName, t[templateName]),
      ),
    );
  }
  deserialize(data) {
    if (data) {
      try {
        JSON.parse(data).map(
          item => (this.templates[item.name] = this.denormalizeTemplate(item)),
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
  normalizeTemplate(name, template) {
    const {options, pixelData} = template;
    const {width, height, data} = pixelData;
    return {
      name,
      width,
      height,
      data,
      options,
    };
  }
  denormalizeTemplate(template) {
    try {
      const {width, height, data, options} = template;
      return {
        pixelData: new PixelData(width, height, data),
        options,
      };
    } catch (e) {
      console.error(e);
    }
    return false;
  }
}

module.exports = TemplateManager;
