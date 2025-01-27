import { useMaterial } from './useMaterial';

export const Mesh = () => {
  const { colorNode, key } = useMaterial();
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial key={key} colorNode={colorNode} transparent />
    </mesh>
  )
}
