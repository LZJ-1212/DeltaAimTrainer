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
      <mesh position={[0, 0.9, -8]}>
        <boxGeometry args={[0.45, 1.8, 0.45]} />
        <meshBasicMaterial color="#8aa56a" />
      </mesh>
      <mesh position={[0, 1.95, -8]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color="#deff9a" />
      </mesh>
    </group>
  );
}
