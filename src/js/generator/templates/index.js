const TemplateManager = require('./TemplateManager');
const manager = new TemplateManager();

module.exports = {
  templates: manager.templates,
  saveTemplate: (name, template) => manager.add(name, template),
  deleteTemplate: name => manager.remove(name),
};
