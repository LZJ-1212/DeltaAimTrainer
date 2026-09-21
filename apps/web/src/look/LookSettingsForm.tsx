import { useState, type FormEvent } from "react";
import {
  describeLookSettingsError,
  parseLookSettingsDraft,
  type LookSettingsDraft,
} from "./parseLookSettings";
import { useLookSettingsStore } from "./useLookSettingsStore";

function toDraft(dpi: number, sens: number, hFovDeg: number, yawFactor: number): LookSettingsDraft {
  return {
    dpi: String(dpi),
    sens: String(sens),
    hFovDeg: String(hFovDeg),
    yawFactor: String(yawFactor),
  };
}

export function LookSettingsForm() {
  const applySettings = useLookSettingsStore((state) => state.applySettings);
  const [draft, setDraft] = useState(() => {
    const settings = useLookSettingsStore.getState();
    return toDraft(settings.dpi, settings.sens, settings.hFovDeg, settings.yawFactor);
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    try {
      applySettings(parseLookSettingsDraft(draft));
      setError(null);
    } catch (caught) {
      setError(describeLookSettingsError(caught));
    }
  };

  return (
    <form className="look-settings" onSubmit={onSubmit}>
      <label className="look-field">
        DPI
        <input
          value={draft.dpi}
          inputMode="numeric"
          onChange={(event) => setDraft({ ...draft, dpi: event.target.value })}
        />
      </label>
      <label className="look-field">
        灵敏度
        <input
          value={draft.sens}
          inputMode="decimal"
          onChange={(event) => setDraft({ ...draft, sens: event.target.value })}
        />
      </label>
      <label className="look-field">
        FOV
        <input
          value={draft.hFovDeg}
          inputMode="decimal"
          onChange={(event) => setDraft({ ...draft, hFovDeg: event.target.value })}
        />
      </label>
      <label className="look-field">
        yaw
        <input
          value={draft.yawFactor}
          inputMode="decimal"
          onChange={(event) => setDraft({ ...draft, yawFactor: event.target.value })}
        />
      </label>
      <button type="submit">应用手感</button>
      {error ? (
        <p className="look-settings-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
