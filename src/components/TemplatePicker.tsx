import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";

interface Props {
  templateName: string | null;
  modified: boolean;
  builtinNames: string[];
  userNames: string[];
  onSelect: (name: string) => void;
  /** Returns an error message, or null when saved. */
  onSave: (name: string) => string | null;
  onDelete: (name: string) => void;
}

export const TemplatePicker = ({ templateName, modified, builtinNames, userNames, onSelect, onSave, onDelete }: Props) => {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isUserTemplate = templateName !== null && userNames.includes(templateName);

  const startSaving = () => {
    setName(isUserTemplate ? templateName : "");
    setError(null);
    setSaving(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = onSave(name.trim());
    if (result) setError(result);
    else setSaving(false);
  };

  return (
    <div className="template-picker">
      <div className="template-row">
        <select
          aria-label="Template"
          value={templateName ?? ""}
          onChange={(e) => e.target.value && onSelect(e.target.value)}
        >
          {templateName === null && <option value="">Custom (unsaved)</option>}
          <optgroup label="Built-in">
            {builtinNames.map((n) => (
              <option key={n} value={n}>
                {n}
                {n === templateName && modified ? " (modified)" : ""}
              </option>
            ))}
          </optgroup>
          {userNames.length > 0 && (
            <optgroup label="My templates">
              {userNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                  {n === templateName && modified ? " (modified)" : ""}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <button type="button" className="icon-button" title="Save as template" aria-label="Save as template" onClick={startSaving}>
          <Icon name="save" />
        </button>
        <button
          type="button"
          className="icon-button"
          title={isUserTemplate ? "Delete template" : "Built-in templates cannot be deleted"}
          aria-label="Delete template"
          disabled={!isUserTemplate}
          onClick={() => {
            if (templateName && confirm(`Delete the template "${templateName}"?`)) onDelete(templateName);
          }}
        >
          <Icon name="trash" />
        </button>
      </div>
      {modified && !saving && templateName !== null && (
        <p className="hint">
          Modified.{" "}
          <button type="button" className="link-button" onClick={() => onSelect(templateName)}>
            Revert
          </button>
        </p>
      )}
      {saving && (
        <form className="save-form" onSubmit={submit}>
          <input
            autoFocus
            aria-label="Template name"
            placeholder="Template name"
            value={name}
            maxLength={40}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Escape" && setSaving(false)}
          />
          <button type="submit" className="button primary" disabled={!name.trim()}>
            Save
          </button>
          <button type="button" className="button" onClick={() => setSaving(false)}>
            Cancel
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      )}
    </div>
  );
};
