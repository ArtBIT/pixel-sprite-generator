import { BUILTIN_TEMPLATES } from "./builtinTemplates";
import { encodeCells, isMinusZero } from "./cells";
import type { Template } from "./types";

// Same key as v1 of the app, so previously saved templates are picked up.
const STORAGE_KEY = "pixel-sprite-generator-templates";

const sameShape = (a: Template, b: Template) =>
  a.width === b.width && a.height === b.height && encodeCells(a.data) === encodeCells(b.data);

const isTemplate = (value: unknown): value is Template => {
  const t = value as Template;
  return (
    !!t &&
    Number.isInteger(t.width) &&
    Number.isInteger(t.height) &&
    Array.isArray(t.data) &&
    t.data.length === t.width * t.height
  );
};

export const serializeTemplates = (templates: Record<string, Template>) =>
  JSON.stringify(templates, (_key, value) => (isMinusZero(value) ? "-0" : value));

export const parseTemplates = (json: string | null): Record<string, Template> => {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json, (_key, value) => (value === "-0" ? -0 : value));
    const result: Record<string, Template> = {};
    for (const [name, template] of Object.entries(parsed ?? {})) {
      if (!isTemplate(template)) continue;
      const normalized = { ...template, options: template.options ?? {} };
      const builtin = BUILTIN_TEMPLATES[name];
      // v1 stored the built-in templates alongside the user ones; skip unchanged copies
      if (builtin && sameShape(builtin, normalized)) continue;
      result[builtin ? `${name} (saved)` : name] = normalized;
    }
    return result;
  } catch (error) {
    console.error("Could not read saved templates", error);
    return {};
  }
};

export const loadUserTemplates = () => {
  try {
    return parseTemplates(localStorage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
};

export const storeUserTemplates = (templates: Record<string, Template>) => {
  try {
    localStorage.setItem(STORAGE_KEY, serializeTemplates(templates));
  } catch (error) {
    console.error("Could not save templates", error);
  }
};
