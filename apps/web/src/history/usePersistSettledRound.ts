import { useEffect, useRef, useState } from "react";
import { useLookSettingsStore } from "../look/useLookSettingsStore";
import { useTrainingStore } from "../shoot/useTrainingStore";
import { saveSession } from "./sessionClient";
import { toSessionDraft } from "./sessionDraft";

export function usePersistSettledRound(onSaved: () => void): string | null {
  const phase = useTrainingStore((state) => state.phase);
  const roundSerial = useTrainingStore((state) => state.roundSerial);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedSerial = useRef<number | null>(null);
  const inflightSerial = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "settled") {
      return;
    }
    if (savedSerial.current === roundSerial || inflightSerial.current === roundSerial) {
      return;
    }

    const draft = toSessionDraft(
      useTrainingStore.getState(),
      useLookSettingsStore.getState(),
    );
    if (draft === null) {
      return;
    }

    inflightSerial.current = roundSerial;
    let active = true;
    void saveSession(draft)
      .then(() => {
        savedSerial.current = roundSerial;
        if (active) {
          setSaveError(null);
          onSaved();
        }
      })
      .catch(() => {
        if (inflightSerial.current === roundSerial) {
          inflightSerial.current = null;
        }
        if (active) {
          setSaveError("这局没能写入记录");
        }
      });

    return () => {
      active = false;
    };
  }, [onSaved, phase, roundSerial]);

  return saveError;
}
