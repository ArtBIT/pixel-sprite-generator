import {isNegative} from '../../lib/math';
import DEMO_TEMPLATES from './demo';
const TEMPLATES_STORAGE_KEY = 'pixel-sprite-generator-templates';

class TemplateManager {
  constructor() {
    this.templates = {};
    this.reset();
    this.deserialize(localStorage.getItem(TEMPLATES_STORAGE_KEY));
  }

  reset() {
    // clear the templates do not destroy so that we do not destroy the object reference
    for (let key in this.templates) delete this.templates[key];
    for (let key in DEMO_TEMPLATES) this.templates[key] = DEMO_TEMPLATES[key];
  }

  add(name, template) {
    this.templates[name] = template;
    localStorage.setItem(TEMPLATES_STORAGE_KEY, this.serialize());
  }

  remove(name) {
    delete this.templates[name];
    localStorage.setItem(TEMPLATES_STORAGE_KEY, this.serialize());
  }

  serialize() {
    return JSON.stringify(this.templates, (key, value) => {
      if (value === 0 && isNegative(value)) {
        return '-0';
      }
      return value;
    });
  }

  deserialize(data) {
    if (data) {
      try {
        var storedTemplates = JSON.parse(data, (key, value) => {
          if (value === '-0') {
            return -0;
          }
          return value;
        });
        Object.keys(storedTemplates).map(
          name => (this.templates[name] = storedTemplates[name]),
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
}

module.exports = TemplateManager;
