import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group, Raycaster, Vector2 } from "three";
import {
  FLICK_TARGET_ID,
  isTrackingCredit,
  ROUND_DURATION_MS,
  TRACK_TARGET_ID,
} from "../shoot/drillRound";
import { flickSlot } from "../shoot/flickSlot";
import { addTrackingSample } from "../shoot/trackingSample";
import { trackingPose } from "../shoot/trackingPose";
import { useTrainingStore } from "../shoot/useTrainingStore";
import { DummyOperator } from "./DummyOperator";

const CENTER_NDC = new Vector2(0, 0);
const raycaster = new Raycaster();

type DrillTargetsProps = {
  isLocked: boolean;
};

export function DrillTargets({ isLocked }: DrillTargetsProps) {
  const mode = useTrainingStore((state) => state.mode);
  const phase = useTrainingStore((state) => state.phase);
  const spawnIndex = useTrainingStore((state) => state.spawnIndex);

  if (phase !== "running") {
    return null;
  }

  if (mode === "flicking") {
    const slot = flickSlot(spawnIndex);
    return (
      <group position={[slot.x, 0, slot.z]}>
        <DummyOperator targetId={FLICK_TARGET_ID} isLive />
      </group>
    );
  }

  return <TrackingTarget isLocked={isLocked} />;
}

function TrackingTarget({ isLocked }: { isLocked: boolean }) {
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const fireHeldRef = useRef(false);
  const roundSerial = useTrainingStore((state) => state.roundSerial);
  const origin = trackingPose(0);

  useEffect(() => {
    elapsedRef.current = 0;
    const group = groupRef.current;
    if (group) {
      group.position.x = origin.x;
      group.position.z = origin.z;
    }
  }, [roundSerial, origin.x, origin.z]);

  useEffect(() => {
    const syncFireHeld = (event: PointerEvent): void => {
      if (event.type !== "pointermove" && event.button !== 0) {
        return;
      }
      fireHeldRef.current = (event.buttons & 1) === 1;
    };
    const releaseFireHeld = (): void => {
      if (document.pointerLockElement === null) {
        fireHeldRef.current = false;
      }
    };
    window.addEventListener("pointerdown", syncFireHeld);
    window.addEventListener("pointerup", syncFireHeld);
    window.addEventListener("pointermove", syncFireHeld);
    document.addEventListener("pointerlockchange", releaseFireHeld);
    return () => {
      fireHeldRef.current = false;
      window.removeEventListener("pointerdown", syncFireHeld);
      window.removeEventListener("pointerup", syncFireHeld);
      window.removeEventListener("pointermove", syncFireHeld);
      document.removeEventListener("pointerlockchange", releaseFireHeld);
    };
  }, []);

  useFrame((state, delta) => {
    const snap = useTrainingStore.getState();
    const group = groupRef.current;
    if (
      group === null ||
      !isLocked ||
      snap.mode !== "tracking" ||
      snap.phase !== "running"
    ) {
      return;
    }

    const deltaMs = delta * 1000;
    elapsedRef.current = Math.min(ROUND_DURATION_MS, elapsedRef.current + deltaMs);
    const pose = trackingPose(elapsedRef.current);
    group.position.x = pose.x;
    group.position.z = pose.z;
    group.updateMatrixWorld();
    raycaster.setFromCamera(CENTER_NDC, state.camera);
    const hits = raycaster.intersectObject(group, true);
    addTrackingSample(
      deltaMs,
      isTrackingCredit(hits.length > 0, fireHeldRef.current),
    );
  });

  return (
    <group ref={groupRef} position={[origin.x, 0, origin.z]}>
      <DummyOperator targetId={TRACK_TARGET_ID} isLive />
    </group>
  );
}
