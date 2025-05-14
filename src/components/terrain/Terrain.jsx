// components/terrain/Terrain.jsx
import { useTerrainMaterial } from './useTerrainMaterial'
import { Plane } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export const Terrain = () => {
  const { material } = useTerrainMaterial()
  
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <Plane
        args={[100, 100, 128, 128]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        {material}
      </Plane>
    </RigidBody>
  )
}