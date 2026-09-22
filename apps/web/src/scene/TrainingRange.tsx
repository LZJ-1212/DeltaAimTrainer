import { STATIC_TARGETS } from "../shoot/staticTargets";
import { useTrainingStore } from "../shoot/useTrainingStore";
import { DummyOperator } from "./DummyOperator";
import { RANGE_PALETTE } from "./rangePalette";

function StaticTarget({
  id,
  position,
}: {
  id: (typeof STATIC_TARGETS)[number]["id"];
  position: readonly [number, number, number];
}) {
  const isLive = useTrainingStore((state) =>
    state.remainingTargetIds.includes(id),
  );

  return (
    <group position={[position[0], 0, position[2]]}>
      <DummyOperator targetId={id} isLive={isLive} />
    </group>
  );
}

export function TrainingRange() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshBasicMaterial color={RANGE_PALETTE.floor} />
      </mesh>
      <gridHelper
        args={[24, 24, RANGE_PALETTE.gridMajor, RANGE_PALETTE.gridMinor]}
        position={[0, 0.01, 0]}
      />
      <mesh position={[0, 4, -12.2]}>
        <boxGeometry args={[24.8, 8, 0.4]} />
        <meshBasicMaterial color={RANGE_PALETTE.wallFront} />
      </mesh>
      <mesh position={[0, 4, 12.2]}>
        <boxGeometry args={[24.8, 8, 0.4]} />
        <meshBasicMaterial color={RANGE_PALETTE.wallRear} />
      </mesh>
      <mesh position={[-12.2, 4, 0]}>
        <boxGeometry args={[0.4, 8, 24.8]} />
        <meshBasicMaterial color={RANGE_PALETTE.wallSide} />
      </mesh>
      <mesh position={[12.2, 4, 0]}>
        <boxGeometry args={[0.4, 8, 24.8]} />
        <meshBasicMaterial color={RANGE_PALETTE.wallSide} />
      </mesh>
      {STATIC_TARGETS.map((target) => (
        <StaticTarget key={target.id} id={target.id} position={target.position} />
      ))}
      <group position={[0, 1.6, 11.92]}>
        <mesh>
          <boxGeometry args={[0.12, 2.4, 0.04]} />
          <meshBasicMaterial color={RANGE_PALETTE.calibrate} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.9, 0.12, 0.04]} />
          <meshBasicMaterial color={RANGE_PALETTE.calibrate} />
        </mesh>
      </group>
    </group>
  );
}
