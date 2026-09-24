import { useId, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

export const Section = ({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) => (
  <section className="section">
    <header className="section-header">
      <h2>{title}</h2>
      {actions && <div className="section-actions">{actions}</div>}
    </header>
    {children}
  </section>
);

export const Toggle = ({
  label,
  checked,
  onChange,
  title,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title?: string;
}) => (
  <label className="toggle" title={title}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="toggle-track" aria-hidden="true" />
    <span>{label}</span>
  </label>
);

export const ColorField = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  <label className={`color-field${disabled ? " is-disabled" : ""}`}>
    <input type="color" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
    <span className="color-field-text">
      <span className="color-field-label">{label}</span>
      <code>{value.toUpperCase()}</code>
    </span>
  </label>
);

export const SliderField = ({
  label,
  value,
  min,
  max,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}) => {
  const id = useId();
  return (
    <div className="slider-field">
      <label htmlFor={id}>
        {label}
        <output htmlFor={id}>
          {value}
          {unit}
        </output>
      </label>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
};

/** Number input with +/- buttons. Keeps a local draft so partially typed values are not clamped away. */
export const Stepper = ({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) => {
  const id = useId();
  // text being typed; null while not editing so external changes show up
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (text: string) => {
    const n = Number(text);
    if (text.trim() !== "" && Number.isFinite(n)) onChange(Math.min(max, Math.max(min, Math.round(n))));
    setDraft(null);
  };

  const step = (delta: number) => {
    setDraft(null);
    onChange(Math.min(max, Math.max(min, value + delta)));
  };

  return (
    <div className="stepper">
      <label htmlFor={id}>{label}</label>
      <div className="stepper-control">
        <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => step(-1)}>
          −
        </button>
        <input
          id={id}
          inputMode="numeric"
          value={draft ?? String(value)}
          onChange={(e) => {
            setDraft(e.target.value);
            const n = Number(e.target.value);
            if (Number.isInteger(n) && n >= min && n <= max) onChange(n);
          }}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(e.currentTarget.value);
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              step(e.key === "ArrowUp" ? 1 : -1);
            }
          }}
        />
        <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => step(1)}>
          +
        </button>
      </div>
    </div>
  );
};

export const IconButton = ({
  icon,
  label,
  onClick,
  disabled,
  pressed,
  shortcut,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  shortcut?: string;
}) => (
  <button
    type="button"
    className="icon-button"
    aria-label={label}
    aria-pressed={pressed}
    title={shortcut ? `${label} (${shortcut})` : label}
    disabled={disabled}
    onClick={onClick}
  >
    <Icon name={icon} />
  </button>
);
