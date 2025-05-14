// components/character/Character.tsx
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export const Character = () => {
  const { nodes, materials , scene} = useGLTF('public/models/character.glb')
  
  return (
    <RigidBody colliders="cuboid" mass={1}>
      <group scale={0.005} position={[0, 5, 0]}>
        <primitive object={scene} />
      </group>
    </RigidBody>
  )
}