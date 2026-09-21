import { STATIC_TARGETS, TARGET_USER_DATA } from "../shoot/staticTargets";
import { useTrainingStore } from "../shoot/useTrainingStore";

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
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.45, 1.8, 0.45]} />
        <meshBasicMaterial color="#8aa56a" />
      </mesh>
      <mesh
        position={[0, 1.95, 0]}
        visible={isLive}
        userData={TARGET_USER_DATA[id]}
      >
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color="#deff9a" />
      </mesh>
    </group>
  );
}

export function TrainingRange() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshBasicMaterial color="#1c241c" />
      </mesh>
      <gridHelper args={[24, 24, "#5a7a48", "#2a3828"]} position={[0, 0.01, 0]} />
      <mesh position={[0, 4, -12]}>
        <planeGeometry args={[24, 8]} />
        <meshBasicMaterial color="#2a3328" />
      </mesh>
      <mesh position={[0, 4, 12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[24, 8]} />
        <meshBasicMaterial color="#121612" />
      </mesh>
      <mesh position={[-12, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[24, 8]} />
        <meshBasicMaterial color="#141914" />
      </mesh>
      <mesh position={[12, 4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[24, 8]} />
        <meshBasicMaterial color="#141914" />
      </mesh>
      {STATIC_TARGETS.map((target) => (
        <StaticTarget key={target.id} id={target.id} position={target.position} />
      ))}
    </group>
  );
}
