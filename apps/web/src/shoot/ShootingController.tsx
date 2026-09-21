import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Object3D, Raycaster, Vector2 } from "three";
import { resolveShot } from "./resolveShot";
import { useTrainingStore } from "./useTrainingStore";

const CENTER_NDC = new Vector2(0, 0);
const raycaster = new Raycaster();

function collectLiveTargets(root: Object3D, remaining: ReadonlySet<string>): Object3D[] {
  const targets: Object3D[] = [];
  root.traverse((object) => {
    const targetId = object.userData.targetId;
    if (typeof targetId === "string" && remaining.has(targetId)) {
      targets.push(object);
    }
  });
  return targets;
}

type ShootingControllerProps = {
  isLocked: boolean;
};

export function ShootingController({ isLocked }: ShootingControllerProps) {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const onPointerDown = (event: PointerEvent): void => {
      if (event.button !== 0 || document.pointerLockElement === null) {
        return;
      }

      const remaining = new Set(useTrainingStore.getState().remainingTargetIds);
      const liveTargets = collectLiveTargets(scene, remaining);
      raycaster.setFromCamera(CENTER_NDC, camera);
      const hits = raycaster.intersectObjects(liveTargets, false);
      const candidates = hits.map((hit) => ({
        targetId:
          typeof hit.object.userData.targetId === "string"
            ? hit.object.userData.targetId
            : "",
        distance: hit.distance,
      }));
      useTrainingStore.getState().fire(resolveShot(candidates));
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [camera, isLocked, scene]);

  return null;
}
