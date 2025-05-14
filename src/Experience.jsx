import { LightEnvironment } from "./LightEnvironment";
import { Mesh } from "./mesh/Mesh";

// Experience.tsx
import { Physics } from '@react-three/rapier'
import { TerrainComponent as Terrain } from './components/terrain/Mapz'
import { Character } from './components/character/Character'

export const Experience = () => {
  return (
  <>
    <Physics debug >
      <Mesh />
      <Terrain />
      <Character />
      <LightEnvironment  />
    </Physics>
  </>
  );
};
