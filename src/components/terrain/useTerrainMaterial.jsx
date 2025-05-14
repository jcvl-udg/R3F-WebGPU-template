// components/terrain/useTerrainMaterial.js
import { useMemo } from 'react'
import * as THREE from 'three'

export const useTerrainMaterial = (heights) => {
  return useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      wireframe: false,
      onBeforeCompile: (shader) => {
        // Add custom shader modifications here if needed
        shader.uniforms.time = { value: 0 }
        shader.vertexShader = `
          uniform float time;
          varying vec3 vPosition;
          ${shader.vertexShader}
        `.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
           vPosition = position;
           transformed.y += sin(time + position.x * 0.1) * 0.1;`
        )
      }
    })
    
    return material
  }, [heights])
}