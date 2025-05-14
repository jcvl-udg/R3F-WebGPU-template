// components/terrain/useNoise.js
import { useMemo } from 'react'
import { makeNoise2D } from 'open-simplex-noise'

export const useNoise = (seed = 1234) => {
  return useMemo(() => {
    const noise2D = makeNoise2D(seed)
    
    const fractal2D = (x, y, octaves = 4) => {
      let value = 0
      let amplitude = 1
      let frequency = 1
      let maxValue = 0
      
      for (let i = 0; i < octaves; i++) {
        value += noise2D(x * frequency, y * frequency) * amplitude
        maxValue += amplitude
        amplitude *= 0.5
        frequency *= 2
      }
      return value / maxValue
    }

    return { get2D: noise2D, fractal2D }
  }, [seed])
}