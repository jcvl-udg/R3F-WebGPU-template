import { useFrame } from "@react-three/fiber";
import {
  uniform,
  float,
  vec4,
} from "three/tsl";

export const useMaterial = () => {
  const uTime = uniform(float(0.0));

  const finalColor = vec4(1.0, 1.0, 1.0, 1.0);

  useFrame((state, delta) => {
    uTime.value -= delta * 0.2;
  });

  return {
    key: uTime.id,
    colorNode: finalColor,
  };
};
