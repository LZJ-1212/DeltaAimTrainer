import { RANGE_PALETTE } from "./rangePalette";

type DummyOperatorProps = {
  targetId: string;
  isLive: boolean;
};

function HitMesh({
  targetId,
  position,
  args,
  color,
  rotation,
}: {
  targetId: string;
  position: readonly [number, number, number];
  args: readonly [number, number, number];
  color: string;
  rotation?: readonly [number, number, number];
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      userData={{ targetId }}
    >
      <boxGeometry args={args} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export function DummyOperator({ targetId, isLive }: DummyOperatorProps) {
  return (
    <group visible={isLive}>
      <HitMesh
        targetId={targetId}
        position={[-0.1, 0.28, 0]}
        args={[0.14, 0.56, 0.16]}
        color={RANGE_PALETTE.pants}
      />
      <HitMesh
        targetId={targetId}
        position={[0.1, 0.28, 0]}
        args={[0.14, 0.56, 0.16]}
        color={RANGE_PALETTE.pants}
      />
      <HitMesh
        targetId={targetId}
        position={[0, 0.62, 0]}
        args={[0.34, 0.16, 0.2]}
        color={RANGE_PALETTE.pants}
      />
      <HitMesh
        targetId={targetId}
        position={[0, 0.98, 0.01]}
        args={[0.38, 0.5, 0.22]}
        color={RANGE_PALETTE.shirt}
      />
      <HitMesh
        targetId={targetId}
        position={[0, 0.96, 0.04]}
        args={[0.4, 0.28, 0.16]}
        color={RANGE_PALETTE.vest}
      />
      <HitMesh
        targetId={targetId}
        position={[-0.27, 0.94, 0]}
        args={[0.1, 0.5, 0.1]}
        color={RANGE_PALETTE.shirt}
        rotation={[0, 0, 0.12]}
      />
      <HitMesh
        targetId={targetId}
        position={[0.27, 0.94, 0]}
        args={[0.1, 0.5, 0.1]}
        color={RANGE_PALETTE.shirt}
        rotation={[0, 0, -0.12]}
      />
      <HitMesh
        targetId={targetId}
        position={[0, 1.28, 0.01]}
        args={[0.1, 0.1, 0.1]}
        color={RANGE_PALETTE.skin}
      />
      <HitMesh
        targetId={targetId}
        position={[0, 1.46, 0.03]}
        args={[0.18, 0.22, 0.2]}
        color={RANGE_PALETTE.skin}
      />
      <HitMesh
        targetId={targetId}
        position={[0, 1.56, 0.03]}
        args={[0.22, 0.1, 0.24]}
        color={RANGE_PALETTE.helmet}
      />
    </group>
  );
}
